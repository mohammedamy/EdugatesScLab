// Edugates-ClipSAT Science Labs - Master Lesson Theory & Scientific Explanations Engine
// Provides comprehensive, college-prep & AP/SAT caliber scientific theory, mathematical derivations,
// sub-microscopic mechanisms, quantitative worked examples, real-world engineering applications,
// and CER (Claim, Evidence, Reasoning) inquiry frameworks for all curriculum lessons.

import { renderLatex } from "../utils/math-renderer.js";

/**
 * Subject Core Principles and Universal Laws
 */
export const SUBJECT_FOUNDATIONS = {
  CHEM: {
    name: "Inspire Chemistry",
    paradigm: "Particulate Nature of Matter & Electronic Structure",
    pillars: [
      "Atomic structure, quantization, and electronic configurations govern chemical bonding and periodicity.",
      "The Law of Conservation of Mass and Stoichiometric equivalence dictate all matter transformations.",
      "Chemical kinetics and dynamic equilibria quantify reaction rates, activation barriers, and reversible states.",
      "Thermodynamic enthalpy (ΔH), entropy (ΔS), and Gibbs free energy (ΔG) determine reaction spontaneity."
    ]
  },
  BIO: {
    name: "Inspire Biology",
    paradigm: "Cellular Mechanics, Molecular Genetics & Evolutionary Ecology",
    pillars: [
      "All living organisms consist of cells executing metabolic pathways driven by ATP hydrolysis and enzyme catalysis.",
      "Genetic inheritance is encoded in DNA nucleotide polymers and expressed via the Central Dogma (Transcription & Translation).",
      "Evolution by natural selection, sexual recombination, and genetic drift acts on population allele frequencies over time.",
      "Biological systems maintain homeostatic equilibrium through negative/positive feedback and ecological nutrient cycles."
    ]
  },
  PHYS: {
    name: "Inspire Physics",
    paradigm: "Universal Conservation Laws, Spacetime Dynamics & Field Forces",
    pillars: [
      "Newtonian mechanics, momentum conservation, and work-energy equivalence predict macroscopic kinematics.",
      "Wave motion, harmonic oscillation, and the electromagnetic spectrum govern information and radiative energy transfer.",
      "Maxwell's electromagnetism couples electric charge, electrostatic potential, and magnetic Lorentz forces.",
      "Thermodynamic laws and modern quantum/nuclear physics describe energy dissipation and subatomic particle interactions."
    ]
  }
};

/**
 * Curated Deep Theory Records for Curriculum Modules & Lessons
 */
