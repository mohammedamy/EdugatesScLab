// Edugates-ClipSAT Science Labs - Physics Curriculum Data
// Extracted from McGraw-Hill Inspire Physics (Teacher's Edition - 6 Units, 24 Modules)

export const physicsCurriculum = {
  subject: "Physics",
  code: "PHYS",
  color: "#6366f1",
  badge: "Fundamental Laws of the Universe",
  description: "Investigate universal physical laws governing motion, forces, energy conservation, electromagnetism, wave-particle duality, and quantum mechanics.",
  totalModules: 24,
  totalUnits: 6,
  units: [
    { id: 1, title: "Mechanics in One Dimension", modules: [1, 2, 3, 4] },
    { id: 2, title: "Mechanics in Two Dimensions", modules: [5, 6, 7, 8] },
    { id: 3, title: "Momentum and Energy", modules: [9, 10, 11, 12] },
    { id: 4, title: "Waves and Light", modules: [13, 14, 15, 16, 17] },
    { id: 5, title: "Electricity and Magnetism", modules: [18, 19, 20, 21] },
    { id: 6, title: "Subatomic Physics", modules: [22, 23, 24] }
  ],
  modules: [
    // UNIT 1: MECHANICS IN ONE DIMENSION
    {
      id: 1,
      code: "PHYS-M01",
      unit: "Unit 1: Mechanics in One Dimension",
      title: "A Physics Toolkit",
      phenomenon: "How can astrophysicists calculate the mass of distant exoplanets purely through dimensional units and gravitational measurements?",
      bigIdea: "Standardized SI measurement units, dimensional analysis, scientific notation, and precision graphing form the foundation of physical modeling.",
      lessons: [
        { id: 1, title: "Methods of Science", objectives: ["SI base units (kg, m, s, A, K, mol, cd) and metric prefixes", "Scientific methods and scientific theories vs laws"] },
        { id: 2, title: "Mathematics and Physics", objectives: ["Dimensional analysis unit conversions", "Significant figures rules in calculations", "Scientific notation operations"] },
        { id: 3, title: "Measurement", objectives: ["Accuracy vs precision", "Systematic vs random errors, parallax error"] },
        { id: 4, title: "Graphing Data", objectives: ["Linear relationships y = mx + b", "Nonlinear quadratic (y = ax²) and inverse (y = a/x) graph shapes"] }
      ],
      formulas: ["y = mx + b", "\\text{Slope } m = \\frac{\\Delta y}{\\Delta x}", "\\text{Percent Error} = \\frac{|\\text{Accepted} - \\text{Measured}|}{\\text{Accepted}} \\times 100\\%"],
      lab: "lab-projectile"
    },
    {
      id: 2,
      code: "PHYS-M02",
      unit: "Unit 1: Mechanics in One Dimension",
      title: "Representing Motion",
      phenomenon: "How can the motion of a high-speed bullet train and a wandering pedestrian be compared on a single position-time coordinate frame?",
      bigIdea: "Motion is described through coordinate systems, position vectors, displacement, and the gradient of position-time graphs representing velocity.",
      lessons: [
        { id: 1, title: "Picturing Motion", objectives: ["Motion diagram particle model", "Coordinate system origin and positive directions"] },
        { id: 2, title: "Where and When?", objectives: ["Scalars (distance, time) vs Vectors (position, displacement Δx = xf - xi)", "Time intervals Δt"] },
        { id: 3, title: "Position-Time Graphs", objectives: ["Interpreting slope as average velocity", "Extracting instantaneous position at given time"] },
        { id: 4, title: "How Fast?", objectives: ["Average velocity v̄ vs Average speed", "Instantaneous velocity tangent line determination"] }
      ],
      formulas: ["\\Delta x = x_f - x_i", "\\bar{v} = \\frac{\\Delta x}{\\Delta t}", "x_f = x_i + \\bar{v}t"],
      lab: "lab-projectile"
    },
    {
      id: 3,
      code: "PHYS-M03",
      unit: "Unit 1: Mechanics in One Dimension",
      title: "Accelerated Motion",
      phenomenon: "Why do heavy lead balls and light wooden spheres strike the ground at the exact same instant when dropped in a vacuum chamber?",
      bigIdea: "Acceleration is the rate of change of velocity; constant acceleration allows precise trajectory predictions through kinematic equations.",
      lessons: [
        { id: 1, title: "Acceleration", objectives: ["Velocity-time graphs and slope as acceleration ā = Δv/Δt", "Positive vs negative acceleration (speeding up vs slowing down)"] },
        { id: 2, title: "Motion with Constant Acceleration", objectives: ["Kinematic equations of linear motion", "Area under v-t graph representing displacement"] },
        { id: 3, title: "Free Fall", objectives: ["Acceleration due to gravity g = 9.80 m/s²", "Symmetry of upward and downward flight paths"] }
      ],
      formulas: ["v_f = v_i + a t", "x_f = x_i + v_i t + \\frac{1}{2} a t^2", "v_f^2 = v_i^2 + 2a\\Delta x"],
      lab: "lab-projectile"
    },
    {
      id: 4,
      code: "PHYS-M04",
      unit: "Unit 1: Mechanics in One Dimension",
      title: "Forces in One Dimension",
      phenomenon: "Why does an astronaut floating inside the International Space Station feel completely weightless while experiencing 90% of Earth’s surface gravity?",
      bigIdea: "Newton's laws of motion link forces to acceleration, inertia, and action-reaction pairs using free-body diagrams.",
      lessons: [
        { id: 1, title: "Force and Motion", objectives: ["Contact vs field forces", "Newton's First Law (Law of Inertia)", "Newton's Second Law ΣF = ma", "Free-body diagrams"] },
        { id: 2, title: "Weight and Drag Force", objectives: ["Mass vs Weight (Fg = mg)", "Apparent weight in accelerating elevators", "Terminal velocity and fluid drag force"] },
        { id: 3, title: "Newton's Third Law", objectives: ["Action-reaction force pairs (Fab = -Fba)", "Normal force FN on horizontal and inclined surfaces", "Tension forces in ropes and cords"] }
      ],
      formulas: ["\\sum \\vec{F} = m \\vec{a}", "F_g = m g", "F_{\\text{scale}} = m(g + a)", "\\vec{F}_{A \\text{ on } B} = -\\vec{F}_{B \\text{ on } A}"],
      lab: "lab-projectile"
    },

    // UNIT 2: MECHANICS IN TWO DIMENSIONS
    {
      id: 5,
      code: "PHYS-M05",
      unit: "Unit 2: Mechanics in Two Dimensions",
      title: "Displacement and Force in Two Dimensions",
      phenomenon: "How can rock climbers hang suspended by their fingertips on vertical cliffs by balancing angled friction and tension vectors?",
      bigIdea: "Vectors in two dimensions are resolved into orthogonal components, enabling static equilibrium calculations.",
      lessons: [
        { id: 1, title: "Vectors", objectives: ["Graphical vector addition (tip-to-tail)", "Vector resolution into x and y trigonometric components (cos θ, sin θ)", "Pythagorean theorem and inverse tangent direction angle"] },
        { id: 2, title: "Friction", objectives: ["Static friction (Fs ≤ μsFN) vs Kinetic friction (Fk = μkFN)", "Coefficients of friction μ"] },
        { id: 3, title: "Forces in Two Dimensions", objectives: ["Equilibrant forces", "Resolving forces along and perpendicular to inclined planes"] }
      ],
      formulas: ["A_x = A \\cos\\theta, \\quad A_y = A \\sin\\theta", "F_k = \\mu_k F_N", "F_{g\\parallel} = mg\\sin\\theta, \\quad F_{g\\perp} = mg\\cos\\theta"],
      lab: "lab-projectile"
    },
    {
      id: 6,
      code: "PHYS-M06",
      unit: "Unit 2: Mechanics in Two Dimensions",
      title: "Motion in Two Dimensions",
      phenomenon: "Why does a package dropped from a horizontally flying airplane land directly beneath the plane if air resistance is neglected?",
      bigIdea: "Horizontal and vertical motions in projectile trajectories are completely independent, linked only by elapsed time.",
      lessons: [
        { id: 1, title: "Projectile Motion", objectives: ["Independence of horizontal (ax = 0) and vertical (ay = -g) components", "Parabolic trajectory equations", "Maximum height, flight time, and horizontal range"] },
        { id: 2, title: "Circular Motion", objectives: ["Uniform circular motion", "Centripetal acceleration ac = v²/r directed toward center", "Centripetal net force Fc = mac"] },
        { id: 3, title: "Relative Velocity", objectives: ["Galilean velocity addition vA/C = vA/B + vB/C in boat and aircraft navigation"] }
      ],
      formulas: ["x(t) = v_{0x} t", "y(t) = y_0 + v_{0y} t - \\frac{1}{2}gt^2", "a_c = \\frac{v^2}{r}", "R = \\frac{v_0^2 \\sin(2\\theta)}{g}"],
      lab: "lab-projectile"
    },
    {
      id: 7,
      code: "PHYS-M07",
      unit: "Unit 2: Mechanics in Two Dimensions",
      title: "Gravitation",
      phenomenon: "Why do communication satellites stay anchored above the exact same spot on Earth's equator without expending rocket fuel?",
      bigIdea: "Newton's Law of Universal Gravitation and Kepler's laws govern planetary orbits, satellite velocities, and gravitational field strengths.",
      lessons: [
        { id: 1, title: "Planetary Motion and Gravitation", objectives: ["Kepler's First Law (elliptical orbits)", "Kepler's Second Law (equal areas in equal times)", "Kepler's Third Law (T² ∝ r³)", "Newton's Law of Universal Gravitation F = Gm1m2/r²"] },
        { id: 2, title: "Using the Law of Universal Gravitation", objectives: ["Orbital speed v = √(GM/r) and orbital period of satellites", "Gravitational field strength g = GM/r²", "Inertial mass vs gravitational mass", "Einstein's general relativistic spacetime curvature concept"] }
      ],
      formulas: ["F_g = G \\frac{m_1 m_2}{r^2}", "v = \\sqrt{\\frac{GM}{r}}", "T^2 = \\left(\\frac{4\\pi^2}{GM}\\right) r^3"],
      lab: "lab-projectile"
    },
    {
      id: 8,
      code: "PHYS-M08",
      unit: "Unit 2: Mechanics in Two Dimensions",
      title: "Rotational Motion",
      phenomenon: "Why can a figure skater accelerate her spin rate dramatically simply by pulling her outstretched arms into her chest?",
      bigIdea: "Rotational dynamics parallels linear mechanics through angular displacement, angular velocity, torque, moment of inertia, and angular momentum.",
      lessons: [
        { id: 1, title: "Describing Rotational Motion", objectives: ["Angular displacement θ (radians), angular velocity ω, angular acceleration α", "Linear-to-angular links v = rω, at = rα"] },
        { id: 2, title: "Rotational Dynamics", objectives: ["Torque τ = rF sin θ and lever arm", "Moment of inertia (rotational inertia I = Σmr²)", "Newton's second law for rotation Στ = Iα"] },
        { id: 3, title: "Equilibrium", objectives: ["Translational equilibrium (ΣF = 0) and Rotational equilibrium (Στ = 0)", "Center of mass and rotational stability"] }
      ],
      formulas: ["\\tau = r F \\sin\\theta", "\\sum \\tau = I \\alpha", "L = I \\omega \\text{ (Conserved)}"],
      lab: "lab-projectile"
    },

    // UNIT 3: MOMENTUM AND ENERGY
    {
      id: 9,
      code: "PHYS-M09",
      unit: "Unit 3: Momentum and Energy",
      title: "Momentum and Its Conservation",
      phenomenon: "How can modern automobile crumple zones save passenger lives by deliberately collapsing during a high-speed collision?",
      bigIdea: "Impulse equals change in momentum (J = Δp); in isolated systems, total vector momentum is strictly conserved across all collisions.",
      lessons: [
        { id: 1, title: "Impulse and Momentum", objectives: ["Linear momentum p = mv", "Impulse-momentum theorem FΔt = Δp", "Crumple zones, airbags, and impact duration extension"] },
        { id: 2, title: "Conservation of Momentum", objectives: ["Isolated and closed systems", "Elastic collisions (kinetic energy conserved) vs Inelastic collisions", "Recoil and propulsion mechanics", "Two-dimensional collisions"] }
      ],
      formulas: ["\\vec{p} = m \\vec{v}", "\\vec{J} = \\vec{F}\\Delta t = \\Delta\\vec{p}", "m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f}"],
      lab: "lab-projectile"
    },
    {
      id: 10,
      code: "PHYS-M10",
      unit: "Unit 3: Momentum and Energy",
      title: "Energy and Its Conservation",
      phenomenon: "How can a thrilling roller coaster cart loop upside down without motors simply by trading gravitational potential energy for speed?",
      bigIdea: "Mechanical energy (kinetic + potential) is conserved in the absence of non-conservative forces, as work transfers energy.",
      lessons: [
        { id: 1, title: "Work and Energy", objectives: ["Definition of work W = Fd cos θ", "Kinetic energy KE = ½mv²", "Work-energy theorem Wnet = ΔKE", "Power P = W/t = Fv"] },
        { id: 2, title: "The Many Forms of Energy", objectives: ["Gravitational potential energy PEg = mgh", "Elastic potential energy PEe = ½kx² and Hooke's Law F = -kx"] },
        { id: 3, title: "Conservation of Energy", objectives: ["Law of conservation of mechanical energy E = KE + PE", "Friction and thermal energy generation"] },
        { id: 4, title: "Machines", objectives: ["Mechanical advantage (MA) and ideal mechanical advantage (IMA)", "Efficiency e = (Wout / Win) × 100%", "Simple machines: levers, pulleys, wheel-and-axles"] }
      ],
      formulas: ["W = F d \\cos\\theta", "KE = \\frac{1}{2}m v^2", "PE_g = m g h", "KE_i + PE_i = KE_f + PE_f", "P = \\frac{W}{t}"],
      lab: "lab-projectile"
    },
    {
      id: 11,
      code: "PHYS-M11",
      unit: "Unit 3: Momentum and Energy",
      title: "Thermal Energy",
      phenomenon: "Why can the sand on a tropical beach become scalding hot under the afternoon sun while the ocean water remains pleasantly cool?",
      bigIdea: "Thermal energy is total kinetic and potential molecular energy, governed by specific heat capacity and laws of thermodynamics.",
      lessons: [
        { id: 1, title: "Temperature, Heat, and Thermal Energy", objectives: ["Thermal equilibrium and Zeroth Law of Thermodynamics", "Temperature scales: Celsius, Kelvin (K = °C + 273.15)", "Specific heat equation Q = mcΔT", "Calorimetry"] },
        { id: 2, title: "Changes of State and Thermodynamics", objectives: ["Latent heat of fusion (Q = mHf) and vaporization (Q = mHv)", "First Law of Thermodynamics ΔU = Q - W", "Second Law of Thermodynamics and irreversible entropy increase", "Heat engines and Carnot efficiency"] }
      ],
      formulas: ["Q = m c \\Delta T", "Q = m H_f, \\quad Q = m H_v", "\\Delta U = Q - W", "\\text{Carnot } e = 1 - \\frac{T_C}{T_H}"],
      lab: "lab-gas-laws"
    },
    {
      id: 12,
      code: "PHYS-M12",
      unit: "Unit 3: Momentum and Energy",
      title: "States of Matter",
      phenomenon: "How can massive steel container ships weighing 200,000 tons float effortlessly across deep oceanic waters?",
      bigIdea: "Fluid statics and dynamics are governed by Pascal's principle, Archimedes' buoyant force, and Bernoulli's streamline equation.",
      lessons: [
        { id: 1, title: "Properties of Fluids", objectives: ["Pressure P = F/A in Pascals", "Hydrostatic fluid pressure P = ρgh", "Atmospheric pressure and barometers"] },
        { id: 2, title: "Forces within Liquids", objectives: ["Cohesion, adhesion, surface tension, capillary rise", "Pascal's principle in hydraulic lifts"] },
        { id: 3, title: "Fluids at Rest and in Motion", objectives: ["Archimedes' principle: buoyant force F_b = ρfluid Vg", "Continuity equation A1v1 = A2v2", "Bernoulli's principle and aerodynamic lift"] },
        { id: 4, title: "Solids", objectives: ["Thermal linear expansion ΔL = αL1ΔT", "Stress, strain, and Young's modulus elasticity"] }
      ],
      formulas: ["P = \\frac{F}{A}", "P = \\rho g h", "F_{\\text{buoyant}} = \\rho_{\\text{fluid}} V_{\\text{disp}} g", "P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = \\text{const}"],
      lab: "lab-gas-laws"
    },

    // UNIT 4: WAVES AND LIGHT
    {
      id: 13,
      code: "PHYS-M13",
      unit: "Unit 4: Waves and Light",
      title: "Vibrations and Waves",
      phenomenon: "How can a sustained opera singer note shatter a fine crystal wine glass from across the room without touching it?",
      bigIdea: "Simple harmonic motion and resonance transmit energy through mechanical transverse and longitudinal waves obeying v = fλ.",
      lessons: [
        { id: 1, title: "Periodic Motion", objectives: ["Hooke's law spring oscillation", "Simple pendulum period T = 2π√(L/g)", "Resonance and mechanical damping"] },
        { id: 2, title: "Wave Properties", objectives: ["Transverse vs Longitudinal compression waves", "Wavelength λ, frequency f, period T, wave speed v = fλ", "Wave amplitude and energy relation"] },
        { id: 3, title: "Wave Behavior", objectives: ["Reflection at fixed vs free boundaries", "Superposition principle and constructive/destructive interference", "Standing waves, nodes, and antinodes"] }
      ],
      formulas: ["T_{\\text{pendulum}} = 2\\pi \\sqrt{\\frac{L}{g}}", "v = f \\lambda", "f = \\frac{1}{T}"],
      lab: "lab-waves"
    },
    {
      id: 14,
      code: "PHYS-M14",
      unit: "Unit 4: Waves and Light",
      title: "Sound",
      phenomenon: "Why does the pitch of an ambulance siren shift dramatically from high to low as it speeds past an observer?",
      bigIdea: "Sound is a longitudinal pressure wave characterized by pitch (frequency), loudness (decibels), and Doppler frequency shifts.",
      lessons: [
        { id: 1, title: "Properties and Detection of Sound", objectives: ["Speed of sound in gases, liquids, and solids", "Sound intensity level and decibel scale (dB)", "The Doppler effect equation for moving sources and observers"] },
        { id: 2, title: "The Physics of Music", objectives: ["Resonance in open and closed organ pipes", "Harmonic frequencies (fundamental and overtones)", "Acoustic beats frequency fbeat = |f1 - f2|", "Timbre and Fourier harmonics"] }
      ],
      formulas: ["f_d = f_s \\left(\\frac{v \\pm v_d}{v \\mp v_s}\\right)", "f_{\\text{beat}} = |f_1 - f_2|", "\\lambda_n = \\frac{2L}{n} \\text{ (Open pipe)}"],
      lab: "lab-optics"
    },
    {
      id: 15,
      code: "PHYS-M15",
      unit: "Unit 4: Waves and Light",
      title: "Fundamentals of Light",
      phenomenon: "Why does the blue sky turn vivid blazing orange and crimson during sunset, and how do polarized sunglasses eliminate glare?",
      bigIdea: "Light exhibits wave-particle duality, propagating through space at speed c with quantifiable illuminance and polarization states.",
      lessons: [
        { id: 1, title: "Illumination", objectives: ["Speed of light c = 3.00 × 10⁸ m/s", "Luminous flux (lumens) and illuminance E = P / (4πr²)", "Inverse square law for point light sources"] },
        { id: 2, title: "The Wave Nature of Light", objectives: ["Visible spectrum wavelengths (380 nm - 750 nm)", "Additive primary colors (red, green, blue) vs Subtractive pigments", "Polarization by transmission and Malus's Law I = I₀ cos² θ", "Rayleigh scattering in the atmosphere"] }
      ],
      formulas: ["E = \\frac{P}{4\\pi r^2}", "I = I_0 \\cos^2\\theta \\text{ (Malus's Law)}", "c = f \\lambda"],
      lab: "lab-optics"
    },
    {
      id: 16,
      code: "PHYS-M16",
      unit: "Unit 4: Waves and Light",
      title: "Reflection and Refraction",
      phenomenon: "How can razor-thin fiber-optic glass cables transmit laser data pulses across global oceans without signal escaping through sides?",
      bigIdea: "Light reflects obeying the law of reflection and refracts at boundaries according to Snell’s Law and total internal reflection.",
      lessons: [
        { id: 1, title: "Reflection of Light", objectives: ["Law of reflection θr = θi", "Specular vs diffuse reflection", "Virtual images in plane flat mirrors"] },
        { id: 2, title: "Curved Mirrors", objectives: ["Concave and convex spherical mirrors", "Focal point f = R/2", "Mirror equation 1/f = 1/do + 1/di and magnification m = -di/do", "Real inverted vs virtual upright images"] },
        { id: 3, title: "Refraction of Light", objectives: ["Index of refraction n = c/v", "Snell's Law of refraction n1 sin θ1 = n2 sin θ2", "Total internal reflection and critical angle θc = arcsin(n2/n1)"] },
        { id: 4, title: "Convex and Concave Lenses", objectives: ["Thin lens equation", "Ray diagrams for converging convex and diverging concave lenses", "Chromatic and spherical aberration", "Optical instruments: cameras, microscopes, telescopes"] }
      ],
      formulas: ["n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2", "\\sin\\theta_c = \\frac{n_2}{n_1}", "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}", "m = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o}"],
      lab: "lab-optics"
    },
    {
      id: 17,
      code: "PHYS-M17",
      unit: "Unit 4: Waves and Light",
      title: "Interference and Diffraction",
      phenomenon: "Why do soap bubbles and oily water puddles display swirling iridescent rainbow colors under ordinary sunlight?",
      bigIdea: "Wave interference and diffraction produce bright and dark fringe bands in double-slit apparatus and thin-film reflections.",
      lessons: [
        { id: 1, title: "Interference", objectives: ["Thomas Young's double-slit experiment", "Path difference and constructive (d sin θ = mλ) vs destructive interference", "Thin-film interference phase changes upon reflection"] },
        { id: 2, title: "Diffraction", objectives: ["Single-slit diffraction minima (w sin θ = mλ)", "Diffraction gratings in spectrophotometry", "Rayleigh's criterion for optical resolution limit"] }
      ],
      formulas: ["d \\sin\\theta = m\\lambda", "x_m = \\frac{m\\lambda L}{d}", "\\theta_{\\text{min}} = 1.22 \\frac{\\lambda}{D}"],
      lab: "lab-waves"
    },

    // UNIT 5: ELECTRICITY AND MAGNETISM
    {
      id: 18,
      code: "PHYS-M18",
      unit: "Unit 5: Electricity and Magnetism",
      title: "Electrostatics",
      phenomenon: "How can thousands of volts of static charge accumulate on a thunderstorm cloud and discharge in a blinding lightning bolt?",
      bigIdea: "Coulomb's Law governs electrostatic attractions and repulsions between stationary charges creating vector electric fields.",
      lessons: [
        { id: 1, title: "Electric Charge", objectives: ["Conservation of charge, conductors vs insulators", "Charging by friction, conduction, and electrostatic induction"] },
        { id: 2, title: "Electrostatic Force", objectives: ["Coulomb's Law F = k|q1q2|/r²", "Coulomb's constant k = 8.99 × 10⁹ N·m²/C²", "Vector superposition of multiple charges"] },
        { id: 3, title: "Measuring Electric Fields", objectives: ["Electric field strength E = F/q = kQ/r²", "Electric field lines mapping rules"] },
        { id: 4, title: "Applications of Electric Fields", objectives: ["Electric potential difference ΔV = ΔPE/q (Volts)", "Equipotential surfaces and uniform fields ΔV = Ed", "Millikan oil drop experiment", "Capacitance C = q/ΔV and parallel-plate capacitors"] }
      ],
      formulas: ["F_e = k \\frac{|q_1 q_2|}{r^2}", "E = \\frac{F}{q} = k\\frac{Q}{r^2}", "\\Delta V = -E d", "C = \\frac{q}{\\Delta V} = \\epsilon_0 \\frac{A}{d}"],
      lab: "lab-circuits"
    },
    {
      id: 19,
      code: "PHYS-M19",
      unit: "Unit 5: Electricity and Magnetism",
      title: "Electric Current and Circuits",
      phenomenon: "Why does an entire string of holiday lights stay illuminated when one bulb blows in parallel, but turn dark in series?",
      bigIdea: "Electric circuits channel charge flow driven by potential difference, governed by Ohm's Law and Kirchhoff's loop and junction rules.",
      lessons: [
        { id: 1, title: "Current and Circuits", objectives: ["Electric current I = q/t (Amperes)", "Conventional current vs electron flow", "Complete closed circuits, electromotive force (EMF)"] },
        { id: 2, title: "Using Electrical Energy", objectives: ["Resistance R = V/I (Ohm's Law)", "Resistivity R = ρL/A", "Electric power P = IV = I²R = V²/R", "Thermal dissipation and kilowatt-hour billing"] },
        { id: 3, title: "Simple Circuits", objectives: ["Series circuits: equivalent resistance Req = R1 + R2 + ... and voltage dividers", "Parallel circuits: 1/Req = 1/R1 + 1/R2 + ..."] },
        { id: 4, title: "Applications of Circuits", objectives: ["Combination series-parallel circuits", "Kirchhoff's Junction Rule (current) & Loop Rule (voltage)", "Circuit safety: fuses, circuit breakers, and GFCI outlets"] }
      ],
      formulas: ["V = I R", "P = I V = I^2 R = \\frac{V^2}{R}", "R_{\\text{series}} = \\sum R_i", "\\frac{1}{R_{\\text{parallel}}} = \\sum \\frac{1}{R_i}"],
      lab: "lab-circuits"
    },
    {
      id: 20,
      code: "PHYS-M20",
      unit: "Unit 5: Electricity and Magnetism",
      title: "Magnetism",
      phenomenon: "How can magnetic compass needles guide mariners across featureless oceans by aligning with Earth’s molten liquid iron core?",
      bigIdea: "Magnetic fields produced by moving charges exert perpendicular Lorentz forces on moving particles and electric currents.",
      lessons: [
        { id: 1, title: "Understanding Magnetism", objectives: ["Magnetic poles (North/South) and field lines", "Ferromagnetism, magnetic domains, and Curie temperature", "Earth's magnetic field and geomagnetic reversals"] },
        { id: 2, title: "Applying Magnetic Forces", objectives: ["Magnetic field around straight wire and solenoids (Right-Hand Rules)", "Magnetic force on current-carrying wire F = ILB sin θ", "Lorentz force on moving point charge F = qvB sin θ", "Loudspeakers, galvanometers, and DC electric motor operation"] }
      ],
      formulas: ["F = q v B \\sin\\theta", "F = I L B \\sin\\theta", "r = \\frac{mv}{qB} \\text{ (Cyclotron radius)}"],
      lab: "lab-circuits"
    },
    {
      id: 21,
      code: "PHYS-M21",
      unit: "Unit 5: Electricity and Magnetism",
      title: "Electromagnetism",
      phenomenon: "How does water tumbling over a hydroelectric dam spin giant magnets to power millions of homes across entire continents?",
      bigIdea: "Electromagnetic induction creates induced EMF via changing magnetic flux, unlocking modern electric generators and transformers.",
      lessons: [
        { id: 1, title: "Inducing Currents", objectives: ["Electromagnetic induction discovery (Faraday)", "Magnetic flux Φ = BA cos θ", "Faraday's Law of Induction EMF = -N(ΔΦ/Δt)", "Lenz's Law (induced current opposes flux change)"] },
        { id: 2, title: "Applications of Induced Currents", objectives: ["Electric AC generators and sinusoidal EMF output", "Eddy currents and magnetic braking", "Self-inductance and inductors"] },
        { id: 3, title: "Electric and Magnetic Fields in Space", objectives: ["Transformers: step-up vs step-down (Vs/Vp = Ns/Np = Ip/Is)", "Maxwell's electromagnetic wave equations prediction of light"] }
      ],
      formulas: ["\\Phi_B = B A \\cos\\theta", "\\mathcal{E} = -N \\frac{\\Delta\\Phi_B}{\\Delta t}", "\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}"],
      lab: "lab-circuits"
    },

    // UNIT 6: SUBATOMIC PHYSICS
    {
      id: 22,
      code: "PHYS-M22",
      unit: "Unit 6: Subatomic Physics",
      title: "Quantum Theory and the Atom",
      phenomenon: "Why does shining ultra-bright red light fail to eject a single electron from a metal sheet, while faint ultraviolet light ejects them instantly?",
      bigIdea: "Light and matter exhibit quantized energy packets (photons) and wave-particle duality at subatomic scales.",
      lessons: [
        { id: 1, title: "A Particle Model of Waves", objectives: ["Blackbody radiation and ultraviolet catastrophe (Planck's quantum)", "Photoelectric effect experiment", "Work function and photon energy equation KEmax = hf - W"] },
        { id: 2, title: "Matter Waves", objectives: ["De Broglie wavelength λ = h/p", "Davisson-Germer electron diffraction experiment", "Heisenberg Uncertainty Principle ΔxΔp ≥ h/4π"] },
        { id: 3, title: "Bohr's Model of the Atom", objectives: ["Hydrogen emission line spectra", "Quantized angular momentum and electron transitions ΔE = Ef - Ei = hf"] },
        { id: 4, title: "The Quantum Model of the Atom", objectives: ["Schrödinger wave mechanics", "Atomic orbital probability clouds and quantum numbers (n, l, ml, ms)", "Lasers and stimulated emission of radiation"] }
      ],
      formulas: ["E = h f", "KE_{\\text{max}} = h f - W_0", "\\lambda = \\frac{h}{m v}", "\\Delta x \\Delta p \\ge \\frac{h}{4\\pi}"],
      lab: "lab-optics"
    },
    {
      id: 23,
      code: "PHYS-M23",
      unit: "Unit 6: Subatomic Physics",
      title: "Solid-State Electronics",
      phenomenon: "How can billions of nanometer-scale silicon transistors on a computer microchip switch on and off five billion times every second?",
      bigIdea: "Energy band structures in crystalline semiconductors enable p-n junction diodes, transistors, integrated circuits, and photovoltaic cells.",
      lessons: [
        { id: 1, title: "Conduction in Solids", objectives: ["Energy bands: valence band, band gap, conduction band", "Conductors, semiconductors, and insulators comparison"] },
        { id: 2, title: "Electronic Components", objectives: ["Intrinsic semiconductors vs Extrinsic doping (n-type vs p-type)", "p-n junction diodes: forward bias, reverse bias, LEDs", "Transistors (BJT and MOSFET) as digital electronic switches and amplifiers"] }
      ],
      formulas: ["E_g \\text{ (Band Gap: Conductor } 0\\text{ eV}, \\text{Si } 1.1\\text{ eV}, \\text{Insulator } >5\\text{ eV})"],
      lab: "lab-circuits"
    },
    {
      id: 24,
      code: "PHYS-M24",
      unit: "Unit 6: Subatomic Physics",
      title: "Nuclear and Particle Physics",
      phenomenon: "What fundamental force binds positively charged protons tightly together in a nucleus despite tremendous electrostatic repulsion?",
      bigIdea: "The strong nuclear force binds nucleons, mass defect converts to binding energy via E = mc², and quarks and leptons comprise the Standard Model.",
      lessons: [
        { id: 1, title: "The Nucleus", objectives: ["Protons, neutrons, strong nuclear force", "Nuclear binding energy and mass defect Δm = (Zmp + Nmn) - M_nucleus", "Einstein's mass-energy equation E = Δmc²"] },
        { id: 2, title: "Nuclear Decay and Reactions", objectives: ["Alpha decay, beta decay (neutrinos/antineutrinos), gamma emission", "Nuclear fission and fusion energetics"] },
        { id: 3, title: "The Building Blocks of Matter", objectives: ["Standard Model: Quarks (up, down, charm, strange, top, bottom)", "Leptons (electron, muon, tau, neutrinos)", "Gauge bosons (photon, gluon, W/Z bosons, Higgs boson)", "Antimatter and pair annihilation"] }
      ],
      formulas: ["\\Delta E = (\\Delta m) c^2", "1\\text{ u} = 931.5\\text{ MeV}", "\\text{Proton: } (uud), \\quad \\text{Neutron: } (udd)"],
      lab: "lab-periodic-table"
    }
  ]
};
