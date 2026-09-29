// Edugates-ClipSAT Science Labs - Floating Scientific Pocket Calculator & STEM Reference Engine
// Smartboard-optimized, precision-calibrated scientific calculation engine with:
// - Trigonometry (deg/rad), logs, powers, roots, scientific notation (EE)
// - One-click physical & chemical constants insertion (c, h, N_A, R, g, e, k_e, G, etc.)
// - Full calculation history tape with result recall
// - Comprehensive AP/SAT STEM formula reference tables (Chemistry, Physics, Biology)
// - Floating, draggable, glassmorphic UI with zero layout shifts and touch/pen optimization

import { renderLatex, renderMathInElement } from "../utils/math-renderer.js";
import { SoundFX } from "../utils/audio-synth.js";
import { showToast } from "../utils/toast.js";

export const SCIENCE_CONSTANTS = [
  { symbol: "c", name: "Speed of Light in Vacuum", value: 299792458, display: "2.998 × 10⁸ m/s", latex: "c = 2.998 \\times 10^8 \\text{ m/s}", unit: "m/s", category: "Physics" },
  { symbol: "h", name: "Planck's Constant", value: 6.62607015e-34, display: "6.626 × 10⁻³⁴ J·s", latex: "h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}", unit: "J·s", category: "Physics/Chemistry" },
  { symbol: "N_A", name: "Avogadro's Number", value: 6.02214076e23, display: "6.022 × 10²³ mol⁻¹", latex: "N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}", unit: "mol⁻¹", category: "Chemistry" },
  { symbol: "R", name: "Universal Gas Constant (SI)", value: 8.314462618, display: "8.314 J/(mol·K)", latex: "R = 8.314 \\text{ J/(mol}\\cdot\\text{K)}", unit: "J/(mol·K)", category: "Chemistry/Physics" },
  { symbol: "R_atm", name: "Gas Constant (L·atm)", value: 0.082057366, display: "0.08206 L·atm/(mol·K)", latex: "R = 0.08206 \\text{ L}\\cdot\\text{atm/(mol}\\cdot\\text{K)}", unit: "L·atm/(mol·K)", category: "Chemistry" },
  { symbol: "g", name: "Standard Acceleration of Gravity", value: 9.80665, display: "9.807 m/s²", latex: "g = 9.807 \\text{ m/s}^2", unit: "m/s²", category: "Physics" },
  { symbol: "q_e", name: "Elementary Charge (e)", value: 1.602176634e-19, display: "1.602 × 10⁻¹⁹ C", latex: "q_e = 1.602 \\times 10^{-19} \\text{ C}", unit: "C", category: "Physics/Chemistry" },
  { symbol: "k_e", name: "Coulomb's Constant", value: 8.9875517923e9, display: "8.988 × 10⁹ N·m²/C²", latex: "k_e = 8.988 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2", unit: "N·m²/C²", category: "Physics" },
  { symbol: "G", name: "Universal Gravitational Constant", value: 6.6743e-11, display: "6.674 × 10⁻¹¹ N·m²/kg²", latex: "G = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2", unit: "N·m²/kg²", category: "Physics" },
  { symbol: "m_e", name: "Electron Rest Mass", value: 9.1093837015e-31, display: "9.109 × 10⁻³¹ kg", latex: "m_e = 9.109 \\times 10^{-31} \\text{ kg}", unit: "kg", category: "Physics/Chemistry" },
  { symbol: "m_p", name: "Proton Rest Mass", value: 1.67262192369e-27, display: "1.673 × 10⁻²⁷ kg", latex: "m_p = 1.673 \\times 10^{-27} \\text{ kg}", unit: "kg", category: "Physics/Chemistry" },
  { symbol: "F", name: "Faraday's Constant", value: 96485.33212, display: "96,485 C/mol e⁻", latex: "F = 96485 \\text{ C/mol}", unit: "C/mol", category: "Chemistry" },
  { symbol: "k_B", name: "Boltzmann Constant", value: 1.380649e-23, display: "1.381 × 10⁻²³ J/K", latex: "k_B = 1.381 \\times 10^{-23} \\text{ J/K}", unit: "J/K", category: "Physics" },
  { symbol: "sigma", name: "Stefan-Boltzmann Constant", value: 5.670374419e-8, display: "5.670 × 10⁻⁸ W/(m²·K⁴)", latex: "\\sigma = 5.670 \\times 10^{-8} \\text{ W/(m}^2\\cdot\\text{K}^4)", unit: "W/(m²·K⁴)", category: "Physics" },
  { symbol: "V_m", name: "Molar Volume at STP (0°C, 1 atm)", value: 22.414, display: "22.414 L/mol", latex: "V_m = 22.414 \\text{ L/mol}", unit: "L/mol", category: "Chemistry" }
];

