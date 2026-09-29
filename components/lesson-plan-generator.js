// Edugates-ClipSAT Science Labs - Teacher Lesson Plan Generator & 2-Page A4 PDF Engine
// Produces rigorous, standards-aligned (NGSS 3D Learning), fully equipped 2-Page A4 instructional dossiers
// formatted with publication-grade typography, mathematical KaTeX formulas, 5E inquiry cycle, and teacher answer keys.

import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { getLessonInteractiveSpec } from "./lesson-interactives.js";
import { getLessonComprehensiveTheory } from "../data/lesson-theory-database.js";
import { renderLatex, formatMathText, upgradeAllMath } from "../utils/math-renderer.js";
import { copyShareLink } from "../utils/toast.js";
import { openLmsShareModal } from "../utils/lms-share.js";
import { exportToDocx } from "../utils/docx-export.js";

/**
 * High School NGSS Standards Reference Matrix
 */
const NGSS_STANDARDS_MAP = {
  CHEM: {
    1: { pe: "HS-PS1-3", title: "Plan and conduct an investigation to gather evidence to compare physical properties at the bulk scale to infer electrical forces.", dci: "PS1.A Structure & Properties of Matter", sep: "SEP-3 Planning and Carrying Out Investigations", ccc: "CCC-3 Scale, Proportion, and Quantity" },
    2: { pe: "HS-PS1-7", title: "Use mathematical representations to support the claim that atoms, and therefore mass, are conserved during chemical transformations.", dci: "PS1.B Chemical Reactions & Conservation of Mass", sep: "SEP-5 Using Mathematics and Computational Thinking", ccc: "CCC-5 Energy and Matter: Flows, Cycles, and Conservation" },
    3: { pe: "HS-PS1-1", title: "Use the periodic table as a model to predict the relative properties of elements based on outermost electron energy levels.", dci: "PS1.A Atomic Structure and Subatomic Particles", sep: "SEP-2 Developing and Using Models", ccc: "CCC-1 Patterns in Subatomic Organization" },
    4: { pe: "HS-PS1-8", title: "Develop models to illustrate changes in atomic nuclei composition and energy released during fission, fusion, and decay.", dci: "PS1.C Nuclear Processes & Radioactive Decay", sep: "SEP-2 Developing and Using Models", ccc: "CCC-5 Energy and Matter in Nuclear Transformations" },
    5: { pe: "HS-PS1-1", title: "Analyze spectroscopic and periodic trends to explain atomic radius, ionization energy, and electronegativity.", dci: "PS1.A Periodic Law & Electronic Shells", sep: "SEP-4 Analyzing and Interpreting Data", ccc: "CCC-1 Patterns in Periodic Periodicity" },
    6: { pe: "HS-PS1-1", title: "Predict chemical formula and lattice geometry of ionic compounds based on Coulombic electrostatic attractions.", dci: "PS1.A Ionic Bonding & Crystal Lattices", sep: "SEP-2 Developing and Using Models", ccc: "CCC-2 Cause and Effect: Electrostatic Attraction" },
    7: { pe: "HS-PS1-3", title: "Construct models to explain covalent molecular structures, Lewis octets, and VSEPR three-dimensional geometries.", dci: "PS1.A Covalent Bonding & Molecular Geometry", sep: "SEP-2 Developing and Using Models", ccc: "CCC-6 Structure and Function of Molecules" },
    8: { pe: "HS-PS1-2", title: "Construct and balance chemical equations predicting precipitation, acid-base, and redox outcomes.", dci: "PS1.B Chemical Equations & Conservation of Atoms", sep: "SEP-6 Constructing Explanations and Designing Solutions", ccc: "CCC-5 Conservation of Mass and Matter" },
    9: { pe: "HS-PS1-7", title: "Use dimensional analysis and molar stoichiometry to convert between particles, moles, and grams.", dci: "PS1.A Avogadro's Number and Molar Mass", sep: "SEP-5 Using Mathematics and Computational Thinking", ccc: "CCC-3 Scale, Proportion, and Quantity" },
    10: { pe: "HS-PS1-7", title: "Calculate theoretical yields, identify limiting reactants, and compute experimental percent yields.", dci: "PS1.B Quantitative Stoichiometric Equivalence", sep: "SEP-5 Mathematical Modeling of Chemical Systems", ccc: "CCC-5 Matter Conservation in Stoichiometry" },
    11: { pe: "HS-PS1-3", title: "Relate intermolecular forces (dispersion, dipole, hydrogen bonding) to states of matter and phase equilibria.", dci: "PS1.A Intermolecular Attractions & Phase Transitions", sep: "SEP-2 Modeling Particulate Phase Changes", ccc: "CCC-2 Cause and Effect in Intermolecular Forces" },
    12: { pe: "HS-PS1-3", title: "Apply Kinetic Molecular Theory and gas laws (Boyle, Charles, Ideal) to pressure-volume-temperature systems.", dci: "PS1.A Gas Behavior & Kinetic Theory", sep: "SEP-5 Computational Gas Law Equations", ccc: "CCC-4 Systems and System Models" },
    13: { pe: "HS-PS1-3", title: "Calculate solution molarity, colligative freezing point depression, and boiling point elevation.", dci: "PS1.A Aqueous Solutions & Colligative Properties", sep: "SEP-5 Quantitative Solution Calculations", ccc: "CCC-3 Scale, Proportion, and Concentration" },
    14: { pe: "HS-PS1-4", title: "Develop thermochemical equations and Hess's Law cycles to calculate reaction enthalpy (ΔH) and heat transfer.", dci: "PS1.B Chemical Bond Energy & Enthalpy", sep: "SEP-5 Using Mathematics in Calorimetry", ccc: "CCC-5 Energy Flow in Chemical Transformations" },
    15: { pe: "HS-PS1-5", title: "Investigate collision theory parameters (concentration, surface area, temperature, catalysts) on reaction rates.", dci: "PS1.B Reaction Rates and Activation Barriers", sep: "SEP-3 Planning and Carrying Out Kinetics Labs", ccc: "CCC-2 Cause and Effect in Molecular Collisions" },
    16: { pe: "HS-PS1-6", title: "Apply Le Chatelier's principle and equilibrium constant (Keq) to shift dynamic chemical equilibria.", dci: "PS1.B Dynamic Equilibrium & Reaction Reversibility", sep: "SEP-6 Designing Equilibrium Optimization", ccc: "CCC-7 Stability and Change in Closed Systems" },
    17: { pe: "HS-PS1-2", title: "Analyze acid-base titrations, pH/pOH logarithmic calculations, and Brønsted-Lowry neutralization.", dci: "PS1.B Proton Transfer & Buffer Equilibria", sep: "SEP-3 Conducting Precision Volumetric Titrations", ccc: "CCC-2 Cause and Effect: Hydronium Concentration" },
    18: { pe: "HS-PS1-2", title: "Model oxidation numbers, electron transfer, and galvanic voltaic cell electrical potential.", dci: "PS1.B Reduction-Oxidation & Electrochemistry", sep: "SEP-2 Developing Electrochemical Models", ccc: "CCC-5 Energy Conversion: Chemical to Electrical" }
  },
  BIO: {
    1: { pe: "HS-LS2-1", title: "Use mathematical representations to support explanations of factors affecting ecosystems and carrying capacities.", dci: "LS2.A Interdependent Relationships in Ecosystems", sep: "SEP-5 Using Mathematics and Computational Thinking", ccc: "CCC-3 Scale, Proportion, and Quantity" },
    2: { pe: "HS-LS2-2", title: "Use mathematical models to support explanations about biodiversity and population dynamics under limiting factors.", dci: "LS2.C Ecosystem Dynamics and Resilience", sep: "SEP-2 Developing Computational Population Models", ccc: "CCC-7 Stability and Change in Communities" },
    3: { pe: "HS-LS2-4", title: "Construct models to illustrate ecological succession and trophic 10% energy pyramids.", dci: "LS2.B Cycles of Matter and Energy Transfer", sep: "SEP-2 Modeling Biome Energy Flow", ccc: "CCC-5 Energy and Matter in Trophic Levels" },
    6: { pe: "HS-LS1-2", title: "Develop and use a model to illustrate the hierarchical organization of organelles within eukaryotic and prokaryotic cells.", dci: "LS1.A Structure and Function of Living Cells", sep: "SEP-2 Developing Microscopic Cell Models", ccc: "CCC-6 Structure and Function of Organelles" },
    7: { pe: "HS-LS1-3", title: "Plan and conduct investigations on cellular transport across semipermeable lipid bilayers (osmosis and diffusion).", dci: "LS1.A Cellular Membrane Homeostasis", sep: "SEP-3 Planning and Carrying Out Investigations", ccc: "CCC-4 Systems and System Models" },
    8: { pe: "HS-LS1-5", title: "Use a model to illustrate how photosynthesis transforms light energy into stored chemical glucose energy.", dci: "LS1.C Photosynthetic Light Reactions & Calvin Cycle", sep: "SEP-2 Modeling Biochemical Energetics", ccc: "CCC-5 Energy and Matter Transformations" },
    9: { pe: "HS-LS1-4", title: "Use a model to illustrate cellular division (mitosis and cytokinesis) in tissue maintenance and genetic consistency.", dci: "LS1.A The Cell Cycle, Checkpoints, and Mitosis", sep: "SEP-2 Developing Chromosomal Models", ccc: "CCC-4 Systems and Feedback in Cell Cycle" },
    10: { pe: "HS-LS3-3", title: "Apply concepts of statistics and probability to explain variation and distribution of expressed Mendelian traits.", dci: "LS3.B Variation of Traits and Punnett Squares", sep: "SEP-4 Analyzing Genetic Inheritance Data", ccc: "CCC-1 Patterns of Monohybrid & Dihybrid Crosses" },
    11: { pe: "HS-LS1-1", title: "Construct an explanation based on evidence for how DNA double-helix sequence codes for protein synthesis.", dci: "LS1.A DNA, Transcription, and Translation", sep: "SEP-6 Constructing Explanations from Evidence", ccc: "CCC-6 Structure and Function of Macromolecules" },
    12: { pe: "HS-LS3-2", title: "Evaluate biological technologies (CRISPR gene editing, PCR, recombinant DNA) in clinical and agricultural contexts.", dci: "LS3.B Biotechnology and Genomic Modification", sep: "SEP-8 Obtaining, Evaluating, and Communicating Information", ccc: "CCC-2 Cause and Effect in Genetic Engineering" },
    14: { pe: "HS-LS4-2", title: "Construct an explanation based on evidence that natural selection leads to adaptation in populations over generations.", dci: "LS4.B Natural Selection and Adaptation", sep: "SEP-6 Explaining Speciation and Allele Drift", ccc: "CCC-2 Cause and Effect in Evolutionary Fitness" }
  },
  PHYS: {
    1: { pe: "HS-PS2-1", title: "Analyze data to support the claim that displacement, velocity, and uniform acceleration govern 1D kinematics.", dci: "PS2.A Kinematics and Linear Motion", sep: "SEP-4 Analyzing and Interpreting Motion Data", ccc: "CCC-3 Scale, Proportion, and Quantitative Motion" },
    2: { pe: "HS-PS2-1", title: "Use mathematical representations of vector addition and resolving components to model resultant velocities.", dci: "PS2.A Vector Quantities in Mechanics", sep: "SEP-5 Using Mathematics and Vectors", ccc: "CCC-4 Systems and Coordinate Reference Frames" },
    3: { pe: "HS-PS2-1", title: "Apply Newton's Laws of Motion (F=ma) to multi-body systems, tension, and frictional force balances.", dci: "PS2.A Forces and Newton's Three Laws", sep: "SEP-6 Constructing Free-Body Explanations", ccc: "CCC-2 Cause and Effect: Net Force and Acceleration" },
    4: { pe: "HS-PS2-4", title: "Use mathematical representations of universal gravitation to predict orbital trajectories and planetary motion.", dci: "PS2.B Gravitational Fields and Inverse-Square Law", sep: "SEP-5 Computing Gravitational Interactions", ccc: "CCC-1 Patterns in Celestial Orbits" },
    5: { pe: "HS-PS2-1", title: "Analyze projectile kinematics separating horizontal constant velocity from vertical gravitational acceleration.", dci: "PS2.A Two-Dimensional Projectile Motion", sep: "SEP-5 Mathematical Modeling of Trajectories", ccc: "CCC-4 Systems and Trajectory Modeling" },
    9: { pe: "HS-PS2-2", title: "Use mathematical representations to support the claim that total momentum is conserved during isolated collisions.", dci: "PS2.A Momentum Conservation and Impulse (J=Δp)", sep: "SEP-5 Quantitative Conservation Calculations", ccc: "CCC-5 Conservation of Momentum in Collisions" },
    10: { pe: "HS-PS3-1", title: "Calculate mechanical work, kinetic energy, gravitational potential energy, and power in conservative systems.", dci: "PS3.A Mechanical Energy and Work-Energy Theorem", sep: "SEP-5 Computational Energy Accounting", ccc: "CCC-5 Conservation of Mechanical Energy" },
    13: { pe: "HS-PS4-1", title: "Use mathematical representations to support relationships among frequency, wavelength, and wave speed (v=fλ).", dci: "PS4.A Wave Properties, Interference, and Resonance", sep: "SEP-5 Mathematical Wave Formulations", ccc: "CCC-1 Patterns in Harmonic Waveforms" },
    15: { pe: "HS-PS4-3", title: "Model optical reflection, Snell's law refraction, thin-lens ray tracing, and focal point formation.", dci: "PS4.B Geometric Optics and Light Refraction", sep: "SEP-2 Developing Optical Ray Tracing Models", ccc: "CCC-6 Structure and Function of Lenses" },
    18: { pe: "HS-PS2-4", title: "Use Coulomb's law to describe and calculate electrostatic forces between point charges.", dci: "PS2.B Electrostatic Forces and Coulomb's Law", sep: "SEP-5 Computing Electrostatic Force Fields", ccc: "CCC-2 Cause and Effect: Inverse-Square Electric Force" },
    20: { pe: "HS-PS2-5", title: "Analyze electric circuits applying Ohm's law, Kirchhoff's rules, and equivalent resistance in series/parallel.", dci: "PS3.A Electric Current, Potential (Voltage), Resistance", sep: "SEP-3 Building and Measuring Circuit Topologies", ccc: "CCC-4 Circuit Systems and Current Conservation" },
    24: { pe: "HS-PS1-8", title: "Model mass-energy equivalence (E=mc²), nuclear binding energy, and controlled fission chain reactions.", dci: "PS1.C Nuclear Physics, Fission, and Stellar Fusion", sep: "SEP-2 Developing Subatomic Energy Models", ccc: "CCC-5 Energy-Mass Conservation in Nuclear Reactions" }
  }
};

