// Edugates-ClipSAT Science Labs - Comprehensive Track & Lesson Flashcard Engine
// Master memory & inquiry deck covering all 74 modules and 242 lessons across Chemistry, Biology, and Physics.
// Publication-grade LaTeX rendering with KaTeX and standalone unicode fallbacks.

import { icons } from "../assets/icons.js";
import { formatMathText, renderMathInElement } from "../utils/math-renderer.js";
import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { getLessonInteractiveSpec } from "../data/lesson-interactive-specs.js";
import { SoundFX } from "../utils/audio-synth.js";
import { showToast, copyShareLink } from "../utils/toast.js";
import { openLmsShareModal } from "../utils/lms-share.js";

// Core high-yield scientific laws and mathematical principles
const CORE_HIGH_YIELD_CARDS = [
  // Chemistry
  {
    id: "core-chem-1",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 4,
    moduleCode: "CHEM-M04",
    moduleTitle: "Electrons in Atoms",
    unit: "Atomic Theory & Electronic Structure",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Quantum Mechanics",
    front: "Heisenberg Uncertainty Principle",
    backTitle: "Heisenberg Uncertainty Principle",
    conceptFocus: "Quantum Mechanics & Electron Orbitals",
    coreExplanation: "It is fundamentally impossible to know precisely both the velocity (momentum) and position of a subatomic particle simultaneously.",
    formula: "\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}",
    objectives: [
      "$\\Delta x$ = Uncertainty in particle position (meters)",
      "$\\Delta p$ = Uncertainty in linear momentum ($m \\Delta v$)",
      "$h$ = Planck's Constant ($6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$)",
      "Proves electrons must be treated as probability density clouds rather than fixed orbits."
    ],
    hint: "Quantum Mechanics & Electron Orbitals",
    isCoreMastery: true
  },
  {
    id: "core-chem-2",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 13,
    moduleCode: "CHEM-M13",
    moduleTitle: "Gases",
    unit: "States of Matter & Gas Dynamics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Gas Laws",
    front: "Ideal Gas Law Equation & Constants",
    backTitle: "Ideal Gas Law Equation",
    conceptFocus: "Macroscopic Gas Behavior & Kinetic Molecular Theory",
    coreExplanation: "Relates the four fundamental macroscopic thermodynamic properties of an ideal gas sample in a unified equation of state.",
    formula: "PV = nRT",
    objectives: [
      "$P$ = Absolute Pressure ($\\text{atm}$ or $\\text{kPa}$)",
      "$V$ = Gas Volume ($\\text{L}$)",
      "$n$ = Chemical amount ($\\text{moles}$)",
      "$R = 0.0821\\text{ L}\\cdot\\text{atm}/(\\text{mol}\\cdot\\text{K}) = 8.314\\text{ J}/(\\text{mol}\\cdot\\text{K})$",
      "$T$ = Absolute temperature ($\\text{Kelvin}$, where $T_{\\text{K}} = T_{^\\circ\\text{C}} + 273.15$)"
    ],
    hint: "Relates pressure, volume, temperature, and quantity of gas",
    isCoreMastery: true
  },
  {
    id: "core-chem-3",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 14,
    moduleCode: "CHEM-M14",
    moduleTitle: "Mixtures and Solutions",
    unit: "States of Matter & Solutions",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Solution Concentrations",
    front: "Molarity ($M$) vs. Molality ($m$)",
    backTitle: "Concentration Metrics: Molarity vs. Molality",
    conceptFocus: "Quantitative Solution Stoichiometry",
    coreExplanation: "Precision metrics for measuring solute concentration in liquid systems.",
    formula: "M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}} \\text{ (L)}}, \\quad m = \\frac{n_{\\text{solute}}}{m_{\\text{solvent}} \\text{ (kg)}}",
    objectives: [
      "Molarity ($M$) changes with temperature due to liquid thermal expansion and contraction.",
      "Molality ($m$) is strictly temperature-invariant because mass is conserved regardless of temperature.",
      "Colligative properties (boiling point elevation $\\Delta T_b = i K_b m$, freezing point depression $\\Delta T_f = i K_f m$) rely exclusively on molality."
    ],
    hint: "Temperature dependence of volumetric vs mass concentration",
    isCoreMastery: true
  },
  {
    id: "core-chem-4",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 17,
    moduleCode: "CHEM-M17",
    moduleTitle: "Chemical Equilibrium",
    unit: "Reactions, Kinetics & Thermodynamics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Chemical Equilibrium",
    front: "Le Chatelier's Principle & Equilibrium Constant",
    backTitle: "Dynamic Chemical Equilibrium Response",
    conceptFocus: "Perturbation of Chemical Systems & Law of Mass Action",
    coreExplanation: "If a dynamic equilibrium is subjected to an external stress (concentration, temperature, or pressure), the reaction shifts in the direction that counteracts the perturbation.",
    formula: "a\\text{A} + b\\text{B} \\rightleftharpoons c\\text{C} + d\\text{D}, \\quad K_{eq} = \\frac{[\\text{C}]^c [\\text{D}]^d}{[\\text{A}]^a [\\text{B}]^b}",
    objectives: [
      "Adding reactants shifts forward; removing products shifts forward.",
      "Increasing pressure shifts toward the side with fewer gas moles ($\\Delta n_g < 0$).",
      "Increasing temperature shifts in the endothermic direction ($\\Delta H > 0$)."
    ],
    hint: "Equilibrium stress response and mass action law",
    isCoreMastery: true
  },
  {
    id: "core-chem-5",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 15,
    moduleCode: "CHEM-M15",
    moduleTitle: "Energy and Chemical Change",
    unit: "Thermochemistry & Energetics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Thermochemistry",
    front: "Gibbs Free Energy & Spontaneity Criterion",
    backTitle: "Gibbs Free Energy & Chemical Spontaneity",
    conceptFocus: "Thermodynamic Driving Forces (Enthalpy vs Entropy)",
    coreExplanation: "Determines whether a chemical reaction or physical process proceeds spontaneously at constant temperature and pressure.",
    formula: "\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ, \\quad \\Delta G^\\circ = -n F E_{\\text{cell}}^\\circ",
    objectives: [
      "$\\Delta G < 0$: Thermodynamically spontaneous (exergonic).",
      "$\\Delta G > 0$: Non-spontaneous in forward direction (endergonic).",
      "$\\Delta G = 0$: Dynamic equilibrium condition ($K = 1$).",
      "$F$ = Faraday's Constant ($96,485\\text{ C/mol } e^-$)."
    ],
    hint: "Predicting chemical reaction spontaneity",
    isCoreMastery: true
  },
  {
    id: "core-chem-6",
    subject: "CHEM",
    subjectName: "Chemistry",
    trackTitle: "Inspire Chemistry",
    moduleId: 10,
    moduleCode: "CHEM-M10",
    moduleTitle: "The Mole",
    unit: "Quantitative Stoichiometry",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Chemistry • Stoichiometry",
    front: "Avogadro's Number & Molar Gas Volume",
    backTitle: "The Mole & Molar Gas Relationships",
    conceptFocus: "Microscopic-to-Macroscopic Quantitative Bridge",
    coreExplanation: "The mole is the SI base unit for amount of substance, bridging atomic mass units to measurable grams in the laboratory.",
    formula: "1\\text{ mole} = 6.022 \\times 10^{23}\\text{ entities}, \\quad V_m = 22.4\\text{ L/mol at STP}",
    objectives: [
      "$n = \\frac{m}{\\text{Molar Mass}} = \\frac{N}{N_A} = \\frac{V_{\\text{gas}}}{22.4\\text{ L}}$ at STP ($0^\\circ\\text{C}, 1\\text{ atm}$).",
      "Stoichiometric coefficients represent exact mole ratios in balanced equations."
    ],
    hint: "Fundamental counting unit in chemistry",
    isCoreMastery: true
  },

  // Biology
  {
    id: "core-bio-1",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 12,
    moduleCode: "BIO-M12",
    moduleTitle: "Molecular Genetics",
    unit: "Genetics & Molecular Biology",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Molecular Genetics",
    front: "Central Dogma of Molecular Biology",
    backTitle: "Central Dogma of Molecular Biology",
    conceptFocus: "Unidirectional Flow of Genetic Information",
    coreExplanation: "Genetic information stored in nucleotide sequences is transcribed into messenger RNA and translated into functional polypeptide proteins.",
    formula: "\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Polypeptide Protein}",
    objectives: [
      "Transcription: RNA Polymerase reads template DNA strand ($3' \\rightarrow 5'$) and synthesizes complementary mRNA ($5' \\rightarrow 3'$).",
      "RNA Processing: Eukaryotic pre-mRNA undergoes $5'$ capping, $3'$ polyadenylation, and spliceosome removal of introns.",
      "Translation: Ribosomes decode mRNA triplet codons via matching aminoacyl-tRNA anticodons."
    ],
    hint: "DNA to RNA to Functional Enzyme/Protein",
    isCoreMastery: true
  },
  {
    id: "core-bio-2",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 8,
    moduleCode: "BIO-M08",
    moduleTitle: "Cellular Energy",
    unit: "Cellular Bioenergetics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Cellular Respiration",
    front: "Aerobic Cellular Respiration Net Stoichiometry",
    backTitle: "Aerobic Cellular Respiration",
    conceptFocus: "Mitochondrial Glucose Catabolism & ATP Synthesis",
    coreExplanation: "Stepwise biochemical oxidation of glucose to extract energy stored in chemical bonds, generating ATP via oxidative phosphorylation.",
    formula: "\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{--}32\\text{ ATP}",
    objectives: [
      "1. Glycolysis (Cytoplasm): Glucose $\\rightarrow$ 2 Pyruvate ($+2\\text{ ATP}, +2\\text{ NADH}$).",
      "2. Pyruvate Oxidation & Krebs Cycle (Mitochondrial Matrix): Generates $6\\text{ CO}_2, 8\\text{ NADH}, 2\\text{ FADH}_2, 2\\text{ ATP}$.",
      "3. Electron Transport Chain & Chemiosmosis (Inner Membrane): Proton gradient drives ATP Synthase ($26\\text{--}28\\text{ ATP}$)."
    ],
    hint: "Catabolic pathway of glucose oxidation",
    isCoreMastery: true
  },
  {
    id: "core-bio-3",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 8,
    moduleCode: "BIO-M08",
    moduleTitle: "Cellular Energy",
    unit: "Cellular Bioenergetics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Photosynthesis",
    front: "Photosynthesis Net Balanced Equation",
    backTitle: "Oxygenic Photosynthesis",
    conceptFocus: "Solar Energy Transduction into Chemical Energy",
    coreExplanation: "Autotrophic conversion of solar photons, atmospheric carbon dioxide, and water into organic sugars and oxygen.",
    formula: "6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2",
    objectives: [
      "Light-Dependent Reactions (Thylakoids): Photolysis of $\\text{H}_2\\text{O}$ yields $\\text{O}_2$, pumping protons to synthesize $\\text{ATP}$ and $\\text{NADPH}$.",
      "Calvin Cycle / Light-Independent (Stroma): Enzyme RuBisCO fixes $\\text{CO}_2$ with $\\text{RuBP}$, yielding $\\text{G3P}$ triose phosphate sugars."
    ],
    hint: "Chloroplast photolysis and Calvin carbon fixation",
    isCoreMastery: true
  },
  {
    id: "core-bio-4",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 10,
    moduleCode: "BIO-M10",
    moduleTitle: "Sexual Reproduction and Genetics",
    unit: "Genetics & Inheritance",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Mendelian Genetics",
    front: "Mendelian Dihybrid Cross Phenotypic Ratio",
    backTitle: "Dihybrid Independent Assortment",
    conceptFocus: "Meiotic Segregation of Unlinked Genes",
    coreExplanation: "When crossing two individuals heterozygous for two unlinked autosomal genes ($AaBb \\times AaBb$), alleles segregate independently during Meiosis I.",
    formula: "\\text{Phenotypic Ratio } = 9 : 3 : 3 : 1",
    objectives: [
      "$9/16$: Both dominant traits ($A\\_B\\_$)",
      "$3/16$: Dominant first, recessive second ($A\\_bb$)",
      "$3/16$: Recessive first, dominant second ($aaB\\_$)",
      "$1/16$: Double homozygous recessive ($aabb$)"
    ],
    hint: "Independent assortment of unlinked dihybrid cross",
    isCoreMastery: true
  },
  {
    id: "core-bio-5",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 15,
    moduleCode: "BIO-M15",
    moduleTitle: "Evolution",
    unit: "Population Genetics & Evolution",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Population Genetics",
    front: "Hardy-Weinberg Equilibrium Equations",
    backTitle: "Hardy-Weinberg Equilibrium",
    conceptFocus: "Allele and Genotype Frequency Stability",
    coreExplanation: "Calculates allele frequencies in non-evolving diploid populations in the absence of evolutionary forces.",
    formula: "p + q = 1, \\quad p^2 + 2pq + q^2 = 1",
    objectives: [
      "$p$ = Dominant allele frequency ($A$); $q$ = Recessive allele frequency ($a$).",
      "$p^2$ = Homozygous dominant genotype ($AA$).",
      "$2pq$ = Heterozygous genotype ($Aa$).",
      "$q^2$ = Homozygous recessive genotype ($aa$).",
      "5 Conditions: No mutation, random mating, no gene flow, large population, no natural selection."
    ],
    hint: "Equilibrium mathematical model for non-evolving populations",
    isCoreMastery: true
  },
  {
    id: "core-bio-6",
    subject: "BIO",
    subjectName: "Biology",
    trackTitle: "Inspire Biology",
    moduleId: 7,
    moduleCode: "BIO-M07",
    moduleTitle: "Cellular Structure and Function",
    unit: "Cell Biology",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Biology • Membrane Transport",
    front: "Electrochemical Membrane Potential ($\\text{Na}^+/\\text{K}^+$ ATPase)",
    backTitle: "Resting Membrane Potential & Active Transport",
    conceptFocus: "Primary Active Transport & Electrochemical Gradients",
    coreExplanation: "Active electrogenic transport across the phospholipid bilayer maintains cell polarity and drives secondary active transport and action potentials.",
    formula: "3\\text{ Na}^+_{\\text{in}} + 2\\text{ K}^+_{\\text{out}} + \\text{ATP} \\longrightarrow 3\\text{ Na}^+_{\\text{out}} + 2\\text{ K}^+_{\\text{in}} + \\text{ADP} + \\text{P}_i",
    objectives: [
      "Pumps 3 sodium cations out for every 2 potassium cations in per hydrolysed ATP.",
      "Establishes typical resting potential of $-70\\text{ mV}$ in excitable animal cells.",
      "Crucial for nerve impulses, muscle contraction, and cellular osmoregulation."
    ],
    hint: "Sodium-potassium pump stoichiometry and voltage",
    isCoreMastery: true
  },

  // Physics
  {
    id: "core-phys-1",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 4,
    moduleCode: "PHYS-M04",
    moduleTitle: "Forces in One Dimension",
    unit: "Newtonian Mechanics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Classical Mechanics",
    front: "Newton's Laws of Motion & Impulse-Momentum",
    backTitle: "Newton's Laws of Motion",
    conceptFocus: "Force, Mass, Acceleration, and Momentum Transfer",
    coreExplanation: "The foundational laws governing interactions between physical bodies and their resulting states of motion.",
    formula: "\\vec{F}_{\\text{net}} = m\\vec{a} = \\frac{d\\vec{p}}{dt}, \\quad \\vec{J} = \\int \\vec{F}\\,dt = \\Delta\\vec{p}",
    objectives: [
      "1st Law (Inertia): Bodies persist in uniform velocity unless acted upon by a non-zero net external force.",
      "2nd Law: Acceleration is directly proportional to net force and inversely proportional to inertial mass.",
      "3rd Law: Forces occur in equal and opposite action-reaction pairs ($\\vec{F}_{AB} = -\\vec{F}_{BA}$).",
      "Impulse $\\vec{J}$ delivered equals net change in linear momentum $\\Delta\\vec{p} = m\\vec{v}_f - m\\vec{v}_i$."
    ],
    hint: "Foundational Newtonian dynamics and conservation of momentum",
    isCoreMastery: true
  },
  {
    id: "core-phys-2",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 10,
    moduleCode: "PHYS-M10",
    moduleTitle: "Energy and Its Conservation",
    unit: "Energy & Work",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Energy & Work",
    front: "Work-Kinetic Energy Theorem & Conservation of Mechanical Energy",
    backTitle: "Work-Energy Theorem & Conservation",
    conceptFocus: "Mechanical Energy Transformation and Conservation",
    coreExplanation: "Net mechanical work done on an object equals the exact change in its kinetic energy. In conservative systems, total mechanical energy is strictly invariant.",
    formula: "W_{\\text{net}} = \\Delta KE = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2, \\quad E_{\\text{mech}} = KE + PE = \\text{Constant}",
    objectives: [
      "$W = \\vec{F} \\cdot \\vec{d} = F d \\cos\\theta$",
      "Gravitational Potential Energy: $PE_g = mgh$",
      "Elastic Spring Potential Energy: $PE_s = \\frac{1}{2}k x^2$",
      "Isolated conservative system: $\\frac{1}{2}m v_1^2 + mgh_1 + \\frac{1}{2}k x_1^2 = \\frac{1}{2}m v_2^2 + mgh_2 + \\frac{1}{2}k x_2^2$."
    ],
    hint: "Work done equals change in kinetic energy",
    isCoreMastery: true
  },
  {
    id: "core-phys-3",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 20,
    moduleCode: "PHYS-M20",
    moduleTitle: "Electric Current and Circuits",
    unit: "Electricity & Circuit Theory",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Circuits & Electricity",
    front: "Ohm's Law & Electric Power Dissipation",
    backTitle: "Ohm's Law & Joule Heating",
    conceptFocus: "Voltage, Current, Resistance, and Thermal Dissipation",
    coreExplanation: "Governs the linear relationship between electric potential difference, current flow, and ohmic resistance in conductive elements.",
    formula: "V = I \\cdot R, \\quad P = I \\cdot V = I^2 R = \\frac{V^2}{R}",
    objectives: [
      "Series Resistors: $R_{\\text{eq}} = R_1 + R_2 + R_3 + \\dots$ (Identical current across all).",
      "Parallel Resistors: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\dots$ (Identical voltage drop across all).",
      "Kirchhoff's Junction Rule (Conservation of Charge) & Loop Rule (Conservation of Energy)."
    ],
    hint: "Fundamental direct-current circuit relationships",
    isCoreMastery: true
  },
  {
    id: "core-phys-4",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 17,
    moduleCode: "PHYS-M17",
    moduleTitle: "Refraction and Lenses",
    unit: "Optics & Wave Physics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Wave Optics",
    front: "Snell's Law of Refraction & Total Internal Reflection",
    backTitle: "Snell's Law & Critical Angle",
    conceptFocus: "Electromagnetic Wave Propagation Across Dielectric Boundaries",
    coreExplanation: "Describes the angular refraction of light rays passing between media with distinct optical indices of refraction.",
    formula: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2, \\quad \\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right)",
    objectives: [
      "Refractive Index: $n = \\frac{c}{v}$, where $c = 3.00 \\times 10^8\\text{ m/s}$.",
      "When moving to a denser medium ($n_2 > n_1$), light bends toward the normal line ($\\theta_2 < \\theta_1$).",
      "Total Internal Reflection occurs when light in an optically dense medium ($n_1 > n_2$) strikes the boundary at an incident angle exceeding $\\theta_c$."
    ],
    hint: "Wave propagation and bending across optical boundaries",
    isCoreMastery: true
  },
  {
    id: "core-phys-5",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 17,
    moduleCode: "PHYS-M17",
    moduleTitle: "Refraction and Lenses",
    unit: "Optics & Wave Physics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Geometric Optics",
    front: "Thin-Lens Equation & Lateral Magnification",
    backTitle: "Thin-Lens & Mirror Equations",
    conceptFocus: "Image Formation in Curved Optical Elements",
    coreExplanation: "Relates focal length, object position, image distance, and magnification in geometric ray-tracing optics.",
    formula: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}, \\quad m = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o}",
    objectives: [
      "Convex Lens / Concave Mirror: $f > 0$ (Converging).",
      "Concave Lens / Convex Mirror: $f < 0$ (Diverging).",
      "Real Image: $d_i > 0$, inverted orientation ($m < 0$).",
      "Virtual Image: $d_i < 0$, upright orientation ($m > 0$)."
    ],
    hint: "Focal length, object distance, and image position",
    isCoreMastery: true
  },
  {
    id: "core-phys-6",
    subject: "PHYS",
    subjectName: "Physics",
    trackTitle: "Inspire Physics",
    moduleId: 22,
    moduleCode: "PHYS-M22",
    moduleTitle: "Quantum Theory",
    unit: "Modern & Quantum Physics",
    lessonId: null,
    lessonTitle: "Core Principle",
    category: "Inspire Physics • Quantum Physics",
    front: "Einstein's Photoelectric Effect & Photon Energy",
    backTitle: "The Photoelectric Effect",
    conceptFocus: "Wave-Particle Duality of Light & Energy Quantization",
    coreExplanation: "Demonstrates that light interacts with bound electrons as localized packets of quantized energy (photons), rejecting classical wave theories.",
    formula: "E_{\\text{photon}} = h f = \\frac{hc}{\\lambda} = \\Phi + KE_{\\max}, \\quad KE_{\\max} = q V_{\\text{stop}}",
    objectives: [
      "$\\Phi$ = Work function threshold of target metal surface.",
      "Increasing light frequency increases photo-electron kinetic energy.",
      "Increasing light intensity increases electron emission count (current), but does not alter stopping potential $V_{\\text{stop}}$."
    ],
    hint: "Quantized energy packets of electromagnetic radiation",
    isCoreMastery: true
  }
];

