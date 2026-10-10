# Edugates-ClipSAT Science Labs (EdugatesScLab)

An enterprise-grade, world-class virtual science laboratory and interactive STEM educational platform covering **Inspire Chemistry**, **Inspire Biology**, and **Inspire Physics** curricula. Engineered for 4K Interactive Flat Panels (MAXHUB, Promethean, SMART Board), Desktop PCs, Chromebooks, Tablets, and Mobile devices with 100% offline PWA capabilities.

---

## 📊 Platform Architecture & Curriculum Metrics

| Curriculum Domain | Modules / Chapters | Interactive Lessons | Question Bank Items | Dedicated Virtual Labs |
| :--- | :---: | :---: | :---: | :---: |
| 🧪 **Inspire Chemistry** | 23 | 89 | 2,670 | 15 Workbenches |
| 🧬 **Inspire Biology** | 27 | 81 | 2,430 | 15 Workbenches |
| ⚡ **Inspire Physics** | 24 | 72 | 2,160 | 16 Workbenches |
| **Total Platform Scope** | **74 Chapters** | **242 Lessons** | **7,260 Questions (+ 230 Checkpoints)** | **46 Virtual Labs** |

- **Zero-Drop Standard**: 100% curriculum coverage across all 74 NGSS and AP-aligned chapters.
- **Formulas & Theory**: Every lesson features college-level physical mechanics, SI parameters, KaTeX math formulations, particulate mechanisms, and real-world STEM applications.
- **Scientific Models**: 20 flagship vector SVG diagrams (DNA replication forks, Photoelectric effect, Le Chatelier shifts, Rutherford gold foil, Thylakoid Z-scheme, and more).

---

## 🌟 Core Interactive Pillars

### 1. ⛶ Edge-to-Edge Fullscreen Presentation Mode (Zero-Box Architecture)
Eliminates the cramped centered modal box for classroom smartboard delivery:
- **True Edge-to-Edge Layout**: Lessons open in an expansive $100\text{vw} \times 100\text{vh}$ presentation viewport (`.modal-fullscreen`), utilizing the entire width of 65"–86" interactive panels.
- **Standard / Fullscreen View Toggle**: One-click header button (`#btn-header-fullscreen-modal`) to seamlessly toggle between edge-to-edge presentation mode and windowed view.
- **In-Class Live Annotation Layering**: Active Smartboard drawing canvas and pen toolbar (`z-index: 200080` & `200090`) float *above* the lesson modal, allowing teachers to highlight formulas, draw force vectors, and annotate live running simulations without pausing or closing dialogs.
- **Dynamic Simulation Canvas Zoom**: In-modal zoom controls (`−`, `100%`, `+`, `⟲`) allow scaling simulations from **60% to 250%** with hardware-accelerated transform scaling.

### 2. 🧮 Interactive Step-by-Step Worked Example Solvers
Bridges conceptual theory with quantitative problem-solving through guided practice:
- **Dual Mode Switcher**:
  - **📖 Reference Solution**: Complete, specialist-verified derivations with given data and final calculated results.
  - **⚡ Interactive Step-by-Step Solver**: Guided calculation engine that breaks problems into sequential intermediate checkpoints (e.g. Molar Mass $\rightarrow$ Chemical Moles $\rightarrow$ Molarity).
- **Mathematical Tolerance & Format Parsing**: Supports numbers with SI tolerance ($\pm 2-3\%$), scientific notation (e.g. `6.00e-11` or `6.00 * 10^-11`), percentages (e.g. `1.64%`), and physical unit labels.
- **Pedagogical Scaffolding**: On-demand formula hints ("💡 Hint"), fallback reveals ("Reveal Step"), instant feedback banners, and audio chime celebrations (`SoundFX.playChime()`) upon mastery.
- **Universal Synthesis Engine**: Automatically derives solver steps for all 74 modules while offering bespoke step sequences for flagship benchmark topics.

