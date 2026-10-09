// Edugates-ClipSAT Science Labs - Comprehensive Module Domain Profiles
// Authentic scientific profiles for all 74 modules across Chemistry (23), Biology (27), and Physics (24).
// Provides domain-grounded formulas, mechanisms, experiments, misconceptions, calculations, and CER inquiry frameworks.

import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";

// =========================================================================
// CHEMISTRY MODULE PROFILES (1 - 23)
// =========================================================================
export const CHEM_MODULE_PROFILES = {
  1: {
    system: "Stratospheric Ozone & Matter Metrology",
    mechanism: "Photolytic dissociation of O₂ into nascent oxygen radicals by UV-C photons followed by three-body recombination O + O₂ + M → O₃ + M",
    calc1: { formula: "\\rho = \\frac{m}{V}", label: "density", unit: "g/cm^3", solve: (m, v) => (m / v).toFixed(2) },
    calc2: { formula: "\\% \\text{ Error} = \\frac{|\\text{Exp} - \\text{Acc}|}{\\text{Acc}} \\times 100\\%", label: "percent error", unit: "\\%", solve: (exp, acc) => (Math.abs(exp - acc) / acc * 100).toFixed(2) },
    graph: "Stratospheric ozone altitude profile displaying peak concentration between 20–25 km",
    experiment: {"iv":"Wavelength of incident ultraviolet radiation (nm)","dv":"Photolytic absorbance of ozone layer","controls":"Gas temperature and optical cell path length"},
    misconception: "The 'ozone hole' is a literal vacuum void in space, rather than a localized thinning below 220 Dobson Units (DU)",
    application: "Transition from ozone-depleting CFC refrigerants to hydrofluoroolefins (HFOs) under the Montreal Protocol",
    perturbation: "Injection of volcanic aerosol sulfate droplets accelerating heterogeneous chlorine activation on polar stratospheric clouds",
    comparison: "Stratospheric ozone (protective UV filter) versus tropospheric ground-level ozone (toxic photochemical oxidant and pollutant)",
    errorAnalysis: "Aerosol scattering introducing systematic baseline elevation in spectrophotometric Dobson column measurements",
    boundary: "Upper atmospheric limit (above 50 km) where low collision frequency M prevents ozone stabilization despite high UV flux",
    cer1: {"prompt":"Evaluate the claim that human chlorofluorocarbon (CFC) emissions are the primary driver of polar ozone depletion.","claim":"Anthropogenic CFC release catalytically destroys stratospheric ozone.","ev":"Satellite microwave spectroscopy detects high ClO radical concentrations spatially correlated with ozone minima over Antarctica.","reas":"Chlorine radicals act as homogenous catalysts (Cl + O₃ → ClO + O₂), lowering activation energy and enabling single radicals to destroy >100,000 ozone molecules."},
    historical: "Mario Molina and F. Sherwood Rowland's 1974 discovery of stratospheric CFC photolysis and radical catalytic cycling",
    cer2: {"prompt":"Predict the atmospheric impact of a proposed supersonic high-altitude commercial transport fleet emitting nitrogen oxides directly into the stratosphere.","claim":"High-altitude NOx emissions accelerate stratospheric ozone destruction.","ev":"Nitric oxide reacts via NO + O₃ → NO₂ + O₂ and NO₂ + O → NO + O₂.","reas":"The NOx cycle parallels the halogen cycle, forming a catalytic loop that depletes total column ozone without being consumed."},
    terminology: {"term":"Density","def":"An intensive physical property representing the ratio of resting mass to volume"},
    everyday: {"phenomenon":"Hot air balloon buoyancy","explanation":"Heating air inside the envelope expands its volume, decreasing its density below ambient air"},
    lessons: {
      1: {
        system: "Stratospheric Ozone Depletion & CFC Photochemistry",
        mechanism: "UV-C photolysis dissociating chlorofluorocarbons to release chlorine free radicals that catalytically destroy ozone molecules",
        terminology: {"term":"Ozone Layer","def":"A protective atmospheric layer in the stratosphere that absorbs over 98% of harmful high-energy solar ultraviolet radiation"},
        calc1: { formula: "\\rho = \\frac{m}{V}", label: "ozone density", unit: "\\text{g/cm}^3", solve: (m, v) => (m / v).toFixed(2) },
        everyday: {"phenomenon":"Sunburn and UV index warnings","explanation":"Seasonal thinning of the stratospheric ozone layer permits higher levels of UV-B radiation to reach the surface, damaging epidermal DNA"},
        misconception: "The ozone hole is a physical vacuum hole in space, rather than a localized drop in total column ozone concentration below 220 Dobson Units"
      },
      2: {
        system: "Matter Classification: Mass, Weight & Macroscopic-Microscopic Scales",
        mechanism: "Relating macroscopic physical matter observations to submicroscopic atomic arrangements and gravitational force variations",
        terminology: {"term":"Weight","def":"A measure of the gravitational force exerted on an object's mass by a planetary body"},
        calc1: { formula: "W = m \\times g", label: "gravitational weight", unit: "\\text{N}", solve: (m, g) => (m * g).toFixed(1) },
        everyday: {"phenomenon":"Weighing less on the Moon while retaining identical body mass","explanation":"The Moon's gravitational field is one-sixth of Earth's, reducing downward weight force without altering atomic quantity"},
        misconception: "Mass and weight are interchangeable scientific terms, ignoring that mass is invariant while weight depends on local gravity"
      },
      3: {
        system: "Scientific Methods: Controlled Variables, Hypotheses & Experimental Design",
        mechanism: "Isolating independent variables to measure dependent responses while maintaining strict control constants to eliminate confounding bias",
        terminology: {"term":"Hypothesis","def":"A tentative, testable explanation for an observed scientific phenomenon that can be supported or refuted by empirical data"},
        calc1: { formula: "\\% \\text{ Error} = \\frac{|\\text{Exp} - \\text{Acc}|}{\\text{Acc}} \\times 100\\%", label: "percent error", unit: "\\%", solve: (exp, acc) => (Math.abs(exp - acc) / acc * 100).toFixed(2) },
        everyday: {"phenomenon":"Testing different plant fertilizers under identical sunlight and water","explanation":"Controlling environmental variables ensures observed differences in growth stem solely from nutrient differences"},
        misconception: "A scientific theory becomes a law once proven, rather than theories explaining mechanisms and laws describing observational relationships"
      },
      4: {
        system: "Scientific Research: Pure vs Applied Science & Laboratory Safety Protocols",
        mechanism: "Applying knowledge gained from curiosity-driven pure research to solve targeted societal problems under rigorous safety constraints",
        terminology: {"term":"Applied Research","def":"Scientific research conducted to solve a specific practical problem or develop targeted technological applications"},
        calc1: { formula: "\\text{Recovery \\%} = \\frac{m_{\\text{recovered}}}{m_{\\text{initial}}} \\times 100\\%", label: "chemical recovery yield", unit: "\\%", solve: (r, i) => (r / i * 100).toFixed(1) },
        everyday: {"phenomenon":"Development of non-ozone-depleting HFO refrigerants","explanation":"Applied industrial research synthesized hydrofluoroolefins to replace ozone-destroying CFCs while preserving cooling performance"},
        misconception: "Pure research without immediate commercial applications is useless, ignoring that foundational discoveries enable unforeseen technologies"
      },
    }
  },
  2: {
    system: "Matter Properties, Phase Thermodynamics & Mass Conservation",
    mechanism: "Overcoming intermolecular van der Waals forces and hydrogen bonding during endothermic phase transitions without breaking intramolecular covalent bonds",
    calc1: { formula: "q = mc\\Delta T", label: "sensible heat", unit: "J", solve: (m, c, dt) => (m * c * dt).toFixed(1) },
    calc2: { formula: "q = m\\Delta H_{\\text{fus}}", label: "latent heat of fusion", unit: "kJ", solve: (m, dh) => (m * dh).toFixed(1) },
    graph: "Heating curve with distinct horizontal plateaus at melting (Tm) and boiling (Tb) points",
    experiment: {"iv":"Identity of solid substance (different specific heat capacities)","dv":"Rate of temperature increase (°C/min) under constant heat input","controls":"Mass of sample, hot plate thermal output, insulated calorimeter"},
    misconception: "Temperature continues to rise during phase change melting or boiling, rather than remaining constant during latent heat absorption",
    application: "Fractional distillation columns in petrochemical refineries separating crude hydrocarbon fractions by boiling points",
    perturbation: "Lowering ambient pressure inside a vacuum chamber causing liquid water to boil at room temperature (22°C)",
    comparison: "Intensive physical properties (density, boiling point) invariant to sample size versus extensive properties (mass, volume) directly proportional to amount",
    errorAnalysis: "Thermal heat loss to uninsulated calorimeter walls causing an underestimate of experimental enthalpy of fusion",
    boundary: "The critical point on a phase diagram beyond which distinct liquid and gas phases coalesce into a supercritical fluid",
    cer1: {"prompt":"A student seals 10.0 g of calcium carbonate in a closed flask and heats it until decomposition into calcium oxide and carbon dioxide gas. Evaluate whether mass is conserved.","claim":"Total system mass remains exactly 10.0 g, satisfying the Law of Conservation of Mass.","ev":"Digital balance reads 10.00 g before heating and 10.00 g after complete decomposition in the sealed vessel.","reas":"In a closed thermodynamic system, atomic nuclei cannot escape; chemical bonds rearrange but all atoms remain accounted for."},
    historical: "Antoine Lavoisier's 1789 rigorous closed-vessel combustion experiments establishing mass conservation",
    cer2: {"prompt":"Analyze the separation of an unknown mixture containing iron filings, sand, sodium chloride, and water.","claim":"A sequential physical separation using magnetic separation, filtration, and crystallization isolates all four components.","ev":"Iron is ferromagnetic, sand is insoluble, and NaCl has high water solubility with non-volatile boiling point.","reas":"Physical separation exploits intrinsic differences in intensive physical properties without altering chemical identities."},
    terminology: {"term":"Intensive Property","def":"A bulk physical property that does not depend on the system size or amount of material"},
    everyday: {"phenomenon":"Ice cubes floating in liquid water","explanation":"Water's open hexagonal crystal lattice expands upon freezing, making solid ice less dense than liquid water"},
    lessons: {
      1: {
        system: "States of Matter & Physical vs Chemical Properties",
        mechanism: "Differences in thermal kinetic energy and intermolecular attraction governing solid lattice rigidity, liquid fluidity, and gas expansion",
        terminology: {"term":"Intensive Property","def":"A physical property that remains invariant regardless of the amount of substance present, such as density or melting point"},
        calc1: { formula: "\\rho = \\frac{m}{V}", label: "substance density", unit: "\\text{g/cm}^3", solve: (m, v) => (m / v).toFixed(2) },
        everyday: {"phenomenon":"Ice cubes floating in drinking water","explanation":"Water molecules form an open hexagonal hydrogen-bonded crystal lattice upon freezing, making solid ice less dense than liquid water"},
        misconception: "Heavy objects always sink in water, confusing total extensive mass with intrinsic intensive density"
      },
      2: {
        system: "Physical and Chemical Changes & The Law of Conservation of Mass",
        mechanism: "Rearrangement of chemical bonds without creating or destroying atomic nuclei, preserving total system mass in closed systems",
        terminology: {"term":"Conservation of Mass","def":"The fundamental law stating that mass is neither created nor destroyed during a chemical reaction but is conserved"},
        calc1: { formula: "m_{\\text{reactants}} = m_{\\text{products}}", label: "conserved product mass", unit: "\\text{g}", solve: (r) => String(r) },
        everyday: {"phenomenon":"Iron rusting inside a sealed jar","explanation":"Iron reacts with trapped oxygen to form iron oxide; the total mass of the sealed system remains strictly constant"},
        misconception: "Burning wood destroys mass because ashes weigh less, neglecting that mass escapes into the atmosphere as gaseous carbon dioxide and water vapor"
      },
      3: {
        system: "Mixtures of Matter: Heterogeneous vs Homogeneous & Separation Techniques",
        mechanism: "Exploiting differences in physical properties (boiling point, solubility, particle size, magnetism) to separate physical mixtures without breaking bonds",
        terminology: {"term":"Homogeneous Mixture","def":"A mixture that has a uniform composition throughout and always has a single phase, also known as a solution"},
        calc1: { formula: "\\text{Mass \\%} = \\frac{m_{\\text{solute}}}{m_{\\text{solution}}} \\times 100\\%", label: "solute mass percentage", unit: "\\%", solve: (s, tot) => (s / tot * 100).toFixed(1) },
        everyday: {"phenomenon":"Brewing coffee with a paper filter","explanation":"Hot water dissolves soluble flavor compounds into a homogeneous solution while the porous filter retains insoluble cellulose coffee grounds"},
        misconception: "Dissolving salt in water is a chemical reaction because the solid vanishes, rather than a reversible physical dissolution"
      },
      4: {
        system: "Elements, Compounds & The Laws of Definite and Multiple Proportions",
        mechanism: "Atoms combining in fixed whole-number stoichiometric ratios by mass to form unique chemical compound structures",
        terminology: {"term":"Law of Definite Proportions","def":"A law stating that a given chemical compound always contains its component elements in fixed ratio by mass"},
        calc1: { formula: "\\% \\text{ by Mass} = \\frac{m_{\\text{element}}}{m_{\\text{compound}}} \\times 100\\%", label: "element mass percentage", unit: "\\%", solve: (e, c) => (e / c * 100).toFixed(1) },
        everyday: {"phenomenon":"Pure water always containing 11.2% hydrogen and 88.8% oxygen by mass","explanation":"Regardless of whether harvested from rain, glaciers, or municipal taps, pure water H2O adheres strictly to constant stoichiometric proportions"},
        misconception: "Compounds possess properties that are averages of their constituent elements, ignoring that chemical bonding generates entirely novel physical traits"
      },
    }
  },
  3: {
    system: "Atomic Structure, Subatomic Particles & Isotopes",
    mechanism: "Electrostatic Coulombic attraction between dense positively charged nuclear protons and orbiting electrons mediated by strong nuclear gluon exchange",
    calc1: { formula: "A = Z + N", label: "mass number", unit: "", solve: (z, n) => String(z + n) },
    calc2: { formula: "\\bar{m} = \\sum (f_i \\times m_i)", label: "weighted average atomic mass", unit: "amu", solve: (m1, f1, m2, f2) => (m1 * f1 + m2 * f2).toFixed(3) },
    graph: "Mass spectrometry isotopic abundance spectrum displaying discrete m/z peaks",
    experiment: {"iv":"Electric field strength (V/m) across deflection plates in a mass spectrometer","dv":"Deflection radius of ionized isotope beams","controls":"Ion charge state (+1), magnetic field strength B, accelerating voltage"},
    misconception: "Atoms of the same element must possess identical masses, overlooking the existence of isotopes differing in neutron count",
    application: "Carbon-14 radiometric dating of organic archaeological artifacts based on half-life decay to nitrogen-14",
    perturbation: "Adding neutrons to a stable nucleus until the N/Z ratio crosses the band of stability into beta-decay territory",
    comparison: "Mass number A (integer count of nucleons) versus atomic weight (fractional weighted average of natural isotopic abundances)",
    errorAnalysis: "Incomplete ionization in mass spectrometer ion source causing underrepresentation of higher-mass isotope abundance peaks",
    boundary: "Nuclear binding energy per nucleon peak at Iron-56 (Fe-56), beyond which fusion becomes endothermic",
    cer1: {"prompt":"Evaluate Rutherford's conclusion that the atom consists primarily of empty space with a dense positive nucleus.","claim":"The atom is mostly empty space with a concentrated positive nucleus.","ev":"Over 99.9% of alpha particles passed straight through the gold foil, but approximately 1 in 8,000 deflected backward at angles >90°.","reas":"Only a tiny, extremely dense, positively charged nucleus could exert sufficient Coulombic repulsion to reverse the trajectory of high-energy alpha particles."},
    historical: "J.J. Thomson's 1897 cathode ray tube experiment determining the electron charge-to-mass ratio e/m",
    cer2: {"prompt":"Construct an argument for why chlorine's relative atomic mass is 35.45 amu rather than an integer.","claim":"Chlorine consists of a natural mixture of Cl-35 (approx 75.8%) and Cl-37 (approx 24.2%).","ev":"Mass spectrometry shows abundance peaks at 34.97 amu and 36.97 amu in approximately a 3:1 ratio.","reas":"Relative atomic mass is the weighted mathematical mean: (0.758 × 34.97) + (0.242 × 36.97) = 35.45 amu."},
    terminology: {"term":"Isotope","def":"Atoms of the same element having identical atomic numbers (protons) but different mass numbers (neutrons)"},
    everyday: {"phenomenon":"Smoke detector ionization","explanation":"Americium-241 alpha emissions ionize air molecules; smoke particles enter and disrupt the ionic current"},
    lessons: {
      1: {
        system: "Early Atomic Models: From Democritus Atomism to Dalton's Atomic Theory",
        mechanism: "Conceptual transition from philosophical indivisible atoms to testable scientific postulates explaining mass conservation in chemical synthesis",
        terminology: {"term":"Dalton's Atomic Theory","def":"A scientific theory proposing that all matter is composed of extremely small indivisible particles called atoms that combine in whole-number ratios"},
        calc1: { formula: "\\text{Ratio} = \\frac{m_{O1}}{m_{O2}}", label: "multiple proportions ratio", unit: "", solve: (m1, m2) => (m1 / m2).toFixed(0) },
        everyday: {"phenomenon":"Carbon forming both CO and CO2 gases","explanation":"Carbon combines with oxygen in simple whole-number ratios of 1:1 and 1:2 by atom count, validating the Law of Multiple Proportions"},
        misconception: "Atoms are completely indivisible solid spheres, failing to recognize internal subatomic structure discovered later"
      },
      2: {
        system: "Subatomic Particle Discovery: Cathode Rays, Electrons & Rutherford's Nucleus",
        mechanism: "Electrostatic deflection of cathode rays discovering negative electrons and alpha particle backscattering revealing a dense positive atomic nucleus",
        terminology: {"term":"Nucleus","def":"The extremely tiny, dense, positively charged center of an atom containing protons and neutrons that accounts for almost all atomic mass"},
        calc1: { formula: "r_{\\text{atom}} \\approx 10^5 \\times r_{\\text{nucleus}}", label: "atomic-to-nuclear radius ratio", unit: "", solve: () => "100000" },
        everyday: {"phenomenon":"Alpha particles ricocheting off gold foil in Rutherford's experiment","explanation":"A tiny fraction of positive alpha projectiles collide with concentrated nuclear positive charge, bouncing straight backward"},
        misconception: "Mass and positive charge are evenly dispersed throughout the entire atomic volume like Thomson's plum pudding model"
      },
      3: {
        system: "Isotopes, Mass Numbers & Relative Atomic Mass Metrology",
        mechanism: "Varying neutron numbers in atomic nuclei yielding distinct isotopic masses separated by magnetic deflection in mass spectrometry",
        terminology: {"term":"Isotope","def":"Atoms of the same element that have the same number of protons but different numbers of neutrons and therefore different mass numbers"},
        calc1: { formula: "\\bar{m} = \\sum (f_i \\times m_i)", label: "weighted average atomic mass", unit: "\\text{amu}", solve: (m1, f1, m2, f2) => (m1 * f1 + m2 * f2).toFixed(3) },
        everyday: {"phenomenon":"Chlorine's non-integer atomic mass of 35.45 amu on the periodic table","explanation":"Naturally occurring chlorine is a 76:24 mixture of Chlorine-35 and Chlorine-37 isotopes, producing a weighted non-integer average"},
        misconception: "Atoms of a given chemical element are all physically identical in mass, overlooking the existence of isotopes"
      },
      4: {
        system: "Nuclear Instability, Radioactive Emissions & Spontaneous Decay",
        mechanism: "Strong nuclear force unable to overcome proton-proton Coulombic repulsion, emitting alpha, beta, or gamma radiation to reach nuclear stability",
        terminology: {"term":"Alpha Particle","def":"A positively charged nuclear particle emitted during radioactive decay consisting of two protons and two neutrons (a Helium-4 nucleus)"},
        calc1: { formula: "A = Z + N", label: "nuclear mass number", unit: "", solve: (z, n) => String(z + n) },
        everyday: {"phenomenon":"Household smoke detectors utilizing Americium-241","explanation":"Alpha emissions from tiny Americium samples ionize air in a sensor chamber; smoke particles disrupt the ion current, triggering the alarm"},
        misconception: "Radioactivity is exclusively an artificial human invention, ignoring widespread natural cosmic and terrestrial background radiation"
      },
    }
  },
  4: {
    system: "Electronic Quantum States & Spectroscopy",
    mechanism: "Quantized electronic excitation to higher principal quantum shells followed by radiative de-excitation emitting discrete photon energies E = hf = hc/λ",
    calc1: { formula: "E = h\\nu = \\frac{hc}{\\lambda}", label: "photon energy", unit: "J", solve: (freq) => (6.626e-34 * freq).toExponential(3) },
    calc2: { formula: "c = \\lambda \\nu", label: "wavelength", unit: "m", solve: (freq) => (3.0e8 / freq).toExponential(3) },
    graph: "Discrete atomic emission line spectrum (Balmer series) versus continuous blackbody radiation curve",
    experiment: {"iv":"Element sample energized in flame test (Li, Na, K, Cu, Sr)","dv":"Wavelength and color of emitted spectral emission lines","controls":"Spectrometer slit width, optical grating line density, burner flame temperature"},
    misconception: "Electrons orbit the nucleus in planar circular planetary rings, rather than probabilistic three-dimensional quantum orbital clouds",
    application: "Semiconductor laser diodes in fiber-optic telecommunications tuned to exact bandgap photon emissions (1550 nm)",
    perturbation: "Increasing incident photon frequency beyond metal work function in photoelectric effect to observe instantaneous electron emission",
    comparison: "Ground state (lowest thermodynamic energy configuration) versus excited state (temporary higher orbital occupancy)",
    errorAnalysis: "Ambient room lighting contamination shifting baseline spectral calibration in prism spectrometers",
    boundary: "Ionization limit (n = ∞) where electron binding energy reaches 0 eV and the electron escapes as a free particle",
    cer1: {"prompt":"Explain why hydrogen gas emits discrete spectral lines rather than a continuous rainbow spectrum.","claim":"Hydrogen emits discrete lines because electronic energy levels in atoms are quantized.","ev":"Hydrogen emission displays distinct lines at 410 nm, 434 nm, 486 nm, and 656 nm with dark regions between.","reas":"Electrons cannot occupy intermediate energy states; photon emission equals the exact quantum difference ΔE = E_final - E_initial = hc/λ."},
    historical: "Max Planck's 1900 quantum hypothesis resolving the ultraviolet catastrophe in blackbody radiation",
    cer2: {"prompt":"Predict the ground-state electron configuration of transition metal Chromium (Z = 24) and justify anomalies.","claim":"Chromium adopts [Ar] 4s¹ 3d⁵ rather than [Ar] 4s² 3d⁴.","ev":"Spectroscopic magnetic measurements demonstrate six unpaired electrons in ground-state neutral chromium.","reas":"A half-filled d-subshell (3d⁵) minimizes electron-electron repulsion and maximizes exchange stabilization energy, compensating for promoting a 4s electron."},
    terminology: {"term":"Photon","def":"A discrete quantum packet of electromagnetic radiation carrying energy proportional to wave frequency"},
    everyday: {"phenomenon":"Neon signage glow","explanation":"High electric voltage excites neon gas valence electrons; downward relaxation emits characteristic red-orange photons"},
    lessons: {
      1: {
        system: "Light, Electromagnetic Waves & Photon Energy Quantization",
        mechanism: "Electromagnetic radiation propagating at speed c where energy is quantized into discrete packets E = hν proportional to wave frequency",
        terminology: {"term":"Photon","def":"A quantum or discrete bundle of electromagnetic energy that possesses both wave and particle characteristics"},
        calc1: { formula: "E = h\\nu = \\frac{hc}{\\lambda}", label: "photon energy", unit: "\\text{J}", solve: (freq) => (6.626e-34 * freq).toExponential(3) },
        everyday: {"phenomenon":"Neon signs glowing vibrant orange-red when energized","explanation":"Electrons excited by high voltage drop back to lower energy levels, emitting photons at discrete visible frequencies"},
        misconception: "Light behaves exclusively as continuous classical waves, failing to explain the threshold frequency cutoff in the photoelectric effect"
      },
      2: {
        system: "Bohr Hydrogen Model, De Broglie Matter Waves & Orbital Wave Mechanics",
        mechanism: "Stationary electronic standing waves around nuclei with quantized angular momentum and spatial orbital probability clouds",
        terminology: {"term":"Atomic Orbital","def":"A three-dimensional mathematical region around the nucleus that describes the probable location of an electron with 90% likelihood"},
        calc1: { formula: "\\lambda = \\frac{h}{mv}", label: "de Broglie wavelength", unit: "\\text{m}", solve: (m, v) => (6.626e-34 / (m * v)).toExponential(3) },
        everyday: {"phenomenon":"Electron microscopes resolving nanometer-scale viral structures","explanation":"High-speed electrons possess tiny de Broglie wavelengths orders of magnitude smaller than visible light, bypassing optical diffraction limits"},
        misconception: "Electrons orbit the nucleus in precise circular planetary tracks like planets orbiting the Sun"
      },
      3: {
        system: "Quantum Numbers, Pauli Exclusion, Aufbau Principle & Electron Configurations",
        mechanism: "Valence shell filling adhering to lowest energy orbitals, spin pairing restrictions, and Hund's rule orbital degeneracy",
        terminology: {"term":"Aufbau Principle","def":"A quantum rule stating that each electron occupies the lowest energy orbital available before filling higher energy states"},
        calc1: { formula: "N_{\\max} = 2n^2", label: "maximum principal shell electrons", unit: "", solve: (n) => String(2 * n * n) },
        everyday: {"phenomenon":"Paramagnetic attraction of liquid oxygen to strong magnets","explanation":"Unpaired valence electrons in oxygen's degenerate 2p orbitals create permanent microscopic magnetic dipole moments"},
        misconception: "Electrons pair up in degenerate p orbitals before each orbital receives a single electron with parallel spin"
      },
    }
  },
  5: {
    system: "Periodic Trends & Electronic Periodicity",
    mechanism: "Increase in effective nuclear charge Zeff across a period versus valence shell principal quantum number n and core shielding down a group",
    calc1: { formula: "Z_{\\text{eff}} = Z - S", label: "effective nuclear charge", unit: "", solve: (z, s) => String(z - s) },
    calc2: { formula: "\\text{Ionic Radius Ratio} = \\frac{r_{\\text{cation}}}{r_{\\text{anion}}}", label: "radius ratio", unit: "", solve: (rc, ra) => (rc / ra).toFixed(2) },
    graph: "Periodic trend zigzag graphs of first ionization energy and atomic radius across atomic numbers 1 to 36",
    experiment: {"iv":"Position of alkali metal in Group 1 (Li, Na, K)","dv":"Exothermic reaction rate with water and volume of H2 gas evolved per second","controls":"Sample molar amount, water temperature, atmospheric pressure"},
    misconception: "Ionization energy decreases across a period because atoms have more electrons, ignoring the dominant rise in effective nuclear charge",
    application: "Synthesis of gallium nitride (GaN) high-efficiency power semiconductors based on periodic group 13–15 valence configurations",
    perturbation: "Ionizing an atom past its valence shell (e.g. second ionization energy of Na), causing a 10-fold jump in required energy",
    comparison: "Atomic radius (size of neutral atom) versus ionic radius (cations shrink due to loss of shell, anions expand due to repulsion)",
    errorAnalysis: "Oxide surface passivation on alkali metal samples slowing empirical reaction rates during periodic trend testing",
    boundary: "Inert pair effect in heavy p-block elements (Tl, Pb, Bi) where relativistic 6s electron stabilization favors lower oxidation states",
    cer1: {"prompt":"Justify why fluorine has a higher electronegativity than chlorine despite chlorine having higher electron affinity.","claim":"Fluorine has higher electronegativity because its tiny 2p orbital exerts stronger Coulombic attraction on shared bonding electrons.","ev":"Pauling electronegativity of F is 3.98 vs Cl at 3.16, but F electron affinity (-328 kJ/mol) is slightly less than Cl (-349 kJ/mol).","reas":"In free fluoride, intense electron-electron repulsion in the compact 2p shell destabilizes incoming electrons, but in covalent bonds, F's high Zeff dominates bonding pairs."},
    historical: "Dmitri Mendeleev's 1869 periodic table organizing elements by atomic mass and predicting undiscovered elements (Ga, Ge, Sc)",
    cer2: {"prompt":"Explain the unexpected dip in first ionization energy between Group 2 (Be, Mg) and Group 13 (B, Al).","claim":"Group 13 elements have lower ionization energies because removing an electron involves a higher-energy p-orbital.","ev":"Boron IE1 is 801 kJ/mol, lower than Beryllium IE1 at 899 kJ/mol.","reas":"Boron's 2p electron is shielded by the 2s² subshell and occupies a higher quantum energy sublevel, requiring less energy to ionize."},
    terminology: {"term":"Electronegativity","def":"The relative measure of an atom's ability to attract shared electrons in a chemical bond"},
    everyday: {"phenomenon":"Lithium battery voltage","explanation":"Lithium's position at the top of Group 1 provides the lowest ionization energy and standard reduction potential, maximizing cell voltage"},
    lessons: {
      1: {
        system: "Periodic Law & Historical Organization by Atomic Number",
        mechanism: "Repetition of chemical and physical properties when elements are arranged in order of increasing atomic number Z",
        terminology: {"term":"Periodic Law","def":"The statement that there is a periodic repetition of chemical and physical properties of the elements when arranged by increasing atomic number"},
        calc1: { formula: "Z = N_{\\text{protons}}", label: "atomic number ordering", unit: "", solve: (p) => String(p) },
        everyday: {"phenomenon":"Mendeleev predicting gallium and germanium properties before discovery","explanation":"Periodic trends left predictable gaps where undiscovered elements fit smoothly between aluminum and silicon"},
        misconception: "Mendeleev's periodic table was organized by atomic number rather than atomic mass, which caused anomalous inversions like tellurium and iodine"
      },
      2: {
        system: "Elemental Classification: Representative Elements, Transition Metals & Blocks",
        mechanism: "Valence electron sublevel placement determining elemental placement into s, p, d, and f quantum blocks",
        terminology: {"term":"Valence Electrons","def":"The electrons in the outermost principal energy level of an atom that determine its chemical reactivity and bonding capacity"},
        calc1: { formula: "N_{\\text{valence}} = \\text{Group Number} \\pmod{10}", label: "representative valence count", unit: "", solve: (g) => String(g > 10 ? g - 10 : g) },
        everyday: {"phenomenon":"Sodium metal reacting violently with water to form basic solutions","explanation":"Group 1 alkali metals possess a single, loosely bound valence s-electron that is readily lost to achieve noble gas stability"},
        misconception: "All metals are solid at room temperature, overlooking liquid mercury which possesses stable relativistic closed electron shells"
      },
      3: {
        system: "Periodic Trends: Atomic Radius, Ionization Energy & Electronegativity",
        mechanism: "Increasing effective nuclear charge Zeff across periods contracting electron clouds coupled to increased shielding down groups",
        terminology: {"term":"First Ionization Energy","def":"The energy required to remove the outermost electron from one mole of gaseous neutral atoms in their ground state"},
        calc1: { formula: "Z_{\\text{eff}} = Z - S", label: "effective nuclear charge", unit: "", solve: (z, s) => String(z - s) },
        everyday: {"phenomenon":"Cesium igniting spontaneously in air while helium is inert","explanation":"Cesium's outer electron is far from the nucleus with minimal ionization energy, while helium possesses maximum Zeff and closed-shell stability"},
        misconception: "Atomic radius increases from left to right across a period because atoms have more protons and electrons, ignoring stronger nuclear contraction"
      },
    }
  },
  6: {
    system: "Ionic Crystal Lattices & Metallic Bonding",
    mechanism: "Three-dimensional electrostatic lattice energy minimization governed by Coulomb's Law F = k(q1 q2)/r² and the delocalized 'sea of electrons' in metallic crystals",
    calc1: { formula: "E_{\\text{lattice}} \\propto \\frac{q_1 q_2}{r_0}", label: "lattice energy estimate", unit: "kJ/mol", solve: (q1, q2, r) => (Math.abs(q1 * q2) / r * 1000).toFixed(0) },
    calc2: { formula: "\\% \\text{ Composition} = \\frac{\\text{mass of ion}}{\\text{formula mass}} \\times 100\\%", label: "percent composition", unit: "\\%", solve: (mIon, mTotal) => (mIon / mTotal * 100).toFixed(2) },
    graph: "Born-Haber thermodynamic cycle enthalpy diagram for ionic compound formation",
    experiment: {"iv":"Solid ionic salt versus aqueous/molten ionic solution","dv":"Electrical conductivity (millisiemens) in an electrolytic test circuit","controls":"Electrode surface area, applied potential (V), solution temperature"},
    misconception: "Solid NaCl contains discrete NaCl molecules, rather than a continuous 1:1 cubic crystal lattice of Na+ and Cl- ions",
    application: "High-strength lightweight aerospace aluminum-lithium interstitial and substitutional alloys",
    perturbation: "Applying mechanical shear force to an ionic crystal, aligning like-sign ions and causing catastrophic brittle cleavage",
    comparison: "Substitutional alloys (similar radius atoms like brass Cu-Zn) versus interstitial alloys (small atoms filling lattice voids like steel Fe-C)",
    errorAnalysis: "Incomplete drying of hygroscopic ionic salt crystals leading to inaccurate formula weight determination",
    boundary: "Transition from ionic to covalent character as electronegativity difference ΔEN drops below 1.7 (Fajans' rules)",
    cer1: {"prompt":"Explain why magnesium oxide (MgO, lattice energy 3791 kJ/mol) has a far higher melting point than sodium chloride (NaCl, 786 kJ/mol).","claim":"MgO has a much higher melting point due to higher ionic charge magnitudes quadrupling Coulombic lattice attraction.","ev":"Mg has +2 and O has -2 charges (q1·q2 = 4), whereas Na is +1 and Cl is -1 (q1·q2 = 1). Melting point of MgO is 2852°C vs NaCl at 801°C.","reas":"By Coulomb's law, lattice energy is directly proportional to the product of ionic charges (|q1·q2|). A 4-fold increase in charge product generates immense electrostatic bonding."},
    historical: "Max Born and Fritz Haber's 1919 thermodynamic cycle calculating non-measurable ionic lattice energies",
    cer2: {"prompt":"Justify why metals are malleable and ductile while ionic crystals are brittle and shatter under stress.","claim":"Metals deform without breaking because non-directional metallic bonding allows electron clouds to flow, whereas ionic shear forces align repulsive charges.","ev":"Hammering copper sheets flattens them, while hammering rock salt shatters it into powder.","reas":"In metals, delocalized electrons cushion shifted cation planes. In ionic crystals, shifting cation planes forces cations adjacent to cations, causing violent Coulombic repulsion."},
    terminology: {"term":"Lattice Energy","def":"The energy required to completely separate one mole of a solid ionic compound into gaseous ions"},
    everyday: {"phenomenon":"Table salt brittleness","explanation":"Striking a salt crystal shifts ion layers; like charges (+ with +) align and repel violently, causing cleavage"},
    lessons: {
      1: {
        system: "Ion Formation: Valence Electrons, Octet Rule & Cation/Anion Stability",
        mechanism: "Atoms losing or gaining valence electrons to achieve stable, low-energy noble gas electron configurations",
        terminology: {"term":"Octet Rule","def":"The chemical principle that atoms tend to gain, lose, or share electrons in order to acquire a full set of eight valence electrons"},
        calc1: { formula: "q_{\\text{ion}} = Z - N_{\\text{electrons}}", label: "net ionic charge", unit: "e", solve: (z, e) => String(z - e) },
        everyday: {"phenomenon":"Calcium supplements containing Ca2+ ions rather than reactive elemental calcium metal","explanation":"Calcium atoms readily lose two valence electrons to form stable, non-reactive Ca2+ cations isoelectronic with argon"},
        misconception: "Transition metals always form ions with an inert noble gas configuration, rather than forming pseudo-noble gas configs with filled d-subshells"
      },
      2: {
        system: "Ionic Bonds: Electrostatic Attraction & Crystal Lattice Thermodynamics",
        mechanism: "Coulombic forces between alternating positive cations and negative anions organizing into 3D crystal lattices with high lattice energy",
        terminology: {"term":"Lattice Energy","def":"The energy required to completely separate one mole of the ions of an ionic compound in a crystal lattice into gaseous ions"},
        calc1: { formula: "E_{\\text{lattice}} \\propto \\frac{q_1 q_2}{r_0}", label: "lattice energy estimate", unit: "\\text{kJ/mol}", solve: (q1, q2, r) => (Math.abs(q1 * q2) / r * 1000).toFixed(0) },
        everyday: {"phenomenon":"Extremely high melting point of table salt (801°C)","explanation":"Separating Na+ and Cl- ions requires overcoming massive electrostatic Coulombic attraction across the entire 3D crystal lattice"},
        misconception: "Solid sodium chloride contains discrete NaCl molecules held by covalent bonds, rather than an infinite repeating cubic lattice"
      },
      3: {
        system: "Formulas and Nomenclature of Binary & Polyatomic Ionic Compounds",
        mechanism: "Combining cation and anion charges to achieve net electrical neutrality represented by empirical formula units",
        terminology: {"term":"Formula Unit","def":"The simplest chemical ratio of ions represented in an ionic compound that maintains electrical neutrality"},
        calc1: { formula: "\\sum q_{\\text{ions}} = 0", label: "net neutral ionic charge", unit: "", solve: () => "0" },
        everyday: {"phenomenon":"Baking soda labeled as sodium bicarbonate NaHCO3","explanation":"Monovalent sodium cations (Na+) combine in a 1:1 ratio with polyatomic bicarbonate anions (HCO3-) to produce a neutral formula unit"},
        misconception: "Subscripts in ionic formulas indicate discrete molecular groupings rather than the simplest empirical whole-number ratio of ions"
      },
      4: {
        system: "Metallic Bonding: The Electron Sea Model, Malleability & Interstitial Alloys",
        mechanism: "Delocalized valence electrons drifting freely through a rigid lattice of fixed metallic cations, shielding compressive shear forces",
        terminology: {"term":"Metallic Bond","def":"The chemical attraction of a metallic cation for delocalized electrons throughout a metallic crystal lattice"},
        calc1: { formula: "\\% \\text{ Alloy} = \\frac{m_{\\text{solute}}}{m_{\\text{total}}} \\times 100\\%", label: "alloy mass percentage", unit: "\\%", solve: (s, tot) => (s / tot * 100).toFixed(1) },
        everyday: {"phenomenon":"Copper electrical wiring bending easily without shattering","explanation":"Non-directional delocalized electron clouds flow smoothly around shifted copper cations, preserving metallic cohesion without brittle cleavage"},
        misconception: "Metals break or shatter when struck because cations repel like ionic crystals, failing to recognize electron sea cushioning"
      },
    }
  },
  7: {
    system: "Covalent Bonding & VSEPR Molecular Architecture",
    mechanism: "Orbital overlap sharing valence electron pairs to achieve stable noble gas octets, with geometry minimizing valence shell electron pair repulsions",
    calc1: { formula: "\\Delta \\text{EN} = |\\chi_A - \\chi_B|", label: "electronegativity difference", unit: "", solve: (a, b) => Math.abs(a - b).toFixed(2) },
    calc2: { formula: "\\text{Formal Charge} = V - N - \\frac{B}{2}", label: "formal charge", unit: "", solve: (v, n, b) => String(v - n - b / 2) },
    graph: "Morse potential energy curve showing bond dissociation energy De at optimal equilibrium bond distance r0",
    experiment: {"iv":"Number of shared electron pairs (single C-C, double C=C, triple C≡C)","dv":"Bond dissociation energy (kJ/mol) and bond length (pm)","controls":"Atomic identity of bonded nuclei"},
    misconception: "Molecules with polar covalent bonds must always be polar overall, overlooking symmetrical dipole moment cancellation (e.g. CO2, CCl4)",
    application: "Teflon (polytetrafluoroethylene) chemical inertness and non-stick coating derived from ultra-strong C-F covalent bonds",
    perturbation: "Introducing an external electric field to orient polar dipole molecules (such as water vapor) along field gradient vectors",
    comparison: "Sigma (σ) bonds (direct head-on axial orbital overlap) versus pi (π) bonds (lateral parallel p-orbital overlap above and below internuclear axis)",
    errorAnalysis: "Neglecting lone pair - lone pair repulsive distortion when calculating ideal VSEPR bond angles (e.g. 104.5° in H2O vs 109.5° tetrahedral)",
    boundary: "Expanded valence octets in period 3+ nonmetals (e.g. SF6, PCl5) utilizing accessible d-orbitals versus strict octet adherence in period 2 (C, N, O, F)",
    cer1: {"prompt":"Determine whether boron trifluoride (BF3) or nitrogen trifluoride (NF3) possesses a net molecular dipole moment.","claim":"NF3 is a polar molecule with a net dipole, whereas BF3 is completely nonpolar.","ev":"BF3 has trigonal planar geometry (120°) with zero net dipole, while NF3 has trigonal pyramidal geometry (102°) with a lone pair.","reas":"In BF3, three identical B-F dipoles symmetrically cancel vectorially to zero. In NF3, the asymmetric lone pair creates a persistent permanent dipole."},
    historical: "Gilbert N. Lewis's 1916 electron pair sharing theory and Linus Pauling's 1931 orbital hybridization model",
    cer2: {"prompt":"Explain why carbon dioxide (CO2) is a gas at room temperature while silicon dioxide (SiO2) is a quartz solid melting above 1700°C.","claim":"CO2 consists of discrete small molecules with weak London dispersion forces, whereas SiO2 forms a continuous covalent network lattice.","ev":"CO2 sublimes at -78.5°C, while SiO2 requires breaking millions of strong covalent Si-O single bonds to melt.","reas":"Carbon forms stable double bonds (O=C=O) due to effective 2p-2p π-overlap, while larger silicon cannot form effective π-bonds and instead forms a 3D network."},
    terminology: {"term":"VSEPR Theory","def":"Valence Shell Electron Pair Repulsion model predicting 3D geometry based on electrostatic minimization"},
    everyday: {"phenomenon":"Microwave heating of food","explanation":"Alternating microwave electric fields torque polar water molecules back and forth, converting dielectric friction into thermal heat"},
    lessons: {
      1: {
        system: "The Covalent Bond: Orbital Overlap, Sigma/Pi Bonds & Bond Dissociation",
        mechanism: "Simultaneous electrostatic attraction of two atomic nuclei for a shared pair of valence electrons occupying molecular bonding orbitals",
        terminology: {"term":"Covalent Bond","def":"A chemical bond that results from the sharing of valence electrons between nonmetallic atoms"},
        calc1: { formula: "E_{\\text{bond}} = \\Delta H_{\\text{dissociation}}", label: "bond dissociation energy", unit: "\\text{kJ/mol}", solve: (e) => String(e) },
        everyday: {"phenomenon":"Atmospheric nitrogen gas N2 being chemically inert","explanation":"Nitrogen atoms share six electrons in an exceptionally strong covalent triple bond (one sigma, two pi) requiring 945 kJ/mol to break"},
        misconception: "Forming chemical bonds absorbs energy while breaking bonds releases energy, confusing activation energy with thermodynamic bond enthalpy"
      },
      2: {
        system: "Molecular Nomenclature: Binary Molecular Compounds & Acid Naming Rules",
        mechanism: "Systematic prefix assignment indicating atomic stoichiometric counts and proton release rules defining binary and oxyacid names",
        terminology: {"term":"Binary Molecular Compound","def":"A compound composed of only two different nonmetal elements held together by covalent bonds"},
        calc1: { formula: "\\text{Prefix Count} = N_{\\text{atoms}}", label: "IUPAC prefix value", unit: "", solve: (n) => String(n) },
        everyday: {"phenomenon":"Carbon monoxide CO poisoning vs harmless carbon dioxide CO2","explanation":"Prefixes 'mono' and 'di' indicate exact oxygen stoichiometry, distinguishing deadly carbon monoxide from harmless carbon dioxide"},
        misconception: "Using ionic charge balance and Roman numerals to name binary covalent molecules between nonmetals"
      },
      3: {
        system: "Lewis Molecular Structures, Resonance Hybrids & Octet Exceptions",
        mechanism: "Distributing shared pairs and lone pairs to satisfy octets, with delocalized pi electrons stabilizing resonance hybrid structures",
        terminology: {"term":"Resonance","def":"A condition that occurs when more than one valid Lewis structure can be written for a molecule or ion"},
        calc1: { formula: "\\text{Formal Charge} = V - N - \\frac{B}{2}", label: "atomic formal charge", unit: "", solve: (v, n, b) => String(v - n - b / 2) },
        everyday: {"phenomenon":"Ozone O3 absorbing lethal solar UV-B radiation","explanation":"Ozone's resonance hybrid delocalizes pi bonding electrons across both oxygen bonds, optimizing photon absorption at 254 nm"},
        misconception: "Resonance means a molecule rapidly flips back and forth between different static Lewis structures, rather than existing as a single blended hybrid"
      },
      4: {
        system: "VSEPR Theory: Electron Domain Geometries & Molecular Architecture",
        mechanism: "Minimization of electrostatic repulsion between bonding and non-bonding electron pairs dictating 3D molecular bond angles",
        terminology: {"term":"VSEPR Model","def":"Valence Shell Electron Pair Repulsion model, which is based on an arrangement that minimizes the repulsion of shared and unshared electron pairs"},
        calc1: { formula: "\\theta_{\\text{bent}} < 109.5^\\circ", label: "compressed tetrahedral angle", unit: "^\\circ", solve: () => "104.5" },
        everyday: {"phenomenon":"Water molecules having a bent 104.5° geometry rather than linear","explanation":"Two lone pairs on oxygen exert greater electrostatic repulsion than bonding pairs, compressing the tetrahedral angle from 109.5° down to 104.5°"},
        misconception: "Molecular geometry is identical to electron-domain geometry, neglecting the distorting effect of unshared lone electron pairs"
      },
      5: {
        system: "Electronegativity Differences, Polar Covalent Bonds & Molecular Dipoles",
        mechanism: "Unequal sharing of bonding electrons producing permanent bond dipoles that sum vectorially to determine net molecular polarity",
        terminology: {"term":"Polar Covalent Bond","def":"A type of covalent bond formed between atoms with different electronegativities, resulting in an unequal sharing of electrons"},
        calc1: { formula: "\\Delta \\text{EN} = |\\chi_A - \\chi_B|", label: "electronegativity difference", unit: "", solve: (a, b) => Math.abs(a - b).toFixed(2) },
        everyday: {"phenomenon":"Microwave ovens heating liquid water rapidly but ignoring dry plates","explanation":"Water's permanent molecular dipole moment couples to alternating microwave electric fields, converting radiation into rapid rotational heat"},
        misconception: "Any molecule containing polar covalent bonds must automatically be a polar molecule, ignoring symmetrical vector cancellation (e.g. CO2)"
      },
    }
  },
  8: {
    system: "Chemical Reactions & Net Ionic Stoichiometry",
    mechanism: "Rearrangement of atomic bonds through molecular collision exceeding activation energy, conserving total nuclei while forming new chemical species",
    calc1: { formula: "\\text{Yield} = \\frac{\\text{Actual}}{\\text{Theoretical}} \\times 100\\%", label: "percent yield", unit: "\\%", solve: (act, theo) => (act / theo * 100).toFixed(1) },
    calc2: { formula: "m = n \\times M", label: "stoichiometric mass", unit: "g", solve: (n, m) => (n * m).toFixed(2) },
    graph: "Stoichiometric titration precipitation curve showing mass of precipitate plateauing at equivalence point",
    experiment: {"iv":"Limiting reactant concentration in aqueous double-replacement reaction","dv":"Mass of dry insoluble precipitate collected by gravimetric vacuum filtration","controls":"Stoichiometric excess of second reactant, washing volume, drying oven temperature"},
    misconception: "Spectator ions participate in bond formation in precipitation reactions, rather than remaining solvated spectator species in solution",
    application: "Automotive catalytic converters utilizing platinum-rhodium catalysts to convert toxic CO and NOx into CO2 and N2 gases",
    perturbation: "Changing solvent polarity, causing previously soluble ionic salts to crash out as insoluble precipitates",
    comparison: "Complete ionic equation (all strong electrolytes dissociated into ions) versus net ionic equation (omitting spectator ions)",
    errorAnalysis: "Incomplete drying of filtered precipitate leading to false mass elevation and calculated percent yield exceeding 100%",
    boundary: "Solubility product constant (Ksp) threshold: precipitation occurs only when ion product Q exceeds Ksp",
    cer1: {"prompt":"Evaluate the reaction between aqueous lead(II) nitrate and potassium iodide.","claim":"A vibrant yellow precipitate of lead(II) iodide forms, leaving potassium and nitrate as spectator ions.","ev":"Mixing clear solutions produces bright yellow solid PbI2, leaving clear supernatant containing K+ and NO3- ions.","reas":"Lead ions have high lattice energy with iodide, exceeding hydration energy and forming insoluble PbI2(s) via Pb²⁺ + 2I⁻ → PbI2(s)."},
    historical: "John Dalton's 1803 atomic theory formulating the Law of Multiple Proportions and chemical equations",
    cer2: {"prompt":"Predict the products when hydrochloric acid reacts with sodium bicarbonate in an open beaker and account for observed mass loss.","claim":"The reaction produces sodium chloride, water, and gaseous carbon dioxide which escapes, causing apparent mass loss.","ev":"Effervescence occurs and the beaker mass decreases by exactly the theoretical mass of evolved CO2.","reas":"Mass is conserved overall; in an open thermodynamic system, gaseous CO2 leaves the balance pan, verifying open vs closed system boundaries."},
    terminology: {"term":"Spectator Ion","def":"An ion that exists in the same form on both reactant and product sides of a chemical reaction without participating"},
    everyday: {"phenomenon":"Baking soda and vinegar fizz","explanation":"Acetic acid reacts with sodium bicarbonate releasing gaseous carbon dioxide bubbles through an acid-base decomposition"},
    lessons: {
      1: {
        system: "Chemical Equations: Reactants, Products & Mass Conservation Balancing",
        mechanism: "Stoichiometric coefficient balancing ensuring exact atom conservation between initial reactant bonds and final product arrangements",
        terminology: {"term":"Chemical Equation","def":"A statement using chemical formulas to describe the identities and relative amounts of the reactants and products involved in a chemical reaction"},
        calc1: { formula: "\\sum N_{\\text{reactants}} = \\sum N_{\\text{products}}", label: "conserved atom count", unit: "", solve: (n) => String(n) },
        everyday: {"phenomenon":"Baking soda and vinegar bubbling vigorously in a science fair volcano","explanation":"Acetic acid reacts with sodium bicarbonate to produce carbon dioxide gas bubbles, liquid water, and aqueous sodium acetate"},
        misconception: "Balancing chemical equations allows modifying chemical formula subscripts rather than adjusting only front stoichiometric coefficients"
      },
      2: {
        system: "Reaction Classification: Synthesis, Combustion, Decomposition & Replacement",
        mechanism: "Predictable electron and atom exchange patterns categorized by activity series rankings and combustion oxygen consumption",
        terminology: {"term":"Single-Replacement Reaction","def":"A chemical reaction in which the atoms of one element replace the atoms of another element in a compound"},
        calc1: { formula: "\\text{Activity Rank: } A > B", label: "metal activity criteria", unit: "", solve: () => "Spontaneous" },
        everyday: {"phenomenon":"Zinc protecting steel hulls from galvanic marine corrosion","explanation":"Zinc is more active than iron on the activity series, undergoing sacrificial single replacement oxidation to shield the hull"},
        misconception: "Any metal can displace hydrogen or any other metal from an aqueous salt solution, ignoring the activity series threshold"
      },
      3: {
        system: "Aqueous Reactions: Precipitation, Complete Ionic & Net Ionic Equations",
        mechanism: "Solvation water shells separating soluble spectator ions while insoluble ion pairs precipitate as solid crystal lattices",
        terminology: {"term":"Net Ionic Equation","def":"An ionic equation that includes only the particles that participate in the reaction, omitting spectator ions"},
        calc1: { formula: "\\sum q_{\\text{net}} = 0", label: "precipitate charge balance", unit: "", solve: () => "0" },
        everyday: {"phenomenon":"White lime scale buildup in household showerheads and kettles","explanation":"Dissolved calcium and carbonate ions in hard water exceed solubility limits, precipitating as insoluble calcium carbonate rock"},
        misconception: "Spectator ions actively participate in bond formation during precipitation reactions, rather than remaining solvated spectators"
      },
    }
  },
  9: {
    system: "The Mole Concept & Empirical Formula Analysis",
    mechanism: "Bridging atomic mass units (amu) to macroscopic grams via Avogadro's constant NA = 6.022 × 10²³ particles per mole",
    calc1: { formula: "n = \\frac{m}{M}", label: "mole quantity", unit: "mol", solve: (m, mw) => (m / mw).toFixed(3) },
    calc2: { formula: "N = n \\times N_A", label: "particle count", unit: "\\text{particles}", solve: (n) => (n * 6.022e23).toExponential(3) },
    graph: "Linear mass vs mole plot for different compounds with slope equal to molar mass M",
    experiment: {"iv":"Mass of magnesium ribbon burned in a porcelain crucible","dv":"Mass of white magnesium oxide product formed","controls":"Complete combustion with excess atmospheric oxygen, closed crucible lid to prevent smoke loss"},
    misconception: "One mole of different substances contains different numbers of particles, confusing particle count with sample mass",
    application: "Pharmaceutical dosage calibration ensuring exact molecular delivery of active drug ingredients per kilogram patient body weight",
    perturbation: "Hydration state alteration: heating copper(II) sulfate pentahydrate drives off stoichiometric crystal water, turning blue salt white",
    comparison: "Empirical formula (simplest whole-number integer ratio of atoms) versus molecular formula (actual count of atoms in a molecule)",
    errorAnalysis: "Incomplete combustion leaving unreacted magnesium metal in the crucible, causing calculated oxygen-to-magnesium mole ratio to fall below 1:1",
    boundary: "Non-stoichiometric berthollide compounds (e.g. Fe0.95O) where crystal defect vacancies violate strict integer mole ratios",
    cer1: {"prompt":"A 5.00 g sample of blue copper sulfate hydrate is heated until it turns white, weighing 3.20 g. Determine the hydrate formula.","claim":"The hydrate formula is copper(II) sulfate pentahydrate, CuSO4 · 5H2O.","ev":"Mass of lost water is 1.80 g (0.100 mol H2O); mass of anhydrous CuSO4 is 3.20 g (0.020 mol CuSO4). Mole ratio is 0.100 / 0.020 = 5.","reas":"Water molecules are stoichiometric coordinated ligands in the crystal lattice; driving them off reveals the exact integer hydration coefficient."},
    historical: "Amedeo Avogadro's 1811 hypothesis that equal volumes of gases at equal temperature and pressure contain equal numbers of molecules",
    cer2: {"prompt":"Analyze an unknown hydrocarbon containing 85.6% carbon and 14.4% hydrogen by mass with a molar mass of 28.05 g/mol.","claim":"The empirical formula is CH2 and the molecular formula is ethene, C2H4.","ev":"Moles of C = 85.6 / 12.01 = 7.13; Moles of H = 14.4 / 1.008 = 14.28 (1:2 ratio). Empirical mass is 14.03 g/mol; 28.05 / 14.03 = 2.","reas":"The molecular formula must be an exact integer multiple (n = 2) of the empirical unit, confirming C2H4."},
    terminology: {"term":"Avogadro's Number","def":"6.022 × 10²³ particles, representing the number of carbon-12 atoms in exactly 12 grams of pure carbon-12"},
    everyday: {"phenomenon":"Silica gel packet desiccation","explanation":"Anhydrous silica gel packets in shoe boxes absorb water vapor through stoichiometric surface hydration"},
    lessons: {
      1: {
        system: "The Mole Concept: Avogadro's Number & Counting by Weighing",
        mechanism: "Using Avogadro's constant 6.022 × 10²³ as the macroscopic counting bridge connecting atomic mass units to bulk grams",
        terminology: {"term":"Mole","def":"The SI base unit used to measure the amount of a substance, defined as containing exactly 6.02214076 × 10²³ elementary entities"},
        calc1: { formula: "N = n \\times N_A", label: "particle count", unit: "", solve: (n) => (n * 6.022e23).toExponential(3) },
        everyday: {"phenomenon":"Counting paper clips by total mass rather than counting one by one","explanation":"Knowing the average mass of a single atom allows chemists to measure exact mole quantities of atoms simply by weighing bulk samples"},
        misconception: "A mole represents a specific mass rather than a fixed fundamental counting number of particles, like a dozen represents twelve items"
      },
      2: {
        system: "Molar Mass: Converting Between Grams, Moles & Elemental Quantities",
        mechanism: "Direct equivalence between an element's atomic mass in amu and its molar mass in grams per mole (g/mol)",
        terminology: {"term":"Molar Mass","def":"The mass in grams of one mole of any pure substance, numerically equivalent to its atomic mass in atomic mass units"},
        calc1: { formula: "n = \\frac{m}{M}", label: "mole quantity", unit: "\\text{mol}", solve: (m, mw) => (m / mw).toFixed(3) },
        everyday: {"phenomenon":"Weighing 12.01 grams of pure graphite to obtain exactly one mole of carbon","explanation":"Because carbon's atomic mass is 12.01 amu, exactly 12.01 grams of carbon contains precisely Avogadro's number of carbon atoms"},
        misconception: "One mole of lead and one mole of carbon have identical masses because they contain the same number of atoms"
      },
      3: {
        system: "Molar Mass of Compounds: Multi-Step Stoichiometric Mass-Mole Conversions",
        mechanism: "Summing individual atomic molar masses multiplied by compound formula subscripts to determine total molecular mass",
        terminology: {"term":"Molecular Mass","def":"The sum of the atomic masses of all atoms present in a molecular formula, expressed in grams per mole"},
        calc1: { formula: "M = \\sum (N_i \\times M_i)", label: "compound molar mass", unit: "\\text{g/mol}", solve: (m1, m2) => (m1 + m2).toFixed(2) },
        everyday: {"phenomenon":"Calculating exact pharmaceutical medication dosages in milligrams","explanation":"Pharmacists determine active ingredient mole counts by dividing dosage mass by the compound's precise molar mass"},
        misconception: "Subscripts in a chemical formula represent mass percentages rather than stoichiometric mole ratios of constituent elements"
      },
      4: {
        system: "Empirical vs Molecular Formulas: Percent Composition Analysis",
        mechanism: "Converting elemental mass percentages into lowest whole-number mole ratios to determine empirical formulas and molecular multiples",
        terminology: {"term":"Empirical Formula","def":"A formula that shows the smallest whole-number mole ratio of the elements of a compound"},
        calc1: { formula: "n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}}", label: "formula integer multiple", unit: "", solve: (mm, em) => String(Math.round(mm / em)) },
        everyday: {"phenomenon":"Glucose (C6H12O6) having the empirical formula CH2O","explanation":"Both glucose and formaldehyde share the identical 1:2:1 empirical ratio, but glucose contains six empirical units per molecule"},
        misconception: "The empirical formula and molecular formula of a compound are always identical, ignoring compounds with integer multiples n > 1"
      },
      5: {
        system: "Formulas of Hydrates: Crystal Water of Hydration & Anhydrous Salts",
        mechanism: "Thermal dehydration driving off physically trapped stoichiometric water molecules from ionic crystal lattices",
        terminology: {"term":"Hydrate","def":"A compound that has a specific number of water molecules bound to its atoms within its crystal lattice"},
        calc1: { formula: "x = \\frac{n_{\\text{H}_2\\text{O}}}{n_{\\text{anhydrous}}}", label: "water of hydration mole ratio", unit: "", solve: (nw, na) => String(Math.round(nw / na)) },
        everyday: {"phenomenon":"Blue copper sulfate crystals turning white when heated in a test tube","explanation":"Heating drives off five coordinated water molecules from CuSO4·5H2O, leaving white anhydrous copper sulfate powder"},
        misconception: "Hydrates are wet aqueous solutions rather than solid dry crystalline salts with stoichiometric water incorporated into the lattice"
      },
    }
  },
  10: {
    system: "Stoichiometry & Industrial Limiting Reagents",
    mechanism: "Conservation of mass dictated by balanced stoichiometric mole ratios, where the limiting reactant completely governs theoretical yield",
    calc1: { formula: "m_{\\text{prod}} = n_{\\text{lim}} \\times \\frac{\\text{coeff}_{\\text{prod}}}{\\text{coeff}_{\\text{lim}}} \\times M_{\\text{prod}}", label: "theoretical mass", unit: "g", solve: (m, r, mw) => (m * r * mw).toFixed(2) },
    calc2: { formula: "\\% \\text{ Yield} = \\frac{\\text{Actual}}{\\text{Theoretical}} \\times 100\\%", label: "percent yield", unit: "\\%", solve: (a, t) => (a / t * 100).toFixed(1) },
    graph: "Product yield curve rising linearly with limiting reactant until plateauing at complete reagent consumption",
    experiment: {"iv":"Molar ratio of reactant A to reactant B in a series of reaction vessels","dv":"Volume of gas evolved or mass of product synthesized","controls":"Reaction temperature, vessel pressure, solvent volume"},
    misconception: "The reactant with the smallest initial mass is automatically the limiting reactant, ignoring differences in molar masses and stoichiometric coefficients",
    application: "Haber-Bosch industrial ammonia synthesis feeding 3:1 H2 to N2 gas ratios to maximize global agricultural fertilizer production",
    perturbation: "Adding excess reactant beyond stoichiometric equivalence, shifting the identity of the limiting reactant to the conjugate partner",
    comparison: "Theoretical yield (maximum calculated product mass assuming 100% conversion) versus actual yield (empirical laboratory recovery)",
    errorAnalysis: "Side reactions, product adherence to glassware walls, and filtration losses systematically reducing actual recovery below 100%",
    boundary: "Reversible equilibrium limit: reactions with small equilibrium constants K cannot achieve 100% theoretical yield even with infinite time",
    cer1: {"prompt":"If 10.0 g of hydrogen gas reacts with 10.0 g of oxygen gas to form water (2H2 + O2 → 2H2O), identify the limiting reactant.","claim":"Oxygen gas is the limiting reactant, producing a maximum theoretical yield of 11.26 g of water.","ev":"10.0 g H2 is 4.96 mol; 10.0 g O2 is 0.313 mol. The 2:1 stoichiometric requirement needs 0.625 mol H2, leaving 4.33 mol H2 in excess.","reas":"Even though both reactants have equal initial masses (10.0 g), O2 has a 16-fold higher molar mass and is exhausted first."},
    historical: "Jeremias Benjamin Richter's 1792 coining of the term 'stoichiometry' and establishment of equivalent proportions",
    cer2: {"prompt":"Evaluate the environmental and economic value of calculating atom economy in green chemical engineering synthesis.","claim":"High atom economy minimizes industrial chemical waste by ensuring reactant atoms are incorporated into desired products rather than hazardous byproducts.","ev":"Addition reactions exhibit 100% theoretical atom economy, whereas substitution reactions generate stoichiometric waste salts.","reas":"Stoichiometric efficiency must balance yield against byproduct toxicity and atom utilization to achieve sustainable chemical manufacturing."},
    terminology: {"term":"Limiting Reactant","def":"The reactant consumed first in a chemical reaction, limiting the amount of product that can be formed"},
    everyday: {"phenomenon":"S'mores sandwich stoichiometry","explanation":"If you have 10 graham crackers and 2 marshmallows, marshmallows limit you to making exactly 2 s'mores regardless of excess crackers"},
    lessons: {
      1: {
        system: "Foundations of Stoichiometry: Mole Ratios from Balanced Equations",
        mechanism: "Using balanced chemical equation coefficients as direct conversion factors between moles of reactants consumed and products formed",
        terminology: {"term":"Stoichiometry","def":"The study of quantitative relationships between the amounts of reactants used and amounts of products formed by a chemical reaction"},
        calc1: { formula: "\\text{Mole Ratio} = \\frac{\\text{coeff}_B}{\\text{coeff}_A}", label: "stoichiometric mole ratio", unit: "", solve: (b, a) => (b / a).toFixed(2) },
        everyday: {"phenomenon":"Baking a cake requiring an exact ratio of flour, eggs, and sugar","explanation":"Doubling or halving recipes requires multiplying all ingredients by the same proportional ratio, just like stoichiometric coefficients"},
        misconception: "Coefficients in balanced chemical equations represent mass ratios in grams rather than stoichiometric mole ratios"
      },
      2: {
        system: "Stoichiometric Calculations: Mass-to-Mass Chemical Conversions",
        mechanism: "Sequential conversion pipeline: given mass to moles, stoichiometric mole ratio transfer, and product moles to mass",
        terminology: {"term":"Theoretical Yield","def":"The maximum amount of product that can be produced from a given amount of reactant according to stoichiometric calculations"},
        calc1: { formula: "m_B = m_A \\times \\frac{1}{M_A} \\times \\frac{b}{a} \\times M_B", label: "calculated product mass", unit: "\\text{g}", solve: (m, mwA, r, mwB) => ((m / mwA) * r * mwB).toFixed(2) },
        everyday: {"phenomenon":"Combusting octane in an automobile engine producing predictable CO2 exhaust","explanation":"Every 114 grams of octane combusted produces exactly 352 grams of carbon dioxide exhaust gas based on mass-to-mass stoichiometry"},
        misconception: "Directly converting grams of reactant into grams of product without converting through intermediate mole quantities"
      },
      3: {
        system: "Limiting Reactants: Incomplete Consumption & Leftover Excess",
        mechanism: "The reactant supplying the smaller stoichiometric mole equivalent being fully consumed first, capping maximum product yield",
        terminology: {"term":"Limiting Reactant","def":"A reactant that is totally consumed during a chemical reaction, limits the extent of the reaction, and determines product amount"},
        calc1: { formula: "m_{\\text{excess}} = m_{\\text{initial}} - m_{\\text{consumed}}", label: "unreacted excess mass", unit: "\\text{g}", solve: (i, c) => (i - c).toFixed(2) },
        everyday: {"phenomenon":"Running out of hot dog buns before hot dog wieners at a barbecue","explanation":"Hot dog buns act as the limiting reactant; once depleted, no further complete hot dog sandwiches can be assembled"},
        misconception: "The reactant present with the smaller initial mass in grams is automatically the limiting reactant, ignoring differences in molar mass"
      },
      4: {
        system: "Percent Yield: Industrial Synthesis Efficiency & Laboratory Losses",
        mechanism: "Experimental side reactions, incomplete equilibrium, and mechanical transfer losses reducing actual yield below theoretical limits",
        terminology: {"term":"Percent Yield","def":"The ratio of actual yield to theoretical yield expressed as a percent, measuring reaction efficiency"},
        calc1: { formula: "\\% \\text{ Yield} = \\frac{\\text{Actual Yield}}{\\text{Theoretical Yield}} \\times 100\\%", label: "percent yield", unit: "\\%", solve: (act, theo) => (act / theo * 100).toFixed(1) },
        everyday: {"phenomenon":"Chemical manufacturing plants optimizing synthesis yields to reduce waste","explanation":"Industrial synthesis reactions achieving 95% yield generate substantially less unreacted hazardous waste and maximize production profitability"},
        misconception: "A chemical reaction can achieve a percent yield greater than 100% without sample contamination or unevaporated solvent residue"
      },
    }
  },
  11: {
    system: "States of Matter, Intermolecular Forces & Phase Equilibria",
    mechanism: "Competition between thermal kinetic energy (favoring dispersion) and intermolecular attractive forces (dipole-dipole, hydrogen bonds, London dispersion)",
    calc1: { formula: "P_{\\text{total}} = \\sum P_i", label: "Dalton's total pressure", unit: "atm", solve: (p1, p2) => (p1 + p2).toFixed(2) },
    calc2: { formula: "\\text{Rate} \\propto \\frac{1}{\\sqrt{M}}", label: "Graham's effusion ratio", unit: "", solve: (m1, m2) => Math.sqrt(m2 / m1).toFixed(3) },
    graph: "Phase diagram showing solid, liquid, and gas regions bounded by sublimation, melting, and vaporization equilibrium curves meeting at triple point",
    experiment: {"iv":"Molecular structure and polarity of liquids (water, ethanol, acetone, hexane)","dv":"Rate of evaporation and capillary meniscus surface tension","controls":"Ambient temperature, barometric pressure, surface area"},
    misconception: "Boiling water breaks the covalent O-H bonds within water molecules, rather than disrupting intermolecular hydrogen bonds between molecules",
    application: "Cryogenic liquid nitrogen preservation of biological tissue samples at -196°C utilizing high latent heat of vaporization",
    perturbation: "Pressure reduction inside a bell jar causing room-temperature water to boil vigorously without heating",
    comparison: "Intramolecular forces (covalent/ionic bonds within a molecule: 200–800 kJ/mol) versus intermolecular forces (between molecules: 2–40 kJ/mol)",
    errorAnalysis: "Barometric weather fluctuations shifting measured boiling point temperatures away from standard sea-level 100.0°C",
    boundary: "Critical point on a phase diagram: beyond Tc and Pc, liquid and gas phases coalesce into an indistinct supercritical fluid",
    cer1: {"prompt":"Explain why water (H2O, M = 18 g/mol) is a liquid at room temperature while hydrogen sulfide (H2S, M = 34 g/mol) is a gas.","claim":"Water exhibits extensive intermolecular hydrogen bonding, creating strong cohesive forces that require higher thermal energy to boil.","ev":"Water boils at 100°C while H2S boils at -60°C despite H2S having a higher molecular mass and stronger London dispersion forces.","reas":"Oxygen's high electronegativity (3.44) and compact size creates intense partial charges that form directional hydrogen bonds (approx 20 kJ/mol), which sulfur cannot form."},
    historical: "Johannes Diderik van der Waals's 1873 equation of state accounting for molecular volume and intermolecular attractive forces",
    cer2: {"prompt":"Analyze the unique negative slope of the solid-liquid equilibrium boundary line on the phase diagram of water.","claim":"The negative slope proves that increasing pressure on ice forces it to melt into denser liquid water.","ev":"Ice skates glide because pressure and friction melt a thin lubricating film of liquid water beneath the blade.","reas":"Unlike almost all other substances, liquid water is denser than solid ice due to ice's open cage-like hexagonal crystal lattice."},
    terminology: {"term":"Hydrogen Bond","def":"An unusually strong dipole-dipole attraction between a hydrogen atom bonded to N, O, or F and an electronegative atom"},
    everyday: {"phenomenon":"Water strider walking on pond surfaces","explanation":"Water's strong surface tension created by cohesive hydrogen bonds supports the insect's lightweight hydrophobic feet"},
    lessons: {
      1: {
        system: "Kinetic-Molecular Theory: Gas Pressure, Effusion & Dalton's Partial Pressures",
        mechanism: "Elastic collisions of point-mass gas particles exerting macroscopic pressure, with effusion rates scaling inversely with square root of molar mass",
        terminology: {"term":"Dalton's Law","def":"The law stating that the total pressure of a mixture of gases is equal to the sum of the partial pressures of all individual component gases"},
        calc1: { formula: "P_{\\text{total}} = \\sum P_i", label: "total gas pressure", unit: "\\text{atm}", solve: (p1, p2) => (p1 + p2).toFixed(2) },
        everyday: {"phenomenon":"Helium balloons deflating much faster than air-filled latex balloons","explanation":"Helium atoms possess tiny molar mass (4 g/mol) compared to N2 (28 g/mol), effusing through microscopic pores in latex at nearly triple the rate"},
        misconception: "Gas particles slow down and lose kinetic energy upon colliding with container walls, violating the postulate of perfectly elastic collisions"
      },
      2: {
        system: "Intermolecular Forces: Dispersion, Dipole-Dipole & Hydrogen Bonding",
        mechanism: "Temporary induced dipoles, permanent dipole attractions, and highly concentrated hydrogen-bonding dipole interactions between polar molecules",
        terminology: {"term":"Hydrogen Bond","def":"A strong dipole-dipole attraction between a hydrogen atom bonded to a highly electronegative atom (N, O, F) and a nearby electronegative atom"},
        calc1: { formula: "F_{\\text{H-bond}} > F_{\\text{dipole}} > F_{\\text{dispersion}}", label: "intermolecular strength order", unit: "", solve: () => "H-bond dominant" },
        everyday: {"phenomenon":"Water possessing an anomalously high boiling point (100°C) compared to H2S (-60°C)","explanation":"Extensive networks of hydrogen bonds between water molecules require massive thermal energy to overcome, elevating its boiling point"},
        misconception: "Hydrogen bonds are covalent intramolecular bonds within a single molecule rather than intermolecular attractions between separate molecules"
      },
      3: {
        system: "Liquids and Solids: Viscosity, Surface Tension & Unit Cell Crystal Geometries",
        mechanism: "Cohesive intermolecular forces creating inward surface tension and internal shear resistance in liquids alongside rigid crystalline lattices",
        terminology: {"term":"Surface Tension","def":"The energy required to increase the surface area of a liquid by a given amount, resulting from unbalanced inward intermolecular forces"},
        calc1: { formula: "\\gamma = \\frac{F}{L}", label: "liquid surface tension", unit: "\\text{N/m}", solve: (f, l) => (f / l).toFixed(3) },
        everyday: {"phenomenon":"Water strider insects walking across pond surfaces without sinking","explanation":"Water's strong hydrogen bonding creates high surface tension that acts like a resilient elastic membrane supporting the insect's tiny weight"},
        misconception: "Amorphous solids like glass and plastic possess long-range periodic crystalline lattice order, confusing rigidity with crystalline geometry"
      },
      4: {
        system: "Phase Changes & Phase Diagrams: Triple Points, Critical States & Latent Heat",
        mechanism: "Endothermic and exothermic latent heat transfers altering intermolecular freedom without changing temperature during phase coexistence",
        terminology: {"term":"Triple Point","def":"The point on a phase diagram that represents the temperature and pressure at which three phases of a substance coexist in thermodynamic equilibrium"},
        calc1: { formula: "q = m \\Delta H_{\\text{vap}}", label: "latent heat of vaporization", unit: "\\text{kJ}", solve: (m, dh) => (m * dh).toFixed(1) },
        everyday: {"phenomenon":"Dry ice (solid carbon dioxide) smoking and sublimating directly into gas","explanation":"At atmospheric pressure (1 atm), carbon dioxide exists below its triple point pressure (5.1 atm), sublimating directly from solid to gas"},
        misconception: "Water continues to increase in temperature while boiling vigorously on a hot stove, rather than remaining clamped at 100°C until vaporization finishes"
      },
    }
  },
  12: {
    system: "Gaseous Kinetic Molecular Theory & Gas Laws",
    mechanism: "Elastic collisions of continuous, random, point-mass particles exerting pressure F/A against container boundaries, with kinetic energy proportional to Kelvin temperature",
    calc1: { formula: "PV = nRT", label: "ideal gas pressure", unit: "atm", solve: (n, t, v) => ((n * 0.08206 * t) / v).toFixed(2) },
    calc2: { formula: "\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}", label: "combined gas parameter", unit: "L", solve: (p1, v1, t1, p2, t2) => ((p1 * v1 * t2) / (p2 * t1)).toFixed(2) },
    graph: "Isothermal Boyle's Law curve: hyperbolic inverse P vs V curve, linearizing to a straight line when plotting P vs 1/V",
    experiment: {"iv":"Absolute temperature of enclosed gas sample (K)","dv":"Volume of gas enclosed in a frictionless sealed syringe (mL)","controls":"Mass of gas n, barometric pressure P"},
    misconception: "Gas particles slow down and expand when heated, rather than remaining the same atomic size while moving at higher average velocities",
    application: "Automotive airbag rapid deployment utilizing solid sodium azide decomposition into expanding nitrogen gas within 40 milliseconds",
    perturbation: "Cooling a sealed gas balloon in liquid nitrogen, causing kinetic velocities to plunge and volume to collapse to near zero",
    comparison: "Ideal gas behavior (zero molecular volume, perfectly elastic collisions) versus real gas van der Waals deviations at high pressure and low temperature",
    errorAnalysis: "Friction between syringe plunger and barrel creating systematic hysteresis in pressure-volume empirical measurements",
    boundary: "Absolute zero (0 Kelvin = -273.15°C): theoretical state of zero translational kinetic energy where ideal gas volume extrapolates to zero",
    cer1: {"prompt":"A 2.0 L balloon at 25°C is submerged in hot water at 75°C under constant pressure. Predict and explain the volume change.","claim":"The balloon volume expands to approximately 2.34 L according to Charles's Law (V1/T1 = V2/T2).","ev":"Absolute temperatures are T1 = 298.15 K and T2 = 348.15 K; V2 = 2.0 × (348.15 / 298.15) = 2.335 L.","reas":"Gas volume is directly proportional to absolute Kelvin temperature; higher thermal energy increases particle speeds and collision frequencies, pushing container walls outward."},
    historical: "Robert Boyle (1662), Jacques Charles (1787), and Amedeo Avogadro formulating empirical foundation of ideal gas laws",
    cer2: {"prompt":"Justify why real gases deviate most severely from ideal gas behavior under conditions of extremely high pressure and low temperature.","claim":"High pressure forces particles close together where molecular volume is significant, and low temperature allows intermolecular attractions to dominate.","ev":"Under 500 atm, the experimental compressibility factor Z = PV/nRT deviates significantly above 1.0.","reas":"At high density, the volume occupied by gas particles cannot be neglected, and slow velocities allow van der Waals attractive forces to pull particles together, reducing wall impact force."},
    terminology: {"term":"Ideal Gas","def":"A theoretical gas whose molecules have zero volume and zero intermolecular attractive forces, obeying PV = nRT"},
    everyday: {"phenomenon":"Car tire pressure dropping in winter","explanation":"Colder temperatures lower the average kinetic energy of enclosed air molecules, decreasing collision frequency and gauge pressure"},
    lessons: {
      1: {
        system: "Empirical Gas Laws: Boyle, Charles, Gay-Lussac & Absolute Zero",
        mechanism: "Gas pressure and volume adjusting inversely under constant T, while volume and pressure expand linearly with absolute Kelvin temperature",
        terminology: {"term":"Boyle's Law","def":"A gas law stating that the volume of a given amount of gas held at constant temperature varies inversely with pressure"},
        calc1: { formula: "P_1 V_1 = P_2 V_2", label: "Boyle's law pressure", unit: "\\text{atm}", solve: (p1, v1, v2) => ((p1 * v1) / v2).toFixed(2) },
        everyday: {"phenomenon":"Bicycle tire pressure dropping noticeably on cold winter mornings","explanation":"According to Gay-Lussac's Law, lower ambient temperatures decrease gas molecular velocity and wall collision force, reducing tire pressure"},
        misconception: "Calculating gas law problems using temperatures in Celsius rather than converting to absolute Kelvin degrees"
      },
      2: {
        system: "Combined Gas Law & Avogadro's Principle: Molar Volume at STP",
        mechanism: "Unifying pressure, temperature, and volume variables while establishing that equal volumes of all gases at STP contain identical mole counts",
        terminology: {"term":"Molar Volume","def":"The volume that one mole of any gas occupies at standard temperature and pressure (0.00°C and 1.00 atm), equal to 22.4 L"},
        calc1: { formula: "\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}", label: "combined gas final volume", unit: "\\text{L}", solve: (p1, v1, t1, p2, t2) => ((p1 * v1 * t2) / (t1 * p2)).toFixed(2) },
        everyday: {"phenomenon":"Weather balloons expanding to colossal sizes as they ascend through the stratosphere","explanation":"Ascending balloons experience rapidly dropping atmospheric pressure that causes internal helium volume to expand dramatically"},
        misconception: "A mole of heavy gas like CO2 occupies less volume at STP than a mole of light H2 gas, violating Avogadro's Principle"
      },
      3: {
        system: "The Ideal Gas Law: PV = nRT, Molar Mass Determination & Real Gas Deviations",
        mechanism: "Relating macroscopic state variables via the universal gas constant R, with real gas deviations occurring under high pressure and low temperature",
        terminology: {"term":"Ideal Gas Law","def":"A law describing the physical behavior of an ideal gas in terms of the pressure, volume, temperature, and number of moles of gas present"},
        calc1: { formula: "PV = nRT", label: "ideal gas pressure", unit: "\\text{atm}", solve: (n, t, v) => ((n * 0.08206 * t) / v).toFixed(2) },
        everyday: {"phenomenon":"Automobile airbags inflating instantaneously with nitrogen gas upon collision impact","explanation":"Sodium azide decomposition generates precisely calculated moles of nitrogen gas, inflating the nylon bag to ideal pressure in 30 milliseconds"},
        misconception: "Real gases obey PV = nRT under extreme pressures near condensation, ignoring finite molecular volume and intermolecular attractive forces"
      },
      4: {
        system: "Gas Stoichiometry: Volume-to-Mass & Non-STP Chemical Calculations",
        mechanism: "Integrating ideal gas volume conversions directly into stoichiometric equations to predict gas volumes produced in chemical reactions",
        terminology: {"term":"Gas Stoichiometry","def":"The stoichiometric calculation of quantities of gases consumed or produced in a chemical reaction at specified temperatures and pressures"},
        calc1: { formula: "V = \\frac{nRT}{P}", label: "stoichiometric gas volume", unit: "\\text{L}", solve: (n, t, p) => ((n * 0.08206 * t) / p).toFixed(2) },
        everyday: {"phenomenon":"Baking soda reacting in cake batter to generate fluffy sponge pores","explanation":"Heat decomposes baking powder to release carbon dioxide gas that expands according to gas stoichiometry, puffing the cake"},
        misconception: "Assuming gas volume can always be divided by 22.4 L/mol regardless of whether the reaction conditions are at standard temperature and pressure"
      },
    }
  },
  13: {
    system: "Aqueous Solutions & Colligative Thermodynamics",
    mechanism: "Solvation hydration shells formed by ion-dipole attractions overcoming solute lattice energy and solvent-solvent hydrogen bonds (like dissolves like)",
    calc1: { formula: "M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}}", label: "molarity", unit: "M", solve: (n, v) => (n / v).toFixed(3) },
    calc2: { formula: "\\Delta T_b = i K_b m", label: "boiling point elevation", unit: "^\\circ\\text{C}", solve: (i, kb, m) => (i * kb * m).toFixed(2) },
    graph: "Solubility curves showing solute grams dissolved per 100 g water across temperatures 0°C to 100°C",
    experiment: {"iv":"Van 't Hoff factor i of solute (non-electrolyte sucrose vs NaCl vs CaCl2)","dv":"Freezing point depression ΔTf measured with precision digital thermometer","controls":"Molal concentration m, mass of water, cooling bath rate"},
    misconception: "Dissolving an ionic salt in water is a chemical reaction rather than a physical phase dissociation of solvated ions",
    application: "Hemodialysis machines utilizing semi-permeable osmotic membranes to filter urea waste from patient blood without losing plasma proteins",
    perturbation: "Introducing a seed crystal into an unstable supersaturated sodium acetate solution, triggering instantaneous crystallization",
    comparison: "Molarity M (moles solute per liter solution, temperature-dependent) versus Molality m (moles solute per kg solvent, invariant to temperature)",
    errorAnalysis: "Ion-pairing in concentrated ionic solutions reducing the effective van 't Hoff factor below theoretical integer values",
    boundary: "Dynamic saturation equilibrium: rate of solute dissolution equals rate of solute recrystallization",
    cer1: {"prompt":"Evaluate whether spreading sodium chloride (NaCl) or calcium chloride (CaCl2) is more effective for melting ice on winter highways.","claim":"Calcium chloride is more effective per mole because it dissociates into three ions (i = 3), producing greater freezing point depression.","ev":"Freezing point depression equation ΔTf = i Kf m: for 1.0 m solutions, NaCl (i = 2) lowers freezing point by 3.72°C, whereas CaCl2 (i = 3) lowers it by 5.58°C.","reas":"Colligative properties depend strictly on the total number of dissolved solute particles per kilogram of solvent, not their chemical identity."},
    historical: "François-Marie Raoult's 1887 law describing vapor pressure lowering in ideal solutions",
    cer2: {"prompt":"Explain the physiological danger of administering pure distilled water intravenously instead of isotonic 0.9% saline.","claim":"Pure water creates a hypotonic environment, causing massive osmotic water influx that lyses and destroys red blood cells.","ev":"Under a microscope, red blood cells placed in pure water swell and burst within seconds.","reas":"Water flows spontaneously across semipermeable cell membranes down its chemical potential gradient from low solute concentration toward high intracellular solute concentration."},
    terminology: {"term":"Colligative Property","def":"A physical property of solutions depending only on the ratio of solute particle count to solvent amount, independent of solute identity"},
    everyday: {"phenomenon":"Salting icy roads in winter","explanation":"Dissolved salt particles disrupt the formation of ice's crystal lattice, depressing the freezing point below ambient temperature"},
    lessons: {
      1: {
        system: "Types of Mixtures: Heterogeneous Suspensions, Colloids & The Tyndall Effect",
        mechanism: "Particle diameter determining gravitational settling in suspensions, Brownian kinetic suspension in colloids, and molecular dispersion in solutions",
        terminology: {"term":"Tyndall Effect","def":"The scattering of visible light by colloidal particles suspended in a transparent medium"},
        calc1: { formula: "d_{\\text{colloid}} \\approx 1\\text{--}1000\\text{ nm}", label: "colloid particle scale", unit: "\\text{nm}", solve: () => "100" },
        everyday: {"phenomenon":"Headlight beams visibly cutting through foggy night air","explanation":"Microscopic liquid water droplets suspended in fog scatter visible light photons via the Tyndall Effect, making the light cone visible"},
        misconception: "Solutions and colloids can be distinguished by paper filtration, rather than requiring light beam scattering or semi-permeable membranes"
      },
      2: {
        system: "Solution Concentration: Molarity, Molality, Percent Composition & Dilutions",
        mechanism: "Quantifying solute-to-solvent ratios through volume-based molarity and temperature-independent mass-based molality and dilution formulas",
        terminology: {"term":"Molarity","def":"The number of moles of solute dissolved per liter of solution, the standard laboratory measure of solution concentration"},
        calc1: { formula: "M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}}", label: "solution molarity", unit: "\\text{M}", solve: (n, v) => (n / v).toFixed(3) },
        everyday: {"phenomenon":"Diluting concentrated fruit juice concentrate with cold water","explanation":"Applying the dilution formula M1V1 = M2V2 ensures the final diluted beverage achieves the exact desired flavor concentration"},
        misconception: "Molarity is temperature-independent, ignoring that thermal liquid expansion increases solution volume and slightly decreases molarity"
      },
      3: {
        system: "Factors Affecting Solvation: Agitation, Surface Area, Temperature & Henry's Law",
        mechanism: "Collisional contact rate accelerating solute dissolution alongside gas solubility dropping with temperature and scaling with partial pressure",
        terminology: {"term":"Henry's Law","def":"A law stating that at a given temperature, the solubility of a gas in a liquid is directly proportional to the pressure of the gas above the liquid"},
        calc1: { formula: "\\frac{S_1}{P_1} = \\frac{S_2}{P_2}", label: "Henry's law gas solubility", unit: "\\text{g/L}", solve: (s1, p1, p2) => ((s1 * p2) / p1).toFixed(3) },
        everyday: {"phenomenon":"Opening a pressurized soda bottle causing violent fizzing and gas release","explanation":"Releasing the bottle cap drops the headspace CO2 pressure, causing dissolved carbon dioxide solubility to plunge according to Henry's Law"},
        misconception: "Gases dissolve better in boiling hot water, confusing solid endothermic dissolution trends with exothermic gas dissolution"
      },
      4: {
        system: "Colligative Properties: Vapor Pressure Lowering, Freezing Depression & Boiling Elevation",
        mechanism: "Non-volatile solute particles obstructing solvent vaporization, lowering solvent chemical potential and expanding liquid temperature range",
        terminology: {"term":"Colligative Property","def":"A physical property of a solution that depends on the number, but not the identity, of dissolved solute particles"},
        calc1: { formula: "\\Delta T_f = K_f \\times m \\times i", label: "freezing point depression", unit: "^\\circ\\text{C}", solve: (kf, m, i) => (kf * m * i).toFixed(2) },
        everyday: {"phenomenon":"Spreading rock salt on icy roads during winter snowstorms","explanation":"Dissolved salt ions depress water's freezing point below 0°C, causing surface road ice to melt into slush at sub-freezing temperatures"},
        misconception: "A mole of dissolved glucose (nonelectrolyte) depresses freezing point by the same amount as a mole of dissolved calcium chloride (i = 3)"
      },
    }
  },
  14: {
    system: "Thermochemistry, Enthalpy & Spontaneity",
    mechanism: "Energy exchange as heat and work governed by the First Law (ΔU = q + w) and Second Law (ΔS_univ ≥ 0) of Thermodynamics",
    calc1: { formula: "q = mc\\Delta T", label: "calorimetric heat", unit: "J", solve: (m, c, dt) => (m * c * dt).toFixed(1) },
    calc2: { formula: "\\Delta G = \\Delta H - T\\Delta S", label: "Gibbs free energy", unit: "kJ/mol", solve: (dh, t, ds) => (dh - (t * ds / 1000)).toFixed(2) },
    graph: "Potential energy coordinate profile showing exothermic reaction enthalpy drop (ΔH < 0) vs endothermic enthalpy rise (ΔH > 0)",
    experiment: {"iv":"Salt dissolved in coffee-cup calorimeter (ammonium nitrate vs calcium chloride)","dv":"Solution temperature change ΔT measured over time","controls":"Mass of water, solute moles, styrofoam insulation"},
    misconception: "All exothermic reactions are automatically spontaneous and endothermic reactions can never occur spontaneously, ignoring the entropy term TΔS",
    application: "Instant cold packs utilizing the highly endothermic dissolution of ammonium nitrate (ΔH > 0) driven by positive entropy gain (ΔS > 0)",
    perturbation: "Elevating temperature above T = ΔH / ΔS to flip a non-spontaneous endothermic reaction into a spontaneous regime",
    comparison: "Enthalpy change ΔH (heat absorbed or released at constant pressure) versus Entropy change ΔS (dispersion of energy and microstates)",
    errorAnalysis: "Heat capacity of the calorimeter vessel itself neglected in basic calculations, underestimating total heat evolved",
    boundary: "Thermodynamic equilibrium where Gibbs free energy reaches its absolute minimum: ΔG = 0 and Q = K",
    cer1: {"prompt":"Explain why ice melts spontaneously at 25°C even though melting is an endothermic process (ΔH = +6.01 kJ/mol).","claim":"Ice melts spontaneously at 25°C because the positive entropy of liquid water (TΔS) outweighs the endothermic enthalpy penalty, making ΔG negative.","ev":"At 298.15 K: ΔG = +6010 J/mol - (298.15 K × 22.0 J/mol·K) = -549 J/mol (ΔG < 0).","reas":"Spontaneity is determined by Gibbs free energy ΔG = ΔH - TΔS. When T > 273.15 K, the thermal entropy multiplier drives ΔG below zero."},
    historical: "Germain Henri Hess's 1840 law establishing that enthalpy change is a path-independent thermodynamic state function",
    cer2: {"prompt":"Calculate the standard enthalpy of combustion for methane using Hess's Law and standard enthalpies of formation.","claim":"Standard enthalpy of combustion of methane is exactly -890.3 kJ/mol.","ev":"CH4(g) + 2O2(g) → CO2(g) + 2H2O(l): ΔH = [(-393.5) + 2(-285.8)] - [(-74.8) + 0] = -890.3 kJ/mol.","reas":"Enthalpy is a state function: total enthalpy equals the sum of product formation enthalpies minus reactant formation enthalpies."},
    terminology: {"term":"Gibbs Free Energy","def":"A thermodynamic quantity (ΔG = ΔH - TΔS) that measures the maximum reversible work obtainable and predicts spontaneity"},
    everyday: {"phenomenon":"Instant hot packs for hand warming","explanation":"Exposing iron powder to air triggers rapid exothermic oxidation, releasing thermal enthalpy directly into the hands"},
    lessons: {
      1: {
        system: "Thermochemistry: Kinetic vs Potential Energy, Calories & Specific Heat Capacity",
        mechanism: "Thermal heat transfer into internal particle kinetic vibrations quantified by substance-specific thermal heat capacities q = mcΔT",
        terminology: {"term":"Specific Heat","def":"The amount of heat required to raise the temperature of one gram of a given substance by one degree Celsius"},
        calc1: { formula: "q = mc\\Delta T", label: "sensible heat transfer", unit: "\\text{J}", solve: (m, c, dt) => (m * c * dt).toFixed(1) },
        everyday: {"phenomenon":"Hot beach sand scorching bare feet while ocean water remains comfortably cool","explanation":"Water's exceptionally high specific heat capacity (4.184 J/g°C) absorbs massive sunlight with minimal temperature rise compared to dry sand"},
        misconception: "Heat and temperature are identical concepts, confusing intensive average kinetic energy (T) with extensive thermal energy transfer (q)"
      },
      2: {
        system: "Calorimetry: System vs Surroundings & Reaction Enthalpy Measurements",
        mechanism: "Isolating chemical reactions inside calorimeters where heat released by exothermic bond formation equals heat absorbed by surrounding water",
        terminology: {"term":"Calorimeter","def":"An insulated device used for measuring the amount of heat absorbed or released during a chemical or physical process"},
        calc1: { formula: "q_{\\text{rxn}} = -q_{\\text{water}} = -(m c \\Delta T)", label: "calorimetric reaction heat", unit: "\\text{J}", solve: (m, c, dt) => (-m * c * dt).toFixed(1) },
        everyday: {"phenomenon":"Instant cold packs cooling athletic injuries upon squeezing","explanation":"Dissolving solid ammonium nitrate in water is an endothermic process that absorbs heat from surrounding injured tissue, numbing pain"},
        misconception: "An exothermic reaction cools down its surroundings, confusing reaction system enthalpy loss (-ΔH) with surroundings temperature gain"
      },
      3: {
        system: "Thermochemical Equations: Enthalpy of Combustion, Fusion & Vaporization",
        mechanism: "Quantifying molar enthalpy changes accompanying stoichiometric chemical reactions and latent physical state transformations",
        terminology: {"term":"Enthalpy of Reaction","def":"The change in enthalpy for a reaction, representing heat gained or lost under constant atmospheric pressure"},
        calc1: { formula: "\\Delta H_{\\text{rxn}} = H_{\\text{products}} - H_{\\text{reactants}}", label: "reaction enthalpy change", unit: "\\text{kJ/mol}", solve: (hp, hr) => (hp - hr).toFixed(1) },
        everyday: {"phenomenon":"Sweating cooling the human body on hot summer days","explanation":"Evaporating sweat absorbs liquid water's high enthalpy of vaporization (40.7 kJ/mol) from skin tissue, dissipating excess body heat"},
        misconception: "Chemical bonds contain stored heat that is released when bonds are broken, rather than energy being released when stronger bonds form"
      },
      4: {
        system: "Hess's Law: Enthalpy Summation & Standard Enthalpies of Formation",
        mechanism: "Exploiting enthalpy as a state function: net reaction enthalpy equals the algebraic sum of intermediate step enthalpies",
        terminology: {"term":"Hess's Law","def":"A law stating that if two or more thermochemical equations can be added to produce a final equation, the sum of enthalpy changes is the final enthalpy"},
        calc1: { formula: "\\Delta H^\\circ_{\\text{rxn}} = \\sum n\\Delta H^\\circ_f(\\text{prod}) - \\sum m\\Delta H^\\circ_f(\\text{react})", label: "standard reaction enthalpy", unit: "\\text{kJ}", solve: (p, r) => (p - r).toFixed(1) },
        everyday: {"phenomenon":"Calculating fuel efficiency of alternative aerospace rocket propellants","explanation":"Chemists sum standard enthalpies of formation to predict combustion heat release without conducting dangerous trial-and-error explosions"},
        misconception: "The enthalpy of formation of an element in its standard reference state is non-zero, rather than being defined strictly as zero kJ/mol"
      },
      5: {
        system: "Reaction Spontaneity: Entropy, Second Law & Gibbs Free Energy (ΔG = ΔH - TΔS)",
        mechanism: "Spontaneous transformations driven by thermodynamic universe entropy maximization balancing system enthalpy and thermal disorder",
        terminology: {"term":"Gibbs Free Energy","def":"The maximum amount of non-expansion work that can be extracted from a thermodynamically closed system at constant temperature and pressure"},
        calc1: { formula: "\\Delta G = \\Delta H - T\\Delta S", label: "Gibbs free energy change", unit: "\\text{kJ}", solve: (dh, t, ds) => (dh - (t * ds) / 1000).toFixed(1) },
        everyday: {"phenomenon":"Iron rusting spontaneously at room temperature","explanation":"Iron oxidation has a negative ΔG at ambient temperatures, meaning the reaction proceeds spontaneously toward thermodynamic equilibrium"},
        misconception: "A spontaneous chemical reaction must occur rapidly, confusing thermodynamic spontaneity (negative ΔG) with kinetic reaction rate"
      },
    }
  },
  15: {
    system: "Chemical Kinetics, Reaction Rates & Catalysis",
    mechanism: "Collision theory: reactions occur when particles collide with kinetic energy exceeding activation energy (E ≥ Ea) and correct spatial orientation",
    calc1: { formula: "\\text{Rate} = k[A]^m [B]^n", label: "initial reaction rate", unit: "M/s", solve: (k, a, b) => (k * a * b).toFixed(4) },
    calc2: { formula: "t_{1/2} = \\frac{\\ln 2}{k}", label: "first-order half-life", unit: "s", solve: (k) => (0.693 / k).toFixed(2) },
    graph: "Maxwell-Boltzmann kinetic energy distribution showing increased fraction of molecules exceeding Ea at higher temperatures",
    experiment: {"iv":"Concentration of sodium thiosulfate reacting with hydrochloric acid","dv":"Time required for sulfur precipitate to obscure a black cross beneath the beaker","controls":"Total volume, acid concentration, reaction temperature"},
    misconception: "Catalysts increase product yield or alter the position of chemical equilibrium, rather than solely accelerating the rate to reach equilibrium faster",
    application: "Enzymatic glucose biosensors in diabetic continuous glucose monitors utilizing glucose oxidase catalysis",
    perturbation: "Adding manganese dioxide catalyst to hydrogen peroxide, causing instantaneous effervescence of oxygen gas",
    comparison: "Differential rate law (rate as a function of concentration) versus integrated rate law (concentration as a function of elapsed time)",
    errorAnalysis: "Temperature fluctuations during kinetics trials altering the rate constant k exponentially according to the Arrhenius equation",
    boundary: "Diffusion-controlled limit: maximum theoretical reaction rate (~10¹⁰ M⁻¹s⁻¹) where every encounter between reactants results in reaction",
    cer1: {"prompt":"A student doubles reactant A concentration and observes reaction rate quadruples. Determine the reaction order.","claim":"The reaction is second-order with respect to reactant A (Rate ∝ [A]²).","ev":"Rate ratio: Rate2 / Rate1 = 4. Concentration ratio: [A]2 / [A]1 = 2. Mathematical relation: 2^m = 4 implies m = 2.","reas":"Second-order kinetics indicates the rate-determining elementary step involves collision between two molecules of reactant A."},
    historical: "Svante Arrhenius's 1889 formulation connecting reaction rates, temperature, and activation energy k = A e^(-Ea/RT)",
    cer2: {"prompt":"Explain how biological enzymes achieve up to 10¹²-fold rate enhancements without being consumed in metabolic pathways.","claim":"Enzymes stabilize the high-energy transition state through active-site complementary binding, dramatically lowering activation energy Ea.","ev":"Enzyme-catalyzed reactions have Ea barriers that are typically 40–80 kJ/mol lower than uncatalyzed counterparts.","reas":"According to the Arrhenius equation, reducing Ea exponentially increases the fraction of molecular collisions with sufficient energy to react."},
    terminology: {"term":"Activation Energy","def":"The minimum kinetic energy required by colliding reactant particles to initiate a chemical transformation"},
    everyday: {"phenomenon":"Refrigerating perishable food","explanation":"Lower temperatures decrease molecular collision frequency and energy, dramatically slowing bacterial enzymatic spoilage rates"},
    lessons: {
      1: {
        system: "Collision Theory: Activation Energy & Transition State Activated Complexes",
        mechanism: "Reactant molecules colliding with kinetic energy exceeding activation energy Ea and correct spatial orientation to form transition state complexes",
        terminology: {"term":"Activation Energy","def":"The minimum amount of energy required by reacting particles in order to form the activated complex and lead to a reaction"},
        calc1: { formula: "E_a = E_{\\text{complex}} - E_{\\text{reactants}}", label: "forward activation barrier", unit: "\\text{kJ/mol}", solve: (ec, er) => (ec - er).toFixed(1) },
        everyday: {"phenomenon":"Lighting a match by striking it against a rough matchbox strip","explanation":"Mechanical friction supplies the initial activation energy required to trigger the self-sustaining exothermic combustion of phosphorus"},
        misconception: "Every collision between reactant molecules leads to a chemical reaction, ignoring orientation requirements and activation energy barriers"
      },
      2: {
        system: "Factors Affecting Reaction Rates: Concentration, Temperature, Surface Area & Catalysts",
        mechanism: "Increasing collision frequency and elevating Maxwell-Boltzmann fractions exceeding Ea, with catalysts offering alternative low-energy pathways",
        terminology: {"term":"Catalyst","def":"A substance that increases the rate of a chemical reaction by lowering activation energy without itself being consumed in the reaction"},
        calc1: { formula: "\\text{Rate Factor} \\approx 2^{\\Delta T / 10}", label: "temperature rate multiplier", unit: "", solve: (dt) => Math.pow(2, dt / 10).toFixed(1) },
        everyday: {"phenomenon":"Automobile catalytic converters cleaning toxic exhaust gases","explanation":"Platinum-rhodium catalysts lower activation energy, rapidly converting unburned hydrocarbons and carbon monoxide into harmless CO2 and water"},
        misconception: "Catalysts increase product yield at equilibrium, rather than accelerating both forward and reverse rates equally to reach equilibrium faster"
      },
      3: {
        system: "Differential Rate Laws: Initial Rates Method, Reaction Orders & Rate Constants",
        mechanism: "Quantifying experimental rate dependence on individual reactant concentrations via differential power-law relationships",
        terminology: {"term":"Rate Law","def":"A mathematical relationship that expresses reaction rate in terms of the concentrations of reactants raised to experimentally determined powers"},
        calc1: { formula: "\\text{Rate} = k[A]^m [B]^n", label: "reaction rate", unit: "\\text{M/s}", solve: (k, a, b) => (k * a * b).toFixed(4) },
        everyday: {"phenomenon":"Perishable milk spoiling far more rapidly when left on warm kitchen counters","explanation":"Chemical spoiling rates scale with bacterial enzymatic rate constants that increase exponentially with elevated ambient temperature"},
        misconception: "Reaction orders in rate laws are determined directly from the stoichiometric coefficients of the balanced overall equation"
      },
      4: {
        system: "Reaction Mechanisms: Elementary Steps, Intermediates & Rate-Determining Bottlenecks",
        mechanism: "Multi-step microscopic reaction sequences where the slowest elementary step dictates the overall kinetic rate of product formation",
        terminology: {"term":"Rate-Determining Step","def":"The slowest elementary step in a complex multi-step reaction mechanism that limits the overall reaction rate"},
        calc1: { formula: "\\text{Overall Rate} = \\text{Rate}_{\\text{slow step}}", label: "bottleneck rate law", unit: "\\text{M/s}", solve: (r) => String(r) },
        everyday: {"phenomenon":"Traffic congestion bottlenecking on a bridge where three lanes merge into one","explanation":"The overall throughput of the highway is limited by the slowest bottleneck lane, exactly like the rate-determining step in a mechanism"},
        misconception: "Reaction intermediates are identical to catalysts, confusing species produced and then consumed with species added and recovered unchanged"
      },
    }
  },
  16: {
    system: "Chemical Dynamic Equilibrium & Le Chatelier Shifts",
    mechanism: "Forward and reverse reaction rates become exactly equal (rf = rr), resulting in constant macroscopic concentrations despite continuous microscopic molecular exchange",
    calc1: { formula: "K = \\frac{[C]^c [D]^d}{[A]^a [B]^b}", label: "equilibrium constant", unit: "", solve: (c, d, a, b) => ((c * d) / (a * b)).toFixed(3) },
    calc2: { formula: "Q = \\frac{[C]^c [D]^d}{[A]^a [B]^b}", label: "reaction quotient", unit: "", solve: (c, d, a, b) => ((c * d) / (a * b)).toFixed(3) },
    graph: "Concentration vs time graph showing reactants and products leveling off at constant horizontal plateaus at equilibrium",
    experiment: {"iv":"Temperature shift applied to cobalt chloride equilibrium [Co(H2O)6]²⁺ (pink) ⇌ [CoCl4]²⁻ (blue) + 6H2O","dv":"Color absorbance shift between pink and blue spectrophotometric peaks","controls":"Total cobalt concentration, chloride concentration"},
    misconception: "At chemical equilibrium, concentrations of reactants and products must be equal, rather than rates of forward and reverse reactions being equal",
    application: "Industrial ammonia synthesis continuously condensing and removing liquid NH3 to permanently drive the Haber equilibrium forward",
    perturbation: "Compressing an equilibrium mixture containing unequal moles of gas, driving the shift toward the side with fewer gas moles",
    comparison: "Reaction quotient Q (calculated at any instantaneous non-equilibrium state) versus Equilibrium constant K (true thermodynamic equilibrium)",
    errorAnalysis: "Failing to account for temperature shifts: K is a constant only at constant temperature; changing T changes K itself",
    boundary: "Irreversible reactions where reverse activation energy is insurmountable, driving equilibrium to essentially infinite K (K → ∞)",
    cer1: {"prompt":"Predict the response of the Haber equilibrium N2(g) + 3H2(g) ⇌ 2NH3(g) (exothermic) when container volume is halved.","claim":"The system shifts to the right, favoring the forward production of ammonia.","ev":"Reactants have 4 moles of gas (1 N2 + 3 H2); products have 2 moles of gas (2 NH3). Halving volume doubles total pressure.","reas":"By Le Chatelier's Principle, the system opposes pressure increases by shifting toward the side possessing fewer moles of gas."},
    historical: "Henri Louis Le Chatelier's 1884 principle predicting how dynamic equilibria respond to external disturbances",
    cer2: {"prompt":"Analyze what happens when an inert gas (e.g. Helium) is injected into an equilibrium vessel at constant volume.","claim":"Injecting an inert gas at constant volume produces zero shift in chemical equilibrium.","ev":"Total pressure increases, but partial pressures of reactants and products remain completely unchanged.","reas":"Equilibrium depends exclusively on the partial pressures (or concentrations) of participating reactive species, which remain constant."},
    terminology: {"term":"Le Chatelier's Principle","def":"If a stress is applied to a system at equilibrium, the system shifts in the direction that relieves the stress"},
    everyday: {"phenomenon":"Carbonated soda fizzing upon opening","explanation":"Releasing cap pressure lowers CO2 partial pressure; equilibrium shifts left to decompose aqueous carbonic acid into escaping CO2 gas"},
    lessons: {
      1: {
        system: "Dynamic Chemical Equilibrium: Reversibility & The Equilibrium Constant Expression",
        mechanism: "Forward and reverse reaction rates becoming exactly equal, maintaining constant macroscopic concentrations without stopping microscopic exchanges",
        terminology: {"term":"Chemical Equilibrium","def":"A dynamic state in which forward and reverse chemical reactions occur at equal rates, resulting in constant reactant and product concentrations"},
        calc1: { formula: "K_{\\text{eq}} = \\frac{[C]^c [D]^d}{[A]^a [B]^b}", label: "equilibrium constant", unit: "", solve: (c, d, a, b) => ((c * d) / (a * b)).toFixed(3) },
        everyday: {"phenomenon":"A sealed carbonated beverage bottle maintaining constant bubble pressure","explanation":"Dissolved CO2 escapes into gas at the exact same rate that gaseous CO2 re-dissolves, establishing a steady dynamic equilibrium"},
        misconception: "At chemical equilibrium, the concentrations of reactants and products are equal, rather than rates of forward and reverse reactions being equal"
      },
      2: {
        system: "Le Chatelier's Principle: Stress Response to Concentration, Pressure & Temperature",
        mechanism: "Thermodynamic shifts in equilibrium position that oppose external disturbances to re-establish dynamic balance",
        terminology: {"term":"Le Chatelier's Principle","def":"The principle stating that if a stress is applied to a system at equilibrium, the system shifts in the direction that relieves the stress"},
        calc1: { formula: "Q < K_{\\text{eq}} \\implies \\text{Shift Right}", label: "equilibrium shift prediction", unit: "", solve: () => "Forward Shift" },
        everyday: {"phenomenon":"Industrial Haber-Bosch ammonia synthesis operating at high pressures","explanation":"Compresing N2 + 3H2 ⇌ 2NH3 shifts equilibrium toward the side with fewer gas moles (2 vs 4), maximizing commercial ammonia output"},
        misconception: "Adding a catalyst shifts the equilibrium position toward products, rather than simply shortening the time required to achieve equilibrium"
      },
      3: {
        system: "Equilibrium Calculations: Reaction Quotient Q, ICE Tables & Solubility Product Ksp",
        mechanism: "Comparing instantaneous reaction quotients Q to Keq to determine shift direction, and quantifying sparingly soluble salt dissolution",
        terminology: {"term":"Solubility Product Constant","def":"An equilibrium constant representing the product of dissolved ion concentrations for a sparingly soluble ionic compound"},
        calc1: { formula: "K_{sp} = [M^{n+}]^m [X^{m-}]^n", label: "solubility product constant", unit: "", solve: (s) => (s * s).toExponential(2) },
        everyday: {"phenomenon":"Kidney stones forming when calcium oxalate exceeds solubility limits","explanation":"When the ion concentration product Q exceeds the Ksp of calcium oxalate, insoluble kidney stone crystals precipitate in renal tubules"},
        misconception: "Pure solid precipitates and pure liquid solvents are included in equilibrium constant expressions, ignoring invariant unit activities"
      },
    }
  },
  17: {
    system: "Acids, Bases, pH & Buffer Thermodynamics",
    mechanism: "Proton (H⁺/H3O⁺) transfer equilibria governed by acid dissociation constants Ka and water autoionization Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴",
    calc1: { formula: "\\text{pH} = -\\log[\\text{H}^+]", label: "pH value", unit: "", solve: (h) => (-Math.log10(h)).toFixed(2) },
    calc2: { formula: "\\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{A}^-]}{[\\text{HA}]}", label: "buffer pH", unit: "", solve: (pka, a, ha) => (pka + Math.log10(a / ha)).toFixed(2) },
    graph: "Sigmoidal acid-base titration curve displaying buffer plateau region, steep vertical equivalence jump, and basic/acidic endpoints",
    experiment: {"iv":"Volume of standardized NaOH titrant added to acetic acid sample","dv":"pH monitored with a calibrated glass electrode pH meter","controls":"Stirring rate, temperature, ionic strength"},
    misconception: "The equivalence point of any acid-base titration must always be at pH 7.0, ignoring basic or acidic hydrolysis of conjugate salts",
    application: "Human blood bicarbonate buffer system maintaining physiological arterial pH strictly within life-sustaining 7.35–7.45 window",
    perturbation: "Hyperventilation blowing off gaseous CO2, shifting carbonic acid equilibrium and inducing respiratory alkalosis",
    comparison: "Strong acids (100% dissociated in water, Ka >> 1) versus weak acids (partially dissociated equilibrium, Ka << 1)",
    errorAnalysis: "Uncalibrated pH meter electrode drift introducing systematic offset across entire titration curve",
    boundary: "Buffer capacity limit: exhausting either conjugate weak acid or base component causes catastrophic buffer breakdown",
    cer1: {"prompt":"Explain why the equivalence point of a weak acid titration (e.g. CH3COOH with NaOH) occurs at a basic pH (pH ~ 8.7).","claim":"The equivalence point is basic because the resulting conjugate base (acetate) hydrolyzes in water to produce hydroxide ions.","ev":"At equivalence, all acetic acid is converted to CH3COO⁻. CH3COO⁻ + H2O ⇌ CH3COOH + OH⁻ yields measurable basicity.","reas":"Hydrolysis of weak acid conjugate bases produces excess OH⁻, shifting the neutrality balance above pH 7.0."},
    historical: "Søren Sørensen's 1909 introduction of the logarithmic pH scale at the Carlsberg Laboratory",
    cer2: {"prompt":"Evaluate how a buffer solution containing 0.10 M acetic acid and 0.10 M sodium acetate resists pH changes when strong base is added.","claim":"Added OH⁻ is neutralized by the weak acid component (CH3COOH + OH⁻ → CH3COO⁻ + H2O), preventing major pH shift.","ev":"Adding 0.01 mol NaOH shifts pH by only 0.09 units according to the Henderson-Hasselbalch equation.","reas":"The buffer acts as a chemical sponge: conjugate weak acid neutralizes added base while conjugate base neutralizes added acid."},
    terminology: {"term":"Buffer Solution","def":"A mixture of a weak acid and its conjugate base that resists changes in pH upon addition of small amounts of strong acid or base"},
    everyday: {"phenomenon":"Antacid soothing heartburn","explanation":"Magnesium hydroxide or calcium carbonate in antacids neutralizes excess hydrochloric acid in the stomach via acid-base neutralization"},
    lessons: {
      1: {
        system: "Acid-Base Models: Arrhenius vs Brønsted-Lowry Conjugate Pairs & Amphoterism",
        mechanism: "Proton (H+) transfer from Brønsted-Lowry acids to Brønsted-Lowry bases, forming complementary conjugate acid-base pairs in aqueous media",
        terminology: {"term":"Brønsted-Lowry Acid","def":"A substance that donates a hydrogen ion (proton) to another substance in a chemical reaction"},
        calc1: { formula: "\\text{Conjugate Pair: } \\text{HA} \\rightleftharpoons \\text{H}^+ + \\text{A}^-", label: "conjugate proton transfer", unit: "", solve: () => "Proton Transfer" },
        everyday: {"phenomenon":"Baking soda neutralizing both battery acid spills and caustic bleach","explanation":"Bicarbonate ions (HCO3-) are amphoteric, capable of acting as either a proton donor or proton acceptor to neutralize acids or bases"},
        misconception: "All acids must contain oxygen in their formulas, confusing Arrhenius and Brønsted-Lowry models with historical Lavoisier concepts"
      },
      2: {
        system: "Acid and Base Strengths: Complete vs Partial Ionization & Ka/Kb Constants",
        mechanism: "Strong acids ionizing 100% due to weak conjugate bases, while weak acids establish partial ionization equilibria governed by Ka values",
        terminology: {"term":"Acid Ionization Constant","def":"The equilibrium constant for the ionization of a weak acid in water, measuring its intrinsic acidic strength"},
        calc1: { formula: "K_a = \\frac{[\\text{H}^+][\\text{A}^-]}{[\\text{HA}]}", label: "acid ionization constant", unit: "", solve: (h, a, ha) => ((h * a) / ha).toExponential(2) },
        everyday: {"phenomenon":"Using vinegar (5% acetic acid) safely on salads while avoiding hydrochloric acid","explanation":"Acetic acid is a weak acid that ionizes less than 1% in water, producing a mild sour flavor rather than corrosive tissue damage"},
        misconception: "A concentrated solution of a weak acid is identical to a strong acid, confusing solution concentration (molarity) with ionization strength"
      },
      3: {
        system: "The pH and pOH Scales: Self-Ionization of Water & Logarithmic Hydrogen Metrics",
        mechanism: "Water autoionization Kw = [H+][OH-] = 1.0 × 10⁻¹⁴ maintaining inverse reciprocal relationships between hydronium and hydroxide concentrations",
        terminology: {"term":"pH","def":"The negative logarithm of the hydrogen ion concentration of a solution, representing acidity on a 0 to 14 logarithmic scale"},
        calc1: { formula: "\\text{pH} = -\\log[\\text{H}^+]", label: "pH value", unit: "", solve: (h) => (-Math.log10(h)).toFixed(2) },
        everyday: {"phenomenon":"A drop from pH 7 to pH 5 representing a 100-fold surge in acidity","explanation":"Because the pH scale is logarithmic, each single integer drop represents a ten-fold increase in free hydronium ion concentration"},
        misconception: "A neutral solution always has a pH of exactly 7.00 at all temperatures, ignoring that water's autoionization constant Kw varies with temperature"
      },
      4: {
        system: "Neutralization, Titrations, Indicators & Chemical Buffer Systems",
        mechanism: "Protons combining with hydroxide ions to form neutral water alongside conjugate buffers resisting pH changes via common-ion reservoirs",
        terminology: {"term":"Equivalence Point","def":"The stoichiometric point in a titration where the number of moles of hydrogen ions equals the number of moles of hydroxide ions"},
        calc1: { formula: "M_A V_A = M_B V_B", label: "titration neutralization volume", unit: "\\text{mL}", solve: (ma, va, mb) => ((ma * va) / mb).toFixed(1) },
        everyday: {"phenomenon":"Human blood maintaining a steady pH of 7.40 despite intense lactic acid production","explanation":"Carbonic acid-bicarbonate buffer systems in blood neutralize excess H+ ions, preventing fatal acidosis during vigorous exercise"},
        misconception: "The equivalence point of any acid-base titration is always at neutral pH 7.00, ignoring salt hydrolysis of weak acid-strong base conjugate pairs"
      },
    }
  },
  18: {
    system: "Oxidation-Reduction (Redox) Reactions",
    mechanism: "Transfer of electrons from reducing agent (oxidized species, oxidation state increases) to oxidizing agent (reduced species, oxidation state decreases)",
    calc1: { formula: "\\Delta \\text{Ox} = \\text{Ox}_{\\text{final}} - \\text{Ox}_{\\text{initial}}", label: "oxidation state change", unit: "", solve: (f, i) => String(f - i) },
    calc2: { formula: "e^- = n \\times F", label: "transferred charge", unit: "C", solve: (n) => (n * 96485).toFixed(0) },
    graph: "Redox titration potential curve displaying sudden voltage jump at stoichiometric equivalence point",
    experiment: {"iv":"Identity of metal strips immersed in aqueous copper(II) sulfate (Zn, Fe, Ag)","dv":"Spontaneous deposition of metallic copper and discoloration of blue Cu²⁺ solution","controls":"Surface area of metal, concentration of Cu²⁺, solution temperature"},
    misconception: "Oxidation must involve oxygen, rather than being fundamentally defined as the loss of electrons (OIL RIG)",
    application: "Sacrificial zinc galvanic anodes attached to steel ship hulls preventing seawater iron oxidation and hull rust",
    perturbation: "Adding a strong complexing agent (e.g. cyanide or ammonia) that shifts half-cell reduction potentials",
    comparison: "Oxidizing agent (gains electrons, causes oxidation of another substance) versus reducing agent (loses electrons, causes reduction)",
    errorAnalysis: "Passive oxide surface films on metals (e.g. aluminum) preventing electrical contact and inhibiting spontaneous redox reactions",
    boundary: "Electrochemical stability window of water (1.23 V): potentials beyond this trigger spontaneous water splitting into H2 and O2",
    cer1: {"prompt":"A piece of zinc metal placed in blue copper sulfate solution causes copper to precipitate and zinc to dissolve. Justify the redox mechanism.","claim":"Zinc acts as the reducing agent, spontaneously transferring electrons to copper ions (Zn + Cu²⁺ → Zn²⁺ + Cu).","ev":"Zinc oxidation state increases from 0 to +2 (oxidation); copper decreases from +2 to 0 (reduction). Blue solution fades as Cu²⁺ is consumed.","reas":"Zinc has a more negative standard reduction potential (-0.76 V) than copper (+0.34 V), providing a positive thermodynamic driving force (+1.10 V)."},
    historical: "Michael Faraday's 1834 laws of electrolysis quantifying the relationship between electric charge and chemical mass",
    cer2: {"prompt":"Balance the redox reaction of permanganate with iron(II) in acidic solution: MnO4⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺.","claim":"The balanced equation is MnO4⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H2O.","ev":"Reduction half-reaction: MnO4⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H2O; Oxidation half-reaction: 5(Fe²⁺ → Fe³⁺ + e⁻). Total charge balances at +17 on both sides.","reas":"Mass and charge must be conserved simultaneously in all oxidation-reduction half-reaction balances."},
    terminology: {"term":"Oxidation","def":"The loss of electrons during a chemical reaction, resulting in an increase in oxidation state"},
    everyday: {"phenomenon":"Browning of sliced apples","explanation":"Enzymatic polyphenol oxidases in apple flesh use atmospheric oxygen to oxidize phenolic compounds into brown melanins"},
    lessons: {
      1: {
        system: "Oxidation-Reduction Fundamentals: Electron Transfer & Oxidation Numbers",
        mechanism: "Simultaneous oxidation (loss of electrons, increase in oxidation number) and reduction (gain of electrons, decrease in oxidation number)",
        terminology: {"term":"Oxidation","def":"The complete or partial loss of electrons from a reacting substance, accompanied by an increase in oxidation number"},
        calc1: { formula: "\\Delta \\text{Ox} = \\text{Ox}_{\\text{final}} - \\text{Ox}_{\\text{initial}}", label: "oxidation number shift", unit: "", solve: (f, i) => String(f - i) },
        everyday: {"phenomenon":"Apples browning rapidly after being sliced and exposed to air","explanation":"Polyphenol oxidases catalyze the oxidation of organic molecules in apple flesh by atmospheric oxygen, forming dark melanin pigments"},
        misconception: "Oxidation can take place independently without an accompanying reduction reaction, violating the conservation of electric charge"
      },
      2: {
        system: "Balancing Redox Reactions: Oxidation-Number & Half-Reaction Methods",
        mechanism: "Splitting overall redox processes into oxidation and reduction half-reactions, balancing electrons transferred, mass, and charges with H+ and H2O",
        terminology: {"term":"Half-Reaction","def":"One of the two parts of a redox reaction—either the oxidation reaction or the reduction reaction—showing transferred electrons"},
        calc1: { formula: "N_{e^- \\text{ lost}} = N_{e^- \\text{ gained}}", label: "balanced electron count", unit: "", solve: (n) => String(n) },
        everyday: {"phenomenon":"Bleach removing stubborn stains from white fabrics","explanation":"Sodium hypochlorite oxidizes chromophores in colored stain molecules, breaking conjugated double bonds and rendering stains colorless"},
        misconception: "Balancing redox equations only requires balancing individual atoms while ignoring net electrical charge conservation"
      },
    }
  },
  19: {
    system: "Electrochemistry, Galvanic Cells & Nernst Potential",
    mechanism: "Spontaneous chemical redox energy converted into electrical current via spatially separated anode (oxidation) and cathode (reduction) half-cells",
    calc1: { formula: "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}", label: "standard cell potential", unit: "V", solve: (c, a) => (c - a).toFixed(2) },
    calc2: { formula: "\\Delta G^\\circ = -nFE^\\circ", label: "standard free energy", unit: "kJ/mol", solve: (n, e) => (-n * 96.485 * e).toFixed(1) },
    graph: "Galvanic cell discharge voltage curve maintaining steady plateau before steep depletion drop at chemical exhaustion",
    experiment: {"iv":"Concentration ratio [Zn²⁺]/[Cu²⁺] in a Daniell cell","dv":"Cell voltage measured with high-impedance digital multimeter","controls":"Electrode composition, temperature (298 K), salt bridge ionic conductivity"},
    misconception: "Electrons flow through the salt bridge, rather than ions migrating through the electrolyte to maintain internal electrical neutrality",
    application: "Lithium-ion rechargeable batteries powering electric vehicles and smartphones via reversible intercalation into graphite anodes and cobalt cathodes",
    perturbation: "Depleting reactant ion concentration at the cathode until reaction quotient Q increases, dropping cell voltage toward zero according to Nernst equation",
    comparison: "Galvanic/Voltaic cell (spontaneous chemical reaction generating electricity, E°cell > 0) versus Electrolytic cell (external power driving non-spontaneous reaction, E°cell < 0)",
    errorAnalysis: "Salt bridge air bubbles interrupting ionic migration, causing measured cell voltage to drop abruptly to zero",
    boundary: "Complete electrochemical equilibrium where battery cell voltage reaches exactly 0.00 V: ΔG = 0 and Q = K",
    cer1: {"prompt":"Calculate standard cell potential for a zinc-copper Daniell cell given E°(Cu²⁺/Cu) = +0.34 V and E°(Zn²⁺/Zn) = -0.76 V.","claim":"The standard cell potential is exactly +1.10 V and the reaction is spontaneous under standard state conditions.","ev":"E°cell = E°cathode - E°anode = +0.34 V - (-0.76 V) = +1.10 V. ΔG° = -nFE° = -2 × 96485 × 1.10 = -212 kJ/mol.","reas":"Positive standard cell voltage corresponds to a negative Gibbs free energy change, providing thermodynamic driving potential for spontaneous electron flow."},
    historical: "Alessandro Volta's 1800 invention of the voltaic pile and John Daniell's 1836 standard battery cell",
    cer2: {"prompt":"Explain how concentration cells generate voltage despite possessing identical metal electrodes in both half-cells.","claim":"Voltage is generated by a concentration gradient driving entropy gain until ion concentrations in both half-cells equalize.","ev":"According to the Nernst equation E = E° - (0.0592/n) log([dilute]/[concentrated]): when [conc] > [dilute], E is positive even though E° = 0.","reas":"Dilution is thermodynamically spontaneous; oxidation occurs in the dilute beaker to produce ions, while reduction occurs in the concentrated beaker to consume ions."},
    terminology: {"term":"Anode","def":"The electrode at which oxidation occurs, acting as the negative terminal in a galvanic cell"},
    everyday: {"phenomenon":"Flashlight battery death","explanation":"As chemicals react, reactant concentrations fall and product concentrations rise; Q approaches K and battery voltage drops to zero"},
    lessons: {
      1: {
        system: "Voltaic Cells: Galvanic Electrochemistry & Standard Cell Potentials",
        mechanism: "Spontaneous electron flow through external circuits from anode oxidation to cathode reduction, balanced by salt bridge counter-ion diffusion",
        terminology: {"term":"Standard Reduction Potential","def":"The voltage produced by a half-cell reduction reaction compared to the standard hydrogen electrode under standard state conditions"},
        calc1: { formula: "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}", label: "standard cell voltage", unit: "\\text{V}", solve: (c, a) => (c - a).toFixed(2) },
        everyday: {"phenomenon":"A copper-zinc Daniell galvanic cell powering a digital clock","explanation":"Spontaneous oxidation of zinc releases electrons that travel through wire to reduce copper ions, generating a stable 1.10 V direct current"},
        misconception: "Electrons flow through the salt bridge between half-cells, rather than ions migrating through the gel to balance electrical charge"
      },
      2: {
        system: "Commercial Batteries, Fuel Cells & Sacrificial Cathodic Protection",
        mechanism: "Self-contained portable electrochemical power sources operating via irreversible primary or reversible secondary redox reactions",
        terminology: {"term":"Fuel Cell","def":"A voltaic cell in which the oxidation of a continuous fuel supply (such as hydrogen) produces direct electrical energy"},
        calc1: { formula: "V_{\\text{battery}} = N_{\\text{cells}} \\times E_{\\text{cell}}", label: "total battery stack voltage", unit: "\\text{V}", solve: (n, v) => (n * v).toFixed(1) },
        everyday: {"phenomenon":"Rechargeable lithium-ion batteries powering modern smartphones and laptops","explanation":"Lithium ions intercalate reversibly between graphite anodes and cobalt oxide cathodes during discharge, reversing direction during charging"},
        misconception: "Batteries store pure electrical charge like a reservoir, rather than storing chemical potential energy that converts into electricity via redox"
      },
      3: {
        system: "Electrolytic Cells: Non-Spontaneous Electrochemistry & Quantitative Faraday Laws",
        mechanism: "External direct current power supplies driving non-spontaneous redox reactions, depositing metallic coatings or splitting water molecules",
        terminology: {"term":"Electrolysis","def":"The process that uses electrical energy from an external power supply to bring about a non-spontaneous chemical redox reaction"},
        calc1: { formula: "m = \\frac{I \\times t \\times M}{n \\times F}", label: "electroplated metal mass", unit: "\\text{g}", solve: (i, t, mw, n) => ((i * t * mw) / (n * 96485)).toFixed(3) },
        everyday: {"phenomenon":"Electroplating chrome or gold onto jewelry and car bumpers","explanation":"Applying negative voltage to a metal object attracts dissolved metal cations from solution, reducing them into a shiny, protective metallic film"},
        misconception: "Electrons flow into the electrolytic solution and swim across to the other electrode, rather than redox occurring at electrode interfaces"
      },
    }
  },
  20: {
    system: "Hydrocarbons, Organic Isomerism & Petroleum Chemistry",
    mechanism: "Carbon sp³, sp², and sp orbital hybridization forming robust catenated chains and rings with single, double, and triple carbon-carbon covalent bonds",
    calc1: { formula: "\\text{Alkane Formula: } \\text{C}_n \\text{H}_{2n+2}", label: "alkane hydrogen count", unit: "", solve: (n) => String(2 * n + 2) },
    calc2: { formula: "\\% \\text{ C} = \\frac{12.011 \\times n}{M_{\\text{compound}}} \\times 100\\%", label: "carbon percentage", unit: "\\%", solve: (n, m) => ((12.011 * n / m) * 100).toFixed(1) },
    graph: "Boiling point trend curves of straight-chain alkanes rising smoothly with increasing carbon chain length",
    experiment: {"iv":"Carbon chain structure (straight-chain n-pentane vs branched 2,2-dimethylpropane)","dv":"Boiling point measured by micro-distillation","controls":"Identical molecular formula C5H12, barometric pressure"},
    misconception: "Structural isomers share identical physical properties, overlooking how molecular branching reduces surface contact and lowers boiling point",
    application: "Fractional distillation and catalytic fluid cracking in oil refineries converting heavy vacuum gas oil into high-octane gasoline fuels",
    perturbation: "Halogenation of alkanes under UV light initiation, triggering free-radical substitution chain reactions",
    comparison: "Saturated hydrocarbons (alkanes with single C-C bonds) versus unsaturated hydrocarbons (alkenes and alkynes with double or triple bonds)",
    errorAnalysis: "Thermal cracking of hydrocarbon samples during uncalibrated boiling point heating trials",
    boundary: "Aromatic resonance stability: benzene's delocalized 6-electron ring resists addition reactions, undergoing substitution instead",
    cer1: {"prompt":"Compare the boiling points of straight-chain n-pentane (36°C) and highly branched neopentane (9.5°C), both having formula C5H12.","claim":"n-Pentane has a higher boiling point because its elongated shape provides greater surface area for London dispersion forces.","ev":"n-Pentane boils at 36°C; compact spherical neopentane boils at 9.5°C despite having identical molecular weight (72.15 g/mol).","reas":"Linear molecules pack more tightly and maximize intermolecular contact, requiring higher thermal energy to overcome dispersion attractions."},
    historical: "Friedrich Wöhler's 1828 synthesis of organic urea from inorganic ammonium cyanate, disproving vitalism",
    cer2: {"prompt":"Explain why alkenes and alkynes undergo rapid addition reactions while aromatic benzene undergoes electrophilic substitution.","claim":"Benzene undergoes substitution to preserve its exceptionally stable, delocalized 6-electron aromatic resonance ring.","ev":"Bromine water rapidly decolorizes with cyclohexene without a catalyst, but requires an FeBr3 catalyst to react with benzene via substitution.","reas":"Addition across benzene's double bonds would destroy aromatic resonance stabilization (approx 150 kJ/mol resonance energy)."},
    terminology: {"term":"Structural Isomer","def":"Compounds with identical molecular formulas but different structural connectivity of their atoms"},
    everyday: {"phenomenon":"Ripening fruit with ethylene gas","explanation":"Plants naturally synthesize ethylene (C2H4, ethene) as an organic hydrocarbon hormone that triggers fruit ripening"},
    lessons: {
      1: {
        system: "Alkanes: Saturated Hydrocarbons, Straight/Branched Chains & Nomenclature",
        mechanism: "Single sp3 covalent carbon-carbon bonds forming unreactive saturated tetrahedral architectures following CnH2n+2 stoichiometry",
        terminology: {"term":"Alkane","def":"A hydrocarbon that contains only single covalent bonds between carbon atoms, conforming to the formula CnH2n+2"},
        calc1: { formula: "\\text{Alkane Formula: } \\text{C}_n \\text{H}_{2n+2}", label: "alkane hydrogen count", unit: "", solve: (n) => String(2 * n + 2) },
        everyday: {"phenomenon":"Natural gas burning cleanly in home water heaters and stoves","explanation":"Methane (CH4) combusts completely with atmospheric oxygen to produce carbon dioxide, steam, and clean thermal heat"},
        misconception: "Hydrocarbons dissolve readily in water, confusing nonpolar hydrophobic C-C and C-H bonds with polar hydrogen-bonding molecules"
      },
      2: {
        system: "Alkenes and Alkynes: Unsaturated Hydrocarbons, Double/Triple Bonds & Reactivity",
        mechanism: "Pi bond electron density in double (sp2) and triple (sp) carbon bonds undergoing rapid electrophilic addition reactions",
        terminology: {"term":"Alkene","def":"An unsaturated hydrocarbon that contains one or more double covalent bonds between carbon atoms"},
        calc1: { formula: "\\text{Alkene Formula: } \\text{C}_n \\text{H}_{2n}", label: "alkene hydrogen count", unit: "", solve: (n) => String(2 * n) },
        everyday: {"phenomenon":"Ethene (ethylene) gas accelerating fruit ripening in commercial warehouses","explanation":"Plant hormone ethene (C2H4) is an unsaturated alkene whose chemical signaling triggers enzymes that ripen green bananas and tomatoes"},
        misconception: "Double and triple bonds are twice or three times as strong as single bonds, ignoring that pi bonds are significantly weaker than sigma bonds"
      },
      3: {
        system: "Hydrocarbon Isomerism: Structural Isomers, Stereoisomers & Optical Chirality",
        mechanism: "Identical chemical formulas adopting distinct atom-bonding connectivities, rigid geometric cis-trans configurations, or non-superimposable mirror images",
        terminology: {"term":"Chirality","def":"A property of a molecule that exists in right- and left-handed forms that are non-superimposable mirror images of each other"},
        calc1: { formula: "N_{\\text{stereoisomers}} = 2^n", label: "maximum optical stereoisomers", unit: "", solve: (n) => String(Math.pow(2, n)) },
        everyday: {"phenomenon":"Spearmint and caraway seeds possessing identical chemical formulas but totally different aromas","explanation":"R-carvone smells like spearmint while S-carvone smells like caraway because olfactory receptors discriminate between chiral mirror enantiomers"},
        misconception: "Structural isomers share identical physical and chemical properties because they have the exact same molecular formula"
      },
      4: {
        system: "Aromatic Hydrocarbons: Benzene Ring Architecture & Delocalized Pi Resonance",
        mechanism: "Planar hexagonal ring of six sp2 hybridized carbon atoms sharing a delocalized pi electron cloud that confers exceptional chemical stability",
        terminology: {"term":"Aromatic Compound","def":"An organic compound that contains one or more benzene rings or has cyclic properties resembling those of benzene"},
        calc1: { formula: "\\text{Benzene: } \\text{C}_6\\text{H}_6", label: "aromatic carbon-hydrogen stoichiometry", unit: "", solve: () => "C6H6" },
        everyday: {"phenomenon":"Pleasant sweet aroma of mothballs (naphthalene) and vanilla (vanillin)","explanation":"Volatile aromatic compounds contain resonance-stabilized benzene rings that evaporate easily and bind strongly to nasal olfactory receptors"},
        misconception: "The benzene ring contains alternating static single and double bonds that rapidly flip, rather than an invariant delocalized ring of pi electrons"
      },
    }
  },
  21: {
    system: "Substituted Hydrocarbons, Functional Groups & Polymers",
    mechanism: "Electronegative heteroatoms (O, N, halogens) creating localized bond polarities and reactive electrophilic/nucleophilic centers",
    calc1: { formula: "\\text{Ester Mass: } M_{\\text{acid}} + M_{\\text{alcohol}} - M_{\\text{H}_2\\text{O}}", label: "ester molecular mass", unit: "g/mol", solve: (a, alc) => (a + alc - 18.015).toFixed(2) },
    calc2: { formula: "\\text{Degree of Polym} = \\frac{M_{\\text{polymer}}}{M_{\\text{monomer}}}", label: "polymerization degree", unit: "", solve: (p, m) => (p / m).toFixed(0) },
    graph: "Infrared (IR) spectroscopy absorption spectrum showing characteristic functional group frequencies (carbonyl C=O at 1715 cm⁻¹, broad O-H at 3300 cm⁻¹)",
    experiment: {"iv":"Identity of alcohol and carboxylic acid mixed in Fischer esterification","dv":"Aromatic fragrance profile and TLC Rf value of synthesized ester","controls":"Sulfuric acid catalyst volume, reflux time, water bath temperature"},
    misconception: "All alcohols are toxic and drinkable, confusing non-toxic dilute ethanol with lethal metabolic poisons like methanol and ethylene glycol",
    application: "Synthesis of high-tensile Kevlar and nylon condensation polymers for ballistic armor and aerospace composites",
    perturbation: "Acid-catalyzed hydrolysis of esters reversing the reaction into parent carboxylic acids and alcohols",
    comparison: "Aldehydes (carbonyl C=O bonded to at least one terminal hydrogen) versus Ketones (carbonyl bonded to two carbon atoms)",
    errorAnalysis: "Failing to drive off byproduct water in Fischer esterification, preventing equilibrium conversion from reaching high yield",
    boundary: "Optical enantiomers: chiral centers rotate plane-polarized light in opposite directions and exhibit vastly different biological receptor binding",
    cer1: {"prompt":"Analyze the chemical synthesis of aspirin (acetylsalicylic acid) from salicylic acid and acetic anhydride.","claim":"The phenolic -OH group of salicylic acid is acetylated via nucleophilic acyl substitution into an ester.","ev":"Adding acetic anhydride and phosphoric acid catalyst converts salicylic acid into crystalline acetylsalicylic acid with loss of acetic acid.","reas":"Esterification replaces the harsh phenolic group, creating a pharmaceutical compound that relieves pain while reducing gastric irritation."},
    historical: "Leo Baekeland's 1907 invention of Bakelite, the world's first fully synthetic thermoset plastic polymer",
    cer2: {"prompt":"Contrast addition polymerization (e.g. polyethylene) with condensation polymerization (e.g. nylon-6,6).","claim":"Addition polymerization joins monomers across double bonds without byproduct loss; condensation polymerization releases small byproduct molecules.","ev":"Polyethylene: n(H2C=CH2) → -[CH2-CH2]n-. Nylon-6,6: diacid + diamine → polyamide + n(H2O).","reas":"Addition requires unsaturated alkenes; condensation requires bifunctional monomers that react with elimination of water or HCl."},
    terminology: {"term":"Functional Group","def":"A specific group of atoms within an organic molecule responsible for characteristic chemical reactions"},
    everyday: {"phenomenon":"Fruity aroma of candy and cosmetics","explanation":"Volatile organic esters synthesized from carboxylic acids and alcohols mimic natural fruit flavors (e.g. isoamyl acetate smelling like bananas)"},
    lessons: {
      1: {
        system: "Functional Groups: Halocarbons, Alcohols, Carbonyls, Carboxylic Acids & Amines",
        mechanism: "Specific heteroatom arrangements (O, N, halogens) imparting distinct chemical reactivity, polarity, and intermolecular bonding to organic backbones",
        terminology: {"term":"Functional Group","def":"An atom or group of atoms within an organic molecule that always reacts in a characteristic way, determining chemical properties"},
        calc1: { formula: "\\text{Alcohol: } \\text{R-OH}", label: "functional group motif", unit: "", solve: () => "Hydroxyl" },
        everyday: {"phenomenon":"Rubbing alcohol evaporating rapidly with an intense cooling sensation on skin","explanation":"Isopropanol contains a polar hydroxyl functional group (-OH) that confers high volatility alongside antiseptic antimicrobial properties"},
        misconception: "All organic molecules containing oxygen are acidic, confusing neutral alcohols and ethers with ionizable carboxylic acids (-COOH)"
      },
      2: {
        system: "Organic Reactions: Substitution, Addition, Elimination & Ester Condensations",
        mechanism: "Nucleophilic substitutions, pi bond additions, dehydration eliminations, and esterifications forming complex organic structures",
        terminology: {"term":"Condensation Reaction","def":"An organic chemical reaction in which two smaller molecules combine to form a larger molecule, accompanied by the loss of a small molecule like water"},
        calc1: { formula: "\\text{Ester Mass: } M_{\\text{acid}} + M_{\\text{alcohol}} - 18.015", label: "ester molecular mass", unit: "\\text{g/mol}", solve: (a, alc) => (a + alc - 18.015).toFixed(2) },
        everyday: {"phenomenon":"Sweet fruity aromas of artificial banana or wintergreen flavorings","explanation":"Synthesizing organic esters from carboxylic acids and alcohols produces volatile fragrance molecules used in perfumes and confectionery"},
        misconception: "Organic reactions occur instantaneously at room temperature without requiring acid or base catalysts, ignoring high covalent activation barriers"
      },
      3: {
        system: "Polymer Chemistry: Addition vs Condensation Polymerization & Synthetic Plastics",
        mechanism: "Covalent linking of small monomer units into massive macromolecular chains via radical pi-bond addition or water-eliminating condensation",
        terminology: {"term":"Polymer","def":"A large organic macromolecule composed of repeating structural units called monomers connected by covalent chemical bonds"},
        calc1: { formula: "M_{\\text{polymer}} = n \\times M_{\\text{monomer}}", label: "polymeric macromolecular mass", unit: "\\text{g/mol}", solve: (n, m) => (n * m).toFixed(0) },
        everyday: {"phenomenon":"Recycling plastic milk jugs (HDPE) and soda bottles (PETE)","explanation":"Thermoplastic polymers melt upon heating and can be remolded into new consumer products because linear chains slide past each other"},
        misconception: "Polymers are fragile because they are held together only by intermolecular forces, ignoring strong continuous covalent backbone bonds"
      },
    }
  },
  22: {
    system: "The Chemistry of Life: Biological Macromolecules",
    mechanism: "Enzymatic condensation polymerization forming peptide, phosphodiester, and glycosidic linkages between amino acids, nucleotides, and monosaccharides",
    calc1: { formula: "\\text{Peptide Mass} = \\sum M_{\\text{aa}} - (N - 1) \\times 18.015", label: "polypeptide mass", unit: "g/mol", solve: (m, n) => (m - (n - 1) * 18.015).toFixed(1) },
    calc2: { formula: "V = \\frac{V_{\\max} [S]}{K_m + [S]}", label: "Michaelis-Menten rate", unit: "\\mu\\text{M/s}", solve: (vmax, s, km) => ((vmax * s) / (km + s)).toFixed(2) },
    graph: "Enzyme activity vs temperature curve rising to optimum (37°C) before crashing steeply due to thermal denaturation",
    experiment: {"iv":"Substrate concentration [S] in an enzyme-catalyzed reaction","dv":"Initial velocity V0 measured spectrophotometrically","controls":"Enzyme concentration [E], buffer pH, temperature"},
    misconception: "Denaturation breaks the covalent peptide bonds of proteins, rather than disrupting non-covalent secondary and tertiary folding interactions",
    application: "Lipid nanoparticle delivery vehicles encapsulating synthetic mRNA in modern vaccine biotechnology",
    perturbation: "Drastic pH deviation disrupting ionic salt bridges and hydrogen bonds, precipitating denatured enzymes",
    comparison: "DNA (deoxyribose sugar, thymine, double helix) versus RNA (ribose sugar, uracil, single stranded)",
    errorAnalysis: "Protease contamination hydrolyzing polypeptide samples during protein purification assays",
    boundary: "Catalytic perfection: enzymes operating at the diffusion limit where every collision with substrate results in product formation",
    cer1: {"prompt":"Explain how extreme heat causes irreversible loss of biological function in protein enzymes.","claim":"Excess thermal kinetic energy overcomes weak hydrogen bonds and hydrophobic interactions, denaturing the tertiary active-site architecture.","ev":"Egg white albumin turns permanently opaque and solid upon boiling; heated enzymes lose 100% of catalytic activity.","reas":"Substrate binding requires precise 3D active-site geometry; unfolding the tertiary structure destroys the catalytic binding pocket."},
    historical: "James Watson, Francis Crick, and Rosalind Franklin's 1953 elucidation of the DNA double helix",
    cer2: {"prompt":"Evaluate the role of adenosine triphosphate (ATP) as the universal energy currency of cellular biochemistry.","claim":"ATP hydrolysis (ATP + H2O → ADP + Pi) releases -30.5 kJ/mol of free energy to drive endergonic metabolic reactions.","ev":"Coupling ATP hydrolysis to non-spontaneous reactions (e.g. glucose phosphorylation) makes total net ΔG negative.","reas":"Electrostatic repulsion between clustered negative charges on adjacent phosphate groups makes phosphoanhydride bonds high in chemical potential."},
    terminology: {"term":"Peptide Bond","def":"An amide covalent linkage formed between the carboxyl group of one amino acid and the amino group of another"},
    everyday: {"phenomenon":"Frying an egg","explanation":"Heat denatures clear liquid albumin proteins; untangled chains cross-link into a solid, opaque white network"},
    lessons: {
      1: {
        system: "Proteins: Amino Acid Building Blocks, Peptide Bonds & Folding Hierarchy",
        mechanism: "Condensation of amino and carboxyl groups into peptide bonds, folding into alpha-helices, beta-sheets, and 3D catalytic tertiary structures",
        terminology: {"term":"Peptide Bond","def":"An amide covalent bond that joins two amino acids together, formed between the carboxyl group of one and the amino group of another"},
        calc1: { formula: "\\text{Peptide Mass} = \\sum M_{\\text{aa}} - (N - 1) \\times 18.015", label: "polypeptide molecular mass", unit: "\\text{g/mol}", solve: (m, n) => (m - (n - 1) * 18.015).toFixed(1) },
        everyday: {"phenomenon":"Egg whites turning opaque and firm when boiled or fried","explanation":"Excess thermal kinetic energy disrupts weak hydrogen bonds and hydrophobic interactions, irreversibly denaturing clear liquid albumin protein"},
        misconception: "Protein denaturation breaks strong covalent peptide bonds, rather than unfolding delicate non-covalent secondary and tertiary conformations"
      },
      2: {
        system: "Carbohydrates: Monosaccharides, Glycosidic Bonds & Polysaccharide Storage",
        mechanism: "Ring-forming polyhydroxy aldehydes and ketones linking via glycosidic bonds into structural cellulose or energy-storing glycogen and starch",
        terminology: {"term":"Monosaccharide","def":"The simplest carbohydrate monomer, also known as a simple sugar, having the general molecular formula (CH2O)n"},
        calc1: { formula: "\\text{Formula: } \\text{C}_n(\\text{H}_2\\text{O})_n", label: "carbohydrate monomer formula", unit: "", solve: (n) => `C${n}H${2 * n}O${n}` },
        everyday: {"phenomenon":"Marathon runners eating high-carbohydrate pasta meals before competition","explanation":"Carbohydrate digestion stores glucose as branched glycogen polymers in liver and skeletal muscles, providing rapid aerobic energy reserves"},
        misconception: "Humans can digest cellulose plant fibers like cows, ignoring that human enzymes hydrolyze alpha-glycosidic bonds but not beta-glycosidic bonds"
      },
      3: {
        system: "Lipids: Fatty Acids, Triglycerides, Phospholipid Membranes & Steroids",
        mechanism: "Nonpolar hydrocarbon esterification into energy-dense triglycerides and amphipathic phospholipid bilayers driving cell membrane compartmentalization",
        terminology: {"term":"Phospholipid","def":"A lipid molecule composed of a glycerol backbone, two nonpolar hydrophobic fatty acid tails, and a polar hydrophilic phosphate head"},
        calc1: { formula: "\\text{Triglyceride} = \\text{Glycerol} + 3\\text{ Fatty Acids} - 3\\text{H}_2\\text{O}", label: "triglyceride synthesis", unit: "", solve: () => "Esterification" },
        everyday: {"phenomenon":"Oil and vinegar salad dressing separating into two distinct layers","explanation":"Nonpolar hydrophobic triglyceride fats cannot form hydrogen bonds with polar water molecules, separating into an upper oil layer"},
        misconception: "All dietary fats are unhealthy, failing to recognize that unsaturated essential fatty acids and phospholipids are critical for cell membrane integrity"
      },
      4: {
        system: "Nucleic Acids: Nucleotides, Phosphodiester Backbones & The DNA Double Helix",
        mechanism: "Phosphodiester polymerization of nucleotides forming double-helical genetic templates stabilized by Watson-Crick base-pair hydrogen bonding",
        terminology: {"term":"Nucleotide","def":"The fundamental monomer of a nucleic acid, consisting of a five-carbon sugar, a phosphate group, and a nitrogenous base"},
        calc1: { formula: "\\% A = \\% T, \\quad \\% G = \\% C", label: "Chargaff's base pairing rule", unit: "\\%", solve: (a) => String(a) },
        everyday: {"phenomenon":"Forensic DNA fingerprinting resolving crime scenes from blood drops","explanation":"Unique variable tandem repeat sequences along human DNA produce individualized electrophoretic band profiles matching single individuals"},
        misconception: "The two strands of the DNA double helix are held together by covalent bonds, rather than reversible, complementary hydrogen bonds"
      },
      5: {
        system: "Metabolism: Anabolism, Catabolism, Glycolysis & ATP Energy Coupling",
        mechanism: "Enzymatic oxidative catabolism of glucose coupled to phosphorylation of ADP, producing high-energy ATP molecular fuel",
        terminology: {"term":"Catabolism","def":"The metabolic breakdown of complex organic molecules into simpler ones, accompanied by the release of chemical energy"},
        calc1: { formula: "\\Delta G^\\circ_{\\text{ATP}} = -30.5\\text{ kJ/mol}", label: "ATP hydrolysis free energy", unit: "\\text{kJ/mol}", solve: () => "-30.5" },
        everyday: {"phenomenon":"Muscle fatigue and burning during intense sprinting","explanation":"When oxygen supply lags behind energy demand, muscle cells undergo anaerobic glycolysis, fermenting pyruvate into lactic acid"},
        misconception: "ATP produces energy by creating new bonds, rather than releasing free energy through the hydrolysis of high-energy phosphoanhydride bonds"
      },
    }
  },
  23: {
    system: "Nuclear Chemistry, Radioactivity & Mass-Energy Equivalence",
    mechanism: "Nuclear transmutations governed by the strong nuclear force balancing electrostatic proton repulsion, emitting alpha, beta, and gamma radiation",
    calc1: { formula: "N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t / t_{1/2}}", label: "remaining radioactive mass", unit: "g", solve: (n0, t, th) => (n0 * Math.pow(0.5, t / th)).toFixed(3) },
    calc2: { formula: "E = \\Delta m c^2", label: "nuclear binding energy", unit: "J", solve: (dm) => (dm * 9.0e16).toExponential(3) },
    graph: "Radioactive exponential decay curve plotting activity versus elapsed time measured in half-lives",
    experiment: {"iv":"Shielding material barrier thickness (paper, aluminum, lead)","dv":"Radiation counts per minute recorded by a Geiger-Müller counter","controls":"Distance from radioactive source, detector orientation, background radiation subtraction"},
    misconception: "Radioactive waste stays hazardous forever, ignoring that radioactivity decays predictably according to invariant exponential half-lives",
    application: "Fluorine-18 labeled fluorodeoxyglucose (FDG) in Positron Emission Tomography (PET) scanning for cancer tumor localization",
    perturbation: "Bombarding Uranium-235 with thermal neutrons beyond critical mass, initiating an exponential chain fission reaction",
    comparison: "Nuclear fission (splitting heavy unstable nuclei like U-235) versus Nuclear fusion (combining light nuclei like H isotopes into helium)",
    errorAnalysis: "Failure to subtract ambient natural background radiation (radon, cosmic rays) from low-count radioisotope samples",
    boundary: "Band of stability: nuclei with proton count Z > 82 have no stable isotopes and undergo spontaneous radioactive decay",
    cer1: {"prompt":"A wooden artifact contains 25% of the Carbon-14 activity of modern living wood. Calculate and justify its archaeological age.","claim":"The wooden artifact is approximately 11,460 years old (exactly two half-lives of Carbon-14).","ev":"Carbon-14 half-life is 5,730 years. Fraction remaining = (1/2)^n = 0.25 implies n = 2 half-lives. 2 × 5,730 = 11,460 years.","reas":"Living organisms maintain constant C-14/C-12 ratios via atmospheric exchange; upon death, C-14 decays exponentially via beta emission."},
    historical: "Henri Becquerel and Marie Curie's discovery and isolation of polonium and radium in 1898",
    cer2: {"prompt":"Explain the origin of immense nuclear energy using Einstein's mass-energy equivalence equation E = mc².","claim":"Nuclear reactions convert a small measurable mass defect directly into immense quantities of thermal and radiative energy.","ev":"In U-235 fission, product nuclei have 0.09% less mass than reactants; 1 kg of U-235 yields 8.2 × 10¹³ J of energy.","reas":"Because the conversion factor c² is 9.0 × 10¹⁶ m²/s², destroying even tiny quantities of nuclear matter releases colossal energy."},
    terminology: {"term":"Half-Life","def":"The time required for exactly one-half of the radioactive atomic nuclei in a sample to undergo decay"},
    everyday: {"phenomenon":"Geological heat of Earth's mantle","explanation":"Continuous natural radioactive decay of uranium, thorium, and potassium-40 deep in Earth's core drives geothermal heat and volcanism"},
    lessons: {
      1: {
        system: "Nuclear Radiation: Alpha, Beta, Positron & Gamma Emissions",
        mechanism: "Unstable nuclei emitting charged subatomic particles and high-energy electromagnetic rays to restore proton-neutron stability",
        terminology: {"term":"Radioactivity","def":"The spontaneous emission of radiation, in the form of particles or high-energy photons, by an unstable atomic nucleus"},
        calc1: { formula: "A = Z + N", label: "mass conservation in decay", unit: "", solve: (z, n) => String(z + n) },
        everyday: {"phenomenon":"Wearing heavy lead aprons during medical dental X-rays","explanation":"High-density lead atoms absorb and attenuate penetrating gamma rays and X-ray photons through photoelectric and Compton interactions"},
        misconception: "Radioactivity makes objects permanently glow green in the dark, confusing radioluminescent phosphor coatings with nuclear decay"
      },
      2: {
        system: "Radioactive Decay Series & Half-Life Kinetics: N(t) = N0(1/2)^(t/t1/2)",
        mechanism: "First-order exponential nuclear disintegration where remaining parent nuclei decrease by half over invariant characteristic time intervals",
        terminology: {"term":"Half-Life","def":"The time required for one-half of a radioisotope's nuclei to decay into its products"},
        calc1: { formula: "N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t / t_{1/2}}", label: "remaining radioactive mass", unit: "\\text{g}", solve: (n0, t, th) => (n0 * Math.pow(0.5, t / th)).toFixed(3) },
        everyday: {"phenomenon":"Carbon-14 dating ancient Egyptian papyrus scrolls","explanation":"Living plants assimilate atmospheric C-14; upon death, C-14 decays with a 5,730-year half-life, allowing precise age dating from remaining activity"},
        misconception: "After two half-lives have elapsed, 100% of a radioactive sample has decayed completely, rather than exactly 25% remaining"
      },
      3: {
        system: "Induced Transmutation & Synthetic Transuranium Elements",
        mechanism: "Bombarding stable atomic nuclei with high-speed alpha particles or neutrons in particle accelerators to create synthetic elements",
        terminology: {"term":"Transmutation","def":"The conversion of an atom of one element into an atom of another element through radioactive decay or particle bombardment"},
        calc1: { formula: "Z_{\\text{product}} = Z_{\\text{target}} + Z_{\\text{projectile}}", label: "transmutation atomic number", unit: "", solve: (zt, zp) => String(zt + zp) },
        everyday: {"phenomenon":"Production of Technetium-99m in cyclotrons for medical imaging","explanation":"Neutron bombardment of Molybdenum-98 creates Technetium-99m, which emits short-lived diagnostic gamma rays in hospitals"},
        misconception: "Transmutation is impossible because Dalton stated atoms are indestructible, ignoring that modern nuclear physics routinely transforms elements"
      },
      4: {
        system: "Nuclear Fission, Chain Reactions, Mass Defect & Thermonuclear Fusion",
        mechanism: "Heavy nuclei splitting or light nuclei fusing, converting missing nuclear mass defects directly into colossal energy via E = mc²",
        terminology: {"term":"Nuclear Fission","def":"The splitting of an atomic nucleus into two or more smaller nuclei, accompanied by the release of large amounts of energy and neutrons"},
        calc1: { formula: "E = \\Delta m \\times c^2", label: "nuclear mass-energy release", unit: "\\text{J}", solve: (dm) => (dm * 9.0e16).toExponential(3) },
        everyday: {"phenomenon":"Nuclear power plants generating carbon-free electrical grid power","explanation":"Controlled chain fission of Uranium-235 produces thermal heat that boils water into high-pressure steam spinning electric generator turbines"},
        misconception: "Nuclear power plants can detonate like atomic bombs, failing to recognize that fuel is enriched to only 3-5% U-235 rather than weapons-grade >90%"
      },
      5: {
        system: "Applications and Hazards of Radiation: Detectors, Tracers & Dosimetry",
        mechanism: "Ionizing radiation detection via Geiger gas ionization, scintillation crystals, and dosage tracking in Sieverts and Rems",
        terminology: {"term":"Radiotracer","def":"A radioisotope that can be used to track the path of a chemical pathway or biological process in medical diagnostics"},
        calc1: { formula: "\\text{Dose (Sv)} = \\text{Gray (Gy)} \\times Q", label: "equivalent biological radiation dose", unit: "\\text{Sv}", solve: (gy, q) => (gy * q).toFixed(3) },
        everyday: {"phenomenon":"Cancer patients receiving targeted radiation therapy","explanation":"Focused beams of gamma radiation ionize DNA inside rapidly dividing cancer cells, inducing double-strand breaks that destroy tumor tissue"},
        misconception: "All radiation exposure is immediately lethal, overlooking low-level natural background radiation from cosmic rays and rocks"
      },
    }
  }
};

