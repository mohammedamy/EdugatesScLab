# Edugates-ClipSAT Science Labs (EdugatesScLab)

An enterprise-grade, world-class virtual science laboratory and interactive STEM educational platform covering **Inspire Chemistry**, **Inspire Biology**, and **Inspire Physics** curricula. Engineered for 4K Interactive Flat Panels (MAXHUB, Promethean, SMART Board), Desktop PCs, Chromebooks, Tablets, and Mobile devices with 100% offline PWA capabilities.

---

## 📊 Platform Architecture & Curriculum Metrics

| Curriculum Domain | Modules / Chapters | Interactive Lessons | Question Bank Items | Dedicated Virtual Labs |
| :--- | :---: | :---: | :---: | :---: |
| 🧪 **Inspire Chemistry** | 23 | 89 | 2,757 | 10 Workbenches |
| 🧬 **Inspire Biology** | 27 | 81 | 2,492 | 10 Workbenches |
| ⚡ **Inspire Physics** | 24 | 72 | 2,043 | 10 Workbenches |
| **Total Platform Scope** | **74 Chapters** | **242 Lessons** | **7,292 Questions** | **30 Virtual Labs** |

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
- **One-Click Field Trip Precaching**: Pre-caches all 30 virtual lab engines, curriculum theory databases, and media assets into CacheStorage (`amscilab-pwa-v42`).
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

## 🔬 30 Virtual Laboratory Simulation Catalog

### 🧪 Chemistry Laboratory Workbenches (10 Workbenches)
1. **Acid-Base Titration & pH Curve Analyzer** (`#labs/titration`): Real-time burette titrant drop simulation, strong/weak acid-base equilibria, Henderson-Hasselbalch buffer calculations, indicator color transitions, and automated derivative inflection titration curves.
2. **Precision Periodic Table & Quantum Orbitals** (`#labs/periodic-table`): All 118 IUPAC elements with standard weights, electron configurations, Bohr models, real-world photographs, and periodic trends (electronegativity, ionization energy, atomic radius).
3. **Ideal Gas Laws & Kinetic Molecular Theory** (`#labs/gas-laws`): Boyle's, Charles's, Gay-Lussac's, and Avogadro's laws with particle collision velocity histograms and piston pressure-volume dynamics.
4. **Calorimetry & Enthalpy of Reaction** (`#labs/calorimetry`): Coffee-cup and bomb calorimeter simulations, specific heat determinations, and exothermic/endothermic dissolution curves ($q = mc\Delta T$).
5. **Chemical Equilibrium & Le Chatelier Shifts** (`#labs/equilibrium`): Reversible Haber-Bosch and cobalt complex reactions with real-time stress response to temperature, pressure, and concentration shifts ($Q \text{ vs } K_{eq}$).
6. **Electrochemistry & Galvanic Cells** (`#labs/electrochem`): Standard reduction potentials, zinc-copper Daniell cells, salt bridge ion migration, and Nernst equation voltage calculations.
7. **Spectrophotometry & Beer-Lambert Law** (`#labs/beerlambert`): Monochromator wavelength selection, cuvette path length adjustments, and molar absorptivity calibration curves ($A = \epsilon b c$).
8. **VSEPR Molecular Geometry & Polarity** (`#labs/vsepr`): 3D interactive molecular geometry viewer across electron domains ($AX_2$ to $AX_6$), dipole moments, and hybridization states ($sp, sp^2, sp^3, sp^3d, sp^3d^2$).
9. **Nuclear Decay & Radiometric Half-Life** (`#labs/decay`): Alpha, beta, and gamma radiation shielding, radioactive decay curves ($N(t) = N_0 e^{-\lambda t}$), and carbon-14 dating simulation.
10. **Colligative Properties & Freezing-Point Depression** (`#labs/colligative`): Osmotic pressure, boiling point elevation, and cryoscopic freezing point depression with van 't Hoff factor calculations ($\Delta T_f = i K_f m$).

### 🧬 Biology Laboratory Workbenches (10 Workbenches)
1. **Virtual Compound Microscope & Micrograph Suite** (`#labs/microscope`): 40x, 100x, 400x, and 1000x oil-immersion lenses, fine/coarse focus knobs, slide stage translation, and cellular specimen library (onion epidermis, human blood smear, paramecium, chloroplasts).
2. **DNA Transcription & Protein Translation** (`#labs/dna-protein`): Double-helix unzipping, RNA Polymerase transcription, mRNA ribosome translation, tRNA anticodon binding, and genetic code codon chart mapping.
3. **Mendelian & Dihybrid Punnett Squares** (`#labs/punnett`): Monohybrid and dihybrid cross generators, phenotypic/genotypic probability distributions, and non-Mendelian incomplete dominance/codominance.
4. **Photosynthesis & Cellular Respiration** (`#labs/photosynthesis`): Light-dependent thylakoid reactions, Calvin cycle, oxygen production vs light intensity/wavelength, and carbon dioxide consumption curves.
5. **Enzyme Kinetics & Michaelis-Menten Metrology** (`#labs/enzymes`): Substrate concentration curves, $V_{\max}$ and $K_m$ calculation, competitive/non-competitive enzyme inhibition, and temperature/pH denaturation.
6. **Cellular Respiration & Respirometry** (`#labs/respiration`): Seed germination respirometer, KOH carbon dioxide scrubber, and oxygen consumption rate quantification.
7. **Agarose Gel Electrophoresis** (`#labs/electrophoresis`): DNA restriction digest fragment separation, UV transilluminator visualization, and base-pair molecular weight ladder comparison.
8. **Population Ecology & Predator-Prey Dynamics** (`#labs/ecology`): Lotka-Volterra differential equations, carrying capacity ($K$), intrinsic growth rates ($r$), and environmental disturbance simulations.
9. **Neuron Action Potential & Voltage-Gated Channels** (`#labs/action-potential`): Hodgkin-Huxley membrane electrophysiology, $\text{Na}^+$ activation / $\text{K}^+$ repolarization, resting potentials ($-70\text{ mV}$), and oscilloscope traces.
10. **Cell Membrane Osmosis & Fluid Mosaic Model** (`#labs/osmosis`): Hypotonic, isotonic, and hypertonic solutions, cell crenation and turgor pressure, and water potential ($\Psi = \Psi_s + \Psi_p$).

