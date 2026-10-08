// Edugates-ClipSAT Science Labs - Lightweight Lesson Interactive Specs Registry
// Extracted for upfront bundle optimization and on-demand simulation lazy-loading.

export const LESSON_INTERACTIVE_REGISTRY = {
  "CHEM-M01-L1": {
    "type": "chem-ozone-density",
    "lessonBadge": "Lesson 1",
    "title": "Atmospheric Ozone & Gas Density Distribution",
    "formula": "\\rho(z) = \\rho_0 e^{-z/H} \\quad \\text{and} \\quad \\text{O}_3 + h\\nu_{\\text{UV}} \\to \\text{O}_2 + \\text{O}",
    "inquiry": "Examine gas mass-to-volume density distribution across atmospheric strata; investigate how stratospheric ozone concentration governs solar UV-C and UV-B shielding and protects the biosphere.",
    "defaultParams": {
      "ozoneDu": 300,
      "uvFlux": 100,
      "probeAltitudeKm": 25,
      "mass": 48,
      "volume": 32
    }
  },
  "CHEM-M01-L2": {
    "type": "chem-density",
    "lessonBadge": "Lesson 2",
    "title": "Chemistry and Matter: Density & Buoyancy Laboratory",
    "formula": "\\text{Density } \\rho = \\frac{m}{V} \\quad \\text{and} \\quad F_b = \\rho_{\\text{fluid}} V g",
    "inquiry": "Adjust sample mass and volume to test whether its density exceeds water (1.00 g/cm³) and observe buoyant float/sink behavior.",
    "defaultParams": {
      "mass": 75,
      "volume": 50
    }
  },
  "CHEM-M01-L3": {
    "type": "chem-density",
    "lessonBadge": "Lesson 3",
    "title": "Scientific Methods & Volumetric Error Calibration",
    "formula": "\\% \\text{ Error} = \\frac{|\\text{Experimental} - \\text{Accepted}|}{\\text{Accepted}} \\times 100\\%",
    "inquiry": "Calibrate volumetric displacement instruments and quantify systematic error in empirical density measurements.",
    "defaultParams": {
      "mass": 54,
      "volume": 20
    }
  },
  "CHEM-M01-L4": {
    "type": "chem-density",
    "lessonBadge": "Lesson 4",
    "title": "Scientific Research: Precision Laboratory Measurements",
    "formula": "\\bar{x} = \\frac{1}{N}\\sum_{i=1}^N x_i",
    "inquiry": "Test repeatable empirical trials to distinguish between high measurement precision and systematic experimental accuracy.",
    "defaultParams": {
      "mass": 65,
      "volume": 25
    }
  },
  "CHEM-M02-L1": {
    "type": "chem-density",
    "lessonBadge": "Lesson 1",
    "title": "Intensive vs Extensive Properties Simulator",
    "formula": "\\text{Density } \\rho = \\frac{m}{V} \\quad (\\text{Intensive Property})",
    "inquiry": "Scale the object size and observe that while mass and volume (extensive) double, density remains an invariant intensive fingerprint.",
    "defaultParams": {
      "mass": 60,
      "volume": 25
    }
  },
  "CHEM-M02-L2": {
    "type": "chem-heating-curve",
    "lessonBadge": "Lesson 2",
    "title": "Heating Curve & Particulate Phase Transitions",
    "formula": "q = m c \\Delta T \\quad \\text{and} \\quad q = m \\Delta H_{\\text{fus/vap}}",
    "inquiry": "Heat water ice from -20°C through melting and boiling plateaus to observe molecular lattice vibration and state transitions.",
    "defaultParams": {
      "temp": -20,
      "energy": 0
    }
  },
  "CHEM-M02-L3": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 3",
    "title": "Homogeneous Mixtures & Solution Dilution",
    "formula": "M_1 V_1 = M_2 V_2 \\quad \\text{and} \\quad M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}}",
    "inquiry": "Dilute a concentrated aqueous mixture by adding pure solvent to observe continuous solute dispersion and concentration decrease.",
    "defaultParams": {
      "soluteMoles": 0.3,
      "volumeLitres": 0.5,
      "isAcid": false
    }
  },
  "CHEM-M02-L4": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 4",
    "title": "Law of Definite Proportions & Mass Conservation",
    "formula": "m_{\\text{reactants}} = m_{\\text{products}} \\quad \\text{and} \\quad 2\\text{Al} + 3\\text{Cl}_2 \\longrightarrow 2\\text{AlCl}_3",
    "inquiry": "Analyze reactant-product conversion ratios and prove that the total mass of reactants equals the total mass of synthesized products.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 3
    }
  },
  "CHEM-M03-L1": {
    "type": "chem-rutherford",
    "lessonBadge": "Lesson 1",
    "title": "Dalton's Atomic Theory & Indivisible Particle Model",
    "formula": "\\text{Mass Ratio} = \\frac{m_A}{m_B} = \\text{Small Whole Number}",
    "inquiry": "Verify that chemical compounds always contain elements in small whole-number atomic ratios.",
    "defaultParams": {
      "alphaCount": 15,
      "beamEnergy": 5.5
    }
  },
  "CHEM-M03-L2": {
    "type": "chem-rutherford",
    "lessonBadge": "Lesson 2",
    "title": "Rutherford Gold Foil Alpha Particle Scattering",
    "formula": "\\frac{d\\sigma}{d\\Omega} = \\left(\\frac{z Z e^2}{4\\pi \\epsilon_0 \\cdot 4 E}\\right)^2 \\frac{1}{\\sin^4(\\theta/2)}",
    "inquiry": "Fire positively charged alpha particles at the dense gold nucleus and record the rare, high-angle back-scattering deflections.",
    "defaultParams": {
      "alphaCount": 25,
      "beamEnergy": 6
    }
  },
  "CHEM-M03-L3": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 3",
    "title": "Isotopes & Weighted Average Atomic Mass",
    "formula": "\\bar{A} = \\sum (\\text{fractional abundance}_i \\times A_i)",
    "inquiry": "Combine isotopic masses and natural abundances of Chlorine-35 and Chlorine-37 to calculate weighted average atomic mass (35.45 amu).",
    "defaultParams": {}
  },
  "CHEM-M03-L4": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 4",
    "title": "Unstable Nuclei & Radioactive Alpha/Beta Decay",
    "formula": "N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t/t_{1/2}} \\quad \\text{and} \\quad {}^{238}_{92}\\text{U} \\longrightarrow {}^{234}_{90}\\text{Th} + {}^4_2\\alpha",
    "inquiry": "Trace radioactive parent nucleus decay over half-lives and observe alpha and beta radiation emissions.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "CHEM-M04-L1": {
    "type": "chem-bohr-photon",
    "lessonBadge": "Lesson 1",
    "title": "Electromagnetic Spectrum & Photon Quantized Energy",
    "formula": "c = \\lambda \\nu \\quad \\text{and} \\quad E = h \\nu = \\frac{hc}{\\lambda}",
    "inquiry": "Correlate photon frequency, wavelength, and energy to explain neon laser emission and firework flame colors.",
    "defaultParams": {
      "nInitial": 3,
      "nFinal": 2
    }
  },
  "CHEM-M04-L2": {
    "type": "chem-bohr-photon",
    "lessonBadge": "Lesson 2",
    "title": "Bohr Model of Hydrogen & Quantized Orbits",
    "formula": "\\Delta E = -R_H \\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right) = \\frac{hc}{\\lambda}",
    "inquiry": "Promote electrons between energy levels (n=1 to 5) and measure the precise emission wavelength of the Balmer visible spectral lines.",
    "defaultParams": {
      "nInitial": 4,
      "nFinal": 2
    }
  },
  "CHEM-M04-L3": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 3",
    "title": "Aufbau Principle & Electron Configurations",
    "formula": "1s^2 \\, 2s^2 \\, 2p^6 \\, 3s^2 \\, 3p^6 \\, 4s^2 \\, 3d^{10}",
    "inquiry": "Fill subshell orbitals according to Pauli exclusion and Hund's rule of maximum multiplicity.",
    "defaultParams": {}
  },
  "CHEM-M05-L1": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 1",
    "title": "Mendeleev's Periodic Law & Chemical Families",
    "formula": "\\text{Periodic Law: Properties recur periodically with atomic number } Z",
    "inquiry": "Explore group properties across Alkali Metals, Alkaline Earths, Halogens, and Noble Gases.",
    "defaultParams": {}
  },
  "CHEM-M05-L2": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 2",
    "title": "Valence Electron Blocks (s, p, d, f) Classification",
    "formula": "[\\text{Noble Gas}] \\, ns^x \\, (n-1)d^y \\, np^z",
    "inquiry": "Map valence electron configurations across s-block metals, p-block nonmetals, and transition metal d-orbitals.",
    "defaultParams": {}
  },
  "CHEM-M05-L3": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 3",
    "title": "Periodic Trends: Atomic Radius & Electronegativity",
    "formula": "Z_{\\text{eff}} = Z - S \\quad \\text{and} \\quad \\text{Radius} \\propto \\frac{1}{Z_{\\text{eff}}}",
    "inquiry": "Compare atomic radius, ionization energy, and Pauling electronegativity across Period 2 and Group 1 elements.",
    "defaultParams": {}
  },
  "CHEM-M06-L1": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 1",
    "title": "Octet Rule & Valence Electron Transfer Ion Formation",
    "formula": "\\text{Na} ([\\text{Ne}]3s^1) \\longrightarrow \\text{Na}^+ ([\\text{Ne}]) + e^-",
    "inquiry": "Examine how electropositive metals lose electrons and electronegative nonmetals gain electrons to form stable noble gas octets.",
    "defaultParams": {}
  },
  "CHEM-M06-L2": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 2",
    "title": "Crystal Lattice Energy & Coulombic Attraction",
    "formula": "F = k_e \\frac{|q_1 q_2|}{r^2} \\quad \\text{and} \\quad U_{\\text{lattice}} \\propto \\frac{|q_1 q_2|}{r_0}",
    "inquiry": "Vary ionic charge magnitudes (+1/-1 vs +2/-2) and internuclear separation to quantify crystal lattice energy.",
    "defaultParams": {
      "q1": 1,
      "q2": -1,
      "rDist": 1
    }
  },
  "CHEM-M06-L3": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 3",
    "title": "Ionic Compound Formulas & Polyatomic Balancing",
    "formula": "m(\\text{Cation Charge}) + n(\\text{Anion Charge}) = 0",
    "inquiry": "Balance polyatomic ions and transition metal cations to establish electrically neutral empirical formulas.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 3
    }
  },
  "CHEM-M06-L4": {
    "type": "chem-metallic-bonding",
    "lessonBadge": "Lesson 4",
    "title": "Metallic Delocalized Electron Sea & Electrical Conductivity",
    "formula": "J = n e v_d = \\sigma E \\quad (\\rho(T) = \\rho_0[1 + \\alpha(T - T_0)])",
    "inquiry": "Simulate quantum delocalized electron drift under an electric field, thermal lattice scattering (phonon resistivity), and non-directional bond malleability vs ionic brittle cleavage.",
    "defaultParams": {
      "voltage": 6,
      "temp": 293
    }
  },
  "CHEM-M07-L1": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 1",
    "title": "Covalent Bond Formation & Sigma/Pi Electron Sharing",
    "formula": "\\text{Bond Order} = \\frac{N_b - N_a}{2}",
    "inquiry": "Model shared electron pairs in single, double, and triple bonds and analyze bond dissociation energy.",
    "defaultParams": {}
  },
  "CHEM-M07-L2": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 2",
    "title": "Naming Binary Molecular Compounds & Acids",
    "formula": "\\text{Prefixes: mono-, di-, tri-, tetra-, penta-, hexa-}",
    "inquiry": "Formulate systematic IUPAC names for binary nonmetal covalent molecules and oxyacids.",
    "defaultParams": {}
  },
  "CHEM-M07-L3": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 3",
    "title": "Lewis Dot Structures & Resonance Hybrids",
    "formula": "\\text{Formal Charge} = V - N_{\\text{lone}} - \\frac{1}{2}B_{\\text{shared}}",
    "inquiry": "Construct Lewis structures and evaluate formal charges across resonant molecular conformations.",
    "defaultParams": {}
  },
  "CHEM-M07-L4": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 4",
    "title": "VSEPR Molecular Geometry & Bond Angles",
    "formula": "\\text{Steric Number} = \\text{Bonded Atoms} + \\text{Lone Pairs}",
    "inquiry": "Predict 3D molecular geometries (linear, bent, trigonal planar, tetrahedral) based on electron domain repulsions.",
    "defaultParams": {}
  },
  "CHEM-M07-L5": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 5",
    "title": "Electronegativity Difference & Molecular Dipole Moments",
    "formula": "\\Delta \\text{EN} = |\\chi_A - \\chi_B| \\quad \\text{and} \\quad \\vec{\\mu} = q \\times \\vec{r}",
    "inquiry": "Correlate electronegativity differences with bond polarities and determine if molecular symmetry cancels net dipoles.",
    "defaultParams": {}
  },
  "CHEM-M08-L1": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 1",
    "title": "Chemical Reactions & Conservation of Atoms Balancing",
    "formula": "\\sum \\text{Reactant Atoms} = \\sum \\text{Product Atoms}",
    "inquiry": "Balance chemical skeleton equations and verify that atomic mass is conserved across reactions.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 3
    }
  },
  "CHEM-M08-L2": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 2",
    "title": "Classifying Reactions: Synthesis, Decomposition, Replacement",
    "formula": "A + B \\rightarrow AB, \\quad AB \\rightarrow A + B, \\quad A + BC \\rightarrow AC + B",
    "inquiry": "Simulate single and double replacement reactions using the activity series to predict reaction spontaneity.",
    "defaultParams": {
      "molAl": 1.5,
      "molCl2": 2.25
    }
  },
  "CHEM-M08-L3": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 3",
    "title": "Reactions in Aqueous Solutions & Net Ionic Equations",
    "formula": "\\text{Net Ionic: } \\text{Ag}^+(aq) + \\text{Cl}^-(aq) \\longrightarrow \\text{AgCl}(s)",
    "inquiry": "Isolate spectator ions from aqueous precipitate-forming reactions to construct net ionic equations.",
    "defaultParams": {
      "soluteMoles": 0.1,
      "volumeLitres": 1,
      "isAcid": false
    }
  },
  "CHEM-M09-L1": {
    "type": "chem-avogadro-workbench",
    "lessonBadge": "Lesson 1",
    "title": "Measuring Matter: Avogadro's Number Workbench",
    "formula": "N = n \\times N_A \\quad (N_A = 6.022 \\times 10^{23} \\text{ particles/mol}), \\quad m = n \\times M",
    "inquiry": "Convert representative particle quantities (atoms, molecules, ions) to macroscopic mole amounts and weighed masses.",
    "defaultParams": {
      "substance": "Fe",
      "moles": 2.0
    }
  },
  "CHEM-M09-L2": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 2",
    "title": "Mass and the Mole: Molar Mass Conversions",
    "formula": "n = \\frac{m}{M} \\quad \\text{and} \\quad m = n \\times M",
    "inquiry": "Convert substance gram mass to moles using elemental periodic molar masses.",
    "defaultParams": {
      "molAl": 2.5,
      "molCl2": 3.75
    }
  },
  "CHEM-M09-L3": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 3",
    "title": "Moles of Compounds & Chemical Composition",
    "formula": "M_{\\text{compound}} = \\sum (n_i \\times M_i)",
    "inquiry": "Calculate formula mass and compound molar quantities from elemental composition ratios.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 3
    }
  },
  "CHEM-M09-L4": {
    "type": "chem-empirical-formula",
    "lessonBadge": "Lesson 4",
    "title": "Empirical and Molecular Formula Determination",
    "formula": "\\text{Empirical: } A_x B_y \\implies \\text{Molecular: } (A_x B_y)_n \\quad \\left(n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}}\\right)",
    "inquiry": "Derive simplest whole-number empirical formulas from percent composition data and determine molecular formulas using molar mass.",
    "defaultParams": {
      "preset": "glucose"
    }
  },
  "CHEM-M09-L5": {
    "type": "chem-hydrate-dehydration",
    "lessonBadge": "Lesson 5",
    "title": "Formulas of Hydrates: Water of Crystallization",
    "formula": "\\text{Hydrate Ratio } x = \\frac{n_{\\text{H}_2\\text{O}}}{n_{\\text{anhydrous salt}}} \\implies \\text{Salt} \\cdot x\\text{H}_2\\text{O}",
    "inquiry": "Heat a hydrated salt in a crucible to drive off crystalline water and calculate the integer hydrate mole ratio.",
    "defaultParams": {
      "salt": "CuSO4",
      "initialMass": 15.0
    }
  },
  "CHEM-M10-L1": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 1",
    "title": "Mole Ratios in Stoichiometric Transformations",
    "formula": "\\text{Mole Ratio} = \\frac{\\text{Coefficients of Desired Substance}}{\\text{Coefficients of Given Substance}}",
    "inquiry": "Use balanced reaction coefficients to predict theoretical mole conversions between reactants and products.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 3
    }
  },
  "CHEM-M10-L2": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 2",
    "title": "Stoichiometric Mass-to-Mass Calculations",
    "formula": "m_A \\xrightarrow{\\div M_A} n_A \\xrightarrow{\\times \\text{ratio}} n_B \\xrightarrow{\\times M_B} m_B",
    "inquiry": "Execute multi-step dimensional analysis converting reactant grams to theoretical product grams.",
    "defaultParams": {
      "molAl": 2.5,
      "molCl2": 3.5
    }
  },
  "CHEM-M10-L3": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 3",
    "title": "Limiting Reactants & Excess Reagent Determination",
    "formula": "\\text{Limiting Reactant produces least theoretical product moles}",
    "inquiry": "Adjust initial reactant quantities of Al and Cl₂ to identify the limiting reactant and excess remaining.",
    "defaultParams": {
      "molAl": 1.5,
      "molCl2": 3
    }
  },
  "CHEM-M10-L4": {
    "type": "chem-stoichiometry",
    "lessonBadge": "Lesson 4",
    "title": "Percent Yield & Laboratory Reaction Efficiency",
    "formula": "\\% \\text{ Yield} = \\frac{\\text{Actual Yield}}{\\text{Theoretical Yield}} \\times 100\\%",
    "inquiry": "Quantify loss of product due to side-reactions and incomplete recovery by computing percent yield.",
    "defaultParams": {
      "molAl": 2,
      "molCl2": 2.5
    }
  },
  "CHEM-M11-L1": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 1",
    "title": "Gases and Kinetic-Molecular Theory",
    "formula": "KE_{\\text{avg}} = \\frac{3}{2} k_B T \\quad \\text{and} \\quad v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}",
    "inquiry": "Observe how temperature dictates mean particle speeds and elastic collision frequencies in gases.",
    "defaultParams": {
      "volume": 5,
      "temp": 320,
      "moles": 1
    }
  },
  "CHEM-M11-L2": {
    "type": "chem-heating-curve",
    "lessonBadge": "Lesson 2",
    "title": "Intermolecular Forces: Hydrogen Bonding & Dispersion",
    "formula": "\\Delta H_{\\text{vap}} \\propto \\text{Intermolecular Attraction Strength}",
    "inquiry": "Compare London dispersion forces, dipole-dipole attractions, and hydrogen bonds across substances.",
    "defaultParams": {
      "temp": -15,
      "energy": 0
    }
  },
  "CHEM-M11-L3": {
    "type": "chem-density",
    "lessonBadge": "Lesson 3",
    "title": "Liquids, Solids & Surface Tension Capillarity",
    "formula": "\\text{Density } \\rho = \\frac{m}{V} \\quad \\text{and} \\quad \\gamma = \\frac{F}{L}",
    "inquiry": "Investigate fluid density, surface tension cohesion, and crystalline solid packing.",
    "defaultParams": {
      "mass": 80,
      "volume": 40
    }
  },
  "CHEM-M11-L4": {
    "type": "chem-heating-curve",
    "lessonBadge": "Lesson 4",
    "title": "Phase Diagrams & Latent Heat Transitions",
    "formula": "q = m \\Delta H_{\\text{fus}} \\quad \\text{and} \\quad q = m \\Delta H_{\\text{vap}}",
    "inquiry": "Explore phase changes at triple point and critical temperature/pressure plateaus on heating curves.",
    "defaultParams": {
      "temp": -20,
      "energy": 0
    }
  },
  "CHEM-M12-L1": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 1",
    "title": "The Gas Laws: Boyle's, Charles's, and Gay-Lussac's",
    "formula": "P_1 V_1 = P_2 V_2 \\quad \\text{and} \\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2}",
    "inquiry": "Compress the piston volume to verify the inverse Boyle relationship, or heat the chamber to view isobaric Charles expansion.",
    "defaultParams": {
      "volume": 5,
      "temp": 300,
      "moles": 1
    }
  },
  "CHEM-M12-L2": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 2",
    "title": "Combined Gas Law & Avogadro's Molar Volume",
    "formula": "\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2} \\quad \\text{and} \\quad V_{\\text{STP}} = 22.4\\text{ L/mol}",
    "inquiry": "Simulate simultaneous shifts in pressure, temperature, and volume for fixed gas quantities.",
    "defaultParams": {
      "volume": 6,
      "temp": 280,
      "moles": 1
    }
  },
  "CHEM-M12-L3": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 3",
    "title": "The Ideal Gas Law Equation of State (PV = nRT)",
    "formula": "PV = nRT \\quad (R = 0.0821\\text{ L}\\cdot\\text{atm}/\\text{mol}\\cdot\\text{K})",
    "inquiry": "Compute instantaneous pressure as a function of molar quantity, temperature, and chamber volume.",
    "defaultParams": {
      "volume": 4.5,
      "temp": 350,
      "moles": 1.2
    }
  },
  "CHEM-M12-L4": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 4",
    "title": "Gas Stoichiometry: Volume-to-Mole Transformations",
    "formula": "V = \\frac{nRT}{P} \\quad (\\text{Gas Reactant Volumes at Non-STP})",
    "inquiry": "Determine the volume of gaseous products evolved during a stoichiometric chemical transformation.",
    "defaultParams": {
      "volume": 5.5,
      "temp": 310,
      "moles": 1.5
    }
  },
  "CHEM-M13-L1": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 1",
    "title": "Types of Mixtures: Solutions, Colloids, Suspensions",
    "formula": "\\text{Colloid Tyndall Scattering } I \\propto \\frac{1}{\\lambda^4}",
    "inquiry": "Differentiate homogeneous solutions from light-scattering colloids and settling suspensions.",
    "defaultParams": {
      "soluteMoles": 0.15,
      "volumeLitres": 0.8,
      "isAcid": false
    }
  },
  "CHEM-M13-L2": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 2",
    "title": "Solution Concentration: Molarity & Volumetric Dilution",
    "formula": "M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}} \\quad \\text{and} \\quad M_1 V_1 = M_2 V_2",
    "inquiry": "Add solute and vary solvent volume to track concentration changes and compute diluted molarity.",
    "defaultParams": {
      "soluteMoles": 0.25,
      "volumeLitres": 0.5,
      "isAcid": false
    }
  },
  "CHEM-M13-L3": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 3",
    "title": "Factors Affecting Solvation & Henry's Gas Law",
    "formula": "S_1 / P_1 = S_2 / P_2 \\quad (\\text{Gas Solubility in Liquids})",
    "inquiry": "Examine temperature, agitation, and partial pressure impacts on aqueous solute solubility limits.",
    "defaultParams": {
      "soluteMoles": 0.4,
      "volumeLitres": 1,
      "isAcid": false
    }
  },
  "CHEM-M13-L4": {
    "type": "chem-heating-curve",
    "lessonBadge": "Lesson 4",
    "title": "Colligative Properties: Boiling Elevation & Freezing Depression",
    "formula": "\\Delta T_b = i K_b m \\quad \\text{and} \\quad \\Delta T_f = i K_f m",
    "inquiry": "Add nonvolatile solute to observe boiling point elevation and freezing point depression proportional to molality.",
    "defaultParams": {
      "temp": -5,
      "energy": 0
    }
  },
  "CHEM-M14-L1": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 1",
    "title": "Law of Conservation of Energy & Heat Flow",
    "formula": "\\Delta E_{\\text{universe}} = \\Delta E_{\\text{system}} + \\Delta E_{\\text{surroundings}} = 0",
    "inquiry": "Track directional thermal energy flow between an exothermic chemical system and aqueous surroundings.",
    "defaultParams": {
      "metalMass": 50,
      "metalTemp": 90,
      "waterMass": 100
    }
  },
  "CHEM-M14-L2": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 2",
    "title": "Specific Heat Capacity & Calorimetric Equilibrium",
    "formula": "q = m c \\Delta T \\quad \\text{and} \\quad q_{\\text{metal}} = -q_{\\text{water}}",
    "inquiry": "Submerge a heated metal into water to determine the metal's specific heat capacity from thermal equilibrium.",
    "defaultParams": {
      "metalMass": 60,
      "metalTemp": 100,
      "waterMass": 120
    }
  },
  "CHEM-M14-L3": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 3",
    "title": "Thermochemical Equations & Enthalpy of Reaction",
    "formula": "\\Delta H_{\\text{rxn}} = H_{\\text{products}} - H_{\\text{reactants}}",
    "inquiry": "Construct enthalpy level diagrams to classify reactions as exothermic (ΔH < 0) or endothermic (ΔH > 0).",
    "defaultParams": {
      "metalMass": 40,
      "metalTemp": 80,
      "waterMass": 100
    }
  },
  "CHEM-M14-L4": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 4",
    "title": "Hess's Law of Heat Summation & Enthalpy Cycles",
    "formula": "\\Delta H_{\\text{net}} = \\sum \\Delta H_{\\text{steps}}",
    "inquiry": "Sum step reactions and their enthalpy changes to calculate the overall enthalpy of a target reaction.",
    "defaultParams": {
      "metalMass": 55,
      "metalTemp": 95,
      "waterMass": 110
    }
  },
  "CHEM-M14-L5": {
    "type": "chem-equilibrium",
    "lessonBadge": "Lesson 5",
    "title": "Reaction Spontaneity & Gibbs Free Energy",
    "formula": "\\Delta G = \\Delta H - T \\Delta S \\quad (\\Delta G < 0 \\implies \\text{Spontaneous})",
    "inquiry": "Vary temperature to analyze how entropy and enthalpy balance to dictate reaction spontaneity.",
    "defaultParams": {
      "volume": 1,
      "temp": 320
    }
  },
  "CHEM-M15-L1": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 1",
    "title": "Collision Theory & Reaction Rates",
    "formula": "\\text{Rate} \\propto (\\text{Collision Frequency}) \\times (e^{-E_a / RT})",
    "inquiry": "Observe molecular collisions and verify that only collisions with energy ≥ Ea and proper orientation react.",
    "defaultParams": {
      "volume": 4,
      "temp": 340,
      "moles": 1.5
    }
  },
  "CHEM-M15-L2": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 2",
    "title": "Factors Affecting Reaction Rates: Temperature & Catalysts",
    "formula": "k = A e^{-E_a / RT} \\quad (\\text{Arrhenius Rate Equation})",
    "inquiry": "Lower the activation energy barrier using a simulated catalyst to observe dramatic rate acceleration.",
    "defaultParams": {
      "volume": 3.5,
      "temp": 360,
      "moles": 1.8
    }
  },
  "CHEM-M15-L3": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 3",
    "title": "Rate Laws & Reaction Orders",
    "formula": "\\text{Rate} = k [A]^m [B]^n",
    "inquiry": "Double reactant concentrations to determine reaction order exponents (zero, first, or second order).",
    "defaultParams": {
      "volume": 4,
      "temp": 300,
      "moles": 1.2
    }
  },
  "CHEM-M15-L4": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 4",
    "title": "Reaction Mechanisms & Rate-Determining Step",
    "formula": "\\text{Overall Rate} = \\text{Rate of slowest elementary step}",
    "inquiry": "Examine multi-step elementary reaction pathways and intermediate species lifespans.",
    "defaultParams": {
      "volume": 3.8,
      "temp": 330,
      "moles": 1.4
    }
  },
  "CHEM-M16-L1": {
    "type": "chem-equilibrium",
    "lessonBadge": "Lesson 1",
    "title": "Dynamic Chemical Balance: Forward and Reverse Rates",
    "formula": "\\text{Rate}_{\\text{forward}} = \\text{Rate}_{\\text{reverse}} \\quad (K_{\\text{eq}} = \\text{constant})",
    "inquiry": "Track forward and reverse reaction rates as they converge to establish dynamic equilibrium.",
    "defaultParams": {
      "volume": 1,
      "temp": 300
    }
  },
  "CHEM-M16-L2": {
    "type": "chem-equilibrium",
    "lessonBadge": "Lesson 2",
    "title": "Le Chatelier's Principle: Pressure, Volume, and Temperature Shifts",
    "formula": "\\text{System under stress shifts to partially relieve applied stress}",
    "inquiry": "Compress chamber volume and heat the mixture to observe equilibrium shifts between N₂O₄ and NO₂.",
    "defaultParams": {
      "volume": 0.8,
      "temp": 330
    }
  },
  "CHEM-M16-L3": {
    "type": "chem-equilibrium",
    "lessonBadge": "Lesson 3",
    "title": "Equilibrium Constant Expression & Reaction Quotient (Q vs Keq)",
    "formula": "K_{\\text{eq}} = \\frac{[C]^c [D]^d}{[A]^a [B]^b} \\quad \\text{and} \\quad Q = \\frac{[C]_i^c [D]_i^d}{[A]_i^a [B]_i^b}",
    "inquiry": "Inject reactants or products to evaluate Q relative to Keq and predict the spontaneous shift direction.",
    "defaultParams": {
      "volume": 1.2,
      "temp": 310
    }
  },
  "CHEM-M17-L1": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 1",
    "title": "Arrhenius and Brønsted-Lowry Acids & Bases",
    "formula": "\\text{HA}(aq) + \\text{H}_2\\text{O}(l) \\rightleftharpoons \\text{H}_3\\text{O}^+(aq) + \\text{A}^-(aq)",
    "inquiry": "Identify conjugate acid-base pairs and examine proton transfer equilibrium in aqueous media.",
    "defaultParams": {
      "soluteMoles": 0.1,
      "volumeLitres": 1,
      "isAcid": true
    }
  },
  "CHEM-M17-L2": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 2",
    "title": "Strengths of Acids & Acid Ionization Constants (Ka)",
    "formula": "K_a = \\frac{[\\text{H}_3\\text{O}^+][\\text{A}^-]}{[\\text{HA}]} \\quad \\text{and} \\quad \\text{p}K_a = -\\log K_a",
    "inquiry": "Compare complete dissociation of strong acids with the partial ionization equilibrium of weak acids.",
    "defaultParams": {
      "soluteMoles": 0.2,
      "volumeLitres": 1,
      "isAcid": true
    }
  },
  "CHEM-M17-L3": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 3",
    "title": "The pH Scale & Auto-Ionization of Water",
    "formula": "\\text{pH} = -\\log[\\text{H}^+] \\quad \\text{and} \\quad [\\text{H}^+][\\text{OH}^-] = 1.0 \\times 10^{-14}",
    "inquiry": "Observe continuous pH indicator spectrum transitions from crimson acid (pH 1) to violet alkaline (pH 14).",
    "defaultParams": {
      "soluteMoles": 0.05,
      "volumeLitres": 1,
      "isAcid": true
    }
  },
  "CHEM-M17-L4": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 4",
    "title": "Neutralization Reactions & Acid-Base Titration Curves",
    "formula": "M_{\\text{acid}} V_{\\text{acid}} n_{\\text{H}^+} = M_{\\text{base}} V_{\\text{base}} n_{\\text{OH}^-}",
    "inquiry": "Titrate a strong acid with sodium hydroxide to observe the steep equivalence pH inflection point.",
    "defaultParams": {
      "soluteMoles": 0.1,
      "volumeLitres": 1,
      "isAcid": false
    }
  },
  "CHEM-M18-L1": {
    "type": "chem-galvanic-cell",
    "lessonBadge": "Lesson 1",
    "title": "Oxidation and Reduction: Electron Transfer Numbers",
    "formula": "\\text{Oxidation: } \\text{Zn} \\rightarrow \\text{Zn}^{2+} + 2e^- \\quad \\text{Reduction: } \\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu}",
    "inquiry": "Assign oxidation states and identify oxidizing agents gaining electrons and reducing agents losing electrons.",
    "defaultParams": {}
  },
  "CHEM-M18-L2": {
    "type": "chem-galvanic-cell",
    "lessonBadge": "Lesson 2",
    "title": "Balancing Redox Equations via Half-Reaction Method",
    "formula": "\\sum e^-_{\\text{lost}} = \\sum e^-_{\\text{gained}} \\quad (\\text{Charge and Mass Conservation})",
    "inquiry": "Balance complex reduction and oxidation half-reactions in acidic and basic aqueous solutions.",
    "defaultParams": {}
  },
  "CHEM-M19-L1": {
    "type": "chem-galvanic-cell",
    "lessonBadge": "Lesson 1",
    "title": "Voltaic Galvanic Cells: Daniell Cell Workbench",
    "formula": "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = +1.10\\text{ V}",
    "inquiry": "Trace spontaneous electron flux from Zn anode to Cu cathode across the salt bridge and verify cell potential.",
    "defaultParams": {}
  },
  "CHEM-M19-L2": {
    "type": "chem-galvanic-cell",
    "lessonBadge": "Lesson 2",
    "title": "Batteries: Primary, Secondary, and Lithium-Ion Cells",
    "formula": "E_{\\text{cell}} = E^\\circ - \\frac{0.0592}{n} \\log Q \\quad (\\text{Nernst Equation})",
    "inquiry": "Vary ion concentrations to observe Nernst voltage shifts and investigate rechargeable cell chemistry.",
    "defaultParams": {}
  },
  "CHEM-M19-L3": {
    "type": "chem-galvanic-cell",
    "lessonBadge": "Lesson 3",
    "title": "Electrolytic Cells & Nonspontaneous Electroplating",
    "formula": "m = \\frac{I \\cdot t \\cdot M}{n \\cdot F} \\quad (F = 96,485\\text{ C/mol } e^-)",
    "inquiry": "Apply an external voltage to drive nonspontaneous metal cation plating onto a conductive cathode.",
    "defaultParams": {}
  },
  "CHEM-M20-L1": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 1",
    "title": "Alkanes: Saturated Hydrocarbon Nomenclature",
    "formula": "C_n H_{2n+2} \\quad (\\text{Straight and Branched Alkane Homologues})",
    "inquiry": "Build straight and branched alkane chains and determine systematic IUPAC nomenclature.",
    "defaultParams": {}
  },
  "CHEM-M20-L2": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 2",
    "title": "Alkenes and Alkynes: Unsaturated Multiple Bonds",
    "formula": "\\text{Alkene: } C_n H_{2n} \\quad \\text{and} \\quad \\text{Alkyne: } C_n H_{2n-2}",
    "inquiry": "Insert double and triple carbon-carbon bonds and explore addition reaction reactivity.",
    "defaultParams": {}
  },
  "CHEM-M20-L3": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 3",
    "title": "Hydrocarbon Isomers: Structural and Geometric",
    "formula": "\\text{Cis-Trans Geometric Isomerism across Rigid } C=C \\text{ Double Bonds}",
    "inquiry": "Construct structural isomers sharing identical molecular formulas but possessing distinct connectivity.",
    "defaultParams": {}
  },
  "CHEM-M20-L4": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 4",
    "title": "Aromatic Hydrocarbons & Delocalized Benzene Rings",
    "formula": "\\text{Benzene: } C_6 H_6 \\quad (\\text{Delocalized } 6\\pi \\text{ Electron Cloud})",
    "inquiry": "Examine resonance stabilization in aromatic benzene rings and polycyclic structures.",
    "defaultParams": {}
  },
  "CHEM-M21-L1": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 1",
    "title": "Organic Functional Groups: Alcohols, Acids, Halides",
    "formula": "R-\\text{OH}, \\quad R-\\text{COOH}, \\quad R-\\text{CHO}, \\quad R-\\text{Cl}",
    "inquiry": "Attach functional groups to hydrocarbon backbones and observe changes in polarity and solubility.",
    "defaultParams": {}
  },
  "CHEM-M21-L2": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 2",
    "title": "Organic Reactions: Substitution, Addition, Condensation",
    "formula": "\\text{Carboxylic Acid} + \\text{Alcohol} \\xrightarrow{\\text{H}^+} \\text{Ester} + \\text{H}_2\\text{O}",
    "inquiry": "Model condensation esterification and halogen addition across unsaturated double bonds.",
    "defaultParams": {}
  },
  "CHEM-M21-L3": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 3",
    "title": "Synthetic Polymers: Monomer Addition & Condensation",
    "formula": "n(\\text{CH}_2=\\text{CH}_2) \\longrightarrow -(\\text{CH}_2-\\text{CH}_2)_n-",
    "inquiry": "Chain repeating monomer units to synthesize addition polymers (polyethylene) and polyesters.",
    "defaultParams": {}
  },
  "CHEM-M22-L1": {
    "type": "chem-protein-folding",
    "lessonBadge": "Lesson 1",
    "title": "Protein Architecture: Amino Acids & Peptide Bonds",
    "formula": "\\text{Amino Acid}_1 + \\text{Amino Acid}_2 \\xrightarrow{\\text{Condensation}} \\text{Dipeptide} + \\text{H}_2\\text{O} \\quad (\\Delta G_{\\text{fold}} < 0)",
    "inquiry": "Examine planar trans peptide bond resonance, alpha-helix/beta-sheet hydrogen bonding, and 3D tertiary hydrophobic core folding with thermal denaturation.",
    "defaultParams": {
      "temp": 37,
      "pH": 7.4
    }
  },
  "CHEM-M22-L2": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 2",
    "title": "Carbohydrates: Monosaccharides to Polysaccharides",
    "formula": "(C_6 H_{10} O_5)_n \\quad (\\text{Glycogen, Starch, Cellulose})",
    "inquiry": "Analyze monosaccharide ring structures (glucose, fructose) and condensation into energy storage polymers.",
    "defaultParams": {
      "lightIntensity": 60,
      "co2Level": 400
    }
  },
  "CHEM-M22-L3": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 3",
    "title": "Lipids: Phospholipid Bilayers & Fatty Acids",
    "formula": "\\text{Triglyceride} = \\text{Glycerol} + 3 \\text{ Fatty Acids}",
    "inquiry": "Examine saturated vs unsaturated fatty acids and the amphipathic self-assembly of lipid membranes.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "CHEM-M22-L4": {
    "type": "chem-organic-builder",
    "lessonBadge": "Lesson 4",
    "title": "Nucleic Acids: Nucleotides, DNA & RNA Polymers",
    "formula": "\\text{Nucleotide} = \\text{Nitrogenous Base} + \\text{Pentose Sugar} + \\text{Phosphate}",
    "inquiry": "Examine purine-pyrimidine base pairing (A-T, G-C) and the antiparallel phosphodiester backbone.",
    "defaultParams": {}
  },
  "CHEM-M22-L5": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 5",
    "title": "Cellular Metabolism: Catabolism & ATP Energy",
    "formula": "\\text{ATP} + \\text{H}_2\\text{O} \\rightleftharpoons \\text{ADP} + P_i + 30.5\\text{ kJ/mol}",
    "inquiry": "Trace biochemical coupling between exergonic food catabolism and endergonic biosynthesis.",
    "defaultParams": {
      "lightIntensity": 80,
      "co2Level": 500
    }
  },
  "CHEM-M23-L1": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 1",
    "title": "Nuclear Radiation: Alpha, Beta, and Gamma Rays",
    "formula": "{}^4_2\\alpha \\quad (\\text{He Nucleus}), \\quad {}^0_{-1}\\beta \\quad (e^-), \\quad {}^0_0\\gamma \\quad (\\text{Photon})",
    "inquiry": "Compare penetrating abilities and ionizing power of alpha, beta, and gamma emissions.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "CHEM-M23-L2": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 2",
    "title": "Radioactive Decay Law & Half-Life Calculations",
    "formula": "N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t/t_{1/2}} \\quad \\text{and} \\quad \\lambda = \\frac{\\ln 2}{t_{1/2}}",
    "inquiry": "Track decay of Carbon-14, Iodine-131, and Cobalt-60 over multiple half-lives with Geiger count readouts.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "CHEM-M23-L3": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 3",
    "title": "Nuclear Transmutation & Artificial Elements",
    "formula": "{}^{14}_7\\text{N} + {}^4_2\\alpha \\longrightarrow {}^{17}_8\\text{O} + {}^1_1\\text{p}",
    "inquiry": "Simulate particle bombardment inducing artificial transmutation of elements in particle colliders.",
    "defaultParams": {
      "isotope": "I131"
    }
  },
  "CHEM-M23-L4": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 4",
    "title": "Nuclear Fission Chain Reactions and Stellar Fusion",
    "formula": "{}^{235}_{92}\\text{U} + {}^1_0\\text{n} \\longrightarrow {}^{92}_{36}\\text{Kr} + {}^{141}_{56}\\text{Ba} + 3{}^1_0\\text{n} + 200\\text{ MeV}",
    "inquiry": "Model neutron-induced nuclear fission chain reactions and stellar hydrogen-to-helium fusion.",
    "defaultParams": {
      "isotope": "Co60"
    }
  },
  "CHEM-M23-L5": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 5",
    "title": "Applications and Hazards: Radiocarbon Dating",
    "formula": "t = \\frac{t_{1/2}}{\\ln 2} \\ln\\left(\\frac{A_0}{A}\\right)",
    "inquiry": "Determine archaeological specimen ages by measuring residual Carbon-14 radioactive activity.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "BIO-M01-L1": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 1",
    "title": "Characteristics of Life & Cellular Homeostasis",
    "formula": "\\text{Homeostasis: } \\text{Internal Stability in Dynamic Equilibrium}",
    "inquiry": "Examine how living organisms regulate internal cellular conditions against external fluctuations.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M01-L2": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 2",
    "title": "The Nature of Science & Controlled Biological Inquiry",
    "formula": "\\text{Total Magnification} = \\text{Ocular (10×)} \\times \\text{Objective (40×)} = 400×",
    "inquiry": "Design controlled experiments isolating independent variables and test verifiable biological hypotheses.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M02-L1": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 1",
    "title": "Organisms & Ecosystem Niches: Biotic and Abiotic Factors",
    "formula": "\\text{Ecological Niche} \\subset \\text{Habitat Environment}",
    "inquiry": "Map competitive exclusion and symbiotic mutualism among interacting ecosystem species.",
    "defaultParams": {
      "capacity": 200,
      "rate": 0.4
    }
  },
  "BIO-M02-L2": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 2",
    "title": "Flow of Energy: Trophic Pyramids & 10% Ecological Rule",
    "formula": "E_{\\text{trophic}} = 0.10 \\times E_{\\text{producer}} \\quad (90\\% \\text{ Heat Dissipation})",
    "inquiry": "Trace solar energy capture and thermodynamic dissipation as biomass ascends trophic levels.",
    "defaultParams": {
      "lightIntensity": 80,
      "co2Level": 500
    }
  },
  "BIO-M02-L3": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 3",
    "title": "Cycling of Matter: Carbon, Nitrogen, and Water Cycles",
    "formula": "\\text{Conservation of Matter: } \\sum \\text{Biogeochemical Inflow} = \\sum \\text{Outflow}",
    "inquiry": "Track closed elemental recycling between atmospheric, oceanic, and biological reservoirs.",
    "defaultParams": {
      "capacity": 250,
      "rate": 0.35
    }
  },
  "BIO-M03-L1": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 1",
    "title": "Community Ecology: Primary & Secondary Succession",
    "formula": "\\text{Pioneer Lichens} \\longrightarrow \\text{Grassland} \\longrightarrow \\text{Climax Forest}",
    "inquiry": "Simulate ecological succession following glacial retreat and wildfire forest disturbances.",
    "defaultParams": {
      "capacity": 150,
      "rate": 0.3
    }
  },
  "BIO-M03-L2": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 2",
    "title": "Terrestrial Biomes: Latitude & Temperature Gradients",
    "formula": "\\text{Biome Classification} = f(\\text{Mean Annual Temp}, \\text{Precipitation})",
    "inquiry": "Correlate global precipitation and temperature patterns with desert, tundra, and rainforest biomes.",
    "defaultParams": {
      "capacity": 180,
      "rate": 0.4
    }
  },
  "BIO-M03-L3": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 3",
    "title": "Aquatic Ecosystems: Freshwater & Marine Photic Zones",
    "formula": "I(z) = I_0 e^{-k z} \\quad (\\text{Photic Zone Light Penetration})",
    "inquiry": "Analyze light attenuation with depth and its limiting effect on marine phytoplankton productivity.",
    "defaultParams": {
      "lightIntensity": 70,
      "co2Level": 450
    }
  },
  "BIO-M04-L1": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 1",
    "title": "Population Dynamics: Logistic Growth & Carrying Capacity",
    "formula": "\\frac{dN}{dt} = r N \\left(1 - \\frac{N}{K}\\right) \\quad (K = \\text{Carrying Capacity})",
    "inquiry": "Adjust intrinsic growth rate r and carrying capacity K to observe transition from exponential to logistic growth.",
    "defaultParams": {
      "capacity": 250,
      "rate": 0.45
    }
  },
  "BIO-M04-L2": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 2",
    "title": "Human Population Growth & Demographic Transition",
    "formula": "\\text{Growth Rate} = (\\text{Births} + \\text{Immigration}) - (\\text{Deaths} + \\text{Emigration})",
    "inquiry": "Examine age structure pyramids and industrialization impacts on demographic birth/death rates.",
    "defaultParams": {
      "capacity": 350,
      "rate": 0.3
    }
  },
  "BIO-M05-L1": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 1",
    "title": "Biodiversity: Genetic, Species, and Ecosystem Diversity",
    "formula": "H' = -\\sum p_i \\ln(p_i) \\quad (\\text{Shannon Diversity Index})",
    "inquiry": "Quantify species richness and evenness to measure ecosystem resilience against perturbations.",
    "defaultParams": {
      "capacity": 200,
      "rate": 0.4
    }
  },
  "BIO-M05-L2": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 2",
    "title": "Threats to Biodiversity: Habitat Fragmentation & Invasives",
    "formula": "\\text{Extinction Risk} \\propto \\frac{1}{\\text{Habitat Fragment Area}}",
    "inquiry": "Simulate habitat fragmentation and observe accelerated localized extinction rates in small populations.",
    "defaultParams": {
      "capacity": 100,
      "rate": 0.25
    }
  },
  "BIO-M05-L3": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 3",
    "title": "Conserving Biodiversity: Corridors & Bioremediation",
    "formula": "\\text{Biomagnification: } C_{\\text{apex}} = C_{\\text{water}} \\times (\\text{Bio-factor})^n",
    "inquiry": "Model biological corridors connecting reserves to restore genetic gene flow between populations.",
    "defaultParams": {
      "capacity": 220,
      "rate": 0.35
    }
  },
  "BIO-M06-L1": {
    "type": "chem-periodic-trends",
    "lessonBadge": "Lesson 1",
    "title": "Matter & Atomic Architecture in Living Systems",
    "formula": "\\text{Biogenic Elements: Carbon, Hydrogen, Nitrogen, Oxygen, Phosphorus, Sulfur}",
    "inquiry": "Explore covalent bonding capacity of carbon and essential trace elements in biological macromolecules.",
    "defaultParams": {}
  },
  "BIO-M06-L2": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 2",
    "title": "Chemical Reactions & Activation Energy Barriers",
    "formula": "\\text{Enzyme} + \\text{Substrate} \\rightleftharpoons [\\text{ES}] \\longrightarrow \\text{Enzyme} + \\text{Product}",
    "inquiry": "Compare uncatalyzed reaction rates with enzyme-catalyzed rates to observe Ea reduction.",
    "defaultParams": {
      "temp": 37,
      "pH": 7,
      "substrate": 50
    }
  },
  "BIO-M06-L3": {
    "type": "chem-molarity-ph",
    "lessonBadge": "Lesson 3",
    "title": "Water and Its Solutions: Polarity & Biological Buffers",
    "formula": "\\text{pH} = \\text{p}K_a + \\log\\left(\\frac{[\\text{A}^-]}{[\\text{HA}]}\\right) \\quad (\\text{Henderson-Hasselbalch})",
    "inquiry": "Examine water hydrogen bonding cohesion and how bicarbonate buffer systems resist blood pH changes.",
    "defaultParams": {
      "soluteMoles": 0.1,
      "volumeLitres": 1,
      "isAcid": true
    }
  },
  "BIO-M06-L4": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 4",
    "title": "The Building Blocks of Life: Macromolecular Structure",
    "formula": "\\text{Monomers (Amino Acids, Monosaccharides, Nucleotides) } \\longrightarrow \\text{ Polymers}",
    "inquiry": "Examine condensation polymerization assembling proteins, carbohydrates, and nucleic acids.",
    "defaultParams": {
      "temp": 37,
      "pH": 7,
      "substrate": 60
    }
  },
  "BIO-M07-L1": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 1",
    "title": "Cell Discovery, Cell Theory & Microscopic Scale",
    "formula": "\\text{Surface Area to Volume Ratio} = \\frac{6}{s} \\quad (\\text{Diffusion Constraint})",
    "inquiry": "Calculate surface-area-to-volume ratios to explain why cells remain microscopic in size.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M07-L2": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 2",
    "title": "The Plasma Membrane: Fluid Mosaic Architecture",
    "formula": "\\text{Phospholipid Bilayer: Hydrophilic Heads + Hydrophobic Fatty Acyl Tails}",
    "inquiry": "Explore lateral fluidity of membrane phospholipids and embedded receptor transport proteins.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M07-L3": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 3",
    "title": "Cellular Transport: Osmosis & Tonicity Environments",
    "formula": "\\Psi_w = \\Psi_s + \\Psi_p \\quad (\\text{Water Potential: Water flows toward lower } \\Psi)",
    "inquiry": "Place cells in hypotonic, isotonic, and hypertonic fluids to observe water osmosis, lysis, and crenation.",
    "defaultParams": {
      "tonicity": "hypertonic",
      "soluteConc": 2.5
    }
  },
  "BIO-M07-L4": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 4",
    "title": "Eukaryotic Organelles & Endosymbiotic Evolution",
    "formula": "\\text{Aerobic Proteobacterium} \\xrightarrow{\\text{Endosymbiosis}} \\text{Mitochondrion}",
    "inquiry": "Explore compartmentalized functions of mitochondria, chloroplasts, Golgi, and endoplasmic reticulum.",
    "defaultParams": {
      "lightIntensity": 75,
      "co2Level": 450
    }
  },
  "BIO-M08-L1": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 1",
    "title": "How Organisms Obtain Energy: The ATP/ADP Cycle",
    "formula": "\\text{ATP} + \\text{H}_2\\text{O} \\rightleftharpoons \\text{ADP} + P_i + \\Delta G \\, (-30.5\\text{ kJ/mol})",
    "inquiry": "Investigate phosphorylation of ADP into ATP as the cellular universal energy currency.",
    "defaultParams": {
      "lightIntensity": 70,
      "co2Level": 400
    }
  },
  "BIO-M08-L2": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 2",
    "title": "Photosynthesis: Thylakoid Light Reactions & Calvin Cycle",
    "formula": "6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{h\\nu} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2",
    "inquiry": "Vary incident light intensity and CO₂ levels to measure oxygen generation and glucose production rates.",
    "defaultParams": {
      "lightIntensity": 85,
      "co2Level": 550
    }
  },
  "BIO-M08-L3": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 3",
    "title": "Cellular Respiration: Glycolysis, Krebs Cycle & ETC",
    "formula": "\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{--}32\\text{ ATP} \\quad (\\text{Modern Chemiosmotic P/O Yield})",
    "inquiry": "Track electron transport through mitochondrial inner membrane complexes driving chemiosmotic ATP synthesis (reconciled modern standard 30–32 ATP per glucose).",
    "defaultParams": {
      "mode": "resp",
      "lightIntensity": 0,
      "co2Level": 400
    }
  },
  "BIO-M09-L1": {
    "type": "bio-mitosis-cell-cycle",
    "lessonBadge": "Lesson 1",
    "title": "Mitotic Cell Cycle: Interphase, Mitosis, and Cytokinesis",
    "formula": "2n \\longrightarrow 2 \\times (2n) \\quad (\\text{Genetically Identical Diploid Clones})",
    "inquiry": "Step through Interphase, Prophase, Metaphase, Anaphase, and Telophase to track chromosome segregation.",
    "defaultParams": {}
  },
  "BIO-M09-L2": {
    "type": "bio-meiosis-crossing-over",
    "lessonBadge": "Lesson 2",
    "title": "Meiosis: Gametogenesis & Crossing Over Recombination",
    "formula": "2n \\longrightarrow 4 \\times (1n) \\quad (\\text{Haploid Gamete Genetic Diversity})",
    "inquiry": "Model homologous chromosome synapsis and non-sister chromatid crossing over in Prophase I.",
    "defaultParams": {}
  },
  "BIO-M10-L1": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 1",
    "title": "Mendelian Genetics: Law of Segregation (Monohybrid Cross)",
    "formula": "\\text{Monohybrid Cross } (Aa \\times Aa) \\implies 3:1 \\text{ Phenotypic Ratio}",
    "inquiry": "Cross heterozygous parents to verify the 1:2:1 genotypic and 3:1 dominant-to-recessive phenotypic ratio.",
    "defaultParams": {
      "p1": "Aa",
      "p2": "Aa"
    }
  },
  "BIO-M10-L2": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 2",
    "title": "Genetic Recombination & Dihybrid Independent Assortment",
    "formula": "\\text{Dihybrid Cross } (AaBb \\times AaBb) \\implies 9:3:3:1 \\text{ Phenotypic Ratio}",
    "inquiry": "Examine two unlinked gene loci segregating independently to produce 16-box Punnett distributions.",
    "defaultParams": {
      "p1": "Aa",
      "p2": "Aa"
    }
  },
  "BIO-M10-L3": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 3",
    "title": "Applied Genetics: Selective Breeding & Test Crosses",
    "formula": "\\text{Test Cross: Unknown (A\\_)} \\times \\text{Homozygous Recessive (aa)}",
    "inquiry": "Perform a test cross to determine whether an individual showing dominant phenotype is homozygous or heterozygous.",
    "defaultParams": {
      "p1": "AA",
      "p2": "aa"
    }
  },
  "BIO-M10-L4": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 4",
    "title": "Basic Patterns of Human Inheritance: Pedigree Analysis",
    "formula": "\\text{Autosomal Recessive: Carrier parents } (Nn) \\implies 25\\% \\text{ affected } (nn)",
    "inquiry": "Track autosomal recessive and dominant traits through multigenerational human pedigree charts.",
    "defaultParams": {
      "p1": "Aa",
      "p2": "aa"
    }
  },
  "BIO-M10-L5": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 5",
    "title": "Complex Inheritance: Incomplete Dominance & Sex-Linkage",
    "formula": "\\text{Incomplete: } C^R C^W (\\text{Pink}) \\quad \\text{Sex-Linked: } X^A X^a \\times X^A Y",
    "inquiry": "Investigate non-Mendelian codominance (ABO blood groups), incomplete dominance, and X-linked traits.",
    "defaultParams": {
      "p1": "Aa",
      "p2": "Aa"
    }
  },
  "BIO-M11-L1": {
    "type": "bio-dna-double-helix",
    "lessonBadge": "Lesson 1",
    "title": "DNA: The Genetic Material & Double Helix Structure",
    "formula": "\\text{Chargaff's Rules: } [A] = [T] \\quad \\text{and} \\quad [G] = [C]",
    "inquiry": "Explore complementary base pairing (A-T with 2 H-bonds, G-C with 3 H-bonds) in antiparallel strands.",
    "defaultParams": {}
  },
  "BIO-M11-L2": {
    "type": "bio-dna-replication",
    "lessonBadge": "Lesson 2",
    "title": "Semiconservative Replication of DNA: Fork Enzymes",
    "formula": "\\text{Leading Strand: } 5' \\rightarrow 3' \\text{ Continuous}, \\quad \\text{Lagging: Okazaki Fragments}",
    "inquiry": "Trace helicase unwinding and DNA polymerase III nucleotide synthesis along replication forks.",
    "defaultParams": {
      "speed": 50
    }
  },
  "BIO-M11-L3": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 3",
    "title": "Transcription & Ribosomal Translation (Central Dogma)",
    "formula": "\\text{DNA Template} \\xrightarrow{\\text{RNA Pol}} \\text{mRNA Codon} \\xrightarrow{\\text{tRNA}} \\text{Polypeptide}",
    "inquiry": "Transcribe a genomic sequence to mRNA codons and match with amino acids via the universal genetic code.",
    "defaultParams": {
      "temp": 37,
      "pH": 7,
      "substrate": 50
    }
  },
  "BIO-M11-L4": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 4",
    "title": "Gene Regulation & Genetic Mutations",
    "formula": "\\text{Point Mutations: Silent, Missense, Nonsense, Frameshift Indel}",
    "inquiry": "Introduce nucleotide substitutions and frameshift indels to evaluate impacts on polypeptide function.",
    "defaultParams": {
      "temp": 37,
      "pH": 7,
      "substrate": 40
    }
  },
  "BIO-M12-L1": {
    "type": "bio-gel-electrophoresis",
    "lessonBadge": "Lesson 1",
    "title": "Recombinant DNA: Restriction Enzymes & Gel Electrophoresis",
    "formula": "\\text{Migration Distance: } d \\propto \\frac{1}{\\log_{10}(\\text{Base Pairs})}",
    "inquiry": "Digest DNA with restriction endonucleases and run agarose gel electrophoresis to separate fragments by size.",
    "defaultParams": {}
  },
  "BIO-M12-L2": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 2",
    "title": "The Human Genome & PCR Gene Amplification",
    "formula": "N_{\\text{amplicons}} = N_0 \\times 2^n \\quad (n = \\text{PCR thermal cycles})",
    "inquiry": "Model exponential DNA target sequence amplification through repeated PCR denaturation, annealing, and extension.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M13-L1": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 1",
    "title": "Fossil Evidence of Change & Radiometric Stratigraphy",
    "formula": "t = \\frac{t_{1/2}}{\\ln 2} \\ln\\left(\\frac{N_0}{N}\\right) \\quad (\\text{Geological Dating})",
    "inquiry": "Date volcanic strata and fossil index specimens using radioisotope decay ratios.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "BIO-M13-L2": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 2",
    "title": "The Origin of Life: Miller-Urey & Protocells",
    "formula": "\\text{Inorganic Precursors } (\\text{CH}_4, \\text{NH}_3, \\text{H}_2) \\xrightarrow{\\text{Spark}} \\text{Amino Acids}",
    "inquiry": "Examine prebiotic chemical synthesis of organic monomers and the emergence of self-replicating RNA.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M14-L1": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 1",
    "title": "Darwin's Natural Selection: Heritable Differential Fitness",
    "formula": "\\bar{w} = p^2 w_{AA} + 2pq w_{Aa} + q^2 w_{aa} \\quad (\\text{Mean Population Fitness})",
    "inquiry": "Apply predatory selective pressures to demonstrate how adaptive traits increase in frequency.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M14-L2": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 2",
    "title": "Evidence of Evolution: Anatomical Homology & Molecular DNA",
    "formula": "\\text{Sequence Divergence } \\propto \\text{Time since common ancestor}",
    "inquiry": "Compare homologous limb bone anatomy and cytochrome c amino acid divergences among vertebrates.",
    "defaultParams": {
      "pFreq": 0.6
    }
  },
  "BIO-M14-L3": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 3",
    "title": "Hardy-Weinberg Equilibrium & Genetic Drift Dynamics",
    "formula": "p^2 + 2pq + q^2 = 1.00 \\quad \\text{and} \\quad p + q = 1.00",
    "inquiry": "Simulate genetic drift in small bottleneck populations vs Hardy-Weinberg stability in large panmictic populations.",
    "defaultParams": {
      "pFreq": 0.55
    }
  },
  "BIO-M15-L1": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 1",
    "title": "Primate Characteristics: Stereoscopic Vision & Dexterity",
    "formula": "\\text{Primate Traits: Opposable digits, stereoscopic vision, expanded neocortex}",
    "inquiry": "Analyze anatomical adaptations for arboreal locomotion, manual dexterity, and complex social cognition.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M15-L2": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 2",
    "title": "Hominoids to Hominins: Evolution of Bipedalism",
    "formula": "\\text{Foramen Magnum placement, Pelvic girdle width, Spinal lumbar curvature}",
    "inquiry": "Trace structural skeletal transitions from knuckle-walking apes to fully habitual bipedal hominins.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M15-L3": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 3",
    "title": "Human Ancestry: The Genus Homo Phylogeny",
    "formula": "\\text{Cranial Capacity: Australopithecus (450cc) } \\rightarrow \\text{Homo sapiens (1400cc)}",
    "inquiry": "Map fossil hominin timeline (H. habilis, H. erectus, Neanderthals) and Out-of-Africa migration routes.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M16-L1": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 1",
    "title": "Linnaean Taxonomy & Binomial Nomenclature",
    "formula": "\\text{Taxonomic Hierarchy: Domain } \\rightarrow \\text{ Kingdom } \\dots \\rightarrow \\text{ Species}",
    "inquiry": "Classify organisms using hierarchical nested ranks and standard Genus species nomenclature.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M16-L2": {
    "type": "bio-hardy-weinberg",
    "lessonBadge": "Lesson 2",
    "title": "Modern Phylogenetic Cladistics & Shared Derived Characters",
    "formula": "\\text{Synapomorphies: Shared derived evolutionary character states}",
    "inquiry": "Construct cladograms using shared derived characters and parsimony to deduce evolutionary relationships.",
    "defaultParams": {
      "pFreq": 0.5
    }
  },
  "BIO-M16-L3": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 3",
    "title": "The Three Domains of Life: Bacteria, Archaea, Eukarya",
    "formula": "\\text{Domains: Archaea (Extremophiles), Bacteria (Peptidoglycan), Eukarya (Membrane-bound)}",
    "inquiry": "Compare molecular rRNA sequences and cellular membrane lipids across Archaea, Bacteria, and Eukarya.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M17-L1": {
    "type": "bio-immune-response",
    "lessonBadge": "Lesson 1",
    "title": "Bacteria: Prokaryotic Cell Walls & Binary Fission",
    "formula": "N_t = N_0 \\times 2^{t/g} \\quad (g = \\text{Generation Doubling Time})",
    "inquiry": "Examine Gram-positive peptidoglycan vs Gram-negative outer lipid bilayers and antibiotic mechanisms.",
    "defaultParams": {}
  },
  "BIO-M17-L2": {
    "type": "bio-immune-response",
    "lessonBadge": "Lesson 2",
    "title": "Viruses and Prions: Lytic and Lysogenic Replication",
    "formula": "\\text{Lytic: Immediate Host Cell Lysis} \\quad \\text{vs} \\quad \\text{Lysogenic: Prophage Integration}",
    "inquiry": "Trace bacteriophage infection, viral capsid injection, provirus integration, and lytic burst cycles.",
    "defaultParams": {}
  },
  "BIO-M18-L1": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 1",
    "title": "Introduction to Protists: Protozoan Osmoregulation",
    "formula": "\\text{Contractile Vacuole: Pumping water out against osmotic inflow}",
    "inquiry": "Observe Paramecium contractile vacuoles actively expelling excess hypoosmotic water.",
    "defaultParams": {
      "tonicity": "hypotonic",
      "soluteConc": 0.2
    }
  },
  "BIO-M18-L2": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 2",
    "title": "Protist Diversity: Amoeboid Movement & Flagellates",
    "formula": "\\text{Pseudopodia Cytoplasmic Streaming via Actin Microfilaments}",
    "inquiry": "Investigate amoeboid pseudopodial feeding and flagellar swimming in diverse freshwater protists.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M18-L3": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 3",
    "title": "Introduction to Fungi: Hyphae & Absorptive Nutrition",
    "formula": "\\text{Extracellular Digestion: Exo-enzymes secrete into substrate, nutrients absorb}",
    "inquiry": "Examine chitin fungal cell walls and mycelial secretion of extracellular digestive enzymes.",
    "defaultParams": {
      "temp": 25,
      "pH": 6.5,
      "substrate": 50
    }
  },
  "BIO-M18-L4": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 4",
    "title": "Fungus Diversity & Ecological Decomposition",
    "formula": "\\text{Saprophytic Decomposition: Recycling Organic Carbon & Mineral Nutrients}",
    "inquiry": "Model fungal mycorrhizal mutualism with plant roots and saprophytic organic recycling in soils.",
    "defaultParams": {
      "capacity": 200,
      "rate": 0.35
    }
  },
  "BIO-M19-L1": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 1",
    "title": "Plant Evolution & Diversity: Bryophytes to Angiosperms",
    "formula": "\\text{Evolution: Cuticle } \\rightarrow \\text{ Vascular Xylem/Phloem } \\rightarrow \\text{ Seeds } \\rightarrow \\text{ Flowers}",
    "inquiry": "Trace plant evolutionary adaptations from nonvascular mosses to water-independent seed plants.",
    "defaultParams": {
      "lightIntensity": 80,
      "co2Level": 500
    }
  },
  "BIO-M19-L2": {
    "type": "bio-photosynthesis-respiration",
    "lessonBadge": "Lesson 2",
    "title": "Plant Structure: Stomata Transpiration & Xylem Transport",
    "formula": "\\text{Transpiration Pull: Cohesion-Tension Theory } (\\Delta \\Psi = \\Psi_{\\text{soil}} - \\Psi_{\\text{atm}})",
    "inquiry": "Observe stomatal guard cell opening/closing regulating transpiration water loss and CO₂ uptake.",
    "defaultParams": {
      "lightIntensity": 75,
      "co2Level": 450
    }
  },
  "BIO-M19-L3": {
    "type": "bio-punnett",
    "lessonBadge": "Lesson 3",
    "title": "Plant Reproduction: Flower Anatomy & Double Fertilization",
    "formula": "1n \\text{ Sperm} + 1n \\text{ Egg} = 2n \\text{ Zygote}, \\quad 1n \\text{ Sperm} + 2n \\text{ Polar Nuclei} = 3n \\text{ Endosperm}",
    "inquiry": "Model pollination, pollen tube growth, and angiosperm double fertilization producing 3n endosperm.",
    "defaultParams": {
      "p1": "Aa",
      "p2": "Aa"
    }
  },
  "BIO-M20-L1": {
    "type": "bio-embryonic-development",
    "lessonBadge": "Lesson 1",
    "title": "Animal Characteristics: Embryonic Cleavage & Germ Layers",
    "formula": "\\text{Zygote } \\longrightarrow \\text{ Blastula } \\longrightarrow \\text{ Gastrula (Ectoderm, Mesoderm, Endoderm)}",
    "inquiry": "Trace early embryonic cell division from single zygote through hollow blastula to gastrula.",
    "defaultParams": {}
  },
  "BIO-M20-L2": {
    "type": "bio-embryonic-development",
    "lessonBadge": "Lesson 2",
    "title": "Animal Body Plans: Symmetry, Cephalization & Coelom",
    "formula": "\\text{Protostome (Blastopore } \\rightarrow \\text{ Mouth}) \\quad \\text{vs} \\quad \\text{Deuterostome (Blastopore } \\rightarrow \\text{ Anus})",
    "inquiry": "Classify animal phyla based on radial vs bilateral symmetry, body cavities (coelom), and cleavage fate.",
    "defaultParams": {}
  },
  "BIO-M21-L1": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 1",
    "title": "Invertebrate Diversity: Body Symmetry & Exoskeletons",
    "formula": "\\text{Invertebrates represent } >95\\% \\text{ of all extant animal species}",
    "inquiry": "Compare body plans across sponges, cnidarians, mollusks, annelids, arthropods, and echinoderms.",
    "defaultParams": {
      "capacity": 250,
      "rate": 0.4
    }
  },
  "BIO-M21-L2": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 2",
    "title": "Vertebrate Evolution: Notochord to Amniotic Egg",
    "formula": "\\text{Vertebrate Transitions: Jaws } \\rightarrow \\text{ Lungs } \\rightarrow \\text{ Tetrapod Limbs } \\rightarrow \\text{ Amniotic Egg}",
    "inquiry": "Trace chordate hallmarks and evolutionary innovations enabling vertebrate terrestrial radiation.",
    "defaultParams": {
      "capacity": 220,
      "rate": 0.35
    }
  },
  "BIO-M21-L3": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 3",
    "title": "Animal Behavior: Innate Instincts, Conditioning & Altruism",
    "formula": "r B > C \\quad (\\text{Hamilton's Rule for Kin Selection Altruism})",
    "inquiry": "Examine fixed action patterns, classical Pavlovian conditioning, and evolutionary kin selection.",
    "defaultParams": {
      "capacity": 180,
      "rate": 0.4
    }
  },
  "BIO-M22-L1": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 1",
    "title": "The Integumentary System: Epidermis & Thermoregulation",
    "formula": "\\text{Thermoregulation: Vasodilation / Evaporative Sweating Cooling}",
    "inquiry": "Examine skin epidermal barrier defenses and homeostatic capillary vasodilation and vasoconstriction.",
    "defaultParams": {
      "tonicity": "isotonic",
      "soluteConc": 0.9
    }
  },
  "BIO-M22-L2": {
    "type": "phys-work-energy",
    "lessonBadge": "Lesson 2",
    "title": "The Skeletal System: Bone Architecture & Biomechanical Levers",
    "formula": "\\tau = F_e \\cdot d_e = F_r \\cdot d_r \\quad (\\text{Musculoskeletal Lever Equilibrium})",
    "inquiry": "Analyze compact osteon bone remodeling and mechanical advantage across anatomical joints.",
    "defaultParams": {
      "h0": 30
    }
  },
  "BIO-M22-L3": {
    "type": "bio-sarcomere-sliding-filament",
    "lessonBadge": "Lesson 3",
    "title": "The Muscular System: Sarcomere Sliding Filament Theory",
    "formula": "F_{\\text{active}} = f([\\text{Ca}^{2+}], \\text{ATP}, L_{\\text{sarcomere}}) \\quad (Z\\text{-to-}Z: 2.5\\,\\mu\\text{m} \\rightarrow 1.9\\,\\mu\\text{m})",
    "inquiry": "Trigger calcium release from the sarcoplasmic reticulum to drive cross-bridge cycling, actin-myosin power strokes, and A-band constant length.",
    "defaultParams": {
      "calcium": 0.1,
      "sarcomereLength": 2.5,
      "atpLevel": 100
    }
  },
  "BIO-M23-L1": {
    "type": "bio-action-potential",
    "lessonBadge": "Lesson 1",
    "title": "Neuron Anatomy & Action Potential Depolarization",
    "formula": "V_m = -70\\text{ mV (Resting)} \\longrightarrow +30\\text{ mV (Action Potential Peak)}",
    "inquiry": "Deliver electrical stimuli above -55 mV threshold to fire voltage-gated Na+ influx and K+ repolarization.",
    "defaultParams": {
      "stimulusStrength": 35
    }
  },
  "BIO-M23-L2": {
    "type": "bio-action-potential",
    "lessonBadge": "Lesson 2",
    "title": "Nervous Organization: Central, Peripheral & Reflex Arcs",
    "formula": "\\text{Reflex Arc: Sensory Receptor } \\rightarrow \\text{ Interneuron } \\rightarrow \\text{ Motor Effector}",
    "inquiry": "Trace rapid reflex arcs bypassing the brain to achieve sub-100ms involuntary protective responses.",
    "defaultParams": {
      "stimulusStrength": 45
    }
  },
  "BIO-M23-L3": {
    "type": "bio-action-potential",
    "lessonBadge": "Lesson 3",
    "title": "The Senses: Photoreception, Mechanoreceptors & Sensation",
    "formula": "\\text{Transduction: Physical Stimulus (Photons/Pressure) } \\longrightarrow \\text{ Membrane Potentials}",
    "inquiry": "Examine retinal rod/cone phototransduction and cochlear hair cell mechanoreceptor frequency tuning.",
    "defaultParams": {
      "stimulusStrength": 30
    }
  },
  "BIO-M23-L4": {
    "type": "bio-action-potential",
    "lessonBadge": "Lesson 4",
    "title": "Synaptic Transmission & Neurotransmitter Drug Impacts",
    "formula": "[\\text{Neurotransmitter}] \\propto \\text{Presynaptic Action Potential Frequency}",
    "inquiry": "Simulate synaptic cleft neurotransmitter exocytosis and receptor agonism by chemical drugs.",
    "defaultParams": {
      "stimulusStrength": 50
    }
  },
  "BIO-M24-L1": {
    "type": "bio-cardiac-cycle",
    "lessonBadge": "Lesson 1",
    "title": "The Circulatory System: Cardiac Cycle & Hemodynamics",
    "formula": "\\text{CO} = \\text{HR} \\times \\text{SV} \\quad (5.04\\,\\text{L/min} = 72\\,\\text{bpm} \\times 70\\,\\text{mL}) \\quad \\text{MAP} = \\text{DBP} + \\frac{1}{3}(\\text{SBP} - \\text{DBP})",
    "inquiry": "Track 4-chamber blood flow, synchronized ECG waveforms, Wiggers pressure loops, and S1/S2 heart valve mechanics across systolic and diastolic phases.",
    "defaultParams": {
      "heartRate": 72,
      "strokeVolume": 70,
      "mode": "continuous"
    }
  },
  "BIO-M24-L2": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 2",
    "title": "The Respiratory System: Alveolar Gas Exchange & Hemoglobin",
    "formula": "P_{\\text{total}} = P_{\\text{O}_2} + P_{\\text{CO}_2} + P_{\\text{N}_2} \\quad (\\text{Oxygen Dissociation})",
    "inquiry": "Analyze partial pressure gradients driving oxygen loading onto hemoglobin in pulmonary capillaries.",
    "defaultParams": {
      "volume": 5,
      "temp": 310,
      "moles": 1
    }
  },
  "BIO-M24-L3": {
    "type": "bio-membrane-osmosis",
    "lessonBadge": "Lesson 3",
    "title": "The Excretory System: Nephron Filtration & Osmoregulation",
    "formula": "\\text{Glomerular Filtration Rate} = K_f \\times (P_{\\text{GC}} - P_{\\text{BS}} - \\Pi_{\\text{GC}})",
    "inquiry": "Trace tubular reabsorption and countercurrent osmotic multiplier in the loop of Henle.",
    "defaultParams": {
      "tonicity": "hypertonic",
      "soluteConc": 2
    }
  },
  "BIO-M25-L1": {
    "type": "bio-enzyme-kinetics",
    "lessonBadge": "Lesson 1",
    "title": "The Digestive System: Enzymatic Hydrolysis in Villi",
    "formula": "\\text{Rate} = \\frac{V_{\\max}[S]}{K_m + [S]} \\quad (\\text{Amylase, Pepsin, Lipase Hydrolysis})",
    "inquiry": "Track enzymatic breakdown of macromolecules across digestive compartments at varying pH levels.",
    "defaultParams": {
      "temp": 37,
      "pH": 2,
      "substrate": 60
    }
  },
  "BIO-M25-L2": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 2",
    "title": "Nutrition & Metabolic Caloric Energy Intake",
    "formula": "1\\text{ Calorie (kcal)} = 4.184\\text{ kJ} \\quad (\\text{Carbs/Proteins: 4 kcal/g, Fats: 9 kcal/g})",
    "inquiry": "Calculate nutritional energy yields and metabolic basal caloric requirements for physiological maintenance.",
    "defaultParams": {
      "metalMass": 50,
      "metalTemp": 90,
      "waterMass": 100
    }
  },
  "BIO-M25-L3": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 3",
    "title": "The Endocrine System: Hormonal Feedback Homeostasis",
    "formula": "\\text{Blood Glucose Homeostasis: Insulin vs Glucagon Antagonistic Balance}",
    "inquiry": "Model negative feedback regulation maintaining set-point hormone concentrations in the bloodstream.",
    "defaultParams": {
      "capacity": 200,
      "rate": 0.4
    }
  },
  "BIO-M26-L1": {
    "type": "bio-gametogenesis-oogenesis",
    "lessonBadge": "Lesson 1",
    "title": "Human Reproductive Systems & Gametogenesis",
    "formula": "\\text{Spermatogenesis } (1 \\rightarrow 4) \\quad \\text{vs} \\quad \\text{Oogenesis } (1 \\rightarrow 1 \\text{ Ovum} + 3 \\text{ Polar Bodies})",
    "inquiry": "Compare spermatogenesis with asymmetric oogenesis and hormonal control of ovulation.",
    "defaultParams": {}
  },
  "BIO-M26-L2": {
    "type": "bio-embryonic-development",
    "lessonBadge": "Lesson 2",
    "title": "Embryonic Development: Cleavage & Fetal Trimesters",
    "formula": "\\text{Zygote } \\longrightarrow \\text{ Morula } \\longrightarrow \\text{ Blastocyst } \\longrightarrow \\text{ Embryo}",
    "inquiry": "Trace blastocyst implantation and major organogenesis milestones across gestation trimesters.",
    "defaultParams": {}
  },
  "BIO-M26-L3": {
    "type": "bio-population-growth",
    "lessonBadge": "Lesson 3",
    "title": "Birth, Growth, Maturation & Cellular Senescence",
    "formula": "\\text{Positive Feedback: Oxytocin stimulates contractions } \\rightarrow \\text{ Cervical stretch}",
    "inquiry": "Examine positive hormonal feedback in labor and telomere shortening in cellular aging.",
    "defaultParams": {
      "capacity": 200,
      "rate": 0.3
    }
  },
  "BIO-M27-L1": {
    "type": "bio-immune-response",
    "lessonBadge": "Lesson 1",
    "title": "Infectious Diseases: Pathogen Transmission & Koch's Postulates",
    "formula": "R_0 = \\text{Basic Reproduction Number} \\quad (R_0 > 1 \\implies \\text{Epidemic Spread})",
    "inquiry": "Model epidemiological pathogen transmission dynamics and non-specific physical barriers.",
    "defaultParams": {}
  },
  "BIO-M27-L2": {
    "type": "bio-immune-response",
    "lessonBadge": "Lesson 2",
    "title": "The Immune System: B-Cell Antibodies & Macrophage Defense",
    "formula": "\\text{Antibody Neutralization: } \\text{IgG binds specific viral epitopes } \\rightarrow \\text{ Agglutination}",
    "inquiry": "Inoculate pathogens and observe B-cell antibody secretion, agglutination, and macrophage phagocytosis.",
    "defaultParams": {}
  },
  "BIO-M27-L3": {
    "type": "bio-immune-response",
    "lessonBadge": "Lesson 3",
    "title": "Immune Memory: Vaccines & Secondary Antibody Response",
    "formula": "\\text{Secondary Titer} \\gg \\text{Primary Titer} \\quad (\\text{Rapid Memory Cell Response})",
    "inquiry": "Compare primary vs secondary immune responses to demonstrate the physiological basis of vaccination.",
    "defaultParams": {}
  },
  "PHYS-M01-L1": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 1",
    "title": "Methods of Science & Scientific Models",
    "formula": "\\text{Hypothesis} \\longrightarrow \\text{Experimental Test} \\longrightarrow \\text{Theory}",
    "inquiry": "Construct mathematical models to predict physical observations and test hypotheses.",
    "defaultParams": {
      "v0": 18,
      "a": -3,
      "x0": 0
    }
  },
  "PHYS-M01-L2": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 2",
    "title": "Mathematics & Dimensional Consistency in Physics",
    "formula": "[v] = \\frac{[L]}{[T]} = \\text{m/s}, \\quad [a] = \\frac{[L]}{[T]^2} = \\text{m/s}^2",
    "inquiry": "Verify dimensional homogeneity across kinematic equations and perform metric conversions.",
    "defaultParams": {
      "v0": 8,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M01-L3": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 3",
    "title": "Measurement, Precision & Significant Figures",
    "formula": "\\% \\text{ Uncertainty} = \\frac{\\Delta x}{x} \\times 100\\%",
    "inquiry": "Quantify instrument precision limits and propagation of uncertainty in measured quantities.",
    "defaultParams": {
      "v0": 6,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M01-L4": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 4",
    "title": "Graphing Physical Data: Linear Relationships & Slopes",
    "formula": "y = m x + b \\quad \\text{and} \\quad \\text{Slope } m = \\frac{\\Delta y}{\\Delta x}",
    "inquiry": "Analyze linear, quadratic, and inverse relationships by fitting slopes and calculating physical constants.",
    "defaultParams": {
      "v0": 10,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M02-L1": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 1",
    "title": "Picturing Motion: Particle Model & Reference Frames",
    "formula": "\\vec{r}(t) = x(t)\\hat{i} \\quad (\\text{Coordinate Origin Reference Frame})",
    "inquiry": "Trace positions of moving objects at uniform time intervals to construct particle model diagrams.",
    "defaultParams": {
      "v0": 8,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M02-L2": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 2",
    "title": "Where and When? Coordinate Systems & Displacement",
    "formula": "\\Delta x = x_f - x_i \\quad (\\text{Scalar Distance vs Vector Displacement})",
    "inquiry": "Differentiate scalar path length from directional vector displacement along a 1D axis.",
    "defaultParams": {
      "v0": 10,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M02-L3": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 3",
    "title": "Position-Time Graphs: Slope as Velocity",
    "formula": "x(t) = x_0 + v t \\quad \\text{and} \\quad v = \\frac{\\Delta x}{\\Delta t}",
    "inquiry": "Adjust vehicle velocity and observe that the slope of the position-time graph directly yields velocity.",
    "defaultParams": {
      "v0": 12,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M02-L4": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 4",
    "title": "How Fast? Average Speed vs Instantaneous Velocity",
    "formula": "\\bar{v} = \\frac{\\text{Total Displacement}}{\\text{Total Time}}, \\quad v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t}",
    "inquiry": "Calculate instantaneous speeds at tangent points along non-linear position curves.",
    "defaultParams": {
      "v0": 15,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M03-L1": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 1",
    "title": "Acceleration: Rate of Change of Velocity",
    "formula": "a = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i}",
    "inquiry": "Observe how acceleration changes velocity over time, representing the slope on a v-t graph.",
    "defaultParams": {
      "v0": 0,
      "a": 2.5,
      "x0": 0
    }
  },
  "PHYS-M03-L2": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 2",
    "title": "Motion with Constant Acceleration Kinematics",
    "formula": "v = v_0 + at, \\quad x = x_0 + v_0 t + \\frac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\Delta x",
    "inquiry": "Test braking deceleration (-4 m/s²) from 25 m/s to measure stopping distance and time.",
    "defaultParams": {
      "v0": 25,
      "a": -4,
      "x0": 0
    }
  },
  "PHYS-M03-L3": {
    "type": "phys-free-fall",
    "lessonBadge": "Lesson 3",
    "title": "Free Fall & Gravitational Acceleration",
    "formula": "y(t) = y_0 + v_0 t - \\frac{1}{2}g t^2 \\quad \\text{and} \\quad v(t) = v_0 - g t",
    "inquiry": "Drop or vertically launch objects with initial height y₀, signed velocity v₀, and gravitational acceleration g to observe free fall kinematics and ground impact.",
    "defaultParams": {
      "y0": 80,
      "v0": 0,
      "g": 9.8,
      "mass": 1.0
    }
  },
  "PHYS-M04-L1": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 1",
    "title": "Newton's First & Second Laws of Motion",
    "formula": "\\sum \\vec{F} = m \\vec{a} \\implies \\vec{a} = \\frac{\\vec{F}_{\\text{net}}}{m}",
    "inquiry": "Vary net applied force and body mass to confirm that acceleration is directly proportional to net force.",
    "defaultParams": {
      "v0": 0,
      "a": 3,
      "x0": 0
    }
  },
  "PHYS-M04-L2": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 2",
    "title": "Weight, Apparent Weight, and Drag Force",
    "formula": "F_g = mg \\quad \\text{and} \\quad F_{\\text{net}} = mg - F_{\\text{drag}} = ma",
    "inquiry": "Analyze apparent weight in an accelerating elevator and terminal velocity equilibrium when Fdrag = mg.",
    "defaultParams": {
      "v0": 0,
      "a": 1.5,
      "x0": 0
    }
  },
  "PHYS-M04-L3": {
    "type": "phys-collisions",
    "lessonBadge": "Lesson 3",
    "title": "Newton's Third Law: Interaction Action-Reaction Pairs",
    "formula": "\\vec{F}_{A\\text{ on }B} = -\\vec{F}_{B\\text{ on }A}",
    "inquiry": "Collide two objects to demonstrate that interaction contact forces are always equal in magnitude and opposite in direction.",
    "defaultParams": {
      "m1": 2,
      "v1": 3,
      "m2": 1,
      "v2": -1,
      "elastic": true
    }
  },
  "PHYS-M05-L1": {
    "type": "phys-inclined-plane",
    "lessonBadge": "Lesson 1",
    "title": "Vectors in 2D: Component Resolution & Trigonometry",
    "formula": "A_x = A \\cos\\theta, \\quad A_y = A \\sin\\theta, \\quad A = \\sqrt{A_x^2 + A_y^2}",
    "inquiry": "Resolve vector forces into orthogonal x and y components and calculate resultant magnitude and angle.",
    "defaultParams": {
      "angle": 30,
      "mass": 5,
      "mu_k": 0.2
    }
  },
  "PHYS-M05-L2": {
    "type": "phys-inclined-plane",
    "lessonBadge": "Lesson 2",
    "title": "Friction: Static vs Kinetic Friction Coefficients",
    "formula": "f_s \\le \\mu_s F_N \\quad \\text{and} \\quad f_k = \\mu_k F_N",
    "inquiry": "Tilt a surface to determine the critical threshold angle where static friction yields to kinetic sliding.",
    "defaultParams": {
      "angle": 25,
      "mass": 5,
      "mu_k": 0.25
    }
  },
  "PHYS-M05-L3": {
    "type": "phys-inclined-plane",
    "lessonBadge": "Lesson 3",
    "title": "Forces in Two Dimensions & Inclined Plane Dynamics",
    "formula": "F_{\\parallel} = mg\\sin\\theta, \\quad F_{\\perp} = mg\\cos\\theta, \\quad a = g(\\sin\\theta - \\mu_k\\cos\\theta)",
    "inquiry": "Decompose gravitational weight on a ramp into parallel driving force and perpendicular normal force.",
    "defaultParams": {
      "angle": 35,
      "mass": 4,
      "mu_k": 0.15
    }
  },
  "PHYS-M06-L1": {
    "type": "phys-projectile-mini",
    "lessonBadge": "Lesson 1",
    "title": "2D Projectile Motion: Parabolic Trajectories",
    "formula": "R = \\frac{v_0^2 \\sin(2\\theta)}{g}, \\quad H = \\frac{(v_0\\sin\\theta)^2}{2g}, \\quad t_{\\text{flight}} = \\frac{2v_0\\sin\\theta}{g}",
    "inquiry": "Launch projectiles at various angles to prove that 45° maximizes horizontal range on level ground.",
    "defaultParams": {
      "angle": 45,
      "speed": 22,
      "gravity": 9.8
    }
  },
  "PHYS-M06-L2": {
    "type": "phys-circular-motion",
    "lessonBadge": "Lesson 2",
    "title": "Uniform Circular Motion & Centripetal Acceleration",
    "formula": "a_c = \\frac{v^2}{r} = \\omega^2 r \\quad \\text{and} \\quad F_c = \\frac{m v^2}{r}",
    "inquiry": "Rotate a mass on a tether to observe that centripetal acceleration always points radially inward toward the center.",
    "defaultParams": {}
  },
  "PHYS-M06-L3": {
    "type": "phys-kinematics-1d",
    "lessonBadge": "Lesson 3",
    "title": "Relative Velocity in Two Reference Frames",
    "formula": "\\vec{v}_{a/c} = \\vec{v}_{a/b} + \\vec{v}_{b/c}",
    "inquiry": "Add velocity vectors of a boat crossing a river current to calculate resultant crossing velocity and heading.",
    "defaultParams": {
      "v0": 10,
      "a": 0,
      "x0": 0
    }
  },
  "PHYS-M07-L1": {
    "type": "phys-gravity-orbits",
    "lessonBadge": "Lesson 1",
    "title": "Planetary Motion & Kepler's Laws",
    "formula": "T^2 = \\left(\\frac{4\\pi^2}{G M}\\right) r^3 \\quad (\\text{Kepler's Harmonic Third Law})",
    "inquiry": "Trace elliptical planetary orbits to verify that planets sweep equal areas in equal times.",
    "defaultParams": {}
  },
  "PHYS-M07-L2": {
    "type": "phys-gravity-orbits",
    "lessonBadge": "Lesson 2",
    "title": "Newton's Law of Universal Gravitation & Orbits",
    "formula": "F_g = G \\frac{m_1 m_2}{r^2} \\quad \\text{and} \\quad v_{\\text{orb}} = \\sqrt{\\frac{GM}{r}}",
    "inquiry": "Adjust orbital altitude above Earth to compute orbital speed and period for low Earth and geostationary satellites.",
    "defaultParams": {}
  },
  "PHYS-M08-L1": {
    "type": "phys-circular-motion",
    "lessonBadge": "Lesson 1",
    "title": "Describing Rotational Motion: Angular Kinematics",
    "formula": "\\theta = \\omega_0 t + \\frac{1}{2}\\alpha t^2, \\quad \\omega = \\omega_0 + \\alpha t, \\quad v_t = r\\omega",
    "inquiry": "Relate linear tangential velocity and distance to angular velocity and radian displacement.",
    "defaultParams": {}
  },
  "PHYS-M08-L2": {
    "type": "phys-circular-motion",
    "lessonBadge": "Lesson 2",
    "title": "Rotational Dynamics: Torque & Rotational Inertia",
    "formula": "\\tau = r F \\sin\\theta \\quad \\text{and} \\quad \\tau_{\\text{net}} = I \\alpha",
    "inquiry": "Apply force at varying lever arm distances to observe torque-induced angular acceleration.",
    "defaultParams": {}
  },
  "PHYS-M08-L3": {
    "type": "phys-circular-motion",
    "lessonBadge": "Lesson 3",
    "title": "Equilibrium & Center of Mass",
    "formula": "\\sum \\vec{F} = 0 \\quad (\\text{Translational}) \\quad \\& \\quad \\sum \\vec{\\tau} = 0 \\quad (\\text{Rotational})",
    "inquiry": "Balance opposing torques on a seesaw lever to achieve complete static equilibrium.",
    "defaultParams": {}
  },
  "PHYS-M09-L1": {
    "type": "phys-collisions",
    "lessonBadge": "Lesson 1",
    "title": "Impulse and Linear Momentum Theorem",
    "formula": "\\vec{p} = m \\vec{v} \\quad \\text{and} \\quad \\vec{J} = \\vec{F} \\Delta t = \\Delta \\vec{p}",
    "inquiry": "Demonstrate how extending impact duration (airbags, crumple zones) reduces peak impact force.",
    "defaultParams": {
      "m1": 2,
      "v1": 3,
      "m2": 1,
      "v2": -1,
      "elastic": true
    }
  },
  "PHYS-M09-L2": {
    "type": "phys-collisions",
    "lessonBadge": "Lesson 2",
    "title": "Conservation of Momentum: Elastic vs Inelastic Collisions",
    "formula": "m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\quad \\text{and} \\quad \\Delta KE = 0 \\text{ (Elastic)}",
    "inquiry": "Collide gliders on an air track and compare momentum and kinetic energy conservation across collision types.",
    "defaultParams": {
      "m1": 2,
      "v1": 2.5,
      "m2": 1.5,
      "v2": -1.5,
      "elastic": true
    }
  },
  "PHYS-M10-L1": {
    "type": "phys-work-energy",
    "lessonBadge": "Lesson 1",
    "title": "Work & The Work-Energy Theorem",
    "formula": "W = F d \\cos\\theta = \\Delta KE = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2",
    "inquiry": "Apply force over distance to observe kinetic energy gains matching work done on an object.",
    "defaultParams": {
      "h0": 35
    }
  },
  "PHYS-M10-L2": {
    "type": "phys-work-energy",
    "lessonBadge": "Lesson 2",
    "title": "Gravitational and Elastic Potential Energy",
    "formula": "PE_g = m g h \\quad \\text{and} \\quad PE_e = \\frac{1}{2} k x^2",
    "inquiry": "Compare energy stored in elevated gravitational fields with energy stored in compressed springs.",
    "defaultParams": {
      "h0": 45
    }
  },
  "PHYS-M10-L3": {
    "type": "phys-work-energy",
    "lessonBadge": "Lesson 3",
    "title": "Conservation of Mechanical Energy on a Roller Coaster",
    "formula": "E_{\\text{mech}} = KE + PE = \\text{constant} \\quad (KE_i + PE_i = KE_f + PE_f)",
    "inquiry": "Trace the continuous exchange between kinetic and gravitational potential energy along hills and loops.",
    "defaultParams": {
      "h0": 40
    }
  },
  "PHYS-M10-L4": {
    "type": "phys-work-energy",
    "lessonBadge": "Lesson 4",
    "title": "Simple Machines & Mechanical Advantage",
    "formula": "\\text{MA} = \\frac{F_r}{F_e}, \\quad \\text{IMA} = \\frac{d_e}{d_r}, \\quad \\text{Efficiency} = \\frac{W_{\\text{out}}}{W_{\\text{in}}} \\times 100\\%",
    "inquiry": "Measure force reduction and distance trade-offs across ramps, pulleys, and lever systems.",
    "defaultParams": {
      "h0": 30
    }
  },
  "PHYS-M11-L1": {
    "type": "chem-calorimetry",
    "lessonBadge": "Lesson 1",
    "title": "Temperature, Heat & Specific Heat Capacity",
    "formula": "Q = m c \\Delta T \\quad (\\text{Heat Exchange Equilibrium: } Q_{\\text{hot}} = -Q_{\\text{cold}})",
    "inquiry": "Transfer heat between hot metals and cool water in a calorimeter to measure specific heat.",
    "defaultParams": {
      "metalMass": 60,
      "metalTemp": 100,
      "waterMass": 100
    }
  },
  "PHYS-M11-L2": {
    "type": "chem-heating-curve",
    "lessonBadge": "Lesson 2",
    "title": "Changes of State, Latent Heat & Laws of Thermodynamics",
    "formula": "\\Delta U = Q - W \\quad (\\text{1st Law}) \\quad \\& \\quad e_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}",
    "inquiry": "Trace phase transition plateaus and compute theoretical thermodynamic Carnot engine efficiencies.",
    "defaultParams": {
      "temp": -15,
      "energy": 0
    }
  },
  "PHYS-M12-L1": {
    "type": "chem-gas-kinetics",
    "lessonBadge": "Lesson 1",
    "title": "Fluid Pressure & Hydrostatic Depth Equilibrium",
    "formula": "P = \\frac{F}{A} \\quad \\text{and} \\quad P(h) = P_0 + \\rho g h",
    "inquiry": "Analyze how fluid depth and density dictate hydrostatic pressure on submerged surfaces.",
    "defaultParams": {
      "volume": 5,
      "temp": 300,
      "moles": 1
    }
  },
  "PHYS-M12-L2": {
    "type": "chem-density",
    "lessonBadge": "Lesson 2",
    "title": "Forces in Liquids: Surface Tension & Pascal's Principle",
    "formula": "\\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\quad (\\text{Hydraulic Pressure Transmission})",
    "inquiry": "Transmit pressure equally in all directions through enclosed fluids in hydraulic lift systems.",
    "defaultParams": {
      "mass": 70,
      "volume": 35
    }
  },
  "PHYS-M12-L3": {
    "type": "chem-density",
    "lessonBadge": "Lesson 3",
    "title": "Archimedes' Buoyancy Principle & Bernoulli's Lift",
    "formula": "F_b = \\rho_{\\text{fluid}} V_{\\text{disp}} g \\quad \\text{and} \\quad P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2",
    "inquiry": "Test buoyant force balance on floating vessels and examine aerodynamic pressure drops in streamlines.",
    "defaultParams": {
      "mass": 50,
      "volume": 50
    }
  },
  "PHYS-M12-L4": {
    "type": "phys-shm-oscillator",
    "lessonBadge": "Lesson 4",
    "title": "Thermal Expansion in Solids & Elastic Stress",
    "formula": "\\Delta L = \\alpha L_1 \\Delta T \\quad \\text{and} \\quad \\text{Stress } \\sigma = Y \\cdot \\frac{\\Delta L}{L}",
    "inquiry": "Model linear thermal expansion in bridges and quantify Young's modulus elasticity.",
    "defaultParams": {}
  },
  "PHYS-M13-L1": {
    "type": "phys-shm-oscillator",
    "lessonBadge": "Lesson 1",
    "title": "Periodic Motion: Simple Harmonic Motion Springs & Pendulums",
    "formula": "T_{\\text{spring}} = 2\\pi\\sqrt{\\frac{m}{k}} \\quad \\text{and} \\quad T_{\\text{pend}} = 2\\pi\\sqrt{\\frac{L}{g}}",
    "inquiry": "Oscillate mass-spring and pendulum systems to measure periods and observe restoring force vectors.",
    "defaultParams": {}
  },
  "PHYS-M13-L2": {
    "type": "phys-doppler",
    "lessonBadge": "Lesson 2",
    "title": "Wave Properties: Transverse vs Longitudinal Wave Speed",
    "formula": "v = f \\lambda \\quad \\text{and} \\quad T = \\frac{1}{f}",
    "inquiry": "Correlate wave speed, frequency, and wavelength in traveling mechanical waves.",
    "defaultParams": {
      "sourceSpeed": 100,
      "waveSpeed": 343,
      "sourceFreq": 440
    }
  },
  "PHYS-M13-L3": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 3",
    "title": "Wave Behavior: Superposition & Interference",
    "formula": "y_{\\text{net}}(x,t) = y_1(x,t) + y_2(x,t) \\quad (\\text{Constructive vs Destructive})",
    "inquiry": "Superpose traveling waves to observe constructive peaks, destructive cancellation, and standing wave nodes.",
    "defaultParams": {}
  },
  "PHYS-M14-L1": {
    "type": "phys-doppler",
    "lessonBadge": "Lesson 1",
    "title": "Sound Waves & The Doppler Frequency Shift",
    "formula": "f_d = f_s \\left(\\frac{v \\pm v_d}{v \\mp v_s}\\right) \\quad (\\text{Acoustic Doppler Effect})",
    "inquiry": "Accelerate a moving sound source to witness wavefront compression and frequency elevation ahead.",
    "defaultParams": {
      "sourceSpeed": 150,
      "waveSpeed": 343,
      "sourceFreq": 440
    }
  },
  "PHYS-M14-L2": {
    "type": "phys-doppler",
    "lessonBadge": "Lesson 2",
    "title": "The Physics of Music: Harmonics & Resonance Pipes",
    "formula": "f_n = n \\frac{v}{2L} \\text{ (Open Pipe)} \\quad \\& \\quad f_n = n \\frac{v}{4L} \\text{ (Closed Pipe)}",
    "inquiry": "Tune resonance tube lengths to generate fundamental frequencies and standing harmonic overtones.",
    "defaultParams": {
      "sourceSpeed": 0,
      "waveSpeed": 343,
      "sourceFreq": 440
    }
  },
  "PHYS-M15-L1": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 1",
    "title": "Illumination & Inverse-Square Law of Light",
    "formula": "E = \\frac{P}{4\\pi r^2} \\quad (\\text{Illuminance in Lux: } E \\propto 1/r^2)",
    "inquiry": "Measure illuminance drop-off as distance from a point light source doubles.",
    "defaultParams": {}
  },
  "PHYS-M15-L2": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 2",
    "title": "The Wave Nature of Light & Linear Polarization",
    "formula": "I = I_0 \\cos^2\\theta \\quad (\\text{Malus's Law for Polarized Light})",
    "inquiry": "Pass transverse light waves through crossed polarizing filters to verify Malus's intensity law.",
    "defaultParams": {}
  },
  "PHYS-M16-L1": {
    "type": "phys-snell-optics",
    "lessonBadge": "Lesson 1",
    "title": "Law of Reflection & Specular Mirror Surfaces",
    "formula": "\\theta_i = \\theta_r \\quad (\\text{Angle of Incidence equals Angle of Reflection})",
    "inquiry": "Reflect rays off flat mirrors to analyze specular vs diffuse reflection and virtual image formation.",
    "defaultParams": {
      "n1": 1,
      "n2": 1,
      "incidentAngle": 40
    }
  },
  "PHYS-M16-L2": {
    "type": "phys-snell-optics",
    "lessonBadge": "Lesson 2",
    "title": "Curved Spherical Mirrors: Concave and Convex",
    "formula": "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\quad \\text{and} \\quad m = -\\frac{d_i}{d_o}",
    "inquiry": "Locate real and virtual focal points in concave converging and convex diverging spherical mirrors.",
    "defaultParams": {
      "n1": 1,
      "n2": 1,
      "incidentAngle": 30
    }
  },
  "PHYS-M16-L3": {
    "type": "phys-snell-optics",
    "lessonBadge": "Lesson 3",
    "title": "Snell's Law of Refraction & Total Internal Reflection",
    "formula": "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\quad \\text{and} \\quad \\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right)",
    "inquiry": "Direct a laser ray across water/air interfaces to find the critical angle and observe Total Internal Reflection.",
    "defaultParams": {
      "n1": 1.33,
      "n2": 1,
      "incidentAngle": 42
    }
  },
  "PHYS-M16-L4": {
    "type": "phys-snell-optics",
    "lessonBadge": "Lesson 4",
    "title": "Convex and Concave Thin Lenses: Optical Imaging",
    "formula": "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\quad (\\text{Thin Lens Equation})",
    "inquiry": "Form real inverted and virtual upright images using converging convex and diverging concave lenses.",
    "defaultParams": {
      "n1": 1,
      "n2": 1.52,
      "incidentAngle": 35
    }
  },
  "PHYS-M17-L1": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 1",
    "title": "Young's Double-Slit Wave Interference Fringes",
    "formula": "d \\sin\\theta = m \\lambda \\quad \\text{and} \\quad \\Delta y = \\frac{\\lambda L}{d}",
    "inquiry": "Adjust slit spacing d and laser wavelength to observe bright and dark fringe expansion on the screen.",
    "defaultParams": {}
  },
  "PHYS-M17-L2": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 2",
    "title": "Single-Slit Diffraction & Diffraction Gratings",
    "formula": "w \\sin\\theta = m \\lambda \\quad (\\text{Diffraction Minimum Envelope})",
    "inquiry": "Analyze single-slit diffraction envelopes and high-resolution spectral line separation in gratings.",
    "defaultParams": {}
  },
  "PHYS-M18-L1": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 1",
    "title": "Electric Charge & Conservation of Charge",
    "formula": "q = N e \\quad (e = 1.602 \\times 10^{-19} \\text{ C})",
    "inquiry": "Examine charge transfer via conduction friction and charging by electrostatic induction.",
    "defaultParams": {
      "q1": 2,
      "q2": -2,
      "rDist": 1.2
    }
  },
  "PHYS-M18-L2": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 2",
    "title": "Coulomb's Law: Inverse-Square Electrostatic Force",
    "formula": "F_e = k_e \\frac{|q_1 q_2|}{r^2} \\quad (k_e = 8.99 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2)",
    "inquiry": "Vary charge polarities and separation distance to measure electrostatic attraction and repulsion forces.",
    "defaultParams": {
      "q1": 3,
      "q2": -3,
      "rDist": 1
    }
  },
  "PHYS-M18-L3": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 3",
    "title": "Measuring Electric Fields: Vector Field Lines",
    "formula": "\\vec{E} = \\frac{\\vec{F}_e}{q_0} \\quad (\\text{Field Vector Lines Diverge from } + \\text{ toward } -)",
    "inquiry": "Map electric field line densities and direction vectors in the region surrounding point charges.",
    "defaultParams": {
      "q1": 4,
      "q2": -4,
      "rDist": 1
    }
  },
  "PHYS-M18-L4": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 4",
    "title": "Electric Potential Difference & Millikan Oil Drop",
    "formula": "\\Delta V = \\frac{W}{q} = E \\cdot d \\quad (\\text{Elementary Charge Quantization})",
    "inquiry": "Suspend charged oil droplets between capacitor plates to balance gravitational and electric forces.",
    "defaultParams": {
      "q1": 2,
      "q2": 2,
      "rDist": 0.8
    }
  },
  "PHYS-M19-L1": {
    "type": "phys-dc-circuit",
    "lessonBadge": "Lesson 1",
    "title": "Electric Current, Resistance & Ohm's Law",
    "formula": "I = \\frac{\\Delta Q}{\\Delta t} \\quad \\text{and} \\quad V = I R",
    "inquiry": "Vary supply voltage and circuit resistance to verify linear Ohm's law current response.",
    "defaultParams": {
      "voltage": 12,
      "r1": 10,
      "r2": 20,
      "mode": "series"
    }
  },
  "PHYS-M19-L2": {
    "type": "phys-dc-circuit",
    "lessonBadge": "Lesson 2",
    "title": "Electrical Power & Joule Heating Dissipation",
    "formula": "P = I V = I^2 R = \\frac{V^2}{R} \\quad (\\text{Thermal Dissipation})",
    "inquiry": "Calculate electric power consumption and thermal energy generation in circuit loads.",
    "defaultParams": {
      "voltage": 15,
      "r1": 15,
      "r2": 15,
      "mode": "series"
    }
  },
  "PHYS-M19-L3": {
    "type": "phys-dc-circuit",
    "lessonBadge": "Lesson 3",
    "title": "Series & Parallel DC Circuits: Kirchhoff's Laws",
    "formula": "R_{\\text{series}} = R_1 + R_2, \\quad \\frac{1}{R_{\\text{parallel}}} = \\frac{1}{R_1} + \\frac{1}{R_2}",
    "inquiry": "Switch between series and parallel topologies to compare equivalent resistance and branch currents.",
    "defaultParams": {
      "voltage": 12,
      "r1": 10,
      "r2": 20,
      "mode": "parallel"
    }
  },
  "PHYS-M19-L4": {
    "type": "phys-dc-circuit",
    "lessonBadge": "Lesson 4",
    "title": "Circuit Safety: Fuses, Breakers, and Ground Faults",
    "formula": "I_{\\text{total}} = \\sum I_{\\text{branches}} \\quad (\\text{Overload Current Protection})",
    "inquiry": "Simulate electrical overcurrent triggers and analyze protective circuit breaker operation.",
    "defaultParams": {
      "voltage": 24,
      "r1": 5,
      "r2": 10,
      "mode": "parallel"
    }
  },
  "PHYS-M20-L1": {
    "type": "phys-lorentz-force",
    "lessonBadge": "Lesson 1",
    "title": "Magnetic Fields & Ferromagnetic Domains",
    "formula": "\\vec{B} \\text{ (Magnetic Dipole Lines emerge from North and enter South)}",
    "inquiry": "Map continuous magnetic field lines surrounding permanent bar magnets and solenoids.",
    "defaultParams": {}
  },
  "PHYS-M20-L2": {
    "type": "phys-lorentz-force",
    "lessonBadge": "Lesson 2",
    "title": "Lorentz Force on Moving Charges & Current Wires",
    "formula": "\\vec{F}_B = q (\\vec{v} \\times \\vec{B}) \\quad \\text{and} \\quad F = I L B \\sin\\theta",
    "inquiry": "Deflect moving protons and electrons in uniform magnetic fields using the right-hand rule.",
    "defaultParams": {}
  },
  "PHYS-M21-L1": {
    "type": "phys-faraday-induction",
    "lessonBadge": "Lesson 1",
    "title": "Electromagnetic Induction & Faraday's Law",
    "formula": "\\mathcal{E} = -N \\frac{\\Delta \\Phi_B}{\\Delta t} \\quad (\\text{Lenz's Law of Opposition})",
    "inquiry": "Move a bar magnet through a multi-turn solenoid coil to generate induced electric voltage.",
    "defaultParams": {}
  },
  "PHYS-M21-L2": {
    "type": "phys-faraday-induction",
    "lessonBadge": "Lesson 2",
    "title": "Applications of Induction: AC Generators and Motors",
    "formula": "\\mathcal{E}(t) = N B A \\omega \\sin(\\omega t) \\quad (\\text{Sinusoidal AC Generation})",
    "inquiry": "Rotate a coil within a magnetic field to generate sinusoidal alternating electrical current.",
    "defaultParams": {}
  },
  "PHYS-M21-L3": {
    "type": "phys-wave-optics",
    "lessonBadge": "Lesson 3",
    "title": "Maxwell's Equations & Self-Propagating EM Waves",
    "formula": "c = \\frac{1}{\\sqrt{\\mu_0 \\epsilon_0}} = 3.00 \\times 10^8\\text{ m/s}",
    "inquiry": "Model transverse oscillating electric and magnetic fields self-propagating through empty space.",
    "defaultParams": {}
  },
  "PHYS-M22-L1": {
    "type": "phys-photoelectric",
    "lessonBadge": "Lesson 1",
    "title": "The Photoelectric Effect & Photon Energy Quanta",
    "formula": "KE_{\\max} = h \\nu - \\Phi = \\frac{hc}{\\lambda} - \\Phi",
    "inquiry": "Strike metal cathodes with UV light to liberate electrons above the work function threshold.",
    "defaultParams": {}
  },
  "PHYS-M22-L2": {
    "type": "phys-photoelectric",
    "lessonBadge": "Lesson 2",
    "title": "Matter Waves & De Broglie Wavelength",
    "formula": "\\lambda = \\frac{h}{p} = \\frac{h}{m v} \\quad \\text{and} \\quad \\Delta x \\Delta p \\ge \\frac{\\hbar}{2}",
    "inquiry": "Calculate matter wavelengths for microscopic electrons vs macroscopic objects and analyze diffraction.",
    "defaultParams": {}
  },
  "PHYS-M22-L3": {
    "type": "chem-bohr-photon",
    "lessonBadge": "Lesson 3",
    "title": "Bohr's Quantized Hydrogen Model & Spectral Series",
    "formula": "E_n = -\\frac{13.6\\text{ eV}}{n^2} \\quad \\text{and} \\quad \\frac{1}{\\lambda} = R_H \\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)",
    "inquiry": "Simulate electronic transitions in hydrogen and match emission wavelengths with the visible Balmer series.",
    "defaultParams": {
      "nInitial": 3,
      "nFinal": 2
    }
  },
  "PHYS-M22-L4": {
    "type": "chem-bohr-photon",
    "lessonBadge": "Lesson 4",
    "title": "Quantum Mechanical Atomic Model & Orbitals",
    "formula": "-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi + V \\psi = E \\psi \\quad (\\text{Schrödinger Wave Equation})",
    "inquiry": "Explore 3D electron probability density wavefunctions and quantum numbers (n, l, m, s).",
    "defaultParams": {
      "nInitial": 4,
      "nFinal": 2
    }
  },
  "PHYS-M23-L1": {
    "type": "phys-energy-bands",
    "lessonBadge": "Lesson 1",
    "title": "Energy Bands in Solids: Conductors, Semiconductors, Insulators",
    "formula": "E_g \\text{ (Band Gap: Conductor } 0\\text{ eV}, \\text{Si } 1.1\\text{ eV}, \\text{Insulator } >5\\text{ eV})",
    "inquiry": "Examine valence and conduction energy bands and thermal electron excitation across band gaps.",
    "defaultParams": {
      "material": "silicon",
      "temperature": 300,
      "bias": 5
    }
  },
  "PHYS-M23-L2": {
    "type": "phys-semiconductor-diode",
    "lessonBadge": "Lesson 2",
    "title": "Semiconductor p-n Diodes and Transistors",
    "formula": "I = I_s \\left(e^{e V / k_B T} - 1\\right) \\quad (\\text{Diode Shockley Equation})",
    "inquiry": "Apply forward and reverse bias to a p-n junction diode to observe unilateral current rectification.",
    "defaultParams": {
      "voltage": 2.5,
      "diodeType": "silicon",
      "mode": "forward",
      "rLoad": 220
    }
  },
  "PHYS-M24-L1": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 1",
    "title": "The Atomic Nucleus, Mass Defect & Binding Energy",
    "formula": "\\Delta E = (\\Delta m) c^2 \\quad \\text{and} \\quad 1\\text{ u} = 931.5\\text{ MeV}",
    "inquiry": "Calculate nuclear mass defects and binding energies holding nucleons together against electrostatic repulsion.",
    "defaultParams": {
      "isotope": "C14"
    }
  },
  "PHYS-M24-L2": {
    "type": "chem-nuclear-decay",
    "lessonBadge": "Lesson 2",
    "title": "Nuclear Decay Modes: Alpha, Beta, Gamma Energetics",
    "formula": "{}^A_Z X \\longrightarrow {}^{A-4}_{Z-2}Y + {}^4_2\\alpha, \\quad {}^A_Z X \\longrightarrow {}^A_{Z+1}Y + e^- + \\bar{\\nu}_e",
    "inquiry": "Balance nuclear equations and track decay chain energy releases over radioactive half-lives.",
    "defaultParams": {
      "isotope": "U238"
    }
  },
  "PHYS-M24-L3": {
    "type": "phys-coulomb-field",
    "lessonBadge": "Lesson 3",
    "title": "The Standard Model of Particle Physics: Quarks & Leptons",
    "formula": "\\text{Proton: } (uud), \\quad \\text{Neutron: } (udd), \\quad \\text{Forces: Strong, Weak, EM, Gravity}",
    "inquiry": "Explore fundamental matter constituents: six quark flavors, leptons, and gauge vector bosons.",
    "defaultParams": {
      "q1": 2,
      "q2": -1,
      "rDist": 0.5
    }
  }
};

