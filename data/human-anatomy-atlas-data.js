// Edugates-ClipSAT Science Labs - Authoritative 4K Human Anatomy Atlas Database
// Scientifically verified human anatomical data covering 10 major organ systems,
// Latin terminology (Terminologia Anatomica), functional histology, vascularization,
// innervation, clinical pathology notes, 4K spatial coordinates, and micro-architecture simulations.

export const ANATOMICAL_SYSTEMS = {
  skeletal: {
    id: "skeletal",
    name: "Skeletal System",
    latinName: "Systema skeletale",
    icon: "💀",
    color: "#e2e8f0",
    badgeBg: "rgba(226, 232, 240, 0.15)",
    badgeBorder: "rgba(226, 232, 240, 0.4)",
    boneCount: 206,
    axialBones: 80,
    appendicularBones: 126,
    summary: "Rigid framework of 206 bones, cartilages, and ligaments providing structural leverage, vital organ protection, calcium/phosphate mineral reservoir, and hematopoiesis (red bone marrow blood cell formation)."
  },
  muscular: {
    id: "muscular",
    name: "Muscular System",
    latinName: "Systema musculare",
    icon: "💪",
    color: "#f87171",
    badgeBg: "rgba(248, 113, 113, 0.15)",
    badgeBorder: "rgba(248, 113, 113, 0.4)",
    muscleCount: 650,
    summary: "Over 650 skeletal muscles attached via tendons to skeleton, executing voluntary locomotion, posture stabilization, respiratory ventilation, and thermogenic heat generation via actin-myosin cross-bridge cycling."
  },
  circulatory: {
    id: "circulatory",
    name: "Cardiovascular System",
    latinName: "Systema cardiovasculare",
    icon: "🫀",
    color: "#ef4444",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    badgeBorder: "rgba(239, 68, 68, 0.4)",
    cardiacOutput: "5.0 L/min",
    summary: "Four-chambered muscular heart and 60,000 miles of systemic and pulmonary vasculature circulating oxygenated erythrocytes, leukocytes, platelets, hormones, and nutrients while clearing metabolic wastes."
  },
  nervous: {
    id: "nervous",
    name: "Nervous System",
    latinName: "Systema nervosum",
    icon: "🧠",
    color: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    badgeBorder: "rgba(56, 189, 248, 0.4)",
    neuronCount: "~86 Billion",
    summary: "Master electrochemical communication network comprising the Central Nervous System (brain, spinal cord) and Peripheral Nervous System (12 cranial pairs, 31 spinal pairs, somatic and autonomic divisions)."
  },
  respiratory: {
    id: "respiratory",
    name: "Respiratory System",
    latinName: "Systema respiratorium",
    icon: "🫁",
    color: "#34d399",
    badgeBg: "rgba(52, 211, 153, 0.15)",
    badgeBorder: "rgba(52, 211, 153, 0.4)",
    alveoliCount: "~480 Million",
    summary: "Conducting airway and alveolar pulmonary capillary exchange beds ventilating 6-8 L of air/min, facilitating O2 loading and CO2 clearance across a 0.2-0.5 µm blood-air diffusion membrane."
  },
  digestive: {
    id: "digestive",
    name: "Digestive System",
    latinName: "Systema digestorium",
    icon: "🍽️",
    color: "#fbbf24",
    badgeBg: "rgba(251, 191, 36, 0.15)",
    badgeBorder: "rgba(251, 191, 36, 0.4)",
    tractLength: "~9 Meters (30 ft)",
    summary: "Gastrointestinal tract (mouth, esophagus, stomach, small and large intestines) and accessory viscera (liver, gallbladder, pancreas) coordinating mechanical breakdown, enzymatic hydrolysis, and nutrient absorption."
  },
  urinary: {
    id: "urinary",
    name: "Urinary / Excretory System",
    latinName: "Systema urinarium",
    icon: "🧪",
    color: "#a78bfa",
    badgeBg: "rgba(167, 139, 250, 0.15)",
    badgeBorder: "rgba(167, 139, 250, 0.4)",
    filtrationRate: "180 L/day (125 mL/min)",
    summary: "Bilateral retroperitoneal kidneys, ureters, bladder, and urethra filtering 180 L of plasma filtrate daily via 2 million nephrons, regulating blood pressure, osmolality, electrolyte balance, and urea excretion."
  },
  endocrine: {
    id: "endocrine",
    name: "Endocrine System",
    latinName: "Systema endocrinum",
    icon: "🧬",
    color: "#f472b6",
    badgeBg: "rgba(244, 114, 182, 0.15)",
    badgeBorder: "rgba(244, 114, 182, 0.4)",
    summary: "Ductless hormone-secreting glands (hypothalamus, pituitary, thyroid, parathyroids, adrenals, pancreatic islets, gonads) orchestrating long-term metabolic homeostasis, growth, circadian rhythms, and stress response."
  },
  lymphatic: {
    id: "lymphatic",
    name: "Lymphatic & Immune System",
    latinName: "Systema lymphoideum",
    icon: "🛡️",
    color: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeBorder: "rgba(16, 185, 129, 0.4)",
    summary: "Vascular lymphatic drainage network, cisterna chyli, thoracic duct, lymph nodes, spleen, and thymus maintaining interstitial fluid balance and deploying cell-mediated and humoral adaptive immune responses."
  },
  integumentary: {
    id: "integumentary",
    name: "Integumentary System",
    latinName: "Integumentum commune",
    icon: "✨",
    color: "#fb923c",
    badgeBg: "rgba(251, 146, 60, 0.15)",
    badgeBorder: "rgba(251, 146, 60, 0.4)",
    surfaceArea: "1.5 - 2.0 m²",
    summary: "The body's largest organ system comprising epidermis, dermis, hypodermis, hair, nails, and exocrine glands; furnishes mechanical barrier protection, thermoregulation, sensory reception, and vitamin D3 synthesis."
  }
};

/**
 * 4K Atlas Master Anatomical Structures
 * Coordinates are mapped to a high-definition 4K normalized canvas space (width: 1000, height: 1800).
 * Layers: 1 = Integument/Surface, 2 = Muscular, 3 = Skeletal, 4 = Visceral/Internal, 5 = Vasculature, 6 = Nervous.
 */
