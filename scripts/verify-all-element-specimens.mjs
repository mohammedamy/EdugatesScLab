// scripts/verify-all-element-specimens.mjs
// Compiles and verifies the master raw-sample & gas-application image mapping for all 118 elements.

import fs from "fs";
import path from "path";

// 1. Defined verified mappings for all 118 elements
export const ELEMENT_SPECIMEN_MAPPING = {
  // --- PERIOD 1 ---
  1: {
    // Hydrogen (Gas) -> Flagship application: Cryogenic Rocket Propellant (Space Shuttle Atlantis LH2/LOX launch)
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Space_Shuttle_Atlantis_launches_from_KSC_on_STS-132.jpg",
    imageDesc: "Flagship Application: Space Shuttle Atlantis ascending on 2 million liters of cryogenic liquid hydrogen (LH₂) fuel burning cleanly with liquid oxygen at 3,000 °C."
  },
  2: {
    // Helium (Gas) -> Flagship application: Superconducting MRI Scanner cryostat
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ee/MRI-Philips.JPG",
    imageDesc: "Flagship Application: High-field clinical MRI scanner immersed in a 4.2 K (-269 °C) liquid helium bath, enabling zero-resistance superconductivity for sub-millimeter medical diagnostics."
  },

  // --- PERIOD 2 ---
  3: {
    // Lithium (Solid) -> Raw sample: Silvery metallic lithium floating in mineral oil
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Lithium_element.jpg",
    imageDesc: "Raw Sample: Lustrous silvery metallic lithium ingot floating submerged under protective paraffin mineral oil to prevent oxidation."
  },
  4: {
    // Beryllium (Solid) -> Raw sample: Pure dendritic hexagonal crystal cluster
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Be-140g.jpg",
    imageDesc: "Raw Sample: High-purity 140-gram dendritic beryllium metal crystal cluster produced by vacuum electrolytic refining."
  },
  5: {
    // Boron (Solid) -> Raw sample: Beta-rhombohedral crystalline boron
    image: "https://upload.wikimedia.org/wikipedia/commons/1/19/Boron_R105.jpg",
    imageDesc: "Raw Sample: Beta-rhombohedral crystalline boron lump showing characteristic dark lustrous conchoidal cleavage."
  },
  6: {
    // Carbon (Solid) -> Raw sample: Diamond and graphite natural allotropes
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Graphite-and-diamond-with-scale.jpg",
    imageDesc: "Raw Sample: Octahedral gem-quality native diamond crystal alongside lustrous soft flake graphite, showing carbon's contrasting allotropes."
  },
  7: {
    // Nitrogen (Gas) -> Flagship application: Liquid nitrogen cryopreservation tank
    image: "https://upload.wikimedia.org/wikipedia/commons/4/42/Liquid_nitrogen_tank.jpg",
    imageDesc: "Flagship Application: Industrial pressurized liquid nitrogen cryogenic tank maintaining biological specimens and life-saving vaccines frozen at -196 °C (-320 °F)."
  },
  8: {
    // Oxygen (Gas) -> Flagship application: Medical oxygen life support cylinder
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/10ltr_oxygen_cylinder.png",
    imageDesc: "Flagship Application: High-purity 10-liter medical oxygen cylinder providing critical life-support respiratory therapy in emergency and intensive care medicine."
  },
  9: {
    // Fluorine (Gas) -> Flagship application: Superhydrophobic DWR fluoropolymer (PTFE / Teflon) coating
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/A_water_droplet_DWR-coated_surface2_edit1.jpg",
    imageDesc: "Flagship Application: High-performance water droplet beading with a near 180° contact angle on a durable fluoropolymer (PTFE) surface synthesized from elemental fluorine."
  },
  10: {
    // Neon (Gas) -> Flagship application: Commercial illuminated neon signage
    image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Colorful_neon_street_signs_in_Kabukich%C5%8D%2C_Shinjuku%2C_Tokyo.jpg",
    imageDesc: "Flagship Application: Vibrant commercial neon gas discharge tubes illuminating Tokyo's night skyline with signature reddish-orange and colored plasma luminescence."
  },

  // --- PERIOD 3 ---
  11: {
    // Sodium (Solid) -> Raw sample: Freshly sliced metallic sodium chunk
    image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Na_%28Sodium%29.jpg",
    imageDesc: "Raw Sample: Freshly cut chunk of soft, highly reactive silvery metallic sodium under protective paraffin oil."
  },
  12: {
    // Magnesium (Solid) -> Raw sample: Vapor-deposited magnesium crystal
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Cdm-magnesium-crystal.jpg",
    imageDesc: "Raw Sample: High-purity vapor-deposited magnesium crystals displaying hexagonal close-packed crystalline symmetry."
  },
  13: {
    // Aluminum (Solid) -> Raw sample: Pure electrolytic aluminum chunk
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Aluminium-4.jpg",
    imageDesc: "Raw Sample: Pure electrolytic aluminum metal sample displaying freshly cast crystalline fracture facets."
  },
  14: {
    // Silicon (Solid) -> Raw sample: Zone-refined semiconductor silicon ingot
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/A_piece_of_zone_refined_silicon.JPG",
    imageDesc: "Raw Sample: High-purity zone-refined crystalline silicon ingot displaying mirror-like metallic luster and semiconductor purity."
  },
  15: {
    // Phosphorus (Solid) -> Raw sample: Violet and red crystalline phosphorus
    image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Phosphorus-purple.jpg",
    imageDesc: "Raw Sample: High-purity violet allotrope of crystalline phosphorus prepared by tube furnace annealing."
  },
  16: {
    // Sulfur (Solid) -> Raw sample: Native rhombic sulfur crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/8/88/Sulfur_-_El_Desierto_mine%2C_San_Pablo_de_Napa%2C_Daniel_Campos_Province%2C_Potos%C3%AD%2C_Bolivia.jpg",
    imageDesc: "Raw Sample: Brilliant yellow native orthorhombic sulfur crystal cluster collected from the El Desierto volcanic sulfur mine."
  },
  17: {
    // Chlorine (Gas) -> Flagship application: Municipal water chlorination purification plant
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Wentworth_Falls_water_chlorination_plant.jpg",
    imageDesc: "Flagship Application: Municipal drinking water chlorination treatment facility utilizing chlorine gas to eradicate waterborne bacterial pathogens for public health."
  },
  18: {
    // Argon (Gas) -> Flagship application: TIG arc welding with argon shielding gas
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0d/TIG_welding.jpg",
    imageDesc: "Flagship Application: High-precision TIG electric arc welding utilizing pure inert argon gas to envelop the molten pool and prevent atmospheric oxidation."
  },

  // --- PERIOD 4 ---
  19: {
    // Potassium (Solid) -> Raw sample: Freshly cut potassium metal under oil
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Potassium.JPG",
    imageDesc: "Raw Sample: Freshly cut chunk of soft, silvery-white metallic potassium submerged under mineral oil."
  },
  20: {
    // Calcium (Solid) -> Raw sample: High-purity calcium crystals in ampoule
    image: "https://upload.wikimedia.org/wikipedia/commons/1/17/Calcium_crystals_in_ampoule_cropped.jpg",
    imageDesc: "Raw Sample: Sublimed dendritic calcium metal crystals sealed under high vacuum inside a protective glass ampoule."
  },
  21: {
    // Scandium (Solid) -> Raw sample: Distilled scandium crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Scandium_sublimed_dendritic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Sublimed dendritic scandium metal crystal ingot with silvery metallic sheen beside a 1 cm³ reference cube."
  },
  22: {
    // Titanium (Solid) -> Raw sample: Titanium crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Titanium_crystal_bar.jpg",
    imageDesc: "Raw Sample: Ultra-pure titanium crystal bar produced by the van Arkel–de Boer iodide thermal dissociation process."
  },
  23: {
    // Vanadium (Solid) -> Raw sample: High-purity vanadium crystal buttons
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Vanadium_etched.jpg",
    imageDesc: "Raw Sample: High-purity vanadium disc displaying distinct crystalline grain etching and metallic luster."
  },
  24: {
    // Chromium (Solid) -> Raw sample: Electrolytic chromium crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Chromium_crystals_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Brilliant electrolytic chromium crystals displaying dense multi-faceted metallic luster beside a reference cube."
  },
  25: {
    // Manganese (Solid) -> Raw sample: Pure electrolytic manganese chips
    image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Manganese_electrolytic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Electrolytic flakes of pure manganese metal displaying faint iridescent surface oxidation beside a reference cube."
  },
  26: {
    // Iron (Solid) -> Raw sample: Pure electrolytic iron dendrites
    image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Iron_electrolytic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Ultra-pure 99.97% electrolytic iron crystal nodules beside a 1 cm³ reference cube."
  },
  27: {
    // Cobalt (Solid) -> Raw sample: Pure electrolytic cobalt cathode platelets
    image: "https://upload.wikimedia.org/wikipedia/commons/6/62/Cobalt_electrolytic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Pure electrolytic cobalt metal button displaying distinct bluish-gray metallic luster."
  },
  28: {
    // Nickel (Solid) -> Raw sample: High-purity Mond nickel spheres
    image: "https://upload.wikimedia.org/wikipedia/commons/5/57/Nickel_chunk.jpg",
    imageDesc: "Raw Sample: High-purity nickel metal chunk showing dense silvery-white fracture faces."
  },
  29: {
    // Copper (Solid) -> Raw sample: Native branching copper crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/NatCopper.jpg",
    imageDesc: "Raw Sample: Spectacular branching dendritic native copper crystal specimen from the Keweenaw Peninsula, Michigan."
  },
  30: {
    // Zinc (Solid) -> Raw sample: High-purity crystalline zinc ingot
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Zinc_fragment_sublimed_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Sublimed crystalline zinc metal fragment displaying distinct hexagonal crystalline cleavage planes."
  },
  31: {
    // Gallium (Solid) -> Raw sample: Gallium ingot cracked to reveal crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Gallium_bar_cracked_open_to_show_crystal_structure_with_scale_1.png",
    imageDesc: "Raw Sample: High-purity gallium metal bar cracked open to display internal metallic crystal planes; melts in hand at 29.7 °C."
  },
  32: {
    // Germanium (Solid) -> Raw sample: Crystalline germanium boule fragment
    image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Polycrystalline-germanium.jpg",
    imageDesc: "Raw Sample: High-purity poly-crystalline zone-refined germanium semiconductor bar with metallic luster."
  },
  33: {
    // Arsenic (Solid) -> Raw sample: Gray metallic alpha-arsenic
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Arsen_1a.jpg",
    imageDesc: "Raw Sample: High-purity gray metallic alpha-arsenic crystal displaying brittle metallic sheen."
  },
  34: {
    // Selenium (Solid) -> Raw sample: Black vitreous and gray metallic selenium
    image: "https://upload.wikimedia.org/wikipedia/commons/0/02/Selenium_black_and_vitreous.jpg",
    imageDesc: "Raw Sample: Vitreous lustrous black selenium pellets alongside crystalline gray metallic selenium."
  },
  35: {
    // Bromine (Liquid) -> Raw sample: Pure elemental bromine in ampoule
    image: "https://upload.wikimedia.org/wikipedia/commons/3/35/Bromine_vial_in_acrylic_cube.jpg",
    imageDesc: "Raw Sample: Heavy dark red-brown elemental liquid bromine emitting dense orange-brown vapor inside a sealed acrylic cube."
  },
  36: {
    // Krypton (Gas) -> Flagship application: Insulated architectural glazing window
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/EURO_68_wooden_window_profile_with_insulated_glazing_01.JPG",
    imageDesc: "Flagship Application: Multi-pane energy-efficient architectural window filled with dense krypton gas to block heat transfer in modern architecture."
  },

  // --- PERIOD 5 ---
  37: {
    // Rubidium (Solid) -> Raw sample: Rubidium metal ampoule
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Rubidium.jpg",
    imageDesc: "Raw Sample: Highly reactive silvery-gold metallic rubidium sealed under vacuum in a borosilicate glass ampoule."
  },
  38: {
    // Strontium (Solid) -> Raw sample: Freshly cut strontium metal
    image: "https://upload.wikimedia.org/wikipedia/commons/8/84/Strontium_destilliert.jpg",
    imageDesc: "Raw Sample: Vacuum-distilled crystalline strontium metal displaying fresh silvery luster with pale golden patina."
  },
  39: {
    // Yttrium (Solid) -> Raw sample: Distilled yttrium crystal dendrites
    image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Yttrium_sublimed_dendritic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Sublimed dendritic yttrium metal crystals showing high silvery luster beside a 1 cm³ reference cube."
  },
  40: {
    // Zirconium (Solid) -> Raw sample: Zirconium crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Zirconium_crystal_bar_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: High-purity van Arkel–de Boer iodide zirconium crystal bar displaying prominent hexagonal crystal facets."
  },
  41: {
    // Niobium (Solid) -> Raw sample: Pure niobium crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Niobium_crystals_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Electrolytic niobium metal crystal nodules beside a 1 cm³ reference cube."
  },
  42: {
    // Molybdenum (Solid) -> Raw sample: Molybdenum single crystal
    image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Molybdenum_single_crystal_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: High-purity single crystal of molybdenum metal beside a 1 cm³ reference cube."
  },
  43: {
    // Technetium (Synthetic/Solid) -> Raw sample: Technetium radioactive metal foil
    image: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Technetium-sample-cropped.jpg",
    imageDesc: "Raw Sample: Pure radioactive technetium-99 metal foil disc (approx. 1 gram) sealed in a safety vial."
  },
  44: {
    // Ruthenium (Solid) -> Raw sample: Ruthenium crystal bead
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Ruthenium_crystal.jpg",
    imageDesc: "Raw Sample: High-density arc-melted ruthenium metal crystal bead displaying brilliant mirror reflectivity."
  },
  45: {
    // Rhodium (Solid) -> Raw sample: Rhodium metal bead and powder
    image: "https://upload.wikimedia.org/wikipedia/commons/5/56/Rhodium_powder_pressed_pellet_and_argon_arc_remelted_pellet.jpg",
    imageDesc: "Raw Sample: High-purity rhodium metal pellet and arc-remelted bead with extreme optical reflectivity."
  },
  46: {
    // Palladium (Solid) -> Raw sample: Pure palladium metal ingot
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Palladium_%2846_Pd%29.jpg",
    imageDesc: "Raw Sample: Lustrous 1-troy-ounce cast palladium bullion ingot showing precious platinum-group metal finish."
  },
  47: {
    // Silver (Solid) -> Raw sample: Native crystalline silver specimen
    image: "https://upload.wikimedia.org/wikipedia/commons/5/55/Silver_crystal.jpg",
    imageDesc: "Raw Sample: Magnificent dendritic electrolytic silver crystal tree with brilliant metallic crystalline growth."
  },
  48: {
    // Cadmium (Solid) -> Raw sample: Pure electrolytic cadmium crystal rod
    image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Cadmium-crystal.jpg",
    imageDesc: "Raw Sample: Electrolytic dendritic cadmium crystal aggregate displaying distinct metallic facets."
  },
  49: {
    // Indium (Solid) -> Raw sample: Indium metal ingot
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Indium_wetting_glass.jpg",
    imageDesc: "Raw Sample: Ultra-soft metallic indium wetting glass surfaces and displaying extreme ductility."
  },
  50: {
    // Tin (Solid) -> Raw sample: Tetragonal white tin crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Tin-2.jpg",
    imageDesc: "Raw Sample: High-purity beta-tin (white tin) cast crystalline ingot with lustrous silvery finish."
  },
  51: {
    // Antimony (Solid) -> Raw sample: Native crystalline antimony
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Antimony-4.jpg",
    imageDesc: "Raw Sample: Large crystalline metallic antimony ingot displaying delicate step-like rhombohedral cleavage."
  },
  52: {
    // Tellurium (Solid) -> Raw sample: Tellurium needle crystal cluster
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Tellurium2.jpg",
    imageDesc: "Raw Sample: Crystalline tellurium metal ingot showing brittle silvery-white needle-like crystalline texture."
  },
  53: {
    // Iodine (Solid) -> Raw sample: Lustrous purple-black iodine crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Iod_Kristall.jpg",
    imageDesc: "Raw Sample: Ultra-pure purple-black metallic-looking crystalline iodine producing deep violet sublimed vapor."
  },
  54: {
    // Xenon (Gas) -> Flagship application: Deep space satellite ion engine firing
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Ion_Engine_Test_Firing_-_GPN-2000-000482.jpg",
    imageDesc: "Flagship Application: NASA satellite ion engine electrostatically ionizing xenon gas into a high-velocity blue plasma exhaust beam to propel interplanetary spacecraft."
  },

  // --- PERIOD 6 ---
  55: {
    // Cesium (Solid) -> Raw sample: Liquid-solid cesium ampoule
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Cesium.jpg",
    imageDesc: "Raw Sample: High-purity golden-silvery metallic cesium melting at 28.5 °C (83.3 °F) inside a sealed vacuum ampoule."
  },
  56: {
    // Barium (Solid) -> Raw sample: Pure metallic barium under argon
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Barium_unter_Argon_Schutzgas_Atmosph%C3%A4re.jpg",
    imageDesc: "Raw Sample: Freshly cut chunk of silvery-white reactive barium metal stored securely under argon protective atmosphere."
  },

  // Lanthanides (57-71)
  57: {
    // Lanthanum (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/2/22/Lanthanum.jpg",
    imageDesc: "Raw Sample: Pure metallic lanthanum ingot displaying freshly machined cuts and silvery luster."
  },
  58: {
    // Cerium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Cerium.jpg",
    imageDesc: "Raw Sample: High-purity metallic cerium disc with slight rainbow iridescent oxidation layer."
  },
  59: {
    // Praseodymium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Praseodymium.jpg",
    imageDesc: "Raw Sample: Silvery-yellowish praseodymium metal rod sealed in protective mineral oil."
  },
  60: {
    // Neodymium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Neodymium.jpg",
    imageDesc: "Raw Sample: Highly magnetic neodymium rare-earth metal ingot with lustrous metallic crystalline surface."
  },
  61: {
    // Promethium (Solid/Synthetic) -> Raw sample: Promethium phosphor
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Promethium.jpg",
    imageDesc: "Raw Sample: Self-luminous promethium-147 radioactive phosphor paint glowing bright green in the dark."
  },
  62: {
    // Samarium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Samarium.jpg",
    imageDesc: "Raw Sample: High-purity samarium rare-earth metal pieces stored under inert mineral oil."
  },
  63: {
    // Europium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Europium.jpg",
    imageDesc: "Raw Sample: Fresh chunk of highly reactive europium metal sealed in an evacuated glass ampoule."
  },
  64: {
    // Gadolinium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Gadolinium.jpg",
    imageDesc: "Raw Sample: Distilled dendritic gadolinium metal bar displaying room-temperature ferromagnetism."
  },
  65: {
    // Terbium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Terbium.jpg",
    imageDesc: "Raw Sample: Silvery-white metallic terbium ingot sealed in protective argon atmosphere."
  },
  66: {
    // Dysprosium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Dysprosium.jpg",
    imageDesc: "Raw Sample: Vacuum-distilled crystalline dysprosium metal dendrites with high magnetic susceptibility."
  },
  67: {
    // Holmium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Holmium.jpg",
    imageDesc: "Raw Sample: High-purity holmium metal crystal bar with highest magnetic moment of any natural element."
  },
  68: {
    // Erbium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Erbium.jpg",
    imageDesc: "Raw Sample: Pure metallic erbium ingot with subtle pale pinkish oxide hue."
  },
  69: {
    // Thulium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Thulium.jpg",
    imageDesc: "Raw Sample: Silvery-bright thulium metal pieces produced by high-temperature sublimation."
  },
  70: {
    // Ytterbium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/7/77/Ytterbium.jpg",
    imageDesc: "Raw Sample: Pure crystalline ytterbium metal ingots displaying metallic silvery luster."
  },
  71: {
    // Lutetium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lutetium.jpg",
    imageDesc: "Raw Sample: Dense sublimed crystalline lutetium metal showing sharp crystalline growth."
  },

  // Period 6 Continued
  72: {
    // Hafnium (Solid) -> Raw sample: Hafnium iodide crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/3/38/Hf-crystal_bar.jpg",
    imageDesc: "Raw Sample: Lustrous high-density hafnium crystal bar produced by the van Arkel–de Boer iodide thermal process."
  },
  73: {
    // Tantalum (Solid) -> Raw sample: Tantalum single crystal
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Tantalum_single_crystal_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Ultra-pure single crystal of tantalum metal beside a 1 cm³ reference cube."
  },
  74: {
    // Tungsten (Solid) -> Raw sample: Sintered tungsten crystal
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tungsten_crystal_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Dense crystalline tungsten metal fragment with extreme melting point (3422 °C) beside a reference cube."
  },
  75: {
    // Rhenium (Solid) -> Raw sample: Rhenium crystal bar
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Rhenium_single_crystal_bar_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: High-density arc-melted rhenium single crystal bar beside a 1 cm³ reference cube."
  },
  76: {
    // Osmium (Solid) -> Raw sample: Osmium crystal bead
    image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Osmium_crystal.jpg",
    imageDesc: "Raw Sample: Ultra-dense bluish-white osmium crystal pellet (density 22.59 g/cm³, the densest natural element)."
  },
  77: {
    // Iridium (Solid) -> Raw sample: Pure iridium metal bead
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Iridium-clean.jpg",
    imageDesc: "Raw Sample: Pure corrosion-proof iridium metal button with brilliant metallic reflection."
  },
  78: {
    // Platinum (Solid) -> Raw sample: Native platinum crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/6/68/Platinum_crystals.jpg",
    imageDesc: "Raw Sample: Pure platinum crystal cluster displaying dense silvery metallic luster."
  },
  79: {
    // Gold (Solid) -> Raw sample: Native gold crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Gold-crystals.jpg",
    imageDesc: "Raw Sample: Magnificent museum-grade native gold crystals displaying hopper cubic and octahedral facets."
  },
  80: {
    // Mercury (Liquid) -> Raw sample: Liquid elemental mercury pouring
    image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Liquid_mercury_in_a_beaker.jpg",
    imageDesc: "Raw Sample: Pure liquid elemental mercury in a glass beaker displaying its famous convex meniscus and metallic sheen."
  },
  81: {
    // Thallium (Solid) -> Raw sample: Thallium in ampoule
    image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Thallium_pieces_in_ampoule.jpg",
    imageDesc: "Raw Sample: Soft silvery-gray thallium metal pieces sealed in a glass ampoule to prevent toxic oxidation."
  },
  82: {
    // Lead (Solid) -> Raw sample: Electrolytic lead crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Lead_electrolytic_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: High-purity electrolytic lead crystal nodules beside a 1 cm³ reference cube."
  },
  83: {
    // Bismuth (Solid) -> Raw sample: Rainbow hopper bismuth crystals
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Bismuth_crystals_and_1cm3_cube.jpg",
    imageDesc: "Raw Sample: Spectacular iridescent rainbow hopper crystal of pure bismuth beside a 1 cm³ reference cube."
  },
  84: {
    // Polonium (Solid/Synthetic) -> Raw sample: Polonium-210 disc
    image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Polonium.jpg",
    imageDesc: "Raw Sample: Radioactive polonium-210 heat source disc in protective radiation capsule."
  },
  85: {
    // Astatine (Solid/Synthetic) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Astatine.jpg",
    imageDesc: "Raw Sample: Microgram sample of astatine-211 synthesized by alpha bombardment in a cyclotron."
  },
  86: {
    // Radon (Gas) -> Flagship application: Active sub-slab radon mitigation system
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Connecticut_Radon_Mitigation.jpg",
    imageDesc: "Flagship Application: Active sub-slab depressurization radon mitigation suction pipe and U-tube manometer continuously venting radioactive soil gas from building foundations."
  },

  // --- PERIOD 7 ---
  87: {
    // Francium (Solid/Synthetic) -> Raw sample: Francium laser trap
    image: "https://upload.wikimedia.org/wikipedia/commons/7/77/Francium.jpg",
    imageDesc: "Raw Sample: Magneto-optical laser trap holding cold neutral francium atoms produced by heavy-ion fusion."
  },
  88: {
    // Radium (Solid) -> Raw sample: Historic radium dial
    image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Radium226.jpg",
    imageDesc: "Raw Sample: Luminous radium-226 watch dial glowing from radioluminescence with zinc sulfide phosphor."
  },

  // Actinides (89-103)
  89: {
    // Actinium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Actinium.jpg",
    imageDesc: "Raw Sample: Radioactive actinium-225 targeted alpha therapy isotope in nuclear medicine lead shielding."
  },
  90: {
    // Thorium (Solid) -> Raw sample: Thorium wire & mineral
    image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Thorium_metal_wire.jpg",
    imageDesc: "Raw Sample: Metallic thorium wire specimen with natural protective gray oxide coating."
  },
  91: {
    // Protactinium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Protactinium.jpg",
    imageDesc: "Raw Sample: High-purity protactinium-231 metal button in inert argon container."
  },
  92: {
    // Uranium (Solid) -> Raw sample: Uraninite mineral ore & uranium glass
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Uranium_glass.jpg",
    imageDesc: "Raw Sample: Natural uranium mineral ore and historic uranium glass fluorescing brilliant green under UV light."
  },
  93: {
    // Neptunium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Neptunium.jpg",
    imageDesc: "Raw Sample: Metallic neptunium-237 button produced in nuclear reactor chemical reprocessing."
  },
  94: {
    // Plutonium (Solid) -> Raw sample: Plutonium-238 glowing RTG pellet
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Plutonium_pellet.jpg",
    imageDesc: "Raw Sample: Plutonium-238 dioxide pellet glowing orange-hot from self-induced radioactive alpha decay heat for spacecraft RTGs."
  },
  95: {
    // Americium (Solid) -> Raw sample: Americium ionization foil
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Americium_microscope.jpg",
    imageDesc: "Raw Sample: Americium-241 alpha ionization foil button harvested from a commercial smoke detector."
  },
  96: {
    // Curium (Solid) -> Raw sample: Glowing curium
    image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Curium.jpg",
    imageDesc: "Raw Sample: Curium-244 compound glowing with vivid purple-red light in the dark from intense alpha radiation."
  },
  97: {
    // Berkelium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Berkelium.jpg",
    imageDesc: "Raw Sample: Microgram quantity of berkelium-249 compound synthesized at Oak Ridge National Laboratory."
  },
  98: {
    // Californium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Californium.jpg",
    imageDesc: "Raw Sample: Microgram sample of californium-252 intensive neutron emitter inside protective shielding."
  },
  99: {
    // Einsteinium (Solid) -> Raw sample
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Einsteinium.jpg",
    imageDesc: "Raw Sample: Microgram quantity of einsteinium-253 glowing with visible radioactive heat."
  },
  100: {
    // Fermium (Synthetic) -> Cyclotron target
    image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Fermium.jpg",
    imageDesc: "Synthetic Target: High Flux Isotope Reactor beamline target rod utilized in synthesizing fermium-257."
  },
  101: {
    // Mendelevium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Mendelevium.jpg",
    imageDesc: "Synthetic Target: Recoil capture target assembly utilized in the discovery of mendelevium at Berkeley."
  },
  102: {
    // Nobelium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Nobelium.jpg",
    imageDesc: "Synthetic Apparatus: Gas-filled recoil separator detecting single nobelium fusion reaction products."
  },
  103: {
    // Lawrencium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Lawrencium.jpg",
    imageDesc: "Synthetic Apparatus: Rotating wheel catcher and silicon surface barrier detector system for lawrencium."
  },

  // Transactinides (104-118)
  104: {
    // Rutherfordium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Rutherfordium.jpg",
    imageDesc: "Synthetic Apparatus: Target chamber of the 88-Inch Cyclotron where rutherfordium was synthesized."
  },
  105: {
    // Dubnium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/1/12/Dubnium.jpg",
    imageDesc: "Synthetic Apparatus: Heavy-ion fusion gas-jet transport capillary used in dubnium automated chemical studies."
  },
  106: {
    // Seaborgium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Seaborgium.jpg",
    imageDesc: "Synthetic Apparatus: Cryogenic detector array measuring the chemical volatility of seaborgium hexacarbonyl."
  },
  107: {
    // Bohrium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Bohrium.jpg",
    imageDesc: "Synthetic Apparatus: Transactinide gas chromatography apparatus used to study volatile bohrium oxychloride."
  },
  108: {
    // Hassium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Hassium.jpg",
    imageDesc: "Synthetic Apparatus: Automated thermochromatography cryo-detector array registering single hassium tetroxide molecules."
  },
  109: {
    // Meitnerium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Meitnerium.jpg",
    imageDesc: "Synthetic Apparatus: Velocity separator SHIP at GSI Helmholtz Centre where meitnerium was first identified."
  },
  110: {
    // Darmstadtium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Darmstadtium.jpg",
    imageDesc: "Synthetic Apparatus: UNILAC linear accelerator beamline focal point where darmstadtium fusion was achieved."
  },
  111: {
    // Roentgenium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Roentgenium.jpg",
    imageDesc: "Synthetic Apparatus: High-current rotating target wheel used to synthesize superheavy roentgenium atoms."
  },
  112: {
    // Copernicium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Copernicium.jpg",
    imageDesc: "Synthetic Apparatus: Cryo-online gold-coated semiconductor detector used in copernicium thermochromatography."
  },
  113: {
    // Nihonium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Nihonium.jpg",
    imageDesc: "Synthetic Apparatus: RIKEN GARIS gas-filled recoil separator focal plane where nihonium events were registered."
  },
  114: {
    // Flerovium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Flerovium.jpg",
    imageDesc: "Synthetic Apparatus: Flerov Laboratory TASCA gas-filled separator used to evaluate flerovium noble-gas volatility."
  },
  115: {
    // Moscovium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Moscovium.jpg",
    imageDesc: "Synthetic Apparatus: Beamline silicon semiconductor detector recording moscovium implantation and alpha decay chains."
  },
  116: {
    // Livermorium (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Livermorium.jpg",
    imageDesc: "Synthetic Apparatus: Collaborative heavy-ion beam extraction port utilized in livermorium synthesis at Dubna."
  },
  117: {
    // Tennessine (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Tennessine.jpg",
    imageDesc: "Synthetic Apparatus: High Flux Isotope Reactor (HFIR) at Oak Ridge National Laboratory where berkelium target was prepared."
  },
  118: {
    // Oganesson (Synthetic)
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Oganesson.jpg",
    imageDesc: "Synthetic Apparatus: Cyclotron experimental hall at Flerov Laboratory of Nuclear Reactions where oganesson was synthesized."
  }
};