export const STEM_FORMULA_SHEETS = {
  chem: [
    { title: "Ideal Gas Law", formula: "PV = nRT", latex: "PV = nRT", note: "P in atm/kPa, V in L, n in mol, T in K" },
    { title: "Combined Gas Law", formula: "(P1*V1)/T1 = (P2*V2)/T2", latex: "\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}", note: "Fixed amount of gas" },
    { title: "Molar Concentration", formula: "M = n / V", latex: "M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}}", note: "Molarity in mol/L" },
    { title: "Dilution Formula", formula: "M1*V1 = M2*V2", latex: "M_1 V_1 = M_2 V_2", note: "Conservation of solute moles" },
    { title: "Calorimetry Heat Equation", formula: "q = m*c*ΔT", latex: "q = m c \\Delta T", note: "c_water = 4.184 J/(g·°C)" },
    { title: "pH Definition", formula: "pH = -log[H+]", latex: "\\text{pH} = -\\log_{10}[\\text{H}^+]", note: "[H+] = 10^(-pH)" },
    { title: "Water Ion Product", formula: "Kw = [H+][OH-] = 1.0e-14", latex: "K_w = [\\text{H}^+][\\text{OH}^-] = 1.0 \\times 10^{-14} \\text{ (at 25°C)}", note: "pH + pOH = 14" },
    { title: "Gibbs Free Energy", formula: "ΔG = ΔH - T*ΔS", latex: "\\Delta G = \\Delta H - T \\Delta S", note: "Spontaneous when ΔG < 0" },
    { title: "Nernst Equation", formula: "E = E° - (0.0592/n)*logQ", latex: "E = E^\\circ - \\frac{0.0592}{n} \\log_{10} Q \\text{ (at 298 K)}", note: "Cell potential under non-standard conditions" }
  ],
  phys: [
    { title: "Kinematics: Velocity", formula: "v = v0 + a*t", latex: "v = v_0 + at", note: "Constant linear acceleration" },
    { title: "Kinematics: Position", formula: "x = x0 + v0*t + 0.5*a*t^2", latex: "x = x_0 + v_0 t + \\frac{1}{2} a t^2", note: "Displacement under acceleration" },
    { title: "Kinematics: Timeless", formula: "v^2 = v0^2 + 2*a*Δx", latex: "v^2 = v_0^2 + 2a \\Delta x", note: "Independent of elapsed time" },
    { title: "Newton's Second Law", formula: "F_net = m*a", latex: "\\vec{F}_{\\text{net}} = m \\vec{a}", note: "Force in Newtons, mass in kg" },
    { title: "Work & Kinetic Energy", formula: "KE = 0.5*m*v^2", latex: "KE = \\frac{1}{2} m v^2, \\quad W = F d \\cos\\theta", note: "W_net = ΔKE" },
    { title: "Wave Equation", formula: "v = f * λ", latex: "v = f \\lambda", note: "Wave speed, frequency, wavelength" },
    { title: "Snell's Law of Refraction", formula: "n1 * sin(θ1) = n2 * sin(θ2)", latex: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2", note: "Angles measured relative to normal" },
    { title: "Thin Lens / Mirror Equation", formula: "1/f = 1/do + 1/di", latex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}", note: "Magnification m = -di/do" },
    { title: "Ohm's Law", formula: "V = I * R", latex: "V = I R, \\quad P = IV = I^2 R = \\frac{V^2}{R}", note: "DC electric circuits" },
    { title: "Coulomb's Law", formula: "F = k * |q1*q2| / r^2", latex: "F_e = k_e \\frac{|q_1 q_2|}{r^2}", note: "Electrostatic attraction/repulsion" },
    { title: "Photon Energy", formula: "E = h * f = (h*c) / λ", latex: "E = hf = \\frac{hc}{\\lambda}", note: "Quantum photon packet energy" }
  ],
  bio: [
    { title: "Water Potential", formula: "Ψ = Ψs + Ψp", latex: "\\Psi = \\Psi_s + \\Psi_p", note: "Total water potential" },
    { title: "Solute Potential (Van 't Hoff)", formula: "Ψs = -i*C*R*T", latex: "\\Psi_s = -i C R T", note: "i: ionization, C: molarity, R: 0.0831, T: Kelvin" },
    { title: "Hardy-Weinberg Equilibrium", formula: "p^2 + 2pq + q^2 = 1", latex: "p^2 + 2pq + q^2 = 1, \\quad p + q = 1", note: "p: dominant allele, q: recessive allele" },
    { title: "Photosynthesis Overall Equation", formula: "6CO2 + 6H2O -> C6H12O6 + 6O2", latex: "6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2", note: "Photolysis in thylakoid, Calvin cycle in stroma" },
    { title: "Aerobic Cellular Respiration", formula: "C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP", latex: "\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 36\\text{-}38\\text{ ATP}", note: "Glycolysis, Krebs cycle, Oxidative Phosphorylation" }
  ]
};

// ============================================================================
// MATHEMATICAL PARSER & SAFE EVALUATION ENGINE (No arbitrary eval)
// ============================================================================

/**
 * Tokenizes and evaluates scientific mathematical expressions safely.
 * Supports: +, -, *, /, ^, %, parentheses, trig, log, ln, sqrt, abs, factorial,
 * constants (pi, e, c, h, N_A, etc.), and DEG/RAD modes.
 */
export function evaluateScienceExpression(rawExpr, angleMode = "DEG") {
  if (!rawExpr || !rawExpr.trim()) {
    return { success: true, result: 0, text: "0" };
  }

  try {
    let clean = rawExpr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, "pi")
      .replace(/–/g, "-")
      .trim();

    // Replace constant names with numeric values
    SCIENCE_CONSTANTS.forEach(c => {
      const reg = new RegExp(`\\b${c.symbol}\\b`, "g");
      clean = clean.replace(reg, String(c.value));
    });

    const tokens = tokenize(clean);
    const rpn = shuntingYard(tokens);
    const val = evaluateRPN(rpn, angleMode);

    if (isNaN(val)) {
      return { success: false, error: "Math Error" };
    }
    if (!isFinite(val)) {
      return { success: false, error: "Overflow / Div by Zero" };
    }

    return {
      success: true,
      result: val,
      text: formatCalcNumber(val)
    };
  } catch (err) {
    return { success: false, error: err.message || "Syntax Error" };
  }
}