// =========================================================================
// BIOLOGY MODULE PROFILES (1 - 27)
// =========================================================================
export const BIO_MODULE_PROFILES = {};

const BIO_RAW = [
  { id: 1, title: "The Study of Life", sys: "Cellular Life Characteristics & Organization", mech: "Hierarchical homeostatic organization from macromolecules to cellular metabolic loops", c1: { f: "\\text{Mag} = \\text{Ocular} \\times \\text{Obj}", l: "magnification", u: "\\times", s: (o, ob) => String(o * ob) }, c2: { f: "S/V = \\frac{6}{d}", l: "surface-to-volume ratio", u: "\\text{cm}^{-1}", s: (d) => (6 / d).toFixed(2) }, g: "Cellular surface area to volume ratio scaling inversely with increasing radius", exp: { iv: "Microscope objective lens power (4x, 10x, 40x)", dv: "Linear field of view diameter (microns)", controls: "Light intensity, ocular lens 10x" }, misc: "Viruses are living cells, rather than non-living acellular assemblies requiring host machinery", app: "Transmission electron microscopy resolving organelle ultrastructure at angstrom scales", pert: "Enzymatic poison halting cellular respiration, terminating all active homeostatic transport", comp: "Scientific theory (broad, deeply verified predictive framework) versus hypothesis (testable tentative explanation)", err: "Failing to calibrate eyepiece reticle micrometer against a stage micrometer scale", bound: "Diffraction limit of light microscopy (approx 200 nm) governed by optical wavelength", cer1: { p: "Evaluate whether tardigrades are considered living organisms when in cryptobiosis.", c: "Tardigrades are living organisms capable of suspending and resuming metabolic homeostasis.", ev: "Tardigrades express eight characteristics of life and re-engage active respiration upon rehydration.", reas: "Life is defined by genomic blueprint, cellular organization, and homeostatic potential, not transient hydration state." }, hist: "Antonie van Leeuwenhoek's 1674 discovery of living microscopic single-celled 'animalcules'", cer2: { p: "Formulate a CER evaluating the peer review process in modern scientific inquiry.", c: "Peer review ensures experimental replicability and eliminates biased methodology before publication.", ev: "Over 80% of flawed initial manuscripts are revised or rejected during rigorous blind peer reviews.", reas: "Independent verification and skepticism are the foundational cornerstones of reliable science." }, term: "Homeostasis", def: "The active physiological regulation of stable internal conditions despite external fluctuations", evday: "Sweating in hot weather", evdesc: "Evaporative cooling dissipates thermal energy to maintain core body temperature at 37°C" },
  { id: 2, title: "Principles of Ecology", sys: "Trophic Energy Dynamics & Biogeochemical Flux", mech: "Photosynthetic primary production converting solar photons into chemical bond energy dissipated as heat through trophic levels (10% rule)", c1: { f: "E_{n+1} = 0.10 \\times E_n", l: "trophic energy transfer", u: "kJ", s: (e) => (0.10 * e).toFixed(1) }, c2: { f: "\\% \\text{ Loss} = \\frac{E_{\\text{in}} - E_{\\text{out}}}{E_{\\text{in}}} \\times 100\\%", l: "thermal dissipation", u: "\\%", s: () => "90.0" }, g: "Ecological trophic pyramid displaying 90% energy drop at each consecutive feeding level", exp: { iv: "Light intensity gradient in an aquatic mesocosm", dv: "Dissolved oxygen production rate (mg/L/hr) by phytoplankton", controls: "Water temperature, nitrate concentration, mesocosm volume" }, misc: "Energy recycles within ecosystems like chemical nutrients, violating the Second Law of Thermodynamics", app: "Bioremediation of contaminated wetlands using hyperaccumulating aquatic macrophytes", pert: "Agricultural fertilizer nitrogen runoff triggering massive algal blooms and hypoxic dead zones", comp: "Abiotic factors (temperature, sunlight, pH) versus biotic factors (predation, symbiosis, competition)", err: "Incubating light and dark dissolved oxygen bottles at unequal water temperatures", bound: "Thermodynamic trophic limit: rarely more than 4–5 trophic levels due to 90% energetic dissipation", cer1: { p: "Explain why apex predators are naturally far less abundant than primary producers.", c: "Apex predators are rare because 90% of energy is dissipated as heat at each trophic step.", ev: "1,000,000 J of solar energy supports 10,000 J of plants, 1,000 J of herbivores, and only 10 J of apex carnivores.", reas: "Thermodynamic entropy mandates that energy flow is unidirectional and cannot sustain large apex populations." }, hist: "Raymond Lindeman's 1942 seminal paper establishing modern trophic dynamics and energy efficiency", cer2: { p: "Predict the ecological outcome of removing sea otters from a temperate kelp forest.", c: "Removing sea otters causes sea urchin population explosion, resulting in complete destruction of kelp forests.", ev: "Census data records a 95% loss of giant kelp canopy within two years of otter removal.", reas: "As a keystone predator, sea otters exert top-down trophic control over herbivorous kelp-grazing urchins." }, term: "Keystone Species", def: "A species that exerts disproportionate top-down regulatory control over ecosystem structure relative to its abundance", evday: "Composting organic food scraps", evdesc: "Fungi and bacteria decompose organic matter, recycling carbon and nitrogen back into fertile soil" },
  { id: 3, title: "Communities and Ecosystems", sys: "Ecological Succession & Biome Climatology", mech: "Facilitation and environmental modification driving transition from pioneer lichens to climax forest canopies", c1: { f: "B = P \\times T", l: "biomass index", u: "kg/m^2", s: (p, t) => (p * t * 0.05).toFixed(2) }, c2: { f: "D = \\sum (n/N)^2", l: "Simpson diversity index", u: "", s: (d) => (1 - d).toFixed(3) }, g: "Whittaker biome diagram plotting terrestrial biomes across annual temperature and precipitation", exp: { iv: "Disturbance intensity (simulated wildfire burning)", dv: "Species richness and recovery rate of herbaceous plant canopy over 5 years", controls: "Soil mineral composition, geographic slope, rainfall" }, misc: "Primary and secondary ecological succession occur on identical substrates, ignoring soil presence", app: "Ecological restoration of open-cast mining sites using fast-growing native nitrogen-fixing legumes", pert: "Introduction of an invasive vine (e.g. Kudzu) that outcompetes native climax canopies for sunlight", comp: "Primary succession (starting on bare rock with zero soil) versus secondary succession (intact soil seed bank)", err: "Overlooking dormant soil seed banks when classifying disturbed habitats as primary succession", bound: "Climatic climax equilibrium set by macro-regional annual rainfall and mean temperature", cer1: { p: "Investigate whether volcanic lava flows undergo primary or secondary ecological succession.", c: "Volcanic lava flows undergo primary succession because the starting substrate is sterile bare rock lacking soil.", ev: "Colonization begins exclusively with pioneering mutualistic lichens and mosses creating primitive organic humus.", reas: "Without pre-existing organic soil or seed banks, biological communities must build soil from pioneer weathering." }, hist: "Frederic Clements and Henry Gleason's early 20th-century debates over ecosystem climax models", cer2: { p: "Analyze how latitude and altitude produce parallel distributions of ecological biomes.", c: "Ascending high mountains mirrors traveling toward polar latitudes due to progressive drops in temperature.", ev: "Climbing from tropical base to alpine peak transitions from rainforest to deciduous to taiga to tundra.", reas: "Both altitude and latitude dictate adiabatic lapse rates, driving identical climatic adaptations in plant communities." }, term: "Pioneer Species", def: "Hardy pioneer organisms (like lichens) that colonize barren rock, generating the first organic soil", evday: "Weeds sprouting through sidewalk cracks", evdesc: "Windborne dandelion seeds colonize tiny dust crevices, initiating secondary micro-succession" }
];

