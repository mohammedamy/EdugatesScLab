// Edugates-ClipSAT Science Labs - Virtual Labs Telemetry, Multi-Trial & Exporter Engine
// Generates professional RFC-4180 CSV datasets, printable A4 Lab Dossiers with CER framework,
// multi-trial overlay tracking, and post-lab competency checkpoints.

import { renderLatex, upgradeAllMath } from "../utils/math-renderer.js";
import { showToast } from "../utils/toast.js";
import { ProgressStore } from "../components/progress-tracker.js";
import { exportToDocx } from "../utils/docx-export.js";

/**
 * In-memory trial store for virtual labs (persisted in session)
 */
const trialState = {};

export const LabTrialStore = {
  getTrials(labId) {
    if (!trialState[labId]) {
      trialState[labId] = [];
    }
    return trialState[labId];
  },

  addTrial(labId, trialData) {
    if (!trialState[labId]) trialState[labId] = [];
    // Keep max 3 trials for comparison overlay
    if (trialState[labId].length >= 3) {
      trialState[labId].shift(); // Remove oldest
    }
    const trialNumber = trialState[labId].length + 1;
    const entry = {
      trialNumber,
      timestamp: new Date().toLocaleTimeString(),
      color: trialNumber === 1 ? "#06b6d4" : (trialNumber === 2 ? "#f59e0b" : "#10b981"),
      ...trialData
    };
    trialState[labId].push(entry);
    return entry;
  },

  clearTrials(labId) {
    trialState[labId] = [];
  }
};

/**
 * Exports data to a formatted CSV file and triggers automatic browser download
 */