function formatCalcNumber(num) {
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6).replace(/e\+?/, "e");
  }
  // Trim floating point artifacts like 0.30000000000000004
  const rounded = parseFloat(num.toFixed(10));
  return String(rounded);
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including scientific notation e.g. 6.022e23, 1.5e-4)
    if (/[0-9.]/.test(ch)) {
      let numStr = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      // Check for scientific exponent e/E followed by optional sign and digits
      if (i < expr.length && (expr[i] === "e" || expr[i] === "E")) {
        const next = expr[i + 1];
        if (/[0-9]/.test(next) || ((next === "+" || next === "-") && /[0-9]/.test(expr[i + 2]))) {
          numStr += expr[i++]; // add 'e'
          if (expr[i] === "+" || expr[i] === "-") {
            numStr += expr[i++];
          }
          while (i < expr.length && /[0-9]/.test(expr[i])) {
            numStr += expr[i++];
          }
        }
      }
      tokens.push({ type: "NUM", val: parseFloat(numStr) });
      continue;
    }

    // Identifiers (functions or constants like sin, cos, tan, log, ln, sqrt, pi, e)
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        idStr += expr[i++];
      }
      const lower = idStr.toLowerCase();
      if (lower === "pi") {
        tokens.push({ type: "NUM", val: Math.PI });
      } else if (lower === "e" && tokens.length > 0 && tokens[tokens.length - 1].type === "NUM") {
        // e used in place of e notation if parser didn't catch it
        tokens.push({ type: "OP", val: "*" });
        tokens.push({ type: "NUM", val: Math.E });
      } else if (lower === "e") {
        tokens.push({ type: "NUM", val: Math.E });
      } else {
        tokens.push({ type: "FN", val: lower });
      }
      continue;
    }

    // Operators and delimiters
    if ("+-*/^%()!,".includes(ch)) {
      // Differentiate unary minus from binary subtraction
      if (ch === "-") {
        const prev = tokens[tokens.length - 1];
        if (!prev || prev.type === "OP" || (prev.type === "PUNCT" && prev.val === "(")) {
          tokens.push({ type: "UNARY_MINUS", val: "neg" });
          i++;
          continue;
        }
      }
      if (ch === "(" || ch === ")") {
        tokens.push({ type: "PUNCT", val: ch });
      } else if (ch === "!") {
        tokens.push({ type: "POSTFIX", val: "!" });
      } else {
        tokens.push({ type: "OP", val: ch });
      }
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${ch}'`);
  }

  // Handle implicit multiplication (e.g., 2(3) -> 2*(3) or (2)(3) -> (2)*(3) or 2pi -> 2*pi)
  const resolved = [];
  for (let j = 0; j < tokens.length; j++) {
    resolved.push(tokens[j]);
    if (j < tokens.length - 1) {
      const cur = tokens[j];
      const nxt = tokens[j + 1];
      const curIsVal = cur.type === "NUM" || (cur.type === "PUNCT" && cur.val === ")") || cur.type === "POSTFIX";
      const nxtIsVal = nxt.type === "NUM" || nxt.type === "FN" || (nxt.type === "PUNCT" && nxt.val === "(");
      if (curIsVal && nxtIsVal) {
        resolved.push({ type: "OP", val: "*" });
      }
    }
  }

  return resolved;
}

function shuntingYard(tokens) {
  const output = [];
  const opStack = [];

  const precedence = {
    "+": 2,
    "-": 2,
    "*": 3,
    "/": 3,
    "%": 3,
    "^": 4,
    "neg": 5
  };

  const rightAssoc = {
    "^": true,
    "neg": true
  };

  tokens.forEach(token => {
    if (token.type === "NUM") {
      output.push(token);
    } else if (token.type === "FN") {
      opStack.push(token);
    } else if (token.type === "POSTFIX") {
      output.push(token);
    } else if (token.type === "UNARY_MINUS") {
      opStack.push(token);
    } else if (token.type === "OP") {
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === "FN") {
          output.push(opStack.pop());
          continue;
        }
        if (top.type === "OP" || top.type === "UNARY_MINUS") {
          const pTop = precedence[top.val] || 0;
          const pCur = precedence[token.val] || 0;
          if (pTop > pCur || (pTop === pCur && !rightAssoc[token.val])) {
            output.push(opStack.pop());
            continue;
          }
        }
        break;
      }
      opStack.push(token);
    } else if (token.type === "PUNCT" && token.val === "(") {
      opStack.push(token);
    } else if (token.type === "PUNCT" && token.val === ")") {
      let matched = false;
      while (opStack.length > 0) {
        const top = opStack.pop();
        if (top.type === "PUNCT" && top.val === "(") {
          matched = true;
          break;
        }
        output.push(top);
      }
      if (!matched) throw new Error("Mismatched parentheses");
      if (opStack.length > 0 && opStack[opStack.length - 1].type === "FN") {
        output.push(opStack.pop());
      }
    }
  });

  while (opStack.length > 0) {
    const top = opStack.pop();
    if (top.type === "PUNCT") throw new Error("Mismatched parentheses");
    output.push(top);
  }

  return output;
}

function evaluateRPN(rpn, angleMode) {
  const stack = [];

  rpn.forEach(token => {
    if (token.type === "NUM") {
      stack.push(token.val);
    } else if (token.type === "UNARY_MINUS") {
      if (stack.length < 1) throw new Error("Missing operand for negation");
      stack.push(-stack.pop());
    } else if (token.type === "POSTFIX" && token.val === "!") {
      if (stack.length < 1) throw new Error("Missing operand for factorial");
      const n = stack.pop();
      if (n < 0 || Math.floor(n) !== n || n > 170) throw new Error("Invalid factorial domain");
      let res = 1;
      for (let k = 2; k <= n; k++) res *= k;
      stack.push(res);
    } else if (token.type === "OP") {
      if (stack.length < 2) throw new Error("Missing operand for operator " + token.val);
      const b = stack.pop();
      const a = stack.pop();
      switch (token.val) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          stack.push(a / b);
          break;
        case "%": stack.push(a % b); break;
        case "^": stack.push(Math.pow(a, b)); break;
        default: throw new Error("Unknown operator: " + token.val);
      }
    } else if (token.type === "FN") {
      if (stack.length < 1) throw new Error("Missing argument for " + token.val);
      const arg = stack.pop();
      const isDeg = angleMode === "DEG";
      const radArg = isDeg ? (arg * Math.PI) / 180 : arg;

      switch (token.val) {
        case "sin": stack.push(Math.sin(radArg)); break;
        case "cos": stack.push(Math.cos(radArg)); break;
        case "tan":
          if (isDeg && Math.abs(arg % 180) === 90) throw new Error("tan undefined at 90°");
          stack.push(Math.tan(radArg));
          break;
        case "asin":
          if (arg < -1 || arg > 1) throw new Error("asin domain is [-1, 1]");
          stack.push(isDeg ? (Math.asin(arg) * 180) / Math.PI : Math.asin(arg));
          break;
        case "acos":
          if (arg < -1 || arg > 1) throw new Error("acos domain is [-1, 1]");
          stack.push(isDeg ? (Math.acos(arg) * 180) / Math.PI : Math.acos(arg));
          break;
        case "atan":
          stack.push(isDeg ? (Math.atan(arg) * 180) / Math.PI : Math.atan(arg));
          break;
        case "sinh": stack.push(Math.sinh(arg)); break;
        case "cosh": stack.push(Math.cosh(arg)); break;
        case "tanh": stack.push(Math.tanh(arg)); break;
        case "sqrt":
          if (arg < 0) throw new Error("Square root of negative number");
          stack.push(Math.sqrt(arg));
          break;
        case "cbrt": stack.push(Math.cbrt(arg)); break;
        case "log":
        case "log10":
          if (arg <= 0) throw new Error("Log domain error (x > 0)");
          stack.push(Math.log10(arg));
          break;
        case "ln":
          if (arg <= 0) throw new Error("ln domain error (x > 0)");
          stack.push(Math.log(arg));
          break;
        case "exp": stack.push(Math.exp(arg)); break;
        case "abs": stack.push(Math.abs(arg)); break;
        default: throw new Error("Unknown function: " + token.val);
      }
    }
  });

  if (stack.length !== 1) {
    throw new Error("Invalid mathematical expression");
  }

  return stack[0];
}