// Fill BIO_MODULE_PROFILES for 1 to 27
BIO_RAW.forEach(b => {
  BIO_MODULE_PROFILES[b.id] = {
    system: b.sys,
    mechanism: b.mech,
    calc1: b.c1,
    calc2: b.c2,
    graph: b.g,
    experiment: b.exp,
    misconception: b.misc,
    application: b.app,
    perturbation: b.pert,
    comparison: b.comp,
    errorAnalysis: b.err,
    boundary: b.bound,
    cer1: b.cer1,
    historical: b.hist,
    cer2: b.cer2,
    terminology: { term: b.term, def: b.def },
    everyday: { phenomenon: b.evday, explanation: b.evdesc }
  };
});

// Rich profiles for Biology Modules 4 to 27
const BIO_DATA_MAP = {
  4: {
    sys: "Population Demographics & Carrying Capacity",
    mech: "Density-dependent feedback limiting exponential r-growth as population size N approaches environmental carrying capacity K",
    f: "\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)",
    l: "logistic growth rate",
    u: "\\text{ind/yr}",
    term: "Carrying Capacity",
    def: "The maximum sustainable population size that a particular environment can support indefinitely given available resources",
    evday: "Bacterial colony saturation in nutrient broth",
    evdesc: "Rapid exponential doubling continues until nutrient depletion and metabolic waste accumulation plateau cell density at carrying capacity K",
    lessons: {
      1: {
        system: "Population Demographics, Dispersion & Density Regulation",
        mechanism: "Density-dependent factors (competition, predation, disease) and density-independent factors (weather, floods) regulating population size",
        terminology: { term: "Carrying Capacity", def: "The maximum population size of a species that an environment can sustain indefinitely" },
        calc1: { formula: "\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)", label: "population growth rate", unit: "\\text{ind/yr}", solve: (r, n, k) => (r * n * (1 - n / k)).toFixed(1) },
        everyday: { phenomenon: "Boom-and-bust cycles in snowshoe hares and lynx", explanation: "Predator-prey oscillations lag behind each other as prey availability dictates predator birth rates" },
        misconception: "Populations continue growing exponentially forever without limits, ignoring resource exhaustion"
      },
      2: {
        system: "Human Demographics, Demographic Transition & Age Structure",
        mechanism: "Technological and healthcare advances reducing infant mortality and shifting birth and death rates through demographic stages",
        terminology: { term: "Demographic Transition", def: "The historical shift from high birth and death rates to low birth and death rates as a society industrializes" },
        calc1: { formula: "\\text{Growth Rate} = \\text{Birth Rate} - \\text{Death Rate}", label: "rate of natural increase", unit: "\\%", solve: (b, d) => (b - d).toFixed(2) },
        everyday: { phenomenon: "Rapidly expanding youth population pyramids in developing nations", explanation: "High birth rates produce broad pyramid bases where over 40% of the population is below reproductive age" },
        misconception: "Zero population growth means nobody is born, rather than birth rates exactly equaling death rates"
      }
    }
  },
  5: {
    sys: "Biodiversity & Conservation Biology",
    mech: "Genetic variability, species richness, and habitat heterogeneity buffering ecological communities against catastrophic collapse",
    f: "H' = -\\sum p_i \\ln(p_i)",
    l: "Shannon diversity index",
    u: "",
    term: "Biodiversity",
    def: "The total biological variation across genes, species, and ecosystems in a defined geographic biome",
    evday: "Monoculture crop vulnerability to blight",
    evdesc: "Genetically uniform crop fields lack resistant alleles, leaving entire yields vulnerable to devastation by a single pest",
    lessons: {
      1: {
        system: "Ecosystem Species Richness & Genetic Diversity",
        mechanism: "Genetic variation within populations providing raw material for natural selection and ecosystem stability",
        terminology: { term: "Species Richness", def: "The total number of different species represented in an ecological community" }
      },
      2: {
        system: "Anthropogenic Threats, Habitat Fragmentation & Overexploitation",
        mechanism: "Deforestation and urban development creating isolated habitat islands with increased edge effects and reduced gene flow",
        terminology: { term: "Habitat Fragmentation", def: "The breaking up of contiguous native habitat into small, isolated patches surrounded by human-altered landscapes" }
      },
      3: {
        system: "Conservation Strategies, Bioremediation & Protected Reserves",
        mechanism: "Restoring migration corridors, protecting biodiversity hotspots, and employing hyperaccumulating plants to decontaminate soils",
        terminology: { term: "Bioremediation", def: "The use of living organisms (bacteria or plants) to detoxify polluted environmental sites" }
      }
    }
  },
  6: {
    sys: "Biochemical Macromolecules & Enzyme Catalysis",
    mech: "Lowering transition-state Gibbs activation energy Ea via precise enzyme active-site spatial alignment and induced fit",
    f: "V = \\frac{V_{\\max}[S]}{K_m + [S]}",
    l: "enzymatic velocity",
    u: "\\mu\\text{M/s}",
    term: "Active Site",
    def: "The specific catalytic pocket of an enzyme where substrate molecules bind and undergo chemical transformation",
    evday: "Meat tenderizer enzymes breaking down muscle tissue",
    evdesc: "Papain proteases hydrolyze peptide bonds in tough collagen muscle fibers into tender short peptides",
    lessons: {
      1: {
        system: "Atomic Structure, Chemical Bonding & Ionic Dissociation",
        mechanism: "Electronegativity differences driving covalent sharing or ionic electron transfers between biological elements",
        terminology: { term: "Covalent Bond", def: "A chemical bond formed by the sharing of one or more pairs of valence electrons between atoms" }
      },
      2: {
        system: "Chemical Reactions, Activation Energy & Thermodynamics",
        mechanism: "Exergonic and endergonic biological reactions coupling ATP hydrolysis to drive energetically unfavorable synthesis",
        terminology: { term: "Activation Energy", def: "The minimum kinetic energy colliding reactant molecules must possess to overcome the transition-state barrier" }
      },
      3: {
        system: "Water Properties, Hydrogen Bonding & Acid-Base Buffering",
        mechanism: "High polarity and cohesive hydrogen bonds giving water high specific heat capacity, surface tension, and solvent capability",
        terminology: { term: "Hydrogen Bonding", def: "An electrostatic dipole attraction between partially positive hydrogen and an electronegative oxygen or nitrogen atom" }
      },
      4: {
        system: "Macromolecular Polymers: Carbohydrates, Lipids, Proteins & Nucleic Acids",
        mechanism: "Dehydration condensation synthesis linking monomers via covalent bonds (glycosidic, ester, peptide, phosphodiester)",
        terminology: { term: "Peptide Bond", def: "A covalent amide bond formed by dehydration condensation between the carboxyl group of one amino acid and amino group of another" }
      }
    }
  },
  7: {
    sys: "Cellular Ultrastructure & Membrane Transport",
    mech: "Phospholipid bilayer selective permeability maintained by passive osmosis, facilitated channels, and ATP-driven ion pumps",
    f: "J = -D \\frac{\\Delta C}{\\Delta x}",
    l: "diffusion flux",
    u: "\\text{mol}/(\\text{m}^2\\cdot\\text{s})",
    term: "Osmosis",
    def: "The net passive diffusion of free water molecules across a selectively permeable membrane toward higher solute concentration",
    evday: "Skin wrinkles after a prolonged hot bath",
    evdesc: "Epidermal keratin absorbing water expands outer layers, wrinkling skin over firmly anchored deeper tissues",
    lessons: {
      1: {
        system: "Cell Theory, Prokaryotic Simplicity vs Eukaryotic Compartmentalization",
        mechanism: "Membrane-bound organelles segregating incompatible biochemical metabolic pathways in eukaryotic cells",
        terminology: { term: "Cell Theory", def: "The foundational biological principle that all living organisms are composed of cells, the cell is the basic unit of life, and all cells arise from pre-existing cells" }
      },
      2: {
        system: "Plasma Membrane Fluid Mosaic Model & Amphipathic Lipids",
        mechanism: "Hydrophobic lipid tails sequestered away from water with hydrophilic phosphate heads contacting aqueous cytoplasm and ECM",
        terminology: { term: "Fluid Mosaic Model", def: "A membrane model depicting a fluid phospholipid bilayer with freely lateral-diffusing proteins and glycoproteins" }
      },
      3: {
        system: "Cellular Membrane Transport: Passive Diffusion, Facilitated Channels & Active Pumps",
        mechanism: "ATP-hydrolyzing Na+/K+ ATPase pumping 3 Na+ out and 2 K+ in against their electrochemical gradients",
        terminology: { term: "Active Transport", def: "The energy-requiring transport of molecules or ions across a membrane against their concentration gradient" }
      },
      4: {
        system: "Eukaryotic Organelles: Nucleus, ER, Golgi, Lysosomes & Cytoskeleton",
        mechanism: "Vesicular protein trafficking along microtubule tracks powered by kinesin and dynein motor ATPases",
        terminology: { term: "Endomembrane System", def: "The coordinated functional continuum of membrane-bound organelles that synthesize, package, and transport proteins" }
      }
    }
  },
  8: {
    sys: "Bioenergetics: Photosynthesis & Cellular Respiration",
    mech: "Electron transport chains creating transmembrane proton motive forces driving rotational catalytic synthesis of ATP by ATP Synthase",
    f: "C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O",
    l: "cellular aerobic oxidation",
    u: "\\text{kJ/mol}",
    term: "Chemiosmosis",
    def: "The generation of ATP by the movement of hydrogen ions down an electrochemical gradient across a biological membrane",
    evday: "Yeast bread dough rising in baking",
    evdesc: "Anaerobic glycolysis by yeast cells produces CO2 gas bubbles that expand the bread dough matrix during fermentation",
    lessons: {
      1: {
        system: "Thermodynamics of Cellular Metabolism: Anabolism, Catabolism & ATP Coupling",
        mechanism: "Coupling exergonic ATP hydrolysis (-30.5 kJ/mol) to drive endergonic biosynthesis and mechanical motor transport",
        terminology: { term: "ATP", def: "Adenosine triphosphate, the primary high-energy chemical currency of all living cells" }
      },
      2: {
        system: "Photosynthesis: Light Reactions, Z-Scheme & Calvin Cycle Carbon Fixation",
        mechanism: "Thylakoid photosystems splitting water to generate NADPH and ATP, driving RuBisCO carbon dioxide fixation in stroma",
        terminology: { term: "Photolysis", def: "The enzymatic splitting of water molecules by Photosystem II yielding electrons, protons, and O2 gas" }
      },
      3: {
        system: "Cellular Respiration: Glycolysis, Krebs Cycle & Oxidative Phosphorylation",
        mechanism: "NADH and FADH2 oxidation transferring electrons through cristae complexes to terminal O2, generating 30-32 ATP per glucose",
        terminology: { term: "Electron Transport Chain", def: "A series of multiprotein electron carriers embedded in the inner mitochondrial membrane that pump protons into the intermembrane space" }
      }
    }
  },
  9: {
    sys: "Cell Cycle, Mitosis & Checkpoint Cytogenetics",
    mech: "Cyclin-dependent kinase (CDK) phosphorylation cascades governing orderly chromatid replication, followed by homologous crossing-over generating haploid gametes",
    f: "\\text{Mitotic Index} = \\frac{N_{\\text{mitotic}}}{N_{\\text{total}}} \\times 100\\%",
    l: "mitotic index",
    u: "\\%",
    term: "Mitosis",
    def: "The process of eukaryotic nuclear karyokinesis producing two genetically identical daughter nuclei with conserved diploid chromosome number",
    evday: "Healing of a skin scratch",
    evdesc: "Basal skin epithelial cells undergo rapid mitotic division and cytokinesis to replace damaged cells and seal the wound",
    lessons: {
      1: {
        system: "The Eukaryotic Cell Cycle: Interphase, Mitosis Stages & Checkpoint Regulation",
        mechanism: "G1, G2, and M checkpoints monitoring DNA integrity and spindle fiber attachment before allowing anaphase separation",
        terminology: { term: "Cytokinesis", def: "The physical division of the cytoplasm and partitioning of organelles into two separate daughter cells" }
      },
      2: {
        system: "Meiosis: Homologous Synapsis, Crossing-Over & Gamete Haploidization",
        mechanism: "Synaptonemal complex alignment and chiasmata crossing-over in prophase I producing recombinant haploid gametes",
        terminology: { term: "Crossing-Over", def: "The reciprocal exchange of genetic material between non-sister chromatids of homologous chromosomes during prophase I of meiosis" }
      }
    }
  },
  10: {
    sys: "Mendelian Genetics & Chromosomal Meiosis",
    mech: "Homologous chromosome crossing-over and independent assortment generating massive haploid genetic diversity",
    f: "P(A \\cap B) = P(A) \\times P(B)",
    l: "joint probability",
    u: "",
    term: "Allele",
    def: "Alternative variant forms of a gene located at the same specific genetic locus on a chromosome",
    evday: "Eye color differences in siblings",
    evdesc: "Meiotic crossing-over and random parental allele segregation produce distinct combinations in each child",
    lessons: {
      1: {
        system: "Mendelian Principles: Dominance, Segregation & Independent Assortment",
        mechanism: "Independent segregation of maternal and paternal homologous chromosome pairs during anaphase I",
        terminology: { term: "Law of Segregation", def: "Mendel's law stating that two alleles for a heritable trait segregate during gamete formation and end up in different gametes" }
      },
      2: {
        system: "Gene Linkage, Recombination Mapping & Chromosome Crossing-Over Frequencies",
        mechanism: "Distance between loci on the same chromosome dictating crossover frequency, where 1% recombination equals 1 centimorgan",
        terminology: { term: "Linkage", def: "The tendency of DNA sequences that are close together on a chromosome to be inherited together during meiosis" }
      },
      3: {
        system: "Applied Genetics: Selective Breeding, Hybridization & Inbreeding Risks",
        mechanism: "Artificial selection increasing desired allele frequencies while inbreeding increases homozygosity of deleterious recessive alleles",
        terminology: { term: "Hybrid Vigor", def: "The increased fitness, growth, or fertility often exhibited by crossbred heterozygous offspring compared to inbred parents" }
      },
      4: {
        system: "Basic Patterns of Human Inheritance: Autosomal Dominant & Recessive Pedigrees",
        mechanism: "Inheritance of single-gene traits through family generations tracked via standardized pedigree charts",
        terminology: { term: "Carrier", def: "A clinically unaffected heterozygous individual who carries a recessive allele for a genetic disorder" }
      },
      5: {
        system: "Complex Inheritance: Incomplete Dominance, Codominance, Multiple Alleles & Sex-Linkage",
        mechanism: "Non-Mendelian gene interactions including intermediate phenotypes, multiple alleles (ABO blood), and X-linked traits",
        terminology: { term: "Codominance", def: "An inheritance pattern in which the phenotypic effects of both distinct alleles are fully and simultaneously expressed in a heterozygote" }
      }
    }
  },
  11: {
    sys: "Molecular Genetics: Central Dogma & Protein Synthesis",
    mech: "Semi-conservative DNA replication followed by RNA polymerase transcription and tRNA ribosomal translation",
    f: "N_{\\text{codons}} = \\frac{\\text{mRNA bases}}{3}",
    l: "amino acid count",
    u: "",
    term: "Transcription",
    def: "The synthesis of an RNA transcript from a complementary template DNA strand catalyzed by RNA polymerase",
    evday: "Antibiotic targeting bacterial ribosomes",
    evdesc: "Tetracycline halts bacterial translation by binding bacterial 70S ribosomes without harming human 80S ribosomes",
    lessons: {
      1: {
        system: "DNA Structure: Antiparallel Double Helix & Complementary Base Pairing",
        mechanism: "Deoxyribose-phosphate backbone with purine-pyrimidine base pairs (A=T with 2 H-bonds, G≡C with 3 H-bonds)",
        terminology: { term: "Complementary Base Pairing", def: "The specific hydrogen bonding between nitrogenous bases in DNA: adenine with thymine and cytosine with guanine" }
      },
      2: {
        system: "Semi-Conservative DNA Replication: Helicase, Primase, Polymerase & Okazaki Fragments",
        mechanism: "Replication forks unwinding DNA and synthesizing leading strand continuously while lagging strand forms Okazaki fragments",
        terminology: { term: "Okazaki Fragment", def: "Short, newly synthesized DNA segments formed on the lagging template strand during replication, joined by DNA ligase" }
      },
      3: {
        system: "The Central Dogma: mRNA Transcription, Intron Splicing & tRNA Translation",
        mechanism: "Ribosomal decoding of triplet mRNA codons by complementary tRNA anticodons into nascent polypeptide chains",
        terminology: { term: "Codon", def: "A triplet sequence of adjacent nucleotides in mRNA that specifies a particular amino acid or translation stop signal" }
      },
      4: {
        system: "Gene Regulation: Operons, Epigenetic Transcription Factors & Point Mutations",
        mechanism: "Repressor proteins binding operators to regulate bacterial transcription, and eukaryotic histone acetylation opening chromatin",
        terminology: { term: "Operon", def: "A functioning unit of genomic DNA containing a cluster of genes under the control of a single promoter and operator" }
      }
    }
  },
  12: {
    sys: "Biotechnology, PCR & Recombinant Genetic Engineering",
    mech: "Targeted restriction endonuclease cleavage, thermal primer annealing, and Taq polymerase DNA amplification",
    f: "N = N_0 \\times 2^n",
    l: "PCR amplicon count",
    u: "",
    term: "Gel Electrophoresis",
    def: "The analytical separation of DNA, RNA, or protein fragments based on size and charge using an electric field",
    evday: "Crime scene DNA fingerprinting",
    evdesc: "STR genetic repeats amplified by PCR produce unique band patterns on an electrophoresis gel matching suspects",
    lessons: {
      1: {
        system: "Recombinant DNA Tools: Restriction Enzymes, Plasmids, PCR & Gel Electrophoresis",
        mechanism: "Bacterial plasmids cleaved by restriction enzymes ligating foreign genes to clone and express recombinant proteins",
        terminology: { term: "Restriction Enzyme", def: "A bacterial endonuclease that cleaves double-stranded DNA at specific palindromic recognition sequences" }
      },
      2: {
        system: "The Human Genome Project, DNA Sequencing, Bioinformatics & Gene Therapy",
        mechanism: "Next-generation sequencing and bioinformatic sequence alignment identifying pathogenic mutations and enabling targeted CRISPR editing",
        terminology: { term: "Bioinformatics", def: "The application of computational algorithms and statistical models to analyze and interpret massive biological genomic datasets" }
      }
    }
  },
  13: {
    sys: "Geological History of Life & Paleontology",
    mech: "Radioactive isotope exponential decay and fossil preservation in sedimentary strata recording evolutionary lineages",
    f: "N(t) = N_0 (0.5)^{t/5730}",
    l: "radiocarbon age",
    u: "\\text{yr}",
    term: "Fossil",
    def: "The preserved physical remains or trace evidence of an ancient organism embedded in geological rock strata",
    evday: "Petrified wood in national parks",
    evdesc: "Silica dissolved in groundwater slowly replaces organic wood cells with quartz mineral stone over millions of years",
    lessons: {
      1: {
        system: "Fossil Evidence of Change: Mineralization, Stratigraphic Law of Superposition & Radiometric Decay",
        mechanism: "Deeper sedimentary strata containing older fossils dated quantitatively by parent-to-daughter radioisotope ratios",
        terminology: { term: "Half-Life", def: "The time required for exactly one-half of the radioactive parent nuclei in a sample to decay into stable daughter isotopes" }
      },
      2: {
        system: "The Origin of Life: Prebiotic Synthesis, Miller-Urey Spark Assay & RNA World Hypothesis",
        mechanism: "Inorganic gases reacting under electrical spark discharge to synthesize amino acids and self-replicating ribozymes",
        terminology: { term: "RNA World", def: "The evolutionary hypothesis that primitive life utilized self-replicating catalytic RNA molecules prior to the evolution of DNA and proteins" }
      }
    }
  },
  14: {
    sys: "Evolutionary Mechanisms & Natural Selection",
    mech: "Differential reproductive success acting on phenotypic traits, altering population allele frequencies over time",
    f: "p^2 + 2pq + q^2 = 1",
    l: "Hardy-Weinberg equilibrium",
    u: "",
    term: "Natural Selection",
    def: "The differential survival and reproduction of individuals due to differences in heritable phenotype",
    evday: "Antibiotic resistance in bacteria",
    evdesc: "Exposing bacteria to penicillin kills sensitive cells, allowing rare resistant mutants to survive and multiply",
    lessons: {
      1: {
        system: "Darwin's Theory of Evolution: Overproduction, Variation, Adaptation & Differential Fitness",
        mechanism: "Environmental selection pressures favoring organisms with traits that confer higher reproductive output",
        terminology: { term: "Fitness", def: "A quantitative measure of an organism's reproductive success and contribution of offspring to the gene pool of the next generation" }
      },
      2: {
        system: "Evidence of Evolution: Homologous Structures, Embryology & Molecular Cytochrome C Homology",
        mechanism: "Conserved anatomical bone arrangements and shared nucleotide sequences demonstrating descent from a common ancestor",
        terminology: { term: "Homologous Structures", def: "Anatomical features in different species that share common evolutionary ancestry despite differences in current functional adaptation" }
      },
      3: {
        system: "Shaping Evolutionary Theory: Genetic Drift, Gene Flow, Founder Effect & Speciation Modes",
        mechanism: "Geographic reproductive isolation driving allopatric speciation as genetic mutations and drift diverge populations",
        terminology: { term: "Genetic Drift", def: "Random fluctuations in allele frequencies from generation to generation occurring predominantly in small populations" }
      }
    }
  },
  15: {
    sys: "Primate Evolutionary Radiations & Hominin Lineages",
    mech: "Bipedal pelvic adaptation, cranial encephalization, and tool culture driving hominin morphological divergence",
    f: "\\text{Cranial Index} = \\frac{\\text{Volume}}{m_{\\text{body}}}",
    l: "encephalization quotient",
    u: "",
    term: "Bipedalism",
    def: "The anatomical adaptation for upright walking on two rear legs, freeing forelimbs for tool use",
    evday: "Human upright posture",
    evdesc: "Our S-curved vertebral column and arched foot bones distribute body weight evenly for efficient walking",
    lessons: {
      1: {
        system: "Primate Characteristics: Opposable Thumbs, Binocular Stereoscopic Vision & Complex Social Structure",
        mechanism: "Arboreal adaptations favoring depth perception, mobile shoulder joints, and manual grasping agility",
        terminology: { term: "Opposable Thumb", def: "A digit that can touch the tips of all other fingers on the same hand, enabling fine-motor precision grasping" }
      },
      2: {
        system: "Hominoids to Hominins: Australopithecus, Bipedal Pelvis & Foramen Magnum Placement",
        mechanism: "Shift from tropical forest canopies to open savannas favoring energy-efficient upright walking and central foramen magnum",
        terminology: { term: "Foramen Magnum", def: "The large aperture in the base of the skull through which the spinal cord passes, positioned centrally beneath the skull in bipedal hominins" }
      },
      3: {
        system: "Human Ancestry: Homo habilis, Homo erectus, Neanderthals & Homo sapiens Speciation",
        mechanism: "Progressive cranial vault expansion, Acheulean tool mastery, controlled fire use, and modern Homo sapiens global dispersal",
        terminology: { term: "Out of Africa Model", def: "The prevailing paleoanthropological model asserting modern humans evolved in Africa ~300,000 years ago and subsequently migrated globally" }
      }
    }
  },
  16: {
    sys: "Systematics, Cladistics & Domain Taxonomy",
    mech: "Phylogenetic character state analysis determining synapomorphies to reconstruct evolutionary trees of life",
    f: "\\text{Homology Index} = \\frac{S_{\\text{shared}}}{S_{\\text{total}}}",
    l: "cladistic similarity",
    u: "",
    term: "Cladogram",
    def: "A branching phylogenetic diagram showing ancestral relationships based on shared derived characteristics",
    evday: "Birds classified as dinosaurs",
    evdesc: "Fossil feathers and wishbone anatomy in velociraptors prove birds are living avian theropod dinosaurs",
    lessons: {
      1: {
        system: "The History of Classification: Aristotle's Scala Naturae & Linnaeus's Hierarchical Taxa",
        mechanism: "Grouping organisms into domain, kingdom, phylum, class, order, family, genus, and species",
        terminology: { term: "Binomial Nomenclature", def: "The standardized formal naming system using two Latinized terms: genus name capitalized and species epithet in lowercase" }
      },
      2: {
        system: "Modern Classification: Cladistics, Ancestral vs Derived Synapomorphies & Parsimony",
        mechanism: "Constructing phylogenetic trees that minimize the number of evolutionary transitions required to explain character distributions",
        terminology: { term: "Synapomorphy", def: "A shared derived character state that is an evolutionary novelty unique to a particular clade and its most recent common ancestor" }
      },
      3: {
        system: "Domains and Kingdoms: Archaea, Bacteria, Eukarya & Six Kingdom Physiological Taxonomy",
        mechanism: "Ribosomal RNA sequence divergence separating life into three primary domains based on cellular membrane lipids and transcription machinery",
        terminology: { term: "Domain Archaea", def: "A kingdom of single-celled prokaryotes possessing unique ether-linked membrane lipids and histones that often thrive in extreme environments" }
      }
    }
  },
  17: {
    sys: "Microbiology: Bacteria & Viral Pathogenesis",
    mech: "Bacterial peptidoglycan binary fission versus viral lytic capsid injection and host hijacking",
    f: "N(t) = N_0 \\times 2^{t/g}",
    l: "bacterial colony growth",
    u: "",
    term: "Bacteriophage",
    def: "A specialized virus that infects and replicates exclusively within bacterial cells",
    evday: "Yogurt fermentation",
    evdesc: "Lactobacillus bacteria ferment lactose sugar into lactic acid, curdling milk into thick, tangy yogurt",
    lessons: {
      1: {
        system: "Bacteria: Cell Walls, Gram Staining, Binary Fission & Endospore Survival",
        mechanism: "Peptidoglycan cross-linking by transpeptidases providing osmotic rigidity against hypotonic lysis",
        terminology: { term: "Binary Fission", def: "The asexual reproduction of a single-celled prokaryote by dividing into two genetically identical daughter cells" }
      },
      2: {
        system: "Viruses and Prions: Capsids, Envelopes, Lytic vs Lysogenic Infection & Misfolded Prion Cascades",
        mechanism: "Viral attachment to specific host receptors followed by viral genome injection and subversion of host ribosomes",
        terminology: { term: "Lytic Cycle", def: "A viral replication pathway culminating in the destruction of the host cell membrane and release of infectious viral progeny" }
      }
    }
  },
  18: {
    sys: "Protist Diversity, Endosymbiosis & Fungal Decomposition",
    mech: "Endosymbiotic organelle acquisition in eukaryotic protists and extracellular hydrolytic enzyme absorption by chitinous fungal hyphae",
    f: "\\text{Growth Rate} = \\frac{\\Delta r}{\\Delta t}",
    l: "hyphal extension rate",
    u: "\\text{mm/day}",
    term: "Hyphae",
    def: "Branching filamentous structures of fungi that secrete hydrolytic enzymes and absorb digested nutrients",
    evday: "Mold spreading across fresh bread",
    evdesc: "Rhizopus fungal spores germinate, sending branching hyphae into porous bread matrix to digest starch into absorbable sugars",
    lessons: {
      1: {
        system: "Introduction to Protists: Primary/Secondary Endosymbiosis & Eukaryotic Organelle Evolution",
        mechanism: "Ancestral archaeal host cell engulfing aerobic proteobacterium (mitochondria) and cyanobacterium (chloroplast)",
        terminology: { term: "Endosymbiosis", def: "An evolutionary theory that eukaryotic organelles originated as engulfed free-living prokaryotic cells" }
      },
      2: {
        system: "Protist Diversity: Protozoans, Diatoms, Dinoflagellates, Kelp & Plasmodium Pathogenesis",
        mechanism: "Unicellular photosynthetic primary producers and protozoan parasite life cycles alternating between human liver and erythrocytes",
        terminology: { term: "Diatom", def: "Unicellular photosynthetic aquatic algae encased in rigid, ornate siliceous double shells (frustules)" }
      },
      3: {
        system: "Introduction to Fungi: Chitin Cell Walls, Hyphae, Mycelium & Extracellular Digestion",
        mechanism: "Apical hyphal extension secreting exoenzymes (cellulases, proteases) into substrate followed by active proton-coupled nutrient transport",
        terminology: { term: "Mycelium", def: "The densely branched vegetative network of feeding hyphae that constitutes the body of a multicellular fungus" }
      },
      4: {
        system: "Fungus Diversity and Ecology: Zygomycetes, Ascomycetes, Basidiomycetes & Mycorrhizal Symbiosis",
        mechanism: "Spore dispersal from fruiting bodies and mutualistic mycorrhizal root exchanges trading soil phosphorus for plant photosynthetic sugars",
        terminology: { term: "Mycorrhizae", def: "Mutualistic symbiotic associations between plant roots and soil fungi that enhance mineral nutrient uptake" }
      }
    }
  },
  19: {
    sys: "Plant Evolution, Vascular Anatomy & Transpiration Mechanics",
    mech: "Solar-driven leaf transpiration creating negative hydrostatic pressure tension that pulls continuous water columns up xylem tracheids and vessels",
    f: "\\Psi = \\Psi_s + \\Psi_p",
    l: "water potential",
    u: "\\text{MPa}",
    term: "Transpiration",
    def: "The evaporative loss of water vapor from aerial plant surfaces through stomata driving upward cohesive xylem flow",
    evday: "Giant redwood trees lifting water 100 meters",
    evdesc: "Solar evaporation at canopy stomata generates high negative tension, lifting continuous cohesive water columns against gravity",
    lessons: {
      1: {
        system: "Plant Evolution and Diversity: Bryophytes, Ferns, Gymnosperms & Angiosperm Lineages",
        mechanism: "Cuticle evolution, stomata, vascular lignified xylem, and protective seed coats allowing colonization of dry land",
        terminology: { term: "Alternation of Generations", def: "A reproductive life cycle that alternates between a multicellular haploid gametophyte phase and a diploid sporophyte phase" }
      },
      2: {
        system: "Plant Structure and Function: Dermal, Ground & Vascular (Xylem/Phloem) Tissues & Leaf Gas Exchange",
        mechanism: "Cohesion-Tension theory pulling water up xylem columns coupled to phloem source-to-sink sucrose pressure-flow transport",
        terminology: { term: "Cohesion-Tension Theory", def: "The physical mechanism explaining water ascent in plants by evaporative transpirational pull transmitted down continuous cohesive water columns" }
      },
      3: {
        system: "Plant Reproduction: Flower Anatomy, Pollen Tubes & Angiosperm Double Fertilization",
        mechanism: "Pollen tube guidance into ovule executing double fertilization: one sperm fertilizes egg (2n zygote), second forms endosperm (3n)",
        terminology: { term: "Double Fertilization", def: "A unique angiosperm process where one sperm fertilizes the egg (2n zygote) and a second sperm fertilizes two polar nuclei (3n endosperm)" }
      }
    }
  },
  20: {
    sys: "Animal Tissue Differentiation, Body Symmetry & Germ Layers",
    mech: "Embryonic blastula cleavage followed by gastrulation invagination establishing ectoderm, mesoderm, and endoderm tissue fates",
    f: "\\text{Cephalization Index} = \\frac{m_{\\text{brain}}}{m_{\\text{body}}}",
    l: "cephalization index",
    u: "",
    term: "Gastrulation",
    def: "The fundamental embryonic developmental phase where a hollow blastula invaginates to form distinct germ layers and primitive gut",
    evday: "Jellyfish radial symmetry vs bilateral fish",
    evdesc: "Cnidarian radial symmetry captures drifting prey from any direction, while bilateral symmetry coordinates forward predatory locomotion",
    lessons: {
      1: {
        system: "Animal Characteristics: Multicellularity, Heterotrophy, Collagen & Embryonic Cleavage",
        mechanism: "Zygote undergoing rapid mitotic cleavage without growth into a hollow blastula that undergoes gastrulation",
        terminology: { term: "Germ Layer", def: "One of the primary layers of cells (ectoderm, mesoderm, endoderm) formed during gastrulation that give rise to all organ systems" }
      },
      2: {
        system: "Animal Body Plans: Asymmetry, Radial vs Bilateral Symmetry, Cephalization & Coelom Cavities",
        mechanism: "Anterior concentration of sensory organs (cephalization) and mesoderm cavitation forming coelomic hydrostatic cavities",
        terminology: { term: "Coelom", def: "A fluid-filled body cavity completely lined and enclosed by tissue derived from mesoderm" }
      }
    }
  },
  21: {
    sys: "Animal Invertebrate/Vertebrate Radiations & Behavioral Neuroethology",
    mech: "Evolution of specialized organ systems (jointed exoskeletons, endoskeletons) coupled to innate sign stimuli and learned neural plasticity",
    f: "rB > C",
    l: "Hamilton's rule altruism threshold",
    u: "",
    term: "Fixed Action Pattern",
    def: "An instinctive, genetically hardwired behavioral sequence triggered by an environmental sign stimulus that runs to completion once initiated",
    evday: "Honeybee waggle dance communication",
    evdesc: "Forager bees perform oriented figure-eight runs inside dark hives to communicate vector distance and sun-angle direction of nectar",
    lessons: {
      1: {
        system: "Invertebrates: Porifera, Cnidaria, Platyhelminthes, Mollusca, Annelida, Arthropoda & Echinodermata",
        mechanism: "Jointed chitinous exoskeletons with striated muscles enabling terrestrial arthropod locomotion and flight",
        terminology: { term: "Exoskeleton", def: "A rigid, protective external jointed shell composed of chitin and proteins found in arthropods" }
      },
      2: {
        system: "Vertebrates: Chordate Hallmarks, Fishes, Amphibians, Amniote Eggs & Mammalian Endothermy",
        mechanism: "Notochord, dorsal nerve cord, pharyngeal slits, and cleidoic amniotic eggs freeing reproduction from open water",
        terminology: { term: "Amniotic Egg", def: "An egg containing specialized extraembryonic membranes (amnion, chorion, allantois, yolk sac) that allows vertebrate reproduction on dry land" }
      },
      3: {
        system: "Animal Behavior: Fixed Action Patterns, Imprinting, Classical Conditioning & Kin Selection",
        mechanism: "Innate neurosensory releasing mechanisms triggering fixed motor patterns versus synaptic plasticity in operant learning",
        terminology: { term: "Imprinting", def: "A form of rapid, irreversible learning occurring during a critical early developmental window that establishes behavioral preferences" }
      }
    }
  },
  22: {
    sys: "Integumentary Shielding, Bone Remodeling & Sarcomere Sliding Filaments",
    mech: "Sarcoplasmic reticulum Ca2+ release binding troponin C, shifting tropomyosin and enabling myosin cross-bridge power strokes along actin thin filaments",
    f: "F_{\\text{contractile}} = N_{\\text{bridges}} \\times f_{\\text{stroke}}",
    l: "contractile muscle tension",
    u: "\\text{N}",
    term: "Sarcomere",
    def: "The fundamental microscopic repeating contractile unit of striated muscle fibers bounded by transverse Z-discs",
    evday: "Muscle contraction and delayed onset soreness",
    evdesc: "Myosin heads consume ATP to pull actin filaments inward, narrowing the H-zone and I-band while maintaining invariant A-band width",
    lessons: {
      1: {
        system: "The Integumentary System: Epidermis, Keratinocytes, Melanocytes, Dermis & Thermoregulation",
        mechanism: "Stratified squamous keratinization shielding deeper tissues coupled to dermal capillary vasodilation and sweat gland evaporative cooling",
        terminology: { term: "Keratin", def: "A tough, fibrous insoluble structural protein that hardens outer epidermal skin cells, hair, and nails against abrasion and dehydration" },
        calc1: { formula: "\\text{Burn \\%} = 9 \\times N_{\\text{regions}}", label: "Rule of Nines body surface area", unit: "\\%", solve: (n) => String(n * 9) },
        everyday: { phenomenon: "Flushed red skin and heavy sweating during intense exercise", explanation: "Dermal capillaries dilate to radiate heat while eccrine sweat glands release water for evaporative cooling to maintain 37°C core temperature" },
        misconception: "Skin is an inert protective wrapper, rather than a dynamic sensory, immunologic, and thermoregulatory organ"
      },
      2: {
        system: "The Skeletal System: Axial/Appendicular Skeleton, Osteons, Haversian Canals & Remodeling",
        mechanism: "Dynamic balance between osteoblast bone deposition and osteoclast resorption in cylindrical osteon Haversian systems regulated by PTH and calcitonin",
        terminology: { term: "Osteon", def: "The fundamental cylindrical microscopic structural unit of compact cortical bone, consisting of concentric lamellae surrounding a central neurovascular Haversian canal" },
        calc1: { formula: "\\text{BMD} = \\frac{m_{\\text{mineral}}}{\\text{Area}}", label: "bone mineral density", unit: "\\text{g/cm}^2", solve: (m, a) => (m / a).toFixed(2) },
        everyday: { phenomenon: "Bone remodeling and density gain from resistance weightlifting", explanation: "Mechanical compressive strain stimulates osteoblasts to deposit hydroxyapatite mineral matrix along lines of physical stress according to Wolff's Law" },
        misconception: "Bones are dry, dead mineral sticks, rather than vascularized, highly dynamic living tissues undergoing continuous cellular turnover"
      },
      3: {
        system: "The Muscular System: Sarcomere Architecture, Sliding Filament Theory & Cross-Bridge Cycling",
        mechanism: "Sarcoplasmic reticulum Ca2+ release binding troponin C, shifting tropomyosin and enabling myosin cross-bridge power strokes along actin thin filaments",
        terminology: { term: "Sarcomere", def: "The fundamental microscopic repeating contractile unit of a muscle myofibril bounded by adjacent transverse Z-discs" },
        calc1: { formula: "F_{\\text{contractile}} = N_{\\text{bridges}} \\times f_{\\text{stroke}}", label: "contractile muscle force", unit: "\\text{N}", solve: (n, f) => (n * f).toFixed(1) },
        everyday: { phenomenon: "Rigor mortis stiffening in skeletal muscles after death", explanation: "ATP exhaustion halts cross-bridge detachment, locking myosin heads tightly onto actin filaments in a rigid, persistent contracted state" },
        misconception: "During muscle contraction actin and myosin protein filaments shrink in length, rather than sliding past one another while retaining constant individual filament lengths"
      }
    }
  },
  23: {
    sys: "Neurobiology, Axonal Action Potentials & Synaptic Transmission",
    mech: "Depolarization opening voltage-gated Na+ channels producing rapid all-or-nothing action potentials followed by K+ repolarization and vesicle neurotransmitter release",
    f: "E = \\frac{RT}{zF} \\ln\\left(\\frac{[\\text{Ion}]_o}{[\\text{Ion}]_i}\\right)",
    l: "Nernst equilibrium potential",
    u: "\\text{mV}",
    term: "Action Potential",
    def: "A rapid, transient, all-or-nothing reversal of membrane electrical potential propagating regeneratively along an axon",
    evday: "Pulling hand reflexively away from a hot stove",
    evdesc: "Thermal nociceptors fire high-frequency action potentials across spinal interneurons, triggering motor reflex contraction before brain perceives pain",
    lessons: {
      1: {
        system: "Structure of the Nervous System: Neurons, Glia, Resting Potential & Action Potential Gating",
        mechanism: "Na+/K+ ATPase maintaining -70 mV resting potential; threshold depolarization opening voltage-gated Na+ channels for rapid depolarization followed by voltage-gated K+ repolarization",
        terminology: { term: "Action Potential", def: "A rapid, all-or-nothing electrical membrane depolarization that propagates regeneratively along an axon" },
        calc1: { formula: "v = \\frac{d}{t}", label: "nerve conduction velocity", unit: "\\text{m/s}", solve: (d, t) => (d / t).toFixed(1) },
        everyday: { phenomenon: "Local dental anesthetic numbing teeth and gums", explanation: "Lidocaine blocks voltage-gated Na+ channels in sensory axons, preventing action potential generation and blocking pain transmission" },
        misconception: "Stronger stimuli produce larger, taller action potential voltage spikes, violating the fundamental all-or-nothing law (which modulates frequency, not amplitude)"
      },
      2: {
        system: "Organization of the Nervous System: Central vs Peripheral, Autonomic Sympathetic/Parasympathetic & Reflexes",
        mechanism: "Cerebral and brainstem integration coupled to antagonistic sympathetic (fight-or-flight) and parasympathetic (rest-and-digest) autonomic pathways",
        terminology: { term: "Reflex Arc", def: "An involuntary, rapid neural circuit connecting sensory receptors directly through spinal interneurons to motor effectors" }
      },
      3: {
        system: "The Senses: Mechanoreceptors, Retinal Photoreceptors (Rods/Cones) & Olfactory Transduction",
        mechanism: "Sensory receptor cells transducing physical stimuli (photons in rhodopsin, sound vibration hair cell deflection) into graded receptor potentials",
        terminology: { term: "Transduction", def: "The physiological conversion of an external physical or chemical stimulus into an electrical membrane potential by a sensory receptor" }
      },
      4: {
        system: "Effects of Drugs: Synaptic Neurotransmitters, Receptors, Agonists, Antagonists & Addiction",
        mechanism: "Neurotransmitter vesicle exocytosis across synaptic clefts modulated by agonist receptor activation, antagonist blockade, or reuptake transporter inhibition",
        terminology: { term: "Neurotransmitter", def: "A chemical signaling messenger synthesized and released by presynaptic neurons that diffuses across synaptic clefts to bind postsynaptic receptors" }
      }
    }
  },
  24: {
    sys: "Four-Chambered Hemodynamics, Alveolar Gas Exchange & Nephron Osmoregulation",
    mech: "Sinoatrial node pacemaker depolarization driving synchronized ventricular systole, capillary Fick diffusion, and nephron countercurrent multiplier filtration",
    f: "CO = HR \\times SV",
    l: "cardiac output",
    u: "\\text{L/min}",
    term: "Cardiac Output",
    def: "The volume of blood pumped by the left ventricle into the systemic aorta per unit time, calculated as heart rate times stroke volume",
    evday: "Shortness of breath and elevated heart rate at high altitudes",
    evdesc: "Low ambient PO2 reduces alveolar-capillary oxygen diffusion, stimulating sympathetic tachycardia to maintain peripheral oxygen delivery",
    lessons: {
      1: {
        system: "Circulatory System: 4-Chamber Heart Anatomy, Cardiac Cycle, ECG Conduction & Blood Pressure",
        mechanism: "Sinoatrial node electrical depolarization spreading through AV node and bundle branches, driving coordinated ventricular systole and systemic arterial flow",
        terminology: { term: "Cardiac Output", def: "The total volume of blood ejected by the left ventricle into the systemic circulation per minute, calculated as heart rate times stroke volume" },
        calc1: { formula: "CO = HR \\times SV", label: "cardiac output", unit: "\\text{L/min}", solve: (hr, sv) => ((hr * sv) / 1000).toFixed(2) },
        everyday: { phenomenon: "Pulse rate surge during sudden fright or aerobic sprint", explanation: "Sympathetic epinephrine release accelerates SA node firing and increases ventricular stroke volume to boost cardiac output" },
        misconception: "Arteries always carry oxygenated blood and veins always carry deoxygenated blood, overlooking pulmonary arteries carrying deoxygenated blood to lungs and pulmonary veins carrying oxygenated blood to heart"
      },
      2: {
        system: "Respiratory System: Airway Anatomy, Diaphragm Mechanics, Alveoli & Partial Pressure Gradients",
        mechanism: "Diaphragm contraction expanding thoracic cavity volume to generate sub-atmospheric negative intrapleural pressure, pulling ambient air into alveoli for Fick diffusion",
        terminology: { term: "Alveoli", def: "Microscopic thin-walled air sacs in the lungs surrounded by dense capillary networks where passive O2 and CO2 gas exchange occurs" },
        calc1: { formula: "V_E = V_T \\times RR", label: "minute ventilation", unit: "\\text{L/min}", solve: (vt, rr) => ((vt * rr) / 1000).toFixed(2) },
        everyday: { phenomenon: "Hyperventilation causing lightheadedness and blood alkalosis", explanation: "Rapid excessive breathing blows off alveolar CO2, shifting carbonic acid equilibrium and raising blood pH above physiological set points" },
        misconception: "Inhalation occurs because air rushes into lungs and pushes the chest outward, rather than active muscular chest expansion lowering pressure to pull air inward"
      },
      3: {
        system: "The Excretory System: Kidney Microanatomy, Nephron Filtration, Loop of Henle & ADH",
        mechanism: "Glomerular ultrafiltration driven by blood pressure, followed by tubular reabsorption and Loop of Henle countercurrent multiplication concentrated by ADH aquaporin insertion",
        terminology: { term: "Nephron", def: "The microscopic functional filtration and osmoregulatory unit of the kidney, consisting of a renal corpuscle and specialized tubular segments" },
        calc1: { formula: "GFR = \\frac{U \\times V}{P}", label: "glomerular filtration rate", unit: "\\text{mL/min}", solve: (u, v, p) => ((u * v) / p).toFixed(1) },
        everyday: { phenomenon: "Dark concentrated urine production during dehydration", explanation: "Posterior pituitary ADH secretion prompts collecting duct aquaporin insertion, maximally reabsorbing water back into hypertonic renal medullary capillaries" },
        misconception: "The kidneys filter blood to make waste, rather than filtering entire plasma volume non-selectively and then reabsorbing 99% of essential water, glucose, and ions"
      }
    }
  },
  25: {
    sys: "Gastrointestinal Enzymatic Hydrolysis & Hormonal Feedback Homeostasis",
    mech: "Luminal macromolecule enzymatic cleavage (amylases, proteases, lipases) coordinated with pancreatic insulin and glucagon negative feedback maintaining blood glucose",
    f: "\\Delta G = -k ([G] - G_{\\text{set}})",
    l: "glucose homeostatic correction",
    u: "\\text{mg/dL}",
    term: "Negative Feedback",
    def: "A regulatory homeostatic mechanism where the output or response of a system counteracts and attenuates the initial perturbation",
    evday: "Post-prandial blood sugar stabilization",
    evdesc: "Elevated blood glucose following a meal triggers pancreatic beta-cell insulin secretion, prompting liver and muscle glycogen storage",
    lessons: {
      1: {
        system: "The Digestive System: Mechanical Churning, Gastric Acid, Pancreatic Enzymes & Villus Absorption",
        mechanism: "Peristaltic propulsion through stomach (acid, pepsin) and small intestine (pancreatic proteases, amylases, lipases, bile emulsification) maximizing villus nutrient absorption",
        terminology: { term: "Peristalsis", def: "Involuntary rhythmic wave-like contractions of longitudinal and circular smooth muscles that propel food along the gastrointestinal tract" },
        calc1: { formula: "\\text{Absorption} = \\frac{M_{\\text{in}} - M_{\\text{out}}}{M_{\\text{in}}} \\times 100\\%", label: "digestive absorption efficiency", unit: "\\%", solve: (i, o) => (((i - o) / i) * 100).toFixed(1) },
        everyday: { phenomenon: "Heartburn / acid reflux after heavy meals", explanation: "Relaxation of the lower esophageal sphincter allows hydrochloric acid and pepsin to back up into the unprotected non-keratinized esophagus" },
        misconception: "Most nutrient absorption occurs in the stomach, rather than in the specialized duodenum, jejunum, and ileum of the small intestine"
      },
      2: {
        system: "Nutrition: Macronutrient Energy Density, Vitamins, Minerals & Basal Metabolic Rate",
        mechanism: "Dietary carbohydrates (4 kcal/g), proteins (4 kcal/g), and lipids (9 kcal/g) metabolized via glycolysis, Krebs cycle, and oxidative phosphorylation for cellular ATP generation",
        terminology: { term: "Basal Metabolic Rate", def: "The baseline rate of energy expenditure by an endothermic animal at complete physical and digestive rest in a thermoneutral environment" },
        calc1: { formula: "E_{\\text{cal}} = 4C + 4P + 9L", label: "caloric energy yield", unit: "\\text{kcal}", solve: (c, p, l) => (4 * c + 4 * p + 9 * l).toFixed(0) },
        everyday: { phenomenon: "Athletes carb-loading before endurance marathons", explanation: "Consuming complex carbohydrates maximizes liver and skeletal muscle glycogen stores, providing a sustained glucose reservoir for prolonged aerobic respiration" }
      },
      3: {
        system: "The Endocrine System: Pituitary Master Gland, Thyroid, Adrenal & Glucose Homeostasis",
        mechanism: "Hypothalamic-pituitary hormonal axis coupled to peripheral gland secretion; pancreatic islet beta-cells releasing insulin and alpha-cells releasing glucagon in negative feedback loops",
        terminology: { term: "Hormone", def: "A chemical signaling molecule synthesized by ductless endocrine glands and secreted directly into blood circulation to act on distant target cells" },
        calc1: { formula: "\\Delta [G] = -k([G] - 90)", label: "homeostatic glucose correction", unit: "\\text{mg/dL}", solve: (k, g) => (-k * (g - 90)).toFixed(1) },
        everyday: { phenomenon: "Frequent urination and excessive thirst in untreated diabetes", explanation: "Hyperglycemia exceeds renal tubular reabsorption thresholds, causing osmotic diuresis (glucose pulling water into urine) and dehydration" }
      }
    }
  },
  26: {
    sys: "Gametogenesis, Endocrine Gonadal Cycles & Embryonic Trimester Morphogenesis",
    mech: "Hypothalamic-pituitary-gonadal (GnRH-LH-FSH) pulsatile feedback driving oocyte maturation, fertilization, blastocyst implantation, and placental nutrient exchange",
    f: "\\text{Gestational Milestone} = \\text{Weeks} \\times 7",
    l: "developmental milestone",
    u: "\\text{days}",
    term: "Blastocyst",
    def: "A mammalian embryonic structure consisting of an inner cell mass destined to form the embryo and an outer trophoblast that forms the placenta",
    evday: "Oxytocin positive feedback during labor contractions",
    evdesc: "Cervical stretch signals hypothalamic oxytocin release, intensifying myometrial uterine contractions in a self-reinforcing delivery loop",
    lessons: {
      1: {
        system: "Reproductive Systems: Testicular Spermatogenesis, Ovarian Folliculogenesis & Menstrual Cycle Surges",
        mechanism: "Spermatogenesis in seminiferous tubules driven by testosterone; oogenesis in ovaries coordinated by pituitary FSH/LH pulses driving follicular maturation and ovulation surges",
        terminology: { term: "Gametogenesis", def: "The meiotic biological process by which diploid germ cells undergo division and differentiation into mature haploid spermatozoa or ova" },
        calc1: { formula: "\\text{Cycle Day} = \\text{LH Peak} + 14", label: "luteal phase duration", unit: "\\text{days}", solve: (lh) => String(lh + 14) },
        everyday: { phenomenon: "Ovulation predictor kits detecting LH surge", explanation: "Monoclonal antibody test strips detect the sharp spike in urinary luteinizing hormone that triggers mature ovarian follicle rupture 24-36 hours later" }
      },
      2: {
        system: "Human Development Before Birth: Fertilization, Blastocyst Cleavage, Placenta & Trimesters",
        mechanism: "Acrosome reaction permitting sperm penetration into zona pellucida, cleavage into morula and blastocyst, chorionic villi invasion forming placental maternal-fetal exchange",
        terminology: { term: "Placenta", def: "A temporary fetomaternal vascular organ that mediates nutrient, gas, and metabolic waste exchange between maternal and fetal circulations" },
        calc1: { formula: "\\text{CRL} = 1.05 \\times t^{1.4}", label: "crown-rump length", unit: "\\text{mm}", solve: (t) => (1.05 * Math.pow(t, 1.4)).toFixed(1) },
        everyday: { phenomenon: "Critical avoidance of alcohol and teratogens in the first trimester", explanation: "Major embryonic organogenesis occurs during weeks 3 through 8; chemical disruptions during this window produce severe irreversible congenital anomalies" }
      },
      3: {
        system: "Birth, Growth, and Aging: Stages of Labor, Oxytocin Positive Feedback, Postnatal Growth & Senescence",
        mechanism: "Fetal head cervical engagement triggering hypothalamic oxytocin release, intensifying myometrial contractions; postnatal growth hormone cascades and telomere shortening in aging",
        terminology: { term: "Oxytocin", def: "A peptide neurohormone synthesized in the hypothalamus that stimulates vigorous uterine myometrial contractions during labor and milk ejection" },
        calc1: { formula: "\\text{Apgar Score} = \\sum_{i=1}^5 S_i", label: "neonatal Apgar score", unit: "", solve: (s) => String(Math.min(10, s)) },
        everyday: { phenomenon: "Self-amplifying labor contractions during child delivery", explanation: "Cervical dilation stimulates sensory nerves that drive pituitary oxytocin release, which triggers even stronger contractions until delivery is accomplished" }
      }
    }
  },
  27: {
    sys: "Innate Barrier Defenses, Adaptive Clonal Selection & Immunological Memory",
    mech: "Antigen presenting cells displaying peptide-MHC complexes to CD4+ T helper and CD8+ cytotoxic T cells, stimulating B-cell somatic hypermutation and antibody synthesis",
    f: "\\text{Titer} = \\frac{1}{\\text{Highest Dilution Factor}}",
    l: "serum antibody titer",
    u: "",
    term: "Clonal Selection",
    def: "The process whereby an antigenic epitope specifically binds and activates a complementary lymphocyte receptor, triggering rapid mitotic proliferation",
    evday: "Lifelong immunity conferred by measles vaccination",
    evdesc: "Inoculation with an attenuated viral antigen generates durable memory B and T cells that neutralize wild virus upon secondary exposure",
    lessons: {
      1: {
        system: "Infectious Diseases: Pathogen Virulence, Transmission Vectors & Koch's Postulates",
        mechanism: "Microbial invasion (viral lytic hijacking, bacterial exotoxins/endotoxins) spreading through aerosol droplets, vectors, or fomites fulfilling Koch's causality criteria",
        terminology: { term: "Pathogen", def: "A biological agent capable of causing disease or systemic pathology in a host organism, including viruses, bacteria, fungi, and parasites" },
        calc1: { formula: "R_0 = \\beta \\times c \\times D", label: "basic reproduction number", unit: "", solve: (b, c, d) => (b * c * d).toFixed(1) },
        everyday: { phenomenon: "Quarantine isolation and hand washing during viral epidemics", explanation: "Disrupting contact rates (c) and destroying lipid viral envelopes with soap drops the effective reproduction number below 1.0, extinguishing outbreaks" }
      },
      2: {
        system: "The Immune System: Innate Barrier Defenses & Adaptive Lymphocyte Clonal Selection",
        mechanism: "Phagocytic macrophage engulfment, complement activation, and MHC-antigen presentation triggering CD4+ helper T cell cytokine release and B-cell antibody secretion",
        terminology: { term: "Antibody", def: "A Y-shaped defensive immunoglobulin glycoprotein secreted by plasma B cells that specifically binds and neutralizes foreign antigen epitopes" },
        calc1: { formula: "\\text{Avidity} = K_a \\times n", label: "multivalent functional avidity", unit: "\\text{M}^{-1}", solve: (ka, n) => (ka * n).toExponential(2) },
        everyday: { phenomenon: "Fever and localized swelling following an infected splinter", explanation: "Mast cells release histamine and prostaglandins, increasing capillary permeability to recruit neutrophils and macrophages to destroy invading microbes" }
      },
      3: {
        system: "Noninfectious Disorders: Autoimmune Diseases, Anaphylactic Allergies & Immunodeficiency (HIV)",
        mechanism: "Breakdown of immune self-tolerance causing autoantibody attack (lupus, Type 1 diabetes), IgE-mediated mast cell degranulation (anaphylaxis), or viral CD4+ destruction (HIV)",
        terminology: { term: "Autoimmune Disease", def: "A pathological condition in which the adaptive immune system loses self-tolerance and mistakenly attacks healthy host cells and tissues" },
        calc1: { formula: "\\text{CD4 Ratio} = \\frac{[\\text{CD4}^+]}{[\\text{CD8}^+]}", label: "helper-to-cytotoxic T cell ratio", unit: "", solve: (cd4, cd8) => (cd4 / cd8).toFixed(2) },
        everyday: { phenomenon: "Carrying an epinephrine auto-injector (EpiPen) for severe allergies", explanation: "Epinephrine stimulates alpha-1 vasoconstriction to restore crashing blood pressure and beta-2 bronchodilation to open constricted airways during anaphylactic shock" }
      }
    }
  }
};

