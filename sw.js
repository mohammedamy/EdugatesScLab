// Edugates-ClipSAT Science Labs - Offline Service Worker Engine
// Network-First with Cache Fallback for dynamic local scripts & styles,
// Stale-While-Revalidate for external CDNs (KaTeX, Google Fonts).

const CACHE_NAME = "amscilab-pwa-v29";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./index.css",
  "./app.js",
  "./manifest.json",
  "./assets/logo.png",
  "./assets/icons.js",
  "./assets/placeholder-flask.svg",
  "./assets/placeholder-dna.svg",
  "./assets/placeholder-atom.svg",
  "./utils/math-renderer.js",
  "./utils/audio-synth.js",
  "./utils/qr-code.js",
  "./utils/toast.js",
  "./utils/lms-share.js",
  "./utils/docx-export.js",
  "./data/chemistry-curriculum.js",
  "./data/biology-curriculum.js",
  "./data/physics-curriculum.js",
  "./data/lesson-theory-database.js",
  "./data/lesson-interactive-specs.js",
  "./data/question-bank.js",
  "./data/scientific-diagrams.js",
  "./components/module-viewer.js",
  "./components/lesson-interactives.js",
  "./components/lesson-plan-generator.js",
  "./components/progress-tracker.js",
  "./components/quiz-engine.js",
  "./components/smartboard-toolbar.js",
  "./components/science-calculator.js",
  "./components/flashcards.js",
  "./labs/lab-telemetry-exporter.js",
  "./labs/phys-projectile.js",
  "./labs/chem-titration.js",
  "./labs/bio-microscope.js",
  "./labs/chem-periodic-table.js",
  "./labs/phys-circuits.js",
  "./labs/chem-gas-laws.js",
  "./labs/bio-dna-protein.js",
  "./labs/bio-punnett-square.js",
  "./labs/phys-optics.js",
  "./labs/chem-vsepr.js",
  "./labs/phys-waves.js",
  "./labs/bio-photosynthesis.js"
];

// Install: Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Prune stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== "GET") return;

  // External CDNs: Google Fonts, KaTeX (Stale-While-Revalidate)
  if (url.origin.includes("fonts.googleapis.com") || 
      url.origin.includes("fonts.gstatic.com") || 
      url.origin.includes("cdn.jsdelivr.net")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(req).then((cachedResponse) => {
          const fetchPromise = fetch(req).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Local App Shell & Assets (Network-First with Cache Fallback for instant updates)
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === "basic" || networkResponse.type === "default")) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (req.headers.get("accept") && req.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
  );
});
