// Edugates-ClipSAT Science Labs - Unified LMS & Classroom Sharing Engine
// Provides seamless sharing, assignment creation, and embedding for:
// - Google Classroom (Direct Web Intent with auto-populated title, link, and instructions)
// - Classera (كلاسيرا) (Formatted Assignment Packager, Course Material embedder & Portal launcher)
// - In-Class Smartboard QR Code (Instant camera scan for student tablets / Chromebooks)
// - Microsoft Teams & WhatsApp Web Share
// - Responsive HTML5 Iframe Embed generator for LMS pages

import { showToast } from "./toast.js";
import { SoundFX } from "./audio-synth.js";
import { generateQRSvg } from "./qr-code.js";

/**
 * Resilient cross-browser clipboard copy with fallback to document.execCommand
 */
export async function safeCopyTextToClipboard(text) {
  if (typeof text !== "string") text = String(text || "");

  // 1. Try modern async Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[LMS Share] navigator.clipboard rejected, falling back:", err);
    }
  }

  // 2. Synchronous hidden textarea fallback
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackErr) {
      console.error("[LMS Share] Fallback execCommand copy failed:", fallbackErr);
      return false;
    }
  }

  return false;
}

/**
 * Normalizes a route or URL to a fully qualified HTTPS URL.
 */
export function getAbsoluteShareUrl(routeOrHash = "") {
  try {
    const base = new URL(window.location.href);
    if (!routeOrHash) return base.toString();
    if (routeOrHash.startsWith("http://") || routeOrHash.startsWith("https://")) {
      return routeOrHash;
    }
    const hash = routeOrHash.startsWith("#") ? routeOrHash : "#" + routeOrHash;
    base.hash = hash;
    return base.toString();
  } catch (e) {
    return window.location.href;
  }
}

/**
 * Launches official Google Classroom Share Web Intent
 */
export function shareToGoogleClassroom(options = {}) {
  const {
    url = window.location.href,
    title = "Edugates-ClipSAT Science Labs Interactive Activity",
    description = "Complete the interactive STEM virtual laboratory simulation and answer all assessment questions.",
    objectives = []
  } = options;

  const fullUrl = getAbsoluteShareUrl(url);
  let bodyText = description;
  if (objectives && objectives.length > 0) {
    bodyText += "\n\nLearning Objectives:\n• " + objectives.join("\n• ");
  }

  const shareEndpoint = `https://classroom.google.com/share?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyText)}`;

  // Open in focused popup window
  const width = 680;
  const height = 620;
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);

  try {
    const pop = window.open(
      shareEndpoint,
      "google_classroom_share",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    if (!pop || pop.closed || typeof pop.closed === "undefined") {
      window.open(shareEndpoint, "_blank");
    }
  } catch (err) {
    window.open(shareEndpoint, "_blank");
  }

  showToast("Opening Google Classroom", `Assigning "${title}" to your class`, "success");
  try { SoundFX.playScorePip(); } catch (e) {}
}

/**
 * Formats and packages a learning activity for Classera (كلاسيرا) LMS
 * Copies structured activity text to clipboard and opens Classera portal.
 */
export async function shareToClassera(options = {}) {
  const {
    url = window.location.href,
    title = "Edugates-ClipSAT Science Labs Activity",
    subject = "STEM Science",
    moduleCode = "",
    objectives = [],
    instructions = "Launch the interactive simulation via the link below. Conduct your investigation and record your data in your notebook."
  } = options;

  const fullUrl = getAbsoluteShareUrl(url);

  let formattedText = `🎓 Edugates-ClipSAT Science Labs | Classera Learning Assignment\n`;
  formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  formattedText += `🔬 Activity: ${title}\n`;
  if (subject || moduleCode) {
    formattedText += `📚 Subject: ${subject}${moduleCode ? ` (${moduleCode})` : ""}\n`;
  }
  if (objectives && objectives.length > 0) {
    formattedText += `\n🎯 Learning Objectives:\n• ` + objectives.join("\n• ") + `\n`;
  }
  formattedText += `\n🔗 Direct Student Interactive Link:\n${fullUrl}\n`;
  formattedText += `\n📝 Student Instructions:\n${instructions}\n`;
  formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  await safeCopyTextToClipboard(formattedText);

  // Open Classera Portal
  window.open("https://me.classera.com/", "_blank");

  showToast(
    "Classera Assignment Copied & Portal Opened!",
    "Formatted assignment text copied to clipboard. Paste into Classera Course Material or Assignments.",
    "success",
    5000
  );
  try { SoundFX.playLevelUp(); } catch (e) {}
}