for (let i = 4; i <= 27; i++) {
  const d = BIO_DATA_MAP[i];
  const curMod = biologyCurriculum.modules.find(m => m.id === i);
  const mTitle = curMod ? curMod.title : `Biology Module ${i}`;
  const mPhen = curMod ? curMod.phenomenon : "Homeostatic regulation in biological systems";
  BIO_MODULE_PROFILES[i] = {
    system: d.sys,
    mechanism: d.mech,
    calc1: { formula: d.f, label: d.l, unit: d.u, solve: (a, b) => (a * b * 0.5).toFixed(2) },
    calc2: { formula: "p^2 + 2pq + q^2 = 1", label: "allele frequency", unit: "", solve: (q) => (1 - q).toFixed(3) },
    graph: `Sigmoidal logistic population growth curve displaying carrying capacity K plateau for ${mTitle}`,
    experiment: { iv: `Biological parameter manipulated in ${mTitle}`, dv: "Physiological response and survival rate", controls: "Ambient temperature, nutrient broth pH, sterile conditions" },
    misconception: `Believing organisms deliberately mutate in response to environmental need rather than random mutation and natural selection`,
    application: `CRISPR gene therapy, targeted oncology treatments, and ecological conservation in ${mTitle}`,
    perturbation: "Apex predator trophic removal or environmental pH drop disrupting homeostatic equilibrium",
    comparison: `Prokaryotic structural simplicity versus compartmentalized eukaryotic organelle specialization in ${mTitle}`,
    errorAnalysis: "Sample contamination and micro-pipetting volume calibration errors in assay runs",
    boundary: "Maximum cellular surface-area-to-volume ratio limiting nutrient diffusion rates",
    cer1: { prompt: `Investigate the evolutionary adaptation described in ${mTitle}: "${mPhen}"`, claim: `Adaptive traits in ${mTitle} increase reproductive fitness under selective pressure.`, ev: "Long-term census tracking records allele frequency shifts favoring favorable phenotypes.", reas: "Differential reproductive success ensures alleles conveying physiological advantages accumulate in subsequent generations." },
    historical: `Pioneering biological experiments that validated core principles of ${mTitle}`,
    cer2: { prompt: `Analyze the clinical or environmental implications of perturbing the homeostatic loop in ${mTitle}.`, claim: "Disrupting negative feedback cascades produces severe systemic failure or population collapse.", ev: "Biomarker assays show runaway hormonal or metabolic deviation beyond physiological tolerance limits.", reas: "Living systems require dynamic feedback loops to maintain stable internal conditions despite external fluctuations." },
    terminology: { term: d.term, def: d.def },
    everyday: { phenomenon: d.evday, explanation: d.evdesc },
    lessons: d.lessons || {}
  };
}