/**
 * Builds the comprehensive 334-card deck covering all tracks, modules, and individual lessons.
 */
export function buildComprehensiveFlashcardDeck() {
  const deck = [];

  // Add the 18 deep-dive high-yield mastery cards
  CORE_HIGH_YIELD_CARDS.forEach(c => deck.push(c));

  // Build curriculum-aligned module and lesson cards
  const tracks = [
    { data: chemistryCurriculum, code: "CHEM", name: "Chemistry" },
    { data: biologyCurriculum, code: "BIO", name: "Biology" },
    { data: physicsCurriculum, code: "PHYS", name: "Physics" }
  ];

  tracks.forEach(track => {
    track.data.modules.forEach(m => {
      // 1. Module Overview Card (Big Idea + Phenomenon + Formulas)
      const modFormula = (m.formulas && m.formulas.length > 0) ? m.formulas[0] : "";
      deck.push({
        id: `${track.code.toLowerCase()}-m${m.id}-overview`,
        subject: track.code,
        subjectName: track.name,
        trackTitle: track.data.subject,
        moduleId: m.id,
        moduleCode: m.code,
        moduleTitle: m.title,
        unit: m.unit,
        lessonId: 0, // 0 signifies Module Overview
        lessonTitle: "Big Idea & Module Overview",
        category: `Inspire ${track.name} • ${m.code}`,
        front: `${m.title} — Big Idea & Core Principles`,
        backTitle: `${m.code}: ${m.title}`,
        conceptFocus: m.unit || "Core Curriculum Unit",
        bigIdea: m.bigIdea || "",
        phenomenon: m.phenomenon || "",
        formula: modFormula,
        objectives: [
          `Master all ${m.lessons ? m.lessons.length : 0} curriculum lessons in ${m.title}.`,
          `Curriculum Unit Alignment: ${m.unit}.`,
          `Associated STEM Laboratory: ${m.lab || "Interactive Simulation Workbench"}.`
        ],
        hint: `Unit: ${m.unit}`,
        isModuleOverview: true,
        isLessonCard: false,
        isCoreMastery: false
      });

      // 2. Individual Lesson Cards (Objectives + Interactive Workbench + Formulation)
      if (m.lessons) {
        m.lessons.forEach(l => {
          const spec = getLessonInteractiveSpec(track.code, m.id, l.id);
          const formulaVal = spec.formula || (m.formulas && m.formulas.length > 0 ? m.formulas[0] : "");
          deck.push({
            id: `${track.code.toLowerCase()}-m${m.id}-l${l.id}`,
            subject: track.code,
            subjectName: track.name,
            trackTitle: track.data.subject,
            moduleId: m.id,
            moduleCode: m.code,
            moduleTitle: m.title,
            unit: m.unit,
            lessonId: l.id,
            lessonTitle: l.title,
            category: `Inspire ${track.name} • ${m.code} • Lesson ${l.id}`,
            front: `Lesson ${l.id}: ${l.title}`,
            backTitle: `${l.title}`,
            conceptFocus: spec.title || l.title,
            formula: formulaVal,
            objectives: l.objectives || [],
            inquiry: spec.inquiry || m.phenomenon || "",
            hint: `Module ${m.id}: ${m.title}`,
            isModuleOverview: false,
            isLessonCard: true,
            isCoreMastery: false
          });
        });
      }
    });
  });

  return deck;
}