### 3. 📡 Offline Diagnostics & Storage Quota Panel
Guarantees uninterrupted classroom delivery in school networks with intermittent or zero internet connectivity:
- **Live Connection Monitor**: Real-time online/offline detection with latency ping measurement.
- **Storage Quota Inspection**: Uses `navigator.storage.estimate()` to report active cache footprint (MB used, GB quota, percentage meter).
- **Persistent Storage Locking**: Calls `navigator.storage.persist()` to protect laboratory simulations and question banks from automated browser disk eviction.
- **One-Click Field Trip Precaching**: Pre-caches all 46 virtual lab engines, curriculum theory databases, and media assets into CacheStorage (`amscilab-pwa-v53`).
- **Offline Health Check**: Verifies 16 essential subsystems (HTML shell, CSS, engines, data, labs) with visual status indicators.
- **Quick Access**: Open via Pen Toolbar button (`#sb-tool-offline`) or universal keyboard shortcut **`O`**.

### 4. 🖍️ Smartboard Classroom Toolbar (10 Interactive Tools)
Floating, draggable, and bottom-dockable teacher presentation suite:
- **Smartboard Pen & Fluorescent Highlighter**: 1–40px dynamic stroke width with presets (2px, 5px, 10px, 20px, 32px) and 7 high-contrast scientific colors.
- **Classroom Countdown Timer & Stopwatch** (Hot-key: `T`): Paced to 30 FPS on smartboards to eliminate dropped frames.
- **Screen Reveal Curtain** (Hot-key: `C`): Hide/reveal questions or solutions during classroom lectures.
- **Spotlight Focus Mode** (Hot-key: `S`): Circular focus aperture emphasizing key diagram elements.
- **Calibrated Science Ruler** (Hot-key: `M`): Precision metric/inch screen measurement tool.
- **180° Transparent Protractor** (Hot-key: `P`): Measure angles on optics rays, trajectories, and orbital planes.
- **Scientific Pocket Calculator** (Hot-key: `K`): Full scientific math calculator with physical constants ($c, G, h, N_A, R$).
- **LMS QR Code & Deep Link Sharing** (Hot-key: `Q`): Instant student join QR code for phones and Google Classroom / Classera integration.
- **Offline Diagnostics & Quota** (Hot-key: `O`): Check cache health and trigger full offline precaching.
- **Fullscreen Presentation Mode** (Hot-key: `F`): Full browser presentation toggle.

---

## 🔬 46 Virtual Laboratory Simulation Catalog

### 🧪 Chemistry Laboratory Workbenches (15 Workbenches)
1. **Acid-Base Titration & pH Curve Analyzer** (`#labs/titration`): Real-time burette titrant drop simulation, strong/weak acid-base equilibria, Henderson-Hasselbalch buffer calculations, indicator color transitions, and automated derivative inflection titration curves.
2. **Precision Periodic Table & Quantum Orbitals** (`#labs/ptable`): All 118 IUPAC elements with standard weights, electron configurations, Bohr models, real-world photographs, and periodic trends (electronegativity, ionization energy, atomic radius).
3. **Ideal Gas Laws & Kinetic Molecular Theory** (`#labs/gaslaws`): Boyle's, Charles's, Gay-Lussac's, and Avogadro's laws with particle collision velocity histograms and piston pressure-volume dynamics.
4. **Calorimetry & Enthalpy of Reaction** (`#labs/calorimetry`): Coffee-cup and bomb calorimeter simulations, specific heat determinations, and exothermic/endothermic dissolution curves ($q = mc\Delta T$).
5. **Chemical Equilibrium & Le Chatelier Shifts** (`#labs/equilibrium`): Reversible Haber-Bosch and cobalt complex reactions with real-time stress response to temperature, pressure, and concentration shifts ($Q \text{ vs } K_{eq}$).
6. **Electrochemistry & Galvanic Cells** (`#labs/electrochem`): Standard reduction potentials, zinc-copper Daniell cells, salt bridge ion migration, and Nernst equation voltage calculations.
7. **Spectrophotometry & Beer-Lambert Law** (`#labs/beerlambert`): Monochromator wavelength selection, cuvette path length adjustments, and molar absorptivity calibration curves ($A = \epsilon b c$).
8. **VSEPR Molecular Geometry & Polarity** (`#labs/vsepr`): 3D interactive molecular geometry viewer across electron domains ($AX_2$ to $AX_6$), dipole moments, and hybridization states ($sp, sp^2, sp^3, sp^3d, sp^3d^2$).
9. **Nuclear Decay & Radiometric Half-Life** (`#labs/decay`): Alpha, beta, and gamma radiation shielding, radioactive decay curves ($N(t) = N_0 e^{-\lambda t}$), and carbon-14 dating simulation.
10. **Colligative Properties & Freezing-Point Depression** (`#labs/colligative`): Osmotic pressure, boiling point elevation, and cryoscopic freezing point depression with van 't Hoff factor calculations ($\Delta T_f = i K_f m$).
11. **Chemical Kinetics & Reaction Rates** (`#labs/kinetics`): Real 4K laboratory bench, iodine clock reaction, spectrophotometric absorbance tracking, initial rates method, Arrhenius activation energy ($E_a$), and catalyst activation barrier reduction.
12. **Organic Reaction Mechanisms & Stereochemistry** (`#labs/organic`): $S_N1, S_N2, E1, E2$ reaction pathways, carbocation intermediate stabilization, transition states, and enantiomer stereochemical inversion.
13. **Flame Test & Atomic Emission Spectroscopy** (`#labs/flametest`): Bunsen burner excitation of metal cations ($\text{Li}^+, \text{Na}^+, \text{K}^+, \text{Cu}^{2+}, \text{Sr}^{2+}, \text{Ba}^{2+}$), Bohr electronic energy level transitions ($\Delta E = h\nu = hc/\lambda$), continuous spectroscope prism diffraction, and spectral line wavelength readouts.
14. **Precipitation Reactions & Solubility Rules** (`#labs/precipitation`): Double replacement reactions, dynamic ionic solubility matrix ($K_{sp}$), net ionic equations, precipitate crystallization animations, and gravimetric filtration analysis.
15. **Metal Reactivity & Activity Series** (`#labs/activityseries`): Single replacement redox reactions across standard activity series ($\text{Li} \rightarrow \text{Au}$), standard reduction potentials ($E^\circ$), micro-bubble hydrogen gas evolution, and galvanic surface plating.

