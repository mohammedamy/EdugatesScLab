// Edugates-ClipSAT Science Labs - Virtual Labs Telemetry, Multi-Trial & Exporter Engine
// Generates professional RFC-4180 CSV datasets, printable A4 Lab Dossiers with CER framework,
// multi-trial overlay tracking, and post-lab competency checkpoints.

import { renderLatex, upgradeAllMath, renderMathInElement, formatMathText } from "../utils/math-renderer.js";
import { showToast } from "../utils/toast.js";
import { ProgressStore } from "../components/progress-tracker.js";
import { exportToDocx } from "../utils/docx-export.js";
import { captureCanvasAsDataUrl, exportLabReportPrintable, downloadStandaloneReportHtml, buildPrintableReportHtml } from "../utils/lab-report-exporter.js";

export { captureCanvasAsDataUrl, exportLabReportPrintable, downloadStandaloneReportHtml, buildPrintableReportHtml };

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

  const canvasSnapshot = config.canvasDataUrl || captureCanvasAsDataUrl(config.canvasElement || config.canvasId);

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
          <button id="btn-export-html-lab-report" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; gap: 6px; border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.15); color: #10b981;" title="Download self-contained offline HTML lab report">
            <span>💾</span>
            <span>Save HTML</span>
          </button>
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

          <!-- Simulation Canvas Graph Snapshot -->
          ${canvasSnapshot ? `
            <div style="margin-bottom: 18px;">
              <h3 style="font-size: 0.88rem; text-transform: uppercase; font-weight: 800; color: #1e293b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                Sensor Telemetry &amp; Dynamic Simulation Graph
              </h3>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center;">
                <img src="${canvasSnapshot}" alt="${title} Simulation Graph" style="max-width: 100%; max-height: 260px; height: auto; border-radius: 6px; border: 1px solid #cbd5e1; display: block; margin: 0 auto; background: #070a12;">
                <div style="font-size: 0.75rem; color: #475569; font-weight: 600; margin-top: 6px;">
                  Figure 1.0: Live 60 FPS graphical sensor telemetry captured from active virtual laboratory canvas.
                </div>
              </div>
            </div>
          ` : ""}

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

  // Standalone HTML Export button
  document.getElementById("btn-export-html-lab-report")?.addEventListener("click", () => {
    downloadStandaloneReportHtml({
      title,
      labId: config.labId || "lab",
      subject,
      inquiryQuestion,
      parameters,
      readings: metrics,
      headers: trials && trials.length > 0 ? ["Trial #", "Time", ...Object.keys(trials[0].measurements || {})] : [],
      dataRows: trials && trials.length > 0 ? trials.map(t => [`Trial ${t.trialNumber}`, t.timestamp, ...Object.values(t.measurements || {})]) : [],
      canvasDataUrl: canvasSnapshot,
      notes: observations
    });
  });

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
      explanation: "From $R = \\frac{v_0^2 \\sin 2\\theta}{g}$, $\\sin(2\\theta)$ reaches its maximum theoretical value of 1.0 when $2\\theta = 90^\\circ$, meaning $\\theta = 45^\\circ$."
    },
    {
      id: "q2",
      question: "Two complementary angles (e.g. $30^\\circ$ and $60^\\circ$) launched with equal initial speed $v_0$ will achieve:",
      options: [
        "The exact same maximum height $H$",
        "The exact same horizontal range $R$",
        "The exact same total flight time $t$",
        "Different ranges and heights in all scenarios"
      ],
      correctIndex: 1,
      explanation: "Because $\\sin(2 \\times 30^\\circ) = \\sin(60^\\circ) = \\frac{\\sqrt{3}}{2}$, and $\\sin(2 \\times 60^\\circ) = \\sin(120^\\circ) = \\frac{\\sqrt{3}}{2}$, complementary angles share identical horizontal range."
    },
    {
      id: "q3",
      question: "At the peak of its trajectory, what is the projectile's vertical velocity component ($v_y$) and horizontal acceleration ($a_x$)?",
      options: [
        "$v_y = 0\\text{ m/s}$ and $a_x = 0\\text{ m/s}^2$",
        "$v_y = 9.8\\text{ m/s}$ and $a_x = -9.8\\text{ m/s}^2$",
        "$v_y = 0\\text{ m/s}$ and $a_x = 9.8\\text{ m/s}^2$",
        "$v_y = v_0$ and $a_x = 0\\text{ m/s}^2$"
      ],
      correctIndex: 0,
      explanation: "At the apex, vertical velocity instantaneously halts ($v_y = 0$) before reversing downwards. Neglecting drag, no horizontal force acts on the mass, so $a_x = 0$."
    },
    {
      id: "q4",
      question: "When launching from an elevated cliff or platform ($y_0 > 0$) toward a ground target below, how does the launch angle for maximum horizontal range compare to flat ground ($45^\\circ$)?",
      options: [
        "The optimal angle is strictly less than 45° (< 45°)",
        "The optimal angle is strictly greater than 45° (> 45°)",
        "The optimal angle remains strictly 45°",
        "The optimal angle is exactly 90° (vertical)"
      ],
      correctIndex: 0,
      explanation: "From an elevated platform (y₀ > 0), gravity aids the downward leg of flight, extending time of flight. Shifting launch velocity more into the horizontal (θ < 45°, typically 35°–42°) yields greater horizontal travel before landing."
    },
    {
      id: "q5",
      question: "When aerodynamic air drag ($\\vec{F}_d \\propto -v^2 \\hat{v}$) is enabled, what happens to the trajectory geometry compared to an ideal vacuum parabola?",
      options: [
        "The trajectory becomes asymmetric, with a steeper descent than ascent and reduced range",
        "The trajectory remains a symmetric parabola with identical range",
        "The apex shifts towards the end of the flight path",
        "The projectile accelerates continuously during descent"
      ],
      correctIndex: 0,
      explanation: "Air resistance continuously dissipates kinetic energy into thermal drag work, decelerating horizontal velocity vx. This shifts the apex backwards and produces a steep, non-parabolic plunge towards the ground with reduced range."
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
      question: "What does the maximum peak in the first derivative curve $\\left(\\frac{d\\text{pH}}{dV}\\right)$ signify?",
      options: [
        "The point of maximum buffer capacity",
        "The inflection point representing true stoichiometric equivalence",
        "The start of indicator ionization",
        "The solubility limit of the salt"
      ],
      correctIndex: 1,
      explanation: "The equivalence point corresponds to the steepest rate of pH change with respect to titrant volume, producing a sharp mathematical peak in $\\frac{d\\text{pH}}{dV}$."
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
      question: "According to Ohm's Law ($I = \\frac{V}{R}$), if circuit resistance is doubled while voltage remains constant:",
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
      question: "In a series circuit containing two resistors ($R_1$ and $R_2$), what is true of the electric current?",
      options: [
        "Current divides inversely according to resistance",
        "Current is identical through every series component",
        "Current drops to zero after passing the first resistor",
        "Current depends exclusively on the wire gauge"
      ],
      correctIndex: 1,
      explanation: "Charge conservation dictates that in a single-loop series branch, current cannot accumulate, so $I = I_1 = I_2$ everywhere."
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
      explanation: "Each parallel branch provides an additional conductive pathway for current: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$, reducing overall equivalent resistance."
    }
  ],

  gaslaws: [
    {
      id: "q1",
      question: "Boyle's Law states that at constant temperature and moles, the pressure and volume of an ideal gas are:",
      options: [
        "Directly proportional ($P/V = \\text{constant}$)",
        "Inversely proportional ($P \\cdot V = \\text{constant}$)",
        "Exponentially related",
        "Independent of each other"
      ],
      correctIndex: 1,
      explanation: "Halving the volume doubles the molecular collision frequency with container walls, thus doubling pressure ($P_1 V_1 = P_2 V_2$)."
    },
    {
      id: "q2",
      question: "Why must temperature always be converted to the absolute Kelvin scale ($T = T(^\\circ\\text{C}) + 273.15$) in gas calculations?",
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
      explanation: "From $V = \\frac{nRT}{P} = \\frac{1\\text{ mol} \\times 0.08206\\text{ L}\\cdot\\text{atm}/(\\text{mol}\\cdot\\text{K}) \\times 273.15\\text{ K}}{1\\text{ atm}} \\approx 22.414\\text{ L}$."
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
      question: "When light travels from air ($n = 1.00$) into crown glass ($n = 1.52$) at an oblique angle, the refracted ray:",
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
      question: "For a thin converging (convex) lens, an object placed beyond twice the focal length ($d_o > 2f$) produces an image that is:",
      options: [
        "Virtual, upright, and magnified",
        "Real, inverted, and reduced in size",
        "Real, upright, and equal in size",
        "Formed at optical infinity"
      ],
      correctIndex: 1,
      explanation: "From 1/f = 1/d_o + 1/d_i, when d_o > 2f, the image is real, inverted, located between f and 2f, and diminished."
    },
    {
      id: "q4",
      question: "A Keplerian astronomical telescope has an objective lens with focal length $f_{\\text{obj}} = 80\\text{ cm}$ and an eyepiece with $f_{\\text{eye}} = 4\\text{ cm}$. Under confocal afocal alignment, what is the tube separation $L$ and angular magnification $M$?",
      options: [
        "L = 84 cm, M = -20× (inverted)",
        "L = 76 cm, M = +20× (upright)",
        "L = 320 cm, M = -0.05× (reduced)",
        "L = 40 cm, M = -4× (inverted)"
      ],
      correctIndex: 0,
      explanation: "In an afocal Keplerian refractor, the lenses are confocal with tube length L = f_obj + f_eye = 80 + 4 = 84 cm, and angular magnification is M = -f_obj / f_eye = -80 / 4 = -20× (producing an inverted image)."
    },
    {
      id: "q5",
      question: "When monochromatic laser light of wavelength $\\lambda = 532\\text{ nm}$ illuminates a transmission diffraction grating with $600\\text{ lines/mm}$, the first-order ($m = 1$) diffracted beam angle $\\theta_1$ is given by:",
      options: [
        "θ₁ ≈ 18.6° from d · sin(θ) = mλ",
        "θ₁ ≈ 35.8° from Snell's law",
        "θ₁ ≈ 9.2° from Bragg's law",
        "θ₁ ≈ 45.0° from Brewster's angle"
      ],
      correctIndex: 0,
      explanation: "Grating spacing d = 1 mm / 600 = 1.667 × 10⁻⁶ m. Using d · sin(θ₁) = 1 · λ, sin(θ₁) = 532 × 10⁻⁹ / 1.667 × 10⁻⁶ ≈ 0.3192, yielding θ₁ = arcsin(0.3192) ≈ 18.61°."
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
  ],

  vsepr: [
    {
      id: "q1",
      question: "According to Valence Shell Electron Pair Repulsion (VSEPR) theory, molecular geometry is determined by:",
      options: [
        "Maximizing attractive electrostatic forces between core electrons",
        "Minimizing electrostatic repulsion between valence electron pairs to attain lowest potential energy",
        "The atomic mass of the central nucleus",
        "The ambient temperature of the laboratory environment"
      ],
      correctIndex: 1,
      explanation: "Valence electron pairs (bonding and non-bonding lone pairs) repel each other electrostatically and orient themselves as far apart as possible in 3D space."
    },
    {
      id: "q2",
      question: "A molecule with 4 electron bonding domains and 0 lone pairs on its central atom (e.g. CH₄) assumes which molecular geometry and bond angle?",
      options: [
        "Square planar, 90°",
        "Tetrahedral, 109.5°",
        "Trigonal pyramidal, 107°",
        "Linear, 180°"
      ],
      correctIndex: 1,
      explanation: "Four equivalent bonding electron pairs maximize spatial separation in three dimensions by adopting a tetrahedral geometry with bond angles of 109.5°."
    },
    {
      id: "q3",
      question: "Why does water (H₂O) have a bent molecular geometry with a bond angle of ~104.5° instead of an ideal tetrahedral 109.5°?",
      options: [
        "Hydrogen nuclei attract each other strongly",
        "Unshared lone pairs are more diffuse and exert greater repulsion than bonding pairs, compressing the H-O-H angle",
        "Oxygen forms a triple covalent bond with hydrogen",
        "Water undergoes constant ionic dissociation into H⁺ and OH⁻"
      ],
      correctIndex: 1,
      explanation: "The two unshared lone pairs on oxygen occupy more space and exert stronger electron repulsion than bonding pairs, compressing the bond angle from 109.5° down to 104.5°."
    }
  ],

  waves: [
    {
      id: "q1",
      question: "In Young's double-slit experiment, bright constructive interference fringes on a distant observation screen occur when the optical path difference $\\Delta r$ satisfies:",
      options: [
        "Δr = (m + 0.5)λ",
        "$\\Delta r = m\\lambda$ (where $m = 0, \\pm 1, \\pm 2, \\dots$)",
        "$\\Delta r = \\frac{\\lambda}{4}$",
        "Δr = 0 only"
      ],
      correctIndex: 1,
      explanation: "Constructive interference occurs when wave crests align in phase, which requires an integer number of full wavelengths (path difference d sin θ = mλ)."
    },
    {
      id: "q2",
      question: "If the separation distance between the two slits ($d$) is decreased while light wavelength $\\lambda$ and screen distance $L$ remain constant, the fringe separation $\\Delta y$:",
      options: [
        "Decreases proportionally",
        "Increases (fringe spacing widens: Δy = λL / d)",
        "Remains strictly unchanged",
        "Disappears completely"
      ],
      correctIndex: 1,
      explanation: "Fringe separation is inversely proportional to slit distance (Δy = λL/d). Decreasing slit separation causes the diffraction pattern to spread out and widen."
    },
    {
      id: "q3",
      question: "Which wave phenomenon conclusively proves that light waves are transverse rather than longitudinal?",
      options: [
        "Refraction at an air-glass boundary",
        "Diffraction around an obstacle",
        "Polarization (electric field oscillations restricted to a single plane perpendicular to propagation)",
        "Dispersion through a prism"
      ],
      correctIndex: 2,
      explanation: "Polarization can only occur in transverse waves where oscillation occurs perpendicular to the direction of wave travel. Longitudinal waves cannot be polarized."
    },
    {
      id: "q4",
      question: "In single-slit Fraunhofer diffraction, the angular width of the central diffraction peak is inversely proportional to the aperture width ($a$). If the slit width $a$ is halved, the physical width of the central maximum on the observation screen ($w = 2\\lambda L / a$):",
      options: [
        "Doubles (becomes twice as wide)",
        "Halves (becomes narrower)",
        "Remains unchanged",
        "Decreases by a factor of 4"
      ],
      correctIndex: 0,
      explanation: "From w = 2λL/a, the central diffraction maximum width is inversely proportional to slit width a. Halving a exactly doubles the central peak width."
    },
    {
      id: "q5",
      question: "A wave source travels at half the speed of wave propagation ($v_s / v = 0.5$, or $\\text{Mach } 0.5$) emitting waves at frequency $f_0 = 4.0\\text{ Hz}$. What frequency is perceived by a stationary observer directly in front of the approaching source?",
      options: [
        "8.0 Hz (f_obs = f_0 / (1 - v_s/v) = 4.0 / 0.5)",
        "2.0 Hz",
        "4.0 Hz",
        "6.0 Hz"
      ],
      correctIndex: 0,
      explanation: "For an approaching source, wave crests are compressed ahead of motion, yielding f_obs = f_0 / (1 - v_s/v) = 4.0 / (1 - 0.5) = 8.0 Hz (perceived frequency doubles)."
    }
  ],

  photosynthesis: [
    {
      id: "q1",
      question: "During the light-dependent reactions of photosynthesis in the thylakoid membrane, the initial electron donor that undergoes photolysis is:",
      options: [
        "Carbon dioxide (CO₂)",
        "Water (H₂O, oxidized to produce O₂ gas, protons, and electrons)",
        "Glucose (C₆H₁₂O₆)",
        "NADPH"
      ],
      correctIndex: 1,
      explanation: "In Photosystem II, photon absorption triggers water photolysis (2 H₂O → O₂ + 4 H⁺ + 4 e⁻), replacing excited P680 reaction center electrons."
    },
    {
      id: "q2",
      question: "The proton electrochemical gradient (high [H⁺] in the thylakoid lumen) drives the synthesis of ATP across the membrane via:",
      options: [
        "Rubisco enzyme carboxylation",
        "ATP Synthase rotary photophosphorylation (chemiosmosis)",
        "Passive simple diffusion through lipid bilayer",
        "Active sodium-potassium ATPase pump"
      ],
      correctIndex: 1,
      explanation: "Protons flow down their electrochemical gradient from the thylakoid lumen to the stroma through ATP Synthase, driving the rotary phosphorylation of ADP to ATP."
    },
    {
      id: "q3",
      question: "In the light-independent Calvin cycle (stroma), which enzyme catalyzes the initial carbon fixation of CO₂ onto ribulose-1,5-bisphosphate (RuBP)?",
      options: [
        "DNA Polymerase III",
        "Rubisco (Ribulose-1,5-bisphosphate carboxylase-oxygenase)",
        "Salivary Amylase",
        "Hexokinase"
      ],
      correctIndex: 1,
      explanation: "Rubisco is the primary enzyme responsible for fixing inorganic CO₂ onto RuBP to yield 3-phosphoglycerate (3-PGA) during the first stage of the Calvin cycle."
    }
  ],

  calorimetry: [
    {
      id: "q1",
      question: "In constant-pressure calorimetry, heat released by an exothermic chemical reaction ($q_{\\text{rxn}}$) is related to solution temperature change by:",
      options: [
        "q_rxn = -(m_sol × c_sol × ΔT + C_cal × ΔT)",
        "q_rxn = m × g × h",
        "q_rxn = P × ΔV",
        "q_rxn = + (m_sol × c_sol × ΔT)"
      ],
      correctIndex: 0,
      explanation: "By conservation of energy in an insulated system, q_rxn + q_calorimeter = 0, so q_rxn = -(q_sol + q_cal) = -(m·c·ΔT + C_cal·ΔT)."
    },
    {
      id: "q2",
      question: "Mixing 50.0 mL of 1.0 M HCl with 50.0 mL of 1.0 M NaOH causes the temperature to rise from 21.0°C to 27.8°C. This enthalpy of neutralization is:",
      options: [
        "Endothermic (ΔH > 0)",
        "Exothermic (ΔH < 0, releasing heat into the aqueous solution)",
        "Isothermal (ΔH = 0)",
        "Adiabatic without thermal exchange"
      ],
      correctIndex: 1,
      explanation: "A positive temperature rise in the aqueous surroundings signifies that the chemical bond formation released heat into the solvent, meaning ΔH_rxn is negative (exothermic)."
    },
    {
      id: "q3",
      question: "Specific heat capacity (c) is scientifically defined as:",
      options: [
        "Total heat contained within a substance at absolute zero",
        "Amount of heat energy required to raise the temperature of 1 gram of a substance by 1°C (or 1 K)",
        "Boiling point minus melting point of a pure compound",
        "Heat required to vaporize 1 mole of liquid into gas"
      ],
      correctIndex: 1,
      explanation: "Specific heat capacity is the intensive property $c = \\frac{q}{m \\cdot \\Delta T}$, measured in $\\text{J}/(\\text{g}\\cdot^\\circ\\text{C})$ or $\\text{J}/(\\text{g}\\cdot\\text{K})$."
    }
  ],

  equilibrium: [
    {
      id: "q1",
      question: "Le Chatelier's principle states that if an external disturbance (concentration, temperature, pressure) is imposed on a system at chemical equilibrium:",
      options: [
        "The reaction stops completely and irrevocably",
        "The equilibrium constant Kc immediately drops to zero",
        "The system shifts in the direction that counteracts and relieves the applied stress",
        "All reactants convert completely into products"
      ],
      correctIndex: 2,
      explanation: "A dynamic equilibrium shifts its forward or reverse rate to partially counteract any disturbance in concentration, pressure, or temperature."
    },
    {
      id: "q2",
      question: "For the endothermic gas equilibrium $\\text{N}_2\\text{O}_4\\text{ (colorless)} + \\text{heat} \\rightleftharpoons 2\\text{NO}_2\\text{ (dark brown)}$, increasing the temperature will cause:",
      options: [
        "The mixture to become darker brown as equilibrium shifts forward toward NO₂",
        "The mixture to become colorless as equilibrium shifts toward N₂O₄",
        "No color or concentration change whatsoever",
        "The equilibrium constant Kc to decrease"
      ],
      correctIndex: 0,
      explanation: "Since the forward reaction is endothermic (absorbs heat), raising temperature shifts the equilibrium in the endothermic direction (forward), producing more brown NO₂ and increasing Kc."
    },
    {
      id: "q3",
      question: "How does adding an inert noble gas (like Argon) to a gas-phase equilibrium mixture at CONSTANT VOLUME affect the equilibrium position?",
      options: [
        "Shifts toward the side with fewer gas molecules",
        "Shifts toward the side with more gas molecules",
        "It has NO effect on equilibrium because partial pressures of reacting gases remain unchanged",
        "Doubles the value of equilibrium constant Kp"
      ],
      correctIndex: 2,
      explanation: "At constant volume, adding an inert gas increases total pressure, but does not alter the volume or partial pressures of the reactant and product gases, leaving Q and equilibrium position unchanged."
    }
  ],

  electrochem: [
    {
      id: "q1",
      question: "In a standard Daniell voltaic cell (Zn | Zn²⁺ || Cu²⁺ | Cu), oxidation occurs spontaneously at the:",
      options: [
        "Copper cathode (+)",
        "Zinc anode (-) via Zn(s) → Zn²⁺(aq) + 2e⁻",
        "Porous salt bridge glass frit",
        "Voltmeter display terminal"
      ],
      correctIndex: 1,
      explanation: "Oxidation always occurs at the anode (An Ox). Zinc is more readily oxidized than copper (E°_red = -0.76 V vs +0.34 V), so Zn dissolves to Zn²⁺ releasing electrons."
    },
    {
      id: "q2",
      question: "What is the indispensable function of the salt bridge in a galvanic electrochemical cell?",
      options: [
        "Allows direct flow of valence electrons between metallic electrodes",
        "Maintains electrical charge neutrality by allowing counter-ions to migrate into half-cells, completing the circuit",
        "Increases the cell voltage by adding extra kinetic energy",
        "Filters out unwanted precipitate crystals"
      ],
      correctIndex: 1,
      explanation: "Without a salt bridge, positive charge builds up in the anode beaker and negative charge in the cathode beaker, instantly halting current. Ions (e.g. K⁺ and NO₃⁻) flow to neutralize excess charge."
    },
    {
      id: "q3",
      question: "According to the Nernst equation ($E = E^\\circ - \\frac{RT}{nF}\\ln Q$), when the reaction quotient $Q < 1$ (reactants in excess):",
      options: [
        "Cell potential E is greater than standard potential E° (E > E°)",
        "Cell potential E drops to zero (cell is dead)",
        "Cell potential becomes negative and reverses current",
        "Standard cell potential E° is destroyed"
      ],
      correctIndex: 0,
      explanation: "When Q < 1, ln(Q) is negative, making the term - (RT/nF)ln(Q) positive. Hence, the instantaneous cell voltage E exceeds standard potential E°."
    }
  ],

  harmonic: [
    {
      id: "q1",
      question: "For an ideal mass-spring system undergoing Simple Harmonic Motion (SHM), the period of oscillation $T$ is given by:",
      options: [
        "$T = 2\\pi \\sqrt{\\frac{m}{k}}$",
        "$T = 2\\pi \\sqrt{\\frac{k}{m}}$",
        "$T = 2\\pi \\sqrt{\\frac{L}{g}}$",
        "$T = \\frac{1}{2} k A^2$"
      ],
      correctIndex: 0,
      explanation: "The angular frequency is ω = √(k/m). Since T = 2π/ω, the period is T = 2π√(m/k). Period increases with mass m and decreases with spring stiffness k."
    },
    {
      id: "q2",
      question: "At the points of maximum displacement ($x = +A$ or $x = -A$) in simple harmonic motion:",
      options: [
        "Kinetic energy is maximized and potential energy is zero",
        "Velocity is zero, while acceleration and restoring force reach maximum magnitude",
        "Restoring force is zero and velocity is maximized",
        "Total mechanical energy drops to zero"
      ],
      correctIndex: 1,
      explanation: "At turning points (x = ±A), velocity instantaneously passes through zero (v = 0). By Hooke's law F = -kx, restoring force and acceleration (a = -ω²x) are at absolute maxima."
    },
    {
      id: "q3",
      question: "If the suspended mass on a Hooke's spring oscillator is increased by a factor of 4, the oscillation frequency $f$ will:",
      options: [
        "Double (2×)",
        "Quadruple (4×)",
        "Halve (f' = ½ f)",
        "Remain strictly unchanged"
      ],
      correctIndex: 2,
      explanation: "Frequency $f = \\frac{1}{2\\pi} \\sqrt{\\frac{k}{m}}$. Multiplying mass $m$ by 4 results in $\\sqrt{1/4} = 1/2$, so the frequency is halved."
    }
  ],

  photoelectric: [
    {
      id: "q1",
      question: "In Einstein's explanation of the photoelectric effect, the maximum kinetic energy ($\\text{KE}_{\\max}$) of ejected photoelectrons is expressed as:",
      options: [
        "KE_max = hf - Φ (where hf is photon energy and Φ is the metal work function)",
        "$\\text{KE}_{\\max} = \\frac{1}{2} m c^2$",
        "KE_max = h / λ",
        "KE_max = q · V_stopping + hf"
      ],
      correctIndex: 0,
      explanation: "Energy conservation dictates that absorbed photon energy (hf) is consumed first to liberate the electron (work function Φ), with any surplus manifesting as maximum kinetic energy KE_max."
    },
    {
      id: "q2",
      question: "If incident light has a frequency lower than the metal's threshold frequency ($f < f_0$):",
      options: [
        "Electrons are emitted with very low kinetic energy",
        "Electrons are emitted only if the light is extremely bright (high intensity)",
        "No photoelectrons are emitted, regardless of light intensity or illumination duration",
        "Electrons are emitted after several hours of heat absorption"
      ],
      correctIndex: 2,
      explanation: "Photoelectric emission is a single-photon single-electron quantum interaction. If photon energy hf < Φ, no single photon possesses enough energy to overcome the binding energy, so zero emission occurs."
    },
    {
      id: "q3",
      question: "When incident light frequency is kept constant above threshold (f > f₀), increasing light intensity (brightness) will:",
      options: [
        "Increase electron maximum kinetic energy KE_max",
        "Increase the stopping potential V_stop",
        "Increase the number of photoelectrons emitted per second (photocurrent), while KE_max remains constant",
        "Decrease the electron velocity"
      ],
      correctIndex: 2,
      explanation: "Higher intensity means more photons per second, yielding a higher rate of ejected electrons (photocurrent). Since photon energy hf is unchanged, maximum kinetic energy KE_max is identical."
    }
  ],

  magnetism: [
    {
      id: "q1",
      question: "The magnetic Lorentz force acting on a charged particle moving with velocity v through magnetic field B is F = q(v × B). The direction of F is:",
      options: [
        "Parallel to the velocity vector v",
        "Parallel to the magnetic field vector B",
        "Perpendicular to both the velocity vector v and the magnetic field vector B",
        "Always directed toward the magnetic North pole"
      ],
      correctIndex: 2,
      explanation: "The vector cross product (v × B) produces a vector strictly perpendicular to the plane formed by v and B (determined by the right-hand rule, or left-hand for negative electrons)."
    },
    {
      id: "q2",
      question: "In the e/m fine-beam tube experiment, an electron enters a uniform magnetic field perpendicular to its velocity. Why does it follow a circular path?",
      options: [
        "Magnetic force does work and accelerates the particle along its path",
        "The constant magnetic force is always perpendicular to velocity, acting as a pure centripetal force (qvB = mv²/r) without changing particle speed",
        "Gravity pulls the electron downward",
        "Electrostatic repulsion from the glass walls pushes it inward"
      ],
      correctIndex: 1,
      explanation: "Because F is always perpendicular to v, F · v = 0. The magnetic field does zero work on the particle; it changes only direction, producing uniform circular motion with radius $r = \\frac{mv}{qB}$."
    },
    {
      id: "q3",
      question: "If the accelerating potential V in the electron gun is doubled while magnetic field B remains constant, the circular orbit radius r will:",
      options: [
        "Double (2×)",
        "Increase by a factor of √2 (≈ 1.414×)",
        "Halve (½×)",
        "Remain completely unchanged"
      ],
      correctIndex: 1,
      explanation: "Kinetic energy is ½ mv² = eV, so v = √(2eV/m). The radius is r = mv / (eB) = (1/B) √(2mV/e). Hence, r is proportional to √V. Doubling V increases r by √2."
    }
  ],

  enzymes: [
    {
      id: "q1",
      question: "In Michaelis-Menten enzyme kinetics, the Michaelis constant ($K_m$) represents:",
      options: [
        "The maximum catalytic velocity at infinite substrate",
        "The substrate concentration [S] at which the initial reaction velocity reaches half of Vmax (V₀ = ½ Vmax)",
        "The turnover number k_cat of the active site",
        "The optimal pH of the reaction buffer"
      ],
      correctIndex: 1,
      explanation: "Km = [S] at ½ Vmax. A lower Km indicates higher enzyme affinity for the substrate, because less substrate is required to achieve half-saturation."
    },
    {
      id: "q2",
      question: "How does a competitive inhibitor influence the kinetic parameters Vmax and Km of an enzyme?",
      options: [
        "Increases apparent Km while leaving Vmax unchanged",
        "Decreases both Vmax and Km",
        "Decreases Vmax while leaving Km unchanged",
        "Increases both Vmax and Km"
      ],
      correctIndex: 0,
      explanation: "A competitive inhibitor binds reversibly to the active site. High substrate concentrations can outcompete the inhibitor, so Vmax is still reachable, but a higher substrate concentration is needed, increasing apparent Km."
    },
    {
      id: "q3",
      question: "Heating an enzyme far above its optimal temperature (~55°C-70°C) causes reaction rate to collapse to zero because:",
      options: [
        "Substrate molecules break down instantly into atoms",
        "Thermal agitation disrupts hydrogen bonds and hydrophobic interactions, denaturing the active site's 3D tertiary structure",
        "Activation energy drops to zero",
        "Water molecules freeze and stop molecular diffusion"
      ],
      correctIndex: 1,
      explanation: "Enzymes are globular proteins whose catalytic function depends on precise tertiary folding. Excess thermal energy denatures the enzyme, destroying the catalytic active site cleft."
    }
  ],

  respiration: [
    {
      id: "q1",
      question: "In aerobic cellular respiration, what is the ultimate terminal electron acceptor in the mitochondrial electron transport chain?",
      options: [
        "NAD⁺",
        "Molecular oxygen (O₂), which combines with electrons and protons to form H₂O",
        "Pyruvate",
        "Carbon dioxide (CO₂)"
      ],
      correctIndex: 1,
      explanation: "At Complex IV (cytochrome c oxidase), electrons are transferred to O₂, which reacts with 4 H⁺ to form 2 H₂O. Without O₂, the electron transport chain backs up."
    },
    {
      id: "q2",
      question: "In a micro-respirometer measuring oxygen consumption of germinating peas, why are potassium hydroxide (KOH) pellets placed at the bottom of the vial?",
      options: [
        "To provide potassium mineral nutrients to the peas",
        "To absorb all CO₂ gas produced by cellular respiration, ensuring that volume reduction directly measures net O₂ consumed",
        "To generate oxygen gas chemically",
        "To regulate temperature and prevent overheating"
      ],
      correctIndex: 1,
      explanation: "Germinating peas consume O₂ and release CO₂ at approximately a 1:1 molar ratio. KOH reacts with CO₂ (2 KOH + CO₂ → K₂CO₃ + H₂O), forming a solid precipitate so that gas volume drops solely from O₂ consumption."
    },
    {
      id: "q3",
      question: "During anaerobic alcoholic fermentation in yeast cells, pyruvate is converted into:",
      options: [
        "Lactic acid and oxygen",
        "Ethanol (C₂H₅OH) and carbon dioxide (CO₂), regenerating NAD⁺ for glycolysis",
        "Acetyl-CoA and citric acid",
        "Glucose and water"
      ],
      correctIndex: 1,
      explanation: "In the absence of oxygen, yeast decarboxylates pyruvate to acetaldehyde releasing CO₂, then reduces acetaldehyde to ethanol to regenerate NAD⁺ so glycolysis can continue generating 2 ATP per glucose."
    }
  ],

  beerlambert: [
    {
      id: "q1",
      question: "According to the Beer-Lambert Law ($A = \\varepsilon \\cdot b \\cdot c$), what is the mathematical relationship between optical absorbance $A$ and molar concentration $c$?",
      options: [
        "Inversely proportional (hyperbolic)",
        "Directly proportional (linear relationship with zero intercept)",
        "Exponential decay",
        "Logarithmic saturation"
      ],
      correctIndex: 1,
      explanation: "The Beer-Lambert Law states $A = \\varepsilon \\cdot b \\cdot c$. Absorbance is directly proportional to both path length ($b$) and molar concentration ($c$), yielding a linear calibration plot with $\\text{slope} = \\varepsilon \\cdot b$."
    },
    {
      id: "q2",
      question: "If a chemical solution transmits exactly 10% of incident light (T = 0.10) in a spectrophotometer cuvette, what is its optical absorbance A?",
      options: [
        "A = 0.100",
        "A = 1.000",
        "A = 2.000",
        "A = 0.000"
      ],
      correctIndex: 1,
      explanation: "Absorbance is defined as $A = -\\log_{10}(T)$. For $T = 0.10$ (10% transmittance), $A = -\\log_{10}(0.10) = 1.000$."
    },
    {
      id: "q3",
      question: "Why are spectrophotometric absorbance measurements performed at λ_max (the analytical peak absorption wavelength of the solute)?",
      options: [
        "Because light travels fastest at that wavelength",
        "To maximize analytical sensitivity and minimize error from slight wavelength calibration drift",
        "To prevent photochemical decomposition of the solvent",
        "Because molar absorptivity ε is at its minimum at λ_max"
      ],
      correctIndex: 1,
      explanation: "At λ_max, molar absorptivity ε reaches its peak value. This yields the greatest change in absorbance per unit concentration (maximum sensitivity) and ensures that minor instrumental wavelength drift produces negligible error."
    }
  ],

  decay: [
    {
      id: "q1",
      question: "Which type of nuclear decay radiation possesses the highest ionizing power but can be completely arrested by a single sheet of paper or human epidermis?",
      options: [
        "Gamma rays (γ photons)",
        "Beta-minus (β⁻ electrons)",
        "Alpha particles (α, helium-4 nuclei ⁴₂He²⁺)",
        "Neutron radiation"
      ],
      correctIndex: 2,
      explanation: "Alpha particles consist of two protons and two neutrons (⁴₂He²⁺). Due to their high mass and +2 charge, they interact strongly with matter and have high ionizing power but extremely short penetration depths."
    },
    {
      id: "q2",
      question: "A radioisotope with a half-life of 8.0 days exhibits an initial activity of 800 CPM. What will its measured activity be after 24.0 days?",
      options: [
        "400 CPM",
        "200 CPM",
        "100 CPM",
        "50 CPM"
      ],
      correctIndex: 2,
      explanation: "24.0 days corresponds to exactly 3 half-lives (24 / 8 = 3). After 3 half-lives, activity drops to (1/2)³ = 1/8 of original: 800 / 8 = 100 CPM."
    },
    {
      id: "q3",
      question: "In nuclear beta-minus (β⁻) emission, what fundamental subatomic nucleon transformation takes place within the radioactive nucleus?",
      options: [
        "A proton converts into an alpha particle",
        "A neutron transforms into a proton, emitting an electron and an electron antineutrino",
        "An electron is captured by the nucleus",
        "Two protons fuse into a deuteron"
      ],
      correctIndex: 1,
      explanation: "In β⁻ decay, weak interaction converts a down quark to an up quark: n → p + e⁻ + ν̄_e. The mass number A remains constant while atomic number Z increases by 1."
    }
  ],

  colligative: [
    {
      id: "q1",
      question: "Why does a 1.0 m aqueous solution of CaCl₂ produce approximately 1.5 times the freezing point depression of a 1.0 m solution of NaCl?",
      options: [
        "Calcium is heavier than sodium",
        "CaCl₂ dissociates into 3 ions (Ca²⁺ + 2 Cl⁻, i ≈ 3) while NaCl yields 2 ions (Na⁺ + Cl⁻, i ≈ 2)",
        "CaCl₂ has a higher heat capacity",
        "Water molecules bind more tightly to chloride than sodium"
      ],
      correctIndex: 1,
      explanation: "Colligative properties depend on the total number of dissolved solute particles. CaCl₂ releases 3 particles per formula unit (van 't Hoff i ≈ 3), producing 1.5× the colligative effect of NaCl (i ≈ 2)."
    },
    {
      id: "q2",
      question: "During the cooling curve of a pure liquid solvent, why does the temperature plateau (remain constant) at the freezing point despite continuous heat extraction?",
      options: [
        "Specific heat capacity suddenly drops to zero",
        "Latent heat of fusion is released as solvent molecules organize into the crystalline solid lattice",
        "The cryogenic bath stops cooling",
        "Molecular kinetic energy increases"
      ],
      correctIndex: 1,
      explanation: "Phase transitions occur at constant temperature. As liquid transitions to solid, latent heat of fusion (ΔH_fus) is liberated, balancing external heat extraction until crystallization is complete."
    },
    {
      id: "q3",
      question: "Colligative properties of a solution ($\\Delta T_f$, $\\Delta T_b$, osmotic pressure $\\Pi$) depend strictly upon:",
      options: [
        "The chemical reactivity and color of the solute",
        "The ratio of the number of solute particles to the number of solvent molecules, independent of chemical identity",
        "The atmospheric pressure alone",
        "The acidity (pH) of the solution"
      ],
      correctIndex: 1,
      explanation: "By definition, colligative properties depend only on the concentration of solute particles (ions or molecules) in a given mass or volume of solvent, not on the identity or chemical properties of the solute."
    }
  ],

  organic: [
    {
      id: "q1",
      question: "In an S_N2 nucleophilic substitution reaction on a chiral electrophilic carbon center, what stereochemical outcome is observed?",
      options: [
        "Complete retention of configuration",
        "Racemization (50% retention, 50% inversion)",
        "Complete inversion of configuration via backside attack (Walden inversion)",
        "Formation of a meso compound"
      ],
      correctIndex: 2,
      explanation: "S_N2 is a concerted, single-step bimolecular mechanism where the nucleophile attacks the carbon atom from the side opposite to the leaving group (backside attack), inverting the stereocenter like an umbrella in high wind."
    },
    {
      id: "q2",
      question: "Why do tertiary alkyl halides (3°) predominantly undergo substitution via the S_N1 mechanism rather than S_N2?",
      options: [
        "Steric hindrance prevents backside nucleophilic attack, and the tertiary carbocation intermediate is highly stabilized by hyperconjugation and inductive effects",
        "Tertiary alkyl halides are nonpolar and cannot react with nucleophiles",
        "S_N1 reactions do not require a leaving group",
        "Primary carbocations are more stable than tertiary carbocations"
      ],
      correctIndex: 0,
      explanation: "Bulky alkyl groups sterically shield the $\\alpha$-carbon from $\\text{S}_\\text{N}2$ backside attack. Concurrently, hyperconjugation and alkyl electron-donation stabilize the $3^\\circ$ carbocation intermediate formed in the rate-determining $\\text{S}_\\text{N}1$ step."
    },
    {
      id: "q3",
      question: "In a reaction coordinate diagram (Gibbs free energy vs. reaction progress), what physical state corresponds to the maximum peak of the energy curve ($\\Delta G^\\ddagger$)?",
      options: [
        "A long-lived reaction intermediate",
        "The activated transition state, featuring partially formed and partially broken bonds",
        "The ground-state product",
        "The catalyst-inhibitor complex"
      ],
      correctIndex: 1,
      explanation: "The energy peak corresponds to the transition state (‡), a transient molecular geometry with highest potential energy containing partially broken and partially formed bonds."
    }
  ],

  electrophoresis: [
    {
      id: "q1",
      question: "Why do DNA and RNA nucleic acid fragments migrate toward the positive anode (+) during agarose gel electrophoresis?",
      options: [
        "Because nitrogenous bases carry positive charges",
        "Because the repeating phosphodiester sugar-phosphate backbone confers a uniform negative charge at physiological pH",
        "Because of magnetic attraction by the electrodes",
        "Because agarose gel pushes nucleic acids toward the bottom"
      ],
      correctIndex: 1,
      explanation: "The phosphate groups in DNA's backbone are fully ionized and negatively charged at neutral/basic running buffer pH (8.0-8.3). Therefore, DNA experiences an electrostatic force pulling it toward the positive electrode (anode)."
    },
    {
      id: "q2",
      question: "In a standard agarose sieving matrix, how does DNA fragment length (in base pairs) correlate with migration distance from the wells?",
      options: [
        "Longer fragments migrate further because they have more charge",
        "Migration distance is inversely proportional to the logarithm of base-pair length ($D \\propto \\frac{1}{\\log_{10}(\\text{bp})}$)",
        "All fragments migrate at identical speeds regardless of size",
        "Migration distance is directly proportional to DNA mass"
      ],
      correctIndex: 1,
      explanation: "Because the charge-to-mass ratio of DNA is constant, migration through the gel is governed strictly by molecular sieving: smaller fragments maneuver through agarose pores more easily, migrating inversely to log₁₀(bp)."
    },
    {
      id: "q3",
      question: "When resolving small DNA PCR fragments between 100 bp and 600 bp, which agarose gel concentration provides the highest analytical resolution?",
      options: [
        "0.7% agarose gel (large pores)",
        "2.0% agarose gel (dense polymer matrix with fine pores)",
        "0.2% agarose gel",
        "Pure water without agarose"
      ],
      correctIndex: 1,
      explanation: "Higher agarose concentrations (e.g. 1.8% - 2.0%) create smaller pores in the polymeric gel matrix, which increases friction and separation resolution for low-molecular-weight DNA fragments."
    }
  ],

  ecology: [
    {
      id: "q1",
      question: "In the Lotka-Volterra predator-prey model, why does the predator population curve exhibit an oscillatory time lag behind the prey population curve?",
      options: [
        "Predators migrate away from the ecosystem in summer",
        "Predator reproductive growth depends on consuming prey; abundant prey increases predator births, which later overconsume prey and cause a collapse",
        "Prey reproduce only after predators die",
        "Solar cycles dictate predator birth rates"
      ],
      correctIndex: 1,
      explanation: "Prey abundance fuels predator nutrition and reproduction with a biological delay (gestation/maturation). As predator numbers surge, predation pressure drives prey down, leading to food scarcity and subsequent predator decline."
    },
    {
      id: "q2",
      question: "How does the introduction of a finite carrying capacity K modify exponential population growth in logistic ecological models?",
      options: [
        "It forces the population to zero immediately",
        "Per-capita population growth rate declines linearly as population size N approaches K, stabilizing at an equilibrium plateau",
        "It eliminates natural mortality",
        "It doubles the intrinsic growth rate r"
      ],
      correctIndex: 1,
      explanation: "The logistic term (1 - N/K) reflects density-dependent environmental resistance (resource limitation, territory, disease). As N approaches carrying capacity K, net population growth dN/dt slows to zero."
    },
    {
      id: "q3",
      question: "What ecological phenomenon often occurs when an apex keystone predator is extirpated (completely removed) from a balanced ecosystem?",
      options: [
        "Total biodiversity immediately multiplies",
        "Trophic cascade with secondary prey irruption, overconsumption of primary vegetation, and eventual biodiversity collapse",
        "Prey species voluntarily stop reproducing",
        "Plants become carnivores"
      ],
      correctIndex: 1,
      explanation: "Removing a keystone predator triggers a top-down trophic cascade: herbivore prey populations irrupt unchecked, overgrazing primary producers and devastating habitat architecture and overall biodiversity."
    }
  ],

  actionpotential: [
    {
      id: "q1",
      question: "What biophysical mechanism triggers the rapid rising phase (depolarization) of an action potential once the threshold potential (-55 mV) is reached?",
      options: [
        "Massive outflow of potassium ions (K⁺)",
        "Synchronous opening of the m-activation gates of voltage-gated Na⁺ channels, causing massive inward Na⁺ current down its electrochemical gradient",
        "Pumping of calcium into the mitochondria",
        "Closure of all leak channels"
      ],
      correctIndex: 1,
      explanation: "Reaching threshold voltage induces a conformational change in voltage-gated Na⁺ channels: their activation (m) gates rapidly open, generating a regenerative inward positive feedback loop of Na⁺ influx."
    },
    {
      id: "q2",
      question: "How does the neurotoxin Tetrodotoxin (TTX, from pufferfish) affect electrophysiological action potentials in nerve axons?",
      options: [
        "It enhances neurotransmitter release indefinitely",
        "It selectively plugs the extracellular pore of voltage-gated Na⁺ channels, completely abolishing the depolarization phase of action potentials",
        "It blocks K⁺ channels, prolonging the action potential",
        "It increases resting membrane potential to +50 mV"
      ],
      correctIndex: 1,
      explanation: "TTX binds with high affinity to the outer vestibule of voltage-gated Na⁺ channels, blocking Na⁺ conductance and completely inhibiting action potential generation without directly affecting resting K⁺ channels."
    },
    {
      id: "q3",
      question: "During the absolute refractory period of a neuron, why is it physiologically impossible to evoke a second action potential regardless of stimulus magnitude?",
      options: [
        "The neuron has run out of intracellular ATP",
        "Voltage-gated Na⁺ channels are locked in their closed inactivation (h-gate) conformation and cannot reopen until the membrane repolarizes",
        "The axon membrane has ruptured",
        "Extracellular Na⁺ has been completely depleted"
      ],
      correctIndex: 1,
      explanation: "Following peak depolarization, voltage-gated Na⁺ channels undergo inactivation gate (h-gate) closure. Until the membrane potential repolarizes sufficiently to relieve inactivation, no amount of stimulus current can open them."
    }
  ],

  rotational: [
    {
      id: "q1",
      question: "A solid sphere ($I = \\frac{2}{5}MR^2$) and a hollow hoop ($I = MR^2$) of identical mass $M$ and radius $R$ race down an inclined plane from rest without slipping. Which reaches the bottom first?",
      options: [
        "The hollow hoop, because its mass is concentrated at the rim",
        "The solid sphere, because a lower fraction of its potential energy is allocated to rotational kinetic energy, leaving more for translational velocity",
        "Both arrive at the exact same instant",
        "The object with greater diameter"
      ],
      correctIndex: 1,
      explanation: "Linear acceleration down an incline is $a = \\frac{g \\sin\\theta}{1 + I/(MR^2)}$. For the sphere, $I/(MR^2) = 0.40$, giving $a = 0.714 g \\sin\\theta$. For the hoop, $I/(MR^2) = 1.00$, giving $a = 0.500 g \\sin\\theta$. The sphere accelerates faster and wins the race."
    },
    {
      id: "q2",
      question: "For a rigid cylinder rolling down an incline without slipping, what force exerts the net torque about the center of mass that produces angular acceleration?",
      options: [
        "The normal force perpendicular to the incline",
        "Static friction directed up the ramp at the contact point",
        "Gravitational pull acting at the center of mass",
        "Air resistance"
      ],
      correctIndex: 1,
      explanation: "Normal force and gravity act through the center of mass, producing zero torque. Static friction acts at the contact point at radius R, producing the net torque τ = f_s·R = I·α necessary for rolling without slipping."
    },
    {
      id: "q3",
      question: "A rotating figure skater pulls their outstretched arms inward toward their rotation axis. If net external torque is zero, what happens to their angular momentum L and rotational kinetic energy?",
      options: [
        "Both angular momentum and kinetic energy decrease",
        "Angular momentum L remains strictly conserved, while rotational kinetic energy increases because work was done to pull arms inward",
        "Angular momentum increases while angular velocity decreases",
        "Moment of inertia increases"
      ],
      correctIndex: 1,
      explanation: "With zero external torque, angular momentum $L = I \\omega$ is conserved. Pulling mass inward reduces $I$, increasing $\\omega$. Because $\\text{KE}_{\\text{rot}} = \\frac{L^2}{2I}$, reducing $I$ increases kinetic energy; the extra energy comes from mechanical work done by skater muscles."
    }
  ],

  conduction: [
    {
      id: "q1",
      question: "According to Fourier's Law of 1D Heat Conduction (dQ/dt = k·A·ΔT / L), doubling the thickness (length L) of an insulating slab while keeping surface temperatures fixed will:",
      options: [
        "Double the rate of heat transfer",
        "Halve the rate of heat transfer (dQ/dt)",
        "Leave the heat transfer rate unchanged",
        "Quadruple the thermal conductivity k"
      ],
      correctIndex: 1,
      explanation: "Heat conduction rate $\\frac{dQ}{dt}$ is inversely proportional to rod/wall thickness $L$. Doubling $L$ doubles thermal resistance $R_{\\text{th}} = \\frac{L}{k A}$, reducing conductive heat flux by 50%."
    },
    {
      id: "q2",
      question: "Why do metallic conductors such as copper (k ≈ 398 W/m·K) exhibit thermal conductivities hundreds of times higher than wood or glass?",
      options: [
        "Metals are denser and absorb more photons",
        "Metals possess a sea of highly mobile free conduction electrons that rapidly transport thermal kinetic energy through the crystal lattice",
        "Wood and glass are at absolute zero",
        "Metals do not vibrate when heated"
      ],
      correctIndex: 1,
      explanation: "In non-metals, heat conducts solely via lattice vibrations (phonons). In metals, both phonons and high-velocity delocalized valence electrons transfer kinetic energy, resulting in extraordinarily high thermal conductivity."
    },
    {
      id: "q3",
      question: "Under steady-state 1D heat conduction through a uniform cylindrical metal rod with insulated lateral sides connecting hot and cold reservoirs, the temperature gradient (dT/dx) along the rod is:",
      options: [
        "Parabolic with a maximum in the center",
        "Strictly constant, producing a linear decline in temperature from T_hot to T_cold",
        "Exponential decay",
        "Fluctuating sinusoidally"
      ],
      correctIndex: 1,
      explanation: "Under steady-state conditions without internal heat generation and with insulated walls, heat flux $\\frac{dQ}{dt}$ must be uniform across every cross section: $\\frac{dQ}{dt} = -k A \\frac{dT}{dx} = \\text{const}$. Therefore, $\\frac{dT}{dx}$ is constant, yielding a linear profile."
    }
  ],

  fluids: [
    {
      id: "q1",
      question: "According to Archimedes' Principle, the magnitude of the buoyant force ($F_b$) exerted on a completely or partially submerged object equals:",
      options: [
        "The total weight of the submerged solid object",
        "The weight of the fluid volume displaced by the submerged portion of the object ($F_b = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g$)",
        "The atmospheric pressure on the fluid surface",
        "The surface tension of the fluid"
      ],
      correctIndex: 1,
      explanation: "Archimedes' Principle states that any body immersed in fluid experiences an upward buoyant force equal to the weight of fluid it displaces: $F_b = m_{\\text{disp}} \\cdot g = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g$."
    },
    {
      id: "q2",
      question: "In a horizontal Venturi flow tube, as an incompressible fluid flows from a wide section into a narrow throat constriction, what happens to flow velocity $v$ and static pressure $P$?",
      options: [
        "Velocity decreases and pressure increases",
        "Velocity increases by continuity ($A_1 v_1 = A_2 v_2$), causing static pressure $P$ to decrease according to Bernoulli's principle",
        "Both velocity and pressure remain constant",
        "Both velocity and pressure increase"
      ],
      correctIndex: 1,
      explanation: "By mass continuity, fluid must accelerate in the constricted area ($v_2 > v_1$). By Bernoulli's equation ($P + \\frac{1}{2}\\rho v^2 = \\text{const}$), an increase in kinetic energy density requires a corresponding drop in static pressure ($P_2 < P_1$)."
    },
    {
      id: "q3",
      question: "A solid metal block of volume 2.0 L ($0.002\\text{ m}^3$) and mass 5.0 kg is completely submerged in pure water ($\\rho = 1000\\text{ kg/m}^3$). What is its apparent weight measured by a submerged spring scale?",
      options: [
        "49.05 N",
        "19.62 N",
        "29.43 N",
        "0.00 N (it floats)"
      ],
      correctIndex: 2,
      explanation: "True weight $W = m \\cdot g = 5.0\\text{ kg} \\times 9.81\\text{ m/s}^2 = 49.05\\text{ N}$. Buoyant force $F_b = \\rho \\cdot V \\cdot g = 1000\\text{ kg/m}^3 \\times 0.002\\text{ m}^3 \\times 9.81\\text{ m/s}^2 = 19.62\\text{ N}$. Apparent weight $W_{\\text{app}} = W - F_b = 49.05\\text{ N} - 19.62\\text{ N} = 29.43\\text{ N}$."
    },
    {
      id: "q4",
      question: "According to Torricelli's Law, at what vertical orifice height $y$ along an open cylindrical liquid tank of total liquid depth $H$ will the discharged fluid jet achieve its maximum horizontal landing range ($R_{\\max} = H$)?",
      options: [
        "At the very bottom of the tank ($y = 0$)",
        "At exactly half the total liquid depth ($y = \\frac{H}{2}$)",
        "At the top fluid surface ($y = H$)",
        "At three-quarters of the depth ($y = \\frac{3}{4}H$)"
      ],
      correctIndex: 1,
      explanation: "The horizontal range is given by $R = v t = \\sqrt{2g(H - y)} \\cdot \\sqrt{\\frac{2y}{g}} = 2\\sqrt{y(H - y)}$. Maximizing $y(H - y)$ yields $\\frac{d}{dy}[Hy - y^2] = H - 2y = 0 \\implies y = \\frac{H}{2}$. At this mid-depth, the efflux jet achieves maximum horizontal range $R_{\\max} = 2\\sqrt{\\frac{H}{2} \\cdot \\frac{H}{2}} = H$."
    },
    {
      id: "q5",
      question: "In a hydraulic press governed by Pascal's Principle ($P_1 = P_2$), the input piston has diameter $D_1 = 4.0\\text{ cm}$ and the slave output piston has diameter $D_2 = 20.0\\text{ cm}$. What input force $F_1$ is required to lift a load of $15,000\\text{ N}$?",
      options: [
        "3,000 N",
        "600 N",
        "150 N",
        "60 N"
      ],
      correctIndex: 1,
      explanation: "Ideal Mechanical Advantage $\\text{IMA} = \\frac{A_2}{A_1} = \\left(\\frac{D_2}{D_1}\\right)^2 = \\left(\\frac{20}{4}\\right)^2 = 5^2 = 25$. Therefore, the required input force is $F_1 = \\frac{F_2}{\\text{IMA}} = \\frac{15,000\\text{ N}}{25} = 600\\text{ N}$."
    }
  ],

  anatomy: [
    {
      id: "q1",
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
      id: "q2",
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
      id: "q3",
      question: "Which cranial nerve provides primary parasympathetic innervation to the thoracic viscera (slowing heart rate) and abdominal digestive organs?",
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
      id: "q4",
      question: "During muscle contraction according to the sliding filament theory, what molecular event directly causes the myosin cross-bridge head to detach from actin?",
      options: [
        "Release of inorganic phosphate (Pi) from the myosin head",
        "Binding of a new ATP molecule to the nucleotide binding site on the myosin head",
        "Hydrolysis of ATP into ADP and Pi",
        "Re-uptake of calcium ions back into the sarcoplasmic reticulum"
      ],
      correctIndex: 1,
      explanation: "ATP binding allosterically lowers the affinity of the myosin cross-bridge head for actin, triggering immediate detachment. In the absence of ATP (as after death), detachment cannot occur, resulting in rigor mortis."
    }
  ],

  kinetics: [
    {
      id: "q1",
      question: "According to collision theory and the Arrhenius equation ($k = A e^{-E_a/(RT)}$), adding a positive catalyst like $\\text{MnO}_2$ accelerates a chemical reaction primarily by:",
      options: [
        "Increasing the average kinetic energy of the reactant molecules",
        "Providing an alternative reaction pathway with a lower activation energy (Ea)",
        "Increasing the stoichiometric equilibrium constant K_eq",
        "Shifting the overall reaction enthalpy $\\Delta H$ to a more exothermic value"
      ],
      correctIndex: 1,
      explanation: "A catalyst provides an alternative mechanism or transition state with lower activation energy ($E_a$), allowing a significantly higher fraction of molecular collisions to possess sufficient energy to react, without altering $\\Delta H$ or $K_{\\text{eq}}$."
    },
    {
      id: "q2",
      question: "For a reaction with rate law $\\text{Rate} = k[\\text{A}]^2[\\text{B}]^0$, if the concentration of $[\\text{A}]$ is tripled while $[\\text{B}]$ is doubled, the instantaneous reaction rate will:",
      options: [
        "Increase by a factor of 3",
        "Increase by a factor of 6",
        "Increase by a factor of 9",
        "Remain unchanged"
      ],
      correctIndex: 2,
      explanation: "The reaction is 2nd order in A and 0th order in B. Tripling $[\\text{A}]$ increases rate by $3^2 = 9$. Changing $[\\text{B}]$ has no effect because $[\\text{B}]^0 = 1$. Overall rate increases by $9\\times$."
    },
    {
      id: "q3",
      question: "In an Arrhenius plot of ln(k) versus (1/T), the slope of the resulting straight line equals:",
      options: [
        "$-\\frac{E_a}{R}$",
        "$+\\frac{E_a}{R}$",
        "$-\\frac{\\Delta H}{R}$",
        "ln(A)"
      ],
      correctIndex: 0,
      explanation: "Taking the natural logarithm of the Arrhenius equation yields $\\ln(k) = -\\left(\\frac{E_a}{R}\\right)\\left(\\frac{1}{T}\\right) + \\ln(A)$. Plotting $\\ln(k)$ vs $(1/T)$ gives a linear slope $m = -\\frac{E_a}{R}$."
    }
  ],

  collisions: [
    {
      id: "q1",
      question: "In any isolated physical system with zero net external forces ($\\Sigma \\vec{F}_{\\text{ext}} = 0$), what quantity is strictly conserved during all collisions, whether elastic or inelastic?",
      options: [
        "Total mechanical kinetic energy only",
        "Total linear vector momentum ($\\Sigma \\vec{p} = m_1 \\vec{v}_1 + m_2 \\vec{v}_2 = \\text{const}$)",
        "The relative speed of separation",
        "Total potential energy only"
      ],
      correctIndex: 1,
      explanation: "By Newton's third law and the impulse-momentum theorem, internal forces sum to zero in an isolated system. Total vector linear momentum is always conserved in every collision, regardless of elasticity."
    },
    {
      id: "q2",
      question: "In a perfectly inelastic collision (coefficient of restitution $e = 0.0$) between two gliders on a frictionless air track:",
      options: [
        "Kinetic energy is completely conserved with zero loss",
        "The gliders stick together and move with a common final velocity",
        "The gliders rebound with equal and opposite velocities",
        "The momentum of each individual glider is conserved"
      ],
      correctIndex: 1,
      explanation: "In a perfectly inelastic collision (e = 0), maximum kinetic energy is dissipated into internal heat/deformation, and the colliding bodies couple or stick together, traveling with an identical final velocity $v_f = \\frac{m_1 u_1 + m_2 u_2}{m_1 + m_2}$."
    },
    {
      id: "q3",
      question: "A 0.50 kg glider moving at +2.0 m/s undergoes a perfectly elastic collision (e = 1.0) with an identical stationary 0.50 kg glider (m₁ = m₂, u₂ = 0). What are the final velocities?",
      options: [
        "$v_1 = 0.0\\text{ m/s}$ and $v_2 = +2.0\\text{ m/s}$ (complete velocity transfer)",
        "v₁ = +1.0 m/s and v₂ = +1.0 m/s",
        "v₁ = -1.0 m/s and v₂ = +1.0 m/s",
        "v₁ = -2.0 m/s and v₂ = 0.0 m/s"
      ],
      correctIndex: 0,
      explanation: "For equal masses in a 1D perfectly elastic collision, the colliding bodies completely exchange velocities: the incident glider halts (v₁ = 0) and the target glider moves away with the incident velocity (v₂ = +2.0 m/s)."
    }
  ],

  induction: [
    {
      id: "q1",
      question: "According to Faraday's Law of Induction, the magnitude of the induced electromotive force (EMF) in a coil of N turns is directly proportional to:",
      options: [
        "The static magnetic flux $\\Phi_B$ passing through the coil",
        "The time rate of change of magnetic flux through the coil ($\\frac{d\\Phi_B}{dt}$)",
        "The total electrical resistance of the wire only",
        "The mass of the bar magnet"
      ],
      correctIndex: 1,
      explanation: "Faraday's Law states $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$. An EMF is induced ONLY when magnetic flux through the coil is changing with respect to time; a stationary magnet inside a coil induces zero voltage."
    },
    {
      id: "q2",
      question: "According to Lenz's Law, the direction of the induced current in a closed loop will always:",
      options: [
        "Align with the external magnetic field to amplify it",
        "Produce an induced magnetic field that opposes the change in magnetic flux that caused it",
        "Flow in the direction of the magnet's physical motion",
        "Create zero magnetic field"
      ],
      correctIndex: 1,
      explanation: "Lenz's Law (represented by the negative sign in $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$) is a consequence of conservation of energy: the induced current creates an opposing magnetic field that resists the flux change."
    },
    {
      id: "q3",
      question: "Inserting a ferromagnetic soft-iron core into the center of an air-core induction coil will:",
      options: [
        "Decrease the induced EMF because iron conducts electricity",
        "Significantly increase the induced EMF due to the high magnetic permeability (μ_r >> 1) concentrating magnetic flux",
        "Cancel the magnetic flux entirely",
        "Convert AC voltage into DC voltage"
      ],
      correctIndex: 1,
      explanation: "Ferromagnetic materials have high relative permeability (μ_r >> 1), which dramatically intensifies and concentrates the magnetic flux lines through the coil loops, multiplying dΦ_B/dt and the induced EMF."
    }
  ],

  osmosis: [
    {
      id: "q1",
      question: "When a human red blood cell (erythrocyte) is placed in a pure hypotonic water solution (osmolarity ~0 mOsm/L), what physiological phenomenon occurs?",
      options: [
        "Water leaves the cell, causing severe crenation and shrinkage",
        "Net osmotic influx of water causes the cell to swell and burst (osmotic hemolysis/lysis)",
        "The cell remains in dynamic equilibrium because of its cellulose cell wall",
        "Active transport pumps sodium into the extracellular fluid to prevent swelling"
      ],
      correctIndex: 1,
      explanation: "Animal cells lack a rigid cell wall. In a hypotonic environment (Ψ_ext > Ψ_cell), water flows rapidly into the erythrocyte down the water potential gradient until internal hydrostatic pressure exceeds plasma membrane tensile strength, causing hemolytic lysis."
    },
    {
      id: "q2",
      question: "According to the water potential equation (Ψ = Ψ_s + Ψ_p), water will always spontaneously move across a selectively permeable membrane from an area of:",
      options: [
        "Lower (more negative) water potential to higher water potential",
        "Higher (less negative / pure water) water potential to lower (more negative) water potential",
        "Higher solute concentration to lower solute concentration",
        "Zero pressure to high positive pressure regardless of solutes"
      ],
      correctIndex: 1,
      explanation: "Water flows spontaneously from higher water potential (closer to 0 bar, less negative) to lower water potential (more negative, higher solute concentration), down its free energy gradient."
    },
    {
      id: "q3",
      question: "When an Elodea plant cell is immersed in a concentrated hypertonic salt solution (0.50 M NaCl), the central vacuole loses water, causing the plasma membrane to pull away from the rigid cell wall. This cytological process is called:",
      options: [
        "Crenation",
        "Plasmolysis",
        "Turgor generation",
        "Hemolysis"
      ],
      correctIndex: 1,
      explanation: "Plasmolysis is the shrinking of the plant cell protoplast and detachment of the plasma membrane from the rigid cellulose cell wall caused by exosmosis in a hypertonic medium."
    }
  ],

  mitosis: [
    {
      id: "q1",
      question: "In a cytogenetics laboratory count of 100 onion root tip meristem cells, 15 are in Prophase, 8 in Metaphase, 4 in Anaphase, 3 in Telophase, and 70 in Interphase. What is the Mitotic Index (MI)?",
      options: [
        "70.0%",
        "30.0%",
        "15.0%",
        "8.0%"
      ],
      correctIndex: 1,
      explanation: "$\\text{Mitotic Index (MI)} = \\left(\\frac{\\text{Total mitotic cells}}{\\text{Total cells}}\\right) \\times 100\%$. Here, mitotic cells = $15 + 8 + 4 + 3 = 30$. Total = 100. $\\text{MI} = \\left(\\frac{30}{100}\\right) \\times 100\% = 30.0\%$."
    },
    {
      id: "q2",
      question: "During which phase of mitosis do sister chromatids disjoin at their centromeres and get pulled toward opposite spindle poles by depolymerizing kinetochore microtubules?",
      options: [
        "Prophase",
        "Metaphase",
        "Anaphase",
        "Telophase"
      ],
      correctIndex: 2,
      explanation: "Anaphase begins when cohesin protein complexes holding sister chromatids together are cleaved by separase, allowing the separated daughter chromosomes to be pulled toward opposite centrosome poles."
    },
    {
      id: "q3",
      question: "Colchicine is an antimitotic chemotherapeutic alkaloid that binds tubulin dimers and prevents microtubule polymerization. Treating actively dividing meristematic cells with colchicine arrests cells at which stage of mitosis?",
      options: [
        "Interphase G₁ phase",
        "Metaphase (at the Spindle Assembly Checkpoint)",
        "Cytokinesis cleavage",
        "Telophase nuclear reconstruction"
      ],
      correctIndex: 1,
      explanation: "Without functional spindle microtubules to generate tension on kinetochores, the Spindle Assembly Checkpoint (SAC) remains persistently active, arresting cells at the equatorial Metaphase plate."
    }
  ],

  flametest: [
    {
      id: "q1",
      question: "During a flame test, why does sodium chloride produce an intense, persistent golden-yellow flame whereas copper(II) chloride yields an emerald blue-green flame?",
      options: [
        "Sodium chloride undergoes combustion while copper chloride absorbs atmospheric oxygen",
        "Thermal energy excites outer valence electrons; when electrons drop back to lower energy orbitals, they emit photons of specific quantized wavelengths $\\Delta E = \\frac{hc}{\\lambda}$ characteristic of each element",
        "The chlorine anions emit the visible light, while metal cations merely act as inert thermal catalysts",
        "Copper chloride burns hotter than sodium chloride, shifting blackbody radiation into shorter ultraviolet wavelengths"
      ],
      correctIndex: 1,
      explanation: "Thermal excitation promotes valence electrons to higher quantized Bohr energy levels. Relaxation back to lower eigenstates emits discrete photons whose wavelength $\\lambda$ corresponds precisely to the transition energy difference $\\Delta E = \\frac{hc}{\\lambda}$."
    },
    {
      id: "q2",
      question: "Why is a cobalt blue glass filter used when performing a flame test on an unknown potassium salt?",
      options: [
        "To absorb high-energy ultraviolet radiation and protect the experimenter's retinas",
        "To absorb the intense 589 nm yellow light emitted by ubiquitous trace sodium contamination, allowing the faint lilac emission of potassium to be observed",
        "To polarize the emitted light and determine electron spin angular momentum",
        "To cool the flame temperature and prevent boiling of the wire loop"
      ],
      correctIndex: 1,
      explanation: "Cobalt glass contains Co²⁺ ions that absorb yellow light around 589 nm (sodium D-lines) while transmitting red and violet wavelengths, revealing potassium's characteristic faint lilac flame even in the presence of trace sodium."
    },
    {
      id: "q3",
      question: "A flame emission spectrometer records a sharp line at $\\lambda = 670.8\\text{ nm}$ for lithium. Using $h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$ and $c = 3.00 \\times 10^8\\text{ m/s}$, what is the quantum energy difference ($\\Delta E$) of this electron transition?",
      options: [
        "$\\Delta E \\approx 1.85\\text{ eV}$ ($2.96 \\times 10^{-19}\\text{ J}$)",
        "$\\Delta E \\approx 3.10\\text{ eV}$ ($4.96 \\times 10^{-19}\\text{ J}$)",
        "$\\Delta E \\approx 0.50\\text{ eV}$ ($8.01 \\times 10^{-20}\\text{ J}$)",
        "$\\Delta E \\approx 13.6\\text{ eV}$ ($2.18 \\times 10^{-18}\\text{ J}$)"
      ],
      correctIndex: 0,
      explanation: "$\\Delta E = \\frac{hc}{\\lambda} = \\frac{6.626 \\times 10^{-34} \\times 3.00 \\times 10^8}{670.8 \\times 10^{-9}} \\approx 2.964 \\times 10^{-19}\\text{ J}$. Converting to electron-volts: $\\frac{2.964 \\times 10^{-19}}{1.602 \\times 10^{-19}} \\approx 1.85\\text{ eV}$."
    }
  ],

  precipitation: [
    {
      id: "q1",
      question: "If equal volumes of 0.020 M $\\text{Pb(NO}_3)_2$ and 0.020 M $\\text{KI}$ are mixed at $25^\\circ\\text{C}$, will a precipitate of $\\text{PbI}_2$ form given $K_{\\text{sp}}(\\text{PbI}_2) = 9.8 \\times 10^{-9}$?",
      options: [
        "No, because the reaction quotient Q = 1.0 × 10⁻⁶ < Ksp",
        "Yes, because after dilution [Pb²⁺] = 0.010 M and [I⁻] = 0.010 M, giving Q = [Pb²⁺][I⁻]² = 1.0 × 10⁻⁶ > Ksp",
        "No, because all nitrates and iodides are completely soluble in water",
        "Yes, because Ksp is greater than the total molar mass of the mixture"
      ],
      correctIndex: 1,
      explanation: "Upon mixing equal volumes, concentrations are halved: $[\\text{Pb}^{2+}] = 0.010\\text{ M}$, $[\\text{I}^-] = 0.010\\text{ M}$. The ion product $Q = [\\text{Pb}^{2+}][\\text{I}^-]^2 = (0.010)(0.010)^2 = 1.0 \\times 10^{-6}$. Since $Q (1.0 \\times 10^{-6}) > K_{\\text{sp}} (9.8 \\times 10^{-9})$, supersaturation occurs and golden $\\text{PbI}_2$ precipitates."
    },
    {
      id: "q2",
      question: "What is the correct Net Ionic Equation for the precipitation reaction between aqueous silver nitrate and sodium chloride?",
      options: [
        "AgNO₃(aq) + NaCl(aq) ⟶ AgCl(s)↓ + NaNO₃(aq)",
        "Na⁺(aq) + NO₃⁻(aq) ⟶ NaNO₃(s)↓",
        "Ag⁺(aq) + Cl⁻(aq) ⟶ AgCl(s)↓",
        "Ag⁺(aq) + NO₃⁻(aq) + Na⁺(aq) + Cl⁻(aq) ⟶ AgCl(s)↓ + Na⁺(aq) + NO₃⁻(aq)"
      ],
      correctIndex: 2,
      explanation: "Sodium (Na⁺) and nitrate (NO₃⁻) ions remain completely dissociated in solution as spectator ions and cancel from both sides, leaving the net ionic equation Ag⁺(aq) + Cl⁻(aq) ⟶ AgCl(s)↓."
    },
    {
      id: "q3",
      question: "In the famous 'Golden Rain' experiment, a yellow precipitate of PbI₂ dissolves upon heating the aqueous mixture to boiling and recrystallizes upon slow cooling. Why does this occur?",
      options: [
        "The reaction is exothermic (ΔH° < 0), so heating lowers Ksp according to Le Chatelier's principle",
        "Dissolution of PbI₂ is endothermic (ΔH° > 0); increasing temperature increases Ksp, allowing dissolution, while slow cooling reduces solubility and nucleates glistening golden crystals",
        "Boiling evaporates the iodine gas, turning the solution clear",
        "Heating oxidizes Pb²⁺ to insoluble Pb⁴⁺ oxide"
      ],
      correctIndex: 1,
      explanation: "The dissolution PbI₂(s) ⇌ Pb²⁺(aq) + 2I⁻(aq) has a positive enthalpy of solution (ΔH° > 0). According to the van 't Hoff equation, higher temperature increases Ksp, dissolving the solid. Cooling causes controlled recrystallization into sparkling golden hexagonal platelets."
    }
  ],

  activityseries: [
    {
      id: "q1",
      question: "A strip of polished zinc metal is submerged into a 0.50 M copper(II) sulfate ($\\text{CuSO}_4$) solution. Given $E^\\circ(\\text{Zn}^{2+}/\\text{Zn}) = -0.76\\text{ V}$ and $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V}$, what is observed?",
      options: [
        "No reaction occurs because copper is more reactive than zinc",
        "A spontaneous redox reaction occurs: zinc dissolves as $\\text{Zn}^{2+}$ and reddish-brown copper plates onto the strip with $\\Delta E^\\circ_{\\text{cell}} = +1.10\\text{ V}$",
        "Vigorous evolution of oxygen gas bubbles without any change to the strip",
        "The solution turns deep purple and the zinc strip catches fire"
      ],
      correctIndex: 1,
      explanation: "Since Zn is higher in the activity series (more negative $E^\\circ = -0.76\\text{ V}$), it oxidizes: $\\text{Zn(s)} \\longrightarrow \\text{Zn}^{2+} + 2e^-$. $\\text{Cu}^{2+}$ reduces: $\\text{Cu}^{2+} + 2e^- \\longrightarrow \\text{Cu(s)}$ ($E^\\circ = +0.34\\text{ V}$). The cell potential $\\Delta E^\\circ_{\\text{cell}} = 0.34 - (-0.76) = +1.10\\text{ V} > 0$, indicating spontaneous single displacement."
    },
    {
      id: "q2",
      question: "Which of the following metals will NOT react with dilute 1.0 M hydrochloric acid (HCl) to produce hydrogen gas (H₂)?",
      options: [
        "Magnesium (Mg)",
        "Zinc (Zn)",
        "Iron (Fe)",
        "Copper (Cu)"
      ],
      correctIndex: 3,
      explanation: "Hydrogen has a standard reduction potential of $E^\\circ = 0.00\\text{ V}$. Copper has a positive reduction potential ($E^\\circ = +0.34\\text{ V}$) and lies below hydrogen in the activity series, meaning Cu cannot spontaneously reduce $\\text{H}^+$ ions to $\\text{H}_2\\text{(g)}$."
    },
    {
      id: "q3",
      question: "When a copper wire is suspended in a colorless solution of silver nitrate (AgNO₃), lustrous needle-like silver crystals form and the solution turns pale blue. What explains the blue color?",
      options: [
        "Silver nitrate turns blue upon exposure to light",
        "Oxidation of copper wire releases hydrated Cu²⁺(aq) complex ions into the solution",
        "Nitrate ions decompose into nitrogen dioxide gas",
        "Hydrogen ions from water react with silver to form colloidal silver sol"
      ],
      correctIndex: 1,
      explanation: "Copper displaces silver: Cu(s) + 2Ag⁺(aq) ⟶ Cu²⁺(aq) + 2Ag(s). The release of Cu²⁺ ions forms hydrated hexaaquacopper(II) complexes [Cu(H₂O)₆]²⁺ which absorb red light and impart a characteristic clear blue color."
    }
  ],

  antibiotic: [
    {
      id: "q1",
      question: "In a Kirby-Bauer disk diffusion assay, how does an antibiotic disk generate a circular Zone of Inhibition (ZOI) around itself on Mueller-Hinton agar?",
      options: [
        "The paper disk releases heat that denatures bacterial enzymes in a radial radius",
        "Antibiotic molecules diffuse radially outward establishing a Fickian concentration gradient; bacteria cannot grow where the concentration exceeds the Minimum Inhibitory Concentration (MIC)",
        "Bacteria actively swim away from the antibiotic disk by negative chemotaxis",
        "The disk consumes all glucose and agar nutrients within a fixed perimeter"
      ],
      correctIndex: 1,
      explanation: "Radial molecular diffusion through the agar creates a decreasing concentration gradient C(r). The edge of the inhibition zone corresponds precisely to the critical threshold where local antibiotic concentration equals the organism's Minimum Inhibitory Concentration (MIC)."
    },
    {
      id: "q2",
      question: "Testing MRSA (Methicillin-Resistant Staphylococcus aureus) with an Ampicillin (AMP-10) disk produces a zone diameter of 6.0 mm (equal to the disk diameter). According to CLSI M100 standards (R ≤ 13 mm, S ≥ 17 mm), how is this strain classified?",
      options: [
        "Susceptible (S)",
        "Intermediate (I)",
        "Resistant (R)",
        "Synergistic"
      ],
      correctIndex: 2,
      explanation: "A zone diameter of $6.0\\text{ mm}$ indicates zero clearance beyond the disk boundary. Because $6\\text{ mm} \\leq 13\\text{ mm}$ (CLSI Resistant breakpoint), the organism is classified as fully Resistant (R), caused by the mecA gene encoding PBP2a."
    },
    {
      id: "q3",
      question: "Why are Gram-negative bacilli such as E. coli intrinsically resistant to vancomycin, showing little to no zone of inhibition?",
      options: [
        "Gram-negative bacteria lack a peptidoglycan cell wall completely",
        "Vancomycin is a large, bulky glycopeptide molecule (~1449 Da) that cannot pass through the outer membrane porin channels of Gram-negative bacteria to reach its peptidoglycan target",
        "Gram-negative bacteria secrete beta-lactamase which hydrolyzes vancomycin",
        "Vancomycin only binds 70S ribosomes found exclusively in Gram-positive cells"
      ],
      correctIndex: 1,
      explanation: "Vancomycin's large molecular weight (~1449 Da) prevents it from traversing the outer membrane porins of Gram-negative bacteria, rendering them intrinsically resistant despite having a peptidoglycan layer."
    }
  ],

  elisa: [
    {
      id: "q1",
      question: "In an indirect ELISA for detecting anti-viral antibodies, what is the purpose of adding Bovine Serum Albumin (BSA) in the blocking step?",
      options: [
        "To act as the chromogenic substrate that changes color in the presence of enzyme",
        "To coat all remaining unoccupied hydrophobic sites on the polystyrene well surface, preventing non-specific binding of primary or secondary antibodies",
        "To lyse viral particles and release internal genetic material",
        "To adjust the pH of the wash buffer to neutrality"
      ],
      correctIndex: 1,
      explanation: "Polystyrene plastic has high non-specific protein binding affinity. Blocking with an irrelevant protein like BSA saturates open hydrophobic sites, preventing subsequent antibodies from sticking non-specifically and causing false-positive background signal."
    },
    {
      id: "q2",
      question: "In an HRP-based ELISA, what chemical reaction causes the color to change from clear to blue upon addition of TMB, and subsequently to yellow upon addition of 1.0 M H₂SO₄?",
      options: [
        "HRP reduces water to hydrogen gas, shifting the pH indicator from red to blue",
        "Horseradish peroxidase catalyzes the oxidation of TMB by H₂O₂ to a blue diimine cation; addition of sulfuric acid protonates the diimine to a stable yellow diamine and stops the enzyme reaction",
        "The antigen decomposes into yellow amino acids upon acid hydrolysis",
        "The antibody heavy chains unfold and crystallize into yellow pigment"
      ],
      correctIndex: 1,
      explanation: "HRP uses hydrogen peroxide to oxidize TMB into a charge-transfer blue diimine complex (peak at 650 nm). Adding sulfuric acid terminates enzymatic activity by denaturing HRP and acidifies the product to a stable yellow diamine measured at 450 nm."
    },
    {
      id: "q3",
      question: "In clinical serology, if three negative control wells yield $\\text{OD}_{450}$ values of 0.050, 0.055, and 0.060 (mean = 0.055, $\\text{SD} = 0.005$), what is the diagnostic Cutoff threshold calculated as $\\text{Mean}(\\text{Neg}) + 3 \\cdot \\text{SD}$?",
      options: [
        "$\\text{Cutoff OD} = 0.070$",
        "$\\text{Cutoff OD} = 0.165$",
        "$\\text{Cutoff OD} = 0.055$",
        "$\\text{Cutoff OD} = 1.000$"
      ],
      correctIndex: 0,
      explanation: "$\\text{Cutoff} = \\text{Mean}(\\text{Neg}) + 3 \\times \\text{SD} = 0.055 + 3(0.005) = 0.055 + 0.015 = 0.070$. Any patient sample with an optical density greater than 0.070 is classified as seropositive."
    }
  ],

  transpiration: [
    {
      id: "q1",
      question: "In a Ganong potometer experiment measuring plant transpiration, what does the rate of movement of the air bubble meniscus along the graduated capillary tube directly measure?",
      options: [
        "The rate of photosynthetic oxygen production by the leafy shoot",
        "The rate of water uptake by the leafy shoot, which closely approximates the transpiration rate under steady-state conditions",
        "The respiratory consumption of carbon dioxide in the root zone",
        "The atmospheric air pressure inside the laboratory"
      ],
      correctIndex: 1,
      explanation: "The potometer measures water uptake by the cut stem. Because over 95-98% of water absorbed by a leafy shoot is lost via stomatal transpiration, the rate of meniscus movement is an accurate proxy for transpiration rate."
    },
    {
      id: "q2",
      question: "How do guard cells open the stomatal aperture in response to light, and how does increased relative humidity affect the overall transpiration rate?",
      options: [
        "Guard cells lose water, shrink, and pull the pore open; high humidity accelerates transpiration",
        "Active proton pumping drives K⁺ and Cl⁻ uptake into guard cells, lowering osmotic potential (Ψs) so water enters by osmosis, increasing turgor pressure to bow open the thick inner walls; higher relative humidity decreases the vapor pressure deficit (VPD), reducing transpiration",
        "Light causes guard cells to synthesize cellulose which physically pushes the stoma open",
        "Guard cells open by plasmolysis in dry air and seal shut in humid air"
      ],
      correctIndex: 1,
      explanation: "Light activates H⁺-ATPases, hyperpolarizing the membrane and driving K⁺/anion influx. Water follows by endosmosis, generating hydrostatic turgor pressure that bows the guard cells open. Higher humidity lowers VPD (es - ea), reducing the driving force for vapor diffusion."
    },
    {
      id: "q3",
      question: "Why does turning on an electric fan (increasing wind speed from 0 to 4 m/s) significantly increase the transpiration rate of a leafy shoot in still air?",
      options: [
        "Wind cools the leaves below their freezing point",
        "Wind blows away the stagnant humid boundary layer of water vapor adhering to the leaf surface, steepening the water vapor concentration gradient across the stomata",
        "Wind physically pulls water out of the xylem vessels by Bernoulli suction",
        "Wind increases the atmospheric vapor pressure deficit to infinity"
      ],
      correctIndex: 1,
      explanation: "In still air, transpired vapor accumulates in an unstirred boundary layer adjacent to the epidermis, slowing diffusion. Wind sweeps away this layer, reducing boundary layer resistance (rb) and steepening the vapor gradient from leaf interior to ambient air."
    }
  ],

  orbital: [
    {
      id: "q1",
      question: "According to Kepler's First and Second Laws of Planetary Motion, what are the geometry of an orbit and the relationship between orbital speed and distance from the primary focus?",
      options: [
        "Orbits are perfect circles centered on the primary; orbital speed is strictly constant throughout",
        "Orbits are ellipses with the primary mass at one focus; an orbiting body sweeps out equal areas in equal intervals of time, moving fastest at periapsis and slowest at apoapsis",
        "Orbits are parabolas that spiral inward until crashing into the primary body",
        "The primary body sits at the geometric center of the ellipse, and speed maximizes at apoapsis"
      ],
      correctIndex: 1,
      explanation: "Kepler's 1st Law states orbits are ellipses with the attractor at one focus. Kepler's 2nd Law ($\\frac{dA}{dt} = \\frac{L}{2m} = \\text{constant}$) requires equal areas swept in equal time, meaning angular momentum conservation causes velocity to peak at periapsis (closest) and reach a minimum at apoapsis (farthest)."
    },
    {
      id: "q2",
      question: "Using the Vis-Viva equation $v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)$, how does the velocity of a spacecraft at periapsis ($r_p$) compare to the local circular orbit speed at that same radius?",
      options: [
        "Periapsis speed is always lower than circular orbit speed",
        "Periapsis speed is always greater than circular orbit speed because the semi-major axis $a > r_p$",
        "Periapsis speed is exactly equal to the escape velocity $v_{\\text{esc}} = \\sqrt{\\frac{2GM}{r}}$",
        "Periapsis speed is zero because the spacecraft stops instantaneously to turn around"
      ],
      correctIndex: 1,
      explanation: "For an ellipse, $a > r_p$, so $(2/r_p - 1/a) > (2/r_p - 1/r_p) = 1/r_p$. Therefore, $v^2 = GM(2/r_p - 1/a) > \\frac{GM}{r_p} = v_{\\text{circ}}^2$, meaning periapsis speed is always greater than circular orbital speed."
    },
    {
      id: "q3",
      question: "Kepler's Third Law states that $\\frac{T^2}{a^3} = \\frac{4\\pi^2}{GM}$. If a satellite's semi-major axis ($a$) is quadrupled ($a_2 = 4a_1$), by what factor does its orbital period ($T$) increase?",
      options: [
        "2 times",
        "4 times",
        "8 times ($2^3 = 8$, since $T \\propto a^{3/2}$)",
        "16 times"
      ],
      correctIndex: 2,
      explanation: "From $T \\propto a^{3/2}$, if $a$ is increased by a factor of 4, the new period $T_2 = (4)^{3/2} \\cdot T_1 = (\\sqrt{4})^3 \\cdot T_1 = 2^3 \\cdot T_1 = 8 \\cdot T_1$."
    },
    {
      id: "q4",
      question: "In a Hohmann transfer from a circular Low Earth Orbit ($r_1$) to a circular Geostationary Orbit ($r_2$), what is the semi-major axis $a_{\\text{tx}}$ of the elliptical transfer orbit, and how are the two impulse burns directed?",
      options: [
        "$a_{\\text{tx}} = \\frac{r_1 + r_2}{2}$; both $\\Delta v_1$ and $\\Delta v_2$ are applied as prograde burns tangential to the velocity vector",
        "$a_{\\text{tx}} = r_2 - r_1$; the first burn is prograde and the second is retrograde",
        "$a_{\\text{tx}} = \\sqrt{r_1 r_2}$; both burns are directed radially toward the center of Earth",
        "$a_{\\text{tx}} = 2(r_1 + r_2)$; only a single continuous burn is executed throughout the transfer"
      ],
      correctIndex: 0,
      explanation: "The transfer ellipse connects periapsis at $r_1$ and apoapsis at $r_2$, so $2a_{\\text{tx}} = r_1 + r_2 \\implies a_{\\text{tx}} = \\frac{r_1 + r_2}{2}$. The first burn $\\Delta v_1 = v_{\\text{tx},p} - v_{\\text{circ},1}$ is prograde to enter the ellipse, and the second burn $\\Delta v_2 = v_{\\text{circ},2} - v_{\\text{tx},a}$ is prograde at apoapsis to circularize into the higher orbit."
    },
    {
      id: "q5",
      question: "In the Circular Restricted Three-Body Problem (CR3BP) for the Sun-Earth system, where are the triangular Lagrange points $L_4$ and $L_5$ located, and what enables their orbital stability?",
      options: [
        "Directly between Sun and Earth; stabilized by magnetic reconnection",
        "Forming equilateral triangles with the two primaries (60° ahead and 60° behind Earth in its orbital plane); stabilized by the Coriolis force when the mass ratio $\\mu < 0.0385$",
        "Directly behind the Sun on the opposite side of Earth's orbit; stabilized by solar radiation pressure",
        "At the North and South ecliptic poles; stabilized by electrostatic repulsion"
      ],
      correctIndex: 1,
      explanation: "Lagrange discovered that points $L_4$ and $L_5$ form equilateral triangles with distance $R$ to both primaries. In the rotating reference frame, although the effective gravitational potential is a local maximum (hilltop), the Coriolis acceleration creates stable epicyclic librations around $L_4$ and $L_5$ provided Gascheau's/Routh's criterion ($27\\mu(1-\\mu) < 1 \\implies \\mu < 0.03852$) is satisfied."
    }
  ],

  resonance: [
    {
      id: "q1",
      question: "In a closed-open acoustic resonance tube of length L containing a variable water column, what boundary conditions dictate standing sound wave formation at resonance?",
      options: [
        "Displacement antinodes at both ends of the tube",
        "A displacement node (pressure antinode) at the water surface boundary and a displacement antinode (pressure node) near the open top",
        "Displacement nodes at both the water surface and the open top",
        "Pressure nodes at both ends without any displacement variation"
      ],
      correctIndex: 1,
      explanation: "The rigid water surface prevents air molecule displacement, creating a displacement node (pressure antinode). At the open tube top, air molecules oscillate freely into ambient air, creating a displacement antinode (pressure node)."
    },
    {
      id: "q2",
      question: "In a resonance tube experiment with a 512 Hz tuning fork, the first two resonant air column lengths are measured at $L_1 = 15.5\\text{ cm}$ and $L_2 = 48.5\\text{ cm}$. What is the experimental speed of sound ($v$)?",
      options: [
        "$v = 338.0\\text{ m/s}$ [using $v = 2f(L_2 - L_1)$]",
        "$v = 170.0\\text{ m/s}$",
        "$v = 512.0\\text{ m/s}$",
        "$v = 300.0\\text{ m/s}$"
      ],
      correctIndex: 0,
      explanation: "The difference between consecutive harmonics is half a wavelength: $L_2 - L_1 = \\lambda/2 = 48.5 - 15.5 = 33.0\\text{ cm} = 0.33\\text{ m}$, giving $\\lambda = 0.66\\text{ m}$. Then $v = f \\cdot \\lambda = 512\\text{ Hz} \\times 0.66\\text{ m} = 337.92\\text{ m/s} \\approx 338.0\\text{ m/s}$. This formula also eliminates the end correction $c$!"
    },
    {
      id: "q3",
      question: "How does an increase in air temperature from $0^\\circ\\text{C}$ to $25^\\circ\\text{C}$ affect the speed of sound in air, according to $v(T) = 331.3\\sqrt{1 + \\frac{T}{273.15}}$?",
      options: [
        "The speed of sound decreases because warmer air has higher relative humidity",
        "The speed of sound increases from 331.3 m/s to approximately 346.2 m/s because warmer air molecules have higher root-mean-square thermal velocities",
        "The speed of sound remains strictly constant because sound is a mechanical wave",
        "The speed of sound doubles every 10°C increase in temperature"
      ],
      correctIndex: 1,
      explanation: "Speed of sound in an ideal gas depends on temperature: $v = \\sqrt{\\frac{\\gamma RT}{M}}$. At $25^\\circ\\text{C}$ (298.15 K), $v = 331.3 \\times \\sqrt{\\frac{298.15}{273.15}} \\approx 331.3 \\times 1.0447 \\approx 346.1\\text{ m/s}$, demonstrating an increase of approximately $0.6\\text{ m/s}$ per $^\\circ\\text{C}$."
    }
  ],

  electrostatics: [
    {
      id: "q1",
      question: "According to Coulomb's Law $F = k_e \\frac{|q_1 q_2|}{r^2}$, if the separation distance $r$ between two point charges is tripled ($r_2 = 3r_1$), what happens to the electrostatic force between them?",
      options: [
        "The force increases by a factor of 3",
        "The force decreases to 1/9 of its original magnitude (inverse-square law)",
        "The force decreases to 1/3 of its original magnitude",
        "The force remains unchanged because charge magnitudes are conserved"
      ],
      correctIndex: 1,
      explanation: "Coulomb's Law follows an inverse-square dependence on distance: $F \\propto \\frac{1}{r^2}$. Tripling the distance ($3r$) results in a force of $\\frac{1}{3^2} = \\frac{1}{9}$ of the initial value."
    },
    {
      id: "q2",
      question: "What is the geometric and physical relationship between electric field vector lines ($\\vec{E}$) and equipotential lines ($V = \\text{constant}$)?",
      options: [
        "Electric field lines are always parallel to equipotential lines",
        "Electric field lines are always mutually perpendicular (orthogonal) to equipotential lines, pointing in the direction of steepest decreasing electric potential ($\\vec{E} = -\\nabla V$)",
        "Electric field lines only exist where electric potential V is zero",
        "Equipotential lines spiral inward along the direction of magnetic flux"
      ],
      correctIndex: 1,
      explanation: "Because moving a charge along an equipotential line requires zero work ($dW = -q \\vec{E} \\cdot d\\vec{r} = 0$), the component of $\\vec{E}$ tangent to the surface must be zero. Hence, $\\vec{E}$ is always perpendicular to equipotentials and points from high potential to low potential ($\\vec{E} = -\\nabla V$)."
    },
    {
      id: "q3",
      question: "For an electric dipole consisting of $+q$ at ($x = -d/2$) and $-q$ at ($x = +d/2$), what is the electric potential ($V$) along the entire perpendicular bisector line ($x = 0$)?",
      options: [
        "V = +∞",
        "$V = 0\\text{ Volts}$ everywhere along the plane, because any point on the bisector is equidistant from $+q$ and $-q$ ($V = \\frac{k_e q}{r} + \\frac{k_e (-q)}{r} = 0$)",
        "V fluctuates sinusoidally between +ke·q/d and -ke·q/d",
        "V depends strictly on the test charge mass"
      ],
      correctIndex: 1,
      explanation: "Every point on the perpendicular bisecting axis is equidistant ($r_+ = r_- = r$) from both charges. The net potential is $V = \\frac{k_e (+q)}{r} + \\frac{k_e (-q)}{r} = 0\\text{ V}$. The perpendicular bisector is thus the planar $V = 0$ equipotential surface."
    }
  ],

  arduino: [
    {
      id: "q1",
      question: "An Arduino Uno utilizes a 10-bit Analog-to-Digital Converter (ADC) referenced to a 5.0 V analog reference rail. What is the approximate voltage step represented by 1 unit of ADC reading?",
      options: [
        "0.98 mV per unit",
        "4.89 mV per unit ($5.0\\text{ V} / 1023$)",
        "19.5 mV per unit",
        "48.8 mV per unit"
      ],
      correctIndex: 1,
      explanation: "A 10-bit ADC provides $2^{10} = 1024$ distinct quantization codes (0 to 1023). Therefore, resolution = $\\frac{5.0\\text{ V}}{1023} \\approx 4.887\\text{ mV}$ per quantization step."
    },
    {
      id: "q2",
      question: "When triggering the HC-SR04 ultrasonic sonar sensor, the echo pulse duration is measured as 1,750 µs. Given the speed of sound is 343 m/s ($0.0343\\text{ cm/µs}$), what is the calculated distance to the target?",
      options: [
        "60.0 cm",
        "30.0 cm (Round-trip time divided by 2)",
        "15.0 cm",
        "120.0 cm"
      ],
      correctIndex: 1,
      explanation: "Distance = $\\frac{v \\cdot t}{2} = \\frac{0.0343\\text{ cm/µs} \\times 1750\\text{ µs}}{2} = \\frac{59.99\\text{ cm}}{2} \\approx 30.0\\text{ cm}$."
    },
    {
      id: "q3",
      question: "To connect a standard Red LED (forward voltage 2.0 V, target forward current 20 mA = 0.020 A) safely to an Arduino 5.0 V digital output pin, what is the ideal minimum current-limiting resistor required?",
      options: [
        "22 Ω",
        "150 Ω (or standard 220 Ω)",
        "1,000 Ω (1 kΩ)",
        "10,000 Ω (10 kΩ)"
      ],
      correctIndex: 1,
      explanation: "Applying Ohm's Law to the series resistor: $R = \\frac{V_{\\text{supply}} - V_f}{I} = \\frac{5.0\\text{ V} - 2.0\\text{ V}}{0.020\\text{ A}} = \\frac{3.0\\text{ V}}{0.020\\text{ A}} = 150\\ \\Omega$. In practical breadboard engineering, standard 220 Ω metal-film resistors are used to ensure safe 13.6 mA current."
    }
  ]
};

