import { SoundFX } from "../utils/audio-synth.js";
import { toggleScienceCalculator } from "./science-calculator.js";
import { openLmsShareModal } from "../utils/lms-share.js";

export function initSmartboardToolbar() {
  let existingCanvas = document.getElementById("smartboard-draw-canvas");
  if (!existingCanvas) {
    const canvas = document.createElement("canvas");
    canvas.id = "smartboard-draw-canvas";
    document.body.appendChild(canvas);
    existingCanvas = canvas;
  }

  let existingBar = document.getElementById("smartboard-pen-bar");
  if (existingBar) existingBar.remove();

  const bar = document.createElement("div");
  bar.id = "smartboard-pen-bar";
  bar.className = "smartboard-pen-bar";
  bar.innerHTML = `
    <!-- Expanded Toolbar Content -->
    <div class="sb-full-content" id="sb-full-content" style="display: flex; align-items: center; gap: 8px; position: relative;">
      <!-- Drag Grip Handle -->
      <div class="sb-drag-handle" id="sb-drag-handle" title="Drag to Reposition Toolbar" style="cursor: grab; display: flex; align-items: center; justify-content: center; padding: 4px 6px 4px 2px; color: var(--text-muted); touch-action: none;">
        <svg width="12" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="18" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <!-- Mouse Pointer -->
      <button class="icon-action-btn" id="sb-tool-pointer" title="Mouse Pointer Mode" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 7 18 3-7 8-3L3 3Z"/></svg>
      </button>

      <!-- Drawing Pen -->
      <button class="icon-action-btn active" id="sb-tool-pen" title="Drawing Pen" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </button>

      <!-- Bright Fluorescent Highlighter -->
      <button class="icon-action-btn" id="sb-tool-highlighter" title="Bright Fluorescent Highlighter" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 11-6 6v3h3l6-6"/>
          <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
          <path d="m18 8-4-4"/>
        </svg>
      </button>

      <!-- Stroke Width Resizer Button & Popover -->
      <div style="position: relative; display: inline-flex; align-items: center;">
        <button class="icon-action-btn" id="sb-tool-size" title="Adjust Stroke Width" style="border-radius: 9999px; position: relative;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-dasharray="2 2"/>
            <circle id="sb-size-btn-dot" cx="12" cy="12" r="3.5" fill="currentColor"/>
          </svg>
        </button>

        <!-- Floating Popover for Stroke Width -->
        <div id="sb-size-popover" class="sb-size-popover" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Stroke Width</span>
            <span id="sb-size-val-disp" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 800; color: #38bdf8;">5 px</span>
          </div>

          <div class="sb-size-preview-box">
            <div id="sb-size-preview-dot" style="width: 5px; height: 5px; border-radius: 50%; background: #facc15; transition: all 0.15s ease;"></div>
          </div>

          <input type="range" id="sb-size-slider" min="1" max="40" value="5" class="custom-slider" style="margin: 4px 0; width: 100%;">

          <div class="sb-size-presets">
            <button class="sb-preset-btn" data-size="2" title="Fine (2px)">2px</button>
            <button class="sb-preset-btn active" data-size="5" title="Medium (5px)">5px</button>
            <button class="sb-preset-btn" data-size="10" title="Thick (10px)">10px</button>
            <button class="sb-preset-btn" data-size="20" title="Bold (20px)">20px</button>
            <button class="sb-preset-btn" data-size="32" title="Chisel (32px)">32px</button>
          </div>
        </div>
      </div>

      <!-- Color Pickers (Original 4 + 3 New Colors = 7 Vibrant Scientific Colors) -->
      <div class="sb-colors-container" style="display: flex; align-items: center; gap: 6px; padding: 0 8px; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color);">
        <button class="sb-color-btn active" data-color="#facc15" title="Fluorescent Yellow" style="background: #facc15;"></button>
        <button class="sb-color-btn" data-color="#f97316" title="Bright Orange" style="background: #f97316;"></button>
        <button class="sb-color-btn" data-color="#ef4444" title="Crimson Red" style="background: #ef4444;"></button>
        <button class="sb-color-btn" data-color="#ec4899" title="Neon Pink" style="background: #ec4899;"></button>
        <button class="sb-color-btn" data-color="#a855f7" title="Electric Purple" style="background: #a855f7;"></button>
        <button class="sb-color-btn" data-color="#38bdf8" title="Sky Cyan" style="background: #38bdf8;"></button>
        <button class="sb-color-btn" data-color="#10b981" title="Emerald Green" style="background: #10b981;"></button>
      </div>

      <!-- Eraser -->
      <button class="icon-action-btn" id="sb-tool-eraser" title="Eraser" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
      </button>

      <!-- Clear Canvas -->
      <button class="icon-action-btn" id="sb-tool-clear" title="Clear Canvas" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>

      <!-- Teacher Presentation Suite Tools -->
      <div class="sb-tools-divider"></div>

      <!-- Classroom Countdown Timer & Stopwatch -->
      <button class="icon-action-btn" id="sb-tool-timer" title="Classroom Timer & Stopwatch (Hot-key: T)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="13" r="8"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="13" x2="12" y2="9"/>
          <line x1="12" y1="13" x2="15" y2="13"/>
        </svg>
      </button>

      <!-- Screen Reveal Curtain -->
      <button class="icon-action-btn" id="sb-tool-curtain" title="Screen Reveal Curtain / Shade (Hot-key: C)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="14" x2="21" y2="14"/>
          <line x1="12" y1="9" x2="12" y2="14"/>
        </svg>
      </button>

      <!-- Spotlight Focus Mode -->
      <button class="icon-action-btn" id="sb-tool-spotlight" title="Spotlight Focus Mode (Hot-key: S)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
      </button>

      <!-- Calibrated Science Ruler (cm / inches) -->
      <button class="icon-action-btn" id="sb-tool-ruler" title="Calibrated Science Ruler (Hot-key: M)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
          <path d="m14.5 3.5 1.5 1.5"/>
          <path d="m11.5 6.5 3 3"/>
          <path d="m8.5 9.5 1.5 1.5"/>
          <path d="m5.5 12.5 3 3"/>
        </svg>
      </button>

      <!-- 180° Transparent Protractor -->
      <button class="icon-action-btn" id="sb-tool-protractor" title="180° Transparent Protractor (Hot-key: P)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18h18A9 9 0 0 0 3 18Z"/>
          <path d="M12 18v-3"/>
          <path d="m8 18 1.5-2.6"/>
          <path d="m16 18-1.5-2.6"/>
        </svg>
      </button>

      <!-- Scientific Pocket Calculator & Constants -->
      <button class="icon-action-btn" id="sb-tool-calc" title="Scientific Pocket Calculator &amp; Constants (Hot-key: K)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="16" y1="14" x2="16" y2="18"/>
          <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/>
        </svg>
      </button>

      <!-- Classroom LMS Share & Student Join QR -->
      <button class="icon-action-btn" id="sb-tool-share" title="Classroom LMS Share &amp; Student Join QR (Hot-key: Q)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M7 17h.01M17 17h.01M7 7h.01M17 7h.01"/>
        </svg>
      </button>

      <div class="sb-tools-divider"></div>

      <!-- Full Screen Presentation -->
      <button class="icon-action-btn" id="sb-tool-fullscreen" title="Full Screen Presentation (Hot-key: F)" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>

      <!-- Minimize Button -->
      <button class="icon-action-btn sb-btn-minimize" id="sb-tool-minimize" title="Minimize / Float Compact Bubble" style="border-radius: 9999px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <!-- Minimized Compact Floating Bubble -->
    <div class="sb-mini-content" id="sb-mini-content" style="display: none;" title="Smartboard Annotation Toolbar (Click to Expand, Drag to Reposition)">
      <div class="sb-mini-drag-grip" id="sb-mini-drag-grip" style="cursor: grab; display: flex; align-items: center; touch-action: none;">
        <svg width="10" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="18" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div class="sb-mini-icon-wrapper" id="sb-mini-icon-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        <span class="sb-mini-color-dot" id="sb-mini-color-dot" style="background: #facc15;"></span>
      </div>
      <span class="sb-mini-label">Draw</span>
      <button class="sb-mini-expand-btn" id="sb-mini-expand-btn" title="Expand Toolbar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(bar);

  const canvas = existingCanvas;
  // Use desynchronized 2d context for low-latency hardware-accelerated smartboard inking
  const ctx = canvas.getContext("2d", { desynchronized: true, alpha: true }) || canvas.getContext("2d");
  // Canvas is initially hidden when no ink is drawn to completely eliminate full-screen 4K GPU compositing overhead
  canvas.style.display = "none";

  let resizeTimeout;
  function resize() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 100);
  });
  resize();

  // State
  let isDrawing = false;
  let hasMoved = false;
  let hasDrawings = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = "pointer"; // 'pointer', 'pen', 'highlighter', 'eraser'
  let strokeColor = "#facc15";
  let penStrokeWidth = 5;
  let highlighterStrokeWidth = 22;

  // DOM Elements
  const toolPointer = document.getElementById("sb-tool-pointer");
  const toolPen = document.getElementById("sb-tool-pen");
  const toolHighlighter = document.getElementById("sb-tool-highlighter");
  const toolSize = document.getElementById("sb-tool-size");
  const toolEraser = document.getElementById("sb-tool-eraser");
  const sizePopover = document.getElementById("sb-size-popover");
  const sizeSlider = document.getElementById("sb-size-slider");
  const sizeValDisp = document.getElementById("sb-size-val-disp");
  const sizePreviewDot = document.getElementById("sb-size-preview-dot");
  const sizeBtnDot = document.getElementById("sb-size-btn-dot");
  const presetBtns = document.querySelectorAll(".sb-preset-btn");

  const fullContent = document.getElementById("sb-full-content");
  const miniContent = document.getElementById("sb-mini-content");
  const toolMinimize = document.getElementById("sb-tool-minimize");
  const miniExpandBtn = document.getElementById("sb-mini-expand-btn");
  const miniIconWrapper = document.getElementById("sb-mini-icon-wrapper");
  const miniColorDot = document.getElementById("sb-mini-color-dot");
  const miniLabel = bar.querySelector(".sb-mini-label");

  // Floating Position & Minimize State
  let isMinimized = false;
  let isDragging = false;
  let hasMovedFar = false;
  let wasRecentlyDragged = false;
  let activePointerId = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startBarLeft = 0;
  let startBarTop = 0;

  function getActiveStrokeWidth() {
    return currentTool === "highlighter" ? highlighterStrokeWidth : penStrokeWidth;
  }

  function syncSizeUI() {
    const width = getActiveStrokeWidth();
    if (sizeSlider) sizeSlider.value = width;
    if (sizeValDisp) sizeValDisp.textContent = `${width} px`;

    if (sizePreviewDot) {
      sizePreviewDot.style.width = `${Math.min(width, 36)}px`;
      sizePreviewDot.style.height = `${Math.min(width, 36)}px`;
      sizePreviewDot.style.background = strokeColor;
      if (currentTool === "highlighter") {
        sizePreviewDot.style.opacity = "0.45";
        sizePreviewDot.style.boxShadow = `0 0 12px ${strokeColor}`;
      } else {
        sizePreviewDot.style.opacity = "1";
        sizePreviewDot.style.boxShadow = `0 0 6px ${strokeColor}`;
      }
    }

    if (sizeBtnDot) {
      const radius = Math.max(2, Math.min(7, width / 4));
      sizeBtnDot.setAttribute("r", radius);
    }

    presetBtns.forEach(btn => {
      const s = parseInt(btn.dataset.size, 10);
      if (s === width) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function updateMiniBadge() {
    if (!miniIconWrapper) return;
    let iconSvg = "";
    let label = "Pen";
    let showDot = true;

    if (currentTool === "pointer") {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 7 18 3-7 8-3L3 3Z"/></svg>';
      label = "Pointer";
      showDot = false;
    } else if (currentTool === "highlighter") {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/><path d="m18 8-4-4"/></svg>';
      label = "Highlight";
      showDot = true;
    } else if (currentTool === "eraser") {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';
      label = "Eraser";
      showDot = false;
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>';
      label = "Draw";
      showDot = true;
    }

    miniIconWrapper.innerHTML = `
      ${iconSvg}
      <span class="sb-mini-color-dot" id="sb-mini-color-dot" style="background: ${strokeColor}; display: ${showDot ? "block" : "none"};"></span>
    `;
    if (miniLabel) miniLabel.textContent = label;
  }

  function setStrokeWidth(newWidth) {
    const w = Math.max(1, Math.min(40, parseInt(newWidth, 10) || 5));
    if (currentTool === "highlighter") {
      highlighterStrokeWidth = w;
    } else {
      penStrokeWidth = w;
    }
    syncSizeUI();
  }

  function toggleSizePopover() {
    const isOpen = sizePopover.style.display !== "none";
    if (isOpen) {
      sizePopover.style.display = "none";
      toolSize.classList.remove("active");
    } else {
      syncSizeUI();
      sizePopover.style.display = "flex";
      toolSize.classList.add("active");
    }
  }

  function closeSizePopover() {
    if (sizePopover) sizePopover.style.display = "none";
    if (toolSize) toolSize.classList.remove("active");
  }

  function updateMode(mode) {
    currentTool = mode;
    document.querySelectorAll("#smartboard-pen-bar .icon-action-btn").forEach(b => {
      if (b !== toolSize) b.classList.remove("active");
    });

    if (mode === "pointer") {
      toolPointer.classList.add("active");
      canvas.classList.remove("drawing-active");
      // If canvas is blank, hide it completely to free 100% of 4K GPU fill-rate during site navigation
      if (!hasDrawings) {
        canvas.style.display = "none";
      } else {
        canvas.style.display = "block";
      }
    } else {
      canvas.style.display = "block";
      canvas.classList.add("drawing-active");
      if (mode === "pen") {
        toolPen.classList.add("active");
      } else if (mode === "highlighter") {
        toolHighlighter.classList.add("active");
      } else if (mode === "eraser") {
        toolEraser.classList.add("active");
      }
    }
    syncSizeUI();
    updateMiniBadge();
  }

  // Clamping and Coordinate Application
  function clampAndApply(targetX, targetY) {
    const barWidth = bar.offsetWidth || 300;
    const barHeight = bar.offsetHeight || 50;
    const padding = 8;

    const minX = padding;
    const maxX = Math.max(padding, window.innerWidth - barWidth - padding);
    const minY = padding;
    const maxY = Math.max(padding, window.innerHeight - barHeight - padding);

    const clampedX = Math.min(Math.max(minX, targetX), maxX);
    const clampedY = Math.min(Math.max(minY, targetY), maxY);

    bar.style.left = `${clampedX}px`;
    bar.style.top = `${clampedY}px`;
    bar.style.right = "auto";
    bar.style.bottom = "auto";

    if (sizePopover) {
      if (clampedY < 230) {
        sizePopover.classList.add("popover-below");
      } else {
        sizePopover.classList.remove("popover-below");
      }
    }

    return { x: clampedX, y: clampedY };
  }

  function saveToolbarState() {
    try {
      const rect = bar.getBoundingClientRect();
      const state = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        minimized: isMinimized
      };
      localStorage.setItem("sb_toolbar_pos", JSON.stringify(state));
    } catch (e) {}
  }

  function setMinimizedState(minimized, save = true) {
    isMinimized = !!minimized;
    closeSizePopover();
    if (isMinimized) {
      if (fullContent) fullContent.style.display = "none";
      if (miniContent) miniContent.style.display = "flex";
      bar.classList.add("sb-minimized");
      updateMiniBadge();
    } else {
      if (fullContent) fullContent.style.display = "flex";
      if (miniContent) miniContent.style.display = "none";
      bar.classList.remove("sb-minimized");
    }

    requestAnimationFrame(() => {
      const rect = bar.getBoundingClientRect();
      clampAndApply(rect.left, rect.top);
      if (save) saveToolbarState();
    });
  }

  function loadToolbarState() {
    try {
      const saved = localStorage.getItem("sb_toolbar_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          clampAndApply(parsed.x, parsed.y);
        }
        if (parsed.minimized) {
          setMinimizedState(true, false);
          return;
        }
      }
    } catch (e) {}

    // Default positioning when no state saved
    requestAnimationFrame(() => {
      const rect = bar.getBoundingClientRect();
      clampAndApply(rect.left, rect.top);
    });
  }

  // Pointer drag handling for floating movement
  bar.addEventListener("pointerdown", (e) => {
    // Prevent dragging if interacting inside popover
    if (e.target.closest("#sb-size-popover")) return;

    // Check if clicking regular control buttons
    const isControl = e.target.closest("button:not(#sb-mini-content), input, .sb-color-btn, .sb-preset-btn");
    const isHandle = e.target.closest("#sb-drag-handle, #sb-mini-drag-grip");

    if (isControl && !isHandle) {
      return;
    }

    activePointerId = e.pointerId;
    try {
      bar.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = bar.getBoundingClientRect();
    startBarLeft = rect.left;
    startBarTop = rect.top;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    hasMovedFar = false;
    isDragging = true;
  });

  bar.addEventListener("pointermove", (e) => {
    if (!isDragging || e.pointerId !== activePointerId) return;

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;

    if (!hasMovedFar && Math.hypot(dx, dy) > 4) {
      hasMovedFar = true;
      bar.classList.add("is-dragging");
      closeSizePopover();
    }

    if (hasMovedFar) {
      clampAndApply(startBarLeft + dx, startBarTop + dy);
    }
  });

  function endPointerDrag(e) {
    if (!isDragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;

    if (activePointerId !== null) {
      try {
        bar.releasePointerCapture(activePointerId);
      } catch (err) {}
      activePointerId = null;
    }

    const dragged = hasMovedFar;
    isDragging = false;
    hasMovedFar = false;
    bar.classList.remove("is-dragging");

    if (dragged) {
      wasRecentlyDragged = true;
      setTimeout(() => { wasRecentlyDragged = false; }, 100);
      saveToolbarState();
    }
  }

  bar.addEventListener("pointerup", endPointerDrag);
  bar.addEventListener("pointercancel", endPointerDrag);

  // Minimize / Expand button interactions
  if (toolMinimize) {
    toolMinimize.addEventListener("click", (e) => {
      e.stopPropagation();
      setMinimizedState(true);
    });
  }

  if (miniExpandBtn) {
    miniExpandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setMinimizedState(false);
    });
  }

  if (miniContent) {
    miniContent.addEventListener("click", () => {
      if (wasRecentlyDragged) return;
      setMinimizedState(false);
    });
  }

  // Tool Selectors
  toolPointer.addEventListener("click", () => {
    closeSizePopover();
    updateMode("pointer");
  });

  toolPen.addEventListener("click", () => {
    closeSizePopover();
    updateMode("pen");
  });

  toolHighlighter.addEventListener("click", () => {
    closeSizePopover();
    updateMode("highlighter");
  });

  toolEraser.addEventListener("click", () => {
    closeSizePopover();
    updateMode("eraser");
  });

  toolSize.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSizePopover();
  });

  // Size Slider & Presets
  sizeSlider.addEventListener("input", (e) => {
    setStrokeWidth(e.target.value);
  });

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setStrokeWidth(btn.dataset.size);
    });
  });

  // Color Buttons
  document.querySelectorAll(".sb-color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sb-color-btn").forEach(b => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      strokeColor = btn.dataset.color;

      if (currentTool === "pointer" || currentTool === "eraser") {
        updateMode("pen");
      } else {
        syncSizeUI();
        updateMiniBadge();
      }
    });
  });

  // Clear Canvas
  document.getElementById("sb-tool-clear").addEventListener("click", () => {
    closeSizePopover();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawings = false;
    if (currentTool === "pointer") {
      canvas.style.display = "none";
    }
  });

  // Fullscreen Presentation
  document.getElementById("sb-tool-fullscreen").addEventListener("click", () => {
    closeSizePopover();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Close popover when clicking outside
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("#sb-tool-size") && !e.target.closest("#sb-size-popover")) {
      closeSizePopover();
    }
  });

  // Drawing Engine with Sub-Millisecond Latency
  function getPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function startDraw(e) {
    if (currentTool === "pointer") return;
    closeSizePopover();
    isDrawing = true;
    hasMoved = false;
    hasDrawings = true;
    canvas.style.display = "block";
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function moveDraw(e) {
    if (!isDrawing || currentTool === "pointer") return;
    hasMoved = true;
    hasDrawings = true;
    const pos = getPos(e);
    const x = pos.x;
    const y = pos.y;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = Math.max(penStrokeWidth * 4, 32);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = highlighterStrokeWidth;
      // High-performance direct stroke without expensive Gaussian shadowBlur
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Pen
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = penStrokeWidth;
      // High-performance direct stroke without expensive Gaussian shadowBlur
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.restore();
    lastX = x;
    lastY = y;
  }

  function stopDraw() {
    if (isDrawing && !hasMoved) {
      ctx.save();
      if (currentTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(lastX, lastY, Math.max(penStrokeWidth * 2, 16), 0, Math.PI * 2);
        ctx.fill();
      } else if (currentTool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.38;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(lastX, lastY, highlighterStrokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentTool === "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(lastX, lastY, penStrokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    isDrawing = false;
  }

  // Pointer Events provide zero-latency coalesced touch coordinates on Smartboards
  if (window.PointerEvent) {
    canvas.addEventListener("pointerdown", (e) => {
      if (currentTool !== "pointer") {
        e.preventDefault();
        startDraw(e);
      }
    }, { passive: false });

    canvas.addEventListener("pointermove", (e) => {
      if (currentTool !== "pointer" && isDrawing) {
        e.preventDefault();
        if (e.getCoalescedEvents) {
          const events = e.getCoalescedEvents();
          for (let i = 0; i < events.length; i++) {
            moveDraw(events[i]);
          }
        } else {
          moveDraw(e);
        }
      }
    }, { passive: false });

    window.addEventListener("pointerup", stopDraw);
    window.addEventListener("pointercancel", stopDraw);
  } else {
    // Fallback for older browsers
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    window.addEventListener("mouseup", stopDraw);

    canvas.addEventListener("touchstart", (e) => {
      if (currentTool !== "pointer") e.preventDefault();
      startDraw(e);
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      if (currentTool !== "pointer") e.preventDefault();
      moveDraw(e);
    }, { passive: false });

    window.addEventListener("touchend", stopDraw);
  }

  // =========================================================================
  // Teacher Presentation Suite: Classroom Timer, Curtain, Spotlight & Shortcuts
  // =========================================================================

  const toolTimer = document.getElementById("sb-tool-timer");
  const toolCurtain = document.getElementById("sb-tool-curtain");
  const toolSpotlight = document.getElementById("sb-tool-spotlight");
  const toolRuler = document.getElementById("sb-tool-ruler");
  const toolProtractor = document.getElementById("sb-tool-protractor");

  // -------------------------------------------------------------------------
  // 1. Classroom Countdown Timer & Stopwatch Widget
  // -------------------------------------------------------------------------
  let timerWidget = document.getElementById("sb-timer-widget");
  if (timerWidget) timerWidget.remove();

  timerWidget = document.createElement("div");
  timerWidget.id = "sb-timer-widget";
  timerWidget.className = "sb-timer-widget";
  timerWidget.style.display = "none";
  timerWidget.innerHTML = `
    <div class="sb-timer-header" id="sb-timer-drag-handle" title="Drag to Reposition Timer">
      <div class="sb-timer-title-box">
        <span style="font-size: 1.15rem;">⏱️</span>
        <span>Classroom Timer</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="sb-timer-mute-btn" class="sb-timer-btn-icon" title="Toggle Sound Chimes">
          ${SoundFX.isMuted() ? '🔇' : '🔔'}
        </button>
        <button id="sb-timer-close-btn" class="sb-timer-btn-icon" title="Close Timer (Esc)">✕</button>
      </div>
    </div>

    <!-- Segmented Tabs -->
    <div class="sb-timer-tabs">
      <button id="sb-timer-tab-countdown" class="sb-timer-tab active">Countdown</button>
      <button id="sb-timer-tab-stopwatch" class="sb-timer-tab">Stopwatch</button>
    </div>

    <!-- Countdown Panel -->
    <div id="sb-timer-countdown-view" class="sb-timer-view" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="sb-timer-display-box" id="sb-timer-display-box">
        <div class="sb-timer-display" id="sb-countdown-disp">03:00</div>
        <div class="sb-timer-sub-label" id="sb-countdown-sub-label">Ready • 3 Minutes</div>
      </div>

      <!-- Quick Presets -->
      <div class="sb-timer-presets">
        <button class="sb-timer-preset" data-sec="30">30s</button>
        <button class="sb-timer-preset" data-sec="60">1m</button>
        <button class="sb-timer-preset" data-sec="120">2m</button>
        <button class="sb-timer-preset active" data-sec="180">3m</button>
        <button class="sb-timer-preset" data-sec="300">5m</button>
        <button class="sb-timer-preset" data-sec="600">10m</button>
      </div>

      <!-- Quick Adjustments -->
      <div class="sb-timer-adjust-row">
        <button class="sb-timer-adj-btn" id="sb-timer-sub-30">-30s</button>
        <button class="sb-timer-adj-btn" id="sb-timer-add-30">+30s</button>
        <button class="sb-timer-adj-btn" id="sb-timer-add-60">+1m</button>
      </div>

      <!-- Controls -->
      <div class="sb-timer-ctrls">
        <button id="sb-timer-start-btn" class="sb-timer-main-btn btn-start">
          <span>▶ Start</span>
        </button>
        <button id="sb-timer-reset-btn" class="sb-timer-sec-btn">
          <span>↺ Reset</span>
        </button>
      </div>
    </div>

    <!-- Stopwatch Panel -->
    <div id="sb-timer-stopwatch-view" class="sb-timer-view" style="display: none; flex-direction: column; gap: 10px;">
      <div class="sb-timer-display-box">
        <div class="sb-timer-display" id="sb-stopwatch-disp" style="font-size: 2.3rem;">00:00.00</div>
        <div class="sb-timer-sub-label">Chronometer Metrology</div>
      </div>

      <div class="sb-timer-ctrls">
        <button id="sb-stopwatch-start-btn" class="sb-timer-main-btn btn-start">
          <span>▶ Start</span>
        </button>
        <button id="sb-stopwatch-lap-btn" class="sb-timer-sec-btn" disabled>
          <span>🚩 Split</span>
        </button>
        <button id="sb-stopwatch-reset-btn" class="sb-timer-sec-btn">
          <span>↺ Reset</span>
        </button>
      </div>

      <div id="sb-stopwatch-laps" class="sb-stopwatch-laps" style="display: none;"></div>
    </div>
  `;
  document.body.appendChild(timerWidget);

  // Timer Dragging Logic
  let timerDragging = false;
  let timerStartX = 0;
  let timerStartY = 0;
  let timerStartLeft = 0;
  let timerStartTop = 0;
  let timerActivePointerId = null;

  const timerDragHandle = document.getElementById("sb-timer-drag-handle");
  if (timerDragHandle) {
    timerDragHandle.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      timerActivePointerId = e.pointerId;
      try { timerDragHandle.setPointerCapture(e.pointerId); } catch (err) {}
      const rect = timerWidget.getBoundingClientRect();
      timerStartLeft = rect.left;
      timerStartTop = rect.top;
      timerStartX = e.clientX;
      timerStartY = e.clientY;
      timerDragging = true;
      timerWidget.classList.add("is-dragging");
    });

    timerDragHandle.addEventListener("pointermove", (e) => {
      if (!timerDragging || e.pointerId !== timerActivePointerId) return;
      const dx = e.clientX - timerStartX;
      const dy = e.clientY - timerStartY;
      const minX = 10;
      const maxX = Math.max(10, window.innerWidth - timerWidget.offsetWidth - 10);
      const minY = 10;
      const maxY = Math.max(10, window.innerHeight - timerWidget.offsetHeight - 10);
      const nx = Math.min(Math.max(minX, timerStartLeft + dx), maxX);
      const ny = Math.min(Math.max(minY, timerStartTop + dy), maxY);
      timerWidget.style.left = `${nx}px`;
      timerWidget.style.top = `${ny}px`;
      timerWidget.style.right = "auto";
      timerWidget.style.bottom = "auto";
    });

    const endTimerDrag = (e) => {
      if (!timerDragging || (timerActivePointerId !== null && e.pointerId !== timerActivePointerId)) return;
      if (timerActivePointerId !== null) {
        try { timerDragHandle.releasePointerCapture(timerActivePointerId); } catch (err) {}
        timerActivePointerId = null;
      }
      timerDragging = false;
      timerWidget.classList.remove("is-dragging");
      try {
        const rect = timerWidget.getBoundingClientRect();
        localStorage.setItem("sb_timer_pos", JSON.stringify({ x: Math.round(rect.left), y: Math.round(rect.top) }));
      } catch (err) {}
    };
    timerDragHandle.addEventListener("pointerup", endTimerDrag);
    timerDragHandle.addEventListener("pointercancel", endTimerDrag);
  }

  function loadTimerPos() {
    try {
      const saved = localStorage.getItem("sb_timer_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const minX = 10;
          const maxX = Math.max(10, window.innerWidth - 340);
          const minY = 10;
          const maxY = Math.max(10, window.innerHeight - 300);
          const nx = Math.min(Math.max(minX, parsed.x), maxX);
          const ny = Math.min(Math.max(minY, parsed.y), maxY);
          timerWidget.style.left = `${nx}px`;
          timerWidget.style.top = `${ny}px`;
          timerWidget.style.right = "auto";
          timerWidget.style.bottom = "auto";
          return;
        }
      }
    } catch (e) {}
    // Default top right position
    timerWidget.style.top = "80px";
    timerWidget.style.right = "28px";
    timerWidget.style.left = "auto";
    timerWidget.style.bottom = "auto";
  }
  loadTimerPos();

  // Countdown State & Helpers
  let countdownDuration = 180;
  let countdownRemaining = 180;
  let countdownRunning = false;
  let countdownInterval = null;

  function fmtSec(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateCountdownUI() {
    const disp = document.getElementById("sb-countdown-disp");
    const sub = document.getElementById("sb-countdown-sub-label");
    if (disp) disp.textContent = fmtSec(countdownRemaining);
    if (sub) {
      if (countdownRemaining === 0) {
        sub.textContent = "Time Expired!";
      } else if (countdownRunning) {
        sub.textContent = "Session Active";
      } else {
        sub.textContent = `Set for ${fmtSec(countdownDuration)}`;
      }
    }
  }

  function toggleCountdown() {
    SoundFX.playClick();
    const btn = document.getElementById("sb-timer-start-btn");
    if (countdownRunning) {
      // Pause
      clearInterval(countdownInterval);
      countdownRunning = false;
      if (btn) {
        btn.innerHTML = "<span>▶ Resume</span>";
        btn.className = "sb-timer-main-btn btn-start";
      }
      updateCountdownUI();
    } else {
      // Start
      if (countdownRemaining <= 0) {
        countdownRemaining = countdownDuration;
        timerWidget.classList.remove("sb-timer-alarm");
      }
      countdownRunning = true;
      if (btn) {
        btn.innerHTML = "<span>⏸ Pause</span>";
        btn.className = "sb-timer-main-btn btn-pause";
      }
      updateCountdownUI();

      countdownInterval = setInterval(() => {
        if (countdownRemaining > 0) {
          countdownRemaining--;
          if (countdownRemaining <= 3 && countdownRemaining > 0) {
            SoundFX.playCountdownBeep(false);
          }
          if (countdownRemaining === 0) {
            clearInterval(countdownInterval);
            countdownRunning = false;
            timerWidget.classList.add("sb-timer-alarm");
            SoundFX.playChime();
            if (btn) {
              btn.innerHTML = "<span>↺ Restart</span>";
              btn.className = "sb-timer-main-btn btn-start";
            }
          }
          updateCountdownUI();
        }
      }, 1000);
    }
  }

  function resetCountdown() {
    SoundFX.playClick();
    clearInterval(countdownInterval);
    countdownRunning = false;
    countdownRemaining = countdownDuration;
    timerWidget.classList.remove("sb-timer-alarm");
    const btn = document.getElementById("sb-timer-start-btn");
    if (btn) {
      btn.innerHTML = "<span>▶ Start</span>";
      btn.className = "sb-timer-main-btn btn-start";
    }
    updateCountdownUI();
  }

  // Stopwatch State & Helpers
  let stopwatchRunning = false;
  let stopwatchStartTime = 0;
  let stopwatchElapsed = 0;
  let stopwatchAnimId = null;
  let stopwatchLaps = [];

  function fmtMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const c = Math.floor((ms % 1000) / 10);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${c < 10 ? '0' : ''}${c}`;
  }

  function tickStopwatch() {
    if (!stopwatchRunning) return;
    const now = performance.now();
    stopwatchElapsed = now - stopwatchStartTime;
    const disp = document.getElementById("sb-stopwatch-disp");
    if (disp) disp.textContent = fmtMs(stopwatchElapsed);
    stopwatchAnimId = requestAnimationFrame(tickStopwatch);
  }

  function toggleStopwatch() {
    SoundFX.playClick();
    const btn = document.getElementById("sb-stopwatch-start-btn");
    const lapBtn = document.getElementById("sb-stopwatch-lap-btn");
    if (stopwatchRunning) {
      stopwatchRunning = false;
      cancelAnimationFrame(stopwatchAnimId);
      if (btn) {
        btn.innerHTML = "<span>▶ Resume</span>";
        btn.className = "sb-timer-main-btn btn-start";
      }
      if (lapBtn) lapBtn.disabled = true;
    } else {
      stopwatchStartTime = performance.now() - stopwatchElapsed;
      stopwatchRunning = true;
      if (btn) {
        btn.innerHTML = "<span>⏸ Pause</span>";
        btn.className = "sb-timer-main-btn btn-pause";
      }
      if (lapBtn) lapBtn.disabled = false;
      stopwatchAnimId = requestAnimationFrame(tickStopwatch);
    }
  }

  function recordLap() {
    if (!stopwatchRunning) return;
    SoundFX.playClick();
    stopwatchLaps.unshift({ num: stopwatchLaps.length + 1, time: stopwatchElapsed });
    renderLaps();
  }

  function renderLaps() {
    const container = document.getElementById("sb-stopwatch-laps");
    if (!container) return;
    if (stopwatchLaps.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";
    container.innerHTML = stopwatchLaps.map(lap => `
      <div class="sb-lap-row">
        <span style="color: #38bdf8; font-weight: 700;">Split ${lap.num}</span>
        <span style="color: #f1f5f9; font-weight: 600;">${fmtMs(lap.time)}</span>
      </div>
    `).join("");
  }

  function resetStopwatch() {
    SoundFX.playClick();
    stopwatchRunning = false;
    cancelAnimationFrame(stopwatchAnimId);
    stopwatchElapsed = 0;
    stopwatchLaps = [];
    const disp = document.getElementById("sb-stopwatch-disp");
    if (disp) disp.textContent = "00:00.00";
    const btn = document.getElementById("sb-stopwatch-start-btn");
    if (btn) {
      btn.innerHTML = "<span>▶ Start</span>";
      btn.className = "sb-timer-main-btn btn-start";
    }
    const lapBtn = document.getElementById("sb-stopwatch-lap-btn");
    if (lapBtn) lapBtn.disabled = true;
    renderLaps();
  }

  // Timer Widget Interactions
  function toggleTimer(forceState) {
    SoundFX.playClick();
    const isOpen = forceState !== undefined ? forceState : (timerWidget.style.display !== "none");
    if (!isOpen) {
      timerWidget.style.display = "flex";
      if (toolTimer) toolTimer.classList.add("active");
      loadTimerPos();
    } else {
      timerWidget.style.display = "none";
      if (toolTimer) toolTimer.classList.remove("active");
    }
  }

  if (toolTimer) {
    toolTimer.addEventListener("click", () => {
      closeSizePopover();
      toggleTimer();
    });
  }

  document.getElementById("sb-timer-close-btn")?.addEventListener("click", () => toggleTimer(false));

  const muteBtn = document.getElementById("sb-timer-mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      const isMuted = SoundFX.toggleMute();
      muteBtn.textContent = isMuted ? "🔇" : "🔔";
    });
  }

  // Segmented Tabs Switcher
  const tabCountdown = document.getElementById("sb-timer-tab-countdown");
  const tabStopwatch = document.getElementById("sb-timer-tab-stopwatch");
  const viewCountdown = document.getElementById("sb-timer-countdown-view");
  const viewStopwatch = document.getElementById("sb-timer-stopwatch-view");

  if (tabCountdown && tabStopwatch) {
    tabCountdown.addEventListener("click", () => {
      SoundFX.playClick();
      tabCountdown.classList.add("active");
      tabStopwatch.classList.remove("active");
      if (viewCountdown) viewCountdown.style.display = "flex";
      if (viewStopwatch) viewStopwatch.style.display = "none";
    });
    tabStopwatch.addEventListener("click", () => {
      SoundFX.playClick();
      tabStopwatch.classList.add("active");
      tabCountdown.classList.remove("active");
      if (viewCountdown) viewCountdown.style.display = "none";
      if (viewStopwatch) viewStopwatch.style.display = "flex";
    });
  }

  // Countdown Presets & Adjusters
  document.querySelectorAll(".sb-timer-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      SoundFX.playClick();
      document.querySelectorAll(".sb-timer-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const sec = parseInt(btn.dataset.sec, 10);
      countdownDuration = sec;
      resetCountdown();
    });
  });

  document.getElementById("sb-timer-sub-30")?.addEventListener("click", () => {
    SoundFX.playClick();
    countdownRemaining = Math.max(5, countdownRemaining - 30);
    updateCountdownUI();
  });
  document.getElementById("sb-timer-add-30")?.addEventListener("click", () => {
    SoundFX.playClick();
    countdownRemaining += 30;
    updateCountdownUI();
  });
  document.getElementById("sb-timer-add-60")?.addEventListener("click", () => {
    SoundFX.playClick();
    countdownRemaining += 60;
    updateCountdownUI();
  });

  document.getElementById("sb-timer-start-btn")?.addEventListener("click", toggleCountdown);
  document.getElementById("sb-timer-reset-btn")?.addEventListener("click", resetCountdown);

  document.getElementById("sb-stopwatch-start-btn")?.addEventListener("click", toggleStopwatch);
  document.getElementById("sb-stopwatch-lap-btn")?.addEventListener("click", recordLap);
  document.getElementById("sb-stopwatch-reset-btn")?.addEventListener("click", resetStopwatch);

  // -------------------------------------------------------------------------
  // 2. Screen Reveal Curtain (Window Blind / Shade Tool)
  // -------------------------------------------------------------------------
  let curtainOverlay = document.getElementById("sb-curtain-overlay");
  if (curtainOverlay) curtainOverlay.remove();

  curtainOverlay = document.createElement("div");
  curtainOverlay.id = "sb-curtain-overlay";
  curtainOverlay.className = "sb-curtain-overlay";
  curtainOverlay.style.display = "none";
  curtainOverlay.innerHTML = `
    <div id="sb-curtain-shade" class="sb-curtain-shade">
      <div id="sb-curtain-handle" class="sb-curtain-handle sb-curtain-handle-horizontal" title="Drag to Reveal Screen">
        <div class="sb-curtain-info">
          <span>🪟 Reveal Curtain</span>
          <span id="sb-curtain-pct-disp" class="sb-curtain-pct-badge">50%</span>
        </div>
        <div class="sb-curtain-grip-ridges">
          <div class="sb-curtain-ridge"></div>
          <div class="sb-curtain-ridge"></div>
          <div class="sb-curtain-ridge"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="sb-curtain-dir-btn" class="sb-curtain-btn" title="Cycle Reveal Direction">
            ↕ <span id="sb-curtain-dir-label">Top</span>
          </button>
          <button id="sb-curtain-opac-btn" class="sb-curtain-btn" title="Cycle Shade Opacity">
            👁 <span id="sb-curtain-opac-label">100%</span>
          </button>
          <button id="sb-curtain-close-btn" class="sb-curtain-btn sb-curtain-close-btn" title="Close Curtain (Esc)">
            ✕
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(curtainOverlay);

  let curtainDirection = "top"; // 'top', 'bottom', 'left', 'right'
  let curtainPct = 50;
  let curtainOpacityIdx = 0;
  const curtainOpacities = [
    { label: "100%", val: 1.0 },
    { label: "85%", val: 0.85 },
    { label: "50%", val: 0.50 }
  ];

  function applyCurtainLayout() {
    const shade = document.getElementById("sb-curtain-shade");
    const handle = document.getElementById("sb-curtain-handle");
    const pctDisp = document.getElementById("sb-curtain-pct-disp");
    const dirLabel = document.getElementById("sb-curtain-dir-label");
    const opacLabel = document.getElementById("sb-curtain-opac-label");
    if (!shade || !handle) return;

    shade.style.opacity = String(curtainOpacities[curtainOpacityIdx].val);
    if (opacLabel) opacLabel.textContent = curtainOpacities[curtainOpacityIdx].label;
    if (pctDisp) pctDisp.textContent = `${curtainPct}%`;
    if (dirLabel) dirLabel.textContent = curtainDirection.toUpperCase();

    // Reset styles
    shade.style.top = "";
    shade.style.bottom = "";
    shade.style.left = "";
    shade.style.right = "";
    shade.style.width = "";
    shade.style.height = "";

    handle.style.top = "";
    handle.style.bottom = "";
    handle.style.left = "";
    handle.style.right = "";
    handle.style.width = "";
    handle.style.height = "";
    handle.classList.remove("sb-curtain-handle-horizontal", "sb-curtain-handle-vertical");

    if (curtainDirection === "top") {
      handle.classList.add("sb-curtain-handle-horizontal");
      shade.style.top = "0";
      shade.style.left = "0";
      shade.style.right = "0";
      shade.style.height = `${curtainPct}%`;
      handle.style.bottom = "0";
      handle.style.left = "0";
      handle.style.right = "0";
      handle.style.cursor = "ns-resize";
    } else if (curtainDirection === "bottom") {
      handle.classList.add("sb-curtain-handle-horizontal");
      shade.style.bottom = "0";
      shade.style.left = "0";
      shade.style.right = "0";
      shade.style.height = `${curtainPct}%`;
      handle.style.top = "0";
      handle.style.left = "0";
      handle.style.right = "0";
      handle.style.cursor = "ns-resize";
    } else if (curtainDirection === "left") {
      handle.classList.add("sb-curtain-handle-vertical");
      shade.style.top = "0";
      shade.style.bottom = "0";
      shade.style.left = "0";
      shade.style.width = `${curtainPct}%`;
      handle.style.top = "0";
      handle.style.bottom = "0";
      handle.style.right = "0";
      handle.style.cursor = "ew-resize";
    } else if (curtainDirection === "right") {
      handle.classList.add("sb-curtain-handle-vertical");
      shade.style.top = "0";
      shade.style.bottom = "0";
      shade.style.right = "0";
      shade.style.width = `${curtainPct}%`;
      handle.style.top = "0";
      handle.style.bottom = "0";
      handle.style.left = "0";
      handle.style.cursor = "ew-resize";
    }
  }

  function toggleCurtain(forceState) {
    SoundFX.playClick();
    const shouldOpen = forceState !== undefined ? forceState : (curtainOverlay.style.display === "none");
    if (shouldOpen) {
      curtainOverlay.style.display = "block";
      if (toolCurtain) toolCurtain.classList.add("active");
      applyCurtainLayout();
    } else {
      curtainOverlay.style.display = "none";
      if (toolCurtain) toolCurtain.classList.remove("active");
    }
  }

  if (toolCurtain) {
    toolCurtain.addEventListener("click", () => {
      closeSizePopover();
      toggleCurtain();
    });
  }

  document.getElementById("sb-curtain-close-btn")?.addEventListener("click", () => toggleCurtain(false));

  document.getElementById("sb-curtain-dir-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    SoundFX.playClick();
    const dirs = ["top", "bottom", "left", "right"];
    curtainDirection = dirs[(dirs.indexOf(curtainDirection) + 1) % dirs.length];
    applyCurtainLayout();
  });

  document.getElementById("sb-curtain-opac-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    SoundFX.playClick();
    curtainOpacityIdx = (curtainOpacityIdx + 1) % curtainOpacities.length;
    applyCurtainLayout();
  });

  // Handle Dragging Curtain
  const curtainHandle = document.getElementById("sb-curtain-handle");
  let curtainDragging = false;
  let curtainPointerId = null;

  if (curtainHandle) {
    curtainHandle.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      curtainPointerId = e.pointerId;
      try { curtainHandle.setPointerCapture(e.pointerId); } catch (err) {}
      curtainDragging = true;
      curtainHandle.classList.add("is-dragging");
    });

    window.addEventListener("pointermove", (e) => {
      if (!curtainDragging || e.pointerId !== curtainPointerId) return;
      let newPct = 50;
      if (curtainDirection === "top") {
        newPct = Math.round((e.clientY / window.innerHeight) * 100);
      } else if (curtainDirection === "bottom") {
        newPct = Math.round(((window.innerHeight - e.clientY) / window.innerHeight) * 100);
      } else if (curtainDirection === "left") {
        newPct = Math.round((e.clientX / window.innerWidth) * 100);
      } else if (curtainDirection === "right") {
        newPct = Math.round(((window.innerWidth - e.clientX) / window.innerWidth) * 100);
      }
      curtainPct = Math.min(Math.max(5, newPct), 96);
      applyCurtainLayout();
    });

    const endCurtainDrag = (e) => {
      if (!curtainDragging || (curtainPointerId !== null && e.pointerId !== curtainPointerId)) return;
      if (curtainPointerId !== null) {
        try { curtainHandle.releasePointerCapture(curtainPointerId); } catch (err) {}
        curtainPointerId = null;
      }
      curtainDragging = false;
      curtainHandle.classList.remove("is-dragging");
    };
    window.addEventListener("pointerup", endCurtainDrag);
    window.addEventListener("pointercancel", endCurtainDrag);
  }

  // -------------------------------------------------------------------------
  // 3. Spotlight Focus Mode
  // -------------------------------------------------------------------------
  let spotlightOverlay = document.getElementById("sb-spotlight-overlay");
  if (spotlightOverlay) spotlightOverlay.remove();

  spotlightOverlay = document.createElement("div");
  spotlightOverlay.id = "sb-spotlight-overlay";
  spotlightOverlay.className = "sb-spotlight-overlay";
  spotlightOverlay.style.display = "none";
  spotlightOverlay.innerHTML = `
    <canvas id="sb-spotlight-canvas" class="sb-spotlight-canvas"></canvas>
    <div id="sb-spotlight-hud" class="sb-spotlight-hud">
      <span class="sb-spotlight-title">🔦 Spotlight Mode</span>
      <div class="sb-spotlight-presets">
        <button class="sb-spotlight-preset" data-r="120">Small</button>
        <button class="sb-spotlight-preset active" data-r="200">Medium</button>
        <button class="sb-spotlight-preset" data-r="320">Large</button>
      </div>
      <button id="sb-spotlight-exit-btn" class="sb-spotlight-exit-btn" title="Exit Spotlight (Esc)">✕ Exit</button>
    </div>
  `;
  document.body.appendChild(spotlightOverlay);

  const spotCanvas = document.getElementById("sb-spotlight-canvas");
  const spotCtx = spotCanvas.getContext("2d");
  let spotRadius = 200;
  let spotDarkness = 0.78;
  let spotX = window.innerWidth / 2;
  let spotY = window.innerHeight / 2;
  let spotActive = false;

  function renderSpotlight() {
    if (!spotActive) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (spotCanvas.width !== w || spotCanvas.height !== h) {
      spotCanvas.width = w;
      spotCanvas.height = h;
    }

    spotCtx.clearRect(0, 0, w, h);

    // Dark veil
    spotCtx.save();
    spotCtx.fillStyle = `rgba(4, 7, 18, ${spotDarkness})`;
    spotCtx.fillRect(0, 0, w, h);

    // Cutout circle with feathered edge
    spotCtx.globalCompositeOperation = "destination-out";
    const innerR = Math.max(1, spotRadius * 0.88);
    const grad = spotCtx.createRadialGradient(spotX, spotY, innerR, spotX, spotY, spotRadius);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    spotCtx.fillStyle = grad;
    spotCtx.beginPath();
    spotCtx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
    spotCtx.fill();
    spotCtx.restore();

    // Luminous halo border
    spotCtx.save();
    spotCtx.beginPath();
    spotCtx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
    spotCtx.strokeStyle = "#38bdf8";
    spotCtx.lineWidth = 3;
    spotCtx.stroke();
    spotCtx.restore();
  }

  function toggleSpotlight(forceState) {
    SoundFX.playClick();
    const shouldOpen = forceState !== undefined ? forceState : (spotlightOverlay.style.display === "none");
    if (shouldOpen) {
      spotActive = true;
      spotX = window.innerWidth / 2;
      spotY = window.innerHeight / 2;
      spotlightOverlay.style.display = "block";
      if (toolSpotlight) toolSpotlight.classList.add("active");
      renderSpotlight();
    } else {
      spotActive = false;
      spotlightOverlay.style.display = "none";
      if (toolSpotlight) toolSpotlight.classList.remove("active");
    }
  }

  if (toolSpotlight) {
    toolSpotlight.addEventListener("click", () => {
      closeSizePopover();
      toggleSpotlight();
    });
  }

  document.getElementById("sb-spotlight-exit-btn")?.addEventListener("click", () => toggleSpotlight(false));

  document.querySelectorAll(".sb-spotlight-preset").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      SoundFX.playClick();
      document.querySelectorAll(".sb-spotlight-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      spotRadius = parseInt(btn.dataset.r, 10);
      renderSpotlight();
    });
  });

  spotlightOverlay.addEventListener("pointermove", (e) => {
    if (!spotActive || e.target.closest("#sb-spotlight-hud")) return;
    spotX = e.clientX;
    spotY = e.clientY;
    renderSpotlight();
  });
  spotlightOverlay.addEventListener("pointerdown", (e) => {
    if (!spotActive || e.target.closest("#sb-spotlight-hud")) return;
    spotX = e.clientX;
    spotY = e.clientY;
    renderSpotlight();
  });

  window.addEventListener("resize", () => {
    if (spotActive) renderSpotlight();
  });

  // -------------------------------------------------------------------------
  // 3b. Interactive Calibrated Science Ruler (cm / inches)
  // -------------------------------------------------------------------------
  let smartboardTopZ = 200000;
  function elevateSmartboardTool(widget) {
    if (!widget) return;
    smartboardTopZ += 2;
    widget.style.zIndex = String(smartboardTopZ);
  }

  let rulerWidget = document.getElementById("sb-ruler-widget");
  if (rulerWidget) rulerWidget.remove();

  rulerWidget = document.createElement("div");
  rulerWidget.id = "sb-ruler-widget";
  rulerWidget.className = "sb-ruler-widget";
  rulerWidget.style.display = "none";
  rulerWidget.style.position = "fixed";
  rulerWidget.style.left = "140px";
  rulerWidget.style.top = "180px";
  rulerWidget.style.width = "540px";
  rulerWidget.style.height = "86px";
  rulerWidget.style.zIndex = "200000";
  rulerWidget.style.transformOrigin = "270px 43px";
  rulerWidget.style.touchAction = "none";
  rulerWidget.style.userSelect = "none";

  let metricTicksSvg = "";
  for (let mm = 0; mm <= 250; mm++) {
    const x = 20 + mm * 2;
    let tickH = 6;
    if (mm % 10 === 0) {
      tickH = 14;
      const cm = mm / 10;
      metricTicksSvg += `<text x="${x}" y="24" fill="#38bdf8" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">${cm}</text>`;
    } else if (mm % 5 === 0) {
      tickH = 10;
    }
    metricTicksSvg += `<line x1="${x}" y1="0" x2="${x}" y2="${tickH}" stroke="#38bdf8" stroke-width="${mm % 10 === 0 ? '1.5' : '1'}"/>`;
  }

  let imperialTicksSvg = "";
  for (let sixteenth = 0; sixteenth <= 160; sixteenth++) {
    const x = 20 + sixteenth * 3.125;
    if (x > 520) break;
    let tickH = 6;
    if (sixteenth % 16 === 0) {
      tickH = 14;
      const inch = sixteenth / 16;
      imperialTicksSvg += `<text x="${x}" y="70" fill="#facc15" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">${inch}</text>`;
    } else if (sixteenth % 8 === 0) {
      tickH = 10;
    }
    imperialTicksSvg += `<line x1="${x}" y1="86" x2="${x}" y2="${86 - tickH}" stroke="#facc15" stroke-width="${sixteenth % 16 === 0 ? '1.5' : '1'}"/>`;
  }

  rulerWidget.innerHTML = `
    <div class="sb-ruler-body" id="sb-ruler-body" style="width: 100%; height: 100%; position: relative; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(14px); border: 1.5px solid rgba(56, 189, 248, 0.5); border-radius: 6px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); overflow: hidden; cursor: grab;">
      <svg width="540" height="86" viewBox="0 0 540 86" style="position: absolute; top: 0; left: 0; pointer-events: none;">
        ${metricTicksSvg}
        ${imperialTicksSvg}
        <line x1="20" y1="43" x2="520" y2="43" stroke="#475569" stroke-width="1" stroke-dasharray="4 2"/>
        <text x="270" y="47" fill="#94a3b8" font-size="9.5" font-weight="700" font-family="sans-serif" text-anchor="middle" letter-spacing="2">METRIC (cm) / IMPERIAL (in)</text>
      </svg>

      <div style="position: absolute; left: 24px; top: 32px; display: flex; align-items: center; gap: 8px; z-index: 10;">
        <span id="sb-ruler-angle-disp" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; font-family: monospace; font-size: 0.78rem; font-weight: 800; padding: 2px 8px; border-radius: 4px;">0.0°</span>
        <button id="sb-ruler-reset-rot" title="Snap to Horizontal (0°)" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 0.72rem; cursor: pointer;">0°</button>
        <button id="sb-ruler-rot-90" title="Snap to Vertical (90°)" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 0.72rem; cursor: pointer;">90°</button>
      </div>

      <button id="sb-ruler-close-btn" title="Close Ruler (Esc)" style="position: absolute; right: 8px; top: 32px; z-index: 10; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; cursor: pointer;">✕</button>

      <div id="sb-ruler-rot-handle" title="Drag to Rotate Ruler (or Scroll Wheel)" style="position: absolute; right: 38px; top: 28px; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #38bdf8); border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(56,189,248,0.6); cursor: grab; display: flex; align-items: center; justify-content: center; z-index: 10; touch-action: none;">
        <span style="font-size: 0.8rem; color: #ffffff; user-select: none;">↻</span>
      </div>
    </div>
  `;
  document.body.appendChild(rulerWidget);

  rulerWidget.addEventListener("pointerdown", () => elevateSmartboardTool(rulerWidget));

  let rulerAngle = 0;
  let rulerDragging = false;
  let rulerRotating = false;
  let rulerStartX = 0;
  let rulerStartY = 0;
  let rulerStartLeft = 0;
  let rulerStartTop = 0;

  function updateRulerTransform() {
    rulerWidget.style.transform = `rotate(${rulerAngle}deg)`;
    const angleDisp = document.getElementById("sb-ruler-angle-disp");
    if (angleDisp) angleDisp.textContent = `${rulerAngle.toFixed(1)}°`;
  }

  function toggleRuler(force = null) {
    const isShowing = force !== null ? force : rulerWidget.style.display === "none";
    rulerWidget.style.display = isShowing ? "block" : "none";
    if (toolRuler) {
      if (isShowing) {
        toolRuler.classList.add("active");
        elevateSmartboardTool(rulerWidget);
      } else {
        toolRuler.classList.remove("active");
      }
    }
    if (isShowing) {
      try { SoundFX.playClick(); } catch (e) {}
    }
  }

  toolRuler?.addEventListener("click", () => toggleRuler());
  document.getElementById("sb-ruler-close-btn")?.addEventListener("click", () => toggleRuler(false));
  document.getElementById("sb-ruler-reset-rot")?.addEventListener("click", () => {
    rulerAngle = 0;
    updateRulerTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });
  document.getElementById("sb-ruler-rot-90")?.addEventListener("click", () => {
    rulerAngle = 90;
    updateRulerTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  const rulerBody = document.getElementById("sb-ruler-body");
  rulerBody?.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button") || e.target.closest("#sb-ruler-rot-handle")) return;
    elevateSmartboardTool(rulerWidget);
    rulerDragging = true;
    try { rulerBody.setPointerCapture(e.pointerId); } catch (err) {}
    rulerStartLeft = parseFloat(rulerWidget.style.left) || 140;
    rulerStartTop = parseFloat(rulerWidget.style.top) || 180;
    rulerStartX = e.clientX;
    rulerStartY = e.clientY;
    rulerBody.style.cursor = "grabbing";
  });

  rulerBody?.addEventListener("pointermove", (e) => {
    if (!rulerDragging) return;
    const dx = e.clientX - rulerStartX;
    const dy = e.clientY - rulerStartY;
    rulerWidget.style.left = `${rulerStartLeft + dx}px`;
    rulerWidget.style.top = `${rulerStartTop + dy}px`;
  });

  const stopRulerDrag = (e) => {
    if (rulerDragging) {
      rulerDragging = false;
      try { rulerBody.releasePointerCapture(e.pointerId); } catch (err) {}
      rulerBody.style.cursor = "grab";
    }
  };
  rulerBody?.addEventListener("pointerup", stopRulerDrag);
  rulerBody?.addEventListener("pointercancel", stopRulerDrag);

  let rulerRotStartPointerAngle = 0;
  let rulerRotStartAngle = 0;

  const rulerRotHandle = document.getElementById("sb-ruler-rot-handle");
  rulerRotHandle?.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    elevateSmartboardTool(rulerWidget);
    rulerRotating = true;
    try { rulerRotHandle.setPointerCapture(e.pointerId); } catch (err) {}
    rulerRotHandle.style.cursor = "grabbing";
    const anchorX = (parseFloat(rulerWidget.style.left) || 140) + 270;
    const anchorY = (parseFloat(rulerWidget.style.top) || 180) + 43;
    rulerRotStartPointerAngle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX) * (180 / Math.PI);
    rulerRotStartAngle = rulerAngle;
  });

  rulerRotHandle?.addEventListener("pointermove", (e) => {
    if (!rulerRotating) return;
    const anchorX = (parseFloat(rulerWidget.style.left) || 140) + 270;
    const anchorY = (parseFloat(rulerWidget.style.top) || 180) + 43;
    const curAngle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX) * (180 / Math.PI);
    let delta = curAngle - rulerRotStartPointerAngle;
    let deg = (rulerRotStartAngle + delta) % 360;
    if (deg < 0) deg += 360;
    if (!e.shiftKey && Math.abs(deg % 5) < 0.8) deg = Math.round(deg / 5) * 5;
    rulerAngle = Math.round(deg * 10) / 10;
    updateRulerTransform();
  });

  const stopRulerRot = (e) => {
    if (rulerRotating) {
      rulerRotating = false;
      try { rulerRotHandle.releasePointerCapture(e.pointerId); } catch (err) {}
      rulerRotHandle.style.cursor = "grab";
    }
  };
  rulerRotHandle?.addEventListener("pointerup", stopRulerRot);
  rulerRotHandle?.addEventListener("pointercancel", stopRulerRot);

  // Wheel rotation for ruler
  rulerWidget.addEventListener("wheel", (e) => {
    e.preventDefault();
    const step = e.shiftKey ? 1 : 5;
    const dir = e.deltaY > 0 ? 1 : -1;
    rulerAngle = (rulerAngle + dir * step) % 360;
    if (rulerAngle < 0) rulerAngle += 360;
    rulerAngle = Math.round(rulerAngle * 10) / 10;
    updateRulerTransform();
  }, { passive: false });



  // -------------------------------------------------------------------------
  // 3c. Interactive 180° Transparent Science Protractor
  // -------------------------------------------------------------------------
  let protractorWidget = document.getElementById("sb-protractor-widget");
  if (protractorWidget) protractorWidget.remove();

  protractorWidget = document.createElement("div");
  protractorWidget.id = "sb-protractor-widget";
  protractorWidget.className = "sb-protractor-widget";
  protractorWidget.style.display = "none";
  protractorWidget.style.position = "fixed";
  protractorWidget.style.left = "220px";
  protractorWidget.style.top = "200px";
  protractorWidget.style.width = "400px";
  protractorWidget.style.height = "215px";
  protractorWidget.style.zIndex = "200000";
  protractorWidget.style.transformOrigin = "200px 200px";
  protractorWidget.style.touchAction = "none";
  protractorWidget.style.userSelect = "none";

  let protractorTicksSvg = "";
  const pCx = 200;
  const pCy = 200;
  const pR = 185;

  for (let deg = 0; deg <= 180; deg++) {
    const rad = (deg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const xOuter = pCx - pR * cosA;
    const yOuter = pCy - pR * sinA;

    let tickLen = 6;
    if (deg % 10 === 0) {
      tickLen = 14;
      const xTextOuter = pCx - (pR - 24) * cosA;
      const yTextOuter = pCy - (pR - 24) * sinA;
      protractorTicksSvg += `<text x="${xTextOuter}" y="${yTextOuter + 3}" fill="#38bdf8" font-size="8" font-weight="800" font-family="sans-serif" text-anchor="middle">${deg}</text>`;

      const xTextInner = pCx - (pR - 38) * cosA;
      const yTextInner = pCy - (pR - 38) * sinA;
      protractorTicksSvg += `<text x="${xTextInner}" y="${yTextInner + 3}" fill="#facc15" font-size="7.5" font-weight="800" font-family="sans-serif" text-anchor="middle">${180 - deg}</text>`;
    } else if (deg % 5 === 0) {
      tickLen = 10;
    }

    const xInner = pCx - (pR - tickLen) * cosA;
    const yInner = pCy - (pR - tickLen) * sinA;

    protractorTicksSvg += `<line x1="${xOuter}" y1="${yOuter}" x2="${xInner}" y2="${yInner}" stroke="#38bdf8" stroke-width="${deg % 10 === 0 ? '1.5' : '0.8'}"/>`;
  }

  protractorWidget.innerHTML = `
    <div class="sb-protractor-body" id="sb-protractor-body" style="width: 100%; height: 100%; position: relative; background: radial-gradient(circle at 200px 200px, rgba(2, 132, 199, 0.15), rgba(15, 23, 42, 0.92)); backdrop-filter: blur(14px); border: 2px solid rgba(56, 189, 248, 0.5); border-top-left-radius: 200px; border-top-right-radius: 200px; border-bottom: 2px solid #38bdf8; box-shadow: 0 15px 35px rgba(0,0,0,0.6); overflow: hidden; cursor: grab;">
      <svg width="400" height="215" viewBox="0 0 400 215" style="position: absolute; top: 0; left: 0; pointer-events: none;">
        <line x1="15" y1="200" x2="385" y2="200" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="200" cy="200" r="14" fill="none" stroke="#facc15" stroke-width="1.5"/>
        <line x1="190" y1="200" x2="210" y2="200" stroke="#facc15" stroke-width="1.5"/>
        <line x1="200" y1="190" x2="200" y2="205" stroke="#facc15" stroke-width="1.5"/>
        <circle cx="200" cy="200" r="2.5" fill="#facc15"/>
        
        <path d="M 15 200 A 185 185 0 0 1 385 200" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
        <path d="M 55 200 A 145 145 0 0 1 345 200" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>

        ${protractorTicksSvg}

        <line id="sb-protractor-ray" x1="200" y1="200" x2="330" y2="70" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <div id="sb-protractor-needle-grip" title="Drag to Measure Angle" style="position: absolute; left: 320px; top: 60px; width: 24px; height: 24px; border-radius: 50%; background: #ef4444; border: 2.5px solid #ffffff; box-shadow: 0 0 12px rgba(239,68,68,0.9); cursor: grab; z-index: 15; touch-action: none;"></div>

      <div style="position: absolute; left: 50%; transform: translateX(-50%); top: 112px; display: flex; flex-direction: column; align-items: center; gap: 5px; z-index: 10; pointer-events: auto;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 0.68rem; color: #94a3b8; font-weight: 700;">MEASURE:</span>
            <span id="sb-protractor-val" style="background: rgba(0,0,0,0.6); border: 1px solid #ef4444; color: #f87171; font-family: monospace; font-size: 0.88rem; font-weight: 900; padding: 1px 6px; border-radius: 4px;">45.0°</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 700;">BASE:</span>
            <span id="sb-protractor-body-val" style="background: rgba(0,0,0,0.6); border: 1px solid #38bdf8; color: #38bdf8; font-family: monospace; font-size: 0.88rem; font-weight: 900; padding: 1px 6px; border-radius: 4px;">0.0°</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center;">
          <button id="sb-protractor-rot-n15" title="Rotate Body -15°" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer;">↺ -15°</button>
          <button id="sb-protractor-reset-rot" title="Reset Protractor Body (0° Horizontal)" style="background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer; font-weight: 700;">0° Base</button>
          <button id="sb-protractor-rot-45" title="Rotate Body to 45°" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer;">45°</button>
          <button id="sb-protractor-rot-90" title="Rotate Body to 90° (Vertical)" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer;">90°</button>
          <button id="sb-protractor-rot-180" title="Rotate Body to 180°" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer;">180°</button>
          <button id="sb-protractor-rot-p15" title="Rotate Body +15°" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 0.68rem; cursor: pointer;">↻ +15°</button>
        </div>
      </div>

      <button id="sb-protractor-close-btn" title="Close Protractor (Esc)" style="position: absolute; right: 18px; top: 38px; z-index: 10; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; cursor: pointer;">✕</button>

      <div id="sb-protractor-rot-handle" title="Drag to Rotate Protractor Body (or Scroll Wheel)" style="position: absolute; left: 16px; top: 36px; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #38bdf8); border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(56,189,248,0.7); cursor: grab; display: flex; align-items: center; justify-content: center; z-index: 10; touch-action: none;">
        <span style="font-size: 0.85rem; color: #ffffff; user-select: none; line-height: 1;">↻</span>
      </div>
    </div>
  `;
  document.body.appendChild(protractorWidget);

  protractorWidget.addEventListener("pointerdown", () => elevateSmartboardTool(protractorWidget));

  let protractorBodyAngle = 0;
  let protractorMeasuredAngle = 45;
  let protractorDragging = false;
  let protractorRotating = false;
  let protractorArmDragging = false;
  let protractorStartX = 0;
  let protractorStartY = 0;
  let protractorStartLeft = 0;
  let protractorStartTop = 0;

  function updateProtractorTransform() {
    protractorWidget.style.transform = `rotate(${protractorBodyAngle}deg)`;
    const bodyValDisp = document.getElementById("sb-protractor-body-val");
    if (bodyValDisp) {
      bodyValDisp.textContent = `${protractorBodyAngle.toFixed(1)}°`;
    }
  }

  function updateProtractorNeedle() {
    const rad = (protractorMeasuredAngle * Math.PI) / 180;
    const nx = pCx + Math.cos(rad) * pR;
    const ny = pCy - Math.sin(rad) * pR;

    const rayLine = document.getElementById("sb-protractor-ray");
    if (rayLine) {
      rayLine.setAttribute("x2", nx);
      rayLine.setAttribute("y2", ny);
    }
    const grip = document.getElementById("sb-protractor-needle-grip");
    if (grip) {
      grip.style.left = `${nx - 12}px`;
      grip.style.top = `${ny - 12}px`;
    }
    const valDisp = document.getElementById("sb-protractor-val");
    if (valDisp) {
      valDisp.textContent = `${protractorMeasuredAngle.toFixed(1)}°`;
    }
  }

  function toggleProtractor(force = null) {
    const isShowing = force !== null ? force : protractorWidget.style.display === "none";
    protractorWidget.style.display = isShowing ? "block" : "none";
    if (toolProtractor) {
      if (isShowing) {
        toolProtractor.classList.add("active");
        elevateSmartboardTool(protractorWidget);
      } else {
        toolProtractor.classList.remove("active");
      }
    }
    if (isShowing) {
      try { SoundFX.playClick(); } catch (e) {}
      updateProtractorNeedle();
      updateProtractorTransform();
    }
  }

  toolProtractor?.addEventListener("click", () => toggleProtractor());
  document.getElementById("sb-protractor-close-btn")?.addEventListener("click", () => toggleProtractor(false));

  document.getElementById("sb-protractor-reset-rot")?.addEventListener("click", () => {
    protractorBodyAngle = 0;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  document.getElementById("sb-protractor-rot-n15")?.addEventListener("click", () => {
    protractorBodyAngle = (protractorBodyAngle - 15 + 360) % 360;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  document.getElementById("sb-protractor-rot-p15")?.addEventListener("click", () => {
    protractorBodyAngle = (protractorBodyAngle + 15) % 360;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  document.getElementById("sb-protractor-rot-45")?.addEventListener("click", () => {
    protractorBodyAngle = 45;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  document.getElementById("sb-protractor-rot-90")?.addEventListener("click", () => {
    protractorBodyAngle = 90;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  document.getElementById("sb-protractor-rot-180")?.addEventListener("click", () => {
    protractorBodyAngle = 180;
    updateProtractorTransform();
    try { SoundFX.playClick(); } catch (e) {}
  });

  const protractorBody = document.getElementById("sb-protractor-body");
  protractorBody?.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button") || e.target.closest("#sb-protractor-needle-grip") || e.target.closest("#sb-protractor-rot-handle")) return;
    elevateSmartboardTool(protractorWidget);
    protractorDragging = true;
    try { protractorBody.setPointerCapture(e.pointerId); } catch (err) {}
    protractorStartLeft = parseFloat(protractorWidget.style.left) || 220;
    protractorStartTop = parseFloat(protractorWidget.style.top) || 200;
    protractorStartX = e.clientX;
    protractorStartY = e.clientY;
    protractorBody.style.cursor = "grabbing";
  });

  protractorBody?.addEventListener("pointermove", (e) => {
    if (!protractorDragging) return;
    const dx = e.clientX - protractorStartX;
    const dy = e.clientY - protractorStartY;
    protractorWidget.style.left = `${protractorStartLeft + dx}px`;
    protractorWidget.style.top = `${protractorStartTop + dy}px`;
  });

  const stopProtractorDrag = (e) => {
    if (protractorDragging) {
      protractorDragging = false;
      try { protractorBody.releasePointerCapture(e.pointerId); } catch (err) {}
      protractorBody.style.cursor = "grab";
    }
  };
  protractorBody?.addEventListener("pointerup", stopProtractorDrag);
  protractorBody?.addEventListener("pointercancel", stopProtractorDrag);

  let protractorRotStartPointerAngle = 0;
  let protractorRotStartBodyAngle = 0;

  const protractorRotHandle = document.getElementById("sb-protractor-rot-handle");
  protractorRotHandle?.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    elevateSmartboardTool(protractorWidget);
    protractorRotating = true;
    try { protractorRotHandle.setPointerCapture(e.pointerId); } catch (err) {}
    protractorRotHandle.style.cursor = "grabbing";

    const anchorX = (parseFloat(protractorWidget.style.left) || 220) + 200;
    const anchorY = (parseFloat(protractorWidget.style.top) || 200) + 200;
    protractorRotStartPointerAngle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX) * (180 / Math.PI);
    protractorRotStartBodyAngle = protractorBodyAngle;
  });

  protractorRotHandle?.addEventListener("pointermove", (e) => {
    if (!protractorRotating) return;
    const anchorX = (parseFloat(protractorWidget.style.left) || 220) + 200;
    const anchorY = (parseFloat(protractorWidget.style.top) || 200) + 200;
    const curPointerAngle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX) * (180 / Math.PI);
    let delta = curPointerAngle - protractorRotStartPointerAngle;
    let deg = (protractorRotStartBodyAngle + delta) % 360;
    if (deg < 0) deg += 360;
    if (!e.shiftKey && Math.abs(deg % 5) < 0.8) deg = Math.round(deg / 5) * 5;
    protractorBodyAngle = Math.round(deg * 10) / 10;
    updateProtractorTransform();
  });

  const stopProtractorRot = (e) => {
    if (protractorRotating) {
      protractorRotating = false;
      try { protractorRotHandle.releasePointerCapture(e.pointerId); } catch (err) {}
      protractorRotHandle.style.cursor = "grab";
    }
  };
  protractorRotHandle?.addEventListener("pointerup", stopProtractorRot);
  protractorRotHandle?.addEventListener("pointercancel", stopProtractorRot);

  // Wheel rotation for protractor body
  protractorWidget.addEventListener("wheel", (e) => {
    e.preventDefault();
    const step = e.shiftKey ? 1 : 5;
    const dir = e.deltaY > 0 ? 1 : -1;
    protractorBodyAngle = (protractorBodyAngle + dir * step) % 360;
    if (protractorBodyAngle < 0) protractorBodyAngle += 360;
    protractorBodyAngle = Math.round(protractorBodyAngle * 10) / 10;
    updateProtractorTransform();
  }, { passive: false });

  const needleGrip = document.getElementById("sb-protractor-needle-grip");
  needleGrip?.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    elevateSmartboardTool(protractorWidget);
    protractorArmDragging = true;
    try { needleGrip.setPointerCapture(e.pointerId); } catch (err) {}
    needleGrip.style.cursor = "grabbing";
  });

  needleGrip?.addEventListener("pointermove", (e) => {
    if (!protractorArmDragging) return;
    const anchorX = (parseFloat(protractorWidget.style.left) || 220) + 200;
    const anchorY = (parseFloat(protractorWidget.style.top) || 200) + 200;
    const baseAngleRad = (protractorBodyAngle * Math.PI) / 180;

    const dx = e.clientX - anchorX;
    const dy = e.clientY - anchorY;

    // De-rotate pointer by current protractor body angle
    const localX = dx * Math.cos(-baseAngleRad) - dy * Math.sin(-baseAngleRad);
    const localY = dx * Math.sin(-baseAngleRad) + dy * Math.cos(-baseAngleRad);

    let deg = Math.atan2(-localY, localX) * (180 / Math.PI);
    if (deg < 0) deg = 0;
    if (deg > 180) deg = 180;
    if (Math.abs(deg - Math.round(deg)) < 0.2) deg = Math.round(deg);
    protractorMeasuredAngle = Math.round(deg * 10) / 10;
    updateProtractorNeedle();
  });

  const stopNeedleDrag = (e) => {
    if (protractorArmDragging) {
      protractorArmDragging = false;
      try { needleGrip.releasePointerCapture(e.pointerId); } catch (err) {}
      needleGrip.style.cursor = "grab";
    }
  };
  needleGrip?.addEventListener("pointerup", stopNeedleDrag);
  needleGrip?.addEventListener("pointercancel", stopNeedleDrag);


  // -------------------------------------------------------------------------
  // 3b. Scientific Pocket Calculator & Physical Constants
  // -------------------------------------------------------------------------
  const toolCalc = document.getElementById("sb-tool-calc");
  toolCalc?.addEventListener("click", () => {
    const isShowing = toggleScienceCalculator();
    if (toolCalc) {
      if (isShowing) toolCalc.classList.add("active");
      else toolCalc.classList.remove("active");
    }
  });

  // -------------------------------------------------------------------------
  // 3c. Classroom LMS Share & Instant Student Join QR
  // -------------------------------------------------------------------------
  const toolShare = document.getElementById("sb-tool-share");
  toolShare?.addEventListener("click", () => {
    const activeTitle = document.querySelector(".module-hero-title, .interactive-title, h1, h2")?.textContent?.trim() || "Interactive Science Laboratory";
    const activeSubj = document.querySelector(".interactive-tag, .module-badge")?.textContent?.trim() || "STEM Science";
    openLmsShareModal({
      url: window.location.href,
      title: activeTitle,
      subject: activeSubj
    });
  });

  // -------------------------------------------------------------------------
  // 4. Universal Classroom Keyboard Shortcuts
  // -------------------------------------------------------------------------
  document.addEventListener("keydown", (e) => {
    const target = e.target;
    if (target) {
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
        return;
      }
    }

    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      toggleTimer();
    } else if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      toggleCurtain();
    } else if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      toggleSpotlight();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      toggleRuler();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      toggleProtractor();
    } else if (e.key === "q" || e.key === "Q") {
      e.preventDefault();
      toolShare?.click();
    } else if (e.key === "k" || e.key === "K") {
      e.preventDefault();
      const isShowing = toggleScienceCalculator();
      if (toolCalc) {
        if (isShowing) toolCalc.classList.add("active");
        else toolCalc.classList.remove("active");
      }
    } else if (e.key === " ") {
      // Spacebar: Play/Pause timer if open, otherwise trigger active lab simulation
      if (timerWidget.style.display !== "none") {
        e.preventDefault();
        const countdownView = document.getElementById("sb-timer-countdown-view");
        if (countdownView && countdownView.style.display !== "none") {
          toggleCountdown();
        } else {
          toggleStopwatch();
        }
      } else {
        const simPlayBtn = document.querySelector("#btn-add-drop, #btn-titr-slow, #btn-launch, #btn-sim-play, .btn-launch-lesson-sim");
        if (simPlayBtn) {
          e.preventDefault();
          simPlayBtn.click();
        }
      }
    } else if (e.key === "r" || e.key === "R") {
      // R: Reset timer if open, otherwise trigger simulation reset
      if (timerWidget.style.display !== "none") {
        e.preventDefault();
        const countdownView = document.getElementById("sb-timer-countdown-view");
        if (countdownView && countdownView.style.display !== "none") {
          resetCountdown();
        } else {
          resetStopwatch();
        }
      } else {
        const simResetBtn = document.querySelector("#btn-titr-reset, #btn-reset, #btn-sim-reset");
        if (simResetBtn) {
          e.preventDefault();
          simResetBtn.click();
        }
      }
    } else if (e.key === "Escape") {
      if (protractorWidget.style.display !== "none") {
        toggleProtractor(false);
      } else if (rulerWidget.style.display !== "none") {
        toggleRuler(false);
      } else if (spotlightOverlay.style.display !== "none") {
        toggleSpotlight(false);
      } else if (curtainOverlay.style.display !== "none") {
        toggleCurtain(false);
      } else if (timerWidget.style.display !== "none") {
        toggleTimer(false);
      } else {
        closeSizePopover();
      }
    }
  });

  // Initialize
  updateMode("pointer");
  syncSizeUI();
  updateMiniBadge();
  loadToolbarState();
}