// ============================================================================
// MODAL UI STATE & RENDERING ENGINE
// ============================================================================

let currentExpression = "";
let currentDisplayResult = "0";
let lastAnswer = 0;
let angleMode = "DEG"; // 'DEG' or 'RAD'
let is2ndMode = false; // toggles inverse trig & alternative functions
let activeTab = "calc"; // 'calc', 'constants', 'formulas'
let activeFormulaSubject = "chem"; // 'chem', 'phys', 'bio'
let calcHistory = [];
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialModalX = 0;
let initialModalY = 0;
let topFloatingZ = 9500;

export function bringWidgetToFront(el) {
  if (!el) return;
  topFloatingZ += 2;
  el.style.zIndex = String(topFloatingZ);
}

export function openScienceCalculator(initialExpr = "") {
  let modal = document.getElementById("edugates-science-calculator");
  if (!modal) {
    modal = createCalculatorDOM();
    document.body.appendChild(modal);
    bindCalculatorEvents(modal);
  }

  if (initialExpr) {
    currentExpression = initialExpr;
    updateDisplay();
  }

  bringWidgetToFront(modal);
  modal.style.display = "flex";
  modal.classList.remove("minimized");
  SoundFX.playPop();

  // Sync toolbar active button state
  const toolCalc = document.getElementById("sb-tool-calc");
  if (toolCalc) toolCalc.classList.add("active");

  // NOTE: On touch smartboards and mobile tablets, programmatically focusing an <input>
  // commands the operating system to slide up the virtual on-screen keyboard,
  // destroying the interactive laboratory experience.
  // We intentionally do NOT auto-focus the display input. Physical keyboard keystrokes
  // are cleanly intercepted and forwarded via document keydown listeners.
}

export function closeScienceCalculator() {
  const modal = document.getElementById("edugates-science-calculator");
  if (modal) {
    modal.style.display = "none";
    SoundFX.playClick();
  }
  // Sync toolbar active button state
  const toolCalc = document.getElementById("sb-tool-calc");
  if (toolCalc) toolCalc.classList.remove("active");
}

export function toggleScienceCalculator(forceState) {
  const modal = document.getElementById("edugates-science-calculator");
  const isVisible = modal && modal.style.display !== "none";
  const shouldOpen = forceState !== undefined ? forceState : !isVisible;

  if (shouldOpen) {
    openScienceCalculator();
  } else {
    closeScienceCalculator();
  }
  return shouldOpen;
}