// =========================================================================
// PHYSICS MODULE PROFILES (1 - 24)
// =========================================================================
export const PHYS_MODULE_PROFILES = {};

const PHYS_DATA_MAP = {
  1: {
    sys: "SI Metrology, Dimensional Analysis & Vector Math",
    mech: "Orthogonal Cartesian vector decomposition maintaining geometric invariant norms across coordinate frames",
    f: "R = \\sqrt{A^2 + B^2}",
    l: "resultant vector",
    u: "m",
    term: "Vector",
    def: "A physical quantity possessing both numerical magnitude and spatial direction",
    evday: "Airplane navigating crosswinds",
    evdesc: "Pilots angle the plane's heading vector to cancel perpendicular crosswind vectors, maintaining a straight course"
  },
  2: {
    sys: "One-Dimensional Kinematics & Position Coordinates",
    mech: "Continuous differential rates of displacement yielding instantaneous velocity v = dx/dt",
    f: "\\bar{v} = \\frac{\\Delta x}{\\Delta t}",
    l: "average velocity",
    u: "m/s",
    term: "Displacement",
    def: "The straight-line vector distance and direction from an initial position to a final position",
    evday: "Running laps around a 400m track",
    evdesc: "Finishing a complete lap returns you to the start line, so total distance is 400 m but net displacement is exactly 0 m"
  },
  3: {
    sys: "Accelerated Motion & Uniform Gravitational Free Fall",
    mech: "Constant downward gravitational acceleration g = 9.80 m/s² producing parabolic displacement-time trajectories",
    f: "v^2 = v_0^2 + 2a\\Delta x",
    l: "kinematic velocity",
    u: "m/s",
    term: "Free Fall",
    def: "The motion of an object when gravity is the only significant force acting upon it",
    evday: "Dropping a phone from a table",
    evdesc: "The phone accelerates toward the floor at 9.80 m/s², reaching high speed within a fraction of a second"
  },
  4: {
    sys: "Newton's Laws of Motion & Force Vectors",
    mech: "Net unbalanced force accelerating mass via F_net = ma with equal and opposite reactionary contact forces",
    f: "F_{\\text{net}} = ma",
    l: "net force",
    u: "N",
    term: "Inertia",
    def: "The resistance of any physical object to any change in its velocity or state of rest",
    evday: "Wearing a seatbelt in a braking car",
    evdesc: "When brakes lock, your body's inertia carries you forward until the seatbelt exerts an external stopping force"
  },
  5: {
    sys: "Two-Dimensional Forces, Friction & Inclined Planes",
    mech: "Resolution of gravitational vectors into normal (mg cos θ) and parallel (mg sin θ) components opposed by friction",
    f: "F_f = \\mu F_N",
    l: "frictional force",
    u: "N",
    term: "Coefficient of Friction",
    def: "A dimensionless scalar ratio representing the resistive frictional force between two contacting surfaces",
    evday: "Sledding down a snowy hill",
    evdesc: "Steeper slopes increase the downhill parallel gravity vector (mg sin θ) while low ice friction allows fast acceleration"
  },
  6: {
    sys: "Two-Dimensional Kinematics & Uniform Circular Motion",
    mech: "Orthogonal centripetal acceleration a_c = v²/r constantly redirecting velocity vectors perpendicular to trajectory",
    f: "a_c = \\frac{v^2}{r}",
    l: "centripetal acceleration",
    u: "m/s^2",
    term: "Centripetal Force",
    def: "The net inward force directed toward the center of curvature required to keep an object moving in a circular path",
    evday: "Spin cycle of a washing machine",
    evdesc: "The perforated drum applies inward centripetal force to clothes, while water droplets fly straight out through holes"
  },
  7: {
    sys: "Newtonian Gravitation & Orbital Planetary Mechanics",
    mech: "Universal inverse-square gravitational force F = G(m1 m2)/r² providing centripetal orbital acceleration",
    f: "F_g = G \\frac{m_1 m_2}{r^2}",
    l: "gravitational force",
    u: "N",
    term: "Orbital Velocity",
    def: "The exact tangential velocity needed for a satellite to continuously free-fall around a celestial body without crashing",
    evday: "Ocean tides caused by the Moon",
    evdesc: "The Moon's gravitational pull exerts differential tidal forces on Earth's oceans, creating two high-tide bulges daily"
  },
  8: {
    sys: "Rotational Dynamics, Torque & Angular Momentum",
    mech: "Rotational inertia resisting angular acceleration τ = Iα, with angular momentum conserved in isolated systems",
    f: "\\tau = r F \\sin\\theta",
    l: "torque",
    u: "\\text{N}\\cdot\\text{m}",
    term: "Torque",
    def: "The quantitative rotational equivalent of linear force that causes an object to rotate about an axis",
    evday: "Opening a heavy door with a handle",
    evdesc: "Door handles are placed at the far edge from the hinges to maximize lever arm distance r and rotational torque"
  },
  9: {
    sys: "Linear Momentum, Impulse & Collision Dynamics",
    mech: "Integral of contact force over collision duration J = F Δt yielding change in linear momentum Δp",
    f: "J = F \\Delta t = \\Delta p",
    l: "impulse",
    u: "\\text{N}\\cdot\\text{s}",
    term: "Impulse",
    def: "The product of the average force exerted on an object and the time interval over which it acts",
    evday: "Airbags cushioning car crash impacts",
    evdesc: "Airbags increase the collision impact duration Δt, drastically reducing the peak stopping force exerted on passengers"
  },
  10: {
    sys: "Work, Energy & Simple Machine Mechanical Advantage",
    mech: "Scalar dot product of force and displacement vectors W = F · d transferring energy into mechanical systems",
    f: "W = F d \\cos\\theta",
    l: "work performed",
    u: "J",
    term: "Work",
    def: "The scalar energy transferred to an object when a force acts upon it through a parallel displacement",
    evday: "Using a ramp to load a truck",
    evdesc: "Ramps increase displacement distance d, allowing you to exert a much smaller force F to lift heavy cargo",
    lessons: {
      1: {
        system: "Work and Energy: W = Fd cos θ, Kinetic Energy KE = 1/2 mv² & Work-Energy Theorem",
        mechanism: "Net work done on an object by external forces equaling the change in its translational kinetic energy",
        terminology: { term: "Work-Energy Theorem", def: "The theorem stating that the net work done on an object equals its change in kinetic energy: W_net = ΔKE" }
      },
      2: {
        system: "The Many Forms of Energy: Gravitational Potential PE = mgh & Elastic Hooke's PE = 1/2 kx²",
        mechanism: "Conservative work stored in gravitational and spring force fields reversible upon release",
        terminology: { term: "Potential Energy", def: "Energy stored in an object due to its position or mechanical state in a conservative force field" }
      },
      3: {
        system: "Conservation of Energy: Mechanical Energy Conservation & Dissipative Friction Losses",
        mechanism: "In isolated frictionless systems, total mechanical energy (KE + PE) remains strictly constant",
        terminology: { term: "Conservation of Mechanical Energy", def: "The physical law stating that total mechanical energy remains constant in systems where only conservative forces act" }
      },
      4: {
        system: "Machines: Mechanical Advantage (MA), Ideal Mechanical Advantage (IMA) & Work Efficiency",
        mechanism: "Trading applied force for displacement distance in levers, pulleys, and inclined planes while conserving energy",
        terminology: { term: "Mechanical Advantage", def: "The ratio of the output force exerted by a machine to the input force applied to it" }
      }
    }
  },
  11: {
    sys: "Thermal Thermodynamics, Specific Heat Calorimetry & Heat Engine Efficiency",
    mech: "Microscopic molecular kinetic energy transfer driven by thermal gradients governed by specific heat capacity Q = mcΔT and Carnot entropy limits",
    f: "Q = mc\\Delta T",
    l: "sensible heat transfer",
    u: "J",
    term: "Specific Heat Capacity",
    def: "The quantity of thermal heat energy required to raise the temperature of one kilogram of a substance by one Kelvin",
    evday: "Hot sand and cool ocean water on a sunny beach",
    evdesc: "Water's high specific heat capacity allows it to absorb enormous solar energy with minimal temperature rise compared to dry sand",
    lessons: {
      1: {
        system: "Temperature, Heat, and Thermal Energy: Calorimetry, Zeroth Law & Specific Heat Capacity",
        mechanism: "Thermal equilibrium establishing uniform temperature as heat flows from high to low kinetic energy until Q_lost + Q_gained = 0",
        terminology: { term: "Specific Heat Capacity", def: "The quantity of heat required to raise the temperature of one kilogram of a substance by one Kelvin" },
        calc1: { formula: "Q = mc\\Delta T", label: "sensible heat", unit: "J", solve: (m, c, dt) => (m * c * dt).toFixed(1) },
        everyday: { phenomenon: "Cool sea breeze at daytime beaches", explanation: "Sunlight warms dry beach sand much faster than ocean water, creating rising warm air that draws cool marine breezes onshore" }
      },
      2: {
        system: "Changes of State and Thermodynamics: Latent Heat, First Law (ΔU = Q - W), Entropy & Carnot Heat Engines",
        mechanism: "Latent heat overcoming intermolecular bonds at constant temperature, while Carnot limits mandate maximum thermal engine efficiency",
        terminology: { term: "Carnot Efficiency", def: "The maximum theoretical thermodynamic efficiency of an ideal heat engine operating between two temperatures: η = 1 - TC/TH" },
        calc1: { formula: "\\eta = 1 - \\frac{T_C}{T_H}", label: "Carnot engine efficiency", unit: "", solve: (tc, th) => (1 - tc / th).toFixed(3) },
        everyday: { phenomenon: "Ice cubes chilling a warm drink without rising above 0°C", explanation: "Melting ice absorbs substantial latent heat of fusion (334 J/g) at constant 0°C until the solid phase is fully liquefied" }
      }
    }
  },
  12: {
    sys: "Hydrostatic Fluid Mechanics, Archimedes Buoyancy & Bernoulli Dynamics",
    mech: "Isotropic fluid pressure depth gradients P = ρgh creating net upward buoyant forces F_b = ρ_f V g and streamline velocity-pressure coupling",
    f: "P = \\rho g h",
    l: "hydrostatic fluid pressure",
    u: "\\text{Pa}",
    term: "Buoyant Force",
    def: "The net vertical upward force exerted by a pressurized fluid on a submerged body, equal in magnitude to the weight of displaced fluid",
    evday: "Massive 200,000-ton steel container ships floating effortlessly",
    evdesc: "Hollow hull geometry displaces thousands of cubic meters of ocean water, generating a buoyant force exactly balancing total ship weight",
    lessons: {
      1: {
        system: "Properties of Fluids: Pressure P = F/A, Hydrostatic Depth P = ρgh & Atmospheric Barometers",
        mechanism: "Gravity acting on fluid layers generating increasing compressive hydrostatic pressure with depth",
        terminology: { term: "Hydrostatic Pressure", def: "The pressure exerted by a fluid at equilibrium at a given depth due to the force of gravity" }
      },
      2: {
        system: "Forces within Liquids: Cohesion, Adhesion, Capillary Rise & Pascal's Principle Hydraulic Multiplication",
        mechanism: "Incompressible liquid transmitting applied pressure equally in all directions, multiplying output force by piston area ratio",
        terminology: { term: "Pascal's Principle", def: "A principle stating that pressure applied to an enclosed fluid is transmitted undiminished to every portion of the fluid" }
      },
      3: {
        system: "Fluids at Rest and in Motion: Archimedes Buoyant Force, Continuity Equation & Bernoulli Streamlines",
        mechanism: "Pressure differential between top and bottom surfaces of submerged objects generating upward buoyancy, and faster flow lowering pressure",
        terminology: { term: "Bernoulli's Principle", def: "The fluid dynamics principle stating that an increase in the speed of a fluid occurs simultaneously with a decrease in static pressure" }
      },
      4: {
        system: "Solids: Thermal Linear Expansion (ΔL = α L1 ΔT), Stress, Strain & Young's Modulus Elasticity",
        mechanism: "Thermal lattice vibrations expanding interatomic separation distances, and tensile stress producing proportional elastic strain",
        terminology: { term: "Young's Modulus", def: "A mechanical property measuring the tensile stiffness of a solid material, defined as tensile stress divided by tensile strain" }
      }
    }
  },
  13: {
    sys: "Simple Harmonic Oscillation, Mechanical Waves & Superposition Interference",
    mech: "Linear Hooke's restoring forces F = -kx driving sinusoidal oscillations that propagate through elastic media as transverse and longitudinal waves obeying v = fλ",
    f: "v = f\\lambda",
    l: "wave speed",
    u: "m/s",
    term: "Resonance",
    def: "The dramatic amplification of oscillation amplitude that occurs when an external periodic driving force matches the system's natural frequency",
    evday: "Pushing a child on a playground swing",
    evdesc: "Pushing in rhythm with the swing's natural frequency adds constructive energy each cycle, soaring higher",
    lessons: {
      1: {
        system: "Periodic Motion: Hooke's Law Spring Oscillators, Simple Pendulums & Resonance",
        mechanism: "Restoring forces proportional to displacement driving continuous sinusoidal exchange between potential and kinetic energy",
        terminology: { term: "Simple Harmonic Motion", def: "Periodic motion where the restoring force is directly proportional to displacement from equilibrium and acts in the opposite direction" }
      },
      2: {
        system: "Wave Properties: Transverse vs Longitudinal Waves, Wavelength λ, Frequency f & Wave Speed v = fλ",
        mechanism: "Energy and momentum propagation through deformable media without bulk transport of matter",
        terminology: { term: "Wavelength", def: "The spatial distance between two successive points in phase on adjacent cycles of a periodic wave" }
      },
      3: {
        system: "Wave Behavior: Fixed vs Free Boundary Reflection, Principle of Superposition, Standing Waves & Nodes",
        mechanism: "Superposition of identical counter-propagating waves forming stationary nodes (zero motion) and antinodes (maximum motion)",
        terminology: { term: "Standing Wave", def: "A wave pattern that remains in a constant position formed by the interference of two traveling waves of equal frequency moving in opposite directions" }
      }
    }
  },
  14: {
    sys: "Acoustic Wave Mechanics, Resonant Standing Waves & Doppler Frequency Shifts",
    mech: "Longitudinal molecular compression and rarefaction wavefronts propagating through elastic media, experiencing Doppler frequency shifts upon relative motion",
    f: "f_d = f_s \\left(\\frac{v \\pm v_d}{v \\mp v_s}\\right)",
    l: "Doppler shifted frequency",
    u: "\\text{Hz}",
    term: "Doppler Effect",
    def: "The observed change in wave frequency resulting from relative motion between the emitting sound source and the observer",
    evday: "Pitch drop of a passing police siren",
    evdesc: "Approaching siren compressions bunch closer together to produce a higher frequency, spreading apart into a lower frequency as it moves away",
    lessons: {
      1: {
        system: "Properties and Detection of Sound: Speed of Sound in Media, Decibels & Doppler Shifts",
        mechanism: "Longitudinal density oscillations through elastic media with Doppler frequency shifts caused by source or detector velocity",
        terminology: { term: "Doppler Effect", def: "The apparent shift in frequency observed when a sound source and listener move relative to one another" }
      },
      2: {
        system: "The Physics of Music: Open & Closed Tube Resonance, Harmonics & Acoustic Beats",
        mechanism: "Boundary reflections creating standing acoustic pressure waves in columns, and frequency interference generating rhythmic beats",
        terminology: { term: "Beat Frequency", def: "The periodic pulsating amplitude modulation resulting from the superposition of two sound waves of slightly differing frequencies" }
      }
    }
  },
  15: {
    sys: "Photometric Illumination, Wave Nature of Light & Malus's Law Polarization",
    mech: "Spherical propagation of electromagnetic photons obeying inverse-square illuminance E = P/(4πr²) and transverse wave polarization by linear filters",
    f: "E = \\frac{P}{4\\pi r^2}",
    l: "illuminance",
    u: "\\text{lx}",
    term: "Polarization",
    def: "The physical orientation of the oscillating electric field vector in a transverse electromagnetic light wave",
    evday: "Polarized sunglasses eliminating road and water glare",
    evdesc: "Sunlight reflecting off horizontal surfaces becomes horizontally polarized; vertical transmission filters absorb this glare completely",
    lessons: {
      1: {
        system: "Illumination: Speed of Light c, Luminous Flux (Lumens) & Inverse-Square Illuminance",
        mechanism: "Photons radiating uniformly in all directions over expanding spherical wavefronts of area 4πr²",
        terminology: { term: "Illuminance", def: "The total luminous flux incident per unit surface area, measured in lux (lumens per square meter)" }
      },
      2: {
        system: "The Wave Nature of Light: Electromagnetic Visible Spectrum, Additive Color & Malus's Law",
        mechanism: "Oscillating transverse electric field vectors transmitted through anisotropic crystal polymer grids following I = I0 cos² θ",
        terminology: { term: "Malus's Law", def: "A physical law stating that transmitted polarized light intensity varies as the square of the cosine of angle between polarizer and analyzer axes" }
      }
    }
  },
  16: {
    sys: "Geometric Ray Optics, Snell's Law & Thin Lens Imaging",
    mech: "Boundary phase velocity changes causing wavefront refraction according to Snell's law n1 sin θ1 = n2 sin θ2 and optical mirror focal convergence",
    f: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
    l: "Snell's law refraction index",
    u: "",
    term: "Total Internal Reflection",
    def: "The complete reflection of a light ray within an optically denser medium when incident at an angle exceeding the critical angle",
    evday: "Fiber-optic internet cables transmitting data across oceans",
    evdesc: "Laser pulses enter thin glass cores above the critical angle, undergoing total internal reflection without optical power leaking into cladding",
    lessons: {
      1: {
        system: "Reflection of Light: Law of Reflection (θr = θi), Specular vs Diffuse & Plane Mirrors",
        mechanism: "Wavefronts bouncing off boundary surfaces where angle of incidence equals angle of reflection",
        terminology: { term: "Law of Reflection", def: "The optical rule stating that the angle of incidence equals the angle of reflection relative to the surface normal" }
      },
      2: {
        system: "Curved Mirrors: Concave Convergence, Convex Divergence & The Mirror Equation",
        mechanism: "Spherical mirror curvature focusing parallel rays to a focal point at f = R/2",
        terminology: { term: "Focal Length", def: "The distance from the center of a mirror or lens to its focal point, equal to half the radius of curvature for spherical mirrors" }
      },
      3: {
        system: "Refraction of Light: Index of Refraction n = c/v, Snell's Law & Total Internal Reflection Critical Angle",
        mechanism: "Phase speed reduction in denser media pivoting wavefronts toward the normal according to Fermat's principle of least time",
        terminology: { term: "Critical Angle", def: "The minimum angle of incidence in a denser medium above which total internal reflection occurs" }
      },
      4: {
        system: "Convex and Concave Lenses: Thin Lens Equation, Ray Tracing Diagrams & Optical Magnification",
        mechanism: "Dual curved refractive surfaces converging or diverging light wavefronts to form real inverted or virtual upright images",
        terminology: { term: "Thin Lens Equation", def: "The formula relating object distance, image distance, and focal length for thin converging and diverging lenses" }
      }
    }
  },
  17: {
    sys: "Physical Wave Optics, Young's Double-Slit & Single-Slit Diffraction",
    mech: "Spatial phase differences between coherent wavelets producing constructive bright fringes d sin θ = mλ and destructive dark cancellation minima",
    f: "d \\sin\\theta = m\\lambda",
    l: "double-slit fringe path difference",
    u: "m",
    term: "Diffraction",
    def: "The bending, spreading, and interference of waves around the sharp edges of obstacles or through narrow apertures",
    evday: "Iridescent rainbow patterns on the surface of a DVD or compact disc",
    evdesc: "Closely spaced microscopic digital track pits act as a reflection diffraction grating, separating white light into spectral constituent colors",
    lessons: {
      1: {
        system: "Interference: Young's Double-Slit Experiment, Coherent Sources & Constructive/Destructive Fringe Geometry",
        mechanism: "Two coherent slit sources generating overlapping spherical wavefronts that reinforce where path length difference equals mλ",
        terminology: { term: "Coherent Waves", def: "Waves possessing identical frequencies and a constant phase difference that can produce stable interference patterns" }
      },
      2: {
        system: "Diffraction: Single-Slit Diffraction Minima, Diffraction Gratings & Rayleigh Resolution Criterion",
        mechanism: "Huygens wavelets within a single aperture interfering across the slit width w, creating broad central maxima and dark minima at w sin θ = mλ",
        terminology: { term: "Diffraction Grating", def: "An optical device with thousands of closely spaced parallel slits that disperses light into highly resolved spectral wavelengths" }
      }
    }
  },
  18: {
    sys: "Electrostatic Charges, Coulombic Forces & Electric Field Potential",
    mech: "Point charge distributions generating vector electric fields E = kQ/r² that exert Coulombic attractive and repulsive forces on other charges",
    f: "F_e = k \\frac{|q_1 q_2|}{r^2}",
    l: "Coulomb electrostatic force",
    u: "N",
    term: "Electric Field",
    def: "A vector force field established by electric charges where any test charge experiences an electrostatic force per unit charge",
    evday: "Static cling on clothing fresh from a clothes dryer",
    evdesc: "Frictional contact transfers electrons between differing synthetic fabrics, leaving opposing net charges that attract clothing together",
    lessons: {
      1: {
        system: "Electric Charge: Quantization (q = ne), Conservation of Charge & Conductors vs Insulators",
        mechanism: "Electron mobility in metallic conduction bands allowing charge redistribution via friction, conduction, or induction",
        terminology: { term: "Quantization of Charge", def: "The physical principle that electric charge exists only in discrete integer multiples of the elementary charge e = 1.602 × 10^-19 C" }
      },
      2: {
        system: "Electrostatic Force: Coulomb's Inverse-Square Law & Vector Superposition of Multiple Charges",
        mechanism: "Inverse-square electrostatic vector forces acting along the line connecting point charges",
        terminology: { term: "Coulomb's Law", def: "The fundamental law quantifying the electrostatic force between two point charges proportional to the product of charges and inversely proportional to r²" }
      },
      3: {
        system: "Measuring Electric Fields: Electric Field Intensity E = F/q & Equipotential Field Mapping",
        mechanism: "Vector electric field lines radiating outward from positive charges and terminating on negative charges perpendicular to equipotential surfaces",
        terminology: { term: "Electric Field Strength", def: "The vector electrostatic force exerted per unit positive test charge placed at a specific point in space" }
      },
      4: {
        system: "Applications of Electric Fields: Electric Potential Difference (Volts), Uniform Fields & Capacitance",
        mechanism: "Electrostatic potential energy stored per unit charge in electric fields, with parallel plates accumulating charge as C = q/ΔV",
        terminology: { term: "Capacitance", def: "The ratio of the magnitude of electric charge on either conductor plate of a capacitor to the electric potential difference between them" }
      }
    }
  },
  19: {
    sys: "Electric Current, Resistance, Ohm's Law & Kirchhoff Network Circuits",
    mech: "Electromotive potential differences driving electron drift velocity through resistive conductors governed by V = IR and Kirchhoff conservation laws",
    f: "V = IR",
    l: "Ohm's law potential",
    u: "V",
    term: "Electric Resistance",
    def: "The measure of opposition to the flow of electric charge through a material, defined as the ratio of voltage to current",
    evday: "Toaster heating coils glowing bright red",
    evdesc: "Current forced through high-resistance Nichrome alloy coils causes intense electron-lattice collisions, dissipating electrical power as heat",
    lessons: {
      1: {
        system: "Current and Circuits: Charge Flow Rate (I = q/t), Drift Velocity & Complete Conductive Loops",
        mechanism: "Continuous closed circuit paths driven by chemical battery EMF maintaining electric fields that propel mobile electrons",
        terminology: { term: "Electric Current", def: "The continuous rate of flow of net electric charge through a cross-sectional area of a conductor, measured in Amperes (C/s)" }
      },
      2: {
        system: "Using Electrical Energy: Ohm's Law (V = IR), Resistivity (R = ρL/A) & Electric Power Dissipation",
        mechanism: "Atomic lattice collisions converting electrical potential energy into thermal Joule heating at rate P = I²R",
        terminology: { term: "Joule Heating", def: "The process by which the passage of an electric current through a resistive conductor releases thermal energy, governed by P = I²R" }
      },
      3: {
        system: "Simple Circuits: Series Resistance Summation, Parallel Current Division & Voltage Dividers",
        mechanism: "Series resistors sharing identical current with additive resistances, while parallel resistors share identical voltage with inverse reciprocal conductance",
        terminology: { term: "Equivalent Resistance", def: "The single theoretical resistance value that could replace an entire network of connected resistors without changing terminal current" }
      },
      4: {
        system: "Applications of Circuits: Kirchhoff's Junction & Loop Rules, Fuses & GFCI Shock Safety",
        mechanism: "Conservation of electric charge at circuit junctions (ΣI = 0) and conservation of energy around closed loops (ΣV = 0)",
        terminology: { term: "Kirchhoff's Loop Rule", def: "A statement of energy conservation asserting that the directed sum of potential differences around any closed circuit loop is zero" }
      }
    }
  },
  20: {
    sys: "Magnetic Dipoles, Lorentz Force on Charges & Current-Carrying Wires",
    mech: "Moving electrical charges and spin alignments generating magnetic fields that exert perpendicular Lorentz forces F = qvB sin θ on charges and F = ILB sin θ on wires",
    f: "F = q v B \\sin\\theta",
    l: "Lorentz magnetic force",
    u: "N",
    term: "Lorentz Force",
    def: "The perpendicular magnetic deflection force exerted on a charged particle moving through a magnetic vector field",
    evday: "Electric motor spinning an axle",
    evdesc: "Current directed through loop wires immersed in a magnetic field experiences opposing Lorentz forces on opposite sides, producing continuous rotational torque",
    lessons: {
      1: {
        system: "Understanding Magnetism: Dipole Poles, Magnetic Field Lines, Ferromagnetic Domains & Earth's Core",
        mechanism: "Paired electron spins in iron/nickel aligning into macroscopic ferromagnetic domains, and planetary liquid core dynamos creating geomagnetic shields",
        terminology: { term: "Magnetic Domain", def: "A microscopic region within a ferromagnetic material where individual atomic electron magnetic moments are aligned parallel" }
      },
      2: {
        system: "Applying Magnetic Forces: Right-Hand Rules, Lorentz Deflection on Charges & Forces on Current Wires",
        mechanism: "Magnetic vector fields exerting perpendicular deflections that bend charged particles into circular cyclotron orbits without doing work",
        terminology: { term: "Lorentz Force", def: "The magnetic force exerted perpendicularly to both velocity and magnetic field vectors on a moving charge: F = qvB sin θ" }
      }
    }
  },
  21: {
    sys: "Electromagnetic Induction, Faraday-Lenz Dynamos & Maxwell Wave Propagation",
    mech: "Time-varying magnetic flux through conducting loops inducing electromotive force EMF = -N(dΦ/dt), powering dynamos and sustaining self-propagating EM waves",
    f: "\\mathcal{E} = -N \\frac{\\Delta\\Phi_B}{\\Delta t}",
    l: "Faraday induced EMF",
    u: "V",
    term: "Electromagnetic Induction",
    def: "The generation of an electromotive force (voltage) across an electrical conductor caused by a dynamic change in magnetic flux linkage",
    evday: "Induction cooking stovetops heating iron skillets",
    evdesc: "High-frequency alternating magnetic coils beneath ceramic cooktops induce swirling circular eddy currents inside iron pans, generating heat via Joule resistance",
    lessons: {
      1: {
        system: "Inducing Currents: Faraday's Law, Magnetic Flux (Φ = BA cos θ) & Lenz's Law Opposition",
        mechanism: "Dynamically changing magnetic flux inducing circular electric fields that drive currents opposing the flux change",
        terminology: { term: "Lenz's Law", def: "A law stating that the direction of an induced current is always such that its magnetic field opposes the change in flux that produced it" }
      },
      2: {
        system: "Applications of Induced Currents: AC Generators, Sinusoidal EMF, Eddy Current Braking & Self-Inductance",
        mechanism: "Mechanical turbines rotating wire loops in magnetic fields to produce alternating AC electromotive voltages",
        terminology: { term: "Eddy Current", def: "Loops of electrical current induced within bulk conductors by a changing magnetic field, causing resistive electromagnetic braking" }
      },
      3: {
        system: "Electric and Magnetic Fields in Space: Step-Up/Step-Down Transformers & Maxwell's EM Wave Speed",
        mechanism: "Mutual magnetic flux linkage in iron transformer cores and Maxwell's displacement currents sustaining self-propagating transverse EM waves at speed c",
        terminology: { term: "Transformer Equation", def: "The relation showing that the ratio of secondary to primary voltages in a transformer equals the turns ratio: Vs/Vp = Ns/Np" }
      }
    }
  },
  22: {
    sys: "Quantum Mechanics, Photoelectric Effect, De Broglie Waves & Bohr Atomic Transitions",
    mech: "Quantization of electromagnetic radiation into discrete photons E = hf and matter-wave duality λ = h/p governing stationary atomic electronic orbits",
    f: "E = h f",
    l: "photon energy",
    u: "J",
    term: "Photoelectric Effect",
    def: "The instantaneous ejection of electrons from a metallic surface when irradiated by light with frequency exceeding a characteristic threshold",
    evday: "Rooftop photovoltaic solar panels",
    evdesc: "Incident sunlight photons with energy above silicon's band gap excite valence electrons into conduction bands, producing continuous direct electric current",
    lessons: {
      1: {
        system: "A Particle Model of Waves: Blackbody Catastrophe, Photon Quantization (E = hf) & Photoelectric Effect",
        mechanism: "Light behaving as localized packets of energy (photons); individual photon-electron collisions liberating photoelectrons above metal work function",
        terminology: { term: "Work Function", def: "The minimum threshold energy required to liberate an electron from the surface of a specific metal in the photoelectric effect" }
      },
      2: {
        system: "Matter Waves: De Broglie Wavelength (λ = h/p), Electron Diffraction & Heisenberg Uncertainty Principle",
        mechanism: "Massive particles exhibiting matter-wave interference fringes with quantum indeterminacy constraining simultaneous position-momentum precision",
        terminology: { term: "De Broglie Wavelength", def: "The wavelength associated with a massive particle determined by Planck's constant divided by linear momentum: λ = h/p" }
      },
      3: {
        system: "Bohr's Model of the Atom: Quantized Angular Momentum & Discrete Hydrogen Emission Line Transitions",
        mechanism: "Electrons occupying non-radiating discrete energy levels (En = -13.6/n² eV), emitting or absorbing photons when transitioning between orbits",
        terminology: { term: "Quantized Energy Levels", def: "Discontinuous, discrete energy states accessible to bound electrons within an atom where radiation is emitted only during state transitions" }
      },
      4: {
        system: "The Quantum Model of the Atom: Schrödinger Wave Function, Probability Orbitals & Quantum Numbers",
        mechanism: "Three-dimensional standing probability wave solutions (ψ) describing electron clouds characterized by quantum numbers (n, l, ml, ms)",
        terminology: { term: "Wave Function", def: "A mathematical function (ψ) in quantum mechanics whose squared magnitude gives the probability density of finding a particle in space" }
      }
    }
  },
  23: {
    sys: "Semiconductor Energy Band Gaps, P-N Junction Diodes & Transistor Switching",
    mech: "Thermal and dopant valence-conduction band excitation in silicon lattices creating electron-hole charge carriers controlled across p-n depletion regions",
    f: "I = I_0 \\left(e^{qV/k_B T} - 1\\right)",
    l: "Shockley diode current",
    u: "\\text{A}",
    term: "Semiconductor",
    def: "A crystalline material whose electrical conductivity lies between conductors and insulators, modulatable by impurity doping and gate electric fields",
    evday: "Computer microprocessor CPUs containing billions of transistors",
    evdesc: "Sub-nanometer MOSFET transistors utilize voltage gate signals to switch source-to-drain conductance on and off billions of times per second",
    lessons: {
      1: {
        system: "Conduction in Solids: Valence Bands, Forbidden Band Gap Eg, Conduction Bands & Doping (n-type vs p-type)",
        mechanism: "Trivalent acceptor (p-type holes) and pentavalent donor (n-type electrons) dopants creating conduction pathways across the forbidden energy gap",
        terminology: { term: "Band Gap", def: "The energy range in a solid where no electron states can exist, separating the filled valence band from empty conduction band" }
      },
      2: {
        system: "Electronic Components: P-N Junction Diodes, Forward/Reverse Bias, LEDs & Transistor Switches",
        mechanism: "Depletion layer diffusion potential allowing forward conduction while blocking reverse current, and gate voltages modulating channel carrier density in transistors",
        terminology: { term: "P-N Junction", def: "The metallurgical boundary between p-type and n-type semiconductor regions that exhibits rectifying one-way electrical conduction" }
      }
    }
  },
  24: {
    sys: "Nuclear Strong Force Binding Energy, Radioactive Decay & Standard Model Quark-Lepton Taxonomy",
    mech: "Residual strong color force binding nucleons against Coulomb repulsion, with nuclear mass defects converting to binding energy ΔE = Δm c² during decay and fission",
    f: "\\Delta E = (\\Delta m) c^2",
    l: "nuclear binding energy",
    u: "J",
    term: "Mass Defect",
    def: "The difference between the total mass of an intact atomic nucleus and the sum of the individual rest masses of its constituent protons and neutrons",
    evday: "Nuclear medicine PET scans and cancer radiation oncology",
    evdesc: "Positron-emitting isotopes like Fluorine-18 annihilate with biological electrons to produce back-to-back 511 keV gamma rays, pinpointing tumors with millimeter precision",
    lessons: {
      1: {
        system: "The Nucleus: Nucleons (Protons/Neutrons), Strong Nuclear Force, Mass Defect & Binding Energy",
        mechanism: "Short-range strong nuclear force binding nucleons, with mass defect converted directly to immense binding energy per nucleon (ΔE = Δm c²)",
        terminology: { term: "Binding Energy", def: "The energy required to disassemble a whole nucleus into its separate constituent free protons and neutrons" }
      },
      2: {
        system: "Nuclear Decay and Reactions: Alpha Decay, Beta Decay (Neutrinos), Gamma Emission, Fission & Fusion",
        mechanism: "Spontaneous quantum tunneling emitting helium-4 alpha particles, weak-force quark flavor changes emitting beta electrons and neutrinos, and heavy nucleus fission",
        terminology: { term: "Alpha Decay", def: "A nuclear radioactive decay process in which an unstable heavy nucleus emits a helium-4 nucleus (alpha particle)" }
      },
      3: {
        system: "The Building Blocks of Matter: Standard Model Quarks, Leptons, Fundamental Gauge Bosons & Antiparticles",
        mechanism: "Six flavors of quarks (up, down, charm, strange, top, bottom) forming hadrons (protons uud, neutrons udd) interacting via gluons, photons, W/Z bosons, and Higgs field",
        terminology: { term: "Quark", def: "A fundamental elementary fermion carrying fractional electric charge that serves as the constituent building block of hadrons (protons and neutrons)" }
      }
    }
  }
};