### 🧬 Biology Laboratory Workbenches (15 Workbenches)
1. **4K Ultra-HD Human Anatomy & Histology Atlas** (`#labs/anatomy`): 13 dedicated 8K medical plates, dual male/female 6-strata dissection engine, real physiological 60 FPS cardiac cycle biomechanics with continuous nodal myocardial mesh and S1/S2 acoustic triggers, Nephron countercurrent multiplier, and interactive pin challenge.
2. **Virtual Compound Microscope & Micrograph Suite** (`#labs/microscope`): 40x, 100x, 400x, and 1000x oil-immersion lenses, fine/coarse focus knobs, slide stage translation, and cellular specimen library (onion epidermis, human blood smear, paramecium, chloroplasts).
3. **DNA Transcription & Protein Translation** (`#labs/dnaprotein`): Double-helix unzipping, RNA Polymerase transcription, mRNA ribosome translation, tRNA anticodon binding, and genetic code codon chart mapping.
4. **Mendelian & Dihybrid Punnett Squares** (`#labs/punnett`): Monohybrid and dihybrid cross generators, phenotypic/genotypic probability distributions, and non-Mendelian incomplete dominance/codominance.
5. **Photosynthesis & Cellular Respiration** (`#labs/photosynthesis`): Light-dependent thylakoid reactions, Calvin cycle, oxygen production vs light intensity/wavelength, and carbon dioxide consumption curves.
6. **Enzyme Kinetics & Michaelis-Menten Metrology** (`#labs/enzymes`): Substrate concentration curves, $V_{\max}$ and $K_m$ calculation, competitive/non-competitive enzyme inhibition, and temperature/pH denaturation.
7. **Cellular Respiration & Respirometry** (`#labs/respiration`): Seed germination respirometer, KOH carbon dioxide scrubber, and oxygen consumption rate quantification.
8. **Agarose Gel Electrophoresis** (`#labs/electrophoresis`): DNA restriction digest fragment separation, UV transilluminator visualization, and base-pair molecular weight ladder comparison.
9. **Population Ecology & Predator-Prey Dynamics** (`#labs/ecology`): Lotka-Volterra differential equations, carrying capacity ($K$), intrinsic growth rates ($r$), and environmental disturbance simulations.
10. **Neuron Action Potential & Voltage-Gated Channels** (`#labs/actionpotential`): Hodgkin-Huxley membrane electrophysiology, $\text{Na}^+$ activation / $\text{K}^+$ repolarization, resting potentials ($-70\text{ mV}$), and oscilloscope traces.
11. **Cell Membrane Osmosis & Tonicity Metrology** (`#labs/osmosis`): 4K laboratory bench, semi-permeable membrane U-tube osmometer, hypertonic/isotonic/hypotonic RBC and plant cell response, solute potential ($\Psi_s = -iCRT$), and real-time osmotic pressure tracking.
12. **Cell Cycle Cytogenetics & Mitosis** (`#labs/mitosis`): 4K cytology microscope bench, interphase through cytokinesis, kinetochore spindle fiber dynamics, chromosome segregation, mitotic index quantification, and cancer oncogene checkpoint dysregulation.
13. **Antibiotic Resistance & Kirby-Bauer Disk Diffusion** (`#labs/antibiotic`): Mueller-Hinton agar culture plate, antibiotic antimicrobial disks (Ampicillin, Streptomycin, Tetracycline, Chloramphenicol, Ciprofloxacin), zone of inhibition caliper metrology, CLSI susceptibility interpretation (Resistant, Intermediate, Susceptible), and bacterial mutation selection dynamics.
14. **ELISA Immunoassay & Serological Diagnostics** (`#labs/elisa`): Enzyme-Linked Immunosorbent Assay (Direct, Indirect, and Sandwich), primary/secondary antibody targeting, horseradish peroxidase (HRP) catalytic oxidation with TMB substrate, 96-well microplate colorimetry, and spectrophotometric optical density quantification.
15. **Plant Transpiration & Potometer Dynamics** (`#labs/transpiration`): Ganong bubble potometer, xylem water potential gradients ($\Delta \Psi$), environmental stress factors (humidity, wind speed, light intensity, temperature), stomatal guard cell aperture regulation, and volume uptake rate quantification ($mL/hr$).