function createCalculatorDOM() {
  const modal = document.createElement("div");
  modal.id = "edugates-science-calculator";
  modal.className = "calculator-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "STEM Scientific Calculator and Formula Suite");

  modal.innerHTML = `
    <!-- Modal Drag Header -->
    <div class="calc-drag-header" id="calc-drag-header">
      <!-- Tier 1: Window Title & Controls -->
      <div class="calc-header-top-row">
        <div class="calc-header-title">
          <span class="calc-header-dot"></span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>
          </svg>
          <span class="calc-title-text">ClipSAT Calculator</span>
        </div>

        <div class="calc-header-actions">
          <button class="calc-hdr-btn" id="calc-btn-history-toggle" title="Toggle Calculation Tape (History)" aria-label="Toggle History">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button class="calc-hdr-btn" id="calc-btn-minimize" title="Minimize / Compact Floating Badge" aria-label="Minimize Calculator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="calc-hdr-btn calc-hdr-close" id="calc-btn-close" title="Close Calculator (Escape)" aria-label="Close Calculator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Tier 2: Mode & Utility Navigation Tabs -->
      <div class="calc-header-tabs" id="calc-header-tabs">
        <button class="calc-header-tab active" data-tab="calc" id="tab-btn-calc" title="Scientific Keypad">Calculator</button>
        <button class="calc-header-tab" data-tab="constants" id="tab-btn-constants" title="Physical &amp; Chemical Constants">Constants</button>
        <button class="calc-header-tab" data-tab="formulas" id="tab-btn-formulas" title="AP/SAT STEM Reference Equations">Formulas</button>
      </div>
    </div>

    <!-- Body Viewport Container -->
    <div class="calc-viewport" id="calc-viewport">
      <!-- 1. CALCULATOR VIEW -->
      <div class="calc-subview active" id="subview-calc">
        <!-- Dual Row LCD Screen -->
        <div class="calc-lcd-screen">
          <div class="calc-lcd-top">
            <span class="calc-badge-mode" id="calc-angle-indicator">DEG</span>
            <span class="calc-history-peek" id="calc-expr-peek"></span>
          </div>
          <div class="calc-lcd-main">
            <!-- inputmode=none and readonly prevents virtual onscreen software keyboards from popping up on touchscreens -->
            <input type="text" class="calc-expr-input" id="calc-expr-input" placeholder="0" spellcheck="false" autocomplete="off" inputmode="none" readonly />
            <button class="calc-copy-btn" id="calc-copy-result" title="Copy Result to Clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div class="calc-lcd-bottom">
            <span class="calc-eval-status" id="calc-eval-status">= 0</span>
          </div>
        </div>

        <!-- History Tape Dropdown Drawer -->
        <div class="calc-history-drawer" id="calc-history-drawer" style="display: none;">
          <div class="calc-history-hdr">
            <span>Calculation Tape</span>
            <button class="btn btn-sm btn-secondary" id="btn-clear-history" style="padding: 2px 8px; font-size: 0.72rem;">Clear</button>
          </div>
          <div class="calc-history-list" id="calc-history-list">
            <div class="calc-history-empty">No previous calculations recorded</div>
          </div>
        </div>

        <!-- Quick Science Constants Bar -->
        <div class="calc-quick-constants-bar">
          <span class="calc-quick-lbl">Constants:</span>
          <button class="calc-chip-btn" data-insert="c" title="Speed of light: 2.998 × 10⁸ m/s">c</button>
          <button class="calc-chip-btn" data-insert="h" title="Planck's const: 6.626 × 10⁻³⁴ J·s">h</button>
          <button class="calc-chip-btn" data-insert="N_A" title="Avogadro: 6.022 × 10²³ mol⁻¹">N_A</button>
          <button class="calc-chip-btn" data-insert="R" title="Gas const (SI): 8.314 J/(mol·K)">R</button>
          <button class="calc-chip-btn" data-insert="R_atm" title="Gas const (atm): 0.08206 L·atm/(mol·K)">R_atm</button>
          <button class="calc-chip-btn" data-insert="g" title="Standard gravity: 9.807 m/s²">g</button>
          <button class="calc-chip-btn" data-insert="q_e" title="Elementary charge: 1.602 × 10⁻¹⁹ C">q_e</button>
          <button class="calc-chip-btn" data-insert="k_e" title="Coulomb const: 8.988 × 10⁹ N·m²/C²">k_e</button>
        </div>

        <!-- Keypad Grid -->
        <div class="calc-keypad-grid">
          <!-- Row 1: Modes & Controls -->
          <button class="calc-key calc-key-mode" id="btn-toggle-deg-rad" title="Toggle Degrees / Radians">DEG</button>
          <button class="calc-key calc-key-fn" id="btn-toggle-2nd" title="Toggle Inverse / 2nd Functions">2nd</button>
          <button class="calc-key calc-key-fn" data-insert="(">(</button>
          <button class="calc-key calc-key-fn" data-insert=")">)</button>
          <button class="calc-key calc-key-ctrl" id="btn-calc-backspace" title="Backspace (Delete single character)">⌫</button>
          <button class="calc-key calc-key-clear" id="btn-calc-clear" title="Clear All (C)">C</button>

          <!-- Row 2: Trig & Logs -->
          <button class="calc-key calc-key-fn" data-fn="sin" id="btn-fn-sin">sin</button>
          <button class="calc-key calc-key-fn" data-fn="cos" id="btn-fn-cos">cos</button>
          <button class="calc-key calc-key-fn" data-fn="tan" id="btn-fn-tan">tan</button>
          <button class="calc-key calc-key-fn" data-fn="ln">ln</button>
          <button class="calc-key calc-key-fn" data-fn="log">log</button>
          <button class="calc-key calc-key-op" data-insert="/">÷</button>

          <!-- Row 3: Powers, Roots, Pi & 7,8,9 -->
          <button class="calc-key calc-key-fn" data-fn="sqrt" id="btn-fn-sqrt">√x</button>
          <button class="calc-key calc-key-fn" data-insert="^">xʸ</button>
          <button class="calc-key calc-key-num" data-insert="7">7</button>
          <button class="calc-key calc-key-num" data-insert="8">8</button>
          <button class="calc-key calc-key-num" data-insert="9">9</button>
          <button class="calc-key calc-key-op" data-insert="*">×</button>

          <!-- Row 4: Exp, Pi, & 4,5,6 -->
          <button class="calc-key calc-key-fn" data-insert="*10^" title="Scientific Notation Exp (×10ⁿ)">EE</button>
          <button class="calc-key calc-key-fn" data-insert="pi" title="Pi (3.14159...)">π</button>
          <button class="calc-key calc-key-num" data-insert="4">4</button>
          <button class="calc-key calc-key-num" data-insert="5">5</button>
          <button class="calc-key calc-key-num" data-insert="6">6</button>
          <button class="calc-key calc-key-op" data-insert="-">−</button>

          <!-- Row 5: 1/x, %, & 1,2,3 -->
          <button class="calc-key calc-key-fn" id="btn-fn-reciprocal" title="Reciprocal (1/x)">1/x</button>
          <button class="calc-key calc-key-fn" id="btn-fn-negate" title="Negate (±)">±</button>
          <button class="calc-key calc-key-num" data-insert="1">1</button>
          <button class="calc-key calc-key-num" data-insert="2">2</button>
          <button class="calc-key calc-key-num" data-insert="3">3</button>
          <button class="calc-key calc-key-op" data-insert="+">+</button>

          <!-- Row 6: 0, ., Ans, Equal -->
          <button class="calc-key calc-key-fn" id="btn-fn-ans" title="Last Calculated Answer">ANS</button>
          <button class="calc-key calc-key-num" data-insert="0">0</button>
          <button class="calc-key calc-key-num" data-insert=".">.</button>
          <button class="calc-key calc-key-fn" data-insert="%">%</button>
          <button class="calc-key calc-key-equal" id="btn-calc-equal" style="grid-column: span 2;" title="Calculate Result (Enter)">=</button>
        </div>
      </div>

      <!-- 2. CONSTANTS DIRECTORY VIEW -->
      <div class="calc-subview" id="subview-constants" style="display: none;">
        <div class="calc-ref-header">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <input type="text" class="fc-search-input" id="calc-constants-search" placeholder="Search constants (e.g. gas, Planck)..." style="flex: 1; font-size: 0.82rem; padding: 6px 10px;" autocomplete="off" />
            <button class="btn btn-sm btn-secondary" id="calc-constants-search-clear" title="Clear Search" style="display: none; padding: 4px 8px; font-size: 0.75rem;">✕</button>
          </div>
          <div class="calc-category-chips" id="calc-const-cat-chips" style="display: flex; gap: 6px; margin-bottom: 10px;">
            <button class="calc-chip-btn active" data-cat="all">All</button>
            <button class="calc-chip-btn" data-cat="Chemistry">Chemistry</button>
            <button class="calc-chip-btn" data-cat="Physics">Physics</button>
          </div>
        </div>
        <div class="calc-constants-table-wrapper">
          <table class="calc-constants-table">
            <thead>
              <tr>
                <th style="width: 48%;">Constant</th>
                <th style="width: 37%;">Standard Value</th>
                <th style="width: 15%; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="calc-constants-tbody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. AP/SAT STEM FORMULAS VIEW -->
      <div class="calc-subview" id="subview-formulas" style="display: none;">
        <div class="calc-formula-subnav">
          <button class="btn btn-sm btn-secondary active" data-sub="chem" id="btn-sub-chem">Inspire Chemistry</button>
          <button class="btn btn-sm btn-secondary" data-sub="phys" id="btn-sub-phys">Inspire Physics</button>
          <button class="btn btn-sm btn-secondary" data-sub="bio" id="btn-sub-bio">Inspire Biology</button>
        </div>
        <div class="calc-formula-cards-list" id="calc-formula-cards-list">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>
  `;

  return modal;
}

