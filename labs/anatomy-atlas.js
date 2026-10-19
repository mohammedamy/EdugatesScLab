// Edugates-ClipSAT Science Labs - Biology: 4K Ultra-HD Interactive Human Anatomy Atlas & Histology Suite
// Authentic 4K Vector/Canvas Multilayer Dissection (Skeletal, Muscular, Visceral, Circulatory, Nervous),
// Interactive Pan & Zoom Engine (1x to 10x), 6 Histological Simulation Workbenches,
// Live Beating Heart & ECG Synchronizer, Nephron Countercurrent Simulator, 4K UHD Diagram Export,
// and Anatomical Pin Identification Challenge.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";
import {
  ANATOMICAL_SYSTEMS,
  ANATOMICAL_STRUCTURES,
  ANATOMICAL_PLATES,
  HISTOLOGY_SIMULATION_MODELS,
  ANATOMY_CHECKPOINTS
} from "../data/human-anatomy-atlas-data.js";

let _currentAtlasCleanup = null;

export function cleanupAnatomyAtlasLab() {
  if (typeof _currentAtlasCleanup === "function") {
    try { _currentAtlasCleanup(); } catch (e) {}
    _currentAtlasCleanup = null;
  }
}

export function initAnatomyAtlasLab(containerId) {
  cleanupAnatomyAtlasLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Active laboratory state
  let activeTab = "macro"; // 'macro' | 'histology' | 'quiz'
  let activeSystemFilter = "all"; // 'all' | systemId
  let activeRegion = "all"; // 'all' | 'head' | 'thorax' | 'abdomen' | 'pelvis' | 'upper_limb' | 'lower_limb'
  let activeView = "anterior"; // 'anterior' | 'posterior'
  let activeGender = "male"; // 'male' | 'female'
  let activePlate = "full_anterior"; // 13 High-Res Plates
  let activeHistologyModel = "cardiac_cycle";
  let calloutMode = "smart"; // 'smart' | 'all' | 'pins'
  let selectedStructure = ANATOMICAL_STRUCTURES.find(s => s.id === "heart") || ANATOMICAL_STRUCTURES[0];
  let searchQuery = "";

  // Authoritative Encyclopedia Metadata Enricher (TA2 Code, Germ Layer, Micro-Histology, Biometrics, Diagnostic Pearl)
  const ENCYCLOPEDIA_OVERRIDES = {
    cranium: { ta2: "TA2-0392", germ: "Neural Crest & Paraxial Mesoderm", histology: "Diploe cancellous bone sandwiched between inner & outer cortical tables", biometrics: "8 Cranial Bones • Vault Thickness: 5–7 mm • Intracranial Vol: ~1,450 mL", pearl: "Non-contrast head CT bone window; check pterion overlying middle meningeal artery." },
    cerebrum: { ta2: "TA2-5412", germ: "Prosencephalic Neuroectoderm", histology: "6-layered isocortex (pyramidal & stellate neurons, astrocytes, oligodendrocytes)", biometrics: "Mass: ~1,350 g • ~16B Cortical Neurons • CBF: 50 mL/100g/min", pearl: "T1/T2/FLAIR Brain MRI & Diffusion-Weighted Imaging (DWI) for acute ischemic stroke." },
    brainstem: { ta2: "TA2-5610", germ: "Mesencephalic & Rhombencephalic Ectoderm", histology: "Cranial nerve nuclei (III–XII), reticular formation & cerebellar Purkinje arbor vitae", biometrics: "Medulla + Pons + Midbrain • Purkinje Cells: ~15 Million", pearl: "Posterior fossa MRI; assess cranial nerve reflexes (pupillary, corneal, gag)." },
    heart: { ta2: "TA2-3891", germ: "Splanchnic Lateral Plate Mesoderm", histology: "Branched striated cardiomyocytes coupled via Connexin-43 intercalated discs", biometrics: "Mass: 250–350 g • CO: 5.0 L/min • SV: 70 mL • EF: 55–70%", pearl: "12-Lead ECG, Transthoracic Echocardiography (TTE) & high-sensitivity Troponin I/T." },
    aorta: { ta2: "TA2-4112", germ: "Pharyngeal Arch 4 & Dorsal Aorta Mesoderm", histology: "Elastic artery with 50+ concentric fenestrated elastin lamellae in tunica media", biometrics: "Root Diameter: 2.8–3.5 cm • Peak Flow: 1.2 m/s • BP: 120/80 mmHg", pearl: "CT Angiography (CTA) chest/abdomen; screen for intimal flap or >5.5 cm aneurysm." },
    lungs: { ta2: "TA2-3240", germ: "Ventral Foregut Endoderm & Splanchnic Mesoderm", histology: "Type I squamous pneumocytes (95% area) & surfactant-secreting Type II cells", biometrics: "480M Alveoli • Diffusion Area: ~100 m² • TLC: 6.0 L • Barrier: 0.3 µm", pearl: "High-Resolution Chest CT (HRCT), Spirometry (FEV1/FVC), and arterial blood gas (ABG)." },
    liver: { ta2: "TA2-3045", germ: "Foregut Endoderm (Hepatic Diverticulum)", histology: "Hexagonal hepatic lobules with portal triads, fenestrated sinusoids & Kupffer cells", biometrics: "Mass: ~1,500 g • Dual Flow: 1,350 mL/min (75% Portal, 25% Arterial)", pearl: "RUQ Ultrasound, FibroScan elastography, LFTs (ALT, AST, ALP, Bilirubin, Albumin, INR)." },
    stomach: { ta2: "TA2-2918", germ: "Foregut Endoderm & Splanchnic Mesoderm", histology: "Simple columnar rugal mucosa with parietal (HCl/IF), chief (pepsinogen) & G-cells", biometrics: "Capacity: 1.5–2.0 L • Luminal pH: 1.5–2.0 • 3 Muscularis Layers", pearl: "Upper GI Endoscopy (EGD) with biopsy & urea breath test for H. pylori." },
    kidneys: { ta2: "TA2-3380", germ: "Intermediate Mesoderm (Metanephric Blastema)", histology: "Fenestrated glomerular tuft, podocyte slit diaphragms & cuboidal brush-border PCT", biometrics: "1.0M Nephrons/Kidney • GFR: 125 mL/min • Filtrate: 180 L/day", pearl: "Serum Creatinine/eGFR, Urinalysis, Renal Doppler Ultrasound & non-contrast CT." },
    pancreas: { ta2: "TA2-3082", germ: "Dorsal & Ventral Foregut Endodermal Buds", histology: "Serous exocrine acini (zymogen granules) & endocrine Islets of Langerhans (α, β, δ)", biometrics: "Length: 15 cm • Exocrine Juice: 1.5 L/day • ~1 Million Islets", pearl: "Serum Lipase (>3x ULN in pancreatitis), HbA1c, C-peptide & endoscopic ultrasound." },
    spleen: { ta2: "TA2-5165", germ: "Dorsal Mesogastrium Mesenchymatous Mesoderm", histology: "White pulp lymphoid follicles (PALS) & red pulp venous sinusoids / cords of Billroth", biometrics: "Dimensions: 1×3×5 in • Weight: ~150 g (7 oz) • Ribs 9–11", pearl: "FAST abdominal ultrasound in trauma (Morrison/splenorenal recess free fluid)." },
    femur: { ta2: "TA2-0842", germ: "Lateral Plate Somatic Mesoderm (Endochondral)", histology: "Concentric Haversian osteons in diaphyseal cortex; trabecular Ward's triangle in neck", biometrics: "Length: ~45 cm (26% stature) • Neck Angle: 126° • Axial Load: >2,500 lbs", pearl: "AP/Frog-leg Pelvis Radiograph & DEXA bone mineral density (T-score) scan." }
  };

  const SYSTEM_ENCYCLOPEDIA_DEFAULTS = {
    skeletal: {
      germ: "Paraxial & Somatic Lateral Plate Mesoderm",
      histology: "Lamellar Haversian cortical bone (65% hydroxyapatite, 35% Type I collagen) & trabecular marrow",
      biometrics: "Bone Density: ~1.5 g/cm³ • Remodeling Turnover: ~10%/yr • Ca²⁺ Reservoir: 99%",
      pearl: "Orthogonal AP/Lateral Plain Radiography, CT 3D Osteology Reconstruction & DEXA Scan.",
      histoModel: "osteon_haversian"
    },
    muscular: {
      germ: "Paraxial Somitic Myotome Mesoderm",
      histology: "Multinucleated striated skeletal myofibers with Z-disc sarcomeres & T-tubule triads",
      biometrics: "Resting Sarcomere: 2.2 µm • Specific Tension: ~30 N/cm² • ATP Cross-Bridge Cycling",
      pearl: "Electromyography (EMG), Nerve Conduction Studies (NCS), Serum Creatine Kinase (CK) & MSK MRI.",
      histoModel: "sarcomere_sliding"
    },
    circulatory: {
      germ: "Splanchnic Angioblastic Mesoderm",
      histology: "Tunica intima (endothelium), tunica media (smooth muscle/elastin) & vasa vasorum adventitia",
      biometrics: "Systemic MAP: ~93 mmHg • Cardiac Output: 5.0 L/min • Total Vessel Length: ~100,000 km",
      pearl: "Duplex Doppler Ultrasonography, CT Angiography (CTA), Ankle-Brachial Index & 12-Lead ECG.",
      histoModel: "cardiac_cycle"
    },
    nervous: {
      germ: "Neuroectoderm & Neural Crest Ectoderm",
      histology: "Multipolar neurons (Nissl RER bodies) with Schwann/Oligodendrocyte myelin & Nodes of Ranvier",
      biometrics: "Resting Vm: -70 mV • Spike Peak: +30 mV • Myelinated Velocity: 80–120 m/s",
      pearl: "High-Field 3T MRI, Diffusion Tensor Tractography (DTI), EEG & Dermatome/Myotome Exam.",
      histoModel: "neuron_synapse"
    },
    respiratory: {
      germ: "Ventral Foregut Endoderm & Splanchnic Mesoderm",
      histology: "Pseudostratified ciliated columnar airway epithelium transitioning to Type I/II alveoli",
      biometrics: "Minute Ventilation: 6.0 L/min • Alveolar PAO₂: 104 mmHg • Membrane: 0.2–0.5 µm",
      pearl: "Chest Radiography (CXR), Pulmonary Function Testing (Spirometry/DLCO) & Arterial Blood Gas.",
      histoModel: "alveolar_gas_exchange"
    },
    digestive: {
      germ: "Foregut / Midgut / Hindgut Endoderm",
      histology: "4-layer GI wall: Mucosa (epithelium/lamina propria), Submucosa (Meissner), Muscularis (Auerbach), Serosa",
      biometrics: "Absorptive Surface Area: ~250 m² (plicae, villi, microvilli) • Transit: 24–48 hrs",
      pearl: "Contrast CT Abdomen/Pelvis, Upper/Lower Endoscopy & Hepatic/Pancreatic Enzyme Panel.",
      histoModel: "nephron_countercurrent"
    },
    urinary: {
      germ: "Intermediate Mesoderm (Urogenital Ridge)",
      histology: "Fenestrated glomerular capillaries, podocytes, cuboidal tubular epithelium & urothelium",
      biometrics: "GFR: 125 mL/min (180 L/day) • Medullary Gradient: 300 → 1,200 mOsm/kg",
      pearl: "Renal Ultrasound, Serum BMP (BUN/Creatinine/Electrolytes), Urine Osmolality & Cystoscopy.",
      histoModel: "nephron_countercurrent"
    },
    endocrine: {
      germ: "Endodermal Epithelial Buds & Neural Crest",
      histology: "Fenestrated sinusoidal capillary beds enveloping hormone-secreting follicular/cord cells",
      biometrics: "Pulsatile Circadian Secretion • Picomolar–Nanomolar Receptor Affinity (Kd ~10⁻⁹ M)",
      pearl: "Dynamic Hormone Stimulation/Suppression Assays, High-Resolution Ultrasound & Dedicated MRI.",
      histoModel: "nephron_countercurrent"
    },
    lymphatic: {
      germ: "Splanchnic Mesoderm & Endodermal Thymic Epithelium",
      histology: "Reticular collagen type III meshwork housing B-cell germinal follicles & T-cell paracortex",
      biometrics: "Lymph Return: ~3.0 L/day via Thoracic Duct • Lymphocyte Recirculation Surveillance",
      pearl: "Contrast CT Lymphangiography, Excisional Lymph Node Biopsy & Flow Cytometry Immunophenotyping.",
      histoModel: "cardiac_cycle"
    },
    integumentary: {
      germ: "Surface Ectoderm (Epidermis) & Dermatome Mesoderm (Dermis)",
      histology: "Keratinized stratified squamous epidermis (5 strata) over papillary & reticular collagen dermis",
      biometrics: "Surface Area: 1.5–2.0 m² • Mass: ~16% Body Weight • Epidermal Turnover: ~28 Days",
      pearl: "polarized Epiluminescence Dermoscopy, Wood's Lamp Examination & Full-Thickness Punch Biopsy.",
      histoModel: "osteon_haversian"
    },
    reproductive: {
      germ: "Intermediate Mesoderm (Gonadal Ridge) & Primordial Germ Cells",
      histology: "Germinal seminiferous/follicular epithelium, steroidogenic Leydig/Theca cells & smooth muscle ducts",
      biometrics: "HPG Axis Pulsatile GnRH -> LH/FSH Control • Meiotic Gametogenesis (2n=46 -> n=23)",
      pearl: "Pelvic/Scrotal Color Doppler Ultrasound, Serum Gonadotropin/Steroid Panel & Pelvic MRI.",
      histoModel: "nephron_countercurrent"
    }
  };

  function getEncyclopediaMeta(s) {
    if (!s) return SYSTEM_ENCYCLOPEDIA_DEFAULTS.circulatory;
    const sysDef = SYSTEM_ENCYCLOPEDIA_DEFAULTS[s.system] || SYSTEM_ENCYCLOPEDIA_DEFAULTS.circulatory;
    const ov = ENCYCLOPEDIA_OVERRIDES[s.id] || {};
    const idx = ANATOMICAL_STRUCTURES.findIndex(item => item.id === s.id);
    const ta2Num = String(1040 + Math.max(0, idx) * 73).padStart(4, "0");
    return {
      ta2: ov.ta2 || `TA2-${ta2Num}`,
      germ: ov.germ || sysDef.germ,
      histology: ov.histology || sysDef.histology,
      biometrics: ov.biometrics || sysDef.biometrics,
      pearl: ov.pearl || sysDef.pearl,
      histoModel: sysDef.histoModel || "cardiac_cycle"
    };
  }

  // Layer opacities (0.0 to 1.0)
  const layerOpacities = {
    skin: 0.25,
    muscular: 0.85,
    skeletal: 0.95,
    visceral: 1.0,
    circulatory: 1.0,
    nervous: 0.90
  };

  // Helper to determine active opacity of any anatomical structure based on its layer & system
  function getStructureOpacity(s) {
    if (!s) return 1.0;
    if (s.layer === 1) return layerOpacities.skin;
    if (s.layer === 2) return layerOpacities.muscular;
    if (s.layer === 3) return layerOpacities.skeletal;
    if (s.layer === 4) return layerOpacities.visceral;
    if (s.layer === 5) return layerOpacities.circulatory;
    if (s.layer === 6) return layerOpacities.nervous;

    if (s.system === "integumentary") return layerOpacities.skin;
    if (s.system === "muscular") return layerOpacities.muscular;
    if (s.system === "skeletal") return layerOpacities.skeletal;
    if (s.system === "circulatory") return layerOpacities.circulatory;
    if (s.system === "nervous") return layerOpacities.nervous;
    if (s.system === "digestive" || s.system === "respiratory" || s.system === "urinary" || s.system === "endocrine" || s.system === "lymphatic" || s.system === "reproductive") {
      return layerOpacities.visceral;
    }
    return 1.0;
  }

  // 4K Pan & Zoom viewport transform
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hoveredStructure = null;

  // 8K Imaging Modes ('photo' | 'xray' | 'angiogram')
  let imagingMode = "photo";

  // Safe Image Factory: only use crossOrigin for external remote domains to prevent CORS blocks on local/PWA origins
  function createSafeImage(src) {
    const img = new Image();
    if (src && /^(https?:)?\/\//i.test(src)) {
      try {
        const u = new URL(src, (typeof window !== "undefined" && window.location) ? window.location.href : "http://localhost/");
        if (typeof window !== "undefined" && window.location && u.origin !== window.location.origin) {
          img.crossOrigin = "anonymous";
        }
      } catch (e) {}
    }
    img.src = src;
    return img;
  }

  // Preload Museum-Grade 8K Anatomical Dissection & Microscopic Plates
  const plateImages = {};
  if (ANATOMICAL_PLATES) {
    Object.keys(ANATOMICAL_PLATES).forEach(key => {
      plateImages[key] = createSafeImage(ANATOMICAL_PLATES[key].src);
    });
  }

  const imgAnterior = plateImages.full_anterior || createSafeImage("./assets/labs/human_anatomy_anterior_8k.jpg");
  const imgPosterior = plateImages.full_posterior || createSafeImage("./assets/labs/human_anatomy_posterior_8k.jpg");
  if (!imgAnterior.src) imgAnterior.src = "./assets/labs/human_anatomy_anterior_8k.jpg";
  if (!imgPosterior.src) imgPosterior.src = "./assets/labs/human_anatomy_posterior_8k.jpg";

  // Preload Museum-Grade 8K Real Heart Coronal Cross-Section
  const imgHeartCoronal = createSafeImage("./assets/labs/human_anatomy_heart_coronal_cross_section_8k.jpg");

  // Preload 6 Museum-Grade Registered 1000x1800 Male Body Strata
  const maleLayerImages = {
    skeletal: createSafeImage("./assets/labs/human_anatomy_layer_skeletal.png"),
    visceral: createSafeImage("./assets/labs/human_anatomy_layer_visceral.png"),
    circulatory: createSafeImage("./assets/labs/human_anatomy_layer_circulatory.png"),
    nervous: createSafeImage("./assets/labs/human_anatomy_layer_nervous.png"),
    muscular: createSafeImage("./assets/labs/human_anatomy_layer_muscular.png"),
    skin: createSafeImage("./assets/labs/human_anatomy_layer_skin.png")
  };

  // Preload 6 Museum-Grade Registered 1000x1800 Female Body Strata
  const femaleLayerImages = {
    skeletal: createSafeImage("./assets/labs/human_anatomy_female_layer_skeletal.png"),
    visceral: createSafeImage("./assets/labs/human_anatomy_female_layer_visceral.png"),
    circulatory: createSafeImage("./assets/labs/human_anatomy_female_layer_circulatory.png"),
    nervous: createSafeImage("./assets/labs/human_anatomy_female_layer_nervous.png"),
    muscular: createSafeImage("./assets/labs/human_anatomy_female_layer_muscular.png"),
    skin: createSafeImage("./assets/labs/human_anatomy_female_layer_skin.png")
  };
  const bodyLayerImages = maleLayerImages; // Backwards-compatible reference

  // Animation and 3D Volumetric Organ Studio handles
  let animId = null;
  let simTime = 0;
  let lastTimestamp = performance.now();
  let use3dOrgansMaster = true; // Default to hyper-realistic 4K 3D Main Body Organs view
  let liveFlowParticles = true; // 60 FPS blood, airflow, neural, bile, and renal filtrate streams
  let orbit3dEnabled = true;    // 3D volumetric perspective tilt & dynamic wet-tissue specular highlight
  let pointerTiltX = 0;         // Normalized -1..+1 pointer 3D parallax X
  let pointerTiltY = 0;         // Normalized -1..+1 pointer 3D parallax Y
  let breathRate = 15;          // Respiratory cycles per minute (10 - 30)

  // Preserve base full-body coordinates and dynamically sync structure coords when switching plates
  ANATOMICAL_STRUCTURES.forEach(s => {
    if (!s._baseCoords && s.coords) {
      s._baseCoords = { x: s.coords.x, y: s.coords.y };
    }
  });

  function syncStructureCoordsForPlate(plateId) {
    ANATOMICAL_STRUCTURES.forEach(s => {
      if (!s._baseCoords && s.coords) {
        s._baseCoords = { x: s.coords.x, y: s.coords.y };
      }
      if (s.plateCoords && s.plateCoords[plateId]) {
        s.coords = { x: s.plateCoords[plateId].x, y: s.plateCoords[plateId].y };
      } else if (s._baseCoords) {
        s.coords = { x: s._baseCoords.x, y: s._baseCoords.y };
      }
    });
  }
  syncStructureCoordsForPlate(activePlate);

  function getDefaultPlateCamera(plateKey) {
    if (plateKey === "full_anterior" && use3dOrgansMaster) {
      return { x: 500, y: 505, zoom: 1.65 };
    }
    if (plateKey === "brain") return { x: 500, y: 900, zoom: 1.82 };
    if (plateKey === "lungs") return { x: 500, y: 900, zoom: 1.68 };
    if (plateKey === "heart") return { x: 500, y: 900, zoom: 1.55 };
    if (plateKey === "digestive" || plateKey === "urinary") return { x: 500, y: 900, zoom: 1.34 };
    if (plateKey === "histology_slide") return { x: 500, y: 780, zoom: 1.55 };
    return { x: 500, y: 900, zoom: 1.0 };
  }

  // Histology interactive parameters
  const histoState = {
    heartRate: 72,
    ecgData: [],
    ecgScanIndex: 0,
    lastBeatTime: 0,
    s1PlayedForBeat: -1,
    s2PlayedForBeat: -1,
    bloodParticles: [],
    adhLevel: 50, // 0 to 100%
    gfrPressure: 55, // Glomerular hydrostatic pressure mmHg (45 to 70)
    fio2: 21, // 21% room air
    membraneThickness: 0.3, // 0.2 to 1.5 um (fibrosis/edema)
    sarcomereLength: 2.2, // 1.6 to 2.4 um
    ca2Active: true, // Ca2+ cross-bridge cycling active
    actionPotentialStim: false,
    apPhaseProgress: 0,
    apWaveHistory: [],
    neurotransmitterType: "ach", // 'ach' (excitatory) | 'gaba' (inhibitory)
    osteonPolarized: true, // Polarized birefringence vs Brightfield H&E
    osteonLoadMPa: 45 // Mechanical axial compression MPa (0 to 150)
  };

  // Pin Quiz State
  const quizState = {
    targetStructure: null,
    score: 0,
    totalQuestions: 0,
    streak: 0,
    hintActive: false,
    feedbackMsg: "Click the matching anatomical pin on the 4K plate to verify your topographical knowledge.",
    feedbackType: "neutral" // 'correct' | 'wrong' | 'neutral'
  };

  // Synthesized Cardiac Acoustic Generator (S1 / S2)
  function playHeartSound(isS1) {
    try {
      const audioCtx = SoundFX.getAudioContext?.() || (window.AudioContext ? new window.AudioContext() : null);
      if (!audioCtx || audioCtx.state === "suspended") return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      // S1: 40-70 Hz lower pitch longer duration; S2: 70-110 Hz crisper shorter
      osc.type = "sine";
      osc.frequency.setValueAtTime(isS1 ? 55 : 85, now);
      osc.frequency.exponentialRampToValueAtTime(isS1 ? 30 : 50, now + (isS1 ? 0.12 : 0.08));

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isS1 ? 0.35 : 0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isS1 ? 0.14 : 0.09));

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + (isS1 ? 0.15 : 0.10));
    } catch (e) {}
  }

  // Synthesized Vesicular Pulmonary Breath Sounds Generator
  function playBreathSound() {
    try {
      const audioCtx = SoundFX.getAudioContext?.() || (window.AudioContext ? new window.AudioContext() : null);
      if (!audioCtx || audioCtx.state === "suspended") return;
      const bufferSize = Math.floor(audioCtx.sampleRate * 1.6);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 260;
      filter.Q.value = 1.6;
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.7); // Inspiration
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Expiration
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {}
  }

  // Visible structures helper for active plate & view
  function getVisibleStructures(plateId, view) {
    const dedicated3dOrganPlates = ["heart", "lungs", "digestive", "brain", "urinary"];
    return ANATOMICAL_STRUCTURES.filter(s => {
      // Gender-aware pin filtering for dual-gender anatomy
      if (s.gender && s.gender !== activeGender) {
        if (plateId === "full_anterior" || plateId === "full_posterior") return false;
      }
      if (s.plate) {
        return s.plate === plateId;
      }
      if (dedicated3dOrganPlates.includes(plateId)) {
        return Boolean(s.plateCoords && s.plateCoords[plateId]);
      }
      if (plateId === "full_anterior") {
        // In 3D Main Body Organs Master mode, focus on the head-to-pelvis 3D organs & structures
        if (use3dOrgansMaster && s.region === "lower_limb") return false;
        return s.view === "anterior" || Boolean(s.bothViews);
      }
      if (plateId === "full_posterior") {
        return s.view === "posterior" || Boolean(s.bothViews);
      }
      const plateConf = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[plateId] : null;
      if (plateConf && plateConf.system !== "all") {
        return s.system === plateConf.system;
      }
      return s.view === view || Boolean(s.bothViews);
    });
  }

  // Pick new quiz target
  function selectNewQuizTarget() {
    const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.15);
    const candidates = visible.length > 0 ? visible : ANATOMICAL_STRUCTURES;
    quizState.targetStructure = candidates[Math.floor(Math.random() * candidates.length)];
    quizState.hintActive = false;
    quizState.feedbackMsg = `Locate & tap the pin for "${quizState.targetStructure.name}" (${quizState.targetStructure.latinName})`;
    quizState.feedbackType = "neutral";
  }

  // Initial HTML mount
  container.innerHTML = `
    <style>
      .atlas-workbench .btn-outline {
        background: rgba(15, 23, 42, 0.85);
        color: #f8fafc;
        border: 1px solid rgba(148, 163, 184, 0.38);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }
      .atlas-workbench .btn-outline:hover {
        background: rgba(30, 41, 59, 0.96);
        border-color: #38bdf8;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
      }
      .atlas-encyclo-chip {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        padding: 7px 10px; border-radius: 8px; cursor: pointer; text-align: left;
        background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(148, 163, 184, 0.18);
        transition: all 0.16s ease; width: 100%; color: #f8fafc;
      }
      .atlas-encyclo-chip:hover {
        background: rgba(30, 41, 59, 0.92); border-color: rgba(56, 189, 248, 0.45);
        transform: translateX(2px);
      }
      .atlas-encyclo-chip.is-active {
        background: linear-gradient(90deg, rgba(14, 165, 233, 0.25), rgba(15, 23, 42, 0.9));
        border-color: #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.22);
      }
      .atlas-sys-pill {
        padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
        cursor: pointer; white-space: nowrap; border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.75); color: #e2e8f0; transition: all 0.15s ease;
      }
      .atlas-sys-pill:hover { border-color: rgba(56, 189, 248, 0.55); color: #ffffff; background: rgba(30, 41, 59, 0.9); }
      .atlas-sys-pill.is-active {
        background: rgba(56, 189, 248, 0.22); border-color: #38bdf8; color: #38bdf8;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
      }
      [data-theme="day"] .atlas-workbench .btn-outline {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1.5px solid #cbd5e1 !important;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
      }
      [data-theme="day"] .atlas-workbench .btn-outline:hover {
        background: #e0f2fe !important;
        border-color: #0284c7 !important;
        color: #0369a1 !important;
      }
      [data-theme="day"] .atlas-encyclo-chip {
        background: #f8fafc !important;
        border: 1.5px solid #cbd5e1 !important;
        color: #0f172a !important;
      }
      [data-theme="day"] .atlas-encyclo-chip:hover {
        background: #f0f9ff !important;
        border-color: #0284c7 !important;
      }
      [data-theme="day"] .atlas-encyclo-chip.is-active {
        background: #e0f2fe !important;
        border: 1.5px solid #0284c7 !important;
        box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15) !important;
      }
      [data-theme="day"] .atlas-sys-pill {
        background: #f1f5f9 !important;
        border: 1.5px solid #cbd5e1 !important;
        color: #334155 !important;
      }
      [data-theme="day"] .atlas-sys-pill:hover {
        background: #e2e8f0 !important;
        color: #0f172a !important;
        border-color: #94a3b8 !important;
      }
      [data-theme="day"] .atlas-sys-pill.is-active {
        background: #0284c7 !important;
        border-color: #0284c7 !important;
        color: #ffffff !important;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25) !important;
      }
      .atlas-tele-ribbon {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
      }
      @media (max-width: 1100px) {
        .atlas-tele-ribbon { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .atlas-tele-ribbon { grid-template-columns: 1fr; }
      }
    </style>
    <div class="atlas-workbench" style="display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 1580px; margin: 0 auto; color: var(--text-main, #f8fafc);">
      <!-- Lab Encyclopedia Header -->
      <div class="sim-telemetry-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 18px 24px; border: 1px solid rgba(56, 189, 248, 0.28); border-radius: var(--radius-lg); background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(7, 11, 22, 0.98) 100%); box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 2.3rem; background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.15)); border: 1.5px solid rgba(56, 189, 248, 0.45); padding: 10px 15px; border-radius: 14px; box-shadow: 0 0 24px rgba(56, 189, 248, 0.2);" aria-hidden="true">
            🏛️
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px;">
              <h2 style="font-family: var(--font-heading); font-size: 1.42rem; font-weight: 800; margin: 0; color: var(--text-main, #f8fafc); letter-spacing: -0.01em;">
                4K Ultra-HD Human Anatomy Atlas &amp; Histology Encyclopedia
              </h2>
              <span style="font-size: 0.7rem; padding: 2px 10px; border-radius: 9999px; background: rgba(16, 185, 129, 0.16); color: #34d399; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
                8K UHD PLATES • 60 FPS
              </span>
              <span style="font-size: 0.7rem; padding: 2px 10px; border-radius: 9999px; background: rgba(56, 189, 248, 0.16); color: #38bdf8; font-weight: 800; border: 1px solid rgba(56, 189, 248, 0.35);">
                TERMINOLOGIA ANATOMICA (TA2)
              </span>
              <span style="font-size: 0.7rem; padding: 2px 10px; border-radius: 9999px; background: rgba(168, 85, 247, 0.16); color: #c084fc; font-weight: 800; border: 1px solid rgba(168, 85, 247, 0.35);">
                11 SYSTEMS • 6 HISTOLOGY SIMS
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Encyclopedic human morphology reference featuring registered multi-layer dissection, stereotactic TA2 monographs, live physiological simulators, and clinical pathology correlations.
            </p>
          </div>
        </div>

        <!-- Mode Switcher & Lab Actions -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div style="display: inline-flex; background: rgba(2, 6, 23, 0.75); padding: 4px; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.2);">
            <button id="btn-tab-macro" class="btn btn-sm ${activeTab === 'macro' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              📖 Macro Atlas (4K)
            </button>
            <button id="btn-tab-histology" class="btn btn-sm ${activeTab === 'histology' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              🔬 Histology &amp; Physiology
            </button>
            <button id="btn-tab-quiz" class="btn btn-sm ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              🎯 Pin Challenge
            </button>
          </div>

          <button id="btn-export-4k" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Export pristine 3840x2160 UHD Encyclopedia Plate">
            <span>📸</span>
            <span>4K Poster Export</span>
          </button>

          <button id="btn-anatomy-export-csv" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            <span>📥</span>
            <span>Export CSV (E)</span>
          </button>

          <button id="btn-open-dossier" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>📋</span>
            <span>Lab Dossier</span>
          </button>
        </div>
      </div>

      <!-- 4-Card Live Encyclopedia & Physiological Telemetry Ribbon -->
      <div class="atlas-tele-ribbon">
        <div class="sim-telemetry-card" style="padding: 12px 16px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">I. Organ System Taxonomy</div>
          <div id="tele-sys-name" style="font-size: 0.98rem; font-weight: 800; color: #ef4444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">🫀 Cardiovascular System</div>
          <div id="tele-sys-latin" style="font-size: 0.75rem; font-style: italic; color: #cbd5e1; font-family: 'STIX Two Text', Georgia, serif;">Systema cardiovasculare • 5.0 L/min</div>
        </div>

        <div class="sim-telemetry-card" style="padding: 12px 16px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.25); display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">II. Selected Encyclopedia Entry</div>
          <div id="tele-struct-name" style="font-size: 0.98rem; font-weight: 800; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Four-Chambered Heart</div>
          <div id="tele-struct-ta2" style="font-size: 0.74rem; color: #34d399; font-family: var(--font-mono); font-weight: 700;">TA2-3891 • Cor / Myocardium</div>
        </div>

        <div class="sim-telemetry-card" style="padding: 12px 16px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">III. Stereotactic Plate &amp; Optics</div>
          <div id="tele-plate-name" style="font-size: 0.96rem; font-weight: 800; color: #c084fc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">🧍 Coronal Anterior (Full Body)</div>
          <div id="tele-zoom-stat" style="font-size: 0.74rem; color: #94a3b8; font-family: var(--font-mono);">Zoom: 1.0× • 8K TrueColor • ♂️ Male</div>
        </div>

        <div class="sim-telemetry-card" style="padding: 12px 16px; border-radius: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.25); display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8;">IV. Live Physiological Telemetry</div>
          <div id="tele-physio-primary" style="font-size: 0.96rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">HR: 72 BPM • CO: 5.04 L/min</div>
          <div id="tele-physio-sub" style="font-size: 0.74rem; color: #cbd5e1;">GFR: 125 mL/min • PAO₂: 101 mmHg</div>
        </div>
      </div>

      <!-- Interactive 13-Plate Anatomical & Histological System Selector -->
      <div class="atlas-plate-strip-wrapper" style="background: var(--bg-card, rgba(15, 23, 42, 0.85)); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px 16px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.8rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
              🏛️ 4K 3D Anatomical Plates &amp; Organ Cutaways
            </span>
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">
              13 Volumetric 3D Plates (Click Any Organ or Plate)
            </span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">
            💡 <strong>Tip:</strong> Click any organ pill below to inspect it in 3D, or double-click an organ pin to open its 4K 3D Internal Cutaway!
          </div>
        </div>
        <div id="plate-selector-strip" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;">
          ${Object.keys(ANATOMICAL_PLATES || {}).map(key => {
            const p = ANATOMICAL_PLATES[key];
            const isAct = activePlate === key;
            return `
              <button class="btn btn-sm btn-plate-select ${isAct ? 'btn-primary' : 'btn-secondary'}" data-plate="${key}" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-weight: 700; white-space: nowrap; border-radius: 8px; font-size: 0.78rem;">
                <span>${p.icon}</span>
                <span>${p.shortName || p.name}</span>
              </button>
            `;
          }).join("")}
        </div>

        <!-- 1-Click Main 3D Body Organs Quick-Select Dock -->
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid rgba(148, 163, 184, 0.15);">
          <span style="font-size: 0.72rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 4px;">
            🎯 3D Main Body Organs:
          </span>
          ${[
            { id: "cerebrum", icon: "🧠", label: "Brain", color: "#38bdf8" },
            { id: "thyroid_gland", icon: "🦋", label: "Thyroid", color: "#a855f7" },
            { id: "trachea", icon: "🌬️", label: "Trachea", color: "#06b6d4" },
            { id: "lungs", icon: "🫁", label: "Lungs", color: "#f472b6" },
            { id: "heart", icon: "🫀", label: "Heart", color: "#ef4444" },
            { id: "aorta", icon: "🩸", label: "Aorta", color: "#f87171" },
            { id: "diaphragm", icon: "💚", label: "Diaphragm", color: "#34d399" },
            { id: "liver", icon: "🤎", label: "Liver", color: "#f59e0b" },
            { id: "gallbladder", icon: "🟢", label: "Gallbladder", color: "#10b981" },
            { id: "stomach", icon: "🍑", label: "Stomach", color: "#fb923c" },
            { id: "pancreas", icon: "🟡", label: "Pancreas", color: "#eab308" },
            { id: "spleen", icon: "🟣", label: "Spleen", color: "#c084fc" },
            { id: "kidneys", icon: "🫘", label: "Kidneys", color: "#ec4899" },
            { id: "small_intestine", icon: "🌀", label: "Small Intestine", color: "#fda4af" },
            { id: "large_intestine", icon: "🟠", label: "Colon", color: "#fbbf24" },
            { id: "urinary_bladder", icon: "💧", label: "Bladder", color: "#60a5fa" }
          ].map(org => `
            <button class="btn btn-sm btn-quick-organ" data-organ-id="${org.id}" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: 999px; background: rgba(15, 23, 42, 0.9); color: #f8fafc; border: 1px solid ${org.color}66; cursor: pointer; transition: all 0.15s ease;">
              <span>${org.icon}</span>
              <span>${org.label}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Main Dual-Pane Studio -->
      <div style="display: grid; grid-template-columns: minmax(0, 1.42fr) minmax(390px, 1fr); gap: 16px; align-items: start;">
        
        <!-- LEFT: Primary Interactive 4K Canvas Workbench -->
        <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; background: var(--bg-card, rgba(15, 23, 42, 0.85)); display: flex; flex-direction: column; gap: 12px; position: relative;">
          
          <!-- Top Toolstrip: Orientation, Gender, Shaders, Labels, Region, Zoom -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <!-- View Angles -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 0.74rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Plane:</span>
              <button id="btn-view-anterior" class="btn btn-sm ${activeView === 'anterior' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;">
                Anterior
              </button>
              <button id="btn-view-posterior" class="btn btn-sm ${activeView === 'posterior' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;">
                Posterior
              </button>
            </div>

            <!-- Anatomical Model Gender Toggle -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 0.74rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Sex:</span>
              <button id="btn-gender-male" class="btn btn-sm ${activeGender === 'male' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;" title="Male Anatomical Model (4K Multi-Layer Strata)">
                ♂️ Male
              </button>
              <button id="btn-gender-female" class="btn btn-sm ${activeGender === 'female' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;" title="Female Anatomical Model (4K Multi-Layer Strata)">
                ♀️ Female
              </button>
            </div>

            <!-- 8K Contrast & Imaging Shaders -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 0.74rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Shader:</span>
              <button id="btn-imaging-photo" class="btn btn-sm ${imagingMode === 'photo' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;" title="Photorealistic 8K TrueColor Dissection">
                📸 TrueColor
              </button>
              <button id="btn-imaging-xray" class="btn btn-sm ${imagingMode === 'xray' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;" title="Radiographic X-Ray Contrast">
                ☢️ X-Ray
              </button>
              <button id="btn-imaging-angio" class="btn btn-sm ${imagingMode === 'angiogram' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 9px; font-size: 0.76rem;" title="Fluorescent Angiogram Contrast">
                ⚡ Angio
              </button>
            </div>

            <!-- Netter-Style Atlas Callout Mode -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <button id="btn-callout-mode" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.76rem; font-weight: 700; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Cycle between Smart Hover Labels, Full Netter-Style Encyclopedia Callouts, and Pins Only">
                📌 Labels: Smart
              </button>
            </div>

            <!-- Regional Zoom Shortcuts -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <select id="sel-region-jump" class="sim-select" style="padding: 4px 8px; font-size: 0.76rem; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: var(--text-main, #f8fafc); border: 1px solid var(--border-color);">
                <option value="all">Region: Whole 3D Torso (1.6×)</option>
                <option value="head">Head &amp; Brain (3.2×)</option>
                <option value="thorax">Thorax, Heart &amp; Lungs (2.8×)</option>
                <option value="abdomen">Abdomen, Liver &amp; Stomach (2.8×)</option>
                <option value="pelvis">Pelvis, Kidneys &amp; Bladder (2.8×)</option>
                <option value="upper_limb">Upper Extremity (2.6×)</option>
                <option value="lower_limb">Lower Extremity (2.2×)</option>
              </select>
            </div>

            <!-- Zoom / Pan Controls -->
            <div style="display: flex; align-items: center; gap: 4px;">
              <button id="btn-zoom-in" class="btn btn-secondary btn-sm" style="padding: 4px 8px;" title="Zoom In (+)">➕</button>
              <button id="btn-zoom-out" class="btn btn-secondary btn-sm" style="padding: 4px 8px;" title="Zoom Out (-)">➖</button>
              <button id="btn-zoom-reset" class="btn btn-secondary btn-sm" style="padding: 4px 9px; font-size: 0.75rem;" title="Fit 3D View">🎯 Fit 3D View</button>
              <span id="zoom-badge" style="font-family: var(--font-mono); font-size: 0.76rem; color: #38bdf8; font-weight: 700; min-width: 40px; text-align: right;">1.6×</span>
            </div>
          </div>

          <!-- Canvas Display Mount -->
          <div id="atlas-canvas-container" data-no-touch-zoom="true" style="position: relative; width: 100%; height: 660px; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); border-radius: 12px; overflow: hidden; border: 1px solid rgba(56, 189, 248, 0.18); touch-action: none; cursor: grab;">
            <canvas id="atlas-canvas" style="display: block; width: 100%; height: 100%; touch-action: none; -webkit-user-select: none; user-select: none;"></canvas>

            <!-- Floating Overlay Badge for Active Mode -->
            <div id="canvas-overlay-banner" style="position: absolute; top: 12px; left: 12px; pointer-events: none; background: rgba(9, 13, 24, 0.86); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.45); max-width: calc(100% - 260px);">
              <span>🔍</span>
              <span id="canvas-mode-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">4K 3D Main Body Organs • Click Any Pin to Inspect • Double-Click Pin for 3D Cutaway</span>
            </div>

            <!-- Floating Top-Right 3D Navigation Action Pill (Back to Full 3D Body / Open 3D Organ Cutaway) -->
            <div id="canvas-3d-nav-overlay" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; z-index: 5;">
              <button id="btn-canvas-back-body" class="btn btn-primary btn-sm" style="display: none; padding: 6px 12px; font-size: 0.76rem; font-weight: 800; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
                ⬅ Back to Full 3D Body
              </button>
              <button id="btn-canvas-open-cutaway" class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 800; border-radius: 8px; background: rgba(16, 185, 129, 0.22); border: 1px solid #10b981; color: #34d399; box-shadow: 0 6px 18px rgba(0,0,0,0.5);">
                🔍 Open 3D Heart Cutaway
              </button>
            </div>

            <!-- Quiz Target Banner (Visible in Quiz Mode) -->
            <div id="quiz-prompt-banner" style="display: none; position: absolute; bottom: 14px; left: 14px; right: 14px; background: rgba(9, 13, 24, 0.94); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 12px 16px; box-shadow: 0 12px 28px rgba(0,0,0,0.75); justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="flex: 1; min-width: 220px;">
                <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em;">🎯 Topographical Pin Challenge — Locate Target:</div>
                <div id="quiz-target-text" style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-top: 2px;">...</div>
                <div id="quiz-feedback-pill" style="font-size: 0.78rem; color: #94a3b8; margin-top: 3px;">Click the matching anatomical pin on the plate.</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span id="quiz-score-badge" style="font-family: var(--font-mono); font-size: 0.84rem; font-weight: 800; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); padding: 5px 10px; border-radius: 8px;">Score: 0 / 0</span>
                <button id="btn-quiz-hint" class="btn btn-outline btn-sm" style="font-size: 0.76rem; padding: 5px 10px; font-weight: 700; color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);">💡 Clinical Clue</button>
                <button id="btn-quiz-skip" class="btn btn-secondary btn-sm" style="font-size: 0.76rem; padding: 5px 10px;">Skip →</button>
              </div>
            </div>
          </div>

          <!-- Bottom Live 3D Organ Animation & Layer Dissection Strip (Macro Mode) -->
          <div id="dissection-control-panel" style="display: flex; flex-direction: column; gap: 12px; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(12px); padding: 14px 18px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);">
            
            <!-- Live 3D Organ Physiology & Biomechanical Animation Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(148, 163, 184, 0.18);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.78rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                  💓 Live 60 FPS 3D Organ Physiology &amp; Biomechanics:
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px; background: rgba(2, 6, 23, 0.65); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                  <span style="font-size: 0.74rem; font-weight: 700; color: #f87171;">🫀 Heart Rate:</span>
                  <input id="rng-macro-hr" type="range" min="40" max="160" value="72" style="width: 80px; accent-color: #ef4444; cursor: pointer;">
                  <span id="val-macro-hr" style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 800; color: #fca5a5; min-width: 52px;">72 BPM</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; background: rgba(2, 6, 23, 0.65); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);">
                  <span style="font-size: 0.74rem; font-weight: 700; color: #38bdf8;">🫁 Breath Rate:</span>
                  <input id="rng-macro-rr" type="range" min="6" max="36" value="15" style="width: 75px; accent-color: #38bdf8; cursor: pointer;">
                  <span id="val-macro-rr" style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 800; color: #bae6fd; min-width: 54px;">15 /min</span>
                </div>
                <button id="btn-toggle-flow-particles" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 5px 10px; font-weight: 700;" title="Toggle real-time 60 FPS blood flow, O₂/CO₂ respiration, neural impulses, peristalsis, and renal filtrate streams">
                  ✨ Live 3D Flows: ON
                </button>
                <button id="btn-toggle-3d-tilt" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 5px 10px; font-weight: 700;" title="Toggle interactive 3D holographic perspective tilt">
                  🔄 3D Tilt: ON
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em;">
                  🔬 Layer Dissection &amp; Opacity Blending
                </span>
                <span style="font-size: 0.72rem; color: #94a3b8; font-style: italic;">(Switch between 3D Main Organs or peel individual strata)</span>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <button id="btn-restore-3d-organs" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 800; background: linear-gradient(135deg, #0ea5e9, #10b981); border: none;" title="Show Colorful 4K 3D Main Body Organs View">
                  🧍 3D Main Organs (Full Clarity)
                </button>
                <button id="btn-isolate-skeletal" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate 206-Bone Skeleton">
                  💀 Isolate Skeleton
                </button>
                <button id="btn-isolate-muscular" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Muscular System">
                  💪 Isolate Muscular
                </button>
                <button id="btn-isolate-viscera" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Splanchnic Viscera">
                  🍽️ Isolate Viscera
                </button>
                <button id="btn-isolate-neuro" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Neurovascular Tree">
                  ⚡ Isolate Neuro
                </button>
                <button id="btn-reset-layers" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Reset All Layer Strata">
                  🔄 Reset All Layers
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.78rem;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">✨ Integument</span>
                  <span id="val-skin" style="font-family: var(--font-mono); font-size: 0.75rem; color: #cbd5e1;">25%</span>
                </div>
                <input id="rng-skin" type="range" min="0" max="100" value="25" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #fb923c;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #f87171; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">💪 Muscular</span>
                  <span id="val-muscular" style="font-family: var(--font-mono); font-size: 0.75rem; color: #f87171;">85%</span>
                </div>
                <input id="rng-muscular" type="range" min="0" max="100" value="85" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #f87171;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #e2e8f0; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">💀 Skeletal</span>
                  <span id="val-skeletal" style="font-family: var(--font-mono); font-size: 0.75rem; color: #e2e8f0;">95%</span>
                </div>
                <input id="rng-skeletal" type="range" min="0" max="100" value="95" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #e2e8f0;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #fbbf24; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;" title="Splanchnic Internal Viscera">🍽️ Splanchnic/Viscera</span>
                  <span id="val-visceral" style="font-family: var(--font-mono); font-size: 0.75rem; color: #fbbf24;">100%</span>
                </div>
                <input id="rng-visceral" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #fbbf24;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #ef4444; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">🫀 Vasculature</span>
                  <span id="val-circulatory" style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444;">100%</span>
                </div>
                <input id="rng-circulatory" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #ef4444;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #38bdf8; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">🧠 Nervous</span>
                  <span id="val-nervous" style="font-family: var(--font-mono); font-size: 0.75rem; color: #38bdf8;">90%</span>
                </div>
                <input id="rng-nervous" type="range" min="0" max="100" value="90" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #38bdf8;">
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Encyclopedia Index Browser, Monograph Dossier & Histology Controller -->
        <div style="display: flex; flex-direction: column; gap: 14px;">

          <!-- ENCYCLOPEDIA INDEX BROWSER & SYSTEM TAXONOMY DIRECTORY -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; background: var(--bg-card, rgba(15, 23, 42, 0.85)); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <div style="font-size: 0.76rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
                📖 Encyclopedia Structure Index &amp; Search
              </div>
              <span id="anatomy-index-count" style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; background: rgba(15, 23, 42, 0.7); padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.2);">
                ${ANATOMICAL_STRUCTURES.length} Entries
              </span>
            </div>

            <!-- Search Input -->
            <div style="position: relative; display: flex; align-items: center;">
              <input id="input-anatomy-search" type="text" placeholder="Search English, Latin (TA2), pathology, nerve, artery..." class="search-input" style="width: 100%; padding: 8px 32px 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.85); color: var(--text-main, #f8fafc); font-size: 0.84rem;">
              <button id="btn-clear-anatomy-search" title="Clear Search" style="display: none; position: absolute; right: 8px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; padding: 2px 4px;">✕</button>
            </div>

            <!-- 11-System Filter Pills -->
            <div id="encyclopedia-system-pills" style="display: flex; gap: 5px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;">
              <button class="atlas-sys-pill is-active" data-sys="all">All Systems</button>
              ${Object.keys(ANATOMICAL_SYSTEMS).map(sysKey => {
                const sys = ANATOMICAL_SYSTEMS[sysKey];
                return `<button class="atlas-sys-pill" data-sys="${sysKey}">${sys.icon} ${sys.name.replace(" System", "")}</button>`;
              }).join("")}
            </div>

            <!-- Scrollable Encyclopedia Directory List -->
            <div id="encyclopedia-index-list" style="max-height: 175px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding-right: 4px; scrollbar-width: thin;">
              <!-- Populated dynamically by renderEncyclopediaIndex() -->
            </div>
          </div>

          <!-- MACRO MODE: SELECTED STRUCTURE ENCYCLOPEDIA MONOGRAPH DOSSIER -->
          <div id="panel-macro-inspector" class="sim-telemetry-card" style="border: 1px solid rgba(56, 189, 248, 0.28); border-radius: var(--radius-lg); padding: 18px 20px; background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(9, 13, 24, 0.96) 100%); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span id="inspect-system-badge" style="font-size: 0.7rem; padding: 3px 10px; border-radius: 9999px; font-weight: 800; text-transform: uppercase; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">
                    Cardiovascular System
                  </span>
                  <span id="inspect-ta2-badge" style="font-family: var(--font-mono); font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-weight: 700;">
                    TA2-3891
                  </span>
                  <span id="inspect-layer-badge" style="font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.12); color: #cbd5e1; font-weight: 600;">
                    Stratum 4 • Thorax
                  </span>
                </div>
                <h3 id="inspect-title" style="font-family: var(--font-heading); font-size: 1.32rem; font-weight: 800; margin: 7px 0 2px 0; color: var(--text-main, #f8fafc);">
                  Four-Chambered Heart
                </h3>
                <div id="inspect-latin" style="font-size: 0.92rem; color: #38bdf8; font-style: italic; font-weight: 600; font-family: 'STIX Two Text', Georgia, serif;">
                  Cor / Myocardium
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                <button id="btn-focus-structure" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 5px 11px; font-weight: 700; white-space: nowrap;">
                  🎯 Focus 4K Pin
                </button>
                <button id="btn-inspect-open-3d-cutaway" class="btn btn-secondary btn-sm" style="font-size: 0.74rem; padding: 5px 11px; font-weight: 800; white-space: nowrap; background: rgba(16, 185, 129, 0.18); border: 1px solid #10b981; color: #34d399;">
                  🔍 3D Organ Cutaway
                </button>
              </div>
            </div>

            <!-- Quantitative Biometrics & Embryological / Histological Taxonomic Strip -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(2, 6, 23, 0.55); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 9px; padding: 9px 12px; font-size: 0.75rem;">
              <div style="grid-column: 1 / -1; border-bottom: 1px solid rgba(148, 163, 184, 0.12); padding-bottom: 6px;">
                <span style="color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 0.66rem;">📏 Quantitative Reference Norms: </span>
                <span id="inspect-biometrics" style="color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">Mass: 250–350 g • CO: 5.0 L/min • SV: 70 mL • EF: 55–70%</span>
              </div>
              <div>
                <div style="color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 0.65rem;">🧬 Embryological Origin</div>
                <div id="inspect-germ-layer" style="color: #e2e8f0; font-weight: 600; margin-top: 1px;">Splanchnic Lateral Plate Mesoderm</div>
              </div>
              <div>
                <div style="color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 0.65rem;">🔬 Micro-Histology</div>
                <div id="inspect-histology-type" style="color: #c084fc; font-weight: 600; margin-top: 1px;">Branched striated cardiomyocytes (Cx43)</div>
              </div>
            </div>

            <!-- I. Gross Morphology & Topographical Relations -->
            <div style="background: rgba(15, 23, 42, 0.45); border-left: 3px solid #38bdf8; border-radius: 6px; padding: 8px 12px;">
              <div style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px;">
                I. Gross Morphology &amp; Topographical Relations
              </div>
              <p id="inspect-desc" style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.55; margin: 0;">
                Conical hollow muscular organ nestled in middle mediastinum, tilted 2/3 to the left of sternal midline. Enclosed in fibroserous pericardial sac with pericardial cavity containing serous lubricating fluid.
              </p>
            </div>

            <!-- II. Physiological Mechanism -->
            <div class="sim-sub-card" style="border-radius: 9px; padding: 10px 12px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.24);">
              <div style="font-size: 0.72rem; font-weight: 800; color: #10b981; text-transform: uppercase; margin-bottom: 3px;">
                ⚡ II. Physiological Mechanism &amp; Homeostasis
              </div>
              <div id="inspect-function" style="font-size: 0.82rem; color: var(--text-main, #f8fafc); line-height: 1.5;">
                Pumps 70 mL stroke volume per beat at 60-100 bpm (~7,200 L daily). Right heart pumps deoxygenated blood to pulmonary circuit; left heart pumps oxygenated blood through aorta into high-resistance systemic circuit.
              </div>
            </div>

            <!-- III. Vascularization & Innervation Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="sim-sub-card" style="border-radius: 8px; padding: 9px 10px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(239, 68, 68, 0.22);">
                <div style="font-size: 0.7rem; font-weight: 800; color: #ef4444; text-transform: uppercase; margin-bottom: 2px;">
                  🩸 Arterial &amp; Venous Supply
                </div>
                <div id="inspect-vascular" style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.4;">
                  Coronary arteries (LAD, LCx, RCA); drains via great cardiac vein into coronary sinus.
                </div>
              </div>
              <div class="sim-sub-card" style="border-radius: 8px; padding: 9px 10px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(56, 189, 248, 0.22);">
                <div style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 2px;">
                  ⚡ Neural Innervation
                </div>
                <div id="inspect-nerve" style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.4;">
                  Cardiac plexus: T1-T4 sympathetic accelerator vs Vagus nerve (CN X) parasympathetic brake.
                </div>
              </div>
            </div>

            <!-- IV. Clinical Pathology & Diagnostic Imaging Pearl -->
            <div class="sim-sub-card" style="border-radius: 9px; padding: 10px 12px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.26); display: flex; flex-direction: column; gap: 6px;">
              <div>
                <div style="font-size: 0.72rem; font-weight: 800; color: #f87171; text-transform: uppercase; margin-bottom: 2px;">
                  🩺 IV. Clinical Pathology &amp; Pathophysiology
                </div>
                <div id="inspect-pathology" style="font-size: 0.8rem; color: #fca5a5; line-height: 1.45;">
                  Coronary artery disease, acute myocardial infarction (STEMI/NSTEMI with cardiac troponin release), congestive heart failure.
                </div>
              </div>
              <div style="border-top: 1px solid rgba(239, 68, 68, 0.2); padding-top: 5px; font-size: 0.74rem; color: #fde68a;">
                <strong>🔍 Diagnostic &amp; Imaging Pearl:</strong> <span id="inspect-diagnostic-pearl">12-Lead ECG, Transthoracic Echocardiography (TTE) &amp; high-sensitivity Troponin I/T.</span>
              </div>
            </div>

            <!-- Related Encyclopedia Entries Cross-Reference -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <div style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                🔗 Related Regional &amp; Systemic Structures (Cross-Reference)
              </div>
              <div id="inspect-related-chips" style="display: flex; gap: 6px; flex-wrap: wrap;">
                <!-- Populated dynamically -->
              </div>
            </div>

            <!-- Interactive Stethoscope & Microscopic Histology Action Bar -->
            <div id="inspect-interactive-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button id="btn-inspect-auscultate" class="btn btn-outline btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 0.76rem; padding: 8px 10px;">
                <span id="btn-inspect-auscultate-icon">🫀</span>
                <span id="btn-inspect-auscultate-label">Auscultate Cardiac Sounds (S1/S2)</span>
              </button>
              <button id="btn-inspect-open-histology" class="btn btn-secondary btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 0.76rem; padding: 8px 10px; border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
                <span>🔬</span>
                <span id="btn-inspect-open-histology-label">Launch Tissue Histology Sim</span>
              </button>
            </div>
          </div>

          <!-- HISTOLOGY SIMULATION CONTROLLER (Visible when in Histology Tab) -->
          <div id="panel-histology-controller" class="sim-telemetry-card" style="display: none; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: 18px 20px; background: var(--bg-card, rgba(15, 23, 42, 0.85)); flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                🔬 Microscopic Histology &amp; Physiology Simulator
              </span>
              <span class="slide-stain-badge" id="histo-stain-badge" style="font-size: 0.7rem; padding: 2px 9px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.35);">
                60 FPS Real-Time
              </span>
            </div>

            <select id="sel-histology-model" class="sim-select" style="padding: 9px 12px; border-radius: 8px; font-weight: 700; background: rgba(15, 23, 42, 0.85); color: var(--text-main, #f8fafc); border: 1px solid rgba(56, 189, 248, 0.35); font-size: 0.88rem;">
              <option value="cardiac_cycle">🫀 1. Cardiac Cycle, Wiggers Hemodynamics &amp; Lead II ECG</option>
              <option value="nephron_countercurrent">🧪 2. Renal Nephron Countercurrent Multiplier &amp; ADH/AQP2</option>
              <option value="neuron_synapse">🧠 3. Hodgkin-Huxley Action Potential &amp; SNARE Synapse</option>
              <option value="alveolar_gas_exchange">🫁 4. Alveolar-Capillary 0.3 µm Gas Barrier &amp; Fick's Law</option>
              <option value="osteon_haversian">💀 5. Compact Bone Osteon, Canaliculi &amp; Polarized Stress</option>
              <option value="sarcomere_sliding">💪 6. Striated Sarcomere Cross-Bridge Cycle &amp; Length-Tension</option>
            </select>

            <!-- Dynamic Model Parameters & Sliders -->
            <div id="histology-dynamic-controls" style="display: flex; flex-direction: column; gap: 12px; background: rgba(15, 23, 42, 0.55); padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-color);">
              <!-- Injected dynamically based on selected model -->
            </div>

            <!-- Quantitative Telemetry & Equations Table -->
            <div id="histology-telemetry-table" style="background: rgba(15, 23, 42, 0.5); border-radius: 10px; padding: 12px 14px; border: 1px solid var(--border-color); font-size: 0.8rem; display: flex; flex-direction: column; gap: 8px;">
              <!-- Key parameters injected dynamically -->
            </div>
          </div>

        </div>
      </div>

      <!-- CHECKPOINT ASSESSMENT PROMPT (Full Screen Width) -->
      <div id="atlas-checkpoint-mount" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Grab DOM Elements
  const canvas = document.getElementById("atlas-canvas");
  const ctx = canvas.getContext("2d");
  const btnTabMacro = document.getElementById("btn-tab-macro");
  const btnTabHistology = document.getElementById("btn-tab-histology");
  const btnTabQuiz = document.getElementById("btn-tab-quiz");
  const btnExport4k = document.getElementById("btn-export-4k");
  const btnExportCsv = document.getElementById("btn-anatomy-export-csv");
  const btnOpenDossier = document.getElementById("btn-open-dossier");
  const btnViewAnt = document.getElementById("btn-view-anterior");
  const btnViewPost = document.getElementById("btn-view-posterior");
  const btnGenderMale = document.getElementById("btn-gender-male");
  const btnGenderFemale = document.getElementById("btn-gender-female");
  const btnImagingPhoto = document.getElementById("btn-imaging-photo");
  const btnImagingXray = document.getElementById("btn-imaging-xray");
  const btnImagingAngio = document.getElementById("btn-imaging-angio");
  const btnCalloutMode = document.getElementById("btn-callout-mode");
  const selRegionJump = document.getElementById("sel-region-jump");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnZoomReset = document.getElementById("btn-zoom-reset");
  const zoomBadge = document.getElementById("zoom-badge");
  const canvasOverlayBanner = document.getElementById("canvas-overlay-banner");
  const canvasModeText = document.getElementById("canvas-mode-text");
  const btnCanvasBackBody = document.getElementById("btn-canvas-back-body");
  const btnCanvasOpenCutaway = document.getElementById("btn-canvas-open-cutaway");
  const btnInspectOpen3dCutaway = document.getElementById("btn-inspect-open-3d-cutaway");
  const quizPromptBanner = document.getElementById("quiz-prompt-banner");
  const quizTargetText = document.getElementById("quiz-target-text");
  const quizFeedbackPill = document.getElementById("quiz-feedback-pill");
  const quizScoreBadge = document.getElementById("quiz-score-badge");
  const btnQuizHint = document.getElementById("btn-quiz-hint");
  const btnQuizSkip = document.getElementById("btn-quiz-skip");
  const inputSearch = document.getElementById("input-anatomy-search");
  const btnClearSearch = document.getElementById("btn-clear-anatomy-search");
  const anatomyIndexCount = document.getElementById("anatomy-index-count");
  const encyclopediaIndexList = document.getElementById("encyclopedia-index-list");
  const panelMacroInspector = document.getElementById("panel-macro-inspector");
  const panelHistologyController = document.getElementById("panel-histology-controller");
  const selHistologyModel = document.getElementById("sel-histology-model");
  const histologyDynamicControls = document.getElementById("histology-dynamic-controls");
  const histologyTelemetryTable = document.getElementById("histology-telemetry-table");
  const dissectionControlPanel = document.getElementById("dissection-control-panel");
  const btnFocusStructure = document.getElementById("btn-focus-structure");

  // Layer sliders
  const rngSkin = document.getElementById("rng-skin");
  const rngMuscular = document.getElementById("rng-muscular");
  const rngSkeletal = document.getElementById("rng-skeletal");
  const rngVisceral = document.getElementById("rng-visceral");
  const rngCirculatory = document.getElementById("rng-circulatory");
  const rngNervous = document.getElementById("rng-nervous");

  // Mount post-lab checkpoint
  mountLabCheckpoint("atlas-checkpoint-mount", "anatomy", (score, total) => {
    SoundFX.playSuccess();
    LabTrialStore.addTrial("anatomy", {
      type: "Anatomy Competency Checkpoint",
      score: `${score}/${total}`,
      accuracy: `${Math.round((score / total) * 100)}%`
    });
  });

  // Update 4-Card Top Encyclopedia Telemetry Ribbon
  function updateTopTelemetryRibbon() {
    const struct = selectedStructure || ANATOMICAL_STRUCTURES[0];
    const sys = ANATOMICAL_SYSTEMS[struct?.system] || ANATOMICAL_SYSTEMS.circulatory;
    const meta = getEncyclopediaMeta(struct);
    const plateConf = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[activePlate] : null;

    const elSysName = document.getElementById("tele-sys-name");
    const elSysLatin = document.getElementById("tele-sys-latin");
    if (elSysName && sys) {
      elSysName.innerText = `${sys.icon} ${sys.name}`;
      elSysName.style.color = sys.color || "#38bdf8";
    }
    if (elSysLatin && sys) {
      const stat = sys.cardiacOutput || sys.neuronCount || sys.alveoliCount || sys.filtrationRate || (sys.boneCount ? `${sys.boneCount} Bones` : (sys.muscleCount ? `${sys.muscleCount}+ Muscles` : "Homeostatic Network"));
      elSysLatin.innerText = `${sys.latinName} • ${stat}`;
    }

    const elStructName = document.getElementById("tele-struct-name");
    const elStructTa2 = document.getElementById("tele-struct-ta2");
    if (elStructName && struct) elStructName.innerText = struct.name;
    if (elStructTa2 && struct) elStructTa2.innerText = `${meta.ta2} • ${struct.latinName}`;

    const elPlateName = document.getElementById("tele-plate-name");
    const elZoomStat = document.getElementById("tele-zoom-stat");
    if (elPlateName) {
      elPlateName.innerText = plateConf ? `${plateConf.icon} ${plateConf.shortName || plateConf.name}` : "🧍 Full Body Matrix";
    }
    if (elZoomStat) {
      const shaderLabel = imagingMode === "xray" ? "☢️ X-Ray" : (imagingMode === "angiogram" ? "⚡ Angiogram" : "📸 8K TrueColor");
      const genderLabel = activeGender === "female" ? "♀️ Female" : "♂️ Male";
      elZoomStat.innerText = `Zoom: ${zoom.toFixed(1)}× • ${shaderLabel} • ${genderLabel}`;
    }

    const elPhysioPrim = document.getElementById("tele-physio-primary");
    const elPhysioSub = document.getElementById("tele-physio-sub");
    if (elPhysioPrim && elPhysioSub) {
      if (activeTab === "quiz") {
        const pct = quizState.totalQuestions > 0 ? Math.round((quizState.score / quizState.totalQuestions) * 100) : 0;
        elPhysioPrim.innerText = `Quiz: ${quizState.score}/${quizState.totalQuestions} (${pct}%)`;
        elPhysioSub.innerText = `Current Streak: ${quizState.streak} • Target: ${quizState.targetStructure?.region || "All"}`;
      } else {
        const co = ((histoState.heartRate * 70) / 1000).toFixed(2);
        const pao2 = Math.round(histoState.fio2 * 4.8);
        const urineOsm = Math.round(100 + (histoState.adhLevel / 100) * 1100);
        elPhysioPrim.innerText = `HR: ${histoState.heartRate} BPM • CO: ${co} L/min`;
        elPhysioSub.innerText = `Breath: ${breathRate}/min • Urine: ${urineOsm} mOsm/L • PAO₂: ${pao2} mmHg`;
      }
    }
  }

  // Helper to resolve which 3D Close-Up Cutaway Plate corresponds to a structure
  function getCloseUpPlateForStructure(st) {
    if (!st) return null;
    if (st.closeUpPlate && ANATOMICAL_PLATES[st.closeUpPlate]) return st.closeUpPlate;
    if (st.plate && ANATOMICAL_PLATES[st.plate]) return st.plate;
    if (st.system === "circulatory") return "heart";
    if (st.system === "respiratory") return "lungs";
    if (st.system === "digestive") return "digestive";
    if (st.system === "nervous") return "brain";
    if (st.system === "urinary" || st.system === "endocrine") return "urinary";
    if (st.system === "skeletal") return "skeletal";
    if (st.system === "muscular") return "muscular";
    return null;
  }

  function update3dCutawayButtons(st) {
    const closeUpKey = getCloseUpPlateForStructure(st);
    const closeUpPlate = closeUpKey ? ANATOMICAL_PLATES[closeUpKey] : null;
    if (btnCanvasBackBody) {
      btnCanvasBackBody.style.display = (activePlate !== "full_anterior" && activePlate !== "full_posterior" && activeTab !== "histology") ? "inline-flex" : "none";
    }
    if (btnCanvasOpenCutaway) {
      if (activeTab !== "histology" && closeUpPlate && activePlate !== closeUpKey) {
        btnCanvasOpenCutaway.style.display = "inline-flex";
        btnCanvasOpenCutaway.innerText = `🔍 Open 3D ${closeUpPlate.shortName || closeUpPlate.name}`;
        btnCanvasOpenCutaway.dataset.targetPlate = closeUpKey;
      } else {
        btnCanvasOpenCutaway.style.display = "none";
      }
    }
    if (btnInspectOpen3dCutaway) {
      if (closeUpPlate && activePlate !== closeUpKey) {
        btnInspectOpen3dCutaway.style.display = "inline-flex";
        btnInspectOpen3dCutaway.innerText = `🔍 3D ${closeUpPlate.shortName || "Cutaway"}`;
        btnInspectOpen3dCutaway.dataset.targetPlate = closeUpKey;
      } else if (activePlate !== "full_anterior") {
        btnInspectOpen3dCutaway.style.display = "inline-flex";
        btnInspectOpen3dCutaway.innerText = `⬅ Full 3D Body`;
        btnInspectOpen3dCutaway.dataset.targetPlate = "full_anterior";
      } else {
        btnInspectOpen3dCutaway.style.display = "none";
      }
    }

    // Highlight active organ pill in the 3D Main Body Organs dock
    container.querySelectorAll(".btn-quick-organ").forEach(btn => {
      const isSel = st && btn.dataset.organId === st.id;
      btn.style.background = isSel ? "rgba(56, 189, 248, 0.28)" : "rgba(15, 23, 42, 0.9)";
      btn.style.boxShadow = isSel ? "0 0 12px rgba(56, 189, 248, 0.45)" : "none";
    });
  }

  // Render Scrollable Encyclopedia Index Directory
  function renderEncyclopediaIndex() {
    if (!encyclopediaIndexList) return;
    const q = (searchQuery || "").toLowerCase().trim();
    const filtered = ANATOMICAL_STRUCTURES.filter(s => {
      if (activeSystemFilter !== "all" && s.system !== activeSystemFilter) return false;
      if (!q) return true;
      const meta = getEncyclopediaMeta(s);
      return (
        s.name.toLowerCase().includes(q) ||
        s.latinName.toLowerCase().includes(q) ||
        s.system.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.pathology && s.pathology.toLowerCase().includes(q)) ||
        meta.ta2.toLowerCase().includes(q)
      );
    });

    if (anatomyIndexCount) {
      anatomyIndexCount.innerText = `${filtered.length} / ${ANATOMICAL_STRUCTURES.length} Entries`;
    }

    if (filtered.length === 0) {
      encyclopediaIndexList.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 14px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
          No anatomical structures match "<strong>${searchQuery.replace(/</g, "&lt;")}</strong>". Try clearing the filter.
        </div>
      `;
      return;
    }

    encyclopediaIndexList.innerHTML = filtered.map(s => {
      const sys = ANATOMICAL_SYSTEMS[s.system] || { color: "#38bdf8", icon: "🔬" };
      const isAct = selectedStructure && selectedStructure.id === s.id;
      const meta = getEncyclopediaMeta(s);
      return `
        <button class="atlas-encyclo-chip ${isAct ? 'is-active' : ''}" data-struct-id="${s.id}" title="${s.name} (${s.latinName}) — ${meta.ta2}">
          <div style="min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${sys.color}; flex-shrink: 0;"></span>
              <span style="font-size: 0.77rem; font-weight: 700; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</span>
            </div>
            <div style="font-size: 0.68rem; color: #94a3b8; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 12px;">
              ${s.latinName}
            </div>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.64rem; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 2px 5px; border-radius: 4px; flex-shrink: 0;">
            ${meta.ta2.replace("TA2-", "")}
          </span>
        </button>
      `;
    }).join("");

    encyclopediaIndexList.querySelectorAll(".atlas-encyclo-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const st = ANATOMICAL_STRUCTURES.find(item => item.id === btn.dataset.structId);
        if (!st) return;
        SoundFX.playPop();
        navigateToStructureEncyclopedia(st, 2.4);
      });
    });
  }

  // Navigate to any structure (switches plate/gender/view if needed, updates monograph & centers camera)
  function navigateToStructureEncyclopedia(st, targetZoom = 2.4) {
    if (!st) return;
    if (st.gender && st.gender !== activeGender) {
      activeGender = st.gender;
      updateGenderButtons();
    }
    if (st.plate && st.plate !== activePlate) {
      switchAnatomicalPlate(st.plate);
    } else if (!st.plate && activePlate !== "full_anterior" && activePlate !== "full_posterior" && (!st.plateCoords || !st.plateCoords[activePlate])) {
      switchAnatomicalPlate(st.view === "posterior" && !st.bothViews ? "full_posterior" : "full_anterior");
    } else if (st.view && activeView !== st.view && !st.bothViews) {
      activeView = st.view;
      btnViewAnt?.classList.toggle("btn-primary", activeView === "anterior");
      btnViewAnt?.classList.toggle("btn-secondary", activeView !== "anterior");
      btnViewPost?.classList.toggle("btn-primary", activeView === "posterior");
      btnViewPost?.classList.toggle("btn-secondary", activeView !== "posterior");
      if (activePlate === "full_anterior" && activeView === "posterior") switchAnatomicalPlate("full_posterior");
      if (activePlate === "full_posterior" && activeView === "anterior") switchAnatomicalPlate("full_anterior");
    }
    syncStructureCoordsForPlate(activePlate);
    // Ensure its stratum is visible
    if (getStructureOpacity(st) < 0.25) {
      if (st.layer === 1) layerOpacities.skin = 0.85;
      else if (st.layer === 2) layerOpacities.muscular = 0.9;
      else if (st.layer === 3) layerOpacities.skeletal = 0.95;
      else if (st.layer === 4) layerOpacities.visceral = 1.0;
      else if (st.layer === 5) layerOpacities.circulatory = 1.0;
      else if (st.layer === 6) layerOpacities.nervous = 0.95;
      syncSliders();
    }
    updateInspectorCard(st);
    focusCameraOnCoords(st.coords.x, st.coords.y, targetZoom);
  }

  // Bind 16-Organ 3D Quick-Select Dock buttons
  container.querySelectorAll(".btn-quick-organ").forEach(btn => {
    btn.addEventListener("click", () => {
      const organId = btn.dataset.organId;
      const st = ANATOMICAL_STRUCTURES.find(item => item.id === organId);
      if (!st) return;
      SoundFX.playPop();
      if (activeTab === "histology") switchTab("macro");
      // If user clicks an organ pill while on an unrelated close-up plate, return to 3D Full Body or its matching plate
      if (activePlate !== "full_anterior" && (!st.plateCoords || !st.plateCoords[activePlate])) {
        use3dOrgansMaster = true;
        switchAnatomicalPlate("full_anterior");
      }
      syncStructureCoordsForPlate(activePlate);
      updateInspectorCard(st);
      focusCameraOnCoords(st.coords.x, st.coords.y, activePlate === "full_anterior" ? 2.35 : 1.75);
    });
    btn.addEventListener("dblclick", () => {
      const organId = btn.dataset.organId;
      const st = ANATOMICAL_STRUCTURES.find(item => item.id === organId);
      const closeUpKey = getCloseUpPlateForStructure(st);
      if (closeUpKey) {
        SoundFX.playSuccess();
        switchAnatomicalPlate(closeUpKey);
        syncStructureCoordsForPlate(closeUpKey);
        updateInspectorCard(st);
      }
    });
  });

  // Bind Floating 3D Cutaway & Back-to-Body Buttons
  btnCanvasBackBody?.addEventListener("click", () => {
    SoundFX.playPop();
    use3dOrgansMaster = true;
    switchAnatomicalPlate("full_anterior");
  });

  btnCanvasOpenCutaway?.addEventListener("click", () => {
    const targetPlate = btnCanvasOpenCutaway.dataset.targetPlate || getCloseUpPlateForStructure(selectedStructure);
    if (targetPlate && ANATOMICAL_PLATES[targetPlate]) {
      SoundFX.playPop();
      const preserveStruct = selectedStructure;
      switchAnatomicalPlate(targetPlate);
      if (preserveStruct && preserveStruct.plateCoords && preserveStruct.plateCoords[targetPlate]) {
        syncStructureCoordsForPlate(targetPlate);
        updateInspectorCard(preserveStruct);
      }
    }
  });

  btnInspectOpen3dCutaway?.addEventListener("click", () => {
    const targetPlate = btnInspectOpen3dCutaway.dataset.targetPlate || getCloseUpPlateForStructure(selectedStructure) || "full_anterior";
    if (ANATOMICAL_PLATES[targetPlate]) {
      SoundFX.playPop();
      const preserveStruct = selectedStructure;
      if (targetPlate === "full_anterior") use3dOrgansMaster = true;
      switchAnatomicalPlate(targetPlate);
      if (preserveStruct && (targetPlate === "full_anterior" || (preserveStruct.plateCoords && preserveStruct.plateCoords[targetPlate]))) {
        syncStructureCoordsForPlate(targetPlate);
        updateInspectorCard(preserveStruct);
      }
    }
  });

  // Bind Live 3D Organ Physiology Controls
  const rngMacroHr = document.getElementById("rng-macro-hr");
  const valMacroHr = document.getElementById("val-macro-hr");
  const rngMacroRr = document.getElementById("rng-macro-rr");
  const valMacroRr = document.getElementById("val-macro-rr");
  const btnToggleFlowParticles = document.getElementById("btn-toggle-flow-particles");
  const btnToggle3dTilt = document.getElementById("btn-toggle-3d-tilt");
  const btnRestore3dOrgans = document.getElementById("btn-restore-3d-organs");

  rngMacroHr?.addEventListener("input", (e) => {
    histoState.heartRate = parseInt(e.target.value, 10) || 72;
    if (valMacroHr) valMacroHr.innerText = `${histoState.heartRate} BPM`;
    updateTopTelemetryRibbon();
  });

  rngMacroRr?.addEventListener("input", (e) => {
    breathRate = parseInt(e.target.value, 10) || 15;
    if (valMacroRr) valMacroRr.innerText = `${breathRate} /min`;
    updateTopTelemetryRibbon();
  });

  btnToggleFlowParticles?.addEventListener("click", () => {
    liveFlowParticles = !liveFlowParticles;
    SoundFX.playClick();
    btnToggleFlowParticles.innerText = `✨ Live 3D Flows: ${liveFlowParticles ? "ON" : "OFF"}`;
    btnToggleFlowParticles.classList.toggle("btn-primary", liveFlowParticles);
    btnToggleFlowParticles.classList.toggle("btn-secondary", !liveFlowParticles);
  });

  btnToggle3dTilt?.addEventListener("click", () => {
    orbit3dEnabled = !orbit3dEnabled;
    if (!orbit3dEnabled) {
      pointerTiltX = 0;
      pointerTiltY = 0;
    }
    SoundFX.playClick();
    btnToggle3dTilt.innerText = `🔄 3D Tilt: ${orbit3dEnabled ? "ON" : "OFF"}`;
    btnToggle3dTilt.classList.toggle("btn-primary", orbit3dEnabled);
    btnToggle3dTilt.classList.toggle("btn-secondary", !orbit3dEnabled);
  });

  btnRestore3dOrgans?.addEventListener("click", () => {
    SoundFX.playPop();
    use3dOrgansMaster = true;
    layerOpacities.skin = 0.25;
    layerOpacities.muscular = 0.85;
    layerOpacities.skeletal = 0.95;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 1.0;
    layerOpacities.nervous = 0.90;
    syncSliders();
    switchAnatomicalPlate("full_anterior");
    if (canvasModeText) {
      canvasModeText.innerText = "🧍 4K 3D Main Body Organs View • Live Biomechanical Breathing & Heartbeat";
    }
  });

  // Bind System Filter Pills in Encyclopedia Index
  container.querySelectorAll("#encyclopedia-system-pills .atlas-sys-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      activeSystemFilter = pill.dataset.sys || "all";
      SoundFX.playClick();
      container.querySelectorAll("#encyclopedia-system-pills .atlas-sys-pill").forEach(p => {
        p.classList.toggle("is-active", p.dataset.sys === activeSystemFilter);
      });
      renderEncyclopediaIndex();
    });
  });

  // Callout Label Mode Toggle ('smart' -> 'all' -> 'pins')
  btnCalloutMode?.addEventListener("click", () => {
    SoundFX.playClick();
    if (calloutMode === "smart") {
      calloutMode = "all";
      btnCalloutMode.innerText = "📖 Labels: All Atlas Callouts";
      btnCalloutMode.style.background = "rgba(56, 189, 248, 0.2)";
    } else if (calloutMode === "all") {
      calloutMode = "pins";
      btnCalloutMode.innerText = "🎯 Labels: Pins Only";
      btnCalloutMode.style.background = "";
    } else {
      calloutMode = "smart";
      btnCalloutMode.innerText = "📌 Labels: Smart";
      btnCalloutMode.style.background = "";
    }
  });

  // Layer Slider Listeners
  const bindSlider = (slider, key, valDisp) => {
    slider?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      layerOpacities[key] = val / 100;
      // When user manually drags a dissection layer slider on full_anterior, blend the 6-layer PNG strata
      if (key === "skin" || key === "muscular" || key === "skeletal") {
        use3dOrgansMaster = false;
      }
      document.getElementById(valDisp).innerText = `${Math.round(val)}%`;
    });
  };
  bindSlider(rngSkin, "skin", "val-skin");
  bindSlider(rngMuscular, "muscular", "val-muscular");
  bindSlider(rngSkeletal, "skeletal", "val-skeletal");
  bindSlider(rngVisceral, "visceral", "val-visceral");
  bindSlider(rngCirculatory, "circulatory", "val-circulatory");
  bindSlider(rngNervous, "nervous", "val-nervous");

  // Quick Layer Isolators (Operating on registered identical-silhouette body strata)
  const ensureFullBodyMacro = () => {
    if (activePlate !== "full_anterior" && activePlate !== "full_posterior") {
      switchAnatomicalPlate(activeView === "posterior" ? "full_posterior" : "full_anterior");
    }
  };

  document.getElementById("btn-isolate-skeletal")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    use3dOrgansMaster = false;
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 1.0;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 0.0;
    layerOpacities.nervous = 0.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "💀 Skeletal System Isolated • Pure 206-Bone Osteology Dissection";
    }
  });

  document.getElementById("btn-isolate-muscular")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    use3dOrgansMaster = false;
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 1.0;
    layerOpacities.skeletal = 0.0;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 0.0;
    layerOpacities.nervous = 0.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "💪 Muscular System Isolated • Superficial & Deep Skeletal Myology";
    }
  });

  document.getElementById("btn-isolate-viscera")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    use3dOrgansMaster = true;
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 0.18;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 1.0;
    layerOpacities.nervous = 0.85;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "🍽️ 3D Internal Viscera Isolated • Colorful Thoracic & Abdominal Organs";
    }
  });

  document.getElementById("btn-isolate-neuro")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    use3dOrgansMaster = false;
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 0.18;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 0.85;
    layerOpacities.nervous = 1.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "⚡ Neurovascular Matrix Isolated • Angiology & Neural Conduction Networks";
    }
  });

  document.getElementById("btn-reset-layers")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    use3dOrgansMaster = true;
    layerOpacities.skin = 0.35;
    layerOpacities.muscular = 0.70;
    layerOpacities.skeletal = 0.85;
    layerOpacities.visceral = 0.90;
    layerOpacities.circulatory = 0.80;
    layerOpacities.nervous = 0.70;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "🧍 4K 3D Main Body Organs View Restored • Full Volumetric Clarity";
    }
  });

  function syncSliders() {
    if (rngSkin) { rngSkin.value = Math.round(layerOpacities.skin * 100); document.getElementById("val-skin").innerText = `${Math.round(layerOpacities.skin * 100)}%`; }
    if (rngMuscular) { rngMuscular.value = Math.round(layerOpacities.muscular * 100); document.getElementById("val-muscular").innerText = `${Math.round(layerOpacities.muscular * 100)}%`; }
    if (rngSkeletal) { rngSkeletal.value = Math.round(layerOpacities.skeletal * 100); document.getElementById("val-skeletal").innerText = `${Math.round(layerOpacities.skeletal * 100)}%`; }
    if (rngVisceral) { rngVisceral.value = Math.round(layerOpacities.visceral * 100); document.getElementById("val-visceral").innerText = `${Math.round(layerOpacities.visceral * 100)}%`; }
    if (rngCirculatory) { rngCirculatory.value = Math.round(layerOpacities.circulatory * 100); document.getElementById("val-circulatory").innerText = `${Math.round(layerOpacities.circulatory * 100)}%`; }
    if (rngNervous) { rngNervous.value = Math.round(layerOpacities.nervous * 100); document.getElementById("val-nervous").innerText = `${Math.round(layerOpacities.nervous * 100)}%`; }
  }

  // Focus camera directly on selected structure
  btnFocusStructure?.addEventListener("click", () => {
    if (!selectedStructure) return;
    SoundFX.playPop();
    syncStructureCoordsForPlate(activePlate);
    focusCameraOnCoords(selectedStructure.coords.x, selectedStructure.coords.y, 2.8);
  });

  function focusCameraOnCoords(targetX, targetY, targetZoom = 3.0) {
    zoom = targetZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    // Center of canvas is (width/2, height/2). In normalized 1000x1800 coordinate space:
    const canvasRect = canvas.getBoundingClientRect();
    const w = canvasRect.width || 600;
    const h = canvasRect.height || 660;
    const scale = (h / 1800) * zoom;
    panX = (w / 2) - (targetX * scale);
    panY = (h / 2) - (targetY * scale);
    updateTopTelemetryRibbon();
  }

  // Update Encyclopedia Monograph Card
  function updateInspectorCard(structure) {
    if (!structure) return;
    selectedStructure = structure;
    const sys = ANATOMICAL_SYSTEMS[structure.system] || { name: structure.system, color: "#38bdf8", badgeBg: "rgba(56, 189, 248, 0.15)", badgeBorder: "rgba(56, 189, 248, 0.3)" };
    const meta = getEncyclopediaMeta(structure);

    const badge = document.getElementById("inspect-system-badge");
    if (badge) {
      badge.innerText = sys.name;
      badge.style.color = sys.color;
      badge.style.background = sys.badgeBg;
      badge.style.borderColor = sys.badgeBorder;
    }
    const ta2Badge = document.getElementById("inspect-ta2-badge");
    if (ta2Badge) ta2Badge.innerText = meta.ta2;
    const layerBadge = document.getElementById("inspect-layer-badge");
    if (layerBadge) {
      const regLabel = (structure.region || "body").replace("_", " ").toUpperCase();
      layerBadge.innerText = `Stratum ${structure.layer || 4} • ${regLabel}`;
    }

    const title = document.getElementById("inspect-title");
    if (title) title.innerText = structure.name;
    const latin = document.getElementById("inspect-latin");
    if (latin) latin.innerText = structure.latinName;
    const desc = document.getElementById("inspect-desc");
    if (desc) desc.innerText = structure.description;
    const fn = document.getElementById("inspect-function");
    if (fn) fn.innerText = structure.function;
    const vasc = document.getElementById("inspect-vascular");
    if (vasc) vasc.innerText = structure.vascularization;
    const nerve = document.getElementById("inspect-nerve");
    if (nerve) nerve.innerText = structure.innervation;
    const path = document.getElementById("inspect-pathology");
    if (path) path.innerText = structure.pathology;

    const bioEl = document.getElementById("inspect-biometrics");
    if (bioEl) bioEl.innerText = meta.biometrics;
    const germEl = document.getElementById("inspect-germ-layer");
    if (germEl) germEl.innerText = meta.germ;
    const histoEl = document.getElementById("inspect-histology-type");
    if (histoEl) histoEl.innerText = meta.histology;
    const pearlEl = document.getElementById("inspect-diagnostic-pearl");
    if (pearlEl) pearlEl.innerText = meta.pearl;

    // Populate Related Anatomical Structures Cross-References
    const relatedContainer = document.getElementById("inspect-related-chips");
    if (relatedContainer) {
      const related = ANATOMICAL_STRUCTURES.filter(s => s.id !== structure.id && (s.region === structure.region || s.system === structure.system)).slice(0, 5);
      relatedContainer.innerHTML = related.map(r => {
        const rSys = ANATOMICAL_SYSTEMS[r.system] || { color: "#38bdf8" };
        return `
          <button class="btn btn-secondary btn-sm btn-related-jump" data-rel-id="${r.id}" style="padding: 3px 9px; font-size: 0.72rem; border-radius: 999px; display: inline-flex; align-items: center; gap: 5px; border-color: rgba(148, 163, 184, 0.25);">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${rSys.color};"></span>
            <span>${r.name}</span>
          </button>
        `;
      }).join("");
      relatedContainer.querySelectorAll(".btn-related-jump").forEach(b => {
        b.addEventListener("click", () => {
          const target = ANATOMICAL_STRUCTURES.find(item => item.id === b.dataset.relId);
          if (target) {
            SoundFX.playPop();
            navigateToStructureEncyclopedia(target, 2.4);
          }
        });
      });
    }

    const auscBtn = document.getElementById("btn-inspect-auscultate");
    const auscIcon = document.getElementById("btn-inspect-auscultate-icon");
    const auscLabel = document.getElementById("btn-inspect-auscultate-label");
    if (auscBtn && auscLabel) {
      if (structure.system === "circulatory") {
        if (auscIcon) auscIcon.innerText = "🫀";
        auscLabel.innerText = "Auscultate Cardiac Sounds (S1/S2)";
      } else if (structure.system === "respiratory") {
        if (auscIcon) auscIcon.innerText = "🫁";
        auscLabel.innerText = "Auscultate Vesicular Breath Sounds";
      } else if (structure.system === "nervous") {
        if (auscIcon) auscIcon.innerText = "⚡";
        auscLabel.innerText = "Trigger Bioelectric Action Potential";
      } else {
        if (auscIcon) auscIcon.innerText = "🎯";
        auscLabel.innerText = "Zoom 3.0× on Anatomical Landmark";
      }
    }

    const histoBtnLabel = document.getElementById("btn-inspect-open-histology-label");
    if (histoBtnLabel) {
      const m = HISTOLOGY_SIMULATION_MODELS[meta.histoModel];
      histoBtnLabel.innerText = m ? `Sim: ${m.title.split("&")[0].trim()}` : "Launch Tissue Histology Sim";
    }

    update3dCutawayButtons(structure);
    renderEncyclopediaIndex();
    updateTopTelemetryRibbon();
  }

  // Auscultate / Bio-telemetry action trigger
  document.getElementById("btn-inspect-auscultate")?.addEventListener("click", () => {
    if (!selectedStructure) return;
    if (selectedStructure.system === "circulatory") {
      playHeartSound(true);
      setTimeout(() => playHeartSound(false), 260);
    } else if (selectedStructure.system === "respiratory") {
      playBreathSound();
    } else if (selectedStructure.system === "nervous") {
      SoundFX.playPop();
      activeHistologyModel = "neuron_synapse";
      if (selHistologyModel) selHistologyModel.value = "neuron_synapse";
      histoState.actionPotentialStim = true;
      histoState.apPhaseProgress = 0;
      switchTab("histology");
    } else {
      SoundFX.playPop();
      focusCameraOnCoords(selectedStructure.coords.x, selectedStructure.coords.y, 3.0);
    }
  });

  // Open corresponding Microscopic Histology Simulator directly from Monograph
  document.getElementById("btn-inspect-open-histology")?.addEventListener("click", () => {
    if (!selectedStructure) return;
    const meta = getEncyclopediaMeta(selectedStructure);
    activeHistologyModel = meta.histoModel || "cardiac_cycle";
    if (selHistologyModel) selHistologyModel.value = activeHistologyModel;
    switchTab("histology");
  });

  // Dedicated 13-Plate Anatomical Switcher
  function switchAnatomicalPlate(plateKey) {
    if (!ANATOMICAL_PLATES || !ANATOMICAL_PLATES[plateKey]) return;
    activePlate = plateKey;
    syncStructureCoordsForPlate(plateKey);

    const p = ANATOMICAL_PLATES[plateKey];
    if (p.view) {
      activeView = p.view;
      btnViewAnt?.classList.toggle("btn-primary", activeView === "anterior");
      btnViewAnt?.classList.toggle("btn-secondary", activeView !== "anterior");
      btnViewPost?.classList.toggle("btn-primary", activeView === "posterior");
      btnViewPost?.classList.toggle("btn-secondary", activeView !== "posterior");
    }
    SoundFX.playPop();

    // Frame the plate at its optimal 3D camera zoom & center
    const defCam = getDefaultPlateCamera(plateKey);
    focusCameraOnCoords(defCam.x, defCam.y, defCam.zoom);

    // Intelligent layer opacity adaptation for dedicated plates
    if (plateKey === "skeletal") {
      layerOpacities.skeletal = 1.0;
      layerOpacities.skin = 0.0;
      layerOpacities.muscular = 0.05;
      layerOpacities.visceral = 0.0;
      syncSliders();
    } else if (plateKey === "muscular") {
      layerOpacities.muscular = 1.0;
      layerOpacities.skin = 0.0;
      layerOpacities.skeletal = 0.35;
      layerOpacities.visceral = 0.0;
      syncSliders();
    } else if (plateKey === "digestive") {
      layerOpacities.visceral = 1.0;
      layerOpacities.skeletal = 0.2;
      layerOpacities.skin = 0.0;
      layerOpacities.muscular = 0.0;
      syncSliders();
    } else if (plateKey === "heart") {
      layerOpacities.circulatory = 1.0;
      layerOpacities.visceral = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "brain") {
      layerOpacities.nervous = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "lungs") {
      layerOpacities.visceral = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "urinary") {
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "male_reproductive") {
      activeGender = "male";
      updateGenderButtons();
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 0.6;
      layerOpacities.muscular = 0.15;
      layerOpacities.skeletal = 0.1;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "female_reproductive") {
      activeGender = "female";
      updateGenderButtons();
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 0.6;
      layerOpacities.muscular = 0.15;
      layerOpacities.skeletal = 0.1;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "full_anterior") {
      use3dOrgansMaster = true;
      layerOpacities.skin = 0.25;
      layerOpacities.muscular = 0.85;
      layerOpacities.skeletal = 0.95;
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 1.0;
      layerOpacities.nervous = 0.90;
      syncSliders();
    } else if (plateKey === "full_posterior") {
      layerOpacities.skin = 0.25;
      layerOpacities.muscular = 0.85;
      layerOpacities.skeletal = 0.95;
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 1.0;
      layerOpacities.nervous = 0.90;
      syncSliders();
    }

    // Auto-select relevant structure
    const candidate = ANATOMICAL_STRUCTURES.find(s => s.plate === plateKey) ||
                      ANATOMICAL_STRUCTURES.find(s => s.plateCoords && s.plateCoords[plateKey]) ||
                      ANATOMICAL_STRUCTURES.find(s => p.system !== "all" && s.system === p.system) ||
                      ANATOMICAL_STRUCTURES.find(s => s.view === activeView);
    if (candidate) {
      updateInspectorCard(candidate);
    }

    // Update buttons in plate strip
    container.querySelectorAll(".btn-plate-select").forEach(b => {
      const match = b.dataset.plate === plateKey;
      b.classList.toggle("btn-primary", match);
      b.classList.toggle("btn-secondary", !match);
    });

    // Update banner text
    if (canvasModeText) {
      canvasModeText.innerText = `${p.name} • 4K 3D Volumetric Plate • Click Pin to Inspect • Drag to Pan • Wheel/Pinch to Zoom`;
    }
    updateTopTelemetryRibbon();
  }

  container.querySelectorAll(".btn-plate-select").forEach(b => {
    b.addEventListener("click", () => {
      switchAnatomicalPlate(b.dataset.plate);
    });
  });

  // Search input filter & clear button
  inputSearch?.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (btnClearSearch) btnClearSearch.style.display = searchQuery ? "block" : "none";
    renderEncyclopediaIndex();
    if (!searchQuery) return;
    const match = ANATOMICAL_STRUCTURES.find(s => 
      s.name.toLowerCase().includes(searchQuery) ||
      s.latinName.toLowerCase().includes(searchQuery) ||
      s.system.toLowerCase().includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery)
    );
    if (match) {
      if (match.plate && match.plate !== activePlate) {
        switchAnatomicalPlate(match.plate);
      } else if (activeView !== match.view && !match.bothViews) {
        activeView = match.view;
        btnViewAnt.classList.toggle("btn-primary", activeView === "anterior");
        btnViewAnt.classList.toggle("btn-secondary", activeView !== "anterior");
        btnViewPost.classList.toggle("btn-primary", activeView === "posterior");
        btnViewPost.classList.toggle("btn-secondary", activeView !== "posterior");
      }
      syncStructureCoordsForPlate(activePlate);
      updateInspectorCard(match);
      focusCameraOnCoords(match.coords.x, match.coords.y, 2.5);
    }
  });

  btnClearSearch?.addEventListener("click", () => {
    searchQuery = "";
    if (inputSearch) inputSearch.value = "";
    btnClearSearch.style.display = "none";
    renderEncyclopediaIndex();
  });

  // Tab Switching
  function switchTab(newTab) {
    activeTab = newTab;
    btnTabMacro.classList.toggle("btn-primary", activeTab === "macro");
    btnTabMacro.classList.toggle("btn-secondary", activeTab !== "macro");
    btnTabHistology.classList.toggle("btn-primary", activeTab === "histology");
    btnTabHistology.classList.toggle("btn-secondary", activeTab !== "histology");
    btnTabQuiz.classList.toggle("btn-primary", activeTab === "quiz");
    btnTabQuiz.classList.toggle("btn-secondary", activeTab !== "quiz");

    panelMacroInspector.style.display = (activeTab === "macro" || activeTab === "quiz") ? "flex" : "none";
    panelHistologyController.style.display = (activeTab === "histology") ? "flex" : "none";
    dissectionControlPanel.style.display = (activeTab === "macro") ? "flex" : "none";
    quizPromptBanner.style.display = (activeTab === "quiz") ? "flex" : "none";

    if (activeTab === "macro") {
      const p = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[activePlate] : null;
      canvasModeText.innerText = p ? `${p.name} • 4K 3D Volumetric Plate • Click Pin to Inspect • Double-Click for 3D Cutaway` : "4K 3D Anatomical Matrix • Drag to Pan • Wheel/Pinch to Zoom";
    } else if (activeTab === "histology") {
      canvasModeText.innerText = "60 FPS Microscopic Histology & Physiological Workbench • Live Quantitative Telemetry";
      renderHistologyControls();
    } else if (activeTab === "quiz") {
      canvasModeText.innerText = "🎯 Topographical Pin Challenge: Tap the target anatomical landmark!";
      selectNewQuizTarget();
      updateQuizBanner();
    }
    update3dCutawayButtons(selectedStructure);
    updateTopTelemetryRibbon();
    SoundFX.playClick();
  }

  btnTabMacro?.addEventListener("click", () => switchTab("macro"));
  btnTabHistology?.addEventListener("click", () => switchTab("histology"));
  btnTabQuiz?.addEventListener("click", () => switchTab("quiz"));

  // View Angle Toggle
  btnViewAnt?.addEventListener("click", () => {
    activeView = "anterior";
    btnViewAnt.classList.add("btn-primary");
    btnViewAnt.classList.remove("btn-secondary");
    btnViewPost.classList.remove("btn-primary");
    btnViewPost.classList.add("btn-secondary");
    if (activePlate === "full_posterior") {
      switchAnatomicalPlate("full_anterior");
    }
    updateTopTelemetryRibbon();
    SoundFX.playClick();
  });
  btnViewPost?.addEventListener("click", () => {
    activeView = "posterior";
    btnViewPost.classList.add("btn-primary");
    btnViewPost.classList.remove("btn-secondary");
    btnViewAnt.classList.remove("btn-primary");
    btnViewAnt.classList.add("btn-secondary");
    switchAnatomicalPlate("full_posterior");
    updateTopTelemetryRibbon();
    SoundFX.playClick();
  });

  // Gender Model Switcher
  function updateGenderButtons() {
    btnGenderMale?.classList.toggle("btn-primary", activeGender === "male");
    btnGenderMale?.classList.toggle("btn-secondary", activeGender !== "male");
    btnGenderFemale?.classList.toggle("btn-primary", activeGender === "female");
    btnGenderFemale?.classList.toggle("btn-secondary", activeGender !== "female");
    updateTopTelemetryRibbon();
  }

  btnGenderMale?.addEventListener("click", () => {
    activeGender = "male";
    updateGenderButtons();
    if (activePlate === "female_reproductive") {
      switchAnatomicalPlate("male_reproductive");
    }
    SoundFX.playClick();
  });

  btnGenderFemale?.addEventListener("click", () => {
    activeGender = "female";
    updateGenderButtons();
    if (activePlate === "male_reproductive") {
      switchAnatomicalPlate("female_reproductive");
    }
    SoundFX.playClick();
  });

  // Imaging Mode Switcher
  function updateImagingButtons() {
    btnImagingPhoto?.classList.toggle("btn-primary", imagingMode === "photo");
    btnImagingPhoto?.classList.toggle("btn-secondary", imagingMode !== "photo");
    btnImagingXray?.classList.toggle("btn-primary", imagingMode === "xray");
    btnImagingXray?.classList.toggle("btn-secondary", imagingMode !== "xray");
    btnImagingAngio?.classList.toggle("btn-primary", imagingMode === "angiogram");
    btnImagingAngio?.classList.toggle("btn-secondary", imagingMode !== "angiogram");
    updateTopTelemetryRibbon();
  }

  btnImagingPhoto?.addEventListener("click", () => {
    imagingMode = "photo";
    updateImagingButtons();
    SoundFX.playClick();
  });
  btnImagingXray?.addEventListener("click", () => {
    imagingMode = "xray";
    updateImagingButtons();
    SoundFX.playClick();
  });
  btnImagingAngio?.addEventListener("click", () => {
    imagingMode = "angiogram";
    updateImagingButtons();
    SoundFX.playClick();
  });

  // Regional Jump
  selRegionJump?.addEventListener("change", (e) => {
    const reg = e.target.value;
    activeRegion = reg;
    SoundFX.playClick();
    if (reg === "all") {
      const defCam = getDefaultPlateCamera(activePlate);
      focusCameraOnCoords(defCam.x, defCam.y, defCam.zoom);
    } else if (reg === "head") {
      focusCameraOnCoords(500, 155, 3.0);
    } else if (reg === "thorax") {
      focusCameraOnCoords(500, 420, 2.7);
    } else if (reg === "abdomen") {
      focusCameraOnCoords(500, 620, 2.7);
    } else if (reg === "pelvis") {
      focusCameraOnCoords(500, 820, 2.7);
    } else if (reg === "upper_limb") {
      focusCameraOnCoords(330, 450, 2.4);
    } else if (reg === "lower_limb") {
      focusCameraOnCoords(440, 1200, 2.2);
    }
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
  });

  // Zoom buttons (Smooth & centered on viewport midpoint)
  btnZoomIn?.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    const cx = (rect.width || 600) / 2;
    const cy = (rect.height || 660) / 2;
    const newZoom = Math.min(12.0, zoom * 1.35);
    panX = cx - (cx - panX) * (newZoom / zoom);
    panY = cy - (cy - panY) * (newZoom / zoom);
    zoom = newZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    updateTopTelemetryRibbon();
    SoundFX.playClick();
  });
  btnZoomOut?.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    const cx = (rect.width || 600) / 2;
    const cy = (rect.height || 660) / 2;
    const newZoom = Math.max(0.4, zoom / 1.35);
    panX = cx - (cx - panX) * (newZoom / zoom);
    panY = cy - (cy - panY) * (newZoom / zoom);
    zoom = newZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    updateTopTelemetryRibbon();
    SoundFX.playClick();
  });
  btnZoomReset?.addEventListener("click", () => {
    const defCam = getDefaultPlateCamera(activePlate);
    focusCameraOnCoords(defCam.x, defCam.y, defCam.zoom);
    SoundFX.playClick();
  });

  // Quiz Hint & Skip
  btnQuizHint?.addEventListener("click", () => {
    if (!quizState.targetStructure) return;
    SoundFX.playPop();
    quizState.hintActive = true;
    const sys = ANATOMICAL_SYSTEMS[quizState.targetStructure.system];
    quizState.feedbackMsg = `💡 Clue: Located in the ${(quizState.targetStructure.region || "body").toUpperCase()} (${sys?.name || quizState.targetStructure.system}) — ${quizState.targetStructure.function.slice(0, 95)}...`;
    quizState.feedbackType = "neutral";
    updateQuizBanner();
  });

  btnQuizSkip?.addEventListener("click", () => {
    quizState.totalQuestions++;
    quizState.streak = 0;
    selectNewQuizTarget();
    updateQuizBanner();
  });

  function updateQuizBanner() {
    if (!quizState.targetStructure) return;
    if (quizTargetText) {
      const meta = getEncyclopediaMeta(quizState.targetStructure);
      quizTargetText.innerHTML = `
        <span style="color: #38bdf8;">${quizState.targetStructure.name}</span>
        <span style="font-size: 0.85rem; color: var(--text-dim); font-style: italic;"> (${quizState.targetStructure.latinName} • ${meta.ta2})</span>
      `;
    }
    if (quizFeedbackPill) {
      quizFeedbackPill.innerText = quizState.feedbackMsg || "";
      quizFeedbackPill.style.color = quizState.feedbackType === "correct" ? "#34d399" : (quizState.feedbackType === "wrong" ? "#f87171" : "#cbd5e1");
    }
    if (quizScoreBadge) {
      const pct = quizState.totalQuestions > 0 ? Math.round((quizState.score / quizState.totalQuestions) * 100) : 0;
      quizScoreBadge.innerText = `Score: ${quizState.score} / ${quizState.totalQuestions} (${pct}%) • Streak: ${quizState.streak}`;
    }
    updateTopTelemetryRibbon();
  }

  // Initialize Encyclopedia Index and Initial Monograph on Mount
  syncStructureCoordsForPlate(activePlate);
  updateInspectorCard(selectedStructure);

  // Pointer & Touch Interaction State
  let touchStartDist = 0;
  let touchStartZoom = 1.0;
  let isPinching = false;
  let pinchAnchorModelX = 500;
  let pinchAnchorModelY = 900;
  let totalDragDistance = 0;
  let lastTouchTapTime = 0;
  let lastTouchTapPos = { x: 0, y: 0 };
  let hasCenteredInitialView = false;

  // Safe canvas coordinate extractor (handles mouse, pointer, touch, and touchend)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const clientX = touch ? touch.clientX : (e.clientX !== undefined ? e.clientX : rect.left);
    const clientY = touch ? touch.clientY : (e.clientY !== undefined ? e.clientY : rect.top);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width || 600,
      height: rect.height || 640
    };
  }

  function canvasToNormalizedCoords(cx, cy, width, height) {
    const scale = (height / 1800) * zoom;
    const nx = (cx - panX) / scale;
    const ny = (cy - panY) / scale;
    return { x: nx, y: ny };
  }

  // Mouse / Stylus Pointer Handlers (explicitly ignore 'touch' pointers to prevent dual-firing with touchstart)
  function handlePointerDown(e) {
    if (e.pointerType === "touch") return;
    isDragging = true;
    totalDragDistance = 0;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    canvas.style.cursor = "grabbing";
  }

  function handlePointerMove(e) {
    if (e.pointerType === "touch") return;
    const coords = getCanvasCoords(e);
    if (orbit3dEnabled && coords.width > 0 && coords.height > 0) {
      const relX = (coords.x / coords.width) - 0.5;
      const relY = (coords.y / coords.height) - 0.5;
      if (relX >= -0.6 && relX <= 0.6 && relY >= -0.6 && relY <= 0.6) {
        pointerTiltX = Math.max(-1, Math.min(1, relX * 2));
        pointerTiltY = Math.max(-1, Math.min(1, relY * 2));
      }
    }
    if (isDragging) {
      const nextPanX = e.clientX - dragStartX;
      const nextPanY = e.clientY - dragStartY;
      totalDragDistance += Math.hypot(nextPanX - panX, nextPanY - panY);
      panX = nextPanX;
      panY = nextPanY;
    } else {
      // Hover detection on active plate pins
      const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
      const hitRadius = 38 / zoom; // Screen pixel normalized radius
      const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.12);
      const found = visible.find(s => {
        const dx = s.coords.x - norm.x;
        const dy = s.coords.y - norm.y;
        return Math.hypot(dx, dy) <= hitRadius;
      });
      hoveredStructure = found || null;
      canvas.style.cursor = hoveredStructure ? "pointer" : "grab";
    }
  }

  function handlePointerUp(e) {
    if (e.pointerType === "touch") return;
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  // Multi-Touch Two-Finger Pinch-to-Zoom & Anchored Panning Engine
  canvas.addEventListener("touchstart", (e) => {
    e.stopPropagation();

    if (e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      isDragging = false;
      isPinching = true;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartDist = Math.max(dist, 10);
      touchStartZoom = zoom;

      const rect = canvas.getBoundingClientRect();
      const midCanvasX = ((t1.clientX + t2.clientX) / 2) - rect.left;
      const midCanvasY = ((t1.clientY + t2.clientY) / 2) - rect.top;

      // Calculate model coordinates beneath midpoint of fingers:
      const scale = (rect.height / 1800) * zoom;
      pinchAnchorModelX = (midCanvasX - panX) / scale;
      pinchAnchorModelY = (midCanvasY - panY) / scale;

    } else if (e.touches.length === 1 && !isPinching) {
      const t = e.touches[0];
      isDragging = true;
      totalDragDistance = 0;
      dragStartX = t.clientX - panX;
      dragStartY = t.clientY - panY;

      // Double-Tap gesture to zoom in or reset
      const now = performance.now();
      const dt = now - lastTouchTapTime;
      const distFromLastTap = Math.hypot(t.clientX - lastTouchTapPos.x, t.clientY - lastTouchTapPos.y);

      if (dt < 320 && distFromLastTap < 32) {
        if (e.cancelable) e.preventDefault();
        SoundFX.playPop();
        const rect = canvas.getBoundingClientRect();
        const tapCanvasX = t.clientX - rect.left;
        const tapCanvasY = t.clientY - rect.top;

        if (zoom > 2.2) {
          const defCam = getDefaultPlateCamera(activePlate);
          focusCameraOnCoords(defCam.x, defCam.y, defCam.zoom);
        } else {
          // Zoom in 2.8x centered at tap point
          const scale = (rect.height / 1800) * zoom;
          const targetModelX = (tapCanvasX - panX) / scale;
          const targetModelY = (tapCanvasY - panY) / scale;
          focusCameraOnCoords(targetModelX, targetModelY, 2.8);
        }
        isDragging = false;
        lastTouchTapTime = 0;
        return;
      }
      lastTouchTapTime = now;
      lastTouchTapPos = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.stopPropagation();

    if (e.touches.length === 2 && isPinching && touchStartDist > 0) {
      if (e.cancelable) e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchStartDist;

      // Clamped continuous zoom factor
      const newZoom = Math.max(0.4, Math.min(12.0, touchStartZoom * ratio));

      const rect = canvas.getBoundingClientRect();
      const midCanvasX = ((t1.clientX + t2.clientX) / 2) - rect.left;
      const midCanvasY = ((t1.clientY + t2.clientY) / 2) - rect.top;

      // Mathematically anchored transform keeps anatomical point pinned under fingers
      const newScale = (rect.height / 1800) * newZoom;
      panX = midCanvasX - (pinchAnchorModelX * newScale);
      panY = midCanvasY - (pinchAnchorModelY * newScale);
      zoom = newZoom;

      totalDragDistance += 20;
      if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;

    } else if (e.touches.length === 1 && isDragging && !isPinching) {
      if (e.cancelable) e.preventDefault();
      const nextPanX = e.touches[0].clientX - dragStartX;
      const nextPanY = e.touches[0].clientY - dragStartY;
      totalDragDistance += Math.hypot(nextPanX - panX, nextPanY - panY);
      panX = nextPanX;
      panY = nextPanY;
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.stopPropagation();

    if (e.touches.length === 1) {
      // Seamless finger transition: 1 finger lifted while pinching, transfer to 1-finger drag
      isPinching = false;
      touchStartDist = 0;
      isDragging = true;
      dragStartX = e.touches[0].clientX - panX;
      dragStartY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 0) {
      isPinching = false;
      touchStartDist = 0;
      isDragging = false;
    }
  });

  canvas.addEventListener("touchcancel", (e) => {
    isPinching = false;
    touchStartDist = 0;
    isDragging = false;
  });

  // Click on pin with drag guard (ignores click if user was panning/pinching)
  canvas.addEventListener("click", (e) => {
    if (totalDragDistance > 8) {
      totalDragDistance = 0;
      return;
    }

    const coords = getCanvasCoords(e);
    const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
    const hitRadius = 42 / zoom;
    const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.12);
    const clicked = visible.find(s => {
      const dx = s.coords.x - norm.x;
      const dy = s.coords.y - norm.y;
      return Math.hypot(dx, dy) <= hitRadius;
    });

    if (clicked) {
      SoundFX.playPop();
      if (activeTab === "quiz") {
        quizState.totalQuestions++;
        if (quizState.targetStructure && clicked.id === quizState.targetStructure.id) {
          quizState.score++;
          quizState.streak++;
          SoundFX.playSuccess();
          quizState.feedbackType = "correct";
          quizState.feedbackMsg = `✅ Correct! ${clicked.name} (${clicked.latinName})`;
          updateInspectorCard(clicked);
          setTimeout(() => {
            selectNewQuizTarget();
          }, 900);
        } else {
          quizState.streak = 0;
          quizState.feedbackType = "wrong";
          quizState.feedbackMsg = `❌ Clicked ${clicked.name} — Locate ${quizState.targetStructure?.name || "target"}`;
        }
        updateQuizBanner();
      } else {
        updateInspectorCard(clicked);
      }
    }
  });

  // Double-click on an organ pin opens its 4K 3D Internal Cutaway Plate (or returns to 3D Full Body)
  canvas.addEventListener("dblclick", (e) => {
    if (activeTab !== "macro") return;
    const coords = getCanvasCoords(e);
    const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
    const hitRadius = 46 / zoom;
    const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.12);
    const clicked = visible.find(s => {
      const dx = s.coords.x - norm.x;
      const dy = s.coords.y - norm.y;
      return Math.hypot(dx, dy) <= hitRadius;
    });
    if (clicked) {
      const closeUpKey = getCloseUpPlateForStructure(clicked);
      if (closeUpKey && activePlate !== closeUpKey && ANATOMICAL_PLATES[closeUpKey]) {
        SoundFX.playSuccess();
        switchAnatomicalPlate(closeUpKey);
        if (clicked.plateCoords && clicked.plateCoords[closeUpKey]) {
          syncStructureCoordsForPlate(closeUpKey);
          updateInspectorCard(clicked);
        }
      }
    }
  });

  // Trackpad Pinch (Ctrl+Wheel) & Mouse Wheel Zoom
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let newZoom;
    if (e.ctrlKey) {
      // Continuous smooth trackpad pinch gesture
      const factor = Math.exp(-e.deltaY * 0.012);
      newZoom = Math.max(0.4, Math.min(12.0, zoom * factor));
    } else {
      // Discrete mouse wheel stepped zoom
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      newZoom = Math.max(0.4, Math.min(12.0, zoom * zoomFactor));
    }

    // Zoom centered on cursor
    const coords = getCanvasCoords(e);
    const mouseX = coords.x;
    const mouseY = coords.y;

    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;

    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    updateTopTelemetryRibbon();
  }, { passive: false });

  // Histology Model Dropdown Change
  selHistologyModel?.addEventListener("change", (e) => {
    activeHistologyModel = e.target.value;
    SoundFX.playClick();
    renderHistologyControls();
    updateTopTelemetryRibbon();
  });

  function renderHistologyControls() {
    const model = HISTOLOGY_SIMULATION_MODELS[activeHistologyModel];
    if (!model) return;

    if (activeHistologyModel === "cardiac_cycle") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Pacemaker Heart Rate (SA Node):</span>
            <span id="disp-hr" style="color: #ef4444; font-family: var(--font-mono);">${histoState.heartRate} bpm</span>
          </div>
          <input id="rng-hr" type="range" min="40" max="180" value="${histoState.heartRate}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>Bradycardia (&lt;60)</span>
            <span>Sinus Norm (60-100)</span>
            <span>Tachycardia (&gt;100)</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button id="btn-sound-heart" class="btn btn-secondary btn-sm" style="flex: 1; font-weight: 700; font-size: 0.76rem; border-color: rgba(239,68,68,0.4); color: #fca5a5;">
            🔊 Trigger S1/S2 Valve Phonocardiogram
          </button>
        </div>
      `;
      document.getElementById("rng-hr")?.addEventListener("input", (e) => {
        histoState.heartRate = parseInt(e.target.value);
        document.getElementById("disp-hr").innerText = `${histoState.heartRate} bpm`;
        updateTopTelemetryRibbon();
      });
      document.getElementById("btn-sound-heart")?.addEventListener("click", () => {
        playHeartSound(histoState.heartRate);
      });
    } else if (activeHistologyModel === "nephron_countercurrent") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Antidiuretic Hormone (ADH / Vasopressin):</span>
            <span id="disp-adh" style="color: #a78bfa; font-family: var(--font-mono);">${histoState.adhLevel}% (${Math.round(100 + (histoState.adhLevel / 100) * 1100)} mOsm/L)</span>
          </div>
          <input id="rng-adh" type="range" min="0" max="100" value="${histoState.adhLevel}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>Diabetes Insipidus (100 mOsm)</span>
            <span>Euvolemic (600 mOsm)</span>
            <span>Max Antidiuresis (1200 mOsm)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-adh")?.addEventListener("input", (e) => {
        histoState.adhLevel = parseInt(e.target.value);
        const osm = Math.round(100 + (histoState.adhLevel / 100) * 1100);
        document.getElementById("disp-adh").innerText = `${histoState.adhLevel}% (${osm} mOsm/L)`;
        updateTopTelemetryRibbon();
      });
    } else if (activeHistologyModel === "sarcomere_sliding") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Sarcomere Length (Z-Disc to Z-Disc):</span>
            <span id="disp-sarc" style="color: #f87171; font-family: var(--font-mono);">${histoState.sarcomereLength.toFixed(2)} µm</span>
          </div>
          <input id="rng-sarc" type="range" min="160" max="240" value="${Math.round(histoState.sarcomereLength * 100)}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>Contracted (1.6 µm)</span>
            <span>Optimum Tension (2.0-2.2 µm)</span>
            <span>Overstretched (2.4 µm)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-sarc")?.addEventListener("input", (e) => {
        histoState.sarcomereLength = parseInt(e.target.value) / 100;
        document.getElementById("disp-sarc").innerText = `${histoState.sarcomereLength.toFixed(2)} µm`;
        updateTopTelemetryRibbon();
      });
    } else if (activeHistologyModel === "neuron_synapse") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="btn-fire-ap" class="btn btn-primary" style="flex: 1; padding: 10px 14px; font-weight: 800; font-size: 0.84rem; border-radius: 8px; background: linear-gradient(135deg, #eab308, #ca8a04); border: none; color: #090d16;">
            ⚡ Depolarize Threshold (-55 mV → +30 mV Spike)
          </button>
        </div>
      `;
      document.getElementById("btn-fire-ap")?.addEventListener("click", () => {
        histoState.actionPotentialStim = true;
        histoState.apPhaseProgress = 0;
        SoundFX.playPop();
      });
    } else if (activeHistologyModel === "alveolar_gas_exchange") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Inspired Oxygen Fraction (FiO₂):</span>
            <span id="disp-fio2" style="color: #34d399; font-family: var(--font-mono);">${histoState.fio2}% (PAO₂ ≈ ${Math.round(histoState.fio2 * 7.13 - 50)} mmHg)</span>
          </div>
          <input id="rng-fio2" type="range" min="12" max="100" value="${histoState.fio2}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>Everest Hypoxia (12%)</span>
            <span>Normoxic Room Air (21%)</span>
            <span>Hyperbaric O₂ (100%)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-fio2")?.addEventListener("input", (e) => {
        histoState.fio2 = parseInt(e.target.value);
        const pao2 = Math.max(28, Math.round(histoState.fio2 * 7.13 - 50));
        document.getElementById("disp-fio2").innerText = `${histoState.fio2}% (PAO₂ ≈ ${pao2} mmHg)`;
        updateTopTelemetryRibbon();
      });
    } else {
      histologyDynamicControls.innerHTML = `
        <div style="font-size: 0.79rem; color: #cbd5e1; line-height: 1.45; background: rgba(56,189,248,0.08); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
          🔬 <strong>Polarized Birefringence & Canalicular Perfusion Mode:</strong> Live visualization of concentric hydroxyapatite lamellae, Haversian neurovascular perfusion, and osteocyte mechanotransduction across gap-junction canaliculi.
        </div>
      `;
    }

    // Build Encyclopedia Monograph + Biophysical Formula + Reference Tables
    let formulaRendered = "";
    if (model.latexFormula) {
      try {
        formulaRendered = renderLatex(model.latexFormula);
      } catch (_) {
        formulaRendered = `<code>${model.latexFormula}</code>`;
      }
    }

    let subTableHtml = "";
    if (model.ecgPhases) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em;">Electrocardiographic Waveform Correlation</div>` +
        model.ecgPhases.map(ph => `<div style="font-size: 0.73rem; padding: 4px 6px; border-left: 2px solid #ef4444; background: rgba(255,255,255,0.02); margin-top: 4px;"><strong style="color: #f8fafc;">${ph.wave} (${ph.duration}):</strong> <span style="color: #94a3b8;">${ph.event}</span></div>`).join("");
    } else if (model.segments) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.06em;">Tubular Segment Transport Profile</div>` +
        model.segments.map(seg => `<div style="font-size: 0.73rem; padding: 4px 6px; border-left: 2px solid #a855f7; background: rgba(255,255,255,0.02); margin-top: 4px;"><strong style="color: #f8fafc;">${seg.region} (${seg.osmolarity}):</strong> <span style="color: #94a3b8;">${seg.transport}</span></div>`).join("");
    } else if (model.actionPotentialPhases) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #eab308; text-transform: uppercase; letter-spacing: 0.06em;">Hodgkin-Huxley Membrane Conductance Phases</div>` +
        model.actionPotentialPhases.map(ap => `<div style="font-size: 0.73rem; padding: 4px 6px; border-left: 2px solid #eab308; background: rgba(255,255,255,0.02); margin-top: 4px;"><strong style="color: #f8fafc;">${ap.phase} (${ap.voltage}):</strong> <span style="color: #94a3b8;">${ap.mechanism}</span></div>`).join("");
    } else if (model.histologyLayers) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.06em;">0.5 µm Blood-Air Barrier Ultrastructure</div>` +
        model.histologyLayers.map((ly, idx) => `<div style="font-size: 0.73rem; padding: 3px 6px; border-left: 2px solid #10b981; background: rgba(255,255,255,0.02); margin-top: 3px;"><strong style="color: #34d399;">${idx + 1}.</strong> <span style="color: #cbd5e1;">${ly}</span></div>`).join("");
    } else if (model.crossBridgeCycle) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #f87171; text-transform: uppercase; letter-spacing: 0.06em;">Actomyosin Cross-Bridge ATPase Cycle</div>` +
        model.crossBridgeCycle.map((st, idx) => `<div style="font-size: 0.73rem; padding: 3px 6px; border-left: 2px solid #f87171; background: rgba(255,255,255,0.02); margin-top: 3px;"><strong style="color: #fca5a5;">Step ${idx + 1}:</strong> <span style="color: #cbd5e1;">${st}</span></div>`).join("");
    } else if (model.features) {
      subTableHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em;">Cortical Bone Micro-Architecture</div>` +
        model.features.map(ft => `<div style="font-size: 0.73rem; padding: 4px 6px; border-left: 2px solid #38bdf8; background: rgba(255,255,255,0.02); margin-top: 4px;"><strong style="color: #f8fafc;">${ft.structure}:</strong> <span style="color: #94a3b8;">${ft.detail}</span></div>`).join("");
    }

    let pathHtml = "";
    if (model.pathologies && model.pathologies.length) {
      pathHtml = `<div style="margin-top: 8px; font-size: 0.7rem; font-weight: 800; color: #f87171; text-transform: uppercase; letter-spacing: 0.06em;">Pathophysiological Derangements</div>` +
        model.pathologies.map(pt => `<div style="font-size: 0.72rem; color: #fca5a5; padding: 3px 6px; background: rgba(239,68,68,0.08); border-radius: 5px; margin-top: 3px;">⚠️ ${pt}</div>`).join("");
    }

    let tableHtml = `<div style="font-weight: 800; color: #f1f5f9; font-size: 0.88rem; margin-bottom: 4px;">${model.title}</div>`;
    tableHtml += `<div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.45; margin-bottom: 8px;">${model.summary}</div>`;
    if (formulaRendered) {
      tableHtml += `<div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.25); padding: 6px 10px; border-radius: 8px; margin-bottom: 8px; text-align: center; color: #e0f2fe; font-size: 0.8rem; overflow-x: auto;">${formulaRendered}</div>`;
    }
    tableHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
    model.keyParameters.forEach(p => {
      tableHtml += `
        <div style="background: rgba(0,0,0,0.35); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="color: var(--text-dim); font-size: 0.68rem;">${p.name}</div>
          <div style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700; font-size: 0.75rem;">${p.value}</div>
        </div>
      `;
    });
    tableHtml += `</div>`;
    tableHtml += subTableHtml + pathHtml;
    histologyTelemetryTable.innerHTML = tableHtml;
  }

  // 4K PNG Diagram Exporter
  btnExport4k?.addEventListener("click", () => {
    SoundFX.playSuccess();
    export4kHighResDiagram();
  });

  function export4kHighResDiagram() {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = 3840;
    offCanvas.height = 2160;
    const offCtx = offCanvas.getContext("2d");

    // Render 4K background
    const bgGrad = offCtx.createLinearGradient(0, 0, 3840, 2160);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    offCtx.fillStyle = bgGrad;
    offCtx.fillRect(0, 0, 3840, 2160);

    // Grid markings
    offCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    offCtx.lineWidth = 1;
    for (let x = 0; x < 3840; x += 80) {
      offCtx.beginPath(); offCtx.moveTo(x, 0); offCtx.lineTo(x, 2160); offCtx.stroke();
    }
    for (let y = 0; y < 2160; y += 80) {
      offCtx.beginPath(); offCtx.moveTo(0, y); offCtx.lineTo(3840, y); offCtx.stroke();
    }

    // Header banner
    const activePlateConf = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[activePlate] : null;
    const plateTitle = activePlateConf ? `${activePlateConf.name.toUpperCase()} (4K UHD)` : "HUMAN ANATOMY ATLAS & SYSTEMIC MATRIX (4K UHD)";
    offCtx.fillStyle = "#ffffff";
    offCtx.font = "bold 60px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    offCtx.fillText(plateTitle, 120, 140);
    offCtx.fillStyle = "#38bdf8";
    offCtx.font = "600 30px 'JetBrains Mono', monospace";
    offCtx.fillText("EDUGATES-CLIPSAT RESEARCH-GRADE STEM LABORATORIES • TERMINOLOGIA ANATOMICA", 120, 190);

    // Draw anatomy figure onto 4K canvas
    offCtx.save();
    offCtx.translate(1420, 240);
    const offScale = 1.0;
    drawHumanBodyVector(offCtx, offScale, activeView);
    drawAnatomicalPins(offCtx, offScale, activeView, false);
    offCtx.restore();

    // Left info card
    offCtx.fillStyle = "rgba(15, 23, 42, 0.85)";
    offCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    offCtx.lineWidth = 3;
    offCtx.roundRect(120, 280, 800, 1600, 24);
    offCtx.fill();
    offCtx.stroke();

    if (selectedStructure) {
      offCtx.fillStyle = "#10b981";
      offCtx.font = "bold 26px 'JetBrains Mono', monospace";
      offCtx.fillText(selectedStructure.system.toUpperCase() + " SYSTEM", 160, 360);

      offCtx.fillStyle = "#ffffff";
      offCtx.font = "bold 48px sans-serif";
      offCtx.fillText(selectedStructure.name, 160, 425);

      offCtx.fillStyle = "#38bdf8";
      offCtx.font = "italic 32px sans-serif";
      offCtx.fillText(selectedStructure.latinName, 160, 475);

      offCtx.fillStyle = "#cbd5e1";
      offCtx.font = "26px sans-serif";
      wrapText(offCtx, selectedStructure.description, 160, 540, 720, 38);

      offCtx.fillStyle = "#34d399";
      offCtx.font = "bold 28px sans-serif";
      offCtx.fillText("PHYSIOLOGICAL FUNCTION:", 160, 780);
      offCtx.fillStyle = "#e2e8f0";
      offCtx.font = "24px sans-serif";
      wrapText(offCtx, selectedStructure.function, 160, 830, 720, 36);

      offCtx.fillStyle = "#f87171";
      offCtx.font = "bold 28px sans-serif";
      offCtx.fillText("CLINICAL PATHOLOGY:", 160, 1100);
      offCtx.fillStyle = "#fca5a5";
      offCtx.font = "24px sans-serif";
      wrapText(offCtx, selectedStructure.pathology, 160, 1150, 720, 36);
    }

    // Timestamp & Watermark
    offCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    offCtx.font = "20px 'JetBrains Mono', monospace";
    offCtx.fillText(`Plate: ${activePlateConf?.shortName || activePlate} • Rendered at ${new Date().toISOString()} • Native 3840×2160 Vector Metrology`, 120, 2100);

    // Download PNG
    const link = document.createElement("a");
    link.download = `human_anatomy_4k_${activePlate}_${selectedStructure ? selectedStructure.id : 'matrix'}.png`;
    link.href = offCanvas.toDataURL("image/png");
    link.click();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  // Open Lab Dossier
  btnOpenDossier?.addEventListener("click", () => {
    SoundFX.playClick();
    openLabReportModal({
      title: "Human Anatomy & Histology Lab Dossier",
      labId: "anatomy",
      apparatusConfig: {
        "Anatomical Model": activeGender === "female" ? "Female Anatomical Model" : "Male Anatomical Model",
        "View Angle": activeView === "anterior" ? "Coronal Anterior (Ventral)" : "Coronal Posterior (Dorsal)",
        "Selected Structure": selectedStructure ? `${selectedStructure.name} (${selectedStructure.latinName})` : "General",
        "Active System": selectedStructure ? selectedStructure.system : "All",
        "Magnification Zoom": `${zoom.toFixed(1)}x`,
        "Histology Model": activeHistologyModel
      },
      measurements: ANATOMICAL_STRUCTURES.slice(0, 15).map((s, idx) => ({
        "Index": idx + 1,
        "Structure": s.name,
        "Latin Nomenclature": s.latinName,
        "System": s.system,
        "Region": s.region,
        "Coordinates (X, Y)": `(${s.coords.x}, ${s.coords.y})`
      }))
    });
  });

  // Telemetry CSV Export
  const handleExportCsv = () => {
    SoundFX.playClick();
    const plate = ANATOMICAL_PLATES[activePlate] || {};
    const plateStructures = (plate.structures || []).map(id => ANATOMICAL_STRUCTURES.find(s => s.id === id)).filter(Boolean);
    const structuresToExport = plateStructures.length > 0 ? plateStructures : ANATOMICAL_STRUCTURES;

    exportLabDataCsv({
      title: "Human Anatomy & Histology Interactive Atlas",
      labId: "anatomy",
      parameters: {
        "Active Plate": plate.name || "Full Body",
        "System Category": plate.system || "Multisystem",
        "Gender Model": activeGender === "female" ? "Female Anatomical Model" : "Male Anatomical Model",
        "View Angle": activeView === "anterior" ? "Coronal Anterior (Ventral)" : "Coronal Posterior (Dorsal)",
        "Active Tab": activeTab,
        "Selected Structure": selectedStructure ? `${selectedStructure.name} (${selectedStructure.latinName || ""})` : "None",
        "Magnification Zoom": `${zoom.toFixed(1)}x`,
        "Histology Model": activeHistologyModel
      },
      headers: ["Structure Name", "Latin Nomenclature", "Organ System", "Anatomical Region", "Pin Coordinate X", "Pin Coordinate Y", "Clinical Function"],
      dataRows: structuresToExport.map(s => [
        s.name,
        s.latinName || "",
        s.system,
        s.region,
        s.coords?.x ?? "",
        s.coords?.y ?? "",
        (s.function || s.description || "").slice(0, 120)
      ])
    });
  };

  btnExportCsv?.addEventListener("click", handleExportCsv);

  const handleKeyDown = (e) => {
    if (e.key === "e" || e.key === "E") {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      handleExportCsv();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // ----------------------------------------------------
  // 8K ULTRA-HD 3D BIOMECHANICAL MESH & COMPOSITING ENGINE
  // ----------------------------------------------------
  function drawPlateImageLayer(targetCtx, img, alpha, filterMode = null) {
    if (!img || !img.complete || img.naturalWidth <= 0 || alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, Math.max(0, alpha));
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = "high";

    if (filterMode === "xray") {
      targetCtx.filter = "contrast(190%) invert(95%) hue-rotate(180deg) brightness(88%)";
    } else if (filterMode === "angiogram") {
      targetCtx.filter = "contrast(220%) saturate(160%) hue-rotate(145deg) brightness(115%)";
    } else {
      targetCtx.filter = "none";
    }

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawX, drawY, drawW, drawH;

    // 1. Calibrated 4K 3D Full-Body Main Organs Render (896x1200 -> 690x924 at 155, 55)
    if (img === imgAnterior) {
      drawW = 690;
      drawH = 924;
      drawX = 155;
      drawY = 55;
    } else if (img.naturalWidth === 1000 && img.naturalHeight === 1800) {
      // Exact 1000x1800 registered multi-layer dissection plate
      drawX = 0;
      drawY = 0;
      drawW = 1000;
      drawH = 1800;
    } else if (Math.abs(aspect - (768 / 1376)) < 0.03) {
      drawH = 1680;
      drawW = drawH * aspect; // 937.67
      drawX = 500 - (drawW / 2); // 31.16
      drawY = 55;
    } else {
      const maxW = 920;
      const maxH = 1600;
      if (aspect > (maxW / maxH)) {
        drawW = maxW;
        drawH = drawW / aspect;
      } else {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      drawX = 500 - (drawW / 2);
      drawY = 900 - (drawH / 2);
    }

    // Apply subtle interactive 3D Holographic Perspective Tilt when enabled
    const centerX = drawX + drawW * 0.5;
    const centerY = drawY + drawH * 0.5;
    if (orbit3dEnabled && simTime > 0) {
      const idleTiltX = Math.sin(simTime * 1.1) * 0.25;
      const idleTiltY = Math.cos(simTime * 0.85) * 0.2;
      const tx = pointerTiltX * 0.75 + idleTiltX;
      const ty = pointerTiltY * 0.75 + idleTiltY;
      targetCtx.translate(centerX, centerY);
      targetCtx.transform(1, ty * 0.014, tx * 0.018, 1, tx * 4.5, ty * 3.5);
      targetCtx.translate(-centerX, -centerY);
    }

    // Real-Time 60 FPS Biomechanical 3D Mesh Slice Deformation for Living Organs
    const heartFreq = ((histoState.heartRate || 72) / 60) * Math.PI * 2;
    const breathFreq = ((breathRate || 15) / 60) * Math.PI * 2;
    const systolePulse = Math.pow(Math.max(0, Math.sin(simTime * heartFreq)), 3);
    const breathWave = Math.sin(simTime * breathFreq);

    if (img === imgAnterior && simTime > 0) {
      // 36-Slice Biomechanical Thoracic Breathing & Precordial Heartbeat Mesh
      const slices = 36;
      const srcSliceH = img.naturalHeight / slices;
      const dstSliceH = drawH / slices;
      for (let i = 0; i < slices; i++) {
        const normY = (i + 0.5) / slices;
        // Thoracic ribcage/lung expansion zone (normY 0.22 .. 0.48)
        let scaleX = 1.0;
        let shiftY = 0;
        if (normY > 0.20 && normY < 0.52) {
          const thoraxEnv = Math.sin(((normY - 0.20) / 0.32) * Math.PI);
          scaleX += 0.016 * breathWave * thoraxEnv;
          shiftY -= 2.2 * breathWave * thoraxEnv;
        }
        // Precordial cardiac beat impulse (normY 0.28 .. 0.42)
        if (normY > 0.28 && normY < 0.42) {
          const heartEnv = Math.sin(((normY - 0.28) / 0.14) * Math.PI);
          scaleX += 0.012 * systolePulse * heartEnv;
        }
        const sliceW = drawW * scaleX;
        const sliceX = drawX + (drawW - sliceW) * 0.5;
        const sliceY = drawY + i * dstSliceH + shiftY;
        targetCtx.drawImage(
          img,
          0, i * srcSliceH, img.naturalWidth, srcSliceH + 0.8,
          sliceX, sliceY, sliceW, dstSliceH + 0.9
        );
      }
    } else if (activePlate === "heart" && img === plateImages.heart && simTime > 0) {
      // 36-Slice Wiggers Cardiac Cycle Myocardial Contraction & Apical Twist
      const slices = 36;
      const srcSliceH = img.naturalHeight / slices;
      const dstSliceH = drawH / slices;
      const atrialKick = Math.pow(Math.max(0, Math.sin(simTime * heartFreq - 0.85)), 4);
      for (let i = 0; i < slices; i++) {
        const normY = (i + 0.5) / slices;
        let scaleX = 1.0;
        let twistX = 0;
        // Ventricular myocardium contraction (lower 60% of heart image)
        if (normY > 0.38 && normY < 0.92) {
          const ventEnv = Math.sin(((normY - 0.38) / 0.54) * Math.PI);
          scaleX += 0.032 * systolePulse * ventEnv;
          twistX = 4.5 * systolePulse * ventEnv * Math.sin(normY * Math.PI * 2);
        } else if (normY >= 0.18 && normY <= 0.45) {
          // Atrial & Great Vessel systolic expansion
          const atrEnv = Math.sin(((normY - 0.18) / 0.27) * Math.PI);
          scaleX += 0.022 * (atrialKick * 0.6 + systolePulse * 0.5) * atrEnv;
        }
        const sliceW = drawW * scaleX;
        const sliceX = drawX + (drawW - sliceW) * 0.5 + twistX;
        const sliceY = drawY + i * dstSliceH;
        targetCtx.drawImage(
          img,
          0, i * srcSliceH, img.naturalWidth, srcSliceH + 0.8,
          sliceX, sliceY, sliceW, dstSliceH + 0.9
        );
      }
    } else if (activePlate === "lungs" && img === plateImages.lungs && simTime > 0) {
      // 36-Slice Pulmonary Tidal Inspiration & Diaphragmatic Excursion Mesh
      const slices = 36;
      const srcSliceH = img.naturalHeight / slices;
      const dstSliceH = drawH / slices;
      for (let i = 0; i < slices; i++) {
        const normY = (i + 0.5) / slices;
        let scaleX = 1.0;
        let shiftY = 0;
        if (normY > 0.22 && normY < 0.92) {
          const lungEnv = Math.sin(((normY - 0.22) / 0.70) * Math.PI);
          scaleX += 0.028 * breathWave * lungEnv;
          shiftY += 4.5 * breathWave * Math.pow(normY, 1.5);
        }
        const sliceW = drawW * scaleX;
        const sliceX = drawX + (drawW - sliceW) * 0.5;
        const sliceY = drawY + i * dstSliceH + shiftY;
        targetCtx.drawImage(
          img,
          0, i * srcSliceH, img.naturalWidth, srcSliceH + 0.8,
          sliceX, sliceY, sliceW, dstSliceH + 0.9
        );
      }
    } else {
      targetCtx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    targetCtx.restore();
  }

  // Master Anatomical Human Body Silhouette Contour (Vitruvian Proportions & Smooth Bézier Anatomy)
  function buildHumanBodyPath(targetCtx) {
    targetCtx.beginPath();
    // Start at Crown / Vertex of head
    targetCtx.moveTo(500, 65);
    // Left Cranial Vault (Parietal curvature & temporal dip)
    targetCtx.bezierCurveTo(450, 65, 435, 95, 435, 135);
    // Left Temple, Zygomatic flare, and Mandibular Angle (Ear/Jaw corner)
    targetCtx.bezierCurveTo(435, 160, 442, 180, 452, 195);
    // Left Neck (Sternocleidomastoid & Cervical contour)
    targetCtx.bezierCurveTo(458, 208, 465, 222, 465, 245);
    // Left Trapezius slope out to Acromion shoulder tip
    targetCtx.bezierCurveTo(455, 260, 410, 272, 375, 278);
    // Left Deltoid cap (Muscular rounded shoulder sweep)
    targetCtx.bezierCurveTo(345, 285, 325, 315, 322, 355);
    // Left Upper Arm (Biceps / Brachialis lateral contour)
    targetCtx.bezierCurveTo(320, 395, 305, 435, 292, 465);
    // Left Lateral Elbow (Lateral epicondyle & cubital region)
    targetCtx.bezierCurveTo(282, 485, 275, 510, 268, 545);
    // Left Forearm (Brachioradialis swell tapering to wrist)
    targetCtx.bezierCurveTo(255, 595, 230, 655, 215, 715);
    // Left Hand (Anatomical snuffbox, thenar eminence & abducted pollex/thumb)
    targetCtx.bezierCurveTo(205, 735, 175, 742, 165, 755);
    targetCtx.bezierCurveTo(158, 765, 162, 775, 175, 775); // Thumb tip
    targetCtx.bezierCurveTo(185, 775, 195, 765, 202, 755); // First web space
    // Left Digits (Index, middle, ring, little fingers extending distally)
    targetCtx.bezierCurveTo(200, 785, 195, 835, 205, 890); // Finger extension
    targetCtx.bezierCurveTo(212, 910, 225, 910, 232, 895); // Fingertip curvature
    targetCtx.bezierCurveTo(242, 870, 252, 825, 258, 775); // Medial hand margin
    // Left Medial Wrist & Forearm (Flexor carpi ulnaris rising to elbow)
    targetCtx.bezierCurveTo(262, 745, 275, 690, 292, 620);
    targetCtx.bezierCurveTo(305, 565, 322, 510, 332, 475); // Cubital fossa / medial elbow
    // Left Medial Upper Arm to Axilla (Anterior axillary fold)
    targetCtx.bezierCurveTo(342, 440, 360, 400, 375, 378);
    // Left Lateral Thoracic Ribcage (Latissimus dorsi & serratus curve)
    targetCtx.bezierCurveTo(390, 415, 405, 470, 412, 530);
    // Left Waist Indentation (Narrowing at L2/L3 flank)
    targetCtx.bezierCurveTo(415, 565, 416, 610, 422, 660);
    // Left Iliac Crest & Hip (Greater trochanter flare)
    targetCtx.bezierCurveTo(428, 710, 435, 760, 435, 810);
    // Left Lateral Thigh (Vastus lateralis sweeping down to knee)
    targetCtx.bezierCurveTo(435, 870, 422, 970, 418, 1070);
    targetCtx.bezierCurveTo(415, 1130, 420, 1185, 424, 1220); // Lateral knee
    // Left Lateral Knee to Calf (Gastrocnemius lateral head)
    targetCtx.bezierCurveTo(426, 1250, 415, 1310, 412, 1370);
    // Left Lateral Soleus & Achilles Tendon tapering to ankle
    targetCtx.bezierCurveTo(410, 1430, 416, 1530, 420, 1610);
    // Left Lateral Malleolus (Lower outer ankle) & Heel (Calcaneus)
    targetCtx.bezierCurveTo(422, 1635, 416, 1675, 420, 1705);
    targetCtx.bezierCurveTo(424, 1720, 435, 1722, 445, 1720); // Plantar heel & sole
    // Left Metatarsals & Toes (Distal foot curvature)
    targetCtx.bezierCurveTo(455, 1722, 468, 1720, 475, 1708);
    // Left Medial Arch & Instep
    targetCtx.bezierCurveTo(472, 1690, 465, 1665, 462, 1635);
    // Left Medial Malleolus (Higher inner ankle bone)
    targetCtx.bezierCurveTo(460, 1610, 458, 1560, 458, 1510);
    // Left Medial Calf (Gastrocnemius medial head - fuller & lower curve)
    targetCtx.bezierCurveTo(458, 1440, 468, 1370, 468, 1300);
    // Left Medial Knee (Medial femoral/tibial condyle)
    targetCtx.bezierCurveTo(468, 1250, 470, 1215, 470, 1175);
    // Left Medial Thigh (Gracilis, sartorius & adductor curve)
    targetCtx.bezierCurveTo(472, 1110, 478, 1010, 485, 940);
    targetCtx.bezierCurveTo(490, 895, 496, 870, 500, 860); // Inguinal crease / Perineum

    // --- SYMMETRICAL RIGHT SIDE ---
    // Right Medial Thigh (Adductor longus & gracilis)
    targetCtx.bezierCurveTo(504, 870, 510, 895, 515, 940);
    targetCtx.bezierCurveTo(522, 1010, 528, 1110, 530, 1175);
    // Right Medial Knee (Medial condyle)
    targetCtx.bezierCurveTo(530, 1215, 532, 1250, 532, 1300);
    // Right Medial Calf (Gastrocnemius medial head - fuller & lower curve)
    targetCtx.bezierCurveTo(532, 1370, 542, 1440, 542, 1510);
    // Right Medial Malleolus & Instep
    targetCtx.bezierCurveTo(542, 1560, 540, 1610, 538, 1635);
    targetCtx.bezierCurveTo(535, 1665, 528, 1690, 525, 1708);
    // Right Toes & Plantar Sole
    targetCtx.bezierCurveTo(532, 1720, 545, 1722, 555, 1720);
    targetCtx.bezierCurveTo(565, 1722, 576, 1720, 580, 1705); // Plantar heel
    // Right Lateral Malleolus & Achilles tendon
    targetCtx.bezierCurveTo(584, 1675, 578, 1635, 580, 1610);
    targetCtx.bezierCurveTo(584, 1530, 590, 1430, 588, 1370);
    // Right Lateral Calf to Knee
    targetCtx.bezierCurveTo(585, 1310, 574, 1250, 576, 1220);
    // Right Lateral Thigh (Vastus lateralis sweep)
    targetCtx.bezierCurveTo(580, 1185, 585, 1130, 582, 1070);
    targetCtx.bezierCurveTo(578, 970, 565, 870, 565, 810);
    // Right Hip & Iliac Crest
    targetCtx.bezierCurveTo(565, 760, 572, 710, 578, 660);
    // Right Waist Indentation
    targetCtx.bezierCurveTo(584, 610, 585, 565, 588, 530);
    // Right Lateral Ribcage to Axilla
    targetCtx.bezierCurveTo(595, 470, 610, 415, 625, 378);
    // Right Medial Arm to Cubital Fossa
    targetCtx.bezierCurveTo(640, 400, 658, 440, 668, 475);
    targetCtx.bezierCurveTo(678, 510, 695, 565, 708, 620);
    // Right Medial Wrist & Hand
    targetCtx.bezierCurveTo(725, 690, 738, 745, 742, 775);
    targetCtx.bezierCurveTo(748, 825, 758, 870, 768, 895); // Medial digits
    targetCtx.bezierCurveTo(775, 910, 788, 910, 795, 890); // Fingertip curvature
    // Right Digits to Thumb
    targetCtx.bezierCurveTo(805, 835, 800, 785, 798, 755); // First web space
    targetCtx.bezierCurveTo(805, 765, 815, 775, 825, 775); // Thumb tip
    targetCtx.bezierCurveTo(838, 775, 842, 765, 835, 755); // Thenar eminence
    targetCtx.bezierCurveTo(825, 742, 795, 735, 785, 715); // Lateral wrist
    // Right Lateral Forearm (Brachioradialis swell)
    targetCtx.bezierCurveTo(770, 655, 745, 595, 732, 545);
    // Right Lateral Elbow
    targetCtx.bezierCurveTo(725, 510, 718, 485, 708, 465);
    // Right Upper Arm
    targetCtx.bezierCurveTo(695, 435, 680, 395, 678, 355);
    // Right Deltoid Cap
    targetCtx.bezierCurveTo(675, 315, 655, 285, 625, 278);
    // Right Trapezius slope to neck
    targetCtx.bezierCurveTo(590, 272, 545, 260, 535, 245);
    // Right Neck (Sternocleidomastoid)
    targetCtx.bezierCurveTo(535, 222, 542, 208, 548, 195);
    // Right Mandibular Angle & Temple
    targetCtx.bezierCurveTo(558, 180, 565, 160, 565, 135);
    // Right Cranial Vault back to Vertex
    targetCtx.bezierCurveTo(565, 95, 550, 65, 500, 65);
    targetCtx.closePath();
  }

  // STRATUM 1: Skeletal System (206-Bone Osteology & Radiographic Framework)
  function drawSkeletalVector(targetCtx, view, alpha, mode = "photo") {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    const isXray = (mode === "xray");
    const boneFill = isXray ? "#e0f2fe" : "#fbf9f4";
    const boneStroke = isXray ? "#38bdf8" : "#94a3b8";
    const boneShade = isXray ? "#0284c7" : "#cbd5e1";
    const discColor = isXray ? "#7dd3fc" : "#93c5fd";
    const cartilageColor = isXray ? "rgba(125, 211, 252, 0.7)" : "rgba(147, 197, 253, 0.75)";
    const shadowColor = isXray ? "#38bdf8" : "rgba(0,0,0,0.3)";

    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.shadowColor = shadowColor;
    targetCtx.shadowBlur = isXray ? 14 : 3;
    targetCtx.lineWidth = 2;

    // 1. CRANIUM & FACIAL OSTEOLOGY
    targetCtx.beginPath();
    // Calvaria / Cranial Vault
    targetCtx.moveTo(500, 75);
    targetCtx.bezierCurveTo(452, 75, 440, 105, 440, 135);
    targetCtx.bezierCurveTo(440, 155, 446, 170, 455, 180);
    // Zygomatic arches flare
    targetCtx.bezierCurveTo(455, 185, 460, 195, 470, 205);
    // Mandible / Chin (Mental protuberance)
    targetCtx.bezierCurveTo(482, 215, 492, 218, 500, 218);
    targetCtx.bezierCurveTo(508, 218, 518, 215, 530, 205);
    targetCtx.bezierCurveTo(540, 195, 545, 185, 545, 180);
    targetCtx.bezierCurveTo(554, 170, 560, 155, 560, 135);
    targetCtx.bezierCurveTo(560, 105, 548, 75, 500, 75);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();

    if (view === "anterior") {
      // Bilateral Orbits (Anatomical eye sockets with supraorbital margins)
      targetCtx.fillStyle = isXray ? "#0369a1" : "#1e293b";
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 2;
      // Left Orbit
      targetCtx.beginPath();
      targetCtx.moveTo(462, 120);
      targetCtx.bezierCurveTo(476, 118, 488, 122, 488, 134);
      targetCtx.bezierCurveTo(488, 146, 474, 150, 464, 146);
      targetCtx.bezierCurveTo(456, 142, 454, 126, 462, 120);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
      // Right Orbit
      targetCtx.beginPath();
      targetCtx.moveTo(538, 120);
      targetCtx.bezierCurveTo(524, 118, 512, 122, 512, 134);
      targetCtx.bezierCurveTo(512, 146, 526, 150, 536, 146);
      targetCtx.bezierCurveTo(544, 142, 546, 126, 538, 120);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Piriform Aperture (Nasal cavity with perpendicular ethmoid/vomer septum)
      targetCtx.fillStyle = isXray ? "#0369a1" : "#1e293b";
      targetCtx.beginPath();
      targetCtx.moveTo(500, 138);
      targetCtx.bezierCurveTo(492, 150, 490, 165, 495, 170);
      targetCtx.bezierCurveTo(498, 172, 502, 172, 505, 170);
      targetCtx.bezierCurveTo(510, 165, 508, 150, 500, 138);
      targetCtx.closePath();
      targetCtx.fill();
      // Nasal Septum
      targetCtx.strokeStyle = boneFill;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 140); targetCtx.lineTo(500, 169);
      targetCtx.stroke();

      // Maxillary & Mandibular Alveolar Arches (Teeth rows)
      targetCtx.strokeStyle = boneStroke;
      targetCtx.fillStyle = boneFill;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      // Maxillary dental arch
      targetCtx.moveTo(480, 185); targetCtx.quadraticCurveTo(500, 188, 520, 185);
      // Mandibular dental arch
      targetCtx.moveTo(482, 193); targetCtx.quadraticCurveTo(500, 195, 518, 193);
      targetCtx.stroke();
      // Individual vertical tooth separator hints
      for (let t = -3; t <= 3; t++) {
        const tx = 500 + t * 5.5;
        targetCtx.beginPath();
        targetCtx.moveTo(tx, 184); targetCtx.lineTo(tx, 194);
        targetCtx.stroke();
      }

      // Mental Foramina & Mandible Angle contours
      targetCtx.fillStyle = isXray ? "#0284c7" : "#64748b";
      targetCtx.beginPath();
      targetCtx.arc(482, 202, 1.8, 0, Math.PI * 2);
      targetCtx.arc(518, 202, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      // Posterior Cranium: Occiput, Lambdoid Suture, Inion, Nuchal lines
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 1.8;
      // Lambdoid suture inverted V
      targetCtx.beginPath();
      targetCtx.moveTo(500, 115);
      targetCtx.lineTo(470, 145);
      targetCtx.moveTo(500, 115);
      targetCtx.lineTo(530, 145);
      targetCtx.stroke();
      // Superior nuchal line
      targetCtx.beginPath();
      targetCtx.moveTo(465, 160); targetCtx.quadraticCurveTo(500, 150, 535, 160);
      targetCtx.stroke();
      // External occipital protuberance (inion)
      targetCtx.fillStyle = boneShade;
      targetCtx.beginPath();
      targetCtx.arc(500, 152, 3, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 2. VERTEBRAL COLUMN (C1-C7, T1-T12, L1-L5, Sacrum, Coccyx)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 1.5;
    for (let v = 0; v < 24; v++) {
      const vy = 218 + (v * 24);
      const isCervical = (v < 7);
      const isThoracic = (v >= 7 && v < 19);
      const vw = isCervical ? (16 + v * 0.6) : (isThoracic ? (20 + (v - 7) * 0.8) : (29 + (v - 19) * 1.2));
      const vh = isCervical ? 12 : (isThoracic ? 14 : 16);

      // Intervertebral Disc
      if (v > 0) {
        targetCtx.fillStyle = discColor;
        targetCtx.beginPath();
        targetCtx.roundRect(500 - (vw / 2) + 2, vy - 4, vw - 4, 4, 1.5);
        targetCtx.fill();
      }

      // Vertebral Body
      targetCtx.fillStyle = boneFill;
      targetCtx.beginPath();
      targetCtx.roundRect(500 - (vw / 2), vy, vw, vh, 3.5);
      targetCtx.fill();
      targetCtx.stroke();

      // Transverse processes & Spinous process
      if (view === "posterior") {
        targetCtx.fillStyle = boneShade;
        targetCtx.beginPath();
        targetCtx.arc(500, vy + vh / 2, 2.5, 0, Math.PI * 2);
        targetCtx.fill();
      }
    }

    // Sacrum & Coccyx
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(478, 775);
    targetCtx.bezierCurveTo(478, 770, 522, 770, 522, 775);
    targetCtx.lineTo(512, 835);
    targetCtx.lineTo(504, 855); // Coccyx tip
    targetCtx.lineTo(496, 855);
    targetCtx.lineTo(488, 835);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Sacral Foramina (4 pairs)
    targetCtx.fillStyle = isXray ? "#0284c7" : "#475569";
    for (let sf = 0; sf < 4; sf++) {
      const sfy = 785 + sf * 12;
      const sfx = 6 + sf * 1.2;
      targetCtx.beginPath();
      targetCtx.arc(500 - sfx, sfy, 2, 0, Math.PI * 2);
      targetCtx.arc(500 + sfx, sfy, 2, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 3. CLAVICLES (Collarbones - Authentic Double S-Curve)
    targetCtx.lineWidth = 4.5;
    targetCtx.strokeStyle = boneFill;
    targetCtx.beginPath();
    // Left Clavicle
    targetCtx.moveTo(492, 260);
    targetCtx.bezierCurveTo(465, 252, 425, 268, 375, 276);
    // Right Clavicle
    targetCtx.moveTo(508, 260);
    targetCtx.bezierCurveTo(535, 252, 575, 268, 625, 276);
    targetCtx.stroke();
    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.stroke();

    // 4. STERNUM & THORACIC CAGE (12 Rib Pairs & Costal Cartilages)
    if (view === "anterior") {
      // Manubrium with suprasternal notch
      targetCtx.fillStyle = boneFill;
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(486, 262);
      targetCtx.quadraticCurveTo(500, 265, 514, 262); // Suprasternal notch
      targetCtx.lineTo(518, 290);
      targetCtx.lineTo(508, 298); // Sternal angle (Angle of Louis)
      targetCtx.lineTo(492, 298);
      targetCtx.lineTo(482, 290);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Sternal Body (Gladiolus)
      targetCtx.beginPath();
      targetCtx.moveTo(492, 298); targetCtx.lineTo(508, 298);
      targetCtx.lineTo(506, 420); targetCtx.lineTo(494, 420);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Costal facet segments on sternal body
      for (let s = 1; s <= 4; s++) {
        const sy = 298 + s * 24;
        targetCtx.beginPath();
        targetCtx.moveTo(493, sy); targetCtx.lineTo(507, sy);
        targetCtx.stroke();
      }

      // Xiphoid Process with sternal foramen
      targetCtx.beginPath();
      targetCtx.moveTo(496, 420); targetCtx.lineTo(504, 420);
      targetCtx.lineTo(502, 442); targetCtx.lineTo(498, 442);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
    }

    // 12 Paired Ribs & Costal Cartilages
    targetCtx.lineWidth = 3;
    for (let r = 0; r < 12; r++) {
      const ry = 275 + (r * 15.5);
      const rxw = 46 + (r < 7 ? r * 10 : (60 - (r - 7) * 8));
      const rDrop = 14 + r * 2.5;

      // Osseous Rib Shaft
      targetCtx.strokeStyle = boneFill;
      targetCtx.beginPath();
      // Left Rib
      targetCtx.moveTo(492, ry - 6);
      targetCtx.bezierCurveTo(492 - rxw, ry + 2, 492 - rxw, ry + rDrop + 8, 465, ry + rDrop);
      // Right Rib
      targetCtx.moveTo(508, ry - 6);
      targetCtx.bezierCurveTo(508 + rxw, ry + 2, 508 + rxw, ry + rDrop + 8, 535, ry + rDrop);
      targetCtx.stroke();

      targetCtx.lineWidth = 1.5;
      targetCtx.strokeStyle = boneStroke;
      targetCtx.stroke();

      // Hyaline Costal Cartilage (Ribs 1-7 connecting to sternum, 8-10 to costal margin)
      if (view === "anterior" && r < 10) {
        targetCtx.strokeStyle = cartilageColor;
        targetCtx.lineWidth = 2.5;
        targetCtx.beginPath();
        if (r < 7) {
          // True ribs connect to sternum
          const sternY = 280 + r * 20;
          targetCtx.moveTo(465, ry + rDrop); targetCtx.quadraticCurveTo(480, ry + rDrop - 2, 492, sternY);
          targetCtx.moveTo(535, ry + rDrop); targetCtx.quadraticCurveTo(520, ry + rDrop - 2, 508, sternY);
        } else {
          // False ribs connect to costal arch
          targetCtx.moveTo(465, ry + rDrop); targetCtx.lineTo(480, 425);
          targetCtx.moveTo(535, ry + rDrop); targetCtx.lineTo(520, 425);
        }
        targetCtx.stroke();
      }
    }

    // 5. SCAPULAE (Shoulder Blades)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;
    // Left Scapula
    targetCtx.beginPath();
    targetCtx.moveTo(375, 278); // Acromion
    targetCtx.lineTo(355, 345); // Glenoid / lateral border
    targetCtx.lineTo(395, 385); // Inferior angle
    targetCtx.lineTo(425, 310); // Medial / vertebral border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();
    // Right Scapula
    targetCtx.beginPath();
    targetCtx.moveTo(625, 278); // Acromion
    targetCtx.lineTo(645, 345); // Glenoid
    targetCtx.lineTo(605, 385); // Inferior angle
    targetCtx.lineTo(575, 310); // Medial border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // 6. PELVIS / OS COXAE (Ilium, Ischium, Pubis, Acetabulum, Obturator Foramina)
    targetCtx.lineWidth = 2.5;
    // Left Iliac Blade
    targetCtx.beginPath();
    targetCtx.moveTo(480, 770);
    targetCtx.bezierCurveTo(460, 715, 415, 718, 418, 755); // Iliac crest & ASIS
    targetCtx.bezierCurveTo(418, 785, 432, 820, 455, 835); // Acetabulum region
    targetCtx.lineTo(485, 850); // Pubic ramus
    targetCtx.lineTo(495, 845); // Pubic symphysis
    targetCtx.bezierCurveTo(480, 810, 478, 785, 480, 770);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Iliac Blade
    targetCtx.beginPath();
    targetCtx.moveTo(520, 770);
    targetCtx.bezierCurveTo(540, 715, 585, 718, 582, 755); // Iliac crest & ASIS
    targetCtx.bezierCurveTo(582, 785, 568, 820, 545, 835); // Acetabulum
    targetCtx.lineTo(515, 850); // Pubic ramus
    targetCtx.lineTo(505, 845); // Pubic symphysis
    targetCtx.bezierCurveTo(520, 810, 522, 785, 520, 770);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Pubic Symphysis (Fibrocartilage joint)
    targetCtx.fillStyle = discColor;
    targetCtx.beginPath();
    targetCtx.rect(496, 838, 8, 12);
    targetCtx.fill();

    // Obturator Foramina (Paired apertures)
    targetCtx.fillStyle = isXray ? "#0369a1" : "#0f172a";
    targetCtx.beginPath();
    targetCtx.ellipse(470, 838, 9, 13, -0.2, 0, Math.PI * 2);
    targetCtx.ellipse(530, 838, 9, 13, 0.2, 0, Math.PI * 2);
    targetCtx.fill();

    // 7. UPPER LIMBS (Humerus, Radius, Ulna, Carpus, Metacarpus, Phalanges)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;

    // Left Humerus (Spherical head, shaft, epicondyles)
    targetCtx.beginPath();
    targetCtx.arc(365, 290, 11, 0, Math.PI * 2); // Head
    targetCtx.moveTo(360, 300);
    targetCtx.bezierCurveTo(342, 360, 320, 420, 298, 472); // Shaft diaphysis
    targetCtx.lineTo(312, 476); // Distal epicondyle
    targetCtx.bezierCurveTo(330, 420, 354, 360, 372, 300);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Humerus
    targetCtx.beginPath();
    targetCtx.arc(635, 290, 11, 0, Math.PI * 2);
    targetCtx.moveTo(640, 300);
    targetCtx.bezierCurveTo(658, 360, 680, 420, 702, 472);
    targetCtx.lineTo(688, 476);
    targetCtx.bezierCurveTo(670, 420, 646, 360, 628, 300);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Radius (Lateral) & Ulna (Medial with olecranon)
    targetCtx.beginPath();
    // Radius
    targetCtx.moveTo(292, 482); targetCtx.bezierCurveTo(270, 545, 245, 625, 225, 715);
    targetCtx.lineTo(233, 716); targetCtx.bezierCurveTo(252, 625, 278, 545, 300, 482);
    targetCtx.closePath();
    // Ulna
    targetCtx.moveTo(304, 478); targetCtx.bezierCurveTo(286, 545, 268, 625, 248, 715);
    targetCtx.lineTo(256, 716); targetCtx.bezierCurveTo(276, 625, 294, 545, 312, 478);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Radius & Ulna
    targetCtx.beginPath();
    // Radius
    targetCtx.moveTo(708, 482); targetCtx.bezierCurveTo(730, 545, 755, 625, 775, 715);
    targetCtx.lineTo(767, 716); targetCtx.bezierCurveTo(748, 625, 722, 545, 700, 482);
    targetCtx.closePath();
    // Ulna
    targetCtx.moveTo(696, 478); targetCtx.bezierCurveTo(714, 545, 732, 625, 752, 715);
    targetCtx.lineTo(744, 716); targetCtx.bezierCurveTo(724, 625, 706, 545, 688, 478);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Hand Bones (Carpals, Metacarpals, Phalanges)
    // Left Hand
    targetCtx.beginPath();
    // Carpal mass
    targetCtx.roundRect(228, 718, 22, 14, 4);
    // 5 Metacarpals & Phalanges
    for (let f = 0; f < 5; f++) {
      const fx = 212 + f * 7.5;
      const fy = 734 + Math.abs(f - 2) * 4;
      const fl = 55 - Math.abs(f - 2) * 8;
      targetCtx.moveTo(fx, fy); targetCtx.lineTo(fx - 4, fy + fl);
    }
    targetCtx.fill(); targetCtx.stroke();

    // Right Hand
    targetCtx.beginPath();
    targetCtx.roundRect(750, 718, 22, 14, 4);
    for (let f = 0; f < 5; f++) {
      const fx = 752 + f * 7.5;
      const fy = 734 + Math.abs(f - 2) * 4;
      const fl = 55 - Math.abs(f - 2) * 8;
      targetCtx.moveTo(fx, fy); targetCtx.lineTo(fx + 4, fy + fl);
    }
    targetCtx.fill(); targetCtx.stroke();

    // 8. LOWER LIMBS (Femur, Patella, Tibia, Fibula, Tarsus, Metatarsus, Phalanges)
    // Left Femur (Spherical head, neck, trochanters, bowed shaft, condyles)
    targetCtx.beginPath();
    targetCtx.arc(460, 830, 14, 0, Math.PI * 2); // Femoral head in acetabulum
    targetCtx.moveTo(452, 835);
    targetCtx.lineTo(432, 842); // Femoral neck
    targetCtx.lineTo(426, 848); // Greater trochanter
    targetCtx.bezierCurveTo(424, 950, 420, 1070, 430, 1195); // Bowed diaphysis
    targetCtx.lineTo(444, 1205); // Medial condyle
    targetCtx.lineTo(422, 1205); // Lateral condyle
    targetCtx.bezierCurveTo(434, 1070, 438, 950, 442, 845);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Femur
    targetCtx.beginPath();
    targetCtx.arc(540, 830, 14, 0, Math.PI * 2);
    targetCtx.moveTo(548, 835);
    targetCtx.lineTo(568, 842);
    targetCtx.lineTo(574, 848); // Greater trochanter
    targetCtx.bezierCurveTo(576, 950, 580, 1070, 570, 1195);
    targetCtx.lineTo(556, 1205);
    targetCtx.lineTo(578, 1205);
    targetCtx.bezierCurveTo(566, 1070, 562, 950, 558, 845);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Patellae (Triangular sesamoid bones)
    if (view === "anterior") {
      targetCtx.fillStyle = boneFill;
      targetCtx.beginPath();
      // Left Patella
      targetCtx.moveTo(427, 1205); targetCtx.lineTo(441, 1205); targetCtx.lineTo(434, 1222);
      targetCtx.closePath();
      // Right Patella
      targetCtx.moveTo(559, 1205); targetCtx.lineTo(573, 1205); targetCtx.lineTo(566, 1222);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
    }

    // Tibia (Broad plateau, tuberosity, shin crest, medial malleolus) & Fibula
    // Left Tibia
    targetCtx.beginPath();
    targetCtx.moveTo(425, 1215); targetCtx.lineTo(445, 1215); // Plateau
    targetCtx.bezierCurveTo(442, 1340, 440, 1470, 448, 1608); // Medial malleolus
    targetCtx.lineTo(438, 1608);
    targetCtx.bezierCurveTo(432, 1470, 430, 1340, 428, 1215);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Fibula (Slender lateral bone with lower lateral malleolus)
    targetCtx.beginPath();
    targetCtx.arc(420, 1225, 4, 0, Math.PI * 2); // Head of fibula
    targetCtx.moveTo(420, 1229); targetCtx.lineTo(423, 1622); // Shaft to lateral malleolus
    targetCtx.stroke();

    // Right Tibia
    targetCtx.beginPath();
    targetCtx.moveTo(555, 1215); targetCtx.lineTo(575, 1215);
    targetCtx.bezierCurveTo(558, 1340, 560, 1470, 552, 1608); // Medial malleolus
    targetCtx.lineTo(562, 1608);
    targetCtx.bezierCurveTo(568, 1470, 570, 1340, 572, 1215);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Fibula
    targetCtx.beginPath();
    targetCtx.arc(580, 1225, 4, 0, Math.PI * 2);
    targetCtx.moveTo(580, 1229); targetCtx.lineTo(577, 1622);
    targetCtx.stroke();

    // Foot Bones (Tarsus, Metatarsus, Phalanges)
    // Left Foot
    targetCtx.beginPath();
    targetCtx.moveTo(436, 1612); // Talus
    targetCtx.lineTo(425, 1650); // Calcaneus heel
    targetCtx.lineTo(432, 1712); // Lateral sole
    targetCtx.lineTo(468, 1712); // Metatarsals & Toes
    targetCtx.lineTo(452, 1612); // Navicular / cuneiforms
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Foot
    targetCtx.beginPath();
    targetCtx.moveTo(564, 1612);
    targetCtx.lineTo(575, 1650);
    targetCtx.lineTo(568, 1712);
    targetCtx.lineTo(532, 1712);
    targetCtx.lineTo(548, 1612);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 2: Splanchnic Viscera (Thoracic & Abdominal Internal Organs)
  function drawVisceralVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    // 1. TRACHEA & PRIMARY BRONCHIAL ARBORIZATION
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(500, 225); targetCtx.lineTo(500, 318); // Trachea to Carina at T4/T5
    // Right Main Bronchus (Wider, shorter, more vertical at ~25°)
    targetCtx.lineTo(472, 348);
    // Left Main Bronchus (Longer, more horizontal at ~45°)
    targetCtx.moveTo(500, 318); targetCtx.lineTo(535, 345);
    targetCtx.stroke();

    // C-shaped hyaline cartilage rings
    targetCtx.strokeStyle = "#bae6fd";
    targetCtx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const cy = 232 + (i * 12);
      targetCtx.beginPath();
      targetCtx.moveTo(493, cy); targetCtx.lineTo(507, cy);
      targetCtx.stroke();
    }

    // 2. PULMONARY LUNGS (With authentic lobar morphology & respiratory expansion)
    const breath = 1.0 + 0.035 * Math.sin(simTime * 2.4);

    // Right Lung (3 Lobes: Superior, Middle, Inferior)
    targetCtx.save();
    targetCtx.translate(440, 385);
    targetCtx.scale(breath, breath);
    targetCtx.fillStyle = "rgba(52, 211, 153, 0.88)";
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -95); // Apex
    targetCtx.bezierCurveTo(35, -90, 48, -40, 48, 10);
    targetCtx.bezierCurveTo(48, 60, 35, 88, 0, 92); // Base
    targetCtx.bezierCurveTo(-38, 92, -45, 60, -45, 10);
    targetCtx.bezierCurveTo(-45, -40, -32, -90, 0, -95);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Fissures (Horizontal & Oblique)
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 1.8;
    // Horizontal fissure
    targetCtx.beginPath();
    targetCtx.moveTo(-35, -10); targetCtx.quadraticCurveTo(5, -15, 45, -5);
    targetCtx.stroke();
    // Oblique fissure
    targetCtx.beginPath();
    targetCtx.moveTo(-20, -55); targetCtx.quadraticCurveTo(10, 15, 35, 75);
    targetCtx.stroke();
    targetCtx.restore();

    // Left Lung (2 Lobes: Superior & Inferior with prominent Cardiac Notch & Lingula)
    targetCtx.save();
    targetCtx.translate(560, 385);
    targetCtx.scale(breath, breath);
    targetCtx.fillStyle = "rgba(52, 211, 153, 0.88)";
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -95); // Apex
    targetCtx.bezierCurveTo(32, -90, 45, -40, 45, 10);
    targetCtx.bezierCurveTo(45, 60, 38, 92, 0, 92); // Base
    targetCtx.bezierCurveTo(-15, 88, -25, 75, -28, 55); // Lingula
    targetCtx.bezierCurveTo(-48, 25, -48, -15, -25, -45); // Deep Cardiac Notch
    targetCtx.bezierCurveTo(-32, -65, -25, -90, 0, -95);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Oblique fissure
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.moveTo(25, -55); targetCtx.quadraticCurveTo(-5, 15, -25, 75);
    targetCtx.stroke();
    targetCtx.restore();

    // 3. FOUR-CHAMBERED HEART & GREAT VESSELS (Conical pump shifted left with LAD & Aorta)
    const hPulse = 1.0 + 0.065 * Math.sin(simTime * 8);
    targetCtx.save();
    targetCtx.translate(515, 395);
    targetCtx.scale(hPulse, hPulse);

    // Aortic Arch (Carmine with 3 branch arteries)
    targetCtx.fillStyle = "#dc2626";
    targetCtx.strokeStyle = "#991b1b";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.arc(-8, -48, 16, Math.PI * 0.9, 0); // Arch curve
    targetCtx.lineTo(6, -20);
    targetCtx.lineTo(-6, -20);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // 3 Great Branches off Arch
    targetCtx.strokeStyle = "#dc2626";
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.moveTo(-20, -56); targetCtx.lineTo(-24, -72); // Brachiocephalic
    targetCtx.moveTo(-10, -64); targetCtx.lineTo(-10, -75); // Left common carotid
    targetCtx.moveTo(0, -60); targetCtx.lineTo(4, -72); // Left subclavian
    targetCtx.stroke();

    // Pulmonary Trunk crossing anteriorly
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.strokeStyle = "#0284c7";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(-18, -25);
    targetCtx.bezierCurveTo(-14, -45, -4, -48, 10, -42);
    targetCtx.lineTo(8, -32);
    targetCtx.bezierCurveTo(0, -36, -8, -32, -12, -20);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Superior Vena Cava (SVC)
    targetCtx.fillStyle = "#0284c7";
    targetCtx.beginPath();
    targetCtx.rect(-34, -58, 10, 35);
    targetCtx.fill();

    // Ventricular Myocardium (Left-shifted conical muscle mass with apex at left 5th ICS)
    targetCtx.fillStyle = "#ef4444";
    targetCtx.strokeStyle = "#991b1b";
    targetCtx.lineWidth = 3;
    targetCtx.shadowColor = "rgba(239, 68, 68, 0.45)";
    targetCtx.shadowBlur = 10;
    targetCtx.beginPath();
    targetCtx.moveTo(-35, -15); // Right atrium border
    targetCtx.bezierCurveTo(-42, 10, -35, 30, -20, 38); // Right ventricle inferior margin
    targetCtx.bezierCurveTo(-5, 45, 12, 48, 22, 44); // Apex pointing inferolaterally
    targetCtx.bezierCurveTo(38, 25, 42, -5, 25, -20); // Left ventricle lateral margin
    targetCtx.bezierCurveTo(15, -28, -20, -25, -35, -15);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Anterior Interventricular Sulcus (LAD Coronary & Great Cardiac Vein)
    targetCtx.strokeStyle = "#7f1d1d";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(-5, -15);
    targetCtx.bezierCurveTo(2, 5, 8, 25, 20, 42); // Descending to apex
    targetCtx.stroke();
    // Coronary artery branchlets
    targetCtx.strokeStyle = "#fca5a5";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(0, 0); targetCtx.lineTo(-12, 12);
    targetCtx.moveTo(5, 15); targetCtx.lineTo(15, 22);
    targetCtx.stroke();

    targetCtx.restore();

    // 4. LIVER (Hepar: Asymmetric wedge with Right/Left lobes & Falciform Ligament)
    targetCtx.fillStyle = "rgba(217, 119, 6, 0.92)";
    targetCtx.strokeStyle = "#92400e";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(422, 475); // Superior dome right lobe
    targetCtx.bezierCurveTo(465, 468, 515, 475, 545, 492); // Sweeping over left lobe
    targetCtx.bezierCurveTo(535, 520, 510, 525, 485, 535); // Inferior margin
    targetCtx.bezierCurveTo(450, 550, 415, 545, 412, 520); // Right lateral margin
    targetCtx.bezierCurveTo(410, 495, 415, 480, 422, 475);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Falciform Ligament & Ligamentum Teres Hepatis
    targetCtx.strokeStyle = "#fef3c7";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(475, 472); targetCtx.bezierCurveTo(478, 500, 472, 525, 468, 542);
    targetCtx.stroke();

    // 5. GALLBLADDER (Pear-shaped emerald bile reservoir with cystic/bile ducts)
    targetCtx.fillStyle = "#10b981";
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(455, 546, 10, 16, 0.35, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Common Bile Duct (CBD)
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(458, 538); targetCtx.quadraticCurveTo(470, 530, 482, 545);
    targetCtx.stroke();

    // 6. STOMACH (Gaster: J-shaped hollow organ with high fundus, curvatures & rugae)
    targetCtx.fillStyle = "rgba(251, 191, 36, 0.92)";
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(518, 488); // Cardia / Esophageal entry
    targetCtx.bezierCurveTo(535, 470, 565, 472, 572, 492); // Dome-like Fundus
    targetCtx.bezierCurveTo(582, 515, 575, 545, 550, 555); // Greater Curvature
    targetCtx.bezierCurveTo(535, 560, 515, 555, 502, 542); // Pyloric Antrum
    targetCtx.bezierCurveTo(512, 530, 525, 520, 522, 505); // Lesser Curvature & Incisura
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Gastric Rugal Folds (Longitudinal undulating mucosal folds)
    targetCtx.strokeStyle = "rgba(180, 83, 9, 0.55)";
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.moveTo(535, 490); targetCtx.quadraticCurveTo(555, 515, 545, 545);
    targetCtx.moveTo(548, 488); targetCtx.quadraticCurveTo(568, 518, 558, 542);
    targetCtx.stroke();

    // 7. PANCREAS & SPLEEN
    // Pancreas (Nestled in duodenal curve)
    targetCtx.fillStyle = "#fde047";
    targetCtx.strokeStyle = "#ca8a04";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(492, 538);
    targetCtx.bezierCurveTo(520, 532, 550, 528, 570, 515); // Tail to splenic hilum
    targetCtx.lineTo(568, 524);
    targetCtx.bezierCurveTo(545, 538, 515, 544, 490, 548); // Body & Head
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Spleen (Left hypochondrium purplish lymphoid organ)
    targetCtx.fillStyle = "#8b5cf6";
    targetCtx.strokeStyle = "#5b21b6";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(585, 502, 14, 24, 0.25, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // 8. BILATERAL KIDNEYS (Reniform beans with Hilum, Cortex, Pyramids & Ureters)
    // Right Kidney (Lower at T12-L3)
    targetCtx.fillStyle = "#a855f7";
    targetCtx.strokeStyle = "#6b21a8";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(435, 580);
    targetCtx.bezierCurveTo(452, 580, 455, 600, 448, 615); // Medial Hilum indentation
    targetCtx.bezierCurveTo(442, 630, 432, 635, 420, 625); // Lower pole
    targetCtx.bezierCurveTo(410, 610, 412, 595, 420, 582); // Convex lateral border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Kidney (Higher at T11-L2)
    targetCtx.beginPath();
    targetCtx.moveTo(565, 572);
    targetCtx.bezierCurveTo(548, 572, 545, 592, 552, 607); // Medial Hilum
    targetCtx.bezierCurveTo(558, 622, 568, 627, 580, 617);
    targetCtx.bezierCurveTo(590, 602, 588, 587, 580, 574);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Bilateral Muscular Ureters descending to bladder trigone
    targetCtx.strokeStyle = "#c084fc";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(446, 610); targetCtx.bezierCurveTo(458, 680, 465, 750, 492, 828);
    targetCtx.moveTo(554, 602); targetCtx.bezierCurveTo(542, 680, 535, 750, 508, 828);
    targetCtx.stroke();

    // 9. INTESTINES (Framing Large Intestine / Colon & Convoluted Small Bowel)
    // Large Intestine (Colon with Haustra pouches & Taeniae Coli)
    targetCtx.fillStyle = "rgba(245, 158, 11, 0.85)";
    targetCtx.strokeStyle = "#92400e";
    targetCtx.lineWidth = 2.5;

    // Cecum & Appendix in Right Iliac Fossa
    targetCtx.beginPath();
    targetCtx.ellipse(436, 735, 16, 20, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Vermiform Appendix
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(436, 750); targetCtx.bezierCurveTo(428, 765, 435, 775, 442, 772);
    targetCtx.stroke();

    // Ascending Colon -> Hepatic Flexure -> Transverse Colon -> Splenic Flexure -> Descending -> Sigmoid
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 15;
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    targetCtx.beginPath();
    targetCtx.moveTo(436, 725);
    targetCtx.lineTo(436, 630); // Ascending colon
    targetCtx.bezierCurveTo(438, 615, 460, 612, 500, 615); // Hepatic flexure to Transverse colon
    targetCtx.bezierCurveTo(540, 612, 562, 615, 564, 630); // Splenic flexure
    targetCtx.lineTo(564, 725); // Descending colon
    targetCtx.bezierCurveTo(564, 750, 545, 765, 525, 778); // Sigmoid colon
    targetCtx.stroke();

    // Small Intestine (Central convoluted loops with plicae circulares)
    targetCtx.fillStyle = "#f59e0b";
    targetCtx.strokeStyle = "#d97706";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(500, 685, 46, 42, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Convoluted intestinal loops
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 2;
    for (let c = 0; c < 5; c++) {
      targetCtx.beginPath();
      targetCtx.arc(478 + (c * 11), 675 + ((c % 2) * 16), 14, 0, Math.PI * 2);
      targetCtx.stroke();
    }

    // 10. URINARY BLADDER (Detrusor muscle reservoir)
    targetCtx.fillStyle = "#c084fc";
    targetCtx.strokeStyle = "#7e22ce";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.ellipse(500, 835, 24, 20, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 3: Skeletal Muscular System (Superficial & Deep Myology)
  function drawMuscularVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    const muscleRed = "#dc2626";
    const muscleDark = "#991b1b";
    const fasciaWhite = "rgba(254, 226, 226, 0.75)";
    const tendonWhite = "#f8fafc";

    targetCtx.fillStyle = muscleRed;
    targetCtx.strokeStyle = muscleDark;
    targetCtx.lineWidth = 2;

    if (view === "anterior") {
      // 1. STERNOCLEIDOMASTOID (Neck strap muscles)
      targetCtx.beginPath();
      // Left SCM
      targetCtx.moveTo(462, 205); targetCtx.lineTo(470, 205); targetCtx.lineTo(494, 258); targetCtx.lineTo(486, 258);
      targetCtx.closePath();
      // Right SCM
      targetCtx.moveTo(538, 205); targetCtx.lineTo(530, 205); targetCtx.lineTo(506, 258); targetCtx.lineTo(514, 258);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 2. PECTORALIS MAJOR (Fan-shaped chest muscles with clavicular & sternocostal fiber heads)
      // Left Pectoralis Major
      targetCtx.beginPath();
      targetCtx.moveTo(492, 264); // Clavicular origin
      targetCtx.bezierCurveTo(450, 266, 400, 290, 360, 318); // Insertion into humerus
      targetCtx.bezierCurveTo(370, 345, 410, 365, 460, 365); // Inferior border
      targetCtx.bezierCurveTo(482, 365, 492, 340, 492, 264); // Sternal margin
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Right Pectoralis Major
      targetCtx.beginPath();
      targetCtx.moveTo(508, 264);
      targetCtx.bezierCurveTo(550, 266, 600, 290, 640, 318);
      targetCtx.bezierCurveTo(630, 345, 590, 365, 540, 365);
      targetCtx.bezierCurveTo(518, 365, 508, 340, 508, 264);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Radiating Pectoral Muscle Fascicles
      targetCtx.strokeStyle = fasciaWhite;
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(490, 275); targetCtx.lineTo(375, 315);
      targetCtx.moveTo(490, 305); targetCtx.lineTo(380, 328);
      targetCtx.moveTo(485, 340); targetCtx.lineTo(390, 338);
      targetCtx.moveTo(510, 275); targetCtx.lineTo(625, 315);
      targetCtx.moveTo(510, 305); targetCtx.lineTo(620, 328);
      targetCtx.moveTo(515, 340); targetCtx.lineTo(610, 338);
      targetCtx.stroke();

      // 3. SERRATUS ANTERIOR (Sawtooth digitations on lateral ribcage)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 1.5;
      for (let s = 0; s < 4; s++) {
        const sy = 370 + s * 18;
        // Left slips
        targetCtx.beginPath();
        targetCtx.moveTo(395, sy); targetCtx.lineTo(418, sy + 6); targetCtx.lineTo(415, sy + 14); targetCtx.lineTo(392, sy + 8);
        targetCtx.closePath();
        targetCtx.fill(); targetCtx.stroke();
        // Right slips
        targetCtx.beginPath();
        targetCtx.moveTo(605, sy); targetCtx.lineTo(582, sy + 6); targetCtx.lineTo(585, sy + 14); targetCtx.lineTo(608, sy + 8);
        targetCtx.closePath();
        targetCtx.fill(); targetCtx.stroke();
      }

      // 4. RECTUS ABDOMINIS (Linea Alba & 4 Tendinous Intersections creating 6-pack)
      targetCtx.fillStyle = "#b91c1c";
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      for (let ab = 0; ab < 4; ab++) {
        const aby = 465 + (ab * 48);
        // Left belly
        targetCtx.beginPath();
        targetCtx.roundRect(474, aby, 22, 42, 5);
        targetCtx.fill(); targetCtx.stroke();
        // Right belly
        targetCtx.beginPath();
        targetCtx.roundRect(504, aby, 22, 42, 5);
        targetCtx.fill(); targetCtx.stroke();
      }

      // Linea Alba (Midline fibrous tendon)
      targetCtx.strokeStyle = tendonWhite;
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 445); targetCtx.lineTo(500, 675);
      targetCtx.stroke();

      // 5. EXTERNAL OBLIQUES (Flank wall with downward-sloping fibers)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      // Left Oblique
      targetCtx.beginPath();
      targetCtx.moveTo(418, 460); targetCtx.bezierCurveTo(405, 540, 415, 620, 435, 690);
      targetCtx.lineTo(468, 660); targetCtx.bezierCurveTo(460, 580, 458, 500, 468, 460);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
      // Right Oblique
      targetCtx.beginPath();
      targetCtx.moveTo(582, 460); targetCtx.bezierCurveTo(595, 540, 585, 620, 565, 690);
      targetCtx.lineTo(532, 660); targetCtx.bezierCurveTo(540, 580, 542, 500, 532, 460);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 6. QUADRICEPS FEMORIS (Rectus Femoris, Vastus Lateralis, & Teardrop Vastus Medialis Oblique)
      // Left Thigh
      targetCtx.beginPath();
      // Vastus Lateralis (Sweeping lateral bulk)
      targetCtx.ellipse(432, 1030, 24, 115, -0.05, 0, Math.PI * 2);
      // Rectus Femoris (Central bipennate mass)
      targetCtx.ellipse(452, 1020, 22, 105, 0, 0, Math.PI * 2);
      // Vastus Medialis Oblique (VMO: Teardrop bulge just above medial knee)
      targetCtx.ellipse(464, 1130, 16, 38, 0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Right Thigh
      targetCtx.beginPath();
      // Vastus Lateralis
      targetCtx.ellipse(568, 1030, 24, 115, 0.05, 0, Math.PI * 2);
      // Rectus Femoris
      targetCtx.ellipse(548, 1020, 22, 105, 0, 0, Math.PI * 2);
      // Vastus Medialis Oblique (VMO)
      targetCtx.ellipse(536, 1130, 16, 38, -0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Patellar Tendon / Ligament
      targetCtx.fillStyle = tendonWhite;
      targetCtx.strokeStyle = "#cbd5e1";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.roundRect(432, 1205, 12, 28, 3);
      targetCtx.roundRect(556, 1205, 12, 28, 3);
      targetCtx.fill(); targetCtx.stroke();

      // 7. SARTORIUS (Longest muscle: Diagonal ribbon crossing thigh)
      targetCtx.fillStyle = "#ef4444";
      targetCtx.strokeStyle = "#b91c1c";
      targetCtx.lineWidth = 1.8;
      targetCtx.beginPath();
      targetCtx.moveTo(432, 785); targetCtx.quadraticCurveTo(450, 950, 470, 1215);
      targetCtx.lineTo(465, 1220); targetCtx.quadraticCurveTo(442, 950, 426, 785);
      targetCtx.closePath();
      targetCtx.moveTo(568, 785); targetCtx.quadraticCurveTo(550, 950, 530, 1215);
      targetCtx.lineTo(535, 1220); targetCtx.quadraticCurveTo(558, 950, 574, 785);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 8. TIBIALIS ANTERIOR (Shin muscle lateral to tibial crest)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.ellipse(436, 1380, 14, 85, 0.02, 0, Math.PI * 2);
      targetCtx.ellipse(564, 1380, 14, 85, -0.02, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Extensor tendons over ankles to toes
      targetCtx.strokeStyle = tendonWhite;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(436, 1470); targetCtx.lineTo(452, 1680);
      targetCtx.moveTo(564, 1470); targetCtx.lineTo(548, 1680);
      targetCtx.stroke();
    } else {
      // POSTERIOR MYOLOGY (Trapezius, Latissimus Dorsi, Gluteus Maximus, Hamstrings, Gastrocnemius)
      // 1. TRAPEZIUS (Diamond kite muscle covering neck and upper back)
      targetCtx.beginPath();
      targetCtx.moveTo(500, 155); // External occipital protuberance
      targetCtx.lineTo(410, 278); // Left acromion / spine of scapula
      targetCtx.lineTo(450, 435); // Left scapula inferior angle
      targetCtx.lineTo(500, 520); // T12 spinous process
      targetCtx.lineTo(550, 435);
      targetCtx.lineTo(590, 278);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 2. LATISSIMUS DORSI (Vast triangular muscle of lower back)
      targetCtx.beginPath();
      targetCtx.moveTo(450, 435); targetCtx.lineTo(380, 360); targetCtx.lineTo(425, 680); targetCtx.lineTo(496, 680); targetCtx.lineTo(496, 520);
      targetCtx.closePath();
      targetCtx.moveTo(550, 435); targetCtx.lineTo(620, 360); targetCtx.lineTo(575, 680); targetCtx.lineTo(504, 680); targetCtx.lineTo(504, 520);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 3. GLUTEUS MAXIMUS & MEDIUS (Most powerful muscle in human body)
      targetCtx.beginPath();
      targetCtx.ellipse(456, 815, 44, 55, -0.22, 0, Math.PI * 2);
      targetCtx.ellipse(544, 815, 44, 55, 0.22, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Coarse diagonal gluteal fiber striations
      targetCtx.strokeStyle = fasciaWhite;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(492, 785); targetCtx.lineTo(435, 835);
      targetCtx.moveTo(492, 815); targetCtx.lineTo(440, 855);
      targetCtx.moveTo(508, 785); targetCtx.lineTo(565, 835);
      targetCtx.moveTo(508, 815); targetCtx.lineTo(560, 855);
      targetCtx.stroke();

      // 4. HAMSTRINGS (Biceps femoris laterally, Semitendinosus/Semimembranosus medially)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      // Left Hamstring
      targetCtx.ellipse(448, 1040, 28, 115, 0, 0, Math.PI * 2);
      // Right Hamstring
      targetCtx.ellipse(552, 1040, 28, 115, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Popliteal Fossa (Diamond space behind knee)
      targetCtx.fillStyle = "#7f1d1d";
      targetCtx.beginPath();
      targetCtx.ellipse(442, 1195, 12, 22, 0, 0, Math.PI * 2);
      targetCtx.ellipse(558, 1195, 12, 22, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 5. GASTROCNEMIUS & ACHILLES TENDON (Dual calf heads with asymmetric medial fullness)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      // Left Calf (Medial head larger & extending lower)
      targetCtx.ellipse(432, 1345, 18, 65, -0.05, 0, Math.PI * 2); // Lateral head
      targetCtx.ellipse(452, 1370, 20, 72, 0.05, 0, Math.PI * 2); // Medial head
      // Right Calf
      targetCtx.ellipse(568, 1345, 18, 65, 0.05, 0, Math.PI * 2); // Lateral head
      targetCtx.ellipse(548, 1370, 20, 72, -0.05, 0, Math.PI * 2); // Medial head
      targetCtx.fill(); targetCtx.stroke();

      // Achilles Tendon (Tendo Calcaneus: Thickest tendon in human body)
      targetCtx.fillStyle = tendonWhite;
      targetCtx.strokeStyle = "#cbd5e1";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.roundRect(436, 1445, 14, 145, 4);
      targetCtx.roundRect(550, 1445, 14, 145, 4);
      targetCtx.fill(); targetCtx.stroke();
    }

    // DELTOIDS & UPPER LIMBS (Bilateral)
    targetCtx.fillStyle = muscleRed;
    targetCtx.strokeStyle = muscleDark;
    targetCtx.lineWidth = 2;
    // Deltoids (Wrapping shoulder cap)
    targetCtx.beginPath();
    targetCtx.ellipse(360, 310, 24, 40, -0.38, 0, Math.PI * 2);
    targetCtx.ellipse(640, 310, 24, 40, 0.38, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Biceps Brachii / Triceps (Upper arm)
    targetCtx.beginPath();
    targetCtx.ellipse(328, 410, 20, 55, -0.15, 0, Math.PI * 2);
    targetCtx.ellipse(672, 410, 20, 55, 0.15, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Forearm (Brachioradialis & Flexor/Extensor groups)
    targetCtx.beginPath();
    targetCtx.ellipse(282, 550, 18, 70, -0.22, 0, Math.PI * 2);
    targetCtx.ellipse(718, 550, 18, 70, 0.22, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Hand Muscle Bellies (Thenar & Hypothenar eminences)
    targetCtx.beginPath();
    targetCtx.ellipse(225, 745, 12, 18, -0.35, 0, Math.PI * 2);
    targetCtx.ellipse(775, 745, 12, 18, 0.35, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 4: Superficial Integument & 8K Photo Skin Blending
  function drawSkinVector(targetCtx, view, alpha, skinImg, mode = "photo") {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    if (skinImg && skinImg.complete && skinImg.naturalWidth > 0) {
      drawPlateImageLayer(targetCtx, skinImg, alpha, mode);
    } else {
      // Dermal subsurface skin fill when photo is disabled
      const skinGrad = targetCtx.createLinearGradient(500, 65, 500, 1720);
      skinGrad.addColorStop(0, "#f3d5ba");
      skinGrad.addColorStop(0.3, "#eac2a5");
      skinGrad.addColorStop(0.6, "#dfb394");
      skinGrad.addColorStop(1.0, "#d5a585");
      targetCtx.fillStyle = skinGrad;
      buildHumanBodyPath(targetCtx);
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  // STRATUM 5: Vasculature (Angiology - Pulsating Arterial & Venous Trees)
  function drawVascularVector(targetCtx, view, alpha, mode = "photo") {
    if (alpha <= 0.005 && mode !== "angiogram") return;
    targetCtx.save();
    const circAlpha = Math.min(1.0, alpha * (mode === "angiogram" ? 1.0 : 0.95));
    targetCtx.globalAlpha = circAlpha;
    const pulse = 1.0 + 0.16 * Math.sin(simTime * 8);

    // Glowing Aorta & Systemic Arteries (Vermilion Red with systolic pulse)
    targetCtx.shadowColor = "#ef4444";
    targetCtx.shadowBlur = 12 * pulse;
    targetCtx.strokeStyle = "#ef4444";
    targetCtx.lineWidth = 4 * pulse;
    targetCtx.beginPath();
    if (view === "anterior") {
      // Aortic Arch & Descending Thoracic / Abdominal Aorta
      targetCtx.arc(518, 295, 18, Math.PI * 0.95, 0);
      targetCtx.lineTo(518, 720); // Aorta to L4 bifurcation
      // Iliac Bifurcation & Femoral Arteries
      targetCtx.lineTo(475, 835); targetCtx.lineTo(440, 1050); targetCtx.lineTo(434, 1205); // Left Femoral to Popliteal
      targetCtx.lineTo(430, 1400); targetCtx.lineTo(442, 1610); targetCtx.lineTo(458, 1690); // Anterior Tibial to Dorsalis Pedis
      targetCtx.moveTo(518, 720);
      targetCtx.lineTo(561, 835); targetCtx.lineTo(560, 1050); targetCtx.lineTo(566, 1205); // Right Femoral to Popliteal
      targetCtx.lineTo(570, 1400); targetCtx.lineTo(558, 1610); targetCtx.lineTo(542, 1690);

      // Carotid Arteries & Cranial Supply
      targetCtx.moveTo(506, 290); targetCtx.lineTo(488, 195); targetCtx.lineTo(476, 145); // Left common & internal carotid
      targetCtx.moveTo(526, 290); targetCtx.lineTo(538, 195); targetCtx.lineTo(548, 145); // Right common & internal carotid

      // Subclavian, Axillary, Brachial & Radial/Ulnar Arteries to Hands
      targetCtx.moveTo(502, 292); targetCtx.lineTo(380, 310); targetCtx.lineTo(332, 450); // Left Brachial
      targetCtx.lineTo(290, 560); targetCtx.lineTo(228, 720); targetCtx.lineTo(215, 820); // Radial / Palmar arch
      targetCtx.moveTo(534, 292); targetCtx.lineTo(620, 310); targetCtx.lineTo(668, 450); // Right Brachial
      targetCtx.lineTo(710, 560); targetCtx.lineTo(772, 720); targetCtx.lineTo(785, 820); // Radial / Palmar arch

      // Celiac, Renal & Mesenteric arterial branches
      targetCtx.moveTo(518, 500); targetCtx.lineTo(475, 520); // Hepatic / Gastric
      targetCtx.moveTo(518, 500); targetCtx.lineTo(565, 505); // Splenic
      targetCtx.moveTo(518, 590); targetCtx.lineTo(452, 602); // Left Renal artery
      targetCtx.moveTo(518, 590); targetCtx.lineTo(575, 595); // Right Renal artery
    } else {
      // Posterior Vasculature
      targetCtx.moveTo(500, 310); targetCtx.lineTo(500, 720);
      targetCtx.lineTo(470, 835); targetCtx.lineTo(440, 1205); targetCtx.lineTo(430, 1580);
      targetCtx.moveTo(500, 720); targetCtx.lineTo(530, 835); targetCtx.lineTo(560, 1205); targetCtx.lineTo(570, 1580);
    }
    targetCtx.stroke();

    // Traveling Arterial Systolic Wave Packet
    const pWave = (simTime * 400) % 900;
    targetCtx.beginPath();
    targetCtx.arc(518, 295 + (pWave * 0.45), 6 * pulse, 0, Math.PI * 2);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.shadowColor = "#f43f5e";
    targetCtx.shadowBlur = 18;
    targetCtx.fill();

    // Glowing Vena Cava & Major Systemic Veins (Cyan / Azure Blue)
    targetCtx.shadowColor = "#38bdf8";
    targetCtx.shadowBlur = 10;
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    if (view === "anterior") {
      // Superior Vena Cava (SVC) & Jugular veins
      targetCtx.moveTo(482, 195); targetCtx.lineTo(530, 260); // Left internal jugular
      targetCtx.moveTo(544, 195); targetCtx.lineTo(534, 260); // Right internal jugular
      targetCtx.moveTo(532, 260); targetCtx.lineTo(532, 340); // SVC to Right Atrium

      // Inferior Vena Cava (IVC) ascending alongside aorta
      targetCtx.moveTo(532, 420); targetCtx.lineTo(532, 720);
      targetCtx.lineTo(490, 835); targetCtx.lineTo(456, 1050); targetCtx.lineTo(450, 1205); // Left Common Iliac & Femoral vein
      targetCtx.moveTo(532, 720); targetCtx.lineTo(574, 835); targetCtx.lineTo(544, 1050); targetCtx.lineTo(550, 1205);

      // Great Saphenous Vein (Longest vein in human body ascending medially)
      targetCtx.moveTo(458, 1680); targetCtx.lineTo(462, 1400); targetCtx.lineTo(468, 1205); targetCtx.lineTo(476, 1000); targetCtx.lineTo(485, 850);
      targetCtx.moveTo(542, 1680); targetCtx.lineTo(538, 1400); targetCtx.lineTo(532, 1205); targetCtx.lineTo(524, 1000); targetCtx.lineTo(515, 850);

      // Cephalic & Basilic Veins of Arms
      targetCtx.moveTo(380, 315); targetCtx.lineTo(315, 480); targetCtx.lineTo(260, 680);
      targetCtx.moveTo(620, 315); targetCtx.lineTo(685, 480); targetCtx.lineTo(740, 680);
    } else {
      targetCtx.moveTo(515, 200); targetCtx.lineTo(515, 720);
      targetCtx.lineTo(485, 835); targetCtx.lineTo(455, 1205);
      targetCtx.moveTo(515, 720); targetCtx.lineTo(545, 835); targetCtx.lineTo(545, 1205);
    }
    targetCtx.stroke();
    targetCtx.restore();
  }

  // STRATUM 6: Bioelectric Nervous System Axis (Central & Peripheral Neuroaxis)
  function drawNervousVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);
    targetCtx.shadowColor = "#00f0ff";
    targetCtx.shadowBlur = 14;
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 3.5;

    targetCtx.beginPath();
    // 1. CEREBRUM & ENCEPHALON (Cerebral hemispheres with gyri and sulci)
    targetCtx.ellipse(500, 125, 46, 52, 0, 0, Math.PI * 2);

    // Cerebral sulci convolutions
    targetCtx.moveTo(480, 105); targetCtx.quadraticCurveTo(500, 115, 520, 105);
    targetCtx.moveTo(472, 125); targetCtx.quadraticCurveTo(500, 135, 528, 125);
    targetCtx.moveTo(475, 145); targetCtx.quadraticCurveTo(500, 155, 525, 145);

    // Cerebellum & Brainstem exiting through foramen magnum
    targetCtx.moveTo(492, 165); targetCtx.lineTo(492, 185);
    targetCtx.moveTo(508, 165); targetCtx.lineTo(508, 185);

    // 2. SPINAL CORD (With Cervical & Lumbar enlargements, conus medullaris & cauda equina)
    targetCtx.moveTo(500, 185);
    targetCtx.lineTo(500, 250); // Cervical cord
    targetCtx.lineTo(500, 715); // Thoracic & Lumbar cord to Conus Medullaris (L1/L2)
    // Cauda Equina ("Horse's tail" nerve roots streaming down dural sac)
    targetCtx.lineTo(494, 785);
    targetCtx.moveTo(500, 715); targetCtx.lineTo(506, 785);
    targetCtx.moveTo(500, 715); targetCtx.lineTo(500, 810); // Filum terminale

    // 3. BRACHIAL PLEXUS (C5-T1 roots branching to axillary, musculocutaneous, radial, median, ulnar)
    // Left Upper Limb
    targetCtx.moveTo(500, 255);
    targetCtx.bezierCurveTo(450, 270, 390, 310, 350, 345); // Roots to trunks in neck
    targetCtx.bezierCurveTo(325, 410, 305, 480, 280, 560); // Arm to forearm
    targetCtx.bezierCurveTo(260, 640, 235, 710, 218, 820); // Wrist to digital nerves
    // Right Upper Limb
    targetCtx.moveTo(500, 255);
    targetCtx.bezierCurveTo(550, 270, 610, 310, 650, 345);
    targetCtx.bezierCurveTo(675, 410, 695, 480, 720, 560);
    targetCtx.bezierCurveTo(740, 640, 765, 710, 782, 820);

    // 4. THORACIC INTERCOSTAL NERVES (Segmented subcostal nerves)
    for (let n = 0; n < 6; n++) {
      const ny = 310 + (n * 30);
      targetCtx.moveTo(500, ny); targetCtx.bezierCurveTo(475, ny + 8, 445, ny + 12, 420, ny + 20);
      targetCtx.moveTo(500, ny); targetCtx.bezierCurveTo(525, ny + 8, 555, ny + 12, 580, ny + 20);
    }

    // 5. LUMBOSACRAL PLEXUS & SCIATIC NERVES (Thickest nerve in human body)
    if (view === "anterior") {
      // Femoral & Obturator Nerves
      targetCtx.moveTo(500, 710); targetCtx.bezierCurveTo(470, 760, 448, 860, 442, 1020); targetCtx.lineTo(438, 1205);
      targetCtx.moveTo(500, 710); targetCtx.bezierCurveTo(530, 760, 552, 860, 558, 1020); targetCtx.lineTo(562, 1205);
      // Tibial & Peroneal Nerves down legs
      targetCtx.moveTo(438, 1205); targetCtx.lineTo(434, 1420); targetCtx.lineTo(445, 1640);
      targetCtx.moveTo(562, 1205); targetCtx.lineTo(566, 1420); targetCtx.lineTo(555, 1640);
    } else {
      // Massive Posterior Sciatic Nerves descending from greater sciatic foramen
      targetCtx.moveTo(492, 750);
      targetCtx.bezierCurveTo(465, 790, 452, 900, 448, 1050); // Sciatic trunk
      targetCtx.lineTo(444, 1190); // Popliteal bifurcation into Tibial & Common Fibular
      targetCtx.lineTo(438, 1420); targetCtx.lineTo(442, 1620);
      targetCtx.moveTo(444, 1190); targetCtx.lineTo(426, 1260); // Fibular branch

      targetCtx.moveTo(508, 750);
      targetCtx.bezierCurveTo(535, 790, 548, 900, 552, 1050);
      targetCtx.lineTo(556, 1190);
      targetCtx.lineTo(562, 1420); targetCtx.lineTo(558, 1620);
      targetCtx.moveTo(556, 1190); targetCtx.lineTo(574, 1260);
    }
    targetCtx.stroke();

    // Dynamic Traveling Action-Potential Bioelectric Pulse
    const apPos = (simTime * 500) % 650;
    targetCtx.beginPath();
    targetCtx.arc(500, 120 + apPos, 5, 0, Math.PI * 2);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.shadowColor = "#38bdf8";
    targetCtx.shadowBlur = 20;
    targetCtx.fill();

    targetCtx.restore();
  }

  // Helper to interpolate along a polyline path for 60 FPS physiological particle streams
  function samplePolylinePoint(pts, tNorm) {
    if (!pts || pts.length === 0) return { x: 500, y: 500 };
    if (pts.length === 1) return pts[0];
    const t = ((tNorm % 1) + 1) % 1;
    const totalSegs = pts.length - 1;
    const scaled = t * totalSegs;
    const idx = Math.min(totalSegs - 1, Math.floor(scaled));
    const frac = scaled - idx;
    const p0 = pts[idx];
    const p1 = pts[idx + 1];
    if (!p0 || !p1) return p0 || p1 || { x: 500, y: 500 };
    return {
      x: p0.x + (p1.x - p0.x) * frac,
      y: p0.y + (p1.y - p0.y) * frac
    };
  }

  // Real-Time 60 FPS Physiological Particle & Bio-Signal Streams on 3D Plates
  function drawLive3dPhysiologicalStreams(targetCtx, plateKey) {
    if (!liveFlowParticles) return;
    targetCtx.save();

    const hrFactor = (histoState.heartRate || 72) / 72;
    const rrFactor = (breathRate || 15) / 15;
    const heartBeat = Math.pow(Math.max(0, Math.sin(simTime * hrFactor * 7.5)), 3);
    const breathPhase = Math.sin(simTime * rrFactor * 1.6); // > 0 inspiration, < 0 expiration

    const drawParticleStream = (pathPts, count, speed, color, glowColor, radius, reverse = false) => {
      targetCtx.save();
      targetCtx.beginPath();
      pathPts.forEach((pt, i) => {
        if (i === 0) targetCtx.moveTo(pt.x, pt.y);
        else targetCtx.lineTo(pt.x, pt.y);
      });
      targetCtx.strokeStyle = `${color}28`;
      targetCtx.lineWidth = radius * 1.4;
      targetCtx.lineCap = "round";
      targetCtx.stroke();

      targetCtx.fillStyle = color;
      targetCtx.shadowColor = glowColor || color;
      targetCtx.shadowBlur = radius * 2.4;
      for (let i = 0; i < count; i++) {
        let phase = (simTime * speed + i / count) % 1;
        if (reverse) phase = 1.0 - phase;
        const pt = samplePolylinePoint(pathPts, phase);
        targetCtx.beginPath();
        targetCtx.arc(pt.x, pt.y, radius * (0.85 + 0.25 * Math.sin(simTime * 6 + i)), 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.restore();
    };

    if (plateKey === "full_anterior") {
      // 1. Beating 3D Heart Systolic Glow
      const hGrad = targetCtx.createRadialGradient(515, 385, 4, 515, 385, 44 * (1 + 0.25 * heartBeat));
      hGrad.addColorStop(0, `rgba(239, 68, 68, ${0.28 + 0.35 * heartBeat})`);
      hGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      targetCtx.fillStyle = hGrad;
      targetCtx.beginPath();
      targetCtx.arc(515, 385, 44 * (1 + 0.25 * heartBeat), 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Arterial Oxygenated Blood Streams (Heart -> Aorta -> Brain / Liver / Kidneys / Pelvis)
      drawParticleStream(
        [{ x: 515, y: 385 }, { x: 502, y: 332 }, { x: 484, y: 230 }, { x: 500, y: 125 }],
        5, 0.38 * hrFactor, "#ff4d6d", "#ef4444", 3.2
      );
      drawParticleStream(
        [{ x: 515, y: 385 }, { x: 502, y: 332 }, { x: 500, y: 480 }, { x: 500, y: 588 }, { x: 500, y: 740 }],
        7, 0.42 * hrFactor, "#ef4444", "#f87171", 3.5
      );
      // Renal arterial branches to Left & Right 3D Kidneys
      drawParticleStream(
        [{ x: 500, y: 580 }, { x: 450, y: 588 }],
        3, 0.45 * hrFactor, "#fb7185", "#ef4444", 2.6
      );
      drawParticleStream(
        [{ x: 500, y: 580 }, { x: 552, y: 588 }],
        3, 0.45 * hrFactor, "#fb7185", "#ef4444", 2.6
      );
      // Venous Return (IVC & SVC -> Right Atrium)
      drawParticleStream(
        [{ x: 486, y: 740 }, { x: 486, y: 580 }, { x: 486, y: 450 }, { x: 492, y: 382 }],
        6, 0.32 * hrFactor, "#38bdf8", "#0284c7", 3.0
      );

      // 3. Respiratory O₂ / CO₂ Tidal Airflow in Trachea & Lungs
      const isInsp = breathPhase >= 0;
      const airColor = isInsp ? "#22d3ee" : "#a78bfa";
      drawParticleStream(
        [{ x: 500, y: 215 }, { x: 500, y: 278 }, { x: 500, y: 325 }, { x: 435, y: 365 }, { x: 420, y: 405 }],
        5, 0.34 * rrFactor, airColor, airColor, 3.0, !isInsp
      );
      drawParticleStream(
        [{ x: 500, y: 215 }, { x: 500, y: 278 }, { x: 500, y: 325 }, { x: 562, y: 365 }, { x: 575, y: 405 }],
        5, 0.34 * rrFactor, airColor, airColor, 3.0, !isInsp
      );

      // 4. Neural Bioelectric Synaptic Sparks in 3D Brain & Brainstem
      drawParticleStream(
        [{ x: 465, y: 115 }, { x: 500, y: 102 }, { x: 535, y: 115 }, { x: 500, y: 145 }, { x: 500, y: 195 }],
        5, 0.55, "#fde047", "#38bdf8", 2.8
      );

      // 5. Hepatobiliary Bile & Gastric/Intestinal Peristalsis
      drawParticleStream(
        [{ x: 432, y: 495 }, { x: 448, y: 535 }, { x: 485, y: 555 }],
        3, 0.25, "#10b981", "#34d399", 2.8
      );
      drawParticleStream(
        [{ x: 545, y: 485 }, { x: 556, y: 512 }, { x: 525, y: 550 }, { x: 505, y: 635 }, { x: 505, y: 695 }],
        5, 0.22, "#fb923c", "#f59e0b", 3.0
      );

      // 6. Renal Ureteral Peristalsis (Kidneys -> Ureters -> Urinary Bladder)
      drawParticleStream(
        [{ x: 450, y: 595 }, { x: 472, y: 695 }, { x: 492, y: 790 }],
        4, 0.26, "#facc15", "#eab308", 2.7
      );
      drawParticleStream(
        [{ x: 552, y: 595 }, { x: 528, y: 695 }, { x: 508, y: 790 }],
        4, 0.26, "#facc15", "#eab308", 2.7
      );

    } else if (plateKey === "heart") {
      // 3D Heart Cutaway Intracardiac Hemodynamics (Deoxygenated Right Heart & Oxygenated Left Heart)
      drawParticleStream(
        [{ x: 320, y: 390 }, { x: 325, y: 520 }, { x: 335, y: 650 }, { x: 415, y: 775 }, { x: 445, y: 635 }, { x: 455, y: 515 }, { x: 605, y: 485 }],
        9, 0.36 * hrFactor, "#38bdf8", "#0284c7", 4.5
      );
      drawParticleStream(
        [{ x: 645, y: 585 }, { x: 570, y: 665 }, { x: 595, y: 765 }, { x: 515, y: 615 }, { x: 485, y: 445 }, { x: 485, y: 375 }, { x: 510, y: 295 }],
        10, 0.42 * hrFactor, "#ff4d6d", "#ef4444", 4.8
      );
      drawParticleStream(
        [{ x: 325, y: 575 }, { x: 445, y: 655 }, { x: 495, y: 745 }, { x: 535, y: 830 }],
        4, 0.55 * hrFactor, "#fde047", "#facc15", 3.6
      );

    } else if (plateKey === "lungs") {
      // 3D Respiratory Cutaway Tidal O₂ Inspiration & CO₂ Expiration
      const isInsp = breathPhase >= 0;
      const airCol = isInsp ? "#22d3ee" : "#c084fc";
      drawParticleStream(
        [{ x: 498, y: 230 }, { x: 498, y: 435 }, { x: 498, y: 585 }, { x: 380, y: 610 }, { x: 315, y: 615 }, { x: 265, y: 720 }],
        8, 0.35 * rrFactor, airCol, airCol, 4.2, !isInsp
      );
      drawParticleStream(
        [{ x: 498, y: 230 }, { x: 498, y: 435 }, { x: 498, y: 585 }, { x: 595, y: 625 }, { x: 645, y: 730 }, { x: 690, y: 835 }],
        8, 0.35 * rrFactor, airCol, airCol, 4.2, !isInsp
      );

    } else if (plateKey === "digestive") {
      // 3D Digestive System Peristaltic Wave & Hepatobiliary Secretion
      drawParticleStream(
        [{ x: 506, y: 170 }, { x: 506, y: 310 }, { x: 575, y: 420 }, { x: 535, y: 490 }, { x: 465, y: 525 }, { x: 512, y: 690 }],
        8, 0.24, "#fb923c", "#f59e0b", 4.2
      );
      drawParticleStream(
        [{ x: 405, y: 360 }, { x: 418, y: 442 }, { x: 462, y: 510 }],
        4, 0.28, "#10b981", "#34d399", 3.6
      );
      drawParticleStream(
        [{ x: 585, y: 515 }, { x: 525, y: 518 }, { x: 468, y: 518 }],
        4, 0.30, "#fde047", "#eab308", 3.4
      );
      drawParticleStream(
        [{ x: 368, y: 760 }, { x: 368, y: 585 }, { x: 505, y: 565 }, { x: 645, y: 585 }, { x: 645, y: 765 }, { x: 508, y: 865 }],
        7, 0.18, "#fbbf24", "#d97706", 3.8
      );

    } else if (plateKey === "brain") {
      // 3D Brain Sagittal & Lateral Neural Action Potential Pathways
      drawParticleStream(
        [{ x: 185, y: 480 }, { x: 275, y: 448 }, { x: 365, y: 475 }, { x: 282, y: 512 }, { x: 288, y: 618 }, { x: 295, y: 710 }],
        7, 0.48, "#22d3ee", "#38bdf8", 3.8
      );
      drawParticleStream(
        [{ x: 645, y: 445 }, { x: 705, y: 430 }, { x: 805, y: 435 }, { x: 875, y: 520 }, { x: 715, y: 548 }, { x: 805, y: 625 }],
        7, 0.45, "#fde047", "#f59e0b", 3.8
      );

    } else if (plateKey === "urinary") {
      // 3D Urinary & Renal System Hemodynamics & Ureteral Filtrate Flow
      drawParticleStream(
        [{ x: 495, y: 240 }, { x: 495, y: 390 }, { x: 430, y: 415 }, { x: 335, y: 395 }],
        6, 0.42 * hrFactor, "#ef4444", "#f87171", 4.0
      );
      drawParticleStream(
        [{ x: 495, y: 390 }, { x: 595, y: 410 }, { x: 650, y: 395 }],
        4, 0.42 * hrFactor, "#ef4444", "#f87171", 3.8
      );
      drawParticleStream(
        [{ x: 385, y: 435 }, { x: 425, y: 635 }, { x: 475, y: 835 }, { x: 510, y: 855 }],
        6, 0.26, "#facc15", "#eab308", 3.8
      );
      drawParticleStream(
        [{ x: 615, y: 435 }, { x: 595, y: 635 }, { x: 545, y: 835 }, { x: 510, y: 855 }],
        6, 0.26, "#facc15", "#eab308", 3.8
      );
    }

    targetCtx.restore();
  }

  function drawHumanBodyVector(targetCtx, renderScale = 1.0, view = "anterior") {
    targetCtx.save();
    targetCtx.scale(renderScale, renderScale);

    const isFullBody = (activePlate === "full_anterior" || activePlate === "full_posterior");

    if (isFullBody) {
      // 0. 4K 3D MAIN BODY ORGANS MASTER VIEW OR 6-LAYER DISSECTION MATRIX
      const skinImg = (view === "anterior") ? imgAnterior : imgPosterior;
      const isImgReady = skinImg && skinImg.complete && skinImg.naturalWidth > 0;

      if (view === "anterior") {
        if (use3dOrgansMaster && isImgReady) {
          // Render the ultra-detailed, colorful 4K 3D Main Body Organs render at 100% crisp clarity
          drawPlateImageLayer(targetCtx, imgAnterior, 1.0, imagingMode);
          // Overlay real-time 60 FPS physiological blood/air/neural/bile/renal streams
          drawLive3dPhysiologicalStreams(targetCtx, "full_anterior");
        } else {
          const activeLayers = (activeGender === "female") ? femaleLayerImages : maleLayerImages;
          let anyLayerDrawn = false;

          // MULTI-LAYER 8K ANATOMICAL DISSECTION MATRIX (Registered Identical-Silhouette Strata)
          if (layerOpacities.skeletal > 0.01) {
            if (activeLayers.skeletal && activeLayers.skeletal.complete && activeLayers.skeletal.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.skeletal, layerOpacities.skeletal, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawSkeletalVector(targetCtx, view, layerOpacities.skeletal, imagingMode);
              anyLayerDrawn = true;
            }
          }

          if (layerOpacities.visceral > 0.01) {
            if (activeLayers.visceral && activeLayers.visceral.complete && activeLayers.visceral.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.visceral, layerOpacities.visceral, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawVisceralVector(targetCtx, view, layerOpacities.visceral);
              anyLayerDrawn = true;
            }
          }

          if (layerOpacities.circulatory > 0.01) {
            if (activeLayers.circulatory && activeLayers.circulatory.complete && activeLayers.circulatory.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.circulatory, layerOpacities.circulatory, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawVascularVector(targetCtx, view, layerOpacities.circulatory, imagingMode);
              anyLayerDrawn = true;
            }
          }

          if (layerOpacities.nervous > 0.01) {
            if (activeLayers.nervous && activeLayers.nervous.complete && activeLayers.nervous.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.nervous, layerOpacities.nervous, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawNervousVector(targetCtx, view, layerOpacities.nervous);
              anyLayerDrawn = true;
            }
          }

          if (layerOpacities.muscular > 0.01) {
            if (activeLayers.muscular && activeLayers.muscular.complete && activeLayers.muscular.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.muscular, layerOpacities.muscular, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawMuscularVector(targetCtx, view, layerOpacities.muscular);
              anyLayerDrawn = true;
            }
          }

          if (layerOpacities.skin > 0.01) {
            if (activeLayers.skin && activeLayers.skin.complete && activeLayers.skin.naturalWidth > 0) {
              drawPlateImageLayer(targetCtx, activeLayers.skin, layerOpacities.skin, imagingMode);
              anyLayerDrawn = true;
            } else {
              drawSkinVector(targetCtx, view, layerOpacities.skin, null, imagingMode);
              anyLayerDrawn = true;
            }
          }

          if (!anyLayerDrawn) {
            if (isImgReady) {
              drawPlateImageLayer(targetCtx, skinImg, 1.0, imagingMode);
            } else {
              drawSkinVector(targetCtx, view, 0.45, null, imagingMode);
              drawSkeletalVector(targetCtx, view, 0.65, imagingMode);
            }
          }

          drawLive3dPhysiologicalStreams(targetCtx, "full_anterior");
        }
      } else {
        if (isImgReady) {
          drawPlateImageLayer(targetCtx, skinImg, 1.0, imagingMode);
        } else {
          drawSkinVector(targetCtx, "posterior", layerOpacities.skin || 0.5, null, imagingMode);
          if (layerOpacities.skeletal > 0.01) {
            drawSkeletalVector(targetCtx, "posterior", layerOpacities.skeletal, imagingMode);
          }
        }
      }
    } else {
      // FOCUSED ORGAN / SYSTEM PLATE RENDERING
      const activeImg = plateImages[activePlate] || ((view === "anterior") ? imgAnterior : imgPosterior);
      const isImgReady = activeImg && activeImg.complete && activeImg.naturalWidth > 0;

      if (isImgReady) {
        let plateAlpha = 1.0;
        if (activePlate === "skeletal") plateAlpha = layerOpacities.skeletal;
        else if (activePlate === "muscular") plateAlpha = layerOpacities.muscular;
        else if (activePlate === "heart") plateAlpha = Math.max(layerOpacities.circulatory, layerOpacities.visceral);
        else if (activePlate === "brain") plateAlpha = layerOpacities.nervous;
        else if (activePlate === "lungs") plateAlpha = layerOpacities.visceral;
        else if (activePlate === "digestive" || activePlate === "urinary") plateAlpha = layerOpacities.visceral;
        else if (activePlate === "cranial") plateAlpha = Math.max(layerOpacities.nervous, layerOpacities.skeletal);
        else if (activePlate === "male_reproductive" || activePlate === "female_reproductive") plateAlpha = Math.max(layerOpacities.visceral, layerOpacities.circulatory);

        drawPlateImageLayer(targetCtx, activeImg, plateAlpha, imagingMode);
      } else {
        // Fallback procedural rendering for focused systems
        if (activePlate === "skeletal" || activePlate === "cranial") {
          drawSkeletalVector(targetCtx, view, 1.0, imagingMode);
        } else if (activePlate === "muscular") {
          drawMuscularVector(targetCtx, view, 1.0);
        } else if (activePlate === "brain") {
          drawNervousVector(targetCtx, view, 1.0);
        } else if (activePlate === "heart" || activePlate === "lungs" || activePlate === "digestive" || activePlate === "urinary") {
          drawVisceralVector(targetCtx, view, 1.0);
        } else {
          drawSkinVector(targetCtx, view, 0.5, null, imagingMode);
          drawSkeletalVector(targetCtx, view, 0.7, imagingMode);
        }
      }

      // Overlay 60 FPS Live 3D Physiological Particle Streams for the active 3D Organ Cutaway Plate
      drawLive3dPhysiologicalStreams(targetCtx, activePlate);
    }

    // 4. ACTIVE STRUCTURE 3D VOLUMETRIC ORGAN SPOTLIGHT & HUD RETICLE
    const visibleStructures = getVisibleStructures(activePlate, view);
    const structAlpha = selectedStructure ? getStructureOpacity(selectedStructure) : 0;
    const isStructureVisible = selectedStructure && visibleStructures.some(s => s.id === selectedStructure.id) && structAlpha >= 0.08;
    if (selectedStructure && isStructureVisible) {
      targetCtx.save();
      targetCtx.globalAlpha = Math.min(1.0, structAlpha);
      const sx = selectedStructure.coords.x;
      const sy = selectedStructure.coords.y;
      const sysColor = ANATOMICAL_SYSTEMS[selectedStructure.system]?.color || "#38bdf8";
      const now = performance.now();
      const pulse = 1.0 + 0.15 * Math.sin(now * 0.006);

      // Soft 3D Volumetric Organ Spotlight Halo
      const spotGrad = targetCtx.createRadialGradient(sx, sy, 4, sx, sy, 68 * pulse);
      spotGrad.addColorStop(0, `${sysColor}44`);
      spotGrad.addColorStop(0.55, `${sysColor}18`);
      spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      targetCtx.fillStyle = spotGrad;
      targetCtx.beginPath();
      targetCtx.arc(sx, sy, 68 * pulse, 0, Math.PI * 2);
      targetCtx.fill();

      // Glowing targeting halo
      targetCtx.beginPath();
      targetCtx.arc(sx, sy, 32 * pulse, 0, Math.PI * 2);
      targetCtx.strokeStyle = "rgba(56, 189, 248, 0.75)";
      targetCtx.lineWidth = 2;
      targetCtx.setLineDash([4, 4]);
      targetCtx.stroke();

      // Corner brackets (HUD Reticle)
      targetCtx.setLineDash([]);
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 2.5;
      const r = 24 * pulse;
      // Top-Left
      targetCtx.beginPath();
      targetCtx.moveTo(sx - r, sy - r + 8); targetCtx.lineTo(sx - r, sy - r); targetCtx.lineTo(sx - r + 8, sy - r);
      // Top-Right
      targetCtx.moveTo(sx + r - 8, sy - r); targetCtx.lineTo(sx + r, sy - r); targetCtx.lineTo(sx + r, sy - r + 8);
      // Bottom-Left
      targetCtx.beginPath();
      targetCtx.moveTo(sx - r, sy + r - 8); targetCtx.lineTo(sx - r, sy + r); targetCtx.lineTo(sx - r + 8, sy + r);
      // Bottom-Right
      targetCtx.moveTo(sx + r - 8, sy + r); targetCtx.lineTo(sx + r, sy + r); targetCtx.lineTo(sx + r, sy + r - 8);
      targetCtx.stroke();

      targetCtx.restore();
    }

    targetCtx.restore();
  }

  // Draw Interactive Pins & Netter-Style Encyclopedia Leader-Line Callouts
  function drawAnatomicalPins(targetCtx, renderScale = 1.0, view = "anterior", interactive = true) {
    targetCtx.save();
    targetCtx.scale(renderScale, renderScale);

    const now = performance.now();
    const pulseScale = 1.0 + 0.18 * Math.sin(now * 0.005);

    const visible = getVisibleStructures(activePlate, view).filter(s => getStructureOpacity(s) >= 0.08);

    // Precompute non-overlapping bilateral margin slots when calloutMode === "all" or 4K export (!interactive)
    const showAllLeaderCallouts = (calloutMode === "all" && activeTab !== "quiz") || !interactive;
    const leftSideList = [];
    const rightSideList = [];
    if (showAllLeaderCallouts) {
      visible.forEach(s => {
        if (s.coords.x <= 500) leftSideList.push(s);
        else rightSideList.push(s);
      });
      leftSideList.sort((a, b) => a.coords.y - b.coords.y);
      rightSideList.sort((a, b) => a.coords.y - b.coords.y);
    }

    const slotMap = new Map();
    const distributeSlots = (list, isLeft) => {
      if (!list.length) return;
      const minY = Math.max(60, list[0].coords.y - 40);
      const maxY = Math.min(1730, list[list.length - 1].coords.y + 40);
      const minGap = 40;
      let prevY = minY - minGap;
      list.forEach((s, idx) => {
        const idealY = Math.max(minY, Math.min(maxY, s.coords.y));
        const slotY = Math.max(idealY, prevY + minGap);
        prevY = slotY;
        slotMap.set(s.id, {
          isLeft,
          anchorX: isLeft ? 125 : 875,
          anchorY: Math.min(1745, slotY),
          elbowX: isLeft ? Math.min(s.coords.x - 18, 220) : Math.max(s.coords.x + 18, 780)
        });
      });
    };

    if (showAllLeaderCallouts) {
      distributeSlots(leftSideList, true);
      distributeSlots(rightSideList, false);
    }

    visible.forEach(s => {
      const structAlpha = getStructureOpacity(s);
      const isSelected = selectedStructure && selectedStructure.id === s.id;
      const isHovered = hoveredStructure && hoveredStructure.id === s.id;
      const isQuizHintTarget = activeTab === "quiz" && quizState.hintActive && quizState.targetStructure && quizState.targetStructure.id === s.id;
      const sys = ANATOMICAL_SYSTEMS[s.system] || { color: "#38bdf8" };
      const meta = getEncyclopediaMeta(s);

      const px = s.coords.x;
      const py = s.coords.y;

      targetCtx.save();
      targetCtx.globalAlpha = Math.min(1.0, structAlpha);

      // Quiz Clinical Clue Radar Beacon
      if (isQuizHintTarget) {
        const hintRadius = 28 + 12 * Math.sin(now * 0.008);
        targetCtx.beginPath();
        targetCtx.arc(px, py, hintRadius, 0, Math.PI * 2);
        targetCtx.strokeStyle = "rgba(250, 204, 21, 0.85)";
        targetCtx.lineWidth = 2.5;
        targetCtx.setLineDash([5, 4]);
        targetCtx.stroke();
        targetCtx.setLineDash([]);
      }

      // Pulsing outer beacon ring
      targetCtx.beginPath();
      targetCtx.arc(px, py, (isSelected ? 16 : (isHovered ? 12 : 7.5)) * pulseScale, 0, Math.PI * 2);
      targetCtx.fillStyle = isSelected
        ? "rgba(56, 189, 248, 0.42)"
        : (isHovered ? "rgba(16, 185, 129, 0.42)" : sys.color + "33");
      targetCtx.fill();

      // Solid pin center
      targetCtx.beginPath();
      targetCtx.arc(px, py, isSelected ? 7.5 : (isHovered ? 6 : 4.2), 0, Math.PI * 2);
      targetCtx.fillStyle = isSelected ? "#38bdf8" : (isHovered ? "#10b981" : sys.color);
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 1.5;
      targetCtx.fill();
      targetCtx.stroke();

      // Determine label display mode
      if (showAllLeaderCallouts && slotMap.has(s.id)) {
        const slot = slotMap.get(s.id);
        // Draw precision leader line from pin -> elbow -> margin anchor
        targetCtx.beginPath();
        targetCtx.moveTo(px, py);
        targetCtx.lineTo(slot.elbowX, slot.anchorY);
        targetCtx.lineTo(slot.anchorX, slot.anchorY);
        targetCtx.strokeStyle = isSelected ? "#38bdf8" : (isHovered ? "#10b981" : sys.color + "aa");
        targetCtx.lineWidth = isSelected || isHovered ? 2.0 : 1.15;
        targetCtx.stroke();

        // Small terminal dot at margin
        targetCtx.beginPath();
        targetCtx.arc(slot.anchorX, slot.anchorY, 2.5, 0, Math.PI * 2);
        targetCtx.fillStyle = isSelected ? "#38bdf8" : sys.color;
        targetCtx.fill();

        // Callout pill box
        targetCtx.font = "bold 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
        const titleStr = s.name;
        const w1 = targetCtx.measureText(titleStr).width;
        targetCtx.font = "italic 9.5px Georgia, serif";
        const subStr = `${s.latinName} [${meta.ta2Code}]`;
        const w2 = targetCtx.measureText(subStr).width;
        const boxW = Math.max(w1, w2) + 16;
        const boxH = 29;
        const boxX = slot.isLeft ? (slot.anchorX - boxW - 6) : (slot.anchorX + 6);
        const boxY = slot.anchorY - boxH / 2;

        targetCtx.fillStyle = isSelected ? "rgba(15, 23, 42, 0.96)" : "rgba(9, 13, 22, 0.88)";
        targetCtx.strokeStyle = isSelected ? "#38bdf8" : (isHovered ? "#10b981" : sys.color + "66");
        targetCtx.lineWidth = isSelected ? 1.6 : 1.0;
        targetCtx.beginPath();
        targetCtx.roundRect(boxX, boxY, boxW, boxH, 5);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.textAlign = slot.isLeft ? "right" : "left";
        const textAnchorX = slot.isLeft ? (boxX + boxW - 8) : (boxX + 8);
        targetCtx.font = "bold 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
        targetCtx.fillStyle = isSelected ? "#38bdf8" : "#f8fafc";
        targetCtx.fillText(titleStr, textAnchorX, boxY + 12.5);

        targetCtx.font = "italic 9.5px Georgia, serif";
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.fillText(subStr, textAnchorX, boxY + 24);
        targetCtx.textAlign = "left";
      } else if (
        activeTab !== "quiz" &&
        (isSelected || isHovered || (calloutMode === "smart" && zoom >= 2.6))
      ) {
        // Floating smart callout card with English + Latin + TA2
        targetCtx.font = "bold 12.5px -apple-system, sans-serif";
        const label = s.name;
        const w1 = targetCtx.measureText(label).width;
        targetCtx.font = "italic 10.5px Georgia, serif";
        const latinSub = `${s.latinName} • ${meta.ta2Code}`;
        const w2 = targetCtx.measureText(latinSub).width;
        const boxW = Math.max(w1, w2) + 20;
        const boxH = 34;

        targetCtx.fillStyle = "rgba(9, 13, 22, 0.94)";
        targetCtx.strokeStyle = isSelected ? "#38bdf8" : (isHovered ? "#10b981" : "rgba(255,255,255,0.25)");
        targetCtx.lineWidth = 1.3;
        targetCtx.beginPath();
        targetCtx.roundRect(px + 13, py - 18, boxW, boxH, 7);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.font = "bold 12.5px -apple-system, sans-serif";
        targetCtx.fillStyle = isSelected ? "#38bdf8" : "#ffffff";
        targetCtx.fillText(label, px + 22, py - 3);

        targetCtx.font = "italic 10.5px Georgia, serif";
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.fillText(latinSub, px + 22, py + 11);
      }

      targetCtx.restore();
    });

    targetCtx.restore();
  }

  // ----------------------------------------------------
  // HISTOLOGY SIMULATOR RENDERERS (6 Models)
  // ----------------------------------------------------
  function renderHistologyCanvas(targetCtx, width, height, dt) {
    targetCtx.save();
    targetCtx.clearRect(0, 0, width, height);

    // Dark sleek stage background
    targetCtx.fillStyle = "#090d16";
    targetCtx.fillRect(0, 0, width, height);

    if (activeHistologyModel === "cardiac_cycle") {
      renderCardiacCycleSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "nephron_countercurrent") {
      renderNephronSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "neuron_synapse") {
      renderNeuronSynapseSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "alveolar_gas_exchange") {
      renderAlveolarGasSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "sarcomere_sliding") {
      renderSarcomereSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "osteon_haversian") {
      renderOsteonSimulation(targetCtx, width, height, dt);
    }

    targetCtx.restore();
  }

  // 1. CARDIAC CYCLE & ECG CONDUCTION RENDERER (PHOTOREALISTIC REAL HEART ANIMATION)
  function renderCardiacCycleSimulation(targetCtx, width, height, dt) {
    const cycleDuration = 60 / histoState.heartRate; // seconds per cardiac beat
    simTime += dt;
    const beatPhase = (simTime % cycleDuration) / cycleDuration; // 0.0 to 1.0
    const beatIndex = Math.floor(simTime / cycleDuration);

    // Dynamic S1/S2 acoustic triggers (S1: AV closure at 0.15, S2: Semilunar closure at 0.48)
    if (beatPhase >= 0.15 && histoState.s1PlayedForBeat !== beatIndex) {
      histoState.s1PlayedForBeat = beatIndex;
      playHeartSound(true); // S1 "Lub"
    }
    if (beatPhase >= 0.48 && histoState.s2PlayedForBeat !== beatIndex) {
      histoState.s2PlayedForBeat = beatIndex;
      playHeartSound(false); // S2 "Dub"
    }

    // Cardiac Cycle Mechanical Phases (Wiggers Physiological Stages)
    const isAtrialSystole = beatPhase < 0.15;
    const isIsovolumetricContraction = beatPhase >= 0.15 && beatPhase < 0.22;
    const isVentricularEjection = beatPhase >= 0.22 && beatPhase < 0.48;
    const isIsovolumetricRelaxation = beatPhase >= 0.48 && beatPhase < 0.55;
    const isDiastolicFilling = beatPhase >= 0.55;

    const isSystole = beatPhase >= 0.15 && beatPhase < 0.48;
    const isAvOpen = isAtrialSystole || isDiastolicFilling;
    const isSlOpen = isVentricularEjection;

    // Real-time Hemodynamics
    let lvPressure = 10;
    let rvPressure = 4;
    let aortaPressure = 80;
    let phaseName = "Diastolic Inflow";
    let phaseDesc = "Rapid Passive Ventricular Inflow • TP Segment";
    let phaseColor = "#38bdf8";

    if (isAtrialSystole) {
      lvPressure = Math.round(8 + 4 * Math.sin((beatPhase / 0.15) * Math.PI));
      rvPressure = Math.round(3 + 3 * Math.sin((beatPhase / 0.15) * Math.PI));
      aortaPressure = Math.round(82 - (beatPhase / 0.15) * 2);
      phaseName = "Atrial Systole";
      phaseDesc = "Atrial Contraction • P-Wave • Active Presystolic Kick";
      phaseColor = "#f59e0b";
    } else if (isIsovolumetricContraction) {
      const t = (beatPhase - 0.15) / 0.07;
      lvPressure = Math.round(12 + t * 68); // 12 -> 80 mmHg
      rvPressure = Math.round(6 + t * 10);  // 6 -> 16 mmHg
      aortaPressure = 80;
      phaseName = "Isovolumetric Contraction";
      phaseDesc = "Tricuspid & Mitral Snap Shut • S1 Heart Sound (Lub) • QRS";
      phaseColor = "#eab308";
    } else if (isVentricularEjection) {
      const t = (beatPhase - 0.22) / 0.26;
      const peakSin = Math.sin(t * Math.PI);
      lvPressure = Math.round(80 + peakSin * 40); // 80 -> 120 -> 80 mmHg
      rvPressure = Math.round(16 + peakSin * 9);  // 16 -> 25 -> 16 mmHg
      aortaPressure = lvPressure;
      phaseName = "Ventricular Ejection";
      phaseDesc = "Aortic & Pulmonary Ejection • Peak Systole (120 mmHg)";
      phaseColor = "#10b981";
    } else if (isIsovolumetricRelaxation) {
      const t = (beatPhase - 0.48) / 0.07;
      lvPressure = Math.round(80 - t * 70); // 80 -> 10 mmHg
      rvPressure = Math.round(16 - t * 12); // 16 -> 4 mmHg
      aortaPressure = Math.round(100 - t * 15);
      phaseName = "Isovolumetric Relaxation";
      phaseDesc = "Semilunar Valves Snap Shut • S2 Heart Sound (Dub) • T-Wave";
      phaseColor = "#a855f7";
    } else {
      const t = (beatPhase - 0.55) / 0.45;
      lvPressure = Math.round(10 + Math.sin(t * Math.PI) * 2);
      rvPressure = 4;
      aortaPressure = Math.round(85 - t * 5);
      phaseName = "Diastolic Filling";
      phaseDesc = "AV Inflow • 75% End-Diastolic Volume Filled • Diastole";
      phaseColor = "#38bdf8";
    }

    // CONTINUOUS NONLINEAR BIOMECHANICAL MYOCARDIAL STRAIN & APICAL TORSION
    // 1. Atrial presystolic kick strain (0.00 - 0.15)
    const atrialStrain = isAtrialSystole ? Math.sin((beatPhase / 0.15) * Math.PI) : 0;

    // 2. Ventricular systole contraction curve (0.15 - 0.48)
    let ventStrain = 0;
    let apicalTwist = 0;
    let avDescent = 0;

    if (isIsovolumetricContraction) {
      const t = (beatPhase - 0.15) / 0.07;
      ventStrain = 0.035 * t; // Isometric stiffening & wall rounding
      apicalTwist = 0.010 * t;
      avDescent = 0.008 * t;
    } else if (isVentricularEjection) {
      const t = (beatPhase - 0.22) / 0.26;
      // Asymmetric ejection curve: rapid acceleration in early systole
      const ejectionCurve = Math.sin(t * Math.PI);
      ventStrain = 0.035 + 0.115 * ejectionCurve; // Up to 15% radial wall contraction!
      apicalTwist = 0.010 + 0.042 * ejectionCurve; // Wringing counter-clockwise apical twist!
      avDescent = 0.008 + 0.048 * ejectionCurve;  // Base/AV ring pulled downward toward apex!
    } else if (isIsovolumetricRelaxation) {
      const t = (beatPhase - 0.48) / 0.07;
      // Rapid elastic untwisting recoil (diastolic suction)
      ventStrain = 0.035 * (1.0 - t);
      apicalTwist = 0.010 * (1.0 - t);
      avDescent = 0.008 * (1.0 - t);
    } else {
      // Diastolic passive filling: subtle elastic compliance
      const t = (beatPhase - 0.55) / 0.45;
      ventStrain = -0.025 * Math.sin(t * Math.PI);
    }

    // Geometry layout
    const heartCenterX = width * 0.28;
    const heartCenterY = height * 0.49;
    const maxHeartH = height * 0.76;
    const heartW = Math.min(width * 0.42, 380, maxHeartH * (896 / 1200));
    const heartH = heartW * (1200 / 896);

    // Anatomical continuous coordinate deformation mapping (Rigid Great Vessels, C^2 Smoothness, ZERO Upper Split)
    const TOP_RIGID_V = 0.28; // Upper 28% (Aortic arch, SVC, pulmonary trunk bifurcation) is 100% rigid & anchored

    const getDeformation = (v) => {
      // v ranges from 0.0 (top great vessels) to 1.0 (ventricular apex)
      if (v <= TOP_RIGID_V) {
        return { scaleX: 1.0, shiftX: 0.0, shiftY: 0.0 };
      }

      // Smooth C^2 transition from static great vessels (v=0.28) to contracting base & ventricles (v>=0.40)
      const u = Math.min(1.0, (v - TOP_RIGID_V) / 0.12);
      const w = u * u * u * (u * (u * 6 - 15) + 10); // Quintic smootherstep (0 at u=0, 1 at u=1, zero 1st & 2nd derivatives)

      // Longitudinal AV base descent (piston motion toward the fixed apex):
      // Peaks at AV ring (v ≈ 0.40) with 14-18px excursion, smoothly tapering to 0 at the apex (v = 1.0)
      const ventWeight = Math.max(0.0, 1.0 - (v - 0.40) / 0.60);
      const shiftY = (avDescent * 0.35 + atrialStrain * 0.015) * heartH * w * ventWeight;

      // Radial inward contraction:
      // Atrial presystolic kick: gentle compliance in upper atrium (v ≈ 0.34) smoothly blended via w
      const atrialPulse = Math.sin(Math.PI * Math.min(1.0, (v - TOP_RIGID_V) / 0.14));
      const scaleAtrial = 1.0 - atrialStrain * 0.03 * atrialPulse * w;

      // Ventricular systole: powerful inward squeeze of free walls (v ≈ 0.70)
      const ventPulse = Math.sin(Math.PI * Math.max(0.0, (v - 0.38) / 0.62));
      const scaleVent = 1.0 - ventStrain * 0.09 * ventPulse * w;

      const blendVent = Math.max(0.0, Math.min(1.0, (v - 0.34) / 0.10));
      const scaleX = (1.0 - blendVent) * scaleAtrial + blendVent * scaleVent;

      // Apical wringing torsion: Helical twisting begins below the AV groove (v > 0.40)
      const twistU = Math.max(0.0, (v - 0.40) / 0.60);
      const shiftX = -apicalTwist * heartW * (twistU * twistU);

      return { scaleX, shiftX, shiftY };
    };

    const mapPoint = (nx, ny) => {
      const v = Math.max(0, Math.min(1.0, (ny + 1.0) / 2.0));
      const d = getDeformation(v);
      return {
        x: nx * (heartW / 2) * d.scaleX + d.shiftX,
        y: ny * (heartH / 2) + d.shiftY
      };
    };

    const mapX = (nx, ny = 0) => mapPoint(nx, ny).x;
    const mapY = (ny, nx = 0) => mapPoint(nx, ny).y;

    targetCtx.save();
    targetCtx.translate(heartCenterX, heartCenterY);

    // 1. BIOMECHANICAL CONTINUOUS-MESH MYOCARDIAL CONTRACTION & APICAL WRINGING
    const isHeartImgReady = imgHeartCoronal && imgHeartCoronal.complete && imgHeartCoronal.naturalWidth > 0;
    if (isHeartImgReady) {
      targetCtx.save();
      // Soft organic myocardial pulsatile halo
      targetCtx.shadowColor = isSystole ? "rgba(239, 68, 68, 0.35)" : "rgba(225, 29, 72, 0.18)";
      targetCtx.shadowBlur = isSystole ? 24 : 12;

      const srcW = imgHeartCoronal.naturalWidth;
      const srcH = imgHeartCoronal.naturalHeight;

      // UNIFIED CONTINUOUS-MESH SLICING (v = 0.0 to 1.0)
      // Spans entire organ from upper great vessels to apex in one unified C^2 mesh: ZERO split, ZERO seams
      const NUM_MYO_SLICES = 48;
      const srcSliceH = srcH / NUM_MYO_SLICES;

      const myoNodes = [];
      for (let k = 0; k <= NUM_MYO_SLICES; k++) {
        const v = k / NUM_MYO_SLICES;
        const d = getDeformation(v);
        const y = -heartH / 2 + v * heartH + d.shiftY;
        myoNodes.push({ y, scaleX: d.scaleX, shiftX: d.shiftX });
      }

      for (let s = 0; s < NUM_MYO_SLICES; s++) {
        const topNode = myoNodes[s];
        const botNode = myoNodes[s + 1];

        const sy = s * srcSliceH;
        const dy = topNode.y;
        // Mathematical sub-pixel overlap guarantees seamless boundary without artifacts
        const dh = (botNode.y - topNode.y) + 0.85;

        const midScaleX = (topNode.scaleX + botNode.scaleX) * 0.5;
        const midShiftX = (topNode.shiftX + botNode.shiftX) * 0.5;

        const curW = heartW * midScaleX;
        const dx = -curW / 2 + midShiftX;

        targetCtx.drawImage(
          imgHeartCoronal,
          0, sy, srcW, srcSliceH,
          dx, dy, curW, dh
        );
      }
      targetCtx.restore();
    } else {
      // Vector fallback with identical continuous strain
      targetCtx.save();
      targetCtx.fillStyle = "#1e1b2e";
      targetCtx.strokeStyle = "#be123c";
      targetCtx.lineWidth = 12;
      targetCtx.beginPath();
      targetCtx.moveTo(mapX(0, 0.46), mapY(0.46, 0));
      targetCtx.bezierCurveTo(mapX(-0.52, 0.28), mapY(0.28, -0.52), mapX(-0.55, -0.25), mapY(-0.25, -0.55), mapX(-0.15, -0.38), mapY(-0.38, -0.15));
      targetCtx.bezierCurveTo(mapX(-0.05, -0.48), mapY(-0.48, -0.05), mapX(0.20, -0.48), mapY(-0.48, 0.20), mapX(0.35, -0.32), mapY(-0.32, 0.35));
      targetCtx.bezierCurveTo(mapX(0.55, -0.18), mapY(-0.18, 0.55), mapX(0.52, 0.28), mapY(0.28, 0.52), mapX(0, 0.46), mapY(0.46, 0));
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
      targetCtx.restore();
    }

    // 2. DYNAMIC MEMBRANOUS HEART VALVES (FLUTTERING INFLOW & BILLOWING COAPTATION)
    // A. Tricuspid Valve (RA -> RV, between -0.43 and -0.27, ny = -0.06)
    targetCtx.save();
    const triL = mapPoint(-0.43, -0.06);
    const triR = mapPoint(-0.27, -0.06);
    const triMid = mapPoint(-0.35, -0.06);
    const triPapAnt = mapPoint(-0.38, 0.16);
    const triPapSep = mapPoint(-0.28, 0.16);

    if (isAvOpen) {
      // Flowing downward with diastolic stream flutter
      const flutter = Math.sin(simTime * 24) * 0.015 * heartH;
      const cuspTipL = mapPoint(-0.38, 0.04);
      const cuspTipR = mapPoint(-0.32, 0.04);

      // Anterior cusp
      targetCtx.fillStyle = "rgba(255, 245, 245, 0.45)";
      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      targetCtx.lineWidth = 1.8;
      targetCtx.beginPath();
      targetCtx.moveTo(triL.x, triL.y);
      targetCtx.quadraticCurveTo(triL.x, triMid.y + 6, cuspTipL.x, cuspTipL.y + flutter);
      targetCtx.stroke();

      // Septal cusp
      targetCtx.beginPath();
      targetCtx.moveTo(triR.x, triR.y);
      targetCtx.quadraticCurveTo(triR.x, triMid.y + 6, cuspTipR.x, cuspTipR.y - flutter);
      targetCtx.stroke();
    } else {
      // Firm upward billowing coaptation against RV systolic pressure
      const coaptY = triMid.y - 4;
      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      targetCtx.shadowColor = "#38bdf8";
      targetCtx.shadowBlur = 6;
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(triL.x, triL.y);
      targetCtx.quadraticCurveTo(triMid.x - 4, coaptY, triMid.x, coaptY);
      targetCtx.quadraticCurveTo(triMid.x + 4, coaptY, triR.x, triR.y);
      targetCtx.stroke();
      targetCtx.shadowBlur = 0;

      // Fine, glistening taut Chordae Tendineae to Papillary Muscles
      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      targetCtx.lineWidth = 1.0;
      targetCtx.beginPath();
      targetCtx.moveTo(triMid.x - 3, coaptY + 1); targetCtx.lineTo(triPapAnt.x, triPapAnt.y);
      targetCtx.moveTo(triMid.x + 3, coaptY + 1); targetCtx.lineTo(triPapSep.x, triPapSep.y);
      targetCtx.stroke();
    }
    targetCtx.restore();

    // B. Mitral (Bicuspid) Valve (LA -> LV, between +0.24 and +0.40, ny = -0.06)
    targetCtx.save();
    const mitL = mapPoint(0.24, -0.06);
    const mitR = mapPoint(0.40, -0.06);
    const mitMid = mapPoint(0.32, -0.06);
    const mitPapPost = mapPoint(0.25, 0.18);
    const mitPapAnt = mapPoint(0.37, 0.18);

    if (isAvOpen) {
      const flutter = Math.sin(simTime * 26 + 1.2) * 0.016 * heartH;
      const cuspTipAnt = mapPoint(0.29, 0.045);
      const cuspTipPost = mapPoint(0.35, 0.045);

      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.88)";
      targetCtx.lineWidth = 1.8;
      targetCtx.beginPath();
      targetCtx.moveTo(mitL.x, mitL.y);
      targetCtx.quadraticCurveTo(mitL.x + 4, mitMid.y + 6, cuspTipAnt.x, cuspTipAnt.y + flutter);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(mitR.x, mitR.y);
      targetCtx.quadraticCurveTo(mitR.x - 4, mitMid.y + 6, cuspTipPost.x, cuspTipPost.y - flutter);
      targetCtx.stroke();
    } else {
      // Snapped firmly shut against 120 mmHg peak LV systolic pressure
      const coaptY = mitMid.y - 5;
      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      targetCtx.shadowColor = "#ef4444";
      targetCtx.shadowBlur = 7;
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.moveTo(mitL.x, mitL.y);
      targetCtx.quadraticCurveTo(mitMid.x - 3, coaptY, mitMid.x, coaptY);
      targetCtx.quadraticCurveTo(mitMid.x + 3, coaptY, mitR.x, mitR.y);
      targetCtx.stroke();
      targetCtx.shadowBlur = 0;

      // Heavy taut Chordae Tendineae to prominent LV Papillary Muscles
      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.50)";
      targetCtx.lineWidth = 1.1;
      targetCtx.beginPath();
      targetCtx.moveTo(mitMid.x - 4, coaptY + 1); targetCtx.lineTo(mitPapPost.x, mitPapPost.y);
      targetCtx.moveTo(mitMid.x + 4, coaptY + 1); targetCtx.lineTo(mitPapAnt.x, mitPapAnt.y);
      targetCtx.stroke();
    }
    targetCtx.restore();

    // C. Semilunar Valves (Pulmonary & Aortic Outflow Tracts)
    // The authentic 8K coronal illustration already captures the aortic and pulmonary valve cusps in exquisite anatomical relief.
    // Valve opening kinetics are manifested through high-velocity transvalvular ejection jets, avoiding any artificial lines cutting across vessel lumens.
    if (isSlOpen) {
      targetCtx.save();
      const pulCenter = mapPoint(-0.16, -0.32);
      const aorCenter = mapPoint(0.07, -0.30);
      const r = heartW * 0.035;

      // Soft forward transvalvular outflow jet illumination (RVOT -> Pulmonary Trunk)
      const pulJet = targetCtx.createRadialGradient(pulCenter.x, pulCenter.y, 2, pulCenter.x, pulCenter.y, r * 1.6);
      pulJet.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      pulJet.addColorStop(0.7, "rgba(56, 189, 248, 0.15)");
      pulJet.addColorStop(1, "rgba(56, 189, 248, 0)");
      targetCtx.fillStyle = pulJet;
      targetCtx.beginPath();
      targetCtx.arc(pulCenter.x, pulCenter.y, r * 1.6, 0, Math.PI * 2);
      targetCtx.fill();

      // Soft forward transvalvular outflow jet illumination (LVOT -> Ascending Aorta)
      const aorJet = targetCtx.createRadialGradient(aorCenter.x, aorCenter.y, 2, aorCenter.x, aorCenter.y, r * 1.6);
      aorJet.addColorStop(0, "rgba(248, 113, 113, 0.45)");
      aorJet.addColorStop(0.7, "rgba(248, 113, 113, 0.15)");
      aorJet.addColorStop(1, "rgba(248, 113, 113, 0)");
      targetCtx.fillStyle = aorJet;
      targetCtx.beginPath();
      targetCtx.arc(aorCenter.x, aorCenter.y, r * 1.6, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    }

    // 3. FLUID HEMODYNAMICS: PULSATILE ERYTHROCYTE STREAMS & INTRAVENTRICULAR VORTEX
    const evalSpline = (pts, t) => {
      const p = Math.max(0, Math.min(0.999, t)) * (pts.length - 1);
      const idx = Math.floor(p);
      const frac = p - idx;
      const p0 = pts[idx];
      const p1 = pts[idx + 1];
      const p2 = pts[Math.min(pts.length - 1, idx + 2)];
      const pPre = pts[Math.max(0, idx - 1)];

      // Catmull-Rom smooth cubic anatomical spline
      const t2 = frac * frac;
      const t3 = t2 * frac;
      const x = 0.5 * ((2 * p0.x) + (-pPre.x + p1.x) * frac + (2 * pPre.x - 5 * p0.x + 4 * p1.x - p2.x) * t2 + (-pPre.x + 3 * p0.x - 3 * p1.x + p2.x) * t3);
      const y = 0.5 * ((2 * p0.y) + (-pPre.y + p1.y) * frac + (2 * pPre.y - 5 * p0.y + 4 * p1.y - p2.y) * t2 + (-pPre.y + 3 * p0.y - 3 * p1.y + p2.y) * t3);

      return { x, y };
    };

    // Realistic anatomical centerline waypoints
    const deoxWaypoints = [
      mapPoint(-0.44, -0.72), // Superior Vena Cava
      mapPoint(-0.38, -0.42), // Upper Right Atrium
      mapPoint(-0.36, -0.20), // Mid Right Atrium
      mapPoint(-0.35, -0.06), // Tricuspid Valve Orifice
      mapPoint(-0.33, 0.16),  // RV Inflow
      mapPoint(-0.24, 0.26),  // RV Apical Loop
      mapPoint(-0.18, -0.08), // RV Outflow Tract (Infundibulum)
      mapPoint(-0.16, -0.34), // Pulmonary Valve
      mapPoint(-0.16, -0.52), // Pulmonary Trunk
      mapPoint(-0.30, -0.72)  // Left Pulmonary Artery
    ];

    const oxWaypoints = [
      mapPoint(0.54, -0.32),  // Pulmonary Veins
      mapPoint(0.38, -0.24),  // Left Atrium Cavity
      mapPoint(0.32, -0.06),  // Mitral Valve Orifice
      mapPoint(0.30, 0.16),   // LV Lateral Wall
      mapPoint(0.20, 0.32),   // LV Apex (Intraventricular Vortex)
      mapPoint(0.10, 0.18),   // Septal Return Stream
      mapPoint(0.10, -0.04),  // LV Outflow Tract (LVOT)
      mapPoint(0.07, -0.32),  // Aortic Valve
      mapPoint(0.06, -0.54),  // Ascending Aorta
      mapPoint(0.02, -0.78)   // Aortic Arch & Brachiocephalic
    ];

    // Initialize 72 volumetric stream particles
    if (!histoState.bloodParticles || histoState.bloodParticles.length < 64) {
      histoState.bloodParticles = [];
      for (let i = 0; i < 36; i++) {
        histoState.bloodParticles.push({
          type: "deox",
          t: (i / 36) + Math.random() * 0.02,
          baseSpeed: 0.14 + (Math.random() - 0.5) * 0.04,
          lateralSpread: (Math.random() - 0.5) * 1.6,
          size: 2.8 + Math.random() * 1.8
        });
      }
      for (let i = 0; i < 36; i++) {
        histoState.bloodParticles.push({
          type: "ox",
          t: (i / 36) + Math.random() * 0.02,
          baseSpeed: 0.14 + (Math.random() - 0.5) * 0.04,
          lateralSpread: (Math.random() - 0.5) * 1.6,
          size: 2.8 + Math.random() * 1.8
        });
      }
    }

    targetCtx.save();
    histoState.bloodParticles.forEach(p => {
      const isDeox = p.type === "deox";
      const pts = isDeox ? deoxWaypoints : oxWaypoints;

      // Phase-dependent pulsatile fluid speed
      let speedMult = 1.0;
      if (isVentricularEjection) {
        // High-velocity ejection jet in outflow tracts (t > 0.6)
        if (p.t > 0.58) speedMult = 4.2;
        else speedMult = 0.5;
      } else if (isAtrialSystole) {
        // Inflow jet across AV valves (t in 0.2..0.45)
        if (p.t > 0.18 && p.t < 0.48) speedMult = 2.4;
      } else if (isDiastolicFilling) {
        // Rapid early filling (E-wave)
        if (p.t > 0.18 && p.t < 0.52) speedMult = 2.0;
      } else if (isIsovolumetricContraction) {
        // Valves closed: quiescent swirling
        speedMult = 0.25;
      }

      p.t += dt * p.baseSpeed * speedMult;
      if (p.t >= 1.0) p.t -= 1.0;

      // Position and tangent orientation
      const tCur = Math.max(0, Math.min(0.99, p.t));
      const tNext = Math.min(0.999, tCur + 0.015);
      const pos0 = evalSpline(pts, tCur);
      const pos1 = evalSpline(pts, tNext);

      const dx = pos1.x - pos0.x;
      const dy = pos1.y - pos0.y;
      const angle = Math.atan2(dy, dx);
      const mag = Math.hypot(dx, dy) || 1;
      const nx = -dy / mag;
      const ny = dx / mag;

      // Volumetric lumen channel width
      const channelWidth = (p.t > 0.68) ? 9 : 18;
      const px = pos0.x + nx * (p.lateralSpread * channelWidth);
      const py = pos0.y + ny * (p.lateralSpread * channelWidth);

      // Velocity-stretched droplet streamline length
      const streakLen = p.size * (1.0 + Math.min(speedMult, 4.0) * 2.4);

      targetCtx.save();
      targetCtx.translate(px, py);
      targetCtx.rotate(angle);

      // Streamline Comet Tail
      const tailGrad = targetCtx.createLinearGradient(-streakLen, 0, p.size, 0);
      if (isDeox) {
        tailGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
        tailGrad.addColorStop(0.6, "rgba(56, 189, 248, 0.4)");
        tailGrad.addColorStop(1, "#38bdf8");
        targetCtx.fillStyle = tailGrad;
        targetCtx.shadowColor = "#0284c7";
        targetCtx.shadowBlur = 5;
      } else {
        tailGrad.addColorStop(0, "rgba(239, 68, 68, 0)");
        tailGrad.addColorStop(0.6, "rgba(248, 113, 113, 0.5)");
        tailGrad.addColorStop(1, "#ef4444");
        targetCtx.fillStyle = tailGrad;
        targetCtx.shadowColor = "#dc2626";
        targetCtx.shadowBlur = 6;
      }

      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, streakLen / 2, p.size * 0.8, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // White-hot luminous core on high-speed ejection particles
      if (speedMult > 2.5) {
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        targetCtx.arc(streakLen * 0.25, 0, p.size * 0.45, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.restore();
    });
    targetCtx.restore();

    // 4. ANATOMICAL BIOELECTRICAL CONDUCTION SYSTEM (ACTION POTENTIAL WAVEFRONT)
    targetCtx.save();
    const saPt = mapPoint(-0.45, -0.42);
    const avPt = mapPoint(-0.06, -0.10);
    const hisEnd = mapPoint(-0.02, 0.06);
    const apexPt = mapPoint(0.02, 0.38);

    // A. Sinoatrial (SA) Node - Pacemaker
    const saActive = beatPhase < 0.10;
    targetCtx.fillStyle = saActive ? "#ffffff" : "#f59e0b";
    targetCtx.shadowColor = "#f59e0b";
    targetCtx.shadowBlur = saActive ? 20 : 6;
    targetCtx.beginPath();
    targetCtx.arc(saPt.x, saPt.y, saActive ? 6.0 : 4.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Luminous SA depolarization aura contained strictly within the Right Atrial tissue (P-wave)
    if (saActive) {
      const p = beatPhase / 0.10;
      const glowR = 24 * (1.0 + p * 0.4);
      const saGlow = targetCtx.createRadialGradient(saPt.x, saPt.y, 2, saPt.x, saPt.y, glowR);
      saGlow.addColorStop(0, "rgba(254, 240, 138, 0.60)");
      saGlow.addColorStop(0.5, "rgba(234, 179, 8, 0.20)");
      saGlow.addColorStop(1, "rgba(234, 179, 8, 0)");
      targetCtx.fillStyle = saGlow;
      targetCtx.beginPath();
      targetCtx.arc(saPt.x, saPt.y, glowR, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // B. Internodal Pathways (Subtle neural filaments strictly within RA endocardium down to AV node)
    targetCtx.strokeStyle = "rgba(245, 158, 11, 0.30)";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(saPt.x, saPt.y);
    const midAtrial = mapPoint(-0.35, -0.26);
    targetCtx.bezierCurveTo(midAtrial.x, midAtrial.y, avPt.x - 4, avPt.y - 10, avPt.x, avPt.y);
    // Delicate subendocardial pathway across low interatrial crest to Left Atrium
    const laBranch = mapPoint(0.24, -0.20);
    targetCtx.moveTo(avPt.x, avPt.y - 4);
    targetCtx.quadraticCurveTo(mapX(0.06, -0.16), mapY(-0.16, 0.06), laBranch.x, laBranch.y);
    targetCtx.stroke();

    // Travelling excitation packet along internodal tracts (0.00 - 0.12)
    if (beatPhase < 0.12) {
      const tTrac = beatPhase / 0.12;
      const sparkX = saPt.x + (avPt.x - saPt.x) * tTrac;
      const sparkY = saPt.y + (avPt.y - saPt.y) * tTrac;
      targetCtx.fillStyle = "#ffffff";
      targetCtx.shadowColor = "#fde047";
      targetCtx.shadowBlur = 12;
      targetCtx.beginPath();
      targetCtx.arc(sparkX, sparkY, 3.2, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // C. Atrioventricular (AV) Node (Delays impulse by ~100ms)
    const avDelay = beatPhase >= 0.08 && beatPhase < 0.18;
    targetCtx.fillStyle = avDelay ? "#ffffff" : "#eab308";
    targetCtx.shadowColor = "#eab308";
    targetCtx.shadowBlur = avDelay ? 18 : 5;
    targetCtx.beginPath();
    targetCtx.arc(avPt.x, avPt.y, avDelay ? 6 : 4, 0, Math.PI * 2);
    targetCtx.fill();

    // D. His-Purkinje Fast Conduction Network (QRS Flash, 0.18 - 0.28)
    const isQrsFlash = beatPhase >= 0.18 && beatPhase < 0.28;
    targetCtx.strokeStyle = isQrsFlash ? "rgba(255, 255, 255, 0.95)" : "rgba(234, 179, 8, 0.28)";
    targetCtx.shadowColor = isQrsFlash ? "#38bdf8" : "#eab308";
    targetCtx.shadowBlur = isQrsFlash ? 14 : 0;
    targetCtx.lineWidth = isQrsFlash ? 2.5 : 1.4;

    const rbbMid = mapPoint(-0.16, 0.22);
    const rbbApex = mapPoint(-0.20, 0.30);
    const lbbMid = mapPoint(0.12, 0.22);
    const lbbApex = apexPt;
    const lbbFreeWall = mapPoint(0.34, 0.10);

    targetCtx.beginPath();
    // Bundle of His
    targetCtx.moveTo(avPt.x, avPt.y);
    targetCtx.lineTo(hisEnd.x, hisEnd.y);

    // Right Bundle Branch & Moderator Band arborization
    targetCtx.lineTo(rbbMid.x, rbbMid.y);
    targetCtx.lineTo(rbbApex.x, rbbApex.y);
    targetCtx.lineTo(mapX(-0.32, 0.16), mapY(0.16, -0.32));

    // Left Bundle Branch & Lateral Purkinje Arborization
    targetCtx.moveTo(hisEnd.x, hisEnd.y);
    targetCtx.lineTo(lbbMid.x, lbbMid.y);
    targetCtx.lineTo(lbbApex.x, lbbApex.y);
    targetCtx.lineTo(lbbFreeWall.x, lbbFreeWall.y);
    targetCtx.stroke();

    // Traveling Action Potential Photon Wavefront down Septum into Ventricles
    if (isQrsFlash) {
      const qrsT = (beatPhase - 0.18) / 0.10; // 0.0 -> 1.0 along the branch
      const curLbbX = hisEnd.x + (lbbApex.x - hisEnd.x) * qrsT;
      const curLbbY = hisEnd.y + (lbbApex.y - hisEnd.y) * qrsT;
      const curRbbX = hisEnd.x + (rbbApex.x - hisEnd.x) * qrsT;
      const curRbbY = hisEnd.y + (rbbApex.y - hisEnd.y) * qrsT;

      targetCtx.fillStyle = "#ffffff";
      targetCtx.shadowColor = "#38bdf8";
      targetCtx.shadowBlur = 16;
      targetCtx.beginPath();
      targetCtx.arc(curLbbX, curLbbY, 4.5, 0, Math.PI * 2);
      targetCtx.arc(curRbbX, curRbbY, 4.0, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // E. Ventricular Repolarization Wave (T-Wave, Epicardium -> Endocardium)
    if (beatPhase >= 0.38 && beatPhase < 0.52) {
      const repolAlpha = Math.sin(((beatPhase - 0.38) / 0.14) * Math.PI) * 0.32;
      targetCtx.fillStyle = `rgba(249, 115, 22, ${repolAlpha})`;
      targetCtx.beginPath();
      targetCtx.arc(apexPt.x, apexPt.y * 0.85, heartW * 0.36, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();

    // 5. OUTER-FLANK FROSTED CALLOUT BADGES (LEAVING THE CENTRAL HEART 100% UNOBSTRUCTED)
    targetCtx.save();
    targetCtx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";

    const drawOuterCallout = (txt, badgeX, badgeY, targetPt, bg, border, fg) => {
      // Slender leader line to chamber
      targetCtx.save();
      targetCtx.strokeStyle = border;
      targetCtx.lineWidth = 1;
      targetCtx.setLineDash([3, 3]);
      targetCtx.beginPath();
      targetCtx.moveTo(badgeX, badgeY);
      targetCtx.lineTo(targetPt.x, targetPt.y);
      targetCtx.stroke();

      // Glowing anchor dot at chamber
      targetCtx.setLineDash([]);
      targetCtx.fillStyle = fg;
      targetCtx.shadowColor = border;
      targetCtx.shadowBlur = 6;
      targetCtx.beginPath();
      targetCtx.arc(targetPt.x, targetPt.y, 3, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();

      // Rounded Badge
      const tw = targetCtx.measureText(txt).width + 16;
      targetCtx.fillStyle = bg;
      targetCtx.strokeStyle = border;
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.roundRect(badgeX - tw / 2, badgeY - 10, tw, 20, 10);
      targetCtx.fill();
      targetCtx.stroke();
      targetCtx.fillStyle = fg;
      targetCtx.fillText(txt, badgeX, badgeY);
    };

    // Positioned outside the heart silhouette at the outer lateral flanks
    drawOuterCallout(
      "RA (Atrium Dextrum)",
      -heartW * 0.54, -heartH * 0.22,
      mapPoint(-0.38, -0.22),
      "rgba(15, 23, 42, 0.85)", "rgba(56, 189, 248, 0.6)", "#38bdf8"
    );
    drawOuterCallout(
      "LA (Atrium Sinistrum)",
      heartW * 0.54, -heartH * 0.22,
      mapPoint(0.38, -0.22),
      "rgba(15, 23, 42, 0.85)", "rgba(248, 113, 113, 0.6)", "#f87171"
    );
    drawOuterCallout(
      "RV (Ventriculus Dexter)",
      -heartW * 0.52, heartH * 0.24,
      mapPoint(-0.32, 0.20),
      "rgba(15, 23, 42, 0.85)", "rgba(56, 189, 248, 0.6)", "#38bdf8"
    );
    drawOuterCallout(
      "LV (Ventriculus Sinister)",
      heartW * 0.52, heartH * 0.24,
      mapPoint(0.28, 0.20),
      "rgba(15, 23, 42, 0.85)", "rgba(248, 113, 113, 0.6)", "#f87171"
    );
    targetCtx.restore();

    targetCtx.restore(); // Restore heart center transform

    // 6. REAL-TIME HEMODYNAMIC HUD METRICS OVERLAY
    targetCtx.save();
    const hudY = height - 60;
    const hudW = width * 0.52;
    targetCtx.fillStyle = "rgba(15, 23, 42, 0.90)";
    targetCtx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    targetCtx.lineWidth = 1;
    targetCtx.roundRect(16, hudY - 32, hudW, 76, 10);
    targetCtx.fill(); targetCtx.stroke();

    // Phase Badge with glowing status beacon
    targetCtx.fillStyle = phaseColor;
    targetCtx.shadowColor = phaseColor;
    targetCtx.shadowBlur = 8;
    targetCtx.beginPath();
    targetCtx.arc(32, hudY - 14, 5, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 13px 'JetBrains Mono', monospace";
    targetCtx.fillText(`${phaseName.toUpperCase()}`, 46, hudY - 10);

    targetCtx.font = "11px -apple-system, sans-serif";
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.65)";
    targetCtx.fillText(phaseDesc, 46, hudY + 8);

    // Hemodynamic pressure badges on bottom
    targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.fillText(`RV: ${rvPressure} mmHg`, 46, hudY + 28);
    targetCtx.fillStyle = "#f87171";
    targetCtx.fillText(`LV: ${lvPressure} mmHg`, 160, hudY + 28);
    targetCtx.fillStyle = "#34d399";
    targetCtx.fillText(`Aorta: ${aortaPressure} mmHg`, 280, hudY + 28);
    targetCtx.fillStyle = isAvOpen ? "#60a5fa" : "#94a3b8";
    targetCtx.fillText(`AV Valves: ${isAvOpen ? "OPEN" : "CLOSED"}`, 420, hudY + 28);
    targetCtx.restore();

    // 7. RIGHT SIDE: LIVE SYNCHRONIZED LEAD II ECG MONITOR STRIP
    const ecgLeft = width * 0.56;
    const ecgTop = 20;
    const ecgWidth = width * 0.41;
    const ecgHeight = height - 40;

    targetCtx.fillStyle = "rgba(15, 23, 42, 0.90)";
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    targetCtx.lineWidth = 1.5;
    targetCtx.roundRect(ecgLeft, ecgTop, ecgWidth, ecgHeight, 12);
    targetCtx.fill(); targetCtx.stroke();

    // High-precision medical ECG grid
    targetCtx.save();
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.07)";
    targetCtx.lineWidth = 1;
    for (let x = ecgLeft; x < ecgLeft + ecgWidth; x += 16) {
      targetCtx.beginPath(); targetCtx.moveTo(x, ecgTop); targetCtx.lineTo(x, ecgTop + ecgHeight); targetCtx.stroke();
    }
    for (let y = ecgTop; y < ecgTop + ecgHeight; y += 16) {
      targetCtx.beginPath(); targetCtx.moveTo(ecgLeft, y); targetCtx.lineTo(ecgLeft + ecgWidth, y); targetCtx.stroke();
    }

    // Major grid lines (5mm / 0.2s)
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    for (let x = ecgLeft; x < ecgLeft + ecgWidth; x += 80) {
      targetCtx.beginPath(); targetCtx.moveTo(x, ecgTop); targetCtx.lineTo(x, ecgTop + ecgHeight); targetCtx.stroke();
    }
    for (let y = ecgTop; y < ecgTop + ecgHeight; y += 80) {
      targetCtx.beginPath(); targetCtx.moveTo(ecgLeft, y); targetCtx.lineTo(ecgLeft + ecgWidth, y); targetCtx.stroke();
    }
    targetCtx.restore();

    // Telemetry strip header
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 12px 'JetBrains Mono', monospace";
    targetCtx.fillText("LEAD II TELEMETRY • 25 mm/s • 10 mm/mV", ecgLeft + 16, ecgTop + 24);
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.6)";
    targetCtx.font = "11px 'JetBrains Mono', monospace";
    targetCtx.fillText(`HR: ${histoState.heartRate} BPM • PR: 160ms • QRS: 88ms • QT: 380ms`, ecgLeft + 16, ecgTop + 42);

    // Compute live ECG waveform point
    const ecgMidY = ecgTop + ecgHeight * 0.52;
    let waveY = ecgMidY;

    if (beatPhase >= 0.04 && beatPhase < 0.14) {
      // P wave (Atrial depolarization)
      waveY -= Math.sin(((beatPhase - 0.04) / 0.10) * Math.PI) * 24;
    } else if (beatPhase >= 0.18 && beatPhase < 0.20) {
      // Q wave (Septal depolarization)
      waveY += 14;
    } else if (beatPhase >= 0.20 && beatPhase < 0.24) {
      // R wave (Ventricular peak)
      waveY -= 92;
    } else if (beatPhase >= 0.24 && beatPhase < 0.27) {
      // S wave
      waveY += 30;
    } else if (beatPhase >= 0.36 && beatPhase < 0.54) {
      // T wave (Ventricular repolarization)
      waveY -= Math.sin(((beatPhase - 0.36) / 0.18) * Math.PI) * 34;
    }

    histoState.ecgData.push(waveY);
    if (histoState.ecgData.length > 240) {
      histoState.ecgData.shift();
    }

    // Draw ECG Green Phosphor Line
    targetCtx.strokeStyle = "#10b981";
    targetCtx.lineWidth = 2.5;
    targetCtx.shadowColor = "#10b981";
    targetCtx.shadowBlur = 8;
    targetCtx.beginPath();
    const dx = ecgWidth / 240;
    histoState.ecgData.forEach((val, idx) => {
      const px = ecgLeft + idx * dx;
      if (idx === 0) targetCtx.moveTo(px, val);
      else targetCtx.lineTo(px, val);
    });
    targetCtx.stroke();
    targetCtx.shadowBlur = 0; // reset

    // Wave annotations on the right strip (P, Q, R, S, T)
    targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
    targetCtx.fillStyle = "rgba(16, 185, 129, 0.7)";
    targetCtx.fillText("P", ecgLeft + ecgWidth - 110, ecgMidY - 32);
    targetCtx.fillText("QRS", ecgLeft + ecgWidth - 75, ecgMidY - 60);
    targetCtx.fillText("T", ecgLeft + ecgWidth - 30, ecgMidY - 38);
  }

  // 2. NEPHRON COUNTERCURRENT MULTIPLIER RENDERER
  function renderNephronSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const padX = Math.max(24, width * 0.04);
    const topY = 24;
    const stageW = width * 0.62;
    const stageH = height - 52;

    const adhFrac = (histoState.adhLevel || 50) / 100;
    const finalUrineOsm = Math.round(100 + adhFrac * 1100);
    const urineFlowRate = (12.0 - adhFrac * 11.2).toFixed(1); // mL/min (Diabetes insipidus ~12 mL/min vs Antidiuresis ~0.8 mL/min)
    const freeWaterClearance = (urineFlowRate * (1 - finalUrineOsm / 300)).toFixed(2);

    // Header Title
    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    targetCtx.fillText("JUXTAMEDULLARY NEPHRON & COUNTERCURRENT MULTIPLIER", padX, topY);
    targetCtx.fillStyle = "#a78bfa";
    targetCtx.font = "11.5px -apple-system, sans-serif";
    targetCtx.fillText(`GFR = 125 mL/min • Medullary Tip = 1200 mOsm/L • ADH = ${histoState.adhLevel}% → Final Urine = ${finalUrineOsm} mOsm/L`, padX, topY + 18);

    // Corticomedullary Osmotic Gradient Strata Backdrop
    const zoneTop = topY + 32;
    const zoneH = stageH - 28;
    const grad = targetCtx.createLinearGradient(0, zoneTop, 0, zoneTop + zoneH);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.12)");
    grad.addColorStop(0.28, "rgba(129, 140, 248, 0.16)");
    grad.addColorStop(0.65, "rgba(168, 85, 247, 0.22)");
    grad.addColorStop(1, "rgba(239, 68, 68, 0.34)");
    targetCtx.fillStyle = grad;
    targetCtx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    targetCtx.roundRect(padX, zoneTop, stageW, zoneH, 12);
    targetCtx.fill();
    targetCtx.stroke();

    // Horizontal stratum dividers (Cortex / Outer Medulla / Inner Medulla)
    const strata = [
      { yFrac: 0.26, label: "RENAL CORTEX (300 mOsm/L)", color: "#38bdf8" },
      { yFrac: 0.60, label: "OUTER MEDULLA (600 mOsm/L)", color: "#c084fc" },
      { yFrac: 0.94, label: "INNER MEDULLARY PAPILLA (1200 mOsm/L)", color: "#f87171" }
    ];
    strata.forEach((st, i) => {
      const sy = zoneTop + zoneH * st.yFrac;
      if (i < 2) {
        targetCtx.save();
        targetCtx.setLineDash([6, 6]);
        targetCtx.strokeStyle = "rgba(255,255,255,0.16)";
        targetCtx.beginPath();
        targetCtx.moveTo(padX + 10, sy);
        targetCtx.lineTo(padX + stageW - 10, sy);
        targetCtx.stroke();
        targetCtx.restore();
      }
      targetCtx.fillStyle = st.color;
      targetCtx.font = "bold 10.5px 'JetBrains Mono', monospace";
      targetCtx.fillText(st.label, padX + 12, sy - 8);
    });

    // Coordinates for Nephron Tubule Segments
    const glomX = padX + stageW * 0.18;
    const glomY = zoneTop + zoneH * 0.14;
    const descX = padX + stageW * 0.38;
    const ascX = padX + stageW * 0.58;
    const cdX = padX + stageW * 0.82;
    const loopTopY = zoneTop + zoneH * 0.16;
    const loopBotY = zoneTop + zoneH * 0.84;
    const loopR = (ascX - descX) / 2;

    // 1. Glomerular Capillary Tuft & Afferent/Efferent Arterioles
    targetCtx.strokeStyle = "#ef4444";
    targetCtx.lineWidth = 5;
    targetCtx.beginPath();
    targetCtx.moveTo(glomX - 42, glomY - 12);
    targetCtx.lineTo(glomX - 12, glomY - 4);
    targetCtx.stroke();
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.moveTo(glomX - 12, glomY + 8);
    targetCtx.lineTo(glomX - 42, glomY + 18);
    targetCtx.stroke();

    // Glomerular capillary loops
    targetCtx.fillStyle = "rgba(239, 68, 68, 0.45)";
    targetCtx.strokeStyle = "#f87171";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(glomX, glomY, 16, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Bowman's Capsule
    targetCtx.strokeStyle = "#fde047";
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.arc(glomX, glomY, 24, -0.75 * Math.PI, 0.75 * Math.PI);
    targetCtx.stroke();

    // 2. Nephron Tubular Lumen Path
    targetCtx.save();
    targetCtx.strokeStyle = "rgba(254, 240, 138, 0.28)";
    targetCtx.lineWidth = 18;
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    targetCtx.beginPath();
    targetCtx.moveTo(glomX + 22, glomY);
    targetCtx.quadraticCurveTo((glomX + descX) * 0.5, glomY - 22, descX, loopTopY);
    targetCtx.lineTo(descX, loopBotY);
    targetCtx.arc((descX + ascX) * 0.5, loopBotY, loopR, Math.PI, 0, true);
    targetCtx.lineTo(ascX, loopTopY);
    targetCtx.quadraticCurveTo((ascX + cdX) * 0.5, glomY - 22, cdX, loopTopY);
    targetCtx.lineTo(cdX, zoneTop + zoneH - 12);
    targetCtx.stroke();

    // Tubular Wall Border
    targetCtx.strokeStyle = "#fef08a";
    targetCtx.lineWidth = 2.5;
    targetCtx.stroke();
    targetCtx.restore();

    // Thick Ascending Limb highlight (Impermeable to H2O, NKCC2 active transport)
    targetCtx.save();
    targetCtx.strokeStyle = "#fb923c";
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(ascX, loopBotY - 10);
    targetCtx.lineTo(ascX, loopTopY + 25);
    targetCtx.stroke();
    targetCtx.restore();

    // Animated Filtrate Solute Particles along the Nephron Path
    const numParticles = 18;
    for (let i = 0; i < numParticles; i++) {
      const p = ((simTime * 0.14) + i / numParticles) % 1.0;
      let px = glomX;
      let py = glomY;
      let pColor = "#38bdf8";
      if (p < 0.15) {
        const t = p / 0.15;
        px = glomX + 22 + (descX - glomX - 22) * t;
        py = glomY + (loopTopY - glomY) * t;
        pColor = "#38bdf8"; // 300 mOsm
      } else if (p < 0.42) {
        const t = (p - 0.15) / 0.27;
        px = descX;
        py = loopTopY + (loopBotY - loopTopY) * t;
        pColor = t > 0.6 ? "#ef4444" : "#c084fc"; // Concentrating to 1200 mOsm
      } else if (p < 0.52) {
        const t = (p - 0.42) / 0.10;
        const ang = Math.PI - t * Math.PI;
        px = (descX + ascX) * 0.5 + loopR * Math.cos(ang);
        py = loopBotY + loopR * Math.sin(ang);
        pColor = "#ef4444"; // 1200 mOsm hairpin tip
      } else if (p < 0.78) {
        const t = (p - 0.52) / 0.26;
        px = ascX;
        py = loopBotY - (loopBotY - loopTopY) * t;
        pColor = t > 0.6 ? "#38bdf8" : "#fbbf24"; // Diluting to 100 mOsm
      } else {
        const t = (p - 0.78) / 0.22;
        px = cdX;
        py = loopTopY + (zoneTop + zoneH - 18 - loopTopY) * t;
        pColor = adhFrac > 0.6 ? "#f87171" : (adhFrac > 0.25 ? "#fbbf24" : "#38bdf8");
      }
      targetCtx.beginPath();
      targetCtx.arc(px, py, 4.2, 0, Math.PI * 2);
      targetCtx.fillStyle = pColor;
      targetCtx.fill();
    }

    // Water efflux arrows from Thin Descending Limb (AQP1 constitutive)
    const shift = (simTime * 28) % 18;
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
    for (let y = loopTopY + 55; y < loopBotY - 25; y += 52) {
      targetCtx.fillText("← H₂O (AQP1)", descX - 92, y + shift * 0.3);
    }

    // Active NaCl efflux from Thick Ascending Limb (NKCC2 symporter)
    targetCtx.fillStyle = "#fbbf24";
    for (let y = loopTopY + 60; y < loopBotY - 30; y += 52) {
      targetCtx.fillText("Na⁺/K⁺/2Cl⁻ →", ascX + 14, y - shift * 0.3);
    }

    // Collecting Duct AQP2 Water Reabsorption (modulated by ADH slider)
    const aqpAlpha = Math.max(0.18, adhFrac);
    targetCtx.save();
    targetCtx.globalAlpha = aqpAlpha;
    targetCtx.fillStyle = "#38bdf8";
    for (let y = loopTopY + 65; y < loopBotY; y += 50) {
      targetCtx.fillText(`H₂O (AQP2: ${histoState.adhLevel}%) →`, cdX + 14, y);
    }
    targetCtx.restore();

    // Segment Osmolarity Callout Pills on Nephron
    const drawOsmBadge = (x, y, text, borderCol) => {
      targetCtx.save();
      targetCtx.font = "bold 10px 'JetBrains Mono', monospace";
      const tw = targetCtx.measureText(text).width + 10;
      targetCtx.fillStyle = "rgba(9, 13, 22, 0.9)";
      targetCtx.strokeStyle = borderCol;
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.roundRect(x - tw / 2, y - 9, tw, 18, 4);
      targetCtx.fill();
      targetCtx.stroke();
      targetCtx.fillStyle = "#f8fafc";
      targetCtx.fillText(text, x - tw / 2 + 5, y + 3.5);
      targetCtx.restore();
    };
    drawOsmBadge(glomX, glomY - 34, "PCT: 300 mOsm", "#38bdf8");
    drawOsmBadge((descX + ascX) * 0.5, loopBotY + loopR + 16, "Tip: 1200 mOsm", "#ef4444");
    drawOsmBadge(ascX + 15, loopTopY - 14, "DCT: 100 mOsm", "#fbbf24");
    drawOsmBadge(cdX, zoneTop + zoneH - 8, `Urine: ${finalUrineOsm} mOsm`, "#a855f7");

    // Right-Side Renal Clearance & Telemetry Card
    const cardX = padX + stageW + 18;
    const cardW = width - cardX - padX;
    if (cardW > 140) {
      targetCtx.fillStyle = "rgba(15, 23, 42, 0.88)";
      targetCtx.strokeStyle = "rgba(168, 85, 247, 0.35)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(cardX, zoneTop, cardW, zoneH, 12);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#c084fc";
      targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
      targetCtx.fillText("RENAL CLEARANCE TELEMETRY", cardX + 14, zoneTop + 24);

      const metrics = [
        { k: "Net Filtration Pressure", v: "10 mmHg (Starling)", c: "#38bdf8" },
        { k: "Glomerular Filtration (GFR)", v: "125 mL/min (180 L/day)", c: "#34d399" },
        { k: "PCT Iso-Osmotic Reabsorption", v: "67% Na⁺, H₂O, 100% Glu", c: "#fde047" },
        { k: "TAL NKCC2 Pump Gradient", v: "200 mOsm Horizontal Δ", c: "#fb923c" },
        { k: "ADH / AVP Receptor V2", v: `${histoState.adhLevel}% AQP2 Insertion`, c: "#a78bfa" },
        { k: "Final Urine Osmolarity", v: `${finalUrineOsm} mOsm/L`, c: finalUrineOsm > 800 ? "#f87171" : "#38bdf8" },
        { k: "Urine Flow Rate (V̇)", v: `${urineFlowRate} mL/min`, c: "#e2e8f0" },
        { k: "Free Water Clearance (CH₂O)", v: `${freeWaterClearance} mL/min`, c: parseFloat(freeWaterClearance) < 0 ? "#f87171" : "#34d399" }
      ];
      metrics.forEach((m, idx) => {
        const my = zoneTop + 48 + idx * 38;
        if (my + 24 < zoneTop + zoneH) {
          targetCtx.fillStyle = "rgba(255,255,255,0.03)";
          targetCtx.beginPath();
          targetCtx.roundRect(cardX + 10, my - 12, cardW - 20, 32, 6);
          targetCtx.fill();
          targetCtx.fillStyle = "#94a3b8";
          targetCtx.font = "10px -apple-system, sans-serif";
          targetCtx.fillText(m.k, cardX + 16, my);
          targetCtx.fillStyle = m.c;
          targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
          targetCtx.fillText(m.v, cardX + 16, my + 14);
        }
      });
    }
  }

  // 3. NEURON SYNAPSE & ACTION POTENTIAL RENDERER
  function renderNeuronSynapseSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    if (histoState.actionPotentialStim) {
      histoState.apPhaseProgress += dt * 0.85;
      if (histoState.apPhaseProgress > 1.0) {
        histoState.actionPotentialStim = false;
        histoState.apPhaseProgress = 0;
      }
    }

    const p = histoState.actionPotentialStim ? histoState.apPhaseProgress : 0;
    // Compute live membrane voltage Vm(p) using Hodgkin-Huxley waveform
    let currentVm = -70;
    let phaseLabel = "Phase 0: Resting Membrane Potential (-70 mV, Na⁺/K⁺ ATPase)";
    if (histoState.actionPotentialStim) {
      if (p < 0.15) {
        currentVm = -70 + (p / 0.15) * 15;
        phaseLabel = "Phase 1: Graded EPSP Approaches Threshold (-55 mV)";
      } else if (p < 0.35) {
        const t = (p - 0.15) / 0.20;
        currentVm = -55 + t * 85;
        phaseLabel = "Phase 2: Rapid NaV1.6 Depolarization Upstroke (+30 mV)";
      } else if (p < 0.65) {
        const t = (p - 0.35) / 0.30;
        currentVm = 30 - t * 110;
        phaseLabel = "Phase 3: Na⁺ Inactivation & KV Delayed Rectifier Efflux";
      } else if (p < 0.85) {
        const t = (p - 0.65) / 0.20;
        currentVm = -80 + t * 10;
        phaseLabel = "Phase 4: After-Hyperpolarization Undershoot (-80 mV)";
      } else {
        currentVm = -70;
        phaseLabel = "SNARE Exocytosis Complete → AChE / EAAT Reuptake";
      }
    }

    const leftX = Math.max(24, width * 0.04);
    const synCenterX = width * 0.28;
    const cleftY = height * 0.52;

    // Header
    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    targetCtx.fillText("CHEMICAL SYNAPSE ULTRASTRUCTURE & HODGKIN-HUXLEY ACTION POTENTIAL", leftX, 24);
    targetCtx.fillStyle = histoState.actionPotentialStim ? "#fde047" : "#94a3b8";
    targetCtx.font = "11.5px -apple-system, sans-serif";
    targetCtx.fillText(`${phaseLabel} • Instantaneous Vm = ${currentVm.toFixed(1)} mV`, leftX, 42);

    // 1. Presynaptic Axon Terminal Bouton (Top Bulb)
    const preGrad = targetCtx.createRadialGradient(synCenterX, cleftY - 105, 15, synCenterX, cleftY - 105, 115);
    preGrad.addColorStop(0, "rgba(56, 189, 248, 0.32)");
    preGrad.addColorStop(1, "rgba(15, 23, 42, 0.85)");
    targetCtx.fillStyle = preGrad;
    targetCtx.strokeStyle = histoState.actionPotentialStim && p < 0.45 ? "#fde047" : "#38bdf8";
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.moveTo(synCenterX - 45, 62);
    targetCtx.lineTo(synCenterX - 45, cleftY - 135);
    targetCtx.bezierCurveTo(synCenterX - 115, cleftY - 95, synCenterX - 110, cleftY - 22, synCenterX - 65, cleftY - 18);
    targetCtx.lineTo(synCenterX + 65, cleftY - 18);
    targetCtx.bezierCurveTo(synCenterX + 110, cleftY - 22, synCenterX + 115, cleftY - 95, synCenterX + 45, cleftY - 135);
    targetCtx.lineTo(synCenterX + 45, 62);
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 10.5px 'JetBrains Mono', monospace";
    targetCtx.fillText("PRESYNAPTIC BOUTON", synCenterX - 60, 82);

    // Presynaptic Mitochondrion (ATP synthesis for vesicle priming)
    targetCtx.fillStyle = "rgba(249, 115, 22, 0.3)";
    targetCtx.strokeStyle = "#fb923c";
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    targetCtx.ellipse(synCenterX - 38, cleftY - 115, 24, 11, -0.3, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = "#fed7aa";
    targetCtx.font = "9px 'JetBrains Mono', monospace";
    targetCtx.fillText("ATP Mito", synCenterX - 58, cleftY - 112);

    // Voltage-Gated CaV2.1 (P/Q-type) Channels on Presynaptic Membrane
    const caOpen = histoState.actionPotentialStim && p >= 0.20 && p <= 0.65;
    [-72, 72].forEach((dx, idx) => {
      targetCtx.fillStyle = caOpen ? "#22c55e" : "#64748b";
      targetCtx.beginPath();
      targetCtx.roundRect(synCenterX + dx - 8, cleftY - 46, 16, 12, 3);
      targetCtx.fill();
      if (caOpen) {
        targetCtx.fillStyle = "#4ade80";
        targetCtx.font = "bold 10px 'JetBrains Mono', monospace";
        targetCtx.fillText(idx === 0 ? "Ca²⁺ ➔" : "⬅ Ca²⁺", synCenterX + dx + (idx === 0 ? -46 : 12), cleftY - 36);
      }
    });

    // Synaptic Vesicles (SNARE-complex docked & reserve pool)
    const vesicleCount = 12;
    for (let i = 0; i < vesicleCount; i++) {
      const row = Math.floor(i / 4);
      const col = (i % 4) - 1.5;
      const vx = synCenterX + col * 28 + 3 * Math.sin(simTime * 2.5 + i);
      const vy = cleftY - 78 + row * 22 + (caOpen && row === 2 ? (p - 0.2) * 32 : 0);
      targetCtx.beginPath();
      targetCtx.arc(vx, Math.min(cleftY - 22, vy), 8, 0, Math.PI * 2);
      targetCtx.fillStyle = "rgba(254, 240, 138, 0.25)";
      targetCtx.strokeStyle = "#fde047";
      targetCtx.lineWidth = 1.8;
      targetCtx.fill();
      targetCtx.stroke();
      // Neurotransmitter dots inside vesicle
      targetCtx.fillStyle = "#fde047";
      targetCtx.beginPath();
      targetCtx.arc(vx - 2, Math.min(cleftY - 22, vy) - 1, 1.8, 0, Math.PI * 2);
      targetCtx.arc(vx + 2, Math.min(cleftY - 22, vy) + 2, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 2. Synaptic Cleft (20 nm) & Released Neurotransmitter Quantum Diffusion
    targetCtx.fillStyle = "#94a3b8";
    targetCtx.font = "bold 10px 'JetBrains Mono', monospace";
    targetCtx.fillText("20 nm SYNAPTIC CLEFT", synCenterX + 86, cleftY + 4);

    if (histoState.actionPotentialStim && p >= 0.28) {
      const cleftProgress = Math.min(1.0, (p - 0.28) / 0.45);
      for (let q = 0; q < 22; q++) {
        const qx = synCenterX - 55 + ((q * 19) % 110) + 6 * Math.sin(simTime * 6 + q);
        const qy = (cleftY - 16) + cleftProgress * 34 * ((q % 3 + 1) / 3);
        targetCtx.beginPath();
        targetCtx.arc(qx, Math.min(cleftY + 18, qy), 2.8, 0, Math.PI * 2);
        targetCtx.fillStyle = "#fde047";
        targetCtx.fill();
      }
    }

    // 3. Postsynaptic Dendritic Spine & AMPA/NMDA Receptors
    const postGrad = targetCtx.createRadialGradient(synCenterX, cleftY + 100, 15, synCenterX, cleftY + 100, 115);
    postGrad.addColorStop(0, "rgba(168, 85, 247, 0.32)");
    postGrad.addColorStop(1, "rgba(15, 23, 42, 0.88)");
    targetCtx.fillStyle = postGrad;
    targetCtx.strokeStyle = "#a855f7";
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.moveTo(synCenterX - 70, cleftY + 20);
    targetCtx.lineTo(synCenterX + 70, cleftY + 20);
    targetCtx.bezierCurveTo(synCenterX + 105, cleftY + 28, synCenterX + 95, cleftY + 110, synCenterX + 42, height - 28);
    targetCtx.lineTo(synCenterX - 42, height - 28);
    targetCtx.bezierCurveTo(synCenterX - 95, cleftY + 110, synCenterX - 105, cleftY + 28, synCenterX - 70, cleftY + 20);
    targetCtx.fill();
    targetCtx.stroke();

    // Postsynaptic Density (PSD-95) & Ionotropic Receptors
    const recOpen = histoState.actionPotentialStim && p >= 0.38 && p <= 0.85;
    for (let r = -2; r <= 2; r++) {
      const rx = synCenterX + r * 24;
      targetCtx.fillStyle = recOpen ? "#38bdf8" : "#c084fc";
      targetCtx.beginPath();
      targetCtx.roundRect(rx - 6, cleftY + 14, 12, 14, 3);
      targetCtx.fill();
      if (recOpen) {
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.font = "bold 9px 'JetBrains Mono', monospace";
        targetCtx.fillText("↓Na⁺", rx - 10, cleftY + 42);
      }
    }
    targetCtx.fillStyle = "#e9d5ff";
    targetCtx.font = "bold 10.5px 'JetBrains Mono', monospace";
    targetCtx.fillText("POSTSYNAPTIC DENDRITIC SPINE (PSD-95)", synCenterX - 105, height - 42);

    // 4. Right Station: Real-Time Hodgkin-Huxley Action Potential Oscilloscope
    const oscX = width * 0.54;
    const oscY = 66;
    const oscW = width - oscX - 24;
    const oscH = height - 96;
    if (oscW > 180) {
      targetCtx.fillStyle = "rgba(9, 13, 22, 0.92)";
      targetCtx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(oscX, oscY, oscW, oscH, 12);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#fde047";
      targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
      targetCtx.fillText("AXONAL MEMBRANE OSCILLOSCOPE Vm(t)", oscX + 14, oscY + 22);

      // Voltage Axis Mapping (-90 mV to +40 mV)
      const mapVtoY = (v) => {
        const norm = (v - (-90)) / (40 - (-90));
        return (oscY + oscH - 36) - norm * (oscH - 76);
      };

      // Reference voltage lines (+30, 0, -55 Threshold, -70 Resting, -80 E_K)
      const vRefs = [
        { v: 30, label: "+30 mV (Na⁺ Peak)", col: "rgba(239, 68, 68, 0.45)" },
        { v: 0, label: "0 mV", col: "rgba(148, 163, 184, 0.25)" },
        { v: -55, label: "-55 mV (Threshold)", col: "rgba(250, 204, 21, 0.5)" },
        { v: -70, label: "-70 mV (Resting)", col: "rgba(56, 189, 248, 0.45)" }
      ];
      vRefs.forEach(ref => {
        const ry = mapVtoY(ref.v);
        targetCtx.save();
        targetCtx.setLineDash([4, 4]);
        targetCtx.strokeStyle = ref.col;
        targetCtx.beginPath();
        targetCtx.moveTo(oscX + 14, ry);
        targetCtx.lineTo(oscX + oscW - 14, ry);
        targetCtx.stroke();
        targetCtx.restore();
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.font = "9.5px 'JetBrains Mono', monospace";
        targetCtx.fillText(ref.label, oscX + 18, ry - 4);
      });

      // Draw Hodgkin-Huxley Action Potential Waveform Curve
      const plotL = oscX + 20;
      const plotW = oscW - 36;
      const evalHH = (u) => {
        if (u < 0.15) return -70 + (u / 0.15) * 15;
        if (u < 0.35) return -55 + Math.sin(((u - 0.15) / 0.20) * Math.PI * 0.5) * 85;
        if (u < 0.65) return 30 - ((u - 0.35) / 0.30) * 110;
        if (u < 0.85) return -80 + ((u - 0.65) / 0.20) * 10;
        return -70;
      };

      targetCtx.strokeStyle = "#eab308";
      targetCtx.lineWidth = 2.5;
      targetCtx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const u = i / 100;
        const px = plotL + u * plotW;
        const py = mapVtoY(evalHH(u));
        if (i === 0) targetCtx.moveTo(px, py);
        else targetCtx.lineTo(px, py);
      }
      targetCtx.stroke();

      // Live Cursor on Oscilloscope
      const cursorU = histoState.actionPotentialStim ? p : 0;
      const cursorX = plotL + cursorU * plotW;
      const cursorY = mapVtoY(evalHH(cursorU));
      targetCtx.beginPath();
      targetCtx.arc(cursorX, cursorY, 6, 0, Math.PI * 2);
      targetCtx.fillStyle = "#ef4444";
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 2;
      targetCtx.fill();
      targetCtx.stroke();
    }
  }

  // 4. ALVEOLAR-CAPILLARY GAS EXCHANGE RENDERER
  function renderAlveolarGasSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const fio2Frac = (histoState.fio2 || 21) / 100;
    // Alveolar Gas Equation: PAO2 = FiO2 * (760 - 47) - PaCO2 / 0.8
    const pao2 = Math.max(28, Math.round(fio2Frac * 713 - 50));
    const paco2 = 40;
    // Hill Equation for O2-Hb saturation: SaO2 = 100 * (PO2^2.7) / (PO2^2.7 + 26.6^2.7)
    const hillN = 2.7;
    const p50 = 26.6;
    const calcSaO2 = (po2) => (100 * Math.pow(po2, hillN)) / (Math.pow(po2, hillN) + Math.pow(p50, hillN));
    const sao2 = calcSaO2(pao2);

    const leftX = Math.max(24, width * 0.04);
    const alvX = width * 0.27;
    const alvY = height * 0.48;
    const alvR = Math.min(125, height * 0.28);

    // Header
    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    targetCtx.fillText("ALVEOLAR-CAPILLARY 0.5 µm BLOOD-AIR BARRIER & FICK DIFFUSION", leftX, 24);
    targetCtx.fillStyle = "#34d399";
    targetCtx.font = "11.5px -apple-system, sans-serif";
    targetCtx.fillText(`FiO₂ = ${histoState.fio2}% • Alveolar PAO₂ = ${pao2} mmHg • Arterial SaO₂ = ${sao2.toFixed(1)}% • P₅₀ = 26.6 mmHg`, leftX, 42);

    // 1. Alveolar Sac Lumen
    const alvGrad = targetCtx.createRadialGradient(alvX, alvY, 15, alvX, alvY, alvR);
    alvGrad.addColorStop(0, "rgba(52, 211, 153, 0.25)");
    alvGrad.addColorStop(1, "rgba(16, 185, 129, 0.08)");
    targetCtx.fillStyle = alvGrad;
    targetCtx.strokeStyle = "#10b981";
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    targetCtx.arc(alvX, alvY, alvR, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Inner Dipalmitoylphosphatidylcholine (DPPC) Surfactant Monolayer
    targetCtx.save();
    targetCtx.setLineDash([5, 4]);
    targetCtx.strokeStyle = "#fde047";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(alvX, alvY, alvR - 6, 0, Math.PI * 2);
    targetCtx.stroke();
    targetCtx.restore();

    // Type II Cuboidal Surfactant-Secreting Pneumocyte Nodes on Alveolar Wall
    [-2.2, 2.1].forEach(ang => {
      const tx = alvX + alvR * Math.cos(ang);
      const ty = alvY + alvR * Math.sin(ang);
      targetCtx.fillStyle = "#f59e0b";
      targetCtx.strokeStyle = "#fef08a";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(tx - 9, ty - 9, 18, 18, 4);
      targetCtx.fill();
      targetCtx.stroke();
    });

    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 13px 'JetBrains Mono', monospace";
    targetCtx.fillText("ALVEOLAR LUMEN", alvX - 58, alvY - 18);
    targetCtx.fillStyle = "#34d399";
    targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
    targetCtx.fillText(`PAO₂ = ${pao2} mmHg`, alvX - 52, alvY + 2);
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.fillText(`PACO₂ = ${paco2} mmHg`, alvX - 54, alvY + 20);
    targetCtx.fillStyle = "#fde047";
    targetCtx.font = "10px -apple-system, sans-serif";
    targetCtx.fillText("DPPC Surfactant Layer (P = 2T/r)", alvX - 75, alvY + 40);

    // 2. Adjacent Pulmonary Capillary Channel hugging Right Border of Alveolus
    const capArcX = alvX + 34;
    const capR = alvR + 28;
    targetCtx.save();
    targetCtx.strokeStyle = "rgba(239, 68, 68, 0.24)";
    targetCtx.lineWidth = 34;
    targetCtx.lineCap = "round";
    targetCtx.beginPath();
    targetCtx.arc(capArcX, alvY, capR, -0.42 * Math.PI, 0.42 * Math.PI);
    targetCtx.stroke();
    targetCtx.restore();

    // Circulating Erythrocytes (Deoxygenated Venous Blue -> Oxygenated Arterial Crimson)
    const numRBC = 7;
    for (let i = 0; i < numRBC; i++) {
      const u = ((simTime * 0.22) + i / numRBC) % 1.0;
      const ang = -0.40 * Math.PI + u * (0.80 * Math.PI);
      const rx = capArcX + capR * Math.cos(ang);
      const ry = alvY + capR * Math.sin(ang);
      const oxyRatio = Math.min(1, u * 1.35) * (sao2 / 100);
      const rCol = Math.round(59 + oxyRatio * 180);
      const gCol = Math.round(130 - oxyRatio * 68);
      const bCol = Math.round(246 - oxyRatio * 182);

      targetCtx.save();
      targetCtx.translate(rx, ry);
      targetCtx.rotate(ang + Math.PI / 2);
      targetCtx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
      targetCtx.strokeStyle = "rgba(255,255,255,0.45)";
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();
      targetCtx.restore();
    }

    // Animated O2 & CO2 Gas Diffusion Arrows across the 0.5 µm Blood-Air Barrier
    const diffShift = (simTime * 24) % 16;
    targetCtx.fillStyle = "#34d399";
    targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
    targetCtx.fillText(`O₂ ➔ (ΔP = ${Math.max(0, pao2 - 40)} mmHg)`, alvX + alvR - 18 + diffShift * 0.4, alvY - 14);
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.fillText(`⬅ CO₂ (ΔP = 6 mmHg)`, alvX + alvR - 12 - diffShift * 0.4, alvY + 18);

    // 3. Right Station: Live O2-Hemoglobin Dissociation Curve (Bohr/Hill Sigmoid)
    const chartX = width * 0.56;
    const chartY = 66;
    const chartW = width - chartX - 24;
    const chartH = height - 96;
    if (chartW > 180) {
      targetCtx.fillStyle = "rgba(9, 13, 22, 0.92)";
      targetCtx.strokeStyle = "rgba(16, 185, 129, 0.38)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(chartX, chartY, chartW, chartH, 12);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#34d399";
      targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
      targetCtx.fillText("O₂–HEMOGLOBIN DISSOCIATION CURVE", chartX + 14, chartY + 22);

      const gx = chartX + 38;
      const gy = chartY + chartH - 34;
      const gw = chartW - 56;
      const gh = chartH - 76;

      // Axes
      targetCtx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(gx, gy - gh);
      targetCtx.lineTo(gx, gy);
      targetCtx.lineTo(gx + gw, gy);
      targetCtx.stroke();

      targetCtx.fillStyle = "#94a3b8";
      targetCtx.font = "9.5px 'JetBrains Mono', monospace";
      targetCtx.fillText("100%", gx - 30, gy - gh + 6);
      targetCtx.fillText("50%", gx - 26, gy - gh * 0.5 + 4);
      targetCtx.fillText("PO₂ (0 → 140 mmHg)", gx + gw * 0.25, gy + 18);

      // Draw Hill Sigmoid Curve
      targetCtx.strokeStyle = "#ef4444";
      targetCtx.lineWidth = 2.5;
      targetCtx.beginPath();
      for (let po2 = 0; po2 <= 140; po2 += 2) {
        const sat = calcSaO2(po2);
        const px = gx + (po2 / 140) * gw;
        const py = gy - (sat / 100) * gh;
        if (po2 === 0) targetCtx.moveTo(px, py);
        else targetCtx.lineTo(px, py);
      }
      targetCtx.stroke();

      // Current Operating Point Marker
      const clampedPO2 = Math.min(140, pao2);
      const opX = gx + (clampedPO2 / 140) * gw;
      const opY = gy - (sao2 / 100) * gh;
      targetCtx.beginPath();
      targetCtx.arc(opX, opY, 6, 0, Math.PI * 2);
      targetCtx.fillStyle = "#34d399";
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 2;
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#f8fafc";
      targetCtx.font = "bold 10px 'JetBrains Mono', monospace";
      targetCtx.fillText(`SaO₂ ${sao2.toFixed(1)}% @ ${pao2} mmHg`, Math.min(gx + gw - 125, opX + 8), Math.max(gy - gh + 16, opY - 8));
    }
  }

  // 5. SARCOMERE SLIDING FILAMENT RENDERER
  function renderSarcomereSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const L = histoState.sarcomereLength || 2.2; // 1.60 to 2.40 µm
    // Active isometric tension (Gordon-Huxley piecewise parabolic/trapezoidal curve)
    const optDiff = Math.abs(L - 2.10);
    const activeTensionPct = Math.max(15, Math.min(100, Math.round(100 - Math.pow(optDiff / 0.55, 2) * 75)));

    const leftX = Math.max(24, width * 0.04);
    const midX = width * 0.34;
    const midY = height * 0.52;
    const maxSarcSpan = width * 0.50;
    const sarcSpan = (L / 2.40) * maxSarcSpan;
    const zLeft = midX - sarcSpan / 2;
    const zRight = midX + sarcSpan / 2;
    const myosinSpan = maxSarcSpan * (1.60 / 2.40); // Constant A-Band = 1.60 µm
    const actinSingleSpan = maxSarcSpan * (1.00 / 2.40); // Each thin filament = 1.0 µm

    // Header
    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    targetCtx.fillText("SKELETAL SARCOMERE ULTRASTRUCTURE & SLIDING FILAMENT MECHANICS", leftX, 24);
    targetCtx.fillStyle = "#f87171";
    targetCtx.font = "11.5px -apple-system, sans-serif";
    const hZoneUm = Math.max(0, L - 2.00).toFixed(2);
    const iBandUm = Math.max(0, L - 1.60).toFixed(2);
    targetCtx.fillText(`Z-to-Z Length = ${L.toFixed(2)} µm • Constant A-Band = 1.60 µm • I-Band = ${iBandUm} µm • H-Zone = ${hZoneUm} µm • Active Tension = ${activeTensionPct}%`, leftX, 42);

    // A-Band, I-Band, and H-Zone Top Dimension Brackets
    const bracketY = midY - 118;
    // A-Band bracket (Constant width centered on M-line)
    targetCtx.fillStyle = "rgba(168, 85, 247, 0.14)";
    targetCtx.fillRect(midX - myosinSpan / 2, midY - 95, myosinSpan, 190);
    targetCtx.fillStyle = "#c084fc";
    targetCtx.font = "bold 10.5px 'JetBrains Mono', monospace";
    targetCtx.fillText("A-BAND (1.60 µm Constant)", midX - 75, bracketY);

    // Z-Discs (Left and Right α-Actinin Zigzag Borders)
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(zLeft, midY - 95);
    targetCtx.lineTo(zLeft, midY + 95);
    targetCtx.moveTo(zRight, midY - 95);
    targetCtx.lineTo(zRight, midY + 95);
    targetCtx.stroke();

    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 10.5px 'JetBrains Mono', monospace";
    targetCtx.fillText("Z-DISC", zLeft - 20, midY + 114);
    targetCtx.fillText("Z-DISC", zRight - 20, midY + 114);

    // M-Line (Center Myomesin Anchor)
    targetCtx.save();
    targetCtx.strokeStyle = "#fde047";
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([6, 4]);
    targetCtx.beginPath();
    targetCtx.moveTo(midX, midY - 95);
    targetCtx.lineTo(midX, midY + 95);
    targetCtx.stroke();
    targetCtx.restore();
    targetCtx.fillStyle = "#fde047";
    targetCtx.fillText("M-LINE", midX - 20, midY + 114);

    // Thin Filaments (Actin + Troponin/Tropomyosin) anchored to Z-Discs
    for (let y = midY - 72; y <= midY + 72; y += 36) {
      targetCtx.strokeStyle = "#f87171";
      targetCtx.lineWidth = 4.5;
      targetCtx.beginPath();
      targetCtx.moveTo(zLeft, y);
      targetCtx.lineTo(Math.min(midX + 12, zLeft + actinSingleSpan), y);
      targetCtx.moveTo(zRight, y);
      targetCtx.lineTo(Math.max(midX - 12, zRight - actinSingleSpan), y);
      targetCtx.stroke();
    }

    // Thick Filaments (Myosin II with Pivoting S1 Cross-Bridge Heads)
    const swing = Math.sin(simTime * 6) * 4;
    for (let y = midY - 54; y <= midY + 54; y += 36) {
      // Titin elastic spring connecting Z-disc to thick filament tip
      targetCtx.strokeStyle = "rgba(52, 211, 153, 0.55)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(zLeft, y);
      targetCtx.lineTo(midX - myosinSpan / 2, y);
      targetCtx.moveTo(zRight, y);
      targetCtx.lineTo(midX + myosinSpan / 2, y);
      targetCtx.stroke();

      // Thick Myosin rod
      targetCtx.strokeStyle = "#a855f7";
      targetCtx.lineWidth = 8;
      targetCtx.beginPath();
      targetCtx.moveTo(midX - myosinSpan / 2, y);
      targetCtx.lineTo(midX + myosinSpan / 2, y);
      targetCtx.stroke();

      // Animated Myosin S1 Cross-Bridge Heads
      targetCtx.strokeStyle = "#e9d5ff";
      targetCtx.lineWidth = 2;
      for (let hx = 24; hx < myosinSpan / 2 - 8; hx += 22) {
        targetCtx.beginPath();
        // Left half heads
        targetCtx.moveTo(midX - hx, y - 4);
        targetCtx.lineTo(midX - hx - 6 + swing, y - 13);
        targetCtx.moveTo(midX - hx, y + 4);
        targetCtx.lineTo(midX - hx - 6 + swing, y + 13);
        // Right half heads
        targetCtx.moveTo(midX + hx, y - 4);
        targetCtx.lineTo(midX + hx + 6 - swing, y - 13);
        targetCtx.moveTo(midX + hx, y + 4);
        targetCtx.lineTo(midX + hx + 6 - swing, y + 13);
        targetCtx.stroke();
      }
    }

    // Right Station: Gordon-Huxley Active Length-Tension Curve
    const ltX = width * 0.64;
    const ltY = 66;
    const ltW = width - ltX - 24;
    const ltH = height - 96;
    if (ltW > 165) {
      targetCtx.fillStyle = "rgba(9, 13, 22, 0.92)";
      targetCtx.strokeStyle = "rgba(248, 113, 113, 0.38)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(ltX, ltY, ltW, ltH, 12);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#f87171";
      targetCtx.font = "bold 11.5px 'JetBrains Mono', monospace";
      targetCtx.fillText("LENGTH–TENSION RELATION", ltX + 14, ltY + 22);

      const gx = ltX + 34;
      const gy = ltY + ltH - 34;
      const gw = ltW - 50;
      const gh = ltH - 76;

      targetCtx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(gx, gy - gh);
      targetCtx.lineTo(gx, gy);
      targetCtx.lineTo(gx + gw, gy);
      targetCtx.stroke();

      // Active Tension Curve (1.4 µm to 2.6 µm)
      targetCtx.strokeStyle = "#f87171";
      targetCtx.lineWidth = 2.5;
      targetCtx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const sLen = 1.50 + (i / 60) * 1.00;
        const tVal = Math.max(10, Math.min(100, 100 - Math.pow((sLen - 2.10) / 0.55, 2) * 75));
        const px = gx + ((sLen - 1.50) / 1.00) * gw;
        const py = gy - (tVal / 100) * gh;
        if (i === 0) targetCtx.moveTo(px, py);
        else targetCtx.lineTo(px, py);
      }
      targetCtx.stroke();

      // Current Sarcomere Length Operating Point
      const opX = gx + ((L - 1.50) / 1.00) * gw;
      const opY = gy - (activeTensionPct / 100) * gh;
      targetCtx.beginPath();
      targetCtx.arc(opX, opY, 6, 0, Math.PI * 2);
      targetCtx.fillStyle = "#fde047";
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 2;
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#f8fafc";
      targetCtx.font = "bold 10px 'JetBrains Mono', monospace";
      targetCtx.fillText(`${activeTensionPct}% Fmax @ ${L.toFixed(2)} µm`, gx + 8, gy + 18);
    }
  }

  // 6. COMPACT BONE OSTEON RENDERER
  function renderOsteonSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const leftX = Math.max(24, width * 0.04);
    const ox = width * 0.33;
    const oy = height * 0.53;
    const maxR = Math.min(155, height * 0.36);

    // Header
    targetCtx.fillStyle = "#f8fafc";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    targetCtx.fillText("CORTICAL BONE OSTEON (HAVERSIAN SYSTEM) & CANALICULAR MECHANOTRANSDUCTION", leftX, 24);
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "11.5px -apple-system, sans-serif";
    targetCtx.fillText("Hydroxyapatite Ca₁₀(PO₄)₆(OH)₂ + Type I Collagen (±45° Helicoidal Pitch) • Canalicular Perfusion Active", leftX, 42);

    // Outer Scalloped Cement Line (Reversal Line)
    targetCtx.fillStyle = "rgba(30, 41, 59, 0.55)";
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.arc(ox, oy, maxR + 12, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Radiating Spider-Like Canaliculi Network connecting Central Haversian Canal to Lacunae
    const pulseR = 28 + ((simTime * 42) % (maxR - 20));
    targetCtx.save();
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.22)";
    targetCtx.lineWidth = 1.1;
    for (let k = 0; k < 36; k++) {
      const ang = (k / 36) * Math.PI * 2;
      targetCtx.beginPath();
      targetCtx.moveTo(ox + 26 * Math.cos(ang), oy + 26 * Math.sin(ang));
      targetCtx.lineTo(ox + maxR * Math.cos(ang), oy + maxR * Math.sin(ang));
      targetCtx.stroke();
    }
    // Expanding metabolic Ca2+/PO43- perfusion wave along canaliculi
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.55)";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(ox, oy, pulseR, 0, Math.PI * 2);
    targetCtx.stroke();
    targetCtx.restore();

    // Concentric Calcified Lamellae Rings & Stellate Osteocytes inside Lacunae
    const ringCount = 4;
    for (let idx = 1; idx <= ringCount; idx++) {
      const r = 34 + (idx / ringCount) * (maxR - 36);
      targetCtx.strokeStyle = idx % 2 === 0 ? "rgba(226, 232, 240, 0.55)" : "rgba(148, 163, 184, 0.38)";
      targetCtx.lineWidth = 2.5;
      targetCtx.beginPath();
      targetCtx.arc(ox, oy, r, 0, Math.PI * 2);
      targetCtx.stroke();

      // Osteocytes in Lacunae along each concentric lamella
      const osteoCount = 6 + idx * 3;
      for (let i = 0; i < osteoCount; i++) {
        const theta = (i / osteoCount) * Math.PI * 2 + (idx * 0.25);
        const lx = ox + r * Math.cos(theta);
        const ly = oy + r * Math.sin(theta);
        targetCtx.fillStyle = "#0f172a";
        targetCtx.strokeStyle = "#38bdf8";
        targetCtx.lineWidth = 1.4;
        targetCtx.beginPath();
        targetCtx.ellipse(lx, ly, 6.5, 3.6, theta + Math.PI / 2, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        // Osteocyte nucleus
        targetCtx.fillStyle = "#7dd3fc";
        targetCtx.beginPath();
        targetCtx.arc(lx, ly, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
      }
    }

    // Central Haversian Canal (Arteriole, Venule, Sympathetic Nerve)
    targetCtx.fillStyle = "#090d16";
    targetCtx.strokeStyle = "#94a3b8";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(ox, oy, 26, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Haversian Arteriole (Red), Venule (Blue), & Nerve Fiber (Yellow)
    targetCtx.fillStyle = "#ef4444";
    targetCtx.beginPath(); targetCtx.arc(ox - 8, oy - 4, 6.5, 0, Math.PI * 2); targetCtx.fill();
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.beginPath(); targetCtx.arc(ox + 8, oy - 3, 6.5, 0, Math.PI * 2); targetCtx.fill();
    targetCtx.fillStyle = "#fde047";
    targetCtx.beginPath(); targetCtx.arc(ox, oy + 9, 4.2, 0, Math.PI * 2); targetCtx.fill();

    // Right Station: Polarized Light Birefringence & Wolff's Law Remodeling Card
    const cardX = width * 0.60;
    const cardY = 66;
    const cardW = width - cardX - 24;
    const cardH = height - 96;
    if (cardW > 170) {
      targetCtx.fillStyle = "rgba(9, 13, 22, 0.92)";
      targetCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.roundRect(cardX, cardY, cardW, cardH, 12);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = "#38bdf8";
      targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
      targetCtx.fillText("POLARIZED BIREFRINGENCE & BMU", cardX + 14, cardY + 22);

      // Polarized Maltese Cross Inset
      const pCx = cardX + cardW * 0.5;
      const pCy = cardY + 88;
      const pR = 44;
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(pCx, pCy, pR, 0, Math.PI * 2);
      targetCtx.fillStyle = "#cbd5e1";
      targetCtx.fill();
      // Maltese cross dark extinction arms
      targetCtx.fillStyle = "#090d16";
      targetCtx.fillRect(pCx - 6, pCy - pR, 12, pR * 2);
      targetCtx.fillRect(pCx - pR, pCy - 6, pR * 2, 12);
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 2;
      targetCtx.stroke();
      targetCtx.restore();

      targetCtx.fillStyle = "#94a3b8";
      targetCtx.font = "10px -apple-system, sans-serif";
      targetCtx.fillText("Crossed-Nicols Maltese Cross (±45° Collagen)", cardX + 14, pCy + pR + 18);

      const boneFacts = [
        { k: "Compressive Strength", v: "170 MPa (Longitudinal Axis)", c: "#38bdf8" },
        { k: "Tensile Strength", v: "120 MPa (Collagen I Crosslinks)", c: "#34d399" },
        { k: "Diffusion Limit", v: "≤ 200 µm from Haversian Canal", c: "#fde047" },
        { k: "Mechanosensor", v: "Osteocyte Sclerostin (SOST) Gate", c: "#c084fc" }
      ];
      boneFacts.forEach((bf, i) => {
        const by = pCy + pR + 40 + i * 34;
        if (by + 18 < cardY + cardH) {
          targetCtx.fillStyle = "#94a3b8";
          targetCtx.font = "10px -apple-system, sans-serif";
          targetCtx.fillText(bf.k, cardX + 14, by);
          targetCtx.fillStyle = bf.c;
          targetCtx.font = "bold 11px 'JetBrains Mono', monospace";
          targetCtx.fillText(bf.v, cardX + 14, by + 13);
        }
      });
    }
  }

  // Draw Anatomical Orientation Compass & Stereotactic Mini-Map on Macro Canvas
  function drawMacroEncyclopediaHud(targetCtx, width, height, baseScale) {
    targetCtx.save();

    // 1. Bottom-Left Anatomical Compass Rose (Superior / Inferior / Dexter / Sinister)
    const cx = 56;
    const cy = height - 58;
    const r = 26;

    targetCtx.fillStyle = "rgba(9, 13, 22, 0.85)";
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Crosshair axes
    targetCtx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(cx, cy - r); targetCtx.lineTo(cx, cy + r);
    targetCtx.moveTo(cx - r, cy); targetCtx.lineTo(cx + r, cy);
    targetCtx.stroke();

    // North arrow (Superior)
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.beginPath();
    targetCtx.moveTo(cx, cy - r - 2);
    targetCtx.lineTo(cx - 4, cy - r + 7);
    targetCtx.lineTo(cx + 4, cy - r + 7);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.font = "bold 8.5px 'JetBrains Mono', monospace";
    targetCtx.textAlign = "center";
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.fillText("SUP", cx, cy - r - 4);
    targetCtx.fillStyle = "#94a3b8";
    targetCtx.fillText("INF", cx, cy + r + 10);
    // In standard Anterior anatomical position, viewer's left is subject's Right (Dexter)
    const leftLabel = activeView === "anterior" ? "R" : "L";
    const rightLabel = activeView === "anterior" ? "L" : "R";
    targetCtx.fillText(leftLabel, cx - r - 7, cy + 3);
    targetCtx.fillText(rightLabel, cx + r + 7, cy + 3);
    targetCtx.textAlign = "left";

    // 2. Bottom-Right Stereotactic Mini-Map Radar (when zoomed in or on regional plate)
    const mapW = 54;
    const mapH = 96;
    const mapX = width - mapW - 14;
    const mapY = height - mapH - 14;

    targetCtx.fillStyle = "rgba(9, 13, 22, 0.86)";
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.roundRect(mapX, mapY, mapW, mapH, 8);
    targetCtx.fill();
    targetCtx.stroke();

    // Mini silhouette inside radar
    const sx = (x) => mapX + (x / 1000) * mapW;
    const sy = (y) => mapY + (y / 1800) * mapH;
    targetCtx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.arc(sx(500), sy(140), 5, 0, Math.PI * 2); // Head
    targetCtx.roundRect(sx(400), sy(240), (200 / 1000) * mapW, (560 / 1800) * mapH, 3); // Torso
    targetCtx.stroke();

    // Selected structure pin dot on Mini-Map
    if (selectedStructure && selectedStructure.coords) {
      targetCtx.fillStyle = "#38bdf8";
      targetCtx.beginPath();
      targetCtx.arc(sx(selectedStructure.coords.x), sy(selectedStructure.coords.y), 2.8, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // Current viewport frustum box on Mini-Map
    if (baseScale > 0) {
      const viewLeftNorm = Math.max(0, Math.min(1000, -panX / baseScale));
      const viewTopNorm = Math.max(0, Math.min(1800, -panY / baseScale));
      const viewRightNorm = Math.max(0, Math.min(1000, (width - panX) / baseScale));
      const viewBotNorm = Math.max(0, Math.min(1800, (height - panY) / baseScale));
      targetCtx.strokeStyle = "#10b981";
      targetCtx.lineWidth = 1.2;
      targetCtx.strokeRect(
        sx(viewLeftNorm),
        sy(viewTopNorm),
        Math.max(6, sx(viewRightNorm) - sx(viewLeftNorm)),
        Math.max(6, sy(viewBotNorm) - sy(viewTopNorm))
      );
    }

    targetCtx.restore();
  }

  // ----------------------------------------------------
  // ANIMATION LOOP (60 FPS Safe Disconnect Guarded)
  // ----------------------------------------------------
  function renderFrame(timestamp) {
    // Unmount Disconnect Guard
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.round(rect.width * dpr);
    const displayHeight = Math.round(rect.height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    if (!hasCenteredInitialView && rect.width > 0 && rect.height > 0) {
      const defCam = getDefaultPlateCamera(activePlate);
      focusCameraOnCoords(defCam.x, defCam.y, defCam.zoom);
      hasCenteredInitialView = true;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    if (activeTab === "histology") {
      renderHistologyCanvas(ctx, rect.width, rect.height, dt);
    } else {
      // Advance 60 FPS simulation clock for 3D biomechanical organ mesh & physiological particle streams
      simTime += dt;

      // Macro or Quiz Mode: Render Full-Body 4K 3D Anatomy & Organ Cutaway Plates
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Deep space grid background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < rect.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }

      // Apply Pan & Zoom Transform
      ctx.save();
      ctx.translate(panX, panY);

      // Default scaling maps the 1000x1800 coordinate space to fit canvas height
      const baseScale = (rect.height / 1800) * zoom;
      drawHumanBodyVector(ctx, baseScale, activeView);
      drawAnatomicalPins(ctx, baseScale, activeView, true);
      ctx.restore();

      // Render Anatomical Orientation Compass Rose & Stereotactic Mini-Map Radar
      drawMacroEncyclopediaHud(ctx, rect.width, rect.height, baseScale);
    }

    ctx.restore();
    animId = requestAnimationFrame(renderFrame);
  }

  // Kickoff 60 FPS loop
  animId = requestAnimationFrame(renderFrame);

  // Return unmount cleanup hook
  _currentAtlasCleanup = function cleanup() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("keydown", handleKeyDown);
  };

  return _currentAtlasCleanup;
}