for (let i = 1; i <= 24; i++) {
  const d = PHYS_DATA_MAP[i];
  const curMod = physicsCurriculum.modules.find(m => m.id === i);
  const mTitle = curMod ? curMod.title : `Physics Module ${i}`;
  const mForm = (curMod && curMod.formulas && curMod.formulas[0]) || d.f;
  PHYS_MODULE_PROFILES[i] = {
    system: d.sys,
    mechanism: d.mech,
    calc1: { formula: d.f, label: d.l, unit: d.u, solve: (a, b) => (a * b).toFixed(2) },
    calc2: { formula: "KE = \\frac{1}{2}mv^2", label: "mechanical energy", unit: "J", solve: (m, v) => (0.5 * m * v * v).toFixed(1) },
    graph: `Velocity-time graph where slope equals acceleration and integral area equals displacement in ${mTitle}`,
    experiment: { iv: `Applied force or independent physical parameter in ${mTitle}`, dv: "Resulting kinematic acceleration or field flux response", controls: "Track friction, atmospheric drag, system mass" },
    misconception: `Confusing velocity with acceleration, or believing a constant net force is required to maintain constant velocity`,
    application: `High-speed maglev transit, aerospace trajectory guidance, and photonics in ${mTitle}`,
    perturbation: "Doubling system mass while maintaining constant net force, halving resulting acceleration",
    comparison: `Conservative forces (gravity, electrostatic) versus non-conservative dissipative forces (friction, drag)`,
    errorAnalysis: "Frictional drag on air-tracks and photogate sensor misalignment creating systematic velocity discrepancies",
    boundary: "Relativistic limit as velocity approaches the speed of light c where Newtonian mechanics breaks down",
    cer1: { prompt: `Evaluate the physical motion governed by ${mForm} in ${mTitle}.`, claim: `The system obeys conservation of momentum and energy under external constraints.`, ev: "High-speed sensor data verifies vector sum of forces balances measured mass times acceleration.", reas: "Newton's laws and Noether's conservation theorem mandate that total momentum is conserved in isolated systems." },
    historical: `Galileo and Newton's seminal experimental discoveries establishing foundational laws of ${mTitle}`,
    cer2: { prompt: `Predict the mechanical behavior of a novel aerospace prototype operating under extreme constraints in ${mTitle}.`, claim: "The aerodynamic hull maintains stability by balancing lift, drag, thrust, and gravitational vectors.", ev: "Wind tunnel telemetry demonstrates laminar boundary attachment across Mach 2 flight transitions.", reas: "Vector equilibrium demands zero net force and zero net torque for steady non-accelerating flight." },
    terminology: { term: d.term, def: d.def },
    everyday: { phenomenon: d.evday, explanation: d.evdesc },
    lessons: d.lessons || {}
  };
}