// Global cached full deck for fast access
export const flashcardDeck = buildComprehensiveFlashcardDeck();

/**
 * Escapes HTML characters for safe attribute and DOM insertion
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Audio Pronunciation & Text-to-Speech Helper for Scientific Vocabulary
 */
let activeSpeechUtterance = null;
let isSpeakingAudio = false;

function cleanMathForSpeech(text) {
  if (!text) return "";
  let s = String(text);
  // Markdown bold/italic
  s = s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
  // Chemical compounds & formulas
  s = s.replace(/\\text\{H\}_2\\text\{O\}/g, "water H 2 O");
  s = s.replace(/\\text\{CO\}_2/g, "carbon dioxide C O 2");
  s = s.replace(/\\text\{O\}_2/g, "oxygen O 2");
  s = s.replace(/\\text\{N\}_2/g, "nitrogen N 2");
  s = s.replace(/\\text\{C\}_6\\text\{H\}_\{12\}\\text\{O\}_6/g, "glucose C 6 H 12 O 6");
  s = s.replace(/\\rightleftharpoons/g, " is in dynamic reversible equilibrium with ");
  s = s.replace(/\\longrightarrow/g, " yields ");
  s = s.replace(/\\xrightarrow\{[^}]+\}/g, " yields ");
  // Common Greek letters
  s = s.replace(/\\Delta/g, "delta ");
  s = s.replace(/\\theta/g, "theta ");
  s = s.replace(/\\lambda/g, "lambda ");
  s = s.replace(/\\Phi/g, "work function phi ");
  s = s.replace(/\\nu/g, "frequency nu ");
  s = s.replace(/\\pi/g, "pi ");
  s = s.replace(/\\mu/g, "mu ");
  s = s.replace(/\\alpha/g, "alpha ");
  s = s.replace(/\\beta/g, "beta ");
  s = s.replace(/\\gamma/g, "gamma ");
  // Operators
  s = s.replace(/\\cdot/g, " times ");
  s = s.replace(/\\times\s*10\^\{([^}]+)\}/g, " times 10 to the power of $1");
  s = s.replace(/\\times/g, " times ");
  s = s.replace(/\\le/g, " less than or equal to ");
  s = s.replace(/\\ge/g, " greater than or equal to ");
  s = s.replace(/\\approx/g, " approximately ");
  s = s.replace(/\\pm/g, " plus or minus ");
  // Fractions & Roots
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2");
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "square root of $1");
  s = s.replace(/\^\{([^}]+)\}/g, " to the power of $1");
  s = s.replace(/\^2/g, " squared");
  s = s.replace(/\^3/g, " cubed");
  s = s.replace(/\^([0-9a-zA-Z]+)/g, " to the power of $1");
  s = s.replace(/_\{([^}]+)\}/g, " sub $1");
  s = s.replace(/_([0-9a-zA-Z]+)/g, " sub $1");
  s = s.replace(/\\text\{([^}]+)\}/g, " $1 ");
  s = s.replace(/\\mathrm\{([^}]+)\}/g, " $1 ");
  s = s.replace(/\\mathbf\{([^}]+)\}/g, " $1 ");
  s = s.replace(/\\circ/g, " degrees");
  s = s.replace(/\\quad/g, ", ");
  s = s.replace(/\\,/g, " ");
  s = s.replace(/\\;/g, " ");
  // Strip brackets, backslashes, dollar signs
  s = s.replace(/[\$\{\}\\]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function cancelCardSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    isSpeakingAudio = false;
    activeSpeechUtterance = null;
    document.querySelectorAll(".fc-speech-btn").forEach(b => {
      b.classList.remove("is-speaking");
      const label = b.querySelector(".fc-speech-text");
      if (label) label.textContent = "Pronounce";
    });
  }
}