/**
 * Mounts the Post-Lab Assessment Checkpoint Widget inside any laboratory container
 */
export function mountLabCheckpoint(containerId, labKey = "projectile") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const resolveKey = (raw) => {
    if (!raw) return null;
    const clean = String(raw).toLowerCase().replace(/-checkpoint$/, "").replace(/^lab[-_]/, "").replace(/[-_]/g, "");
    if (LAB_CHECKPOINTS[raw]) return LAB_CHECKPOINTS[raw];
    if (LAB_CHECKPOINTS[clean]) return LAB_CHECKPOINTS[clean];
    if (LAB_CHECKPOINTS[clean + "s"]) return LAB_CHECKPOINTS[clean + "s"];
    if (clean.includes("arduino") || clean.includes("atmega") || clean.includes("mcu")) return LAB_CHECKPOINTS.arduino;
    if (clean.includes("flame") || clean.includes("spectro")) return LAB_CHECKPOINTS.flametest;
    if (clean.includes("precip") || clean.includes("solubil")) return LAB_CHECKPOINTS.precipitation;
    if (clean.includes("activity") || clean.includes("displace") || clean.includes("redox")) return LAB_CHECKPOINTS.activityseries;
    if (clean.includes("antibiot") || clean.includes("kirby") || clean.includes("bauer")) return LAB_CHECKPOINTS.antibiotic;
    if (clean.includes("elisa") || clean.includes("immuno") || clean.includes("antibody")) return LAB_CHECKPOINTS.elisa;
    if (clean.includes("transpir") || clean.includes("potometer") || clean.includes("stoma")) return LAB_CHECKPOINTS.transpiration;
    if (clean.includes("orbital") || clean.includes("kepler") || clean.includes("orbit")) return LAB_CHECKPOINTS.orbital;
    if (clean.includes("resonan") || clean.includes("soundtube") || clean.includes("acoust")) return LAB_CHECKPOINTS.resonance;
    if (clean.includes("electrostat") || clean.includes("coulomb") || clean.includes("charge")) return LAB_CHECKPOINTS.electrostatics;
    if (clean.includes("kinet") || clean.includes("rate") || clean.includes("arrhen")) return LAB_CHECKPOINTS.kinetics;
    if (clean.includes("collis") || clean.includes("moment") || clean.includes("airtrack")) return LAB_CHECKPOINTS.collisions;
    if (clean.includes("induct") || clean.includes("faraday") || clean.includes("lenz") || clean.includes("solenoid")) return LAB_CHECKPOINTS.induction;
    if (clean.includes("osmo") || clean.includes("tonicit") || clean.includes("membran") || clean.includes("plasmol")) return LAB_CHECKPOINTS.osmosis;
    if (clean.includes("mitos") || clean.includes("cellcycle") || clean.includes("histol") || clean.includes("anaph")) return LAB_CHECKPOINTS.mitosis;
    if (clean.includes("beer") || clean.includes("lambert") || clean.includes("spectro")) return LAB_CHECKPOINTS.beerlambert;
    if (clean.includes("decay") || clean.includes("nuclear") || clean.includes("radioact")) return LAB_CHECKPOINTS.decay;
    if (clean.includes("collig") || clean.includes("freez") || clean.includes("boil")) return LAB_CHECKPOINTS.colligative;
    if (clean.includes("organ") || clean.includes("sn1") || clean.includes("sn2")) return LAB_CHECKPOINTS.organic;
    if (clean.includes("electrophor") || clean.includes("gel") || clean.includes("agarose")) return LAB_CHECKPOINTS.electrophoresis;
    if (clean.includes("ecol") || clean.includes("populat") || clean.includes("lotka") || clean.includes("predat")) return LAB_CHECKPOINTS.ecology;
    if (clean.includes("action") || clean.includes("potent") || clean.includes("neuron") || clean.includes("patch")) return LAB_CHECKPOINTS.actionpotential;
    if (clean.includes("rotat") || clean.includes("torque") || clean.includes("inertia")) return LAB_CHECKPOINTS.rotational;
    if (clean.includes("conduct") || clean.includes("fourier") || clean.includes("heat")) return LAB_CHECKPOINTS.conduction;
    if (clean.includes("fluid") || clean.includes("buoy") || clean.includes("archimed") || clean.includes("bernoulli")) return LAB_CHECKPOINTS.fluids;
    if (clean.includes("anatom") || clean.includes("atlas") || clean.includes("skelet")) return LAB_CHECKPOINTS.anatomy;
    if (clean.includes("project") || clean.includes("kinemat")) return LAB_CHECKPOINTS.projectile;
    if (clean.includes("titrat")) return LAB_CHECKPOINTS.titration;
    if (clean.includes("micro")) return LAB_CHECKPOINTS.microscope;
    if (clean.includes("period") || clean.includes("ptable")) return LAB_CHECKPOINTS.ptable;
    if (clean.includes("circuit")) return LAB_CHECKPOINTS.circuits;
    if (clean.includes("gas")) return LAB_CHECKPOINTS.gaslaws;
    if (clean.includes("dna") || clean.includes("protein")) return LAB_CHECKPOINTS.dnaprotein;
    if (clean.includes("punnett")) return LAB_CHECKPOINTS.punnett;
    if (clean.includes("optic")) return LAB_CHECKPOINTS.optics;
    if (clean.includes("vsepr")) return LAB_CHECKPOINTS.vsepr;
    if (clean.includes("wave")) return LAB_CHECKPOINTS.waves;
    if (clean.includes("photoelec")) return LAB_CHECKPOINTS.photoelectric;
    if (clean.includes("photo")) return LAB_CHECKPOINTS.photosynthesis;
    if (clean.includes("calor")) return LAB_CHECKPOINTS.calorimetry;
    if (clean.includes("equil")) return LAB_CHECKPOINTS.equilibrium;
    if (clean.includes("electro")) return LAB_CHECKPOINTS.electrochem;
    if (clean.includes("harmon") || clean.includes("shm") || clean.includes("hooke")) return LAB_CHECKPOINTS.harmonic;
    if (clean.includes("magnet") || clean.includes("lorentz")) return LAB_CHECKPOINTS.magnetism;
    if (clean.includes("enzym")) return LAB_CHECKPOINTS.enzymes;
    if (clean.includes("respir")) return LAB_CHECKPOINTS.respiration;
    return null;
  };

  let questions = null;
  if (labKey && typeof labKey === "object") {
    if (Array.isArray(labKey.questions)) {
      questions = labKey.questions;
    } else {
      questions = resolveKey(labKey.id || labKey.labId || labKey.key || labKey.labTitle);
    }
  } else if (typeof labKey === "string") {
    questions = resolveKey(labKey);
  }
  if (!questions) questions = LAB_CHECKPOINTS.projectile;
  let userAnswers = {};

  const getCorrectIdx = (q) => (q && q.correctIndex !== undefined ? q.correctIndex : (q && q.correct !== undefined ? q.correct : 0));

  function render() {
    let answeredCount = Object.keys(userAnswers).length;
    let correctCount = Object.entries(userAnswers).filter(([idx, ans]) => ans === getCorrectIdx(questions[idx])).length;

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
            const correctIdx = getCorrectIdx(q);
            const chosen = userAnswers[qIdx];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === correctIdx;
            const cardClass = !isAnswered ? "" : (isCorrect ? "correct" : "incorrect");

            return `
              <div class="lab-question-card ${cardClass}" data-qidx="${qIdx}">
                <div class="lab-question-meta">
                  Question ${qIdx + 1} of ${questions.length}
                </div>
                <div class="lab-question-text">${formatMathText(q.question)}</div>

                <div class="lab-options-list">
                  ${q.options.map((opt, optIdx) => {
                    let optClass = "";
                    if (isAnswered) {
                      if (optIdx === correctIdx) optClass = "selected-correct";
                      else if (optIdx === chosen) optClass = "selected-wrong";
                    }
                    return `
                      <button class="lab-option-btn ${optClass}" data-qidx="${qIdx}" data-optidx="${optIdx}" ${isAnswered ? "disabled" : ""} aria-label="Option ${["A", "B", "C", "D"][optIdx]}: ${opt}">
                        <span class="lab-option-letter">${["A", "B", "C", "D"][optIdx]}.</span>
                        <span class="lab-option-text">${formatMathText(opt)}</span>
                      </button>
                    `;
                  }).join("")}
                </div>

                ${isAnswered ? `
                  <div class="lab-explanation-box ${isCorrect ? 'correct' : 'incorrect'}">
                    <strong>${isCorrect ? '✓ Correct Explanation:' : '✗ Insight:'}</strong> ${formatMathText(q.explanation)}
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
          const finalCorrect = Object.entries(userAnswers).filter(([idx, ans]) => ans === getCorrectIdx(questions[idx])).length;
          ProgressStore.recordQuizResult(questions.length, finalCorrect);
          showToast("Lab Assessment Recorded!", `Score: ${finalCorrect}/${questions.length} Mastery Points`, "success");
        }

        render();
      });
    });

    renderMathInElement(container);
  }

  render();
}
