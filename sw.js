// Edugates-ClipSAT Science Labs - Offline Service Worker Engine
// Network-First with Cache Fallback for dynamic local scripts & styles,
// Stale-While-Revalidate for external CDNs (KaTeX, Google Fonts).

const CACHE_NAME = "amscilab-pwa-v39";

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
  "./labs/bio-photosynthesis.js",
  "./labs/chem-calorimetry.js",
  "./labs/chem-equilibrium.js",
  "./labs/chem-electrochem.js",
  "./labs/phys-harmonic.js",
  "./labs/phys-photoelectric.js",
  "./labs/phys-magnetism.js",
  "./labs/bio-enzyme-kinetics.js",
  "./labs/bio-respiration.js",
  "./labs/chem-beer-lambert.js",
  "./labs/chem-nuclear-decay.js",
  "./labs/chem-colligative.js",
  "./labs/chem-organic-reactions.js",
  "./labs/bio-gel-electrophoresis.js",
  "./labs/bio-population-ecology.js",
  "./labs/bio-action-potential.js",
  "./labs/phys-rotational-dynamics.js",
  "./labs/phys-thermal-conduction.js",
  "./labs/phys-fluids-buoyancy.js",
  "./assets/labs/action_potential_bench.jpg",
  "./assets/labs/beer_lambert_bench.jpg",
  "./assets/labs/calorimetry_bench.jpg",
  "./assets/labs/circuits_bench.jpg",
  "./assets/labs/colligative_bench.jpg",
  "./assets/labs/conduction_bench.jpg",
  "./assets/labs/dna_structure.jpg",
  "./assets/labs/ecology_bench.jpg",
  "./assets/labs/electrochem_bench.jpg",
  "./assets/labs/electrophoresis_bench.jpg",
  "./assets/labs/element_samples.jpg",
  "./assets/labs/enzymes_bench.jpg",
  "./assets/labs/equilibrium_bench.jpg",
  "./assets/labs/fluids_bench.jpg",
  "./assets/labs/gas_laws_bench.jpg",
  "./assets/labs/harmonic_bench.jpg",
  "./assets/labs/magnetism_bench.jpg",
  "./assets/labs/microscope_bench.jpg",
  "./assets/labs/nuclear_decay_bench.jpg",
  "./assets/labs/optics_bench.jpg",
  "./assets/labs/organic_bench.jpg",
  "./assets/labs/photoelectric_bench.jpg",
  "./assets/labs/photosynthesis_bench.jpg",
  "./assets/labs/projectile_bench.jpg",
  "./assets/labs/punnett_bench.jpg",
  "./assets/labs/respiration_bench.jpg",
  "./assets/labs/rotational_bench.jpg",
  "./assets/labs/titration_bench.jpg",
  "./assets/labs/vsepr_bench.jpg",
  "./assets/labs/waves_bench.jpg"
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