### ⚡ Physics Laboratory Workbenches (16 Workbenches)
1. **Kinematics & 2D Projectile Motion** (`#labs/projectile`): Launch angle, initial velocity, air drag coefficient, gravitational acceleration ($g$), trajectory tracing, and range/apogee calculators.
2. **DC Circuits & Kirchhoff's Metrology** (`#labs/circuits`): Interactive breadboard workbench with batteries, resistors, lamps, switches, ammeters, voltmeters, and Ohm's / Kirchhoff's circuit law calculators.
3. **Geometric Optics, Snell's Law & Thin Lenses** (`#labs/optics`): Convex/concave lenses and mirrors, ray-tracing vectors, refraction indices ($n_1 \sin\theta_1 = n_2 \sin\theta_2$), focal lengths, and virtual/real image formation.
4. **Mechanical Waves, Doppler Effect & Resonance** (`#labs/waves`): Transverse and longitudinal wave generator, constructive/destructive interference, standing wave harmonics, and sound frequency shifts.
5. **Simple Harmonic Motion & Coupled Oscillators** (`#labs/harmonic`): Mass-spring systems and pendulum motion, damping coefficients, phase space diagrams, and kinetic/potential energy conservation graphs.
6. **Photoelectric Effect & Quantum Physics** (`#labs/photoelectric`): Monochromatic photon emitter, metal cathode work function ($\Phi$), stopping voltage ($V_0$), and Planck's constant ($h$) measurement.
7. **Electromagnetism, Lorentz Force & e/m Metrology** (`#labs/magnetism`): Magnetic field lines, charged particle cyclotron deflection ($\vec{F} = q\vec{v}\times\vec{B}$), and Thomson electron charge-to-mass ($e/m$) determination.
8. **Rotational Dynamics & Angular Momentum** (`#labs/rotational`): Moment of inertia ($I$), torque ($\tau = I\alpha$), conservation of angular momentum, and gyroscopic precession.
9. **Thermal Conduction & Heat Transfer** (`#labs/conduction`): Fourier's law of thermal conduction ($q = -k A \frac{dT}{dx}$), thermal conductivity across metal bars, and insulation modeling.
10. **Fluid Dynamics & Hydrostatic Buoyancy** (`#labs/fluids`): Archimedes' principle, fluid displacement, buoyant force ($F_b = \rho g V$), Venturi flow, Torricelli efflux, and Pascal hydraulic lift simulation.
11. **Linear Momentum & 1D/2D Collisions** (`#labs/collisions`): 4K collision dynamics bench, air track photogate timers, elastic and inelastic collisions, coefficient of restitution ($e$), center of mass velocity tracking, and kinetic energy loss analysis.
12. **Electromagnetic Induction & Faraday-Lenz Law** (`#labs/induction`): 4K electromagnetic bench, multi-turn solenoid coils, neodymium bar magnet velocity sweeps, core permeability ($\mu_r$) shifts, magnetic flux ($\Phi_B = \vec{B}\cdot\vec{A}$), and induced electromotive force ($\mathcal{E} = -N \frac{d\Phi_B}{dt}$).
13. **Orbital Mechanics & Kepler's Laws** (`#labs/orbital`): N-body gravitational trajectories, Kepler's 1st, 2nd, and 3rd laws ($T^2 \propto a^3$), orbital eccentricity ($e$), vis-viva equation ($v^2 = GM(2/r - 1/a)$), Hohmann transfer orbits, and escape velocity calculation ($v_{esc} = \sqrt{2GM/r}$).
14. **Acoustic Resonance & Speed of Sound** (`#labs/resonance`): Variable-water column resonance tube, tuning fork frequency excitation, open/closed pipe standing acoustic waves ($\lambda_n = 4L/n$), end-correction factor ($\Delta L = 0.61 r$), harmonic modes, and environmental temperature air sound speed determination ($v = 331.3\sqrt{1 + T/273.15}\text{ m/s}$).
15. **Electrostatics & Coulomb's Law Metrology** (`#labs/electrostatics`): Point charges, electric field vector maps ($\vec{E} = \frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\hat{r}$), electrostatic potential contours, Coulomb force vectors ($\vec{F}_e$), field lines, and Faraday cage charge shielding.
16. **Arduino Microcontroller & Embedded Hardware Prototyping** (`#labs/arduino`): ATmega328P virtual MCU, breadboard wire routing, 26 active electronic components (sensors, displays, actuators, motors), in-browser C++ sketch compiler and linker, dual-channel 60 FPS digital storage oscilloscope (DSO), and SPICE / CAD netlist generation.

