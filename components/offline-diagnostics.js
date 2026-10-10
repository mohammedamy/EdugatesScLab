// Edugates-ClipSAT Science Labs - Offline Diagnostics & Storage Quota Panel
// Live PWA cache inspection, storage quota estimation, offline readiness audit, and one-click field trip precaching.

import { SoundFX } from "../utils/audio-synth.js";
import { showToast } from "../utils/toast.js";

const CURRENT_CACHE_NAME = "amscilab-pwa-v102";

// Core and Secondary assets to audit for 100% offline classroom readiness
const AUDIT_TARGETS = [
  { name: "App Shell (HTML)", url: "./index.html", critical: true },
  { name: "Core Stylesheet", url: "./index.css", critical: true },
  { name: "Main Application Engine", url: "./app.js", critical: true },
  { name: "Math Renderer Engine", url: "./utils/math-renderer.js", critical: true },
  { name: "Smartboard Classroom Toolbar", url: "./components/smartboard-toolbar.js", critical: true },
  { name: "Teacher Implementation Guide Modal", url: "./components/teacher-guide-modal.js", critical: false },
  { name: "Teacher Implementation Guide (PDF)", url: "./Edugates_STEM_Labs_Teacher_Guide.pdf", critical: false },
  { name: "Worked Example Solver", url: "./components/worked-example-solver.js", critical: true },
  { name: "Lesson Module Viewer", url: "./components/module-viewer.js", critical: true },
  { name: "Chemistry Curriculum Data", url: "./data/chemistry-curriculum.js", critical: true },
  { name: "Biology Curriculum Data", url: "./data/biology-curriculum.js", critical: true },
  { name: "Physics Curriculum Data", url: "./data/physics-curriculum.js", critical: true },
  { name: "Lesson Theory Database", url: "./data/lesson-theory-database.js", critical: true },
  { name: "7,292 Assessment Bank", url: "./data/question-bank.js", critical: true },
  { name: "Chemistry Question Chunk", url: "./data/question-bank-chem.js", critical: false },
  { name: "Biology Question Chunk", url: "./data/question-bank-bio.js", critical: false },
  { name: "Physics Question Chunk", url: "./data/question-bank-phys.js", critical: false },
  { name: "Projectile Virtual Lab", url: "./labs/phys-projectile.js", critical: false },
  { name: "Titration Virtual Lab", url: "./labs/chem-titration.js", critical: false },
  { name: "Microscope Virtual Lab", url: "./labs/bio-microscope.js", critical: false },
  { name: "Periodic Table Virtual Lab", url: "./labs/chem-periodic-table.js", critical: false },
  { name: "4K Human Anatomy Atlas", url: "./labs/anatomy-atlas.js", critical: false },
  { name: "Human Anatomy Atlas Data", url: "./data/human-anatomy-atlas-data.js", critical: false }
];

export async function getStorageEstimate() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || (1024 * 1024 * 1024); // Fallback 1GB
      const usageMB = (usageBytes / (1024 * 1024)).toFixed(1);
      const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
      const quotaGB = (quotaBytes / (1024 * 1024 * 1024)).toFixed(1);
      const percentUsed = ((usageBytes / quotaBytes) * 100).toFixed(2);
      let isPersisted = false;
      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
      return {
        supported: true,
        usageBytes,
        quotaBytes,
        usageMB,
        quotaMB,
        quotaGB,
        percentUsed,
        isPersisted
      };
    } catch (e) {
      return { supported: false, error: e.message };
    }
  }
  return { supported: false, error: "Storage API not supported on this platform" };
}

export async function getCacheStatistics() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return { supported: false, cacheCount: 0, itemsInCurrent: 0, cacheNames: [] };
  }
  try {
    const keys = await caches.keys();
    let currentItemsCount = 0;
    if (keys.includes(CURRENT_CACHE_NAME)) {
      const currentCache = await caches.open(CURRENT_CACHE_NAME);
      const matchedRequests = await currentCache.keys();
      currentItemsCount = matchedRequests.length;
    }
    return {
      supported: true,
      cacheNames: keys,
      cacheCount: keys.length,
      currentCacheName: CURRENT_CACHE_NAME,
      itemsInCurrent: currentItemsCount
    };
  } catch (e) {
    return { supported: false, error: e.message, cacheNames: [] };
  }
}

