// Edugates-ClipSAT Science Labs - High-Performance Offline-First Service Worker Engine
// Cache-First for local static assets (core JS, CSS, fonts, simulation models, 4K photos)
// Stale-While-Revalidate for external CDNs (KaTeX, Google Fonts)
// Network-First with Cache Fallback for navigation requests

const CACHE_NAME = "amscilab-pwa-v100";

const CORE_APP_SHELL = [
  "./",
  "./index.html",
  "./404.html",
  "./index.css",
  "./index.css?v=5.5",
  "./index.css?v=5.6",
  "./index.css?v=5.7",
  "./index.css?v=5.8",
  "./index.css?v=5.9",
  "./index.css?v=6.0",
  "./app.js",
  "./app.js?v=5.5",
  "./app.js?v=5.6",
  "./app.js?v=5.7",
  "./app.js?v=5.8",
  "./app.js?v=5.9",
  "./app.js?v=6.0",
  "./manifest.json",
  "./service-worker.js",
  "./sw.js",
  "./assets/labs/microscope_bench.jpg",
  "./assets/bench-photos/bio_microscope.jpg",
  "./assets/logo.png",
  "./assets/apple-touch-icon.png",
  "./assets/hero-social-card-1200x630.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
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
  "./utils/diagram-print-polisher.js",
  "./utils/lab-report-exporter.js",
  "./utils/touch-zoom.js",
  "./data/chemistry-curriculum.js",
  "./data/biology-curriculum.js",
  "./data/physics-curriculum.js",
  "./data/periodic-table-data.js",
  "./data/lesson-theory-database.js",
  "./data/lesson-interactive-specs.js",
  "./data/scientific-diagrams.js",
  "./data/diagrams-chem.js",
  "./data/diagrams-bio.js",
  "./data/diagrams-phys.js",
  "./components/module-viewer.js",
  "./components/lesson-interactives.js",
  "./components/lesson-plan-generator.js",
  "./components/progress-tracker.js",
  "./components/quiz-engine.js",
  "./components/quiz-engine.js?v=3.1",
  "./components/quiz-engine.js?v=3.2",
  "./components/quiz-engine.js?v=3.3",
  "./components/smartboard-toolbar.js",
  "./components/science-calculator.js",
  "./components/flashcards.js",
  "./components/worked-example-solver.js",
  "./components/offline-diagnostics.js",
  "./components/teacher-guide-modal.js",
  "./Edugates_STEM_Labs_Teacher_Guide.pdf",
  "./labs/lab-telemetry-exporter.js"
];

// All 74 Textbook Chapter Opener Photos across Chemistry, Biology & Physics
const CHAPTER_ASSETS = [
  // Chemistry Chapters (1-23)
  "./assets/chapters/chem_m01.jpg",
  "./assets/chapters/chem_m02.jpg",
  "./assets/chapters/chem_m03.jpg",
  "./assets/chapters/chem_m04.jpg",
  "./assets/chapters/chem_m05.jpg",
  "./assets/chapters/chem_m06.jpg",
  "./assets/chapters/chem_m07.jpg",
  "./assets/chapters/chem_m08.jpg",
  "./assets/chapters/chem_m09.jpg",
  "./assets/chapters/chem_m10.jpg",
  "./assets/chapters/chem_m11.jpg",
  "./assets/chapters/chem_m12.jpg",
  "./assets/chapters/chem_m13.jpg",
  "./assets/chapters/chem_m14.jpg",
  "./assets/chapters/chem_m15.jpg",
  "./assets/chapters/chem_m16.jpg",
  "./assets/chapters/chem_m17.jpg",
  "./assets/chapters/chem_m18.jpg",
  "./assets/chapters/chem_m19.jpg",
  "./assets/chapters/chem_m20.jpg",
  "./assets/chapters/chem_m21.jpg",
  "./assets/chapters/chem_m22.jpg",
  "./assets/chapters/chem_m23.jpg",

  // Biology Chapters (1-27)
  "./assets/chapters/bio_m01.jpg",
  "./assets/chapters/bio_m02.jpg",
  "./assets/chapters/bio_m03.jpg",
  "./assets/chapters/bio_m04.jpg",
  "./assets/chapters/bio_m05.jpg",
  "./assets/chapters/bio_m06.jpg",
  "./assets/chapters/bio_m07.jpg",
  "./assets/chapters/bio_m08.jpg",
  "./assets/chapters/bio_m09.jpg",
  "./assets/chapters/bio_m10.jpg",
  "./assets/chapters/bio_m11.jpg",
  "./assets/chapters/bio_m12.jpg",
  "./assets/chapters/bio_m13.jpg",
  "./assets/chapters/bio_m14.jpg",
  "./assets/chapters/bio_m15.jpg",
  "./assets/chapters/bio_m16.jpg",
  "./assets/chapters/bio_m17.jpg",
  "./assets/chapters/bio_m18.jpg",
  "./assets/chapters/bio_m19.jpg",
  "./assets/chapters/bio_m20.jpg",
  "./assets/chapters/bio_m21.jpg",
  "./assets/chapters/bio_m22.jpg",
  "./assets/chapters/bio_m23.jpg",
  "./assets/chapters/bio_m24.jpg",
  "./assets/chapters/bio_m25.jpg",
  "./assets/chapters/bio_m26.jpg",
  "./assets/chapters/bio_m27.jpg",

  // Physics Chapters (1-24)
  "./assets/chapters/phys_m01.jpg",
  "./assets/chapters/phys_m02.jpg",
  "./assets/chapters/phys_m03.jpg",
  "./assets/chapters/phys_m04.jpg",
  "./assets/chapters/phys_m05.jpg",
  "./assets/chapters/phys_m06.jpg",
  "./assets/chapters/phys_m07.jpg",
  "./assets/chapters/phys_m08.jpg",
  "./assets/chapters/phys_m09.jpg",
  "./assets/chapters/phys_m10.jpg",
  "./assets/chapters/phys_m11.jpg",
  "./assets/chapters/phys_m12.jpg",
  "./assets/chapters/phys_m13.jpg",
  "./assets/chapters/phys_m14.jpg",
  "./assets/chapters/phys_m15.jpg",
  "./assets/chapters/phys_m16.jpg",
  "./assets/chapters/phys_m17.jpg",
  "./assets/chapters/phys_m18.jpg",
  "./assets/chapters/phys_m19.jpg",
  "./assets/chapters/phys_m20.jpg",
  "./assets/chapters/phys_m21.jpg",
  "./assets/chapters/phys_m22.jpg",
  "./assets/chapters/phys_m23.jpg",
  "./assets/chapters/phys_m24.jpg"
];