---

## ⚡ Smartboard Hardware & Performance Standards

Interactive Flat Panels (IFPs) frequently run on embedded quad-core ARM chipsets (e.g., CVTE / Rockchip) with limited VRAM. Edugates implements deep hardware-level optimizations:

1. **MAXHUB Turbo Engine**:
   - Disables expensive CSS `backdrop-filter: blur()` and box shadows on low-tier hardware, replacing them with performant high-contrast opaque layers (`rgba(15,23,42,0.96)`).
   - Replaces heavy composite box-shadows with single-layer crisp borders (`1px solid rgba(56,189,248,0.3)`).
2. **30 FPS Paced Timer & Simulation Loops**:
   - `requestAnimationFrame` render loops are intelligently throttled on Smartboard hardware modes, halving GPU rasterization pressure while maintaining silky-smooth classroom animations.
3. **Adaptive DPR Metrology (`window.getLabDPR()`)**:
   - On 4K 65"–86" smartboards, standard browser `window.devicePixelRatio` ($2.0\times$ or $3.0\times$) results in $3840 \times 2160$ internal canvas resolutions, leading to GPU out-of-memory crashes.
   - `getLabDPR()` dynamically caps rendering DPR to $1.0\times$ on interactive panels, preserving 60 FPS performance without visual degradation at normal classroom viewing distances.
4. **Ergonomic Touch Targets**:
   - All interactive buttons, tabs, and switches meet or exceed the **$52\text{px}$ touch target standard** (exceeding standard mobile $48\text{px}$ guidelines) to ensure effortless finger and stylus tapping on large wall-mounted screens.
   - Slider thumbs are calibrated to **$32\text{px}$** with generous touch padding.

---

## 🚀 Getting Started & Local Development

No compilation or build step required. The application uses modern Native ES Modules:

```bash
# Clone the repository
git clone https://github.com/mohammedamy/EdugatesScLab.git
cd EdugatesScLab

# Serve locally with any static web server
# Option A: Python
python3 -m http.server 8000

# Option B: Node.js npx serve
npx serve -l 8000 .
```

