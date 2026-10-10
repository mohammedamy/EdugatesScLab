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
    },
    {
      id: "q4",
      question: "During the titration of a weak monoprotic acid (HA) with strong base (NaOH), at the half-equivalence point ($V = \\frac{1}{2}V_{\\text{eq}}$), the solution pH satisfies:",
      options: [
        "pH = pKa (because [A⁻] = [HA] in the Henderson-Hasselbalch equation)",
        "pH = 7.00 (neutrality)",
        "pH = 14 - pKb",
        "pH = 0"
      ],
      correctIndex: 0,
      explanation: "At half-equivalence, exactly half of the weak acid has been converted to its conjugate base ([A⁻] = [HA]). By Henderson-Hasselbalch, pH = pKa + log([A⁻]/[HA]) = pKa + log(1) = pKa."
    },
    {
      id: "q5",
      question: "At the equivalence point of a weak acid (e.g., acetic acid, $\\text{CH}_3\\text{COOH}$) titrated with strong base ($\\text{NaOH}$), the solution is:",
      options: [
        "Slightly basic (pH > 7) due to conjugate base hydrolysis (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻)",
        "Neutral (pH = 7.00) because all acid and base have reacted",
        "Acidic (pH < 7) due to sodium cation acidity",
        "Strongly acidic (pH ≈ 1)"
      ],
      correctIndex: 0,
      explanation: "At stoichiometric equivalence, the solution contains sodium acetate (CH₃COONa). The acetate ion (CH₃COO⁻) acts as a weak Brønsted base and hydrolyzes water, releasing OH⁻ and elevating the equivalence pH above 7 (~8.72 for 0.1 M acetate)."
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
    },
    {
      id: "q4",
      question: "At the resonant frequency ($f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$) of a series RLC circuit, what is the net circuit impedance $Z$ and phase angle $\\phi$?",
      options: [
        "Z = R (reactances cancel: X_L = X_C) and φ = 0° (in phase, unity power factor)",
        "Z = 0 Ω and φ = 90°",
        "Z = ∞ Ω and φ = -90°",
        "Z = X_L + X_C and φ = 45°"
      ],
      correctIndex: 0,
      explanation: "At natural resonance, inductive reactance X_L exactly equals capacitive reactance X_C, so the net reactance (X_L - X_C) cancels to zero. The impedance reaches its minimum possible value Z = √(R² + 0) = R, and current is perfectly in phase with voltage (φ = 0°)."
    },
    {
      id: "q5",
      question: "In a four-arm Wheatstone bridge ($R_1, R_2, R_3, R_x$), what condition indicates that the bridge is balanced and what is the formula for the unknown resistance $R_x$?",
      options: [
        "Galvanometer voltage VG = 0 V, and Rx = (R2 · R3) / R1",
        "Galvanometer voltage VG = Vin, and Rx = R1 + R2 + R3",
        "Galvanometer current is at its maximum value, and Rx = R1 / (R2 · R3)",
        "All four resistors must be exactly equal to 100 Ω"
      ],
      correctIndex: 0,
      explanation: "When bridge nodes B and D are at identical electric potentials (V_B = V_D, so V_G = 0 V), the ratio arms satisfy R1/R2 = R3/Rx, yielding Rx = (R2 · R3) / R1."
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
    },
    {
      id: "q4",
      question: "According to Charles's Law, if an enclosed flexible container of gas at constant pressure has its absolute temperature doubled from 300 K to 600 K, what happens to its volume?",
      options: [
        "The volume doubles ($V_2 = 2 V_1$)",
        "The volume halves ($V_2 = 0.5 V_1$)",
        "The volume quadruples ($V_2 = 4 V_1$)",
        "The volume remains unchanged because pressure is constant"
      ],
      correctIndex: 0,
      explanation: "Charles's Law states that at constant pressure and molar quantity, gas volume is directly proportional to absolute temperature ($V_1/T_1 = V_2/T_2$). Doubling absolute temperature (300 K to 600 K) doubles the volume."
    },
    {
      id: "q5",
      question: "According to the Maxwell-Boltzmann distribution and Kinetic Molecular Theory ($v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$), how does the root-mean-square speed of gas molecules change if the molar mass is quadrupled (e.g. comparing Helium $M = 4\\text{ g/mol}$ to Methane $M = 16\\text{ g/mol}$) at the same temperature?",
      options: [
        "The rms speed is halved ($v_{\\text{rms}}' = \\frac{1}{2} v_{\\text{rms}}$)",
        "The rms speed is doubled ($v_{\\text{rms}}' = 2 v_{\\text{rms}}$)",
        "The rms speed is quartered ($v_{\\text{rms}}' = \\frac{1}{4} v_{\\text{rms}}$)",
        "The rms speed remains identical because temperature is the same"
      ],
      correctIndex: 0,
      explanation: "Because $v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$, the molecular speed is inversely proportional to the square root of molar mass ($\\sqrt{M}$). Quadrupling molar mass results in $\\sqrt{1/4} = 1/2$, so the heavier gas molecules move at half the average speed."
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
    },
    {
      id: "q4",
      question: "According to Ernst Abbe's diffraction limit criterion ($d = \\frac{0.61\\lambda}{\\text{NA}}$), what adjustments will improve (decrease) the minimum resolvable distance $d$ between two specimen structures?",
      options: [
        "Using light with a shorter wavelength (e.g. blue/violet) and an objective with higher Numerical Aperture (NA)",
        "Using light with a longer wavelength (infrared) and lower Numerical Aperture",
        "Increasing the ocular magnification while keeping the objective lens unchanged",
        "Closing the condenser iris diaphragm to a pinpoint opening"
      ],
      correctIndex: 0,
      explanation: "Resolving power is mathematically governed by $d = \\frac{0.61\\lambda}{\\text{NA}}$. Decreasing wavelength $\\lambda$ (such as using blue filters) and increasing Numerical Aperture (NA) minimizes $d$, allowing smaller structures to be clearly resolved."
    },
    {
      id: "q5",
      question: "When switching the revolving nosepiece from low power (10×) to high power (40×) objective, what happens to the diameter of the field of view and the image brightness?",
      options: [
        "The field of view diameter shrinks proportionally by a factor of 4, and the image becomes dimmer (requiring more light)",
        "The field of view diameter increases 4× and brightness increases",
        "The field of view remains constant but depth of field becomes infinite",
        "The field of view becomes completely dark unless immersion oil is applied"
      ],
      correctIndex: 0,
      explanation: "Field of view diameter is inversely proportional to magnification ($M_1 D_1 = M_2 D_2$). Increasing magnification from 10× to 40× narrows the field of view to 1/4 its previous diameter and distributes fewer photons across the larger visual angle, dimming the view."
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
    },
    {
      id: "q4",
      question: "Down a group (column) from top to bottom on the periodic table, the first ionization energy generally:",
      options: [
        "Decreases because valence electrons occupy higher principal energy levels with greater nuclear shielding",
        "Increases because the nucleus contains more total protons",
        "Remains constant across all main group elements",
        "Drops to zero for all alkali metals"
      ],
      correctIndex: 0,
      explanation: "Down a group, outer electrons occupy higher principal quantum shells further from the nucleus, shielded by inner electron shells. The effective electrostatic attraction diminishes, so less energy is required to remove the outermost valence electron."
    },
    {
      id: "q5",
      question: "Why do the 4s orbitals fill before the 3d orbitals when building up ground-state electron configurations for Potassium (Z=19) and Calcium (Z=20) according to the Aufbau principle?",
      options: [
        "Because the radial penetration of the 4s orbital gives it a lower average energy level than 3d in neutral atoms before the d-subshell fills",
        "Because 3d orbitals can only hold 2 electrons while 4s holds 10",
        "Because 4s has higher orbital angular momentum than 3d",
        "Because the Pauli exclusion principle prohibits 3d electrons until period 5"
      ],
      correctIndex: 0,
      explanation: "Due to orbital penetration closer to the nucleus, the 4s orbital experiences less shielding and has a slightly lower energy state than the 3d orbital in neutral atoms, so it fills first ([Ar] 4s¹ for K and [Ar] 4s² for Ca)."
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
    },
    {
      id: "q4",
      question: "An insertion or deletion of a single nucleotide within a protein-coding sequence causes a frameshift mutation, which results in:",
      options: [
        "Altering the reading frame of all subsequent downstream codons, typically generating premature stop codons and truncated non-functional proteins",
        "Changing only the single amino acid at the mutation site while preserving all downstream residues",
        "Preventing RNA polymerase from binding to the promoter region",
        "Converting the entire mRNA molecule into double-stranded DNA"
      ],
      correctIndex: 0,
      explanation: "Because genetic code is read non-overlappingly in triplets of three, inserting or deleting 1 or 2 nucleotides shifts the reading frame for all downstream codons, altering the entire following amino acid sequence and usually producing a premature termination STOP codon."
    },
    {
      id: "q5",
      question: "During gene expression, RNA polymerase synthesizes the nascent mRNA transcript in which chemical direction, and ribosomes translate mRNA into polypeptide in which direction?",
      options: [
        "RNA synthesis: 5' → 3'; Ribosome translation: 5' → 3' (N-terminus to C-terminus)",
        "RNA synthesis: 3' → 5'; Ribosome translation: 3' → 5' (C-terminus to N-terminus)",
        "RNA synthesis: 5' → 3'; Ribosome translation: 3' → 5'",
        "RNA synthesis: bidirectional; Ribosome translation: random order"
      ],
      correctIndex: 0,
      explanation: "Nucleic acid polymerization occurs strictly 5' to 3' as the 3'-OH group attacks incoming nucleoside triphosphates. Ribosomes translate the resulting mRNA from 5' to 3', synthesizing the polypeptide chain from the amino-terminal (N-terminal) to carboxyl-terminal (C-terminal) direction."
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
    },
    {
      id: "q4",
      question: "In a dihybrid cross between two heterozygous pea plants for seed shape and color (RrYy × RrYy), what is the expected phenotypic ratio among offspring assuming independent assortment?",
      options: [
        "9 Round Yellow : 3 Round Green : 3 Wrinkled Yellow : 1 Wrinkled Green (9:3:3:1)",
        "3 Round Yellow : 1 Wrinkled Green (3:1)",
        "1 Round Yellow : 1 Round Green : 1 Wrinkled Yellow : 1 Wrinkled Green (1:1:1:1)",
        "15 Dominant : 1 Recessive (15:1)"
      ],
      correctIndex: 0,
      explanation: "Mendel's Law of Independent Assortment predicts that the two gene pairs segregate independently. Multiplying the individual 3:1 probabilities ((3/4 R + 1/4 r)(3/4 Y + 1/4 y)) yields the classic 9/16 : 3/16 : 3/16 : 1/16 dihybrid phenotypic ratio."
    },
    {
      id: "q5",
      question: "When conducting a Chi-Square goodness-of-fit test ($\\chi^2 = \\sum \\frac{(O - E)^2}{E}$) on genetic cross data with 4 phenotypic classes, how many degrees of freedom ($df$) are used, and what does a calculated $\\chi^2$ value lower than the critical value indicate?",
      options: [
        "df = 3 (classes - 1); the null hypothesis of Mendelian segregation cannot be rejected (data fits expected ratios)",
        "df = 4; the experimental sample size was too small",
        "df = 1; the alleles are definitely sex-linked",
        "df = 16; crossing over occurred during prophase I"
      ],
      correctIndex: 0,
      explanation: "Degrees of freedom are defined as df = k - 1 = 4 - 1 = 3. If the calculated χ² is less than the critical threshold (e.g. 7.815 at p = 0.05), the observed variations are statistically consistent with random sampling deviations from Mendelian inheritance."
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
    },
    {
      id: "q4",
      question: "For a molecule with steric number 5 possessing 5 single bonding pairs and 0 lone pairs (such as Phosphorus Pentachloride, $\\text{PCl}_5$, $\\text{AX}_5$), what is its molecular geometry and equatorial vs axial bond angles?",
      options: [
        "Trigonal bipyramidal; 120° equatorial and 90° axial",
        "Octahedral; all 90° angles",
        "Square pyramidal; 90° and 180°",
        "Tetrahedral; 109.5° angles"
      ],
      correctIndex: 0,
      explanation: "With steric number 5 (AX₅), the three equatorial bonds form a planar triangle with 120° angles, while the two axial bonds are oriented perpendicular at 90° to the equatorial plane, producing a trigonal bipyramidal molecular geometry (sp³d hybridization)."
    },
    {
      id: "q5",
      question: "Why is Carbon Dioxide ($\\text{CO}_2$) completely nonpolar ($\\mu = 0\\text{ D}$) despite containing two strongly polar $\\text{C}=\\text{O}$ bonds ($\\Delta\\chi \\approx 0.89$)?",
      options: [
        "Because its linear molecular geometry (AX₂, 180°) causes the two identical bond dipole vectors to cancel symmetrically",
        "Because oxygen cannot hold partial negative charge in the gas phase",
        "Because double bonds never generate dipole moments",
        "Because carbon has a complete valence octet"
      ],
      correctIndex: 0,
      explanation: "Carbon dioxide has steric number 2 with zero lone pairs on the central carbon atom (AX₂), adopting a strictly linear geometry with a 180° bond angle. The two opposing dipole vectors of equal magnitude point in diametrically opposite directions and sum to zero net dipole moment (μ_net = 0)."
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
    },
    {
      id: "q4",
      question: "When Elodea or spinach leaves are illuminated with green light (~550 nm) compared to blue (430 nm) or red (660 nm) light of equal photon irradiance, the rate of oxygen bubble evolution is:",
      options: [
        "Substantially lower because Chlorophyll a and b pigments reflect rather than absorb green wavelengths",
        "Highest because green photons possess the highest kinetic energy",
        "Identical because chloroplasts absorb all visible wavelengths equally",
        "Zero because green light destroys chloroplast thylakoids"
      ],
      correctIndex: 0,
      explanation: "The absorption spectra of Chlorophyll a and b show deep troughs between 500 nm and 600 nm (the green window). Because green wavelengths are mostly reflected or transmitted rather than absorbed, photolysis of water in Photosystem II slows dramatically, minimizing oxygen evolution."
    },
    {
      id: "q5",
      question: "In a plant exposed to saturating light intensity and abundant carbon dioxide at 25°C, increasing the temperature past 45°C causes the photosynthetic rate to drop sharply because:",
      options: [
        "Enzymes such as Rubisco denature and stomata close to prevent excessive water loss",
        "Photons can no longer travel through warm air",
        "Chlorophyll molecules turn into carotenoids",
        "Water photolysis reverses and consumes oxygen"
      ],
      correctIndex: 0,
      explanation: "Photosynthesis is enzymatically driven (especially the Calvin cycle). Exceeding the thermal optimum denatures critical enzymes like Rubisco and damages photosynthetic membrane integrity, while heat-induced stomatal closure limits CO₂ uptake, causing photosynthetic output to crash."
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
    },
    {
      id: "q4",
      question: "In an acid-base neutralization experiment inside a constant-pressure coffee-cup calorimeter, 0.050 moles of water are formed, and the aqueous solution absorbs $2.85\\text{ kJ}$ of heat ($q_{\\text{cal}} = +2.85\\text{ kJ}$). What is the molar enthalpy of neutralization ($\\Delta H_{\\text{neut}}$) per mole of water?",
      options: [
        "ΔH = -57.0 kJ/mol (exothermic)",
        "ΔH = +57.0 kJ/mol (endothermic)",
        "ΔH = -2.85 kJ/mol",
        "ΔH = 0 kJ/mol"
      ],
      correctIndex: 0,
      explanation: "Since the calorimeter absorbed heat (q_cal = +2.85 kJ), the chemical reaction released heat: q_rxn = -2.85 kJ. Dividing by moles of water produced: ΔH = -2.85 kJ / 0.050 mol = -57.0 kJ/mol."
    },
    {
      id: "q5",
      question: "According to Hess's Law of Heat Summation, if a chemical reaction can be expressed as the algebraic sum of several elementary steps, the overall enthalpy change ($\\Delta H_{\\text{rxn}}$) equals:",
      options: [
        "The sum of the enthalpy changes of the individual reaction steps (ΔH_overall = Σ ΔH_steps)",
        "The product of the activation energies of all elementary steps",
        "Zero in all closed thermodynamic systems",
        "The calorimeter heat capacity divided by absolute temperature"
      ],
      correctIndex: 0,
      explanation: "Because enthalpy (H) is a thermodynamic state function, the net change ΔH depends solely on initial and final thermodynamic states, making it independent of the specific reaction pathway. Thus, ΔH_overall = Σ ΔH_steps."
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
    },
    {
      id: "q4",
      question: "In the industrial synthesis of ammonia: $\\text{N}_2\\text{(g)} + 3\\text{H}_2\\text{(g)} \\rightleftharpoons 2\\text{NH}_3\\text{(g)} \\quad (\\Delta H^\\circ = -92.2\\text{ kJ/mol})$, what happens to the equilibrium yield of ammonia if the container volume is decreased (pressure is increased) at constant temperature?",
      options: [
        "Equilibrium shifts to the right (toward NH₃) because 4 moles of gaseous reactant convert into 2 moles of gaseous product, relieving pressure",
        "Equilibrium shifts to the left because higher pressure forces molecules apart",
        "The equilibrium constant Kp increases exponentially",
        "The position of equilibrium remains completely unaffected because mole ratios are fixed"
      ],
      correctIndex: 0,
      explanation: "According to Le Chatelier's principle, increasing pressure by compressing volume shifts the equilibrium toward the side with fewer gas moles (4 mol gas → 2 mol gas) to relieve the stress. Kp remains constant because temperature is unchanged."
    },
    {
      id: "q5",
      question: "If a reacting mixture at a specific instant has a reaction quotient $Q$ greater than the equilibrium constant $K$ ($Q > K$), what spontaneous process occurs to re-establish equilibrium?",
      options: [
        "The net forward reaction accelerates to produce more products",
        "The net reverse reaction proceeds, consuming products and producing reactants until Q = K",
        "The value of K automatically increases until it equals Q",
        "The reaction stops permanently without further change"
      ],
      correctIndex: 1,
      explanation: "When Q > K, there is a higher ratio of products relative to reactants than at equilibrium. To decrease Q until it equals K, the net reverse reaction proceeds spontaneously, consuming excess products and forming reactants."
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
    },
    {
      id: "q4",
      question: "When a standard galvanic cell discharges until it reaches thermodynamic equilibrium ($\\Delta G = 0$), what are the values of the cell potential ($E_{\\text{cell}}$) and reaction quotient ($Q$)?",
      options: [
        "$E_{\\text{cell}} = 0\\text{ V}$ and $Q = K_{\\text{eq}}$ (the cell is completely discharged and cannot deliver electrical work)",
        "$E_{\\text{cell}} = E^\\circ_{\\text{cell}}$ and $Q = 1$",
        "$E_{\\text{cell}} = -1.0\\text{ V}$ and $Q = 0$",
        "$E_{\\text{cell}} = +1.10\\text{ V}$ and $Q = \\infty$"
      ],
      correctIndex: 0,
      explanation: "At chemical equilibrium, ΔG = -nFE_cell = 0, meaning E_cell = 0 V (dead battery). At this point, the instantaneous reaction quotient equals the chemical equilibrium constant (Q = K_eq)."
    },
    {
      id: "q5",
      question: "Given standard reduction potentials $E^\\circ(\\text{Ag}^+/\\text{Ag}) = +0.80\\text{ V}$ and $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V}$, what is $E^\\circ_{\\text{cell}}$ for the spontaneous reaction $\\text{Cu(s)} + 2\\text{Ag}^+\\text{(aq)} \\to \\text{Cu}^{2+}\\text{(aq)} + 2\\text{Ag(s)}$?",
      options: [
        "$E^\\circ_{\\text{cell}} = +0.46\\text{ V} \\quad (E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = +0.80\\text{ V} - 0.34\\text{ V})$",
        "$E^\\circ_{\\text{cell}} = +1.14\\text{ V}$",
        "$E^\\circ_{\\text{cell}} = +1.26\\text{ V} \\quad (2 \\times 0.80\\text{ V} - 0.34\\text{ V})$",
        "$E^\\circ_{\\text{cell}} = -0.46\\text{ V}$"
      ],
      correctIndex: 0,
      explanation: "Standard cell potential is E°_cell = E°_cathode - E°_anode = +0.80 V - 0.34 V = +0.46 V. Because reduction potential is an intensive property, multiplying the silver half-reaction by 2 does not multiply its standard reduction potential."
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
    },
    {
      id: "q4",
      question: "For an ideal simple pendulum oscillating at small angles ($\\theta < 15^\\circ$), how does doubling the bob mass $m$ while keeping the string length $L$ constant affect its oscillation period $T$?",
      options: [
        "The period remains strictly unchanged ($T = 2\\pi\\sqrt{L/g}$)",
        "The period doubles ($2T$)",
        "The period is multiplied by $\\sqrt{2}$",
        "The period is halved (½T)"
      ],
      correctIndex: 0,
      explanation: "Because gravitational driving torque and inertial mass cancel out exactly ($m g L \\sin\\theta \\approx m L^2 \\ddot{\\theta} \\implies \\ddot{\\theta} + \\frac{g}{L}\\theta = 0$), the period of a simple pendulum depends solely on length $L$ and gravitational acceleration $g$, completely independent of bob mass $m$."
    },
    {
      id: "q5",
      question: "When viscous damping ($F_d = -b v$) is introduced into a harmonic oscillator, what happens to the oscillation amplitude and total mechanical energy over time?",
      options: [
        "Amplitude decays exponentially ($A(t) = A_0 e^{-\\frac{b}{2m}t}$) as mechanical energy is continuously dissipated as heat",
        "Amplitude remains constant while frequency shifts to infinity",
        "Total mechanical energy is strictly conserved and oscillation continues forever",
        "The oscillator instantaneously halts at the maximum positive displacement point"
      ],
      correctIndex: 0,
      explanation: "Viscous resistance continuously performs negative work on the oscillating mass ($W_d = \\int -b v^2 dt < 0$), causing the envelope amplitude to decay exponentially as $e^{-\\gamma t}$ (where $\\gamma = \\frac{b}{2m}$) and transferring mechanical energy into thermal energy."
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
    },
    {
      id: "q4",
      question: "When stopping potential $V_{\\text{stop}}$ is plotted on the vertical axis against incident light frequency $f$ on the horizontal axis ($V_{\\text{stop}} = \\frac{h}{e}f - \\frac{\\Phi}{e}$), what physical quantity is determined from the slope of the linear graph?",
      options: [
        "The ratio of Planck's constant to elementary charge ($h/e$)",
        "The speed of light in vacuum $c$",
        "Avogadro's constant $N_A$",
        "The electron rest mass $m_e$"
      ],
      correctIndex: 0,
      explanation: "Rearranging Einstein's equation gives $V_{\\text{stop}} = (h/e)f - (\\Phi/e)$. The slope of the line equals $h/e$, which Robert Millikan verified experimentally to provide direct precision measurement of Planck's constant."
    },
    {
      id: "q5",
      question: "If a photoelectron is emitted with kinetic energy $K$, what is its corresponding de Broglie matter wavelength?",
      options: [
        "$\\lambda = \\frac{h}{\\sqrt{2 m_e K}}$",
        "$\\lambda = \\frac{h K}{m_e c}$",
        "$\\lambda = \\frac{h c}{K}$",
        "$\\lambda = \\frac{2 m_e K}{h^2}$"
      ],
      correctIndex: 0,
      explanation: "By de Broglie's relation $\\lambda = h/p$. For a non-relativistic electron, kinetic energy $K = p^2 / (2m_e) \\implies p = \\sqrt{2m_e K}$. Substituting momentum yields $\\lambda = \\frac{h}{\\sqrt{2m_e K}}$."
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
    },
    {
      id: "q4",
      question: "When a charged particle enters a uniform magnetic field $\\vec{B}$ at an oblique angle $\\theta$ ($0^\\circ < \\theta < 90^\\circ$) relative to the field lines, what trajectory does it follow?",
      options: [
        "A helical (corkscrew) trajectory around the magnetic field lines with constant pitch",
        "A parabolic trajectory identical to gravitational projectile motion",
        "An exponentially expanding hyperbolic spiral",
        "A straight line completely undeflected by the magnetic field"
      ],
      correctIndex: 0,
      explanation: "The parallel velocity component $v_\\parallel = v\\cos\\theta$ experiences zero magnetic force ($v_\\parallel \\times B = 0$), maintaining constant translation along field lines. The perpendicular component $v_\\perp = v\\sin\\theta$ undergoes uniform circular motion, resulting in a helix."
    },
    {
      id: "q5",
      question: "In J.J. Thomson's specific charge experiment, an electron accelerated through potential difference $V$ enters a perpendicular magnetic field $B$ and curves with radius $r$. What is the formula for specific charge $e/m$?",
      options: [
        "$\\frac{e}{m} = \\frac{2 V}{B^2 r^2}$",
        "$\\frac{e}{m} = \\frac{V^2}{2 B r}$",
        "$\\frac{e}{m} = \\frac{B^2 r^2}{2 V}$",
        "$\\frac{e}{m} = \\frac{2 B V}{r^2}$"
      ],
      correctIndex: 0,
      explanation: "Equating kinetic energy $eV = \\frac{1}{2}mv^2$ with circular magnetic deflection $r = \\frac{mv}{eB} \\implies v = \\frac{eBr}{m}$ yields $v^2 = \\frac{2eV}{m} = \\frac{e^2 B^2 r^2}{m^2}$. Canceling $e/m$ gives $\\frac{e}{m} = \\frac{2V}{B^2 r^2}$."
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
    },
    {
      id: "q4",
      question: "In a Lineweaver-Burk double-reciprocal plot ($1/V_0$ vs $1/[S]$), what kinetic parameters are directly represented by the y-intercept and x-intercept?",
      options: [
        "$\\text{y-intercept} = \\frac{1}{V_{\\max}}$ and $\\text{x-intercept} = -\\frac{1}{K_m}$",
        "$\\text{y-intercept} = V_{\\max}$ and $\\text{x-intercept} = K_m$",
        "$\\text{y-intercept} = \\frac{K_m}{V_{\\max}}$ and $\\text{x-intercept} = 0$",
        "$\\text{y-intercept} = -\\frac{1}{K_m}$ and $\\text{x-intercept} = \\frac{1}{V_{\\max}}$"
      ],
      correctIndex: 0,
      explanation: "From $\\frac{1}{V_0} = \\left(\\frac{K_m}{V_{\\max}}\\right)\\frac{1}{[S]} + \\frac{1}{V_{\\max}}$, the vertical axis intercept ($1/[S] = 0$) is $1/V_{\\max}$, and setting $1/V_0 = 0$ gives horizontal intercept $-1/K_m$."
    },
    {
      id: "q5",
      question: "How does a pure non-competitive inhibitor (which binds with equal affinity to both free enzyme E and ES complex at an allosteric site) alter $V_{\\max}$ and $K_m$?",
      options: [
        "Decreases $V_{\\max}$ while leaving $K_m$ unchanged",
        "Increases $K_m$ while leaving $V_{\\max}$ unchanged",
        "Increases both $V_{\\max}$ and $K_m$",
        "Decreases $K_m$ while increasing $V_{\\max}$"
      ],
      correctIndex: 0,
      explanation: "Non-competitive inhibitors do not compete with substrate for active site binding, leaving substrate affinity ($K_m$) unchanged. However, by inactivating bound enzyme complexes, overall catalytic turnover decreases, lowering $V_{\\max}$."
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
    },
    {
      id: "q4",
      question: "The Respiratory Quotient ($RQ = \\frac{\\text{moles of CO}_2\\text{ produced}}{\\text{moles of O}_2\\text{ consumed}}$) for the complete aerobic oxidation of glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\to 6\\text{CO}_2 + 6\\text{H}_2\\text{O}$) equals:",
      options: [
        "$RQ = 1.0 \\quad (6\\text{ CO}_2 / 6\\text{ O}_2)$",
        "$RQ = 0.70$ (characteristic of pure triglycerides)",
        "$RQ = 0.82$ (characteristic of mixed proteins)",
        "$RQ = 0.0$ (no carbon dioxide is produced)"
      ],
      correctIndex: 0,
      explanation: "From the balanced stoichiometric equation for glucose aerobic oxidation, 6 moles of CO₂ are produced for every 6 moles of O₂ consumed, giving an RQ of 6/6 = 1.0. Fats yield an RQ of approximately 0.7 due to their lower oxygen content."
    },
    {
      id: "q5",
      question: "If a chemical uncoupler like 2,4-dinitrophenol (DNP) permeabilizes the inner mitochondrial membrane to protons ($H^+$), what effect does this have on electron transport and ATP synthesis?",
      options: [
        "Oxygen consumption continues or accelerates, but ATP synthesis collapses because the proton gradient is dissipated as heat",
        "Both oxygen consumption and electron transport instantly halt",
        "ATP synthase runs in reverse to synthesize extra glucose",
        "Cytochrome c is permanently destroyed"
      ],
      correctIndex: 0,
      explanation: "DNP is a lipid-soluble proton ionophore that shuttles protons across the inner mitochondrial membrane, bypassing ATP synthase. This dissipates the proton motive force, so ATP cannot be generated; however, electron transport runs uninhibited at maximum rate to attempt restoring the gradient, releasing energy solely as metabolic heat."
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
    },
    {
      id: "q4",
      question: "If a solution in a standard 1.00 cm cuvette has an optical absorbance of $A = 0.400$, what will the measured absorbance be if the sample is transferred to a 2.00 cm cuvette (keeping concentration and wavelength identical)?",
      options: [
        "$A = 0.800$ (absorbance doubles proportionally with path length $b$)",
        "$A = 0.200$ (absorbance halves)",
        "$A = 0.400$ (absorbance is independent of cell geometry)",
        "$A = 1.600$ (absorbance quadruples)"
      ],
      correctIndex: 0,
      explanation: "By the Beer-Lambert Law $A = \\varepsilon \\cdot b \\cdot c$, absorbance is strictly linear with respect to optical path length $b$. Doubling path length from 1.00 cm to 2.00 cm doubles the number of light-absorbing solute particles in the optical path, doubling absorbance to 0.800."
    },
    {
      id: "q5",
      question: "Why does the calibration plot of absorbance versus concentration deviate negatively from linearity (flattens out) at very high solute concentrations ($c > 0.01\\text{ M}$ or $A > 2.0$)?",
      options: [
        "Electrostatic interactions between solute molecules alter their charge distribution and refractive index, and stray instrument light becomes significant",
        "Photons move faster through concentrated solutions",
        "The cuvette dissolves into the solvent",
        "Concentrated solutes stop absorbing photons entirely"
      ],
      correctIndex: 0,
      explanation: "At concentrations above ~0.01 M, inter-ionic and molecular interactions alter the local electronic environment and refractive index (η), changing the effective molar absorptivity ε. Additionally, at $A > 2.0$, less than 1% of light is transmitted, making instrument stray light and detector dark-current limits dominant causes of negative deviation."
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
    },
    {
      id: "q4",
      question: "The radioactive decay constant $\\lambda$ and half-life $t_{1/2}$ are related by which fundamental formula?",
      options: [
        "$\\lambda = \\frac{\\ln(2)}{t_{1/2}} \\approx \\frac{0.693}{t_{1/2}}$",
        "$\\lambda = t_{1/2} \\cdot \\ln(2)$",
        "$\\lambda = \\frac{1}{2 \\cdot t_{1/2}}$",
        "$\\lambda = (t_{1/2})^2$"
      ],
      correctIndex: 0,
      explanation: "From the first-order exponential decay law $N(t) = N_0 e^{-\\lambda t}$, setting $N(t)/N_0 = 1/2$ at $t = t_{1/2}$ yields $1/2 = e^{-\\lambda t_{1/2}} \\implies \\ln(2) = \\lambda t_{1/2} \\implies \\lambda = \\frac{\\ln(2)}{t_{1/2}} \\approx \\frac{0.693}{t_{1/2}}$."
    },
    {
      id: "q5",
      question: "Gamma ($\\gamma$) decay occurs when an excited nucleus transitions to a lower nuclear energy state. Gamma radiation consists of:",
      options: [
        "High-energy, uncharged electromagnetic photons requiring dense materials like lead or concrete for effective attenuation",
        "Positively charged helium nuclei deflected easily by magnetic fields",
        "High-speed electrons that ionize water rapidly",
        "Heavy neutral hadrons that decay into pions"
      ],
      correctIndex: 0,
      explanation: "Gamma rays are high-frequency electromagnetic photons emitted from an excited nucleus ($A$ and $Z$ remain unchanged). Because they have zero mass and zero charge, they do not interact via Coulomb forces, giving them immense penetration power that necessitates high-Z shielding such as lead."
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
    },
    {
      id: "q4",
      question: "When 5.00 g of an unknown non-electrolyte solute is dissolved in 100.0 g of water ($K_f = 1.86^\\circ\\text{C}\\cdot\\text{kg/mol}$), the freezing point drops by $1.86^\\circ\\text{C}$. What is the molar mass of the solute?",
      options: [
        "$50.0\\text{ g/mol}$",
        "$100.0\\text{ g/mol}$",
        "$25.0\\text{ g/mol}$",
        "$200.0\\text{ g/mol}$"
      ],
      correctIndex: 0,
      explanation: "From $\\Delta T_f = K_f \\cdot m \\implies 1.86 = 1.86 \\cdot m \\implies m = 1.00\\text{ mol/kg}$. Molality is moles solute per kg solvent: $1.00\\text{ mol/kg} = \\frac{n_{\\text{solute}}}{0.100\\text{ kg}} \\implies n_{\\text{solute}} = 0.100\\text{ mol}$. Molar mass $M = \\frac{5.00\\text{ g}}{0.100\\text{ mol}} = 50.0\\text{ g/mol}$."
    },
    {
      id: "q5",
      question: "According to the van 't Hoff equation for osmotic pressure ($\\Pi = i M R T$), what happens to osmotic pressure when the absolute temperature $T$ of the solution is doubled (at constant concentration)?",
      options: [
        "Osmotic pressure doubles ($2\\Pi$)",
        "Osmotic pressure is halved (½$\\Pi$)",
        "Osmotic pressure quadruples ($4\\Pi$)",
        "Osmotic pressure drops to zero"
      ],
      correctIndex: 0,
      explanation: "In the van 't Hoff relation $\\Pi = i M R T$, osmotic pressure is directly proportional to absolute temperature in Kelvin ($T$). Doubling $T$ doubles the kinetic bombardment and thermal expansion pressure of solute particles across the semipermeable membrane."
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
    },
    {
      id: "q4",
      question: "According to Zaitsev's rule, when an alkyl halide undergoes base-promoted E2 elimination with a non-bulky base (such as $\\text{NaOCH}_3$), the major alkene product is:",
      options: [
        "The more substituted, thermodynamically more stable alkene",
        "The least substituted alkene (Hofmann product)",
        "Exclusively a terminal alkyne",
        "A cyclic ether"
      ],
      correctIndex: 0,
      explanation: "Zaitsev's rule states that base-induced elimination predominantly yields the more substituted, thermodynamically more stable alkene due to hyperconjugation and alkyl group stabilization of the carbon-carbon double bond."
    },
    {
      id: "q5",
      question: "In the electrophilic addition of hydrogen chloride ($\\text{HCl}$) to propene ($\\text{CH}_3\\text{-CH=CH}_2$), Markovnikov's rule predicts that 2-chloropropane is the major product because:",
      options: [
        "Protonation occurs on the terminal carbon to form the more stable secondary carbocation intermediate ($\\text{CH}_3\\text{-CH}^+\\text{-CH}_3$)",
        "Chlorine is larger than hydrogen and repels the secondary carbon",
        "The primary carbocation is more stable than the secondary carbocation",
        "The reaction proceeds via a radical mechanism"
      ],
      correctIndex: 0,
      explanation: "Electrophilic attack by $H^+$ adds to the less substituted carbon ($\\text{CH}_2$) so that positive charge resides on the more substituted carbon, yielding a stable $2^\\circ$ carbocation (stabilized by hyperconjugation) rather than an unstable $1^\\circ$ carbocation. Chloride then attacks the secondary carbocation to form 2-chloropropane."
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
    },
    {
      id: "q4",
      question: "How do fluorescent dyes such as Ethidium Bromide or GelGreen enable nucleic acid visualization in an agarose gel under UV/blue light transillumination?",
      options: [
        "They intercalate between stacked nitrogenous base pairs, dramatically increasing their fluorescence quantum yield when irradiated with excitation light",
        "They chemically cleave the DNA fragments into fluorescent nucleosides",
        "They react with agarose polymer chains to make the gel glow",
        "They oxidize the phosphate backbone to produce chemiluminescence"
      ],
      correctIndex: 0,
      explanation: "Planar fluorophores like ethidium bromide intercalate into the hydrophobic interior between adjacent nitrogenous base pairs of double-stranded DNA. In this immobilized environment, vibrational decay is inhibited, multiplying fluorescence intensity ~20- to 100-fold upon UV/blue excitation."
    },
    {
      id: "q5",
      question: "Why is a calibrated DNA ladder (molecular weight standard) always loaded into an adjacent lane during agarose gel electrophoresis?",
      options: [
        "To provide reference fragments of known base-pair lengths and masses, allowing empirical interpolation of unknown sample fragment sizes",
        "To provide extra electrical conductance across the gel tray",
        "To neutralize buffer pH gradients across the cathode",
        "To prevent thermal convection currents from warping bands"
      ],
      correctIndex: 0,
      explanation: "A DNA ladder contains pre-measured DNA fragments of standardized sizes. By plotting migration distance against log₁₀(bp) of ladder bands, a calibration curve is constructed to determine the exact base-pair sizes of unknown experimental samples."
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
    },
    {
      id: "q4",
      question: "Which ecological characteristics distinguish an r-selected species (such as bacteria or insects) from a K-selected species (such as elephants or humans)?",
      options: [
        "r-selected species exhibit high biotic potential, rapid maturation, large numbers of small offspring, and minimal parental investment",
        "r-selected species invest heavily in parental care of very few offspring near carrying capacity",
        "K-selected species have explosive exponential booms and catastrophic crashes",
        "r-selected species never experience mortality"
      ],
      correctIndex: 0,
      explanation: "r-selected species prioritize maximizing reproductive rate ($r$): early sexual maturity, high fecundity, small body size, and little parental care in unstable environments. K-selected species emphasize competitive ability near carrying capacity ($K$): low fecundity, large body size, and prolonged parental investment."
    },
    {
      id: "q5",
      question: "Gause's Competitive Exclusion Principle dictates that when two competing species occupy the exact same fundamental ecological niche in a stable environment:",
      options: [
        "One species will inevitably outcompete and displace the other, unless resource partitioning or niche differentiation evolves",
        "Both species will indefinitely coexist at exactly equal population sizes",
        "Both species instantly mutate to consume different elements",
        "Total carrying capacity K doubles automatically"
      ],
      correctIndex: 0,
      explanation: "If two species compete for identical limiting resources without niche differentiation, the more efficient competitor will drive the other to local extinction (complete exclusion) or force evolutionary resource partitioning."
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
    },
    {
      id: "q4",
      question: "During the falling phase (repolarization) of the neuronal action potential, which ion conductances drive the membrane potential back toward resting values?",
      options: [
        "Inactivation of voltage-gated Na⁺ channels combined with delayed opening of voltage-gated K⁺ channels, causing rapid outward K⁺ efflux",
        "Inward pumping of calcium by ATP synthase",
        "Active influx of chloride ions through leak channels",
        "Opening of extra sodium channels"
      ],
      correctIndex: 0,
      explanation: "Repolarization is achieved by the closure of voltage-gated Na⁺ inactivation gates (h-gates) halting Na⁺ entry, alongside the opening of delayed-rectifier voltage-gated K⁺ channels allowing intracellular K⁺ to rush out down its electrochemical gradient."
    },
    {
      id: "q5",
      question: "Why does myelin sheath insulation (provided by Schwann cells in the PNS or oligodendrocytes in the CNS) accelerate action potential propagation velocity along an axon?",
      options: [
        "It increases membrane resistance and decreases capacitance, forcing depolarization to leap electrotonically between Nodes of Ranvier (saltatory conduction)",
        "It heats the axon to increase ion kinetic energy",
        "It generates photons that travel at light speed along the axoplasm",
        "It increases intracellular sodium concentration by ten-fold"
      ],
      correctIndex: 0,
      explanation: "Myelin acts as an electrical insulator: it increases effective membrane resistance (R_m) and decreases membrane capacitance (C_m), minimizing trans-membrane charge leakage. Passive electrotonic current spreads rapidly beneath the myelin, regenerating active action potentials exclusively at unmyelinated Nodes of Ranvier (saltatory conduction)."
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
    },
    {
      id: "q4",
      question: "According to the Parallel Axis Theorem ($I = I_{\\text{cm}} + M d^2$), the moment of inertia of a rigid body of mass $M$ about any axis parallel to an axis through its center of mass:",
      options: [
        "Is always strictly greater than $I_{\\text{cm}}$ by the quantity $M d^2$ (where $d$ is the perpendicular distance between axes)",
        "Is always less than $I_{\\text{cm}}$",
        "Equals zero when $d$ is maximized",
        "Is independent of the center-of-mass moment of inertia"
      ],
      correctIndex: 0,
      explanation: "The moment of inertia about the center of mass ($I_{\\text{cm}}$) is the absolute minimum possible for that orientation. Moving the rotation axis by perpendicular distance $d$ adds $M d^2$ to the moment of inertia: $I = I_{\\text{cm}} + M d^2$."
    },
    {
      id: "q5",
      question: "For a uniform solid cylinder ($I = \\frac{1}{2} M R^2$) rolling without slipping at speed $v$, what fraction of its total mechanical kinetic energy is stored in rotational kinetic energy?",
      options: [
        "One-third (33.3%, $\\text{KE}_{\\text{rot}} = \\frac{1}{3}\\text{KE}_{\\text{total}}$)",
        "One-half (50.0%)",
        "Two-thirds (66.7%)",
        "One-quarter (25.0%)"
      ],
      correctIndex: 0,
      explanation: "Translational kinetic energy is $\\text{KE}_{\\text{trans}} = \\frac{1}{2} M v^2$. Rotational kinetic energy is $\\text{KE}_{\\text{rot}} = \\frac{1}{2} I \\omega^2 = \\frac{1}{2} (\\frac{1}{2} M R^2) (\\frac{v}{R})^2 = \\frac{1}{4} M v^2$. Total kinetic energy is $\\text{KE}_{\\text{total}} = \\frac{1}{2} M v^2 + \\frac{1}{4} M v^2 = \\frac{3}{4} M v^2$. The fraction in rotation is $\\frac{1/4}{3/4} = \\frac{1}{3}$ (33.3%)."
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
    },
    {
      id: "q4",
      question: "By analogy to Ohm's Law in electrical circuits ($I = \\frac{\\Delta V}{R}$), thermal conduction rate through a multi-layer composite wall is modeled as $\\frac{dQ}{dt} = \\frac{\\Delta T}{R_{\\text{total}}}$. For two insulating slabs in series, total thermal resistance $R_{\\text{total}}$ equals:",
      options: [
        "$R_{\\text{total}} = R_1 + R_2 = \\frac{L_1}{k_1 A} + \\frac{L_2}{k_2 A}$",
        "$R_{\\text{total}} = \\frac{R_1 R_2}{R_1 + R_2}$",
        "$R_{\\text{total}} = (R_1 + R_2)^2$",
        "$R_{\\text{total}} = k_1 k_2 A$"
      ],
      correctIndex: 0,
      explanation: "In series heat conduction, the same conductive heat current $\\frac{dQ}{dt}$ passes sequentially through both layers, and temperature drops sum: $\\Delta T = \\Delta T_1 + \\Delta T_2$. Therefore, thermal resistances add linearly: $R_{\\text{total}} = R_1 + R_2 = \\frac{L_1}{k_1 A} + \\frac{L_2}{k_2 A}$."
    },
    {
      id: "q5",
      question: "Thermal diffusivity $\\alpha = \\frac{k}{\\rho \\cdot c_p}$ quantifies how rapidly heat diffuses through a material during transient warming/cooling. A material with high thermal conductivity $k$ but very low volumetric heat capacity ($\\rho \\cdot c_p$) will:",
      options: [
        "Reach thermal equilibrium rapidly because it conducts heat swiftly while storing very little thermal energy per unit volume",
        "Take an infinitely long time to warm up",
        "Stop heat conduction completely",
        "Undergo instantaneous phase change"
      ],
      correctIndex: 0,
      explanation: "Thermal diffusivity measures the rate of transfer of thermal energy relative to energy storage. High conductivity transfers heat rapidly, and low volumetric heat capacity requires little energy absorption to change temperature, yielding rapid transient thermal equilibration."
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
    },
    {
      id: "q4",
      question: "For a first-order decomposition reaction ($\\text{A} \\rightarrow \\text{Products}$) with rate constant $k = 0.0693\\text{ s}^{-1}$, what is the half-life ($t_{1/2}$) of the reaction, and how does it change as the initial concentration $[\\text{A}]_0$ decreases?",
      options: [
        "$t_{1/2} = 10.0\\text{ s}$; the half-life remains strictly constant regardless of initial reactant concentration",
        "$t_{1/2} = 14.4\\text{ s}$; the half-life decreases proportionally with $[\\text{A}]_0$",
        "$t_{1/2} = 6.93\\text{ s}$; the half-life doubles when $[\\text{A}]_0$ is halved",
        "$t_{1/2} = 20.0\\text{ s}$; the half-life increases logarithmically"
      ],
      correctIndex: 0,
      explanation: "For a first-order reaction, the integrated rate law yields $t_{1/2} = \\frac{\\ln(2)}{k} = \\frac{0.693}{0.0693\\text{ s}^{-1}} = 10.0\\text{ s}$. Crucially, first-order half-life is completely independent of initial reactant concentration $[\\text{A}]_0$."
    },
    {
      id: "q5",
      question: "Consider a two-step reaction mechanism: Step 1 (slow, rate-determining): $\\text{NO}_2 + \\text{NO}_2 \\rightarrow \\text{NO}_3 + \\text{NO}$; Step 2 (fast): $\\text{NO}_3 + \\text{CO} \\rightarrow \\text{NO}_2 + \\text{CO}_2$. What is the overall stoichiometric equation and the experimental rate law predicted by this mechanism?",
      options: [
        "Overall: $\\text{NO}_2 + \\text{CO} \\rightarrow \\text{NO} + \\text{CO}_2$; Rate Law: $\\text{Rate} = k[\\text{NO}_2]^2$",
        "Overall: $2\\text{NO}_2 + \\text{CO} \\rightarrow \\text{NO} + \\text{CO}_2$; Rate Law: $\\text{Rate} = k[\\text{NO}_2][\\text{CO}]$",
        "Overall: $\\text{NO}_2 + \\text{CO} \\rightarrow \\text{NO} + \\text{CO}_2$; Rate Law: $\\text{Rate} = k[\\text{NO}_3][\\text{CO}]$",
        "Overall: $\\text{NO}_3 + \\text{CO} \\rightarrow \\text{NO}_2 + \\text{CO}_2$; Rate Law: $\\text{Rate} = k[\\text{NO}_2]^2[\\text{CO}]$"
      ],
      correctIndex: 0,
      explanation: "Adding both elementary steps and cancelling the reactive intermediate $\\text{NO}_3$ and one $\\text{NO}_2$ yields $\\text{NO}_2 + \\text{CO} \\rightarrow \\text{NO} + \\text{CO}_2$. The overall reaction rate is governed by the slow rate-determining step, which involves a bimolecular collision between two $\\text{NO}_2$ molecules, yielding $\\text{Rate} = k[\\text{NO}_2]^2$."
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
    },
    {
      id: "q4",
      question: "A 0.40 kg glider travelling at $+1.5\\text{ m/s}$ hits an elastic bumper and rebounds at $-1.2\\text{ m/s}$. If the optical collision sensor records an interaction duration of $\\Delta t = 0.030\\text{ s}$, what was the magnitude of the average force ($\\bar{F}$) exerted by the bumper on the glider?",
      options: [
        "$\\bar{F} = 36.0\\text{ N}$ [using $J = m\\Delta v = \\bar{F}\\Delta t$]",
        "$\\bar{F} = 4.0\\text{ N}$",
        "$\\bar{F} = 12.0\\text{ N}$",
        "$\\bar{F} = 1.08\\text{ N}$"
      ],
      correctIndex: 0,
      explanation: "The change in momentum (impulse) is $\\Delta p = m(v_f - v_i) = 0.40\\text{ kg} \\times (-1.2 - 1.5)\\text{ m/s} = 0.40 \\times (-2.7) = -1.08\\text{ kg}\\cdot\\text{m/s}$. By the impulse-momentum theorem $J = \\bar{F}\\Delta t$, the average force magnitude is $|\\bar{F}| = \\frac{|\\Delta p|}{\\Delta t} = \\frac{1.08}{0.030\\text{ s}} = 36.0\\text{ N}$."
    },
    {
      id: "q5",
      question: "Glider 1 ($m_1 = 0.30\\text{ kg}$) moving at $u_1 = +2.0\\text{ m/s}$ collides and sticks ($e = 0.0$) to stationary Glider 2 ($m_2 = 0.60\\text{ kg}$, $u_2 = 0$). What percentage of initial system kinetic energy is converted into non-mechanical forms (heat, sound, deformation) during this collision?",
      options: [
        "$66.7\\%$ kinetic energy loss",
        "$33.3\\%$ kinetic energy loss",
        "$50.0\\%$ kinetic energy loss",
        "$0\\%$ (all kinetic energy is conserved)"
      ],
      correctIndex: 0,
      explanation: "Initial momentum is $p = 0.30 \\times 2.0 = 0.60\\text{ kg}\\cdot\\text{m/s}$. Combined mass is $0.90\\text{ kg}$, giving final velocity $v_f = 0.60 / 0.90 = \\frac{2}{3}\\text{ m/s}$. Initial $KE_i = \\frac{1}{2}(0.30)(2.0)^2 = 0.60\\text{ J}$. Final $KE_f = \\frac{1}{2}(0.90)(\\frac{2}{3})^2 = 0.20\\text{ J}$. Loss = $\\frac{0.60 - 0.20}{0.60} = \\frac{0.40}{0.60} = 66.7\\%$."
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
    },
    {
      id: "q4",
      question: "A conductive slider bar of length $L = 0.25\\text{ m}$ slides horizontally at velocity $v = 4.0\\text{ m/s}$ across frictionless rails in a perpendicular uniform magnetic field $B = 0.80\\text{ T}$. If the rail loop has a total circuit resistance of $R = 2.0\\ \\Omega$, what are the motional EMF ($\\mathcal{E}$) and induced current ($I$)?",
      options: [
        "$\\mathcal{E} = 0.80\\text{ V}$ and $I = 0.40\\text{ A}$ [using $\\mathcal{E} = BLv$ and $I = \\mathcal{E}/R$]",
        "$\\mathcal{E} = 1.60\\text{ V}$ and $I = 0.80\\text{ A}$",
        "$\\mathcal{E} = 0.20\\text{ V}$ and $I = 0.10\\text{ A}$",
        "$\\mathcal{E} = 0.0\\text{ V}$ because magnetic fields do no work on charges"
      ],
      correctIndex: 0,
      explanation: "The motional electromotive force developed across a conductor moving perpendicular to $B$ is $\\mathcal{E} = B L v = 0.80\\text{ T} \\times 0.25\\text{ m} \\times 4.0\\text{ m/s} = 0.80\\text{ V}$. By Ohm's Law, the induced current in the closed circuit is $I = \\frac{\\mathcal{E}}{R} = \\frac{0.80\\text{ V}}{2.0\\ \\Omega} = 0.40\\text{ A}$."
    },
    {
      id: "q5",
      question: "A flat rectangular coil with $N = 100$ turns and loop area $A = 0.050\\text{ m}^2$ rotates at constant angular frequency $\\omega = 60\\pi\\text{ rad/s}$ ($30\\text{ Hz}$) in a uniform field $B = 0.20\\text{ T}$. What is the peak output voltage ($\\mathcal{E}_{\\text{max}}$) generated across the slip rings?",
      options: [
        "$\\mathcal{E}_{\\text{max}} = 188.5\\text{ V}$ [using $\\mathcal{E}_{\\text{max}} = N B A \\omega$]",
        "$\\mathcal{E}_{\\text{max}} = 60.0\\text{ V}$",
        "$\\mathcal{E}_{\\text{max}} = 300.0\\text{ V}$",
        "$\\mathcal{E}_{\\text{max}} = 94.2\\text{ V}$"
      ],
      correctIndex: 0,
      explanation: "Magnetic flux through the rotating loop is $\\Phi_B(t) = B A \\cos(\\omega t)$. By Faraday's Law, $\\mathcal{E}(t) = -N \\frac{d\\Phi_B}{dt} = N B A \\omega \\sin(\\omega t)$. The peak amplitude is $\\mathcal{E}_{\\text{max}} = N B A \\omega = 100 \\times 0.20\\text{ T} \\times 0.050\\text{ m}^2 \\times 60\\pi\\text{ rad/s} = 60\\pi \\approx 188.5\\text{ V}$."
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
    },
    {
      id: "q4",
      question: "Using the Van 't Hoff equation $\\Psi_s = -i C R T$, what is the solute potential of a $0.20\\text{ M}\\ \\text{NaCl}$ solution ($i = 2.0$) at $27^\\circ\\text{C}$ ($300\\text{ K}$) using $R = 0.08314\\text{ L}\\cdot\\text{bar}/(\\text{mol}\\cdot\\text{K})$?",
      options: [
        "$\\Psi_s = -9.98\\text{ bar}$",
        "$\\Psi_s = -4.99\\text{ bar}$",
        "$\\Psi_s = +9.98\\text{ bar}$",
        "$\\Psi_s = -19.95\\text{ bar}$"
      ],
      correctIndex: 0,
      explanation: "$\\Psi_s = -i C R T = -(2.0)(0.20\\text{ mol/L})(0.08314\\text{ L}\\cdot\\text{bar}/(\\text{mol}\\cdot\\text{K}))(300\\text{ K}) = -9.9768\\text{ bar} \\approx -9.98\\text{ bar}$. Solute potential is always negative or zero for pure water."
    },
    {
      id: "q5",
      question: "Although water can diffuse slowly across the hydrophobic phospholipid bilayer via simple diffusion, why do proximal renal tubules and erythrocytes exhibit water permeability rates several orders of magnitude higher?",
      options: [
        "They express abundant transmembrane aquaporin water channels (e.g., AQP1) that facilitate rapid bidirectional passive osmosis",
        "Active transport ATP-dependent water pumps drive water molecules across the membrane",
        "Their cell membranes lack cholesterol, making them freely porous to all polar solutes",
        "Endocytosis and pinocytosis engulf extracellular water continuously"
      ],
      correctIndex: 0,
      explanation: "Aquaporins are specialized homotetrameric channel proteins featuring an aromatic/arginine selectivity filter that allows rapid single-file passage of water molecules ($>10^9\\text{ molecules/s}$) while strictly excluding hydronium ions and solutes."
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
    },
    {
      id: "q4",
      question: "Progression from the G₂ phase into mitosis (M phase) is triggered by the activation of Maturation/Mitosis Promoting Factor (MPF), which consists of:",
      options: [
        "A complex of Cyclin B and Cyclin-Dependent Kinase 1 (CDK1) activated by Cdc25 phosphatase dephosphorylation",
        "A p53 transcription factor complex bound to retinoblastoma protein (pRb)",
        "A dimer of DNA polymerase III and topoisomerase II",
        "Tubulin dimers coupled to dynein motor enzymes"
      ],
      correctIndex: 0,
      explanation: "MPF is a heterodimer composed of Cyclin B (regulatory subunit) and CDK1 (catalytic kinase). As Cyclin B accumulates during G₂, CDK1 is primed by phosphorylation, and full mitotic entry occurs when Cdc25 phosphatase removes inhibitory phosphates from Thr14/Tyr15."
    },
    {
      id: "q5",
      question: "How does cytokinesis fundamentally differ between animal cells and plant cells during late telophase?",
      options: [
        "Animal cells divide via an actomyosin contractile ring forming a cleavage furrow, whereas plant cells construct a cell plate from Golgi-derived vesicles guided by the phragmoplast",
        "Animal cells build a cellulose cell wall from inside out, whereas plant cells pinch inward",
        "Plant cells undergo nuclear envelope breakdown while animal cells maintain an intact nucleus",
        "Animal cells replicate centrosomes while plant cells eliminate their chromosomes"
      ],
      correctIndex: 0,
      explanation: "Because plant cells are constrained by a rigid outer cell wall, they cannot pinch inward. Instead, a microtubule array called the phragmoplast guides Golgi-derived vesicles containing pectin and cellulose to the cell equator to form the cell plate, fusing outward. Animal cells constrict inward using a cortical contractile ring of actin microfilaments and myosin II."
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
    },
    {
      id: "q4",
      question: "Bacterial resistance to beta-lactam antibiotics (such as penicillins and cephalosporins) most frequently arises from which enzyme-mediated biochemical mechanism?",
      options: [
        "Expression of beta-lactamases that enzymatically hydrolyze the four-membered beta-lactam ring, rendering the antibiotic incapable of inhibiting transpeptidases (PBPs)",
        "Phosphorylation of 16S ribosomal RNA subunits",
        "Overexpression of DNA gyrase subunit A",
        "Efflux of lipopolysaccharide into the extracellular biofilm"
      ],
      correctIndex: 0,
      explanation: "Beta-lactamases (including extended-spectrum beta-lactamases, ESBLs, and carbapenemases) catalyze the nucleophilic hydrolysis of the essential amide bond in the beta-lactam ring, preventing the drug from covalently inhibiting bacterial penicillin-binding proteins (PBPs/transpeptidases)."
    },
    {
      id: "q5",
      question: "In antimicrobial therapy, what is the fundamental mechanistic distinction between a bactericidal antibiotic (e.g., Ciprofloxacin) and a bacteriostatic antibiotic (e.g., Tetracycline)?",
      options: [
        "Bactericidal agents actively kill bacteria ($>99.9\\%$ reduction in CFU/mL), whereas bacteriostatic agents inhibit cellular growth and replication, relying on the host immune system to eliminate remaining viable bacteria",
        "Bactericidal agents work exclusively against fungi, while bacteriostatic agents target viruses",
        "Bacteriostatic agents destroy bacterial cell membranes, while bactericidal agents inhibit translation",
        "Bacteriostatic agents are always broad-spectrum, while bactericidal agents are narrow-spectrum"
      ],
      correctIndex: 0,
      explanation: "Bactericidal drugs (e.g., aminoglycosides, fluoroquinolones, beta-lactams) directly induce bacterial lethality (Minimum Bactericidal Concentration MBC $\\approx$ MIC). Bacteriostatic agents (e.g., tetracyclines, macrolides, sulfonamides) reversibly inhibit bacterial protein synthesis or folate metabolism, halting exponential population expansion while requiring host phagocytic leukocytes to clear bacteria."
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
    },
    {
      id: "q4",
      question: "When quantifying low-abundance viral protein antigens (such as HIV p24 or SARS-CoV-2 Spike) in human clinical serum, why is a Double-Antibody Sandwich ELISA preferred over a direct adsorption ELISA?",
      options: [
        "The capture antibody selectively enriches and immobilizes the target antigen from complex crude serum, providing 2- to 5-fold higher analytical specificity and sensitivity than non-specific plate adsorption",
        "Sandwich ELISA does not require any enzymatic substrate or wash steps",
        "Sandwich ELISA eliminates the need for primary antibodies",
        "Direct ELISA only works on RNA, while Sandwich ELISA measures DNA"
      ],
      correctIndex: 0,
      explanation: "In complex biological matrices like whole serum, competing serum proteins saturate polystyrene binding sites during direct coating. A sandwich ELISA uses an immobilized monoclonal capture antibody to specifically extract and concentrate the target antigen, followed by a matched detection antibody recognizing a non-overlapping epitope, maximizing specificity and limit of detection (LOD)."
    },
    {
      id: "q5",
      question: "In quantitative ELISA, a 4-Parameter Logistic (4-PL) calibration curve is constructed from serial twofold dilutions of an IgG reference standard. If an unknown patient serum well exhibits an $\\text{OD}_{450} = 2.85$ that falls on the flat upper plateau above the dynamic linear range, how must the assay be adjusted for accurate quantification?",
      options: [
        "Dilute the patient serum sample (e.g., 1:10 or 1:100) and re-assay so that its optical density falls within the steep, linear quantification range of the standard curve, then multiply by the dilution factor",
        "Double the concentration of sulfuric acid stop solution in the well",
        "Read the microplate at a higher ultraviolet wavelength (260 nm)",
        "Record the concentration as infinite because optical saturation indicates zero error"
      ],
      correctIndex: 0,
      explanation: "At high analyte concentrations, optical density plateaus due to saturation of solid-phase capture antibodies and detector steric hindrance. For accurate interpolation, the specimen must be diluted so that its signal falls within the linear dynamic range ($0.1 < \\text{OD} < 2.0$), and the interpolated concentration is then multiplied by the dilution factor."
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
    },
    {
      id: "q4",
      question: "According to the Dixon and Joly Cohesion-Tension theory, how is sap pulled continuously upward from roots to leaves in trees exceeding 100 meters in height?",
      options: [
        "Evaporative transpiration at menisci in mesophyll cell walls generates extreme negative hydrostatic pressure (tension), pulling continuous water columns upward via intermolecular hydrogen bonding (cohesion) and cell wall adhesion",
        "Active osmotic root pressure pumps water up the trunk under positive pressure exceeding 10 atmospheres",
        "Capillary action alone pulls water upward due to surface tension in wide xylem vessel elements",
        "Phloem companion cells use ATP to pump sucrose and water against gravity"
      ],
      correctIndex: 0,
      explanation: "Transpiration generates negative water potential ($\\Psi$) in the leaf apoplast. This tension pulls the continuous xylem water column upward under negative pressure (often -1.5 to -3.0 MPa), made possible by the immense tensile strength of water provided by intermolecular hydrogen-bonding cohesion."
    },
    {
      id: "q5",
      question: "During severe soil drought, what biochemical signaling mechanism induces rapid stomatal closure to prevent xylem cavitation and desiccation?",
      options: [
        "Roots synthesize abscisic acid (ABA), which is transported via xylem to guard cells, triggering calcium influx and opening of anion/potassium efflux channels, causing guard cell deflation",
        "High auxins induce rapid cell wall loosening, causing guard cells to burst open",
        "Ethylene gas freezes the xylem vessels to stop water flow",
        "Gibberellins stimulate starch synthesis in guard cell vacuoles"
      ],
      correctIndex: 0,
      explanation: "Drought induces root and leaf synthesis of abscisic acid (ABA). ABA binds PYR/RCAR receptors in guard cells, activating SnRK2 kinase, which triggers cytosolic $\\text{Ca}^{2+}$ elevation and opening of S-type anion channels (SLAC1) and voltage-gated outward $\\text{K}^+$ channels (GORK). Solute efflux causes osmotic water loss and turgor collapse, rapidly sealing the stomatal pore."
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
    },
    {
      id: "q4",
      question: "In an acoustic resonance tube with inner bore radius $r$, the acoustic displacement antinode forms slightly outside the physical open lip by an end correction $c \\approx 0.61 r$. How does using the harmonic difference method ($L_2 - L_1$) improve experimental accuracy when determining the speed of sound?",
      options: [
        "Because $L_1 = \\frac{\\lambda}{4} - c$ and $L_2 = \\frac{3\\lambda}{4} - c$, subtracting $(L_2 - L_1) = \\frac{\\lambda}{2}$ completely cancels the systematic end correction error ($c$)",
        "It doubles the frequency of the sound wave inside the tube",
        "It eliminates the need to measure ambient air temperature",
        "It transforms longitudinal sound waves into transverse shear waves"
      ],
      correctIndex: 0,
      explanation: "Both resonance positions share the exact same end correction: $L_1 = \\frac{\\lambda}{4} - c$ and $L_2 = \\frac{3\\lambda}{4} - c$. Subtracting the two measurements yields $L_2 - L_1 = \\frac{3\\lambda}{4} - c - (\\frac{\\lambda}{4} - c) = \\frac{\\lambda}{2}$. The end correction $c$ perfectly subtracts out, eliminating a primary source of systematic instrumental error."
    },
    {
      id: "q5",
      question: "A resonance tube closed at one end (water column) resonates with fundamental frequency $f_1 = 200\\text{ Hz}$. What are the next two possible resonant frequencies for this closed-open tube, and why are even harmonics absent?",
      options: [
        "$f_3 = 600\\text{ Hz}$ and $f_5 = 1000\\text{ Hz}$; because one end must be a displacement node and the other an antinode, only odd harmonics ($f_n = n f_1$, where $n = 1, 3, 5, \\dots$) satisfy the boundary conditions",
        "$f_2 = 400\\text{ Hz}$ and $f_3 = 600\\text{ Hz}$; all integer harmonics are present",
        "$f_2 = 300\\text{ Hz}$ and $f_3 = 500\\text{ Hz}$; even harmonics cancel due to destructive acoustic interference",
        "$f_3 = 800\\text{ Hz}$ and $f_5 = 1600\\text{ Hz}$; acoustic resonance quadruples with harmonic index"
      ],
      correctIndex: 0,
      explanation: "For an air column closed at one end and open at the other, resonant standing wave lengths satisfy $L = \\frac{n\\lambda}{4}$ where $n$ must be an odd integer ($n = 1, 3, 5, \\dots$). Even harmonics would require identical boundary conditions at both ends (either both nodes or both antinodes), which contradicts the closed/open geometry. Thus, $f_3 = 3(200) = 600\\text{ Hz}$ and $f_5 = 5(200) = 1000\\text{ Hz}$."
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
    },
    {
      id: "q4",
      question: "At a distance of $r = 0.30\\text{ m}$ from an isolated point charge $Q = +4.0\\text{ nC}$ ($4.0 \\times 10^{-9}\\text{ C}$), what are the electric potential ($V$) and the electric field magnitude ($E$) in vacuum ($k_e = 8.99 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2$)?",
      options: [
        "$V = 119.9\\text{ V}$ and $E = 399.6\\text{ V/m}$ [using $V = \\frac{k_e Q}{r}$ and $E = \\frac{k_e Q}{r^2}$]",
        "$V = 399.6\\text{ V}$ and $E = 119.9\\text{ V/m}$",
        "$V = 35.9\\text{ V}$ and $E = 10.8\\text{ V/m}$",
        "$V = 12.0\\text{ V}$ and $E = 4.0\\text{ V/m}$"
      ],
      correctIndex: 0,
      explanation: "Electric potential is $V = \\frac{k_e Q}{r} = \\frac{8.988 \\times 10^9 \\times 4.0 \\times 10^{-9}}{0.30} = 119.84\\text{ V} \\approx 119.9\\text{ V}$. Electric field magnitude is $E = \\frac{k_e Q}{r^2} = \\frac{V}{r} = \\frac{119.84\\text{ V}}{0.30\\text{ m}} \\approx 399.6\\text{ V/m}$ (directed radially outward)."
    },
    {
      id: "q5",
      question: "A hollow spherical metal conductor with inner radius $R_1$ and outer radius $R_2$ is placed in a strong external electric field. In static equilibrium, what are the net electric field inside the hollow cavity and the distribution of excess free charge?",
      options: [
        "The electric field inside the cavity is strictly zero ($\\vec{E} = 0$), and any excess charge resides entirely on the exterior conductive surface",
        "The electric field inside the cavity equals the external field because air is a dielectric",
        "Excess charge concentrates along the interior cavity wall to shield internal observers",
        "The electric field oscillates with the plasma frequency of the conductor"
      ],
      correctIndex: 0,
      explanation: "In electrostatic equilibrium, mobile valence electrons in the conductor redistribute instantaneously until $\\vec{E} = 0$ everywhere inside the bulk conductor and within any uncharged hollow cavity (Gauss's law and Faraday cage shielding). All excess net electrostatic charge repels to the outer surface."
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
