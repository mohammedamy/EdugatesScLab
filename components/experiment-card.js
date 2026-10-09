// Edugates International School - Reusable Interactive Experiment Cards & Filter Engine
// Provides standardized cards with Difficulty, Estimated Time, Equipment, Downloadable Manuals, and Real-Time Search.

import { renderMathInElement, formatMathText, renderLatex } from "../utils/math-renderer.js";

/**
 * Enhanced Experiment Catalog with Pedagogical Metadata
 */
export const EXPERIMENT_CATALOG = [
  // Chemistry Experiments
  {
    id: "titration",
    title: "Acid-Base Volumetric Titration",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Burette", "Erlenmeyer Flask", "pH Electrode", "Magnetic Stirrer", "Volumetric Pipette", "Phenolphthalein"],
    formula: "M_A V_A = M_B V_B",
    description: "Determine unknown acid concentrations via dropwise alkaline neutralization with precise equivalence point detection and potentiometric pH curve graphing.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/titration_bench.jpg",
    launchHref: "#labs/titration"
  },
  {
    id: "beerlambert",
    title: "Spectrophotometry & Beer-Lambert Law",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    equipment: ["Spectrophotometer", "Cuvettes", "Monochromator Grating", "Photodiode Detector", "Standard Solutions"],
    formula: "A = \\epsilon \\cdot c \\cdot l = -\\log_{10}(T)",
    description: "Measure monochromatic light transmittance across transition metal solutions to construct calibration curves and verify optical absorbance linearity.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/beer_lambert_bench.jpg",
    launchHref: "#labs/beerlambert"
  },
  {
    id: "calorimetry",
    title: "Enthalpy of Reaction & Calorimetry",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    equipment: ["Coffee-Cup Calorimeter", "Digital Precision Thermometer", "Nested Polystyrene Cups", "Magnetic Stirrer", "Graduated Cylinder"],
    formula: "q_{\\text{rxn}} = -(m_{\\text{soln}} c_s \\Delta T + C_{\\text{cal}} \\Delta T)",
    description: "Quantify exothermic and endothermic dissolution enthalpies under constant pressure using thermal conservation laws and calorimeter heat capacity calibration.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/calorimetry_bench.jpg",
    launchHref: "#labs/calorimetry"
  },
  {
    id: "kinetics",
    title: "Reaction Rates & Arrhenius Kinetics",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Advanced",
    estimatedTime: "55 mins",
    equipment: ["Constant Temperature Bath", "Spectrophotometric Cell", "Stopwatch Timer", "Reagent Reservoirs"],
    formula: "k = A e^{-E_a / RT}",
    description: "Investigate collision theory, determine reaction orders via initial rates, and calculate activation energy ($E_a$) via linear Arrhenius slope analysis.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/kinetics_bench.jpg",
    launchHref: "#labs/kinetics"
  },
  {
    id: "gaslaws",
    title: "Ideal Gas Laws & Maxwell-Boltzmann Theory",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    equipment: ["Hermetic Piston Chamber", "Digital Pressure Gauge (kPa)", "Variable Thermal Platen", "Molecular Velocity Sensor"],
    formula: "PV = nRT",
    description: "Dynamically vary volume, temperature, and moles to observe real-time molecular collisions, velocity distributions, and Boyle-Charles gas relationships.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/gas_laws_bench.jpg",
    launchHref: "#labs/gaslaws"
  },
  {
    id: "equilibrium",
    title: "Chemical Equilibrium & Le Chatelier Shifts",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Spectrophotometric Cell", "Thermal Water Bath", "Syringe Gas Injector", "Colorimeter"],
    formula: "K_{\\text{eq}} = \\frac{[C]^c [D]^d}{[A]^a [B]^b}",
    description: "Perturb dynamic reversible equilibria via concentration stress, thermal shifts, and volume compression to confirm Le Chatelier's thermodynamic compensatory response.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/equilibrium_bench.jpg",
    launchHref: "#labs/equilibrium"
  },
  {
    id: "electrochem",
    title: "Voltaic Cells & Nernst Electrochemistry",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    equipment: ["High-Impedance Digital Voltmeter", "Zinc & Copper Electrodes", "Porous Salt Bridge ($KNO_3$)", "Half-Cell Beakers"],
    formula: "E_{\\text{cell}} = E^\\circ - \\frac{RT}{nF} \\ln(Q)",
    description: "Measure standard and non-standard reduction potentials in galvanic cells, monitor electron migration, and verify thermodynamic free energy conversion ($\\Delta G = -nFE$).",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/electrochem_bench.jpg",
    launchHref: "#labs/electrochem"
  },
  {
    id: "flametest",
    title: "Atomic Emission Spectra & Flame Tests",
    subject: "chem",
    subjectName: "Chemistry",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    equipment: ["Bunsen Burner", "Platinum/Nichrome Wire Loop", "Optical Spectroscope", "Metal Chloride Salts ($LiCl, NaCl, CuCl_2, SrCl_2$)", "Cobalt Blue Glass"],
    formula: "E = h \\nu = \\frac{h c}{\\lambda} \\quad \\bullet \\quad \\Delta E = -R_H \\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)",
    description: "Excite metal cations in oxidizing flame zones, observe characteristic atomic photon emissions, and resolve discrete line spectra with calibrated spectroscopes.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/flame_test_bench.jpg",
    launchHref: "#labs/flametest"
  },

  // Physics Experiments
  {
    id: "projectile",
    title: "2D Kinematics & Projectile Motion",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Beginner",
    estimatedTime: "35 mins",
    equipment: ["Spring Ballistic Launcher", "Dual Photogate Array", "Impact Pressure Sensor Pad", "Digital Protractor Inclinometer"],
    formula: "y(t) = y_0 + v_{0y} t - \\frac{1}{2} g t^2",
    description: "Launch kinematic projectiles across arbitrary elevations, adjust launch velocity and launch angle, and observe orthogonal velocity vector decomposition ($v_x, v_y$).",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/projectile_bench.jpg",
    launchHref: "#labs/projectile"
  },
  {
    id: "fluids",
    title: "Fluid Dynamics, Buoyancy & Venturi Tube",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Archimedes Immersion Tank", "Spring Tension Scale", "ASME Venturi Tube Apparatus", "Multi-tube Piezometer Manometer Board"],
    formula: "F_b = \\rho_{f} V_{\\text{disp}} g \\quad \\bullet \\quad P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2",
    description: "Verify Archimedes' principle with real-time fluid displacement and investigate Bernoulli constriction pressure drops using precision Venturi manometers.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/fluids_bench.jpg",
    launchHref: "#labs/fluids"
  },
  {
    id: "arduino",
    title: "Arduino Uno & Microcontroller Circuitry",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Arduino Uno R3", "Half-Size Solderless Breadboard", "HC-SR04 Ultrasonic Sensor", "SG90 Micro Servo", "Piezo Buzzer", "LDR Photocell", "TMP36 Temperature Sensor", "Jumper Wires"],
    formula: "V_{\\text{ADC}} = \\frac{\\text{ADC}}{1023} \\times 5.0\\,\\text{V} \\quad \\bullet \\quad d = \\frac{v \\cdot \\Delta t}{2}",
    description: "Construct interactive embedded circuits, program ATmega328P microcontrollers with real-time C++, synthesize piezo audio acoustic frequencies, and interface analog/digital transducers.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/circuits_bench.jpg",
    launchHref: "#labs/arduino"
  },
  {
    id: "circuits",
    title: "DC Circuits, Kirchhoff's Laws & Ohm's Law",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    equipment: ["Regulated DC Power Supply", "True-RMS Digital Multimeter", "Decade Resistance Box", "Breadboard Wiring Leads"],
    formula: "V = I \\cdot R \\quad \\bullet \\quad \\sum I_{\\text{in}} = \\sum I_{\\text{out}}",
    description: "Construct series, parallel, and complex ladder resistor networks to measure branch currents, loop voltage drops, and verify conservation of charge.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/circuits_bench.jpg",
    launchHref: "#labs/circuits"
  },
  {
    id: "optics",
    title: "Geometric Optics & Precision Ray Tracing",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    equipment: ["Optical Precision Bench", "Thin Biconvex / Biconcave Lenses", "Illuminated Target Object", "Diffusion Viewing Screen"],
    formula: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
    description: "Trace non-paraxial rays through spherical lenses and planar mirrors to observe real vs. virtual focal convergence and transverse optical magnification.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/optics_bench.jpg",
    launchHref: "#labs/optics"
  },
  {
    id: "waves",
    title: "Wave Optics & Young's Double-Slit Diffraction",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    equipment: ["Helium-Neon Laser (632.8 nm)", "Precision Double-Slit Aperture Disk", "Linear Translation Stage", "CCD Line Sensor"],
    formula: "d \\sin(\\theta) = m \\lambda",
    description: "Explore coherent wave superposition, measure spatial fringe spacing ($\\Delta y$), and derive unknown optical wavelengths from interference geometry.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/waves_bench.jpg",
    launchHref: "#labs/waves"
  },
  {
    id: "photoelectric",
    title: "Photoelectric Effect & Planck's Constant",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Advanced",
    estimatedTime: "55 mins",
    equipment: ["Monochromatic Mercury Arc Lamp", "Optical Color Filters", "Phototube with Caesium/Platinum Cathode", "Stopping Voltage Power Supply", "Picoammeter"],
    formula: "K_{\\text{max}} = h f - \\Phi = e V_{\\text{stop}}",
    description: "Demonstrate quantum threshold frequencies, evaluate stopping potentials vs. illumination frequency, and calculate Planck's constant ($h$) experimentally.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/photoelectric_bench.jpg",
    launchHref: "#labs/photoelectric"
  },
  {
    id: "harmonic",
    title: "Simple Harmonic Motion & Hooke's Law",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Beginner",
    estimatedTime: "35 mins",
    equipment: ["Mass-Spring Oscillator", "Simple Gravity Pendulum", "Smart Photogate Timer", "Hooke Restoring Force Sensor", "Metric Vernier Scale"],
    formula: "T = 2\\pi \\sqrt{\\frac{m}{k}} \\quad \\bullet \\quad T = 2\\pi \\sqrt{\\frac{L}{g}}",
    description: "Investigate oscillatory kinematics across Hooke springs and gravity pendulums, toggle celestial gravity (Earth/Moon/Mars), and evaluate energy conservation (KE + PE).",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/harmonic_bench.jpg",
    launchHref: "#labs/harmonic"
  },
  {
    id: "collisions",
    title: "Momentum Conservation & Kinetic Collisions",
    subject: "phys",
    subjectName: "Physics",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    equipment: ["Air Track System", "Linear Gliders with Springs & Velcro", "Dual Millisecond Photogates", "Precision Digital Mass Scale"],
    formula: "p_1 + p_2 = p_1' + p_2' \\quad \\bullet \\quad e = \\frac{v_2' - v_1'}{v_1 - v_2}",
    description: "Analyze 1D elastic and inelastic collisions on frictionless air tracks, measure pre/post-impact velocities, and compute coefficient of restitution and energy loss.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/collisions_bench.jpg",
    launchHref: "#labs/collisions"
  },

  // Biology Experiments
  {
    id: "microscope",
    title: "Ultra-HD Optical Microscopy & Histology",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Beginner",
    estimatedTime: "35 mins",
    equipment: ["Compound Optical Microscope (40x–1000x)", "Oil Immersion Objective", "Mechanical Stage X-Y Micrometer", "Biological Specimen Slides"],
    formula: "\\text{Total Mag} = \\text{Ocular (10x)} \\times \\text{Objective}",
    description: "Examine high-resolution histological specimens (onion root tip mitosis, blood smears, paramecium, neurons) with calibrated reticle scale bars and focus mechanics.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/microscope_bench.jpg",
    launchHref: "#labs/microscope"
  },
  {
    id: "osmosis",
    title: "Cell Membrane Transport & Osmotic Pressure",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    equipment: ["Dialysis Tubing U-Tube Apparatus", "Osmometer Piezometer Column", "Concentrated Sucrose Solutions", "Semi-permeable Membrane"],
    formula: "\\Pi = i M R T",
    description: "Model selective membrane permeability across hypotonic, isotonic, and hypertonic gradients to compute equilibrium hydrostatic osmotic pressure.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/osmosis_bench.jpg",
    launchHref: "#labs/osmosis"
  },
  {
    id: "enzymes",
    title: "Enzyme Catalysis & Michaelis-Menten Kinetics",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Enzyme Spectrophotometric Cuvette", "Catalase / Substrate Delivery Syringe", "Controlled Thermal Incubation Block", "pH Buffer Set"],
    formula: "v = \\frac{V_{\\text{max}} [S]}{K_m + [S]}",
    description: "Determine initial velocity ($v_0$) as a function of substrate concentration, temperature, and pH, and compute biological catalytic parameters ($K_m, V_{\\text{max}}$).",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/enzymes_bench.jpg",
    launchHref: "#labs/enzymes"
  },
  {
    id: "electrophoresis",
    title: "Agarose Gel Electrophoresis & DNA Banding",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    equipment: ["Horizontal Electrophoresis Chamber", "1.0% Agarose Gel Casting Tray", "UV Transilluminator", "Micropipette (0.5–10 µL)", "DNA Molecular Weight Ladder"],
    formula: "v = \\frac{q E}{f}",
    description: "Cast agarose gels, load restriction digest fragments with micropipettes, apply electric field gradients, and analyze DNA base-pair sizing via logarithmic mobility curves.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/electrophoresis_bench.jpg",
    launchHref: "#labs/electrophoresis"
  },
  {
    id: "actionpotential",
    title: "Neurobiology Patch Clamp & Action Potential",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Advanced",
    estimatedTime: "55 mins",
    equipment: ["Electrophysiology Patch-Clamp Amplifier", "Microelectrode Micromanipulator", "Intracellular Voltage Oscilloscope", "Ion Channel Blocker Ingot (TTX / TEA)"],
    formula: "I_{\\text{ion}} = g_{\\text{ion}} (V_m - E_{\\text{ion}})",
    description: "Simulate Hodgkin-Huxley neuronal voltage gating, inject depolarizing current steps, and track voltage-gated $Na^+$ and $K^+$ conductance dynamics.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/action_potential_bench.jpg",
    launchHref: "#labs/actionpotential"
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis, Hill Reaction & Photolysis",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    equipment: ["Oxygen Evolution Chamber (Clark Electrode)", "Variable LED Optical Source (Lux)", "Spectrophotometer", "DPIP Electron Acceptor Dye"],
    formula: "6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2",
    description: "Quantify the light-dependent electron transport chain via DPIP reduction and examine photosynthetic saturation kinetics across light intensity and carbon dioxide supply.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/photosynthesis_bench.jpg",
    launchHref: "#labs/photosynthesis"
  },
  {
    id: "mitosis",
    title: "Cell Cycle, Mitosis & Chromosome Dynamics",
    subject: "bio",
    subjectName: "Biology",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    equipment: ["High-Power Binocular Microscope", "Stained Allium Cepa (Onion Root Tip) Slides", "Mechanical Stage Micrometer", "Phase Contrast Annulus"],
    formula: "\\text{Mitotic Index} = \\frac{\\text{Cells in Mitosis}}{\\text{Total Counted Cells}} \\times 100\\%",
    description: "Identify and tally cellular mitotic stages (Prophase, Metaphase, Anaphase, Telophase), compute relative stage durations, and calculate root meristem mitotic indices.",
    pdfUrl: "./Edugates_STEM_Labs_Teacher_Guide.pdf",
    thumbnail: "assets/labs/mitosis_bench.jpg",
    launchHref: "#labs/mitosis"
  }
];