function bindCalculatorEvents(modal) {
  const dragHeader = modal.querySelector("#calc-drag-header");
  const exprInput = modal.querySelector("#calc-expr-input");
  const evalStatus = modal.querySelector("#calc-eval-status");
  const angleIndicator = modal.querySelector("#calc-angle-indicator");
  const btnDegRad = modal.querySelector("#btn-toggle-deg-rad");
  const btn2nd = modal.querySelector("#btn-toggle-2nd");
  const btnEqual = modal.querySelector("#btn-calc-equal");
  const btnClear = modal.querySelector("#btn-calc-clear");
  const btnBackspace = modal.querySelector("#btn-calc-backspace");
  const btnCopy = modal.querySelector("#calc-copy-result");
  const btnHistoryToggle = modal.querySelector("#calc-btn-history-toggle");
  const historyDrawer = modal.querySelector("#calc-history-drawer");
  const btnClearHistory = modal.querySelector("#btn-clear-history");
  const btnClose = modal.querySelector("#calc-btn-close");
  const btnMinimize = modal.querySelector("#calc-btn-minimize");

  // Bring to front on any click or touch
  modal.addEventListener("pointerdown", () => {
    bringWidgetToFront(modal);
  });

  // Draggable logic for Smartboard & Desktop
  dragHeader.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    bringWidgetToFront(modal);
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = modal.getBoundingClientRect();
    initialModalX = rect.left;
    initialModalY = rect.top;
    modal.style.right = "auto";
    modal.style.bottom = "auto";
    modal.style.left = `${initialModalX}px`;
    modal.style.top = `${initialModalY}px`;
    dragHeader.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const newX = Math.max(10, Math.min(window.innerWidth - 380, initialModalX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 200, initialModalY + dy));
    modal.style.left = `${newX}px`;
    modal.style.top = `${newY}px`;
  });

  window.addEventListener("pointerup", () => {
    if (isDragging) {
      isDragging = false;
      dragHeader.style.cursor = "grab";
    }
  });

  // Minimize / Expand
  btnMinimize.addEventListener("click", () => {
    modal.classList.toggle("minimized");
    SoundFX.playClick();
  });

  btnClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeScienceCalculator();
  });

  // Header Subview Switchers
  modal.querySelectorAll(".calc-header-tab").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      modal.querySelectorAll(".calc-header-tab").forEach(b => b.classList.remove("active"));
      modal.querySelectorAll(".calc-subview").forEach(v => {
        v.style.display = "none";
        v.classList.remove("active");
      });

      tabBtn.classList.add("active");
      activeTab = tabBtn.dataset.tab;
      const targetView = modal.querySelector(`#subview-${activeTab}`);
      if (targetView) {
        targetView.style.display = "block";
        targetView.classList.add("active");
      }

      if (activeTab === "constants") {
        renderConstantsTable();
      } else if (activeTab === "formulas") {
        renderFormulasView();
      }
      SoundFX.playClick();
    });
  });

  // Formula Subject Switchers
  modal.querySelectorAll(".calc-formula-subnav button").forEach(subBtn => {
    subBtn.addEventListener("click", () => {
      modal.querySelectorAll(".calc-formula-subnav button").forEach(b => b.classList.remove("active"));
      subBtn.classList.add("active");
      activeFormulaSubject = subBtn.dataset.sub;
      renderFormulasView();
      SoundFX.playClick();
    });
  });

  // Constants Category Filter Chips
  let activeConstCategory = "all";
  const catChips = modal.querySelectorAll("#calc-const-cat-chips .calc-chip-btn");
  catChips.forEach(chip => {
    chip.addEventListener("click", () => {
      catChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeConstCategory = chip.dataset.cat;
      const searchInput = modal.querySelector("#calc-constants-search");
      renderConstantsTable(searchInput ? searchInput.value : "", activeConstCategory);
      SoundFX.playClick();
    });
  });

  // Constants Search Filter & Clear
  const constantsSearch = modal.querySelector("#calc-constants-search");
  const constantsClear = modal.querySelector("#calc-constants-search-clear");
  constantsSearch?.addEventListener("input", (e) => {
    const val = e.target.value;
    if (constantsClear) constantsClear.style.display = val ? "block" : "none";
    renderConstantsTable(val, activeConstCategory);
  });
  constantsClear?.addEventListener("click", () => {
    if (constantsSearch) constantsSearch.value = "";
    if (constantsClear) constantsClear.style.display = "none";
    renderConstantsTable("", activeConstCategory);
    SoundFX.playClick();
  });

  // DEG / RAD Toggle
  btnDegRad.addEventListener("click", () => {
    angleMode = angleMode === "DEG" ? "RAD" : "DEG";
    btnDegRad.innerText = angleMode;
    angleIndicator.innerText = angleMode;
    SoundFX.playSwitchSnap();
    previewEvaluation();
  });

  // 2nd / Inverse Mode Toggle
  btn2nd.addEventListener("click", () => {
    is2ndMode = !is2ndMode;
    btn2nd.classList.toggle("active", is2ndMode);
    modal.querySelector("#btn-fn-sin").innerText = is2ndMode ? "sin⁻¹" : "sin";
    modal.querySelector("#btn-fn-sin").dataset.fn = is2ndMode ? "asin" : "sin";
    modal.querySelector("#btn-fn-cos").innerText = is2ndMode ? "cos⁻¹" : "cos";
    modal.querySelector("#btn-fn-cos").dataset.fn = is2ndMode ? "acos" : "cos";
    modal.querySelector("#btn-fn-tan").innerText = is2ndMode ? "tan⁻¹" : "tan";
    modal.querySelector("#btn-fn-tan").dataset.fn = is2ndMode ? "atan" : "tan";
    modal.querySelector("#btn-fn-sqrt").innerText = is2ndMode ? "∛x" : "√x";
    modal.querySelector("#btn-fn-sqrt").dataset.fn = is2ndMode ? "cbrt" : "sqrt";
    SoundFX.playSwitchSnap();
  });

  // Input typing listener
  exprInput.addEventListener("input", (e) => {
    currentExpression = e.target.value;
    previewEvaluation();
  });

  // Physical Keyboard navigation & Shortcuts
  // Allows hardware desktop/laptop keyboards to type numbers, operators, Enter, Backspace, Escape
  // without needing input focus or summoning on-screen touch virtual keyboards
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "none") return;
    if (e.target && e.target.tagName === "INPUT" && e.target.id !== "calc-expr-input" && e.target.id !== "calc-constants-search") {
      return;
    }
    if (e.target && (e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) {
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeScienceCalculator();
      return;
    }

    if (activeTab === "calc") {
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        executeEvaluation();
        SoundFX.playClick();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        btnBackspace.click();
      } else if (e.key === "Delete" || ((e.key === "c" || e.key === "C") && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        btnClear.click();
      } else if ("0123456789+-*/().^%".includes(e.key)) {
        e.preventDefault();
        insertAtCursor(e.key);
        SoundFX.playClick();
      }
    }
  });

  // Keypad button insertion
  modal.querySelectorAll("[data-insert]").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.insert;
      insertAtCursor(val);
      SoundFX.playClick();
    });
  });

  // Scientific function buttons
  modal.querySelectorAll("[data-fn]").forEach(btn => {
    btn.addEventListener("click", () => {
      const fnName = btn.dataset.fn;
      insertFunction(fnName);
      SoundFX.playClick();
    });
  });

  // Reciprocal button (1/x)
  modal.querySelector("#btn-fn-reciprocal").addEventListener("click", () => {
    if (currentExpression) {
      currentExpression = `1/(${currentExpression})`;
    } else {
      currentExpression = "1/";
    }
    updateDisplay();
    previewEvaluation();
    SoundFX.playClick();
  });

  // Negate button (±)
  modal.querySelector("#btn-fn-negate").addEventListener("click", () => {
    if (!currentExpression) {
      currentExpression = "-";
    } else if (currentExpression.startsWith("-(") && currentExpression.endsWith(")")) {
      currentExpression = currentExpression.slice(2, -1);
    } else {
      currentExpression = `-(${currentExpression})`;
    }
    updateDisplay();
    previewEvaluation();
    SoundFX.playClick();
  });

  // ANS button
  modal.querySelector("#btn-fn-ans").addEventListener("click", () => {
    insertAtCursor(String(lastAnswer));
    SoundFX.playClick();
  });

  // Clear All
  btnClear.addEventListener("click", () => {
    currentExpression = "";
    currentDisplayResult = "0";
    modal.querySelector("#calc-expr-peek").innerText = "";
    updateDisplay();
    evalStatus.innerText = "= 0";
    evalStatus.classList.remove("error");
    SoundFX.playClick();
  });

  // Backspace
  btnBackspace.addEventListener("click", () => {
    if (currentExpression.length > 0) {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
      previewEvaluation();
    }
    SoundFX.playClick();
  });

  // Equals (=) execution
  btnEqual.addEventListener("click", () => {
    executeEvaluation();
  });

  // Copy result
  btnCopy.addEventListener("click", () => {
    if (currentDisplayResult && currentDisplayResult !== "Error") {
      navigator.clipboard.writeText(currentDisplayResult).then(() => {
        showToast("Copied to Clipboard", `${currentDisplayResult} ready to paste`, "success");
        SoundFX.playLevelUp();
      }).catch(() => {
        showToast("Clipboard unavailable", currentDisplayResult, "info");
      });
    }
  });

  // Toggle History Drawer
  btnHistoryToggle.addEventListener("click", () => {
    const isShown = historyDrawer.style.display !== "none";
    historyDrawer.style.display = isShown ? "none" : "block";
    btnHistoryToggle.classList.toggle("active", !isShown);
    SoundFX.playClick();
  });

  // Clear History
  btnClearHistory.addEventListener("click", () => {
    calcHistory = [];
    renderHistoryTape();
    SoundFX.playClick();
  });
}

