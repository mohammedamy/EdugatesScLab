// Edugates-ClipSAT Science Labs - Smartboard Floating Interactive Annotation Toolbar
// Features: Pointer, Precision Pen, Bright Neon Highlighter, Real-Time Stroke Resizer & Presets,
// 7 Vibrant High-Contrast Scientific Colors, Eraser, Canvas Clear, and Fullscreen Presentation.

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
    <div style="display: flex; align-items: center; gap: 8px; position: relative;">
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

      <!-- Full Screen Presentation -->
      <button class="icon-action-btn" id="sb-tool-fullscreen" title="Full Screen Presentation" style="border-radius: 9999px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(bar);

  const canvas = existingCanvas;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // State
  let isDrawing = false;
  let hasMoved = false;
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
    } else if (mode === "pen") {
      toolPen.classList.add("active");
      canvas.classList.add("drawing-active");
    } else if (mode === "highlighter") {
      toolHighlighter.classList.add("active");
      canvas.classList.add("drawing-active");
    } else if (mode === "eraser") {
      toolEraser.classList.add("active");
      canvas.classList.add("drawing-active");
    }
    syncSizeUI();
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
      }
    });
  });

  // Clear Canvas
  document.getElementById("sb-tool-clear").addEventListener("click", () => {
    closeSizePopover();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // Drawing Engine
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
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function moveDraw(e) {
    if (!isDrawing || currentTool === "pointer") return;
    hasMoved = true;
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
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 12;
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
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 4;
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
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(lastX, lastY, highlighterStrokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentTool === "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = strokeColor;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(lastX, lastY, penStrokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    isDrawing = false;
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: true });
  canvas.addEventListener("touchmove", moveDraw, { passive: true });
  window.addEventListener("touchend", stopDraw);

  // Initialize
  updateMode("pointer");
  syncSizeUI();
}
