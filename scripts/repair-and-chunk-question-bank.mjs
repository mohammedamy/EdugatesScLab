// scripts/repair-and-chunk-question-bank.mjs
// Repairs out-of-domain / Mad-Libs questions for Free Fall and The Mole,
// ensures correct significant figures, and chunks question-bank.js by subject.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const qbPath = path.resolve(rootDir, "data/question-bank.js");

console.log("Loading question-bank.js...");
const qbSrc = fs.readFileSync(qbPath, "utf-8");

// Parse the array
import("../data/question-bank.js").then(({ questionBank }) => {
  console.log(`Loaded ${questionBank.length} questions from question-bank.js`);

  const REPLACEMENTS = {
    // -------------------------------------------------------------------------
    // PHYS-M03-L3: Free Fall Authentic Replacements
    // -------------------------------------------------------------------------
    "PHYS-M3-L3-Q03": {
      id: "PHYS-M3-L3-Q03",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "numerical",
      difficulty: "honors",
      angle: "quantitative_1",
      question: "A heavy steel sphere is released from rest ($v_0 = 0\\text{ m/s}$) from a height $y_0 = 80.0\\text{ m}$ above the ground in a vacuum where $g = 9.80\\text{ m/s}^2$. Using the free fall kinematic relation $y(t) = y_0 - \\frac{1}{2}g t^2$, calculate the elapsed time $t_{\\text{impact}}$ until the sphere strikes the ground ($y = 0\\text{ m}$) to three significant figures.",
      correctAnswer: "4.04",
      tolerance: 0.05,
      unit: "s",
      options: [
        "$2.86\\text{ s}$",
        "$4.04\\text{ s}$",
        "$5.12\\text{ s}$",
        "$8.16\\text{ s}$"
      ],
      correctIndex: 1,
      explanation: "Step 1: Identify given quantities: $y_0 = 80.0\\text{ m}$, $v_0 = 0\\text{ m/s}$, $g = 9.80\\text{ m/s}^2$, $y = 0\\text{ m}$.\nStep 2: Apply free fall relation: $$0 = y_0 - \\frac{1}{2}gt^2 \\implies t = \\sqrt{\\frac{2y_0}{g}} = \\sqrt{\\frac{2(80.0\\text{ m})}{9.80\\text{ m/s}^2}} = \\sqrt{16.3265} = 4.04\\text{ s}$$.\nStep 3: Three significant figures are justified by $80.0\\text{ m}$ and $9.80\\text{ m/s}^2$.",
      rubricCER: null
    },

    "PHYS-M3-L3-Q04": {
      id: "PHYS-M3-L3-Q04",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "diagram",
      difficulty: "honors",
      angle: "graphical",
      diagram: {
        id: "phys_diag_freefall_vt",
        subject: "PHYS",
        moduleId: 3,
        title: "Free Fall Linear Velocity-Time Graph",
        caption: "Figure 3.3G: Velocity-Time Profile for an Object Dropped from Rest in Free Fall",
        svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
          <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Velocity vs. Time: Free Fall (v₀ = 0, g = 9.80 m/s²)</text>
          <!-- Axes -->
          <line x1="70" y1="50" x2="70" y2="240" stroke="#64748b" stroke-width="2"/>
          <line x1="70" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
          <!-- Axis Labels -->
          <text x="50" y="150" fill="#94a3b8" font-size="11" font-weight="700" transform="rotate(-90 50,150)" text-anchor="middle">Velocity v (m/s, downward -)</text>
          <text x="280" y="40" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">Time t (s) →</text>
          <!-- Linear Downward Curve -->
          <line x1="70" y1="50" x2="450" y2="230" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="70" cy="50" r="5" fill="#38bdf8"/>
          <circle cx="450" cy="230" r="5" fill="#ef4444"/>
          <!-- Slope Callout -->
          <text x="320" y="125" fill="#facc15" font-size="12" font-weight="800">Slope = -g = -9.80 m/s²</text>
          <text x="455" y="240" fill="#f87171" font-size="10" font-weight="600">t = 4.04 s, v = -39.6 m/s</text>
        </svg>`
      },
      question: "Refer to the scientific diagram illustrated in **Figure 3.3G** for \"Free Fall\". When analyzing the experimental velocity-time profile for an object dropped from rest, what does the constant downward linear slope represent?",
      options: [
        "The constant slope equals the gravitational acceleration $a = -g = -9.80\\text{ m/s}^2$, and the integrated area between the curve and the time axis equals the vertical displacement $\\Delta y$.",
        "The slope represents instantaneous kinetic energy, which remains constant throughout free fall.",
        "The slope indicates that acceleration decreases linearly toward zero as the falling body picks up speed.",
        "The slope represents aerodynamic terminal drag, which instantly halts gravitational acceleration."
      ],
      correctIndex: 0,
      explanation: "On any velocity-time graph, slope $\\frac{\\Delta v}{\\Delta t}$ equals instantaneous acceleration. In free fall under uniform gravity $g$, acceleration is invariant at $a = -9.80\\text{ m/s}^2$ downward. The definite integral (area under the $v$-$t$ line) gives the downward displacement $\\Delta y = -\\frac{1}{2}gt^2$.",
      rubricCER: null,
      hasDiagram: true
    },

    "PHYS-M3-L3-Q13": {
      id: "PHYS-M3-L3-Q13",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_2",
      question: "In a precision vertical drop experiment, a sensor records an object falling from rest for an elapsed duration $t = 4.04\\text{ s}$ under gravitational acceleration $g = 9.80\\text{ m/s}^2$. Calculate the final downward impact speed $v = gt$ adhering to standard significant figure rules (both $4.04\\text{ s}$ and $9.80\\text{ m/s}^2$ possess 3 significant figures).",
      correctAnswer: "39.6",
      tolerance: 0.1,
      unit: "m/s",
      options: [
        "$39.59\\text{ m/s}$",
        "$39.6\\text{ m/s}$",
        "$39.592\\text{ m/s}$",
        "$40.0\\text{ m/s}$"
      ],
      correctIndex: 1,
      explanation: "Step 1: Identify given parameters and precision: $g = 9.80\\text{ m/s}^2$ (3 sig figs), $t = 4.04\\text{ s}$ (3 sig figs).\nStep 2: Compute unrounded product: $$v = gt = (9.80)(4.04) = 39.592\\text{ m/s}$$.\nStep 3: Multiplication significant figures rule: The product is governed by the factor with the fewest significant figures (both have 3 sig figs). Rounding 39.592 to 3 significant figures yields $39.6\\text{ m/s}$ (not $39.592$ or $39.59$).",
      rubricCER: null
    },

    "PHYS-M3-L3-Q16": {
      id: "PHYS-M3-L3-Q16",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "diagram",
      difficulty: "honors",
      angle: "structural_model",
      question: "Refer to the structural vector diagram illustrated in **Figure 3.3S** for a falling mass $m = 2.0\\text{ kg}$ in free fall near Earth's surface. What is the net force acting on the body, and what normal force does an internal scale inside the falling container register?",
      options: [
        "The sole force acting is gravity $F_g = mg = (2.0)(9.80) = 19.6\\text{ N}$ downward; because the system accelerates freely at $g$, normal contact force $F_N = 0\\text{ N}$ (producing apparent weightlessness).",
        "The normal contact force equals the gravitational force ($F_N = 19.6\\text{ N}$ upward), maintaining net force at zero.",
        "Aerodynamic friction immediately balances gravitational acceleration at the release point.",
        "The body loses gravitational mass during free fall, causing net force to vanish entirely."
      ],
      correctIndex: 0,
      explanation: "In authentic free fall under negligible drag, gravity is the sole force acting: $F_{\\text{net}} = F_g = mg = (2.0\\text{ kg})(9.80\\text{ m/s}^2) = 19.6\\text{ N}$ downward. Because any supporting surface or accelerometer accelerates downward at the identical rate $g$, contact force is strictly zero ($F_N = 0\\text{ N}$), resulting in apparent weightlessness.",
      rubricCER: null,
      hasDiagram: true,
      diagram: {
        id: "phys_diag_struct_m3_l3",
        subject: "PHYS",
        moduleId: 3,
        title: "Free Fall Vertical Vector Free-Body Diagram",
        caption: "Figure 3.3S: Single-Force Gravitational Vector Free-Body Diagram for Free Fall",
        svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
          <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Free-Body Diagram: Free Fall (Air Resistance Ignored)</text>
          <!-- Center Mass -->
          <circle cx="270" cy="110" r="30" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="270" y="115" fill="#ffffff" font-size="13" font-weight="800" text-anchor="middle">m = 2.0 kg</text>
          <!-- Downward Gravity Vector Fg -->
          <line x1="270" y1="140" x2="270" y2="235" stroke="#ef4444" stroke-width="3.5"/>
          <polygon points="270,245 264,230 276,230" fill="#ef4444"/>
          <text x="285" y="195" fill="#ef4444" font-size="12" font-weight="800">F_g = mg = 19.6 N (downward)</text>
          <!-- Normal Force Callout -->
          <text x="270" y="65" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">F_N = 0 N (No Contact Support • Apparent Weightlessness)</text>
          <text x="270" y="268" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">Net Force ΣF = ma = mg ⟹ a = g = 9.80 m/s²</text>
        </svg>`
      }
    },

    "PHYS-M3-L3-Q18": {
      id: "PHYS-M3-L3-Q18",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "mcq",
      difficulty: "honors",
      angle: "thermodynamic_profile",
      question: "In a mechanical energy conservation analysis of a body of mass $m$ dropped from height $h$ in free fall, how are potential energy ($PE$) and kinetic energy ($KE$) transformed during descent in the absence of air resistance?",
      options: [
        "Gravitational potential energy ($PE = mgh$) is continuously converted into kinetic energy ($KE = \\frac{1}{2}mv^2$) such that total mechanical energy $E_{\\text{mech}} = PE + KE$ remains strictly conserved throughout the flight.",
        "Kinetic energy is converted into potential energy, causing the body to slow down as it approaches the ground.",
        "Both potential energy and kinetic energy decrease simultaneously, in violation of energy conservation.",
        "Total mechanical energy increases exponentially with the square of elapsed time."
      ],
      correctIndex: 0,
      explanation: "In an isolated conservative gravitational field, non-conservative work $W_{\\text{nc}} = 0$. By the Work-Energy Theorem, $\\Delta E = \\Delta PE + \\Delta KE = 0$. The loss of potential energy matches the gain in kinetic energy: $mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh}$, which is strictly independent of body mass.",
      rubricCER: null,
      hasDiagram: false,
      diagram: null
    },

    "PHYS-M3-L3-Q21": {
      id: "PHYS-M3-L3-Q21",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "mcq",
      difficulty: "foundational",
      angle: "environmental_safety",
      question: "When conducting free fall experiments using heavy steel drop spheres in a high school physics laboratory, which laboratory safety procedure is critical?",
      options: [
        "Placing an energy-absorbing padded catch box or sand bucket directly beneath the drop zone to dissipate kinetic energy and ensuring all personnel keep feet and hands clear of the impact target.",
        "Wearing radioactive lead aprons because free fall accelerates nuclear transmutation.",
        "Heating the falling masses with a Bunsen burner to eliminate aerodynamic friction.",
        "Evacuating the entire school building because free fall creates ionizing radiation."
      ],
      correctIndex: 0,
      explanation: "Physics laboratory safety standards mandate that vertical drop zones must have padded catch basins (foam or sand) to absorb high impact kinetic energy safely without shattering equipment or bouncing into students' feet.",
      rubricCER: null,
      hasDiagram: false,
      diagram: null
    },

    "PHYS-M3-L3-Q22": {
      id: "PHYS-M3-L3-Q22",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "mcq",
      difficulty: "honors",
      angle: "kinetic_temporal",
      question: "A ball is launched vertically upward with initial velocity $v_0 = +19.6\\text{ m/s}$ in a vacuum ($g = 9.80\\text{ m/s}^2$). What is the ball's instantaneous velocity and acceleration at the apex (highest point) of its trajectory, and what is its flight time to the apex?",
      options: [
        "At the apex, instantaneous velocity is $v = 0\\text{ m/s}$, acceleration remains $a = -9.80\\text{ m/s}^2$ downward, and time to apex is $t = \\frac{v_0}{g} = \\frac{19.6}{9.80} = 2.00\\text{ s}$.",
        "At the apex, both velocity and acceleration simultaneously become zero ($v = 0\\text{ m/s}$, $a = 0\\text{ m/s}^2$), suspending the ball in midair.",
        "At the apex, velocity is $+9.80\\text{ m/s}$ and elapsed time is $1.00\\text{ s}$.",
        "The ball accelerates upward at $+9.80\\text{ m/s}^2$ until it reaches apex, then acceleration reverses."
      ],
      correctIndex: 0,
      explanation: "Throughout the entire flight, gravity exerts constant downward acceleration: $a = -g = -9.80\\text{ m/s}^2$. At the apex, vertical velocity momentarily reverses through zero ($v = 0\\text{ m/s}$), while acceleration remains $-9.80\\text{ m/s}^2$. Setting $v(t) = v_0 - gt = 0$ yields apex time $t = v_0 / g = 19.6 / 9.80 = 2.00\\text{ s}$.",
      rubricCER: null,
      hasDiagram: false,
      diagram: null
    },

    "PHYS-M3-L3-Q26": {
      id: "PHYS-M3-L3-Q26",
      subject: "PHYS",
      moduleId: 3,
      lessonId: 3,
      moduleTitle: "PHYS-M03: Accelerated Motion",
      lessonTitle: "Lesson 3.3: Free Fall",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "A solid sphere dropped from rest ($v_0 = 0$) from height $h_1 = 20.0\\text{ m}$ strikes the ground with impact speed $v_1 = 19.8\\text{ m/s}$. If a second identical sphere is dropped from rest from four times that height ($h_2 = 4h_1 = 80.0\\text{ m}$), calculate its resulting ground impact speed $v_2$ in m/s adhering to the kinematics relation $v = \\sqrt{2gh}$.",
      correctAnswer: "39.6",
      tolerance: 0.1,
      unit: "m/s",
      options: [
        "$19.8\\text{ m/s}$",
        "$39.6\\text{ m/s}$",
        "$79.2\\text{ m/s}$",
        "$28.0\\text{ m/s}$"
      ],
      correctIndex: 1,
      explanation: "Using the kinematic relation $v = \\sqrt{2gh}$, impact velocity is proportional to the square root of drop height ($v \\propto \\sqrt{h}$). Quadrupling height ($h_2 = 4h_1$) results in: $$v_2 = \\sqrt{2g(4h_1)} = \\sqrt{4} \\times \\sqrt{2gh_1} = 2 v_1 = 2(19.8\\text{ m/s}) = 39.6\\text{ m/s}$$.",
      rubricCER: null
    },

    // -------------------------------------------------------------------------
    // CHEM-M09: The Mole Authentic Replacements
    // -------------------------------------------------------------------------
    "CHEM-M9-L1-Q13": {
      id: "CHEM-M9-L1-Q13",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 1,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.1: Measuring Matter",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_2",
      question: "A student weighs a sample containing $n = 2.50\\text{ mol}$ of pure iron atoms. Using Avogadro's constant $N_A = 6.022 \\times 10^{23}\\text{ atoms/mol}$, calculate the total number of iron atoms $N = n \\times N_A$ in the sample adhering to significant figure rules (both $2.50$ and $6.022$ have 3 and 4 sig figs).",
      correctAnswer: "1.51e24",
      tolerance: 0.05e24,
      unit: "atoms",
      options: [
        "$1.51 \\times 10^{24}\\text{ atoms}$",
        "$2.41 \\times 10^{23}\\text{ atoms}$",
        "$6.02 \\times 10^{23}\\text{ atoms}$",
        "$1.5055 \\times 10^{24}\\text{ atoms}$"
      ],
      correctIndex: 0,
      explanation: "Step 1: Identify given data: $n = 2.50\\text{ mol}$ (3 sig figs), $N_A = 6.022 \\times 10^{23}\\text{ atoms/mol}$ (4 sig figs).\nStep 2: Calculate atom count: $$N = n \\times N_A = (2.50\\text{ mol})(6.022 \\times 10^{23}\\text{ atoms/mol}) = 1.5055 \\times 10^{24}\\text{ atoms}$$.\nStep 3: Three significant figures govern the product: $1.51 \\times 10^{24}\\text{ atoms}$.",
      rubricCER: null
    },

    "CHEM-M9-L1-Q26": {
      id: "CHEM-M9-L1-Q26",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 1,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.1: Measuring Matter",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "A sample of pure carbon-12 has a measured mass of $m = 24.02\\text{ g}$. Molar mass is $M = 12.01\\text{ g/mol}$. How many representative carbon atoms are present in this sample?",
      correctAnswer: "1.20e24",
      tolerance: 0.05e24,
      unit: "atoms",
      options: [
        "$6.02 \\times 10^{23}\\text{ atoms}$",
        "$1.20 \\times 10^{24}\\text{ atoms}$",
        "$2.40 \\times 10^{24}\\text{ atoms}$",
        "$3.01 \\times 10^{23}\\text{ atoms}$"
      ],
      correctIndex: 1,
      explanation: "Step 1: Calculate chemical moles: $n = \\frac{m}{M} = \\frac{24.02\\text{ g}}{12.01\\text{ g/mol}} = 2.000\\text{ mol}$.\nStep 2: Multiply by Avogadro's number: $N = (2.000\\text{ mol})(6.022 \\times 10^{23}\\text{ atoms/mol}) = 1.204 \\times 10^{24}\\text{ atoms} \\approx 1.20 \\times 10^{24}\\text{ atoms}$.",
      rubricCER: null
    },

    "CHEM-M9-L2-Q13": {
      id: "CHEM-M9-L2-Q13",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 2,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.2: Mass and the Mole",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_2",
      question: "A chemist synthesizes an ingot of pure copper with mass $m = 127.1\\text{ g}$. Given copper's atomic molar mass $M = 63.55\\text{ g/mol}$, calculate the chemical amount in moles $n = \\frac{m}{M}$ to four significant figures.",
      correctAnswer: "2.000",
      tolerance: 0.01,
      unit: "mol",
      options: [
        "$0.5000\\text{ mol}$",
        "$2.000\\text{ mol}$",
        "$4.000\\text{ mol}$",
        "$1.985\\text{ mol}$"
      ],
      correctIndex: 1,
      explanation: "Step 1: Identify given parameters: $m = 127.1\\text{ g}$ (4 sig figs), $M = 63.55\\text{ g/mol}$ (4 sig figs).\nStep 2: Calculate moles: $$n = \\frac{m}{M} = \\frac{127.1\\text{ g}}{63.55\\text{ g/mol}} = 2.000\\text{ mol}$$.\nStep 3: Four significant figures are preserved: $2.000\\text{ mol}$.",
      rubricCER: null
    },

    "CHEM-M9-L2-Q26": {
      id: "CHEM-M9-L2-Q26",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 2,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.2: Mass and the Mole",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "An analytical balance weighs $n = 0.750\\text{ mol}$ of calcium chloride ($\text{CaCl}_2$, molar mass $M = 110.98\\text{ g/mol}$). Calculate the mass $m = n \\times M$ in grams to three significant figures.",
      correctAnswer: "83.2",
      tolerance: 0.2,
      unit: "g",
      options: [
        "$55.5\\text{ g}$",
        "$83.2\\text{ g}$",
        "$111.0\\text{ g}$",
        "$148.0\\text{ g}$"
      ],
      correctIndex: 1,
      explanation: "Using $m = n \\times M$: $$m = (0.750\\text{ mol})(110.98\\text{ g/mol}) = 83.235\\text{ g}$$. Rounding to 3 significant figures gives $83.2\\text{ g}$.",
      rubricCER: null
    },

    "CHEM-M9-L3-Q13": {
      id: "CHEM-M9-L3-Q13",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 3,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.3: Moles of Compounds",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_2",
      question: "Calculate the molar mass of magnesium phosphate, $\\text{Mg}_3(\\text{PO}_4)_2$, using atomic weights $\\text{Mg} = 24.31\\text{ g/mol}$, $\\text{P} = 30.97\\text{ g/mol}$, and $\\text{O} = 16.00\\text{ g/mol}$. Express your answer in g/mol to two decimal places.",
      correctAnswer: "262.87",
      tolerance: 0.1,
      unit: "g/mol",
      options: [
        "$119.28\\text{ g/mol}$",
        "$262.87\\text{ g/mol}$",
        "$214.25\\text{ g/mol}$",
        "$310.18\\text{ g/mol}$"
      ],
      correctIndex: 1,
      explanation: "Formula analysis: $3\\text{ Mg} + 2\\text{ P} + 8\\text{ O}$.\n$$M = 3(24.31) + 2(30.97) + 8(16.00) = 72.93 + 61.94 + 128.00 = 262.87\\text{ g/mol}$$.",
      rubricCER: null
    },

    "CHEM-M9-L3-Q26": {
      id: "CHEM-M9-L3-Q26",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 3,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.3: Moles of Compounds",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "A beaker holds $n = 3.50\\text{ mol}$ of solid ammonium sulfate, $(\\text{NH}_4)_2\\text{SO}_4$. How many moles of hydrogen atoms are contained in this sample?",
      correctAnswer: "28.0",
      tolerance: 0.1,
      unit: "mol",
      options: [
        "$14.0\\text{ mol}$",
        "$28.0\\text{ mol}$",
        "$7.00\\text{ mol}$",
        "$3.50\\text{ mol}$"
      ],
      correctIndex: 1,
      explanation: "Each formula unit of $(\\text{NH}_4)_2\\text{SO}_4$ contains $2 \\times 4 = 8$ hydrogen atoms ($1\\text{ mol } (\\text{NH}_4)_2\\text{SO}_4 : 8\\text{ mol H}$). Therefore: $$n_{\\text{H}} = 3.50\\text{ mol} \\times 8 = 28.0\\text{ mol H}$$.",
      rubricCER: null
    },

    "CHEM-M9-L4-Q13": {
      id: "CHEM-M9-L4-Q13",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 4,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.4: Empirical and Molecular Formulas",
      type: "mcq",
      difficulty: "ap_olympiad",
      angle: "quantitative_2",
      question: "Chemical analysis of an unknown organic compound reveals $40.00\\%\\text{ C}$, $6.71\\%\\text{ H}$, and $53.29\\%\\text{ O}$ by mass. What is the empirical formula of the compound? (Atomic weights: $\\text{C} = 12.01$, $\\text{H} = 1.008$, $\\text{O} = 16.00\\text{ g/mol}$)",
      options: [
        "$\\text{CHO}$",
        "$\\text{CH}_2\\text{O}$",
        "$\\text{C}_2\\text{H}_4\\text{O}$",
        "$\\text{CH}_4\\text{O}_2$"
      ],
      correctIndex: 1,
      explanation: "Assume $100.0\\text{ g}$ sample:\n$$n_{\\text{C}} = \\frac{40.00\\text{ g}}{12.01\\text{ g/mol}} = 3.331\\text{ mol}$$\n$$n_{\\text{H}} = \\frac{6.71\\text{ g}}{1.008\\text{ g/mol}} = 6.657\\text{ mol}$$\n$$n_{\\text{O}} = \\frac{53.29\\text{ g}}{16.00\\text{ g/mol}} = 3.331\\text{ mol}$$\nDivide by smallest ($3.331$):\n$$\\text{C} = 1.00, \\quad \\text{H} = 2.00, \\quad \\text{O} = 1.00 \\implies \\text{CH}_2\\text{O}$$.",
      rubricCER: null
    },

    "CHEM-M9-L4-Q26": {
      id: "CHEM-M9-L4-Q26",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 4,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.4: Empirical and Molecular Formulas",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "An unknown sugar has an empirical formula of $\\text{CH}_2\\text{O}$ (empirical formula mass $M_{\\text{emp}} = 30.03\\text{ g/mol}$) and an experimentally determined molecular mass $M = 180.16\\text{ g/mol}$. What integer multiplier $n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}}$ relates the empirical formula to the true molecular formula (yielding $\\text{C}_6\\text{H}_{12}\\text{O}_6$)?",
      correctAnswer: "6",
      tolerance: 0.1,
      unit: "",
      options: [
        "$3$",
        "$6$",
        "$2$",
        "$12$"
      ],
      correctIndex: 1,
      explanation: "Using the formula multiplier relation: $$n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}} = \\frac{180.16\\text{ g/mol}}{30.03\\text{ g/mol}} = 5.999 \\approx 6$$. Therefore, the molecular formula is $(\\text{CH}_2\\text{O})_6 = \\text{C}_6\\text{H}_{12}\\text{O}_6$.",
      rubricCER: null
    },

    "CHEM-M9-L5-Q26": {
      id: "CHEM-M9-L5-Q26",
      subject: "CHEM",
      moduleId: 9,
      lessonId: 5,
      moduleTitle: "CHEM-M09: The Mole",
      lessonTitle: "Lesson 9.5: Formulas of Hydrates",
      type: "numerical",
      difficulty: "ap_olympiad",
      angle: "quantitative_conservation",
      question: "A $5.000\\text{ g}$ sample of blue hydrated copper(II) sulfate $\\text{CuSO}_4 \\cdot x\\text{H}_2\\text{O}$ is heated in a porcelain crucible until all water of crystallization is driven off, leaving $3.196\\text{ g}$ of white anhydrous $\\text{CuSO}_4$ ($M = 159.61\\text{ g/mol}$). Calculate the integer mole ratio $x = \\frac{n_{\\text{H}_2\\text{O}}}{n_{\\text{CuSO}_4}}$ (water molar mass $M = 18.02\\text{ g/mol}$).",
      correctAnswer: "5",
      tolerance: 0.1,
      unit: "",
      options: [
        "$2$",
        "$5$",
        "$7$",
        "$10$"
      ],
      correctIndex: 1,
      explanation: "Step 1: Calculate mass of water released: $$m_{\\text{H}_2\\text{O}} = 5.000\\text{ g} - 3.196\\text{ g} = 1.804\\text{ g}$$.\nStep 2: Calculate moles of anhydrous salt and water:\n$$n_{\\text{CuSO}_4} = \\frac{3.196\\text{ g}}{159.61\\text{ g/mol}} = 0.02002\\text{ mol}$$\n$$n_{\\text{H}_2\\text{O}} = \\frac{1.804\\text{ g}}{18.02\\text{ g/mol}} = 0.10011\\text{ mol}$$\nStep 3: Calculate mole ratio $x$:\n$$x = \\frac{0.10011\\text{ mol}}{0.02002\\text{ mol}} = 5.000 \\approx 5$$.\nThe formula is $\\text{CuSO}_4 \\cdot 5\\text{H}_2\\text{O}$.",
      rubricCER: null
    }
  };

  // Replace items in questionBank array
  let replacedCount = 0;
  for (let i = 0; i < questionBank.length; i++) {
    const q = questionBank[i];
    if (REPLACEMENTS[q.id]) {
      questionBank[i] = REPLACEMENTS[q.id];
      replacedCount++;
    }
  }

  console.log(`Replaced ${replacedCount} questions with authentic curriculum models.`);

  // Write updated master question-bank.js
  const masterContent = `// Edugates-ClipSAT Science Labs - Master Question Bank\n// Contains ${questionBank.length} rigorous, non-redundant, curriculum-aligned questions\n// with at least 30 distinct questions per single lesson across all 242 lessons (74 modules).\n// Formats: Multiple-Choice (MCQ), Numerical Calculations, and Claim-Evidence-Reasoning (CER).\n\nexport const questionBank = ${JSON.stringify(questionBank, null, 2)};\n`;
  fs.writeFileSync(qbPath, masterContent, "utf-8");
  console.log(`✅ Updated master question-bank.js (${(fs.statSync(qbPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // Split into chunks by subject
  const chemQuestions = questionBank.filter(q => q.subject === "CHEM");
  const bioQuestions = questionBank.filter(q => q.subject === "BIO");
  const physQuestions = questionBank.filter(q => q.subject === "PHYS");

  const chemPath = path.resolve(rootDir, "data/question-bank-chem.js");
  const bioPath = path.resolve(rootDir, "data/question-bank-bio.js");
  const physPath = path.resolve(rootDir, "data/question-bank-phys.js");

  fs.writeFileSync(chemPath, `// Chemistry Question Bank Chunk (${chemQuestions.length} questions)\nexport const questionBankChem = ${JSON.stringify(chemQuestions, null, 2)};\nexport const questionBank = questionBankChem;\n`, "utf-8");
  fs.writeFileSync(bioPath, `// Biology Question Bank Chunk (${bioQuestions.length} questions)\nexport const questionBankBio = ${JSON.stringify(bioQuestions, null, 2)};\nexport const questionBank = questionBankBio;\n`, "utf-8");
  fs.writeFileSync(physPath, `// Physics Question Bank Chunk (${physQuestions.length} questions)\nexport const questionBankPhys = ${JSON.stringify(physQuestions, null, 2)};\nexport const questionBank = questionBankPhys;\n`, "utf-8");

  console.log(`✅ Created ${chemPath} (${(fs.statSync(chemPath).size / 1024 / 1024).toFixed(2)} MB, ${chemQuestions.length} items)`);
  console.log(`✅ Created ${bioPath} (${(fs.statSync(bioPath).size / 1024 / 1024).toFixed(2)} MB, ${bioQuestions.length} items)`);
  console.log(`✅ Created ${physPath} (${(fs.statSync(physPath).size / 1024 / 1024).toFixed(2)} MB, ${physQuestions.length} items)`);
});