function speakCard(card, isFlipped, isReverseMode) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    showToast("Web Speech API is not supported in this browser.", "info");
    return;
  }

  if (isSpeakingAudio) {
    cancelCardSpeech();
    return;
  }

  let textToSpeak = "";
  if (!isReverseMode) {
    if (!isFlipped) {
      textToSpeak = `${card.front}. ${card.conceptFocus ? "Focus: " + card.conceptFocus : ""}`;
    } else {
      textToSpeak = `${card.backTitle || card.front}. `;
      if (card.formula) {
        textToSpeak += `Key formula: ${cleanMathForSpeech(card.formula)}. `;
      }
      if (card.coreExplanation) {
        textToSpeak += `${cleanMathForSpeech(card.coreExplanation)}. `;
      } else if (card.bigIdea) {
        textToSpeak += `Big idea: ${cleanMathForSpeech(card.bigIdea)}. `;
      }
    }
  } else {
    // Reverse Challenge Mode
    if (!isFlipped) {
      textToSpeak = `Reverse challenge: Can you identify this STEM principle? Category: ${card.category}. `;
      if (card.formula) {
        textToSpeak += `Key formula: ${cleanMathForSpeech(card.formula)}. `;
      }
      if (card.coreExplanation) {
        textToSpeak += `Behavior: ${cleanMathForSpeech(card.coreExplanation)}. `;
      } else if (card.inquiry) {
        textToSpeak += `Inquiry: ${cleanMathForSpeech(card.inquiry)}. `;
      }
    } else {
      textToSpeak = `Answer: ${card.front}. ${card.backTitle && card.backTitle !== card.front ? card.backTitle : ""}. `;
      if (card.formula) {
        textToSpeak += `Formula: ${cleanMathForSpeech(card.formula)}. `;
      }
    }
  }

  textToSpeak = cleanMathForSpeech(textToSpeak);
  if (!textToSpeak) return;

  SoundFX.playClick();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  utterance.lang = "en-US";

  try {
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith("en") && !v.localService) || voices.find(v => v.lang.startsWith("en"));
    if (engVoice) utterance.voice = engVoice;
  } catch (e) {}

  utterance.onstart = () => {
    isSpeakingAudio = true;
    activeSpeechUtterance = utterance;
    document.querySelectorAll(".fc-speech-btn").forEach(b => {
      b.classList.add("is-speaking");
      const label = b.querySelector(".fc-speech-text");
      if (label) label.textContent = "Stop";
    });
  };

  utterance.onend = () => {
    isSpeakingAudio = false;
    activeSpeechUtterance = null;
    document.querySelectorAll(".fc-speech-btn").forEach(b => {
      b.classList.remove("is-speaking");
      const label = b.querySelector(".fc-speech-text");
      if (label) label.textContent = "Pronounce";
    });
  };

  utterance.onerror = () => {
    isSpeakingAudio = false;
    activeSpeechUtterance = null;
    document.querySelectorAll(".fc-speech-btn").forEach(b => {
      b.classList.remove("is-speaking");
      const label = b.querySelector(".fc-speech-text");
      if (label) label.textContent = "Pronounce";
    });
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Main View Renderer for the Flashcards Hub
 * @param {string} containerId - Mount element ID
 * @param {object} initialFilter - Optional initial filter { subject, moduleId, lessonId }
 */
export function renderFlashcards(containerId, initialFilter = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Filter State
  let currentSubject = (initialFilter.subject || "ALL").toUpperCase(); // 'ALL', 'CHEM', 'BIO', 'PHYS'
  let currentModuleId = initialFilter.moduleId !== undefined ? initialFilter.moduleId : "ALL"; // 'ALL' or number 1..27
  let currentLessonId = initialFilter.lessonId !== undefined ? initialFilter.lessonId : "ALL"; // 'ALL', 0 (overview), or number 1..5

  // Robustly handle string formats like "CHEM-M02" or "M02"
  if (typeof currentModuleId === "string" && currentModuleId.includes("M")) {
    const match = currentModuleId.match(/M(\d+)/i);
    if (match) currentModuleId = parseInt(match[1], 10);
  } else if (currentModuleId !== "ALL") {
    currentModuleId = parseInt(currentModuleId, 10) || "ALL";
  }

  // Robustly handle string formats like "L03" or "Lesson 3"
  if (typeof currentLessonId === "string" && /L|Lesson/i.test(currentLessonId)) {
    const match = currentLessonId.match(/(\d+)/);
    if (match) currentLessonId = parseInt(match[1], 10);
  } else if (currentLessonId !== "ALL" && currentLessonId !== "OVERVIEW") {
    currentLessonId = parseInt(currentLessonId, 10) || "ALL";
  }

  let searchQuery = "";
  let masteryFilter = "ALL"; // 'ALL', 'BOX1', 'BOX2', 'BOX3', 'MASTERED', 'UNMASTERED'
  let currentIndex = 0;
  let isFlipped = false;
  let isReverseMode = false;

  // Load Leitner boxes and mastered state from localStorage
  let leitnerBoxes = {};
  try {
    leitnerBoxes = JSON.parse(localStorage.getItem("clipsat_leitner_boxes") || "{}");
  } catch (e) {
    leitnerBoxes = {};
  }
  let masteredCards = new Set(JSON.parse(localStorage.getItem("clipsat_mastered_cards") || "[]"));

  // Synchronize initial legacy mastered state with Box 3
  masteredCards.forEach(cid => {
    if (!leitnerBoxes[cid]) {
      leitnerBoxes[cid] = 3;
    }
  });

  function getCardBox(cardId) {
    if (leitnerBoxes[cardId] === 1 || leitnerBoxes[cardId] === 2 || leitnerBoxes[cardId] === 3) {
      return leitnerBoxes[cardId];
    }
    if (masteredCards.has(cardId)) return 3;
    return 1; // Default is Box 1: Needs Practice
  }

  function setCardBox(cardId, boxNum, advanceNext = true) {
    leitnerBoxes[cardId] = boxNum;
    localStorage.setItem("clipsat_leitner_boxes", JSON.stringify(leitnerBoxes));

    if (boxNum === 3) {
      masteredCards.add(cardId);
      SoundFX.playChime();
      showToast("Card Promoted to Box 3: Mastered! 🌟", "success");
    } else if (boxNum === 2) {
      masteredCards.delete(cardId);
      SoundFX.playClick();
      showToast("Card Moved to Box 2: Reviewing 🟡", "info");
    } else {
      masteredCards.delete(cardId);
      SoundFX.playSwitchSnap();
      showToast("Card Moved to Box 1: Needs Practice 🔴", "warning");
    }
    localStorage.setItem("clipsat_mastered_cards", JSON.stringify([...masteredCards]));

    cancelCardSpeech();
    if (advanceNext) {
      const curDeck = getFilteredDeck();
      if (curDeck.length > 1) {
        currentIndex = (currentIndex + 1) % curDeck.length;
        isFlipped = false;
      }
    }
    renderView();
  }

  // Track map for curriculum access
  const trackMap = {
    CHEM: chemistryCurriculum,
    BIO: biologyCurriculum,
    PHYS: physicsCurriculum
  };

  /**
   * Retrieves modules available based on currently selected track
   */
  function getAvailableModules() {
    if (currentSubject !== "ALL" && trackMap[currentSubject]) {
      return trackMap[currentSubject].modules.map(m => ({
        subject: currentSubject,
        subjectName: trackMap[currentSubject].subject,
        id: m.id,
        code: m.code,
        title: m.title,
        lessons: m.lessons || []
      }));
    }

    // If ALL, combine modules from all three tracks
    const allMods = [];
    ["CHEM", "BIO", "PHYS"].forEach(sub => {
      const cur = trackMap[sub];
      cur.modules.forEach(m => {
        allMods.push({
          subject: sub,
          subjectName: cur.subject,
          id: m.id,
          code: m.code,
          title: m.title,
          lessons: m.lessons || []
        });
      });
    });
    return allMods;
  }

  /**
   * Retrieves lessons available based on currently selected module
   */
  function getAvailableLessons() {
    if (currentModuleId === "ALL") return [];

    const numModId = parseInt(currentModuleId, 10);
    const availableMods = getAvailableModules();
    const foundMod = availableMods.find(m => m.id === numModId);
    return foundMod && foundMod.lessons ? foundMod.lessons : [];
  }

  /**
   * Returns deck filtered by track, module, lesson, Leitner box, and search query
   */
  function getFilteredDeck() {
    return flashcardDeck.filter(card => {
      // 1. Subject / Track Filter
      if (currentSubject !== "ALL" && card.subject !== currentSubject) {
        return false;
      }

      // 2. Module Filter
      if (currentModuleId !== "ALL") {
        const targetMod = parseInt(currentModuleId, 10);
        if (card.moduleId !== targetMod) return false;
      }

      // 3. Lesson Filter
      if (currentLessonId !== "ALL") {
        if (currentLessonId === "OVERVIEW" || currentLessonId === 0) {
          if (!card.isModuleOverview) return false;
        } else {
          const targetLesson = parseInt(currentLessonId, 10);
          if (card.lessonId !== targetLesson) return false;
        }
      }

      // 4. Mastery & Leitner Filter
      const cardBox = getCardBox(card.id);
      if (masteryFilter === "BOX1" || masteryFilter === "UNMASTERED") {
        if (cardBox !== 1) return false;
      } else if (masteryFilter === "BOX2") {
        if (cardBox !== 2) return false;
      } else if (masteryFilter === "BOX3" || masteryFilter === "MASTERED") {
        if (cardBox !== 3) return false;
      }

      // 5. Search Query Filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const searchPool = [
          card.front || "",
          card.backTitle || "",
          card.conceptFocus || "",
          card.category || "",
          card.hint || "",
          card.formula || "",
          card.bigIdea || "",
          card.phenomenon || "",
          card.inquiry || "",
          card.coreExplanation || "",
          ...(card.objectives || [])
        ].join(" ").toLowerCase();

        if (!searchPool.includes(q)) return false;
      }

      return true;
    });
  }

  /**
   * Generates a descriptive string for the currently active filters
   */
  function getActiveFilterDescription(deckLength) {
    const parts = [];
    if (currentSubject === "ALL") {
      parts.push("All Tracks (Inspire Chem, Bio, Phys)");
    } else {
      parts.push(trackMap[currentSubject]?.subject || currentSubject);
    }

    if (currentModuleId !== "ALL") {
      const availableMods = getAvailableModules();
      const mod = availableMods.find(m => m.id === parseInt(currentModuleId, 10));
      if (mod) parts.push(`${mod.code}: ${mod.title}`);
    }

    if (currentLessonId !== "ALL") {
      if (currentLessonId === "OVERVIEW" || currentLessonId === 0) {
        parts.push("Module Overview");
      } else {
        const lessons = getAvailableLessons();
        const les = lessons.find(l => l.id === parseInt(currentLessonId, 10));
        if (les) parts.push(`Lesson ${les.id}: ${les.title}`);
        else parts.push(`Lesson ${currentLessonId}`);
      }
    }

    if (searchQuery.trim()) {
      parts.push(`Keyword "${searchQuery.trim()}"`);
    }

    if (masteryFilter === "BOX1" || masteryFilter === "UNMASTERED") parts.push("Box 1: Needs Practice");
    else if (masteryFilter === "BOX2") parts.push("Box 2: Reviewing");
    else if (masteryFilter === "BOX3" || masteryFilter === "MASTERED") parts.push("Box 3: Mastered");

    return parts.join(" › ");
  }

  /**
   * Renders the complete view and re-attaches listeners
   */
  function renderView() {
    const deck = getFilteredDeck();
    if (currentIndex >= deck.length) currentIndex = 0;
    const card = deck.length > 0 ? deck[currentIndex] : null;
    const currentCardBox = card ? getCardBox(card.id) : 1;
    const isMastered = currentCardBox === 3;

    // Counts for track badges
    const allCardsCount = flashcardDeck.length;
    const chemCount = flashcardDeck.filter(c => c.subject === "CHEM").length;
    const bioCount = flashcardDeck.filter(c => c.subject === "BIO").length;
    const physCount = flashcardDeck.filter(c => c.subject === "PHYS").length;

    // Leitner statistics for the current deck
    let box1Count = 0;
    let box2Count = 0;
    let box3Count = 0;
    deck.forEach(c => {
      const b = getCardBox(c.id);
      if (b === 3) box3Count++;
      else if (b === 2) box2Count++;
      else box1Count++;
    });

    const totalDeckCount = deck.length;
    const box1Pct = totalDeckCount > 0 ? Math.round((box1Count / totalDeckCount) * 100) : 0;
    const box2Pct = totalDeckCount > 0 ? Math.round((box2Count / totalDeckCount) * 100) : 0;
    const box3Pct = totalDeckCount > 0 ? Math.round((box3Count / totalDeckCount) * 100) : 0;

    const isAnyFilterActive = currentSubject !== "ALL" || currentModuleId !== "ALL" || currentLessonId !== "ALL" || searchQuery.trim() !== "" || masteryFilter !== "ALL";

    // Build Module Options HTML
    const availableModules = getAvailableModules();
    let moduleOptionsHtml = "";
    if (currentSubject === "ALL") {
      ["CHEM", "BIO", "PHYS"].forEach(sub => {
        const subMods = availableModules.filter(m => m.subject === sub);
        moduleOptionsHtml += `<optgroup label="Inspire ${trackMap[sub].subject}">`;
        subMods.forEach(m => {
          const selected = currentModuleId !== "ALL" && parseInt(currentModuleId, 10) === m.id ? "selected" : "";
          moduleOptionsHtml += `<option value="${m.id}" ${selected}>${m.code}: ${m.title}</option>`;
        });
        moduleOptionsHtml += `</optgroup>`;
      });
    } else {
      availableModules.forEach(m => {
        const selected = currentModuleId !== "ALL" && parseInt(currentModuleId, 10) === m.id ? "selected" : "";
        moduleOptionsHtml += `<option value="${m.id}" ${selected}>${m.code}: ${m.title}</option>`;
      });
    }

    // Build Lesson Options HTML
    const availableLessons = getAvailableLessons();
    let lessonOptionsHtml = "";
    availableLessons.forEach(l => {
      const selected = currentLessonId !== "ALL" && parseInt(currentLessonId, 10) === l.id ? "selected" : "";
      lessonOptionsHtml += `<option value="${l.id}" ${selected}>Lesson ${l.id}: ${l.title}</option>`;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto; width: 100%;">
        <!-- Hero Header -->
        <div class="hero-banner flashcard-hero-banner" style="padding: 24px 32px;">
          <div class="hero-badge" style="color: #ec4899; border-color: #ec489944; background: #ec489915;">
            High-Yield Memory & Inquiry Deck
          </div>
          <h2 class="hero-title" style="font-size: 1.8rem;">Interactive STEM Flashcards</h2>
          <p class="hero-desc" style="font-size: 0.95rem;">
            Master core scientific laws, lesson objectives, and mathematical formulations across all 3 tracks with Leitner Spaced Repetition and Text-to-Speech audio pronunciation.
          </p>

          <!-- Subject / Track Filter Pills -->
          <div style="display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;">
            <button class="unit-filter-chip ${currentSubject === 'ALL' ? 'active' : ''}" data-fsub="ALL">
              All Tracks (${allCardsCount})
            </button>
            <button class="unit-filter-chip ${currentSubject === 'CHEM' ? 'active' : ''}" data-fsub="CHEM" style="${currentSubject === 'CHEM' ? 'border-color: #06b6d4; background: rgba(6,182,212,0.2); color: #38bdf8;' : ''}">
              Inspire Chemistry (${chemCount})
            </button>
            <button class="unit-filter-chip ${currentSubject === 'BIO' ? 'active' : ''}" data-fsub="BIO" style="${currentSubject === 'BIO' ? 'border-color: #10b981; background: rgba(16,185,129,0.2); color: #34d399;' : ''}">
              Inspire Biology (${bioCount})
            </button>
            <button class="unit-filter-chip ${currentSubject === 'PHYS' ? 'active' : ''}" data-fsub="PHYS" style="${currentSubject === 'PHYS' ? 'border-color: #6366f1; background: rgba(99,102,241,0.2); color: #818cf8;' : ''}">
              Inspire Physics (${physCount})
            </button>
          </div>
        </div>

        <!-- Leitner Spaced Repetition Progress Ribbon -->
        <div class="leitner-ribbon-card">
          <div class="leitner-ribbon-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.05rem;">🧠</span>
              <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">Leitner Spaced Repetition Mastery</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              ${box3Count} of ${totalDeckCount} fully mastered (${box3Pct}%)
            </div>
          </div>

          <div class="leitner-progress-track" title="Click any section to filter by that mastery box">
            <div class="leitner-track-segment seg-box1" style="width: ${box1Pct}%;" data-filter-box="BOX1" title="Box 1: Needs Practice (${box1Count} cards, ${box1Pct}%)"></div>
            <div class="leitner-track-segment seg-box2" style="width: ${box2Pct}%;" data-filter-box="BOX2" title="Box 2: Reviewing (${box2Count} cards, ${box2Pct}%)"></div>
            <div class="leitner-track-segment seg-box3" style="width: ${box3Pct}%;" data-filter-box="BOX3" title="Box 3: Mastered (${box3Count} cards, ${box3Pct}%)"></div>
          </div>

          <div class="leitner-legend-row">
            <button class="leitner-legend-pill ${masteryFilter === 'BOX1' ? 'active' : ''}" data-filter-box="BOX1">
              <span class="leitner-dot dot-red"></span>
              <span>Box 1: Needs Practice</span>
              <strong>(${box1Count})</strong>
            </button>
            <button class="leitner-legend-pill ${masteryFilter === 'BOX2' ? 'active' : ''}" data-filter-box="BOX2">
              <span class="leitner-dot dot-amber"></span>
              <span>Box 2: Reviewing</span>
              <strong>(${box2Count})</strong>
            </button>
            <button class="leitner-legend-pill ${masteryFilter === 'BOX3' ? 'active' : ''}" data-filter-box="BOX3">
              <span class="leitner-dot dot-green"></span>
              <span>Box 3: Mastered</span>
              <strong>(${box3Count})</strong>
            </button>
          </div>
        </div>

        <!-- Filter & Search Controls Card -->
        <div class="flashcard-filter-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <span>Adjust Track, Module & Lessons</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary" id="btn-fc-lms-share" title="Assign this flashcard practice deck to Google Classroom, Classera, Canvas, or Teams" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(236, 72, 153, 0.4); color: #ec4899;">
                <span>📤 Assign to LMS</span>
              </button>
              <button class="btn btn-secondary" id="btn-fc-share" title="Copy shareable link to this filtered flashcard deck" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                <span>🔗 Share Deck</span>
              </button>
              ${isAnyFilterActive ? `
                <button class="btn btn-secondary" id="btn-reset-filters" style="padding: 6px 14px; font-size: 0.8rem; border-color: rgba(244,63,94,0.4); color: #f43f5e;">
                  ↺ Reset Filters
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Selectors Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: end;">
            <!-- Module Select -->
            <div class="fc-select-group">
              <label class="fc-select-label" for="fc-module-select">📖 Module / Topic</label>
              <select id="fc-module-select" class="fc-custom-select">
                <option value="ALL">All Modules (${availableModules.length} Available)</option>
                ${moduleOptionsHtml}
              </select>
            </div>

            <!-- Lesson Select -->
            <div class="fc-select-group">
              <label class="fc-select-label" for="fc-lesson-select">🎯 Specific Lesson</label>
              <select id="fc-lesson-select" class="fc-custom-select" ${availableLessons.length === 0 && currentModuleId === 'ALL' ? 'disabled' : ''}>
                <option value="ALL">All Lessons in Selection</option>
                ${currentModuleId !== 'ALL' ? `<option value="OVERVIEW" ${currentLessonId === 'OVERVIEW' || currentLessonId === 0 ? 'selected' : ''}>Module Big Idea & Overview Card</option>` : ''}
                ${lessonOptionsHtml}
              </select>
            </div>

            <!-- Mastery Filter -->
            <div class="fc-select-group">
              <label class="fc-select-label" for="fc-mastery-select">⭐ Spaced Repetition Box</label>
              <select id="fc-mastery-select" class="fc-custom-select">
                <option value="ALL" ${masteryFilter === 'ALL' ? 'selected' : ''}>All Cards (${deck.length})</option>
                <option value="BOX1" ${masteryFilter === 'BOX1' || masteryFilter === 'UNMASTERED' ? 'selected' : ''}>🔴 Box 1: Needs Practice (${box1Count})</option>
                <option value="BOX2" ${masteryFilter === 'BOX2' ? 'selected' : ''}>🟡 Box 2: Reviewing (${box2Count})</option>
                <option value="BOX3" ${masteryFilter === 'BOX3' || masteryFilter === 'MASTERED' ? 'selected' : ''}>🟢 Box 3: Mastered (${box3Count})</option>
              </select>
            </div>

            <!-- Search Input -->
            <div class="fc-select-group">
              <label class="fc-select-label" for="fc-search-input">🔍 Real-Time Search</label>
              <div style="position: relative; display: flex; align-items: center;">
                <input type="text" id="fc-search-input" class="fc-search-input" placeholder="Search laws, formulas, keywords..." value="${escapeHtml(searchQuery)}">
                ${searchQuery ? `
                  <button id="btn-clear-search" style="position: absolute; right: 10px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 2px 4px;">×</button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Active Filter Breadcrumb -->
          <div class="fc-filter-breadcrumb" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="fc-filter-label" style="color: #38bdf8; font-weight: 600;">Active Filter:</span>
              <span class="fc-filter-desc">${getActiveFilterDescription(deck.length)}</span>
              <span class="fc-filter-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 0.78rem;">
                ${deck.length} ${deck.length === 1 ? 'card' : 'cards'} available
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 14px;">
              <span class="fc-mastered-indicator" style="color: #10b981; font-weight: 600;">✓ ${box3Count} of ${deck.length} Mastered</span>
            </div>
          </div>
        </div>

        ${deck.length > 0 ? `
          <!-- Card Progress Counter & Secondary Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-main);">
                Card ${currentIndex + 1} of ${deck.length}
              </div>
              <div class="fc-nav-hint" style="font-size: 0.8rem; color: var(--text-dim); background: rgba(255,255,255,0.05); padding: 3px 10px; border-radius: 999px;">
                ⌨ Space = Flip • 1, 2, 3 = Box • P = Audio • R = Reverse
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-secondary ${isReverseMode ? 'active-reverse' : ''}" id="btn-toggle-reverse" style="padding: 6px 14px; font-size: 0.85rem;" title="Reverse Mode: Guess concept from formulation and clues (Hotkey: R)">
                🔄 ${isReverseMode ? 'Reverse Mode: ON' : 'Reverse Mode: OFF'}
              </button>
              <button class="btn btn-secondary" id="btn-shuffle-deck" style="padding: 6px 14px; font-size: 0.85rem;" title="Randomize card order">
                🔀 Shuffle Deck
              </button>
            </div>
          </div>

          <!-- 3D Flippable Flashcard Scene -->
          <div class="flashcard-scene" id="flashcard-toggle-area" style="cursor: pointer;">
            <div class="flashcard-inner ${isFlipped ? 'is-flipped' : ''}">
              <!-- Front Face -->
              <div class="flashcard-face flashcard-front">
                <!-- Reticle Decorative Accents -->
                <div class="fc-reticle fc-reticle-tl">+</div>
                <div class="fc-reticle fc-reticle-tr">+</div>
                <div class="fc-reticle fc-reticle-bl">+</div>
                <div class="fc-reticle fc-reticle-br">+</div>

                <!-- Header -->
                <div class="flashcard-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="unit-filter-chip active" style="font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      ${card.subjectName} • ${card.moduleCode || "STEM ESSENTIAL"}
                    </span>
                    ${card.lessonId ? `
                      <span style="font-size: 0.78rem; color: #38bdf8; font-weight: 700;">
                        Lesson ${card.lessonId}
                      </span>
                    ` : ''}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-speech-trigger fc-speech-btn" id="btn-speech-front" title="Listen to scientific pronunciation (Hotkey: P or V)">
                      <span class="speech-icon">🔊</span>
                      <span class="fc-speech-text">Pronounce</span>
                    </button>
                    ${currentCardBox === 3 ? `
                      <div class="leitner-status-badge box3">
                        <span>★</span> Box 3: Mastered
                      </div>
                    ` : currentCardBox === 2 ? `
                      <div class="leitner-status-badge box2">
                        <span>🟡</span> Box 2: Reviewing
                      </div>
                    ` : `
                      <div class="leitner-status-badge box1">
                        <span>🔴</span> Box 1: Needs Practice
                      </div>
                    `}
                  </div>
                </div>

                <!-- Center Content -->
                <div class="flashcard-front-body">
                  ${!isReverseMode ? `
                    <!-- Standard Mode Front -->
                    <div class="flashcard-category-tag" style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">
                      ${card.category}
                    </div>
                    <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: var(--text-main); line-height: 1.35; max-width: 680px; margin-bottom: 14px;">
                      ${formatMathText(card.front)}
                    </div>
                    ${card.conceptFocus && card.conceptFocus !== card.front ? `
                      <div style="font-size: 0.95rem; color: var(--text-muted); max-width: 600px; line-height: 1.5; margin-bottom: 10px;">
                        Focus: ${card.conceptFocus}
                      </div>
                    ` : ''}
                    ${card.hint ? `
                      <div class="flashcard-topic-pill">
                        <span>💡 Topic: ${card.hint}</span>
                      </div>
                    ` : ''}
                  ` : `
                    <!-- Reverse Challenge Mode Front -->
                    <div class="flashcard-category-tag" style="font-size: 0.82rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                      ⚡ REVERSE CHALLENGE • ${card.category}
                    </div>
                    <div style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; color: #f8fafc; line-height: 1.3; max-width: 680px; margin-bottom: 12px;">
                      What STEM Law, Principle, or Term is described below?
                    </div>
                    ${card.formula ? `
                      <div class="flashcard-formula-box" style="margin: 8px auto; max-width: 580px;">
                        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 4px;">
                          Key Mathematical & Scientific Formulation
                        </div>
                        <div style="font-size: 1.2rem; color: #38bdf8;">
                          ${card.formula.startsWith("$$") ? card.formula : `$$${card.formula}$$`}
                        </div>
                      </div>
                    ` : ''}
                    ${card.coreExplanation ? `
                      <div style="font-size: 0.95rem; color: var(--text-main); max-width: 640px; line-height: 1.5; margin: 8px 0;">
                        ${formatMathText(card.coreExplanation)}
                      </div>
                    ` : card.inquiry ? `
                      <div style="font-size: 0.92rem; color: var(--text-muted); max-width: 640px; line-height: 1.5; margin: 8px 0;">
                        ${formatMathText(card.inquiry)}
                      </div>
                    ` : ''}
                    ${card.hint ? `
                      <div class="flashcard-topic-pill" style="border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.1); color: #fbbf24;">
                        <span>💡 Clue: ${card.hint}</span>
                      </div>
                    ` : ''}
                  `}
                </div>

                <!-- Footer -->
                <div class="flashcard-footer">
                  <div style="font-size: 0.8rem; color: var(--text-dim);">
                    Card ${currentIndex + 1} of ${deck.length}
                  </div>
                  <div class="flashcard-footer-prompt" style="font-size: 0.82rem; color: #38bdf8; display: flex; align-items: center; gap: 6px; font-weight: 600;">
                    <span>👆 Tap card or press Space to reveal answer</span>
                  </div>
                </div>
              </div>

              <!-- Back Face -->
              <div class="flashcard-face flashcard-back">
                <!-- Reticle Decorative Accents -->
                <div class="fc-reticle fc-reticle-tl">+</div>
                <div class="fc-reticle fc-reticle-tr">+</div>
                <div class="fc-reticle fc-reticle-bl">+</div>
                <div class="fc-reticle fc-reticle-br">+</div>

                <!-- Header -->
                <div class="flashcard-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="unit-filter-chip active" style="font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      ${card.subjectName} • ${card.moduleCode || "CONCEPT BREAKDOWN"}
                    </span>
                    ${card.lessonId ? `
                      <span style="font-size: 0.78rem; color: #38bdf8; font-weight: 700;">
                        Lesson ${card.lessonId}
                      </span>
                    ` : ''}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-speech-trigger fc-speech-btn" id="btn-speech-back" title="Listen to scientific pronunciation (Hotkey: P or V)">
                      <span class="speech-icon">🔊</span>
                      <span class="fc-speech-text">Pronounce</span>
                    </button>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 999px;">
                      <span>⟲</span> ${isReverseMode ? 'Concept Revealed' : 'Answer & Breakdown'}
                    </div>
                  </div>
                </div>

                <!-- Scrollable Body -->
                <div class="flashcard-back-body">
                  <div style="font-family: var(--font-heading); font-size: ${isReverseMode ? '1.5rem' : '1.25rem'}; font-weight: 800; color: var(--text-main); line-height: 1.3; margin-bottom: 6px; background: linear-gradient(135deg, #ffffff 40%, #93c5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${card.front}
                  </div>

                  ${card.conceptFocus && card.conceptFocus !== card.front ? `
                    <div style="font-size: 0.9rem; color: #38bdf8; font-weight: 600; margin-bottom: 10px;">
                      🔬 Focus: ${card.conceptFocus}
                    </div>
                  ` : ''}

                  ${card.formula ? `
                    <div class="flashcard-formula-box">
                      <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 4px;">
                        Key Mathematical & Scientific Formulation
                      </div>
                      <div style="font-size: 1.15rem; color: #38bdf8;">
                        ${card.formula.startsWith("$$") ? card.formula : `$$${card.formula}$$`}
                      </div>
                    </div>
                  ` : ''}

                  ${card.bigIdea ? `
                    <div class="flashcard-callout-bigidea" style="background: rgba(15, 23, 42, 0.4); border-left: 3px solid #38bdf8; padding: 10px 14px; border-radius: 0 8px 8px 0; margin: 10px 0;">
                      <div style="font-size: 0.75rem; font-weight: 700; color: #0284c7; text-transform: uppercase;">Big Idea</div>
                      <div style="font-size: 0.92rem; color: var(--text-main); line-height: 1.5; margin-top: 2px;">
                        ${formatMathText(card.bigIdea)}
                      </div>
                    </div>
                  ` : ''}

                  ${card.phenomenon ? `
                    <div class="flashcard-callout-phenomenon" style="background: rgba(15, 23, 42, 0.4); border-left: 3px solid #f59e0b; padding: 10px 14px; border-radius: 0 8px 8px 0; margin: 10px 0;">
                      <div style="font-size: 0.75rem; font-weight: 700; color: #d97706; text-transform: uppercase;">Central Phenomenon</div>
                      <div style="font-size: 0.92rem; color: var(--text-main); line-height: 1.5; margin-top: 2px;">
                        ${formatMathText(card.phenomenon)}
                      </div>
                    </div>
                  ` : ''}

                  ${card.objectives && card.objectives.length > 0 ? `
                    <div style="margin: 12px 0;">
                      <div style="font-size: 0.78rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
                        🎯 Core Objectives & Key Takeaways
                      </div>
                      <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
                        ${card.objectives.map(obj => `
                          <li style="font-size: 0.92rem; color: var(--text-main); line-height: 1.45;">
                            ${formatMathText(obj)}
                          </li>
                        `).join("")}
                      </ul>
                    </div>
                  ` : ''}

                  ${card.inquiry ? `
                    <div class="flashcard-callout-inquiry" style="background: rgba(30, 41, 59, 0.4); border-left: 3px solid #8b5cf6; padding: 10px 14px; border-radius: 0 8px 8px 0; margin: 10px 0;">
                      <div style="font-size: 0.75rem; font-weight: 700; color: #7c3aed; text-transform: uppercase;">Scientific Inquiry Workbench</div>
                      <div style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; margin-top: 2px;">
                        ${formatMathText(card.inquiry)}
                      </div>
                    </div>
                  ` : ''}

                  ${card.coreExplanation ? `
                    <div style="font-size: 0.95rem; color: var(--text-main); line-height: 1.6; margin: 10px 0; white-space: pre-line;">
                      ${formatMathText(card.coreExplanation)}
                    </div>
                  ` : ''}
                </div>

                <!-- Footer -->
                <div class="flashcard-footer">
                  <div style="font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;">
                    <span>💡 Hint:</span>
                    <span style="color: #cbd5e1;">${card.hint || "Review key principles"}</span>
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-dim); display: flex; align-items: center; gap: 4px;">
                    <span>👆 Tap or Space to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leitner Spaced Repetition Action Bar -->
          <div class="leitner-action-card">
            <div class="leitner-action-title">
              <span>Mark Mastery Stage (Leitner 3-Box System):</span>
            </div>
            <div class="leitner-action-buttons">
              <button class="leitner-box-btn btn-box1 ${currentCardBox === 1 ? 'is-active' : ''}" id="btn-leitner-box1" title="Mark for frequent practice (Hotkey: 1)">
                <span class="leitner-dot dot-red"></span>
                <span>Box 1: Needs Practice</span>
                <kbd class="leitner-kbd">1</kbd>
              </button>
              <button class="leitner-box-btn btn-box2 ${currentCardBox === 2 ? 'is-active' : ''}" id="btn-leitner-box2" title="Mark for intermediate review (Hotkey: 2)">
                <span class="leitner-dot dot-amber"></span>
                <span>Box 2: Reviewing</span>
                <kbd class="leitner-kbd">2</kbd>
              </button>
              <button class="leitner-box-btn btn-box3 ${currentCardBox === 3 ? 'is-active' : ''}" id="btn-leitner-box3" title="Mark as fully mastered (Hotkey: 3)">
                <span class="leitner-dot dot-green"></span>
                <span>Box 3: Mastered</span>
                <kbd class="leitner-kbd">3</kbd>
              </button>
            </div>
          </div>

          <!-- Bottom Navigation & Controls Row -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" id="btn-prev-card" style="padding: 10px 20px;">
                ← Previous
              </button>
              <button class="btn btn-secondary" id="btn-flip-card" style="padding: 10px 20px; border-color: rgba(56, 189, 248, 0.35);">
                ⟲ Flip Card
              </button>
              <button class="btn btn-secondary" id="btn-next-card" style="padding: 10px 20px;">
                Next Card →
              </button>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              ${card.moduleId ? `
                <button class="btn btn-secondary" id="btn-open-lesson-lab" style="padding: 10px 18px; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Launch interactive simulation for this lesson">
                  🔬 Open Lesson Lab
                </button>
              ` : ''}
              <button class="btn btn-secondary fc-speech-btn" id="btn-speech-bottom" style="padding: 10px 18px;" title="Listen to scientific pronunciation (Hotkey: P or V)">
                🔊 <span class="fc-speech-text">Pronounce</span>
              </button>
            </div>
          </div>
        ` : `
          <!-- Empty State when filter or search has 0 matches -->
          <div class="empty-state-box" style="text-align: center; padding: 48px 24px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--text-main); margin-bottom: 8px;">No Flashcards Match Your Filter</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto 20px auto;">
              Try clearing your search query, switching to "All Lessons", or choosing another STEM track.
            </p>
            <button class="btn btn-primary" id="btn-empty-reset">
              ↺ Reset All Filters
            </button>
          </div>
        `}
      </div>
    `;

    renderMathInElement(container);

    // -------------------------------------------------------------
    // EVENT BINDINGS
    // -------------------------------------------------------------

    // Flip Card Action
    const toggleArea = document.getElementById("flashcard-toggle-area");
    if (toggleArea) {
      toggleArea.addEventListener("click", (e) => {
        // Prevent flipping if speech button was clicked
        if (e.target.closest(".fc-speech-btn")) return;
        isFlipped = !isFlipped;
        SoundFX.playClick();
        cancelCardSpeech();
        const inner = container.querySelector(".flashcard-inner");
        if (inner) {
          inner.classList.toggle("is-flipped", isFlipped);
        }
      });
    }

    const btnFlip = document.getElementById("btn-flip-card");
    if (btnFlip) {
      btnFlip.addEventListener("click", () => {
        isFlipped = !isFlipped;
        SoundFX.playClick();
        cancelCardSpeech();
        const inner = container.querySelector(".flashcard-inner");
        if (inner) {
          inner.classList.toggle("is-flipped", isFlipped);
        }
      });
    }

    // Previous / Next Navigation
    const btnPrev = document.getElementById("btn-prev-card");
    if (btnPrev && deck.length > 0) {
      btnPrev.addEventListener("click", () => {
        isFlipped = false;
        cancelCardSpeech();
        currentIndex = (currentIndex - 1 + deck.length) % deck.length;
        renderView();
      });
    }

    const btnNext = document.getElementById("btn-next-card");
    if (btnNext && deck.length > 0) {
      btnNext.addEventListener("click", () => {
        isFlipped = false;
        cancelCardSpeech();
        currentIndex = (currentIndex + 1) % deck.length;
        renderView();
      });
    }

    // Reverse Challenge Mode Toggle
    const btnRev = document.getElementById("btn-toggle-reverse");
    if (btnRev) {
      btnRev.addEventListener("click", () => {
        isReverseMode = !isReverseMode;
        isFlipped = false;
        cancelCardSpeech();
        SoundFX.playClick();
        showToast(isReverseMode ? "Reverse Challenge Mode: ON 🔄" : "Standard Mode: ON", "info");
        renderView();
      });
    }

    // Leitner Box Actions
    const btnBox1 = document.getElementById("btn-leitner-box1");
    if (btnBox1 && card) {
      btnBox1.addEventListener("click", () => {
        setCardBox(card.id, 1, true);
      });
    }

    const btnBox2 = document.getElementById("btn-leitner-box2");
    if (btnBox2 && card) {
      btnBox2.addEventListener("click", () => {
        setCardBox(card.id, 2, true);
      });
    }

    const btnBox3 = document.getElementById("btn-leitner-box3");
    if (btnBox3 && card) {
      btnBox3.addEventListener("click", () => {
        setCardBox(card.id, 3, true);
      });
    }

    // Leitner Ribbon Filter Clicks
    container.querySelectorAll("[data-filter-box]").forEach(el => {
      el.addEventListener("click", () => {
        const box = el.dataset.filterBox;
        if (masteryFilter === box) {
          masteryFilter = "ALL";
        } else {
          masteryFilter = box;
        }
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        SoundFX.playClick();
        renderView();
      });
    });

    // Audio Speech Pronunciation Buttons
    container.querySelectorAll(".fc-speech-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (card) {
          speakCard(card, isFlipped, isReverseMode);
        }
      });
    });

    // Shuffle Deck
    const btnShuffle = document.getElementById("btn-shuffle-deck");
    if (btnShuffle && deck.length > 0) {
      btnShuffle.addEventListener("click", () => {
        cancelCardSpeech();
        SoundFX.playWhoosh();
        flashcardDeck.sort(() => Math.random() - 0.5);
        currentIndex = 0;
        isFlipped = false;
        showToast("Deck Shuffled! 🔀", "info");
        renderView();
      });
    }

    // Open Lesson Lab Workbench Directly
    const btnLab = document.getElementById("btn-open-lesson-lab");
    if (btnLab && card && card.moduleId) {
      btnLab.addEventListener("click", () => {
        cancelCardSpeech();
        if (typeof window.openModuleById === "function") {
          window.openModuleById(card.subject, card.moduleId, card.lessonId);
        }
      });
    }

    // Track Filter Chips
    container.querySelectorAll("[data-fsub]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentSubject = btn.dataset.fsub;
        currentModuleId = "ALL";
        currentLessonId = "ALL";
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        SoundFX.playClick();
        renderView();
      });
    });

    // Cascading Module Dropdown
    const modSelect = document.getElementById("fc-module-select");
    if (modSelect) {
      modSelect.addEventListener("change", (e) => {
        currentModuleId = e.target.value === "ALL" ? "ALL" : parseInt(e.target.value, 10);
        currentLessonId = "ALL";
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }

    // Cascading Lesson Dropdown
    const lesSelect = document.getElementById("fc-lesson-select");
    if (lesSelect) {
      lesSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "ALL") currentLessonId = "ALL";
        else if (val === "OVERVIEW") currentLessonId = "OVERVIEW";
        else currentLessonId = parseInt(val, 10);
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }

    // Mastery / Box Dropdown
    const masterySelect = document.getElementById("fc-mastery-select");
    if (masterySelect) {
      masterySelect.addEventListener("change", (e) => {
        masteryFilter = e.target.value;
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }

    // Search Input with Debounce
    const searchInput = document.getElementById("fc-search-input");
    if (searchInput) {
      let debounceTimeout = null;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          searchQuery = e.target.value;
          currentIndex = 0;
          isFlipped = false;
          cancelCardSpeech();
          renderView();
        }, 180);
      });
    }

    // Clear Search Button
    const btnClearSearch = document.getElementById("btn-clear-search");
    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        searchQuery = "";
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }

    // Helper to generate shareable deep-link URL for current deck filter
    function getShareableFlashcardUrl() {
      const qParams = [];
      if (currentSubject !== "ALL") qParams.push(`subject=${encodeURIComponent(currentSubject)}`);
      if (currentModuleId !== "ALL") qParams.push(`moduleId=${encodeURIComponent(currentModuleId)}`);
      if (currentLessonId !== "ALL") qParams.push(`lessonId=${encodeURIComponent(currentLessonId)}`);
      return `#flashcards` + (qParams.length ? `?${qParams.join("&")}` : "");
    }

    // Share Flashcard Deck
    const btnFcShare = document.getElementById("btn-fc-share");
    if (btnFcShare) {
      btnFcShare.addEventListener("click", () => {
        const shareUrl = getShareableFlashcardUrl();
        const topicName = currentModuleId !== "ALL" ? `Module ${currentModuleId}` : (currentSubject !== "ALL" ? currentSubject : "All Tracks");
        copyShareLink(shareUrl, `Interactive Flashcards: ${topicName}`);
      });
    }

    // Assign Flashcard Deck to LMS
    const btnFcLmsShare = document.getElementById("btn-fc-lms-share");
    if (btnFcLmsShare) {
      btnFcLmsShare.addEventListener("click", () => {
        const shareUrl = getShareableFlashcardUrl();
        const topicName = currentModuleId !== "ALL" ? `Module ${currentModuleId}` : (currentSubject !== "ALL" ? currentSubject : "Comprehensive Science");
        openLmsShareModal({
          url: shareUrl,
          title: `STEM Flashcards Deck: ${topicName}`,
          subject: currentSubject !== "ALL" ? currentSubject : "Science",
          description: `Interactive flashcards with Leitner Spaced Repetition mastery, publication-grade LaTeX formulas, and Text-to-Speech audio pronunciation.`
        });
      });
    }

    // Reset All Filters Button
    const btnResetFilters = document.getElementById("btn-reset-filters");
    if (btnResetFilters) {
      btnResetFilters.addEventListener("click", () => {
        currentSubject = "ALL";
        currentModuleId = "ALL";
        currentLessonId = "ALL";
        searchQuery = "";
        masteryFilter = "ALL";
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }

    const btnEmptyReset = document.getElementById("btn-empty-reset");
    if (btnEmptyReset) {
      btnEmptyReset.addEventListener("click", () => {
        currentSubject = "ALL";
        currentModuleId = "ALL";
        currentLessonId = "ALL";
        searchQuery = "";
        masteryFilter = "ALL";
        currentIndex = 0;
        isFlipped = false;
        cancelCardSpeech();
        renderView();
      });
    }
  }

  // Keyboard Navigation Listener
  const onKeyDown = (e) => {
    // Only handle if flashcards mount is currently active in the DOM
    const activeMount = document.getElementById(containerId);
    if (!activeMount) {
      window.removeEventListener("keydown", onKeyDown);
      cancelCardSpeech();
      return;
    }

    // Ignore if focus is in an input or select field
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    const deck = getFilteredDeck();
    if (deck.length === 0) return;
    const card = deck[currentIndex];

    if (e.code === "Space") {
      e.preventDefault();
      isFlipped = !isFlipped;
      SoundFX.playClick();
      cancelCardSpeech();
      const inner = container.querySelector(".flashcard-inner");
      if (inner) {
        inner.classList.toggle("is-flipped", isFlipped);
      }
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      isFlipped = false;
      cancelCardSpeech();
      currentIndex = (currentIndex - 1 + deck.length) % deck.length;
      renderView();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      isFlipped = false;
      cancelCardSpeech();
      currentIndex = (currentIndex + 1) % deck.length;
      renderView();
    } else if (e.code === "Digit1" || e.code === "Numpad1" || e.key === "1") {
      if (card) {
        e.preventDefault();
        setCardBox(card.id, 1, true);
      }
    } else if (e.code === "Digit2" || e.code === "Numpad2" || e.key === "2") {
      if (card) {
        e.preventDefault();
        setCardBox(card.id, 2, true);
      }
    } else if (e.code === "Digit3" || e.code === "Numpad3" || e.key === "3") {
      if (card) {
        e.preventDefault();
        setCardBox(card.id, 3, true);
      }
    } else if (e.code === "KeyR") {
      e.preventDefault();
      isReverseMode = !isReverseMode;
      isFlipped = false;
      cancelCardSpeech();
      SoundFX.playClick();
      showToast(isReverseMode ? "Reverse Challenge Mode: ON 🔄" : "Standard Mode: ON", "info");
      renderView();
    } else if (e.code === "KeyP" || e.code === "KeyV") {
      e.preventDefault();
      if (card) {
        speakCard(card, isFlipped, isReverseMode);
      }
    } else if (e.code === "KeyS") {
      e.preventDefault();
      cancelCardSpeech();
      SoundFX.playWhoosh();
      flashcardDeck.sort(() => Math.random() - 0.5);
      currentIndex = 0;
      isFlipped = false;
      showToast("Deck Shuffled! 🔀", "info");
      renderView();
    } else if (e.code === "KeyL") {
      if (card && card.moduleId) {
        e.preventDefault();
        cancelCardSpeech();
        if (typeof window.openModuleById === "function") {
          window.openModuleById(card.subject, card.moduleId, card.lessonId);
        }
      }
    }
  };

  window.removeEventListener("keydown", onKeyDown);
  window.addEventListener("keydown", onKeyDown);

  // Initial render
  renderView();
}