/**
 * Resolves curriculum metadata and lesson components
 */
export function buildLessonPlanData(subjectCode, moduleId, lessonId, overrides = {}) {
  const code = (subjectCode || "CHEM").toUpperCase().split("-")[0];
  const mId = parseInt(moduleId, 10) || 1;
  const lId = parseInt(lessonId, 10) || 1;

  let curr = chemistryCurriculum;
  if (code === "BIO") curr = biologyCurriculum;
  if (code === "PHYS") curr = physicsCurriculum;

  const moduleData = curr.modules.find(m => m.id === mId) || curr.modules[0];
  const lessonData = (moduleData.lessons || []).find(l => l.id === lId) || (moduleData.lessons && moduleData.lessons[0]) || {
    id: lId,
    title: `Lesson ${lId}: Science Principles`,
    objectives: ["Analyze core concepts", "Apply quantitative calculations"]
  };

  const spec = getLessonInteractiveSpec(code, mId, lId);
  const theory = getLessonComprehensiveTheory(code, mId, lId, lessonData.title, moduleData);

  // Standards resolution
  const subStandards = NGSS_STANDARDS_MAP[code] || {};
  const standard = subStandards[mId] || {
    pe: `${code === "CHEM" ? "HS-PS1-1" : code === "BIO" ? "HS-LS1-2" : "HS-PS2-1"}`,
    title: `Investigate and model ${lessonData.title} through empirical experimentation and data analysis.`,
    dci: `${code}-Core Discipline: ${moduleData.title}`,
    sep: "SEP-2 Developing and Using Models & SEP-5 Computational Thinking",
    ccc: "CCC-2 Cause and Effect & CCC-5 Energy and Matter Conservation"
  };

  // Vocabulary extraction
  const vocabList = generateVocabulary(code, moduleData, lessonData, theory);

  // Safety protocol
  const safety = generateSafetyProtocol(code, moduleData.title);

  // Materials & Virtual Setup
  const materials = generateMaterialsList(code, moduleData, lessonData, spec);

  // 5E Cycle Protocol
  const fiveE = generate5ECycle(code, moduleData, lessonData, spec, theory);

  // Differentiation
  const diff = generateDifferentiation(code, lessonData, spec);

  // Assessment & Exit Ticket
  const assessment = generateExitTicket(code, moduleData, lessonData, spec, theory);

  return {
    meta: {
      platform: "Edugates-ClipSAT Science Labs",
      curriculumName: `McGraw-Hill Inspire ${curr.subject}`,
      subject: curr.subject,
      subjectCode: code,
      subjectColor: curr.color,
      moduleCode: moduleData.code,
      moduleTitle: moduleData.title,
      unitTitle: moduleData.unit || "Core Instructional Unit",
      lessonId: lessonData.id,
      lessonTitle: lessonData.title,
      gradeLevel: overrides.gradeLevel || "High School (Grades 9–12 / AP / Honors)",
      duration: overrides.duration || "50 Minutes (Standard Period) / 90 Min (Block)",
      teacherName: overrides.teacherName || "Lead Science Instructor",
      schoolName: overrides.schoolName || "Edugates International School",
      date: overrides.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      roomPeriod: overrides.roomPeriod || "Period 3 • Science Laboratory"
    },
    standards: standard,
    phenomenon: moduleData.phenomenon || "Natural phenomenon governing physical observations.",
    drivingQuestion: `How does the fundamental mechanism of ${lessonData.title.toLowerCase()} explain the observed macroscopic phenomenon and enable predictive engineering models?`,
    objectives: lessonData.objectives && lessonData.objectives.length > 0 
      ? lessonData.objectives.map(o => `SWBAT ${o.charAt(0).toLowerCase() + o.slice(1)} utilizing empirical simulator telemetry.`)
      : [`SWBAT evaluate and quantify ${lessonData.title.toLowerCase()} using mathematical and conceptual models.`],
    vocabulary: vocabList,
    formula: spec.formula || theory.formula || "\\text{Rate} = \\frac{\\Delta \\text{Quantity}}{\\Delta t}",
    materials,
    safety,
    fiveE,
    differentiation: diff,
    assessment
  };
}