export function exportLabDataCsv({ title, labId, parameters = {}, headers = [], dataRows = [], filename }) {
  const finalFilename = filename || `${labId || "lab"}_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;

  const metaRows = [
    `"Edugates-ClipSAT Science Labs - Telemetry Export"`,
    `"Laboratory Suite","${title || "Virtual STEM Laboratory"}"`,
    `"Curriculum","Inspire Science (NGSS Aligned)"`,
    `"Export Timestamp","${new Date().toLocaleString()}"`,
    `"Apparatus Configuration"`
  ];

  Object.entries(parameters).forEach(([key, val]) => {
    metaRows.push(`"${key}","${val}"`);
  });

  metaRows.push(`""`); // Blank line before data table

  const headerLine = headers.map(h => `"${h}"`).join(",");
  const csvDataLines = dataRows.map(row => 
    row.map(cell => {
      if (typeof cell === "number") {
        return Number.isInteger(cell) ? cell : cell.toFixed(4);
      }
      return `"${cell}"`;
    }).join(",")
  );

  const fullCsv = [
    ...metaRows,
    headerLine,
    ...csvDataLines
  ].join("\r\n");

  const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV Export Complete", `Saved: ${finalFilename}`, "success");
}

/**
 * Opens the Printable 2-Page A4 Laboratory Summary Dossier Modal
 */
export function openLabReportModal(config) {
  const {
    title,
    subject = "Physical Science",
    inquiryQuestion = "Investigating quantitative relationships in empirical phenomena.",
    parameters = {},
    trials = [],
    metrics = {},
    formulas = [],
    observations = "Continuous high-precision telemetry gathered with laser photogate/digital metrology.",
    conclusionNotes = ""
  } = config;

  let overlay = document.getElementById("lab-report-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "lab-report-modal-overlay";
    overlay.className = "lab-report-modal-overlay";
    document.body.appendChild(overlay);
  }

  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  overlay.innerHTML = `
    <div class="lab-report-shell">
      <div class="lab-report-toolbar no-print">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 800; color: #38bdf8; font-size: 0.95rem;">🔬 Official Lab Dossier</span>
          <span style="color: #94a3b8; font-size: 0.8rem;">• ${title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btn-export-docx-lab-report" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; gap: 6px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.15); color: #38bdf8;" title="Export editable Microsoft Word (.docx) lab dossier">
            <span>📄</span>
            <span>Save as .docx</span>
          </button>
          <button id="btn-print-lab-report" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Print / Save PDF</span>
          </button>
          <button id="btn-close-lab-report" class="modal-close-btn" style="width: 32px; height: 32px; font-size: 1rem;">✕</button>
        </div>
      </div>

      <div class="lab-report-body">
        <div class="lab-report-sheet" id="lab-report-printable-area">
          <!-- Institutional Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; color: #0284c7;">
                Edugates-ClipSAT Science Labs • Inspire STEM Curriculum
              </div>
              <h1 style="font-size: 1.5rem; font-weight: 900; color: #0f172a; margin: 4px 0 2px 0;">
                ${title}
              </h1>
              <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">
                Department of ${subject} • Standard Laboratory Investigation
              </div>
            </div>
            <div style="text-align: right; font-size: 0.8rem; color: #334155; line-height: 1.4;">
              <div><strong>Date:</strong> ${currentDate}</div>
              <div><strong>Status:</strong> Completed & Verified</div>
            </div>
          </div>

          <!-- Student & Class Metadata Inputs -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; font-size: 0.82rem;">
            <div>
              <span style="color: #64748b; font-weight: 600;">Student Investigator:</span>
              <div style="font-weight: 700; color: #0f172a; border-bottom: 1px dotted #94a3b8; padding-top: 2px;" contenteditable="true">Student Name</div>
            </div>
            <div>
              <span style="color: #64748b; font-weight: 600;">Institution / Section:</span>
              <div style="font-weight: 700; color: #0f172a; border-bottom: 1px dotted #94a3b8; padding-top: 2px;" contenteditable="true">Edugates International School</div>
            </div>
            <div>
              <span style="color: #64748b; font-weight: 600;">Lab Bench ID:</span>
              <div style="font-weight: 700; color: #0f172a; border-bottom: 1px dotted #94a3b8; padding-top: 2px;" contenteditable="true">Virtual Workstation #04</div>
            </div>
          </div>

          <!-- Inquiry Focus -->
          <div style="margin-bottom: 16px; border-left: 4px solid #0284c7; padding-left: 12px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #0284c7;">Essential Investigation Question</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a;">${inquiryQuestion}</div>
          </div>

          <!-- Apparatus Parameters -->
          <div style="margin-bottom: 18px;">
            <h3 style="font-size: 0.88rem; text-transform: uppercase; font-weight: 800; color: #1e293b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              Apparatus &amp; Controlled Variables
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              ${Object.entries(parameters).map(([k, v]) => `
                <div style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 0.8rem;">
                  <span style="color: #64748b; font-weight: 600;">${k}:</span>
                  <strong style="color: #0f172a; margin-left: 4px;">${v}</strong>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Mathematical Formulations -->
          ${formulas && formulas.length > 0 ? `
            <div style="margin-bottom: 18px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px;">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #475569; margin-bottom: 6px;">
                Governing Physical &amp; Chemical Formulations
              </div>
              <div style="display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.88rem;">
                ${formulas.map(f => `
                  <div style="color: #0369a1; font-weight: 600;">
                    ${renderLatex(f, false)}
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Multi-Trial Empirical Comparison Table -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 0.88rem; text-transform: uppercase; font-weight: 800; color: #1e293b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              Empirical Multi-Trial Comparison Table
            </h3>
            ${trials && trials.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                <thead>
                  <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 8px 10px; font-weight: 800; color: #334155;">Trial #</th>
                    <th style="padding: 8px 10px; font-weight: 800; color: #334155;">Time</th>
                    ${Object.keys(trials[0].measurements || {}).map(mKey => `
                      <th style="padding: 8px 10px; font-weight: 800; color: #334155;">${mKey}</th>
                    `).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${trials.map(tr => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 8px 10px; font-weight: 700; color: ${tr.color || '#0284c7'};">Trial ${tr.trialNumber}</td>
                      <td style="padding: 8px 10px; color: #475569;">${tr.timestamp}</td>
                      ${Object.values(tr.measurements || {}).map(val => `
                        <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0f172a;">${typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}</td>
                      `).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : `
              <div style="padding: 14px; background: #f8fafc; border-radius: 6px; font-size: 0.82rem; color: #64748b; font-style: italic;">
                Current active trial readings recorded. Perform subsequent trials in workbench to build multi-trial delta overlay.
              </div>
            `}
          </div>

          <!-- NGSS CER Scientific Framework -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            <h3 style="font-size: 0.88rem; text-transform: uppercase; font-weight: 800; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0;">
              Scientific Argumentation (Claim • Evidence • Reasoning)
            </h3>
            
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #0284c7;">1. Scientific Claim:</span>
              <div style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;" contenteditable="true">
                State your conclusive claim directly answering the essential inquiry question based on the empirical observations.
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #10b981;">2. Quantitative Evidence:</span>
              <div style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;" contenteditable="true">
                Cite specific numerical values, trial averages, and percentage differentials from the laboratory telemetry above.
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #a855f7;">3. Scientific Reasoning:</span>
              <div style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;" contenteditable="true">
                Connect the quantitative evidence to underlying physical/chemical laws and theoretical models to justify why the data supports the claim.
              </div>
            </div>
          </div>

          <!-- Teacher Assessment & Signoff -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; border-top: 2px solid #0f172a; padding-top: 14px; font-size: 0.8rem;">
            <div>
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">Teacher Evaluation &amp; Feedback:</div>
              <div style="border-bottom: 1px solid #94a3b8; height: 24px;"></div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: #1e293b;">Mastery Score:</div>
              <div style="font-size: 1.2rem; font-weight: 900; color: #0284c7;">____ / 100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  upgradeAllMath(overlay);

  // DOCX Export button
  document.getElementById("btn-export-docx-lab-report")?.addEventListener("click", () => {
    const reportSheet = document.getElementById("lab-report-printable-area");
    if (!reportSheet) return;
    exportToDocx({
      title: `${title} - Laboratory Investigation Dossier`,
      filename: `LabReport_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}`,
      content: reportSheet,
      subject: subject
    });
  });

  // Print button
  document.getElementById("btn-print-lab-report")?.addEventListener("click", () => {
    document.body.classList.add("printing-lab-report");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-lab-report");
    }, 1000);
  });

  // Close button
  function closeReport() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    document.body.classList.remove("printing-lab-report");
  }

  document.getElementById("btn-close-lab-report")?.addEventListener("click", closeReport);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeReport();
  });
}

/**
 * Standard Bank of Post-Lab Conceptual Checkpoints (3 per lab)
 */
export const LAB_CHECKPOINTS = {
  projectile: [
    {
      id: "q1",
      question: "Which launch angle yields the maximum horizontal range over flat terrain in the absence of air drag?",
      options: [
        "30° (allows higher horizontal initial velocity)",
        "45° (optimal balance between horizontal velocity and hang time)",
        "60° (maximizes vertical altitude and fall duration)",
        "90° (straight up provides highest potential energy)"
      ],
      correctIndex: 1,
      explanation: "From R = (v₀² sin 2θ) / g, sin(2θ) reaches its maximum theoretical value of 1.0 when 2θ = 90°, meaning θ = 45°."
    },
    {
      id: "q2",
      question: "Two complementary angles (e.g. 30° and 60°) launched with equal initial speed v₀ will achieve:",
      options: [
        "The exact same maximum height H",
        "The exact same horizontal range R",
        "The exact same total flight time t",
        "Different ranges and heights in all scenarios"
      ],
      correctIndex: 1,
      explanation: "Because sin(2 × 30°) = sin(60°) = √3/2, and sin(2 × 60°) = sin(120°) = √3/2, complementary angles share identical horizontal range."
    },
    {
      id: "q3",
      question: "At the peak of its trajectory, what is the projectile's vertical velocity component (vᵧ) and horizontal acceleration (aₓ)?",
      options: [
        "vᵧ = 0 m/s and aₓ = 0 m/s²",
        "vᵧ = 9.8 m/s and aₓ = -9.8 m/s²",
        "vᵧ = 0 m/s and aₓ = 9.8 m/s²",
        "vᵧ = v₀ and aₓ = 0 m/s²"
      ],
      correctIndex: 0,
      explanation: "At the apex, vertical velocity instantaneously halts (vᵧ = 0) before reversing downwards. Neglecting drag, no horizontal force acts on the mass, so aₓ = 0."
    }
  ],

  titration: [
    {
      id: "q1",
      question: "In the strong acid-strong base titration (HCl with NaOH), the equivalence point pH at 25°C is exactly:",
      options: [
        "pH = 4.74 (buffer midpoint)",
        "pH = 7.00 (neutral salt NaCl and water only)",
        "pH = 8.30 (phenolphthalein color change)",
        "pH = 12.00 (excess base region)"
      ],
      correctIndex: 1,
      explanation: "Strong acid and strong base react stoichiometrically to produce water and neutral NaCl, yielding a pH of exactly 7.00 at 25°C."
    },
    {
      id: "q2",
      question: "What does the maximum peak in the first derivative curve (dpH / dV) signify?",
      options: [
        "The point of maximum buffer capacity",
        "The inflection point representing true stoichiometric equivalence",
        "The start of indicator ionization",
        "The solubility limit of the salt"
      ],
      correctIndex: 1,
      explanation: "The equivalence point corresponds to the steepest rate of pH change with respect to titrant volume, producing a sharp mathematical peak in dpH/dV."
    },
    {
      id: "q3",
      question: "Why is phenolphthalein an acceptable indicator for a strong acid - strong base titration despite turning pink at pH 8.2?",
      options: [
        "Because pH 8.2 is chemically identical to pH 7.0 in water",
        "Because the steep vertical equivalence pH leap (pH 3 to 11) occurs in less than a single drop (0.05 mL)",
        "Because phenolphthalein absorbs hydronium ions",
        "Because the burette calibration automatically offsets the error"
      ],
      correctIndex: 1,
      explanation: "The pH jump around the equivalence point is so steep that adding a fraction of a drop of 0.1 M NaOH surges the pH past 8.2, making the volumetric error negligible."
    }
  ],

  circuits: [
    {
      id: "q1",
      question: "According to Ohm's Law (I = V/R), if circuit resistance is doubled while voltage remains constant:",
      options: [
        "Current doubles",
        "Current is halved",
        "Current remains unchanged",
        "Power dissipation quadruples"
      ],
      correctIndex: 1,
      explanation: "Current is inversely proportional to resistance. Doubling resistance cuts electric current in half."
    },
    {
      id: "q2",
      question: "In a series circuit containing two resistors (R₁ and R₂), what is true of the electric current?",
      options: [
        "Current divides inversely according to resistance",
        "Current is identical through every series component",
        "Current drops to zero after passing the first resistor",
        "Current depends exclusively on the wire gauge"
      ],
      correctIndex: 1,
      explanation: "Charge conservation dictates that in a single-loop series branch, current cannot accumulate, so I = I₁ = I₂ everywhere."
    },
    {
      id: "q3",
      question: "When adding additional parallel branches to a constant-voltage DC circuit, the total equivalent resistance:",
      options: [
        "Increases linearly",
        "Decreases, allowing greater total supply current",
        "Remains strictly constant",
        "Depends on battery temperature only"
      ],
      correctIndex: 1,
      explanation: "Each parallel branch provides an additional conductive pathway for current: 1/R_eq = 1/R₁ + 1/R₂, reducing overall equivalent resistance."
    }
  ],

  gaslaws: [
    {
      id: "q1",
      question: "Boyle's Law states that at constant temperature and moles, the pressure and volume of an ideal gas are:",
      options: [
        "Directly proportional (P/V = constant)",
        "Inversely proportional (P · V = constant)",
        "Exponentially related",
        "Independent of each other"
      ],
      correctIndex: 1,
      explanation: "Halving the volume doubles the molecular collision frequency with container walls, thus doubling pressure (P₁V₁ = P₂V₂)."
    },
    {
      id: "q2",
      question: "Why must temperature always be converted to the absolute Kelvin scale (T = °C + 273.15) in gas calculations?",
      options: [
        "To avoid division by zero or negative volumes at sub-zero Celsius temperatures",
        "Because Kelvin matches imperial PSI units",
        "Because gas molecules only move above 100°C",
        "Because pressure sensors only output Kelvin"
      ],
      correctIndex: 0,
      explanation: "The Kelvin scale starts at Absolute Zero (0 K, where molecular kinetic energy is zero). Kinetic gas laws are directly proportional to absolute thermal kinetic energy."
    },
    {
      id: "q3",
      question: "Under Standard Temperature and Pressure (STP: 0°C, 1 atm), one mole of any ideal gas occupies:",
      options: [
        "1.00 L",
        "11.2 L",
        "22.4 L",
        "44.8 L"
      ],
      correctIndex: 2,
      explanation: "From V = nRT/P = (1 mol × 0.08206 L·atm/(mol·K) × 273.15 K) / 1 atm ≈ 22.414 L."
    }
  ],

  microscope: [
    {
      id: "q1",
      question: "If viewing an organism using a 10× ocular eyepiece and a 40× high-power objective, total magnification is:",
      options: [
        "50×",
        "400×",
        "4000×",
        "300×"
      ],
      correctIndex: 1,
      explanation: "Total magnification is the mathematical product of the ocular lens and objective lens: 10 × 40 = 400×."
    },
    {
      id: "q2",
      question: "Why is immersion oil required when operating the 100× oil immersion objective lens?",
      options: [
        "To sterilize the glass cover slip",
        "To match the refractive index of glass and prevent resolution-degrading light diffraction",
        "To lubricate the mechanical stage gears",
        "To stain the cellular organelles"
      ],
      correctIndex: 1,
      explanation: "Immersion oil has a refractive index (n ≈ 1.515) matching glass, eliminating light refraction at the air-glass interface and maximizing Numerical Aperture (NA)."
    },
    {
      id: "q3",
      question: "When moving a slide to the right on a standard compound light microscope, the specimen image appears to move:",
      options: [
        "To the right",
        "To the left",
        "Upwards",
        "It remains stationary"
      ],
      correctIndex: 1,
      explanation: "Compound microscopes invert and reverse the optical image across both horizontal and vertical axes."
    }
  ],

  optics: [
    {
      id: "q1",
      question: "When light travels from air (n = 1.00) into crown glass (n = 1.52) at an oblique angle, the refracted ray:",
      options: [
        "Bends away from the surface normal",
        "Bends towards the surface normal and slows down",
        "Continues straight without deflection",
        "Reflects entirely as total internal reflection"
      ],
      correctIndex: 1,
      explanation: "By Snell's law (n₁ sin θ₁ = n₂ sin θ₂), entering an optically denser medium reduces phase velocity and refracts the ray toward the normal."
    },
    {
      id: "q2",
      question: "Total Internal Reflection (TIR) can occur only when:",
      options: [
        "Light travels from an optically denser to rarer medium and exceeds the critical angle θ_c",
        "Light travels from vacuum into diamond",
        "The angle of incidence is exactly 0°",
        "The light source is monochromatic red only"
      ],
      correctIndex: 0,
      explanation: "TIR occurs when traveling from higher index n₁ to lower index n₂ at angles exceeding θ_c = arcsin(n₂/n₁)."
    },
    {
      id: "q3",
      question: "For a thin converging (convex) lens, an object placed beyond twice the focal length (d_o > 2f) produces an image that is:",
      options: [
        "Virtual, upright, and magnified",
        "Real, inverted, and reduced in size",
        "Real, upright, and equal in size",
        "Formed at optical infinity"
      ],
      correctIndex: 1,
      explanation: "From 1/f = 1/d_o + 1/d_i, when d_o > 2f, the image is real, inverted, located between f and 2f, and diminished."
    }
  ],

  ptable: [
    {
      id: "q1",
      question: "Across a period from left to right on the periodic table, atomic radius generally:",
      options: [
        "Increases due to added electron shells",
        "Decreases due to increasing effective nuclear charge (Z_eff) pulling electrons closer",
        "Remains identical across all transition metals",
        "Fluctuates unpredictably"
      ],
      correctIndex: 1,
      explanation: "Protons are added to the nucleus while electrons enter the same valence shell, increasing effective nuclear attraction and shrinking the electron cloud."
    },
    {
      id: "q2",
      question: "Which chemical element exhibits the highest electronegativity value on the Pauling scale?",
      options: [
        "Cesium (Cs)",
        "Fluorine (F, ~3.98)",
        "Helium (He)",
        "Oxygen (O)"
      ],
      correctIndex: 1,
      explanation: "Fluorine has high effective nuclear charge and a small valence shell, exerting the strongest attraction for shared bonding electrons."
    },
    {
      id: "q3",
      question: "Elements residing in the exact same vertical group or column of the periodic table share:",
      options: [
        "Identical number of total protons",
        "Identical number of valence electrons and similar chemical bonding reactivities",
        "Identical atomic mass",
        "Identical boiling points"
      ],
      correctIndex: 1,
      explanation: "Group members possess identical valence electron configurations (e.g. Alkali metals ns¹), giving them similar chemical behavior."
    }
  ],

  dnaprotein: [
    {
      id: "q1",
      question: "During RNA transcription, which RNA base pairs complementarily with an Adenine (A) on the DNA template strand?",
      options: [
        "Thymine (T)",
        "Uracil (U)",
        "Cytosine (C)",
        "Guanine (G)"
      ],
      correctIndex: 1,
      explanation: "RNA contains Uracil (U) instead of Thymine (T). Therefore, Adenine on the template pairs with Uracil on the mRNA transcript."
    },
    {
      id: "q2",
      question: "A triplet of three consecutive mRNA nucleotides that specifies a single amino acid is termed a:",
      options: [
        "Anticodon",
        "Codon",
        "Promoter",
        "Exon"
      ],
      correctIndex: 1,
      explanation: "A codon is a 3-nucleotide mRNA sequence read by ribosome complexes and matched by tRNA anticodons during translation."
    },
    {
      id: "q3",
      question: "A point mutation that alters a codon but does NOT change the resulting amino acid due to code degeneracy is a:",
      options: [
        "Missense mutation",
        "Nonsense mutation",
        "Silent mutation",
        "Frameshift deletion"
      ],
      correctIndex: 2,
      explanation: "Because multiple codons can code for the same amino acid (wobble hypothesis), a silent mutation leaves the polypeptide sequence unaltered."
    }
  ],

  punnett: [
    {
      id: "q1",
      question: "In a monohybrid cross between two heterozygous parents (Bb × Bb), the expected phenotypic ratio of dominant to recessive traits is:",
      options: [
        "1:1",
        "2:1",
        "3:1",
        "9:3:3:1"
      ],
      correctIndex: 2,
      explanation: "The genotype distribution is 1 BB : 2 Bb : 1 bb. Both BB and Bb express the dominant phenotype, producing a 3:1 phenotypic ratio."
    },
    {
      id: "q2",
      question: "What is the expected genotypic ratio among offspring in the Bb × Bb monohybrid cross?",
      options: [
        "1 BB : 2 Bb : 1 bb (25% homozygous dominant, 50% heterozygous, 25% homozygous recessive)",
        "3 BB : 1 bb",
        "4 Bb : 0 bb",
        "1 BB : 1 Bb : 1 bb"
      ],
      correctIndex: 0,
      explanation: "Punnett square analysis reveals 1/4 BB, 2/4 Bb, and 1/4 bb genotypes."
    },
    {
      id: "q3",
      question: "To determine whether an organism exhibiting a dominant phenotype is homozygous (BB) or heterozygous (Bb), one performs a:",
      options: [
        "Karyotype analysis",
        "Test cross with a homozygous recessive individual (bb)",
        "Self-pollination with a homozygous dominant individual (BB)",
        "Gel electrophoresis"
      ],
      correctIndex: 1,
      explanation: "Crossing the unknown with homozygous recessive (bb) reveals the genotype: if any recessive offspring appear (bb), the parent was heterozygous (Bb)."
    }
  ]
};

/**
 * Mounts the Post-Lab Assessment Checkpoint Widget inside any laboratory container
 */
export function mountLabCheckpoint(containerId, labKey = "projectile") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const questions = LAB_CHECKPOINTS[labKey] || LAB_CHECKPOINTS.projectile;
  let userAnswers = {};

  function render() {
    let answeredCount = Object.keys(userAnswers).length;
    let correctCount = Object.entries(userAnswers).filter(([idx, ans]) => ans === questions[idx].correctIndex).length;

    container.innerHTML = `
      <div class="lab-checkpoint-section">
        <div class="lab-checkpoint-header">
          <div class="lab-checkpoint-title">
            <span>🎯</span>
            <span>Post-Lab Inquiry Checkpoint &amp; Mastery Assessment</span>
          </div>
          <div class="lab-checkpoint-score-pill">
            Score: ${correctCount} / ${questions.length} (${answeredCount}/${questions.length} Answered)
          </div>
        </div>

        <div class="lab-checkpoint-grid">
          ${questions.map((q, qIdx) => {
            const chosen = userAnswers[qIdx];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;
            const cardClass = !isAnswered ? "" : (isCorrect ? "correct" : "incorrect");

            return `
              <div class="lab-question-card ${cardClass}" data-qidx="${qIdx}">
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                  Question ${qIdx + 1} of ${questions.length}
                </div>
                <div class="lab-question-text">${q.question}</div>

                <div class="lab-options-list">
                  ${q.options.map((opt, optIdx) => {
                    let optClass = "";
                    if (isAnswered) {
                      if (optIdx === q.correctIndex) optClass = "selected-correct";
                      else if (optIdx === chosen) optClass = "selected-wrong";
                    }
                    return `
                      <button class="lab-option-btn ${optClass}" data-qidx="${qIdx}" data-optidx="${optIdx}" ${isAnswered ? "disabled" : ""}>
                        <span>${["A", "B", "C", "D"][optIdx]}.</span>
                        <span>${opt}</span>
                      </button>
                    `;
                  }).join("")}
                </div>

                ${isAnswered ? `
                  <div class="lab-explanation-box ${isCorrect ? 'correct' : 'incorrect'}">
                    <strong>${isCorrect ? '✓ Correct Explanation:' : '✗ Insight:'}</strong> ${q.explanation}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind option buttons
    container.querySelectorAll(".lab-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qIdx = parseInt(btn.dataset.qidx, 10);
        const optIdx = parseInt(btn.dataset.optidx, 10);
        userAnswers[qIdx] = optIdx;

        // Auto record quiz progress when all questions are answered
        if (Object.keys(userAnswers).length === questions.length) {
          const finalCorrect = Object.entries(userAnswers).filter(([idx, ans]) => ans === questions[idx].correctIndex).length;
          ProgressStore.recordQuizResult(questions.length, finalCorrect);
          showToast("Lab Assessment Recorded!", `Score: ${finalCorrect}/${questions.length} Mastery Points`, "success");
        }

        render();
      });
    });
  }

  render();
}
