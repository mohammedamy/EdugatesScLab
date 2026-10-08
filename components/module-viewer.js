// Edugates-ClipSAT Science Labs - Interactive Module Deep-Dive Viewer
// Detailed lesson reader, formulas, CER inquiry, and bespoke lesson-specific virtual lab launcher

import { ProgressStore } from "./progress-tracker.js";
import { renderLatex, renderMathInElement } from "../utils/math-renderer.js";
import { getLessonInteractiveSpec } from "../data/lesson-interactive-specs.js";
import { getLessonComprehensiveTheory } from "../data/lesson-theory-database.js";
import { SoundFX } from "../utils/audio-synth.js";
import { copyShareLink } from "../utils/toast.js";
import { renderWorkedExampleHTML, initWorkedExampleListeners } from "./worked-example-solver.js";

// Dynamic on-demand loader for heavy lesson-interactives (60 FPS canvas & physics engines)
let _interactivesEnginePromise = null;
function getInteractivesEngine() {
  if (!_interactivesEnginePromise) {
    _interactivesEnginePromise = import("./lesson-interactives.js");
  }
  return _interactivesEnginePromise;
}

function mountLessonInteractive(containerId, subjectCode, moduleId, lessonId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="interactive-loading-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 24px; min-height:260px; gap:16px;">
        <div class="spinner-ring" style="width:40px; height:40px; border:3px solid rgba(56,189,248,0.2); border-top-color:#38bdf8; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
        <div style="font-size:0.95rem; font-weight:700; color:var(--text-main, #f8fafc);">Loading Interactive Laboratory Simulation...</div>
        <div style="font-size:0.8rem; color:var(--text-muted, #94a3b8);">Preparing 60 FPS physics engine &amp; interactive controls</div>
      </div>
    `;
  }
  getInteractivesEngine().then(mod => {
    mod.mountLessonInteractive(containerId, subjectCode, moduleId, lessonId);
  }).catch(err => {
    console.error("Simulation load error:", err);
    if (container) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #ef4444;">
          <p>⚠️ Simulation currently unavailable. Please reload.</p>
        </div>
      `;
    }
  });
}

function cleanupLessonInteractive(containerId) {
  if (_interactivesEnginePromise) {
    _interactivesEnginePromise.then(mod => {
      mod.cleanupLessonInteractive(containerId);
    }).catch(() => {});
  }
}

