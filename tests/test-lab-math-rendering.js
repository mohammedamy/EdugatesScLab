// Edugates-ClipSAT Science Labs - Virtual Labs Mathematical Typesetting & Formula Verification Test Suite
// Rigorously verifies math rendering, LaTeX progressive enhancement, symbol sanitization, and lab formula badges.

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  renderLatex,
  formatMathText,
  sanitizeLatex,
  cleanLatexForSpeech,
  isFormulaLike,
  renderMathInElement,
  upgradeAllMath
} from "../utils/math-renderer.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("========================================================");
console.log("📐 Laboratory Mathematical Typesetting Engine Verification");
console.log("========================================================\n");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    process.exit(1);
  }
}

// ----------------------------------------------------
// 1. Math Renderer Functions & Exports
// ----------------------------------------------------
test("math-renderer.js exports all essential typesetting functions", () => {
  assert(typeof renderLatex === "function", "renderLatex must be a function");
  assert(typeof formatMathText === "function", "formatMathText must be a function");
  assert(typeof sanitizeLatex === "function", "sanitizeLatex must be a function");
  assert(typeof cleanLatexForSpeech === "function", "cleanLatexForSpeech must be a function");
  assert(typeof isFormulaLike === "function", "isFormulaLike must be a function");
  assert(typeof renderMathInElement === "function", "renderMathInElement must be a function");
  assert(typeof upgradeAllMath === "function", "upgradeAllMath must be a function");
});

// ----------------------------------------------------
// 2. Exact Formula from User Screenshot (Reaction Kinetics Badge)
// ----------------------------------------------------
test("Renders exact kinetics formula badge (Rate = k[A]^m[B]^n • k = A e^{-E_a/RT}) into publication-grade HTML", () => {
  const rawKinetics = "Rate = k[A]^m[B]^n • k = A e^{-E_a/RT}";
  assert(isFormulaLike(rawKinetics), "Must identify kinetics rate law as formula-like");

  const rendered = renderLatex(rawKinetics);
  assert(rendered.includes('class="math-rendered'), "Must generate math-rendered span container");
  assert(rendered.includes('data-latex='), "Must preserve data-latex attribute for progressive KaTeX upgrade");
  assert(rendered.includes('math-sup'), "Must typeset superscript m, n, and exponent");
  assert(rendered.includes('math-sub'), "Must typeset subscript a in E_a");
  assert(rendered.includes('math-delim'), "Must typeset bracket delimiters around [A] and [B]");
  assert(rendered.includes('math-op'), "Must typeset equals and bullet operators with proper math spacing");
});

test("chem-reaction-kinetics.js includes formatted rate law formula badge", () => {
  const kineticsSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-reaction-kinetics.js"), "utf8");
  assert(
    kineticsSrc.includes("renderLatex(") &&
    kineticsSrc.includes("Rate}") &&
    kineticsSrc.includes("e^{-E_a/RT}"),
    "chem-reaction-kinetics.js must invoke renderLatex for rate law badge"
  );
  assert(
    !kineticsSrc.includes('<span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">\n            Rate = k[A]^m[B]^n • k = A e^{-E_a/RT}'),
    "chem-reaction-kinetics.js must not retain raw unrendered formula string"
  );
});

// ----------------------------------------------------
// 3. LaTeX Sanitization & Robust Unicode Transformation
// ----------------------------------------------------
test("sanitizeLatex translates Unicode math symbols into valid LaTeX commands", () => {
  const raw = "ΔE = hc / λ • F ∝ 1/r² ± 0.05 • T = 2π√(m/k)";
  const sanitized = sanitizeLatex(raw);
  assert(sanitized.includes("\\Delta"), "Δ must map to \\Delta");
  assert(sanitized.includes("\\lambda"), "λ must map to \\lambda");
  assert(sanitized.includes("\\bullet"), "• must map to \\bullet");
  assert(sanitized.includes("\\propto"), "∝ must map to \\propto");
  assert(sanitized.includes("^2"), "² must map to ^2");
  assert(sanitized.includes("\\pm"), "± must map to \\pm");
  assert(sanitized.includes("\\pi"), "π must map to \\pi");
});

