// Edugates-ClipSAT Science Labs - High-Precision LaTeX & Mathematical Typesetting Engine
// Provides publication-grade standalone mathematical typesetting with seamless KaTeX progressive enhancement.

/**
 * Maps standard LaTeX symbols, Greek characters, operators, and scientific notation to unicode glyphs.
 */
const LATEX_SYMBOLS = {
  // Greek Lowercase
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\varepsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",

  // Greek Uppercase
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Theta": "Θ",
  "\\Lambda": "Λ",
  "\\Xi": "Ξ",
  "\\Pi": "Π",
  "\\Sigma": "Σ",
  "\\Phi": "Φ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",

  // Scientific, Chemical & Mathematical Operators
  "\\longrightarrow": "⟶",
  "\\rightleftharpoons": "⇌",
  "\\leftrightarrow": "↔",
  "\\leftarrow": "←",
  "\\rightarrow": "→",
  "\\implies": "⟹",
  "\\iff": "⟺",
  "\\approx": "≈",
  "\\times": "×",
  "\\cdot": "·",
  "\\pm": "±",
  "\\mp": "∓",
  "\\div": "÷",
  "\\neq": "≠",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\le": "≤",
  "\\ge": "≥",
  "\\ll": "≪",
  "\\gg": "≫",
  "\\infty": "∞",
  "\\propto": "∝",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\iint": "∬",
  "\\int": "∫",
  "\\prod": "∏",
  "\\sum": "∑",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\notin": "∉",
  "\\in": "∈",
  "\\subset": "⊂",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\parallel": "∥",
  "\\perp": "⊥",
  "\\hbar": "ℏ",
  "\\degree": "°",
  "\\circ": "°",
  "\\cdots": "⋯",
  "\\dots": "…",
  "\\qquad": "&emsp;&emsp;",
  "\\quad": "&emsp;",
  "\\enspace": "&ensp;",
  "\\ ": "&nbsp;",
  "\\,": "&thinsp;",
  "\\;": "&ensp;",
  "\\:": "&ensp;"
};

// Sort symbol keys by descending length to prevent prefix collision (e.g. \le inside \left)
const SORTED_SYMBOL_KEYS = Object.keys(LATEX_SYMBOLS).sort((a, b) => b.length - a.length);

/**
 * Helper to extract matching balanced braces { ... }
 */
function extractBraceContent(str, startIndex) {
  if (str[startIndex] !== "{") return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

/**
 * Escapes attribute content for safe embedding in data-* attributes
 */
function escapeHtmlAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Classifies raw plain-text segments outside HTML tags into upright numbers, operators, and delimiters
 */
function classifyPlainTokens(html) {
  const parts = html.split(/(<[^>]+>)/g);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("<")) {
      let s = parts[i];
      // Mathematical & chemical operators (with proper math spacing)
      s = s.replace(/([=+\-×÷·±∓≈≠≤≥⟶→⇌↔⟹⟺∝])/g, '<span class="math-op">$1</span>');
      // Upright numbers (lining & tabular figures)
      s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="math-num-lit">$1</span>');
      // Delimiters (upright)
      s = s.replace(/([()\[\]{}|])/g, '<span class="math-delim">$1</span>');
      parts[i] = s;
    }
  }
  return parts.join("");
}

/**
 * Pre-processes LaTeX to repair common syntax quirks that break KaTeX parsers
 * (such as unescaped underscores inside \text{...} or raw wrapping delimiters)
 */
export function sanitizeLatex(latex) {
  if (!latex || typeof latex !== "string") return "";
  let s = latex.trim();

  // Strip wrapping $$ or $ if present
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }

  // Pre-fix unescaped underscores inside \text{...}, \mathrm{...}, \textbf{...}, \mathbf{...}
  // Because in TeX/KaTeX, an unescaped _ in text mode is an invalid token and throws ParseError.
  const textCmds = ["\\text{", "\\mathrm{", "\\textbf{", "\\mathbf{"];
  for (const tcmd of textCmds) {
    let tIdx = s.indexOf(tcmd);
    while (tIdx !== -1) {
      const extracted = extractBraceContent(s, tIdx + tcmd.length - 1);
      if (!extracted) break;
      const fixedContent = extracted.content.replace(/(?<!\\)_/g, "\\_");
      const before = s.slice(0, tIdx);
      const after = s.slice(extracted.endIndex + 1);
      s = before + tcmd.slice(0, -1) + "{" + fixedContent + "}" + after;
      tIdx = s.indexOf(tcmd, before.length + tcmd.length + fixedContent.length);
    }
  }

  return s;
}