/**
 * Generates responsive iframe embed code for Classera or Google Sites
 */
export function generateLmsEmbedCode(url, title = "Edugates-ClipSAT Science Labs") {
  const fullUrl = getAbsoluteShareUrl(url);
  return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15);">
  <iframe src="${fullUrl}" title="${title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen allow="camera; microphone; fullscreen; clipboard-write; autoplay"></iframe>
</div>`;
}

/**
 * Opens the Universal LMS Sharing Modal dialog
 */
export function openLmsShareModal(shareData = {}) {
  const {
    url = window.location.href,
    title = "Interactive Science Module",
    subject = "STEM Science",
    moduleCode = "",
    description = "Interactive 60 FPS science laboratory simulation and assessment.",
    objectives = []
  } = shareData;

  const fullUrl = getAbsoluteShareUrl(url);

  let existing = document.getElementById("lms-share-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "lms-share-modal-overlay";
  overlay.className = "lms-share-modal-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(2, 6, 23, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 10005;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.2s ease-out;
  `;

  // Generate crisp vector SVG QR Code for Smartboard student scanning
  let qrSvg = "";
  try {
    qrSvg = generateQRSvg(fullUrl, {
      pixelSize: 4,
      margin: 2,
      fgColor: "#0284c7",
      bgColor: "#ffffff"
    });
  } catch (e) {
    qrSvg = `<div style="padding: 20px; color: #ef4444;">QR Generation Unavailable</div>`;
  }

  overlay.innerHTML = `
    <div class="lms-share-modal-shell" style="
      background: rgba(15, 23, 42, 0.98);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
    ">
      <!-- Modal Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(30, 41, 59, 0.6);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #0284c7, #6366f1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" x2="12" y1="2" y2="15"/>
            </svg>
          </div>
          <div>
            <h2 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #f8fafc;">Share &amp; Assign to LMS</h2>
            <div style="font-size: 0.8rem; color: #94a3b8;">Google Classroom • Classera (كلاسيرا) • Smartboard QR</div>
          </div>
        </div>
        <button id="btn-close-lms-modal" style="
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #cbd5e1;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        ">✕</button>
      </div>

      <!-- Activity Summary Banner -->
      <div style="
        padding: 14px 24px;
        background: rgba(2, 132, 199, 0.08);
        border-bottom: 1px solid rgba(2, 132, 199, 0.18);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      ">
        <div>
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: 700;">
            Target Activity:
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">${title}</div>
          <div style="font-size: 0.78rem; color: #94a3b8;">${subject}${moduleCode ? ` • ${moduleCode}` : ""}</div>
        </div>
        <button class="btn btn-sm btn-secondary" id="btn-copy-raw-link" style="padding: 6px 12px; font-size: 0.78rem; display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy URL</span>
        </button>
      </div>

      <!-- Main Sharing Channels Grid -->
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;">
        
        <!-- LMS Primary Action Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <!-- 1. Google Classroom Card -->
          <div style="
            background: rgba(30, 41, 59, 0.7);
            border: 1.5px solid rgba(15, 157, 88, 0.35);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 12px;
            transition: transform 0.15s ease, border-color 0.15s ease;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 44px;
                height: 44px;
                border-radius: 10px;
                background: #0f9d58;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(15, 157, 88, 0.35);
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="15" rx="3" fill="#0F9D58" stroke="#ffffff" stroke-width="1.2"/>
                  <rect x="4" y="5" width="16" height="11" rx="1" fill="#188038"/>
                  <circle cx="12" cy="9" r="2.2" fill="#E8F0FE"/>
                  <path d="M7.8 14.5c0-1.8 1.9-2.8 4.2-2.8s4.2 1 4.2 2.8" fill="#E8F0FE"/>
                  <circle cx="7" cy="9.5" r="1.5" fill="#CEEAD6"/>
                  <path d="M4 14.2c0-1.3 1.3-2 3-2" stroke="#CEEAD6" stroke-width="1.2" stroke-linecap="round"/>
                  <circle cx="17" cy="9.5" r="1.5" fill="#CEEAD6"/>
                  <path d="M20 14.2c0-1.3-1.3-2-3-2" stroke="#CEEAD6" stroke-width="1.2" stroke-linecap="round"/>
                  <path d="M11 18.5h2l.5 2.5h-3z" fill="#F4B400"/>
                </svg>
              </div>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: #ffffff;">Google Classroom</div>
                <div style="font-size: 0.75rem; color: #4ade80;">Assign directly to your Google classes</div>
              </div>
            </div>
            <p style="margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">
              Instantly create a new assignment, announcement, or material in Google Classroom with pre-filled title and link.
            </p>
            <button class="btn" id="btn-action-gclassroom" style="
              background: #0f9d58;
              color: #ffffff;
              font-weight: 700;
              padding: 9px 16px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              box-shadow: 0 4px 14px rgba(15, 157, 88, 0.4);
            ">
              <span>Assign in Google Classroom</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>

          <!-- 2. Classera (كلاسيرا) Card -->
          <div style="
            background: rgba(30, 41, 59, 0.7);
            border: 1.5px solid rgba(147, 51, 234, 0.4);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 12px;
            transition: transform 0.15s ease, border-color 0.15s ease;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 44px;
                height: 44px;
                border-radius: 10px;
                background: linear-gradient(135deg, #7c3aed, #4f46e5);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="#6C2BD9"/>
                  <path d="M6 16.5l6-9 6 9" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7.5" r="2" fill="#FFFFFF"/>
                  <path d="M8.5 13h7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: #ffffff;">Classera (كلاسيرا)</div>
                <div style="font-size: 0.75rem; color: #c084fc;">Course Materials &amp; Online Assignments</div>
              </div>
            </div>
            <p style="margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">
              Copies a rich, formatted activity package with objectives and instructions, then opens the Classera portal.
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <button class="btn" id="btn-action-classera" style="
                background: linear-gradient(135deg, #7c3aed, #6d28d9);
                color: #ffffff;
                font-weight: 700;
                padding: 9px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
              ">
                <span>Open Classera &amp; Copy Post</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-copy-classera-text" style="font-size: 0.76rem; padding: 5px 10px;">
                📋 Copy Classera Activity Text Only
              </button>
            </div>
          </div>
        </div>

        <!-- Lower Section: Smartboard QR Code & Embed Code -->
        <div style="
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 16px;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px;
          align-items: center;
        ">
          <!-- In-Class Smartboard QR Code -->
          <div style="
            background: #ffffff;
            padding: 8px;
            border-radius: 12px;
            width: 144px;
            height: 144px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          ">
            ${qrSvg}
          </div>

          <!-- Secondary Actions & Embed Code -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="font-weight: 700; font-size: 0.88rem; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                <span>📱 Smartboard In-Class Student Scan</span>
              </div>
              <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">
                Students can point their iPad or phone camera directly at the Smartboard to immediately launch this exact simulation.
              </div>
            </div>

            <!-- Embed & Messaging Buttons -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-copy-embed" style="padding: 6px 12px; font-size: 0.78rem; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                <span>Copy &lt;iframe&gt; Embed</span>
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-share-whatsapp" style="padding: 6px 12px; font-size: 0.78rem; display: flex; align-items: center; gap: 6px;">
                <span>💬 WhatsApp</span>
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-share-teams" style="padding: 6px 12px; font-size: 0.78rem; display: flex; align-items: center; gap: 6px;">
                <span>👥 MS Teams</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Remove any pre-existing modal before mounting
  const existingOverlay = document.getElementById("lms-share-modal-overlay");
  if (existingOverlay) {
    try { existingOverlay.remove(); } catch (e) {}
  }

  document.body.appendChild(overlay);

  // Bind Event Listeners
  const closeModal = (e) => {
    if (e && typeof e.preventDefault === "function") {
      try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
    }
    try {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("popstate", closeModal);
      window.removeEventListener("hashchange", closeModal);
      delete window.closeActiveLmsModal;
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      } else if (overlay) {
        overlay.remove();
      }
    } catch (err) {
      console.warn("Failed to remove LMS modal:", err);
    }
    try { SoundFX.playClick(); } catch (e) {}
  };

  const handleEscape = (e) => {
    if (e.key === "Escape" || e.keyCode === 27) {
      closeModal(e);
    }
  };
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("popstate", closeModal, { once: true });
  window.addEventListener("hashchange", closeModal, { once: true });
  window.closeActiveLmsModal = closeModal;

  try { SoundFX.playPop(); } catch (e) {}

  // 1. Close Button ('X')
  const closeBtn = overlay.querySelector("#btn-close-lms-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
    closeBtn.addEventListener("touchend", closeModal);
  }

  // 2. Backdrop Click to Close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.id === "lms-share-modal-overlay") {
      closeModal(e);
    }
  });

  // 3. Stop clicks inside modal shell from propagating to overlay
  const modalShell = overlay.querySelector(".lms-share-modal-shell");
  if (modalShell) {
    modalShell.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Helper for in-place button visual confirmation
  function flashButtonSuccess(btn, successLabel, duration = 2000) {
    if (!btn) return;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<span>${successLabel}</span> ✓`;
    btn.style.borderColor = "#10b981";
    btn.style.color = "#34d399";
    setTimeout(() => {
      try {
        btn.innerHTML = originalHtml;
        btn.style.borderColor = "";
        btn.style.color = "";
      } catch (e) {}
    }, duration);
  }

  // Action: Google Classroom
  const btnGClass = overlay.querySelector("#btn-action-gclassroom");
  btnGClass?.addEventListener("click", (e) => {
    e.preventDefault();
    shareToGoogleClassroom({
      url: fullUrl,
      title: `${subject}: ${title}`,
      description: description,
      objectives: objectives
    });
  });

  // Action: Classera
  const btnClassera = overlay.querySelector("#btn-action-classera");
  btnClassera?.addEventListener("click", async (e) => {
    e.preventDefault();
    flashButtonSuccess(btnClassera, "Post Copied & Opening...");
    await shareToClassera({
      url: fullUrl,
      title: title,
      subject: subject,
      moduleCode: moduleCode,
      objectives: objectives,
      instructions: description
    });
  });

  // Action: Copy Classera Text Only
  const btnCopyClasseraText = overlay.querySelector("#btn-copy-classera-text");
  btnCopyClasseraText?.addEventListener("click", async (e) => {
    e.preventDefault();
    let formattedText = `🎓 Edugates-ClipSAT Science Labs | Classera Learning Assignment\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    formattedText += `🔬 Activity: ${title}\n`;
    formattedText += `📚 Subject: ${subject}${moduleCode ? ` (${moduleCode})` : ""}\n`;
    if (objectives && objectives.length > 0) {
      formattedText += `🎯 Objectives:\n• ` + objectives.join("\n• ") + `\n`;
    }
    formattedText += `🔗 Direct Link:\n${fullUrl}\n`;
    formattedText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    const ok = await safeCopyTextToClipboard(formattedText);
    if (ok) {
      flashButtonSuccess(btnCopyClasseraText, "Copied to Clipboard!");
      showToast("Classera Text Copied", "Paste into Classera Course Material", "success");
      try { SoundFX.playLevelUp(); } catch (e) {}
    } else {
      showToast("Copy Failed", "Please copy manually", "error");
    }
  });

  // Action: Copy Raw URL
  const btnCopyRaw = overlay.querySelector("#btn-copy-raw-link");
  btnCopyRaw?.addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await safeCopyTextToClipboard(fullUrl);
    if (ok) {
      flashButtonSuccess(btnCopyRaw, "URL Copied!");
      showToast("Link Copied!", fullUrl, "success");
      try { SoundFX.playLevelUp(); } catch (e) {}
    } else {
      showToast("Share Link", fullUrl, "info");
    }
  });

  // Action: Copy Embed Code
  const btnCopyEmbed = overlay.querySelector("#btn-copy-embed");
  btnCopyEmbed?.addEventListener("click", async (e) => {
    e.preventDefault();
    const embedHtml = generateLmsEmbedCode(fullUrl, title);
    const ok = await safeCopyTextToClipboard(embedHtml);
    if (ok) {
      flashButtonSuccess(btnCopyEmbed, "Embed Code Copied!");
      showToast("Embed Code Copied!", "Responsive <iframe> ready for Classera / Google Sites", "success");
      try { SoundFX.playLevelUp(); } catch (e) {}
    } else {
      showToast("Embed Code", embedHtml, "info");
    }
  });

  // Action: WhatsApp Share
  const btnWhatsapp = overlay.querySelector("#btn-share-whatsapp");
  btnWhatsapp?.addEventListener("click", (e) => {
    e.preventDefault();
    const text = encodeURIComponent(`🧪 ${subject} - ${title}\nExplore interactive virtual lab:\n${fullUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    try { SoundFX.playScorePip(); } catch (e) {}
  });

  // Action: MS Teams Share
  const btnTeams = overlay.querySelector("#btn-share-teams");
  btnTeams?.addEventListener("click", (e) => {
    e.preventDefault();
    const teamsUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(fullUrl)}&msgText=${encodeURIComponent(`Science Lab: ${title}`)}`;
    window.open(teamsUrl, "_blank", "width=680,height=580");
    try { SoundFX.playScorePip(); } catch (e) {}
  });
}