const MODULE_THEORY_RECORDS = {
  // === CHEMISTRY ===
  "CHEM-M01": {
    topic: "Foundations of Chemical Science & Matter Metrology",
    theory: `Chemistry is the empirical and quantitative study of matter—defined as anything possessing resting mass and occupying spatial volume—and the atomic and molecular transformations it undergoes. At the macroscopic scale, human observers perceive bulk physical properties such as phase, density, boiling point, and color. At the sub-microscopic scale, these emergent phenomena are strictly determined by the electrostatic Coulombic forces between positively charged atomic nuclei and negative electron clouds, as well as the spatial packing geometry of atoms, ions, and molecules.

The scientific methodology is a rigorous cycle of reproducible empirical observation, testable hypothesis generation, quantitative experimentation with controlled, independent, and dependent variables, and the development of predictive scientific models and theories. Pure chemical research investigates fundamental mechanisms of nature (such as why chlorofluorocarbons catalytically destroy stratospheric ozone molecules via free-radical chain reactions), whereas applied research harnesses these discoveries to engineer industrial solutions, such as developing hydrofluoroolefin (HFO) refrigerants with zero ozone-depletion potential and low global warming impact.`,
    mechanism: [
      "1. Particulate Mass & Volume: Every substance is composed of discrete atoms with characteristic isotopic atomic masses ($m_a$). In a sample of volume $V$, the packing density $\\rho = m / V$ is a constant intensive property independent of sample size.",
      "2. Buoyant Equilibrium: When a solid object is immersed in a fluid of density $\\rho_{\\text{fluid}}$, the upward buoyant force $F_b = \\rho_{\\text{fluid}} V_{\\text{disp}} g$ opposes gravity. If the object density exceeds the fluid density ($\\rho > \\rho_{\\text{fluid}}$), net force is downward and the object sinks; if $\\rho < \\rho_{\\text{fluid}}$, it floats with submerged volume fraction $f = \\rho / \\rho_{\\text{fluid}}$.",
      "3. Catalytic Ozone Breakdown: Stratospheric ozone ($O_3$) naturally absorbs lethal solar UV-C and UV-B radiation through photolysis ($O_3 + h\\nu \\rightarrow O_2 + O$). Chlorofluorocarbon emissions release chlorine radicals ($Cl^{\\bullet}$) that catalytically cycle through $Cl + O_3 \\rightarrow ClO + O_2$ and $ClO + O \\rightarrow Cl + O_2$, destroying thousands of ozone molecules per radical."
    ],
    formula: "\\rho = \\frac{m}{V} \\quad \\text{and} \\quad \\% \\text{ Error} = \\frac{|\\text{Exp} - \\text{Acc}|}{\\text{Acc}} \\times 100\\%",
    parameters: [
      { sym: "\\rho", name: "Mass Density", unit: "\\text{g/cm}^3 \\text{ or } \\text{kg/m}^3", desc: "Intensive ratio of sample mass to spatial volume" },
      { sym: "m", name: "Sample Mass", unit: "\\text{g or kg}", desc: "Quantity of matter, invariant across gravitational fields" },
      { sym: "V", name: "Volume", unit: "\\text{cm}^3 \\text{ or mL}", desc: "Three-dimensional space occupied by the particulate lattice" },
      { sym: "F_b", name: "Buoyant Force", unit: "\\text{N}", desc: "Hydrostatic upward force equal to the weight of displaced fluid" }
    ],
    workedExample: {
      problem: "A laboratory student uses water displacement to determine the density of an unknown irregular metal alloy. The initial water level in a graduated cylinder is 35.0 mL. After submerging a 148.5 g sample, the water level rises to 51.5 mL. Calculate the density of the metal, predict whether it sinks in liquid mercury (density = 13.6 g/cm³), and calculate the percent error if the accepted alloy density is 9.15 g/cm³.",
      given: "m = 148.5\\text{ g}, \\quad V_1 = 35.0\\text{ mL}, \\quad V_2 = 51.5\\text{ mL}, \\quad \\rho_{\\text{accepted}} = 9.15\\text{ g/cm}^3",
      steps: [
        "1. Determine the displaced volume: $\\Delta V = V_2 - V_1 = 51.5\\text{ mL} - 35.0\\text{ mL} = 16.5\\text{ mL} = 16.5\\text{ cm}^3$.",
        "2. Compute experimental density: $\\rho = \\frac{m}{\\Delta V} = \\frac{148.5\\text{ g}}{16.5\\text{ cm}^3} = 9.00\\text{ g/cm}^3$.",
        "3. Evaluate buoyancy in mercury: Since $\\rho_{\\text{alloy}} = 9.00\\text{ g/cm}^3 < \\rho_{\\text{Hg}} = 13.6\\text{ g/cm}^3$, the alloy will float on liquid mercury with a submerged fraction of $\\frac{9.00}{13.6} \\approx 66.2\\%$.",
        "4. Calculate percent error: $\\% \\text{ Error} = \\frac{|9.00 - 9.15|}{9.15} \\times 100\\% = \\frac{0.15}{9.15} \\times 100\\% \\approx 1.64\\%$."
      ],
      answer: "\\rho = 9.00\\text{ g/cm}^3 \\quad (\\text{Floats in Mercury}, \\%\\text{ Error} = 1.64\\%)",
      solverSteps: [
        {
          title: "Determine Displaced Volume (ΔV)",
          prompt: "Calculate the volume of water displaced by the submerged alloy (V₂ - V₁):",
          formula: "\\Delta V = V_2 - V_1",
          hint: "Subtract initial volume (35.0 mL) from final volume (51.5 mL).",
          expected: "16.5",
          unit: "mL",
          tolerance: 0.02,
          derivation: "\\Delta V = 51.5\\text{ mL} - 35.0\\text{ mL} = 16.5\\text{ mL} = 16.5\\text{ cm}^3"
        },
        {
          title: "Compute Experimental Density (ρ)",
          prompt: "Calculate the experimental density of the alloy sample (m / ΔV):",
          formula: "\\rho = \\frac{m}{\\Delta V}",
          hint: "Divide mass (148.5 g) by displaced volume (16.5 cm³).",
          expected: "9.00",
          unit: "g/cm³",
          tolerance: 0.02,
          derivation: "\\rho = \\frac{148.5\\text{ g}}{16.5\\text{ cm}^3} = 9.00\\text{ g/cm}^3"
        },
        {
          title: "Evaluate Submerged Buoyancy Fraction in Mercury",
          prompt: "Calculate the percentage submerged when floating in liquid mercury (density = 13.6 g/cm³):",
          formula: "f = \\frac{\\rho_{\\text{alloy}}}{\\rho_{\\text{Hg}}} \\times 100\\%",
          hint: "Divide alloy density (9.00) by mercury density (13.6) and multiply by 100.",
          expected: "66.2",
          unit: "%",
          tolerance: 0.03,
          derivation: "f = \\frac{9.00}{13.6} \\times 100\\% \\approx 66.2\\% \\quad (\\text{Floats})"
        },
        {
          title: "Calculate Percent Error",
          prompt: "Compute the experimental percent error relative to accepted density (9.15 g/cm³):",
          formula: "\\%\\text{ Error} = \\frac{|\\text{Exp} - \\text{Acc}|}{\\text{Acc}} \\times 100\\%",
          hint: "Subtract 9.00 from 9.15, divide by 9.15, and multiply by 100.",
          expected: "1.64",
          unit: "%",
          tolerance: 0.05,
          derivation: "\\% \\text{ Error} = \\frac{|9.00 - 9.15|}{9.15} \\times 100\\% \\approx 1.64\\%"
        }
      ]
    },
    applications: [
      "Aerospace Material Selection: Lightweight titanium and carbon-fiber composites with high strength-to-weight ratios are selected for orbital fuselages to minimize fuel mass.",
      "Hydrometric Quality Testing: Precision pycnometers and hydrometers measure electrolyte density in lead-acid batteries and specific gravity in urinalysis clinical diagnostics.",
      "Stratospheric Atmospheric Monitoring: Spectrophotometers on satellites track ozone Dobson Units (DU) over Antarctica to evaluate global recovery from the Montreal Protocol."
    ],
    misconceptions: [
      "Misconception: 'Heavier objects always sink and lighter objects always float.' Correction: Density (mass per unit volume), not total mass, determines buoyancy; a 100,000-ton steel aircraft carrier floats because its hull hollow geometry yields an average density far below water.",
      "Misconception: 'Mass and weight are synonymous.' Correction: Mass measures invariant inertia and quantity of matter; weight is the local gravitational force $W = mg$ which varies on different celestial bodies."
    ]
  },

  "CHEM-M02": {
    topic: "States of Matter, Phase Energetics & Mass Conservation",
    theory: `Matter primarily exists in four fundamental thermodynamic states: solid, liquid, gas, and plasma. In solids, intermolecular forces hold particles in fixed, vibrating lattice positions. In liquids, thermal kinetic energy allows particles to slide past one another while maintaining cohesion. In gases, kinetic energy overwhelmingly exceeds intermolecular attraction, causing particles to move in rapid, random, linear trajectories. Plasma occurs at extreme temperatures where thermal collisions ionize electrons away from atomic nuclei, creating an electrically conductive gas of positive ions and free electrons.

During any physical change (melting, vaporization, condensation, freezing, sublimation, or deposition) or chemical change (rearrangement of covalent, ionic, or metallic bonds), the Law of Conservation of Mass strictly holds: the total mass of the closed system remains invariant ($m_{\\text{reactants}} = m_{\\text{products}}$). A heating curve displays the temperature response of a substance as thermal energy is supplied at a constant rate. Distinct horizontal plateaus occur during phase changes because the added heat is consumed as latent heat (enthalpy of fusion $\\Delta H_{\\text{fus}}$ or vaporization $\\Delta H_{\\text{vap}}$) to overcome intermolecular potential barriers rather than increasing particle kinetic energy.`,
    mechanism: [
      "1. Kinetic vs Potential Energy Partitioning: Along sloping regions of a heating curve, absorbed thermal heat increases average particle kinetic energy ($q = mc\\Delta T$), manifested as a temperature rise.",
      "2. Latent Phase Transitions: Along horizontal plateau regions, temperature remains strictly constant ($T = T_m$ or $T_b$) while absorbed energy breaks intermolecular hydrogen bonds or dipole-dipole attractions ($q = m\\Delta H_{\\text{phase}}$).",
      "3. Chemical Stoichiometric Conservation: In chemical synthesis (such as $2\\text{Al} + 3\\text{Cl}_2 \\rightarrow 2\\text{AlCl}_3$), individual atoms are neither created nor destroyed; chemical bonds break and reform with 100% atomic mass conservation."
    ],
    formula: "q = m c \\Delta T \\quad (\\text{sensible heat}) \\quad \\text{and} \\quad q = m \\Delta H_{\\text{phase}} \\quad (\\text{latent heat})",
    parameters: [
      { sym: "q", name: "Thermal Energy", unit: "\\text{J or kJ}", desc: "Heat energy absorbed or released by the thermodynamic system" },
      { sym: "c", name: "Specific Heat Capacity", unit: "\\text{J/(g}\\cdot^\\circ\\text{C)}", desc: "Energy required to raise the temperature of 1 gram by 1°C" },
      { sym: "\\Delta H_{\\text{fus}}", name: "Enthalpy of Fusion", unit: "\\text{J/g or kJ/mol}", desc: "Latent heat required to transition solid to liquid at melting point" },
      { sym: "\\Delta H_{\\text{vap}}", name: "Enthalpy of Vaporization", unit: "\\text{J/g or kJ/mol}", desc: "Latent heat required to transition liquid to gas at boiling point" }
    ],
    workedExample: {
      problem: "Calculate the total energy in kilojoules required to heat 50.0 g of solid ice at -15.0°C to liquid water at 60.0°C. (Given constants: $c_{\\text{ice}} = 2.09\\text{ J/(g}\\cdot^\\circ\\text{C)}$, $\\Delta H_{\\text{fus}} = 334\\text{ J/g}$, $c_{\\text{water}} = 4.184\\text{ J/(g}\\cdot^\\circ\\text{C)}$).",
      given: "m = 50.0\\text{ g}, \\quad T_1 = -15.0^\\circ\\text{C}, \\quad T_{\\text{melt}} = 0.0^\\circ\\text{C}, \\quad T_2 = 60.0^\\circ\\text{C}",
      steps: [
        "1. Heat ice from -15°C to 0°C: $q_1 = m c_{\\text{ice}} \\Delta T = (50.0)(2.09)(0 - (-15.0)) = (50.0)(2.09)(15.0) = 1,567.5\\text{ J}$.",
        "2. Melt ice at 0°C into liquid water: $q_2 = m \\Delta H_{\\text{fus}} = (50.0\\text{ g})(334\\text{ J/g}) = 16,700\\text{ J}$.",
        "3. Heat liquid water from 0°C to 60.0°C: $q_3 = m c_{\\text{water}} \\Delta T = (50.0)(4.184)(60.0 - 0) = (50.0)(4.184)(60.0) = 12,552\\text{ J}$.",
        "4. Sum total energy: $q_{\\text{total}} = q_1 + q_2 + q_3 = 1,567.5 + 16,700 + 12,552 = 30,819.5\\text{ J} \\approx 30.82\\text{ kJ}$."
      ],
      answer: "q_{\\text{total}} = 30.8\\text{ kJ}",
      solverSteps: [
        {
          title: "Heat Solid Ice (-15°C to 0°C)",
          prompt: "Calculate sensible heat required to warm ice from -15.0°C to melting point (0.0°C):",
          formula: "q_1 = m c_{\\text{ice}} \\Delta T",
          hint: "Multiply mass (50.0 g) × c_ice (2.09 J/g°C) × ΔT (15.0°C).",
          expected: "1567.5",
          unit: "J",
          tolerance: 0.02,
          derivation: "q_1 = (50.0)(2.09)(15.0) = 1,567.5\\text{ J}"
        },
        {
          title: "Melt Ice to Water at 0°C",
          prompt: "Calculate latent heat of fusion required to melt the ice:",
          formula: "q_2 = m \\Delta H_{\\text{fus}}",
          hint: "Multiply mass (50.0 g) × ΔH_fus (334 J/g).",
          expected: "16700",
          unit: "J",
          tolerance: 0.02,
          derivation: "q_2 = (50.0\\text{ g})(334\\text{ J/g}) = 16,700\\text{ J}"
        },
        {
          title: "Heat Liquid Water (0°C to 60°C)",
          prompt: "Calculate sensible heat required to warm liquid water from 0.0°C to 60.0°C:",
          formula: "q_3 = m c_{\\text{water}} \\Delta T",
          hint: "Multiply mass (50.0 g) × c_water (4.184 J/g°C) × ΔT (60.0°C).",
          expected: "12552",
          unit: "J",
          tolerance: 0.02,
          derivation: "q_3 = (50.0)(4.184)(60.0) = 12,552\\text{ J}"
        },
        {
          title: "Compute Total Enthalpy in kJ",
          prompt: "Sum the energy components and convert total heat to kilojoules (kJ):",
          formula: "q_{\\text{total}} = \\frac{q_1 + q_2 + q_3}{1000}",
          hint: "Add 1567.5 + 16700 + 12552 and divide by 1000.",
          expected: "30.82",
          unit: "kJ",
          tolerance: 0.02,
          derivation: "q_{\\text{total}} = \\frac{30,819.5\\text{ J}}{1000} \\approx 30.82\\text{ kJ}"
        }
      ]
    },
    applications: [
      "Cryogenic Biological Storage: Liquid nitrogen at -196°C freezes human cellular and reproductive tissue without crystal shearing via flash vitrification.",
      "Industrial Distillation Refining: Crude oil is fractionated into gasoline, kerosene, diesel, and bitumen by heating the mixture through vaporization columns based on differential boiling points.",
      "Phase Change Thermal Enclosures (PCMs): Building materials incorporate paraffin wax microcapsules that absorb building heat during peak sun (melting) and release it at night (freezing)."
    ],
    misconceptions: [
      "Misconception: 'Temperature increases continuously while boiling water over a stove.' Correction: While boiling at 1 atm, water temperature is fixed at exactly 100°C; all supplied burner heat fuels the latent enthalpy of vaporization.",
      "Misconception: 'When a candle burns, the mass disappears.' Correction: Wax hydrocarbons react with oxygen to produce invisible carbon dioxide gas and water vapor; in a sealed chamber, total mass is perfectly unchanged."
    ]
  },

  "CHEM-M03": {
    topic: "Atomic Architecture, Subatomic Particles & Nuclear Decay",
    theory: `The contemporary quantum-mechanical model of the atom is the culmination of over two centuries of empirical discovery. Democritus proposed the philosophical concept of indivisible 'atomos', but John Dalton established modern atomic theory in 1803 based on quantitative conservation laws. In 1897, J.J. Thomson utilized cathode ray tube deflection in electric and magnetic fields to discover the electron ($e^-$), proving atoms possess internal subatomic structure. In 1909, Robert Millikan's oil drop experiment established the fundamental elementary charge ($e = 1.602 \\times 10^{-19}\\text{ C}$).

In 1911, Ernest Rutherford directed high-energy positively charged alpha particles ($\\alpha$, $^4_2\\text{He}^{2+}$) at ultrathin gold foil. While most particles passed through undeflected (demonstrating that the atom is overwhelmingly empty space), approximately 1 in 8,000 scattered at angles exceeding 90° or rebounded backwards. This disproved Thomson's plum pudding model and proved that all positive atomic charge and >99.95% of atomic mass is concentrated in a microscopic central nucleus ($r_{\\text{nucleus}} \\approx 10^{-15}\\text{ m}$, compared to atom size $r_{\\text{atom}} \\approx 10^{-10}\\text{ m}$). Isotopes are atoms of the same element containing identical atomic numbers ($Z$, proton count) but differing neutron numbers ($N$), resulting in distinct mass numbers ($A = Z + N$).`,
    mechanism: [
      "1. Rutherford Alpha Scattering: Alpha particles encounter Coulombic electrostatic repulsion: $F_e = \\frac{1}{4\\pi\\varepsilon_0} \\frac{z_1 z_2 e^2}{r^2}$. Because the gold nucleus ($Z=79$) concentrates intense positive charge, head-on trajectory collisions result in dramatic hyperbolic deflection: $\\tan(\\theta/2) = \\frac{z Z e^2}{4\\pi\\varepsilon_0 m v^2 b}$, where $b$ is the impact parameter.",
      "2. Nuclear Force Balance: Protons in the nucleus repel each other through electrostatic Coulomb forces. The strong nuclear force acts attractively across femtometer ranges ($< 1.5\\text{ fm}$) between nucleons. When the neutron-to-proton ratio ($N/Z$) falls outside the stable 'band of stability', nuclei undergo spontaneous radioactive decay.",
      "3. Radioactive Emission Modes: Alpha decay ($\\alpha$) emits a helium nucleus, decreasing $Z$ by 2 and $A$ by 4; Beta-minus decay ($\\beta^-$) converts a neutron to a proton, electron, and antineutrino, increasing $Z$ by 1; Gamma decay ($\\gamma$) emits high-energy electromagnetic photons ($E = h\\nu$) without changing nucleon count."
    ],
    formula: "A = Z + N \\quad \\text{and} \\quad \\text{Avg Mass} = \\sum_{i=1}^k (\\text{fractional abundance}_i \\times \\text{isotopic mass}_i)",
    parameters: [
      { sym: "Z", name: "Atomic Number", unit: "\\text{integer}", desc: "Number of protons in the nucleus; uniquely defines chemical element" },
      { sym: "A", name: "Mass Number", unit: "\\text{integer}", desc: "Total sum of nucleons (protons + neutrons) in a specific nuclide" },
      { sym: "N", name: "Neutron Number", unit: "\\text{integer}", desc: "Count of neutral nucleons providing strong nuclear binding" },
      { sym: "\\text{amu}", name: "Atomic Mass Unit", unit: "\\text{u } (1.6605 \\times 10^{-27}\\text{ kg})", desc: "Defined as exactly 1/12th the mass of an unbound carbon-12 atom" }
    ],
    workedExample: {
      problem: "Naturally occurring chlorine consists of two stable isotopes: Chlorine-35 (mass = 34.969 amu, relative abundance = 75.78%) and Chlorine-37 (mass = 36.966 amu, relative abundance = 24.22%). Calculate the weighted average atomic mass of chlorine that appears on the periodic table.",
      given: "m_1 = 34.969\\text{ amu}, \\quad f_1 = 0.7578; \\quad m_2 = 36.966\\text{ amu}, \\quad f_2 = 0.2422",
      steps: [
        "1. Formulate weighted mass contribution of Cl-35: $\\text{Mass}_1 = f_1 \\times m_1 = 0.7578 \\times 34.969\\text{ amu} = 26.500\\text{ amu}$.",
        "2. Formulate weighted mass contribution of Cl-37: $\\text{Mass}_2 = f_2 \\times m_2 = 0.2422 \\times 36.966\\text{ amu} = 8.953\\text{ amu}$.",
        "3. Sum isotopic contributions: $\\text{Average Mass} = 26.500 + 8.953 = 35.453\\text{ amu}$."
      ],
      answer: "\\text{Atomic Mass of Cl} = 35.45\\text{ amu}"
    },
    applications: [
      "Positron Emission Tomography (PET Imaging): Fluorine-18 ($^{18}\\text{F}$, half-life 110 min) is tagged to fluorodeoxyglucose (FDG) to map glucose metabolism and locate cancer metastases.",
      "Carbon-14 Radiocarbon Dating: Cosmogenic $^{14}\\text{C}$ incorporated into living biomass decays with a half-life of 5,730 years, enabling archaeologists to date organic relics up to 50,000 years old.",
      "Semiconductor Ion Implantation: Accelerated beams of boron ($^{11}\\text{B}$) or phosphorus ($^{31}\\text{P}$) ions are driven into pure silicon wafers to engineer p-n junctions for microprocessor transistors."
    ],
    misconceptions: [
      "Misconception: 'Atoms are solid spheres packed tightly like billiard balls.' Correction: If an atom's nucleus were scaled to the size of a marble in the center of a football stadium, the nearest electron would be a grain of sand in the highest bleachers; the atom is over 99.9999999% empty space.",
      "Misconception: 'The atomic mass listed on the periodic table represents the mass of a single atom.' Correction: It is a weighted statistical average of all naturally occurring stable isotopes."
    ]
  },

  // === PHYSICS ===
  "PHYS-M01": {
    topic: "Kinematics, 1D Motion & Vector Metrology",
    theory: `Kinematics is the branch of classical mechanics that mathematically describes the motion of bodies in space and time without reference to the forces causing that motion. Motion is inherently relative; it is described with respect to a chosen coordinate frame of reference. Displacement ($\\Delta \\vec{x} = \\vec{x}_f - \\vec{x}_i$) is a vector quantity representing the straight-line spatial separation between initial and final positions, possessing both magnitude and direction, contrasting with scalar distance ($d$), which represents total path length.

Velocity ($\\vec{v} = \\frac{d\\vec{x}}{dt}$) is the instantaneous rate of change of position, whereas acceleration ($\\vec{a} = \\frac{d\\vec{v}}{dt}$) is the instantaneous rate of change of velocity. For the foundational case of rectilinear motion with constant uniform acceleration ($a = \\text{const}$), the fundamental kinematic equations of Galileo and Newton rigorously describe position, velocity, and time through quadratic and linear relationships. On a position-time ($x-t$) graph, the instantaneous slope equals velocity; on a velocity-time ($v-t$) graph, the slope equals acceleration, and the signed definite integral (area beneath the curve) equals net displacement.`,
    mechanism: [
      "1. Vector Calculus Integration: Starting from constant acceleration $\\frac{dv}{dt} = a$, integrating with respect to time yields $v(t) = v_0 + at$.",
      "2. Position Trajectory: Substituting $v(t) = \\frac{dx}{dt}$ and integrating again yields the quadratic equation of motion: $x(t) = x_0 + v_0 t + \\frac{1}{2} a t^2$.",
      "3. Time-Independent Kinematics: Eliminating parameter $t$ between the velocity and displacement relations yields the work-energy kinematic theorem: $v^2 = v_0^2 + 2a\\Delta x$."
    ],
    formula: "v = v_0 + a t, \\quad \\Delta x = v_0 t + \\frac{1}{2} a t^2, \\quad v^2 = v_0^2 + 2 a \\Delta x",
    parameters: [
      { sym: "\\Delta x", name: "Displacement", unit: "\\text{m}", desc: "Vector change in position from initial to final point" },
      { sym: "v_0", name: "Initial Velocity", unit: "\\text{m/s}", desc: "Instantaneous velocity at reference time $t = 0$" },
      { sym: "v", name: "Final Velocity", unit: "\\text{m/s}", desc: "Instantaneous velocity at time $t$" },
      { sym: "a", name: "Uniform Acceleration", unit: "\\text{m/s}^2", desc: "Constant rate of velocity change per unit time" },
      { sym: "t", name: "Elapsed Time", unit: "\\text{s}", desc: "Temporal interval over which motion occurs" }
    ],
    workedExample: {
      problem: "A high-speed bullet train traveling at an initial velocity of $72.0\\text{ m/s}$ (approx. $260\\text{ km/h}$) applies its magnetic regenerative brakes, decelerating uniformly at $a = -2.40\\text{ m/s}^2$. Calculate the stopping distance required for the train to come to a complete rest, and the total braking time.",
      given: "v_0 = 72.0\\text{ m/s}, \\quad v = 0\\text{ m/s}, \\quad a = -2.40\\text{ m/s}^2",
      steps: [
        "1. Calculate stopping distance using the time-independent equation: $v^2 = v_0^2 + 2 a \\Delta x$.",
        "2. Substitute values: $0 = (72.0)^2 + 2(-2.40)\\Delta x \\implies 0 = 5,184 - 4.80\\Delta x$.",
        "3. Solve for displacement: $\\Delta x = \\frac{5,184}{4.80} = 1,080\\text{ m} = 1.08\\text{ km}$.",
        "4. Calculate elapsed braking time: $v = v_0 + at \\implies 0 = 72.0 + (-2.40)t \\implies t = \\frac{72.0}{2.40} = 30.0\\text{ s}$."
      ],
      answer: "\\Delta x = 1,080\\text{ m} \\quad (1.08\\text{ km}), \\quad t = 30.0\\text{ s}",
      solverSteps: [
        {
          title: "Calculate Stopping Distance (Δx)",
          prompt: "Using the time-independent equation v² = v₀² + 2aΔx, solve for stopping distance in meters:",
          formula: "\\Delta x = \\frac{-v_0^2}{2a}",
          hint: "Compute (72.0)² / (2 × 2.40) = 5184 / 4.80.",
          expected: "1080",
          unit: "m",
          tolerance: 0.02,
          derivation: "\\Delta x = \\frac{5,184}{4.80} = 1,080\\text{ m} = 1.08\\text{ km}"
        },
        {
          title: "Calculate Elapsed Braking Time (t)",
          prompt: "Using v = v₀ + at, calculate the time in seconds to decelerate to rest:",
          formula: "t = \\frac{-v_0}{a}",
          hint: "Divide initial velocity (72.0 m/s) by deceleration (2.40 m/s²).",
          expected: "30.0",
          unit: "s",
          tolerance: 0.02,
          derivation: "t = \\frac{72.0}{2.40} = 30.0\\text{ s}"
        }
      ]
    },
    applications: [
      "Autonomous Vehicle Collision Avoidance: LiDAR sensors compute instantaneous range rate ($dr/dt = v$) and trigger emergency automated braking calibrated against road friction deceleration limits.",
      "Aviation Runway Certification: Airport runway lengths are engineered using critical engine-failure decision speed ($V_1$) kinematics to guarantee safe abort or takeoff.",
      "Satellite Orbital Injection: Rocket booster second-stage telemetry integrates instantaneous acceleration vector profiles $\\vec{a}(t)$ via inertial measurement units (IMUs) to hit target apogee orbital velocity."
    ],
    misconceptions: [
      "Misconception: 'If an object has zero velocity, its acceleration must also be zero.' Correction: At the apex of a vertical projectile launch, velocity is momentarily $v = 0\\text{ m/s}$, yet downward gravitational acceleration remains exactly $g = 9.80\\text{ m/s}^2$.",
      "Misconception: 'Distance and displacement are identical.' Correction: Running one complete 400 m lap around a track covers a distance of 400 m, but displacement is exactly 0 m because initial and final positions coincide."
    ]
  },

  // === BIOLOGY ===
  "BIO-M01": {
    topic: "Principles of Living Systems & Cellular Organization",
    theory: `Biology is the empirical study of life across hierarchical biological organization: molecular polymers, subcellular organelles, living cells, functional tissues, organ systems, multicellular organisms, populations, biological communities, and the global biosphere. A living system is scientifically defined by seven universal characteristics: cellular organization, ordered molecular complexity, sensitivity and response to environmental stimuli, autonomous metabolic energy utilization (ATP generation), homeostatic regulation of internal physiological parameters, reproduction with genetic transmission, and evolutionary adaptation driven by differential reproductive fitness.

The Cell Theory represents one of the foundational unifying frameworks of modern biological science: (1) All living organisms are composed of one or more cells; (2) The cell is the most fundamental structural and physiological unit exhibiting all properties of life; (3) All cells arise solely from the biogenic division of pre-existing cells (Virchow's principle: *Omnis cellula e cellula*). Organisms range from microscopic unicellular extremophiles (such as *Thermus aquaticus* or tardigrades undergoing cryptobiotic anhydrobiosis) to massive multicellular organisms whose specialized organ systems maintain continuous homeostatic internal environments.`,
    mechanism: [
      "1. Homeostatic Negative Feedback: When internal parameters deviate from physiological set-points (such as body temperature, blood glucose, or osmolarity), sensor receptors trigger biochemical cascades through control centers that activate effectors to counteract the perturbation.",
      "2. Metabolic ATP Coupling: Living cells maintain structural order and low entropy by coupling exergonic catabolic reactions (hydrolysis of ATP: $\\text{ATP} + \\text{H}_2\\text{O} \\rightarrow \\text{ADP} + P_i + 30.5\\text{ kJ/mol}$) to endergonic anabolic biosynthesis and active membrane transport.",
      "3. Cryptobiosis & Desiccation Tolerance: In tardigrades, extreme environmental desiccation induces trehalose sugar glassification and intrinsically disordered proteins (TDPs), protecting cell membranes and DNA lattices from denaturation without metabolic respiration."
    ],
    formula: "\\Delta G = \\Delta H - T \\Delta S \\quad \\text{and} \\quad \\text{Metabolic Rate } B \\propto M^{3/4} \\quad (\\text{Kleiber's Law})",
    parameters: [
      { sym: "\\Delta G", name: "Gibbs Free Energy", unit: "\\text{kJ/mol}", desc: "Thermodynamic energy available to perform cellular work; must be negative for spontaneous processes" },
      { sym: "B", name: "Basal Metabolic Rate", unit: "\\text{Watts or kcal/day}", desc: "Minimum resting energy expenditure required to sustain cellular cellular homeostasis" },
      { sym: "M", name: "Organismal Body Mass", unit: "\\text{kg}", desc: "Total biological body mass scaling allometric metabolic consumption" }
    ],
    workedExample: {
      problem: "A laboratory mammalian cell culture consumes 1.20 × 10⁻¹⁵ moles of ATP per second to power active Na⁺/K⁺ ATPase membrane pumps. Calculate the minimum rate of free energy in picowatts (pW = 10⁻¹² W) consumed by the cell pumps, assuming standard cellular ATP hydrolysis free energy $\\Delta G = -50.0\\text{ kJ/mol}$ under physiological cytosolic conditions.",
      given: "n_{\\text{rate}} = 1.20 \\times 10^{-15}\\text{ mol/s}, \\quad |\\Delta G| = 50.0\\text{ kJ/mol} = 5.00 \\times 10^4\\text{ J/mol}",
      steps: [
        "1. Calculate power dissipation in Watts: $P = \\frac{dE}{dt} = n_{\\text{rate}} \\times |\\Delta G|$.",
        "2. Substitute numerical values: $P = (1.20 \\times 10^{-15}\\text{ mol/s}) \\times (5.00 \\times 10^4\\text{ J/mol}) = 6.00 \\times 10^{-11}\\text{ J/s} = 6.00 \\times 10^{-11}\\text{ W}$.",
        "3. Convert Watts to picowatts ($1\\text{ pW} = 10^{-12}\\text{ W}$): $P = \\frac{6.00 \\times 10^{-11}\\text{ W}}{10^{-12}\\text{ W/pW}} = 60.0\\text{ pW}$."
      ],
      answer: "P = 60.0\\text{ pW} \\quad (6.00 \\times 10^{-11}\\text{ Watts})",
      solverSteps: [
        {
          title: "Calculate Power Dissipation in Watts",
          prompt: "Calculate the cellular power in Watts (n_rate × |ΔG|):",
          formula: "P = n_{\\text{rate}} \\times |\\Delta G|",
          hint: "Multiply (1.20 × 10⁻¹⁵ mol/s) by (5.00 × 10⁴ J/mol).",
          expected: "6.00e-11",
          unit: "W",
          tolerance: 0.03,
          derivation: "P = (1.20 \\times 10^{-15})(5.00 \\times 10^4) = 6.00 \\times 10^{-11}\\text{ W}"
        },
        {
          title: "Convert to Picowatts (pW)",
          prompt: "Convert the calculated power from Watts to picowatts (1 pW = 10⁻¹² W):",
          formula: "P_{\\text{pW}} = \\frac{P}{10^{-12}}",
          hint: "Divide 6.00 × 10⁻¹¹ by 10⁻¹².",
          expected: "60.0",
          unit: "pW",
          tolerance: 0.02,
          derivation: "P = \\frac{6.00 \\times 10^{-11}}{10^{-12}} = 60.0\\text{ pW}"
        }
      ]
    },
    applications: [
      "Cryopreservation of Stem Cells: Biologists use trehalose-mimicking vitrification agents derived from tardigrade cryobiology to freeze cord blood and organoids without ice crystallization damage.",
      "Bio-inspired Space Exploration Life Support: Closed-loop environmental control and life support systems (ECLSS) on the International Space Station model ecological nutrient recycling and bacterial bioreactors.",
      "Clinical Metabolic Calorimetry: Indirect calorimetry measuring oxygen consumption ($VO_2$) and carbon dioxide output ($VCO_2$) determines basal metabolic burn in intensive care and athletic conditioning."
    ],
    misconceptions: [
      "Misconception: 'Viruses are living cells.' Correction: Viruses lack cellular membranes, have no autonomous metabolic machinery to generate ATP, and cannot replicate outside of a living host cell; they are obligate molecular parasites.",
      "Misconception: 'Homeostasis means biological parameters remain permanently static.' Correction: Homeostasis is a dynamic equilibrium maintaining physiological variables within a safe oscillating tolerance window around a set-point."
    ]
  },

  "CHEM-M04": {
    topic: "Electrons in Atoms, Quantization & Atomic Spectra",
    theory: `The electronic structure of atoms cannot be explained by classical electrodynamics; an orbiting electron would continuously radiate electromagnetic energy and spiral into the nucleus within picoseconds. In 1913, Niels Bohr resolved this paradox by quantizing electron angular momentum in discrete non-radiating stationary orbits: $L = m_e v r = n \\frac{h}{2\\pi}$, where $n \\in \\{1, 2, 3, \\dots\\}$. Electrons transition between orbits only by absorbing or emitting a discrete photon of energy exactly equal to the difference between quantum states: $\\Delta E = E_{\\text{final}} - E_{\\text{initial}} = h\\nu = \\frac{hc}{\\lambda}$.

In the 1920s, Louis de Broglie hypothesized that if light waves possess particle momentum ($p = h/\\lambda$), then material particles such as electrons must conversely exhibit wave characteristics ($\\lambda = \\frac{h}{p} = \\frac{h}{mv}$). Erwin Schrödinger formulated the wave equation $\\hat{H}\\psi = E\\psi$, replacing fixed circular orbits with three-dimensional probability density wavefunctions ($|\\psi|^2$) termed atomic orbitals. The quantum state of an electron is uniquely defined by four quantum numbers: principal $n$ (energy shell), azimuthal $\\ell$ (orbital angular momentum shape: $s, p, d, f$), magnetic $m_\\ell$ (spatial orientation), and spin $m_s$ ($+\\frac{1}{2}, -\\frac{1}{2}$). Electron configurations follow three fundamental quantum principles: the Aufbau principle (lowest energy orbitals fill first), the Pauli exclusion principle (no two electrons in an atom can share all four quantum numbers), and Hund's rule (electrons singly occupy degenerate orbitals with parallel spins before pairing).`,
    mechanism: [
      "1. Quantized Energy Absorption & Excitation: When an atom absorbs thermal, electrical, or radiative energy, a ground-state valence electron is promoted to a higher unoccupied energy level ($n_i \\rightarrow n_f$, where $n_f > n_i$).",
      "2. Spontaneous Radiative Relaxation: The excited state has a finite lifetime (~$10^{-8}\\text{ s}$). The electron spontaneously drops back to a lower quantum state ($n_f \\rightarrow n_i$), emitting an electromagnetic wave packet (photon) with energy $E = h\\nu = \\frac{hc}{\\lambda}$.",
      "3. Hydrogen Balmer Emission Series: Transitions terminating at the second quantum level ($n=2$) produce photons in the human visible spectrum described by the empirical Rydberg formula: $\\frac{1}{\\lambda} = R_H \\left(\\frac{1}{2^2} - \\frac{1}{n^2}\\right)$, yielding the characteristic lines $H_\\alpha = 656.3\\text{ nm}$ (red, $3 \\rightarrow 2$), $H_\\beta = 486.1\\text{ nm}$ (cyan, $4 \\rightarrow 2$), $H_\\gamma = 434.0\\text{ nm}$ (blue, $5 \\rightarrow 2$), and $H_\\delta = 410.2\\text{ nm}$ (violet, $6 \\rightarrow 2$)."
    ],
    formula: "\\Delta E = -R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right) = h\\nu = \\frac{hc}{\\lambda}, \\quad \\lambda_{\\text{matter}} = \\frac{h}{m v}",
    parameters: [
      { sym: "E", name: "Photon Energy", unit: "\\text{J or eV}", desc: "Quantum energy of the emitted or absorbed light packet ($1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$)" },
      { sym: "h", name: "Planck's Constant", unit: "6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}", desc: "Fundamental physical constant of quantum action" },
      { sym: "c", name: "Speed of Light", unit: "2.998 \\times 10^8\\text{ m/s}", desc: "Universal velocity of electromagnetic radiation in vacuum" },
      { sym: "R_H", name: "Rydberg Energy Constant", unit: "2.179 \\times 10^{-18}\\text{ J } (13.606\\text{ eV})", desc: "Ground-state ionization energy constant for atomic hydrogen" },
      { sym: "n", name: "Principal Quantum Number", unit: "\\text{dimensionless integer}", desc: "Designates the main atomic electron shell and orbital radius" }
    ],
    workedExample: {
      problem: "Calculate the energy in Joules and the wavelength in nanometers of the photon emitted when an excited electron in a hydrogen atom undergoes a quantum transition from the n = 4 energy level to the n = 2 energy level. Identify the spectral color and series name.",
      given: "n_i = 4, \\quad n_f = 2, \\quad R_H = 2.179 \\times 10^{-18}\\text{ J}, \\quad h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}, \\quad c = 3.00 \\times 10^8\\text{ m/s}",
      steps: [
        "1. Calculate the energy difference: $\\Delta E = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right) = 2.179 \\times 10^{-18} \\left( \\frac{1}{2^2} - \\frac{1}{4^2} \\right) = 2.179 \\times 10^{-18} \\left( \\frac{1}{4} - \\frac{1}{16} \\right)$.",
        "2. Evaluate numeric fraction: $\\frac{1}{4} - \\frac{1}{16} = \\frac{3}{16} = 0.1875$.",
        "3. Compute photon energy: $\\Delta E = (2.179 \\times 10^{-18}\\text{ J}) \\times 0.1875 = 4.086 \\times 10^{-19}\\text{ J}$ ($2.55\\text{ eV}$).",
        "4. Calculate wavelength from $\\Delta E = \\frac{hc}{\\lambda} \\implies \\lambda = \\frac{hc}{\\Delta E}$: $\\lambda = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{4.086 \\times 10^{-19}} = \\frac{1.988 \\times 10^{-25}}{4.086 \\times 10^{-19}} = 4.865 \\times 10^{-7}\\text{ m} = 486.5\\text{ nm}$.",
        "5. Classification: This transition corresponds exactly to the $H_\\beta$ cyan-blue line of the visible Balmer series."
      ],
      answer: "\\Delta E = 4.09 \\times 10^{-19}\\text{ J}, \\quad \\lambda = 486.5\\text{ nm} \\quad (\\text{Balmer } H_\\beta \\text{ Cyan Line})"
    },
    applications: [
      "Astronomical Stellar Spectrometry: Astronomers analyze dark absorption Fraunhofer lines in star spectra to determine the elemental composition, temperature, and radial velocity (Doppler redshift) of distant galaxies.",
      "Semiconductor LED and Laser Diode Engineering: Direct bandgap semiconductors (such as GaN and GaAs) are tuned to emit specific photon wavelengths for fiber optic telecommunications and blue-violet optical storage.",
      "Analytical Flame Emission Spectroscopy: Clinical and environmental laboratories vaporize samples in high-temperature flames to quantify sodium ($589\\text{ nm}$ yellow doublet) and potassium ($766\\text{ nm}$ violet) electrolytes in blood serum."
    ],
    misconceptions: [
      "Misconception: 'Electrons orbit the nucleus along fixed circular planetary paths.' Correction: The Heisenberg uncertainty principle precludes definite simultaneous knowledge of position and momentum; atomic orbitals represent statistical 3D probability density distributions ($|\\psi|^2$) where electrons may be detected.",
      "Misconception: 'Light of higher intensity emits higher energy electrons in the photoelectric effect.' Correction: Photon energy depends strictly on frequency ($E = h\\nu$); increasing intensity merely increases the number of photons and emitted electrons, not their individual kinetic energies."
    ]
  },

  "CHEM-M05": {
    topic: "Periodic Table Architecture & Periodic Trends",
    theory: `The periodic law states that when elements are arranged in order of increasing atomic number ($Z$), their physical and chemical properties exhibit periodic, recurring patterns. This periodicity is governed by valence electron configurations and the balance between nuclear attractive charge and core electron shielding. Inner shell electrons shield outer valence electrons from the full nuclear charge. The net positive electrostatic attraction experienced by a valence electron is the effective nuclear charge ($Z_{\\text{eff}}$), approximated by Slater's model: $Z_{\\text{eff}} = Z - S$, where $S$ is the shielding constant.

Across a period (left to right), protons are added to the nucleus while electrons enter the same principal quantum shell. Because valence electrons are poor shielders of one another, $Z_{\\text{eff}}$ steadily increases. This escalating Coulombic attraction pulls the electron cloud closer to the nucleus, causing atomic radii to decrease while first ionization energy ($\\text{IE}_1$) and electronegativity ($\\chi$) systematically increase. Down a group (top to bottom), additional principal quantum shells are added ($n$ increases). Although $Z$ increases, the added inner core shells substantially shield the valence electrons and increase the average valence distance ($r$), causing atomic radii to expand while ionization energy and electronegativity decrease.`,
    mechanism: [
      "1. Effective Nuclear Charge ($Z_{\\text{eff}}$) Scaling: Moving left to right across Period 3 from Sodium ($Z=11$) to Chlorine ($Z=17$), core shielding remains roughly constant ($S \\approx 10$), causing $Z_{\\text{eff}}$ to climb from $\\sim +2.2$ to $\\sim +6.1$.",
      "2. Coulombic Contraction of Atomic Radii: By Coulomb's Law, attractive force scales as $F_e \\propto \\frac{Z_{\\text{eff}}}{r^2}$. The higher $Z_{\\text{eff}}$ draws the $3s$ and $3p$ electron densities closer to the nucleus, shrinking atomic radius from $186\\text{ pm}$ (Na) down to $99\\text{ pm}$ (Cl).",
      "3. Discontinuities in Ionization Energy: Anomalies occur at subshell boundaries. For example, Boron ($2s^2 2p^1$) has a lower $\\text{IE}_1$ than Beryllium ($2s^2$) because the single $2p$ electron is shielded by the complete $2s$ subshell and occupies a higher energy state. Oxygen ($2s^2 2p^4$) has a lower $\\text{IE}_1$ than Nitrogen ($2s^2 2p^3$) due to electron-electron Coulombic repulsion within the doubly occupied $2p_x$ orbital."
    ],
    formula: "Z_{\\text{eff}} = Z - S, \\quad F_e = k_e \\frac{Z_{\\text{eff}} \\cdot e^2}{r^2}, \\quad \\chi_{\\text{Pauling}} \\propto \\sqrt{E_{\\text{bond}} - \\bar{E}_{\\text{homo}}}",
    parameters: [
      { sym: "Z", name: "Nuclear Charge", unit: "\\text{integer}", desc: "Total number of protons in the atomic nucleus" },
      { sym: "S", name: "Screening Constant", unit: "\\text{dimensionless}", desc: "Effective shielding of nuclear charge by intervening inner core electrons" },
      { sym: "Z_{\\text{eff}}", name: "Effective Nuclear Charge", unit: "\\text{charge units}", desc: "Net attractive positive charge experienced by valence electrons" },
      { sym: "\\text{IE}_1", name: "First Ionization Energy", unit: "\\text{kJ/mol}", desc: "Minimum energy required to remove the most loosely held valence electron from a gaseous atom" },
      { sym: "r_{\\text{cov}}", name: "Covalent Radius", unit: "\\text{pm } (10^{-12}\\text{ m})", desc: "Half the internuclear distance between two identical bonded atoms" }
    ],
    workedExample: {
      problem: "Explain using effective nuclear charge and electronic configurations why the first ionization energy of Magnesium (Z=12, IE1 = 738 kJ/mol) is higher than that of Sodium (Z=11, IE1 = 496 kJ/mol), and why removing a second electron from Sodium requires an immense energy jump to IE2 = 4,562 kJ/mol.",
      given: "Z_{\\text{Na}} = 11, \\ [\\text{Ne}] 3s^1; \\quad Z_{\\text{Mg}} = 12, \\ [\\text{Ne}] 3s^2; \\quad \\text{Na: } \\text{IE}_1 = 496\\text{ kJ/mol}, \\ \\text{IE}_2 = 4,562\\text{ kJ/mol}",
      steps: [
        "1. Compare IE1: Both Na and Mg have valence electrons in the n = 3 shell shielded by 10 core electrons ([Ne] core).",
        "2. Compute Zeff: $Z_{\\text{eff}}(\\text{Na}) \\approx 11 - 10 = +1$, whereas $Z_{\\text{eff}}(\\text{Mg}) \\approx 12 - 10 = +2$. By Coulomb's Law, the greater $Z_{\\text{eff}}$ of Mg exerts a stronger electrostatic pull on its $3s$ valence pair, demanding more energy to ionize ($\\text{IE}_1 = 738\\text{ kJ/mol} > 496\\text{ kJ/mol}$).",
        "3. Analyze IE2 of Sodium: Removing the first electron from Na produces $\\text{Na}^+$ with a closed-shell noble gas configuration: $1s^2 2s^2 2p^6$.",
        "4. Evaluate the core break: Removing a second electron requires extracting a core electron from the $n=2$ principal shell. The $n=2$ orbital is located much closer to the nucleus ($r$ is vastly smaller) and is shielded by only 2 inner $1s$ electrons ($Z_{\\text{eff}} \\approx 11 - 2 = +9$).",
        "5. Conclusion: The huge jump (nearly 10-fold increase) from $496\\text{ kJ/mol}$ to $4,562\\text{ kJ/mol}$ proves that Sodium possesses exactly one valence electron."
      ],
      answer: "\\text{Na possesses 1 valence electron; } \\text{IE}_2 \\text{ requires disrupting stable } n=2 \\text{ noble-gas core}"
    },
    applications: [
      "Lithium-Ion Battery Anode Engineering: Lithium's low first ionization energy ($520\\text{ kJ/mol}$) and tiny ionic radius ($76\\text{ pm}$) maximize cell voltage potential ($3.7\\text{ V}$) and rapid interstitial intercalation into graphite anodes.",
      "Semiconductor Doping in Photovoltaics: Silicon (Group 14) is selectively doped with Phosphorus (Group 15, extra valence electron for n-type conductivity) or Boron (Group 13, electron holes for p-type conductivity).",
      "Lanthanide Optical Phosphors: Elements with partially filled $4f$ subshells shielded by outer $5s$ and $5p$ shells (such as Neodymium and Europium) produce sharp, temperature-stable spectral emissions for industrial lasers and displays."
    ],
    misconceptions: [
      "Misconception: 'Atoms get larger across a period because they have more protons and electrons.' Correction: Across a period, added electrons enter the same shell and cannot shield each other; the increasing positive nuclear charge pulls the electron cloud inward, shrinking atomic size.",
      "Misconception: 'Nonmetals have high electronegativity because they want to fill their octet.' Correction: Atoms do not have conscious desires; nonmetals have high electronegativity because high $Z_{\\text{eff}}$ and small atomic radii exert immense electrostatic attraction on shared bonding pairs."
    ]
  },

  "CHEM-M08": {
    topic: "Chemical Reactions, Net Ionic Equations & Precipitation",
    theory: `Chemical reactions represent the rearrangement of atomic nuclei and electronic bonds under the invariant constraint of the Law of Conservation of Mass. Chemical reactions are classified into five fundamental macroscopic archetypes: synthesis ($A + B \\rightarrow AB$), decomposition ($AB \\rightarrow A + B$), single-displacement ($A + BC \\rightarrow B + AC$, governed by the oxidation potential activity series), double-displacement metathesis ($AB + CD \\rightarrow AD + CB$), and hydrocarbon combustion ($C_xH_y + (x + y/4)O_2 \\rightarrow x CO_2 + (y/2) H_2O$).

In aqueous solution, soluble ionic compounds completely dissociate into hydrated solvated cations and anions. When two electrolyte solutions are mixed, a double-replacement reaction occurs if a driving force removes ions from solution: precipitation of an insoluble solid lattice, generation of an un-ionized molecular product (such as liquid water in acid-base neutralization), or evolution of an insoluble gas (such as $\\text{CO}_2$ or $\\text{SO}_2$). Molecular equations show complete neutral formula units. Complete ionic equations display all dissociated strong electrolytes as discrete solvated ions. Net ionic equations eliminate spectator ions—species that undergo no change in chemical state or oxidation number—revealing the fundamental chemical transformation.`,
    mechanism: [
      "1. Solvation and Hydration Shells: When solid ionic salts dissolve in water, polar $\\text{H}_2\\text{O}$ dipoles orient around ions (negative oxygen toward cations, positive hydrogens toward anions), overcoming crystal lattice energy with hydration enthalpy: $\\text{NaCl}(s) \\xrightarrow{\\text{H}_2\\text{O}} \\text{Na}^+(aq) + \\text{Cl}^-(aq)$.",
      "2. Metathesis Ion Exchange & Nucleation: When aqueous solutions containing compatible ions collide (such as $\\text{Ag}^+$ and $\\text{Cl}^-$), electrostatic Coulombic attraction overcomes hydration forces if the crystal lattice energy exceeds the sum of hydration enthalpies, nucleating an insoluble precipitate: $\\text{Ag}^+(aq) + \\text{Cl}^-(aq) \\rightarrow \\text{AgCl}(s)$.",
      "3. Elimination of Spectator Ions: Ions that remain in solution before and after the reaction (such as $\\text{Na}^+$ and $\\text{NO}_3^-$) appear identically on both sides of the complete ionic equation and cancel algebraically."
    ],
    formula: "\\text{Molecular: } AB(aq) + CD(aq) \\rightarrow AD(s) + CB(aq), \\quad \\text{Net Ionic: } A^+(aq) + D^-(aq) \\rightarrow AD(s)",
    parameters: [
      { sym: "K_{\\text{sp}}", name: "Solubility Product Constant", unit: "\\text{equilibrium quotient}", desc: "Thermodynamic equilibrium constant for dissolution of a sparingly soluble ionic compound" },
      { sym: "Q_{\\text{sp}}", name: "Ion Product Quotient", unit: "\\text{reaction quotient}", desc: "Calculated product of instantaneous ion concentrations; precipitation occurs when $Q_{\\text{sp}} > K_{\\text{sp}}$" },
      { sym: "(s), (l), (g)", name: "State Symbols", unit: "\\text{phase labels}", desc: "Solid precipitate, pure liquid solvent, or evolved gas" },
      { sym: "(aq)", name: "Aqueous Phase", unit: "\\text{solution state}", desc: "Solvated ions surrounded by polar water hydration spheres" }
    ],
    workedExample: {
      problem: "When 50.0 mL of 0.200 M aqueous lead(II) nitrate, Pb(NO3)2, is mixed with 50.0 mL of 0.300 M aqueous potassium iodide, KI, a vibrant canary-yellow precipitate forms. Write the balanced molecular, complete ionic, and net ionic equations, identify the spectator ions, and calculate the theoretical mass of precipitate formed.",
      given: "V_1 = 50.0\\text{ mL}, \\ [\\text{Pb(NO}_3)_2] = 0.200\\text{ M}; \\quad V_2 = 50.0\\text{ mL}, \\ [\\text{KI}] = 0.300\\text{ M}; \\quad M_{\\text{PbI}_2} = 461.0\\text{ g/mol}",
      steps: [
        "1. Write balanced molecular equation: $\\text{Pb(NO}_3)_2(aq) + 2\\text{KI}(aq) \\rightarrow \\text{PbI}_2(s) + 2\\text{KNO}_3(aq)$.",
        "2. Formulate complete ionic equation: $\\text{Pb}^{2+}(aq) + 2\\text{NO}_3^-(aq) + 2\\text{K}^+(aq) + 2\\text{I}^-(aq) \\rightarrow \\text{PbI}_2(s) + 2\\text{K}^+(aq) + 2\\text{NO}_3^-(aq)$.",
        "3. Cancel spectator ions ($\\text{K}^+$ and $\\text{NO}_3^-$) to yield the net ionic equation: $\\text{Pb}^{2+}(aq) + 2\\text{I}^-(aq) \\rightarrow \\text{PbI}_2(s)$.",
        "4. Calculate initial moles: $n(\\text{Pb}^{2+}) = (0.0500\\text{ L})(0.200\\text{ M}) = 0.0100\\text{ mol}$; $n(\\text{I}^-) = (0.0500\\text{ L})(0.300\\text{ M}) = 0.0150\\text{ mol}$.",
        "5. Determine limiting reactant: The stoichiometric ratio requires $2\\text{ mol I}^-$ per $1\\text{ mol Pb}^{2+}$. To react all $0.0100\\text{ mol Pb}^{2+}$ would require $0.0200\\text{ mol I}^-$. Since only $0.0150\\text{ mol I}^-$ is available, $\\text{I}^-$ is the limiting reactant.",
        "6. Compute precipitate yield: $n(\\text{PbI}_2) = \\frac{0.0150\\text{ mol I}^-}{2} = 0.00750\\text{ mol PbI}_2$. Mass $= (0.00750\\text{ mol}) \\times (461.0\\text{ g/mol}) = 3.458\\text{ g}$."
      ],
      answer: "\\text{Net Ionic: } \\text{Pb}^{2+}(aq) + 2\\text{I}^-(aq) \\rightarrow \\text{PbI}_2(s); \\quad \\text{Yield } = 3.46\\text{ g PbI}_2"
    },
    applications: [
      "Municipal Wastewater Heavy Metal Remediation: Toxic soluble lead ($Pb^{2+}$), cadmium ($Cd^{2+}$), and mercury ($Hg^{2+}$) ions are precipitated as insoluble sulfide ($S^{2-}$) or hydroxide ($OH^-$) sludges before industrial effluent discharge.",
      "Automotive Catalytic Converters: Platinum, palladium, and rhodium catalysts accelerate oxidation of unburned hydrocarbons and carbon monoxide ($2CO + O_2 \\rightarrow 2CO_2$) and reduction of nitrogen oxides ($2NO_x \\rightarrow N_2 + x O_2$).",
      "Clinical Diagnostics for Electrolytes: Turbidimetric precipitation assays measure serum chloride and urinary sulfate to diagnose cystic fibrosis and renal metabolic acidosis."
    ],
    misconceptions: [
      "Misconception: 'Spectator ions are destroyed or converted into other elements during the reaction.' Correction: Spectator ions remain completely unchanged in solution; they simply do not participate in chemical bond formation.",
      "Misconception: 'All ionic compounds dissolve in water because water is polar.' Correction: Insoluble ionic salts (such as $BaSO_4$ or $AgCl$) possess lattice energies far exceeding water's hydration enthalpy, preventing spontaneous dissolution."
    ]
  },

  "CHEM-M09": {
    topic: "The Mole, Avogadro's Number & Molar Mass Calculations",
    theory: `The mole (symbol: mol) is the fundamental SI base unit for amount of substance, formally defined in the 2019 SI redefinition as containing exactly 6.02214076 × 10²³ elementary entities (Avogadro's constant, N_A). Because atoms and molecules are sub-nanometer particles with masses on the order of 10⁻²⁴ grams, counting individual particles directly in a laboratory is physically impossible. The mole acts as the essential dimensional bridge connecting the microscopic particulate domain of atomic mass units (amu or Da) to the macroscopic observable domain of grams on an analytical balance.

One mole of any chemical element contains exactly Avogadro's number of atoms and possesses a mass in grams numerically equal to its relative atomic mass on the IUPAC Periodic Table. For compounds, molar mass (M) is the sum of the standard atomic weights of all constituent atoms in the chemical formula unit. The quantitative conversion between macroscopic sample mass (m), chemical amount in moles (n), and discrete particle count (N) constitutes the foundation of all chemical metrology: n = m / M and N = n × N_A. Furthermore, percentage composition by mass enables the empirical deduction of the simplest whole-number atomic ratio (empirical formula), which when scaled by molecular mass reveals the exact molecular formula.`,
    mechanism: [
      "1. Avogadro Scale Translation: A single carbon-12 atom has a mass of exactly 12 amu. Because 1 gram equals 6.022 × 10²³ amu, exactly 1 mole of carbon-12 atoms weighs exactly 12.000 grams.",
      "2. Molar Mass Calculation: Formula mass is calculated by multiplying each element's atomic subscript by its standard atomic mass: for water (H₂O), M = 2(1.008 g/mol) + 1(15.999 g/mol) = 18.015 g/mol.",
      "3. Dimensional Unit Conversion Pathway: Mass in grams (g) is divided by molar mass (g/mol) to obtain moles; moles are multiplied by Avogadro's constant (6.022 × 10²³ particles/mol) to determine exact atom/molecule counts."
    ],
    formula: "n = \\frac{m}{M}, \\quad N = n \\times N_A, \\quad \\% \\text{ Composition} = \\frac{n_{\\text{element}} \\times M_{\\text{element}}}{M_{\\text{compound}}} \\times 100\\%",
    parameters: [
      { sym: "n", name: "Amount of Substance", unit: "\\text{mol}", desc: "Number of moles of chemical formula units" },
      { sym: "m", name: "Sample Mass", unit: "\\text{g}", desc: "Measured mass of pure chemical specimen on analytical balance" },
      { sym: "M", name: "Molar Mass", unit: "\\text{g/mol}", desc: "Mass of one mole of formula units derived from periodic table atomic weights" },
      { sym: "N_A", name: "Avogadro's Constant", unit: "6.022 \\times 10^{23}\\text{ mol}^{-1}", desc: "Fixed numerical value defining the SI mole" },
      { sym: "N", name: "Particle Count", unit: "\\text{atoms / molecules}", desc: "Total number of discrete elementary chemical entities" }
    ],
    workedExample: {
      problem: "A laboratory sample of pure Calcium Carbonate (CaCO₃, primary mineral in limestone and antacid tablets) has a measured mass of m = 25.00 g. (a) Calculate the molar mass of CaCO₃; (b) Determine the chemical amount in moles; (c) Calculate the total number of formula units and the total number of oxygen atoms present in this sample.",
      given: "m = 25.00\\text{ g CaCO}_3; \\quad M_{\\text{Ca}} = 40.08\\text{ g/mol}, \\ M_{\\text{C}} = 12.01\\text{ g/mol}, \\ M_{\\text{O}} = 16.00\\text{ g/mol}; \\quad N_A = 6.022 \\times 10^{23}\\text{ mol}^{-1}",
      steps: [
        "1. Calculate compound molar mass: $M(\\text{CaCO}_3) = 40.08 + 12.01 + 3(16.00) = 100.09\\text{ g/mol}$.",
        "2. Convert sample mass to chemical moles: $n = \\frac{m}{M} = \\frac{25.00\\text{ g}}{100.09\\text{ g/mol}} = 0.2498\\text{ mol CaCO}_3$.",
        "3. Compute total CaCO₃ formula units: $N = n \\times N_A = 0.2498\\text{ mol} \\times (6.022 \\times 10^{23}\\text{ formula units/mol}) = 1.504 \\times 10^{23}\\text{ formula units}$.",
        "4. Determine individual oxygen atom count: Each formula unit contains 3 oxygen atoms ($1\\text{ mol CaCO}_3 \\to 3\\text{ mol O}$). Therefore, $N_{\\text{O}} = 3 \\times (1.504 \\times 10^{23}) = 4.513 \\times 10^{23}\\text{ oxygen atoms}$.",
        "5. Verify consistency: $(0.2498\\text{ mol}) \\times (100.09\\text{ g/mol}) = 25.00\\text{ g}$, confirming conservation of mass."
      ],
      answer: "n = 0.2498\\text{ mol}, \\quad N_{\\text{CaCO}_3} = 1.50 \\times 10^{23}\\text{ formula units}, \\quad N_{\\text{O}} = 4.51 \\times 10^{23}\\text{ oxygen atoms}",
      status: "Curriculum Standard Reference Solution (Under Specialist Review)",
      isVerified: false
    },
    applications: [
      "Pharmaceutical Drug Formulation & Dosages: Active pharmaceutical ingredients (APIs) are synthesized and dosed according to molecular mole ratios to ensure exact therapeutic receptor binding without toxic overdosing.",
      "Industrial Chemical Manufacturing & Yield Optimization: Petrochemical and fertilizer refineries meter raw reagents (such as ethylene or ammonia) in metric kilmoles to balance continuous chemical reactors.",
      "Forensic & Environmental Spectroscopy: Mass spectrometry measures mass-to-charge ratios (m/z) to quantify nanomolar concentrations of environmental contaminants, pesticides, and illicit compounds in groundwater."
    ],
    misconceptions: [
      "Misconception: 'One mole of any substance always has the same mass.' Correction: One mole always contains the same NUMBER of particles (6.022 × 10²³), but their mass varies drastically depending on atomic weights (1 mol H₂ = 2.016 g, whereas 1 mol U = 238 g).",
      "Misconception: 'The mole is a unit of mass.' Correction: The mole is the SI base unit for 'amount of substance' (a particle count), distinct from mass (kilograms) or volume (liters)."
    ]
  },

  "CHEM-M10": {
    topic: "Stoichiometry, Limiting Reactants & Chemical Yield",
    theory: `Stoichiometry is the quantitative bookkeeping of matter transformations based on the mole concept and balanced chemical equations. Coefficients in a balanced equation represent exact stoichiometric ratios of particles and moles, not direct ratios of macroscopic mass. The central pillar of stoichiometric problem-solving is the four-step mole pathway: (1) Convert initial known mass or volume to moles via molar mass or ideal gas relations; (2) Apply the molar ratio from the balanced equation; (3) Convert target moles to desired macroscopic units (grams, liters, or concentration); (4) Account for limiting reactants and reaction efficiency.

In any real chemical process, reactants are rarely present in exact stoichiometric proportions. The limiting reactant is the chemical species that is completely consumed first, dictating the maximum theoretical yield of product that can be synthesized. Any other reactants remain partially unconsumed as excess reactants. The actual yield obtained empirically in a laboratory or factory is almost universally lower than the theoretical yield due to incomplete equilibrium conversion, side reactions producing unwanted byproducts, physical mechanical losses during filtration and recrystallization, or trace impurities in starting materials. Reaction efficiency is quantified by percent yield.`,
    mechanism: [
      "1. Particulate Molar Stoichiometry: A balanced equation such as $2\\text{Al}(s) + 3\\text{Cl}_2(g) \\rightarrow 2\\text{AlCl}_3(s)$ dictates that exactly 2 moles of solid aluminum react with 3 moles of diatomic chlorine gas to yield 2 moles of solid aluminum chloride.",
      "2. Limiting Reactant Consumption: Each mole of reactant has a specific yield capacity. Whichever reactant generates the smaller theoretical quantity of product is mathematically limiting; once its atoms are fully incorporated into products, the reaction ceases immediately.",
      "3. Percent Yield Energetics: In reversible reactions governed by equilibrium constants ($K_{\\text{eq}}$), reactions do not proceed to 100% completion; theoretical yield represents the hypothetical maximum assuming 100% unidirectional conversion."
    ],
    formula: "\\% \\text{ Yield} = \\frac{\\text{Actual Mass Measured}}{\\text{Theoretical Mass Calculated}} \\times 100\\%, \\quad n = \\frac{m}{M}",
    parameters: [
      { sym: "n", name: "Amount of Substance", unit: "\\text{moles (mol)}", desc: "Quantity containing $6.022 \\times 10^{23}$ particles (Avogadro's number)" },
      { sym: "m", name: "Sample Mass", unit: "\\text{grams (g)}", desc: "Measured mass of pure chemical substance" },
      { sym: "M", name: "Molar Mass", unit: "\\text{g/mol}", desc: "Mass of one mole of formula units derived from atomic weights" },
      { sym: "\\% \\text{ Yield}", name: "Percent Yield", unit: "\\%", desc: "Measure of practical reaction efficiency and conversion completeness" }
    ],
    workedExample: {
      problem: "In an exothermic synthesis demonstration, 13.5 g of solid aluminum metal flakes are reacted with 42.6 g of chlorine gas inside a sealed Schlenk chamber to produce anhydrous aluminum chloride powder (2Al + 3Cl2 -> 2AlCl3). Identify the limiting reactant, calculate the maximum theoretical yield of AlCl3 in grams, and determine the mass of excess reactant remaining unreacted.",
      given: "m_{\\text{Al}} = 13.5\\text{ g}, \\ M_{\\text{Al}} = 26.98\\text{ g/mol}; \\quad m_{\\text{Cl}_2} = 42.6\\text{ g}, \\ M_{\\text{Cl}_2} = 70.90\\text{ g/mol}; \\quad M_{\\text{AlCl}_3} = 133.34\\text{ g/mol}",
      steps: [
        "1. Convert starting masses to moles: $n_{\\text{Al}} = \\frac{13.5\\text{ g}}{26.98\\text{ g/mol}} = 0.5004\\text{ mol Al}$; $n_{\\text{Cl}_2} = \\frac{42.6\\text{ g}}{70.90\\text{ g/mol}} = 0.6008\\text{ mol Cl}_2$.",
        "2. Calculate theoretical yield from each reactant: From Al: $0.5004\\text{ mol Al} \\times \\frac{2\\text{ mol AlCl}_3}{2\\text{ mol Al}} = 0.5004\\text{ mol AlCl}_3$. From Cl2: $0.6008\\text{ mol Cl}_2 \\times \\frac{2\\text{ mol AlCl}_3}{3\\text{ mol Cl}_2} = 0.4005\\text{ mol AlCl}_3$.",
        "3. Identify limiting reactant: Chlorine gas ($\text{Cl}_2$) produces less $\\text{AlCl}_3$ ($0.4005\\text{ mol} < 0.5004\\text{ mol}$). Therefore, $\\text{Cl}_2$ is the limiting reactant.",
        "4. Calculate theoretical yield mass: $m(\\text{AlCl}_3) = 0.4005\\text{ mol} \\times 133.34\\text{ g/mol} = 53.40\\text{ g}$.",
        "5. Determine excess Al consumed: $0.6008\\text{ mol Cl}_2 \\times \\frac{2\\text{ mol Al}}{3\\text{ mol Cl}_2} = 0.4005\\text{ mol Al consumed}$.",
        "6. Calculate unreacted excess Al: Moles left $= 0.5004 - 0.4005 = 0.0999\\text{ mol Al}$. Excess mass $= 0.0999\\text{ mol} \\times 26.98\\text{ g/mol} = 2.70\\text{ g Al remaining unreacted}$."
      ],
      answer: "\\text{Limiting Reactant: } \\text{Cl}_2, \\quad \\text{Theoretical Yield } = 53.4\\text{ g AlCl}_3, \\quad \\text{Excess Al Remaining } = 2.70\\text{ g}"
    },
    applications: [
      "Haber-Bosch Industrial Ammonia Synthesis: Fertilizer factories inject $N_2$ and $H_2$ in precise stoichiometric ratios ($1:3$) over iron oxide catalysts at $200\\text{ atm}$ to maximize nitrogen conversion for global agriculture.",
      "Rocket Propellant Oxidizer-to-Fuel (O/F) Optimization: SpaceX Raptor rocket engines meter liquid methane ($CH_4$) and liquid oxygen ($LOX$) at an optimal O/F mass ratio ($\sim 3.6$) to maximize specific impulse ($I_{\\text{sp}}$) while preventing engine burnout.",
      "Pharmaceutical Synthesis & Atom Economy: Organic process chemists engineer multi-step drug syntheses maximizing 'atom economy'—the percentage of reactant mass incorporated into the final active pharmaceutical ingredient (API)."
    ],
    misconceptions: [
      "Misconception: 'The reactant present in the smallest mass is always the limiting reactant.' Correction: Limiting reactants depend strictly on moles and stoichiometric coefficients, not grams; $10\\text{ g}$ of a heavy molecule contains far fewer moles than $5\\text{ g}$ of a light molecule.",
      "Misconception: 'A 100% yield means the reaction was successful, whereas an 80% yield means the chemist made an error.' Correction: Many reversible reactions reach thermodynamic equilibrium before 100% conversion, and chemical purification steps inherently incur physical partition losses."
    ]
  },

  // === PHYSICS DEEP RECORDS ===
  "PHYS-M02": {
    topic: "Representing Motion, Velocity Vectors & Coordinate Frames",
    theory: `Kinematics models spatial displacement over time. A position vector $\\vec{r}(t)$ locates a particle relative to a chosen reference frame origin. Displacement ($\\Delta \\vec{x} = \\vec{x}_f - \\vec{x}_i$) is an invariant vector quantity independent of the coordinate system origin, contrasting with path distance ($d$), which is a scalar measuring cumulative trajectory length. In Galilean relativity, velocities measured in two inertial frames translating at constant relative velocity $\\vec{v}_{AB}$ add vectorially: $\\vec{v}_{P/A} = \\vec{v}_{P/B} + \\vec{v}_{B/A}$.

Average velocity is defined as the secant slope between two points on a position-time graph: $\\bar{\\vec{v}} = \\frac{\\Delta \\vec{x}}{\\Delta t}$. Instantaneous velocity is the calculus limit of average velocity as the elapsed time interval approaches zero: $\\vec{v}(t) = \\lim_{\\Delta t \\rightarrow 0} \\frac{\\Delta \\vec{x}}{\\Delta t} = \\frac{d\\vec{x}}{dt}$, representing the tangent slope at that instant. Speed is the scalar magnitude of instantaneous velocity ($v = |\\vec{v}|$). On a position-time curve, positive slope indicates forward motion, negative slope indicates backward motion, zero slope represents rest, and curvature indicates acceleration.`,
    mechanism: [
      "1. Vector Coordinate Projection: In Cartesian coordinates, position is resolved as $\\vec{r}(t) = x(t)\\hat{i} + y(t)\\hat{j}$. Motion along each axis can be analyzed independently through differential calculus.",
      "2. Slope Metrology: The derivative $\\frac{dx}{dt}$ yields velocity; if position varies quadratically ($x(t) = c t^2$), velocity varies linearly ($v(t) = 2ct$), indicating constant acceleration.",
      "3. Area Under Velocity Curves: Definite integration reverses differentiation: $\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt$. The signed geometric area bounded by the velocity curve and the time axis equals net vector displacement."
    ],
    formula: "\\vec{v}(t) = \\frac{d\\vec{x}}{dt}, \\quad \\bar{v} = \\frac{\\Delta x}{\\Delta t}, \\quad \\Delta x = \\int_{t_i}^{t_f} v(t)\\,dt",
    parameters: [
      { sym: "x(t)", name: "Instantaneous Position", unit: "\\text{m}", desc: "Vector location relative to reference coordinate origin" },
      { sym: "v(t)", name: "Instantaneous Velocity", unit: "\\text{m/s}", desc: "First time derivative of position vector; tangent slope of $x-t$ graph" },
      { sym: "\\Delta x", name: "Displacement", unit: "\\text{m}", desc: "Net straight-line separation vector between initial and final points" },
      { sym: "t", name: "Time Coordinate", unit: "\\text{s}", desc: "Independent temporal scalar parameter" }
    ],
    workedExample: {
      problem: "An autonomous drone executes a straight test flight along an east-west axis. Its position in meters over time is described by x(t) = 3.0 t² - 0.50 t³ for 0 <= t <= 6.0 s. Calculate the instantaneous velocity at t = 2.0 s, find the time at which the drone momentarily comes to rest, and calculate the total displacement between t = 0 and t = 6.0 s.",
      given: "x(t) = 3.0 t^2 - 0.50 t^3, \\quad t_1 = 2.0\\text{ s}, \\quad t_2 = 6.0\\text{ s}",
      steps: [
        "1. Differentiate position with respect to time to find velocity: $v(t) = \\frac{dx}{dt} = \\frac{d}{dt}(3.0 t^2 - 0.50 t^3) = 6.0 t - 1.50 t^2$.",
        "2. Compute instantaneous velocity at $t = 2.0\\text{ s}$: $v(2.0) = 6.0(2.0) - 1.50(2.0)^2 = 12.0 - 1.50(4.0) = 12.0 - 6.0 = 6.0\\text{ m/s}$ (directed East).",
        "3. Find when the drone comes to rest ($v(t) = 0$): $6.0 t - 1.50 t^2 = 0 \\implies t(6.0 - 1.50 t) = 0$. Excluding initial rest at $t = 0$, the drone halts when $6.0 - 1.50 t = 0 \\implies t = \\frac{6.0}{1.50} = 4.0\\text{ s}$.",
        "4. Calculate net displacement at $t = 6.0\\text{ s}$: $\\Delta x = x(6.0) - x(0) = [3.0(6.0)^2 - 0.50(6.0)^3] - 0 = [3.0(36.0) - 0.50(216.0)] = 108.0 - 108.0 = 0.0\\text{ m}$."
      ],
      answer: "v(2.0\\text{ s}) = +6.0\\text{ m/s}, \\quad t_{\\text{rest}} = 4.0\\text{ s}, \\quad \\Delta x(6.0\\text{ s}) = 0.0\\text{ m} \\quad (\\text{Returned to origin})"
    },
    applications: [
      "GPS Satellite Trilateration: Precision atomic clocks onboard 31 GPS satellites transmit pseudo-random time codes; receivers calculate range vectors ($r = c \\Delta t$) from four satellites to fix user coordinates within centimeters.",
      "High-Frequency Algorithmic Stock Routing: Telecommunication links utilize optical fiber velocity pulses ($v \\approx 2.0 \\times 10^8\\text{ m/s}$) to minimize microsecond latency across financial exchanges.",
      "Biomechanical Gait Motion Capture: High-speed infrared cameras track reflective retroreflective markers on athletes to derive angular velocity vectors for injury rehabilitation."
    ],
    misconceptions: [
      "Misconception: 'If average velocity is zero over an interval, the object remained stationary.' Correction: An object can travel thousands of miles and return to its starting point; its displacement and average velocity are zero, but instantaneous velocity and distance were non-zero.",
      "Misconception: 'Speed and velocity are interchangeable scientific terms.' Correction: Speed is a scalar magnitude without direction; velocity is a vector possessing both magnitude and direction."
    ]
  },

  "PHYS-M05": {
    topic: "Forces in Two Dimensions, Friction & Inclined Planes",
    theory: `When forces act non-collinearly in two dimensions, Newtonian equilibrium ($\\sum \\vec{F} = 0$) and acceleration ($\\sum \\vec{F} = m\\vec{a}$) require vector resolution into orthogonal components. Along an inclined plane angled at $\\theta$ above the horizontal, standard Cartesian axes are rotated so that the $x$-axis aligns parallel to the ramp surface and the $y$-axis aligns perpendicular to the ramp. In this rotated coordinate frame, the downward gravitational force vector ($F_g = mg$) is resolved into two orthogonal components: $F_{g\\parallel} = mg \\sin\\theta$ (pulling down the incline) and $F_{g\\perp} = mg \\cos\\theta$ (pressing into the ramp).

Because the mass cannot accelerate into or off the rigid track, the normal force matches the perpendicular gravitational component: $F_N = mg \\cos\\theta$. Friction is an emergent macroscopic force arising from microscopic electrostatic cold-welding between surface asperities. Static friction ($f_s \\le \\mu_s F_N$) opposes the impending onset of relative motion, adjusting up to a maximum threshold. Once motion begins, kinetic friction ($f_k = \\mu_k F_N$) opposes sliding velocity. The critical angle of repose—the maximum ramp incline before an object spontaneously begins sliding—depends strictly on the static friction coefficient: $\\tan\\theta_c = \\mu_s$, independent of object mass.`,
    mechanism: [
      "1. Rotated Axis Decomposition: Gravitational weight acts vertically downward. Projecting $\\vec{W}$ onto the inclined axes yields $W_x = W \\sin\\theta$ and $W_y = -W \\cos\\theta$.",
      "2. Normal Force Balance: Newton's First Law along the normal axis dictates $\\sum F_y = F_N - mg \\cos\\theta = 0 \\implies F_N = mg \\cos\\theta$. As incline steepness $\\theta$ increases, $\\cos\\theta$ decreases, reducing $F_N$ and consequently reducing maximum available friction.",
      "3. Net Parallel Acceleration: Applying Newton's Second Law along the ramp axis yields $\\sum F_x = mg \\sin\\theta - f_k = m a_x$. Substituting $f_k = \\mu_k mg \\cos\\theta$ gives the mass-independent acceleration equation: $a = g(\\sin\\theta - \\mu_k \\cos\\theta)$."
    ],
    formula: "F_N = mg \\cos\\theta, \\quad f_k = \\mu_k mg \\cos\\theta, \\quad a = g(\\sin\\theta - \\mu_k \\cos\\theta), \\quad \\mu_s = \\tan\\theta_c",
    parameters: [
      { sym: "m", name: "Incline Mass", unit: "\\text{kg}", desc: "Quantity of matter resting on the inclined surface" },
      { sym: "\\theta", name: "Incline Angle", unit: "\\text{degrees (}^\circ\\text{)}", desc: "Angle of track elevated above the horizontal plane" },
      { sym: "F_N", name: "Normal Force", unit: "\\text{N}", desc: "Perpendicular contact force exerted by the ramp surface" },
      { sym: "f_k", name: "Kinetic Friction", unit: "\\text{N}", desc: "Retarding contact force opposing active surface sliding" },
      { sym: "\\mu_k", name: "Kinetic Friction Coefficient", unit: "\\text{dimensionless}", desc: "Empirical roughness constant characteristic of the two contacting materials" }
    ],
    workedExample: {
      problem: "A 15.0 kg laboratory dynamics cart rests on a 30.0° incline track. The coefficient of static friction between cart wheels and track is μs = 0.35, and kinetic friction is μk = 0.20. Determine if the cart remains in static equilibrium or accelerates, calculate the normal force, the friction force, and find the acceleration down the plane. (Use g = 9.80 m/s²).",
      given: "m = 15.0\\text{ kg}, \\quad \\theta = 30.0^\\circ, \\quad \\mu_s = 0.35, \\quad \\mu_k = 0.20, \\quad g = 9.80\\text{ m/s}^2",
      steps: [
        "1. Calculate perpendicular gravity component and normal force: $F_N = mg \\cos\\theta = (15.0)(9.80)\\cos(30.0^\\circ) = 147.0 \\times 0.8660 = 127.3\\text{ N}$.",
        "2. Compute downhill driving force: $F_{g\\parallel} = mg \\sin\\theta = (15.0)(9.80)\\sin(30.0^\\circ) = 147.0 \\times 0.500 = 73.5\\text{ N}$.",
        "3. Evaluate maximum static friction threshold: $f_{s,\\max} = \\mu_s F_N = (0.35)(127.3\\text{ N}) = 44.6\\text{ N}$.",
        "4. Determine motion state: Since the driving force $F_{g\\parallel} = 73.5\\text{ N} > f_{s,\\max} = 44.6\\text{ N}$, static friction is overcome and the cart accelerates down the ramp.",
        "5. Calculate active kinetic friction: $f_k = \\mu_k F_N = (0.20)(127.3\\text{ N}) = 25.5\\text{ N}$.",
        "6. Calculate net acceleration: $a = \\frac{F_{g\\parallel} - f_k}{m} = \\frac{73.5 - 25.5}{15.0} = \\frac{48.0\\text{ N}}{15.0\\text{ kg}} = 3.20\\text{ m/s}^2$."
      ],
      answer: "F_N = 127.3\\text{ N}, \\quad f_k = 25.5\\text{ N}, \\quad a = 3.20\\text{ m/s}^2 \\quad (\\text{Accelerates down ramp})"
    },
    applications: [
      "Highway Banked Turn Engineering: Civil engineers angle civil roadway curves by $\\theta = \\arctan(v^2 / Rg)$ so that normal force provides the required centripetal acceleration, allowing vehicles to corner safely even on frictionless ice.",
      "Avalanche Safety Modeling: Snow scientists monitor steep alpine slope angles; slopes steeper than $30^\circ$ to $45^\circ$ exceed the critical shear friction of packed snow slabs, triggering mass-wasting avalanches.",
      "Material Conveyor Belt Sizing: Industrial bulk handling belts in mining operations are angled strictly below $\\theta = \\arctan(\\mu_s)$ to prevent granular ore from sliding backward during transport."
    ],
    misconceptions: [
      "Misconception: 'Normal force is always equal to mg.' Correction: Normal force equals $mg$ only on a flat, non-accelerating horizontal surface; on an incline, $F_N = mg \\cos\\theta$, which approaches zero as the surface tilts toward vertical.",
      "Misconception: 'Heavier objects slide down friction ramps faster than light objects.' Correction: In the absence of air drag, mass cancels identically from both the gravitational driving force and inertia ($a = g(\\sin\\theta - \\mu_k \\cos\\theta)$); a 1-ton block and a 1-gram coin slide with identical acceleration."
    ]
  },

  "PHYS-M06": {
    topic: "Motion in Two Dimensions & Projectile Kinematics",
    theory: `Projectile motion is the two-dimensional trajectory of an unpowered object launched into a uniform gravitational field where air resistance is negligible. The foundational principle discovered by Galileo Galilei is the complete orthogonal independence of horizontal and vertical motions: the horizontal component of velocity ($v_x$) remains completely constant ($a_x = 0$), while the vertical component ($v_y$) is constantly accelerated downward by Earth's gravity ($a_y = -g = -9.80\\text{ m/s}^2$). Time ($t$) is the sole scalar parameter coupling the two orthogonal axes.

When launched with initial speed $v_0$ at angle $\\theta$ above the horizontal, the initial velocity resolves into $v_{0x} = v_0 \\cos\\theta$ and $v_{0y} = v_0 \\sin\\theta$. At the peak apex of the parabolic path, vertical velocity is momentarily zero ($v_y = 0$), while horizontal velocity remains $v_x = v_0 \\cos\\theta$. By eliminating time $t$ between the horizontal position equation ($x = v_{0x} t$) and the vertical position equation ($y = v_{0y} t - \\frac{1}{2}gt^2$), the spatial trajectory is proven to be a pure mathematical parabola: $y(x) = (\\tan\\theta)x - \\left(\\frac{g}{2v_0^2 \\cos^2\\theta}\\right)x^2$. On level ground ($y_f = y_0$), maximum horizontal range is achieved at launch angle $\\theta = 45^\\circ$.`,
    mechanism: [
      "1. Vector Launch Decomposition: Velocity is resolved as $\\vec{v}_0 = (v_0 \\cos\\theta)\\hat{i} + (v_0 \\sin\\theta)\\hat{j}$.",
      "2. Time of Flight: Setting vertical displacement to zero ($y = 0$) for a symmetric launch yields $t_{\\text{flight}} = \\frac{2v_0 \\sin\\theta}{g}$. Peak height occurs at half-time: $t_{\\text{apex}} = \\frac{v_0 \\sin\\theta}{g}$.",
      "3. Horizontal Range Formula: Multiplying constant horizontal velocity by flight time yields $R = v_{0x} t_{\\text{flight}} = (v_0 \\cos\\theta) \\left(\\frac{2v_0 \\sin\\theta}{g}\\right)$. Using the trigonometric double-angle identity $2\\sin\\theta\\cos\\theta = \\sin(2\\theta)$, range simplifies to $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$."
    ],
    formula: "R = \\frac{v_0^2 \\sin(2\\theta)}{g}, \\quad H_{\\max} = \\frac{v_0^2 \\sin^2\\theta}{2g}, \\quad t_{\\text{flight}} = \\frac{2 v_0 \\sin\\theta}{g}",
    parameters: [
      { sym: "v_0", name: "Initial Launch Velocity", unit: "\\text{m/s}", desc: "Total muzzle velocity vector magnitude at launch" },
      { sym: "\\theta", name: "Launch Angle", unit: "\\text{degrees (}^\circ\\text{)}", desc: "Elevation angle above the horizontal ground plane" },
      { sym: "R", name: "Horizontal Range", unit: "\\text{m}", desc: "Total horizontal distance traveled between launch and level impact" },
      { sym: "H_{\\max}", name: "Maximum Apex Height", unit: "\\text{m}", desc: "Peak vertical altitude reached where instantaneous vertical velocity $v_y = 0$" },
      { sym: "g", name: "Gravitational Acceleration", unit: "9.80\\text{ m/s}^2", desc: "Downward acceleration constant near Earth's surface" }
    ],
    workedExample: {
      problem: "A Pasco ballistic spring launcher on a laboratory bench fires a 50.0 g hardened chrome steel ball with muzzle velocity v0 = 18.0 m/s at an angle of 35.0° above the horizontal onto a level carbon paper target. Calculate the total flight time, the maximum apex altitude above launch, and the horizontal landing range. (Use g = 9.80 m/s²).",
      given: "v_0 = 18.0\\text{ m/s}, \\quad \\theta = 35.0^\\circ, \\quad g = 9.80\\text{ m/s}^2",
      steps: [
        "1. Resolve initial velocity components: $v_{0x} = v_0 \\cos(35.0^\\circ) = 18.0 \\times 0.8192 = 14.75\\text{ m/s}$; $v_{0y} = v_0 \\sin(35.0^\\circ) = 18.0 \\times 0.5736 = 10.32\\text{ m/s}$.",
        "2. Calculate total flight time: $t_{\\text{flight}} = \\frac{2 v_{0y}}{g} = \\frac{2(10.32\\text{ m/s})}{9.80\\text{ m/s}^2} = \\frac{20.65}{9.80} = 2.108\\text{ s}$.",
        "3. Compute maximum apex height: $H_{\\max} = \\frac{v_{0y}^2}{2g} = \\frac{(10.32)^2}{2(9.80)} = \\frac{106.6}{19.60} = 5.44\\text{ m}$.",
        "4. Calculate horizontal range: $R = v_{0x} \\times t_{\\text{flight}} = (14.75\\text{ m/s}) \\times (2.108\\text{ s}) = 31.09\\text{ m}$.",
        "5. Verify via range formula: $R = \\frac{(18.0)^2 \\sin(70.0^\\circ)}{9.80} = \\frac{324.0 \\times 0.9397}{9.80} = 31.07\\text{ m}$."
      ],
      answer: "t_{\\text{flight}} = 2.11\\text{ s}, \\quad H_{\\max} = 5.44\\text{ m}, \\quad R = 31.1\\text{ m}"
    },
    applications: [
      "Ballistic Artillery Fire Control Computers: Military guidance systems compute multi-variable projectile trajectories accounting for Coriolis deflection, air density gradients, and drag coefficients.",
      "Aerospace Rocket Staging: Stage separation trajectories in launch vehicles are engineered so jettisoned rocket boosters follow predictable ballistic ocean splashdown zones.",
      "Olympic Athletic Optimization: Biomechanists use high-speed optical kinematics to optimize athlete takeoff angles in shot put and long jump (~$37^\circ$ to $42^\circ$ accounting for launch height above ground)."
    ],
    misconceptions: [
      "Misconception: 'At the apex of its trajectory, a projectile's acceleration is zero.' Correction: Vertical velocity is momentarily zero ($v_y = 0$), but downward gravitational acceleration remains continuously $g = 9.80\\text{ m/s}^2$; if acceleration were zero, the object would continue floating forever.",
      "Misconception: 'Heavier bullets fall faster than lighter bullets fired from the same height.' Correction: As proven by Apollo 15's hammer and feather moon drop, in a vacuum all masses accelerate at identical rates ($a = g$)."
    ]
  },

  "PHYS-M16": {
    topic: "Wave Optics, Interference & Diffraction",
    theory: `Wave optics describes the propagation and interaction of electromagnetic waves where aperture dimensions are comparable to the wavelength of light ($\\lambda \\sim d$). In 1801, Thomas Young definitively proved the wave nature of light through his double-slit interference experiment. When a coherent monochromatic beam passes through two narrow sub-millimeter slits separated by distance $d$, each slit acts as a source of circular expanding Huygens wavelets. These wavelets overlap and interfere in the space between the slits and an observation screen located distance $L$ away.

Constructive interference (bright fringes) occurs where wave crests from both slits arrive in phase, requiring the optical path length difference to be an integer multiple of the wavelength: $\\Delta L = d \\sin\\theta = m\\lambda$, where $m \\in \\{0, \\pm 1, \\pm 2, \\dots\\}$. Destructive interference (dark nodes) occurs where waves arrive exactly half a cycle out of phase ($180^\\circ$ phase shift): $d \\sin\\theta = (m + \\frac{1}{2})\\lambda$. Under the small-angle approximation ($\\sin\\theta \\approx \\tan\\theta \\approx \\frac{y}{L}$), the linear separation between adjacent bright fringes on the screen is constant: $\\Delta y = \\frac{\\lambda L}{d}$. Because real slits possess finite width $a$, the two-slit interference pattern is modulated by a single-slit Fraunhofer diffraction envelope: $I(\\theta) = I_0 \\left(\\frac{\\sin\\beta}{\\beta}\\right)^2 \\cos^2\\alpha$, causing specific higher-order interference fringes to vanish as 'missing orders' where diffraction nodes coincide with interference peaks.`,
    mechanism: [
      "1. Huygens Wavelet Coherence: Monochromatic laser light exhibits temporal and spatial coherence. At the double-slit mask, two phase-locked secondary wavelets propagate outward into the observation arena.",
      "2. Geometric Path Difference: A point on a screen at angle $\\theta$ is separated by distance $L$. Rays from the two slits have a path difference $\\Delta L = d \\sin\\theta$.",
      "3. Intensity Distribution: Combining electric field vectors $\\vec{E}_1$ and $\\vec{E}_2$ with relative phase difference $\\delta = \\frac{2\\pi}{\\lambda} d \\sin\\theta$ produces a cosine-squared intensity modulation: $I = 4 I_{\\text{single}} \\cos^2(\\delta / 2)$."
    ],
    formula: "d \\sin\\theta = m \\lambda \\quad (\\text{Bright}), \\quad \\Delta y = \\frac{\\lambda L}{d}, \\quad a \\sin\\theta = n \\lambda \\quad (\\text{Diffraction Minima})",
    parameters: [
      { sym: "\\lambda", name: "Light Wavelength", unit: "\\text{nm } (10^{-9}\\text{ m})", desc: "Spatial period of the monochromatic electromagnetic wave" },
      { sym: "d", name: "Slit Separation", unit: "\\text{mm or } \\mu\\text{m}", desc: "Center-to-center distance between the two parallel slit apertures" },
      { sym: "L", name: "Screen Distance", unit: "\\text{meters (m)}", desc: "Distance along optical rail from slit mask to observation screen" },
      { sym: "y", name: "Fringe Position", unit: "\\text{mm or m}", desc: "Linear distance on screen from central zero-order maximum" },
      { sym: "m", name: "Interference Order", unit: "0, \\pm 1, \\pm 2, \\dots", desc: "Integer designating the specific constructive interference fringe" }
    ],
    workedExample: {
      problem: "A laboratory precision Thorlabs optical bench uses a Helium-Neon (He-Ne) gas laser emitting coherent red light at wavelength λ = 632.8 nm. The beam is incident upon a double slit with separation d = 0.250 mm. The resulting interference fringe pattern is projected onto an observation screen placed at L = 2.40 m. Calculate the linear spacing between adjacent bright fringes, and determine the linear distance from the central maximum to the third-order bright fringe (m = 3).",
      given: "\\lambda = 632.8\\text{ nm} = 6.328 \\times 10^{-7}\\text{ m}, \\quad d = 0.250\\text{ mm} = 2.50 \\times 10^{-4}\\text{ m}, \\quad L = 2.40\\text{ m}",
      steps: [
        "1. Apply the fringe spacing equation under the small-angle approximation: $\\Delta y = \\frac{\\lambda L}{d}$.",
        "2. Substitute experimental parameters: $\\Delta y = \\frac{(6.328 \\times 10^{-7}\\text{ m}) \\times (2.40\\text{ m})}{2.50 \\times 10^{-4}\\text{ m}}$.",
        "3. Compute product in numerator: $(6.328 \\times 10^{-7}) \\times 2.40 = 1.5187 \\times 10^{-6}\\text{ m}^2$.",
        "4. Divide by slit separation: $\\Delta y = \\frac{1.5187 \\times 10^{-6}}{2.50 \\times 10^{-4}} = 6.075 \\times 10^{-3}\\text{ m} = 6.08\\text{ mm}$.",
        "5. Calculate distance to third-order bright fringe ($m = 3$): $y_3 = m \\times \\Delta y = 3 \\times 6.075\\text{ mm} = 18.22\\text{ mm} = 1.82\\text{ cm}$."
      ],
      answer: "\\Delta y = 6.08\\text{ mm} \\quad (\\text{Fringe Spacing}), \\quad y_3 = 18.2\\text{ mm} \\quad (1.82\\text{ cm from center})"
    },
    applications: [
      "X-Ray Crystallography of Macromolecules: Rosalind Franklin and Watson & Crick used X-ray diffraction patterns through crystallized DNA to calculate its helical diameter ($2.0\\text{ nm}$) and pitch ($3.4\\text{ nm}$) via Bragg's Law ($2d\\sin\\theta = n\\lambda$).",
      "Antireflective Optical Coatings: Camera lenses and eyeglasses are coated with a dielectric thin film of magnesium fluoride ($\text{MgF}_2$) of thickness $t = \\lambda / (4n)$, causing reflections from top and bottom surfaces to destructively cancel.",
      "High-Resolution Spectroscopic Gratings: Diffraction gratings ruled with thousands of lines per millimeter ($N = 1200\\text{ lines/mm}$) disperse composite light into ultra-sharp resolved spectral lines for chemical composition analysis."
    ],
    misconceptions: [
      "Misconception: 'Diffraction and interference are fundamentally different physical phenomena.' Correction: Richard Feynman noted that no one has ever been able to define the difference satisfactorily; both arise from wave superposition, with interference describing superposition from discrete sources and diffraction describing superposition across continuous apertures.",
      "Misconception: 'Light travels only in perfectly straight rays.' Correction: Geometric ray optics is an approximation valid only when obstacles are much larger than wavelength; at micro-scales, light bends around edges and diffracts into shadows."
    ]
  },

  "PHYS-M20": {
    topic: "Electric Circuits, Ohm's Law & Kirchhoff's Network Rules",
    theory: `Electric circuits govern the transport of electrostatic potential energy through directed electron drift. Electric potential difference (voltage $V$) represents the work required per unit charge to move between two nodes ($V = W/q$). Current ($I = dq/dt$) is the rate of charge flow through a conductor cross-section, driven by electric field gradients. Electrical resistance ($R = \\rho \\frac{L}{A}$) quantifies microscopic opposition to current flow arising from collisions between conduction electrons and vibrating metal lattice ions.

For ohmic materials at constant temperature, Ohm's Law states that current is directly proportional to voltage: $V = IR$. Joule heating represents the irreversible dissipation of electrical energy into thermal heat: $P = VI = I^2 R = \\frac{V^2}{R}$. Complex multi-loop circuits are solved using Gustav Kirchhoff's two conservation laws: (1) Kirchhoff's Current Law (KCL, Junction Rule): Charge is conserved, so the algebraic sum of currents entering any circuit node must equal currents exiting ($\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$); (2) Kirchhoff's Voltage Law (KVL, Loop Rule): Energy is conserved, so the directed sum of potential differences around any closed circuit loop must be zero ($\\sum \\Delta V = 0$). In series networks, equivalent resistance sums directly ($R_{\\text{eq}} = \\sum R_i$) and current is uniform; in parallel networks, equivalent resistance follows reciprocal addition ($\\frac{1}{R_{\\text{eq}}} = \\sum \\frac{1}{R_i}$) and voltage drop is uniform.`,
    mechanism: [
      "1. Microscopic Electron Drift: Although individual valence electrons experience thermal speeds of $\\sim 10^6\\text{ m/s}$, applied electric fields produce a slow net drift velocity: $I = n q A v_d$, where drift velocity is surprisingly slow ($v_d \\approx 10^{-4}\\text{ m/s}$). Energy travels near the speed of light via electromagnetic Poynting flux outside the wire.",
      "2. Series Circuit Voltage Division: Identical current traverses each sequential element. Total voltage partitions proportionally to resistance: $V_i = I R_i$.",
      "3. Parallel Circuit Current Division: Multiple parallel paths provide alternative conduits for charge. Total resistance drops because conducting cross-sectional area increases: $I_{\\text{total}} = \\sum I_{\\text{branch}}$."
    ],
    formula: "V = IR, \\quad P = VI = I^2 R = \\frac{V^2}{R}, \\quad R_{\\text{series}} = \\sum R_i, \\quad \\frac{1}{R_{\\text{parallel}}} = \\sum \\frac{1}{R_i}",
    parameters: [
      { sym: "V", name: "Electric Potential Difference", unit: "\\text{Volts (V)}", desc: "Energy per unit electric charge ($1\\text{ V} = 1\\text{ J/C}$)" },
      { sym: "I", name: "Electric Current", unit: "\\text{Amperes (A)}", desc: "Rate of electric charge transport ($1\\text{ A} = 1\\text{ C/s}$)" },
      { sym: "R", name: "Resistance", unit: "\\text{Ohms (}\\Omega\\text{)}", desc: "Opposition to electric current flow ($1\\ \\Omega = 1\\text{ V/A}$)" },
      { sym: "P", name: "Electrical Power", unit: "\\text{Watts (W)}", desc: "Rate of electrical energy dissipation or conversion ($1\\text{ W} = 1\\text{ J/s}$)" }
    ],
    workedExample: {
      problem: "A laboratory DC power supply set to V = 12.0 V is connected across a combination circuit. Resistor R1 = 4.0 Ω is in series with a parallel combination of R2 = 6.0 Ω and R3 = 12.0 Ω. Calculate the equivalent resistance of the entire network, the total current supplied by the source, the voltage drop across R1, and the branch current flowing through R2.",
      given: "V = 12.0\\text{ V}, \\quad R_1 = 4.0\\ \\Omega, \\quad R_2 = 6.0\\ \\Omega, \\quad R_3 = 12.0\\ \\Omega",
      steps: [
        "1. Calculate the equivalent resistance of the parallel branch ($R_2$ and $R_3$): $\\frac{1}{R_p} = \\frac{1}{R_2} + \\frac{1}{R_3} = \\frac{1}{6.0} + \\frac{1}{12.0} = \\frac{2}{12.0} + \\frac{1}{12.0} = \\frac{3}{12.0} = \\frac{1}{4.0\\ \\Omega} \\implies R_p = 4.0\\ \\Omega$.",
        "2. Add series resistor $R_1$: $R_{\\text{eq}} = R_1 + R_p = 4.0\\ \\Omega + 4.0\\ \\Omega = 8.0\\ \\Omega$.",
        "3. Compute total circuit current: $I_{\\text{tot}} = \\frac{V}{R_{\\text{eq}}} = \\frac{12.0\\text{ V}}{8.0\\ \\Omega} = 1.50\\text{ A}$.",
        "4. Calculate voltage drop across $R_1$: $V_1 = I_{\\text{tot}} R_1 = (1.50\\text{ A})(4.0\\ \\Omega) = 6.0\\text{ V}$.",
        "5. Determine voltage across parallel branch: By Kirchhoff's loop rule, $V_p = V - V_1 = 12.0\\text{ V} - 6.0\\text{ V} = 6.0\\text{ V}$.",
        "6. Calculate branch current through $R_2$: $I_2 = \\frac{V_p}{R_2} = \\frac{6.0\\text{ V}}{6.0\\ \\Omega} = 1.00\\text{ A}$ (remaining $0.50\\text{ A}$ traverses $R_3$)."
      ],
      answer: "R_{\\text{eq}} = 8.0\\ \\Omega, \\quad I_{\\text{tot}} = 1.50\\text{ A}, \\quad V_1 = 6.0\\text{ V}, \\quad I_2 = 1.00\\text{ A}"
    },
    applications: [
      "Residential Ground Fault Circuit Interrupters (GFCI): Precision differential current transformers monitor phase vs neutral current; an imbalance exceeding $5\\text{ mA}$ (indicating current leaking through a human body) trips the circuit in $25\\text{ ms}$.",
      "Electric Vehicle Lithium Battery Packs: Thousands of cylindrical cells are arranged in series strings to achieve $400\\text{ V}$ or $800\\text{ V}$ for high motor power while parallel branches provide high amp-hour capacity.",
      "CMOS Microprocessor Power Dissipation: Modern CPUs containing 50 billion nanometer-scale transistors dissipate thermal heat according to $P = C V^2 f$, requiring sub-1-volt operating potentials to prevent thermal runaway."
    ],
    misconceptions: [
      "Misconception: 'Current is used up as it flows through a light bulb or resistor.' Correction: Electric charge is strictly conserved; the exact same number of coulombs of electrons exit the resistor as enter it; what is 'used up' is electric potential energy, transformed into thermal heat and light.",
      "Misconception: 'Electrons travel at the speed of light through wires when a switch is flipped.' Correction: Electrons drift at fractions of a millimeter per second; the electric field and electromagnetic Poynting wave propagate along the wire near the speed of light."
    ]
  },

  "PHYS-M22": {
    topic: "Quantum Physics, Photoelectric Effect & Photon Packets",
    theory: `The photoelectric effect—the instantaneous emission of electrons from a metallic surface illuminated by electromagnetic radiation—provided the decisive empirical proof that light behaves as quantized packets of energy rather than continuous classical waves. In classical electromagnetic wave theory, light intensity correlates with wave amplitude; wave theory predicted that even low-frequency light should eventually eject electrons if given sufficient time to deposit energy, and that higher intensity light should produce higher-kinetic-energy photoelectrons.

In 1905, Albert Einstein resolved this crisis by proposing that light consists of localized, indivisible energy quanta termed photons, each possessing energy proportional to frequency: $E = h\\nu = \\frac{hc}{\\lambda}$. In a photoelectric interaction, a single photon transfers 100% of its energy to a single conduction electron in a one-to-one collision. Part of this energy is consumed to overcome the electrostatic binding attraction holding the electron inside the metal lattice—defined as the work function ($\\Phi = h\\nu_0$). Any residual excess energy manifests as the maximum kinetic energy ($K_{\\max}$) of the liberated photoelectron: $K_{\\max} = h\\nu - \\Phi = \\frac{hc}{\\lambda} - \\Phi$. If the incident photon frequency is below the threshold cutoff frequency ($\\nu < \\nu_0$), zero photoelectrons are ejected, regardless of how intense or prolonged the illumination. By applying a reverse retarding potential (stopping potential $V_s$) between anode and photocathode, the fastest photoelectrons are turned around, allowing direct measurement of maximum kinetic energy: $e V_s = K_{\\max}$.`,
    mechanism: [
      "1. One-to-One Photon-Electron Collision: Conduction electrons within the metal's Fermi sea absorb incident photons individually. There is no cumulative energy storage over time.",
      "2. Work Function Energy Barrier: The minimum energy required to liberate an electron from the Fermi level to vacuum infinity is the work function $\\Phi$. Different metals exhibit characteristic work functions: Cesium ($\\Phi = 2.14\\text{ eV}$), Potassium ($\\Phi = 2.30\\text{ eV}$), Sodium ($\\Phi = 2.36\\text{ eV}$), Platinum ($\\Phi = 6.35\\text{ eV}$).",
      "3. Stopping Potential Metrology: Increasing light intensity increases the flux of photons per second, proportionally increasing photocurrent ($I_{\\text{photo}}$), but leaves stopping potential $V_s$ completely invariant. Plotting stopping potential versus frequency yields a straight line with slope equal to Planck's constant divided by electron charge ($h/e$)."
    ],
    formula: "K_{\\max} = h\\nu - \\Phi = e V_s, \\quad \\nu_0 = \\frac{\\Phi}{h}, \\quad \\lambda_{\\text{cutoff}} = \\frac{hc}{\\Phi}",
    parameters: [
      { sym: "h\\nu", name: "Incident Photon Energy", unit: "\\text{eV or J}", desc: "Quantum energy carried by the light packet ($1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$)" },
      { sym: "\\Phi", name: "Work Function", unit: "\\text{eV or J}", desc: "Minimum binding energy required to free an electron from the metal surface" },
      { sym: "K_{\\max}", name: "Maximum Kinetic Energy", unit: "\\text{eV or J}", desc: "Kinetic energy of the fastest photoelectrons ejected from the photocathode" },
      { sym: "V_s", name: "Stopping Potential", unit: "\\text{Volts (V)}", desc: "Reverse retarding voltage required to reduce photocurrent strictly to zero" },
      { sym: "\\nu_0", name: "Threshold Frequency", unit: "\\text{Hz (s}^{-1}\\text{)}", desc: "Minimum cutoff frequency below which no photoemission occurs" }
    ],
    workedExample: {
      problem: "Ultraviolet light of wavelength λ = 250.0 nm strikes a cesium photocathode in an evacuated phototube. The work function of cesium is Φ = 2.14 eV. Calculate the energy of the incident photons in electron-volts and Joules, determine the maximum kinetic energy of the ejected photoelectrons, and calculate the stopping potential Vs required to halt the photocurrent.",
      given: "\\lambda = 250.0\\text{ nm} = 2.50 \\times 10^{-7}\\text{ m}, \\quad \\Phi = 2.14\\text{ eV}, \\quad h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}, \\quad c = 3.00 \\times 10^8\\text{ m/s}, \\quad e = 1.602 \\times 10^{-19}\\text{ C}",
      steps: [
        "1. Calculate photon energy in Joules: $E_{\\text{photon}} = \\frac{hc}{\\lambda} = \\frac{(6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s})(3.00 \\times 10^8\\text{ m/s})}{2.50 \\times 10^{-7}\\text{ m}} = \\frac{1.988 \\times 10^{-25}}{2.50 \\times 10^{-7}} = 7.951 \\times 10^{-19}\\text{ J}$.",
        "2. Convert photon energy to electron-volts ($1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$): $E_{\\text{photon}} = \\frac{7.951 \\times 10^{-19}\\text{ J}}{1.602 \\times 10^{-19}\\text{ J/eV}} = 4.963\\text{ eV}$.",
        "3. Compute maximum kinetic energy: $K_{\\max} = E_{\\text{photon}} - \\Phi = 4.963\\text{ eV} - 2.140\\text{ eV} = 2.823\\text{ eV}$.",
        "4. Convert kinetic energy to Joules: $K_{\\max} = 2.823 \\times (1.602 \\times 10^{-19}\\text{ J}) = 4.523 \\times 10^{-19}\\text{ J}$.",
        "5. Determine stopping potential: Since $e V_s = K_{\\max}$, $V_s = \\frac{K_{\\max}}{e} = \\frac{2.823\\text{ eV}}{e} = 2.82\\text{ Volts}$."
      ],
      answer: "E_{\\text{photon}} = 4.96\\text{ eV} \\quad (7.95 \\times 10^{-19}\\text{ J}), \\quad K_{\\max} = 2.82\\text{ eV}, \\quad V_s = 2.82\\text{ V}"
    },
    applications: [
      "Photomultiplier Tubes (PMTs) in Scintillation Detectors: Single ionizing photons eject photoelectrons that cascade through dynodes at high voltage, amplifying signals $10^6$-fold for neutrino and astrophysics detectors.",
      "Solar Photovoltaic Cell Energy Harvesting: Semiconductor p-n junctions absorb sunlight photons with energy exceeding the silicon bandgap ($E_g = 1.12\\text{ eV}$), generating electron-hole pairs that drive clean electric current.",
      "Night Vision Image Intensifiers: Incoming infrared and ambient photons hit a photocathode, liberating photoelectrons that are accelerated onto a phosphor screen to produce high-contrast tactical night vision."
    ],
    misconceptions: [
      "Misconception: 'Increasing the brightness of red light will eventually eject electrons from metals like zinc.' Correction: Red light photons have energy below zinc's work function ($E < \\Phi$); even an astronomical laser brightness will not eject a single electron because energy is transferred one photon at a time.",
      "Misconception: 'Photoelectrons are emitted after a noticeable time delay while absorbing wave energy.' Correction: Photoemission is virtually instantaneous ($< 10^{-9}\\text{ s}$), proving the particulate collision nature of photons."
    ]
  },

  // === BIOLOGY DEEP RECORDS ===
  "BIO-M06": {
    topic: "Biochemistry of Water, Macromolecules & Enzyme Catalysis",
    theory: `All biological life is structurally and metabolically dependent on the unique biochemical properties of water ($\\text{H}_2\\text{O}$) and carbon-based macromolecules. Because oxygen is far more electronegative than hydrogen ($\\Delta\\chi = 1.4$), the water molecule forms an asymmetric polar bent geometry ($104.5^\\circ$) with a permanent dipole moment. In liquid water, each molecule forms up to four transient hydrogen bonds with neighboring molecules. This extensive hydrogen-bonding network gives water anomalous properties vital for life: high cohesion (producing surface tension allowing organisms to walk on water), high adhesion (driving capillary action in vascular plant xylem), high specific heat capacity ($4.184\\text{ J/(g}\\cdot^\\circ\\text{C)}$, moderating cellular and global temperatures), and high latent heat of vaporization (enabling evaporative cooling through sweating).

Carbon's tetravalent bonding capacity allows it to build four major classes of biological macromolecules: carbohydrates (monosaccharide polymers for energy storage and cellulose structure), lipids (nonpolar hydrocarbons forming hydrophobic membranes and concentrated energy stores), nucleic acids (nucleotide polymers encoding genetic information in DNA and RNA), and proteins (polypeptide chains of 20 distinct amino acids folding into complex primary, secondary, tertiary, and quaternary conformations). Enzymes are specialized protein biocatalysts that accelerate metabolic reactions by factors of $10^6$ to $10^{12}$ by lowering the Gibbs free energy activation barrier ($\\Delta G^\\ddagger$). Enzymes operate via induced-fit conformational changes at their active sites without shifting the chemical equilibrium constant ($K_{\\text{eq}}$).`,
    mechanism: [
      "1. Active Site Substrate Binding: The enzyme's catalytic active site possesses chemical geometry complementary to the transition state of the substrate. Substrate binding induces a conformational fit, forming an enzyme-substrate complex ($[ES]$).",
      "2. Catalytic Transition State Stabilization: Enzymes lower activation energy by orienting substrates in optimal reactive geometries, straining chemical bonds, donating or accepting protons through acid-base catalysis, or forming transient covalent enzyme-substrate intermediates.",
      "3. Michaelis-Menten Saturation Kinetics: At low substrate concentrations ($[S]$), reaction rate increases linearly. At high $[S]$, active sites become fully saturated, reaching maximum asymptotic velocity ($V_{\\max}$): $v = \\frac{V_{\\max} [S]}{K_m + [S]}$.",
      "4. Thermal & pH Denaturation: Excessive temperature or non-optimal pH disrupts secondary and tertiary hydrogen bonds and hydrophobic interactions, unfolding the polypeptide chain and permanently destroying active site catalytic activity."
    ],
    formula: "v = \\frac{V_{\\max} [S]}{K_m + [S]}, \\quad k = A e^{-\\frac{E_a}{RT}} \\quad (\\text{Arrhenius Rate Equation})",
    parameters: [
      { sym: "V_{\\max}", name: "Maximum Catalytic Velocity", unit: "\\text{mol/(L}\\cdot\\text{s)}", desc: "Asymptotic reaction velocity when 100% of enzyme active sites are substrate-saturated" },
      { sym: "K_m", name: "Michaelis Constant", unit: "\\text{mol/L (M)}", desc: "Substrate concentration at which reaction rate is exactly half of $V_{\\max}$; inverse measure of enzyme affinity" },
      { sym: "E_a", name: "Activation Energy Barrier", unit: "\\text{kJ/mol}", desc: "Minimum kinetic energy required for reactant collisions to reach the transition state" },
      { sym: "[S]", name: "Substrate Concentration", unit: "\\text{mol/L (M)}", desc: "Concentration of reactant molecules available to bind active sites" }
    ],
    workedExample: {
      problem: "An uncatalyzed biochemical hydration reaction has an activation energy of Ea = 84.0 kJ/mol. In the presence of the enzyme carbonic anhydrase, the activation energy drops to Ea = 38.0 kJ/mol. Using the Arrhenius equation at physiological body temperature (T = 310 K, 37°C), calculate the factor by which carbonic anhydrase accelerates the reaction rate.",
      given: "E_{a1} = 84.0\\text{ kJ/mol} = 8.40 \\times 10^4\\text{ J/mol}, \\quad E_{a2} = 38.0\\text{ kJ/mol} = 3.80 \\times 10^4\\text{ J/mol}, \\quad T = 310\\text{ K}, \\quad R = 8.314\\text{ J/(mol}\\cdot\\text{K)}",
      steps: [
        "1. Formulate the Arrhenius rate ratio: $\\frac{k_{\\text{catalyzed}}}{k_{\\text{uncatalyzed}}} = \\frac{A e^{-E_{a2}/RT}}{A e^{-E_{a1}/RT}} = e^{\\frac{E_{a1} - E_{a2}}{RT}}$.",
        "2. Compute the activation energy reduction: $\\Delta E_a = E_{a1} - E_{a2} = 84,000 - 38,000 = 46,000\\text{ J/mol}$.",
        "3. Calculate the thermal denominator: $RT = (8.314\\text{ J/(mol}\\cdot\\text{K)}) \\times (310\\text{ K}) = 2,577.3\\text{ J/mol}$.",
        "4. Calculate the exponent: $\\frac{\\Delta E_a}{RT} = \\frac{46,000}{2,577.3} \\approx 17.848$.",
        "5. Evaluate exponential rate enhancement: $\\text{Factor} = e^{17.848} \\approx 5.64 \\times 10^7$."
      ],
      answer: "\\text{Rate Enhancement Factor} = 5.64 \\times 10^7 \\quad (\\sim 56\\text{ million times faster})"
    },
    applications: [
      "Pharmaceutical Kinase Inhibitor Design: Modern targeted cancer therapies (such as Imatinib/Gleevec) competitively bind ATP active sites on oncogenic BCR-ABL tyrosine kinases, halting leukemia cell division.",
      "Industrial Bioethanol Fermentation: Genetically engineered fungal cellulases break down lignocellulosic agricultural crop stalks into fermentable glucose for carbon-neutral biofuel production.",
      "Taq Polymerase in PCR Diagnostics: Thermostable DNA polymerase isolated from volcanic hot spring bacterium *Thermus aquaticus* withstands $95^\circ\\text{C}$ DNA denaturation cycles in automated COVID-19 PCR testing."
    ],
    misconceptions: [
      "Misconception: 'Enzymes supply energy to make endergonic reactions happen.' Correction: Enzymes do not add energy or alter Gibbs free energy ($\\Delta G$); they merely lower the activation energy barrier ($\\Delta G^\\ddagger$), allowing ambient thermal collisions to reach the transition state faster.",
      "Misconception: 'Boiling water destroys the covalent bonds of H2O.' Correction: Boiling water breaks intermolecular hydrogen bonds between molecules, liberating water vapor; the covalent $O-H$ bonds within each molecule remain completely intact."
    ]
  },

  "BIO-M07": {
    topic: "Cellular Architecture, Plasma Membrane & Transport Dynamics",
    theory: `The living cell is an open thermodynamic system maintaining internal homeostasis through a selectively permeable boundary: the plasma membrane. The contemporary fluid mosaic model describes the membrane as a dynamic two-dimensional liquid bilayer of amphipathic phospholipids. Hydrophilic phosphate head groups orient outward toward the aqueous cytosolic and extracellular environments, while hydrophobic fatty acid tails sequester inward, forming an impermeable dielectric core barrier to polar solutes and ions. Membrane fluidity is buffered by intercalated cholesterol molecules, which prevent crystallization at low temperatures and restrict excessive fluidity at high temperatures.

Transport across the membrane occurs via passive and active mechanisms. Passive transport requires no metabolic ATP input, proceeding down electrochemical gradients: simple diffusion (small nonpolar molecules such as $O_2$ and $CO_2$), facilitated diffusion (polar molecules like glucose moving through specific GLUT uniporter channels or aquaporins), and osmosis (net water flux from high water potential to low water potential). Active transport drives solutes against their concentration gradients, requiring cellular energy: primary active transport directly couples ATP hydrolysis to conformational ion pumping (such as the ubiquitous $Na^+/K^+$ ATPase pump exporting $3 Na^+$ and importing $2 K^+$ per ATP), creating an electrogenic resting membrane potential ($-70\\text{ mV}$) that powers secondary cotransport and neurological action potentials.`,
    mechanism: [
      "1. Osmotic Water Potential ($\\Psi$): Total water potential is the sum of solute potential ($\\Psi_s$) and pressure potential ($\\Psi_p$): $\\Psi = \\Psi_s + \\Psi_p$. Adding solutes lowers solute potential: $\\Psi_s = -iCRT$. Water always diffuses from regions of higher $\\Psi$ (less negative) to lower $\\Psi$ (more negative).",
      "2. Tonicity Dynamics in Erythrocytes: In an isotonic solution ($0.9\\%\\ \\text{NaCl}$), water influx matches efflux, preserving biconcave disc geometry. In a hypertonic solution ($>0.9\\%\\ \\text{NaCl}$), rapid water efflux causes cellular dehydration, crenation, and echinocyte spike formation. In a hypotonic solution ($<0.9\\%\\ \\text{NaCl}$), rapid water influx swells the cell into a spherical spherocyte, exceeding membrane tensile limits and causing hemolytic rupture.",
      "3. Primary Active Transport Cycle: Intracellular $Na^+$ binds with high affinity to the $Na^+/K^+$ ATPase pump. ATP transfers a phosphate group (phosphorylation), triggering an $E_1 \\rightarrow E_2$ conformational shift that expels $3 Na^+$ extracellularly. Extracellular $K^+$ binds, triggering dephosphorylation and returning the pump to $E_1$, releasing $2 K^+$ inside the cell."
    ],
    formula: "\\Psi = \\Psi_s + \\Psi_p, \\quad \\Psi_s = -i C R T, \\quad J = -D \\frac{dC}{dx} \\quad (\\text{Fick's First Law})",
    parameters: [
      { sym: "\\Psi", name: "Total Water Potential", unit: "\\text{MPa or bars}", desc: "Potential energy of water per unit volume relative to pure free water at standard conditions" },
      { sym: "\\Psi_s", name: "Solute Potential", unit: "\\text{MPa or bars}", desc: "Negative potential caused by dissolved solute particles lowering water activity" },
      { sym: "\\Psi_p", name: "Pressure Potential", unit: "\\text{MPa or bars}", desc: "Physical hydrostatic turgor pressure exerted by cell wall or fluid chamber" },
      { sym: "i", name: "Van 't Hoff Factor", unit: "\\text{dimensionless}", desc: "Number of discrete ions or particles formed when solute dissolves ($i = 1$ for sucrose, $i = 2$ for NaCl)" },
      { sym: "C", name: "Molar Concentration", unit: "\\text{mol/L (M)}", desc: "Molarity of dissolved solute in the biological solution" }
    ],
    workedExample: {
      problem: "A laboratory plant tissue core (with zero initial turgor pressure, Ψp = 0) is immersed in an open beaker containing a 0.350 M sucrose solution at 22.0°C (295.15 K). Calculate the solute potential Ψs of the sucrose solution in megapascals (MPa). If the plant cell's initial internal solute potential is Ψs = -1.25 MPa, predict whether water will flow into or out of the plant cells, and calculate the equilibrium turgor pressure Ψp assuming zero cell volume expansion.",
      given: "C = 0.350\\text{ M}, \\quad i = 1\\text{ (sucrose)}, \\quad T = 295.15\\text{ K}, \\quad R = 0.008314\\text{ L}\\cdot\\text{MPa/(mol}\\cdot\\text{K)}, \\quad \\Psi_{s,\\text{cell}} = -1.25\\text{ MPa}",
      steps: [
        "1. Calculate solute potential of solution: $\\Psi_{s,\\text{sol}} = -i C R T = -(1)(0.350\\text{ mol/L})(0.008314\\text{ L}\\cdot\\text{MPa/(mol}\\cdot\\text{K)})(295.15\\text{ K})$.",
        "2. Compute numeric value: $\\Psi_{s,\\text{sol}} = -(0.350) \\times (2.4539) = -0.859\\text{ MPa}$.",
        "3. Determine beaker water potential: Since the beaker is open to atmosphere, $\\Psi_{p,\\text{sol}} = 0 \\implies \\Psi_{\\text{sol}} = -0.859\\text{ MPa}$.",
        "4. Compare initial cell and solution potentials: $\\Psi_{\\text{cell}} = -1.25\\text{ MPa} + 0 = -1.25\\text{ MPa}$. Since $\\Psi_{\\text{sol}} (-0.859\\text{ MPa}) > \\Psi_{\\text{cell}} (-1.25\\text{ MPa})$, water will spontaneously flow down its potential gradient INTO the plant cells.",
        "5. Calculate equilibrium turgor pressure: At equilibrium, $\\Psi_{\\text{cell}} = \\Psi_{\\text{sol}} = -0.859\\text{ MPa}$. Thus: $\\Psi_{s,\\text{cell}} + \\Psi_p = -0.859 \\implies -1.25\\text{ MPa} + \\Psi_p = -0.859 \\implies \\Psi_p = -0.859 + 1.25 = +0.391\\text{ MPa}$."
      ],
      answer: "\\Psi_{s,\\text{sol}} = -0.859\\text{ MPa}; \\quad \\text{Water flows INTO cell}; \\quad \\text{Equilibrium Turgor } \\Psi_p = +0.391\\text{ MPa}"
    },
    applications: [
      "Clinical Hemodialysis in Renal Failure: Artificial kidney dialyzers pass patient blood across semi-permeable polysulfone hollow-fiber membranes counter-current to dialysate fluid to filter urea and potassium while preserving red blood cells.",
      "Liposomal Targeted Chemotherapy Drug Delivery: Synthetic phospholipid vesicles encapsulate toxic cytotoxic drugs (like Doxorubicin), preventing systemic toxicity until targeted cell surface antibodies trigger endocytosis into tumors.",
      "Reverse Osmosis Municipal Desalination: Giant high-pressure pumps force seawater against polyamide membranes at pressures exceeding osmotic pressure ($P > 6.0\\text{ MPa}$), generating millions of gallons of fresh drinking water."
    ],
    misconceptions: [
      "Misconception: 'Facilitated diffusion requires cellular ATP energy because it uses membrane transport proteins.' Correction: Facilitated diffusion is entirely passive; transport proteins provide hydrophilic conduits for solutes to move down their natural electrochemical gradient without metabolic energy.",
      "Misconception: 'Water stops moving across the membrane once osmotic equilibrium is reached.' Correction: Osmotic equilibrium is dynamic; water molecules continuously cross in both directions at equal, balanced rates (net flux = 0)."
    ]
  },

  "BIO-M08": {
    topic: "Cellular Energetics: Photosynthesis & Respiration",
    theory: `Bioenergetics is the quantitative study of energy flow through living metabolic networks. All biological energy transformations obey the First and Second Laws of Thermodynamics: energy is conserved, and every metabolic transfer irreversibly increases the entropy of the universe. Cellular metabolic pathways fall into two coupled thermodynamic categories: catabolic pathways (exergonic, breaking complex molecules to release energy, $-\\Delta G$) and anabolic pathways (endergonic, consuming energy to build complex structures, $+\\Delta G$). The universal chemical energy currency coupling these processes is Adenosine Triphosphate (ATP). Hydrolysis of ATP's terminal phosphoanhydride bond releases $-30.5\\text{ kJ/mol}$ of free energy under standard conditions (and up to $-50\\text{ kJ/mol}$ under cellular cytosolic conditions): $\\text{ATP} + \\text{H}_2\\text{O} \\rightarrow \\text{ADP} + P_i$.

Photosynthesis and cellular respiration form an interdependent biospheric cycle of matter and energy. Photosynthesis in plant chloroplasts traps radiant solar photons to oxidize water and reduce carbon dioxide into high-energy carbohydrates: $6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$. Cellular respiration in mitochondria subsequently oxidizes these carbohydrates, transferring electrons through an electron transport chain to terminal oxygen acceptors to synthesize 30 to 32 ATP per glucose: $\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\sim 32\\text{ ATP}$. In both organelles, the fundamental mechanism of ATP generation is Peter Mitchell's Nobel-winning chemiosmosis: electron transport complexes pump protons ($H^+$) across an impermeable membrane, creating an electrochemical proton-motive force (PMF) that drives the rotary catalytic motor of ATP Synthase.`,
    mechanism: [
      "1. Chloroplast Light-Dependent Reactions: Photons strike chlorophyll $P_{680}$ in Photosystem II, exciting electrons that split water ($2\\text{H}_2\\text{O} \\rightarrow 4\\text{H}^+ + 4e^- + \\text{O}_2$). Electrons traverse an electron transport chain to Photosystem I ($P_{700}$), pumping protons into the thylakoid lumen and reducing $\\text{NADP}^+$ to $\\text{NADPH}$.",
      "2. Calvin-Benson Carbon Fixation Cycle: In the chloroplast stroma, enzyme RuBisCO fixes atmospheric $\\text{CO}_2$ onto ribulose-1,5-bisphosphate (RuBP), consuming ATP and NADPH to synthesize glyceraldehyde-3-phosphate (G3P) triose precursors for glucose.",
      "3. Four Stages of Aerobic Cellular Respiration: (1) Cytosolic Glycolysis splits glucose into 2 pyruvate, generating $2\\text{ ATP}$ and $2\\text{ NADH}$; (2) Pyruvate dehydrogenase converts pyruvate into Acetyl-CoA, releasing $\\text{CO}_2$ and $\\text{NADH}$; (3) Mitochondrial Matrix Krebs Citric Acid Cycle oxidizes acetyl groups to yield $6\\text{ NADH}$, $2\\text{ FADH}_2$, $2\\text{ ATP}$, and $4\\text{ CO}_2$; (4) Inner Mitochondrial Membrane Oxidative Phosphorylation: Complexes I, III, and IV pump protons into the intermembrane space, and ATP Synthase utilizes the returning proton flux to phosphorylate ADP."
    ],
    formula: "\\Delta G = \\Delta H - T \\Delta S, \\quad \\text{PMF} = \\Delta\\psi - \\frac{2.303 R T}{F} \\Delta\\text{pH}, \\quad \\text{Glucose Oxidation } \\Delta G^\\circ = -2,870\\text{ kJ/mol}",
    parameters: [
      { sym: "\\Delta G^\\circ", name: "Standard Gibbs Free Energy", unit: "\\text{kJ/mol}", desc: "Net thermodynamic energy change under standard state; negative indicates spontaneous exergonic pathway" },
      { sym: "\\text{PMF}", name: "Proton-Motive Force", unit: "\\text{millivolts (mV)}", desc: "Electrochemical potential gradient ($H^+$ concentration $\\Delta\\text{pH}$ and electrical potential $\\Delta\\psi$) driving ATP synthase" },
      { sym: "\\text{ATP}", name: "Adenosine Triphosphate", unit: "\\text{moles}", desc: "Primary cellular energy currency possessing two high-energy phosphoanhydride bonds" },
      { sym: "\\text{RuBisCO}", name: "Ribulose-1,5-bisphosphate carboxylase-oxygenase", unit: "\\text{enzyme}", desc: "Most abundant primary enzyme on Earth responsible for biological carbon fixation" }
    ],
    workedExample: {
      problem: "Complete aerobic cellular oxidation of 1.00 mole of glucose releases ΔG° = -2,870 kJ/mol of free energy under standard biochemical conditions. The human cell captures this catabolic energy to synthesize approximately 32.0 moles of ATP from ADP and Pi. The standard free energy of ATP synthesis is ΔG° = +30.5 kJ/mol. Calculate the total useful chemical energy stored in the synthesized ATP, and determine the thermodynamic efficiency of the mitochondrial respiratory engine.",
      given: "\\Delta G_{\\text{glucose}} = -2,870\\text{ kJ/mol}, \\quad n_{\\text{ATP}} = 32.0\\text{ mol}, \\quad \\Delta G_{\\text{ATP synthesis}} = +30.5\\text{ kJ/mol}",
      steps: [
        "1. Calculate the total energy stored in the synthesized ATP: $E_{\\text{stored}} = n_{\\text{ATP}} \\times \\Delta G_{\\text{ATP}} = 32.0\\text{ mol} \\times 30.5\\text{ kJ/mol} = 976.0\\text{ kJ}$.",
        "2. Formulate thermodynamic efficiency equation: $\\text{Efficiency } \\eta = \\frac{|E_{\\text{stored}}|}{|E_{\\text{input}}|} \\times 100\\%$.",
        "3. Substitute values: $\\eta = \\frac{976.0\\text{ kJ}}{2,870\\text{ kJ}} \\times 100\\% = 0.34007 \\times 100\\% \\approx 34.0\\%$.",
        "4. Thermodynamic analysis: The remaining $\\sim 66.0\\%$ ($1,894\\text{ kJ/mol}$) of energy is dissipated as thermal heat, which is vital for endothermic mammals to maintain a constant $37.0^\\circ\\text{C}$ body temperature."
      ],
      answer: "E_{\\text{stored}} = 976\\text{ kJ}, \\quad \\text{Thermodynamic Efficiency } \\eta = 34.0\\% \\quad (66\\% \\text{ dissipated as homeothermic body heat})"
    },
    applications: [
      "Algal Photobioreactors for Biofuels: Geneticists optimize microalgae light-harvesting antenna complexes to channel photons directly into triglyceride lipid synthesis, yielding carbon-neutral aviation fuels.",
      "Mitochondrial Medicine & Uncoupling Therapeutics: Controlled mitochondrial chemical uncouplers (such as BAM15 or low-dose DNP) dissipate proton gradients as heat without generating ATP, under investigation for treating non-alcoholic fatty liver disease (NAFLD) and obesity.",
      "Pulse Oximetry in Clinical Diagnostics: Medical pulse oximeters measure light absorption ratios between oxygenated hemoglobin ($940\\text{ nm}$) and deoxygenated hemoglobin ($660\\text{ nm}$) to monitor oxygen delivery to mitochondrial electron transport chains."
    ],
    misconceptions: [
      "Misconception: 'Plants perform photosynthesis, while animals perform cellular respiration.' Correction: Plants perform BOTH photosynthesis AND cellular respiration; plants generate glucose via photosynthesis during daylight, and their mitochondria continuously oxidize glucose via cellular respiration 24 hours a day to power growth and maintenance.",
      "Misconception: 'The oxygen gas (O2) produced in photosynthesis comes from carbon dioxide (CO2).' Correction: Isotopic water labeling ($H_2^{18}O$) proved that 100% of photosynthetic $O_2$ originates from the photolytic splitting of water in Photosystem II."
    ]
  },

  "BIO-M10": {
    topic: "Classical Mendelian Genetics, Allelic Interaction & Pedigrees",
    theory: `Classical genetics establishes the statistical and physical mechanisms by which biological traits are inherited across generations. In 1865, Gregor Mendel overturned the prevailing 'blending inheritance' hypothesis by proving that hereditary traits are transmitted as discrete, particulate units (now termed genes) occupying specific chromosomal loci. Diploid organisms possess two copies (alleles) of each gene, inherited from maternal and paternal gametes. Mendel established two universal laws of inheritance: (1) The Law of Segregation: During gametogenesis (specifically anaphase I of meiosis), the two alleles for each gene segregate so that each haploid gamete carries only one allele; (2) The Law of Independent Assortment: Alleles of genes located on non-homologous chromosomes assort independently during metaphase I, generating novel recombinant genotypes.

An organism's genetic composition is its genotype (homozygous dominant $AA$, heterozygous $Aa$, or homozygous recessive $aa$), whereas its observable physical, physiological, or biochemical manifestation is its phenotype. While simple monohybrid crosses yield classic $3:1$ phenotypic ratios and dihybrid crosses yield $9:3:3:1$ ratios, non-Mendelian extensions describe complex genetic interactions: incomplete dominance (heterozygote displays an intermediate blended phenotype, such as pink snapdragons $C^R C^W$), codominance (both alleles are simultaneously and distinctly expressed, such as ABO blood type $I^A I^B$ and sickle-cell hemoglobin $\\text{Hb}^A \\text{Hb}^S$), multiple allelism, sex-linked inheritance on the non-homologous X-chromosome (causing higher incidence of hemophilia and red-green color blindness in hemizygous $X^a Y$ males), and polygenic inheritance where multiple genes contribute additively to continuous traits (such as human height and skin pigmentation).`,
    mechanism: [
      "1. Meiotic Segregation Basis: Homologous chromosomes align along the metaphase plate in Meiosis I. Physical separation of homologous centromeres during anaphase I ensures each daughter gamete receives exactly one allele.",
      "2. Punnett Square Matrix Analysis: Gamete genotypes are arrayed along horizontal and vertical axes; cell products predict the statistical probability of offspring genotypes and phenotypes via the fundamental product rule ($P(A \\cap B) = P(A) \\times P(B)$) and sum rule ($P(A \\cup B) = P(A) + P(B)$).",
      "3. Pedigree Linkage & Inheritance Modes: Clinical geneticists track traits across family trees: Autosomal dominant (appears in every generation, unaffected parents cannot pass trait); Autosomal recessive (skips generations, unaffected heterozygous carriers produce $25\\%$ affected offspring); X-linked recessive (primarily affects males, passed from carrier mothers to sons)."
    ],
    formula: "\\text{Monohybrid: } 1 AA : 2 Aa : 1 aa \\ (3:1 \\text{ Phenotype}), \\quad \\text{Dihybrid: } 9:3:3:1, \\quad P(A \\text{ and } B) = P(A) \\times P(B)",
    parameters: [
      { sym: "A, a", name: "Dominant & Recessive Alleles", unit: "\\text{genetic variants}", desc: "Alternative nucleotide sequence forms of a gene at a specific chromosomal locus" },
      { sym: "P", name: "Statistical Probability", unit: "0.00 \\text{ to } 1.00", desc: "Mathematical likelihood of an offspring inheriting a specific genotype" },
      { sym: "I^A, I^B, i", name: "ABO Blood Alleles", unit: "\\text{codominant alleles}", desc: "Gene encoding glycosyltransferase enzymes adding specific antigen sugars to red blood cells" },
      { sym: "X^H, X^h", name: "X-Linked Hemophilia Alleles", unit: "\\text{sex-linked locus}", desc: "Coagulation Factor VIII clotting gene located on the human X chromosome" }
    ],
    workedExample: {
      problem: "In humans, brown eye color (B) is dominant to blue eye color (b), and right-handedness (R) is dominant to left-handedness (r). Both genes reside on separate non-homologous autosomes. A heterozygous brown-eyed, right-handed man (BbRr) marries a blue-eyed, heterozygous right-handed woman (bbRr). Using the product and sum probability rules, calculate: (1) The probability their first child will be blue-eyed and left-handed; (2) The probability their child will be brown-eyed and right-handed.",
      given: "\\text{Father: } BbRr, \\quad \\text{Mother: } bbRr, \\quad \\text{Unlinked independent autosomal genes}",
      steps: [
        "1. Analyze eye color cross ($Bb \\times bb$): The possible offspring are $1/2\\ Bb$ (brown-eyed) and $1/2\\ bb$ (blue-eyed). Probability $P(\\text{blue}) = 1/2$, $P(\\text{brown}) = 1/2$.",
        "2. Analyze handedness cross ($Rr \\times Rr$): Monohybrid cross yields $1/4\\ RR$ (right), $2/4 = 1/2\\ Rr$ (right), $1/4\\ rr$ (left). Probability $P(\\text{right}) = 3/4$, $P(\\text{left}) = 1/4$.",
        "3. Compute Probability 1 (Blue-eyed and Left-handed): Because the genes assort independently, apply the multiplication rule: $P(\\text{blue } \\cap \\text{ left}) = P(\\text{blue}) \\times P(\\text{left}) = \\left(\\frac{1}{2}\\right) \\times \\left(\\frac{1}{4}\\right) = \\frac{1}{8} = 0.125\\ (12.5\\%)$.",
        "4. Compute Probability 2 (Brown-eyed and Right-handed): Apply the multiplication rule: $P(\\text{brown } \\cap \\text{ right}) = P(\\text{brown}) \\times P(\\text{right}) = \\left(\\frac{1}{2}\\right) \\times \\left(\\frac{3}{4}\\right) = \\frac{3}{8} = 0.375\\ (37.5\\%)$."
      ],
      answer: "P(\\text{Blue, Left}) = \\frac{1}{8} \\ (12.5\\%), \\quad P(\\text{Brown, Right}) = \\frac{3}{8} \\ (37.5\\%)"
    },
    applications: [
      "Clinical Genetic Counseling for Cystic Fibrosis: Prospective parents undergo carrier screening via DNA PCR multiplex sequencing for the CFTR $\\Delta F508$ autosomal recessive deletion to quantify embryo disease probabilities ($25\\%$ if both carry).",
      "Agricultural Hybrid Seed Corn Breeding: Agribusiness seed producers cross pure-breeding inbred parental lines to exploit heterosis (hybrid vigor), boosting crop yields by $30\\%$ through overdominant heterozygosity.",
      "Forensic DNA Short Tandem Repeat (STR) Profiling: The FBI CODIS system analyzes 20 unlinked tetranucleotide STR loci; multiplying independent allele frequencies yields random match probabilities under $1$ in $10^{15}$."
    ],
    misconceptions: [
      "Misconception: 'Dominant traits are always more common in a population than recessive traits.' Correction: Dominance describes biochemical masking in a heterozygote, not population allele frequency; Huntington's disease is dominant but rare (1 in 10,000), while type O blood is recessive but possesses high frequency in many populations.",
      "Misconception: 'If a carrier couple has one child with a recessive disease, their next three children are guaranteed to be healthy.' Correction: Probability has no memory; each independent fertilization has the exact same unalterable $25\\%$ chance of producing an affected child."
    ]
  }
};