/**
 * Internal parsing function that translates LaTeX markup into high-fidelity semantic HTML
 */
function formatInner(s, isRoot = true) {
  if (!s) return "";

  // 0. Clean formatting switches like \displaystyle, \textstyle, \limits, \nolimits
  s = s.replace(/\\displaystyle\b\s*/g, "").replace(/\\textstyle\b\s*/g, "");
  s = s.replace(/\\limits\b\s*/g, "").replace(/\\nolimits\b\s*/g, "");

  // 1. Clean delimiters
  s = s.replace(/\\left\(/g, "(").replace(/\\right\)/g, ")");
  s = s.replace(/\\left\[/g, "[").replace(/\\right\]/g, "]");
  s = s.replace(/\\left\\{/g, "{").replace(/\\right\\}/g, "}");
  s = s.replace(/\\left\|/g, "|").replace(/\\right\|/g, "|");
  s = s.replace(/\\left\./g, "").replace(/\\right\./g, "");

  // 2. Handle \text{...}, \mathrm{...}, \textbf{...}
  const textCmds = ["\\text{", "\\mathrm{", "\\textbf{", "\\mathbf{"];
  for (const tcmd of textCmds) {
    let tIdx = s.indexOf(tcmd);
    while (tIdx !== -1) {
      const extracted = extractBraceContent(s, tIdx + tcmd.length - 1);
      if (!extracted) break;
      const before = s.slice(0, tIdx);
      const after = s.slice(extracted.endIndex + 1);
      const textClean = extracted.content
        .replace(/\\_/g, "_")
        .replace(/\\%/g, "%")
        .replace(/\\&/g, "&")
        .replace(/\\\$/g, "$")
        .replace(/\\#/g, "#")
        .replace(/\\~/g, "~");
      s = before + `<span class="math-text">${textClean}</span>` + after;
      tIdx = s.indexOf(tcmd);
    }
  }

  // 3. Handle \textit{...}
  let tiIdx = s.indexOf("\\textit{");
  while (tiIdx !== -1) {
    const extracted = extractBraceContent(s, tiIdx + 7);
    if (!extracted) break;
    const before = s.slice(0, tiIdx);
    const after = s.slice(extracted.endIndex + 1);
    s = before + `<span class="math-italic">${extracted.content}</span>` + after;
    tiIdx = s.indexOf("\\textit{");
  }

  // 4. Handle \mathcal{E} (Electromotive force / EMF in Physics)
  s = s.replace(/\\mathcal\{E\}/g, '<span class="math-emf">ℰ</span>');

  // 5. Handle \xrightarrow{...} (Reaction with catalyst or condition)
  let arrIdx = s.indexOf("\\xrightarrow{");
  while (arrIdx !== -1) {
    const extracted = extractBraceContent(s, arrIdx + 12);
    if (!extracted) break;
    const before = s.slice(0, arrIdx);
    const after = s.slice(extracted.endIndex + 1);
    s = before + `<span class="math-arrow-labeled"><span class="math-arrow-label">${formatInner(extracted.content, false)}</span><span class="math-arrow-line">⟶</span></span>` + after;
    arrIdx = s.indexOf("\\xrightarrow{");
  }

  // 6. Handle fractions: \frac{numerator}{denominator}
  let fIdx = s.indexOf("\\frac{");
  while (fIdx !== -1) {
    const num = extractBraceContent(s, fIdx + 5);
    if (!num) break;
    const denom = extractBraceContent(s, num.endIndex + 1);
    if (!denom) break;
    const before = s.slice(0, fIdx);
    const after = s.slice(denom.endIndex + 1);
    const replacement = `<span class="math-fraction"><span class="math-num">${formatInner(num.content, false)}</span><span class="math-denom">${formatInner(denom.content, false)}</span></span>`;
    s = before + replacement + after;
    fIdx = s.indexOf("\\frac{");
  }

  // 7. Handle square roots: \sqrt{...} or \sqrt[n]{...} with responsive SVG radical
  let sqrtIdx = s.indexOf("\\sqrt");
  while (sqrtIdx !== -1) {
    let cursor = sqrtIdx + 5;
    let rootIndex = "";
    if (s[cursor] === "[") {
      const closeB = s.indexOf("]", cursor);
      if (closeB !== -1) {
        rootIndex = s.slice(cursor + 1, closeB);
        cursor = closeB + 1;
      }
    }
    if (s[cursor] === "{") {
      const body = extractBraceContent(s, cursor);
      if (body) {
        const before = s.slice(0, sqrtIdx);
        const after = s.slice(body.endIndex + 1);
        const rootSup = rootIndex ? `<sup class="math-root-index">${rootIndex}</sup>` : "";
        const replacement = `<span class="math-sqrt">${rootSup}<span class="math-radical-symbol"><svg class="math-radical-svg" viewBox="0 0 12 32" preserveAspectRatio="none" aria-hidden="true"><path d="M1 18 L3.5 16 L6.5 28 L11 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="math-sqrt-stem">${formatInner(body.content, false)}</span></span>`;
        s = before + replacement + after;
      }
    }
    sqrtIdx = s.indexOf("\\sqrt", sqrtIdx + 1);
  }

  // 8. Handle mathematical functions
  const funcs = ["sin", "cos", "tan", "arcsin", "arccos", "arctan", "log", "ln", "exp", "lim", "max", "min"];
  for (const fn of funcs) {
    const fnRegex = new RegExp(`\\\\${fn}\\b`, "g");
    s = s.replace(fnRegex, `<span class="math-func">${fn}</span>`);
  }

  // 9. Replace symbols and Greek characters (sorted by descending length)
  for (const cmd of SORTED_SYMBOL_KEYS) {
    s = s.split(cmd).join(LATEX_SYMBOLS[cmd]);
  }

  // 10. Handle \bar{...} and \vec{...}
  s = s.replace(/\\bar\{([^{}]+)\}/g, '<span class="math-accent-bar">$1</span>');
  s = s.replace(/\\vec\{([^{}]+)\}/g, '<span class="math-accent-vec">$1<span class="math-vec-arrow">→</span></span>');

  // 11. Handle Subscript + Superscript Stacking (e.g. H_f^\circ or v_i^2 or X_{rxn}^2)
  const subsupPattern1 = /([a-zA-Z\u0370-\u03ff\u2200-\u22ff]+|<\/span>)(?:_\{([^}]+)\}|_([a-zA-Z0-9+-]+))(?:\^\{([^}]+)\}|\^([a-zA-Z0-9°+-]+))/g;
  const subsupPattern2 = /([a-zA-Z\u0370-\u03ff\u2200-\u22ff]+|<\/span>)(?:\^\{([^}]+)\}|\^([a-zA-Z0-9°+-]+))(?:_\{([^}]+)\}|_([a-zA-Z0-9+-]+))/g;

  s = s.replace(subsupPattern1, (_, base, s1, s2, p1, p2) => {
    return `${base}<span class="math-subsup"><span class="math-sup">${formatInner(p1 || p2, false)}</span><span class="math-sub">${formatInner(s1 || s2, false)}</span></span>`;
  });
  s = s.replace(subsupPattern2, (_, base, p1, p2, s1, s2) => {
    return `${base}<span class="math-subsup"><span class="math-sup">${formatInner(p1 || p2, false)}</span><span class="math-sub">${formatInner(s1 || s2, false)}</span></span>`;
  });

  // 12. Handle standalone superscripts
  let supIdx = s.indexOf("^{");
  while (supIdx !== -1) {
    const extracted = extractBraceContent(s, supIdx + 1);
    if (!extracted) break;
    const before = s.slice(0, supIdx);
    const after = s.slice(extracted.endIndex + 1);
    s = before + `<sup class="math-sup">${formatInner(extracted.content, false)}</sup>` + after;
    supIdx = s.indexOf("^{");
  }
  s = s.replace(/\^([a-zA-Z0-9°+-])/g, '<sup class="math-sup">$1</sup>');

  // 13. Handle standalone subscripts
  let subIdx = s.indexOf("_{");
  while (subIdx !== -1) {
    const extracted = extractBraceContent(s, subIdx + 1);
    if (!extracted) break;
    const before = s.slice(0, subIdx);
    const after = s.slice(extracted.endIndex + 1);
    s = before + `<sub class="math-sub">${formatInner(extracted.content, false)}</sub>` + after;
    subIdx = s.indexOf("_{");
  }
  s = s.replace(/_([a-zA-Z0-9+-])/g, '<sub class="math-sub">$1</sub>');

  // 14. Clean residual escape backslashes
  s = s.replace(/\\%/g, "%");
  s = s.replace(/\\&/g, "&");
  s = s.replace(/\\_/g, "_");
  s = s.replace(/\\\$/g, "$");
  s = s.replace(/\\#/g, "#");
  s = s.replace(/\\\{/g, "{");
  s = s.replace(/\\\}/g, "}");
  s = s.replace(/\\~/g, "~");
  s = s.replace(/\\\s/g, "&nbsp;");

  // 15. Classify operators, numbers, and delimiters for clean typography (only at root)
  if (isRoot) {
    return classifyPlainTokens(s);
  }
  return s;
}

