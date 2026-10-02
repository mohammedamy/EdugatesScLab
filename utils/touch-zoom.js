// Edugates-ClipSAT Science Labs - Universal Touch Screen Pinch-to-Zoom & Whole-Screen Scaling Engine
// Supports 2-finger pinch-to-zoom on touch screens (Smartboards, iPads, Tablets, Mobiles),
// anchored zoom at touch focal point, panning, trackpad pinch (Ctrl+Wheel),
// and whole-screen scaling (<1.0x to shrink full screen down to 40%, and up to 350% for fine detail).

let currentScale = 1.0;
let currentPanX = 0;
let currentPanY = 0;

let isPinching = false;
let pinchStartDistance = 0;
let pinchStartMidpoint = { x: 0, y: 0 };
let pinchStartScale = 1.0;
let pinchStartPan = { x: 0, y: 0 };
let lastPinchEndTime = 0;

const MIN_SCALE = 0.40; // 40% - allows whole screen to appear smaller
const MAX_SCALE = 3.50; // 350% - deep detail zoom on any part of screen
const SNAP_THRESHOLD = 0.04; // Snap to 1.0 if within +/- 4%

let hudElement = null;
let targetRootElement = null;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function getTouchZoomState() {
  return {
    scale: currentScale,
    panX: currentPanX,
    panY: currentPanY,
    isZoomed: Math.abs(currentScale - 1.0) > 0.01 || Math.abs(currentPanX) > 2 || Math.abs(currentPanY) > 2
  };
}

export function applyScreenTransform(smooth = false) {
  if (typeof document === "undefined") return;
  const root = targetRootElement || document.getElementById("app-root");
  if (!root) return;

  if (Math.abs(currentScale - 1.0) < 0.01 && Math.abs(currentPanX) < 1 && Math.abs(currentPanY) < 1) {
    // Reset to pure native layout centered
    root.style.transition = smooth ? "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)" : "";
    root.style.transformOrigin = "0 0";
    if (smooth) {
      root.style.transform = "translate(0px, 0px) scale(1)";
      setTimeout(() => {
        if (root && Math.abs(currentScale - 1.0) < 0.01 && Math.abs(currentPanX) < 1 && Math.abs(currentPanY) < 1) {
          root.style.transform = "";
          root.style.transformOrigin = "";
          root.style.transition = "";
        }
      }, 300);
    } else {
      root.style.transform = "";
      root.style.transformOrigin = "";
    }
    document.body.classList.remove("is-screen-zoomed");
    updateHudUI();
    return;
  }

  document.body.classList.add("is-screen-zoomed");
  root.style.transformOrigin = "0 0";
  root.style.transition = smooth ? "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)" : "";
  root.style.transform = `translate(${Math.round(currentPanX)}px, ${Math.round(currentPanY)}px) scale(${currentScale.toFixed(3)})`;

  updateHudUI();

  if (smooth) {
    setTimeout(() => {
      if (root) root.style.transition = "";
    }, 300);
  }
}

export function setScale(newScale, focalX, focalY, smooth = false) {
  const root = targetRootElement || document.getElementById("app-root");
  const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;

  const fx = focalX !== undefined ? focalX : winW / 2;
  const fy = focalY !== undefined ? focalY : winH / 2;

  const clampedScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
  const targetScale = Math.abs(clampedScale - 1.0) <= SNAP_THRESHOLD ? 1.0 : clampedScale;

  // Whenever scale is set to 1.0 (100%), ALWAYS centralize view completely back to (0, 0)
  if (Math.abs(targetScale - 1.0) < 0.001) {
    currentScale = 1.0;
    currentPanX = 0;
    currentPanY = 0;
  } else {
    // Anchored zoom around (fx, fy)
    const contentX = (fx - currentPanX) / currentScale;
    const contentY = (fy - currentPanY) / currentScale;

    currentScale = targetScale;
    currentPanX = fx - contentX * currentScale;
    currentPanY = fy - contentY * currentScale;
  }

  applyScreenTransform(smooth);
}

export function zoomIn(step = 0.15) {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  setScale(currentScale + step, winW / 2, winH / 2, true);
}

export function zoomOut(step = 0.15) {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const winH = typeof window !== "undefined" ? window.innerHeight : 800;
  setScale(currentScale - step, winW / 2, winH / 2, true);
}

export function resetZoom(smooth = true) {
  currentScale = 1.0;
  currentPanX = 0;
  currentPanY = 0;
  if (typeof window !== "undefined") {
    try {
      window.scrollTo({ left: 0, top: 0, behavior: smooth ? "smooth" : "auto" });
    } catch (_) {}
  }
  applyScreenTransform(smooth);
}

export function panBy(dx, dy) {
  currentPanX += dx;
  currentPanY += dy;
  applyScreenTransform(false);
}