function insertAtCursor(text) {
  const input = document.getElementById("calc-expr-input");
  if (!input) return;

  const start = input.selectionStart !== null && input.selectionStart !== undefined ? input.selectionStart : currentExpression.length;
  const end = input.selectionEnd !== null && input.selectionEnd !== undefined ? input.selectionEnd : currentExpression.length;

  currentExpression = currentExpression.substring(0, start) + text + currentExpression.substring(end);
  updateDisplay();
  
  const newPos = start + text.length;
  try {
    input.setSelectionRange(newPos, newPos);
  } catch (e) {}
  // Intentionally omitting input.focus() to prevent touch screens/smartboards from popping up the virtual software keyboard
  previewEvaluation();
}

function insertFunction(fnName) {
  insertAtCursor(`${fnName}(`);
}

function updateDisplay() {
  const input = document.getElementById("calc-expr-input");
  if (input) {
    input.value = currentExpression;
  }
}

function previewEvaluation() {
  const evalStatus = document.getElementById("calc-eval-status");
  if (!evalStatus || !currentExpression.trim()) {
    if (evalStatus) {
      evalStatus.innerText = "= 0";
      evalStatus.classList.remove("error");
    }
    return;
  }

  const evalRes = evaluateScienceExpression(currentExpression, angleMode);
  if (evalRes.success) {
    evalStatus.innerText = `= ${evalRes.text}`;
    evalStatus.classList.remove("error");
  } else {
    evalStatus.innerText = `...`;
    evalStatus.classList.remove("error");
  }
}