/**
 * Vocabulary Generator
 */
function generateVocabulary(code, moduleData, lessonData, theory) {
  const defaults = {
    CHEM: [
      { term: "Stoichiometry", def: "The quantitative relationship between reactants and products in chemical reactions." },
      { term: "Limiting Reactant", def: "The substance totally consumed that determines the maximum product yield." },
      { term: "Activation Energy", def: "Minimum kinetic energy required for reacting particles to initiate a transformation." },
      { term: "Equilibrium Constant", def: "Mathematical ratio of product concentrations to reactant concentrations at dynamic balance." }
    ],
    BIO: [
      { term: "Homeostasis", def: "Physiological steady-state maintained through active biological feedback mechanisms." },
      { term: "Allele Frequency", def: "The relative proportion of a gene variant within an interbreeding population." },
      { term: "Transcription", def: "Synthesis of complementary messenger RNA from an antisense DNA template strand." },
      { term: "Enzyme Catalysis", def: "Acceleration of metabolic reactions via transition-state stabilization." }
    ],
    PHYS: [
      { term: "Conservation of Momentum", def: "The total momentum of an isolated physical system remains constant over time." },
      { term: "Kinetic Energy", def: "Mechanical energy of motion proportional to mass and velocity squared." },
      { term: "Electric Potential", def: "Work required per unit electric charge to move it across an electrostatic field." },
      { term: "Harmonic Resonance", def: "Maximum vibrational amplitude occurring when driving frequency matches natural frequency." }
    ]
  };

  const list = defaults[code] || defaults.CHEM;
  return list;
}

