// Edugates-ClipSAT Science Labs - Editable DOCX Document Exporter
// Generates clean, standards-compliant, editable Microsoft Word (.docx/.doc) documents
// directly in the browser with full formatting, tables, scientific symbols, and styling.
// Compatible with Microsoft Word, Google Docs, Apple Pages, and LibreOffice.

import { showToast } from "./toast.js";

/**
 * Exports an HTML fragment or document element to an editable .docx file.
 * @param {Object} options
 * @param {string} options.title - Document title displayed in metadata
 * @param {string} options.filename - Desired output filename (without extension)
 * @param {HTMLElement|string} options.content - DOM element or HTML string to export
 * @param {string} [options.subject] - Optional curriculum subject code (e.g. CHEM, BIO, PHYS)
 * @param {string} [options.orientation='portrait'] - 'portrait' or 'landscape'
 */
export function exportToDocx({ title, filename, content, subject = "Science", orientation = "portrait" }) {
  try {
    let htmlContent = "";

    if (typeof content === "string") {
      htmlContent = content;
    } else if (content instanceof HTMLElement) {
      // Clone element to sanitize without affecting DOM
      const clone = content.cloneNode(true);

      // Remove non-printable interactive elements: buttons, toolbars, print action bars
      const removeSelectors = [
        "button",
        ".print-actions-bar",
        ".lp-actions-bar",
        ".modal-close-btn",
        ".no-print",
        ".sim-controls-panel",
        "input[type='checkbox']"
      ];
      removeSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove());
      });

      // Replace text inputs with underlined blank fill lines or text values
      clone.querySelectorAll("input[type='text'], input:not([type])").forEach(inp => {
        const val = inp.value || inp.getAttribute("value") || "";
        const span = document.createElement("span");
        if (val.trim()) {
          span.style.fontWeight = "bold";
          span.textContent = val;
        } else {
          span.style.borderBottom = "1px solid #000000";
          span.style.display = "inline-block";
          span.style.minWidth = "120px";
          span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        inp.replaceWith(span);
      });

      // Inline SVGs: ensure they have explicit width & height attributes for Word
      clone.querySelectorAll("svg").forEach(svg => {
        if (!svg.getAttribute("width")) svg.setAttribute("width", "420");
        if (!svg.getAttribute("height")) svg.setAttribute("height", "220");
      });

      htmlContent = clone.innerHTML;
    }

    const isLandscape = orientation === "landscape";
    const pageWidth = isLandscape ? "11.69in" : "8.27in"; // A4 dimensions
    const pageHeight = isLandscape ? "8.27in" : "11.69in";

    const fullDocTemplate = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(title || "AmScLab Document")}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: ${pageWidth} ${pageHeight};
      margin: 0.75in 0.75in 0.75in 0.75in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #000000;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h1 { font-size: 18pt; font-weight: bold; border-bottom: 1.5pt solid #0284c7; padding-bottom: 4pt; }
    h2 { font-size: 14pt; font-weight: bold; }
    h3 { font-size: 12pt; font-weight: bold; }
    p { margin-top: 0; margin-bottom: 8pt; }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12pt 0;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      font-size: 10pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    
    .question-item {
      margin-bottom: 16pt;
      page-break-inside: avoid;
    }
    .question-options-list {
      margin: 6pt 0 10pt 20pt;
    }
    .rubric-table th {
      background-color: #e0f2fe;
    }
    .page-break {
      page-break-after: always;
      mso-special-character: line-break;
    }
    .doc-meta-badge {
      display: inline-block;
      font-weight: bold;
      font-size: 9pt;
      padding: 2pt 6pt;
      border: 1pt solid #0284c7;
      color: #0284c7;
      border-radius: 4pt;
    }
    .formula-box {
      font-family: 'Cambria Math', 'STIX Two Text', 'Times New Roman', serif;
      font-style: italic;
      background-color: #f8fafc;
      border: 1pt solid #e2e8f0;
      padding: 6pt 10pt;
      margin: 8pt 0;
    }
    .katex {
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-size: 1.05em;
    }
    .omr-bubble {
      display: inline-block;
      width: 14pt;
      height: 14pt;
      line-height: 14pt;
      border-radius: 50%;
      border: 1pt solid #000000;
      text-align: center;
      font-size: 8pt;
      font-weight: bold;
      color: #000000;
      background-color: #ffffff;
      margin: 0 2pt;
    }
    .omr-q-row {
      margin-bottom: 4pt;
      font-size: 9pt;
      font-family: 'Consolas', 'Courier New', monospace;
    }
    .omr-q-num {
      display: inline-block;
      min-width: 22pt;
      font-weight: bold;
      text-align: right;
      margin-right: 6pt;
    }
    .omr-bubbles-group {
      display: inline-block;
    }
    .omr-section-card {
      display: inline-block;
      vertical-align: top;
      border: 1pt solid #cbd5e1;
      padding: 8pt 10pt;
      margin: 6pt;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${htmlContent}
  </div>
</body>
</html>
    `.trim();

    // Create file blob with Word Processing MIME type and UTF-8 Byte Order Mark (BOM)
    const blob = new Blob(["\ufeff", fullDocTemplate], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
    });

    const cleanFilename = (filename || "AmScLab-Document")
      .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_")
      .replace(/_{2,}/g, "_") + ".docx";

    // Trigger download
    const downloadLink = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    downloadLink.href = objectUrl;
    downloadLink.download = cleanFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(objectUrl);
    }, 200);

    try {
      showToast(
        "Editable Document Exported",
        `Saved "${cleanFilename}" — ready to open and edit in Microsoft Word, Google Docs, or Pages.`,
        "success"
      );
    } catch (e) {}

    return true;
  } catch (err) {
    console.error("DOCX Export Error:", err);
    try {
      showToast("Export Notice", "Failed to generate .docx document: " + err.message, "error");
    } catch (e) {}
    return false;
  }
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