/**
 * Built-in fallback renderer: Converts a LaTeX string into semantic, publication-grade HTML
 */
export function standaloneLatexToHtml(latex, displayMode = false) {
  if (!latex) return "";

  let s = latex.trim();
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) {
    s = s.slice(2, -2).trim();
    displayMode = true;
  } else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }

  const parsed = formatInner(s);
  const modeClass = displayMode ? "math-display" : "math-inline";
  const rawEsc = escapeHtmlAttr(s);

  return `<span class="math-rendered ${modeClass}" data-latex="${rawEsc}" data-display="${displayMode}">${parsed}</span>`;
}

// In-memory memoization cache for LaTeX rendering to prevent repetitive KaTeX computations on low-end CPUs
const mathCache = new Map();

/**
 * Master rendering function with LRU-style cache.
 * Uses window.katex if available for full vector typesetting, otherwise uses our enhanced standalone parser.
 * Always includes data-latex attribute for reactive upgrades.
 * Supports passing either a LaTeX string or a DOM element directly.
 */
export function renderLatex(latex, displayMode = false) {
  if (!latex) return "";

  // Support HTMLElement passed directly: render into its innerHTML
  if (typeof latex !== "string") {
    if (latex && latex.nodeType === 1) {
      const text = latex.textContent || latex.innerText || "";
      const html = renderLatex(text, displayMode);
      latex.innerHTML = html;
      return html;
    }
    return String(latex);
  }

  let cleaned = latex.trim();
  if (cleaned.startsWith("$$") && cleaned.endsWith("$$") && cleaned.length >= 4) {
    cleaned = cleaned.slice(2, -2).trim();
    displayMode = true;
  } else if (cleaned.startsWith("$") && cleaned.endsWith("$") && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const cacheKey = `${cleaned}___${displayMode}`;
  if (mathCache.has(cacheKey)) {
    return mathCache.get(cacheKey);
  }

  const sanitized = sanitizeLatex(cleaned);
  const rawEsc = escapeHtmlAttr(cleaned);
  let rendered = "";

  if (typeof window !== "undefined" && window.katex && typeof window.katex.renderToString === "function") {
    try {
      const katexHtml = window.katex.renderToString(sanitized, {
        displayMode,
        throwOnError: false,
        output: "html"
      });
      // KaTeX returns a span with class "katex-error" on parse failures when throwOnError is false.
      // If it failed, do not use the raw error text; fall back to standalone parser.
      if (katexHtml && !katexHtml.includes("katex-error")) {
        rendered = `<span class="math-katex-wrapper ${displayMode ? 'math-display' : 'math-inline'}" data-latex="${rawEsc}" data-display="${displayMode}">${katexHtml}</span>`;
        mathCache.set(cacheKey, rendered);
        return rendered;
      }
    } catch {
      // Fall through to standalone parser
    }
  }

  rendered = standaloneLatexToHtml(cleaned, displayMode);
  mathCache.set(cacheKey, rendered);
  return rendered;
}

/**
 * Formats any mixed text that may contain inline math $...$ or block math $$...$$.
 * Preserves normal text while rendering LaTeX equations.
 */
export function formatMathText(text) {
  if (!text || typeof text !== "string") return "";

  // Check for $$...$$ block math first
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, eq) => {
    return `<div class="math-block-wrapper">${renderLatex(eq, true)}</div>`;
  });

  // Check for $...$ inline math (avoiding currency like $5 or $10)
  result = result.replace(/\$([^\$\n]+?)\$/g, (match, eq) => {
    if (/^\d+(\.\d{2})?$/.test(eq.trim())) {
      return match;
    }
    return renderLatex(eq, false);
  });

  return result;
}

