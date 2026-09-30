// Edugates-ClipSAT Science Labs - Modular Lab Report & Canvas Exporter Engine
// Generates printable HTML/PDF layouts, standalone downloadable reports,
// and embedded high-resolution Canvas simulation graph snapshots.

import { showToast } from "./toast.js";

/**
 * Safely extracts a high-resolution PNG data URL from a simulation canvas element
 * @param {HTMLCanvasElement|string} [canvasOrId] Canvas element or DOM selector
 * @returns {string|null} Base64 PNG Data URL or null if unavailable
 */
export function captureCanvasAsDataUrl(canvasOrId) {
  try {
    let canvas = null;
    if (typeof canvasOrId === "string") {
      canvas = document.querySelector(canvasOrId);
    } else if (canvasOrId instanceof HTMLCanvasElement) {
      canvas = canvasOrId;
    } else {
      canvas = document.querySelector("#active-lab-mount canvas") || document.querySelector("canvas");
    }

    if (!canvas || !canvas.width || !canvas.height) return null;
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("[AmScLab Exporter] Canvas capture warning:", err);
    return null;
  }
}

/**
 * Assembles a self-contained, print-optimized HTML document for lab reports
 * @param {Object} config Report options and simulation dataset
 * @returns {string} Fully styled standalone HTML markup
 */