test("sanitizeLatex escapes unescaped ampersands to avoid KaTeX matrix column errors", () => {
  const withAmp = "Michaelis-Menten & Lineweaver-Burk";
  const sanitized = sanitizeLatex(withAmp);
  assert(sanitized.includes("\\&"), "Unescaped & must be converted to \\&");
});

test("cleanLatexForSpeech produces accessible spoken text for screen readers", () => {
  const expr = "\\text{Rate} = k[\\text{A}]^m[\\text{B}]^n \\quad \\bullet \\quad k = A e^{-E_a/RT}";
  const speech = cleanLatexForSpeech(expr);
  assert(speech.includes("Rate"), "Speech label must include Rate");
  assert(speech.includes("power of m"), "Speech label must describe power of m");
  assert(speech.includes("sub a"), "Speech label must describe subscript a");
});

// ----------------------------------------------------
// 4. Audit All 45 Lab Files for Header Badges
// ----------------------------------------------------
test("All virtual laboratory files have typeset formulas in badges without raw unrendered LaTeX", () => {
  const labsDir = path.join(rootDir, "labs");
  const files = fs.readdirSync(labsDir).filter(f => f.endsWith(".js") && f !== "lab-telemetry-exporter.js");

  const unrenderedArtifacts = [];
  const rawLatexRegex = /<span[^>]*class="[^"]*badge[^"]*"[^>]*>([\s\S]*?)<\/span>/g;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(labsDir, file), "utf8");
    let match;
    while ((match = rawLatexRegex.exec(content)) !== null) {
      const badgeContent = match[1].trim();
      // Check if badge content has raw unrendered LaTeX without renderLatex or $ or data-latex
      if (
        !badgeContent.includes("renderLatex") &&
        !badgeContent.includes("formatMathText") &&
        !badgeContent.includes("$") &&
        !badgeContent.includes("data-latex")
      ) {
        if (/(\\(?:frac|Delta|alpha|beta|gamma|lambda|mu|pi|rho|sigma|omega|times|cdot|approx|vec|sqrt|text|bar|sum|int|partial|infty|mathcal|to|rightarrow|rightleftharpoons|propto|leq|geq|neq)\b|\^\{|_\{)/.test(badgeContent)) {
          unrenderedArtifacts.push({ file, snippet: badgeContent });
        }
      }
    }
  });

  assert.strictEqual(
    unrenderedArtifacts.length,
    0,
    `Found ${unrenderedArtifacts.length} badges with raw unrendered LaTeX: ${JSON.stringify(unrenderedArtifacts, null, 2)}`
  );
});

// ----------------------------------------------------
// 5. Lifecycle Math Hooks in App & Module Viewer
// ----------------------------------------------------
test("app.js lab loader invokes renderMathInElement on mount", () => {
  const appSrc = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  assert(
    appSrc.includes("renderMathInElement(mount);"),
    "app.js must call renderMathInElement(mount) after loading lab workbench"
  );
});

test("components/module-viewer.js invokes renderMathInElement on embedded lab mount", () => {
  const viewerSrc = fs.readFileSync(path.join(rootDir, "components", "module-viewer.js"), "utf8");
  assert(
    viewerSrc.includes("renderMathInElement(mount);"),
    "module-viewer.js must call renderMathInElement(mount) after loading embedded lab"
  );
});

test("labs/lab-telemetry-exporter.js invokes renderMathInElement for checkpoint assessments", () => {
  const exporterSrc = fs.readFileSync(path.join(rootDir, "labs", "lab-telemetry-exporter.js"), "utf8");
  assert(
    exporterSrc.includes("renderMathInElement(container);"),
    "lab-telemetry-exporter.js must call renderMathInElement(container) in mountLabCheckpoint"
  );
});