### ⚡ Physics Laboratory Workbenches (10 Workbenches)
1. **Kinematics & 2D Projectile Motion** (`#labs/projectile`): Launch angle, initial velocity, air drag coefficient, gravitational acceleration ($g$), trajectory tracing, and range/apogee calculators.
2. **DC Circuits & Kirchhoff's Metrology** (`#labs/circuits`): Interactive breadboard workbench with batteries, resistors, lamps, switches, ammeters, voltmeters, and Ohm's / Kirchhoff's circuit law calculators.
3. **Geometric Optics, Snell's Law & Thin Lenses** (`#labs/optics`): Convex/concave lenses and mirrors, ray-tracing vectors, refraction indices ($n_1 \sin\theta_1 = n_2 \sin\theta_2$), focal lengths, and virtual/real image formation.
4. **Mechanical Waves, Doppler Effect & Resonance** (`#labs/waves`): Transverse and longitudinal wave generator, constructive/destructive interference, standing wave harmonics, and sound frequency shifts.
5. **Simple Harmonic Motion & Coupled Oscillators** (`#labs/harmonic`): Mass-spring systems and pendulum motion, damping coefficients, phase space diagrams, and kinetic/potential energy conservation graphs.
6. **Photoelectric Effect & Quantum Physics** (`#labs/photoelectric`): Monochromatic photon emitter, metal cathode work function ($\Phi$), stopping voltage ($V_0$), and Planck's constant ($h$) measurement.
7. **Electromagnetism, Lorentz Force & Induction** (`#labs/magnetism`): Magnetic field lines, charged particle cyclotron deflection ($\vec{F} = q\vec{v}\times\vec{B}$), and Faraday's law of electromagnetic induction.
8. **Rotational Dynamics & Angular Momentum** (`#labs/rotational-dynamics`): Moment of inertia ($I$), torque ($\tau = I\alpha$), conservation of angular momentum, and gyroscopic precession.
9. **Thermal Conduction & Heat Transfer** (`#labs/thermal-conduction`): Fourier's law of thermal conduction ($q = -k A \frac{dT}{dx}$), thermal conductivity across metal bars, and insulation modeling.
10. **Fluid Dynamics & Hydrostatic Buoyancy** (`#labs/fluids`): Archimedes' principle, fluid displacement, buoyant force ($F_b = \rho g V$), and Bernoulli's equation for laminar fluid flow.

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

The repository contains **16 automated test suites** guaranteeing zero regressions:

```bash
# Run all automated test suites
for f in tests/*.js; do node "$f"; done
```

### Test Suite Coverage:
1. `tests/test-curriculum-integrity.js`: Validates 74 chapters, 242 lessons, and interactive spec mappings.
2. `tests/test-question-bank.js`: Validates 7,292 questions across all lessons with answer keys and rubrics.
3. `tests/test-virtual-labs.js`: Tests instantiation and cleanup of all 30 virtual lab workbenches.
4. `tests/test-worked-example-and-offline-diagnostics.js`: Tests step-by-step solver numerical tolerances, parsing engine, storage quota, and offline diagnostics.
5. `tests/test-maxhub-optimizations.js`: Validates Smartboard Turbo profile, 30 FPS pacing, fullscreen zero-box mode, and annotation bar layering.
6. `tests/test-periodic-table.js`: Audits all 118 elements, atomic weights, electron configurations, and media links.
7. `tests/test-qr-code.js`: Tests ISO-compliant QR code generation and mobile camera scan URL normalization.
8. `tests/test-classroom-timer.js`: Verifies stopwatch/countdown widgets, keyboard shortcuts, and state toggles.
9. `tests/test-offline-service-worker.js`: Audits PWA cache completeness and Service Worker routing.

---

## 📜 Standards & Compliance

- **Curriculum Alignment**: Next Generation Science Standards (NGSS), AP Chemistry, AP Biology, and AP Physics 1 & 2 frameworks.
- **Accessibility**: WCAG 2.1 AAA High-Contrast Day and Dark Themes with full keyboard navigation and ARIA landmarks.
- **Offline Delivery**: Progressive Web App (PWA) with Cache-First static shell and Stale-While-Revalidate assets.

---

## 📄 License

Edugates-ClipSAT Science Labs. All rights reserved.