function executeEvaluation() {
  const input = document.getElementById("calc-expr-input");
  const evalStatus = document.getElementById("calc-eval-status");
  const exprPeek = document.getElementById("calc-expr-peek");

  if (!currentExpression.trim()) return;

  const evalRes = evaluateScienceExpression(currentExpression, angleMode);
  if (evalRes.success) {
    const prevExpr = currentExpression;
    lastAnswer = evalRes.result;
    currentDisplayResult = evalRes.text;

    // Record in history tape
    calcHistory.unshift({
      expr: prevExpr,
      result: evalRes.text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    });
    if (calcHistory.length > 30) calcHistory.pop();
    renderHistoryTape();

    if (exprPeek) exprPeek.innerText = `${prevExpr} =`;
    currentExpression = evalRes.text;
    updateDisplay();
    evalStatus.innerText = `= ${evalRes.text}`;
    evalStatus.classList.remove("error");

    SoundFX.playScorePip();
  } else {
    evalStatus.innerText = evalRes.error;
    evalStatus.classList.add("error");
    SoundFX.playError();
  }
}

function renderHistoryTape() {
  const list = document.getElementById("calc-history-list");
  if (!list) return;

  if (calcHistory.length === 0) {
    list.innerHTML = `<div class="calc-history-empty">No previous calculations recorded</div>`;
    return;
  }

  list.innerHTML = calcHistory.map((item, idx) => `
    <div class="calc-history-item" data-idx="${idx}" title="Click to insert result into calculation">
      <div class="calc-history-time">${item.timestamp}</div>
      <div class="calc-history-expr">${item.expr}</div>
      <div class="calc-history-ans">= ${item.result}</div>
    </div>
  `).join("");

  list.querySelectorAll(".calc-history-item").forEach(itemEl => {
    itemEl.addEventListener("click", () => {
      const idx = parseInt(itemEl.dataset.idx, 10);
      const chosen = calcHistory[idx];
      if (chosen) {
        insertAtCursor(chosen.result);
        SoundFX.playClick();
      }
    });
  });
}

function renderConstantsTable(query = "", category = "all") {
  const tbody = document.getElementById("calc-constants-tbody");
  if (!tbody) return;

  const q = query.trim().toLowerCase();
  const filtered = SCIENCE_CONSTANTS.filter(c => {
    const matchQuery = !q || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchCat = category === "all" || c.category.toLowerCase().includes(category.toLowerCase());
    return matchQuery && matchCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 18px;">No constants match criteria</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <span style="font-family: var(--font-mono); font-weight: 800; color: #38bdf8; font-size: 0.88rem;">${c.symbol}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">${c.category}</span>
        </div>
        <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-main); line-height: 1.2;">${c.name}</div>
      </td>
      <td>
        <div style="font-family: var(--font-mono); font-size: 0.76rem; color: #a5f3fc; font-weight: 600;">${c.display}</div>
      </td>
      <td style="text-align: right;">
        <button class="btn btn-sm btn-secondary calc-use-const-btn" data-sym="${c.symbol}" title="Insert ${c.symbol} into active calculation" style="padding: 3px 8px; font-size: 0.72rem; border-radius: 6px; white-space: nowrap;">
          + Use
        </button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".calc-use-const-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sym = btn.dataset.sym;
      const calcTab = document.getElementById("tab-btn-calc");
      calcTab?.click();
      insertAtCursor(sym);
      showToast("Constant Inserted", `${sym} inserted into active calculation`, "info");
    });
  });
}

function renderFormulasView() {
  const container = document.getElementById("calc-formula-cards-list");
  if (!container) return;

  const list = STEM_FORMULA_SHEETS[activeFormulaSubject] || [];
  container.innerHTML = list.map(item => `
    <div class="calc-formula-card">
      <div class="calc-formula-card-top">
        <span class="calc-formula-title">${item.title}</span>
        <button class="btn btn-sm btn-secondary calc-insert-formula-btn" data-formula="${item.formula}" title="Insert formula template into calculator" style="padding: 2px 7px; font-size: 0.72rem;">
          Use
        </button>
      </div>
      <div class="calc-formula-latex-box" data-latex="${item.latex}">
        $${item.latex}$
      </div>
      <div class="calc-formula-note">${item.note}</div>
    </div>
  `).join("");

  renderMathInElement(container);

  container.querySelectorAll(".calc-insert-formula-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rawFormula = btn.dataset.formula;
      const calcTab = document.getElementById("tab-btn-calc");
      calcTab?.click();
      insertAtCursor(rawFormula);
      showToast("Formula Loaded", rawFormula, "info");
    });
  });
}