// ----------------------------------------------------
// 6. CSS Contrast & Inheritance Invariants
// ----------------------------------------------------
test("index.css enforces color inheritance for math inside badges", () => {
  const css = fs.readFileSync(path.join(rootDir, "index.css"), "utf8");
  assert(
    css.includes(".badge .math-rendered,") && css.includes("color: inherit !important;"),
    "index.css must ensure math inside badges inherits the badge theme color"
  );
});

// ----------------------------------------------------
// 7. Checkpoint Assessment Math Typesetting & Integrity
// ----------------------------------------------------
test("labs/lab-telemetry-exporter.js LAB_CHECKPOINTS has zero corrupting control characters", () => {
  const labs = LAB_CHECKPOINTS;
  assert(labs && typeof labs === "object", "LAB_CHECKPOINTS must exist");

  const controlCharIssues = [];
  for (const [key, questions] of Object.entries(labs)) {
    questions.forEach((q, idx) => {
      const texts = [
        { field: "question", text: q.question },
        ...q.options.map((opt, oIdx) => ({ field: `option[${oIdx}]`, text: opt })),
        { field: "explanation", text: q.explanation }
      ];
      texts.forEach(({ field, text }) => {
        if (/[\r\t\f\x08\x0b]/.test(text)) {
          controlCharIssues.push({ key, q: idx + 1, field, text });
        }
      });
    });
  }

  assert.strictEqual(
    controlCharIssues.length,
    0,
    `Found ${controlCharIssues.length} strings with corrupting ASCII control characters in LAB_CHECKPOINTS: ${JSON.stringify(controlCharIssues, null, 2)}`
  );
});

test("Archimedes fluids checkpoint renders typeset buoyant force math ($F_b$) and formula ($F_b = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g$)", () => {
  const q1 = LAB_CHECKPOINTS.fluids[0];
  assert(q1, "Fluids Q1 must exist");

  const qRendered = formatMathText(q1.question);
  assert(
    qRendered.includes('data-latex="F_b"') && qRendered.includes('math-rendered'),
    "Fluids Q1 prompt must render buoyant force ($F_b$) as a math-rendered container"
  );

  const opt1Rendered = formatMathText(q1.options[1]);
  assert(
    opt1Rendered.includes('data-latex="F_b = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g"') &&
    opt1Rendered.includes('math-rendered'),
    "Fluids Q1 Option B must render full Archimedes formula as a math-rendered container with valid LaTeX"
  );
  assert(
    !opt1Rendered.includes("\r") && !opt1Rendered.includes("\t") && !opt1Rendered.includes("\f"),
    "Fluids Q1 Option B must not contain unescaped control characters"
  );

  const expRendered = formatMathText(q1.explanation);
  assert(
    expRendered.includes('data-latex="F_b = m_{\\text{disp}} \\cdot g = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g"'),
    "Fluids Q1 explanation must render complete derivation formula"
  );
});

test("mountLabCheckpoint wraps questions, options, and explanations with formatMathText", () => {
  const exporterSrc = fs.readFileSync(path.join(rootDir, "labs", "lab-telemetry-exporter.js"), "utf8");
  assert(
    exporterSrc.includes("${formatMathText(q.question)}"),
    "mountLabCheckpoint must wrap q.question with formatMathText"
  );
  assert(
    exporterSrc.includes("${formatMathText(opt)}"),
    "mountLabCheckpoint must wrap option text with formatMathText"
  );
  assert(
    exporterSrc.includes("${formatMathText(q.explanation)}"),
    "mountLabCheckpoint must wrap q.explanation with formatMathText"
  );
});

console.log("\n========================================================");
console.log(`📊 Math Rendering Verification: All ${passed} Tests Passed!`);
console.log("========================================================\n");