/**
 * Universal Scientific Theory Synthesis Engine
 * Generates college-level, curriculum-grounded theoretical analysis for ANY lesson across the 74 modules
 */
export function getLessonComprehensiveTheory(subjectCode, moduleId, lessonId, lessonTitle, moduleData) {
  let code = "CHEM";
  let mId = 1;
  let lId = 1;
  let mData = moduleData;

  if (typeof subjectCode === "object" && subjectCode !== null) {
    mData = subjectCode;
    code = (mData.code || "").split("-")[0] || "CHEM";
    mId = mData.id || parseInt((mData.code || "").split("-")[1]?.replace(/\D/g, ""), 10) || 1;
    lId = parseInt(moduleId, 10) || (mData.lessons && mData.lessons[0] ? mData.lessons[0].id : 1);
  } else {
    code = (subjectCode || "CHEM").toUpperCase();
    if (code.includes("-")) {
      const parts = code.split("-");
      code = parts[0];
      if (parts[1]) {
        mId = parseInt(parts[1].replace(/\D/g, ""), 10);
      }
      if (lessonId === undefined && moduleId !== undefined) {
        lId = parseInt(moduleId, 10) || 1;
      } else if (lessonId !== undefined) {
        lId = parseInt(lessonId, 10) || 1;
      }
    } else {
      mId = parseInt(moduleId, 10) || 1;
      lId = parseInt(lessonId, 10) || 1;
    }
  }

  const padM = mId < 10 ? '0' + mId : '' + mId;
  const modKey = `${code}-M${padM}`;

  // Check if dedicated detailed theory record exists
  if (MODULE_THEORY_RECORDS[modKey]) {
    const record = MODULE_THEORY_RECORDS[modKey];
    return {
      title: lessonTitle || (mData && mData.lessons && mData.lessons.find(l => l.id === lId)?.title) || `Lesson ${lId}`,
      topic: record.topic,
      coreTheory: record.theory,
      mechanism: record.mechanism,
      formula: record.formula,
      parameters: record.parameters,
      workedExample: {
        ...record.workedExample,
        status: record.workedExample.status || "Curriculum Standard Reference Solution (Under Specialist Review)",
        isVerified: !!record.workedExample.isVerified
      },
      applications: record.applications,
      misconceptions: record.misconceptions,
      isVerified: !!record.isVerified
    };
  }

  // Synthesize rigorous, authentic curriculum-grounded theory from module metadata
  const mTitle = mData ? mData.title : `Module ${mId}`;
  const mPhenom = mData ? mData.phenomenon : "Scientific inquiry into physical phenomena";
  const mBigIdea = mData ? mData.bigIdea : "Governed by fundamental conservation principles.";
  const formulas = mData && mData.formulas && mData.formulas.length > 0 ? mData.formulas[0] : "\\text{Mathematical Model } y = f(x)";

  // Generate authentic, topic-grounded quantitative example
  const workedExample = generateCurriculumWorkedExample(code, mTitle, mPhenom, formulas, mData);

  return {
    title: lessonTitle || (mData && mData.lessons && mData.lessons.find(l => l.id === lId)?.title) || `Lesson ${lId}`,
    topic: `${mTitle} • Scientific Principles`,
    coreTheory: `This lesson investigates the foundational principles of ${mTitle}. Scientific understanding is built on the empirical observation that "${mPhenom}". ${mBigIdea} At the macroscopic scale, observable variables correlate according to reproducible physical laws. At the fundamental microscopic and particulate scale, matter, energy, and biological systems obey invariant conservation and thermodynamic constraints.

Rigorous scientific analysis requires separating dependent variables from independent parameters, formulating predictive mathematical models, and gathering quantitative evidence to support evidence-based scientific claims. Through this interactive laboratory workbench, students manipulate operational parameters, observe real-time dynamic response, and quantify the governing mathematical relationships.`,
    mechanism: [
      `1. Phenomenological Driving Force: In ${mTitle}, macroscopic behavior is driven by energetic gradients and molecular/field interactions described by "${mPhenom}".`,
      `2. Microscopic & Quantitative Behavior: Particles, charges, or cellular structures undergo discrete interactions obeying conservation of mass, energy, and momentum.`,
      `3. Systemic Equilibrium: As parameters are adjusted, the system reaches a dynamic steady state or equilibrium governed by thermodynamic and kinetic constraints.`
    ],
    formula: formulas,
    parameters: workedExample.parameters || [
      { sym: "X", name: "Independent Variable", unit: "\\text{SI Units}", desc: "Operational parameter controlled during the empirical investigation" },
      { sym: "Y", name: "Dependent Response", unit: "\\text{SI Units}", desc: "Measured output quantity governed by physical laws" },
      { sym: "k", name: "Proportionality Constant", unit: "\\text{Calculated}", desc: "Empirical rate, modulus, or coefficient characteristic of the medium" }
    ],
    workedExample: {
      problem: workedExample.problem,
      given: workedExample.given,
      steps: workedExample.steps,
      answer: workedExample.answer,
      status: "Curriculum Standard Reference Solution (Under Specialist Review)",
      isVerified: false
    },
    applications: [
      `Advanced STEM Engineering: Principles of ${mTitle} are applied in modern industrial design, nanotechnology, and precision metrology.`,
      "Environmental & Medical Diagnostics: Quantitative sensors monitor real-time chemical, biological, and physical parameters to protect public health.",
      "High-Performance Computing & Simulation: Numerical models simulate complex interactions to predict system behavior before physical fabrication."
    ],
    misconceptions: [
      `Misconception: 'Scientific models are exact physical replicas of reality.' Correction: Scientific models are idealized approximations designed to predict behavior within specified experimental boundary conditions.`,
      `Misconception: 'Changes occur instantaneously without energy transfer.' Correction: Every physical, chemical, or biological transition requires finite activation time and obeys the conservation of energy.`
    ],
    isVerified: false
  };
}