export function openOfflineDiagnosticsModal() {
  let overlay = document.getElementById("offline-diagnostics-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "offline-diagnostics-overlay";
  overlay.className = "modal-overlay modal-fullscreen";
  overlay.style.display = "flex";
  overlay.style.setProperty("z-index", "200150", "important"); // Above all modals and tools
  document.body.appendChild(overlay);

  function closeModal() {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    SoundFX.playClick();
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", handleKeydown);
    }
  }
  document.addEventListener("keydown", handleKeydown);

  overlay.innerHTML = `
    <div class="modal-content-shell is-fullscreen" style="max-width: 960px; margin: auto; max-height: 92vh; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-surface, #0f172a); border: 1.5px solid rgba(56,189,248,0.3); box-shadow: 0 24px 60px rgba(0,0,0,0.7);">
      <!-- Header -->
      <div class="modal-header" style="padding: 16px 24px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); display: flex; align-items: center; justify-content: space-between; background: rgba(15,23,42,0.85);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.35); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
            📡
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #fff;">Offline Diagnostics &amp; Storage Quota</h3>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
              PWA Service Worker Engine • ${CURRENT_CACHE_NAME}
            </div>
          </div>
        </div>
        <button id="btn-close-offline-diag" class="modal-close-btn" style="border: none; background: transparent; color: var(--text-muted); font-size: 1.25rem; cursor: pointer; padding: 6px 12px; border-radius: 6px;">✕</button>
      </div>

      <!-- Scrollable Body -->
      <div style="padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Status Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <!-- Card 1: Network Status -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 10px; padding: 16px;">
            <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Network Connectivity</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="diag-net-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${navigator.onLine ? '#10b981' : '#f59e0b'}; box-shadow: 0 0 8px ${navigator.onLine ? '#10b981' : '#f59e0b'};"></span>
              <span id="diag-net-label" style="font-weight: 800; font-size: 1rem; color: ${navigator.onLine ? '#10b981' : '#f59e0b'};">
                ${navigator.onLine ? 'ONLINE (Network Ready)' : 'OFFLINE (PWA Isolated)'}
              </span>
            </div>
            <div id="diag-ping-disp" style="font-size: 0.78rem; color: var(--text-dim); margin-top: 6px; font-family: var(--font-mono);">Ping: Measuring...</div>
          </div>

          <!-- Card 2: Service Worker State -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 10px; padding: 16px;">
            <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Service Worker Controller</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">⚙️</span>
              <span id="diag-sw-status" style="font-weight: 800; font-size: 0.95rem; color: #38bdf8;">
                ${"serviceWorker" in navigator && navigator.serviceWorker.controller ? 'Active (Controlling Page)' : 'Initializing / Bypass'}
              </span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 6px; font-family: var(--font-mono);">
              Cache Name: ${CURRENT_CACHE_NAME}
            </div>
          </div>

          <!-- Card 3: Storage Quota -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 10px; padding: 16px;">
            <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Storage Quota Allocation</div>
            <div id="diag-storage-text" style="font-weight: 800; font-size: 0.95rem; color: #fff; margin-bottom: 6px;">
              Estimating...
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden; margin-bottom: 6px;">
              <div id="diag-storage-meter" style="height: 100%; width: 0%; background: #0284c7; transition: width 0.3s ease;"></div>
            </div>
            <div id="diag-persist-badge" style="font-size: 0.75rem; color: var(--text-dim);">Storage Persistence: Checking...</div>
          </div>
        </div>

        <!-- Action Center -->
        <div style="background: rgba(15,23,42,0.4); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 12px; padding: 18px;">
          <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
            <span>⚡</span> One-Click Classroom Management Actions
          </h4>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="btn-run-audit" style="padding: 10px 18px; border-radius: 8px; background: #0284c7; color: #fff; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>🔍</span> Run Offline Readiness Audit
            </button>
            <button id="btn-precache-all" style="padding: 10px 18px; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #10b981; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>📦</span> Pre-cache All 30 Labs for Field Trip
            </button>
            <button id="btn-req-persist" style="padding: 10px 16px; border-radius: 8px; background: transparent; border: 1px solid var(--border-color); color: var(--text-main); font-weight: 600; font-size: 0.85rem; cursor: pointer;">
              🔒 Request Permanent Storage
            </button>
            <button id="btn-export-telemetry" style="padding: 10px 16px; border-radius: 8px; background: transparent; border: 1px solid var(--border-color); color: var(--text-main); font-weight: 600; font-size: 0.85rem; cursor: pointer;">
              📋 Export Diagnostics Log
            </button>
            <button id="btn-force-reload-cache" style="padding: 10px 16px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
              🧹 Clear Cache &amp; Reset
            </button>
          </div>
          <!-- Progress bar for precache / audit -->
          <div id="diag-action-progress-container" style="display: none; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">
              <span id="diag-action-status-text">Processing...</span>
              <span id="diag-action-pct">0%</span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div id="diag-action-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #0284c7, #10b981); transition: width 0.15s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Audit Target Results Table -->
        <div style="background: rgba(15,23,42,0.4); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 12px; padding: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span>🧪</span> Essential Offline Assets Audit (${AUDIT_TARGETS.length} Key Subsystems)
            </h4>
            <span id="diag-audit-summary-badge" style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px;">
              Click 'Run Offline Readiness Audit'
            </span>
          </div>

          <div style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); color: var(--text-muted);">
                  <th style="padding: 8px 14px;">Status</th>
                  <th style="padding: 8px 14px;">Asset Name</th>
                  <th style="padding: 8px 14px;">Local URL</th>
                  <th style="padding: 8px 14px;">Role</th>
                </tr>
              </thead>
              <tbody id="diag-audit-table-body">
                ${AUDIT_TARGETS.map(t => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-muted);">
                    <td style="padding: 8px 14px; font-weight: 700;" id="audit-status-${t.url.replace(/[^a-zA-Z0-9]/g, '_')}">⏳ Pending</td>
                    <td style="padding: 8px 14px; color: var(--text-main); font-weight: 600;">${t.name}</td>
                    <td style="padding: 8px 14px; font-family: var(--font-mono); font-size: 0.78rem;">${t.url}</td>
                    <td style="padding: 8px 14px;">${t.critical ? '<span style="color:#ef4444; font-weight:700;">Critical Shell</span>' : '<span style="color:#38bdf8;">Virtual Lab</span>'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind close buttons
  const btnClose = overlay.querySelector("#btn-close-offline-diag");
  if (btnClose) btnClose.addEventListener("click", closeModal);

  // Ping test
  async function runPing() {
    const pingDisp = overlay.querySelector("#diag-ping-disp");
    if (!navigator.onLine) {
      if (pingDisp) pingDisp.textContent = "Ping: Offline (Disconnected)";
      return;
    }
    const t0 = performance.now();
    try {
      await fetch("./manifest.json?t=" + Date.now(), { cache: "no-store", method: "HEAD" });
      const t1 = performance.now();
      const rtt = Math.round(t1 - t0);
      if (pingDisp) pingDisp.textContent = `Ping: ${rtt} ms (Server Responding)`;
    } catch (e) {
      if (pingDisp) pingDisp.textContent = "Ping: Cache Fallback Active";
    }
  }
  runPing();

  // Load storage estimates
  async function refreshStorageView() {
    const est = await getStorageEstimate();
    const storageText = overlay.querySelector("#diag-storage-text");
    const storageMeter = overlay.querySelector("#diag-storage-meter");
    const persistBadge = overlay.querySelector("#diag-persist-badge");

    if (est.supported) {
      if (storageText) storageText.textContent = `${est.usageMB} MB Used / ${est.quotaGB} GB Allocated (${est.percentUsed}%)`;
      if (storageMeter) storageMeter.style.width = `${Math.max(1, Math.min(100, parseFloat(est.percentUsed)))}%`;
      if (persistBadge) {
        persistBadge.innerHTML = est.isPersisted
          ? `<span style="color: #10b981; font-weight: 700;">🔒 Permanent Storage Guaranteed (Never Evicted)</span>`
          : `<span style="color: #f59e0b; font-weight: 700;">⚠️ Best-Effort Storage (Can be evicted under low disk)</span>`;
      }
    } else {
      if (storageText) storageText.textContent = "Local Storage / IndexedDB Active";
      if (persistBadge) persistBadge.textContent = est.error || "Storage estimation unavailable";
    }
  }
  refreshStorageView();

  // Audit runner
  async function runAudit() {
    SoundFX.playClick();
    const progressContainer = overlay.querySelector("#diag-action-progress-container");
    const statusBar = overlay.querySelector("#diag-action-bar");
    const statusText = overlay.querySelector("#diag-action-status-text");
    const pctDisp = overlay.querySelector("#diag-action-pct");
    const summaryBadge = overlay.querySelector("#diag-audit-summary-badge");

    if (progressContainer) progressContainer.style.display = "block";
    let passed = 0;
    const total = AUDIT_TARGETS.length;

    for (let i = 0; i < total; i++) {
      const target = AUDIT_TARGETS[i];
      const safeId = target.url.replace(/[^a-zA-Z0-9]/g, '_');
      const cell = overlay.querySelector(`#audit-status-${safeId}`);
      if (statusText) statusText.textContent = `Auditing ${target.name}...`;
      const pct = Math.round(((i + 1) / total) * 100);
      if (pctDisp) pctDisp.textContent = `${pct}%`;
      if (statusBar) statusBar.style.width = `${pct}%`;

      let ok = false;
      try {
        if ("caches" in window) {
          const matched = await caches.match(target.url);
          if (matched) {
            ok = true;
          }
        }
        if (!ok) {
          const resp = await fetch(target.url, { cache: "force-cache" });
          ok = resp.ok;
        }
      } catch (err) {
        ok = false;
      }

      if (cell) {
        if (ok) {
          cell.innerHTML = `<span style="color: #10b981;">✅ Cached</span>`;
          passed++;
        } else {
          cell.innerHTML = `<span style="color: #ef4444;">❌ Missing</span>`;
        }
      }
    }

    if (statusText) statusText.textContent = `Audit Complete: ${passed} of ${total} subsystems ready offline.`;
    if (summaryBadge) {
      summaryBadge.textContent = `${passed}/${total} Ready (${Math.round((passed/total)*100)}%)`;
      summaryBadge.style.color = passed === total ? "#10b981" : "#f59e0b";
    }
    if (passed === total) {
      SoundFX.playSuccess();
    } else {
      SoundFX.playClick();
    }
  }

  // Precache all
  async function precacheAll() {
    SoundFX.playClick();
    const progressContainer = overlay.querySelector("#diag-action-progress-container");
    const statusBar = overlay.querySelector("#diag-action-bar");
    const statusText = overlay.querySelector("#diag-action-status-text");
    const pctDisp = overlay.querySelector("#diag-action-pct");

    if (!("caches" in window)) {
      showToast("CacheStorage not supported in this browser.", "error");
      return;
    }

    if (progressContainer) progressContainer.style.display = "block";

    try {
      const cache = await caches.open(CURRENT_CACHE_NAME);
      const allUrls = AUDIT_TARGETS.map(t => t.url);
      let loaded = 0;

      for (let i = 0; i < allUrls.length; i++) {
        const u = allUrls[i];
        if (statusText) statusText.textContent = `Pre-caching: ${u}`;
        const pct = Math.round(((i + 1) / allUrls.length) * 100);
        if (pctDisp) pctDisp.textContent = `${pct}%`;
        if (statusBar) statusBar.style.width = `${pct}%`;

        try {
          await cache.add(u);
          loaded++;
        } catch (e) {
          console.warn("Precache failed for:", u, e);
        }
      }

      if (statusText) statusText.textContent = `✅ Successfully pre-cached ${loaded} assets into ${CURRENT_CACHE_NAME}!`;
      refreshStorageView();
      runAudit();
      SoundFX.playChime();
      showToast(`Field Trip Mode Ready: ${loaded} assets cached for 100% offline use.`, "success", 4000);
    } catch (err) {
      if (statusText) statusText.textContent = `Pre-cache error: ${err.message}`;
    }
  }

  // Persistent storage request
  async function reqPersist() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const granted = await navigator.storage.persist();
        if (granted) {
          showToast("Permanent offline storage granted! Browser will not clear science lab cache.", "success", 3500);
          SoundFX.playSuccess();
        } else {
          showToast("Browser denied permanent storage request. Standard quota will remain active.", "info", 3500);
        }
        refreshStorageView();
      } catch (e) {
        showToast("Storage persistence request failed: " + e.message, "error");
      }
    }
  }

  // Export telemetry report
  async function exportTelemetry() {
    const est = await getStorageEstimate();
    const cacheStats = await getCacheStatistics();
    const report = {
      timestamp: new Date().toISOString(),
      appName: "Edugates-ClipSAT Science Labs",
      version: "4.2.0",
      online: navigator.onLine,
      serviceWorkerControlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      activeCacheName: CURRENT_CACHE_NAME,
      cacheStats,
      storageEstimate: est,
      userAgent: navigator.userAgent,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1
      },
      auditTargets: AUDIT_TARGETS.map(t => ({ name: t.name, url: t.url, critical: t.critical }))
    };

    const jsonStr = JSON.stringify(report, null, 2);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
        showToast("Diagnostics telemetry copied to clipboard!", "success");
      } else {
        const blob = new Blob([jsonStr], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `edugates-offline-diagnostics-${Date.now()}.json`;
        a.click();
        showToast("Diagnostics telemetry file downloaded!", "success");
      }
      SoundFX.playClick();
    } catch (e) {
      showToast("Unable to export telemetry: " + e.message, "error");
    }
  }

  // Clear cache and force reload
  async function clearAndReload() {
    if (confirm("Clear local offline cache and force a clean re-synchronization from the server?")) {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      window.location.reload(true);
    }
  }

  // Bind actions
  const btnAudit = overlay.querySelector("#btn-run-audit");
  const btnPrecache = overlay.querySelector("#btn-precache-all");
  const btnPersist = overlay.querySelector("#btn-req-persist");
  const btnTelemetry = overlay.querySelector("#btn-export-telemetry");
  const btnClear = overlay.querySelector("#btn-force-reload-cache");

  if (btnAudit) btnAudit.addEventListener("click", runAudit);
  if (btnPrecache) btnPrecache.addEventListener("click", precacheAll);
  if (btnPersist) btnPersist.addEventListener("click", reqPersist);
  if (btnTelemetry) btnTelemetry.addEventListener("click", exportTelemetry);
  if (btnClear) btnClear.addEventListener("click", clearAndReload);

  // Auto-run initial audit after brief delay
  setTimeout(() => {
    runAudit();
  }, 120);
}
