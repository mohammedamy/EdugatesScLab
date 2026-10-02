// Edugates-ClipSAT Science Labs - Step-by-Step Interactive Worked Example Solver
// Provides guided numerical calculation steps, intermediate validation with SI tolerance, hints, and derivations.

import { renderLatex, renderMathInElement } from "../utils/math-renderer.js";
import { SoundFX } from "../utils/audio-synth.js";

/**
 * Validates a student's numerical answer against an expected target value.
 * Supports:
 * - Direct numeric comparison with fractional tolerance (default +/- 2.5%)
 * - Scientific notation (e.g. 1.2e-4, 3.20 * 10^-5)
 * - Percentage strings (e.g. "1.64%", "32%")
 * - String matches for non-numeric classifications (e.g. "acidic", "floats")
 */
export function validateStepAnswer(userVal, expectedVal, tolerance = 0.03) {
  if (userVal === undefined || userVal === null || userVal === "") {
    return { valid: false, message: "Please enter a value to check." };
  }

  const cleanUser = String(userVal).trim().toLowerCase();
  const cleanExpected = String(expectedVal).trim().toLowerCase();

  // Exact text match (case-insensitive)
  if (cleanUser === cleanExpected) {
    return { valid: true, exact: true };
  }

  // Parse numeric components
  const parseNum = (str) => {
    if (typeof str === "number") return str;
    // Replace scientific notation forms e.g. 3.20 x 10^-5 or 3.20 * 10^-5
    let s = String(str).replace(/\\times/g, "*").replace(/×/g, "*").replace(/%/g, "");
    const sciMatch = s.match(/([0-9.]+)\s*\*\s*10\^?\{?(-?[0-9]+)\}?/);
    if (sciMatch) {
      return parseFloat(sciMatch[1]) * Math.pow(10, parseFloat(sciMatch[2]));
    }
    // Clean out common units and commas
    const numMatch = s.match(/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
    return numMatch ? parseFloat(numMatch[0]) : NaN;
  };

  const uNum = parseNum(cleanUser);
  const eNum = parseNum(cleanExpected);

  if (!isNaN(uNum) && !isNaN(eNum)) {
    if (eNum === 0) {
      const diff = Math.abs(uNum);
      return { valid: diff <= 0.01, diff, percentError: 0 };
    }
    const diff = Math.abs(uNum - eNum);
    const relDiff = diff / Math.abs(eNum);
    const valid = relDiff <= tolerance;
    return {
      valid,
      diff,
      percentError: (relDiff * 100).toFixed(2),
      isClose: relDiff <= tolerance * 2
    };
  }

  // Substring classification match (e.g. "acidic" in "distinctly acidic")
  if (cleanExpected.includes(cleanUser) || cleanUser.includes(cleanExpected)) {
    return { valid: true, classification: true };
  }

  return { valid: false, message: "Value does not match expected target." };
}

/**
 * Parses raw workedExample steps into structured interactive solver step objects.
 * If workedExample.solverSteps is already provided, it will use that directly.
 */
export function parseOrGenerateSolverSteps(workedExample) {
  if (!workedExample) return [];

  if (Array.isArray(workedExample.solverSteps) && workedExample.solverSteps.length > 0) {
    return workedExample.solverSteps.map((step, idx) => ({
      stepNumber: idx + 1,
      title: step.title || `Step ${idx + 1}`,
      prompt: step.prompt || `Compute Step ${idx + 1}:`,
      formula: step.formula || "",
      hint: step.hint || "Review given data and apply relevant formula.",
      expected: step.expected,
      unit: step.unit || "",
      tolerance: step.tolerance !== undefined ? step.tolerance : 0.03,
      derivation: step.derivation || (workedExample.steps && workedExample.steps[idx]) || ""
    }));
  }

  const rawSteps = Array.isArray(workedExample.steps) ? workedExample.steps : [];
  if (rawSteps.length === 0) {
    return [
      {
        stepNumber: 1,
        title: "Final Result Evaluation",
        prompt: "Calculate final answer for the given parameters:",
        formula: workedExample.formula || "",
        hint: "Apply the governing equations to evaluate the final value.",
        expected: workedExample.answer || "0",
        unit: "",
        tolerance: 0.03,
        derivation: workedExample.answer || ""
      }
    ];
  }

  return rawSteps.map((stepStr, idx) => {
    // Extract step title (e.g. "1. Determine the displaced volume: ...")
    let title = `Step ${idx + 1}`;
    let body = stepStr;
    const colonIdx = stepStr.indexOf(":");
    if (colonIdx > 0 && colonIdx < 80) {
      title = stepStr.substring(0, colonIdx).replace(/^[0-9]+[\.\)]\s*/, "").trim();
      body = stepStr.substring(colonIdx + 1).trim();
    }

    // Try extracting target calculation result at the end of the step
    // e.g. "= 16.5 mL", "= 9.00 g/cm^3", "= 4.49", "= 30.82 kJ", "\approx 906"
    let expected = "";
    let unit = "";

    const equalMatches = [...body.matchAll(/(?:=|\\approx|approx)\s*([^=;]+)$/g)];
    if (equalMatches.length > 0) {
      const tail = equalMatches[equalMatches.length - 1][1].replace(/\.$/, "").trim();
      // Extract number and unit
      const numMatch = tail.match(/([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/);
      if (numMatch) {
        expected = numMatch[1];
        // Clean unit from remaining LaTeX text e.g. \text{ mL} -> mL
        const unitPart = tail.replace(numMatch[0], "").replace(/\\text\{([^}]+)\}/g, "$1").replace(/[\\${}]/g, "").trim();
        unit = unitPart;
      } else {
        expected = tail;
      }
    } else {
      expected = "0";
    }

    return {
      stepNumber: idx + 1,
      title: title || `Step ${idx + 1}`,
      prompt: `Calculate the quantitative result for Step ${idx + 1}:`,
      formula: "",
      hint: `Refer to the calculation setup: ${body.length > 120 ? body.substring(0, 120) + "..." : body}`,
      expected: expected || "0",
      unit: unit,
      tolerance: 0.03,
      derivation: stepStr
    };
  });
}

/**
 * Generates the HTML markup for the dual-mode Worked Example container.
 * Supports switching between:
 * - "reference" (Full Standard Derivation)
 * - "solver" (Guided Interactive Calculation Step Solver)
 */
export function renderWorkedExampleHTML(workedExample, isVerified = false, initialMode = "reference") {
  if (!workedExample) return "";

  const statusLabel = workedExample.status || (isVerified ? "Specialist Verified Solution" : "Curriculum Standard Reference Solution (Under Specialist Review)");
  const statusColor = isVerified ? "#10b981" : "#f59e0b";
  const statusBg = isVerified ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const statusBorder = isVerified ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)";

  const steps = parseOrGenerateSolverSteps(workedExample);
  const totalSteps = steps.length;

  return `
    <div class="modal-worked-example worked-example-interactive-shell" id="worked-example-root" data-mode="${initialMode}">
      <!-- Header with Mode Selector -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span style="color: #0284c7; font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
            <span>🧮</span> Step-by-Step Quantitative Worked Example
          </span>
          <span style="font-size: 0.75rem; color: ${statusColor}; font-family: var(--font-mono); font-weight: 700; background: ${statusBg}; padding: 3px 10px; border-radius: 4px; border: 1px solid ${statusBorder};">
            ${statusLabel}
          </span>
        </div>

        <!-- Mode Toggle Segmented Control -->
        <div class="we-mode-toggle" style="display: inline-flex; background: var(--bg-surface-elevated, rgba(15,23,42,0.6)); border: 1px solid var(--border-color, rgba(255,255,255,0.15)); border-radius: 8px; padding: 3px; gap: 4px;">
          <button type="button" class="we-mode-btn ${initialMode === 'reference' ? 'active' : ''}" data-target-mode="reference" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; background: ${initialMode === 'reference' ? '#0284c7' : 'transparent'}; color: ${initialMode === 'reference' ? '#fff' : 'var(--text-muted)'};">
            <span>📖</span> Reference Solution
          </button>
          <button type="button" class="we-mode-btn ${initialMode === 'solver' ? 'active' : ''}" data-target-mode="solver" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; background: ${initialMode === 'solver' ? '#0284c7' : 'transparent'}; color: ${initialMode === 'solver' ? '#fff' : 'var(--text-muted)'};">
            <span>⚡</span> Try Interactive Solver
            <span style="background: #10b981; color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 9999px; text-transform: uppercase;">Step-by-Step</span>
          </button>
        </div>
      </div>

      <!-- Problem Statement & Given Data (Common to both modes) -->
      <div class="worked-example-prob" style="margin-bottom: 10px; font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">
        <strong style="color: #38bdf8;">Problem:</strong> ${workedExample.problem}
      </div>
      <div class="worked-example-given" style="margin-bottom: 14px; background: rgba(56,189,248,0.06); border-left: 3px solid #0284c7; padding: 10px 14px; border-radius: 0 8px 8px 0;">
        <strong style="color: #0284c7;">Given Parameters:</strong>
        <span style="font-family: var(--font-mono); margin-left: 6px; color: var(--text-main);">${renderLatex(workedExample.given, false)}</span>
      </div>

      <!-- VIEW 1: Static Reference Derivation View -->
      <div class="we-view-reference" style="display: ${initialMode === 'reference' ? 'block' : 'none'};">
        <div class="worked-example-steps" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          ${(workedExample.steps || []).map((s, i) => `
            <div style="background: var(--bg-surface, rgba(15,23,42,0.4)); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 12px 16px; line-height: 1.5; color: var(--text-muted); font-size: 0.9rem;">
              ${s}
            </div>
          `).join("")}
        </div>
        <div class="worked-example-result" style="display: flex; align-items: center; justify-content: space-between; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 12px 18px; flex-wrap: wrap; gap: 8px;">
          <span class="worked-example-result-label" style="font-weight: 700; color: #10b981; font-size: 0.92rem;">Final Calculated Result:</span>
          <span class="worked-example-result-val" style="font-family: var(--font-mono); font-weight: 800; font-size: 1.05rem; color: #10b981;">${renderLatex(workedExample.answer, false)}</span>
        </div>
      </div>

      <!-- VIEW 2: Guided Interactive Step-by-Step Solver -->
      <div class="we-view-solver" style="display: ${initialMode === 'solver' ? 'block' : 'none'};">
        <!-- Interactive Progress Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">Solver Progress:</span>
            <span id="we-progress-count" style="font-family: var(--font-mono); font-weight: 800; color: #38bdf8; font-size: 0.95rem;">Step 1 of ${totalSteps}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" id="we-btn-reset" title="Reset and practice again" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span>⟲</span> Reset Solver
            </button>
            <button type="button" id="we-btn-reveal-all" title="Reveal full solution" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span>👁️</span> Reveal All Steps
            </button>
          </div>
        </div>

        <!-- Progress Bar Meter -->
        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden; margin-bottom: 18px;">
          <div id="we-progress-fill" style="height: 100%; width: ${(1 / totalSteps) * 100}%; background: linear-gradient(90deg, #0284c7, #10b981); transition: width 0.3s ease;"></div>
        </div>

        <!-- Step Cards Container -->
        <div class="we-step-cards-container" id="we-steps-list" style="display: flex; flex-direction: column; gap: 14px;">
          ${steps.map((st, i) => `
            <div class="we-step-card ${i === 0 ? 'active' : 'locked'}" id="we-step-${i}" data-step-idx="${i}" style="border: 1px solid ${i === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}; border-radius: 10px; padding: 16px; background: ${i === 0 ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.2)'}; transition: all 0.25s ease;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="we-step-badge" id="we-badge-${i}" style="width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; background: ${i === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)'}; color: #fff;">
                    ${i + 1}
                  </span>
                  <span style="font-weight: 700; font-size: 0.95rem; color: ${i === 0 ? 'var(--text-main)' : 'var(--text-muted)'};">
                    ${st.title}
                  </span>
                </div>
                <span class="we-step-status" id="we-status-${i}" style="font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">
                  ${i === 0 ? 'In Progress' : 'Locked'}
                </span>
              </div>

              <!-- Step Calculation Prompt & Derivation Body -->
              <div class="we-step-body" id="we-body-${i}" style="display: ${i === 0 ? 'block' : 'none'}; margin-top: 10px;">
                <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.5;">
                  ${st.prompt}
                </p>

                <!-- Input Row -->
                <div class="we-step-input-row" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                  <div style="display: inline-flex; align-items: center; background: var(--bg-surface-elevated, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.2)); border-radius: 8px; overflow: hidden; min-height: 44px;">
                    <input type="text" class="we-step-input" id="we-input-${i}" placeholder="Enter calculated value" aria-label="Step ${i + 1} answer" style="background: transparent; border: none; outline: none; padding: 8px 14px; font-family: var(--font-mono); font-size: 0.95rem; color: #fff; width: 180px;">
                    ${st.unit ? `<span style="padding: 8px 12px; background: rgba(255,255,255,0.06); color: #38bdf8; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; border-left: 1px solid rgba(255,255,255,0.1);">${st.unit}</span>` : ''}
                  </div>

                  <button type="button" class="we-btn-check" data-step-idx="${i}" style="min-height: 44px; padding: 0 18px; background: #0284c7; color: #fff; font-weight: 700; font-size: 0.88rem; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <span>✓</span> Check
                  </button>

                  <button type="button" class="we-btn-hint" data-step-idx="${i}" style="min-height: 44px; padding: 0 14px; background: transparent; color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); font-weight: 600; font-size: 0.82rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <span>💡</span> Hint
                  </button>

                  <button type="button" class="we-btn-reveal" data-step-idx="${i}" style="min-height: 44px; padding: 0 12px; background: transparent; color: var(--text-dim); border: 1px solid var(--border-color); font-weight: 600; font-size: 0.8rem; border-radius: 8px; cursor: pointer;">
                    Reveal Step
                  </button>
                </div>

                <!-- Hint Container (Initially hidden) -->
                <div class="we-step-hint-box" id="we-hint-${i}" style="display: none; background: rgba(245,158,11,0.08); border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.82rem; color: #fbbf24; margin-bottom: 10px;">
                  <strong>Hint:</strong> ${st.hint}
                </div>

                <!-- Feedback Alert (Initially hidden) -->
                <div class="we-step-feedback" id="we-feedback-${i}" style="display: none; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 10px;"></div>

                <!-- Full Step Derivation (Shown once solved or revealed) -->
                <div class="we-step-solution" id="we-solution-${i}" style="display: none; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.25); border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; color: var(--text-main); margin-top: 8px;">
                  <strong style="color: #10b981;">Complete Derivation:</strong>
                  <div style="margin-top: 4px; color: var(--text-muted);">${st.derivation}</div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Master Completion Banner (Initially hidden) -->
        <div id="we-completion-card" style="display: none; margin-top: 18px; background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(2,132,199,0.15)); border: 1.5px solid #10b981; border-radius: 12px; padding: 18px 24px; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 6px;">🎉</div>
          <h4 style="margin: 0 0 6px 0; color: #10b981; font-weight: 800; font-size: 1.15rem;">Worked Example Mastered!</h4>
          <p style="margin: 0 0 12px 0; font-size: 0.9rem; color: var(--text-muted);">
            You have successfully calculated and validated all quantitative steps for this curriculum problem.
          </p>
          <div style="display: inline-block; background: var(--bg-surface-elevated, #0f172a); border: 1px solid rgba(16,185,129,0.4); border-radius: 8px; padding: 8px 18px; margin-bottom: 14px;">
            <span style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-right: 8px;">Final Verified Answer:</span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: #10b981; font-size: 1.05rem;">${renderLatex(workedExample.answer, false)}</span>
          </div>
          <div>
            <button type="button" id="we-btn-mastered-restart" style="padding: 8px 18px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer;">
              ⟲ Practice Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initializes interactive event listeners on the worked example root element.
 */
export function initWorkedExampleListeners(rootElement, workedExample) {
  if (!rootElement || !workedExample) return;

  const steps = parseOrGenerateSolverSteps(workedExample);
  const totalSteps = steps.length;
  let completedStepIndices = new Set();
  let currentActiveStep = 0;

  // Mode toggles
  const modeBtns = rootElement.querySelectorAll(".we-mode-btn");
  const viewRef = rootElement.querySelector(".we-view-reference");
  const viewSolver = rootElement.querySelector(".we-view-solver");

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetMode = btn.dataset.targetMode;
      modeBtns.forEach(b => {
        b.classList.toggle("active", b.dataset.targetMode === targetMode);
        b.style.background = b.dataset.targetMode === targetMode ? "#0284c7" : "transparent";
        b.style.color = b.dataset.targetMode === targetMode ? "#fff" : "var(--text-muted)";
      });
      if (viewRef) viewRef.style.display = targetMode === "reference" ? "block" : "none";
      if (viewSolver) viewSolver.style.display = targetMode === "solver" ? "block" : "none";
      rootElement.dataset.mode = targetMode;
      SoundFX.playClick();
    });
  });

  function updateProgress() {
    const countSpan = rootElement.querySelector("#we-progress-count");
    const fillBar = rootElement.querySelector("#we-progress-fill");
    const numDone = completedStepIndices.size;
    const pct = Math.min(100, Math.round((numDone / totalSteps) * 100));

    if (countSpan) {
      countSpan.textContent = numDone === totalSteps
        ? `All ${totalSteps} Steps Complete (100%)`
        : `Step ${Math.min(currentActiveStep + 1, totalSteps)} of ${totalSteps} (${pct}%)`;
    }
    if (fillBar) {
      fillBar.style.width = `${Math.max(10, pct)}%`;
    }

    if (numDone === totalSteps) {
      const compCard = rootElement.querySelector("#we-completion-card");
      if (compCard) {
        compCard.style.display = "block";
        compCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      SoundFX.playChime();
    }
  }

  function advanceToStep(nextIdx) {
    if (nextIdx >= totalSteps) {
      updateProgress();
      return;
    }
    currentActiveStep = nextIdx;
    const card = rootElement.querySelector(`#we-step-${nextIdx}`);
    const body = rootElement.querySelector(`#we-body-${nextIdx}`);
    const badge = rootElement.querySelector(`#we-badge-${nextIdx}`);
    const status = rootElement.querySelector(`#we-status-${nextIdx}`);

    if (card) {
      card.classList.remove("locked");
      card.classList.add("active");
      card.style.background = "rgba(15,23,42,0.6)";
      card.style.border = "1px solid rgba(56,189,248,0.4)";
    }
    if (body) body.style.display = "block";
    if (badge) {
      badge.style.background = "#0284c7";
      badge.style.color = "#fff";
    }
    if (status) {
      status.textContent = "In Progress";
      status.style.color = "#38bdf8";
    }
    updateProgress();
    const input = rootElement.querySelector(`#we-input-${nextIdx}`);
    if (input) input.focus();
  }

  function markStepComplete(stepIdx, isExact = true) {
    completedStepIndices.add(stepIdx);
    const card = rootElement.querySelector(`#we-step-${stepIdx}`);
    const badge = rootElement.querySelector(`#we-badge-${stepIdx}`);
    const status = rootElement.querySelector(`#we-status-${stepIdx}`);
    const solution = rootElement.querySelector(`#we-solution-${stepIdx}`);
    const input = rootElement.querySelector(`#we-input-${stepIdx}`);
    const checkBtn = rootElement.querySelector(`.we-btn-check[data-step-idx="${stepIdx}"]`);

    if (card) {
      card.style.border = "1px solid rgba(16,185,129,0.3)";
      card.style.background = "rgba(16,185,129,0.05)";
    }
    if (badge) {
      badge.style.background = "#10b981";
      badge.textContent = "✓";
    }
    if (status) {
      status.textContent = "Solved";
      status.style.color = "#10b981";
    }
    if (solution) solution.style.display = "block";
    if (input) {
      input.disabled = true;
      input.style.borderColor = "rgba(16,185,129,0.4)";
    }
    if (checkBtn) checkBtn.disabled = true;

    // Advance to next step
    if (stepIdx + 1 < totalSteps) {
      advanceToStep(stepIdx + 1);
    } else {
      updateProgress();
    }
  }

  // Check buttons
  rootElement.querySelectorAll(".we-btn-check").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.stepIdx, 10);
      const input = rootElement.querySelector(`#we-input-${idx}`);
      const feedback = rootElement.querySelector(`#we-feedback-${idx}`);
      if (!input || !feedback) return;

      const userVal = input.value;
      const stepDef = steps[idx];
      const result = validateStepAnswer(userVal, stepDef.expected, stepDef.tolerance);

      feedback.style.display = "block";
      if (result.valid) {
        feedback.style.background = "rgba(16,185,129,0.12)";
        feedback.style.border = "1px solid rgba(16,185,129,0.3)";
        feedback.style.color = "#10b981";
        feedback.innerHTML = `<strong>✅ Correct!</strong> Verified result: <span style="font-family:var(--font-mono); font-weight:700;">${stepDef.expected} ${stepDef.unit}</span>`;
        SoundFX.playSuccess();
        markStepComplete(idx, true);
      } else {
        feedback.style.background = "rgba(239,68,68,0.12)";
        feedback.style.border = "1px solid rgba(239,68,68,0.3)";
        feedback.style.color = "#f87171";
        feedback.innerHTML = `<strong>⚠️ Not quite:</strong> ${result.isClose ? "Close! Check rounding or significant figures." : "Review the calculation formula and try again."} (Click 'Hint' if needed).`;
        SoundFX.playIncorrect();
      }
    });
  });

  // Enter key in input checks answer
  rootElement.querySelectorAll(".we-step-input").forEach(inp => {
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const id = inp.id.replace("we-input-", "");
        const checkBtn = rootElement.querySelector(`.we-btn-check[data-step-idx="${id}"]`);
        if (checkBtn && !checkBtn.disabled) checkBtn.click();
      }
    });
  });

  // Hint buttons
  rootElement.querySelectorAll(".we-btn-hint").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.stepIdx;
      const hintBox = rootElement.querySelector(`#we-hint-${idx}`);
      if (hintBox) {
        hintBox.style.display = hintBox.style.display === "none" ? "block" : "none";
        SoundFX.playClick();
      }
    });
  });

  // Reveal Step buttons
  rootElement.querySelectorAll(".we-btn-reveal").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.stepIdx, 10);
      const input = rootElement.querySelector(`#we-input-${idx}`);
      const feedback = rootElement.querySelector(`#we-feedback-${idx}`);
      const stepDef = steps[idx];
      if (input) input.value = stepDef.expected;
      if (feedback) {
        feedback.style.display = "block";
        feedback.style.background = "rgba(56,189,248,0.1)";
        feedback.style.border = "1px solid rgba(56,189,248,0.3)";
        feedback.style.color = "#38bdf8";
        feedback.innerHTML = `<strong>ℹ️ Step Revealed:</strong> Standard value is <span style="font-family:var(--font-mono); font-weight:700;">${stepDef.expected} ${stepDef.unit}</span>`;
      }
      SoundFX.playClick();
      markStepComplete(idx, false);
    });
  });

  // Reset button
  const resetBtn = rootElement.querySelector("#we-btn-reset");
  const restartBtn = rootElement.querySelector("#we-btn-mastered-restart");
  const doReset = () => {
    completedStepIndices.clear();
    currentActiveStep = 0;
    steps.forEach((st, i) => {
      const card = rootElement.querySelector(`#we-step-${i}`);
      const body = rootElement.querySelector(`#we-body-${i}`);
      const badge = rootElement.querySelector(`#we-badge-${i}`);
      const status = rootElement.querySelector(`#we-status-${i}`);
      const feedback = rootElement.querySelector(`#we-feedback-${i}`);
      const hint = rootElement.querySelector(`#we-hint-${i}`);
      const solution = rootElement.querySelector(`#we-solution-${i}`);
      const input = rootElement.querySelector(`#we-input-${i}`);
      const checkBtn = rootElement.querySelector(`.we-btn-check[data-step-idx="${i}"]`);

      if (card) {
        card.className = `we-step-card ${i === 0 ? 'active' : 'locked'}`;
        card.style.background = i === 0 ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.2)';
        card.style.border = `1px solid ${i === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`;
      }
      if (body) body.style.display = i === 0 ? 'block' : 'none';
      if (badge) {
        badge.textContent = `${i + 1}`;
        badge.style.background = i === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)';
        badge.style.color = '#fff';
      }
      if (status) {
        status.textContent = i === 0 ? 'In Progress' : 'Locked';
        status.style.color = i === 0 ? '#38bdf8' : 'var(--text-dim)';
      }
      if (feedback) feedback.style.display = 'none';
      if (hint) hint.style.display = 'none';
      if (solution) solution.style.display = 'none';
      if (input) {
        input.value = '';
        input.disabled = false;
        input.style.borderColor = 'rgba(255,255,255,0.2)';
      }
      if (checkBtn) checkBtn.disabled = false;
    });

    const compCard = rootElement.querySelector("#we-completion-card");
    if (compCard) compCard.style.display = "none";
    updateProgress();
    SoundFX.playClick();
  };

  if (resetBtn) resetBtn.addEventListener("click", doReset);
  if (restartBtn) restartBtn.addEventListener("click", doReset);

  // Reveal All button
  const revealAllBtn = rootElement.querySelector("#we-btn-reveal-all");
  if (revealAllBtn) {
    revealAllBtn.addEventListener("click", () => {
      steps.forEach((st, i) => {
        const input = rootElement.querySelector(`#we-input-${i}`);
        if (input) input.value = st.expected;
        markStepComplete(i, false);
      });
      SoundFX.playClick();
    });
  }

  // Render any KaTeX math elements within the container
  try {
    renderMathInElement(rootElement);
  } catch (e) {}
}

/**
 * High-level helper to mount the Worked Example Solver into any DOM container.
 */
export function mountWorkedExampleSolver(containerId, workedExample, options = {}) {
  const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
  if (!container || !workedExample) return;

  const isVerified = options.isVerified !== undefined ? options.isVerified : true;
  const initialMode = options.initialMode || "reference";

  container.innerHTML = renderWorkedExampleHTML(workedExample, isVerified, initialMode);
  const rootElement = container.querySelector("#worked-example-root");
  if (rootElement) {
    initWorkedExampleListeners(rootElement, workedExample);
  }
}
