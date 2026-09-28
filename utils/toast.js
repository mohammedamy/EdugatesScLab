// Edugates-ClipSAT Science Labs - Floating Toast Notification & Share Engine
// Lightweight, accessible, zero-dependency feedback toasts and clipboard deep-link sharer

import { AudioSynth } from "./audio-synth.js";

let toastTimeout = null;

/**
 * Displays a non-intrusive floating toast notification
 * @param {string} title
 * @param {string} [detail]
 * @param {'info'|'success'|'warning'|'error'} [type]
 * @param {number} [duration]
 */
export function showToast(title, detail = "", type = "info", duration = 3000) {
  let toast = document.getElementById("amscilab-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "amscilab-toast";
    toast.className = "amscilab-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  const iconSvg = type === "success" 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

  toast.innerHTML = `
    <div class="amscilab-toast-icon">
      ${iconSvg}
    </div>
    <div class="amscilab-toast-text">
      <div class="amscilab-toast-title">${title}</div>
      ${detail ? `<div class="amscilab-toast-detail">${detail}</div>` : ""}
    </div>
  `;

  // Trigger sound effect
  try {
    AudioSynth.playChime(587.33); // D5 chime
  } catch (e) {}

  // Force reflow and reveal
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/**
 * Copies a deep-link hash route to clipboard and notifies user with a toast
 * @param {string} hashRoute e.g. "#module/CHEM-M05" or "#labs/titration"
 * @param {string} label e.g. "Chapter 5: Periodic Trends"
 */
export async function copyShareLink(hashRoute, label = "") {
  const url = new URL(window.location.href);
  url.hash = hashRoute.startsWith("#") ? hashRoute : "#" + hashRoute;
  const fullUrl = url.toString();

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullUrl);
    } else {
      // Fallback for older browsers / webview
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    showToast("Deep-Link Copied!", label || fullUrl, "success");
  } catch (err) {
    console.error("Failed to copy link:", err);
    showToast("Share Link", fullUrl, "info", 5000);
  }
}

// Global browser window attachment
if (typeof window !== "undefined") {
  window.showToast = showToast;
  window.copyShareLink = copyShareLink;
}