export function buildPrintableReportHtml(config = {}) {
  const {
    title = "Virtual Science Laboratory Investigation",
    labId = "science-lab",
    subject = "STEM Science Curriculum",
    inquiryQuestion = "Investigating quantitative relationships and empirical phenomena.",
    parameters = {},
    readings = {},
    headers = [],
    dataRows = [],
    canvasDataUrl = null,
    studentName = "Student Investigator",
    institution = "Edugates International School",
    date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    claim = "State your conclusive claim directly answering the essential inquiry question based on the empirical observations.",
    evidence = "Cite specific numerical values, trial averages, and percentage differentials from the laboratory telemetry above.",
    reasoning = "Connect the quantitative evidence to underlying physical/chemical laws and theoretical models to justify why the data supports the claim."
  } = config;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Official Laboratory Report</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 13px;
      margin: 0;
      padding: 20px;
    }
    .report-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .inst-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .inst-title-box h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 4px 0 2px 0;
    }
    .inst-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: #0284c7;
    }
    .inst-dept {
      font-size: 12px;
      color: #475569;
      font-weight: 600;
    }
    .inst-meta {
      text-align: right;
      font-size: 11.5px;
      color: #334155;
      line-height: 1.4;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .meta-field-label {
      color: #64748b;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }
    .meta-field-val {
      font-weight: 700;
      color: #0f172a;
    }
    .inquiry-callout {
      margin-bottom: 16px;
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
    }
    .inquiry-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #0284c7;
    }
    .inquiry-question {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 800;
      color: #1e293b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin: 16px 0 8px 0;
    }
    .param-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }
    .param-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11.5px;
    }
    .param-name {
      color: #64748b;
      font-weight: 600;
    }
    .param-val {
      color: #0f172a;
      font-weight: 700;
      margin-left: 4px;
    }
    .graph-card {
      margin-bottom: 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      background: #f8fafc;
      text-align: center;
    }
    .graph-card img {
      max-width: 100%;
      height: auto;
      max-height: 280px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background: #070a12;
      display: block;
      margin: 0 auto;
    }
    .graph-caption {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      margin-top: 6px;
    }
    .table-wrapper {
      margin-bottom: 16px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
      padding: 7px 10px;
      font-weight: 800;
      color: #334155;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background: #fbfcfe;
    }
    .cer-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .cer-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
    }
    .cer-box-title {
      font-size: 10.5px;
      text-transform: uppercase;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .cer-box.claim .cer-box-title { color: #0284c7; }
    .cer-box.evidence .cer-box-title { color: #059669; }
    .cer-box.reasoning .cer-box-title { color: #7c3aed; }
    .cer-box-text {
      font-size: 12px;
      color: #1e293b;
    }
    .teacher-box {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      border-top: 2px solid #0f172a;
      padding-top: 12px;
      margin-top: 14px;
      font-size: 11.5px;
    }
    .score-box {
      text-align: right;
    }
    .score-num {
      font-size: 20px;
      font-weight: 900;
      color: #0284c7;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .no-print {
        display: none !important;
      }
      .graph-card img {
        max-height: 250px;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Institutional Header -->
    <header class="inst-header">
      <div class="inst-title-box">
        <div class="inst-subtitle">Edugates-ClipSAT Science Labs • Inspire STEM Curriculum</div>
        <h1>${title}</h1>
        <div class="inst-dept">Virtual Laboratory Investigation • ${subject}</div>
      </div>
      <div class="inst-meta">
        <div><strong>Date:</strong> ${date}</div>
        <div><strong>Status:</strong> Verified Empirical Data</div>
        <div><strong>Lab Suite ID:</strong> ${labId}</div>
      </div>
    </header>

    <!-- Student Metadata Grid -->
    <div class="meta-grid">
      <div>
        <span class="meta-field-label">Student Investigator</span>
        <div class="meta-field-val">${studentName}</div>
      </div>
      <div>
        <span class="meta-field-label">Institution / Section</span>
        <div class="meta-field-val">${institution}</div>
      </div>
      <div>
        <span class="meta-field-label">Workstation Benchmark</span>
        <div class="meta-field-val">60 FPS Hardware-Accelerated Workbench</div>
      </div>
    </div>

    <!-- Essential Inquiry Focus -->
    <div class="inquiry-callout">
      <div class="inquiry-label">Essential Investigation Question</div>
      <div class="inquiry-question">${inquiryQuestion}</div>
    </div>

    <!-- Apparatus & Variables -->
    <div class="section-title">Apparatus &amp; Controlled Variables</div>
    <div class="param-grid">
      ${Object.entries(parameters).map(([k, v]) => `
        <div class="param-item">
          <span class="param-name">${k}:</span>
          <strong class="param-val">${v}</strong>
        </div>
      `).join("")}
      ${Object.entries(readings).map(([k, v]) => `
        <div class="param-item" style="border-color: rgba(56, 189, 248, 0.4); background: #f0f9ff;">
          <span class="param-name" style="color: #0369a1;">${k}:</span>
          <strong class="param-val" style="color: #0284c7;">${v}</strong>
        </div>
      `).join("")}
    </div>

    <!-- Canvas Simulation Graph (if available) -->
    ${canvasDataUrl ? `
      <div class="section-title">Live Simulation Dynamics &amp; Sensor Telemetry Capture</div>
      <div class="graph-card">
        <img src="${canvasDataUrl}" alt="${title} Simulation Graph Capture">
        <div class="graph-caption">Figure 1.0: Real-time graphical sensor capture from 60 FPS interactive simulation canvas.</div>
      </div>
    ` : ""}

    <!-- Empirical Data Table -->
    ${dataRows && dataRows.length > 0 ? `
      <div class="section-title">Empirical Measurement Data Table</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${dataRows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- NGSS CER Argumentation Section -->
    <div class="section-title">Scientific Argumentation (Claim • Evidence • Reasoning)</div>
    <div class="cer-section">
      <div class="cer-box claim">
        <div class="cer-box-title">1. Scientific Claim</div>
        <div class="cer-box-text">${claim}</div>
      </div>
      <div class="cer-box evidence">
        <div class="cer-box-title">2. Quantitative Evidence</div>
        <div class="cer-box-text">${evidence}</div>
      </div>
      <div class="cer-box reasoning">
        <div class="cer-box-title">3. Scientific Reasoning</div>
        <div class="cer-box-text">${reasoning}</div>
      </div>
    </div>

    <!-- Teacher Evaluation & Grading Block -->
    <div class="teacher-box">
      <div>
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">Teacher Verification &amp; Feedback:</div>
        <div style="border-bottom: 1px dotted #94a3b8; height: 26px;"></div>
      </div>
      <div class="score-box">
        <div style="font-weight: 700; color: #475569;">Assessment Score:</div>
        <div class="score-num">____ / 100</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a standalone, self-contained HTML report file
 * @param {Object} config Report configuration and data
 */
export function downloadStandaloneReportHtml(config = {}) {
  const canvasDataUrl = config.canvasDataUrl || captureCanvasAsDataUrl(config.canvasElement || config.canvasId);
  const fullHtml = buildPrintableReportHtml({ ...config, canvasDataUrl });
  const filename = `${config.labId || "science_lab"}_report_${new Date().toISOString().slice(0, 10)}.html`;

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Lab Report Exported", `Downloaded: ${filename}`, "success");
}

/**
 * Displays an interactive printable report modal with Canvas graph, Print / PDF, and HTML download
 * @param {Object} config Report options
 */
export function exportLabReportPrintable(config = {}) {
  const canvasDataUrl = config.canvasDataUrl || captureCanvasAsDataUrl(config.canvasElement || config.canvasId);
  const fullConfig = { ...config, canvasDataUrl };

  let modal = document.getElementById("printable-lab-report-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "printable-lab-report-modal";
    modal.style.cssText = "position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 999999; display: flex; flex-direction: column; overflow: hidden;";
    document.body.appendChild(modal);
  }

  const reportHtml = buildPrintableReportHtml(fullConfig);

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #0f172a; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.1rem;">📄</span>
        <span style="font-weight: 800; font-size: 0.95rem; color: #38bdf8;">Official Lab Report &amp; Canvas Export</span>
        <span style="font-size: 0.82rem; color: #94a3b8;">• ${fullConfig.title || "Virtual Lab"}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="btn-modal-dl-html" style="cursor: pointer; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-weight: 700; font-size: 0.82rem; padding: 7px 14px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
          <span>💾</span>
          <span>Download Standalone HTML</span>
        </button>
        <button id="btn-modal-print-pdf" style="cursor: pointer; background: #0284c7; border: none; color: #ffffff; font-weight: 700; font-size: 0.82rem; padding: 7px 16px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);">
          <span>🖨️</span>
          <span>Print / Save PDF</span>
        </button>
        <button id="btn-modal-close-report" style="cursor: pointer; background: rgba(255, 255, 255, 0.1); border: none; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; display: flex; align-items: center; justify-content: center;">
          ✕
        </button>
      </div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 24px; display: flex; justify-content: center; background: #1e293b;">
      <iframe id="report-iframe" style="width: 100%; max-width: 860px; height: 100%; min-height: 800px; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.5);"></iframe>
    </div>
  `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const iframe = modal.querySelector("#report-iframe");
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(reportHtml);
  iframe.contentWindow.document.close();

  // Print button triggers iframe print
  modal.querySelector("#btn-modal-print-pdf")?.addEventListener("click", () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  });

  // Download Standalone HTML button
  modal.querySelector("#btn-modal-dl-html")?.addEventListener("click", () => {
    downloadStandaloneReportHtml(fullConfig);
  });

  // Close modal
  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };
  modal.querySelector("#btn-modal-close-report")?.addEventListener("click", closeModal);

  return modal;
}
