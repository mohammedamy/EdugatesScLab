// Edugates-ClipSAT Science Labs - Comprehensive Question Bank
// Used by the Customizable Quiz & Exam Generator Engine with full LaTeX mathematical notation

export const questionBank = [
  // =================== CHEMISTRY QUESTIONS ===================
  {
    id: "CHEM-Q01",
    subject: "CHEM",
    moduleId: 5,
    moduleTitle: "The Periodic Table and Periodic Law",
    type: "mcq",
    difficulty: "honors",
    question: "Which of the following correctly explains why the first ionization energy generally increases across a period from left to right on the periodic table?",
    options: [
      "The principal quantum number $n$ increases, moving valence electrons farther from the nucleus.",
      "The effective nuclear charge ($Z_{\\text{eff}}$) increases while core electron shielding remains relatively constant across the same energy level.",
      "Atomic radii expand, decreasing the electrostatic Coulombic attraction on outer valence electrons.",
      "Electronegativity values drop, allowing valence electrons to be expelled more freely."
    ],
    correctIndex: 1,
    explanation: "Across a period, nuclear charge increases with atomic number $Z$ while electrons are added to the same principal energy level. Because inner core electron shielding $S$ remains constant, the effective nuclear charge: $$Z_{\\text{eff}} \\approx Z - S$$ steadily rises, pulling outer electrons closer and requiring significantly more energy to remove an electron.",
    rubricCER: null
  },
  {
    id: "CHEM-Q02",
    subject: "CHEM",
    moduleId: 10,
    moduleTitle: "Stoichiometry",
    type: "numerical",
    difficulty: "honors",
    question: "Consider the synthesis reaction: $$2\\text{Al}(s) + 3\\text{Cl}_2(g) \\longrightarrow 2\\text{AlCl}_3(s)$$ If $54.0\\text{ g}$ of aluminum reacts with $142.0\\text{ g}$ of chlorine gas, what is the maximum theoretical mass of aluminum chloride ($\\text{AlCl}_3$) produced? (Molar masses: $\\text{Al} = 27.0\\text{ g/mol}$, $\\text{Cl}_2 = 71.0\\text{ g/mol}$, $\\text{AlCl}_3 = 133.5\\text{ g/mol}$)",
    correctAnswer: "178.0",
    tolerance: 1.0,
    unit: "g",
    options: ["$133.5\\text{ g}$", "$178.0\\text{ g}$", "$267.0\\text{ g}$", "$196.0\\text{ g}$"],
    correctIndex: 1,
    explanation: "Step 1: Calculate moles of reactants:\n$$n_{\\text{Al}} = \\frac{54.0\\text{ g}}{27.0\\text{ g/mol}} = 2.00\\text{ mol Al}$$\n$$n_{\\text{Cl}_2} = \\frac{142.0\\text{ g}}{71.0\\text{ g/mol}} = 2.00\\text{ mol Cl}_2$$\n\nStep 2: Determine limiting reactant via stoichiometric ratio ($2\\text{ Al} : 3\\text{ Cl}_2$):\nFor $2.00\\text{ mol Al}$, required $\\text{Cl}_2 = 2.00 \\times 1.5 = 3.00\\text{ mol Cl}_2$. Because only $2.00\\text{ mol Cl}_2$ is present, $\\text{Cl}_2$ is the limiting reactant.\n\nStep 3: Theoretical yield based on limiting $\\text{Cl}_2$:\n$$n_{\\text{AlCl}_3} = 2.00\\text{ mol Cl}_2 \\times \\left(\\frac{2\\text{ mol AlCl}_3}{3\\text{ mol Cl}_2}\\right) = 1.333\\text{ mol AlCl}_3$$\n$$m_{\\text{AlCl}_3} = 1.333\\text{ mol} \\times 133.5\\text{ g/mol} = 178.0\\text{ g AlCl}_3$$",
    rubricCER: null
  },
  {
    id: "CHEM-Q03",
    subject: "CHEM",
    moduleId: 17,
    moduleTitle: "Acids and Bases",
    type: "mcq",
    difficulty: "ap_olympiad",
    question: "In a laboratory titration, $25.00\\text{ mL}$ of $0.100\\text{ M}$ acetic acid ($\\text{CH}_3\\text{COOH}$, $K_a = 1.8 \\times 10^{-5}$) is titrated with $0.100\\text{ M}$ sodium hydroxide ($\\text{NaOH}$). Which indicator is most appropriate for detecting the equivalence point, and what is the nature of the solution at equivalence?",
    options: [
      "Methyl orange (transition $\\text{pH } 3.1\\text{--}4.4$); solution is acidic due to $\\text{H}^+$ excess.",
      "Bromothymol blue (transition $\\text{pH } 6.0\\text{--}7.6$); solution is neutral ($\\text{pH} = 7.00$).",
      "Phenolphthalein (transition $\\text{pH } 8.2\\text{--}10.0$); solution is basic ($\\text{pH} \\approx 8.72$) due to conjugate acetate ion hydrolysis.",
      "Thymol blue in acid range (transition $\\text{pH } 1.2\\text{--}2.8$); solution is strongly acidic."
    ],
    correctIndex: 2,
    explanation: "At the equivalence point of a weak acid ($\\text{CH}_3\\text{COOH}$) and a strong base ($\\text{NaOH}$), all acetic acid is converted into sodium acetate. The acetate anion undergoes base hydrolysis in water:\n$$\\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O} \\rightleftharpoons \\text{CH}_3\\text{COOH} + \\text{OH}^-$$\nproducing excess hydroxide ions and a basic equivalence $\\text{pH} \\approx 8.72$. Phenolphthalein (transition $\\text{pH } 8.2\\text{--}10.0$) changes color sharply right across this basic equivalence window.",
    rubricCER: null
  },
  {
    id: "CHEM-Q04",
    subject: "CHEM",
    moduleId: 16,
    moduleTitle: "Chemical Equilibrium",
    type: "cer",
    difficulty: "honors",
    question: "A closed $2.0\\text{ L}$ vessel contains the Haber-Bosch equilibrium mixture: $$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) + 92\\text{ kJ}$$ Construct a Claim, Evidence, and Reasoning (CER) explanation detailing how increasing the system pressure by decreasing volume affects the yield of ammonia ($\\text{NH}_3$).",
    explanation: "Claim: Decreasing volume (increasing pressure) shifts the dynamic equilibrium toward products, increasing the yield of $\\text{NH}_3$.\nEvidence: Reactant side contains $1\\text{ mol N}_2 + 3\\text{ mol H}_2 = 4\\text{ moles of gas}$. Product side contains only $2\\text{ moles of NH}_3$ gas.\nReasoning: According to Le Chatelier's Principle, an increase in system pressure shifts the equilibrium in the direction of fewer gas moles ($4\\text{ mol} \\rightarrow 2\\text{ mol}$) to reduce particle collision frequency and relieve pressure.",
    rubricCER: {
      claim: "Accurately claims that equilibrium shifts right and NH₃ yield increases (2 pts)",
      evidence: "Cites exact stoichiometric molar comparison (4 moles of reactant gas vs. 2 moles of product gas) (3 pts)",
      reasoning: "Applies Le Chatelier's principle linking volume reduction, collision density, and pressure alleviation (3 pts)",
      scientificLanguage: "Correct thermodynamic and equilibrium terminology used throughout (2 pts)"
    }
  },
  {
    id: "CHEM-Q05",
    subject: "CHEM",
    moduleId: 4,
    moduleTitle: "Electrons in Atoms",
    type: "mcq",
    difficulty: "foundational",
    question: "What is the ground-state electron configuration of a neutral iron ($\\text{Fe}$, atomic number $Z = 26$) atom?",
    options: [
      "$[\\text{Ar}]\\, 4s^2 3d^6$",
      "$[\\text{Ar}]\\, 4s^1 3d^7$",
      "$[\\text{Ar}]\\, 3d^8$",
      "$[\\text{Kr}]\\, 5s^2 4d^6$"
    ],
    correctIndex: 0,
    explanation: "Argon ($[\\text{Ar}]$) accounts for the first 18 electrons. According to the Aufbau principle, the $4s$ orbital fills first with 2 electrons ($[\\text{Ar}]\\, 4s^2$, 20 electrons), followed by the $3d$ sublevel receiving the remaining 6 electrons: $$[\\text{Ar}]\\, 4s^2 3d^6$$",
    rubricCER: null
  },
  {
    id: "CHEM-Q06",
    subject: "CHEM",
    moduleId: 12,
    moduleTitle: "Gases",
    type: "numerical",
    difficulty: "honors",
    question: "A weather balloon is inflated with helium gas to a volume of $V_1 = 40.0\\text{ L}$ at ground level ($P_1 = 1.00\\text{ atm}$, $T_1 = 27.0^\\circ\\text{C} = 300.15\\text{ K}$). In the stratosphere, the pressure drops to $P_2 = 0.400\\text{ atm}$ and temperature drops to $T_2 = -23.0^\\circ\\text{C} = 250.15\\text{ K}$. What is the new volume of the balloon in liters?",
    correctAnswer: "83.3",
    tolerance: 0.8,
    unit: "L",
    options: ["$66.7\\text{ L}$", "$83.3\\text{ L}$", "$100.0\\text{ L}$", "$120.0\\text{ L}$"],
    correctIndex: 1,
    explanation: "Apply the Combined Gas Law: $$\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}$$\nSolving for $V_2$:\n$$V_2 = \\frac{P_1 V_1 T_2}{P_2 T_1} = \\frac{(1.00\\text{ atm})(40.0\\text{ L})(250.15\\text{ K})}{(0.400\\text{ atm})(300.15\\text{ K})} = \\frac{10006}{120.06} \\approx 83.34\\text{ L}$$",
    rubricCER: null
  },

  // =================== BIOLOGY QUESTIONS ===================
  {
    id: "BIO-Q01",
    subject: "BIO",
    moduleId: 7,
    moduleTitle: "Cellular Structure and Function",
    type: "mcq",
    difficulty: "honors",
    question: "If a human red blood cell with internal osmolarity equivalent to $0.9\\%\\text{ NaCl}$ is placed into pure distilled water ($0.0\\%\\text{ NaCl}$), what will occur, and why?",
    options: [
      "Water leaves the cell by active transport, causing the cell to crenate (shrivel).",
      "Solute particles diffuse out of the cell until dynamic equilibrium is reached.",
      "Water enters the cell down its water potential gradient via osmosis, causing osmotic lysis (bursting).",
      "The cell wall exerts counter-turgor pressure, maintaining a constant cell volume."
    ],
    correctIndex: 2,
    explanation: "Pure distilled water is hypotonic relative to erythrocyte cytoplasm. Water potential $\\Psi$ inside the cell is more negative than outside. By osmosis, water rushes inward across the semipermeable lipid bilayer. Because animal erythrocytes lack a rigid cell wall to produce counter pressure ($\\Psi_p$), the membrane ruptures (hemolysis).",
    rubricCER: null
  },
  {
    id: "BIO-Q02",
    subject: "BIO",
    moduleId: 10,
    moduleTitle: "Introduction to Genetics and Patterns of Inheritance",
    type: "mcq",
    difficulty: "honors",
    question: "In fruit flies (Drosophila), red eyes ($X^R$) are sex-linked dominant to white eyes ($X^r$). A white-eyed female fly ($X^r X^r$) is crossed with a red-eyed male fly ($X^R Y$). What are the expected phenotypic ratios among the male and female offspring?",
    options: [
      "$100\\%$ of females are red-eyed ($X^R X^r$); $100\\%$ of males are white-eyed ($X^r Y$).",
      "$50\\%$ of females are red-eyed, $50\\%$ white-eyed; all males are red-eyed.",
      "All offspring ($100\\%$ males and females) have white eyes.",
      "$75\\%$ red-eyed and $25\\%$ white-eyed across all sexes."
    ],
    correctIndex: 0,
    explanation: "Mother produces only $X^r$ gametes. Father produces $X^R$ and $Y$ gametes.\n• Female offspring inherit $X^R$ from father and $X^r$ from mother: genotype $X^R X^r$ ($100\\%$ red-eyed carriers).\n• Male offspring inherit $Y$ from father and $X^r$ from mother: genotype $X^r Y$ ($100\\%$ hemizygous white-eyed).",
    rubricCER: null
  },
  {
    id: "BIO-Q03",
    subject: "BIO",
    moduleId: 11,
    moduleTitle: "Molecular Genetics",
    type: "mcq",
    difficulty: "ap_olympiad",
    question: "A template DNA strand has the sequence $3'\\text{-TAC GGC TTA CTG ACT-}5'$. What is the corresponding mRNA transcript, and what is the resulting peptide sequence synthesized during translation? (Codons: $\\text{AUG}=\\text{Met}$, $\\text{CCG}=\\text{Pro}$, $\\text{AAU}=\\text{Asn}$, $\\text{GAC}=\\text{Asp}$, $\\text{UGA}=\\text{Stop}$)",
    options: [
      "mRNA: $5'\\text{-AUG CCG AAU GAC UGA-}3'$; Peptide: Met-Pro-Asn-Asp",
      "mRNA: $5'\\text{-UAC GGC UUA CUG ACU-}3'$; Peptide: Tyr-Gly-Leu-Leu-Thr",
      "mRNA: $5'\\text{-AUG CCG UUA GAC UGA-}3'$; Peptide: Met-Pro-Leu-Asp-Stop",
      "mRNA: $3'\\text{-AUG CCG AAU GAC UGA-}5'$; Peptide: Asp-Asn-Pro-Met"
    ],
    correctIndex: 0,
    explanation: "RNA polymerase transcribes complementary antiparallel mRNA ($5' \\rightarrow 3'$):\n$$3'\\text{-TAC-}'5' \\longrightarrow 5'\\text{-AUG-}3'\\text{ (Met)}$$\n$$3'\\text{-GGC-}'5' \\longrightarrow 5'\\text{-CCG-}3'\\text{ (Pro)}$$\n$$3'\\text{-TTA-}'5' \\longrightarrow 5'\\text{-AAU-}3'\\text{ (Asn)}$$\n$$3'\\text{-CTG-}'5' \\longrightarrow 5'\\text{-GAC-}3'\\text{ (Asp)}$$\n$$3'\\text{-ACT-}'5' \\longrightarrow 5'\\text{-UGA-}3'\\text{ (Stop)}$$\nTranslation halts at the UGA stop codon, yielding the tetrapeptide Met-Pro-Asn-Asp.",
    rubricCER: null
  },
  {
    id: "BIO-Q04",
    subject: "BIO",
    moduleId: 2,
    moduleTitle: "Principles of Ecology",
    type: "numerical",
    difficulty: "foundational",
    question: "In a prairie ecosystem, primary producers synthesize $120{,}000\\text{ kJ/m}^2\\text{/year}$ of net biomass energy. Following Lindeman's $10\\%$ ecological trophic efficiency rule, how many kilojoules of energy reach secondary consumers (carnivores)?",
    correctAnswer: "1200",
    tolerance: 0,
    unit: "kJ",
    options: ["$12{,}000\\text{ kJ}$", "$1{,}200\\text{ kJ}$", "$120\\text{ kJ}$", "$60{,}000\\text{ kJ}$"],
    correctIndex: 1,
    explanation: "According to Lindeman's $10\\%$ trophic transfer:\n$$\\text{Primary Producers} = 120{,}000\\text{ kJ}$$\n$$\\text{Primary Consumers (Herbivores)} = 120{,}000 \\times 0.10 = 12{,}000\\text{ kJ}$$\n$$\\text{Secondary Consumers (Carnivores)} = 12{,}000 \\times 0.10 = 1{,}200\\text{ kJ}$$\nThe remaining $90\\%$ at each level is lost as metabolic heat and cellular respiration.",
    rubricCER: null
  },
  {
    id: "BIO-Q05",
    subject: "BIO",
    moduleId: 23,
    moduleTitle: "Nervous System",
    type: "cer",
    difficulty: "ap_olympiad",
    question: "Tetrodotoxin (TTX) selectively blocks voltage-gated sodium channels in axonal membranes. Formulate a Claim, Evidence, and Reasoning (CER) explanation describing how exposure to TTX leads to flaccid muscle paralysis and respiratory failure.",
    explanation: "Claim: TTX halts the initiation and propagation of action potentials along motor neurons, preventing acetylcholine release and diaphragm contraction.\nEvidence: TTX occludes voltage-gated $\\text{Na}^+$ channels. Generating an action potential requires rapid influx of $\\text{Na}^+$ when the membrane threshold ($-55\\text{ mV}$) is reached.\nReasoning: Without $\\text{Na}^+$ influx, axonal depolarization cannot occur. Action potentials cannot reach the axon terminal, preventing calcium influx and vesicular exocytosis of acetylcholine, causing flaccid paralysis of respiratory muscles.",
    rubricCER: {
      claim: "Identifies failure of action potential transmission leading to flaccid muscle paralysis (2 pts)",
      evidence: "Explains blocking of voltage-gated Na+ influx and prevention of axonal depolarization (3 pts)",
      reasoning: "Links absence of action potentials to lack of acetylcholine release at motor endplates and diaphragm cessation (3 pts)",
      clarity: "Coherent logical scientific structure (2 pts)"
    }
  },

  // =================== PHYSICS QUESTIONS ===================
  {
    id: "PHYS-Q01",
    subject: "PHYS",
    moduleId: 6,
    moduleTitle: "Motion in Two Dimensions",
    type: "numerical",
    difficulty: "honors",
    question: "A projectile is launched from ground level with initial velocity $v_0 = 50.0\\text{ m/s}$ at angle $\\theta = 30.0^\\circ$ above the horizontal across a level field ($g = 9.80\\text{ m/s}^2$). What is the total horizontal range ($R$) of the projectile in meters?",
    correctAnswer: "220.9",
    tolerance: 1.0,
    unit: "m",
    options: ["$180.5\\text{ m}$", "$220.9\\text{ m}$", "$255.1\\text{ m}$", "$127.6\\text{ m}$"],
    correctIndex: 1,
    explanation: "Apply the horizontal range equation for level ground:\n$$R = \\frac{v_0^2 \\sin(2\\theta)}{g}$$\n$$v_0 = 50.0\\text{ m/s} \\implies v_0^2 = 2500$$\n$$2\\theta = 60.0^\\circ \\implies \\sin(60.0^\\circ) = \\frac{\\sqrt{3}}{2} \\approx 0.8660$$\n$$R = \\frac{2500 \\times 0.8660}{9.80} = \\frac{2165.06}{9.80} \\approx 220.92\\text{ m}$$",
    rubricCER: null
  },
  {
    id: "PHYS-Q02",
    subject: "PHYS",
    moduleId: 19,
    moduleTitle: "Electric Current and Circuits",
    type: "numerical",
    difficulty: "honors",
    question: "A $V = 24.0\\text{ V}$ DC power supply is connected to three resistors: $R_1 = 10.0\\;\\Omega$ connected in series with a parallel combination of $R_2 = 20.0\\;\\Omega$ and $R_3 = 30.0\\;\\Omega$. What is the total current ($I_{\\text{total}}$) leaving the power supply, and what is the equivalent circuit resistance ($R_{\\text{eq}}$)?",
    correctAnswer: "1.09",
    tolerance: 0.05,
    unit: "A",
    options: [
      "$R_{\\text{eq}} = 60.0\\;\\Omega, \\; I = 0.40\\text{ A}$",
      "$R_{\\text{eq}} = 22.0\\;\\Omega, \\; I = 1.09\\text{ A}$",
      "$R_{\\text{eq}} = 15.0\\;\\Omega, \\; I = 1.60\\text{ A}$",
      "$R_{\\text{eq}} = 35.0\\;\\Omega, \\; I = 0.69\\text{ A}$"
    ],
    correctIndex: 1,
    explanation: "Step 1: Parallel branch equivalent resistance:\n$$\\frac{1}{R_p} = \\frac{1}{R_2} + \\frac{1}{R_3} = \\frac{1}{20} + \\frac{1}{30} = \\frac{5}{60} = \\frac{1}{12\\;\\Omega} \\implies R_p = 12.0\\;\\Omega$$\n\nStep 2: Add series resistor $R_1$:\n$$R_{\\text{eq}} = R_1 + R_p = 10.0\\;\\Omega + 12.0\\;\\Omega = 22.0\\;\\Omega$$\n\nStep 3: Total current via Ohm's Law:\n$$I_{\\text{total}} = \\frac{V}{R_{\\text{eq}}} = \\frac{24.0\\text{ V}}{22.0\\;\\Omega} \\approx 1.091\\text{ A}$$",
    rubricCER: null
  },
  {
    id: "PHYS-Q03",
    subject: "PHYS",
    moduleId: 16,
    moduleTitle: "Reflection and Refraction",
    type: "mcq",
    difficulty: "honors",
    question: "An optical crown glass prism ($n_1 = 1.52$) is immersed in water ($n_2 = 1.33$). What is the critical angle ($\\theta_c$) for total internal reflection to occur at the glass-water interface?",
    options: [
      "$\\theta_c = 41.1^\\circ$",
      "$\\theta_c = 61.0^\\circ$",
      "$\\theta_c = 48.8^\\circ$",
      "Total internal reflection cannot occur because glass has a higher index than water."
    ],
    correctIndex: 1,
    explanation: "Total internal reflection occurs when light travels from a higher index medium ($n_1 = 1.52$) toward a lower index medium ($n_2 = 1.33$) at an incident angle exceeding $\\theta_c$:\n$$n_1 \\sin\\theta_c = n_2 \\sin 90^\\circ = n_2$$\n$$\\sin\\theta_c = \\frac{n_2}{n_1} = \\frac{1.33}{1.52} \\approx 0.8750$$\n$$\\theta_c = \\arcsin(0.8750) \\approx 61.04^\\circ \\approx 61.0^\\circ$$",
    rubricCER: null
  },
  {
    id: "PHYS-Q04",
    subject: "PHYS",
    moduleId: 10,
    moduleTitle: "Energy and Its Conservation",
    type: "mcq",
    difficulty: "foundational",
    question: "A $1000\\text{ kg}$ roller coaster cart starts from rest at the top of a frictionless hill of height $h = 45.0\\text{ m}$. What is the speed of the cart ($v$) at the bottom of the hill? (Take $g = 9.80\\text{ m/s}^2$)",
    options: [
      "$21.0\\text{ m/s}$",
      "$29.7\\text{ m/s}$",
      "$44.1\\text{ m/s}$",
      "$88.2\\text{ m/s}$"
    ],
    correctIndex: 1,
    explanation: "By conservation of mechanical energy:\n$$PE_{\\text{grav}} = KE_{\\text{final}}$$\n$$mgh = \\frac{1}{2}mv^2$$\nDividing out mass $m$ and solving for $v$:\n$$v = \\sqrt{2gh} = \\sqrt{2 \\times 9.80\\text{ m/s}^2 \\times 45.0\\text{ m}} = \\sqrt{882} \\approx 29.70\\text{ m/s}$$",
    rubricCER: null
  },
  {
    id: "PHYS-Q05",
    subject: "PHYS",
    moduleId: 9,
    moduleTitle: "Momentum and Its Conservation",
    type: "cer",
    difficulty: "honors",
    question: "Two air-track gliders, Glider A ($m_A = 0.50\\text{ kg}$, $v_A = 2.0\\text{ m/s}$ right) and Glider B ($m_B = 1.0\\text{ kg}$, stationary), collide with Velcro bumpers and stick together. Formulate a Claim, Evidence, and Reasoning (CER) analysis determining the final velocity $v_f$ of the coupled gliders and evaluating whether kinetic energy was conserved.",
    explanation: "Claim: The coupled gliders move together to the right at $v_f = 0.67\\text{ m/s}$, and kinetic energy is NOT conserved (the collision is completely inelastic).\nEvidence: Initial momentum:\n$$p_{\\text{init}} = m_A v_A + m_B v_B = (0.50)(2.0) + (1.0)(0) = 1.0\\text{ kg}\\cdot\\text{m/s}$$\n$$v_f = \\frac{p_{\\text{init}}}{m_A + m_B} = \\frac{1.0}{1.5} = 0.67\\text{ m/s}$$\n$$KE_{\\text{init}} = \\frac{1}{2}(0.50)(2.0)^2 = 1.0\\text{ J}$$\n$$KE_{\\text{final}} = \\frac{1}{2}(1.5)(0.667)^2 = 0.33\\text{ J}$$\nReasoning: In an isolated system without external net forces, momentum is conserved. Because gliders lock together, mechanical work deforms the Velcro fibers, dissipating $0.67\\text{ J}$ ($67\\%$) of mechanical energy into heat and acoustics.",
    rubricCER: {
      claim: "States final velocity vf = 0.67 m/s to the right and classifies as inelastic collision (2 pts)",
      evidence: "Correct momentum balance equation and mathematical calculation of initial vs final KE (3 pts)",
      reasoning: "Explains momentum conservation law and physical dissipation of kinetic energy into thermal/deformation modes (3 pts)",
      accuracy: "All units, signs, and significant digits verified (2 pts)"
    }
  },
  {
    id: "PHYS-Q06",
    subject: "PHYS",
    moduleId: 22,
    moduleTitle: "Quantum Theory and the Atom",
    type: "mcq",
    difficulty: "ap_olympiad",
    question: "When ultraviolet light of frequency $f = 1.50 \\times 10^{15}\\text{ Hz}$ strikes a cesium metal surface with work function $\\Phi = 2.14\\text{ eV}$ ($3.43 \\times 10^{-19}\\text{ J}$), what is the maximum kinetic energy ($KE_{\\max}$) of emitted photoelectrons? ($h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$, $1\\text{ eV} = 1.602 \\times 10^{-19}\\text{ J}$)",
    options: [
      "$4.07\\text{ eV} \\; (6.51 \\times 10^{-19}\\text{ J})$",
      "$2.14\\text{ eV} \\; (3.43 \\times 10^{-19}\\text{ J})$",
      "$6.21\\text{ eV} \\; (9.94 \\times 10^{-19}\\text{ J})$",
      "$0\\text{ eV}$ (incident photon energy is below threshold)"
    ],
    correctIndex: 0,
    explanation: "Einstein's photoelectric equation:\n$$E_{\\text{photon}} = h f = \\Phi + KE_{\\max}$$\n$$E_{\\text{photon}} = (6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s})(1.50 \\times 10^{15}\\text{ s}^{-1}) = 9.939 \\times 10^{-19}\\text{ J}$$\nIn electron-volts:\n$$E_{\\text{photon}} = \\frac{9.939 \\times 10^{-19}\\text{ J}}{1.602 \\times 10^{-19}\\text{ J/eV}} = 6.204\\text{ eV}$$\n$$KE_{\\max} = E_{\\text{photon}} - \\Phi = 6.204\\text{ eV} - 2.14\\text{ eV} \\approx 4.064\\text{ eV} \\approx 4.07\\text{ eV}$$",
    rubricCER: null
  }
];