/**
 * Scans the entire document or a specific container and upgrades all [data-latex] elements using KaTeX
 * Uses batched execution and cache to avoid locking the UI thread on slow smartboard processors.
 */
export function upgradeAllMath(root = (typeof document !== "undefined" ? document : null)) {
  if (!root || typeof window === "undefined" || !window.katex || typeof window.katex.renderToString !== "function") {
    return;
  }

  const elements = root.querySelectorAll("[data-latex]:not(.katex-upgraded)");
  if (!elements || elements.length === 0) return;

  const processElement = (el) => {
    const raw = el.getAttribute("data-latex");
    const isDisplay = el.getAttribute("data-display") === "true";
    if (!raw) return;

    const cacheKey = `${raw}___${isDisplay}`;
    if (mathCache.has(cacheKey)) {
      const cached = mathCache.get(cacheKey);
      el.outerHTML = cached;
      return;
    }

    try {
      const sanitized = sanitizeLatex(raw);
      const html = window.katex.renderToString(sanitized, {
        displayMode: isDisplay,
        throwOnError: false,
        output: "html"
      });
      if (html && !html.includes("katex-error")) {
        const rawEsc = escapeHtmlAttr(raw);
        const fullSpan = `<span class="math-katex-wrapper ${isDisplay ? 'math-display' : 'math-inline'}" data-latex="${rawEsc}" data-display="${isDisplay}">${html}</span>`;
        mathCache.set(cacheKey, fullSpan);
        el.outerHTML = fullSpan;
      } else {
        // Keep clean standalone rendered HTML and avoid re-processing
        el.classList.add("katex-upgraded");
      }
    } catch {
      el.classList.add("katex-upgraded");
    }
  };

  // For small batches (< 20 elements), process synchronously
  if (elements.length < 20) {
    for (let i = 0; i < elements.length; i++) {
      processElement(elements[i]);
    }
  } else {
    // For large batches on slow processors, chunk with requestIdleCallback or requestAnimationFrame
    const elArray = Array.from(elements);
    let index = 0;
    const chunkSize = 15;

    const runChunk = () => {
      const end = Math.min(index + chunkSize, elArray.length);
      for (let i = index; i < end; i++) {
        processElement(elArray[i]);
      }
      index = end;
      if (index < elArray.length) {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(runChunk, { timeout: 100 });
        } else {
          requestAnimationFrame(runChunk);
        }
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(runChunk, { timeout: 100 });
    } else {
      requestAnimationFrame(runChunk);
    }
  }
}

/**
 * Utility to batch render all math formulas inside a specific DOM container.
 */
export function renderMathInElement(container) {
  if (!container) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  const nodesToReplace = [];

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.includes("$")) {
      const parentTag = node.parentElement ? node.parentElement.tagName.toLowerCase() : "";
      if (parentTag !== "script" && parentTag !== "style" && parentTag !== "textarea") {
        nodesToReplace.push(node);
      }
    }
  }

  for (const textNode of nodesToReplace) {
    const parent = textNode.parentNode;
    if (!parent) continue;
    const formatted = formatMathText(textNode.nodeValue);
    if (formatted !== textNode.nodeValue) {
      const span = document.createElement("span");
      span.innerHTML = formatted;
      parent.replaceChild(span, textNode);
    }
  }

  // Attempt KaTeX upgrade on newly mounted element
  upgradeAllMath(container);
}

// Expose upgrade function globally for external scripts & KaTeX script onload
if (typeof window !== "undefined") {
  window.upgradeAllMath = upgradeAllMath;

  // Single safe check on window load or when KaTeX script finishes
  window.addEventListener("load", () => {
    if (window.katex) {
      upgradeAllMath();
    }
  }, { once: true });
}
