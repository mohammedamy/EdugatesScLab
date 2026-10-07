// Edugates-ClipSAT Science Labs - Teacher Implementation Guide & Staff Presentation Modal Component
// Provides interactive classroom cheat sheets, 5E pedagogical flows, and direct downloads for the Teacher Guide PDF and Staff Presentation PPTX.

import { SoundFX } from "../utils/audio-synth.js";

export function openTeacherGuideModal() {
  const existing = document.getElementById("teacher-guide-modal");
  if (existing) existing.remove();

  try { SoundFX.playPop(); } catch (e) {}

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "teacher-guide-modal";
  modalOverlay.className = "modal-overlay teacher-guide-modal-overlay active";
  modalOverlay.setAttribute("role", "dialog");
  modalOverlay.setAttribute("aria-modal", "true");
  modalOverlay.setAttribute("aria-label", "Teacher Implementation Guide & Staff Presentation");

  modalOverlay.innerHTML = `
    <div class="modal-card teacher-guide-card" style="max-width: 860px; width: 94vw; max-height: 90vh; display: flex; flex-direction: column; background: var(--bg-surface); border: 1.5px solid var(--border-color); border-radius: 18px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6); overflow: hidden; animation: tgModalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      
      <!-- Modal Header -->
      <div class="tg-modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
            📚
          </div>
          <div>
            <h2 style="margin: 0; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--text-main);">
              Teacher Implementation Guide &amp; Staff Resources
            </h2>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-dim);">
              Edugates-ClipSAT Science Labs • High School STEM Department • 2026-2027
            </p>
          </div>
        </div>
        <button id="tg-modal-close" class="btn-close-modal" aria-label="Close dialog" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.05); color: var(--text-muted); cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
          ✕
        </button>
      </div>

      <!-- Prominent Downloads Action Banner -->
      <div class="tg-downloads-banner" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.12)); border-bottom: 1px solid var(--border-color); padding: 18px 24px; flex-shrink: 0;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
              <span>📁 Staff Demonstration Documents</span>
              <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: var(--chem-primary); font-weight: 700;">Ready for Download</span>
            </div>
            <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-muted);">
              Official Teacher's Guide Manual (PDF) &amp; High School Faculty Demonstration Presentation (PPTX).
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Download PDF Button -->
            <a href="./Edugates_STEM_Labs_Teacher_Guide.pdf" download="Edugates_STEM_Labs_Teacher_Guide.pdf" target="_blank" class="btn-tg-download btn-tg-pdf" id="btn-dl-teacher-guide-pdf" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; background: #0284c7; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4); transition: all 0.2s ease;">
              <span style="font-size: 1.1rem;">📄</span>
              <span style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
                <span>Teacher Guide (PDF)</span>
                <span style="font-size: 0.68rem; opacity: 0.85; font-weight: normal;">Printable A4 Manual</span>
              </span>
            </a>

            <!-- Download PPTX Button -->
            <a href="./Edugates_STEM_Labs_Staff_Presentation.pptx" download="Edugates_STEM_Labs_Staff_Presentation.pptx" class="btn-tg-download btn-tg-pptx" id="btn-dl-staff-pptx" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: all 0.2s ease;">
              <span style="font-size: 1.1rem;">📊</span>
              <span style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
                <span>Staff Slides (PPTX)</span>
                <span style="font-size: 0.68rem; opacity: 0.85; font-weight: normal;">16:9 Widescreen Deck</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Segmented Navigation Tabs -->
      <div class="tg-modal-nav" style="display: flex; gap: 8px; padding: 12px 24px 0; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); flex-shrink: 0; overflow-x: auto;">
        <button class="tg-tab-btn active" data-tab="tg-tab-overview" style="padding: 8px 16px; border: none; background: transparent; color: var(--chem-primary); font-weight: 700; font-size: 0.86rem; border-bottom: 2px solid var(--chem-primary); cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>🎯 Platform Overview</span>
        </button>
        <button class="tg-tab-btn" data-tab="tg-tab-lesson-flow" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-weight: 600; font-size: 0.86rem; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>⏱️ 45-Min Lesson Flow</span>
        </button>
        <button class="tg-tab-btn" data-tab="tg-tab-smartboard" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-weight: 600; font-size: 0.86rem; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>⚡ Smartboard &amp; MAXHUB</span>
        </button>
        <button class="tg-tab-btn" data-tab="tg-tab-shortcuts" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-weight: 600; font-size: 0.86rem; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>⌨️ Keyboard Shortcuts</span>
        </button>
      </div>

      <!-- Scrollable Tab Content Area -->
      <div class="tg-modal-body" style="padding: 20px 24px; overflow-y: auto; flex: 1;">
        
        <!-- Tab 1: Platform Overview -->
        <div class="tg-tab-pane active" id="tg-tab-overview">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 20px;">
            <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px; padding: 14px;">
              <div style="font-size: 1.4rem; margin-bottom: 6px;">⚛️</div>
              <div style="font-weight: 700; color: var(--chem-primary); font-size: 0.95rem;">Inspire Chemistry</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                23 Modules • 95 Lessons. Atomic theory, stoichiometry, thermodynamics, gas laws, equilibrium, acid-base titration, and organic chemistry.
              </div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 14px;">
              <div style="font-size: 1.4rem; margin-bottom: 6px;">🧬</div>
              <div style="font-weight: 700; color: var(--bio-primary); font-size: 0.95rem;">Inspire Biology</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                27 Modules • 108 Lessons. Cellular biology, respiration, photosynthesis, genetics, evolution, microbiology, and 3D human anatomy atlas.
              </div>
            </div>
            <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 14px;">
              <div style="font-size: 1.4rem; margin-bottom: 6px;">🪐</div>
              <div style="font-weight: 700; color: var(--phys-primary); font-size: 0.95rem;">Inspire Physics</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                24 Modules • 96 Lessons. Newtonian mechanics, fluids, projectile motion, wave interference, ray optics, electrostatics, and circuits.
              </div>
            </div>
          </div>

          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 10px;">Flagship Virtual Laboratory Engines</h3>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 12px;">
            Every virtual lab bench in Edugates-ClipSAT is powered by continuous mathematical physics calculators rather than pre-rendered video clips. Key demonstration benches include:
          </p>
          <ul style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin: 0 0 16px; padding-left: 20px;">
            <li><b>Acid-Base Titration:</b> Dynamic volumetric burette with live phenolphthalein/bromothymol indicator transition and first-derivative dpH/dV equivalence point peak detection.</li>
            <li><b>Research Optical Microscope:</b> Revolving 4x to 100x turret nosepiece with optical numerical aperture (NA 0.10 to 1.25) depth-of-field blur and Köhler illumination.</li>
            <li><b>Wave Ripple Tank Simulator:</b> 2D surface wave propagation with absorbing PML sponge boundaries, Doppler frequency shifts, and Young's double-slit interference fringes.</li>
            <li><b>Human Anatomy 3D Atlas:</b> Layer-by-layer peeling across Skeletal, Muscular, Circulatory, Nervous, Visceral, and Skin systems with 8K coronal organ cross-sections.</li>
          </ul>
        </div>

        <!-- Tab 2: 45-Minute Lesson Flow -->
        <div class="tg-tab-pane" id="tg-tab-lesson-flow" style="display: none;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 10px;">Recommended 45-Minute Science Class Flow</h3>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 16px;">
            This instructional pacing sequence leverages the 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate) to maximize active student inquiry:
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; gap: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px;">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--chem-primary); min-width: 90px;">0 - 7 Min</div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">Bellringer &amp; Flashcard Vocab Hook (Engage)</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  Open <b>Interactive Flashcards</b> from the Subjects dropdown. Review 5 core domain terms. Pose the essential investigative lab question.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px;">
              <div style="font-weight: 800; font-size: 1.1rem; color: #0284c7; min-width: 90px;">7 - 17 Min</div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">Teacher Demonstration on MAXHUB (Explore &amp; Explain)</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  Launch the module simulation on the smartboard. Press <b>Shift+F</b> for Focus Mode. Formulate class hypothesis and model the initial trial.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px;">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--bio-primary); min-width: 90px;">17 - 35 Min</div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">Student 1:1 Hands-On Lab Work (Elaborate)</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  Students manipulate independent variables on iPads or Chromebooks, record multi-trial runs into the LabTrialStore, and auto-plot comparison charts.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px;">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--accent-amber); min-width: 90px;">35 - 45 Min</div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">Formative Quiz Check &amp; Exit Ticket (Evaluate)</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  Administer a 5-question module quiz. Review the animated KaTeX step-by-step solver. Print or assign homework from the 2-Page Lesson Plan.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Smartboard & MAXHUB -->
        <div class="tg-tab-pane" id="tg-tab-smartboard" style="display: none;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 10px;">Classroom Display &amp; Hardware Optimization</h3>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 14px;">
            The application includes hardware profiles specifically built for interactive flat panels and classroom projectors:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
              <div style="font-weight: 700; color: var(--chem-primary); font-size: 0.92rem; margin-bottom: 4px;">⚡ MAXHUB Turbo Profile</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
                Deactivates CSS backdrop-filter blurs that slow down integrated smartboard GPUs. Forces opaque surface caching and locked 60 FPS canvas redraws.
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
              <div style="font-weight: 700; color: var(--bio-primary); font-size: 0.92rem; margin-bottom: 4px;">☀️ Day Mode for Bright Projectors</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
                Engineered with high contrast WCAG AAA standards for ambient classroom lighting. Switch effortlessly using the Day/Night header toggle.
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
              <div style="font-weight: 700; color: #a855f7; font-size: 0.92rem; margin-bottom: 4px;">🎯 Focus Presentation Mode</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
                Press <b>Shift+F</b> to hide all navigation chrome, tab bars, and controls, dedicating 100% of the display to the lab simulation.
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
              <div style="font-weight: 700; color: var(--accent-amber); font-size: 0.92rem; margin-bottom: 4px;">⏱️ Floating Classroom Timer</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
                Press <b>Shift+T</b> to open the draggable classroom timer and stopwatch widget, paced to 30 FPS to prevent CPU throttling.
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: Keyboard Shortcuts -->
        <div class="tg-tab-pane" id="tg-tab-shortcuts" style="display: none;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 10px;">Keyboard Shortcuts &amp; Smartboard Gestures</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border-color); color: var(--text-main);">
                <th style="padding: 8px 10px;">Shortcut</th>
                <th style="padding: 8px 10px;">Action</th>
                <th style="padding: 8px 10px;">Classroom Use Case</th>
              </tr>
            </thead>
            <tbody style="color: var(--text-muted);">
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <td style="padding: 8px 10px;"><code style="background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--chem-primary);">Shift + F</code></td>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-main);">Focus Presentation Mode</td>
                <td style="padding: 8px 10px;">Hides navigation chrome for full-screen smartboard teaching.</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <td style="padding: 8px 10px;"><code style="background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--chem-primary);">Shift + T</code></td>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-main);">Classroom Timer / Stopwatch</td>
                <td style="padding: 8px 10px;">Floating timer for student lab rotations and timed tests.</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <td style="padding: 8px 10px;"><code style="background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--chem-primary);">Ctrl / Cmd + K</code></td>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-main);">Instant Search</td>
                <td style="padding: 8px 10px;">Search all 74 modules and 45 labs in real-time.</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <td style="padding: 8px 10px;"><code style="background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--chem-primary);">O</code></td>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-main);">Offline Diagnostics</td>
                <td style="padding: 8px 10px;">Verify service worker and audit 100% offline cache status.</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px;"><code style="background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--chem-primary);">Esc</code></td>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-main);">Close Active Dialog</td>
                <td style="padding: 8px 10px;">Dismiss open dialogs or exit fullscreen views immediately.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="tg-modal-footer" style="padding: 12px 24px; border-top: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="font-size: 0.78rem; color: var(--text-dim);">
          Edugates-ClipSAT Science Labs • Developed by Mohammed Amy
        </div>
        <button id="tg-btn-dismiss" class="btn btn-secondary" style="padding: 6px 16px; border-radius: 8px; font-size: 0.84rem; font-weight: 600;">
          Close Guide
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Tab switching logic
  const tabBtns = modalOverlay.querySelectorAll(".tg-tab-btn");
  const tabPanes = modalOverlay.querySelectorAll(".tg-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      try { SoundFX.playClick(); } catch (e) {}
      const targetId = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.style.color = "var(--text-muted)";
        b.style.borderBottomColor = "transparent";
      });
      tabPanes.forEach(p => p.style.display = "none");

      btn.classList.add("active");
      btn.style.color = "var(--chem-primary)";
      btn.style.borderBottomColor = "var(--chem-primary)";

      const activePane = modalOverlay.querySelector(`#${targetId}`);
      if (activePane) activePane.style.display = "block";
    });
  });

  // Close handlers
  const closeModal = () => {
    try { SoundFX.playPop(); } catch (e) {}
    modalOverlay.remove();
  };

  modalOverlay.querySelector("#tg-modal-close")?.addEventListener("click", closeModal);
  modalOverlay.querySelector("#tg-btn-dismiss")?.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", onKeyDown);
    }
  };
  document.addEventListener("keydown", onKeyDown);
}

// Expose globally for smartboard toolbar and header button
if (typeof window !== "undefined") {
  window.openTeacherGuideModal = openTeacherGuideModal;
}