/**
 * Renders a Single Standardized Experiment Card HTML Component
 */
export function renderExperimentCard(exp) {
  const diffBadgeColor = {
    "Beginner": { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.35)", text: "#34d399" },
    "Intermediate": { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.35)", text: "#fbbf24" },
    "Advanced": { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.35)", text: "#c084fc" }
  }[exp.difficulty] || { bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.35)", text: "#38bdf8" };

  const subjColor = {
    "chem": { badgeBg: "rgba(6, 182, 212, 0.15)", text: "#06b6d4", icon: "🧪" },
    "phys": { badgeBg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", icon: "⚛️" },
    "bio": { badgeBg: "rgba(16, 185, 129, 0.15)", text: "#10b981", icon: "🧬" }
  }[exp.subject] || { badgeBg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", icon: "🔬" };

  return `
    <article class="experiment-card" data-exp-id="${exp.id}" data-subject="${exp.subject}" data-difficulty="${exp.difficulty.toLowerCase()}"
             style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s ease, box-shadow 0.25s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
      
      <!-- Card Image Thumbnail with Lazy Loading & WebP Progressive Enhancement -->
      <div class="exp-card-media" style="position: relative; height: 180px; width: 100%; background: #070a12; overflow: hidden;">
        <picture>
          <source srcset="${exp.thumbnail.replace(/\.(jpe?g|png)$/i, '.webp')}" type="image/webp">
          <img src="${exp.thumbnail}" alt="Laboratory Bench setup for ${exp.title}" loading="lazy" decoding="async"
               style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;"
               onerror="this.src='assets/placeholder-flask.svg'; this.style.objectFit='contain'; this.style.padding='24px';">
        </picture>
        <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
          <span style="background: ${subjColor.badgeBg}; border: 1px solid ${subjColor.text}44; color: ${subjColor.text}; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 9999px; backdrop-filter: blur(8px);">
            ${subjColor.icon} ${exp.subjectName}
          </span>
        </div>
        <div style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px;">
          <!-- Difficulty Badge -->
          <span style="background: ${diffBadgeColor.bg}; border: 1px solid ${diffBadgeColor.border}; color: ${diffBadgeColor.text}; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; backdrop-filter: blur(8px);">
            ${exp.difficulty}
          </span>
          <!-- Estimated Time Badge -->
          <span style="background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255, 255, 255, 0.2); color: #f1f5f9; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 4px;">
            ⏱️ ${exp.estimatedTime}
          </span>
        </div>
      </div>

      <!-- Card Content -->
      <div class="exp-card-body" style="padding: 20px; display: flex; flex-direction: column; flex: 1; gap: 12px;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main, #ffffff); margin: 0 0 6px; line-height: 1.4;">
            ${exp.title}
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 0; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${exp.description}
          </p>
        </div>

        <!-- Formula Callout -->
        ${exp.formula ? `
          <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${subjColor.text}; border-radius: 0 6px 6px 0; padding: 6px 12px; font-size: 0.84rem; color: #38bdf8; font-family: var(--font-mono, monospace);">
            $${exp.formula}$
          </div>
        ` : ''}

        <!-- Equipment Tags -->
        <div style="margin-top: auto;">
          <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">
            Required Apparatus:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${exp.equipment.slice(0, 4).map(eq => `
              <span class="equipment-tag" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted, #cbd5e1); font-size: 0.72rem; padding: 2px 7px; border-radius: 4px;">
                ${eq}
              </span>
            `).join("")}
            ${exp.equipment.length > 4 ? `
              <span style="font-size: 0.72rem; color: #64748b; align-self: center;">+${exp.equipment.length - 4} more</span>
            ` : ''}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 8px; pt-2; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px;">
          <!-- Launch Virtual Simulator -->
          <a href="${exp.launchHref}" class="btn btn-primary" aria-label="Launch ${exp.title} virtual simulator workbench"
             style="flex: 1; text-align: center; font-size: 0.85rem; font-weight: 800; padding: 9px 14px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; box-shadow: 0 2px 8px rgba(2,132,199,0.3);">
            <span>🔬 Launch Lab</span>
          </a>

          <!-- Downloadable PDF Manual Link -->
          <a href="${exp.pdfUrl}" download="Edugates_${exp.id}_Lab_Manual.pdf" class="btn btn-secondary" aria-label="Download ${exp.title} PDF laboratory manual"
             title="Download printable PDF laboratory protocol manual"
             style="padding: 9px 12px; font-size: 0.85rem; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 5px; border: 1px solid var(--border-color, #475569); color: var(--text-muted, #cbd5e1); background: rgba(0,0,0,0.2);">
            <span>📄</span>
            <span>Manual</span>
          </a>
        </div>

      </div>
    </article>
  `;
}

/**
 * Renders the Full Searchable & Filterable Experiment Hub Component
 */
export function renderExperimentExplorer(mountElement, initialSubject = "all") {
  if (!mountElement) return;

  mountElement.innerHTML = `
    <div class="experiment-explorer" style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Filter Bar: Search Input + Subject Pills + Difficulty Chips -->
      <div class="exp-filter-bar" style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 14px; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        
        <!-- Top Row: Search Input & Result Counter -->
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; min-width: 280px;">
            <input type="text" id="exp-search-input" placeholder="🔍 Search experiment title, concept, or equipment (e.g., 'titration', 'spectrophotometer', 'laser')..."
                   aria-label="Search experiments by title or apparatus equipment"
                   style="width: 100%; padding: 12px 16px 12px 42px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color, #475569); color: var(--text-main, #ffffff); font-size: 0.92rem; outline: none; transition: border-color 0.2s;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; pointer-events: none; color: #94a3b8;">🧪</span>
          </div>

          <div id="exp-results-counter" style="font-size: 0.88rem; font-weight: 700; color: #38bdf8; white-space: nowrap;">
            Showing ${EXPERIMENT_CATALOG.length} Experiments
          </div>
        </div>

        <!-- Bottom Row: Filter Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
          
          <!-- Subject Tabs -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;" role="tablist" aria-label="Filter experiments by scientific discipline">
            <button type="button" class="exp-subj-pill active" data-subject="all" aria-selected="true" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              All Disciplines
            </button>
            <button type="button" class="exp-subj-pill" data-subject="chem" aria-selected="false" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(6, 182, 212, 0.2); background: transparent; color: var(--text-muted, #94a3b8);">
              🧪 Chemistry
            </button>
            <button type="button" class="exp-subj-pill" data-subject="phys" aria-selected="false" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(99, 102, 241, 0.2); background: transparent; color: var(--text-muted, #94a3b8);">
              ⚛️ Physics
            </button>
            <button type="button" class="exp-subj-pill" data-subject="bio" aria-selected="false" style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.2); background: transparent; color: var(--text-muted, #94a3b8);">
              🧬 Biology
            </button>
          </div>

          <!-- Difficulty Filter -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Difficulty:</span>
            <select id="exp-diff-select" aria-label="Filter experiments by difficulty level"
                    style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color, #475569); color: var(--text-main, #ffffff); font-size: 0.82rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; outline: none; cursor: pointer;">
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

        </div>

      </div>

      <!-- Experiment Cards Grid -->
      <div id="exp-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${EXPERIMENT_CATALOG.map(renderExperimentCard).join("")}
      </div>

    </div>
  `;

  // State
  let activeSubj = initialSubject || "all";
  let activeDiff = "all";
  let searchQuery = "";

  function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = EXPERIMENT_CATALOG.filter(exp => {
      const matchSubj = activeSubj === "all" || exp.subject === activeSubj;
      const matchDiff = activeDiff === "all" || exp.difficulty.toLowerCase() === activeDiff;
      const matchQuery = q === "" ||
        exp.title.toLowerCase().includes(q) ||
        exp.description.toLowerCase().includes(q) ||
        exp.equipment.some(eq => eq.toLowerCase().includes(q)) ||
        (exp.formula && exp.formula.toLowerCase().includes(q));
      return matchSubj && matchDiff && matchQuery;
    });

    const grid = mountElement.querySelector("#exp-cards-grid");
    const counter = mountElement.querySelector("#exp-results-counter");

    if (counter) {
      counter.innerText = `Showing ${filtered.length} of ${EXPERIMENT_CATALOG.length} Experiments`;
    }

    if (grid) {
      if (filtered.length > 0) {
        grid.innerHTML = filtered.map(renderExperimentCard).join("");
      } else {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: var(--bg-card, #0f172a); border: 1px dashed var(--border-color, #334155); border-radius: 12px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔬</div>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin: 0 0 6px;">No Experiments Match Your Filter Criteria</h4>
            <p style="font-size: 0.88rem; color: #94a3b8; max-width: 460px; margin: 0 auto 16px;">
              Try clearing your search query or switching disciplines to discover interactive simulations.
            </p>
            <button type="button" class="btn btn-secondary" id="btn-reset-exp-filter" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; border: 1px solid #38bdf8; color: #38bdf8;">
              Reset Filters
            </button>
          </div>
        `;
        mountElement.querySelector("#btn-reset-exp-filter")?.addEventListener("click", () => {
          activeSubj = "all";
          activeDiff = "all";
          searchQuery = "";
          const sInput = mountElement.querySelector("#exp-search-input");
          const dSelect = mountElement.querySelector("#exp-diff-select");
          if (sInput) sInput.value = "";
          if (dSelect) dSelect.value = "all";
          updatePillStyles();
          applyFilters();
        });
      }
      renderMathInElement(grid);
    }
  }

  function updatePillStyles() {
    mountElement.querySelectorAll(".exp-subj-pill").forEach(p => {
      const isAct = p.dataset.subject === activeSubj;
      p.classList.toggle("active", isAct);
      p.setAttribute("aria-selected", isAct ? "true" : "false");
      p.style.background = isAct ? "rgba(56, 189, 248, 0.15)" : "transparent";
      p.style.borderColor = isAct ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.1)";
      p.style.color = isAct ? "#38bdf8" : "var(--text-muted, #94a3b8)";
    });
  }

  // Bind Search Input
  const searchInput = mountElement.querySelector("#exp-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Bind Subject Pills
  mountElement.querySelectorAll(".exp-subj-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      activeSubj = btn.dataset.subject || "all";
      updatePillStyles();
      applyFilters();
    });
  });

  // Bind Difficulty Select
  const diffSelect = mountElement.querySelector("#exp-diff-select");
  if (diffSelect) {
    diffSelect.addEventListener("change", (e) => {
      activeDiff = e.target.value;
      applyFilters();
    });
  }

  // Initial Math pass
  renderMathInElement(mountElement);
}
