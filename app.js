// Edugates-ClipSAT Science Labs - Main Application Controller
// Responsive across Smartboards, PCs, Laptops, Tablets, and Mobiles

import { chemistryCurriculum } from "./data/chemistry-curriculum.js";
import { biologyCurriculum } from "./data/biology-curriculum.js";
import { physicsCurriculum } from "./data/physics-curriculum.js";
import { icons } from "./assets/icons.js";
import { openModuleModal } from "./components/module-viewer.js";
import { openProgressModal, ProgressStore } from "./components/progress-tracker.js";
import { renderMathInElement, renderLatex } from "./utils/math-renderer.js";
import { getLessonInteractiveSpec } from "./data/lesson-interactive-specs.js";
import { SoundFX } from "./utils/audio-synth.js";
import { showToast, copyShareLink } from "./utils/toast.js";

// Initialize Theme (Respect user preference or fallback to system color scheme)
const userSavedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("edugates_theme") : null;
const systemPrefersLight = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
const savedTheme = userSavedTheme || (systemPrefersLight ? "day" : "night");
if (typeof document !== "undefined" && document.documentElement) {
  document.documentElement.setAttribute("data-theme", savedTheme);
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
  quizFilter: null
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
    badge: "30 Labs",
    tagline: "30 Interactive STEM Workbenches",
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
    setupDeviceDetection();
    renderAppShell();
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
      const label = slider.closest(".control-group")?.querySelector(".control-label") || slider.parentElement?.querySelector("label");
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

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApp, { once: true });
  } else {
    bootApp();
  }
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
          <div class="brand-tagline">Virtual Labs &amp; STEM Curriculum • Chemistry • Biology • Physics</div>
        </div>
      </a>

      <!-- Semantic Main Navigation Landmark -->
      <nav class="app-nav-container" aria-label="Main Navigation">
        <!-- Navigation Subject Dropdown Menu -->
        <div class="nav-dropdown-wrapper" id="nav-dropdown-wrapper">
          <button class="nav-dropdown-trigger ${curSub.themeClass}" id="nav-dropdown-trigger" 
                  aria-haspopup="true" aria-expanded="false" 
                  aria-label="Select Subject or Area (Current: ${curSub.name})"
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

        <!-- Right Controls & Device Mode -->
        <div class="nav-right-controls">
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

          <button class="btn btn-secondary" id="btn-open-progress" title="Student STEM Mastery Telemetry" aria-label="Student STEM Mastery telemetry and progress" style="padding: 6px 12px; font-size: 0.85rem; gap: 6px;">
            ${icons.trophy}
            <span>Mastery</span>
          </button>

          <!-- Offline Readiness & Storage Diagnostics Button -->
          <button class="btn btn-secondary" id="btn-open-offline-diag" title="Offline Readiness, Cache Diagnostics &amp; Storage Quota (Hot-key: O)" aria-label="Offline diagnostics and storage quota" style="padding: 6px 12px; font-size: 0.85rem; gap: 6px;">
            <span>📡</span>
            <span>Offline</span>
          </button>

          <!-- Focus Presentation Mode Toggle Button -->
          <button class="btn btn-secondary" id="btn-toggle-focus-mode" title="Focus Presentation Mode (Hide Navigation Chrome, Shift+F)" aria-label="Toggle Focus Presentation Mode" style="padding: 6px 12px; font-size: 0.85rem; gap: 6px;">
            <span>🎯</span>
            <span>Focus</span>
          </button>

          <div class="device-mode-toggle" role="group" aria-label="Screen Optimization &amp; Hardware Profile" title="Screen Optimization &amp; Hardware Profile">
            <button class="device-btn ${AppState.deviceMode === 'auto' ? 'active' : ''}" data-mode="auto" aria-label="Auto hardware profile" aria-pressed="${AppState.deviceMode === 'auto'}">Auto</button>
            <button class="device-btn ${AppState.deviceMode === 'smartboard' ? 'active' : ''}" data-mode="smartboard" aria-label="MAXHUB &amp; Smartboard 60 FPS Turbo Profile" aria-pressed="${AppState.deviceMode === 'smartboard'}" title="MAXHUB &amp; Smartboard 60 FPS Turbo Profile (Zero-Blur, Opaque, Hardware Accelerated)">⚡ MAXHUB Turbo</button>
            <button class="device-btn ${AppState.deviceMode === 'tablet' ? 'active' : ''}" data-mode="tablet" aria-label="Tablet Profile" aria-pressed="${AppState.deviceMode === 'tablet'}" title="Tablet Mode">Tablet</button>
            <button class="device-btn ${AppState.deviceMode === 'mobile' ? 'active' : ''}" data-mode="mobile" aria-label="Mobile Profile" aria-pressed="${AppState.deviceMode === 'mobile'}" title="Mobile Mode">Mobile</button>
          </div>
        </div>
      </nav>
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
  localStorage.setItem("edugates_theme", theme);
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

  // Focus Presentation Mode Toggle & Exit
  const toggleFocusMode = () => {
    document.body.classList.toggle("focus-mode");
    try { SoundFX.playPop(); } catch (e) {}
  };
  document.getElementById("btn-toggle-focus-mode")?.addEventListener("click", toggleFocusMode);
  document.getElementById("btn-exit-focus-mode")?.addEventListener("click", toggleFocusMode);

  // Shift+F Keyboard Shortcut for Focus Mode
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key.toLowerCase() === "f" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      toggleFocusMode();
    } else if (e.key === "Escape" && document.body.classList.contains("focus-mode")) {
      document.body.classList.remove("focus-mode");
    }
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

  // Programmatic Focus Management for Screen Readers & Assistive Tech
  const mainView = document.getElementById("main-content-view");
  if (mainView) {
    mainView.focus({ preventScroll: true });
    enhanceA11y(mainView);
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
    import("./components/quiz-engine.js?v=3.1").then(m => {
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

export function normalizeLabId(rawId) {
  if (!rawId) return "projectile";
  const str = String(rawId).toLowerCase().trim().replace(/^lab[-_]?/, "");
  if (str === "beerlambert" || str.includes("beer") || str.includes("lambert") || str.includes("spectro")) return "beerlambert";
  if (str === "decay" || str.includes("decay") || str.includes("nuclear") || str.includes("radioact")) return "decay";
  if (str === "colligative" || str.includes("collig") || str.includes("freez") || str.includes("boil")) return "colligative";
  if (str === "organic" || str.includes("organ") || str.includes("sn1") || str.includes("sn2")) return "organic";
  if (str === "electrophoresis" || str.includes("electrophor") || str.includes("gel") || str.includes("agarose")) return "electrophoresis";
  if (str === "ecology" || str.includes("ecol") || str.includes("populat") || str.includes("lotka") || str.includes("predat")) return "ecology";
  if (str === "actionpotential" || str.includes("action") || str.includes("potent") || str.includes("neuron") || str.includes("patch")) return "actionpotential";
  if (str === "rotational" || str.includes("rotat") || str.includes("torque") || str.includes("inertia")) return "rotational";
  if (str === "conduction" || str.includes("conduct") || str.includes("fourier") || str.includes("heat")) return "conduction";
  if (str === "fluids" || str.includes("fluid") || str.includes("buoy") || str.includes("archimed") || str.includes("bernoulli")) return "fluids";
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
  return "projectile";
}

function formatLabName(labKey) {
  const norm = normalizeLabId(labKey);
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
    "fluids": "Fluid Dynamics, Buoyancy & Bernoulli"
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

  const stats = ProgressStore.getStats();
  const showPresenterTip = localStorage.getItem("sb_hide_presenter_tip") !== "true";

  // Determine Continue Learning module
  let lastMod = null;
  let isResuming = false;
  if (stats.modulesExplored && stats.modulesExplored.length > 0) {
    const lastCode = stats.modulesExplored[stats.modulesExplored.length - 1];
    const found = findModuleByCode(lastCode);
    if (found) {
      lastMod = found.mod;
      isResuming = true;
    }
  }
  if (!lastMod && curData.modules && curData.modules.length > 0) {
    lastMod = curData.modules[0];
  }

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

    ${showPresenterTip ? `
      <!-- Classroom Presenter Tip Banner -->
      <div class="presenter-tip-banner" id="classroom-presenter-tip">
        <div class="presenter-tip-content">
          <span>💡</span>
          <span><strong>Classroom Presenter Tip:</strong> Press <kbd style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono, monospace);">Shift + F</kbd> anytime for distraction-free Focus Mode on smartboards and projectors.</span>
        </div>
        <button class="presenter-tip-dismiss" id="btn-dismiss-presenter-tip" aria-label="Dismiss presenter tip">✕</button>
      </div>
    ` : ''}

    ${lastMod ? `
      <!-- Continue Learning Progress Strip -->
      <div class="continue-learning-strip">
        <div class="continue-learning-left">
          <div class="continue-learning-pulse-dot"></div>
          <div class="continue-learning-text">
            <span class="continue-learning-label">${isResuming ? 'Continue Where You Left Off' : 'Recommended Starting Chapter'}</span>
            <span class="continue-learning-target">${lastMod.code}: ${lastMod.title}</span>
          </div>
        </div>
        <div class="continue-learning-actions">
          <div class="continue-learning-meta">
            ${stats.modulesExplored.length === 0 && stats.labsLaunched.length === 0 ? `
              <span class="empty-journey-guide">✨ Welcome! Select Chapter 1 below or click Start Chapter to begin</span>
            ` : `
              <span>${stats.modulesExplored.length} chapter${stats.modulesExplored.length === 1 ? '' : 's'} explored • ${stats.labsLaunched.length} lab${stats.labsLaunched.length === 1 ? '' : 's'} launched</span>
            `}
          </div>
          <a href="#module/${lastMod.code}" class="btn-continue-resume" aria-label="${isResuming ? 'Resume' : 'Start'} Chapter ${lastMod.code}">
            <span>${isResuming ? 'Resume Chapter' : 'Start Chapter'}</span>
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
    ${!isLessonsView ? `
      <!-- Chapters / Modules Grid with Textbook Opener Banners & Lesson Miniatures -->
      <div class="modules-grid" id="modules-cards-container">
        ${filtered.map((m, mIdx) => {
          const imgPath = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
          const fallbackSvg = getSubjectPlaceholderSvg(curData.code);
          const isTopPriority = mIdx < 4;
          return `
            <div class="module-card" data-mid="${m.id}" style="--card-accent: ${themeColor};">
              <!-- Textbook Chapter Opener Photo Banner with Skeleton & Robust Fallback -->
              <div class="module-card-banner is-loading">
                <div class="module-banner-skeleton" aria-hidden="true"></div>
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="${m.title}" class="module-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'low'}"
                  onload="this.classList.add('loaded'); this.parentElement.classList.remove('is-loading');"
                  onerror="if (!this.dataset.errored) { this.dataset.errored = '1'; this.src = '${fallbackSvg}'; this.alt = 'Chapter image unavailable'; } else { this.style.display='none'; } this.parentElement.classList.remove('is-loading'); this.parentElement.classList.add('has-fallback-pattern');">
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
          const isTopPriority = idx < 4;
          return `
            <div class="lesson-card-full" data-mid="${m.id}" data-lid="${l.id}" style="--card-accent: ${themeColor};">
              <div class="lesson-card-banner is-loading">
                <div class="module-banner-skeleton" aria-hidden="true"></div>
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="${l.title}" class="lesson-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'low'}"
                  onload="this.classList.add('loaded'); this.parentElement.classList.remove('is-loading');"
                  onerror="if (!this.dataset.errored) { this.dataset.errored = '1'; this.src = '${fallbackSvg}'; this.alt = 'Lesson image unavailable'; } else { this.style.display='none'; } this.parentElement.classList.remove('is-loading'); this.parentElement.classList.add('has-fallback-pattern');">
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
    `}
  `;

  // Bind Classroom Presenter Tip Dismiss
  const btnDismissTip = document.getElementById("btn-dismiss-presenter-tip");
  if (btnDismissTip) {
    btnDismissTip.addEventListener("click", () => {
      localStorage.setItem("sb_hide_presenter_tip", "true");
      document.getElementById("classroom-presenter-tip")?.remove();
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

  // Immediate check for already loaded / browser-cached chapter banner images
  container.querySelectorAll(".module-banner-img, .lesson-banner-img").forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("loaded");
      img.parentElement?.classList.remove("is-loading");
    }
  });

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

  // Background idle pre-fetch for remaining chapters (chapters 5+) so fast scrolling never encounters blank images
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 120));
  if (curData && Array.isArray(curData.modules) && curData.modules.length > 4) {
    const remaining = curData.modules.slice(4);
    remaining.forEach((m, idx) => {
      scheduleIdle(() => {
        const preImg = new Image();
        preImg.src = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
      }, { timeout: 1500 + idx * 180 });
    });
  }

  renderMathInElement(container);
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

        <!-- 30 Lab Selector Tabs -->
        <div class="lab-nav-pills-container">
          <a href="#labs/projectile" class="btn ${AppState.activeLabId === 'projectile' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="projectile" aria-label="Kinematics and Projectiles Virtual Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.projectile}</span>
            <span class="lab-btn-title">Kinematics &amp; Projectiles</span>
          </a>
          <a href="#labs/titration" class="btn ${AppState.activeLabId === 'titration' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="titration" aria-label="Acid-Base Titration Virtual Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.titration}</span>
            <span class="lab-btn-title">Acid-Base Titration</span>
          </a>
          <a href="#labs/microscope" class="btn ${AppState.activeLabId === 'microscope' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="microscope" aria-label="Ultra-HD Microscope Virtual Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.microscope}</span>
            <span class="lab-btn-title">Ultra-HD Microscope</span>
          </a>
          <a href="#labs/ptable" class="btn ${AppState.activeLabId === 'ptable' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="ptable" aria-label="Interactive Periodic Table Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.periodicTable}</span>
            <span class="lab-btn-title">Interactive Periodic Table</span>
          </a>
          <a href="#labs/circuits" class="btn ${AppState.activeLabId === 'circuits' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="circuits" aria-label="DC Circuits and Ohm's Law Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.circuit}</span>
            <span class="lab-btn-title">DC Circuits &amp; Ohm's Law</span>
          </a>
          <a href="#labs/gaslaws" class="btn ${AppState.activeLabId === 'gaslaws' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="gaslaws" aria-label="Gas Laws and Kinetic Theory Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.gasLaws}</span>
            <span class="lab-btn-title">Gas Laws &amp; Kinetic Theory</span>
          </a>
          <a href="#labs/dnaprotein" class="btn ${AppState.activeLabId === 'dnaprotein' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="dnaprotein" aria-label="DNA and Protein Synthesis Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.dna}</span>
            <span class="lab-btn-title">DNA &amp; Protein Synthesis</span>
          </a>
          <a href="#labs/punnett" class="btn ${AppState.activeLabId === 'punnett' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="punnett" aria-label="Punnett Genetics Cross Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.punnett}</span>
            <span class="lab-btn-title">Punnett Genetics Cross</span>
          </a>
          <a href="#labs/optics" class="btn ${AppState.activeLabId === 'optics' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="optics" aria-label="Geometric Optics Ray Tracing Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.optics}</span>
            <span class="lab-btn-title">Geometric Optics Ray Tracing</span>
          </a>
          <a href="#labs/vsepr" class="btn ${AppState.activeLabId === 'vsepr' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="vsepr" aria-label="VSEPR 3D Modeler Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.vsepr}</span>
            <span class="lab-btn-title">VSEPR 3D Modeler</span>
          </a>
          <a href="#labs/waves" class="btn ${AppState.activeLabId === 'waves' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="waves" aria-label="Wave Interference and Slits Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.waveInterference}</span>
            <span class="lab-btn-title">Wave Interference &amp; Slits</span>
          </a>
          <a href="#labs/photosynthesis" class="btn ${AppState.activeLabId === 'photosynthesis' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="photosynthesis" aria-label="Photosynthesis and Bioenergetics Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.photosynthesis}</span>
            <span class="lab-btn-title">Photosynthesis &amp; Bioenergetics</span>
          </a>
          <a href="#labs/calorimetry" class="btn ${AppState.activeLabId === 'calorimetry' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="calorimetry" aria-label="Calorimetry and Thermochemistry Virtual Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.calorimetry}</span>
            <span class="lab-btn-title">Calorimetry &amp; &Delta;H</span>
          </a>
          <a href="#labs/equilibrium" class="btn ${AppState.activeLabId === 'equilibrium' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="equilibrium" aria-label="Chemical Equilibrium and Le Chatelier Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.equilibrium}</span>
            <span class="lab-btn-title">Equilibrium &amp; Le Chatelier</span>
          </a>
          <a href="#labs/electrochem" class="btn ${AppState.activeLabId === 'electrochem' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="electrochem" aria-label="Electrochemistry and Voltaic Cells Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.electrochem}</span>
            <span class="lab-btn-title">Electrochemistry &amp; Voltaic</span>
          </a>
          <a href="#labs/harmonic" class="btn ${AppState.activeLabId === 'harmonic' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="harmonic" aria-label="Harmonic Motion and Hooke's Law Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.harmonic}</span>
            <span class="lab-btn-title">Harmonic Motion &amp; Hooke</span>
          </a>
          <a href="#labs/photoelectric" class="btn ${AppState.activeLabId === 'photoelectric' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="photoelectric" aria-label="Photoelectric Effect and Quantum Physics Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.photoelectric}</span>
            <span class="lab-btn-title">Photoelectric Effect</span>
          </a>
          <a href="#labs/magnetism" class="btn ${AppState.activeLabId === 'magnetism' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="magnetism" aria-label="Magnetic Force and Lorentz e/m Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.magnetism}</span>
            <span class="lab-btn-title">Magnetic Force &amp; e/m</span>
          </a>
          <a href="#labs/enzymes" class="btn ${AppState.activeLabId === 'enzymes' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="enzymes" aria-label="Enzyme Kinetics and Catalysis Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.enzymes}</span>
            <span class="lab-btn-title">Enzyme Kinetics</span>
          </a>
          <a href="#labs/respiration" class="btn ${AppState.activeLabId === 'respiration' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="respiration" aria-label="Cellular Respiration and Respirometer Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.respiration}</span>
            <span class="lab-btn-title">Cellular Respiration</span>
          </a>
          <a href="#labs/beerlambert" class="btn ${AppState.activeLabId === 'beerlambert' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="beerlambert" aria-label="Spectrophotometry and Beer-Lambert Law Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.beerLambert}</span>
            <span class="lab-btn-title">Beer-Lambert Law</span>
          </a>
          <a href="#labs/decay" class="btn ${AppState.activeLabId === 'decay' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="decay" aria-label="Radioactive Decay and Nuclear Kinetics Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.nuclearDecay}</span>
            <span class="lab-btn-title">Nuclear Decay &amp; Kinetics</span>
          </a>
          <a href="#labs/colligative" class="btn ${AppState.activeLabId === 'colligative' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="colligative" aria-label="Colligative Properties and Freezing Point Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.colligative}</span>
            <span class="lab-btn-title">Colligative Properties</span>
          </a>
          <a href="#labs/organic" class="btn ${AppState.activeLabId === 'organic' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="organic" aria-label="Organic Reaction Mechanisms Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.organicReactions}</span>
            <span class="lab-btn-title">Organic Mechanisms</span>
          </a>
          <a href="#labs/electrophoresis" class="btn ${AppState.activeLabId === 'electrophoresis' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="electrophoresis" aria-label="Agarose Gel Electrophoresis Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.gelElectrophoresis}</span>
            <span class="lab-btn-title">Gel Electrophoresis</span>
          </a>
          <a href="#labs/ecology" class="btn ${AppState.activeLabId === 'ecology' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="ecology" aria-label="Population Ecology and Lotka-Volterra Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.populationEcology}</span>
            <span class="lab-btn-title">Population Ecology</span>
          </a>
          <a href="#labs/actionpotential" class="btn ${AppState.activeLabId === 'actionpotential' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="actionpotential" aria-label="Neurobiology and Action Potential Patch Clamp Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.actionPotential}</span>
            <span class="lab-btn-title">Action Potential Patch Clamp</span>
          </a>
          <a href="#labs/rotational" class="btn ${AppState.activeLabId === 'rotational' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="rotational" aria-label="Rotational Dynamics and Moment of Inertia Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.rotationalDynamics}</span>
            <span class="lab-btn-title">Rotational Dynamics</span>
          </a>
          <a href="#labs/conduction" class="btn ${AppState.activeLabId === 'conduction' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="conduction" aria-label="Thermal Conduction and Fourier Law Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.thermalConduction}</span>
            <span class="lab-btn-title">Thermal Conduction</span>
          </a>
          <a href="#labs/fluids" class="btn ${AppState.activeLabId === 'fluids' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="fluids" aria-label="Fluid Dynamics and Buoyancy Lab" style="text-decoration: none;">
            <span class="lab-btn-icon-wrapper">${icons.fluidsBuoyancy}</span>
            <span class="lab-btn-title">Fluid Dynamics &amp; Buoyancy</span>
          </a>
        </div>
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

  // Bind Lab Selector Buttons
  document.querySelectorAll(".lab-nav-btn").forEach(btn => {
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
    "lab-fluids": () => import("./labs/phys-fluids-buoyancy.js").then(m => m.initFluidsBuoyancyLab("active-lab-mount"))
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