export const ANATOMICAL_STRUCTURES = [
  // --- HEAD & CRANIAL REGION ---
  {
    id: "cranium",
    name: "Cranium & Neurocranium",
    latinName: "Cranium / Neurocranium",
    system: "skeletal",
    layer: 3,
    region: "head",
    coords: { x: 500, y: 110 },
    view: "anterior",
    category: "Axial Skeleton",
    description: "Eight protective cranial bones (frontal, 2 parietal, 2 temporal, occipital, sphenoid, ethmoid) interlocking via immovable fibrous sutures (coronal, sagittal, lambdoid, squamous), sheltering the brain.",
    function: "Protects delicate cerebral hemispheres, cerebellum, and brainstem; provides anchoring origins for facial, masticatory, and deep suboccipital musculature.",
    vascularization: "Middle meningeal artery (maxillary branch entering via foramen spinosum), superficial temporal artery, occipital artery.",
    innervation: "Trigeminal nerve (CN V branches: ophthalmic, maxillary, mandibular sensory distribution) and cervical nerves C2-C3.",
    pathology: "Cranial fractures (basilar skull fracture with Battle sign/racoon eyes), epidural hematoma from ruptured middle meningeal artery under the pterion."
  },
  {
    id: "cerebrum",
    name: "Cerebrum (Cerebral Cortex)",
    latinName: "Cerebrum / Telencephalon",
    system: "nervous",
    layer: 6,
    region: "head",
    coords: { x: 500, y: 125 },
    view: "anterior",
    category: "Central Nervous System",
    description: "Two heavily folded cerebral hemispheres divided by longitudinal fissure, joined by the corpus callosum. Composed of outer grey matter (6-layer neocortex) and subcortical white matter tracts.",
    function: "Seat of conscious perception, executive cognition (frontal lobe), motor execution (precentral gyrus), somatosensation (postcentral gyrus), speech processing (Broca/Wernicke), and memory consolidation.",
    vascularization: "Circle of Willis (Anterior cerebral artery, Middle cerebral artery, Posterior cerebral artery supplied by internal carotid and vertebral-basilar systems).",
    innervation: "Intrinsically processed by ~16 billion cortical pyramidal and interneurons; receives sensory inputs via thalamocortical radiations.",
    pathology: "Ischemic / hemorrhagic stroke (CVA), Alzheimer's dementia with amyloid-beta plaques and tau neurofibrillary tangles, glioblastoma multiforme."
  },
  {
    id: "brainstem",
    name: "Brainstem & Cerebellum",
    latinName: "Truncus encephali & Cerebellum",
    system: "nervous",
    layer: 6,
    region: "head",
    coords: { x: 500, y: 165 },
    view: "posterior",
    category: "Central Nervous System",
    description: "Comprises the midbrain (mesencephalon), pons, and medulla oblongata, anchored posteriorly to the cerebellum (arbor vitae, Purkinje cells). Forms floor of 4th ventricle.",
    function: "Autonomic regulation of cardiorespiratory rhythm (medullary centers), cranial nerve nuclei III-XII, balance, motor coordination, and fine kinetic error correction (cerebellum).",
    vascularization: "Basilar artery (giving off anterior inferior cerebellar AICA, superior cerebellar SCA) and vertebral arteries (posterior inferior cerebellar PICA).",
    innervation: "Ascending sensory spinothalamic/dorsal column tracts and descending corticospinal motor tracts.",
    pathology: "Brainstem herniation through foramen magnum (Cushing triad: hypertension, bradycardia, irregular respiration), Wallenberg lateral medullary syndrome."
  },
  {
    id: "mandible",
    name: "Mandible (Lower Jaw)",
    latinName: "Mandibula",
    system: "skeletal",
    layer: 3,
    region: "head",
    coords: { x: 500, y: 185 },
    view: "anterior",
    category: "Viscerocranium",
    description: "Strongest, largest facial bone featuring horizontal body, alveolar process supporting lower dental arcade, and bilateral ascending rami terminating in coronoid and condylar processes.",
    function: "Articulates with temporal bone at Temporomandibular Joint (TMJ: synovial hinge and gliding joint) enabling speech articulation and mastication.",
    vascularization: "Inferior alveolar artery (from maxillary artery) running through mandibular canal, mental artery.",
    innervation: "Mandibular nerve (CN V3) via inferior alveolar nerve and mental nerve through mental foramen.",
    pathology: "Temporomandibular joint disorder (TMD), mandibular angle/condylar fracture from blunt trauma, dental abscess osteomyelitis."
  },
  {
    id: "masseter",
    name: "Masseter Muscle",
    latinName: "Musculus masseter",
    system: "muscular",
    layer: 2,
    region: "head",
    coords: { x: 460, y: 175 },
    view: "anterior",
    category: "Masticatory Muscles",
    description: "Thick quadrilateral muscle originating from zygomatic arch and inserting onto mandibular angle and lateral ramus.",
    function: "Powerful elevation and protraction of the mandible, generating up to 200 lbs of bite force on molars.",
    vascularization: "Masseteric artery (branch of maxillary artery).",
    innervation: "Masseteric nerve (branch of mandibular division CN V3).",
    pathology: "Masseteric hypertrophy from bruxism (nocturnal tooth grinding), tetanus lockjaw (trismus)."
  },
  {
    id: "thyroid_gland",
    name: "Thyroid Gland",
    latinName: "Glandula thyroidea",
    system: "endocrine",
    layer: 4,
    region: "neck",
    coords: { x: 500, y: 245 },
    view: "anterior",
    category: "Endocrine Organs",
    description: "Butterfly-shaped vascular bilobed endocrine gland draped across trachea anterior to C5-T1 vertebrae, with central connecting isthmus.",
    function: "Follicular cells synthesize Thyroxine (T4) and Triiodothyronine (T3) regulating basal metabolic rate and cellular oxygen consumption; parafollicular C-cells secrete Calcitonin (lowers blood Ca2+).",
    vascularization: "Superior thyroid artery (from external carotid) and inferior thyroid artery (from thyrocervical trunk of subclavian).",
    innervation: "Sympathetic fibers from superior, middle, and inferior cervical ganglia.",
    pathology: "Graves' disease (hyperthyroidism with TSH-receptor autoantibodies, exophthalmos), Hashimoto's thyroiditis (autoimmune hypothyroidism, elevated TSH), endemic iodine deficiency goiter."
  },
  {
    id: "carotid_artery",
    name: "Common Carotid Artery",
    latinName: "Arteria carotis communis",
    system: "circulatory",
    layer: 5,
    region: "neck",
    coords: { x: 478, y: 240 },
    view: "anterior",
    category: "Great Vessels",
    description: "Major arterial pipeline ascending within carotid sheath alongside internal jugular vein and vagus nerve. Bifurcates at C4 (superior border of thyroid cartilage) into internal and external carotid arteries.",
    function: "Transports high-pressure oxygenated blood from aortic arch (left) and brachiocephalic trunk (right) to encephalon and cranium. Carotid sinus baroreceptors regulate systemic blood pressure.",
    vascularization: "Direct aortic arch branch (left) or brachiocephalic bifurcation (right).",
    innervation: "Carotid sinus nerve (branch of Glossopharyngeal nerve CN IX) monitoring arterial stretch and pressure.",
    pathology: "Carotid artery stenosis from atherosclerotic plaque causing transient ischemic attack (TIA) or embolic stroke; carotid sinus hypersensitivity."
  },

  // --- THORAX & MEDIASTINUM ---
  {
    id: "heart",
    name: "Four-Chambered Heart",
    latinName: "Cor / Myocardium",
    system: "circulatory",
    layer: 4,
    region: "thorax",
    coords: { x: 512, y: 380 },
    view: "anterior",
    category: "Vital Viscera",
    description: "Conical hollow muscular organ nestled in middle mediastinum, tilted 2/3 to the left of sternal midline. Enclosed in fibroserous pericardial sac with pericardial cavity containing serous lubricating fluid.",
    function: "Pumps 70 mL stroke volume per beat at 60-100 bpm (~7,200 L daily). Right heart pumps deoxygenated blood to pulmonary circuit; left heart pumps oxygenated blood through aorta into high-resistance systemic circuit.",
    vascularization: "Coronary circulation: Left anterior descending (LAD - 'widowmaker'), Circumflex artery (LCx), and Right coronary artery (RCA); venous drainage via Great Cardiac Vein into Coronary Sinus.",
    innervation: "Cardiac plexus: Sympathetic accelerator fibers (T1-T4, norepinephrine via beta-1 receptors) and parasympathetic brake (Vagus nerve CN X, acetylcholine via muscarinic M2 receptors).",
    pathology: "Coronary artery disease, acute myocardial infarction (STEMI/NSTEMI with troponin release), congestive heart failure, ventricular fibrillation."
  },
  {
    id: "aorta",
    name: "Aorta & Aortic Arch",
    latinName: "Aorta & Arcus aortae",
    system: "circulatory",
    layer: 5,
    region: "thorax",
    coords: { x: 504, y: 330 },
    view: "anterior",
    category: "Great Vessels",
    description: "The primary systemic artery originating at aortic valve of left ventricle, curving superiorly and posteriorly across pulmonary trunk, giving off 3 great branches: brachiocephalic trunk, left common carotid, left subclavian.",
    function: "Distributes high-pressure pulsatile stroke volume from left ventricle (systolic 120 mmHg) to whole body; elastic Windkessel recoil maintains diastolic perfusion pressure (80 mmHg).",
    vascularization: "Nutrient vasa vasorum supplying outer adventitia and muscular media.",
    innervation: "Aortic baroreceptor afferents via Vagus nerve (CN X).",
    pathology: "Thoracic aortic aneurysm, Stanford Type A vs Type B aortic dissection (tearing intimal flap with knife-like chest pain), coarctation of aorta."
  },
  {
    id: "lungs",
    name: "Bilateral Lungs & Bronchial Tree",
    latinName: "Pulmones & Arbor bronchialis",
    system: "respiratory",
    layer: 4,
    region: "thorax",
    coords: { x: 440, y: 375 },
    view: "anterior",
    category: "Vital Viscera",
    description: "Spongy, paired cone-shaped organs occupying pleural cavities. Right lung has 3 lobes (superior, middle, inferior) divided by horizontal and oblique fissures; left lung has 2 lobes and cardiac notch.",
    function: "Exchanges O2 and CO2 across ~480 million microscopic alveoli with 100 m² surface area; synthesizes ACE (Angiotensin-Converting Enzyme) for renin-angiotensin blood pressure regulation.",
    vascularization: "Pulmonary circulation for gas exchange (pulmonary trunk -> arteries -> capillaries -> veins) and bronchial arteries (from descending aorta) supplying lung parenchyma tissue.",
    innervation: "Pulmonary plexus (Vagus nerve parasympathetic bronchoconstriction vs Sympathetic bronchodilation via beta-2 receptors).",
    pathology: "Chronic Obstructive Pulmonary Disease (COPD / Emphysema with alveolar septal destruction), Acute Respiratory Distress Syndrome (ARDS), pneumonia, asthma."
  },
  {
    id: "trachea",
    name: "Trachea & Carina",
    latinName: "Trachea & Carina tracheae",
    system: "respiratory",
    layer: 4,
    region: "thorax",
    coords: { x: 500, y: 285 },
    view: "anterior",
    category: "Airway",
    description: "Flexible, 10-12 cm fibrocartilaginous tube extending from larynx (C6) to bifurcation at carina (T4/T5), reinforced by 16-20 C-shaped hyaline cartilage rings open posteriorly where trachealis muscle lies.",
    function: "Patent conduit for respiratory airflow; ciliated pseudostratified columnar epithelium with goblet cells drives mucociliary escalator sweeping inhaled particulate matter upward toward pharynx.",
    vascularization: "Inferior thyroid arteries and bronchial arteries.",
    innervation: "Recurrent laryngeal nerves (branches of CN X) and sympathetic trunk.",
    pathology: "Tracheomalacia, foreign body aspiration (predominantly into wider, steeper right main bronchus), tracheoesophageal fistula."
  },
  {
    id: "sternum_ribs",
    name: "Sternum & Thoracic Cage",
    latinName: "Sternum & Costae (I-XII)",
    system: "skeletal",
    layer: 3,
    region: "thorax",
    coords: { x: 500, y: 360 },
    view: "anterior",
    category: "Axial Skeleton",
    description: "Osteocartilaginous cage formed by sternum (manubrium, body, xiphoid process), 12 pairs of ribs (true ribs 1-7, false ribs 8-10, floating ribs 11-12), costal cartilages, and 12 thoracic vertebrae.",
    function: "Encloses and protects heart and lungs; facilitates bucket-handle and pump-handle rib excursions during diaphragmatic and intercostal ventilation.",
    vascularization: "Internal thoracic (mammary) arteries and posterior intercostal arteries.",
    innervation: "Intercostal nerves (anterior rami of T1-T11 spinal nerves).",
    pathology: "Flail chest (paradoxical movement from multiple contiguous rib fractures), costochondritis (Tietze syndrome), sternal bone marrow biopsy site."
  },
  {
    id: "pectoralis_major",
    name: "Pectoralis Major",
    latinName: "Musculus pectoralis major",
    system: "muscular",
    layer: 2,
    region: "thorax",
    coords: { x: 440, y: 320 },
    view: "anterior",
    category: "Anterior Thoracic Musculature",
    description: "Large, fan-shaped muscle covering upper chest, possessing clavicular and sternocostal heads inserting onto lateral lip of bicipital groove of humerus.",
    function: "Powerful adduction, internal medial rotation, and flexion of the glenohumeral humerus at shoulder joint.",
    vascularization: "Pectoral branch of thoracoacromial artery and lateral thoracic artery.",
    innervation: "Medial and lateral pectoral nerves (from brachial plexus C5-T1).",
    pathology: "Pectoralis major tendon tear (common in heavy bench-press weightlifting), Poland syndrome (congenital absence)."
  },
  {
    id: "diaphragm",
    name: "Diaphragm",
    latinName: "Diaphragma thoracis",
    system: "muscular",
    layer: 4,
    region: "thorax",
    coords: { x: 500, y: 450 },
    view: "anterior",
    category: "Respiratory Musculature",
    description: "Dome-shaped musculotendinous sheet separating thoracic cavity from abdominal cavity. Has central tendon and 3 apertures: caval opening (T8), esophageal hiatus (T10), aortic hiatus (T12).",
    function: "Prime mover of inspiration; contraction flattens dome, expanding thoracic vertical dimension, creating negative intrapleural pressure (-4 to -8 mmHg) drawing air inward.",
    vascularization: "Superior and inferior phrenic arteries, musculophrenic, and pericardiophrenic arteries.",
    innervation: "Phrenic nerve (C3, C4, C5 keep the diaphragm alive!).",
    pathology: "Hiatal hernia (sliding or paraesophageal), phrenic nerve palsy causing hemidiaphragmatic elevation, diaphragmatic rupture from blunt abdominal trauma."
  },

  // --- ABDOMEN & DIGESTIVE VISCERA ---
  {
    id: "liver",
    name: "Liver (Hepatic Gland)",
    latinName: "Hepar",
    system: "digestive",
    layer: 4,
    region: "abdomen",
    coords: { x: 460, y: 510 },
    view: "anterior",
    category: "Vital Viscera",
    description: "Largest internal visceral organ (1.5 kg) occupying right hypochondrium and epigastrium. Divided into right, left, caudate, and quadrate lobes by falciform and round ligaments.",
    function: "Metabolic powerhouse: synthesizes albumin, coagulation factors (I, II, VII, IX, X), bile salts for lipid emulsification; detoxifies xenobiotics via Cytochrome P450; stores glycogen and iron.",
    vascularization: "Dual blood supply: 75% deoxygenated nutrient-rich blood from Hepatic Portal Vein, 25% oxygenated blood from Proper Hepatic Artery; drained by hepatic veins into Inferior Vena Cava.",
    innervation: "Hepatic plexus (sympathetic from celiac plexus; parasympathetic from vagus nerve).",
    pathology: "Cirrhosis with portal hypertension (esophageal varices, caput medusae, ascites), non-alcoholic steatohepatitis (NASH), hepatocellular carcinoma, viral hepatitis (HBV/HCV)."
  },
  {
    id: "stomach",
    name: "Stomach",
    latinName: "Gaster / Ventriculus",
    system: "digestive",
    layer: 4,
    region: "abdomen",
    coords: { x: 540, y: 510 },
    view: "anterior",
    category: "Alimentary Canal",
    description: "J-shaped muscular organ in left upper quadrant consisting of cardia, fundus, body, antrum, and pylorus guarded by pyloric sphincter. Inner lining contains rugal folds and gastric pits.",
    function: "Mechanical churning and chemical digestion; parietal cells secrete HCl (pH 1.5-2.0) and Intrinsic Factor (essential for Vit B12 absorption in terminal ileum); chief cells secrete pepsinogen.",
    vascularization: "Celiac trunk branches: Left and right gastric arteries (lesser curvature), left and right gastro-omental / epiploic arteries (greater curvature), short gastric arteries.",
    innervation: "Vagus nerve CN X (anterior/posterior vagal trunks increase motility and acid secretion) and celiac sympathetic plexus.",
    pathology: "Peptic ulcer disease (Helicobacter pylori infection, NSAID toxicity), pernicious anemia from lack of intrinsic factor, gastric adenocarcinoma, GERD."
  },
  {
    id: "pancreas",
    name: "Pancreas",
    latinName: "Pancreas",
    system: "endocrine",
    layer: 4,
    region: "abdomen",
    coords: { x: 510, y: 550 },
    view: "anterior",
    category: "Accessory Digestive / Endocrine",
    description: "Retroperitoneal elongated lobular gland tucked in C-loop of duodenum, divided into head, uncinate process, body, and tail abutting spleen. Contains duct of Wirsung merging with common bile duct at ampulla of Vater.",
    function: "Dual gland: Exocrine acinar cells secrete 1.5 L/day pancreatic juice (bicarbonate, trypsinogen, amylase, lipase); Endocrine Islets of Langerhans secrete insulin (beta cells, anabolic) and glucagon (alpha cells, catabolic).",
    vascularization: "Splenic artery, superior mesenteric artery (inferior pancreaticoduodenal), and gastroduodenal artery (superior pancreaticoduodenal).",
    innervation: "Celiac and superior mesenteric plexuses; vagal parasympathetic stimulation promotes enzyme exocytosis.",
    pathology: "Acute pancreatitis (gallstones or alcohol autodigestion), Type 1 and Type 2 diabetes mellitus, pancreatic ductal adenocarcinoma (poor prognosis)."
  },
  {
    id: "gallbladder",
    name: "Gallbladder & Biliary Tree",
    latinName: "Vesica biliaris & Ductus choledochus",
    system: "digestive",
    layer: 4,
    region: "abdomen",
    coords: { x: 445, y: 550 },
    view: "anterior",
    category: "Accessory Digestive",
    description: "Pear-shaped hollow muscular sac nestled on visceral undersurface of right liver lobe. Drains via cystic duct which joins common hepatic duct to form common bile duct (choledochus).",
    function: "Stores and concentrates 30-50 mL of hepatic bile; contracts upon CCK (cholecystokinin) release induced by duodenal fatty chyme, ejecting bile through sphincter of Oddi to emulsify dietary lipids.",
    vascularization: "Cystic artery (originating from right hepatic artery within Calot's triangle).",
    innervation: "Celiac plexus and right phrenic nerve (referred pain to right shoulder tip / scapula - Boas sign).",
    pathology: "Cholelithiasis (cholesterol vs pigmented gallstones), acute cholecystitis with positive Murphy sign, ascending cholangitis (Charcot triad: fever, jaundice, RUQ pain)."
  },
  {
    id: "spleen",
    name: "Spleen",
    latinName: "Splen / Lien",
    system: "lymphatic",
    layer: 4,
    region: "abdomen",
    coords: { x: 580, y: 520 },
    view: "anterior",
    category: "Lymphoid Organs",
    description: "Fist-sized purplish encapsulated secondary lymphoid organ in left hypochondrium protected by ribs 9-11. Contains red pulp (sinusoids and cords of Billroth) and white pulp (PALS and lymphoid follicles).",
    function: "Red pulp filters senescent erythrocytes and recycles iron; white pulp mounts adaptive humoral and cell-mediated immune responses against blood-borne pathogens (encapsulated bacteria: Strep pneumoniae, H. influenzae).",
    vascularization: "Splenic artery (tortuous branch of celiac trunk); drained by splenic vein into hepatic portal vein.",
    innervation: "Splenic plexus derived from celiac ganglion.",
    pathology: "Splenic rupture following blunt abdominal trauma (Kehr sign left shoulder pain, risk of catastrophic hemoperitoneum), splenomegaly from portal hypertension or mononucleosis (EBV)."
  },
  {
    id: "kidneys",
    name: "Bilateral Kidneys & Adrenals",
    latinName: "Renes & Glandulae suprarenales",
    system: "urinary",
    layer: 4,
    region: "abdomen",
    coords: { x: 440, y: 610 },
    view: "posterior",
    category: "Vital Viscera",
    description: "Bean-shaped retroperitoneal organs flanking vertebral column (T12-L3). Right kidney sits 1-2 cm lower due to liver. Encapsulated by renal fascia (Gerota's) and perirenal fat pad. Topped by adrenal glands.",
    function: "Filters 180 L/day plasma; regulates arterial blood pressure via Renin-Angiotensin-Aldosterone System (RAAS); produces Erythropoietin (EPO) for RBC stimulation; activates Calcitriol (1,25-OH2 Vit D3); eliminates urea.",
    vascularization: "Renal arteries (arising directly from abdominal aorta at L1-L2, receiving 20-25% of cardiac output); drained via renal veins into Inferior Vena Cava (left renal vein crosses aorta under SMA).",
    innervation: "Renal plexus (sympathetic vasoconstriction reduces GFR and stimulates renin release from juxtaglomerular apparatus).",
    pathology: "Chronic Kidney Disease (CKD / Uremia), Acute Tubular Necrosis (ATN), nephrolithiasis (calcium oxalate kidney stones with ureteric colic), glomerulonephritis, renal cell carcinoma."
  },
  {
    id: "small_intestine",
    name: "Small Intestine (Duodenum, Jejunum, Ileum)",
    latinName: "Intestinum tenue",
    system: "digestive",
    layer: 4,
    region: "abdomen",
    coords: { x: 500, y: 680 },
    view: "anterior",
    category: "Alimentary Canal",
    description: "Convoluted 6-meter tubular tract extending from pylorus to ileocecal junction: Duodenum (25 cm C-loop), Jejunum (~2.5 m with tall plicae circulares), Ileum (~3.5 m with aggregated Peyer's patches).",
    function: "Primary site of enzymatic digestion and 90% of nutrient absorption; enterocytes possess luminal microvilli forming brush border (lactase, sucrase, peptidases) yielding ~250 m² absorptive area.",
    vascularization: "Superior mesenteric artery (SMA) branching into extensive jejunal and ileal arterial arcades and vasa recta.",
    innervation: "Enteric nervous system (Myenteric plexus of Auerbach controlling peristalsis, Submucosal plexus of Meissner controlling secretions), modulated by vagus nerve.",
    pathology: "Celiac disease (autoimmune gluten-sensitive enteropathy with villous blunting), Crohn's disease (transmural skip lesions), paralytic ileus, mesenteric ischemia."
  },
  {
    id: "large_intestine",
    name: "Large Intestine & Colon",
    latinName: "Intestinum crassum & Colon",
    system: "digestive",
    layer: 4,
    region: "abdomen",
    coords: { x: 500, y: 730 },
    view: "anterior",
    category: "Alimentary Canal",
    description: "1.5-meter framed arch comprising Cecum, Appendix, Ascending, Transverse, Descending, and Sigmoid Colon. Characterized by 3 longitudinal muscular bands (taeniae coli), sacculations (haustra), and epiploic appendices.",
    function: "Reabsorbs water (1.5 L/day) and electrolytes from liquid chyme, condensing into feces; harbors 100 trillion commensal gut microbiota synthesizing Vitamin K and biotin; stores waste in rectum prior to defecation.",
    vascularization: "Superior mesenteric artery (cecum, ascending colon, proximal 2/3 transverse colon) and Inferior mesenteric artery (distal 1/3 transverse colon, descending colon, sigmoid colon, rectum).",
    innervation: "Autonomic: Parasympathetic from Vagus nerve (proximal) and Pelvic splanchnic nerves S2-S4 (distal colon); sympathetic from lumbar splanchnic nerves.",
    pathology: "Acute appendicitis with McBurney point tenderness, Colorectal adenocarcinoma (screening colonoscopy for adenomatous polyps), Ulcerative colitis, Diverticulosis/Diverticulitis."
  },
  {
    id: "rectus_abdominis",
    name: "Rectus Abdominis ('Abs')",
    latinName: "Musculus rectus abdominis",
    system: "muscular",
    layer: 2,
    region: "abdomen",
    coords: { x: 515, y: 620 },
    view: "anterior",
    category: "Anterior Abdominal Wall",
    description: "Paired long vertical strap muscles separated by linea alba, intersected by 3-4 transverse fibrous tendinous intersections ('six-pack'). Enclosed within the rectus sheath.",
    function: "Flexes vertebral column (lumbar spine), compresses abdominal viscera for forced expiration, defecation, micturition, and parturition; stabilizes pelvis during gait.",
    vascularization: "Superior epigastric artery (from internal thoracic) and inferior epigastric artery (from external iliac), which anastomose within rectus sheath.",
    innervation: "Thoracoabdominal intercostal nerves T7-T11 and subcostal nerve T12.",
    pathology: "Diastasis recti (separation of rectus muscles following pregnancy or obesity), rectus sheath hematoma."
  },

  // --- PELVIS & PERINEUM ---
  {
    id: "urinary_bladder",
    name: "Urinary Bladder",
    latinName: "Vesica urinaria",
    system: "urinary",
    layer: 4,
    region: "pelvis",
    coords: { x: 500, y: 840 },
    view: "anterior",
    category: "Pelvic Viscera",
    description: "Subperitoneal distensible muscular reservoir in anterior pelvic cavity behind pubic symphysis. Contains smooth triangular trigone defined by two ureteric orifices and internal urethral orifice.",
    function: "Stores 400-600 mL urine; micturition reflex triggered at ~200 mL stretch, coordinated by parasympathetic detrusor muscle contraction and somatic external urethral sphincter relaxation.",
    vascularization: "Superior and inferior vesical arteries (branches of internal iliac artery).",
    innervation: "Pelvic splanchnic nerves (S2-S4 parasympathetic detrusor contraction), Hypogastric plexus (sympathetic bladder neck closure), Pudendal nerve (S2-S4 somatic external sphincter).",
    pathology: "Cystitis / Urinary Tract Infection (UTI, predominantly E. coli), neurogenic bladder, urinary incontinence, transitional cell carcinoma of the bladder."
  },
  {
    id: "pelvis_os_coxae",
    name: "Pelvic Girdle & Os Coxae",
    latinName: "Pelvis & Os coxae",
    system: "skeletal",
    layer: 3,
    region: "pelvis",
    coords: { x: 500, y: 810 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Bony basin formed by sacrum, coccyx, and paired hip bones (os coxae), each fusing during adolescence from three ossification centers: ilium (iliac crest), ischium (ischial tuberosity), and pubis.",
    function: "Transfers weight of axial body skeleton to lower limbs; provides deep acetabular socket for femoral head hip joint; shelters pelvic organs and forms birth canal in biological females.",
    vascularization: "Internal and external iliac arteries, superior and inferior gluteal arteries, obturator artery.",
    innervation: "Lumbar plexus (L1-L4) and Sacral plexus (L4-S4).",
    pathology: "Pelvic ring fractures from high-energy polytrauma (open-book pelvic fracture with life-threatening retroperitoneal hemorrhage), avascular necrosis of femoral head."
  },

  // --- UPPER EXTREMITIES ---
  {
    id: "clavicle_scapula",
    name: "Pectoral Girdle (Clavicle & Scapula)",
    latinName: "Cingulum pectorale (Clavicula & Scapula)",
    system: "skeletal",
    layer: 3,
    region: "upper_limb",
    coords: { x: 400, y: 260 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "S-shaped clavicle connecting sternum at sternoclavicular joint (only true bony articulation of arm to axial skeleton) to triangular scapula at acromioclavicular (AC) joint.",
    function: "Struts shoulder joint laterally away from trunk, maximizing three-dimensional arm mobility and circumduction; glenoid cavity provides socket for humerus head.",
    vascularization: "Suprascapular artery, transverse cervical artery, subscapular artery forming peri-scapular anastomotic network.",
    innervation: "Supraclavicular nerves (C3-C4), nerve to subclavius, suprascapular nerve.",
    pathology: "Clavicular fracture (most common broken bone, middle third), AC joint separation ('shoulder separation'), rotator cuff impingement syndrome."
  },
  {
    id: "deltoid",
    name: "Deltoid Muscle",
    latinName: "Musculus deltoideus",
    system: "muscular",
    layer: 2,
    region: "upper_limb",
    coords: { x: 370, y: 310 },
    view: "anterior",
    category: "Shoulder Musculature",
    description: "Large triangular muscle caps the shoulder joint, possessing anterior (clavicular), lateral (acromial), and posterior (spinal) fiber bundles converging on deltoid tuberosity of humerus.",
    function: "Prime abductor of the arm from 15° to 90° (first 15° initiated by supraspinatus); anterior fibers flex and medially rotate; posterior fibers extend and laterally rotate arm.",
    vascularization: "Posterior circumflex humeral artery and deltoid branch of thoracoacromial artery.",
    innervation: "Axillary nerve (C5, C6) winding around surgical neck of humerus.",
    pathology: "Axillary nerve injury from anterior shoulder dislocation or surgical neck humerus fracture (loss of shoulder abduction and lateral shoulder cutaneous sensation)."
  },
  {
    id: "biceps_brachii",
    name: "Biceps Brachii",
    latinName: "Musculus biceps brachii",
    system: "muscular",
    layer: 2,
    region: "upper_limb",
    coords: { x: 345, y: 395 },
    view: "anterior",
    category: "Arm Musculature",
    description: "Two-headed muscle on anterior arm: long head originates from supraglenoid tubercle of scapula traversing bicipital groove; short head originates from coracoid process. Inserts onto radial tuberosity.",
    function: "Most powerful supinator of forearm when elbow is flexed; strong flexor of the forearm at elbow joint and accessory flexor of glenohumeral shoulder.",
    vascularization: "Muscular branches of Brachial artery.",
    innervation: "Musculocutaneous nerve (C5, C6, C7), continuing distally as lateral antebrachial cutaneous nerve.",
    pathology: "Proximal long head biceps tendon rupture ('Popeye deformity'), distal biceps tendon avulsion from heavy eccentric loading."
  },
  {
    id: "humerus",
    name: "Humerus (Arm Bone)",
    latinName: "Humerus",
    system: "skeletal",
    layer: 3,
    region: "upper_limb",
    coords: { x: 345, y: 395 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Longest, largest bone of upper extremity. Features rounded proximal head, anatomical/surgical necks, greater/lesser tubercles, spiral radial groove, and distal trochlea and capitulum.",
    function: "Serves as rigid lever arm for upper body pushing, pulling, lifting; articulates with glenoid cavity proximally and radius/ulna distally at elbow joint.",
    vascularization: "Anterior and posterior circumflex humeral arteries, profunda brachii (deep brachial) artery, nutrient artery.",
    innervation: "Axillary nerve, radial nerve (in spiral groove), median and ulnar nerves course along its shaft.",
    pathology: "Mid-shaft humeral fracture injuring radial nerve (causing 'wrist drop' due to denervation of forearm extensors)."
  },
  {
    id: "forearm_radius_ulna",
    name: "Radius & Ulna (Forearm Bones)",
    latinName: "Radius & Ulna",
    system: "skeletal",
    layer: 3,
    region: "upper_limb",
    coords: { x: 285, y: 520 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Paired forearm bones joined by syndesmotic interosseous membrane. Radius (lateral) has disc-shaped head and styloid process; Ulna (medial) has hook-like olecranon and coronoid process.",
    function: "Ulna provides stable hinge articulation with humerus; radius rotates over stationary ulna at proximal and distal radioulnar joints during pronation and supination.",
    vascularization: "Radial and ulnar arteries, anterior and posterior interosseous arteries.",
    innervation: "Median nerve (via anterior interosseous), Radial nerve (via posterior interosseous), and Ulnar nerve.",
    pathology: "Colles' fracture of distal radius ('dinner fork deformity' from fall on outstretched hand), Monteggia and Galeazzi fracture-dislocations."
  },
  {
    id: "hand_carpals",
    name: "Carpals, Metacarpals, & Phalanges",
    latinName: "Ossa carpi, metacarpi & phalanges",
    system: "skeletal",
    layer: 3,
    region: "upper_limb",
    coords: { x: 235, y: 640 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Complex manipulator comprising 8 carpal bones in 2 rows (Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate), 5 metacarpals, and 14 phalanges (thumb has 2, fingers have 3).",
    function: "Precision grip and power grasp; opposable thumb enables high-dexterity tool use and fine motor control unique to hominids.",
    vascularization: "Deep and superficial palmar arterial arches formed by terminal radial and ulnar anastomoses.",
    innervation: "Median nerve (recurrent motor to thenar muscles, sensory to lateral 3.5 digits), Ulnar nerve (hypothenar, interossei, medial 1.5 digits), Radial nerve (dorsal webspace).",
    pathology: "Carpal Tunnel Syndrome (median nerve compression beneath flexor retinaculum), Scaphoid fracture with avascular necrosis risk, Boxer's fracture (5th metacarpal neck)."
  },

  // --- LOWER EXTREMITIES ---
  {
    id: "gluteus_maximus",
    name: "Gluteus Maximus",
    latinName: "Musculus gluteus maximus",
    system: "muscular",
    layer: 2,
    region: "lower_limb",
    coords: { x: 500, y: 880 },
    view: "posterior",
    category: "Gluteal Musculature",
    description: "Largest, heaviest, most powerful muscle in the human body, forming prominent cheek of the buttock. Originates from ilium, sacrum, coccyx; inserts into iliotibial (IT) tract and gluteal tuberosity of femur.",
    function: "Chief extensor and lateral rotator of hip joint; critical for climbing stairs, standing up from sitting, sprinting, and maintaining upright bipedal posture.",
    vascularization: "Superior and inferior gluteal arteries (branches of internal iliac).",
    innervation: "Inferior gluteal nerve (L5, S1, S2).",
    pathology: "Gluteal muscle atrophy from prolonged sedentary immobilization, sciatic nerve compression beneath piriformis muscle (Piriformis syndrome)."
  },
  {
    id: "quadriceps_femoris",
    name: "Quadriceps Femoris",
    latinName: "Musculus quadriceps femoris",
    system: "muscular",
    layer: 2,
    region: "lower_limb",
    coords: { x: 440, y: 1040 },
    view: "anterior",
    category: "Anterior Thigh Musculature",
    description: "Massive four-headed muscle group: Rectus femoris (crosses hip and knee), Vastus lateralis, Vastus medialis, and Vastus intermedius. Converges into quadriceps tendon embedding patella.",
    function: "Great extensor of the knee joint essential for walking, running, jumping; rectus femoris also flexes the thigh at the hip joint.",
    vascularization: "Femoral artery and lateral circumflex femoral artery.",
    innervation: "Femoral nerve (L2, L3, L4); tested clinically via patellar deep tendon reflex ('knee jerk').",
    pathology: "Quadriceps tendon rupture, patellofemoral pain syndrome ('runner's knee'), vastus medialis oblique (VMO) weakness leading to patellar maltracking."
  },
  {
    id: "femur",
    name: "Femur (Thigh Bone)",
    latinName: "Femur / Os femoris",
    system: "skeletal",
    layer: 3,
    region: "lower_limb",
    coords: { x: 440, y: 1040 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Longest, heaviest, strongest bone in the human body (~26% of stature). Possesses spherical head, femoral neck angled at 126° (angle of inclination), greater/lesser trochanters, shaft, and distal medial/lateral condyles.",
    function: "Transmits all body weight from pelvic acetabulum to tibia; resists bending loads exceeding 2,500 lbs during sprinting.",
    vascularization: "Medial and lateral circumflex femoral arteries (supplying femoral head and neck via retinacular vessels), deep artery of the thigh (profunda femoris).",
    innervation: "Femoral and sciatic nerve branches.",
    pathology: "Femoral neck fracture in osteoporotic elderly (frequently causing avascular necrosis of femoral head), high-impact femoral shaft fracture (risk of 1-1.5 L internal hemorrhage and fat embolism)."
  },
  {
    id: "patella_knee",
    name: "Patella & Knee Joint",
    latinName: "Patella & Articulatio genus",
    system: "skeletal",
    layer: 3,
    region: "lower_limb",
    coords: { x: 435, y: 1220 },
    view: "anterior",
    category: "Joints & Sesamoidea",
    description: "Largest sesamoid bone in body embedded within quadriceps/patellar tendon. Articulates with femoral trochlea, cushioned by medial and lateral fibrocartilage menisci and stabilized by ACL, PCL, MCL, LCL.",
    function: "Increases mechanical moment arm leverage of quadriceps tendon by 30-50% during knee extension; protects anterior knee joint.",
    vascularization: "Genicular arterial anastomotic network (five branches from popliteal artery).",
    innervation: "Branches of femoral, tibial, and common fibular nerves (Hilton's law).",
    pathology: "Anterior Cruciate Ligament (ACL) tear (positive Lachman test), Meniscal tears (McMurray test), patellar dislocation (usually lateral), osteoarthritis."
  },
  {
    id: "tibia_fibula",
    name: "Tibia & Fibula (Leg Bones)",
    latinName: "Tibia & Fibula",
    system: "skeletal",
    layer: 3,
    region: "lower_limb",
    coords: { x: 430, y: 1380 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Tibia ('shin bone') is primary weight-bearing medial bone with expanded tibial plateau and medial malleolus. Fibula is slender lateral bone with proximal head and lateral malleolus anchoring ankle mortise.",
    function: "Tibia bears 90% of compressive axial body weight; fibula serves as non-weight-bearing strut for muscle attachments and stabilizes talocrural ankle joint.",
    vascularization: "Anterior tibial artery, posterior tibial artery, fibular (peroneal) artery.",
    innervation: "Tibial nerve, common fibular (peroneal) nerve winding around fibular neck.",
    pathology: "Common fibular nerve palsy from fibular neck trauma (causes 'foot drop' and loss of dorsal foot sensation), tibial stress fractures, compartment syndrome."
  },
  {
    id: "gastrocnemius_achilles",
    name: "Gastrocnemius & Achilles Tendon",
    latinName: "Musculus gastrocnemius & Tendo calcaneus",
    system: "muscular",
    layer: 2,
    region: "lower_limb",
    coords: { x: 430, y: 1380 },
    view: "posterior",
    category: "Posterior Leg Musculature",
    description: "Two-headed superficial calf muscle (medial and lateral heads originating from femoral condyles) joining soleus to form Triceps Surae, converging into thick Calcaneal (Achilles) tendon inserting onto calcaneus.",
    function: "Powerful plantarflexion of the foot at ankle joint, generating propulsive lift during walking, jumping, and running; also aids knee flexion.",
    vascularization: "Sural arteries (branches of popliteal artery) and posterior tibial artery.",
    innervation: "Tibial nerve (S1, S2); tested via Achilles tendon reflex.",
    pathology: "Achilles tendon rupture (often with audible 'pop' during sudden acceleration; positive Thompson squeeze test), deep vein thrombosis (DVT) in soleal veins with risk of fatal pulmonary embolism."
  },
  {
    id: "foot_tarsals",
    name: "Tarsals, Metatarsals, & Arches",
    latinName: "Ossa tarsi, metatarsi & phalanges",
    system: "skeletal",
    layer: 3,
    region: "lower_limb",
    coords: { x: 420, y: 1580 },
    view: "anterior",
    category: "Appendicular Skeleton",
    description: "Architectural complex of 7 tarsal bones (Talus, Calcaneus heel bone, Navicular, Cuboid, 3 Cuneiforms), 5 metatarsals, and 14 phalanges, supported by plantar fascia and medial/lateral longitudinal and transverse arches.",
    function: "Acts as flexible shock absorber during heel strike and rigid lever arm for push-off toe propulsion; distributes weight across bipedal support triangle.",
    vascularization: "Dorsalis pedis artery (palpable between 1st and 2nd metatarsal bases) and medial/lateral plantar arteries.",
    innervation: "Deep fibular nerve (webspace), Superficial fibular nerve (dorsum), Medial and lateral plantar nerves (sole).",
    pathology: "Plantar fasciitis (heel spur and morning plantar stabbing pain), Morton's neuroma, flat feet (pes planus) from tibialis posterior tendon dysfunction, diabetic neuropathic foot ulcers."
  }
];

/**
 * 6 Microscopic / Histological Interactive Simulation Models
 * Provides deep architectural diagrams, mathematical mechanics, and physiological parameters.
 */
export const HISTOLOGY_SIMULATION_MODELS = {
  cardiac_cycle: {
    id: "cardiac_cycle",
    title: "Cardiac Cycle & Electrical Conduction System",
    latinTitle: "Cardiologia & Systema conducens cordis",
    system: "circulatory",
    summary: "Integrated electro-mechanical simulation of the mammalian four-chambered heart: Sinoatrial (SA) node pacemaker rhythm, AV nodal delay (0.12 s), His-Purkinje ventricular depolarization, synchronized ECG trace, and acoustic valve closures (S1 lub / S2 dub).",
    keyParameters: [
      { name: "Heart Rate (HR)", value: "72 bpm", normal: "60 - 100 bpm", formula: "f = 1 / \\text{RR interval}" },
      { name: "Stroke Volume (SV)", value: "70 mL", normal: "60 - 80 mL", formula: "SV = EDV - ESV" },
      { name: "Cardiac Output (CO)", value: "5.04 L/min", normal: "4.0 - 8.0 L/min", formula: "CO = HR \\times SV" },
      { name: "Ejection Fraction (EF)", value: "58%", normal: "55 - 70%", formula: "EF = (SV / EDV) \\times 100\\%" }
    ],
    ecgPhases: [
      { wave: "P Wave", duration: "80 ms", event: "Atrial depolarization initiated by SA Node firing" },
      { wave: "PR Segment", duration: "120 ms", event: "AV Nodal physiological conduction delay allowing complete atrial emptying" },
      { wave: "QRS Complex", duration: "90 ms", event: "Rapid ventricular depolarization via Bundle of His and Purkinje fibers; Tricuspid/Mitral closure (S1 'lub')" },
      { wave: "ST Segment", duration: "100 ms", event: "Ventricular plateau phase (isoelectric); Ca2+ influx through L-type channels sustains contraction" },
      { wave: "T Wave", duration: "160 ms", event: "Ventricular repolarization via K+ efflux; Aortic/Pulmonary semilunar valve closure (S2 'dub')" }
    ],
    pathologies: [
      "Atrial Fibrillation (chaotic irregularly irregular rhythm without distinct P waves)",
      "ST-Elevation Myocardial Infarction (STEMI transmural ischemia)",
      "Complete Third-Degree AV Block (AV dissociation requiring electronic pacemaker)"
    ]
  },

  nephron_countercurrent: {
    id: "nephron_countercurrent",
    title: "Nephron & Glomerular Countercurrent Multiplier",
    latinTitle: "Nephron & Systema multiplicans contracurrens",
    system: "urinary",
    summary: "Microscopic functional unit of renal plasma purification: Fenestrated glomerular filtration barrier, PCT obligatory reabsorption, hairpin Loop of Henle countercurrent hyperosmotic medullary gradient (300 to 1200 mOsm/L), and ADH/Aquaporin-2 regulated collecting duct water recovery.",
    keyParameters: [
      { name: "Glomerular Filtration Rate (GFR)", value: "125 mL/min", normal: "90 - 130 mL/min", formula: "NFP = P_{GC} - \\pi_{GC} - P_{BS} \\approx 10\\text{ mmHg}" },
      { name: "Daily Primary Filtrate", value: "180 Liters", normal: "150 - 180 L", formula: "V_{filt} = GFR \\times 1440\\text{ min}" },
      { name: "Daily Urine Volume", value: "1.5 Liters", normal: "1.0 - 2.0 L", formula: ">99\\% \\text{ reabsorbed}" },
      { name: "Corticomedullary Osmolality", value: "300 -> 1200 mOsm/kg", normal: "Hypertonic medulla", formula: "\\Delta \\text{Osm} = 900\\text{ mOsm/kg}" }
    ],
    segments: [
      { name: "Bowman's Capsule & Glomerulus", mechanism: "Ultrafiltration of blood across podocyte pedicel slit diaphragms (proteins > 68 kDa retained)" },
      { name: "Proximal Convoluted Tubule (PCT)", mechanism: "65% Na+, H2O, 100% glucose and amino acids reabsorbed via SGLT2 and Na+/K+ ATPase" },
      { name: "Descending Thin Limb of Henle", mechanism: "Highly permeable to H2O via AQP1; impermeable to solutes; luminal fluid concentrates to 1200 mOsm/L" },
      { name: "Ascending Thick Limb of Henle", mechanism: "Active solute extrusion via Na+-K+-2Cl- (NKCC2) cotransporter; impermeable to water; dilutes luminal fluid" },
      { name: "Collecting Duct", mechanism: "Antidiuretic Hormone (ADH / Vasopressin) triggers Aquaporin-2 vesicle translocation, producing hypertonic urine" }
    ],
    pathologies: [
      "Diabetic Nephropathy (glomerulosclerosis, hyperfiltration, microalbuminuria)",
      "Diabetes Insipidus (central lack of ADH or nephrogenic resistance yielding dilute polyuria >10 L/day)",
      "Acute Tubular Necrosis (ischemic or nephrotoxic injury to proximal tubule epithelium)"
    ]
  },

  neuron_synapse: {
    id: "neuron_synapse",
    title: "Neuron Action Potential & Chemical Synapse",
    latinTitle: "Neuronum & Synapsis biochemica",
    system: "nervous",
    summary: "Electrophysiological axon propagation and chemical neurotransmission: Resting membrane potential (-70 mV via 3Na+/2K+ pump), threshold all-or-none depolarization (+30 mV via voltage-gated Na+ influx), repolarization (K+ efflux), presynaptic Ca2+ triggered SNARE exocytosis of neurotransmitter across 20 nm synaptic cleft.",
    keyParameters: [
      { name: "Resting Membrane Potential (Em)", value: "-70 mV", normal: "-65 to -75 mV", formula: "E_{ion} = \\frac{RT}{zF} \\ln \\frac{[ion]_{out}}{[ion]_{in}}" },
      { name: "Threshold Potential", value: "-55 mV", normal: "-55 mV", formula: "\\text{All-or-None Trigger}" },
      { name: "Conduction Velocity (Myelinated)", value: "100 m/s", normal: "Saltatory Node of Ranvier", formula: "v \\propto d_{\\text{axon}}" },
      { name: "Synaptic Cleft Width", value: "20 nm", normal: "20 - 30 nm", formula: "\\text{Diffusion delay } \\sim 0.5\\text{ ms}" }
    ],
    actionPotentialPhases: [
      { phase: "1. Resting State", state: "-70 mV: Leaky K+ channels open, Na+/K+ pump maintains steep chemical gradients" },
      { phase: "2. Depolarization", state: "-55 mV to +30 mV: Voltage-gated Na+ channels snap open, explosive Na+ influx" },
      { phase: "3. Repolarization", state: "+30 mV to -70 mV: Na+ channels inactivate, delayed voltage-gated K+ channels open with rapid K+ efflux" },
      { phase: "4. Hyperpolarization", state: "-85 mV: Slow K+ channel closure creates refractory period preventing backward impulse propagation" },
      { phase: "5. Synaptic Exocytosis", state: "Terminal Ca2+ influx stimulates synaptotagmin/SNARE complex; acetylcholine/glutamate vesicle fusion" }
    ],
    pathologies: [
      "Multiple Sclerosis (autoimmune demyelination of CNS axons slowing conduction velocity)",
      "Myasthenia Gravis (autoantibodies against postsynaptic nicotinic ACh receptors causing muscle fatigability)",
      "Parkinson's Disease (degeneration of dopaminergic neurons in substantia nigra pars compacta)"
    ]
  },

  alveolar_gas_exchange: {
    id: "alveolar_gas_exchange",
    title: "Alveolar-Capillary Blood-Air Diffusion Barrier",
    latinTitle: "Alveoli pulmonales & Diffusio gasorum",
    system: "respiratory",
    summary: "Diffusion of O2 and CO2 across the ultra-thin 0.2-0.5 µm respiratory membrane between alveolar air space and pulmonary capillaries, governed by Fick's Law of Diffusion, Dalton's law of partial pressures, and surfactant surface tension mechanics (Laplace's Law).",
    keyParameters: [
      { name: "Alveolar PO2 (PAO2)", value: "104 mmHg", normal: "100 - 105 mmHg", formula: "P_A O_2 = (P_{atm} - P_{H_2O}) F_I O_2 - \\frac{P_A CO_2}{R}" },
      { name: "Venous Capillary PO2 (PvO2)", value: "40 mmHg", normal: "38 - 42 mmHg", formula: "\\Delta P_{O_2} = 64\\text{ mmHg gradient}" },
      { name: "Blood-Gas Barrier Thickness", value: "0.3 µm", normal: "0.2 - 0.5 µm", formula: "\\dot{V}_{gas} \\propto \\frac{A \\times D \\times \\Delta P}{T}" },
      { name: "Capillary Transit Time", value: "0.75 seconds", normal: "Equilibration in 0.25 s", formula: "3\\times \\text{ safety reserve}" }
    ],
    histologyLayers: [
      { layer: "1. Pulmonary Surfactant Layer", cell: "Secreted by Type II Pneumocytes (dipalmitoylphosphatidylcholine); lowers surface tension, prevents atelectasis" },
      { layer: "2. Alveolar Type I Squamous Epithelium", cell: "Extremely attenuated cytoplasm forming 95% of alveolar surface area" },
      { layer: "3. Fused Basal Laminae", cell: "Extracellular matrix fusing alveolar epithelial and capillary endothelial basement membranes" },
      { layer: "4. Capillary Endothelium", cell: "Continuous non-fenestrated squamous endothelium lining pulmonary capillary" },
      { layer: "5. Erythrocyte Plasma Membrane", cell: "Biconcave disc containing 270 million Hemoglobin tetramers (Hb binds 4 O2 cooperatively)" }
    ],
    pathologies: [
      "Idiopathic Pulmonary Fibrosis (thickening of alveolar interstitium, severely retarding O2 diffusion)",
      "Infant Respiratory Distress Syndrome (NRDS in premature infants lacking surfactant, causing alveolar collapse)",
      "Pulmonary Embolism (thrombus occluding pulmonary arterial branch, creating dead-space ventilation V/Q mismatch)"
    ]
  },

  osteon_haversian: {
    id: "osteon_haversian",
    title: "Compact Bone Osteon & Haversian Canal Architecture",
    latinTitle: "Osteonum & Canalis centralis (Haversi)",
    system: "skeletal",
    summary: "Cylindrical structural unit of compact cortical bone (osteon / Haversian system): Concentric lamellae of mineralized type I collagen matrix and hydroxyapatite crystals, housing osteocytes in lacunae connected by dendritic canaliculi radiating around central neurovascular canal.",
    keyParameters: [
      { name: "Osteon Diameter", value: "200 - 300 µm", normal: "200 - 300 µm", formula: "Diffusion limit of canaliculi" },
      { name: "Lamellae per Osteon", value: "4 - 20 rings", normal: "Concentric lamellae", formula: "\\text{Alternating collagen orientation}" },
      { name: "Mineral Composition", value: "65% Hydroxyapatite", normal: "Ca10(PO4)6(OH)2", formula: "\\text{Compressive strength}" },
      { name: "Organic Composition", value: "35% Osteoid", normal: "Type I Collagen", formula: "\\text{Tensile flexibility}" }
    ],
    features: [
      { feature: "Haversian (Central) Canal", role: "Longitudinal conduit carrying neurovascular bundle (arterioles, venules, unmyelinated nerves)" },
      { feature: "Volkmann (Perforating) Canals", role: "Transverse vascular channels linking periosteum with Haversian canals and medullary cavity" },
      { feature: "Concentric Lamellae", role: "Concentric cylinders of calcified matrix with collagen fibers alternating 90° between rings to resist torsional shear" },
      { feature: "Osteocytes in Lacunae", role: "Mature bone mechanosensory cells sensing micro-strain, coordinating remodeling via sclerostin signaling" },
      { feature: "Canaliculi", role: "Microscopic tunnels transmitting osteocyte dendritic gap junctions and interstitial fluid flow" }
    ],
    pathologies: [
      "Osteoporosis (osteoclast bone resorption outpaces osteoblast formation, thinning cortical bone and trabeculae)",
      "Osteomalacia / Rickets (impaired mineralization of osteoid matrix due to Vitamin D or phosphate deficiency)",
      "Osteomyelitis (bacterial infection of bone cortex and marrow, most commonly Staphylococcus aureus)"
    ]
  },

  sarcomere_sliding: {
    id: "sarcomere_sliding",
    title: "Myofibril Sarcomere & Sliding Filament Mechanism",
    latinTitle: "Sarcomerum & Theoria filamenti labentis",
    system: "muscular",
    summary: "Fundamental repeating contractile unit of striated skeletal muscle (Z-disc to Z-disc): Interdigitating actin thin filaments (with regulatory troponin-tropomyosin complex) and myosin thick filaments with ATP-driven cross-bridge cycling activated by sarcoplasmic reticulum Ca2+ release.",
    keyParameters: [
      { name: "Resting Sarcomere Length", value: "2.2 µm", normal: "2.0 - 2.4 µm", formula: "\\text{Optimal cross-bridge overlap}" },
      { name: "Shortened Sarcomere Length", value: "1.6 µm", normal: "Maximum contraction", formula: "\\text{Z-discs approach}" },
      { name: "Thin Filament Composition", value: "F-Actin + Troponin + Tropomyosin", normal: "1 µm length", formula: "Ca^{2+} \\text{ binds Troponin C}" },
      { name: "Thick Filament Composition", value: "~300 Myosin II molecules", normal: "1.6 µm length", formula: "\\text{Bipolar head orientation}" }
    ],
    crossBridgeCycle: [
      { step: "1. ATP Hydrolysis", detail: "Myosin head hydrolyzes ATP into ADP + Pi, cocking into high-energy perpendicular 90° state" },
      { step: "2. Ca2+ Trigger", detail: "Action potential releases Ca2+ from sarcoplasmic reticulum; Ca2+ binds Troponin C, pulling tropomyosin away from actin binding sites" },
      { step: "3. Cross-Bridge Formation", detail: "Cocked myosin head binds firmly to uncovered actin binding site" },
      { step: "4. Power Stroke", detail: "Pi is released; myosin head pivots to 45°, pulling actin thin filament 10 nm toward center of sarcomere (M-line); ADP is discharged" },
      { step: "5. Cross-Bridge Detachment", detail: "New ATP molecule binds myosin head, causing instantaneous detachment from actin; without ATP, muscle remains locked in rigor mortis" }
    ],
    pathologies: [
      "Rigor Mortis (post-mortem ATP depletion halts cross-bridge detachment, locking muscle in rigid contraction)",
      "Duchenne Muscular Dystrophy (X-linked mutation in dystrophin gene destabilizing sarcolemma during contraction)",
      "Malignant Hyperthermia (uncontrolled Ryanodine receptor RYR1 Ca2+ release induced by volatile anesthetics)"
    ]
  }
};

/**
 * Validated Competency Checkpoint Questions
 * Formatted with 4 options, answer keys, and pedagogical explanations for telemetry assessments.
 */
export const ANATOMY_CHECKPOINTS = [
  {
    id: "anat_q1",
    question: "During ventricular systole of the cardiac cycle, which heart valves are forced shut to produce the first heart sound (S1 'lub')?",
    options: [
      "Aortic and Pulmonary semilunar valves",
      "Tricuspid and Mitral (Bicuspid) atrioventricular valves",
      "Mitral and Aortic valves simultaneously",
      "Eustachian and Thebesian coronary valves"
    ],
    correctIndex: 1,
    explanation: "Isovolumetric ventricular contraction raises intraventricular pressure above atrial pressure, abruptly snapping the Tricuspid and Mitral atrioventricular (AV) valves shut, generating the reverberations perceived acoustically as the S1 'lub'."
  },
  {
    id: "anat_q2",
    question: "In the renal countercurrent multiplier system, what is the primary transport mechanism operating in the thick ascending limb of the Loop of Henle?",
    options: [
      "Passive osmosis of water across aquaporin-1 channels",
      "Active solute reabsorption via the Na+-K+-2Cl- (NKCC2) cotransporter while remaining impermeable to water",
      "Facilitated diffusion of urea into the interstitial medulla",
      "Aldosterone-mediated potassium secretion into the distal lumen"
    ],
    correctIndex: 1,
    explanation: "The thick ascending limb actively reabsorbs sodium, potassium, and chloride ions via the NKCC2 cotransporter without allowing water to follow (it is impermeable to water), which hypertonically concentrates the renal medullary interstitium while diluting the tubular filtrate."
  },
  {
    id: "anat_q3",
    question: "Which cranial nerve provides primary parasympathetic innervation to the thoracic viscera (slowing heart rate and constricting airways) and abdominal digestive organs?",
    options: [
      "Trigeminal Nerve (CN V)",
      "Glossopharyngeal Nerve (CN IX)",
      "Vagus Nerve (CN X)",
      "Hypoglossal Nerve (CN XII)"
    ],
    correctIndex: 2,
    explanation: "The Vagus Nerve (CN X, 'the wanderer') is the principal parasympathetic conduit supplying the heart (decreasing heart rate via SA/AV node M2 receptors), lungs (bronchoconstriction), stomach, and intestines up to the splenic flexure."
  },
  {
    id: "anat_q4",
    question: "During muscle contraction according to the sliding filament theory, what molecular event directly causes the myosin cross-bridge head to detach from actin?",
    options: [
      "Release of inorganic phosphate (Pi) from the myosin head",
      "Binding of a new ATP molecule to the nucleotide binding site on the myosin head",
      "Hydrolysis of ATP into ADP and Pi",
      "Re-uptake of calcium ions back into the sarcoplasmic reticulum"
    ],
    correctIndex: 1,
    explanation: "ATP binding allosterically lowers the affinity of the myosin cross-bridge head for actin, triggering immediate detachment. In the absence of ATP (as after death), detachment cannot occur, resulting in rigor mortis."
  },
  {
    id: "anat_q5",
    question: "Which cell type in the pulmonary alveoli synthesizes and secretes pulmonary surfactant, and what physical law explains why surfactant prevents smaller alveoli from collapsing into larger ones?",
    options: [
      "Type I Pneumocytes; Boyle's Law (P1V1 = P2V2)",
      "Alveolar Macrophages; Dalton's Law of Partial Pressures",
      "Type II Pneumocytes; Laplace's Law of Surface Tension (P = 2T / r)",
      "Goblet Cells; Fick's First Law of Diffusion"
    ],
    correctIndex: 2,
    explanation: "Type II Pneumocytes secrete dipalmitoylphosphatidylcholine surfactant. According to Laplace's Law (P = 2T/r), a smaller radius (r) would create higher collapsing pressure (P) unless surface tension (T) is proportionally reduced. Surfactant reduces surface tension more in smaller alveoli, stabilizing alveolar volume."
  }
];