const SECONDARY_ASSETS = [
  "./data/question-bank.js",
  "./data/question-bank-chem.js",
  "./data/question-bank-bio.js",
  "./data/question-bank-phys.js",
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
  "./labs/anatomy-atlas.js",
  "./labs/chem-reaction-kinetics.js",
  "./labs/phys-collisions.js",
  "./labs/phys-induction.js",
  "./labs/bio-osmosis.js",
  "./labs/bio-mitosis.js",
  "./labs/chem-flame-test.js",
  "./labs/chem-precipitation.js",
  "./labs/chem-activity-series.js",
  "./labs/bio-antibiotic-resistance.js",
  "./labs/bio-immune-elisa.js",
  "./labs/bio-plant-transpiration.js",
  "./labs/phys-orbital-mechanics.js",
  "./labs/phys-sound-resonance.js",
  "./labs/phys-electrostatics.js",
  "./data/human-anatomy-atlas-data.js",
  "./assets/labs/human_anatomy_anterior_8k.jpg",
  "./assets/labs/human_anatomy_posterior_8k.jpg",
  "./assets/labs/human_anatomy_skeletal_8k.jpg",
  "./assets/labs/human_anatomy_muscular_8k.jpg",
  "./assets/labs/human_anatomy_heart_8k.jpg",
  "./assets/labs/human_anatomy_brain_8k.jpg",
  "./assets/labs/human_anatomy_lungs_8k.jpg",
  "./assets/labs/human_anatomy_digestive_8k.jpg",
  "./assets/labs/human_anatomy_urinary_8k.jpg",
  "./assets/labs/human_anatomy_cranial_8k.jpg",
  "./assets/labs/human_anatomy_histology_8k.jpg",
  "./assets/labs/human_anatomy_male_reproductive_8k.jpg",
  "./assets/labs/human_anatomy_female_reproductive_8k.jpg",
  "./assets/labs/human_anatomy_heart_coronal_cross_section_8k.jpg",
  "./assets/labs/human_anatomy_layer_skin.png",
  "./assets/labs/human_anatomy_layer_muscular.png",
  "./assets/labs/human_anatomy_layer_skeletal.png",
  "./assets/labs/human_anatomy_layer_visceral.png",
  "./assets/labs/human_anatomy_layer_circulatory.png",
  "./assets/labs/human_anatomy_layer_nervous.png",
  "./assets/labs/human_anatomy_female_layer_skin.png",
  "./assets/labs/human_anatomy_female_layer_muscular.png",
  "./assets/labs/human_anatomy_female_layer_skeletal.png",
  "./assets/labs/human_anatomy_female_layer_visceral.png",
  "./assets/labs/human_anatomy_female_layer_circulatory.png",
  "./assets/labs/human_anatomy_female_layer_nervous.png",
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
  "./assets/bench-photos/bio_microscope.jpg",
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
  "./assets/labs/waves_bench.jpg",
  "./assets/labs/kinetics_bench.jpg",
  "./assets/labs/collisions_bench.jpg",
  "./assets/labs/induction_bench.jpg",
  "./assets/labs/osmosis_bench.jpg",
  "./assets/labs/mitosis_bench.jpg",
  "./assets/labs/flame_test_bench.jpg",
  "./assets/labs/precipitation_bench.jpg",
  "./assets/labs/activity_series_bench.jpg",
  "./assets/labs/antibiotic_bench.jpg",
  "./assets/labs/elisa_bench.jpg",
  "./assets/labs/transpiration_bench.jpg",
  "./assets/labs/orbital_bench.jpg",
  "./assets/labs/sound_resonance_bench.jpg",
  "./assets/labs/electrostatics_bench.jpg",
  "./assets/microscope/onion_mitosis.jpg",
  "./assets/microscope/blood_smear.jpg",
  "./assets/microscope/elodea_cells.jpg",
  "./assets/microscope/paramecium.jpg",
  "./assets/microscope/amoeba_proteus.jpg",
  "./assets/microscope/euglena_gracilis.jpg",
  "./assets/microscope/daphnia_magna.jpg",
  "./assets/microscope/volvox_colony.jpg",
  "./assets/microscope/spirogyra_alga.jpg",
  "./assets/microscope/human_cheek.jpg",
  "./assets/microscope/tilia_stem.jpg",
  "./assets/microscope/motor_neuron.jpg"
];