export function openModuleModal(moduleData, subjectColor, initialLessonId, triggerElement) {
  window._isOpeningModuleModal = true;
  if (typeof window.closeActiveModuleModal === "function") {
    try { window.closeActiveModuleModal(); } catch (err) {}
  }
  window._isOpeningModuleModal = false;
  const openerEl = triggerElement || (typeof document !== "undefined" ? document.activeElement : null);
  ProgressStore.recordModuleExplored(moduleData.code);
  ProgressStore.recordModuleOpened(moduleData.code);

  // Enable Touch Zoom HUD while inside lesson interactive / full-screen module
  if (typeof window !== "undefined" && window.TouchZoom && typeof window.TouchZoom.setAllowed === "function") {
    window.TouchZoom.setAllowed(true);
  }

  let overlay = document.getElementById("module-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "module-modal-overlay";
    document.body.appendChild(overlay);
  }
  // Universal Edge-to-Edge Full Browser Screen: lessons open 100vw x 100vh, never in a dialogue box
  let isFullscreen = true;
  overlay.className = "modal-overlay modal-fullscreen is-fullscreen-lesson";
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");

  // Keep pen toolbar accessible at high z-index for in-class smartboard annotations
  const penBar = document.getElementById("smartboard-pen-bar");

  // Active state
  const parsedLessonId = initialLessonId ? parseInt(initialLessonId, 10) : undefined;
  let currentLessonId = parsedLessonId || (moduleData.lessons && moduleData.lessons.length > 0 ? moduleData.lessons[0].id : 1);
  let activeTab = parsedLessonId ? "interactive" : "overview"; // 'overview', 'interactive', 'concepts', 'lab'
  let labMode = "module"; // 'module' or 'lesson'
  let currentLabCleanup = null;
  let currentSimZoom = 1.0;

  function syncFullscreenButton() {
    const isDisplayFs = typeof document !== "undefined" && !!(document.fullscreenElement || document.webkitFullscreenElement);
    const icon = document.getElementById("btn-fs-icon");
    const label = document.getElementById("btn-fs-label");
    const btn = document.getElementById("btn-header-fullscreen-modal");
    if (icon) icon.textContent = isDisplayFs ? '🗗' : '⛶';
    if (label) label.textContent = isDisplayFs ? 'Exit Display' : 'Display Fullscreen';
    if (btn) btn.title = isDisplayFs ? 'Exit Hardware Display Fullscreen (Esc)' : 'Expand to Fullscreen Display / Smartboard Kiosk Mode';
  }

  function closeModal(options = {}) {
    if (typeof currentLabCleanup === "function") {
      currentLabCleanup();
      currentLabCleanup = null;
    }
    cleanupLessonInteractive("overview-lesson-sim-container");
    cleanupLessonInteractive("tab-lesson-sim-container");
    cleanupLessonInteractive("lab-lesson-sim-container");
    cleanupLessonInteractive("embedded-module-lab-mount");
    document.removeEventListener("keydown", handleKeydown);
    if (typeof syncFullscreenButton === "function") {
      document.removeEventListener("fullscreenchange", syncFullscreenButton);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenButton);
    }
    // Reset toolbar to pointer mode and clear canvas pointer events on close
    if (window.smartboardToolbar && typeof window.smartboardToolbar.setMode === "function") {
      window.smartboardToolbar.setMode("pointer");
    }
    const canvas = document.getElementById("smartboard-draw-canvas");
    if (canvas) {
      canvas.classList.remove("drawing-active");
    }

    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");

    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      try { document.exitFullscreen(); } catch (err) {}
    }

    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (window.closeActiveModuleModal === closeModal) {
      window.closeActiveModuleModal = null;
    }

    // Sync zoom HUD back to restricted state unless on labs route
    if (typeof window !== "undefined" && window.TouchZoom && typeof window.TouchZoom.setAllowed === "function") {
      const isLabsActive = typeof window.location !== "undefined" && window.location.hash.startsWith("#labs");
      window.TouchZoom.setAllowed(isLabsActive);
    }

    // Return focus to trigger element that opened this chapter
    if (openerEl && typeof openerEl.focus === "function") {
      try { openerEl.focus(); } catch (err) {}
    }

    // Sync hash back to parent subject tab if closing a deep-linked module or lesson (unless transitioning to another route/modal)
    const isTransition = Boolean((options && options.isTransition) || (typeof window !== "undefined" && window._isOpeningModuleModal));
    if (!isTransition && (window.location.hash.startsWith("#module/") || window.location.hash.startsWith("#lesson/"))) {
      const curTab = moduleData.code.startsWith("CHEM") ? "chem" : (moduleData.code.startsWith("BIO") ? "bio" : "phys");
      if (window.location.hash !== "#" + curTab) {
        history.replaceState(null, "", "#" + curTab);
      }
    }
  }

  // Register on window for back-button / external hash navigation dismiss
  window.closeActiveModuleModal = closeModal;

  document.addEventListener("fullscreenchange", syncFullscreenButton);
  document.addEventListener("webkitfullscreenchange", syncFullscreenButton);

  function handleKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      const focusables = overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  document.addEventListener("keydown", handleKeydown);

  // Backdrop click guard (overlay is 100vw x 100vh full screen, fully covered by shell)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  function renderContent() {
    if (typeof currentLabCleanup === "function") {
      currentLabCleanup();
      currentLabCleanup = null;
    }
    const curTabId = moduleData.code.startsWith("CHEM") ? "chem" : (moduleData.code.startsWith("BIO") ? "bio" : "phys");
    const curSubName = moduleData.code.startsWith("CHEM") ? "Chemistry" : (moduleData.code.startsWith("BIO") ? "Biology" : "Physics");

    overlay.innerHTML = `
      <div class="modal-content-shell is-fullscreen" id="lesson-fullscreen-workspace" role="dialog" aria-modal="true" aria-labelledby="modal-chapter-title">
        <a href="#modal-tab-content" class="skip-link modal-skip-link">Skip to lesson content</a>
        <div class="modal-header">
          <div class="modal-header-titles">
            <nav class="modal-breadcrumbs" aria-label="Breadcrumbs">
              <button id="btn-header-back-curriculum" class="btn btn-secondary btn-header-back" title="Back to Curriculum Grid" aria-label="Back to Curriculum Grid">
                <span class="back-arrow">←</span>
                <span class="back-label-long">Back to Curriculum</span>
                <span class="back-label-short">Back</span>
              </button>
              <a href="#${curTabId}" class="breadcrumb-link">${curSubName}</a>
              <span aria-hidden="true" style="opacity: 0.4;">/</span>
              <span style="color: ${subjectColor}; font-weight: 700;">${moduleData.code}</span>
              ${activeTab === 'interactive' ? `<span aria-hidden="true" style="opacity: 0.4;">/</span><span style="color: var(--text-main);">Lesson ${currentLessonId}</span>` : ''}
            </nav>
            <h2 class="modal-title" id="modal-chapter-title">${moduleData.title}</h2>
          </div>
          <div class="modal-header-actions" role="toolbar" aria-label="Chapter Controls">
            <button class="btn btn-secondary btn-header-action btn-header-annotate" id="btn-header-annotate-modal" title="Toggle Smartboard Drawing Pen &amp; Highlighter over simulation" aria-label="Toggle In-Class Annotation">
              <span class="btn-action-icon">✏️</span>
              <span class="btn-action-label">Annotate</span>
            </button>
            <button class="btn btn-secondary btn-header-action btn-header-fullscreen" id="btn-header-fullscreen-modal" title="Toggle Fullscreen Display / Kiosk Mode" aria-label="Toggle Fullscreen Display">
              <span class="btn-action-icon" id="btn-fs-icon">⛶</span>
              <span class="btn-action-label" id="btn-fs-label">Display Fullscreen</span>
            </button>
            <button class="btn btn-secondary btn-header-action btn-header-share" id="btn-header-share-modal" title="Share to Google Classroom, Classera, or Copy Link" aria-label="Share to LMS or copy deep link">
              <span class="btn-action-icon">📤</span>
              <span class="btn-action-label">Share</span>
            </button>
            <button class="btn btn-secondary btn-header-action btn-header-lesson-plan" id="btn-header-lesson-plan" title="Open 2-Page A4 Teacher Lesson Plan &amp; Export PDF" aria-label="Open 2-Page A4 Teacher Lesson Plan">
              <span class="btn-action-icon">📄</span>
              <span class="btn-action-label">A4 Plan</span>
            </button>
            <div class="modal-overflow-wrap">
              <button class="btn btn-secondary btn-header-action btn-header-overflow" id="btn-header-overflow-modal" aria-haspopup="true" aria-expanded="false" aria-controls="modal-header-overflow-menu" aria-label="More chapter options" title="More Options">
                <span class="btn-action-icon">⋮</span>
                <span class="btn-action-label">More</span>
              </button>
              <div class="modal-overflow-menu" id="modal-header-overflow-menu" role="menu" aria-label="Additional Chapter Actions" hidden>
                <button class="overflow-menu-item" id="btn-overflow-annotate" role="menuitem">
                  <span class="btn-action-icon">✏️</span>
                  <span>In-Class Annotation</span>
                </button>
                <button class="overflow-menu-item" id="btn-overflow-fullscreen" role="menuitem">
                  <span class="btn-action-icon">⛶</span>
                  <span>Fullscreen Display</span>
                </button>
                <button class="overflow-menu-item" id="btn-overflow-share" role="menuitem">
                  <span class="btn-action-icon">📤</span>
                  <span>Share Lesson</span>
                </button>
                <button class="overflow-menu-item" id="btn-overflow-lesson-plan" role="menuitem">
                  <span class="btn-action-icon">📄</span>
                  <span>Teacher A4 Plan</span>
                </button>
              </div>
            </div>
            <button class="modal-close-btn" id="btn-close-modal" aria-label="Close lesson and return to curriculum" title="Exit to Curriculum (Esc)">✕</button>
          </div>
        </div>

        <div class="modal-tabs-header">
          <button class="modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            Overview & Lessons
          </button>
          <button class="modal-tab-btn ${activeTab === 'interactive' ? 'active' : ''}" data-tab="interactive" style="position: relative;">
            🔬 Lesson Interactive
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; margin-left: 4px; box-shadow: 0 0 8px #38bdf8;"></span>
          </button>
          <button class="modal-tab-btn ${activeTab === 'concepts' ? 'active' : ''}" data-tab="concepts">
            Key Concepts & Formulas
          </button>
          <button class="modal-tab-btn ${activeTab === 'lab' ? 'active' : ''}" data-tab="lab">
            Virtual Lab Sandbox
          </button>
        </div>

        <div class="modal-body" id="modal-tab-content">
          ${getTabBody()}
        </div>
      </div>
    `;

    // Modal Close Button
    const btnClose = document.getElementById("btn-close-modal");
    if (btnClose) btnClose.addEventListener("click", closeModal);

    // Back to Curriculum Button
    const btnBack = document.getElementById("btn-header-back-curriculum");
    if (btnBack) {
      btnBack.addEventListener("click", (e) => {
        e.preventDefault();
        try { SoundFX.playClick(); } catch (err) {}
        closeModal();
      });
    }

    // Breadcrumb links close full screen lesson view
    overlay.querySelectorAll(".breadcrumb-link").forEach(link => {
      link.addEventListener("click", () => {
        closeModal();
      });
    });

    // Fullscreen Toggle Button (toggles browser/kiosk display fullscreen; CSS layout is ALWAYS 100vw x 100vh full browser screen, never a dialogue box)
    const btnFs = document.getElementById("btn-header-fullscreen-modal");
    if (btnFs) {
      syncFullscreenButton();
      btnFs.addEventListener("click", () => {
        try { SoundFX.playClick(); } catch (e) {}
        const isDisplayFs = typeof document !== "undefined" && !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isDisplayFs) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        } else {
          const reqFs = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
          if (reqFs) {
            reqFs.call(document.documentElement).catch(() => {});
          }
        }
        setTimeout(() => {
          syncFullscreenButton();
          window.dispatchEvent(new Event("resize"));
        }, 100);
      });
    }

    // Annotate Button (Smartboard Toolbar)
    const btnAnnotate = document.getElementById("btn-header-annotate-modal");
    if (btnAnnotate) {
      btnAnnotate.addEventListener("click", () => {
        try { SoundFX.playPop(); } catch (e) {}
        const pBar = document.getElementById("smartboard-pen-bar");
        if (pBar) {
          pBar.classList.remove("sb-modal-docked");
          pBar.classList.remove("sb-hidden");
          pBar.classList.add("visible");
          pBar.style.transform = "translateY(0)";
          pBar.style.opacity = "1";
          pBar.style.pointerEvents = "auto";
        }
        if (window.smartboardToolbar && typeof window.smartboardToolbar.setMode === "function") {
          window.smartboardToolbar.setMode("pen");
        } else {
          const penBtn = document.getElementById("sb-tool-pen");
          if (penBtn) penBtn.click();
        }
      });
    }

    // Share Button
    const btnShare = document.getElementById("btn-header-share-modal");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        const linkRoute = activeTab === "interactive" 
          ? `#lesson/${moduleData.code}-L${currentLessonId}` 
          : `#module/${moduleData.code}`;
        const curLesson = moduleData.lessons ? moduleData.lessons.find(l => l.id === currentLessonId) : null;
        const curSub = moduleData.code.startsWith("CHEM") ? "Inspire Chemistry" : (moduleData.code.startsWith("BIO") ? "Inspire Biology" : "Inspire Physics");
        import("../utils/lms-share.js").then(m => {
          m.openLmsShareModal({
            url: linkRoute,
            title: curLesson ? `${moduleData.title}: ${curLesson.title}` : moduleData.title,
            subject: curSub,
            moduleCode: moduleData.code,
            description: curLesson && curLesson.objectives ? curLesson.objectives.join(". ") : (moduleData.phenomenon || moduleData.bigIdea),
            objectives: curLesson && curLesson.objectives ? curLesson.objectives : (moduleData.lessons ? moduleData.lessons.flatMap(l => l.objectives || []) : [])
          });
        });
      });
    }

    // Header Lesson Plan Button
    const btnHeaderPlan = document.getElementById("btn-header-lesson-plan");
    if (btnHeaderPlan) {
      btnHeaderPlan.addEventListener("click", () => {
        import("./lesson-plan-generator.js").then(m => {
          m.openLessonPlanModal(moduleData.code, moduleData.id, currentLessonId);
        });
      });
    }

    // Header Overflow Menu Handler (Mobile / Compact Viewports)
    const btnOverflow = document.getElementById("btn-header-overflow-modal");
    const overflowMenu = document.getElementById("modal-header-overflow-menu");
    if (btnOverflow && overflowMenu) {
      const toggleOverflow = (show) => {
        const isHidden = overflowMenu.hasAttribute("hidden");
        const nextState = typeof show === "boolean" ? show : isHidden;
        if (nextState) {
          overflowMenu.removeAttribute("hidden");
          btnOverflow.setAttribute("aria-expanded", "true");
        } else {
          overflowMenu.setAttribute("hidden", "");
          btnOverflow.setAttribute("aria-expanded", "false");
        }
      };

      btnOverflow.addEventListener("click", (e) => {
        e.stopPropagation();
        try { SoundFX.playClick(); } catch (err) {}
        toggleOverflow();
      });

      document.addEventListener("click", (e) => {
        if (!overflowMenu.contains(e.target) && e.target !== btnOverflow) {
          toggleOverflow(false);
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overflowMenu.hasAttribute("hidden")) {
          toggleOverflow(false);
          btnOverflow.focus();
        }
      });

      const wireOverflowItem = (itemId, targetBtn) => {
        const item = document.getElementById(itemId);
        if (item && targetBtn) {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleOverflow(false);
            targetBtn.click();
          });
        }
      };

      wireOverflowItem("btn-overflow-annotate", btnAnnotate);
      wireOverflowItem("btn-overflow-fullscreen", btnFs);
      wireOverflowItem("btn-overflow-share", btnShare);
      wireOverflowItem("btn-overflow-lesson-plan", btnHeaderPlan);
    }

    // Tab Switchers
    overlay.querySelectorAll(".modal-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        try { SoundFX.playClick(); } catch (e) {}
        cleanupLessonInteractive("overview-lesson-sim-container");
        cleanupLessonInteractive("tab-lesson-sim-container");
        cleanupLessonInteractive("lab-lesson-sim-container");
        cleanupLessonInteractive("embedded-module-lab-mount");
        activeTab = btn.dataset.tab;
        renderContent();
      });
    });

    // Post-render mounting
    if (activeTab === "overview") {
      mountOverviewInteractions();
    } else if (activeTab === "interactive") {
      mountDedicatedInteractiveTab();
    } else if (activeTab === "lab") {
      mountLabTab();
    } else {
      renderMathInElement(document.getElementById("modal-tab-content"));
      const btnConceptsPlan = document.getElementById("btn-concepts-lesson-plan");
      if (btnConceptsPlan) {
        btnConceptsPlan.addEventListener("click", () => {
          import("./lesson-plan-generator.js").then(m => {
            m.openLessonPlanModal(moduleData.code, moduleData.id, currentLessonId);
          });
        });
      }
      const weRoot = overlay.querySelector("#worked-example-root");
      const theory = getLessonComprehensiveTheory(moduleData.code, currentLessonId);
      if (weRoot && theory && theory.workedExample) {
        initWorkedExampleListeners(weRoot, theory.workedExample);
      }
    }
  }

  function getTabBody() {
    if (activeTab === "overview") {
      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Phenomenon Inquiry Box -->
          <div class="modal-inquiry-box" style="border-left: 4px solid ${subjectColor};">
            <div style="font-size: 0.8rem; font-weight: 700; color: ${subjectColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
              <span>Encounter The Phenomenon (Inquiry Prompt)</span>
            </div>
            <div class="modal-inquiry-prompt">
              "${moduleData.phenomenon}"
            </div>
          </div>

          <!-- Big Idea -->
          <div>
            <h3 class="modal-section-title" style="margin-bottom: 8px;">
              Module Big Idea
            </h3>
            <p class="modal-big-idea-text">
              ${moduleData.bigIdea}
            </p>
          </div>

          <!-- Interactive Lessons Selector -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h3 class="modal-section-title">
                  Lessons in this Module
                </h3>
                <p class="modal-section-subtitle">
                  Select any lesson below to immediately load its tailored interactive laboratory simulator:
                </p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <button id="btn-overview-lesson-plan" class="btn-sim-action" style="padding: 8px 14px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; border: none; font-weight: 700; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(37,99,235,0.3);">
                  <span>📄 Teacher Plan (A4)</span>
                </button>
                <button id="btn-jump-to-interactive-tab" class="btn-sim-action" style="padding: 8px 16px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                  <span>Full Interactive View</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${moduleData.lessons.map(les => {
                const isSelected = les.id === currentLessonId;
                const lesSpec = getLessonInteractiveSpec(moduleData, les.id);
                return `
                  <div class="lesson-card-item ${isSelected ? 'active' : ''}" data-lesson-id="${les.id}"
                       style="cursor: pointer; transition: all 0.2s ease; background: ${isSelected ? 'rgba(56,189,248,0.1)' : 'var(--bg-surface-elevated)'}; border: 1.5px solid ${isSelected ? subjectColor : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 16px; box-shadow: ${isSelected ? `0 0 16px ${subjectColor}33` : 'none'};">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                          <span style="font-size: 0.75rem; font-weight: 700; color: ${isSelected ? subjectColor : 'var(--text-dim)'}; text-transform: uppercase; background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 4px;">
                            Lesson ${les.id}
                          </span>
                          <span style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">
                            ${les.title}
                          </span>
                        </div>
                        <ul class="modal-objectives-list">
                          ${les.objectives.map(obj => `<li>${obj}</li>`).join("")}
                        </ul>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                        <button class="btn-select-lesson-interactive" data-lesson-id="${les.id}"
                                style="white-space: nowrap; border: 1px solid ${isSelected ? subjectColor : 'var(--border-color)'}; background: ${isSelected ? subjectColor : 'var(--bg-card)'}; color: ${isSelected ? '#ffffff' : 'var(--text-main)'}; font-weight: 700; font-size: 0.82rem; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                          ${isSelected ? '✓ Active Simulator' : '🔬 Load Simulator'}
                        </button>
                        <button class="btn-item-lesson-plan" data-lesson-id="${les.id}" title="Open 2-Page Lesson Plan for Lesson ${les.id}"
                                style="white-space: nowrap; padding: 4px 10px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                          <span>📄 A4 Plan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Embedded Live Lesson Interactive Workbench -->
          <div style="margin-top: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div class="modal-section-title" style="display: flex; align-items: center; gap: 8px;">
                <span>🔬</span>
                <span>Active Lesson Simulation Workbench</span>
              </div>
            </div>
            <div id="overview-lesson-sim-container" style="min-height: 380px;"></div>
          </div>
        </div>
      `;
    } else if (activeTab === "interactive") {
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Top Lesson Selector Bar with Dropdown Menu (Eliminates horizontal scrolling) -->
          <div class="interactive-lesson-pills-bar" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 260px;">
              <label for="sel-modal-lesson" class="pills-bar-label" style="display: flex; align-items: center; gap: 6px; margin: 0; white-space: nowrap;">
                <span>📖</span>
                <span>Current Lesson:</span>
              </label>
              <div style="flex: 1; max-width: 480px;">
                <select id="sel-modal-lesson" class="fc-custom-select modal-lesson-select" aria-label="Select Lesson Interactive">
                  ${moduleData.lessons.map(les => `
                    <option value="${les.id}" ${les.id === currentLessonId ? 'selected' : ''}>
                      Lesson ${les.id}: ${les.title}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>

            <!-- Quick Prev/Next + Flashcard Action -->
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap;">
              <div class="interactive-zoom-controls" style="display: inline-flex; align-items: center; background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px 4px; gap: 4px;">
                <button class="btn btn-secondary" id="btn-sim-zoom-out" style="padding: 3px 8px; font-size: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--text-main); font-weight: 700;" title="Zoom Out Simulation Canvas" aria-label="Zoom out simulation">−</button>
                <span id="disp-sim-zoom" style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; padding: 0 4px; color: var(--text-muted); min-width: 38px; text-align: center;">${Math.round(currentSimZoom * 100)}%</span>
                <button class="btn btn-secondary" id="btn-sim-zoom-in" style="padding: 3px 8px; font-size: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--text-main); font-weight: 700;" title="Zoom In Simulation Canvas" aria-label="Zoom in simulation">+</button>
                <button class="btn btn-secondary" id="btn-sim-zoom-reset" style="padding: 3px 6px; font-size: 0.72rem; border: none; background: transparent; cursor: pointer; color: #38bdf8;" title="Reset Zoom to 100%" aria-label="Reset zoom">⟲</button>
              </div>
              <button class="btn btn-secondary btn-lesson-step" id="btn-modal-prev-lesson" style="padding: 6px 12px; font-size: 0.82rem;" title="Previous Lesson">
                ← Prev
              </button>
              <button class="btn btn-secondary btn-lesson-step" id="btn-modal-next-lesson" style="padding: 6px 12px; font-size: 0.82rem;" title="Next Lesson">
                Next →
              </button>
              <button class="btn btn-secondary lesson-flashcard-btn" id="btn-modal-open-flashcard" style="padding: 6px 14px; font-size: 0.82rem; white-space: nowrap;" title="Review Flashcard for this Lesson">
                🃏 Lesson Flashcard
              </button>
              <button class="btn btn-primary lesson-plan-btn" id="btn-modal-open-lesson-plan" style="padding: 6px 14px; font-size: 0.82rem; white-space: nowrap; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; color: #fff; font-weight: 700; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(37,99,235,0.35);" title="Open 2-Page A4 Teacher Lesson Plan &amp; PDF Export">
                📄 2-Page Lesson Plan
              </button>
            </div>
          </div>

          <!-- Mount point for dedicated interactive simulation -->
          <div id="tab-lesson-sim-container" style="min-height: 480px;"></div>
        </div>
      `;
    } else if (activeTab === "concepts") {
      const theory = getLessonComprehensiveTheory(moduleData.code.split('-')[0], moduleData.id, currentLessonId, null, moduleData);
      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Core Scientific Theory & Governing Principles -->
          <div class="modal-theory-core">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.3rem;">📘</span>
                <h3 class="modal-section-title" style="font-size: 1.25rem; font-weight: 800; margin: 0;">
                  Comprehensive Scientific Theory: ${theory.topic}
                </h3>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="curriculum-standard-badge" style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.25);">
                  Rigorous Curriculum Standard
                </span>
                <button id="btn-concepts-lesson-plan" class="btn btn-secondary" style="padding: 4px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.1); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" title="Print/Export 2-Page Lesson Plan">
                  <span>📄 Lesson Plan</span>
                </button>
              </div>
            </div>
            <div class="modal-theory-core-body">
              ${theory.coreTheory.split('\n\n').map(p => `<p style="margin: 0;">${p}</p>`).join("")}
            </div>
          </div>

          <!-- Mathematical & Scientific Formulas -->
          <div>
            <h3 class="modal-section-title" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📐</span> Mathematical Formulations &amp; Governing Laws
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${(moduleData.formulas || []).map(f => `
                <div class="formula-card">
                  ${renderLatex(f, true)}
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 3-Column Mechanism, Math & Real-World Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <!-- Column 1: Submicroscopic Mechanism -->
            <div class="modal-theory-card">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #10b981; font-weight: 700; font-size: 0.92rem;">
                <span>🔬</span> Particulate / Molecular Mechanism
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 10px; line-height: 1.5;">
                ${theory.mechanism.map(m => `<li>${m}</li>`).join("")}
              </ul>
            </div>

            <!-- Column 2: Parameters & SI Table -->
            <div class="modal-theory-card">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #0284c7; font-weight: 700; font-size: 0.92rem;">
                <span>📊</span> Physical Parameters &amp; SI Units
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem;">
                ${(theory.parameters || []).map(p => `
                  <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="color: #0284c7; font-weight: 700;">${renderLatex(p.sym, false)}: ${p.name}</span>
                      <span style="color: var(--text-main); font-family: var(--font-mono); font-weight: 600;">${renderLatex(p.unit, false)}</span>
                    </div>
                    <div class="param-desc" style="color: var(--text-dim); font-size: 0.78rem;">${p.desc}</div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Column 3: Real-World Applications -->
            <div class="modal-theory-card">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #f59e0b; font-weight: 700; font-size: 0.92rem;">
                <span>🚀</span> Modern STEM Applications
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 10px; line-height: 1.5;">
                ${theory.applications.map(app => `<li>${app}</li>`).join("")}
              </ul>
            </div>
          </div>

          <!-- Step-by-Step Quantitative Worked Example (Dual Mode: Reference & Interactive Step Solver) -->
          ${theory.workedExample ? `
            <div id="module-worked-example-container" style="margin-top: 8px;">
              ${renderWorkedExampleHTML(theory.workedExample, theory.isVerified, "reference")}
            </div>
          ` : ''}

          <!-- NGSS Standards Alignment -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 4px;">
            <div class="modal-ngss-card">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 6px; font-size: 0.85rem; text-transform: uppercase;">
                Science &amp; Engineering Practices (SEP)
              </div>
              <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                Developing and using quantitative models, planning and carrying out scientific investigations, constructing evidence-based explanations.
              </p>
            </div>

            <div class="modal-ngss-card">
              <div style="font-weight: 700; color: #f59e0b; margin-bottom: 6px; font-size: 0.85rem; text-transform: uppercase;">
                Disciplinary Core Ideas (DCI)
              </div>
              <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                Structure and properties of matter, fundamental forces and motion, energy transfer, cellular processes, and systems dynamics.
              </p>
            </div>

            <div class="modal-ngss-card">
              <div style="font-weight: 700; color: #10b981; margin-bottom: 6px; font-size: 0.85rem; text-transform: uppercase;">
                Crosscutting Concepts (CCC)
              </div>
              <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                Cause and effect, scale, proportion and quantity, systems and system models, energy and matter conservation.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Virtual Lab Sandbox Tab
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Top Sandbox Switcher -->
          <div class="modal-sandbox-bar">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-muted);">Investigation Mode:</span>
              <button class="btn-sim-action ${labMode === 'module' ? 'active' : ''}" id="btn-labmode-module" style="padding: 6px 14px; font-size: 0.85rem;">
                Full Module Virtual Lab
              </button>
              <button class="btn-sim-action ${labMode === 'lesson' ? 'active' : ''}" id="btn-labmode-lesson" style="padding: 6px 14px; font-size: 0.85rem;">
                Lesson Interactive Mode
              </button>
              <a href="#labs/${String(moduleData.lab || 'lab-projectile').replace(/^lab[-_]/, '')}" class="btn-sim-action" id="btn-open-dedicated-lab" style="padding: 6px 14px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" title="Launch dedicated full-screen workbench" aria-label="Launch dedicated full-screen workbench">
                <span>↗ Fullscreen Workbench</span>
              </a>
            </div>

            ${labMode === 'lesson' ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.85rem; color: var(--text-dim);">Lesson:</span>
                <select id="sel-lab-lesson" style="background: var(--bg-surface-elevated); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 10px; font-size: 0.85rem;">
                  ${moduleData.lessons.map(l => `
                    <option value="${l.id}" ${l.id === currentLessonId ? 'selected' : ''}>Lesson ${l.id}: ${l.title}</option>
                  `).join("")}
                </select>
              </div>
            ` : ''}
          </div>

          <!-- Main Lab Viewport -->
          <div id="embedded-module-lab-mount" style="min-height: 520px;"></div>
        </div>
      `;
    }
  }

  function mountOverviewInteractions() {
    renderMathInElement(document.getElementById("modal-tab-content"));

    // Mount initial lesson interactive
    mountLessonInteractive("overview-lesson-sim-container", moduleData, currentLessonId);

    // Bind card and button clicks to load simulator and switch to interactive view
    overlay.querySelectorAll(".lesson-card-item").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-item-lesson-plan")) return;
        const lid = parseInt(card.dataset.lessonId, 10);
        currentLessonId = lid;
        activeTab = "interactive";
        try { SoundFX.playClick(); } catch (err) {}
        renderContent();
        try {
          history.replaceState(null, "", `#lesson/${moduleData.code}-L${currentLessonId}`);
        } catch (err) {}
      });
    });

    overlay.querySelectorAll(".btn-select-lesson-interactive").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const lid = parseInt(btn.dataset.lessonId, 10);
        currentLessonId = lid;
        activeTab = "interactive";
        try { SoundFX.playClick(); } catch (err) {}
        renderContent();
        try {
          history.replaceState(null, "", `#lesson/${moduleData.code}-L${currentLessonId}`);
        } catch (err) {}
      });
    });

    // Jump to interactive tab
    const jumpBtn = document.getElementById("btn-jump-to-interactive-tab");
    if (jumpBtn) {
      jumpBtn.addEventListener("click", () => {
        activeTab = "interactive";
        renderContent();
      });
    }

    // Overview Lesson Plan Button
    const btnOverviewPlan = document.getElementById("btn-overview-lesson-plan");
    if (btnOverviewPlan) {
      btnOverviewPlan.addEventListener("click", () => {
        import("./lesson-plan-generator.js").then(m => {
          m.openLessonPlanModal(moduleData.code, moduleData.id, currentLessonId);
        });
      });
    }

    // Per-lesson Plan buttons in list
    overlay.querySelectorAll(".btn-item-lesson-plan").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const lid = parseInt(btn.dataset.lessonId, 10);
        import("./lesson-plan-generator.js").then(m => {
          m.openLessonPlanModal(moduleData.code, moduleData.id, lid);
        });
      });
    });
  }

  function mountDedicatedInteractiveTab() {
    renderMathInElement(document.getElementById("modal-tab-content"));

    // Dynamic Flashcard button, dropdown selector, and Prev/Next controls
    const btnFc = overlay.querySelector("#btn-modal-open-flashcard");
    const selLesson = overlay.querySelector("#sel-modal-lesson");
    const btnPrev = overlay.querySelector("#btn-modal-prev-lesson");
    const btnNext = overlay.querySelector("#btn-modal-next-lesson");

    function updateNavControls() {
      if (btnFc) {
        const curLesson = moduleData.lessons?.find(l => l.id === currentLessonId);
        btnFc.innerHTML = `🃏 Lesson ${currentLessonId} Flashcard`;
        btnFc.title = `Review Flashcard for Lesson ${currentLessonId}${curLesson ? ': ' + curLesson.title : ''}`;
      }
      if (selLesson && selLesson.value !== String(currentLessonId)) {
        selLesson.value = String(currentLessonId);
      }
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        const idx = moduleData.lessons.findIndex(l => l.id === currentLessonId);
        if (btnPrev) btnPrev.disabled = idx <= 0;
        if (btnNext) btnNext.disabled = idx >= moduleData.lessons.length - 1;
      }
    }
    updateNavControls();

    // Mount current lesson simulation
    mountLessonInteractive("tab-lesson-sim-container", moduleData, currentLessonId);

    // Dropdown change listener
    if (selLesson) {
      selLesson.addEventListener("change", (e) => {
        const lid = parseInt(e.target.value, 10);
        if (lid !== currentLessonId) {
          try { SoundFX.playClick(); } catch (e) {}
          currentLessonId = lid;
          updateNavControls();
          mountLessonInteractive("tab-lesson-sim-container", moduleData, currentLessonId);
          try {
            history.replaceState(null, "", `#lesson/${moduleData.code}-L${currentLessonId}`);
          } catch (err) {}
        }
      });
    }

    // Step Previous button
    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        const idx = moduleData.lessons.findIndex(l => l.id === currentLessonId);
        if (idx > 0) {
          try { SoundFX.playClick(); } catch (e) {}
          currentLessonId = moduleData.lessons[idx - 1].id;
          updateNavControls();
          mountLessonInteractive("tab-lesson-sim-container", moduleData, currentLessonId);
          try {
            history.replaceState(null, "", `#lesson/${moduleData.code}-L${currentLessonId}`);
          } catch (err) {}
        }
      });
    }

    // Step Next button
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        const idx = moduleData.lessons.findIndex(l => l.id === currentLessonId);
        if (idx >= 0 && idx < moduleData.lessons.length - 1) {
          try { SoundFX.playClick(); } catch (e) {}
          currentLessonId = moduleData.lessons[idx + 1].id;
          updateNavControls();
          mountLessonInteractive("tab-lesson-sim-container", moduleData, currentLessonId);
          try {
            history.replaceState(null, "", `#lesson/${moduleData.code}-L${currentLessonId}`);
          } catch (err) {}
        }
      });
    }

    // Bind Jump to Lesson Flashcard
    if (btnFc) {
      btnFc.addEventListener("click", () => {
        closeModal();
        if (typeof window.switchToFlashcard === "function") {
          const subCode = (moduleData.code || "").split("-")[0] || "CHEM";
          window.switchToFlashcard(subCode, moduleData.id, currentLessonId);
        }
      });
    }

    // Bind Open Lesson Plan Modal
    const btnLp = overlay.querySelector("#btn-modal-open-lesson-plan");
    if (btnLp) {
      btnLp.addEventListener("click", () => {
        import("./lesson-plan-generator.js").then(m => {
          m.openLessonPlanModal(moduleData.code, moduleData.id, currentLessonId);
        });
      });
    }

    // Simulation Canvas Zoom controls
    const btnZoomIn = overlay.querySelector("#btn-sim-zoom-in");
    const btnZoomOut = overlay.querySelector("#btn-sim-zoom-out");
    const btnZoomReset = overlay.querySelector("#btn-sim-zoom-reset");
    const dispZoom = overlay.querySelector("#disp-sim-zoom");
    const simMount = overlay.querySelector("#tab-lesson-sim-container");

    function applyZoom(z) {
      currentSimZoom = Math.min(Math.max(z, 0.6), 2.5);
      if (simMount) {
        simMount.style.transform = currentSimZoom === 1.0 ? "" : `scale(${currentSimZoom})`;
        simMount.style.transformOrigin = "top center";
        simMount.style.transition = "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
      }
      if (dispZoom) dispZoom.textContent = `${Math.round(currentSimZoom * 100)}%`;
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        try { SoundFX.playClick(); } catch (e) {}
        applyZoom(currentSimZoom + 0.15);
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        try { SoundFX.playClick(); } catch (e) {}
        applyZoom(currentSimZoom - 0.15);
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener("click", () => {
        try { SoundFX.playClick(); } catch (e) {}
        applyZoom(1.0);
      });
    }
  }

  function mountLabTab() {
    const mount = document.getElementById("embedded-module-lab-mount");
    if (!mount) return;

    // Mode toggles
    const btnModule = document.getElementById("btn-labmode-module");
    const btnLesson = document.getElementById("btn-labmode-lesson");
    const selLesson = document.getElementById("sel-lab-lesson");

    if (btnModule) {
      btnModule.addEventListener("click", () => {
        if (labMode !== "module") {
          labMode = "module";
          renderContent();
        }
      });
    }

    if (btnLesson) {
      btnLesson.addEventListener("click", () => {
        if (labMode !== "lesson") {
          labMode = "lesson";
          renderContent();
        }
      });
    }

    if (selLesson) {
      selLesson.addEventListener("change", (e) => {
        currentLessonId = parseInt(e.target.value, 10);
        mountLessonInteractive("embedded-module-lab-mount", moduleData, currentLessonId);
      });
    }

    if (labMode === "lesson") {
      mountLessonInteractive("embedded-module-lab-mount", moduleData, currentLessonId);
      return;
    }

    // Module Lab Mode
    const rawKey = moduleData.lab || "lab-projectile";
    const cleanKey = String(rawKey).toLowerCase().replace(/^lab[-_]/, "").replace(/[-_]/g, "");
    ProgressStore.recordLabLaunched(rawKey);

    const labLoaders = {
      "projectile": () => import("../labs/phys-projectile.js?v=5.7").then(m => m.initProjectileLab("embedded-module-lab-mount")),
      "lab-projectile": () => import("../labs/phys-projectile.js?v=5.7").then(m => m.initProjectileLab("embedded-module-lab-mount")),
      "titration": () => import("../labs/chem-titration.js?v=5.7").then(m => m.initTitrationLab("embedded-module-lab-mount")),
      "lab-titration": () => import("../labs/chem-titration.js?v=5.7").then(m => m.initTitrationLab("embedded-module-lab-mount")),
      "microscope": () => import("../labs/bio-microscope.js?v=5.7").then(m => m.initMicroscopeLab("embedded-module-lab-mount")),
      "lab-microscope": () => import("../labs/bio-microscope.js?v=5.7").then(m => m.initMicroscopeLab("embedded-module-lab-mount")),
      "ptable": () => import("../labs/chem-periodic-table.js?v=5.7").then(m => m.initPeriodicTableLab("embedded-module-lab-mount")),
      "periodic-table": () => import("../labs/chem-periodic-table.js?v=5.7").then(m => m.initPeriodicTableLab("embedded-module-lab-mount")),
      "lab-periodic-table": () => import("../labs/chem-periodic-table.js?v=5.7").then(m => m.initPeriodicTableLab("embedded-module-lab-mount")),
      "circuits": () => import("../labs/phys-circuits.js?v=5.7").then(m => m.initCircuitsLab("embedded-module-lab-mount")),
      "circuit": () => import("../labs/phys-circuits.js?v=5.7").then(m => m.initCircuitsLab("embedded-module-lab-mount")),
      "lab-circuits": () => import("../labs/phys-circuits.js?v=5.7").then(m => m.initCircuitsLab("embedded-module-lab-mount")),
      "gaslaws": () => import("../labs/chem-gas-laws.js?v=5.7").then(m => m.initGasLawsLab("embedded-module-lab-mount")),
      "gas-laws": () => import("../labs/chem-gas-laws.js?v=5.7").then(m => m.initGasLawsLab("embedded-module-lab-mount")),
      "lab-gas-laws": () => import("../labs/chem-gas-laws.js?v=5.7").then(m => m.initGasLawsLab("embedded-module-lab-mount")),
      "dnaprotein": () => import("../labs/bio-dna-protein.js?v=5.7").then(m => m.initDnaProteinLab("embedded-module-lab-mount")),
      "dna-protein": () => import("../labs/bio-dna-protein.js?v=5.7").then(m => m.initDnaProteinLab("embedded-module-lab-mount")),
      "lab-dna-protein": () => import("../labs/bio-dna-protein.js?v=5.7").then(m => m.initDnaProteinLab("embedded-module-lab-mount")),
      "punnett": () => import("../labs/bio-punnett-square.js?v=5.7").then(m => m.initPunnettLab("embedded-module-lab-mount")),
      "punnett-square": () => import("../labs/bio-punnett-square.js?v=5.7").then(m => m.initPunnettLab("embedded-module-lab-mount")),
      "lab-punnett": () => import("../labs/bio-punnett-square.js?v=5.7").then(m => m.initPunnettLab("embedded-module-lab-mount")),
      "optics": () => import("../labs/phys-optics.js?v=5.7").then(m => m.initOpticsLab("embedded-module-lab-mount")),
      "optic": () => import("../labs/phys-optics.js?v=5.7").then(m => m.initOpticsLab("embedded-module-lab-mount")),
      "lab-optics": () => import("../labs/phys-optics.js?v=5.7").then(m => m.initOpticsLab("embedded-module-lab-mount")),
      "vsepr": () => import("../labs/chem-vsepr.js?v=5.7").then(m => m.initVseprLab("embedded-module-lab-mount")),
      "lab-vsepr": () => import("../labs/chem-vsepr.js?v=5.7").then(m => m.initVseprLab("embedded-module-lab-mount")),
      "waves": () => import("../labs/phys-waves.js?v=5.7").then(m => m.initWaveLab("embedded-module-lab-mount")),
      "wave": () => import("../labs/phys-waves.js?v=5.7").then(m => m.initWaveLab("embedded-module-lab-mount")),
      "lab-waves": () => import("../labs/phys-waves.js?v=5.7").then(m => m.initWaveLab("embedded-module-lab-mount")),
      "photosynthesis": () => import("../labs/bio-photosynthesis.js?v=5.7").then(m => m.initPhotosynthesisLab("embedded-module-lab-mount")),
      "lab-photosynthesis": () => import("../labs/bio-photosynthesis.js?v=5.7").then(m => m.initPhotosynthesisLab("embedded-module-lab-mount")),
      "calorimetry": () => import("../labs/chem-calorimetry.js?v=5.7").then(m => m.initCalorimetryLab("embedded-module-lab-mount")),
      "lab-calorimetry": () => import("../labs/chem-calorimetry.js?v=5.7").then(m => m.initCalorimetryLab("embedded-module-lab-mount")),
      "equilibrium": () => import("../labs/chem-equilibrium.js?v=5.7").then(m => m.initEquilibriumLab("embedded-module-lab-mount")),
      "lab-equilibrium": () => import("../labs/chem-equilibrium.js?v=5.7").then(m => m.initEquilibriumLab("embedded-module-lab-mount")),
      "electrochem": () => import("../labs/chem-electrochem.js?v=5.7").then(m => m.initElectrochemLab("embedded-module-lab-mount")),
      "lab-electrochem": () => import("../labs/chem-electrochem.js?v=5.7").then(m => m.initElectrochemLab("embedded-module-lab-mount")),
      "harmonic": () => import("../labs/phys-harmonic.js?v=5.7").then(m => m.initHarmonicLab("embedded-module-lab-mount")),
      "lab-harmonic": () => import("../labs/phys-harmonic.js?v=5.7").then(m => m.initHarmonicLab("embedded-module-lab-mount")),
      "photoelectric": () => import("../labs/phys-photoelectric.js?v=5.7").then(m => m.initPhotoelectricLab("embedded-module-lab-mount")),
      "lab-photoelectric": () => import("../labs/phys-photoelectric.js?v=5.7").then(m => m.initPhotoelectricLab("embedded-module-lab-mount")),
      "magnetism": () => import("../labs/phys-magnetism.js?v=5.7").then(m => m.initMagnetismLab("embedded-module-lab-mount")),
      "lab-magnetism": () => import("../labs/phys-magnetism.js?v=5.7").then(m => m.initMagnetismLab("embedded-module-lab-mount")),
      "enzymes": () => import("../labs/bio-enzyme-kinetics.js?v=5.7").then(m => m.initEnzymeLab("embedded-module-lab-mount")),
      "lab-enzymes": () => import("../labs/bio-enzyme-kinetics.js?v=5.7").then(m => m.initEnzymeLab("embedded-module-lab-mount")),
      "respiration": () => import("../labs/bio-respiration.js?v=5.7").then(m => m.initRespirationLab("embedded-module-lab-mount")),
      "lab-respiration": () => import("../labs/bio-respiration.js?v=5.7").then(m => m.initRespirationLab("embedded-module-lab-mount")),
      "beerlambert": () => import("../labs/chem-beer-lambert.js?v=5.7").then(m => m.initBeerLambertLab("embedded-module-lab-mount")),
      "lab-beerlambert": () => import("../labs/chem-beer-lambert.js?v=5.7").then(m => m.initBeerLambertLab("embedded-module-lab-mount")),
      "decay": () => import("../labs/chem-nuclear-decay.js?v=5.7").then(m => m.initNuclearDecayLab("embedded-module-lab-mount")),
      "lab-decay": () => import("../labs/chem-nuclear-decay.js?v=5.7").then(m => m.initNuclearDecayLab("embedded-module-lab-mount")),
      "colligative": () => import("../labs/chem-colligative.js?v=5.7").then(m => m.initColligativeLab("embedded-module-lab-mount")),
      "lab-colligative": () => import("../labs/chem-colligative.js?v=5.7").then(m => m.initColligativeLab("embedded-module-lab-mount")),
      "organic": () => import("../labs/chem-organic-reactions.js?v=5.7").then(m => m.initOrganicReactionsLab("embedded-module-lab-mount")),
      "lab-organic": () => import("../labs/chem-organic-reactions.js?v=5.7").then(m => m.initOrganicReactionsLab("embedded-module-lab-mount")),
      "electrophoresis": () => import("../labs/bio-gel-electrophoresis.js?v=5.7").then(m => m.initGelElectrophoresisLab("embedded-module-lab-mount")),
      "lab-electrophoresis": () => import("../labs/bio-gel-electrophoresis.js?v=5.7").then(m => m.initGelElectrophoresisLab("embedded-module-lab-mount")),
      "ecology": () => import("../labs/bio-population-ecology.js?v=5.7").then(m => m.initPopulationEcologyLab("embedded-module-lab-mount")),
      "lab-ecology": () => import("../labs/bio-population-ecology.js?v=5.7").then(m => m.initPopulationEcologyLab("embedded-module-lab-mount")),
      "actionpotential": () => import("../labs/bio-action-potential.js?v=5.7").then(m => m.initActionPotentialLab("embedded-module-lab-mount")),
      "lab-actionpotential": () => import("../labs/bio-action-potential.js?v=5.7").then(m => m.initActionPotentialLab("embedded-module-lab-mount")),
      "rotational": () => import("../labs/phys-rotational-dynamics.js?v=5.7").then(m => m.initRotationalDynamicsLab("embedded-module-lab-mount")),
      "lab-rotational": () => import("../labs/phys-rotational-dynamics.js?v=5.7").then(m => m.initRotationalDynamicsLab("embedded-module-lab-mount")),
      "conduction": () => import("../labs/phys-thermal-conduction.js?v=5.7").then(m => m.initThermalConductionLab("embedded-module-lab-mount")),
      "lab-conduction": () => import("../labs/phys-thermal-conduction.js?v=5.7").then(m => m.initThermalConductionLab("embedded-module-lab-mount")),
      "fluids": () => import("../labs/phys-fluids-buoyancy.js?v=5.7").then(m => m.initFluidsBuoyancyLab("embedded-module-lab-mount")),
      "lab-fluids": () => import("../labs/phys-fluids-buoyancy.js?v=5.7").then(m => m.initFluidsBuoyancyLab("embedded-module-lab-mount")),
      "anatomy": () => import("../labs/anatomy-atlas.js?v=5.7").then(m => m.initAnatomyAtlasLab("embedded-module-lab-mount")),
      "lab-anatomy": () => import("../labs/anatomy-atlas.js?v=5.7").then(m => m.initAnatomyAtlasLab("embedded-module-lab-mount")),
      "atlas": () => import("../labs/anatomy-atlas.js?v=5.7").then(m => m.initAnatomyAtlasLab("embedded-module-lab-mount")),
      "anatomy-atlas": () => import("../labs/anatomy-atlas.js?v=5.7").then(m => m.initAnatomyAtlasLab("embedded-module-lab-mount")),
      "kinetics": () => import("../labs/chem-reaction-kinetics.js?v=5.7").then(m => m.initReactionKineticsLab("embedded-module-lab-mount")),
      "lab-kinetics": () => import("../labs/chem-reaction-kinetics.js?v=5.7").then(m => m.initReactionKineticsLab("embedded-module-lab-mount")),
      "collisions": () => import("../labs/phys-collisions.js?v=5.7").then(m => m.initCollisionsLab("embedded-module-lab-mount")),
      "lab-collisions": () => import("../labs/phys-collisions.js?v=5.7").then(m => m.initCollisionsLab("embedded-module-lab-mount")),
      "induction": () => import("../labs/phys-induction.js?v=5.7").then(m => m.initInductionLab("embedded-module-lab-mount")),
      "lab-induction": () => import("../labs/phys-induction.js?v=5.7").then(m => m.initInductionLab("embedded-module-lab-mount")),
      "osmosis": () => import("../labs/bio-osmosis.js?v=5.7").then(m => m.initOsmosisLab("embedded-module-lab-mount")),
      "lab-osmosis": () => import("../labs/bio-osmosis.js?v=5.7").then(m => m.initOsmosisLab("embedded-module-lab-mount")),
      "mitosis": () => import("../labs/bio-mitosis.js?v=5.7").then(m => m.initMitosisLab("embedded-module-lab-mount")),
      "lab-mitosis": () => import("../labs/bio-mitosis.js?v=5.7").then(m => m.initMitosisLab("embedded-module-lab-mount")),
      "flametest": () => import("../labs/chem-flame-test.js?v=5.7").then(m => m.initFlameTestLab("embedded-module-lab-mount")),
      "lab-flame-test": () => import("../labs/chem-flame-test.js?v=5.7").then(m => m.initFlameTestLab("embedded-module-lab-mount")),
      "flame-test": () => import("../labs/chem-flame-test.js?v=5.7").then(m => m.initFlameTestLab("embedded-module-lab-mount")),
      "precipitation": () => import("../labs/chem-precipitation.js?v=5.7").then(m => m.initPrecipitationLab("embedded-module-lab-mount")),
      "lab-precipitation": () => import("../labs/chem-precipitation.js?v=5.7").then(m => m.initPrecipitationLab("embedded-module-lab-mount")),
      "activityseries": () => import("../labs/chem-activity-series.js?v=5.7").then(m => m.initActivitySeriesLab("embedded-module-lab-mount")),
      "lab-activity-series": () => import("../labs/chem-activity-series.js?v=5.7").then(m => m.initActivitySeriesLab("embedded-module-lab-mount")),
      "activity-series": () => import("../labs/chem-activity-series.js?v=5.7").then(m => m.initActivitySeriesLab("embedded-module-lab-mount")),
      "antibiotic": () => import("../labs/bio-antibiotic-resistance.js?v=5.7").then(m => m.initAntibioticResistanceLab("embedded-module-lab-mount")),
      "lab-antibiotic": () => import("../labs/bio-antibiotic-resistance.js?v=5.7").then(m => m.initAntibioticResistanceLab("embedded-module-lab-mount")),
      "elisa": () => import("../labs/bio-immune-elisa.js?v=5.7").then(m => m.initElisaLab("embedded-module-lab-mount")),
      "lab-elisa": () => import("../labs/bio-immune-elisa.js?v=5.7").then(m => m.initElisaLab("embedded-module-lab-mount")),
      "transpiration": () => import("../labs/bio-plant-transpiration.js?v=5.7").then(m => m.initPlantTranspirationLab("embedded-module-lab-mount")),
      "lab-transpiration": () => import("../labs/bio-plant-transpiration.js?v=5.7").then(m => m.initPlantTranspirationLab("embedded-module-lab-mount")),
      "orbital": () => import("../labs/phys-orbital-mechanics.js?v=5.7").then(m => m.initOrbitalMechanicsLab("embedded-module-lab-mount")),
      "lab-orbital": () => import("../labs/phys-orbital-mechanics.js?v=5.7").then(m => m.initOrbitalMechanicsLab("embedded-module-lab-mount")),
      "resonance": () => import("../labs/phys-sound-resonance.js?v=5.7").then(m => m.initSoundResonanceLab("embedded-module-lab-mount")),
      "lab-sound-resonance": () => import("../labs/phys-sound-resonance.js?v=5.7").then(m => m.initSoundResonanceLab("embedded-module-lab-mount")),
      "sound-resonance": () => import("../labs/phys-sound-resonance.js?v=5.7").then(m => m.initSoundResonanceLab("embedded-module-lab-mount")),
      "electrostatics": () => import("../labs/phys-electrostatics.js?v=5.7").then(m => m.initElectrostaticsLab("embedded-module-lab-mount")),
      "lab-electrostatics": () => import("../labs/phys-electrostatics.js?v=5.7").then(m => m.initElectrostaticsLab("embedded-module-lab-mount"))
    };

    const loader = labLoaders[rawKey] || labLoaders[cleanKey] || labLoaders["lab-projectile"];
    loader().then(cleanup => {
      currentLabCleanup = cleanup;
      renderMathInElement(mount);
    }).catch(err => {
      console.error("Failed to load lab simulation:", err);
      mount.innerHTML = `<div style="padding: 24px; text-align: center; color: #ef4444;">Failed to load lab simulation.</div>`;
    });
  }

  overlay.style.display = "flex";
  renderContent();
  setTimeout(() => {
    const focusTarget = document.getElementById("btn-header-back-curriculum") || document.getElementById("btn-close-modal");
    if (focusTarget && typeof focusTarget.focus === "function") {
      try { focusTarget.focus(); } catch (err) {}
    }
  }, 40);
}