/**
 * Returns a tailored interactive specification based on subject, module, and lesson.
 */
export function getLessonInteractiveSpec(subjectCode, moduleId, lessonId) {
  let code = "CHEM";
  let mId = 1;
  let lId = 1;

  if (typeof subjectCode === "object" && subjectCode !== null) {
    const mod = subjectCode;
    code = (mod.code || "").split("-")[0] || "CHEM";
    mId = mod.id || parseInt((mod.code || "").split("-")[1]?.replace(/\D/g, ""), 10) || 1;
    lId = parseInt(moduleId, 10) || (mod.lessons && mod.lessons[0] ? mod.lessons[0].id : 1);
  } else {
    code = (subjectCode || "").toUpperCase();
    if (code.includes("-")) {
      const parts = code.split("-");
      code = parts[0];
      if (!moduleId && parts[1]) {
        moduleId = parseInt(parts[1].replace(/\D/g, ""), 10);
      }
    }
    mId = parseInt(moduleId, 10) || 1;
    lId = parseInt(lessonId, 10) || 1;
  }

  const padM = mId < 10 ? '0' + mId : '' + mId;
  const key = `${code}-M${padM}-L${lId}`;

  if (LESSON_INTERACTIVE_REGISTRY[key]) {
    return JSON.parse(JSON.stringify(LESSON_INTERACTIVE_REGISTRY[key]));
  }

  // Fallback to M1 L1 of that subject
  const fallbackKey = `${code}-M01-L1`;
  if (LESSON_INTERACTIVE_REGISTRY[fallbackKey]) {
    const cloned = JSON.parse(JSON.stringify(LESSON_INTERACTIVE_REGISTRY[fallbackKey]));
    cloned.lessonBadge = `Lesson ${lId}`;
    return cloned;
  }

  return {
    type: "chem-density",
    lessonBadge: `Lesson ${lId}`,
    title: "Scientific Investigation Workbench",
    formula: "\\text{Observation} \\longrightarrow \\text{Mathematical Model}",
    inquiry: "Interact with real-time controls to explore scientific principles and quantitative predictions.",
    defaultParams: {}
  };
}