const CORE_ASSETS = [...CORE_APP_SHELL, ...CHAPTER_ASSETS, ...SECONDARY_ASSETS];

// Install: Pre-cache core shell first, then stream chapter cover photos & secondary lab modules non-blockingly
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Stage 1: Critical App Shell (immediate completion)
      await cache.addAll(CORE_APP_SHELL).catch((err) => {
        console.warn("[AmScLab PWA] Core shell precache non-fatal warning:", err);
      });
      // Stage 2: Stream all 74 Chapter Cover Photos into cache
      const chapterPromises = CHAPTER_ASSETS.map((assetUrl) =>
        cache.add(assetUrl).catch((err) => {
          console.warn("[AmScLab PWA] Chapter image background cache deferred for:", assetUrl, err?.message);
        })
      );
      // Stage 3: Secondary Lab Benches & Media (Non-blocking streaming without stalling install)
      const secondaryPromises = SECONDARY_ASSETS.map((assetUrl) =>
        cache.add(assetUrl).catch((err) => {
          console.warn("[AmScLab PWA] Secondary asset background cache deferred for:", assetUrl, err?.message);
        })
      );
      // Stream assets asynchronously without delaying shell installation
      Promise.allSettled(chapterPromises);
      Promise.allSettled(secondaryPromises);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Prune stale caches across version updates and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith("amscilab-pwa-") && key !== CACHE_NAME) {
            console.log("[AmScLab PWA] Purging outdated cache store:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Optimized routing strategies
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Strategy 1: Stale-While-Revalidate for External CDNs (KaTeX, Google Fonts, CDNjs)
  if (
    url.origin.includes("fonts.googleapis.com") ||
    url.origin.includes("fonts.gstatic.com") ||
    url.origin.includes("cdn.jsdelivr.net")
  ) {
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

  // Strategy 2: Network-First for Navigation / HTML Documents
  if (req.mode === "navigate" || (req.headers.get("accept") && req.headers.get("accept").includes("text/html"))) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            return cachedResponse || caches.match("./index.html");
          });
        })
    );
    return;
  }

  // Strategy 3: Cache-First for Static Assets (Core JS, CSS, Images, SVGs, Models, Bench Photos)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately for 0-latency 60 FPS performance
        return cachedResponse;
      }
      return caches.match(req, { ignoreSearch: true }).then((fuzzyMatch) => {
        if (fuzzyMatch) {
          return fuzzyMatch;
        }
        // Cache miss: fetch from network, populate cache, and return
        return fetch(req).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" || networkResponse.type === "default" || networkResponse.type === "cors")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
          }
          return networkResponse;
        }).catch((err) => {
          console.warn("[AmScLab PWA] Offline fetch fallback for:", req.url, err);
          if (url.pathname.includes("microscope_bench.jpg") || url.pathname.includes("bio_microscope.jpg")) {
            return caches.match("./assets/labs/microscope_bench.jpg").then((res) => res || caches.match("./assets/bench-photos/bio_microscope.jpg"));
          }
          if (url.pathname.includes("/assets/chapters/")) {
            if (url.pathname.includes("bio_")) return caches.match("./assets/placeholder-dna.svg");
            if (url.pathname.includes("phys_")) return caches.match("./assets/placeholder-atom.svg");
            return caches.match("./assets/placeholder-flask.svg");
          }
        });
      });
    })
  );
});