/**
 * Lab Safety Generator
 */
function generateSafetyProtocol(code, title) {
  if (code === "CHEM") {
    return "ANSI Z87.1 splash goggles, chemical-resistant neoprene apron, nitrile gloves. Operate volatile or exothermic reagents strictly within certified fume hoods. Dispose heavy metal and halogenated wastes in designated hazardous satellite containers.";
  } else if (code === "BIO") {
    return "Biosafety Level 1 (BSL-1) standards. Wear lab coats and gloves during cell culture and microscopy staining. Autoclave or 10% bleach-disinfect all biological materials prior to disposal. Wash hands thoroughly before leaving the wet laboratory.";
  } else {
    return "Eye protection mandatory during kinetic projectile launches and high-tension spring operations. Verify zero residual charge on capacitors before circuit contact. Do not look directly into laser diode apertures (Class 2/3R safety precautions).";
  }
}

/**
 * Materials & Simulator Generator
 */
function generateMaterialsList(code, moduleData, lessonData, spec) {
  return {
    digital: `Edugates-ClipSAT 60FPS Virtual Simulation Workbench [Interactive ID: ${spec.type || 'sim-core'}]`,
    hardware: "Interactive Smartboard / Class Projector, Chromebooks / Tablets (1:1 or 2:1 student ratio)",
    wetLabSupplies: code === "CHEM"
      ? "Graduated cylinders (50 mL), digital analytical balance (±0.01 g), buret & ring stand, pH probes, safety goggles."
      : code === "BIO"
      ? "Compound light microscopes (40x–1000x), prepared specimen slides, micropipettes, Petri dishes, immersion oil."
      : "Dynamics cart & friction track, photogates & digital timers, spring scales (5N/10N), DC power supply, multimeters."
  };
}

