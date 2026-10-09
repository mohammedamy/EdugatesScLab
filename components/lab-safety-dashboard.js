// Edugates International School - Laboratory Safety & Biosafety Standards Dashboard
// Compliant with OSHA Laboratory Standard (29 CFR 1910.1450), ANSI Z87.1, and GHS Classification

import { renderMathInElement, formatMathText } from "../utils/math-renderer.js";

/**
 * Standard High-Fidelity SVG Safety Icons
 */
export const SAFETY_ICONS = {
  gogglesRequired: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Goggles Required Icon">
    <circle cx="32" cy="32" r="30" fill="#0284c7" fill-opacity="0.15" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Goggles Frame -->
    <path d="M12 28 C12 20, 28 20, 30 28 C31 32, 33 32, 34 28 C36 20, 52 20, 52 28 C52 40, 38 42, 33 36 C32 35, 32 35, 31 36 C26 42, 12 40, 12 28 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Left Lens Highlight -->
    <ellipse cx="22" cy="30" rx="7" ry="6" fill="#38bdf8" fill-opacity="0.35"/>
    <path d="M17 27 Q 21 24, 25 25" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Right Lens Highlight -->
    <ellipse cx="42" cy="30" rx="7" ry="6" fill="#38bdf8" fill-opacity="0.35"/>
    <path d="M37 27 Q 41 24, 45 25" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Elastic Strap -->
    <path d="M12 30 Q 6 32, 4 32" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 30 Q 58 32, 60 32" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  chemicalHazard: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chemical Hazard Corrosive Icon">
    <!-- GHS Hazard Diamond -->
    <rect x="32" y="4" width="40" height="40" rx="4" transform="rotate(45 32 4)" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="2.5"/>
    <!-- Test Tube pouring on surface -->
    <path d="M18 20 L28 10 C29 9, 31 9, 32 10 L34 12 C35 13, 35 15, 34 16 L24 26" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
    <path d="M21 23 L29 15" stroke="#f87171" stroke-width="1.5"/>
    <!-- Falling drops -->
    <circle cx="28" cy="32" r="1.5" fill="#f87171"/>
    <circle cx="29" cy="38" r="2" fill="#ef4444"/>
    <!-- Corroding Surface Block -->
    <rect x="18" y="44" width="16" height="5" rx="1" fill="#64748b"/>
    <path d="M24 44 Q 26 47, 28 44" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
    <!-- Human Hand Receiving Drop -->
    <path d="M46 36 C44 34, 40 35, 38 38 L36 41 C35 43, 36 45, 38 45 L46 45 C48 45, 50 43, 50 41 Z" fill="#334155" stroke="#f87171" stroke-width="1.5"/>
    <!-- Corroded cavity on hand -->
    <circle cx="41" cy="40" r="2" fill="#0f172a" stroke="#ef4444" stroke-width="1.2"/>
  </svg>`,

  emergencyExit: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Emergency Exit & Evacuation Icon">
    <circle cx="32" cy="32" r="30" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="2.5"/>
    <!-- Door Frame -->
    <rect x="36" y="14" width="16" height="36" rx="2" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
    <!-- Running Person Silhouette -->
    <!-- Head -->
    <circle cx="26" cy="22" r="4" fill="#34d399"/>
    <!-- Torso -->
    <path d="M26 27 L22 36 L28 37 L30 46" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Right Arm reaching toward door -->
    <path d="M26 28 L32 29 L38 24" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Left Arm -->
    <path d="M24 29 L18 33" stroke="#34d399" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Trailing Leg -->
    <path d="M22 36 L15 42" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Exit Direction Arrow -->
    <path d="M12 18 L18 18 M16 15 L19 18 L16 21" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  eyewashStation: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Emergency Eyewash Station Icon">
    <circle cx="32" cy="32" r="30" fill="#06b6d4" fill-opacity="0.15" stroke="#06b6d4" stroke-width="2.5"/>
    <!-- Eye outline -->
    <path d="M16 32 C22 23, 42 23, 48 32 C42 41, 22 41, 16 32 Z" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
    <circle cx="32" cy="32" r="5" fill="#22d3ee"/>
    <!-- Dual Eyewash Nozzles spraying water upward -->
    <path d="M24 50 L24 42" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M40 50 L40 42" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Water Streams -->
    <path d="M24 41 Q 22 35, 28 32" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 2"/>
    <path d="M40 41 Q 42 35, 36 32" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 2"/>
  </svg>`,

  fireSafety: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fire Extinguisher & Thermal Hazard Icon">
    <circle cx="32" cy="32" r="30" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="2.5"/>
    <!-- Flame Silhouette -->
    <path d="M32 14 C33 20, 42 24, 40 34 C39 42, 33 48, 26 48 C20 48, 16 43, 18 36 C19 32, 23 29, 24 25 C25 21, 28 17, 32 14 Z" fill="#ef4444" fill-opacity="0.8"/>
    <path d="M30 26 C31 30, 36 33, 35 38 C34 43, 30 45, 27 45 C23 45, 21 42, 22 38 C23 35, 26 33, 27 30 C28 28, 29 27, 30 26 Z" fill="#fbbf24"/>
  </svg>`,

  wasteDisposal: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chemical Waste Disposal Icon">
    <circle cx="32" cy="32" r="30" fill="#a855f7" fill-opacity="0.15" stroke="#a855f7" stroke-width="2.5"/>
    <path d="M22 24 L24 46 C24 48, 26 50, 28 50 L36 50 C38 50, 40 48, 40 46 L42 24" fill="#0f172a" stroke="#c084fc" stroke-width="2"/>
    <line x1="18" y1="20" x2="46" y2="20" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M28 20 V16 C28 15, 29 14, 30 14 H34 C35 14, 36 15, 36 16 V20" stroke="#c084fc" stroke-width="2"/>
    <!-- Recycle Arrows in bin -->
    <path d="M30 30 L34 34 L30 38" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

/**
 * Common High-School Chemical SDS Quick Reference Database
 */
export const SDS_REAGENTS = [
  {
    name: "Hydrochloric Acid (1.0 M & Conc.)",
    formula: "HCl",
    hazards: ["Corrosive to metals & tissue", "Skin/Eye Burns", "Respiratory Irritant"],
    ghs: ["Corrosive", "Toxic"],
    color: "#ef4444",
    ppe: "Safety Goggles (ANSI Z87.1), Nitrile Gloves, Lab Coat, Fume Hood if conc.",
    firstAid: "Flush eyes or skin under running water for at least 15 minutes. Remove contaminated clothing immediately. Seek medical attention."
  },
  {
    name: "Sodium Hydroxide (1.0 M & Pellets)",
    formula: "NaOH",
    hazards: ["Severe Skin Burns", "Permanent Eye Damage", "Exothermic Dissolution"],
    ghs: ["Corrosive"],
    color: "#ef4444",
    ppe: "Splash-proof Goggles, Heavy Nitrile Gloves, Lab Coat.",
    firstAid: "Irrigate eyes continuously with eyewash stream for 15+ minutes. Do not neutralize on skin with strong acids."
  },
  {
    name: "Sulfuric Acid (Concentrated)",
    formula: "H2SO4",
    hazards: ["Extreme Exothermic Hydration", "Severe Chemical & Thermal Burns", "Corrosive"],
    ghs: ["Corrosive", "Severe Burn"],
    color: "#dc2626",
    ppe: "Goggles + Face Shield, Chemical-resistant Apron, Heavy Nitrile/Neoprene Gloves.",
    firstAid: "ALWAYS ADD ACID TO WATER (AAA). Never pour water into concentrated acid. Flush skin with copious cool water."
  },
  {
    name: "Ethanol (95% Lab Grade)",
    formula: "C2H5OH",
    hazards: ["Highly Flammable Liquid & Vapor", "Eye Irritant"],
    ghs: ["Flammable", "Irritant"],
    color: "#f59e0b",
    ppe: "Safety Goggles, Lab Coat. Keep strictly away from Bunsen burner open flames.",
    firstAid: "In case of fire, use ABC dry chemical or carbon dioxide extinguisher. If in eyes, flush with clean water for 15 min."
  },
  {
    name: "Potassium Permanganate",
    formula: "KMnO4",
    hazards: ["Strong Oxidizer", "Persistent Skin Staining", "Aquatic Toxicity"],
    ghs: ["Oxidizer", "Environmental"],
    color: "#a855f7",
    ppe: "Safety Goggles, Nitrile Gloves (prevents brown MnO2 skin staining).",
    firstAid: "Wash skin with mild soap and water. Never mix solid KMnO4 with organic solvents or concentrated acids."
  },
  {
    name: "Copper(II) Sulfate Pentahydrate",
    formula: "CuSO4 · 5H2O",
    hazards: ["Harmful if Swallowed", "Severe Eye Damage", "Toxic to Aquatic Life"],
    ghs: ["Toxic", "Corrosive"],
    color: "#0284c7",
    ppe: "Goggles, Nitrile Gloves. Dispose in designated heavy-metal inorganic waste container.",
    firstAid: "Rinse eyes thoroughly. Do not pour down regular sink drains; collect in designated waste carboy."
  }
];

/**
 * Renders the Complete Lab Safety Dashboard View
 */
export function renderLabSafetyDashboard(container) {
  if (!container) return;

  container.innerHTML = `
    <section class="safety-dashboard-container" aria-labelledby="safety-heading" style="display: flex; flex-direction: column; gap: 32px; max-width: 1320px; margin: 0 auto; padding: 12px 16px 48px;">
      
      <!-- Prominent Hero Banner -->
      <div class="hero-banner" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 12px;">
          <div class="hero-badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-weight: 800; font-size: 0.8rem; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
            Edugates International School • STEM Laboratory Standards
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Compliance:</span>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-weight: 700; font-size: 0.76rem; padding: 3px 10px; border-radius: 6px;">OSHA 1910.1450</span>
            <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); color: #22d3ee; font-weight: 700; font-size: 0.76rem; padding: 3px 10px; border-radius: 6px;">ANSI Z87.1</span>
            <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-weight: 700; font-size: 0.76rem; padding: 3px 10px; border-radius: 6px;">GHS Standard</span>
          </div>
        </div>

        <h1 id="safety-heading" class="hero-title" style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin: 0 0 10px; letter-spacing: -0.02em;">
          Laboratory Safety &amp; Chemical Hygiene Dashboard
        </h1>
        <p class="hero-desc" style="font-size: 1.05rem; color: #cbd5e1; max-width: 860px; line-height: 1.6; margin: 0 0 24px;">
          Safety is the foundational prerequisite of scientific discovery. Before conducting any physical or virtual investigation, review mandatory PPE requirements, emergency action protocols, and reagent hazard classifications.
        </p>

        <!-- 3 Primary Required Icons Spotlight -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 20px;">
          
          <!-- Card 1: Goggles Required -->
          <div class="safety-icon-card" style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
            <div style="width: 58px; height: 58px; flex-shrink: 0;">
              ${SAFETY_ICONS.gogglesRequired}
            </div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; margin-bottom: 4px;">
                1. Goggles Required
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin: 0;">
                ANSI Z87.1 approved splash-proof chemical goggles must be worn covering eyes at all times when heating, pouring chemicals, or handling projectiles.
              </p>
            </div>
          </div>

          <!-- Card 2: Chemical Hazard -->
          <div class="safety-icon-card" style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
            <div style="width: 58px; height: 58px; flex-shrink: 0;">
              ${SAFETY_ICONS.chemicalHazard}
            </div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #f87171; margin-bottom: 4px;">
                2. Chemical Hazard
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin: 0;">
                Review GHS hazard diamonds and SDS warnings. Always wear nitrile gloves, waft odors cautiously, and follow the <em>AAA rule</em> (Always Add Acid to water).
              </p>
            </div>
          </div>

          <!-- Card 3: Emergency Exit -->
          <div class="safety-icon-card" style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
            <div style="width: 58px; height: 58px; flex-shrink: 0;">
              ${SAFETY_ICONS.emergencyExit}
            </div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #34d399; margin-bottom: 4px;">
                3. Emergency Exit
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin: 0;">
                Keep aisles unobstructed. Note the primary and secondary room exits, eyewash station (15-min flush), fire blanket, and ABC extinguisher.
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Core Protocols & Emergency Action Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        
        <!-- Pillar 1: General PPE & Conduct -->
        <article class="safety-pillar-card" style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 12px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 38px; height: 38px; flex-shrink: 0;">
              ${SAFETY_ICONS.eyewashStation}
            </div>
            <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main, #f8fafc); margin: 0;">
              PPE &amp; Laboratory Conduct
            </h2>
          </div>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-muted, #94a3b8); line-height: 1.65; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Eye Protection:</strong> Splash goggles must be sealed over the eyes during the entire experimental duration until all glassware is cleaned.</li>
            <li><strong>Protective Apparel:</strong> Closed-toe leather or synthetic shoes required; no sandals or cloth mesh. Tie back long hair behind the collar.</li>
            <li><strong>Eating &amp; Drinking:</strong> Strictly prohibited in any laboratory zone. Never ingest chemicals or touch food with lab hands.</li>
            <li><strong>Glassware Inspection:</strong> Inspect beakers, test tubes, and burettes for star cracks or chips prior to heating. Discard chipped glass in broken glass receptacle.</li>
          </ul>
        </article>

        <!-- Pillar 2: Thermal, Fire & Electrical -->
        <article class="safety-pillar-card" style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 12px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 38px; height: 38px; flex-shrink: 0;">
              ${SAFETY_ICONS.fireSafety}
            </div>
            <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main, #f8fafc); margin: 0;">
              Thermal, Fire &amp; Electrical Safety
            </h2>
          </div>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-muted, #94a3b8); line-height: 1.65; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Bunsen Burner Etiquette:</strong> Light match before turning on gas. Adjust air collar to obtain a quiet, non-luminous blue flame with inner cone.</li>
            <li><strong>Hot Glassware Handling:</strong> Hot glass looks identical to cold glass. Always use beaker tongs or heat-resistant silicone grips.</li>
            <li><strong>Fire Response (PASS Protocol):</strong> Pull the safety pin, Aim at the base of the fire, Squeeze the handle lever, Sweep side-to-side.</li>
            <li><strong>Circuit Wiring:</strong> In DC circuit labs, double-check polarities and disconnect power source before modifying wire breadboard connections.</li>
          </ul>
        </article>

        <!-- Pillar 3: Chemical Hygiene & Waste -->
        <article class="safety-pillar-card" style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 12px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 38px; height: 38px; flex-shrink: 0;">
              ${SAFETY_ICONS.wasteDisposal}
            </div>
            <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main, #f8fafc); margin: 0;">
              Chemical Hygiene &amp; Safe Disposal
            </h2>
          </div>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-muted, #94a3b8); line-height: 1.65; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Dilution Rule (AAA):</strong> <em>Always Add Acid to Water</em>. The high heat capacity of water absorbs reaction enthalpy safely.</li>
            <li><strong>Volatile Vapors:</strong> Perform reactions liberating $\\text{NO}_2$, $\\text{Cl}_2$, or organic esters exclusively in the certified chemical fume hood.</li>
            <li><strong>Waste Carboys:</strong> Never dump heavy metal ions ($\\text{Cu}^{2+}$, $\\text{Ag}^+$, $\\text{Pb}^{2+}$) or organic solvents into standard municipal sinks.</li>
            <li><strong>Spill Neutralization:</strong> Neutralize acid spills with sodium bicarbonate ($\\text{NaHCO}_3$) until effervescence ceases before wiping.</li>
          </ul>
        </article>

      </div>

      <!-- Chemical SDS & Reagent Quick-Reference Database -->
      <section style="background: var(--bg-card, #0f172a); border: 1px solid var(--border-color, #334155); border-radius: 16px; padding: 28px; box-shadow: 0 6px 20px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main, #f8fafc); margin: 0 0 6px;">
              Reagent Safety Data Sheets (SDS) &amp; Hazard Matrix
            </h2>
            <p style="font-size: 0.88rem; color: var(--text-muted, #94a3b8); margin: 0;">
              Standard reference guide for common analytical, biological, and physical chemistry reagents utilized in our curriculum.
            </p>
          </div>
          <!-- Filter Search Box -->
          <div style="position: relative; min-width: 260px;">
            <input type="text" id="sds-search-input" placeholder="🔍 Search chemical or formula..." aria-label="Search chemical or formula in safety database"
                   style="width: 100%; padding: 10px 14px 10px 36px; border-radius: 8px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color, #475569); color: var(--text-main, #ffffff); font-size: 0.88rem; outline: none;">
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #94a3b8; font-size: 0.85rem;">⚗️</span>
          </div>
        </div>

        <div id="sds-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
          ${renderSdsCards(SDS_REAGENTS)}
        </div>
      </section>

      <!-- Pre-Lab Safety Agreement & Self-Check -->
      <section style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
        <div style="max-width: 800px;">
          <div style="font-weight: 800; font-size: 1.15rem; color: #34d399; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span> Edugates Student Science Safety Pledge
          </div>
          <p style="font-size: 0.88rem; color: #cbd5e1; margin: 0; line-height: 1.55;">
            "I pledge to wear required eye protection, follow all chemical hygiene guidelines, report any accidental spills or damaged equipment immediately to the instructor, and conduct every physical and virtual experiment with rigor and caution."
          </p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-acknowledge-safety" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #ffffff; font-weight: 800; font-size: 0.9rem; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
          <span>✓</span>
          <span>Acknowledge &amp; Proceed to Labs</span>
        </button>
      </section>

    </section>
  `;

  // Bind SDS search filter
  const sdsSearchInput = container.querySelector("#sds-search-input");
  if (sdsSearchInput) {
    sdsSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = SDS_REAGENTS.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.formula.toLowerCase().includes(q) ||
        r.hazards.some(h => h.toLowerCase().includes(q))
      );
      const grid = container.querySelector("#sds-cards-grid");
      if (grid) {
        grid.innerHTML = filtered.length > 0 
          ? renderSdsCards(filtered)
          : `<div style="grid-column: 1 / -1; padding: 32px; text-align: center; color: #94a3b8;">No matching reagent SDS entries found for "${e.target.value}".</div>`;
        renderMathInElement(grid);
      }
    });
  }

  // Bind Acknowledge Button
  const btnAck = container.querySelector("#btn-acknowledge-safety");
  if (btnAck) {
    btnAck.addEventListener("click", () => {
      try {
        localStorage.setItem("edugates_safety_acknowledged", "true");
      } catch (err) {}
      window.location.hash = "#labs";
    });
  }

  // Format any chemical formulas in the safety view
  renderMathInElement(container);
}

function renderSdsCards(reagents) {
  return reagents.map(r => `
    <div class="sds-card" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color, #334155); border-left: 4px solid ${r.color}; border-radius: 10px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main, #f8fafc);">${r.name}</div>
          <div style="font-family: var(--font-mono, monospace); font-size: 0.85rem; color: #38bdf8; font-weight: 700;">
            $${r.formula}$
          </div>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
          ${r.ghs.map(g => `
            <span style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;">
              ${g}
            </span>
          `).join("")}
        </div>
      </div>

      <div style="font-size: 0.82rem; color: var(--text-muted, #94a3b8);">
        <strong style="color: #cbd5e1;">Hazards:</strong> ${r.hazards.join(" • ")}
      </div>

      <div style="font-size: 0.8rem; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px; color: var(--text-muted, #94a3b8); line-height: 1.45;">
        <div style="color: #38bdf8; font-weight: 700; margin-bottom: 2px;">Required PPE:</div>
        <div>${r.ppe}</div>
      </div>

      <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">
        <strong style="color: #10b981;">First Aid:</strong> ${r.firstAid}
      </div>
    </div>
  `).join("");
}