// ----------------------------------------------------
// Touch Screen 2-Finger Pinch Gesture Handlers
// ----------------------------------------------------
function shouldIgnorePinch(e) {
  const target = e.target;
  if (!target) return false;
  return Boolean(
    target.closest && (
      target.closest("#atlas-canvas-container") ||
      target.closest("#atlas-canvas") ||
      target.closest("canvas") ||
      target.closest("[data-no-touch-zoom]") ||
      target.closest(".atlas-workbench")
    )
  );
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    if (shouldIgnorePinch(e)) return;
    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;

    const now = Date.now();
    // Detect 2-finger double tap to reset
    if (now - lastPinchEndTime < 320) {
      resetZoom(true);
      lastPinchEndTime = 0;
      isPinching = false;
      return;
    }

    isPinching = true;
    pinchStartDistance = Math.max(dist, 10);
    pinchStartMidpoint = { x: midX, y: midY };
    pinchStartScale = currentScale;
    pinchStartPan = { x: currentPanX, y: currentPanY };
  }
}

function onTouchMove(e) {
  if (isPinching && e.touches.length === 2) {
    // Intercept to prevent browser's erratic default viewport scaler
    if (e.cancelable) e.preventDefault();

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;

    const ratio = dist / pinchStartDistance;
    let nextScale = pinchStartScale * ratio;
    nextScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    // Anchored transform keeping the initial focal point steady under the two fingers
    const contentX = (pinchStartMidpoint.x - pinchStartPan.x) / pinchStartScale;
    const contentY = (pinchStartMidpoint.y - pinchStartPan.y) / pinchStartScale;

    // Add translation delta as fingers move together
    const midDeltaX = midX - pinchStartMidpoint.x;
    const midDeltaY = midY - pinchStartMidpoint.y;

    currentScale = nextScale;
    currentPanX = pinchStartMidpoint.x - contentX * currentScale + midDeltaX;
    currentPanY = pinchStartMidpoint.y - contentY * currentScale + midDeltaY;

    applyScreenTransform(false);
  }
}

function onTouchEnd(e) {
  if (isPinching && e.touches.length < 2) {
    isPinching = false;
    lastPinchEndTime = Date.now();

    // Snap to 100% if very close
    if (Math.abs(currentScale - 1.0) <= SNAP_THRESHOLD) {
      resetZoom(true);
    }
  }
}

// ----------------------------------------------------
// Trackpad / Precision Touchpad Pinch (Ctrl + Wheel)
// ----------------------------------------------------
function onWheel(e) {
  if (e.ctrlKey) {
    if (shouldIgnorePinch(e)) return;
    if (e.cancelable) e.preventDefault();
    const factor = e.deltaY < 0 ? 1.06 : 0.94;
    setScale(currentScale * factor, e.clientX, e.clientY, false);
  }
}

// ----------------------------------------------------
// Floating Glassmorphic Touch Zoom Controller HUD
// ----------------------------------------------------
function createHudElement() {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById("touch-screen-zoom-controller");
  if (existing) return existing;

  const hud = document.createElement("aside");
  hud.id = "touch-screen-zoom-controller";
  hud.className = "touch-zoom-hud";
  hud.setAttribute("role", "toolbar");
  hud.setAttribute("aria-label", "Screen Touch Zoom Controls");

  hud.innerHTML = `
    <div class="touch-zoom-pill" id="touch-zoom-main-pill">
      <!-- Zoom Out Button (Supports making whole screen smaller down to 40%) -->
      <button class="touch-zoom-btn touch-zoom-btn-step" id="btn-touch-zoom-out" title="Zoom Out / Shrink Screen (Pinch Out)" aria-label="Zoom out screen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <!-- Zoom Readout & Preset Dropdown Button -->
      <button class="touch-zoom-badge" id="btn-touch-zoom-presets" title="Touch Zoom Level • Click for Presets" aria-label="Touch zoom level" aria-haspopup="true">
        <span class="touch-zoom-icon">🔍</span>
        <span class="touch-zoom-pct" id="touch-zoom-pct-label">100%</span>
        <span class="touch-zoom-caret" aria-hidden="true" style="font-size: 0.65rem; opacity: 0.7; margin-left: 2px;">▾</span>
      </button>

      <!-- Zoom In Button -->
      <button class="touch-zoom-btn touch-zoom-btn-step" id="btn-touch-zoom-in" title="Zoom In (Pinch In)" aria-label="Zoom in screen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <!-- Reset & Center Button (Permanently available in zoom tools) -->
      <button class="touch-zoom-btn touch-zoom-btn-reset" id="btn-touch-zoom-reset" title="Reset Zoom to 100% & Center View (↺)" aria-label="Reset zoom to 100% and center view">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        <span class="touch-zoom-reset-txt">100% Center</span>
      </button>
    </div>

    <!-- Quick Zoom Presets Popover Menu -->
    <div class="touch-zoom-popover" id="touch-zoom-popover" style="display: none;" role="menu">
      <div class="touch-zoom-popover-title">Screen Scaling Presets</div>
      <div class="touch-zoom-preset-grid">
        <button class="touch-zoom-preset-opt" data-scale="0.50">50% <span class="preset-tag">Mini</span></button>
        <button class="touch-zoom-preset-opt" data-scale="0.75">75% <span class="preset-tag">Fit All</span></button>
        <button class="touch-zoom-preset-opt preset-center-opt" data-scale="1.00">
          <span>↺ 100%</span>
          <span class="preset-tag preset-tag-center">Center</span>
        </button>
        <button class="touch-zoom-preset-opt" data-scale="1.25">125% <span class="preset-tag">Large</span></button>
        <button class="touch-zoom-preset-opt" data-scale="1.50">150% <span class="preset-tag">Close</span></button>
        <button class="touch-zoom-preset-opt" data-scale="2.00">200% <span class="preset-tag">Macro</span></button>
      </div>
      <button class="touch-zoom-preset-center-btn" id="btn-popover-reset-center" title="Reset to 100% and Center View">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        <span>Reset to 100% & Center View</span>
      </button>
      <div class="touch-zoom-hint">💡 Pinch with two fingers anywhere on screen to zoom smoothly</div>
    </div>
  `;

  document.body.appendChild(hud);

  // Bind Buttons
  const btnOut = hud.querySelector("#btn-touch-zoom-out");
  const btnIn = hud.querySelector("#btn-touch-zoom-in");
  const btnReset = hud.querySelector("#btn-touch-zoom-reset");
  const btnPresets = hud.querySelector("#btn-touch-zoom-presets");
  const btnPopoverReset = hud.querySelector("#btn-popover-reset-center");
  const popover = hud.querySelector("#touch-zoom-popover");

  btnOut?.addEventListener("click", () => zoomOut(0.12));
  btnIn?.addEventListener("click", () => zoomIn(0.12));
  btnReset?.addEventListener("click", () => {
    resetZoom(true);
    if (popover) popover.style.display = "none";
  });
  btnPopoverReset?.addEventListener("click", () => {
    resetZoom(true);
    if (popover) popover.style.display = "none";
  });

  btnPresets?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = popover.style.display !== "none";
    popover.style.display = isOpen ? "none" : "flex";
  });

  hud.querySelectorAll(".touch-zoom-preset-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const sc = parseFloat(btn.dataset.scale || "1.0");
      if (Math.abs(sc - 1.0) < 0.01) {
        resetZoom(true);
      } else {
        const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const winH = typeof window !== "undefined" ? window.innerHeight : 800;
        setScale(sc, winW / 2, winH / 2, true);
      }
      popover.style.display = "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!hud.contains(e.target)) {
      if (popover) popover.style.display = "none";
    }
  });

  return hud;
}