/**
 * 5E Instructional Cycle Generator
 */
function generate5ECycle(code, moduleData, lessonData, spec, theory) {
  return [
    {
      phase: "Engage",
      time: "8 Min",
      teacherAction: `Project the anchoring phenomenon ("${moduleData.phenomenon}"). Prompt students to write an initial 2-minute diagnostic prediction in science notebooks.`,
      studentAction: "Observe macroscopic visual clues, identify anomalies, and write an initial hypothesis using Claim-Evidence stems.",
      misconception: "Students frequently confuse macroscopic properties with single-particle atomic/subatomic behaviors."
    },
    {
      phase: "Explore",
      time: "18 Min",
      teacherAction: `Direct students to launch the interactive simulator: "${spec.title}". Circulate to verify systematic independent variable modulation and data logging.`,
      studentAction: "Manipulate digital simulator parameters across at least 4 test trials. Record dependent variables in quantitative data tables and graph trends.",
      misconception: "Overlooking control variables; students must isolate a single variable at a time to establish causality."
    },
    {
      phase: "Explain",
      time: "12 Min",
      teacherAction: `Synthesize data from student trials onto the Smartboard. Formally introduce the governing scientific law and mathematical formulation: $${spec.formula}$.`,
      studentAction: "Construct formal Claim-Evidence-Reasoning (CER) arguments justifying how simulator data proves the theoretical law.",
      misconception: "Assuming correlation proves causation without articulating the underlying particulate/physical mechanism."
    },
    {
      phase: "Elaborate",
      time: "7 Min",
      teacherAction: "Introduce a real-world engineering challenge or aerospace/biomedical scenario applying this principle under non-ideal, constrained conditions.",
      studentAction: "Work in pairs to calculate design tolerances or predict system outcomes using the newly derived mathematical model.",
      misconception: "Failing to account for real-world losses (friction, air resistance, heat dissipation, incomplete yields)."
    },
    {
      phase: "Evaluate",
      time: "5 Min",
      teacherAction: "Administer the 2-question formative Exit Ticket. Collect digital/paper responses for immediate instructional mastery analysis.",
      studentAction: "Complete the Exit Ticket independently without peer assistance to demonstrate individual conceptual and computational mastery.",
      misconception: "Rushing calculations without verifying units or dimensional consistency."
    }
  ];
}

/**
 * Differentiation Strategies
 */
function generateDifferentiation(code, lessonData, spec) {
  return {
    support: "Provide structured graphic organizers with pre-labeled axes and sentence frames for CER explanations. Allow visual replay of simulator test runs with step-by-step telemetry callouts.",
    extension: "Challenge students to model non-ideal boundary conditions (e.g., variable damping, non-stoichiometric side reactions, or non-linear resistance) and derive percent discrepancy equations."
  };
}

/**
 * Formative Assessment & Exit Ticket Generator
 */
function generateExitTicket(code, moduleData, lessonData, spec, theory) {
  return {
    q1: `Conceptual Check: Explain how an increase in the primary independent variable in "${lessonData.title}" directly alters system equilibrium or kinetic output at the microscopic scale.`,
    q2: `Quantitative Application: Given experimental conditions where variables double, calculate the resulting factor change using governing equation [ $${spec.formula}$ ].`,
    answerKey: `1. Direct causal link: increasing parameter intensifies particle collisions or field interaction, shifting dynamic rate. 2. Proportional computation: applying the governing law yields the exact calculated multiplier according to standard conservation laws. Full credit requires correct units and a 1-sentence mechanistic justification.`
  };
}

/**
 * Renders the Strict 2-Page A4 Document HTML
 */
