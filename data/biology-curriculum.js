// Edugates-ClipSAT Science Labs - Biology Curriculum Data
// Extracted from McGraw-Hill Inspire Biology (Teacher's Edition - 6 Units, 27 Modules)

export const biologyCurriculum = {
  subject: "Biology",
  code: "BIO",
  color: "#10b981",
  badge: "The Science of Living Systems",
  description: "Investigate life from cellular structures and molecular genetics to global ecological dynamics and the physiology of human organ systems.",
  totalModules: 27,
  totalUnits: 6,
  units: [
    { id: 1, title: "Ecology", modules: [1, 2, 3, 4, 5] },
    { id: 2, title: "The Cell", modules: [6, 7, 8, 9] },
    { id: 3, title: "Genetics", modules: [10, 11, 12] },
    { id: 4, title: "History of Biological Diversity", modules: [13, 14, 15, 16] },
    { id: 5, title: "The Diversity of Life", modules: [17, 18, 19, 20, 21] },
    { id: 6, title: "The Human Body", modules: [22, 23, 24, 25, 26, 27] }
  ],
  modules: [
    // UNIT 1: ECOLOGY
    {
      id: 1,
      code: "BIO-M01",
      unit: "Unit 1: Ecology",
      title: "The Study of Life",
      phenomenon: "How can microscopic tardigrades survive in the freezing vacuum of space and boiling volcanic vents?",
      bigIdea: "Living organisms share eight fundamental characteristics maintained through homeostasis and cellular organization.",
      lessons: [
        { id: 1, title: "The Science of Life", objectives: ["Define the eight characteristics of life", "Levels of biological organization from atom to biosphere"] },
        { id: 2, title: "The Nature of Science", objectives: ["Distinguish science vs pseudoscience", "Scientific inquiry: observation, hypothesis, CER framework, peer review"] }
      ],
      formulas: ["\\text{Magnification} = \\text{Ocular Lens} \\times \\text{Objective Lens}"],
      lab: "lab-microscope"
    },
    {
      id: 2,
      code: "BIO-M02",
      unit: "Unit 1: Ecology",
      title: "Principles of Ecology",
      phenomenon: "Why does the reintroduction of gray wolves to Yellowstone National Park alter the physical course of rivers?",
      bigIdea: "Interactions between biotic and abiotic factors govern the flow of energy and the cycling of matter through biogeochemical cycles.",
      lessons: [
        { id: 1, title: "Organisms and Their Relationships", objectives: ["Ecological niches, habitats, and symbiotic relationships (mutualism, commensalism, parasitism)"] },
        { id: 2, title: "Flow of Energy in an Ecosystem", objectives: ["Autotrophs vs heterotrophs", "Food chains, complex food webs, and trophic pyramids (10% rule)"] },
        { id: 3, title: "Cycling of Matter", objectives: ["Water cycle, Carbon/Oxygen cycle, Nitrogen cycle, Phosphorus cycle"] }
      ],
      formulas: ["E_{\\text{trophic}} = 0.10 \\times E_{\\text{lower trophic level}}"],
      lab: "lab-punnett"
    },
    {
      id: 3,
      code: "BIO-M03",
      unit: "Unit 1: Ecology",
      title: "Communities, Biomes, and Ecosystems",
      phenomenon: "How does a sterile barren volcanic lava flow transform into a mature deciduous hardwood forest over centuries?",
      bigIdea: "Primary and secondary ecological succession shape stable climax communities adapted to specific climate zones.",
      lessons: [
        { id: 1, title: "Community Ecology", objectives: ["Limiting factors and tolerance ranges", "Primary succession (pioneer species) vs Secondary succession"] },
        { id: 2, title: "Terrestrial Biomes", objectives: ["Tundra, boreal forest, temperate deciduous forest, tropical rainforest, savanna, desert biomes"] },
        { id: 3, title: "Aquatic Ecosystems", objectives: ["Freshwater rivers/lakes, transitional estuaries/wetlands, marine zones (photic, aphotic, abyssal)"] }
      ],
      formulas: ["\\text{Tolerance Zone: Optimum} > \\text{Physiological Stress} > \\text{Intolerance}"],
      lab: "lab-microscope"
    },
    {
      id: 4,
      code: "BIO-M04",
      unit: "Unit 1: Ecology",
      title: "Population Ecology",
      phenomenon: "Why do unchecked yeast populations rapidly proliferate and then abruptly crash when food runs out?",
      bigIdea: "Populations grow exponentially under ideal conditions until density-dependent or independent limiting factors impose a carrying capacity.",
      lessons: [
        { id: 1, title: "Population Dynamics", objectives: ["Population density and spatial dispersion (clumped, uniform, random)", "Exponential growth (J-curve) vs Logistic growth (S-curve)", "Carrying capacity (K)"] },
        { id: 2, title: "Human Population", objectives: ["Demographic transition model", "Age structure diagrams and global resource consumption"] }
      ],
      formulas: ["\\frac{dN}{dt} = rN \\left(1 - \\frac{N}{K}\\right)"],
      lab: "lab-punnett"
    },
    {
      id: 5,
      code: "BIO-M05",
      unit: "Unit 1: Ecology",
      title: "Biodiversity and Conservation",
      phenomenon: "Why does the loss of a single sea otter species cause dense kelp forests to collapse into barren sea urchin deserts?",
      bigIdea: "Maintaining genetic, species, and ecosystem biodiversity preserves ecosystem services critical to biosphere stability.",
      lessons: [
        { id: 1, title: "Biodiversity", objectives: ["Genetic, species, and ecosystem diversity", "Economic and aesthetic value of biodiversity"] },
        { id: 2, title: "Threats to Biodiversity", objectives: ["Habitat loss and fragmentation", "Overexploitation, pollution (eutrophication, biomagnification)", "Invasive species"] },
        { id: 3, title: "Conserving Biodiversity", objectives: ["Renewable vs nonrenewable resources", "Bioremediation and biological augmentation", "Endangered species corridors"] }
      ],
      formulas: ["\\text{Simpson's Diversity Index: } D = 1 - \\sum (n/N)^2"],
      lab: "lab-punnett"
    },

    // UNIT 2: THE CELL
    {
      id: 6,
      code: "BIO-M06",
      unit: "Unit 2: The Cell",
      title: "Chemistry in Biology",
      phenomenon: "Why can water striders walk on pond surfaces without sinking, and how do enzymes accelerate metabolic reactions a millionfold?",
      bigIdea: "Biochemical properties of water, macromolecular building blocks, and enzyme kinetics sustain the cellular engine.",
      lessons: [
        { id: 1, title: "Matter", objectives: ["Atoms, elements, isotopes, and chemical bonds"] },
        { id: 2, title: "Chemical Reactions", objectives: ["Exothermic vs endothermic reactions", "Activation energy and enzyme-substrate active sites"] },
        { id: 3, title: "Water and Its Solutions", objectives: ["Polarity, hydrogen bonding, cohesion/adhesion, high specific heat", "Acids, bases, buffers in blood"] },
        { id: 4, title: "The Building Blocks of Life", objectives: ["Carbohydrates, lipids, proteins, and nucleic acids"] }
      ],
      formulas: ["\\text{Enzyme} + \\text{Substrate} \\rightleftharpoons [\\text{ES}] \\rightarrow \\text{Enzyme} + \\text{Product}"],
      lab: "lab-enzymes"
    },
    {
      id: 7,
      code: "BIO-M07",
      unit: "Unit 2: The Cell",
      title: "Cellular Structure and Function",
      phenomenon: "How do plant cells withstand internal turgor pressures equal to an inflated car tire without bursting?",
      bigIdea: "Cells are bounded by a selectively permeable plasma membrane and contain specialized organelles performing distinct functions.",
      lessons: [
        { id: 1, title: "Cell Discovery and Theory", objectives: ["Hooke, Leeuwenhoek, Schleiden, Schwann, Virchow", "Three tenets of Cell Theory", "Prokaryotic vs Eukaryotic cells"] },
        { id: 2, title: "The Plasma Membrane", objectives: ["Phospholipid bilayer, fluid mosaic model", "Transport proteins, cholesterol, and carbohydrates"] },
        { id: 3, title: "Cellular Transport", objectives: ["Passive transport: diffusion, facilitated diffusion, osmosis", "Hypertonic, hypotonic, isotonic solutions", "Active transport: Na+/K+ ATPase pump, endocytosis, exocytosis"] },
        { id: 4, title: "Structures and Organelles", objectives: ["Nucleus, ribosomes, ER (rough/smooth), Golgi apparatus, lysosomes, vacuoles, mitochondria, chloroplasts, cytoskeleton"] }
      ],
      formulas: ["\\Psi = \\Psi_s + \\Psi_p", "\\Psi_s = -iCRT"],
      lab: "lab-microscope"
    },
    {
      id: 8,
      code: "BIO-M08",
      unit: "Unit 2: The Cell",
      title: "Cellular Energy",
      phenomenon: "How can deep green leaves capture sunlight photons to synthesize sweet glucose, which cells then burn into thousands of ATP molecules?",
      bigIdea: "Photosynthesis traps radiant energy to build organic carbohydrates, which cellular respiration oxidizes to recharge ATP.",
      lessons: [
        { id: 1, title: "How Organisms Obtain Energy", objectives: ["Thermodynamics laws in biology", "Metabolic pathways: catabolic vs anabolic", "ATP/ADP cycle as cellular currency"] },
        { id: 2, title: "Photosynthesis", objectives: ["Chloroplast thylakoids and stroma", "Light-dependent reactions (Photosystems II & I, photolysis, ATP synthase)", "Calvin cycle (carbon fixation via RuBisCO, G3P synthesis)"] },
        { id: 3, title: "Cellular Respiration", objectives: ["Glycolysis in cytoplasm", "Krebs citric acid cycle in mitochondrial matrix", "Electron transport chain and chemiosmotic oxidative phosphorylation", "Fermentation: lactic acid vs alcoholic"] }
      ],
      formulas: ["6CO_2 + 6H_2O \\xrightarrow{\\text{light}} C_6H_{12}O_6 + 6O_2", "C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36-38\\text{ ATP}"],
      lab: "lab-photosynthesis"
    },
    {
      id: 9,
      code: "BIO-M09",
      unit: "Unit 2: The Cell",
      title: "Cellular Reproduction and Sexual Reproduction",
      phenomenon: "How does a single fertilized zygote multiply into thirty trillion specialized cells, and what causes cells to divide uncontrollably in cancer?",
      bigIdea: "The cell cycle ensures exact genetic duplication through mitosis, while meiosis produces genetically diverse haploid gametes.",
      lessons: [
        { id: 1, title: "Cellular Reproduction", objectives: ["Cell size limitations (surface-area-to-volume ratio)", "Interphase (G1, S, G2)", "Mitosis phases: Prophase, Metaphase, Anaphase, Telophase", "Cytokinesis in animals vs plants", "Cyclins, CDKs, checkpoints, and apoptosis"] },
        { id: 2, title: "Meiosis and Sexual Reproduction", objectives: ["Haploid (n) vs Diploid (2n)", "Homologous chromosomes and crossing over in Prophase I", "Independent assortment and gametogenesis"] }
      ],
      formulas: ["\\text{SA/V Ratio} = \\frac{6s^2}{s^3} = \\frac{6}{s}", "2^n \\text{ (Gamete variations)}"],
      lab: "lab-microscope"
    },

    // UNIT 3: GENETICS
    {
      id: 10,
      code: "BIO-M10",
      unit: "Unit 3: Genetics",
      title: "Introduction to Genetics and Patterns of Inheritance",
      phenomenon: "Why can two brown-eyed parents have a blue-eyed child, and how do pedigrees track hereditary conditions across generations?",
      bigIdea: "Mendelian laws of segregation and independent assortment predict inheritance ratios, supplemented by incomplete dominance, codominance, and sex-linkage.",
      lessons: [
        { id: 1, title: "Mendelian Genetics", objectives: ["Mendel’s pea plant experiments", "Dominant vs recessive alleles, homozygous vs heterozygous, genotype vs phenotype", "Punnett squares: monohybrid crosses (3:1)"] },
        { id: 2, title: "Genetic Recombination and Gene Linkage", objectives: ["Dihybrid crosses (9:3:3:1)", "Gene mapping and recombination frequency"] },
        { id: 3, title: "Applied Genetics", objectives: ["Selective breeding: hybridization and inbreeding"] },
        { id: 4, title: "Basic Patterns of Human Inheritance", objectives: ["Pedigree chart analysis", "Recessive disorders (cystic fibrosis, Tay-Sachs) and dominant disorders (Huntington’s)"] },
        { id: 5, title: "Complex Patterns of Inheritance", objectives: ["Incomplete dominance (snapdragons)", "Codominance (sickle-cell anemia)", "Multiple alleles (ABO blood groups)", "Sex-linked traits (color blindness, hemophilia)", "Polygenic traits"] }
      ],
      formulas: ["\\text{Monohybrid: } 1:2:1 \\text{ Genotype}, 3:1 \\text{ Phenotype}", "\\text{Dihybrid: } 9:3:3:1 \\text{ Phenotypic ratio}"],
      lab: "lab-punnett"
    },
    {
      id: 11,
      code: "BIO-M11",
      unit: "Unit 3: Genetics",
      title: "Molecular Genetics",
      phenomenon: "How does a microscopic sequence of four chemical letters (A, T, C, G) encode every protein, trait, and instinct in all living organisms?",
      bigIdea: "The central dogma of molecular biology dictates that genetic information flows from DNA to RNA to protein via transcription and translation.",
      lessons: [
        { id: 1, title: "DNA: The Genetic Material", objectives: ["Griffith transformation, Avery-MacLeod-McCarty, Hershey-Chase bacteriophage experiments", "Watson, Crick, Franklin, Wilkins double helix model", "Chargaff's rules (A=T, C=G)"] },
        { id: 2, title: "Replication of DNA", objectives: ["Semiconservative replication", "Helicase, RNA primase, DNA polymerase III, Okazaki fragments, Ligase", "Leading vs lagging strand"] },
        { id: 3, title: "DNA, RNA, and Protein", objectives: ["mRNA, tRNA, rRNA roles", "Transcription in nucleus (promoters, RNA polymerase, splicing introns/exons)", "Genetic code table", "Translation at ribosome (initiation, elongation, termination)"] },
        { id: 4, title: "Gene Regulation and Mutation", objectives: ["Prokaryotic lac operon", "Eukaryotic transcription factors and homeobox genes", "Point mutations: missense, nonsense, silent", "Frameshift insertions/deletions and mutagens"] }
      ],
      formulas: ["\\%A = \\%T \\quad \\& \\quad \\%C = \\%G", "\\text{Central Dogma: } \\text{DNA} \\xrightarrow{\\text{transcription}} \\text{mRNA} \\xrightarrow{\\text{translation}} \\text{Polypeptide}"],
      lab: "lab-dna-protein"
    },
    {
      id: 12,
      code: "BIO-M12",
      unit: "Unit 3: Genetics",
      title: "Biotechnology",
      phenomenon: "How can scientists use bacterial CRISPR-Cas9 defense systems to surgically edit mutant human genes responsible for sickle cell anemia?",
      bigIdea: "Recombinant DNA technologies, PCR amplification, gel electrophoresis, and gene editing empower modern medical and agricultural biotechnology.",
      lessons: [
        { id: 1, title: "DNA Technology", objectives: ["Restriction enzymes and sticky ends", "Gel electrophoresis separation by charge and size", "Recombinant DNA and bacterial plasmid vectors", "Polymerase Chain Reaction (PCR) thermal cycling", "DNA sequencing and CRISPR gene editing"] },
        { id: 2, title: "The Human Genome", objectives: ["Human Genome Project findings", "Bioinformatics, DNA microarrays, pharmacogenomics", "Gene therapy and ethical dimensions"] }
      ],
      formulas: ["\\text{PCR Yield} = N_0 \\times 2^n \\text{ (where } n = \\text{cycles)}"],
      lab: "lab-dna-protein"
    },

    // UNIT 4: HISTORY OF BIOLOGICAL DIVERSITY
    {
      id: 13,
      code: "BIO-M13",
      unit: "Unit 4: History of Biological Diversity",
      title: "The History of Life",
      phenomenon: "How do 3.5-billion-year-old fossilized stromatolite mounds provide proof of early photosynthetic cyanobacteria?",
      bigIdea: "Fossil evidence, relative and radiometric dating, and cellular evolutionary models document the billions-year history of Earth’s biosphere.",
      lessons: [
        { id: 1, title: "Fossil Evidence of Change", objectives: ["Fossil formation (petrified, molds, casts, trace)", "Relative dating and Law of Superposition", "Radiometric dating and isotope half-lives", "Geologic time scale (Precambrian, Paleozoic, Mesozoic, Cenozoic)"] },
        { id: 2, title: "The Origin of Life", objectives: ["Spontaneous generation vs Biogenesis (Redi and Pasteur)", "Miller-Urey prebiotic synthesis experiment", "RNA World hypothesis and Endosymbiotic Theory (mitochondria & chloroplasts)"] }
      ],
      formulas: ["t = \\left(\\frac{t_{1/2}}{\\ln 2}\\right) \\ln\\left(1 + \\frac{D}{P}\\right)"],
      lab: "lab-microscope"
    },
    {
      id: 14,
      code: "BIO-M14",
      unit: "Unit 4: History of Biological Diversity",
      title: "Evolution",
      phenomenon: "Why do the finches of the Galápagos Islands possess specialized beaks perfectly tailored to different seeds, flowers, or insects?",
      bigIdea: "Natural selection acts on phenotypic variations, driving adaptive evolutionary change and speciation over generations.",
      lessons: [
        { id: 1, title: "Darwin's Theory of Evolution by Natural Selection", objectives: ["HMS Beagle voyage and Galápagos observations", "Four principles: variation, heritability, overproduction, reproductive advantage"] },
        { id: 2, title: "Evidence of Evolution", objectives: ["Fossil record transitional species", "Comparative anatomy: homologous, analogous, vestigial structures", "Comparative embryology and molecular biochemistry (cytochrome c, DNA homologies)"] },
        { id: 3, title: "Shaping Evolutionary Theory", objectives: ["Hardy-Weinberg equilibrium conditions and equations", "Genetic drift (bottleneck and founder effect)", "Natural selection modes: stabilizing, directional, disruptive", "Allopatric vs Sympatric speciation", "Convergent vs Divergent adaptive radiation"] }
      ],
      formulas: ["p + q = 1", "p^2 + 2pq + q^2 = 1"],
      lab: "lab-punnett"
    },
    {
      id: 15,
      code: "BIO-M15",
      unit: "Unit 4: History of Biological Diversity",
      title: "Primate Evolution",
      phenomenon: "What skeletal adaptations allowed early hominins to transition from tree-dwelling quadrupedalism to upright bipedal walking?",
      bigIdea: "Primate adaptations—opposable thumbs, binocular vision, and expanded cranial capacity—trace hominin evolutionary lineage.",
      lessons: [
        { id: 1, title: "Primates", objectives: ["Primate characteristics: manual dexterity, stereoscopic color vision, large brain-to-body mass ratio", "Strepsirrhines vs Haplorhines"] },
        { id: 2, title: "Hominoids to Hominins", objectives: ["Australopithecines (Lucy - Australopithecus afarensis)", "Bipedal skeletal features: foramen magnum location, S-shaped spine, bowl-shaped pelvis"] },
        { id: 3, title: "Human Ancestry", objectives: ["Homo habilis, Homo erectus, Homo neanderthalensis, Homo sapiens", "Out-of-Africa hypothesis supported by mitochondrial DNA (mtDNA)"] }
      ],
      formulas: ["\\text{Cranial Capacity: } \\text{Chimp (400 cc)} \\rightarrow \\text{H. erectus (1000 cc)} \\rightarrow \\text{H. sapiens (1400 cc)}"],
      lab: "lab-microscope"
    },
    {
      id: 16,
      code: "BIO-M16",
      unit: "Unit 4: History of Biological Diversity",
      title: "Organizing Life's Diversity",
      phenomenon: "Why are whales classified closer to hippopotamuses than to predatory sharks despite their swimming bodies?",
      bigIdea: "Cladistics and molecular phylogenetics reconstruct evolutionary relationships across three domains and six kingdoms.",
      lessons: [
        { id: 1, title: "The History of Classification", objectives: ["Aristotle's early system", "Linnaean binomial nomenclature (Genus species)", "Taxonomic hierarchy (Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species)"] },
        { id: 2, title: "Modern Classification", objectives: ["Morphological vs Biochemical characters", "Phylogenetic trees and Cladograms", "Derived vs Ancestral traits, outgroups, and molecular clocks"] },
        { id: 3, title: "Domains and Kingdoms", objectives: ["Domains: Bacteria, Archaea, Eukarya", "Kingdoms: Bacteria, Archaea, Protista, Fungi, Plantae, Animalia"] }
      ],
      formulas: ["\\text{Binomial Nomenclature: } \\textit{Homo sapiens}"],
      lab: "lab-microscope"
    },

    // UNIT 5: THE DIVERSITY OF LIFE
    {
      id: 17,
      code: "BIO-M17",
      unit: "Unit 5: The Diversity of Life",
      title: "Bacteria and Viruses",
      phenomenon: "How can viruses lack cellular machinery, yet hijack host cells to churn out thousands of infectious virions?",
      bigIdea: "Prokaryotes exhibit diverse metabolisms, while non-living viruses replicate by invading living host cells through lytic or lysogenic cycles.",
      lessons: [
        { id: 1, title: "Bacteria", objectives: ["Structure: peptidoglycan wall, capsule, pili, flagella, nucleoid plasmid", "Shapes: cocci, bacilli, spirilla", "Gram stain positive vs negative", "Reproduction: binary fission, conjugation", "Endospores and ecological nitrogen fixation"] },
        { id: 2, title: "Viruses and Prions", objectives: ["Viral structure: capsid and nucleic acid core", "Lytic cycle vs Lysogenic cycle", "Retroviruses (reverse transcriptase)", "Prions and transmissible spongiform encephalopathies"] }
      ],
      formulas: ["N = N_0 \\times 2^{t/g} \\text{ (Bacterial doubling)}"],
      lab: "lab-microscope"
    },
    {
      id: 18,
      code: "BIO-M18",
      unit: "Unit 5: The Diversity of Life",
      title: "Protists and Fungi",
      phenomenon: "How do subterranean fungal networks (mycorrhizae) connect entire forest trees into a biological communication web?",
      bigIdea: "Protists represent diverse eukaryotic single-celled lineages; fungi are heterotrophic decomposers with chitin walls and hyphal networks.",
      lessons: [
        { id: 1, title: "Introduction to Protists", objectives: ["Classification: protozoans, algae, slime molds", "Endosymbiosis evidence"] },
        { id: 2, title: "Protist Diversity", objectives: ["Amoebas (pseudopods), Ciliates (Paramecium), Flagellates, Sporozoans (Plasmodium malaria)", "Algae (Diatoms, Dinoflagellates, Kelp)"] },
        { id: 3, title: "Introduction to Fungi", objectives: ["Hyphae, mycelium, fruiting bodies, chitin cell walls", "Saprophytic, parasitic, mutualistic nutrition"] },
        { id: 4, title: "Fungus Diversity and Ecology", objectives: ["Chytrids, Zygomycetes, Ascomycetes (yeast, truffles), Basidiomycetes (mushrooms)", "Lichens and Mycorrhizae mutualism", "Penicillin and medical applications"] }
      ],
      formulas: ["\\text{Symbiosis: Fungus (water/minerals) } + \\text{ Alga (photosynthate)}"],
      lab: "lab-microscope"
    },
    {
      id: 19,
      code: "BIO-M19",
      unit: "Unit 5: The Diversity of Life",
      title: "Introduction to Plants",
      phenomenon: "How can 300-foot-tall California redwood trees pump water from soil to crown against gravity without mechanical pumps?",
      bigIdea: "Plant evolution from nonvascular bryophytes to flowering angiosperms featured vascular xylem/phloem, seeds, and flower adaptations.",
      lessons: [
        { id: 1, title: "Plant Evolution and Diversity", objectives: ["Nonvascular plants (mosses)", "Seedless vascular plants (ferns)", "Gymnosperms (conifers)", "Angiosperms (monocots vs eudicots)"] },
        { id: 2, title: "Plant Structure and Function", objectives: ["Tissues: meristematic, dermal, vascular (xylem tracheids/vessels, phloem sieve tubes), ground", "Root systems, stem modifications, leaf anatomy (cuticle, stomata, guard cells)", "Transpirational pull (Cohesion-Tension theory)"] },
        { id: 3, title: "Plant Reproduction", objectives: ["Alternation of generations (gametophyte n vs sporophyte 2n)", "Flower anatomy (stamen, carpel/pistil, petals, sepals)", "Pollination and double fertilization forming 3n endosperm", "Seed dispersal adaptations"] }
      ],
      formulas: ["\\text{Double Fertilization: } (1n + 1n = 2n \\text{ zygote}) \\quad \\& \\quad (1n + 2n = 3n \\text{ endosperm})"],
      lab: "lab-microscope"
    },
    {
      id: 20,
      code: "BIO-M20",
      unit: "Unit 5: The Diversity of Life",
      title: "Introduction to Animals",
      phenomenon: "How does a microscopic hollow ball of blastula cells fold inwards to establish distinct gut, nervous system, and muscles?",
      bigIdea: "Animals are multicellular heterotrophs characterized by tissue differentiation, body symmetries, and gastrulation germ layers.",
      lessons: [
        { id: 1, title: "Animal Characteristics", objectives: ["Multicellularity, heterotrophy, absence of cell walls, locomotion", "Embryonic development: zygote, blastula, gastrula", "Germ layers: ectoderm, mesoderm, endoderm"] },
        { id: 2, title: "Animal Body Plans", objectives: ["Symmetry: asymmetry (sponges), radial (cnidarians), bilateral (bilaterians)", "Cephalization and anatomical directions (anterior, posterior, dorsal, ventral)", "Body cavities: acoelomate, pseudocoelomate, coelomate", "Protostomes vs Deuterostomes cleavage and blastopore fate"] }
      ],
      formulas: ["\\text{Blastopore fate: Protostome (Mouth first) vs Deuterostome (Anus first)}"],
      lab: "lab-microscope"
    },
    {
      id: 21,
      code: "BIO-M21",
      unit: "Unit 5: The Diversity of Life",
      title: "Animal Behavior and Diversity",
      phenomenon: "Why do honeybees perform complex figure-eight waggle dances to communicate the exact compass bearing and distance to flowers?",
      bigIdea: "Invertebrate and vertebrate evolution culminated in complex behavioral adaptations balancing innate instincts with learned intelligence.",
      lessons: [
        { id: 1, title: "Invertebrates", objectives: ["Sponges, Cnidarians, Flatworms, Nematodes, Mollusks, Annelids, Arthropods (exoskeleton & jointed appendages), Echinoderms"] },
        { id: 2, title: "Vertebrates", objectives: ["Chordate features: notochord, dorsal hollow nerve cord, pharyngeal slits, post-anal tail", "Fishes (jawless, cartilaginous, bony), Amphibians, Reptiles (amniotic egg), Birds (feathers, endothermy), Mammals (hair, mammary glands)"] },
        { id: 3, title: "Animal Behavior", objectives: ["Innate behaviors: fixed action patterns", "Learned behaviors: habituation, classical conditioning, operant conditioning, imprinting, cognitive reasoning", "Ecological behaviors: foraging, migratory compass navigation, communication pheromones, altruism & kin selection"] }
      ],
      formulas: ["rB > C \\text{ (Hamilton's Rule for Kin Selection)}"],
      lab: "lab-punnett"
    },

    // UNIT 6: THE HUMAN BODY
    {
      id: 22,
      code: "BIO-M22",
      unit: "Unit 6: The Human Body",
      title: "Integumentary, Skeletal, and Muscular Systems",
      phenomenon: "How can high-performance sprinters exert over 500 pounds of force through foot tendons without tearing skeletal muscle fibers?",
      bigIdea: "Skin shields the internal environment, bones furnish protective structural leverage, and sliding muscle filaments generate movement.",
      lessons: [
        { id: 1, title: "The Integumentary System", objectives: ["Epidermis (keratin, melanocytes), dermis, subcutaneous hypodermis", "Thermoregulation via sweat glands and capillary vasodilation/vasoconstriction"] },
        { id: 2, title: "The Skeletal System", objectives: ["Axial vs appendicular skeleton", "Compact bone (osteons, Haversian canals) vs spongy bone", "Osteoblasts, osteoclasts, and bone remodeling", "Joint types: ball-and-socket, hinge, pivot"] },
        { id: 3, title: "The Muscular System", objectives: ["Skeletal, smooth, and cardiac muscle histology", "Sarcomere architecture (actin thin filaments, myosin thick filaments)", "Sliding filament theory: Ca2+ release from sarcoplasmic reticulum, ATP cross-bridge cycling"] }
      ],
      formulas: ["\\text{Sarcomere contraction: } \\text{Z-discs approach, H-zone & I-band shorten, A-band stays constant}"],
      lab: "lab-microscope"
    },
    {
      id: 23,
      code: "BIO-M23",
      unit: "Unit 6: The Human Body",
      title: "Nervous System",
      phenomenon: "How can your brain process optical photons and transmit an impulse to catch a falling glass in under 150 milliseconds?",
      bigIdea: "Neurons propagate electrical action potentials and release neurotransmitters across synapses to coordinate thought, sensation, and reflex arcs.",
      lessons: [
        { id: 1, title: "Structure of the Nervous System", objectives: ["Neuron anatomy: dendrites, soma, axon, myelin sheath, nodes of Ranvier", "Resting membrane potential (-70 mV via Na+/K+ pump)", "Action potential: threshold, voltage-gated Na+ influx depolarization, K+ efflux repolarization, refractory period"] },
        { id: 2, title: "Organization of the Nervous System", objectives: ["Central Nervous System: cerebrum hemispheres, cerebellum, brainstem (medulla, pons)", "Peripheral Nervous System: Somatic vs Autonomic (Sympathetic fight-or-flight vs Parasympathetic rest-and-digest)", "Reflex arcs"] },
        { id: 3, title: "The Senses", objectives: ["Mechanoreceptors (touch, hearing cochlea hair cells)", "Photoreceptors (rods and cones in retina)", "Chemoreceptors (taste buds, olfactory epithelium)"] },
        { id: 4, title: "Effects of Drugs", objectives: ["Neurotransmitters: dopamine, serotonin, acetylcholine", "Agonists vs antagonists, tolerance, physical addiction mechanisms"] }
      ],
      formulas: ["E_{\\text{rest}} = -70\\text{ mV} \\quad \\rightarrow \\quad E_{\\text{peak}} = +30\\text{ mV}"],
      lab: "lab-microscope"
    },
    {
      id: 24,
      code: "BIO-M24",
      unit: "Unit 6: The Human Body",
      title: "Circulatory, Respiratory, and Excretory Systems",
      phenomenon: "How does the human heart beat over 2.5 billion times in a lifetime without pausing for rest, and how do nephrons clean entire blood volume daily?",
      bigIdea: "Circulation transports oxygen and nutrients, respiration accomplishes gas exchange, and nephrons filter metabolic nitrogenous wastes.",
      lessons: [
        { id: 1, title: "Circulatory System", objectives: ["Four heart chambers, valves, SA/AV node pacemaker conduction", "Pulmonary vs systemic circulation", "Blood vessels: arteries, capillaries, veins", "Blood composition: plasma, erythrocytes (hemoglobin), leukocytes, platelets", "Blood pressure (systolic/diastolic)"] },
        { id: 2, title: "Respiratory System", objectives: ["Airway: pharynx, larynx, trachea, bronchi, bronchioles, alveoli", "Mechanics of breathing: diaphragm contraction and negative pressure ventilation", "Gas exchange via partial pressure gradients"] },
        { id: 3, title: "The Excretory System", objectives: ["Kidney anatomy: cortex, medulla, pelvis", "Nephron function: Bowman's capsule filtration, proximal/distal tubule reabsorption, loop of Henle concentration, collecting duct secretion", "Antidiuretic hormone (ADH) and water balance"] }
      ],
      formulas: ["\\text{Cardiac Output} = \\text{Heart Rate} \\times \\text{Stroke Volume}", "\\text{Normal BP: } 120/80\\text{ mmHg}"],
      lab: "lab-microscope"
    },
    {
      id: 25,
      code: "BIO-M25",
      unit: "Unit 6: The Human Body",
      title: "Digestive and Endocrine Systems",
      phenomenon: "How can the stomach produce hydrochloric acid corrosive enough to dissolve metal, without digesting its own epithelial lining?",
      bigIdea: "The digestive system breaks down food for cellular assimilation, while the endocrine system secretes hormones regulating long-term metabolic homeostasis.",
      lessons: [
        { id: 1, title: "The Digestive System", objectives: ["Mechanical vs chemical digestion", "Mouth (salivary amylase), esophagus (peristalsis), stomach (pepsin, HCl)", "Small intestine (duodenum, villi, microvilli absorption), liver (bile), pancreas (enzymes)", "Large intestine water reabsorption"] },
        { id: 2, title: "Nutrition", objectives: ["Macronutrients: carbohydrates, lipids, proteins; micronutrients: vitamins and minerals", "Basal metabolic rate and Caloric energy"] },
        { id: 3, title: "The Endocrine System", objectives: ["Endocrine glands: pituitary (master gland), thyroid, adrenal, pancreas (islets of Langerhans)", "Negative feedback loops: blood glucose regulation via insulin and glucagon", "Steroid vs amino-acid derived hormone cellular mechanisms"] }
      ],
      formulas: ["\\text{Blood Glucose Homeostasis: } \\text{High glucose} \\rightarrow \\text{Insulin} \\rightarrow \\text{Glycogen storage}"],
      lab: "lab-microscope"
    },
    {
      id: 26,
      code: "BIO-M26",
      unit: "Unit 6: The Human Body",
      title: "Human Reproduction and Development",
      phenomenon: "How can a single egg cell fertilized by one sperm cell divide into an embryo with beating heart tissue within just four weeks?",
      bigIdea: "Gamete production, hormonal menstrual cycles, fertilization, and embryonic trimesters orchestrate human reproduction and development.",
      lessons: [
        { id: 1, title: "Reproductive Systems", objectives: ["Male anatomy (testes, epididymis, vas deferens, semen, testosterone)", "Female anatomy (ovaries, Fallopian tubes, uterus, estrogen, progesterone)", "Oogenesis and the ovarian/menstrual cycle (FSH, LH ovulation surge)"] },
        { id: 2, title: "Human Development Before Birth", objectives: ["Fertilization in Fallopian tube", "Cleavage, morula, blastocyst implantation", "Placenta and umbilical cord exchange", "First, second, third trimester developmental milestones"] },
        { id: 3, title: "Birth, Growth, and Aging", objectives: ["Labor stages: dilation, expulsion, placental delivery (oxytocin positive feedback)", "Postnatal stages: infancy, childhood, adolescence, adulthood"] }
      ],
      formulas: ["\\text{Positive Feedback: } \\text{Cervical stretch} \\rightarrow \\text{Oxytocin release} \\rightarrow \\text{Stronger contractions}"],
      lab: "lab-punnett"
    },
    {
      id: 27,
      code: "BIO-M27",
      unit: "Unit 6: The Human Body",
      title: "The Immune System",
      phenomenon: "How do memory B and T cells preserve biochemical recognition of a virus for sixty years after a childhood vaccination?",
      bigIdea: "Innate anatomical and inflammatory defenses combine with adaptive antibody-mediated and cell-mediated immunity to eradicate pathogens.",
      lessons: [
        { id: 1, title: "Infectious Diseases", objectives: ["Koch's postulates", "Pathogens: bacteria, viruses, protozoa, fungi", "Disease transmission reservoirs and vectors"] },
        { id: 2, title: "The Immune System", objectives: ["Innate immunity: skin barrier, mucus, lysozyme, phagocytic macrophages, natural killer cells, inflammatory response", "Adaptive immunity: B cells (plasma cells producing antibodies, memory B cells)", "Cell-mediated immunity: helper T cells (CD4+), cytotoxic T cells (CD8+), perforin", "Active vs passive immunity and vaccine immunological memory"] },
        { id: 3, title: "Noninfectious Disorders", objectives: ["Genetic disorders, degenerative diseases, metabolic disorders", "Allergies and anaphylaxis (histamine release)", "Autoimmune diseases (Type 1 diabetes, rheumatoid arthritis, lupus)", "Immunodeficiency (HIV/AIDS targeting helper T cells)"] }
      ],
      formulas: ["\\text{Antibody: } \\text{Two heavy chains} + \\text{Two light chains} \\text{ (Variable antigen-binding Fab region)}"],
      lab: "lab-microscope"
    }
  ]
};