function generateCurriculumWorkedExample(code, title, phenom, formula, mData) {
  const t = (title || "").toLowerCase();
  const f = (formula || "").toLowerCase();
  const mId = mData && (mData.id || (mData.code && parseInt((mData.code.split("-M")[1] || "").replace(/\D/g, ""), 10))) || 0;

  if (code === "CHEM") {
    if (mId === 6 || t.includes("ionic") || t.includes("metal")) {
      return {
        problem: `Using Coulomb's Law of Electrostatic Attraction $F = k_e \\frac{|q_1 q_2|}{r^2}$, compare the relative lattice attraction strength between Magnesium Oxide ($\\text{MgO}: q_1 = +2, q_2 = -2$) and Sodium Chloride ($\\text{NaCl}: q_1 = +1, q_2 = -1$). Assuming inter-ionic separation $r$ in $\\text{MgO}$ is approximately $212\\text{ pm}$ versus $282\\text{ pm}$ in $\\text{NaCl}$, calculate the lattice energy ratio $\\frac{U_{\\text{MgO}}}{U_{\\text{NaCl}}}$.`,
        given: "q_1 q_2(\\text{MgO}) = 4, \\quad q_1 q_2(\\text{NaCl}) = 1, \\quad r_{\\text{MgO}} = 212\\text{ pm}, \\quad r_{\\text{NaCl}} = 282\\text{ pm}",
        steps: [
          "1. State Coulombic lattice energy proportionality: $U \\propto \\frac{|q_1 q_2|}{r_0}$.",
          "2. Formulate the ratio: $\\frac{U_{\\text{MgO}}}{U_{\\text{NaCl}}} = \\left(\\frac{|q_1 q_2|_{\\text{MgO}}}{|q_1 q_2|_{\\text{NaCl}}}\\right) \\times \\left(\\frac{r_{\\text{NaCl}}}{r_{\\text{MgO}}}\\right)$.",
          "3. Substitute charges and radii: $\\frac{U_{\\text{MgO}}}{U_{\\text{NaCl}}} = \\left(\\frac{4}{1}\\right) \\times \\left(\\frac{282}{212}\\right) = 4 \\times 1.330 = 5.32$.",
          "4. Interpret thermodynamic stability: $\\text{MgO}$ has a lattice energy approximately $5.32$ times greater than $\\text{NaCl}$, explaining its exceptionally high melting point ($2,852^\\circ\\text{C}$ vs $801^\\circ\\text{C}$)."
        ],
        answer: "\\frac{U_{\\text{MgO}}}{U_{\\text{NaCl}}} = 5.32 \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "U", name: "Lattice Energy", unit: "\\text{kJ/mol}", desc: "Energy released upon gaseous ion crystal condensation" },
          { sym: "q", name: "Ionic Charge", unit: "e", desc: "Valence oxidation magnitude of ions" },
          { sym: "r_0", name: "Inter-ionic Separation", unit: "\\text{pm}", desc: "Sum of cation and anion ionic radii" }
        ]
      };
    }
    if (mId === 7 || t.includes("covalent") || t.includes("bond")) {
      return {
        problem: `Calculate the standard enthalpy of reaction ($\\Delta H_{\\text{rxn}}^\\circ$) for the gas-phase synthesis of hydrogen chloride: $\\text{H}_2(g) + \\text{Cl}_2(g) \\longrightarrow 2\\text{HCl}(g)$, using the average bond enthalpies: $D(\\text{H-H}) = 436\\text{ kJ/mol}$, $D(\\text{Cl-Cl}) = 242\\text{ kJ/mol}$, and $D(\\text{H-Cl}) = 431\\text{ kJ/mol}$.`,
        given: "D(\\text{H-H}) = 436\\text{ kJ/mol}, \\quad D(\\text{Cl-Cl}) = 242\\text{ kJ/mol}, \\quad D(\\text{H-Cl}) = 431\\text{ kJ/mol}",
        steps: [
          "1. Apply the bond enthalpy formulation: $\\Delta H_{\\text{rxn}} = \\sum D(\\text{bonds broken}) - \\sum D(\\text{bonds formed})$.",
          "2. Sum energy required to break reactant bonds: $\\sum D(\\text{broken}) = 1(436) + 1(242) = 678\\text{ kJ/mol}$.",
          "3. Sum energy released upon forming product bonds: $\\sum D(\\text{formed}) = 2(431) = 862\\text{ kJ/mol}$.",
          "4. Compute net enthalpy change: $\\Delta H_{\\text{rxn}} = 678 - 862 = -184\\text{ kJ/mol}$ (Exothermic)."
        ],
        answer: "\\Delta H_{\\text{rxn}}^\\circ = -184\\text{ kJ/mol} \\quad (\\text{Exothermic})",
        parameters: [
          { sym: "\\Delta H", name: "Enthalpy of Reaction", unit: "\\text{kJ/mol}", desc: "Net thermal energy transferred in reaction" },
          { sym: "D", name: "Bond Dissociation Energy", unit: "\\text{kJ/mol}", desc: "Enthalpy required to homolytically cleave covalent bond" }
        ]
      };
    }
    if (mId === 11 || t.includes("states of matter") || t.includes("effusion")) {
      return {
        problem: `Under identical temperature and pressure conditions, compare the rate of effusion of Helium gas ($\\text{He}$, molar mass $M_1 = 4.003\\text{ g/mol}$) to Oxygen gas ($\\text{O}_2$, molar mass $M_2 = 32.00\\text{ g/mol}$) using Graham's Law of Effusion.`,
        given: "M_1(\\text{He}) = 4.003\\text{ g/mol}, \\quad M_2(\\text{O}_2) = 32.00\\text{ g/mol}",
        steps: [
          "1. State Graham's Law of Effusion: $\\frac{\\text{Rate}_1}{\\text{Rate}_2} = \\sqrt{\\frac{M_2}{M_1}}$.",
          "2. Substitute molar masses: $\\frac{\\text{Rate}_{\\text{He}}}{\\text{Rate}_{\\text{O}_2}} = \\sqrt{\\frac{32.00\\text{ g/mol}}{4.003\\text{ g/mol}}}$.",
          "3. Calculate quotient under radical: $\\frac{32.00}{4.003} \\approx 7.994$.",
          "4. Compute square root: $\\sqrt{7.994} \\approx 2.83$. Helium effuses $2.83$ times faster than oxygen."
        ],
        answer: "\\frac{\\text{Rate}_{\\text{He}}}{\\text{Rate}_{\\text{O}_2}} = 2.83 \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "\\text{Rate}", name: "Effusion Rate", unit: "\\text{mol/s}", desc: "Rate of gas escape through a pinhole orifice" },
          { sym: "M", name: "Molar Mass", unit: "\\text{g/mol}", desc: "Mass of one mole of chemical substance" }
        ]
      };
    }
    if (mId === 14 || t.includes("energy and chemical") || t.includes("calorimet") || t.includes("thermochem")) {
      return {
        problem: `A $45.0\\text{ g}$ sample of pure copper metal is heated to $100.0^\\circ\\text{C}$ and placed into an insulated coffee-cup calorimeter containing $100.0\\text{ g}$ of water at $20.0^\\circ\\text{C}$. The final thermal equilibrium temperature reaches $23.2^\\circ\\text{C}$. Given the specific heat of water $c_w = 4.184\\text{ J/(g}\\cdot^\\circ\\text{C)}$, determine the experimental specific heat capacity of copper ($c_{\\text{Cu}}$).`,
        given: "m_{\\text{Cu}} = 45.0\\text{ g}, \\quad T_{i,\\text{Cu}} = 100.0^\\circ\\text{C}, \\quad m_w = 100.0\\text{ g}, \\quad T_{i,w} = 20.0^\\circ\\text{C}, \\quad T_f = 23.2^\\circ\\text{C}",
        steps: [
          "1. Calculate heat absorbed by water: $q_w = m_w c_w \\Delta T_w = (100.0\\text{ g})(4.184\\text{ J/g}^\\circ\\text{C})(23.2 - 20.0^\\circ\\text{C}) = 1,338.9\\text{ J}$.",
          "2. Apply energy conservation in isolated calorimeter: $q_{\\text{Cu}} = -q_w = -1,338.9\\text{ J}$.",
          "3. State thermal formulation for copper: $q_{\\text{Cu}} = m_{\\text{Cu}} c_{\\text{Cu}} \\Delta T_{\\text{Cu}}$, where $\\Delta T_{\\text{Cu}} = 23.2 - 100.0 = -76.8^\\circ\\text{C}$.",
          "4. Solve for specific heat capacity: $c_{\\text{Cu}} = \\frac{-1,338.9\\text{ J}}{(45.0\\text{ g})(-76.8^\\circ\\text{C})} = \\frac{1,338.9}{3,456} \\approx 0.387\\text{ J/(g}\\cdot^\\circ\\text{C)}$."
        ],
        answer: "c_{\\text{Cu}} = 0.387\\text{ J/(g}\\cdot^\\circ\\text{C)} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "q", name: "Thermal Energy", unit: "\\text{J}", desc: "Heat exchanged between systems" },
          { sym: "c", name: "Specific Heat", unit: "\\text{J/(g}\\cdot^\\circ\\text{C)}", desc: "Energy required to raise 1 g by 1 °C" },
          { sym: "\\Delta T", name: "Temperature Differential", unit: "^\\circ\\text{C}", desc: "Change in thermodynamic temperature" }
        ]
      };
    }
    if (mId === 15 || t.includes("reaction rate") || t.includes("kinetic")) {
      return {
        problem: `For the chemical reaction $\\text{A} + 2\\text{B} \\longrightarrow \\text{C}$, initial rate measurements demonstrate that doubling $[\\text{A}]$ doubles the reaction rate, while doubling $[\\text{B}]$ quadruples the rate. When $[\\text{A}] = 0.20\\text{ M}$ and $[\\text{B}] = 0.10\\text{ M}$, the initial rate is measured as $3.20 \\times 10^{-3}\\text{ M/s}$. Determine the rate law expression, the overall reaction order, and calculate the rate constant $k$.`,
        given: "[\\text{A}] = 0.20\\text{ M}, \\quad [\\text{B}] = 0.10\\text{ M}, \\quad \\text{Rate} = 3.20 \\times 10^{-3}\\text{ M/s}",
        steps: [
          "1. Deduce reaction orders from concentration dependencies: First order in $\\text{A}$ ($m = 1$), second order in $\\text{B}$ ($n = 2$). Overall order $= 1 + 2 = 3$.",
          "2. Formulate empirical rate law: $\\text{Rate} = k [\\text{A}] [\\text{B}]^2$.",
          "3. Isolate rate constant: $k = \\frac{\\text{Rate}}{[\\text{A}][\\text{B}]^2}$.",
          "4. Substitute values and resolve units: $k = \\frac{3.20 \\times 10^{-3}\\text{ M/s}}{(0.20\\text{ M})(0.10\\text{ M})^2} = \\frac{3.20 \\times 10^{-3}}{0.0020} = 1.60\\text{ M}^{-2}\\text{s}^{-1}$."
        ],
        answer: "\\text{Rate} = k[\\text{A}][\\text{B}]^2, \\quad k = 1.60\\text{ M}^{-2}\\text{s}^{-1}",
        parameters: [
          { sym: "\\text{Rate}", name: "Reaction Velocity", unit: "\\text{M/s}", desc: "Change in molarity per second" },
          { sym: "k", name: "Specific Rate Constant", unit: "\\text{M}^{-2}\\text{s}^{-1}", desc: "Temperature-dependent kinetic proportionality constant" }
        ]
      };
    }
    if (mId === 18 || t.includes("redox") || t.includes("oxidation")) {
      return {
        problem: `Balance the following redox reaction in acidic aqueous solution using the half-reaction method: $\\text{Fe}^{2+}(aq) + \\text{Cr}_2\\text{O}_7^{2-}(aq) \\longrightarrow \\text{Fe}^{3+}(aq) + \\text{Cr}^{3+}(aq)$. Determine the stoichiometric coefficient of $\\text{H}^+(aq)$ and the total number of moles of electrons transferred per mole of dichromate reduced.`,
        given: "\\text{Oxidation: } \\text{Fe}^{2+} \\to \\text{Fe}^{3+}, \\quad \\text{Reduction: } \\text{Cr}_2\\text{O}_7^{2-} \\to \\text{Cr}^{3+}",
        steps: [
          "1. Balance oxidation half-reaction: $\\text{Fe}^{2+} \\longrightarrow \\text{Fe}^{3+} + e^-$.",
          "2. Balance reduction half-reaction: Balance $\\text{Cr}$ atoms ($\\text{Cr}_2\\text{O}_7^{2-} \\to 2\\text{Cr}^{3+}$), balance $\\text{O}$ with $7\\text{H}_2\\text{O}$, balance $\\text{H}$ with $14\\text{H}^+$, balance charge with $6e^-$: $\\text{Cr}_2\\text{O}_7^{2-} + 14\\text{H}^+ + 6e^- \\longrightarrow 2\\text{Cr}^{3+} + 7\\text{H}_2\\text{O}$.",
          "3. Equalize electron count by multiplying oxidation half-reaction by $6$: $6\\text{Fe}^{2+} \\longrightarrow 6\\text{Fe}^{3+} + 6e^-$.",
          "4. Sum half-reactions and cancel electrons: $6\\text{Fe}^{2+} + \\text{Cr}_2\\text{O}_7^{2-} + 14\\text{H}^+ \\longrightarrow 6\\text{Fe}^{3+} + 2\\text{Cr}^{3+} + 7\\text{H}_2\\text{O}$ ($6$ electrons transferred)."
        ],
        answer: "6\\text{Fe}^{2+} + \\text{Cr}_2\\text{O}_7^{2-} + 14\\text{H}^+ \\to 6\\text{Fe}^{3+} + 2\\text{Cr}^{3+} + 7\\text{H}_2\\text{O} \\quad (n = 6e^-)",
        parameters: [
          { sym: "n", name: "Transferred Electrons", unit: "\\text{mol } e^-", desc: "Chemical amount of charge equivalents transferred" },
          { sym: "[\\text{H}^+]", name: "Proton Concentration", unit: "\\text{M}", desc: "Acid medium stoichiometry" }
        ]
      };
    }
    if (mId === 19 || t.includes("electrochem")) {
      return {
        problem: `A galvanic electrochemical cell operates under standard conditions ($298\\text{ K}$) using the overall reaction: $\\text{Zn}(s) + \\text{Cu}^{2+}(aq, 1.0\\text{ M}) \\longrightarrow \\text{Zn}^{2+}(aq, 1.0\\text{ M}) + \\text{Cu}(s)$. Given standard reduction potentials $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V}$ and $E^\\circ(\\text{Zn}^{2+}/\\text{Zn}) = -0.76\\text{ V}$, calculate the standard cell potential ($E_{\\text{cell}}^\\circ$) and the standard Gibbs free energy change ($\\Delta G^\\circ$).`,
        given: "E^\\circ_{\\text{cat}} = +0.34\\text{ V}, \\quad E^\\circ_{\\text{an}} = -0.76\\text{ V}, \\quad n = 2, \\quad F = 96,485\\text{ C/mol}",
        steps: [
          "1. Identify cathode (reduction) and anode (oxidation): Copper cathode, Zinc anode.",
          "2. Calculate standard cell potential: $E_{\\text{cell}}^\\circ = E_{\\text{cathode}}^\\circ - E_{\\text{anode}}^\\circ = +0.34\\text{ V} - (-0.76\\text{ V}) = +1.10\\text{ V}$.",
          "3. State relation between cell electromotive force and free energy: $\\Delta G^\\circ = -n F E_{\\text{cell}}^\\circ$.",
          "4. Compute Gibbs free energy: $\\Delta G^\\circ = -2(96,485\\text{ C/mol})(1.10\\text{ J/C}) = -212,267\\text{ J/mol} \\approx -212\\text{ kJ/mol}$ (Spontaneous)."
        ],
        answer: "E_{\\text{cell}}^\\circ = +1.10\\text{ V}, \\quad \\Delta G^\\circ = -212\\text{ kJ/mol} \\quad (\\text{Spontaneous})",
        parameters: [
          { sym: "E^\\circ", name: "Standard Cell EMF", unit: "\\text{V}", desc: "Electric potential difference between half-cells" },
          { sym: "\\Delta G^\\circ", name: "Gibbs Free Energy", unit: "\\text{kJ/mol}", desc: "Thermodynamic spontaneity criterion" }
        ]
      };
    }
    if (mId === 20 || t.includes("hydrocarbon")) {
      return {
        problem: `A stoichiometric combustion analysis is performed on propane gas ($\\text{C}_3\\text{H}_8$, molar mass $M = 44.10\\text{ g/mol}$). Calculate the mass of carbon dioxide ($\\text{CO}_2$, molar mass $M = 44.01\\text{ g/mol}$) generated upon complete combustion of $88.20\\text{ g}$ ($2.00\\text{ mol}$) of propane in excess oxygen.`,
        given: "m_{\\text{propane}} = 88.20\\text{ g}, \\quad M_{\\text{propane}} = 44.10\\text{ g/mol}, \\quad M_{\\text{CO}_2} = 44.01\\text{ g/mol}",
        steps: [
          "1. Formulate balanced chemical equation: $\\text{C}_3\\text{H}_8(g) + 5\\text{O}_2(g) \\longrightarrow 3\\text{CO}_2(g) + 4\\text{H}_2\\text{O}(g)$.",
          "2. Convert propane mass to moles: $n_{\\text{propane}} = \\frac{88.20\\text{ g}}{44.10\\text{ g/mol}} = 2.00\\text{ mol}$.",
          "3. Apply stoichiometric mole ratio ($3\\text{ mol }\\text{CO}_2 : 1\\text{ mol }\\text{C}_3\\text{H}_8$): $n_{\\text{CO}_2} = 2.00 \\times 3 = 6.00\\text{ mol }\\text{CO}_2$.",
          "4. Convert moles of $\\text{CO}_2$ to mass: $m_{\\text{CO}_2} = 6.00\\text{ mol} \\times 44.01\\text{ g/mol} = 264.1\\text{ g}$."
        ],
        answer: "m_{\\text{CO}_2} = 264.1\\text{ g} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "n", name: "Chemical Amount", unit: "\\text{mol}", desc: "Quantity in chemical moles" },
          { sym: "m", name: "Mass Yield", unit: "\\text{g}", desc: "Gravimetric yield of combustion product" }
        ]
      };
    }
    if (mId === 21 || t.includes("substituted hydrocarbon") || t.includes("organic")) {
      return {
        problem: `An organic chemistry lab prepares ethyl ethanoate (ethyl acetate, ester) via Fischer esterification: $\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\rightleftharpoons \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}$. A student reacts $30.03\\text{ g}$ ($0.500\\text{ mol}$) of acetic acid with excess ethanol and isolates $35.24\\text{ g}$ of pure ethyl ethanoate (molar mass $88.11\\text{ g/mol}$). Calculate the theoretical yield and the experimental percent yield.`,
        given: "n_{\\text{acid}} = 0.500\\text{ mol}, \\quad M_{\\text{ester}} = 88.11\\text{ g/mol}, \\quad m_{\\text{actual}} = 35.24\\text{ g}",
        steps: [
          "1. Determine theoretical moles of ester from 1:1 stoichiometry: $n_{\\text{theoretical}} = 0.500\\text{ mol}$.",
          "2. Calculate theoretical yield mass: $m_{\\text{theoretical}} = 0.500\\text{ mol} \\times 88.11\\text{ g/mol} = 44.06\\text{ g}$.",
          "3. State formulation for percent yield: $\\%\\text{ Yield} = \\frac{m_{\\text{actual}}}{m_{\\text{theoretical}}} \\times 100\\%$.",
          "4. Compute reaction percent yield: $\\%\\text{ Yield} = \\frac{35.24\\text{ g}}{44.06\\text{ g}} \\times 100\\% = 79.98\\% \\approx 80.0\\%$."
        ],
        answer: "\\%\\text{ Yield} = 80.0\\% \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "m_{\\text{theoretical}}", name: "Theoretical Yield", unit: "\\text{g}", desc: "Max expected mass under complete conversion" },
          { sym: "\\%\\text{ Yield}", name: "Synthetic Efficiency", unit: "\\%", desc: "Ratio of recovered to theoretical product mass" }
        ]
      };
    }
    if (mId === 22 || t.includes("chemistry of life") || t.includes("biochem")) {
      return {
        problem: `During cellular respiration, complete aerobic combustion of one mole of D-glucose releases $\\Delta H_c^\\circ = -2,808\\text{ kJ/mol}$: $\\text{C}_6\\text{H}_{12}\\text{O}_6(s) + 6\\text{O}_2(g) \\longrightarrow 6\\text{CO}_2(g) + 6\\text{H}_2\\text{O}(l)$. Calculate the energy released when a human muscle cell metabolizes $9.00\\text{ g}$ of glucose (molar mass $M = 180.16\\text{ g/mol}$).`,
        given: "m_{\\text{glucose}} = 9.00\\text{ g}, \\quad M_{\\text{glucose}} = 180.16\\text{ g/mol}, \\quad \\Delta H_c^\\circ = -2,808\\text{ kJ/mol}",
        steps: [
          "1. Convert glucose mass to chemical moles: $n = \\frac{m}{M} = \\frac{9.00\\text{ g}}{180.16\\text{ g/mol}} = 0.0500\\text{ mol}$.",
          "2. Formulate heat release equation: $q = n \\times |\\Delta H_c^\\circ|$.",
          "3. Calculate thermal energy produced: $q = (0.0500\\text{ mol}) \\times (2,808\\text{ kJ/mol}) = 140.4\\text{ kJ}$.",
          "4. Relate to biological energy: The oxidation of $9.00\\text{ g}$ glucose yields $140.4\\text{ kJ}$ available for ATP synthesis."
        ],
        answer: "q = 140.4\\text{ kJ} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "q", name: "Metabolic Energy", unit: "\\text{kJ}", desc: "Chemical energy liberated by substrate oxidation" },
          { sym: "n", name: "Substrate Amount", unit: "\\text{mol}", desc: "Moles of biological nutrient consumed" }
        ]
      };
    }
    if (mId === 23 || t.includes("nuclear")) {
      return {
        problem: `Iodine-131 ($^{131}_{53}\\text{I}$), a radioisotope utilized in medical thyroid radiometry, decays via $\\beta^-$ emission with a radioactive half-life of $t_{1/2} = 8.02\\text{ days}$. If an initial pharmaceutical dose contains $N_0 = 48.0\\text{ mCi}$, calculate the remaining radioactivity after $t = 24.06\\text{ days}$.`,
        given: "N_0 = 48.0\\text{ mCi}, \\quad t_{1/2} = 8.02\\text{ days}, \\quad t = 24.06\\text{ days}",
        steps: [
          "1. Calculate the number of elapsed half-lives: $n = \\frac{t}{t_{1/2}} = \\frac{24.06\\text{ d}}{8.02\\text{ d}} = 3.00$.",
          "2. Apply the radioactive decay law: $N(t) = N_0 \\left(\\frac{1}{2}\\right)^n$.",
          "3. Compute remaining fraction: $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8} = 0.125$ ($12.5\\%$ remaining).",
          "4. Calculate final radioactivity: $N(24.06) = 48.0\\text{ mCi} \\times 0.125 = 6.00\\text{ mCi}$."
        ],
        answer: "N(24.06\\text{ d}) = 6.00\\text{ mCi} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "N(t)", name: "Remaining Activity", unit: "\\text{mCi}", desc: "Radioactivity of radioisotope at time t" },
          { sym: "t_{1/2}", name: "Half-Life", unit: "\\text{days}", desc: "Time required for half of radioactive nuclei to decay" }
        ]
      };
    }
    if (t.includes("gas") || f.includes("pv") || f.includes("p_1")) {
      return {
        problem: `A sample of gas occupies an initial volume of $V_1 = 4.50\\text{ L}$ at a pressure of $P_1 = 1.20\\text{ atm}$. Assuming temperature remains constant (Boyle's Law), calculate the final pressure $P_2$ when the gas is compressed to a volume of $V_2 = 2.00\\text{ L}$.`,
        given: "P_1 = 1.20\\text{ atm}, \\quad V_1 = 4.50\\text{ L}, \\quad V_2 = 2.00\\text{ L}, \\quad T = \\text{constant}",
        steps: [
          "1. Apply Boyle's Law for isothermal gas compression: $P_1 V_1 = P_2 V_2$.",
          "2. Isolate the target final pressure: $P_2 = \\frac{P_1 V_1}{V_2}$.",
          "3. Substitute experimental parameters: $P_2 = \\frac{(1.20\\text{ atm}) \\times (4.50\\text{ L})}{2.00\\text{ L}}$.",
          "4. Compute the final pressure: $P_2 = \\frac{5.40}{2.00} = 2.70\\text{ atm}$."
        ],
        answer: "P_2 = 2.70\\text{ atm} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "P", name: "Absolute Pressure", unit: "\\text{atm}", desc: "Gas pressure measured by barometer or transducer" },
          { sym: "V", name: "Gas Volume", unit: "\\text{L}", desc: "Volume enclosed by container or cylinder" },
          { sym: "T", name: "Temperature", unit: "\\text{K}", desc: "Absolute thermodynamic temperature" }
        ]
      };
    }
    if (t.includes("solution") || t.includes("mixture") || f.includes("m =")) {
      return {
        problem: `A chemist dissolves $14.61\\text{ g}$ of pure sodium chloride ($\\text{NaCl}$, molar mass $M = 58.44\\text{ g/mol}$) into distilled water to prepare exactly $500.0\\text{ mL}$ of aqueous solution. Calculate the molar concentration ($M$) of the prepared solution.`,
        given: "m = 14.61\\text{ g}, \\quad M_{\\text{NaCl}} = 58.44\\text{ g/mol}, \\quad V = 500.0\\text{ mL} = 0.5000\\text{ L}",
        steps: [
          "1. Convert sample mass to chemical moles: $n = \\frac{m}{M} = \\frac{14.61\\text{ g}}{58.44\\text{ g/mol}} = 0.2500\\text{ mol}$.",
          "2. State definition of molarity: $M = \\frac{n}{V}$.",
          "3. Substitute moles and volume in liters: $M = \\frac{0.2500\\text{ mol}}{0.5000\\text{ L}} = 0.5000\\text{ mol/L}$.",
          "4. Verify units and stoichiometry: The prepared solution is $0.500\\text{ M NaCl}$."
        ],
        answer: "M = 0.500\\text{ M} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "M", name: "Molarity", unit: "\\text{mol/L (M)}", desc: "Molar concentration of dissolved solute" },
          { sym: "n", name: "Solute Amount", unit: "\\text{mol}", desc: "Chemical amount of dissolved species" },
          { sym: "V", name: "Solution Volume", unit: "\\text{L}", desc: "Total volumetric capacity of the solution" }
        ]
      };
    }
    if (t.includes("acid") || t.includes("base") || f.includes("ph")) {
      return {
        problem: `A sample of water has a measured hydronium ion concentration of $[\\text{H}_3\\text{O}^+] = 3.20 \\times 10^{-5}\\text{ M}$. Calculate the pH and pOH at $25^\\circ\\text{C}$, and classify the sample as acidic, neutral, or basic.`,
        given: "[\\text{H}_3\\text{O}^+] = 3.20 \\times 10^{-5}\\text{ M}, \\quad K_w = 1.00 \\times 10^{-14}",
        steps: [
          "1. Apply the logarithmic pH definition: $\\text{pH} = -\\log_{10}[\\text{H}_3\\text{O}^+]$.",
          "2. Calculate pH: $\\text{pH} = -\\log_{10}(3.20 \\times 10^{-5}) = 4.49$.",
          "3. Determine pOH from water dissociation: $\\text{pOH} = 14.00 - \\text{pH} = 14.00 - 4.49 = 9.51$.",
          "4. Classify acidity: Since $\\text{pH} = 4.49 < 7.00$, the sample is distinctly acidic."
        ],
        answer: "\\text{pH} = 4.49, \\quad \\text{pOH} = 9.51 \\quad (\\text{Acidic})",
        parameters: [
          { sym: "[\\text{H}_3\\text{O}^+]", name: "Hydronium Concentration", unit: "\\text{M}", desc: "Aqueous proton carrier ion concentration" },
          { sym: "\\text{pH}", name: "Acidity Index", unit: "\\text{dimensionless}", desc: "Negative logarithm of hydronium concentration" }
        ]
      };
    }
    if (t.includes("equilibrium") || f.includes("k_{eq}")) {
      return {
        problem: `For the reversible gaseous reaction $\\text{A}(g) + \\text{B}(g) \\rightleftharpoons 2\\text{C}(g)$, equilibrium concentrations in a closed $2.00\\text{ L}$ flask are measured as $[\\text{A}] = 0.250\\text{ M}$, $[\\text{B}] = 0.200\\text{ M}$, and $[\\text{C}] = 0.600\\text{ M}$. Calculate the equilibrium constant $K_{eq}$.`,
        given: "[\\text{A}] = 0.250\\text{ M}, \\quad [\\text{B}] = 0.200\\text{ M}, \\quad [\\text{C}] = 0.600\\text{ M}",
        steps: [
          "1. Formulate the equilibrium constant expression: $K_{eq} = \\frac{[\\text{C}]^2}{[\\text{A}][\\text{B}]}$.",
          "2. Substitute equilibrium concentrations: $K_{eq} = \\frac{(0.600)^2}{(0.250)(0.200)}$.",
          "3. Evaluate the quotient: $K_{eq} = \\frac{0.360}{0.0500} = 7.20$.",
          "4. Analyze thermodynamic position: Since $K_{eq} = 7.20 > 1$, products predominate at equilibrium."
        ],
        answer: "K_{eq} = 7.20 \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "K_{eq}", name: "Equilibrium Constant", unit: "\\text{quotient}", desc: "Ratio of product to reactant concentrations at dynamic equilibrium" }
        ]
      };
    }
  }

  if (code === "BIO") {
    if (mId === 1 || t.includes("study of life") || t.includes("microscope")) {
      return {
        problem: `A biology student observes an onion epidermal cell using a compound light microscope. The ocular lens has a magnification of $10\\times$, and the high-power objective lens has a magnification of $40\\times$. If the diameter of the field of view under low power ($100\\times$ total) is $1,800\\ \\mu\\text{m}$, calculate the total magnification under high power and the actual length of a single cell that occupies approximately $\\frac{1}{6}$ of the high-power field diameter.`,
        given: "M_{\\text{ocular}} = 10\\times, \\quad M_{\\text{obj}} = 40\\times, \\quad \\text{FOV}_{100\\times} = 1,800\\ \\mu\\text{m}, \\quad \\text{Fraction} = \\frac{1}{6}",
        steps: [
          "1. Calculate total high-power magnification: $M_{\\text{total}} = M_{\\text{ocular}} \\times M_{\\text{objective}} = 10 \\times 40 = 400\\times$.",
          "2. Apply inverse magnification scaling to find high-power field diameter: $\\text{FOV}_{400\\times} = \\text{FOV}_{100\\times} \\times \\left(\\frac{100}{400}\\right) = 1,800\\ \\mu\\text{m} \\times 0.25 = 450\\ \\mu\\text{m}$.",
          "3. Calculate individual cell length: $L_{\\text{cell}} = \\frac{\\text{FOV}_{400\\times}}{6} = \\frac{450\\ \\mu\\text{m}}{6} = 75\\ \\mu\\text{m}$."
        ],
        answer: "M_{\\text{total}} = 400\\times, \\quad L_{\\text{cell}} = 75\\ \\mu\\text{m}",
        parameters: [
          { sym: "M", name: "Total Magnification", unit: "\\times", desc: "Product of ocular and objective lens powers" },
          { sym: "L_{\\text{cell}}", name: "Cellular Length", unit: "\\mu\\text{m}", desc: "True physical length of examined specimen" }
        ]
      };
    }
    if (mId === 2 || t.includes("principles of ecology") || t.includes("trophic") || f.includes("0.10")) {
      return {
        problem: `In an open grassland ecosystem, primary producers (grasses) synthesize $24,000\\text{ kcal/(m}^2\\cdot\\text{yr)}$ of gross chemical energy via photosynthesis. According to Lindeman's 10% ecological trophic efficiency rule, calculate the energy available to the primary consumers (herbivorous zebra) and to the tertiary consumers (apex predator lions, trophic level 4).`,
        given: "E_{\\text{producer}} = 24,000\\text{ kcal/(m}^2\\cdot\\text{yr)}, \\quad \\text{Transfer Efficiency} = 10\\% = 0.10",
        steps: [
          "1. Calculate energy assimilated by primary consumers (Trophic Level 2): $E_{\\text{herbivore}} = 24,000 \\times 0.10 = 2,400\\text{ kcal/(m}^2\\cdot\\text{yr)}$.",
          "2. Calculate energy available to secondary consumers (Trophic Level 3): $E_{\\text{carnivore}} = 2,400 \\times 0.10 = 240\\text{ kcal/(m}^2\\cdot\\text{yr)}$.",
          "3. Calculate energy available to tertiary consumers (Trophic Level 4): $E_{\\text{apex}} = 240 \\times 0.10 = 24.0\\text{ kcal/(m}^2\\cdot\\text{yr)}$.",
          "4. Interpret trophic pyramid thermodynamics: Approximately $99.9\\%$ of original solar energy is dissipated as metabolic heat and entropy across the 3 trophic transfers."
        ],
        answer: "E_{\\text{herbivore}} = 2,400\\text{ kcal}, \\quad E_{\\text{apex}} = 24.0\\text{ kcal/(m}^2\\cdot\\text{yr)}",
        parameters: [
          { sym: "E", name: "Trophic Energy", unit: "\\text{kcal/(m}^2\\cdot\\text{yr)}", desc: "Energy flow per unit area per year" },
          { sym: "\\eta", name: "Trophic Efficiency", unit: "\\%", desc: "Percentage of energy transferred between trophic tiers" }
        ]
      };
    }
    if (mId === 4 || t.includes("population") || t.includes("growth")) {
      return {
        problem: `An isolated population of organisms begins with an initial count of $N_0 = 450$ individuals and increases exponentially at an intrinsic growth rate of $r = 0.14\\text{ yr}^{-1}$. Calculate the projected population size $N(t)$ after $t = 5.0\\text{ years}$.`,
        given: "N_0 = 450, \\quad r = 0.14\\text{ yr}^{-1}, \\quad t = 5.0\\text{ yr}",
        steps: [
          "1. Apply the exponential population growth equation: $N(t) = N_0 e^{rt}$.",
          "2. Compute exponent: $rt = (0.14\\text{ yr}^{-1}) \\times (5.0\\text{ yr}) = 0.70$.",
          "3. Calculate exponential factor: $e^{0.70} \\approx 2.014$.",
          "4. Multiply by baseline population: $N(5.0) = 450 \\times 2.014 \\approx 906$ individuals."
        ],
        answer: "N(5.0) = 906\\text{ individuals} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "N(t)", name: "Population Size", unit: "\\text{individuals}", desc: "Count of organisms at time t" },
          { sym: "r", name: "Per Capita Growth Rate", unit: "\\text{yr}^{-1}", desc: "Intrinsic reproductive rate" }
        ]
      };
    }
    if (mId === 7 || t.includes("cellular structure") || t.includes("osmosis") || t.includes("transport")) {
      return {
        problem: `A plant cell containing a solute concentration of $C = 0.30\\text{ M}$ sucrose is placed into an open beaker of pure distilled water at temperature $T = 20.0^\\circ\\text{C}$ ($293.15\\text{ K}$). Assuming the ionization constant for sucrose is $i = 1$ and $R = 0.0831\\text{ L}\\cdot\\text{bar/(mol}\\cdot\\text{K)}$, calculate the initial solute potential ($\\Psi_s$) of the plant cell and predict the direction of net water movement.`,
        given: "i = 1, \\quad C = 0.30\\text{ mol/L}, \\quad R = 0.0831\\text{ L}\\cdot\\text{bar/(mol}\\cdot\\text{K)}, \\quad T = 293.15\\text{ K}, \\quad \\Psi_{\\text{water}} = 0\\text{ bar}",
        steps: [
          "1. State the solute potential formula: $\\Psi_s = -i C R T$.",
          "2. Substitute values: $\\Psi_s = -(1)(0.30\\text{ mol/L})(0.0831\\text{ L}\\cdot\\text{bar/(mol}\\cdot\\text{K)})(293.15\\text{ K})$.",
          "3. Compute solute potential: $\\Psi_s = -7.31\\text{ bar}$.",
          "4. Determine net osmotic direction: Since $\\Psi_{\\text{cell}} = -7.31\\text{ bar} < \\Psi_{\\text{pure water}} = 0\\text{ bar}$, water diffuses down its water potential gradient into the cell, creating turgor pressure."
        ],
        answer: "\\Psi_s = -7.31\\text{ bar} \\quad (\\text{Water moves into cell})",
        parameters: [
          { sym: "\\Psi_s", name: "Solute Potential", unit: "\\text{bar}", desc: "Osmotic component reducing free water chemical potential" },
          { sym: "C", name: "Molar Concentration", unit: "\\text{mol/L}", desc: "Osmotically active solute concentration" }
        ]
      };
    }
    if (mId === 8 || t.includes("cellular energy") || t.includes("photosynthesis") || t.includes("respiration")) {
      return {
        problem: `During aerobic cellular respiration, complete catabolism of one molecule of glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$) yields approximately $32\\text{ ATP}$ equivalents. If hydrolysis of each mole of ATP releases $\\Delta G^\\circ = -30.5\\text{ kJ/mol}$, and complete combustion of glucose releases $\\Delta H_c = -2,870\\text{ kJ/mol}$, calculate the thermodynamic efficiency of cellular ATP energy capture.`,
        given: "N_{\\text{ATP}} = 32\\text{ mol ATP/mol glucose}, \\quad \\Delta G_{\\text{ATP}} = 30.5\\text{ kJ/mol}, \\quad \\Delta H_{\\text{glucose}} = 2,870\\text{ kJ/mol}",
        steps: [
          "1. Calculate total useful energy stored in ATP: $E_{\\text{stored}} = 32 \\times 30.5\\text{ kJ} = 976.0\\text{ kJ}$.",
          "2. State formulation for thermodynamic metabolic efficiency: $\\eta = \\frac{E_{\\text{stored}}}{E_{\\text{combustion}}} \\times 100\\%$.",
          "3. Substitute values: $\\eta = \\frac{976.0\\text{ kJ}}{2,870\\text{ kJ}} \\times 100\\%$.",
          "4. Compute efficiency percentage: $\\eta \\approx 34.0\\%$. The remaining $66\\%$ is dissipated as thermal energy to maintain endothermic body temperature."
        ],
        answer: "\\eta = 34.0\\% \\text{ efficiency} \\quad (976\\text{ kJ ATP captured})",
        parameters: [
          { sym: "\\eta", name: "Metabolic Efficiency", unit: "\\%", desc: "Percentage of fuel chemical energy conserved as ATP" },
          { sym: "E_{\\text{stored}}", name: "Conserved Energy", unit: "\\text{kJ}", desc: "Free energy harnessed in phosphodiester bonds" }
        ]
      };
    }
    if (mId === 9 || t.includes("cellular reproduction") || t.includes("mitosis")) {
      return {
        problem: `Under a microscope, an allium (onion root tip) tissue sample has $800$ total counted cells. Microscopic classification reveals: $640$ cells in interphase, $88$ in prophase, $40$ in metaphase, $20$ in anaphase, and $12$ in telophase. Calculate the Mitotic Index ($\\text{MI}$) of this meristematic tissue and estimate the duration of metaphase if the complete cell cycle takes $T = 24.0\\text{ hours}$.`,
        given: "N_{\\text{total}} = 800, \\quad N_{\\text{mitosis}} = 88 + 40 + 20 + 12 = 160, \\quad N_{\\text{metaphase}} = 40, \\quad T_{\\text{cycle}} = 24.0\\text{ h}",
        steps: [
          "1. State the Mitotic Index formula: $\\text{MI} = \\frac{N_{\\text{mitosis}}}{N_{\\text{total}}} \\times 100\\%$.",
          "2. Compute mitotic index: $\\text{MI} = \\frac{160}{800} \\times 100\\% = 20.0\\%$.",
          "3. Calculate fraction of cells in metaphase: $f_{\\text{meta}} = \\frac{40}{800} = 0.050$ ($5.0\\%$).",
          "4. Estimate metaphase duration: $t_{\\text{meta}} = f_{\\text{meta}} \\times 24.0\\text{ h} = 0.050 \\times 24.0 = 1.20\\text{ hours} = 72\\text{ minutes}$."
        ],
        answer: "\\text{MI} = 20.0\\%, \\quad t_{\\text{metaphase}} = 72\\text{ min}",
        parameters: [
          { sym: "\\text{MI}", name: "Mitotic Index", unit: "\\%", desc: "Proportion of dividing cells in active mitosis" },
          { sym: "t", name: "Phase Duration", unit: "\\text{min}", desc: "Temporal span occupied by specific mitotic phase" }
        ]
      };
    }
    if (mId === 10 || t.includes("sexual reproduction") || t.includes("meiosis") || t.includes("punnett")) {
      return {
        problem: `In pea plants, tall stem ($T$) is dominant over dwarf stem ($t$), and yellow seeds ($Y$) are dominant over green seeds ($y$). In a dihybrid test cross between two heterozygous plants ($TtYy \\times TtYy$), calculate the theoretical probability of producing an offspring that is both dwarf and green ($ttyy$), and determine the expected number of tall yellow plants in a harvest of $640$ seeds.`,
        given: "\\text{Genotypes: } TtYy \\times TtYy, \\quad \\text{Total Seeds} = 640",
        steps: [
          "1. Apply Mendelian Law of Independent Assortment to determine individual probabilities: $P(tt) = \\frac{1}{4}$, $P(yy) = \\frac{1}{4}$.",
          "2. Multiply independent probabilities for homozygous recessive: $P(ttyy) = \\frac{1}{4} \\times \\frac{1}{4} = \\frac{1}{16} = 0.0625$ ($6.25\\%$).",
          "3. Determine probability of dominant phenotype ($T\\_Y\\_$): $P(T\\_) = \\frac{3}{4}$, $P(Y\\_) = \\frac{3}{4} \\implies P(T\\_Y\\_) = \\frac{3}{4} \\times \\frac{3}{4} = \\frac{9}{16}$.",
          "4. Compute expected count of tall yellow offspring: $N = \\frac{9}{16} \\times 640 = 9 \\times 40 = 360$ plants."
        ],
        answer: "P(ttyy) = \\frac{1}{16} \\ (6.25\\%), \\quad N(T\\_Y\\_) = 360 \\text{ plants}",
        parameters: [
          { sym: "P", name: "Genotypic Probability", unit: "\\text{ratio}", desc: "Statistical likelihood of inherited allele combination" },
          { sym: "N", name: "Expected Offspring", unit: "\\text{individuals}", desc: "Anticipated phenotypic progeny count" }
        ]
      };
    }
    if (mId === 12 || t.includes("biotechnology") || t.includes("electrophoresis")) {
      return {
        problem: `In an agarose gel electrophoresis experiment running at $100\\text{ V}$ for $45\\text{ minutes}$, DNA fragments migrate toward the positive anode inversely proportional to the logarithm of their molecular size: $D = -m \\log_{10}(\\text{bp}) + b$. A DNA molecular ladder gives migration distances of $D_1 = 30.0\\text{ mm}$ for $2,000\\text{ bp}$ and $D_2 = 60.0\\text{ mm}$ for $200\\text{ bp}$. Calculate the size of an unknown restriction fragment that migrated $45.0\\text{ mm}$.`,
        given: "D_1 = 30.0\\text{ mm} \\ (2,000\\text{ bp}), \\quad D_2 = 60.0\\text{ mm} \\ (200\\text{ bp}), \\quad D_x = 45.0\\text{ mm}",
        steps: [
          "1. Compute log sizes: $\\log_{10}(2,000) = 3.301$, $\\log_{10}(200) = 2.301$.",
          "2. Calculate slope $m$: $m = \\frac{\\Delta D}{\\Delta \\log(\\text{bp})} = \\frac{60.0 - 30.0}{2.301 - 3.301} = \\frac{30.0}{-1.000} = -30.0\\text{ mm/decade}$.",
          "3. Since $D_x = 45.0\\text{ mm}$ is exactly halfway between $30.0\\text{ mm}$ and $60.0\\text{ mm}$, $\\log_{10}(\\text{bp}_x)$ is halfway between $3.301$ and $2.301$: $\\log_{10}(\\text{bp}_x) = 2.801$.",
          "4. Compute unknown fragment size: $\\text{bp}_x = 10^{2.801} \\approx 632\\text{ base pairs}$."
        ],
        answer: "\\text{Fragment Size} \\approx 632\\text{ bp} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "D", name: "Migration Distance", unit: "\\text{mm}", desc: "Linear distance traveled through agarose matrix" },
          { sym: "\\text{bp}", name: "Base Pairs", unit: "\\text{bp}", desc: "Length of double-stranded DNA fragment" }
        ]
      };
    }
    if (mId === 14 || t.includes("evolution") || t.includes("hardy")) {
      return {
        problem: `In a diploid population under Hardy-Weinberg equilibrium, a recessive phenotype occurs with frequency $q^2 = 0.04$ ($4\\%$). Calculate the frequency of the recessive allele ($q$), the dominant allele ($p$), and the percentage of heterozygous carriers ($2pq$).`,
        given: "q^2 = 0.04, \\quad p + q = 1, \\quad p^2 + 2pq + q^2 = 1",
        steps: [
          "1. Calculate recessive allele frequency: $q = \\sqrt{q^2} = \\sqrt{0.04} = 0.20$.",
          "2. Calculate dominant allele frequency: $p = 1 - q = 1 - 0.20 = 0.80$.",
          "3. Compute heterozygous carrier frequency: $2pq = 2(0.80)(0.20) = 0.32$ ($32\\%$).",
          "4. Verify population equilibrium: $p^2 + 2pq + q^2 = 0.64 + 0.32 + 0.04 = 1.00$ ($100\\%$)."
        ],
        answer: "p = 0.80, \\quad q = 0.20, \\quad 2pq = 32\\% \\text{ carriers}",
        parameters: [
          { sym: "p, q", name: "Allele Frequencies", unit: "\\text{decimal}", desc: "Relative frequencies of dominant and recessive alleles" },
          { sym: "2pq", name: "Heterozygous Frequency", unit: "\\text{proportion}", desc: "Frequency of carrier genotypes in population" }
        ]
      };
    }
    if (mId === 23 || t.includes("nervous") || t.includes("action potential")) {
      return {
        problem: `In a mammalian neuron at $37.0^\\circ\\text{C}$ ($310.15\\text{ K}$), intracellular potassium concentration is $[\\text{K}^+]_{\\text{in}} = 140.0\\text{ mM}$ while extracellular concentration is $[\\text{K}^+]_{\\text{out}} = 5.0\\text{ mM}$. Using the Nernst Equation $E_{\\text{K}} = \\frac{R T}{z F} \\ln\\left(\\frac{[\\text{K}^+]_{\\text{out}}}{[\\text{K}^+]_{\\text{in}}}\\right)$, calculate the equilibrium potential for potassium ($E_{\\text{K}}$) in millivolts. ($R = 8.314\\text{ J/(mol}\\cdot\\text{K)}, F = 96,485\\text{ C/mol}, z = +1$).`,
        given: "[\\text{K}^+]_{\\text{in}} = 140.0\\text{ mM}, \\quad [\\text{K}^+]_{\\text{out}} = 5.0\\text{ mM}, \\quad T = 310.15\\text{ K}, \\quad z = +1",
        steps: [
          "1. State the Nernst potential equation at $37^\\circ\\text{C}$: $E = 61.5\\text{ mV} \\times \\log_{10}\\left(\\frac{[\\text{K}^+]_{\\text{out}}}{[\\text{K}^+]_{\\text{in}}}\\right)$.",
          "2. Calculate concentration ratio: $\\frac{[\\text{K}^+]_{\\text{out}}}{[\\text{K}^+]_{\\text{in}}} = \\frac{5.0\\text{ mM}}{140.0\\text{ mM}} \\approx 0.03571$.",
          "3. Compute logarithm: $\\log_{10}(0.03571) = -1.447$.",
          "4. Compute resting potassium equilibrium potential: $E_{\\text{K}} = 61.5\\text{ mV} \\times (-1.447) \\approx -89.0\\text{ mV}$."
        ],
        answer: "E_{\\text{K}} = -89.0\\text{ mV} \\quad (\\text{Hyperpolarized Resting Potential})",
        parameters: [
          { sym: "E_{\\text{K}}", name: "Nernst Potential", unit: "\\text{mV}", desc: "Electrical potential balancing chemical concentration gradient" },
          { sym: "[\\text{K}^+]", name: "Ion Concentration", unit: "\\text{mM}", desc: "Potassium concentration inside/outside membrane" }
        ]
      };
    }
    if (mId === 24 || t.includes("circulatory") || t.includes("cardiac")) {
      return {
        problem: `A high school athlete during peak aerobic exercise has a measured heart rate of $\\text{HR} = 160\\text{ beats/min}$ and an echocardiogram-measured stroke volume of $\\text{SV} = 115\\text{ mL/beat}$. Calculate the athlete's total Cardiac Output ($\\text{CO}$) in liters per minute ($\\text{L/min}$).`,
        given: "\\text{HR} = 160\\text{ bpm}, \\quad \\text{SV} = 115\\text{ mL/beat} = 0.115\\text{ L/beat}",
        steps: [
          "1. State the hemodynamic Cardiac Output formula: $\\text{CO} = \\text{HR} \\times \\text{SV}$.",
          "2. Substitute heart rate and stroke volume: $\\text{CO} = 160\\text{ beats/min} \\times 0.115\\text{ L/beat}$.",
          "3. Compute cardiac output: $\\text{CO} = 18.4\\text{ L/min}$.",
          "4. Compare to basal resting output: Basal cardiac output is approximately $5.0\\text{ L/min}$, representing a $3.7\\times$ perfusion increase to working skeletal muscle."
        ],
        answer: "\\text{CO} = 18.4\\text{ L/min} \\quad (\\text{Peak Exercise Hemodynamics})",
        parameters: [
          { sym: "\\text{CO}", name: "Cardiac Output", unit: "\\text{L/min}", desc: "Volume of blood pumped by heart per minute" },
          { sym: "\\text{SV}", name: "Stroke Volume", unit: "\\text{mL/beat}", desc: "Volume ejected by left ventricle per contraction" }
        ]
      };
    }
    return {
      problem: `A double-stranded DNA segment contains $1,500$ base pairs ($3,000$ total nucleotides). If biochemical analysis indicates that $32\\%$ of the nitrogenous bases are Adenine (A), determine the exact number of Adenine, Thymine, Guanine, and Cytosine nucleotides present.`,
      given: "\\text{Total Base Pairs} = 1,500, \\quad \\text{Total Nucleotides} = 3,000, \\quad \\%A = 32\\%",
      steps: [
        "1. Apply Chargaff's Rule ($A = T$ and $G = C$): $\%T = \%A = 32\%$.",
        "2. Calculate total A + T percentage: $32\% + 32\% = 64\%$.",
        "3. Determine remaining G + C percentage: $100\% - 64\% = 36\\%$, so $\%G = \%C = 18\%$.",
        "4. Calculate counts: $N_A = N_T = 0.32 \\times 3,000 = 960$ nt; $N_G = N_C = 0.18 \\times 3,000 = 540$ nt."
      ],
      answer: "N_A = 960, \\quad N_T = 960, \\quad N_G = 540, \\quad N_C = 540",
      parameters: [
        { sym: "N", name: "Nucleotide Count", unit: "\\text{nucleotides}", desc: "Number of discrete base subunits" }
      ]
    };
  }

  if (code === "PHYS") {
    if (mId === 7 || t.includes("gravit") || t.includes("orbit")) {
      return {
        problem: `Calculate the gravitational force of attraction between Earth (mass $M_E = 5.972 \\times 10^{24}\\text{ kg}$) and a communications satellite of mass $m = 1,200\\text{ kg}$ in geosynchronous orbit at radius $r = 4.22 \\times 10^7\\text{ m}$ from Earth's center. ($G = 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$).`,
        given: "M_E = 5.972 \\times 10^{24}\\text{ kg}, \\quad m = 1,200\\text{ kg}, \\quad r = 4.22 \\times 10^7\\text{ m}, \\quad G = 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2",
        steps: [
          "1. Apply Newton's Law of Universal Gravitation: $F_g = G \\frac{M_E m}{r^2}$.",
          "2. Calculate numerator ($G M_E m$): $(6.674 \\times 10^{-11})(5.972 \\times 10^{24})(1,200) = 4.783 \\times 10^{17}\\text{ N}\\cdot\\text{m}^2$.",
          "3. Square the orbital separation radius: $r^2 = (4.22 \\times 10^7\\text{ m})^2 = 1.781 \\times 10^{15}\\text{ m}^2$.",
          "4. Compute gravitational attraction: $F_g = \\frac{4.783 \\times 10^{17}}{1.781 \\times 10^{15}} \\approx 268.6\\text{ N}$."
        ],
        answer: "F_g = 269\\text{ N} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "F_g", name: "Gravitational Force", unit: "\\text{N}", desc: "Mutual attraction between massive bodies" },
          { sym: "r", name: "Orbital Radius", unit: "\\text{m}", desc: "Center-to-center celestial separation" }
        ]
      };
    }
    if (mId === 9 || t.includes("momentum") || t.includes("collision")) {
      return {
        problem: `A railroad freight car of mass $m_1 = 15,000\\text{ kg}$ traveling along a straight track at $v_1 = 3.00\\text{ m/s}$ collides and couples with a stationary freight car of mass $m_2 = 10,000\\text{ kg}$ ($v_2 = 0\\text{ m/s}$). Assuming an isolated system with negligible track friction, calculate the common final velocity ($v_f$) of the coupled cars and the mechanical kinetic energy lost in the inelastic collision.`,
        given: "m_1 = 15,000\\text{ kg}, \\quad v_1 = 3.00\\text{ m/s}, \\quad m_2 = 10,000\\text{ kg}, \\quad v_2 = 0\\text{ m/s}",
        steps: [
          "1. Apply the Law of Conservation of Linear Momentum: $p_i = p_f \\implies m_1 v_1 + m_2 v_2 = (m_1 + m_2) v_f$.",
          "2. Substitute momentum values: $(15,000)(3.00) + 0 = (15,000 + 10,000) v_f \\implies 45,000 = 25,000 v_f$.",
          "3. Solve for combined velocity: $v_f = \\frac{45,000}{25,000} = 1.80\\text{ m/s}$.",
          "4. Compute initial and final kinetic energies: $KE_i = \\frac{1}{2}(15,000)(3.00)^2 = 67,500\\text{ J}$; $KE_f = \\frac{1}{2}(25,000)(1.80)^2 = 40,500\\text{ J}$. Kinetic energy dissipated $= 27,000\\text{ J}$."
        ],
        answer: "v_f = 1.80\\text{ m/s}, \\quad \\Delta KE = -27.0\\text{ kJ}",
        parameters: [
          { sym: "p", name: "Linear Momentum", unit: "\\text{kg}\\cdot\\text{m/s}", desc: "Product of inertial mass and vector velocity" },
          { sym: "v_f", name: "Coupled Velocity", unit: "\\text{m/s}", desc: "Post-collision system velocity" }
        ]
      };
    }
    if (mId === 10 || t.includes("energy and its conservation") || t.includes("work-energy")) {
      return {
        problem: `A roller coaster cart of mass $m = 450\\text{ kg}$ starts from rest at the summit of a hill at height $h = 35.0\\text{ m}$ above the track base ($g = 9.80\\text{ m/s}^2$). Neglecting frictional resistance, use the Law of Conservation of Mechanical Energy to calculate the velocity ($v$) of the cart at the bottom of the hill ($h = 0\\text{ m}$).`,
        given: "m = 450\\text{ kg}, \\quad v_0 = 0\\text{ m/s}, \\quad h = 35.0\\text{ m}, \\quad g = 9.80\\text{ m/s}^2",
        steps: [
          "1. State Conservation of Mechanical Energy: $E_{\\text{initial}} = E_{\\text{final}} \\implies m g h + \\frac{1}{2} m v_0^2 = 0 + \\frac{1}{2} m v^2$.",
          "2. Cancel mass $m$ from both terms: $g h = \\frac{1}{2} v^2$.",
          "3. Isolate final velocity: $v = \\sqrt{2 g h}$.",
          "4. Substitute parameters and evaluate: $v = \\sqrt{2 \\times 9.80\\text{ m/s}^2 \\times 35.0\\text{ m}} = \\sqrt{686.0} \\approx 26.2\\text{ m/s}$."
        ],
        answer: "v = 26.2\\text{ m/s} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "E", name: "Mechanical Energy", unit: "\\text{J}", desc: "Total sum of kinetic and potential energies" },
          { sym: "v", name: "Velocity", unit: "\\text{m/s}", desc: "Speed of cart at ground datum" }
        ]
      };
    }
    if (mId === 11 || t.includes("thermal energy") || t.includes("thermodynamic")) {
      return {
        problem: `How much thermal energy ($Q$) is required to completely melt an ice cube of mass $m = 0.250\\text{ kg}$ at $0.0^\\circ\\text{C}$ and subsequently warm the resulting liquid water to $40.0^\\circ\\text{C}$? Given the latent heat of fusion of ice $L_f = 3.34 \\times 10^5\\text{ J/kg}$ and specific heat of water $c = 4,186\\text{ J/(kg}\\cdot\\text{K)}$.`,
        given: "m = 0.250\\text{ kg}, \\quad L_f = 3.34 \\times 10^5\\text{ J/kg}, \\quad c = 4,186\\text{ J/(kg}\\cdot\\text{K)}, \\quad \\Delta T = 40.0^\\circ\\text{C}",
        steps: [
          "1. Calculate latent heat required for solid-to-liquid phase transition: $Q_1 = m L_f = (0.250\\text{ kg})(3.34 \\times 10^5\\text{ J/kg}) = 83,500\\text{ J}$.",
          "2. Calculate sensible heat required to warm liquid: $Q_2 = m c \\Delta T = (0.250\\text{ kg})(4,186\\text{ J/kg}\\cdot\\text{K})(40.0\\text{ K}) = 41,860\\text{ J}$.",
          "3. Sum thermal energy inputs: $Q_{\\text{total}} = Q_1 + Q_2 = 83,500\\text{ J} + 41,860\\text{ J} = 125,360\\text{ J}$.",
          "4. Express result in kilojoules: $Q_{\\text{total}} \\approx 125.4\\text{ kJ}$."
        ],
        answer: "Q_{\\text{total}} = 125.4\\text{ kJ} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "Q", name: "Heat Energy", unit: "\\text{kJ}", desc: "Total thermal energy added to system" },
          { sym: "L_f", name: "Latent Heat of Fusion", unit: "\\text{J/kg}", desc: "Enthalpy of phase change at constant temperature" }
        ]
      };
    }
    if (mId === 12 || t.includes("states of matter") || t.includes("fluid") || t.includes("buoyan")) {
      return {
        problem: `A research submarine descends into seawater of density $\\rho = 1,025\\text{ kg/m}^3$ to a depth of $h = 250.0\\text{ m}$. Atmospheric pressure at the surface is $P_0 = 101.3\\text{ kPa}$ ($g = 9.80\\text{ m/s}^2$). Calculate the hydrostatic gauge pressure ($P_g$) and the absolute total pressure ($P_{\\text{total}}$) exerted on the hull.`,
        given: "\\rho = 1,025\\text{ kg/m}^3, \\quad h = 250.0\\text{ m}, \\quad g = 9.80\\text{ m/s}^2, \\quad P_0 = 101.3\\text{ kPa}",
        steps: [
          "1. State hydrostatic fluid pressure equation: $P_g = \\rho g h$.",
          "2. Compute gauge pressure: $P_g = (1,025\\text{ kg/m}^3)(9.80\\text{ m/s}^2)(250.0\\text{ m}) = 2,511,250\\text{ Pa} = 2,511.3\\text{ kPa} \\approx 2.51\\text{ MPa}$.",
          "3. State total absolute pressure: $P_{\\text{total}} = P_0 + P_g$.",
          "4. Compute absolute pressure: $P_{\\text{total}} = 101.3\\text{ kPa} + 2,511.3\\text{ kPa} = 2,612.6\\text{ kPa} \\approx 25.8\\text{ atm}$."
        ],
        answer: "P_g = 2.51\\text{ MPa}, \\quad P_{\\text{total}} = 2.61\\text{ MPa} \\quad (25.8\\text{ atm})",
        parameters: [
          { sym: "P_g", name: "Gauge Pressure", unit: "\\text{MPa}", desc: "Hydrostatic pressure from fluid column weight" },
          { sym: "h", name: "Submersion Depth", unit: "\\text{m}", desc: "Vertical distance below fluid surface" }
        ]
      };
    }
    if (mId === 13 || t.includes("vibrat") || t.includes("wave") || t.includes("sound")) {
      return {
        problem: `A concert tuning fork vibrating at musical pitch A4 ($f = 440.0\\text{ Hz}$) generates a longitudinal sound wave propagating through ambient air at temperature $20^\\circ\\text{C}$ with a speed of $v = 343.2\\text{ m/s}$. Calculate the physical wavelength ($\\lambda$) of the acoustic compression waves.`,
        given: "f = 440.0\\text{ Hz}, \\quad v = 343.2\\text{ m/s}",
        steps: [
          "1. State the universal wave equation: $v = f \\lambda$.",
          "2. Isolate wavelength: $\\lambda = \\frac{v}{f}$.",
          "3. Substitute wave speed and frequency: $\\lambda = \\frac{343.2\\text{ m/s}}{440.0\\text{ s}^{-1}}$.",
          "4. Compute wavelength: $\\lambda = 0.780\\text{ m} = 78.0\\text{ cm}$."
        ],
        answer: "\\lambda = 0.780\\text{ m} \\quad (78.0\\text{ cm})",
        parameters: [
          { sym: "\\lambda", name: "Wavelength", unit: "\\text{m}", desc: "Spatial period between consecutive wave crests" },
          { sym: "f", name: "Wave Frequency", unit: "\\text{Hz}", desc: "Number of oscillations per second" },
          { sym: "v", name: "Propagation Speed", unit: "\\text{m/s}", desc: "Velocity of phase transmission through medium" }
        ]
      };
    }
    if (mId === 15 || t.includes("light") || t.includes("optics") || t.includes("refract")) {
      return {
        problem: `A monochromatic laser beam traveling through vacuum ($c = 3.00 \\times 10^8\\text{ m/s}$) enters a transparent optical prism composed of dense flint glass having an index of refraction $n = 1.66$. Calculate the velocity of light in the glass ($v$) and determine the wavelength in the glass if its vacuum wavelength is $\\lambda_0 = 589\\text{ nm}$.`,
        given: "c = 3.00 \\times 10^8\\text{ m/s}, \\quad n = 1.66, \\quad \\lambda_0 = 589\\text{ nm}",
        steps: [
          "1. State definition of refractive index: $n = \\frac{c}{v} \\implies v = \\frac{c}{n}$.",
          "2. Calculate speed of light in dielectric medium: $v = \\frac{3.00 \\times 10^8\\text{ m/s}}{1.66} = 1.807 \\times 10^8\\text{ m/s}$.",
          "3. Relate refracted wavelength to refractive index: $\\lambda = \\frac{\\lambda_0}{n}$.",
          "4. Compute refracted wavelength: $\\lambda = \\frac{589\\text{ nm}}{1.66} = 354.8\\text{ nm}$."
        ],
        answer: "v = 1.81 \\times 10^8\\text{ m/s}, \\quad \\lambda = 355\\text{ nm}",
        parameters: [
          { sym: "v", name: "Phase Velocity", unit: "\\text{m/s}", desc: "Speed of electromagnetic wave in dielectric medium" },
          { sym: "n", name: "Refractive Index", unit: "\\text{dimensionless}", desc: "Optical density ratio c / v" }
        ]
      };
    }
    if (mId === 17 || t.includes("interfer") || t.includes("diffract")) {
      return {
        problem: `In a Young's Double-Slit experiment, coherent red laser light ($\\lambda = 632.8\\text{ nm} = 6.328 \\times 10^{-7}\\text{ m}$) illuminates two narrow slits separated by $d = 0.200\\text{ mm} = 2.00 \\times 10^{-4}\\text{ m}$. The resulting interference pattern is projected onto an observation screen placed at a distance $L = 2.50\\text{ m}$. Calculate the linear distance ($y_1$) from the central bright maximum ($m = 0$) to the first-order bright fringe ($m = 1$).`,
        given: "\\lambda = 6.328 \\times 10^{-7}\\text{ m}, \\quad d = 2.00 \\times 10^{-4}\\text{ m}, \\quad L = 2.50\\text{ m}, \\quad m = 1",
        steps: [
          "1. State the double-slit constructive interference condition: $d \\sin\\theta = m \\lambda$.",
          "2. Apply small-angle approximation ($\\sin\\theta \\approx \\tan\\theta = \\frac{y}{L}$): $\\frac{d y}{L} = m \\lambda$.",
          "3. Isolate fringe displacement: $y = \\frac{m \\lambda L}{d}$.",
          "4. Substitute experimental values: $y_1 = \\frac{(1)(6.328 \\times 10^{-7}\\text{ m})(2.50\\text{ m})}{2.00 \\times 10^{-4}\\text{ m}} = \\frac{1.582 \\times 10^{-6}}{2.00 \\times 10^{-4}} = 7.91 \\times 10^{-3}\\text{ m} = 7.91\\text{ mm}$."
        ],
        answer: "y_1 = 7.91\\text{ mm} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "y", name: "Fringe Separation", unit: "\\text{mm}", desc: "Linear distance from center to interference maximum" },
          { sym: "d", name: "Slit Separation", unit: "\\text{m}", desc: "Center-to-center distance between aperture slits" },
          { sym: "L", name: "Screen Distance", unit: "\\text{m}", desc: "Optical throw distance to viewing screen" }
        ]
      };
    }
    if (mId === 18 || t.includes("electrostat") || t.includes("coulomb")) {
      return {
        problem: `Two identical conducting spheres carry static electric charges of $q_1 = +2.50\\ \\mu\\text{C} = +2.50 \\times 10^{-6}\\text{ C}$ and $q_2 = -4.00\\ \\mu\\text{C} = -4.00 \\times 10^{-6}\\text{ C}$ and are held fixed at a distance of $r = 0.500\\text{ m}$ apart in air ($k_e = 8.988 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2$). Calculate the electrostatic force ($F_e$) between them, and determine whether it is attractive or repulsive.`,
        given: "q_1 = 2.50 \\times 10^{-6}\\text{ C}, \\quad q_2 = -4.00 \\times 10^{-6}\\text{ C}, \\quad r = 0.500\\text{ m}, \\quad k_e = 8.988 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2",
        steps: [
          "1. State Coulomb's Law of Electrostatic Force: $F_e = k_e \\frac{|q_1 q_2|}{r^2}$.",
          "2. Calculate product of charges: $|q_1 q_2| = (2.50 \\times 10^{-6})(4.00 \\times 10^{-6}) = 1.00 \\times 10^{-11}\\text{ C}^2$.",
          "3. Square separation distance: $r^2 = (0.500\\text{ m})^2 = 0.250\\text{ m}^2$.",
          "4. Compute force magnitude and nature: $F_e = (8.988 \\times 10^9) \\frac{1.00 \\times 10^{-11}}{0.250} = \\frac{0.08988}{0.250} \\approx 0.360\\text{ N}$. Since charges have opposite signs, the force is attractive."
        ],
        answer: "F_e = 0.360\\text{ N} \\quad (\\text{Attractive Force})",
        parameters: [
          { sym: "F_e", name: "Electrostatic Force", unit: "\\text{N}", desc: "Coulombic interaction between electric charges" },
          { sym: "q", name: "Electric Charge", unit: "\\text{C}", desc: "Quantity of electrostatic charge" }
        ]
      };
    }
    if (mId === 21 || t.includes("electromagnet") || t.includes("magnet") || t.includes("induction")) {
      return {
        problem: `A proton ($q = +1.602 \\times 10^{-19}\\text{ C}$) travels at speed $v = 5.00 \\times 10^6\\text{ m/s}$ horizontally into a uniform magnetic field of $B = 0.400\\text{ T}$ oriented vertically upward (perpendicular to motion, $\\theta = 90^\\circ$). Calculate the magnitude of the deflecting magnetic Lorentz force ($F_B$) and the resulting circular orbital radius ($m_p = 1.673 \\times 10^{-27}\\text{ kg}$).`,
        given: "q = 1.602 \\times 10^{-19}\\text{ C}, \\quad v = 5.00 \\times 10^6\\text{ m/s}, \\quad B = 0.400\\text{ T}, \\quad m_p = 1.673 \\times 10^{-27}\\text{ kg}",
        steps: [
          "1. State Lorentz magnetic force on charged particle: $F_B = q v B \\sin\\theta$.",
          "2. Substitute values (with $\\sin 90^\\circ = 1$): $F_B = (1.602 \\times 10^{-19}\\text{ C})(5.00 \\times 10^6\\text{ m/s})(0.400\\text{ T}) = 3.204 \\times 10^{-13}\\text{ N}$.",
          "3. Equate magnetic force to centripetal force: $q v B = \\frac{m v^2}{r} \\implies r = \\frac{m v}{q B}$.",
          "4. Compute cyclotron radius: $r = \\frac{(1.673 \\times 10^{-27})(5.00 \\times 10^6)}{(1.602 \\times 10^{-19})(0.400)} = \\frac{8.365 \\times 10^{-21}}{6.408 \\times 10^{-20}} \\approx 0.1305\\text{ m} = 13.1\\text{ cm}$."
        ],
        answer: "F_B = 3.20 \\times 10^{-13}\\text{ N}, \\quad r = 13.1\\text{ cm}",
        parameters: [
          { sym: "F_B", name: "Magnetic Force", unit: "\\text{N}", desc: "Lorentz deflection force acting on moving charge" },
          { sym: "B", name: "Magnetic Flux Density", unit: "\\text{T}", desc: "Magnetic field intensity" },
          { sym: "r", name: "Cyclotron Radius", unit: "\\text{m}", desc: "Radius of circular trajectory in uniform magnetic field" }
        ]
      };
    }
    if (mId === 23 || t.includes("solid-state") || t.includes("semiconductor")) {
      return {
        problem: `A gallium arsenide phosphide (GaAsP) light-emitting diode (LED) emits monochromatic red photons at peak wavelength $\\lambda = 650.0\\text{ nm} = 6.500 \\times 10^{-7}\\text{ m}$. Using Planck's equation $E = \\frac{h c}{\\lambda}$, calculate the photon energy and the semiconductor band gap energy ($E_g$) in electron-volts ($\\text{eV}$). ($h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}, c = 3.00 \\times 10^8\\text{ m/s}, 1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$).`,
        given: "\\lambda = 6.500 \\times 10^{-7}\\text{ m}, \\quad h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}, \\quad c = 3.00 \\times 10^8\\text{ m/s}, \\quad 1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}",
        steps: [
          "1. State photon energy formulation: $E = \\frac{h c}{\\lambda}$.",
          "2. Calculate numerator ($h c$): $(6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s})(3.00 \\times 10^8\\text{ m/s}) = 1.9878 \\times 10^{-18}\\text{ J}\\cdot\\text{m}$.",
          "3. Compute energy in Joules: $E = \\frac{1.9878 \\times 10^{-18}}{6.500 \\times 10^{-7}} = 3.058 \\times 10^{-19}\\text{ J}$.",
          "4. Convert energy to electron-volts: $E_g = \\frac{3.058 \\times 10^{-19}\\text{ J}}{1.602 \\times 10^{-19}\\text{ J/eV}} \\approx 1.91\\text{ eV}$."
        ],
        answer: "E_g = 1.91\\text{ eV} \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "E_g", name: "Band Gap Energy", unit: "\\text{eV}", desc: "Energy gap between valence and conduction bands" },
          { sym: "\\lambda", name: "Emission Wavelength", unit: "\\text{nm}", desc: "Peak spectral wavelength emitted" }
        ]
      };
    }
    if (mId === 24 || t.includes("nuclear") || t.includes("particle")) {
      return {
        problem: `Calculate the total nuclear binding energy ($E_b$) and binding energy per nucleon of an alpha particle (Helium-4 nucleus, $^4_2\\text{He}$). Given: measured nuclear mass of $^4_2\\text{He} = 4.00151\\text{ u}$, proton mass $m_p = 1.00728\\text{ u}$, neutron mass $m_n = 1.00866\\text{ u}$, and atomic mass unit conversion $1\\text{ u} = 931.5\\text{ MeV}$.`,
        given: "Z = 2, \\quad N = 2, \\quad m_p = 1.00728\\text{ u}, \\quad m_n = 1.00866\\text{ u}, \\quad m_{\\text{nucleus}} = 4.00151\\text{ u}",
        steps: [
          "1. Sum constituent free nucleon masses: $m_{\\text{free}} = 2(1.00728\\text{ u}) + 2(1.00866\\text{ u}) = 2.01456 + 2.01732 = 4.03188\\text{ u}$.",
          "2. Calculate nuclear mass defect: $\\Delta m = m_{\\text{free}} - m_{\\text{nucleus}} = 4.03188\\text{ u} - 4.00151\\text{ u} = 0.03037\\text{ u}$.",
          "3. Compute total nuclear binding energy using Einstein's mass-energy equivalence: $E_b = \\Delta m \\times 931.5\\text{ MeV/u} = 0.03037 \\times 931.5 = 28.29\\text{ MeV}$.",
          "4. Compute binding energy per nucleon ($A = 4$): $\\frac{E_b}{A} = \\frac{28.29\\text{ MeV}}{4} \\approx 7.07\\text{ MeV/nucleon}$."
        ],
        answer: "E_b = 28.3\\text{ MeV}, \\quad \\frac{E_b}{A} = 7.07\\text{ MeV/nucleon}",
        parameters: [
          { sym: "E_b", name: "Nuclear Binding Energy", unit: "\\text{MeV}", desc: "Energy required to completely dissociate nucleus into nucleons" },
          { sym: "\\Delta m", name: "Mass Defect", unit: "\\text{u}", desc: "Difference between constituent nucleons and bonded nucleus mass" }
        ]
      };
    }
    if (mId === 6 || t.includes("projectile") || t.includes("two dimensions")) {
      return {
        problem: `A soccer ball is kicked from ground level with an initial velocity of $v_0 = 22.0\\text{ m/s}$ at an launch angle of $\\theta = 35.0^\\circ$ above the horizontal across a level playing field ($g = 9.80\\text{ m/s}^2$). Neglecting air resistance, calculate the maximum apex height ($H$) reached by the ball and the total horizontal range ($R$).`,
        given: "v_0 = 22.0\\text{ m/s}, \\quad \\theta = 35.0^\\circ, \\quad g = 9.80\\text{ m/s}^2",
        steps: [
          "1. Resolve initial velocity components: $v_{0x} = v_0 \\cos(35^\\circ) = 22.0 \\times 0.8192 = 18.02\\text{ m/s}$; $v_{0y} = v_0 \\sin(35^\\circ) = 22.0 \\times 0.5736 = 12.62\\text{ m/s}$.",
          "2. Calculate maximum apex height: $H = \\frac{v_{0y}^2}{2g} = \\frac{(12.62)^2}{2 \\times 9.80} = \\frac{159.26}{19.60} = 8.13\\text{ m}$.",
          "3. Calculate total flight duration to ground: $t = \\frac{2 v_{0y}}{g} = \\frac{2 \\times 12.62}{9.80} = 2.576\\text{ s}$.",
          "4. Compute horizontal range: $R = v_{0x} \\times t = 18.02\\text{ m/s} \\times 2.576\\text{ s} = 46.4\\text{ m}$."
        ],
        answer: "H = 8.13\\text{ m}, \\quad R = 46.4\\text{ m}",
        parameters: [
          { sym: "H", name: "Peak Height", unit: "\\text{m}", desc: "Maximum vertical altitude attained" },
          { sym: "R", name: "Horizontal Range", unit: "\\text{m}", desc: "Total displacement along horizontal ground axis" },
          { sym: "v_0", name: "Muzzle Velocity", unit: "\\text{m/s}", desc: "Initial launch speed" }
        ]
      };
    }
    if (mId === 8 || t.includes("rotational") || t.includes("torque") || t.includes("centripetal")) {
      return {
        problem: `A $1,200\\text{ kg}$ automobile rounds an unbanked circular curve of radius $r = 65.0\\text{ m}$ on a dry asphalt roadway. The coefficient of static friction between the rubber tires and the pavement is $\\mu_s = 0.750$ ($g = 9.80\\text{ m/s}^2$). Calculate the maximum safe speed ($v_{\\max}$) the car can maintain without skidding off the curve.`,
        given: "m = 1,200\\text{ kg}, \\quad r = 65.0\\text{ m}, \\quad \\mu_s = 0.750, \\quad g = 9.80\\text{ m/s}^2",
        steps: [
          "1. Equate maximum static frictional force to required centripetal force: $f_{s,\\max} = F_c \\implies \\mu_s m g = \\frac{m v_{\\max}^2}{r}$.",
          "2. Cancel vehicle mass $m$ from both sides: $\\mu_s g = \\frac{v_{\\max}^2}{r}$.",
          "3. Isolate maximum cornering velocity: $v_{\\max} = \\sqrt{\\mu_s g r}$.",
          "4. Substitute parameters and evaluate: $v_{\\max} = \\sqrt{0.750 \\times 9.80\\text{ m/s}^2 \\times 65.0\\text{ m}} = \\sqrt{477.75} \\approx 21.9\\text{ m/s}$ ($78.8\\text{ km/h}$)."
        ],
        answer: "v_{\\max} = 21.9\\text{ m/s} \\quad (78.8\\text{ km/h})",
        parameters: [
          { sym: "v_{\\max}", name: "Maximum Speed", unit: "\\text{m/s}", desc: "Upper velocity limit before loss of traction" },
          { sym: "r", name: "Curve Radius", unit: "\\text{m}", desc: "Radius of circular curvature" },
          { sym: "\\mu_s", name: "Static Friction Coefficient", unit: "\\text{dimensionless}", desc: "Pavement tire adhesion index" }
        ]
      };
    }
    if (mId === 14 || t.includes("sound") || t.includes("doppler")) {
      return {
        problem: `An emergency ambulance siren emits an acoustic frequency of $f = 650.0\\text{ Hz}$ as it drives at $v_s = 30.0\\text{ m/s}$ toward a stationary pedestrian bystander ($v_o = 0\\text{ m/s}$). The ambient speed of sound in air is $v = 343.0\\text{ m/s}$. Using the Doppler Effect formula $f' = f \\left(\\frac{v}{v - v_s}\\right)$, calculate the observed pitch frequency ($f'$) heard as the ambulance approaches.`,
        given: "f = 650.0\\text{ Hz}, \\quad v = 343.0\\text{ m/s}, \\quad v_s = 30.0\\text{ m/s}, \\quad v_o = 0\\text{ m/s}",
        steps: [
          "1. State the Doppler shift equation for an approaching source: $f' = f \\left(\\frac{v}{v - v_s}\\right)$.",
          "2. Compute denominator: $v - v_s = 343.0\\text{ m/s} - 30.0\\text{ m/s} = 313.0\\text{ m/s}$.",
          "3. Calculate frequency multiplier ratio: $\\frac{343.0}{313.0} \\approx 1.0958$.",
          "4. Compute shifted frequency: $f' = 650.0\\text{ Hz} \\times 1.0958 = 712.3\\text{ Hz}$ (Higher acoustic pitch)."
        ],
        answer: "f' = 712.3\\text{ Hz} \\quad (\\text{Approaching Doppler Shift})",
        parameters: [
          { sym: "f'", name: "Observed Frequency", unit: "\\text{Hz}", desc: "Shifted frequency perceived by listener" },
          { sym: "f", name: "Source Frequency", unit: "\\text{Hz}", desc: "True emitted acoustic frequency" },
          { sym: "v_s", name: "Source Velocity", unit: "\\text{m/s}", desc: "Velocity of approaching sound emitter" }
        ]
      };
    }
    if (mId === 16 || t.includes("mirrors") || t.includes("lenses") || t.includes("thin lens")) {
      return {
        problem: `An object of height $h_o = 4.00\\text{ cm}$ is placed at a distance of $d_o = 30.0\\text{ cm}$ in front of a thin converging (convex) lens with focal length $f = +10.0\\text{ cm}$. Calculate the image distance ($d_i$), the optical magnification ($m$), and the image height ($h_i$), and determine whether the image is real or virtual.`,
        given: "f = +10.0\\text{ cm}, \\quad d_o = 30.0\\text{ cm}, \\quad h_o = 4.00\\text{ cm}",
        steps: [
          "1. State Thin Lens equation: $\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\implies \\frac{1}{d_i} = \\frac{1}{f} - \\frac{1}{d_o}$.",
          "2. Substitute focal length and object distance: $\\frac{1}{d_i} = \\frac{1}{10.0} - \\frac{1}{30.0} = \\frac{3 - 1}{30.0} = \\frac{2}{30.0} = \\frac{1}{15.0}$.",
          "3. Solve for image distance: $d_i = +15.0\\text{ cm}$. Since $d_i > 0$, the image is real and inverted on opposite side of lens.",
          "4. Calculate magnification and height: $m = -\\frac{d_i}{d_o} = -\\frac{15.0}{30.0} = -0.500$; $h_i = m \\times h_o = -0.500 \\times 4.00 = -2.00\\text{ cm}$."
        ],
        answer: "d_i = +15.0\\text{ cm}, \\quad m = -0.500, \\quad h_i = -2.00\\text{ cm} \\quad (\\text{Real, Inverted})",
        parameters: [
          { sym: "d_i", name: "Image Distance", unit: "\\text{cm}", desc: "Linear distance from lens center to focused image" },
          { sym: "m", name: "Magnification", unit: "\\text{dimensionless}", desc: "Ratio of image height to object height" }
        ]
      };
    }
    if (mId === 22 || t.includes("photoelectric") || t.includes("quantum")) {
      return {
        problem: `Ultraviolet photons of wavelength $\\lambda = 240.0\\text{ nm} = 2.400 \\times 10^{-7}\\text{ m}$ strike a clean cesium metal target having a work function of $\\Phi = 2.14\\text{ eV}$ in a vacuum phototube. Given Planck's constant $h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$, $c = 3.00 \\times 10^8\\text{ m/s}$, and $1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$, calculate the incident photon energy in $\\text{eV}$ and the maximum kinetic energy ($K_{\\max}$) of the ejected photoelectrons.`,
        given: "\\lambda = 2.400 \\times 10^{-7}\\text{ m}, \\quad \\Phi = 2.14\\text{ eV}, \\quad h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}",
        steps: [
          "1. Calculate incident photon energy in Joules: $E_{\\text{photon}} = \\frac{h c}{\\lambda} = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{2.400 \\times 10^{-7}} = 8.2825 \\times 10^{-19}\\text{ J}$.",
          "2. Convert photon energy to electron-volts: $E = \\frac{8.2825 \\times 10^{-19}\\text{ J}}{1.602 \\times 10^{-19}\\text{ J/eV}} = 5.17\\text{ eV}$.",
          "3. Apply Einstein's Photoelectric Equation: $K_{\\max} = E_{\\text{photon}} - \\Phi$.",
          "4. Compute maximum kinetic energy: $K_{\\max} = 5.17\\text{ eV} - 2.14\\text{ eV} = 3.03\\text{ eV}$ (Electrons are ejected)."
        ],
        answer: "E_{\\text{photon}} = 5.17\\text{ eV}, \\quad K_{\\max} = 3.03\\text{ eV}",
        parameters: [
          { sym: "K_{\\max}", name: "Maximum Kinetic Energy", unit: "\\text{eV}", desc: "Peak energy of photoelectrons emitted" },
          { sym: "\\Phi", name: "Work Function", unit: "\\text{eV}", desc: "Minimum binding energy binding electrons to metal surface" }
        ]
      };
    }
    if (t.includes("motion") || t.includes("kinematics") || f.includes("v =") || f.includes("v_")) {
      return {
        problem: `A vehicle accelerates uniformly from rest ($v_0 = 0\\text{ m/s}$) at a rate of $a = 4.50\\text{ m/s}^2$ along a straight track for a duration of $t = 6.00\\text{ s}$. Calculate its final velocity ($v$) and the total displacement ($\\Delta x$).`,
        given: "v_0 = 0\\text{ m/s}, \\quad a = 4.50\\text{ m/s}^2, \\quad t = 6.00\\text{ s}",
        steps: [
          "1. Calculate final velocity: $v = v_0 + at = 0 + (4.50\\text{ m/s}^2)(6.00\\text{ s}) = 27.0\\text{ m/s}$.",
          "2. State displacement kinematic equation: $\\Delta x = v_0 t + \\frac{1}{2} a t^2$.",
          "3. Substitute values: $\\Delta x = 0 + \\frac{1}{2}(4.50\\text{ m/s}^2)(6.00\\text{ s})^2$.",
          "4. Compute total displacement: $\\Delta x = 0.5 \\times 4.50 \\times 36.0 = 81.0\\text{ m}$."
        ],
        answer: "v = 27.0\\text{ m/s}, \\quad \\Delta x = 81.0\\text{ m}",
        parameters: [
          { sym: "v", name: "Velocity", unit: "\\text{m/s}", desc: "Instantaneous rate of change of position" },
          { sym: "a", name: "Acceleration", unit: "\\text{m/s}^2", desc: "Rate of change of velocity" },
          { sym: "\\Delta x", name: "Displacement", unit: "\\text{m}", desc: "Net linear position change" }
        ]
      };
    }
    if (t.includes("force") || t.includes("newton") || f.includes("f =")) {
      return {
        problem: `A $35.0\\text{ kg}$ crate is pushed along a horizontal surface by an applied force of $F_{\\text{applied}} = 165.0\\text{ N}$ against a kinetic friction force of $F_{\\text{friction}} = 60.0\\text{ N}$. Calculate the acceleration of the crate.`,
        given: "m = 35.0\\text{ kg}, \\quad F_{\\text{applied}} = 165.0\\text{ N}, \\quad F_{\\text{friction}} = 60.0\\text{ N}",
        steps: [
          "1. Determine net force along horizontal axis: $F_{\\text{net}} = F_{\\text{applied}} - F_{\\text{friction}} = 165.0\\text{ N} - 60.0\\text{ N} = 105.0\\text{ N}$.",
          "2. Apply Newton's Second Law: $F_{\\text{net}} = m a \\implies a = \\frac{F_{\\text{net}}}{m}$.",
          "3. Substitute net force and mass: $a = \\frac{105.0\\text{ N}}{35.0\\text{ kg}} = 3.00\\text{ m/s}^2$.",
          "4. State acceleration result: The crate accelerates forward at $3.00\\text{ m/s}^2$."
        ],
        answer: "a = 3.00\\text{ m/s}^2 \\quad (\\text{Curriculum Standard Reference Solution})",
        parameters: [
          { sym: "F", name: "Force", unit: "\\text{N}", desc: "Vector interaction causing mass acceleration" },
          { sym: "m", name: "Mass", unit: "\\text{kg}", desc: "Inertial resistance to acceleration" }
        ]
      };
    }
    if (t.includes("circuit") || t.includes("electric") || f.includes("v =") || f.includes("i =")) {
      return {
        problem: `A DC circuit connects a $24.0\\text{ V}$ power supply across a fixed load resistor of $R = 8.00\\ \\Omega$. Calculate the electric current ($I$) in the circuit and the electrical power ($P$) dissipated by the resistor.`,
        given: "V = 24.0\\text{ V}, \\quad R = 8.00\\ \\Omega",
        steps: [
          "1. Apply Ohm's Law: $I = \\frac{V}{R}$.",
          "2. Calculate current: $I = \\frac{24.0\\text{ V}}{8.00\\ \\Omega} = 3.00\\text{ A}$.",
          "3. Apply Joule's electrical power equation: $P = V \\times I$.",
          "4. Compute power: $P = (24.0\\text{ V}) \\times (3.00\\text{ A}) = 72.0\\text{ W}$."
        ],
        answer: "I = 3.00\\text{ A}, \\quad P = 72.0\\text{ W}",
        parameters: [
          { sym: "V", name: "Electric Potential", unit: "\\text{V}", desc: "Voltage difference across load" },
          { sym: "I", name: "Electric Current", unit: "\\text{A}", desc: "Rate of charge flow" },
          { sym: "R", name: "Resistance", unit: "\\Omega", desc: "Opposition to current flow" }
        ]
      };
    }
  }

  // Standard scientific precision & volumetric density determination
  return {
    problem: `In an empirical laboratory investigation for ${title}, a pure solid specimen of mass $m = 68.40\\text{ g}$ is immersed into a graduated cylinder containing an initial water volume of $V_1 = 45.0\\text{ mL}$. The water level rises to a final volume of $V_2 = 71.0\\text{ mL}$. Calculate the sample density ($\\rho$) in $\\text{g/cm}^3$ and determine whether the specimen will float or sink in water ($\\rho_{\\text{water}} = 1.00\\text{ g/cm}^3$).`,
    given: "m = 68.40\\text{ g}, \\quad V_1 = 45.0\\text{ mL}, \\quad V_2 = 71.0\\text{ mL}, \\quad \\rho_{\\text{water}} = 1.00\\text{ g/cm}^3",
    steps: [
      "1. Calculate volume by water displacement: $V = V_2 - V_1 = 71.0\\text{ mL} - 45.0\\text{ mL} = 26.0\\text{ mL} = 26.0\\text{ cm}^3$.",
      "2. State the density formulation: $\\rho = \\frac{m}{V}$.",
      "3. Substitute measured values: $\\rho = \\frac{68.40\\text{ g}}{26.0\\text{ cm}^3} \\approx 2.63\\text{ g/cm}^3$.",
      "4. Evaluate buoyant behavior: Since $\\rho = 2.63\\text{ g/cm}^3 > 1.00\\text{ g/cm}^3$, the specimen will sink in water."
    ],
    answer: "\\rho = 2.63\\text{ g/cm}^3 \\quad (\\text{Sinks in water})",
    parameters: [
      { sym: "m", name: "Sample Mass", unit: "\\text{g}", desc: "Measured mass on analytical balance" },
      { sym: "V", name: "Displaced Volume", unit: "\\text{cm}^3\\text{ (mL)}", desc: "Volume displaced by solid immersion" },
      { sym: "\\rho", name: "Substance Density", unit: "\\text{g/cm}^3", desc: "Intrinsic mass-to-volume physical property" }
    ]
  };
}