export function renderLessonPlanA4Html(plan, customMeta = {}) {
  const p = {
    ...plan,
    meta: { ...plan.meta, ...customMeta }
  };

  const accentColor = p.meta.subjectColor || "#0284c7";

  // Adaptive formula sizing & wrapping calculation
  const formulaRaw = (p.formula || "").trim();
  const formulaLen = formulaRaw.length;
  let formulaSizeClass = "lp-formula-standard";
  if (formulaLen > 100) {
    formulaSizeClass = "lp-formula-xl";
  } else if (formulaLen > 65) {
    formulaSizeClass = "lp-formula-lg";
  } else if (formulaLen > 35) {
    formulaSizeClass = "lp-formula-md";
  } else {
    formulaSizeClass = "lp-formula-sm";
  }
  const displayFormula = formulaRaw.includes("\\displaystyle") ? formulaRaw : `\\displaystyle ${formulaRaw}`;

  return `
    <div class="lp-document-wrapper" id="lesson-plan-print-root">
      <!-- ==========================================
           PAGE 1: STANDARDS, OBJECTIVES & PREPARATION
           ========================================== -->
      <section class="lp-a4-page" id="lp-page-1">
        <!-- Document Header -->
        <header class="lp-header">
          <div class="lp-header-brand">
            <div class="lp-logo-mark" style="border-color: ${accentColor};">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.31L4.62 19.3A2 2 0 0 0 6.38 22h11.24a2 2 0 0 0 1.76-2.7L14 9.31V2"/>
                <path d="M8.5 2h7"/>
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
              </svg>
            </div>
            <div>
              <div class="lp-super-title">Edugates International School • Master Instructional Dossier</div>
              <h1 class="lp-main-title">${p.meta.curriculumName}</h1>
            </div>
          </div>
          <div class="lp-header-badge" style="background: ${accentColor}18; border-color: ${accentColor}; color: ${accentColor};">
            <span>Official Curriculum Plan</span>
            <strong>${p.meta.moduleCode}</strong>
          </div>
        </header>

        <!-- Course & Lesson Metadata Bar -->
        <div class="lp-meta-strip">
          <div class="lp-meta-cell">
            <span class="lp-meta-label">Module / Chapter:</span>
            <span class="lp-meta-val">${p.meta.moduleTitle}</span>
          </div>
          <div class="lp-meta-cell">
            <span class="lp-meta-label">Lesson Focus:</span>
            <span class="lp-meta-val font-bold">Lesson ${p.meta.lessonId}: ${p.meta.lessonTitle}</span>
          </div>
          <div class="lp-meta-cell">
            <span class="lp-meta-label">Target Duration:</span>
            <span class="lp-meta-val">${p.meta.duration}</span>
          </div>
          <div class="lp-meta-cell">
            <span class="lp-meta-label">Grade Band:</span>
            <span class="lp-meta-val">${p.meta.gradeLevel}</span>
          </div>
        </div>

        <!-- Instructor Fillable Ribbon -->
        <div class="lp-instructor-ribbon">
          <div class="lp-ribbon-item"><strong>Instructor:</strong> <span class="lp-editable-field">${p.meta.teacherName}</span></div>
          <div class="lp-ribbon-item"><strong>Institution:</strong> <span class="lp-editable-field">${p.meta.schoolName}</span></div>
          <div class="lp-ribbon-item"><strong>Date:</strong> <span class="lp-editable-field">${p.meta.date}</span></div>
          <div class="lp-ribbon-item"><strong>Period / Room:</strong> <span class="lp-editable-field">${p.meta.roomPeriod}</span></div>
        </div>

        <!-- NGSS 3D Standards Alignment Box -->
        <div class="lp-card lp-standards-card" style="border-left-color: ${accentColor};">
          <div class="lp-card-header">
            <span class="lp-card-tag" style="background: ${accentColor}; color: #ffffff;">Next Generation Science Standards (NGSS)</span>
            <span class="lp-standard-pe-code">${p.standards.pe}</span>
          </div>
          <p class="lp-pe-desc"><strong>Performance Expectation:</strong> ${p.standards.title}</p>
          <div class="lp-3d-grid">
            <div class="lp-3d-col">
              <div class="lp-3d-title" style="color: #0284c7;">Science &amp; Engineering Practices</div>
              <p>${p.standards.sep}</p>
            </div>
            <div class="lp-3d-col">
              <div class="lp-3d-title" style="color: #d97706;">Disciplinary Core Ideas</div>
              <p>${p.standards.dci}</p>
            </div>
            <div class="lp-3d-col">
              <div class="lp-3d-title" style="color: #059669;">Crosscutting Concepts</div>
              <p>${p.standards.ccc}</p>
            </div>
          </div>
        </div>

        <!-- Phenomenon & Essential Driving Question -->
        <div class="lp-grid-2col">
          <div class="lp-card lp-phenom-box">
            <div class="lp-sec-title">Anchoring Phenomenon</div>
            <div class="lp-phenom-quote">"${p.phenomenon}"</div>
          </div>
          <div class="lp-card lp-driving-box">
            <div class="lp-sec-title">Essential Driving Question</div>
            <div class="lp-driving-question">${p.drivingQuestion}</div>
          </div>
        </div>

        <!-- Measurable Learning Targets (SWBAT) -->
        <div class="lp-card">
          <div class="lp-sec-title">Measurable Student Learning Targets (SWBAT)</div>
          <ul class="lp-objectives-list">
            ${p.objectives.map(obj => `<li>${formatMathText(obj)}</li>`).join("")}
          </ul>
        </div>

        <!-- Academic Vocabulary & Mathematical Laws -->
        <div class="lp-grid-2col">
          <div class="lp-card">
            <div class="lp-sec-title">Academic &amp; Scientific Vocabulary</div>
            <div class="lp-vocab-grid">
              ${p.vocabulary.map(v => `
                <div class="lp-vocab-item">
                  <strong>${v.term}:</strong> <span>${formatMathText(v.def)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="lp-card">
            <div class="lp-sec-title">Governing Mathematical Law / Equation</div>
            <div class="lp-formula-display ${formulaSizeClass}">
              ${renderLatex(displayFormula, false)}
            </div>
            <div class="lp-formula-meta">
              <span>Standard Metric / SI Notation</span>
              <span>Theoretical Predictive Model</span>
            </div>
          </div>
        </div>

        <!-- Required Materials, Digital Workbench & Lab Safety Protocol -->
        <div class="lp-card lp-prep-card">
          <div class="lp-sec-title">Laboratory Preparation &amp; Mandatory Safety Protocol</div>
          <div class="lp-prep-grid">
            <div>
              <strong>Digital Laboratory Simulation:</strong>
              <p>${formatMathText(p.materials.digital)}</p>
              <strong>Apparatus &amp; Physical Reagents:</strong>
              <p>${formatMathText(p.materials.wetLabSupplies)}</p>
            </div>
            <div class="lp-safety-warning-box">
              <div class="lp-safety-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>OSHA / NSTA Laboratory Safety Compliance</span>
              </div>
              <p class="lp-safety-text">${formatMathText(p.safety)}</p>
            </div>
          </div>
        </div>

        <!-- Page 1 Footer -->
        <footer class="lp-page-footer">
          <span>Edugates International School • Instructional Framework Dossier</span>
          <span>Confidential Teacher Document</span>
          <span class="lp-page-num">Page 1 of 2</span>
        </footer>
      </section>

      <!-- ==========================================
           PAGE 2: 5E INSTRUCTIONAL CYCLE & ASSESSMENT
           ========================================== -->
      <section class="lp-a4-page" id="lp-page-2">
        <!-- Top Mini Header -->
        <header class="lp-page2-header">
          <div>
            <span class="lp-mini-tag">${p.meta.subject} • ${p.meta.moduleCode}</span>
            <span class="lp-page2-title">Lesson ${p.meta.lessonId}: ${p.meta.lessonTitle}</span>
          </div>
          <div class="lp-page2-meta">
            <span>5E Instructional Delivery &amp; Formative Evaluation</span>
            <span class="lp-page-badge">Page 2 of 2</span>
          </div>
        </header>

        <!-- 5E Instructional Protocol & Pacing Matrix -->
        <div class="lp-card lp-5e-card">
          <div class="lp-sec-title">5E Inquiry Instructional Sequence &amp; Classroom Timeline</div>
          <table class="lp-5e-table">
            <thead>
              <tr>
                <th style="width: 14%;">5E Phase &amp; Time</th>
                <th style="width: 43%;">Teacher Facilitation &amp; Prompting</th>
                <th style="width: 43%;">Student Action &amp; Evidence of Learning</th>
              </tr>
            </thead>
            <tbody>
              ${p.fiveE.map(step => `
                <tr>
                  <td class="lp-phase-cell">
                    <span class="lp-phase-badge">${step.phase}</span>
                    <span class="lp-phase-time">${step.time}</span>
                  </td>
                  <td>
                    <div class="lp-phase-action">${formatMathText(step.teacherAction)}</div>
                    <div class="lp-misconception-callout">
                      <strong>Misconception:</strong> ${formatMathText(step.misconception)}
                    </div>
                  </td>
                  <td>
                    <div class="lp-phase-action">${formatMathText(step.studentAction)}</div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Differentiated Instruction & Tiered Accommodations -->
        <div class="lp-grid-2col">
          <div class="lp-card lp-diff-card">
            <div class="lp-sec-title" style="color: #0369a1;">Tier 1 &amp; 2 Support (ELL / IEP / Scaffolded)</div>
            <p class="lp-diff-text">${formatMathText(p.differentiation.support)}</p>
          </div>
          <div class="lp-card lp-diff-card">
            <div class="lp-sec-title" style="color: #7c3aed;">Tier 3 Extension (Advanced / Gifted / AP STEM)</div>
            <p class="lp-diff-text">${formatMathText(p.differentiation.extension)}</p>
          </div>
        </div>

        <!-- Formative Assessment & Exit Ticket with Teacher Answer Key -->
        <div class="lp-card lp-assessment-card">
          <div class="lp-sec-title">Formative Assessment &amp; Independent Exit Ticket</div>
          <div class="lp-exit-ticket-box">
            <div class="lp-exit-q">
              <strong>Task 1 (Qualitative / Mechanism):</strong> ${formatMathText(p.assessment.q1)}
            </div>
            <div class="lp-exit-q" style="margin-top: 6px;">
              <strong>Task 2 (Quantitative / Modeling):</strong> ${formatMathText(p.assessment.q2)}
            </div>
          </div>

          <!-- Teacher Rubric & Answer Key -->
          <div class="lp-answer-key-box">
            <div class="lp-key-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Teacher Answer Key &amp; Scoring Rubric Criteria</span>
            </div>
            <p class="lp-key-text">${formatMathText(p.assessment.answerKey)}</p>
          </div>
        </div>

        <!-- Teacher Notes & Reflection Box -->
        <div class="lp-card lp-notes-card">
          <div class="lp-sec-title">Post-Instructional Reflection &amp; Pacing Adjustments</div>
          <div class="lp-notes-lines">
            <div class="lp-line"></div>
            <div class="lp-line"></div>
          </div>
        </div>

        <!-- Page 2 Footer -->
        <footer class="lp-page-footer">
          <span>Edugates International School • Comprehensive 2-Page A4 Teacher Plan</span>
          <span>Aligned with Inspire STEM &amp; Next Generation Science Standards</span>
          <span class="lp-page-num">Page 2 of 2</span>
        </footer>
      </section>
    </div>
  `;
}

/**
 * Opens the Interactive 2-Page A4 Teacher Lesson Plan Preview Modal
 */
export function openLessonPlanModal(subjectCode, moduleId, lessonId) {
  let overlay = document.getElementById("lesson-plan-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "lesson-plan-modal-overlay";
    overlay.className = "lp-modal-overlay";
    document.body.appendChild(overlay);
  }

  // Generate Initial Data
  const planData = buildLessonPlanData(subjectCode, moduleId, lessonId);

  overlay.innerHTML = `
    <div class="lp-modal-shell">
      <!-- Top Sticky Action Bar (Hidden in Print) -->
      <div class="lp-toolbar-bar no-print">
        <div class="lp-toolbar-left">
          <div class="lp-toolbar-badge">A4 2-Page Strict Layout</div>
          <div class="lp-toolbar-title">
            <strong>${planData.meta.subject} • ${planData.meta.moduleCode}</strong>: Lesson ${planData.meta.lessonId} Teacher Plan
          </div>
        </div>

        <div class="lp-toolbar-controls">
          <div class="lp-input-group">
            <label for="lp-inp-teacher">Instructor:</label>
            <input type="text" id="lp-inp-teacher" value="${planData.meta.teacherName}" class="lp-mini-input" placeholder="Teacher Name">
          </div>
          <div class="lp-input-group">
            <label for="lp-inp-school">Institution:</label>
            <input type="text" id="lp-inp-school" value="${planData.meta.schoolName}" class="lp-mini-input" placeholder="Edugates International School">
          </div>
          <div class="lp-input-group">
            <label for="lp-inp-period">Period:</label>
            <input type="text" id="lp-inp-period" value="${planData.meta.roomPeriod}" class="lp-mini-input" placeholder="Period/Room" style="width: 140px;">
          </div>

          <button id="btn-lp-share" class="btn btn-secondary lp-btn-share" title="Copy shareable link to this Lesson Plan" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: #f8fafc; cursor: pointer;">
            <span>🔗 Share</span>
          </button>

          <button id="btn-lp-lms-share" class="btn btn-secondary lp-btn-lms" title="Assign / Share this Lesson Plan to Google Classroom, Classera, Canvas, or Teams" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; cursor: pointer;">
            <span>📤 Assign to LMS</span>
          </button>

          <button id="btn-lp-docx" class="btn btn-secondary lp-btn-docx" title="Export as Editable Microsoft Word (.docx) Document" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; cursor: pointer;">
            <span>📄 Save as .docx</span>
          </button>

          <button id="btn-lp-print" class="btn btn-primary lp-btn-print" title="Print or Save as PDF (Strict 2 A4 Pages)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Print / Save PDF (2 Pages)</span>
          </button>

          <button id="btn-lp-close" class="lp-btn-close" title="Close Preview">✕</button>
        </div>
      </div>

      <!-- Scrollable Preview Container for the 2 A4 Pages -->
      <div class="lp-preview-viewport">
        <div id="lp-render-target">
          ${renderLessonPlanA4Html(planData)}
        </div>
      </div>
    </div>
  `;

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Re-run KaTeX math upgrade on rendered equations
  upgradeAllMath(overlay);

  // Dynamic Metadata updates
  function updateLiveFields() {
    const teacher = document.getElementById("lp-inp-teacher")?.value || planData.meta.teacherName;
    const school = document.getElementById("lp-inp-school")?.value || planData.meta.schoolName;
    const period = document.getElementById("lp-inp-period")?.value || planData.meta.roomPeriod;

    const target = document.getElementById("lp-render-target");
    if (target) {
      target.innerHTML = renderLessonPlanA4Html(planData, {
        teacherName: teacher,
        schoolName: school,
        roomPeriod: period
      });
      upgradeAllMath(target);
    }
  }

  document.getElementById("lp-inp-teacher")?.addEventListener("input", updateLiveFields);
  document.getElementById("lp-inp-school")?.addEventListener("input", updateLiveFields);
  document.getElementById("lp-inp-period")?.addEventListener("input", updateLiveFields);

  // Share Actions
  document.getElementById("btn-lp-share")?.addEventListener("click", () => {
    const planRoute = `#plan/${planData.meta.subjectCode}-M${planData.meta.moduleId}-L${planData.meta.lessonId}`;
    copyShareLink(planRoute, `${planData.meta.subject} ${planData.meta.moduleCode}: Lesson ${planData.meta.lessonId} Plan`);
  });

  document.getElementById("btn-lp-lms-share")?.addEventListener("click", () => {
    const planRoute = `#plan/${planData.meta.subjectCode}-M${planData.meta.moduleId}-L${planData.meta.lessonId}`;
    openLmsShareModal({
      url: planRoute,
      title: `${planData.meta.subject} ${planData.meta.moduleCode}: Lesson ${planData.meta.lessonId} Instructional Plan`,
      subject: planData.meta.subject,
      description: `Standards-aligned (NGSS 3D Learning) 2-Page Instructional Dossier with 5E Inquiry Cycle, Formative Checkpoints, and Rubric.`
    });
  });

  // DOCX Export Action
  document.getElementById("btn-lp-docx")?.addEventListener("click", () => {
    const target = document.getElementById("lp-render-target");
    if (!target) return;
    exportToDocx({
      title: `${planData.meta.subject} - Lesson ${planData.meta.lessonId}: ${planData.meta.lessonTitle} Instructional Plan`,
      filename: `LessonPlan_${planData.meta.subjectCode}_M${planData.meta.moduleId}_L${planData.meta.lessonId}`,
      content: target,
      subject: planData.meta.subjectCode
    });
  });

  // Print Action
  document.getElementById("btn-lp-print")?.addEventListener("click", () => {
    document.body.classList.add("printing-lesson-plan");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-lesson-plan");
    }, 1000);
  });

  // Close Action
  function closeModal() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    document.body.classList.remove("printing-lesson-plan");
    if (window.closeActiveLessonPlanModal === closeModal) {
      window.closeActiveLessonPlanModal = null;
    }
    if (window.location.hash.startsWith("#plan/")) {
      const curTab = planData.meta.subjectCode.startsWith("CHEM") ? "chem" : (planData.meta.subjectCode.startsWith("BIO") ? "bio" : "phys");
      if (window.location.hash !== "#" + curTab) {
        history.replaceState(null, "", "#" + curTab);
      }
    }
  }

  window.closeActiveLessonPlanModal = closeModal;

  document.getElementById("btn-lp-close")?.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key handler
  const escHandler = (e) => {
    if (e.key === "Escape" && overlay.style.display === "flex") {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

/**
 * Direct print trigger without full modal interaction
 */
export function printLessonPlanDirectly(subjectCode, moduleId, lessonId) {
  openLessonPlanModal(subjectCode, moduleId, lessonId);
  setTimeout(() => {
    document.body.classList.add("printing-lesson-plan");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-lesson-plan");
    }, 1000);
  }, 350);
}

// Global browser window attachment
if (typeof window !== "undefined") {
  window.openLessonPlanModal = openLessonPlanModal;
  window.printLessonPlanDirectly = printLessonPlanDirectly;
}