let hudAllowed = false;

export function setZoomHudAllowed(allowed) {
  hudAllowed = !!allowed;
  updateHudUI();
}

function updateHudUI() {
  if (!hudElement && typeof document !== "undefined") {
    hudElement = document.getElementById("touch-screen-zoom-controller");
  }
  if (!hudElement) return;

  const pct = Math.round(currentScale * 100);
  const isDeviated = Math.abs(currentScale - 1.0) >= 0.02 || Math.abs(currentPanX) > 2 || Math.abs(currentPanY) > 2;
  const isFullscreen = typeof document !== "undefined" && !!(
    document.fullscreenElement || 
    document.webkitFullscreenElement || 
    (document.body && document.body.classList && typeof document.body.classList.contains === "function" && document.body.classList.contains("modal-open"))
  );
  const shouldShow = hudAllowed || isDeviated || isFullscreen;

  hudElement.style.display = shouldShow ? "flex" : "none";

  if (typeof hudElement.querySelector === "function") {
    const label = hudElement.querySelector("#touch-zoom-pct-label");
    const btnReset = hudElement.querySelector("#btn-touch-zoom-reset");

    if (label) {
      label.textContent = `${pct}%`;
    }

    if (hudElement.classList && typeof hudElement.classList.toggle === "function") {
      hudElement.classList.toggle("is-active-zoom", isDeviated);
      hudElement.classList.toggle("is-shrunk", currentScale < 0.98);
      hudElement.classList.toggle("is-enlarged", currentScale > 1.02);
    }

    if (btnReset) {
      btnReset.classList.toggle("is-deviated", isDeviated);
    }
  }
}

// ----------------------------------------------------
// Engine Initialization & Lifecycle
// ----------------------------------------------------
export function initTouchZoom(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  targetRootElement = options.target || document.getElementById("app-root");

  // Prevent multiple bindings
  if (window.__TOUCH_ZOOM_INITIALIZED__) {
    updateHudUI();
    return;
  }
  window.__TOUCH_ZOOM_INITIALIZED__ = true;

  // Global touch listeners with passive: false so preventDefault() can stop browser page bounce
  window.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: false });
  window.addEventListener("touchcancel", onTouchEnd, { passive: false });

  // Trackpad pinch support
  window.addEventListener("wheel", onWheel, { passive: false });

  // Create floating HUD
  hudElement = createHudElement();
  updateHudUI();

  // Expose global controller
  window.TouchZoom = {
    getScale: () => currentScale,
    getPan: () => ({ x: currentPanX, y: currentPanY }),
    getState: getTouchZoomState,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    panBy,
    setAllowed: setZoomHudAllowed
  };
}
