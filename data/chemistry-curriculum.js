// Edugates-ClipSAT Science Labs - Chemistry Curriculum Data
// Extracted from McGraw-Hill Inspire Chemistry (Teacher's Edition - 23 Modules)

export const chemistryCurriculum = {
  subject: "Chemistry",
  code: "CHEM",
  color: "#06b6d4",
  badge: "The Central Science",
  description: "Explore the composition, structure, properties, and changes of matter through atomic theory, thermodynamics, chemical kinetics, and laboratory inquiry.",
  totalModules: 23,
  modules: [
    {
      id: 1,
      code: "CHEM-M01",
      title: "The Central Science",
      unit: "Foundations of Chemistry",
      phenomenon: "How does the microscopic arrangement of matter govern macroscopic behaviors of everything we see and touch?",
      bigIdea: "Chemistry is the fundamental science connecting physics, biology, geology, and environmental engineering.",
      lessons: [
        { id: 1, title: "The Story of Two Substances", objectives: ["Distinguish between ozone formation in stratosphere vs troposphere", "Analyze chlorofluorocarbons (CFCs) impact"] },
        { id: 2, title: "Chemistry and Matter", objectives: ["Differentiate mass vs weight", "Identify branches of chemistry (organic, inorganic, physical, analytical, biochemistry)"] },
        { id: 3, title: "Scientific Methods", objectives: ["Formulate testable hypotheses", "Identify independent, dependent, and controlled variables"] },
        { id: 4, title: "Scientific Research", objectives: ["Differentiate pure vs applied research", "Explore serendipitous laboratory breakthroughs"] }
      ],
      formulas: ["\\text{Density} = \\frac{m}{V}", "\\% \\text{ Error} = \\frac{|\\text{Experimental} - \\text{Accepted}|}{\\text{Accepted}} \\times 100\\%"],
      lab: "lab-periodic-table"
    },
    {
      id: 2,
      code: "CHEM-M02",
      title: "Matter—Properties and Changes",
      unit: "Foundations of Chemistry",
      phenomenon: "Why do iron bridges rust and expand under heat, yet the total mass of the universe remains conserved?",
      bigIdea: "Matter exists in solid, liquid, gas, and plasma states and undergoes physical and chemical changes governed by conservation laws.",
      lessons: [
        { id: 1, title: "Properties of Matter", objectives: ["Distinguish physical (intensive/extensive) vs chemical properties", "Identify signs of chemical change"] },
        { id: 2, title: "Changes in Matter", objectives: ["Analyze phase transitions and phase diagrams", "Apply Law of Conservation of Mass"] },
        { id: 3, title: "Mixtures of Matter", objectives: ["Classify heterogeneous vs homogeneous mixtures (solutions)", "Techniques: filtration, distillation, crystallization, chromatography"] },
        { id: 4, title: "Elements and Compounds", objectives: ["Law of Definite Proportions", "Law of Multiple Proportions"] }
      ],
      formulas: ["m_{\\text{reactants}} = m_{\\text{products}}", "\\% \\text{ by mass} = \\frac{m_{\\text{element}}}{m_{\\text{compound}}} \\times 100\\%"],
      lab: "lab-gas-laws"
    },
    {
      id: 3,
      code: "CHEM-M03",
      title: "The Structure of the Atom",
      unit: "Atomic Theory & Electronic Structure",
      phenomenon: "How can gold foil deflect alpha particles backwards if atoms were solid spheres?",
      bigIdea: "Atoms consist of a dense, positively charged nucleus surrounded by an electron cloud.",
      lessons: [
        { id: 1, title: "Early Ideas About Matter", objectives: ["Democritus vs Aristotle philosophies", "Dalton's Atomic Theory postulates"] },
        { id: 2, title: "Defining the Atom", objectives: ["J.J. Thomson cathode ray tube & electron discovery", "Millikan oil drop experiment", "Rutherford gold foil experiment & nucleus discovery"] },
        { id: 3, title: "How Atoms Differ", objectives: ["Atomic number (Z), mass number (A)", "Isotopes, atomic mass unit (amu), weighted average atomic mass"] },
        { id: 4, title: "Unstable Nuclei and Radioactive Decay", objectives: ["Alpha, beta, and gamma radiation emissions", "Nuclear stability ratios (N/Z)"] }
      ],
      formulas: ["A = Z + N", "\\text{Avg Mass} = \\sum (\\text{fractional abundance}_i \\times \\text{mass}_i)"],
      lab: "lab-periodic-table"
    },
    {
      id: 4,
      code: "CHEM-M04",
      title: "Electrons in Atoms",
      unit: "Atomic Theory & Electronic Structure",
      phenomenon: "Why do fireworks burst into distinct neon colors (crimson, emerald, violet) when heated?",
      bigIdea: "Electrons occupy quantized energy levels described by quantum numbers and atomic orbital wavefunctions.",
      lessons: [
        { id: 1, title: "Light and Quantized Energy", objectives: ["Electromagnetic wave equation c = λν", "Planck's constant and photon energy E = hν", "Photoelectric effect"] },
        { id: 2, title: "Quantum Theory and the Atom", objectives: ["Bohr model of hydrogen atom", "De Broglie matter waves λ = h/mv", "Heisenberg Uncertainty Principle", "Schrödinger wave equation"] },
        { id: 3, title: "Electron Configuration", objectives: ["Aufbau principle", "Pauli exclusion principle", "Hund's rule", "Orbital diagrams and noble gas notation"] }
      ],
      formulas: ["c = \\lambda \\nu", "E = h\\nu", "\\lambda = \\frac{h}{mv}"],
      lab: "lab-periodic-table"
    },
    {
      id: 5,
      code: "CHEM-M05",
      title: "The Periodic Table and Periodic Law",
      unit: "Atomic Theory & Electronic Structure",
      phenomenon: "Why did Mendeleev leave intentional blank gaps in his periodic table and accurately predict undiscovered elements?",
      bigIdea: "Periodic trends in atomic radius, ionization energy, and electronegativity arise from effective nuclear charge and electron shielding.",
      lessons: [
        { id: 1, title: "Development of the Modern Periodic Table", objectives: ["Lavoisier, Newlands, Meyer, Mendeleev, Moseley", "Periods and Groups (Alkali, Alkaline Earth, Halogens, Noble Gases)"] },
        { id: 2, title: "Classification of the Elements", objectives: ["s, p, d, f orbital valence blocks", "Metals, nonmetals, metalloids, transition elements"] },
        { id: 3, title: "Periodic Trends", objectives: ["Atomic radii across periods and down groups", "Ionic radii comparisons", "First and successive ionization energies", "Electronegativity (Pauling scale)"] }
      ],
      formulas: ["Z_{\\text{eff}} = Z - S", "\\text{IE}_1 < \\text{IE}_2 \\ll \\text{IE}_3 \\text{ (core break)}"],
      lab: "lab-periodic-table"
    },
    {
      id: 6,
      code: "CHEM-M06",
      title: "Ionic Compounds and Metals",
      unit: "Chemical Bonding & Molecular Architecture",
      phenomenon: "Why do brittle table salt crystals shatter under a hammer while metallic silver bends into thin wire?",
      bigIdea: "Ionic bonds result from electrostatic attraction between cations and anions in a crystal lattice; metallic bonds involve a sea of delocalized electrons.",
      lessons: [
        { id: 1, title: "Ion Formation", objectives: ["Octet rule and valence electron transfer", "Transition metal pseudo-noble gas configurations"] },
        { id: 2, title: "Ionic Bonds and Ionic Compounds", objectives: ["Crystal lattice structure", "Lattice energy trends via Coulomb's Law", "Electrolytes in aqueous solution"] },
        { id: 3, title: "Names and Formulas for Ionic Compounds", objectives: ["Monatomic and polyatomic ions", "Stock system for transition metal oxidation states"] },
        { id: 4, title: "Metallic Bonds and the Properties of Metals", objectives: ["Electron sea model", "Malleability, ductility, electrical and thermal conductivity", "Alloys: interstitial vs substitutional"] }
      ],
      formulas: ["F = k_e \\frac{|q_1 q_2|}{r^2}", "\\text{Lattice Energy} \\propto \\frac{|q_1 q_2|}{r_0}"],
      lab: "lab-periodic-table"
    },
    {
      id: 7,
      code: "CHEM-M07",
      title: "Covalent Bonding",
      unit: "Chemical Bonding & Molecular Architecture",
      phenomenon: "Why is water liquid at room temperature while methane is a gas of almost identical molecular weight?",
      bigIdea: "Covalent bonds involve shared electron pairs forming discrete molecules with distinct 3D geometries and polarities.",
      lessons: [
        { id: 1, title: "The Covalent Bond", objectives: ["Single, double, triple bonds (sigma σ and pi π bonds)", "Bond length and bond dissociation energy"] },
        { id: 2, title: "Naming Molecules", objectives: ["Binary molecular compounds (Greek prefixes)", "Naming binary acids and oxyacids"] },
        { id: 3, title: "Molecular Structures", objectives: ["Lewis dot structures", "Resonance structures", "Octet rule exceptions: suboctet, expanded octet, odd-electron radicals"] },
        { id: 4, title: "Molecular Shapes (VSEPR Model)", objectives: ["Linear, bent, trigonal planar, tetrahedral, trigonal bipyramidal, octahedral", "Bond angles and lone pair repulsions"] },
        { id: 5, title: "Electronegativity and Polarity", objectives: ["Nonpolar covalent, polar covalent, ionic boundaries", "Molecular dipole moments and solubility"] }
      ],
      formulas: ["\\Delta \\text{EN} = |\\chi_A - \\chi_B|", "\\vec{\\mu} = q \\times \\vec{r}"],
      lab: "lab-vsepr"
    },
    {
      id: 8,
      code: "CHEM-M08",
      title: "Chemical Reactions",
      unit: "Chemical Transformations & Stoichiometry",
      phenomenon: "How do automobile airbags inflate with 70 liters of nitrogen gas in under 40 milliseconds during a crash?",
      bigIdea: "Chemical equations represent rearrangements of atoms during synthesis, decomposition, combustion, and displacement reactions.",
      lessons: [
        { id: 1, title: "Reactions and Equations", objectives: ["Writing skeleton equations", "Balancing with stoichiometric coefficients", "State symbols (s, l, g, aq)"] },
        { id: 2, title: "Classifying Chemical Reactions", objectives: ["Synthesis reactions", "Combustion reactions", "Decomposition reactions", "Single-replacement and activity series", "Double-replacement reactions"] },
        { id: 3, title: "Reactions in Aqueous Solutions", objectives: ["Dissociation of ionic solutes", "Complete ionic equations", "Spectator ions and Net ionic equations", "Precipitation, water-forming, and gas-forming reactions"] }
      ],
      formulas: ["aA + bB \\rightarrow cC + dD", "\\text{Net Ionic: } Ag^+(aq) + Cl^-(aq) \\rightarrow AgCl(s)"],
      lab: "lab-titration"
    },
    {
      id: 9,
      code: "CHEM-M09",
      title: "The Mole",
      unit: "Chemical Transformations & Stoichiometry",
      phenomenon: "How do chemists count trillions of individual atoms simply by placing a beaker on an analytical balance?",
      bigIdea: "The mole is the SI fundamental unit for amount of substance, bridge between macroscopic mass and microscopic particles via Avogadro's number.",
      lessons: [
        { id: 1, title: "Measuring Matter", objectives: ["Avogadro's constant 6.022 × 10²³ particles/mol", "Particle-to-mole conversions"] },
        { id: 2, title: "Mass and the Mole", objectives: ["Molar mass (g/mol) from periodic table", "Grams-to-moles and grams-to-atoms dual conversions"] },
        { id: 3, title: "Moles of Compounds", objectives: ["Calculating formula mass of molecular and ionic compounds", "Subscript mole ratios"] },
        { id: 4, title: "Empirical and Molecular Formulas", objectives: ["Determining empirical formulas from % composition", "Calculating molecular formulas using molar mass"] },
        { id: 5, title: "Formulas of Hydrates", objectives: ["Heating salt hydrates to anhydrous form", "Determining water of crystallization coefficients"] }
      ],
      formulas: ["N = n \\times N_A", "n = \\frac{m}{M}", "\\text{Hydrate: } CuSO_4 \\cdot 5H_2O"],
      lab: "lab-titration"
    },
    {
      id: 10,
      code: "CHEM-M10",
      title: "Stoichiometry",
      unit: "Chemical Transformations & Stoichiometry",
      phenomenon: "Why does a rocket booster carry precisely calculated tons of liquid oxygen rather than burning indefinitely?",
      bigIdea: "Stoichiometry uses mole ratios derived from balanced equations to calculate masses of reactants consumed and products formed.",
      lessons: [
        { id: 1, title: "Defining Stoichiometry", objectives: ["Mole ratio interpretation from balanced chemical equations", "Mole-to-mole conversions"] },
        { id: 2, title: "Stoichiometric Calculations", objectives: ["Mass-to-mass four-step conversions", "Volume-to-mass stoichiometry at STP"] },
        { id: 3, title: "Limiting Reactants", objectives: ["Identifying limiting vs excess reactants", "Calculating mass of leftover excess reactant"] },
        { id: 4, title: "Percent Yield", objectives: ["Theoretical yield calculation", "Measuring actual laboratory yield", "Sources of percent yield deviation"] }
      ],
      formulas: ["\\% \\text{ Yield} = \\frac{\\text{Actual Yield}}{\\text{Theoretical Yield}} \\times 100\\%", "\\text{Limiting Reactant Determination}"],
      lab: "lab-titration"
    },
    {
      id: 11,
      code: "CHEM-M11",
      title: "States of Matter",
      unit: "Thermodynamics & Kinetic Theory",
      phenomenon: "Why does dry ice sublime straight to vapor, whereas water ice forms puddles before evaporating?",
      bigIdea: "Intermolecular forces (dispersion, dipole-dipole, hydrogen bonding) dictate physical states, phase diagrams, and fluid properties.",
      lessons: [
        { id: 1, title: "Gases and Kinetic-Molecular Theory", objectives: ["Postulates of KMT", "Graham's Law of Effusion", "Dalton's Law of Partial Pressures"] },
        { id: 2, title: "Forces of Attraction", objectives: ["Intramolecular vs Intermolecular forces", "London dispersion forces", "Dipole-dipole forces", "Hydrogen bonding in water"] },
        { id: 3, title: "Liquids and Solids", objectives: ["Viscosity, surface tension, capillary action", "Crystalline solids vs amorphous solids", "Unit cells"] },
        { id: 4, title: "Phase Changes", objectives: ["Endothermic vs exothermic phase changes", "Triple point and critical point on phase diagrams"] }
      ],
      formulas: ["\\frac{\\text{Rate}_A}{\\text{Rate}_B} = \\sqrt{\\frac{M_B}{M_A}}", "P_{\\text{total}} = P_1 + P_2 + P_3 + \\dots"],
      lab: "lab-gas-laws"
    },
    {
      id: 12,
      code: "CHEM-M12",
      title: "Gases",
      unit: "Thermodynamics & Kinetic Theory",
      phenomenon: "How can deep-sea scuba divers safely ascend without gas bubbles expanding explosively inside their bloodstream?",
      bigIdea: "The behavior of gases is quantified by empirical gas laws relating pressure, volume, temperature, and quantity.",
      lessons: [
        { id: 1, title: "The Gas Laws", objectives: ["Boyle's Law (P vs V inverse)", "Charles's Law (V vs T direct)", "Gay-Lussac's Law (P vs T direct)"] },
        { id: 2, title: "The Combined Gas Law and Avogadro's Principle", objectives: ["Combined gas law formula", "Molar volume at STP (22.4 L/mol)"] },
        { id: 3, title: "The Ideal Gas Law", objectives: ["Ideal gas constant R derivation", "Determining molar mass and density of a gas", "Real vs Ideal gas deviations (Van der Waals)"] },
        { id: 4, title: "Gas Stoichiometry", objectives: ["Volume-volume and volume-mass reactions at varying conditions"] }
      ],
      formulas: ["P_1 V_1 = P_2 V_2", "\\frac{V_1}{T_1} = \\frac{V_2}{T_2}", "PV = nRT", "M = \\frac{dRT}{P}"],
      lab: "lab-gas-laws"
    },
    {
      id: 13,
      code: "CHEM-M13",
      title: "Mixtures and Solutions",
      unit: "Thermodynamics & Kinetic Theory",
      phenomenon: "Why do road crews scatter calcium chloride salt on icy roads during sub-zero blizzards?",
      bigIdea: "Solution formation depends on intermolecular interactions, resulting in concentration metrics and colligative properties.",
      lessons: [
        { id: 1, title: "Types of Mixtures", objectives: ["Solutions, suspensions, colloids", "Brownian motion and Tyndall effect"] },
        { id: 2, title: "Solution Concentration", objectives: ["Molarity (M)", "Molality (m)", "Mole fraction (X)", "Dilution formula M₁V₁ = M₂V₂"] },
        { id: 3, title: "Factors Affecting Solvation", objectives: ["Like dissolves like principle", "Heat of solution", "Henry's Law (gas solubility vs pressure)"] },
        { id: 4, title: "Colligative Properties of Solutions", objectives: ["Vapor pressure lowering (Raoult's Law)", "Boiling point elevation ΔTb", "Freezing point depression ΔTf", "Van 't Hoff factor (i)"] }
      ],
      formulas: ["M = \\frac{\\text{mol solute}}{L \\text{ solution}}", "M_1 V_1 = M_2 V_2", "\\Delta T_b = i K_b m", "\\Delta T_f = i K_f m"],
      lab: "lab-titration"
    },
    {
      id: 14,
      code: "CHEM-M14",
      title: "Energy and Chemical Change",
      unit: "Thermodynamics & Kinetic Theory",
      phenomenon: "How can instantaneous cold packs drop from room temperature to freezing upon breaking an inner water pouch?",
      bigIdea: "Thermodynamics governs heat exchange, enthalpy changes, and the spontaneity of chemical and physical processes.",
      lessons: [
        { id: 1, title: "Energy", objectives: ["Kinetic vs potential energy", "Law of conservation of energy", "Specific heat capacity q = mcΔT"] },
        { id: 2, title: "Heat in Chemical Reactions and Processes", objectives: ["Constant-pressure calorimetry", "Thermochemical equations", "Enthalpy of fusion and vaporization"] },
        { id: 3, title: "Thermochemical Equations", objectives: ["Hess's Law of heat summation", "Standard enthalpies of formation ΔH°f"] },
        { id: 4, title: "Calculating Enthalpy Change", objectives: ["Summation of formation enthalpies", "Bond energy approximations"] },
        { id: 5, title: "Reaction Spontaneity", objectives: ["Entropy (S) and Second Law of Thermodynamics", "Gibbs Free Energy ΔG = ΔH - TΔS", "Spontaneity criteria"] }
      ],
      formulas: ["q = m c \\Delta T", "\\Delta H_{\\text{rxn}}^\\circ = \\sum n\\Delta H_f^\\circ(\\text{prod}) - \\sum m\\Delta H_f^\\circ(\\text{react})", "\\Delta G = \\Delta H - T\\Delta S"],
      lab: "lab-calorimetry"
    },
    {
      id: 15,
      code: "CHEM-M15",
      title: "Reaction Rates",
      unit: "Chemical Kinetics & Equilibrium",
      phenomenon: "Why does glowing charcoal smolder slowly in room air but erupt into brilliant white-hot flames in pure oxygen?",
      bigIdea: "Reaction rates depend on collision frequency, orientation, and activation energy, and are described by differential rate laws.",
      lessons: [
        { id: 1, title: "A Model for Reaction Rates", objectives: ["Collision theory fundamentals", "Activated complex / transition state", "Activation energy (Ea)"] },
        { id: 2, title: "Factors Affecting Reaction Rates", objectives: ["Nature of reactants, concentration, surface area, temperature", "Catalysts vs inhibitors, enzyme action"] },
        { id: 3, title: "Rate Laws", objectives: ["Differential rate law Rate = k[A]^m[B]^n", "Determining reaction orders from initial rates data"] },
        { id: 4, title: "Instantaneous Reaction Rates and Reaction Mechanisms", objectives: ["Elementary steps and molecularity", "Rate-determining step (RDS)", "Intermediates vs Catalysts in mechanisms"] }
      ],
      formulas: ["\\text{Rate} = -\\frac{\\Delta [A]}{\\Delta t}", "\\text{Rate} = k [A]^m [B]^n", "k = A e^{-E_a / RT}"],
      lab: "lab-titration"
    },
    {
      id: 16,
      code: "CHEM-M16",
      title: "Chemical Equilibrium",
      unit: "Chemical Kinetics & Equilibrium",
      phenomenon: "Why does a sealed bottle of carbonated soda remain at constant pressure until opened to the outside atmosphere?",
      bigIdea: "Chemical equilibrium is a dynamic state where forward and reverse reaction rates are equal, governed by Le Chatelier's Principle.",
      lessons: [
        { id: 1, title: "A State of Dynamic Balance", objectives: ["Reversible reactions", "Forward vs reverse rates equality", "Law of chemical equilibrium and Keq"] },
        { id: 2, title: "Factors Affecting Chemical Equilibrium", objectives: ["Le Chatelier's Principle", "Effects of changes in concentration, volume, pressure, temperature"] },
        { id: 3, title: "Using Equilibrium Constants", objectives: ["Calculating equilibrium concentrations (ICE tables)", "Reaction quotient (Q) vs Keq comparison", "Solubility product constant Ksp and precipitate prediction"] }
      ],
      formulas: ["K_{eq} = \\frac{[C]^c [D]^d}{[A]^a [B]^b}", "Q < K \\rightarrow \\text{Shift Right}", "K_{sp} = [M^{m+}]^n [X^{n-}]^m"],
      lab: "lab-equilibrium"
    },
    {
      id: 17,
      code: "CHEM-M17",
      title: "Acids and Bases",
      unit: "Chemical Kinetics & Equilibrium",
      phenomenon: "Why can the human bloodstream maintain a razor-thin pH of 7.35–7.45 even after consuming highly acidic citrus juice?",
      bigIdea: "Acids and bases undergo proton transfer reactions quantified by pH/pOH scales, titration equivalence, and buffer capacity.",
      lessons: [
        { id: 1, title: "Introduction to Acids and Bases", objectives: ["Arrhenius model", "Brønsted-Lowry model (conjugate acid-base pairs)", "Lewis model of electron pairs", "Amphoteric nature of water"] },
        { id: 2, title: "Strengths of Acids and Bases", objectives: ["Strong vs weak acids (Ka) and bases (Kb)", "Equilibrium of water autoionization Kw = 1.0 × 10⁻¹⁴"] },
        { id: 3, title: "What is pH?", objectives: ["Logarithmic pH and pOH scales", "pH + pOH = 14", "Calculating [H+] and [OH-] concentrations"] },
        { id: 4, title: "Neutralization", objectives: ["Acid-base neutralization reactions", "Titration procedure and equivalence point", "Acid-base indicators and end point", "Salt hydrolysis and buffer solutions"] }
      ],
      formulas: ["K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}", "\\text{pH} = -\\log[H^+]", "M_A V_A = M_B V_B", "\\text{pH} = pK_a + \\log\\frac{[A^-]}{[HA]}"],
      lab: "lab-titration"
    },
    {
      id: 18,
      code: "CHEM-M18",
      title: "Redox Reactions",
      unit: "Electrochemistry & Organic Chemistry",
      phenomenon: "How can burning magnesium strip produce intense blinding white light when submerged in carbon dioxide gas?",
      bigIdea: "Oxidation-reduction (redox) reactions involve the transfer of electrons from a reducing agent to an oxidizing agent.",
      lessons: [
        { id: 1, title: "Oxidation and Reduction", objectives: ["OIL RIG (Oxidation is Loss, Reduction is Gain)", "Oxidation numbers assignment rules", "Identifying oxidizing and reducing agents"] },
        { id: 2, title: "Balancing Redox Equations", objectives: ["Oxidation-number method", "Half-reaction method in acidic and basic aqueous solutions"] }
      ],
      formulas: ["\\text{Oxidation: } Zn \\rightarrow Zn^{2+} + 2e^-", "\\text{Reduction: } Cu^{2+} + 2e^- \\rightarrow Cu"],
      lab: "lab-titration"
    },
    {
      id: 19,
      code: "CHEM-M19",
      title: "Electrochemistry",
      unit: "Electrochemistry & Organic Chemistry",
      phenomenon: "How does a smartphone lithium-ion battery produce electrical voltage for hours and then reverse its reaction upon plugging in?",
      bigIdea: "Electrochemical cells convert chemical energy into electrical energy in galvanic cells and drive nonspontaneous reactions in electrolytic cells.",
      lessons: [
        { id: 1, title: "Voltaic Cells", objectives: ["Anode (oxidation) vs Cathode (reduction)", "Salt bridge function", "Standard cell potential E°cell calculation"] },
        { id: 2, title: "Batteries", objectives: ["Primary vs secondary batteries", "Lead-acid storage battery, alkaline cell, lithium-ion, fuel cells"] },
        { id: 3, title: "Electrolysis", objectives: ["Downs cell for sodium extraction", "Electrolysis of water", "Electroplating mechanisms"] }
      ],
      formulas: ["E_{\\text{cell}}^\\circ = E_{\\text{reduction (cathode)}}^\\circ - E_{\\text{reduction (anode)}}^\\circ", "\\Delta G^\\circ = -n F E_{\\text{cell}}^\\circ"],
      lab: "lab-electrochem"
    },
    {
      id: 20,
      code: "CHEM-M20",
      title: "Hydrocarbons",
      unit: "Electrochemistry & Organic Chemistry",
      phenomenon: "Why do octane fuels power internal combustion engines while candle paraffin wax burns slowly as a solid?",
      bigIdea: "Carbon’s unique catenation ability forms saturated and unsaturated hydrocarbon chains and rings with isomerism.",
      lessons: [
        { id: 1, title: "Alkanes", objectives: ["General formula CnH2n+2", "IUPAC naming of straight and branched alkanes", "Cycloalkanes"] },
        { id: 2, title: "Alkenes and Alkynes", objectives: ["Double (CnH2n) and triple (CnH2n-2) bonds", "Geometric cis-trans isomerism"] },
        { id: 3, title: "Hydrocarbon Isomers", objectives: ["Structural isomers", "Stereoisomers (chirality and optical enantiomers)"] },
        { id: 4, title: "Aromatic Hydrocarbons", objectives: ["Benzene ring delocalized π electron cloud", "Polycyclic aromatic hydrocarbons"] }
      ],
      formulas: ["\\text{Alkane: } C_n H_{2n+2}", "\\text{Alkene: } C_n H_{2n}", "\\text{Alkyne: } C_n H_{2n-2}"],
      lab: "lab-periodic-table"
    },
    {
      id: 21,
      code: "CHEM-M21",
      title: "Substituted Hydrocarbons and Their Reactions",
      unit: "Organic Chemistry & Biochemistry",
      phenomenon: "How does substituting a single hydrogen atom on ethane with a hydroxyl group transform an odorless gas into drinkable ethanol?",
      bigIdea: "Functional groups impart specific chemical reactivity to organic molecules, enabling synthesis of pharmaceuticals and synthetic polymers.",
      lessons: [
        { id: 1, title: "Functional Groups", objectives: ["Halocarbons, alcohols, ethers, amines", "Aldehydes, ketones, carboxylic acids, esters, amides"] },
        { id: 2, title: "Organic Reactions", objectives: ["Substitution reactions", "Addition reactions (hydration, hydrogenation)", "Elimination reactions", "Condensation and esterification reactions"] },
        { id: 3, title: "Polymers", objectives: ["Addition polymerization (polyethylene, PVC)", "Condensation polymerization (nylon, polyester)", "Recycling codes"] }
      ],
      formulas: ["R-OH \\text{ (Alcohol)}", "R-COOH + R'-OH \\rightleftharpoons R-COO-R' + H_2O \\text{ (Ester)}"],
      lab: "lab-titration"
    },
    {
      id: 22,
      code: "CHEM-M22",
      title: "The Chemistry of Life",
      unit: "Organic Chemistry & Biochemistry",
      phenomenon: "How can thousands of distinct enzymes catalyze biological reactions at body temperature with near 100% precision?",
      bigIdea: "Biochemical polymers—proteins, carbohydrates, lipids, and nucleic acids—drive cellular metabolism, structure, and hereditary information.",
      lessons: [
        { id: 1, title: "Proteins", objectives: ["20 standard amino acids", "Peptide bond formation", "Primary, secondary (α-helix, β-sheet), tertiary, and quaternary protein structures", "Enzyme lock-and-key and induced fit models"] },
        { id: 2, title: "Carbohydrates", objectives: ["Monosaccharides (glucose, fructose)", "Disaccharides (sucrose)", "Polysaccharides (starch, glycogen, cellulose)"] },
        { id: 3, title: "Lipids", objectives: ["Fatty acids: saturated vs unsaturated", "Triglycerides, phospholipids, steroids", "Cell membrane bilayer chemistry"] },
        { id: 4, title: "Nucleic Acids", objectives: ["Nucleotide components (phosphate, sugar, nitrogenous base)", "DNA double helix vs RNA single strand"] },
        { id: 5, title: "Metabolism", objectives: ["Catabolism (glycolysis, ATP production) vs Anabolism", "Photosynthesis and cellular respiration energetics"] }
      ],
      formulas: ["\\text{Peptide Bond: } -CO-NH-", "C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36\\text{ATP}"],
      lab: "lab-dna-protein"
    },
    {
      id: 23,
      code: "CHEM-M23",
      title: "Nuclear Chemistry",
      unit: "Nuclear Science & Advanced Applications",
      phenomenon: "How can splitting one kilogram of uranium-235 release more energy than burning three million kilograms of coal?",
      bigIdea: "Nuclear transformations alter atomic nuclei through radioactive decay, transmutation, fission, and fusion governed by mass-energy equivalence.",
      lessons: [
        { id: 1, title: "Nuclear Radiation", objectives: ["Subatomic composition of alpha, beta, positron, electron capture, and gamma emissions", "Penetrating power and biological shielding"] },
        { id: 2, title: "Radioactive Decay", objectives: ["Half-life calculations N(t) = N0(1/2)^(t/t1/2)", "Radiometric dating (Carbon-14 and Uranium-Lead)"] },
        { id: 3, title: "Transmutation", objectives: ["Induced transmutation in particle accelerators", "Transuranium elements synthesis"] },
        { id: 4, title: "Fission and Fusion of Atomic Nuclei", objectives: ["Nuclear binding energy per nucleon curve", "Nuclear fission chain reactions and critical mass", "Thermonuclear fusion in the Sun"] },
        { id: 5, title: "Applications and Hazards of Radiation", objectives: ["Radiation detection (Geiger-Müller counters, dosimeters)", "Medical radioisotopes (PET scans, radiotherapy)", "Nuclear waste storage"] }
      ],
      formulas: ["N(t) = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{t_{1/2}}}", "E = \\Delta m c^2"],
      lab: "lab-periodic-table"
    }
  ]
};