Open `http://localhost:8000` in any modern web browser (Chrome, Edge, Safari, Firefox).

---

## 🧪 Automated Verification & Testing Suite

The repository contains **62 automated test suites** guaranteeing zero regressions:

```bash
# Run all automated test suites
for f in tests/*.js; do node "$f"; done
```

### Test Suite Coverage:
1. `tests/test-curriculum-integrity.js`: Validates 74 chapters, 242 lessons, and interactive spec mappings.
2. `tests/test-question-bank.js`: Validates 7,292 questions across all lessons with answer keys and rubrics.
3. `tests/test-virtual-labs.js`: Tests instantiation and cleanup of all 36 virtual lab workbenches.
4. `tests/test-worked-example-and-offline-diagnostics.js`: Tests step-by-step solver numerical tolerances, parsing engine, storage quota, and offline diagnostics.
5. `tests/test-maxhub-optimizations.js`: Validates Smartboard Turbo profile, 30 FPS pacing, fullscreen zero-box mode, and annotation bar layering.
6. `tests/test-periodic-table.js`: Audits all 118 elements, atomic weights, electron configurations, and media links.
7. `tests/test-qr-code.js`: Tests ISO-compliant QR code generation and mobile camera scan URL normalization.
8. `tests/test-classroom-timer.js`: Verifies stopwatch/countdown widgets, keyboard shortcuts, and state toggles.
9. `tests/test-offline-service-worker.js`: Audits PWA cache completeness and Service Worker routing.

---

## 🔬 How to Add New Experiments to the Portal

The Edugates Science Lab portal uses a modular, decoupled architecture for simulations, catalog metadata, and safety integration. Follow this step-by-step workflow to introduce new experiments:

### Step 1: Create the Virtual Lab Simulation Script
Create a new ES Module inside `labs/` (e.g., `labs/chem-electroplating.js` or `labs/phys-thermodynamics.js`):

```javascript
// labs/chem-electroplating.js
export function initLab(mountElement) {
  mountElement.innerHTML = `
    <div class="lab-container">
      <div class="lab-controls">
        <!-- Sliders, buttons, and switches with accessible ARIA tags -->
        <label for="voltage-slider">Cell Voltage (V):</label>
        <input type="range" id="voltage-slider" min="0" max="12" step="0.1" value="3.0" role="slider" aria-label="Electrochemical Cell Voltage">
        <span id="voltage-readout">3.0 V</span>
      </div>
      <div class="lab-canvas-wrapper">
        <canvas id="electroplating-canvas" width="800" height="500"></canvas>
      </div>
    </div>
  `;

  let animationFrameId = null;
  const canvas = mountElement.querySelector("#electroplating-canvas");
  const ctx = canvas.getContext("2d");

  function renderLoop() {
    // 60 FPS physics/chemistry simulation rendering
    // ...
    animationFrameId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Return a cleanup function to prevent memory leaks on tab/lab navigation
  return function cleanup() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    // Remove event listeners and free resources
  };
}
```

### Step 2: Register in `VIRTUAL_LABS_REGISTRY` (`app.js`)
Open `app.js` and add your workbench to `VIRTUAL_LABS_REGISTRY`:

```javascript
{
  id: "electroplating",
  subject: "chem", // "chem", "phys", or "bio"
  title: "Electroplating & Faraday's Law",
  icon: icons.electrochem,
  ariaLabel: "Electroplating and Faraday's Law Virtual Lab",
  href: "#labs/electroplating"
}
```

### Step 3: Register in `EXPERIMENT_CATALOG` (`components/experiment-card.js`)
To enable the interactive experiment card on the **Home Portal** and in the **Search/Filter Explorer**, add the metadata entry to `EXPERIMENT_CATALOG` in `components/experiment-card.js`:

```javascript
{
  id: "electroplating",
  title: "Electrolytic Deposition & Faraday's Law",
  subject: "chem",
  subjectName: "Chemistry",
  difficulty: "Intermediate", // "Beginner", "Intermediate", or "Advanced"
  estimatedTime: "40 mins",
  equipment: ["DC Power Supply", "Copper Anode", "Brass Cathode", "CuSO4 Electrolyte Bath", "Precision Analytical Balance"],
  formula: "m = \\frac{I \\cdot t \\cdot M}{z \\cdot F}", // KaTeX math expression
  description: "Investigate quantitative electrodeposition on metallic substrates, verify Faraday's electrochemical laws, and measure electron transfer stoichiometry.",
  pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf", // Path to downloadable manual
  thumbnail: "assets/labs/electrochem_bench.jpg", // Relative bench image (or WebP)
  launchHref: "#labs/electroplating"
}
```

> **Note**: Formulas specified in `formula` or enclosed in `$...$` within `description` are automatically typeset via KaTeX upon rendering!

### Step 4: Add Relevant Chemical Safety Data (`components/lab-safety-dashboard.js`)
If the experiment introduces hazardous reagents or materials, add an SDS reference item to `SDS_REAGENTS` in `components/lab-safety-dashboard.js`:

```javascript
{
  name: "Copper(II) Sulfate Pentahydrate",
  formula: "CuSO4·5H2O",
  hazards: ["Skin & Eye Irritant", "Harmful if swallowed", "Aquatic Toxicity"],
  ghs: ["Harmful", "Aquatic"],
  color: "#0284c7",
  ppe: "ANSI Z87.1 Safety Goggles, Nitrile Gloves, Lab Apron.",
  firstAid: "Flush affected area with copious clean water for 15 minutes. Avoid disposal down common drains."
}
```

### Step 5: Test the Integration
Run the automated test suites to verify syntax, routing, and deep-link resolution:
```bash
node tests/test-virtual-labs.js
node tests/test-lab-links.js
```

---

## 🖼️ Media & WebP Asset Conversion Pipeline

To ensure sub-second first contentful paint (FCP) and optimal caching on mobile and smartboard networks, image assets should be converted to WebP.

### Automatic Conversion Script
Use the built-in optimizer script located in `scripts/convert-assets-webp.mjs`:

```bash
# 1. Preview candidates and compression savings (Dry-Run):
node scripts/convert-assets-webp.mjs

# 2. Execute WebP conversion with high quality (85%):
node scripts/convert-assets-webp.mjs --run --quality 85

# 3. Clean up legacy uncompressed PNG/JPG after conversion:
node scripts/convert-assets-webp.mjs --run --clean
```

The script utilizes system `cwebp` (Google WebP Encoder) to convert `.png` and `.jpg` assets with multi-threaded encoding, automatically updating or generating corresponding `.webp` files.

---

## 🎨 Edugates Brand Design System & Accessibility (A11y)

The portal adheres to the official **Edugates International School** design system:
- **Primary Brand Colors**: Deep Blues (`#0a192f`, `#0f172a`), Cyan/Teal (`#06b6d4`, `#38bdf8`), Emerald Green (`#10b981`), Indigo (`#6366f1`).
- **Typography**: Plus Jakarta Sans (Headings & UI), JetBrains Mono (Readouts & Formulations), STIX Two Text (Pedagogical prose).
- **Sticky Persistent Navigation**: Sticky top navigation bar provides instant access to **Home**, **Biology**, **Chemistry**, **Physics**, and **Safety** across all viewports.
- **Contrast Compliance**: Minimum **4.5:1** contrast ratio (WCAG 2.1 AA) across both Day and Night modes.
- **Semantic Landmarks**: Strict HTML5 structure using `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer role="contentinfo">`.
- **Keyboard Navigation & ARIA**: Full keyboard accessibility (`Tab`, `Shift+Tab`, `ArrowDown`, `Enter`, `Escape`), skip links (`#main-content-view`), and dynamic ARIA state management.

---

## 📜 Standards & Compliance

- **Curriculum Alignment**: Next Generation Science Standards (NGSS), AP Chemistry, AP Biology, and AP Physics 1 & 2 frameworks.
- **Safety Standards**: OSHA Laboratory Standard (29 CFR 1910.1450), ANSI Z87.1 eye protection, and GHS classification.
- **Accessibility**: WCAG 2.1 AA High-Contrast Day and Dark Themes with full keyboard navigation and ARIA landmarks.
- **Offline Delivery**: Progressive Web App (PWA) with Cache-First static shell and Stale-While-Revalidate assets.

---

## 📄 License

Edugates International School Science Labs. All rights reserved.
