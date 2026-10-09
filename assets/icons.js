// Edugates-ClipSAT Science Labs - Vector SVG Icon Library
// High precision, responsive, scalable to 4K Smartboards without pixelation

export const icons = {
  logo: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke="url(#logo-grad)" stroke-width="2.5" stroke-dasharray="4 2"/>
    <ellipse cx="24" cy="24" rx="20" ry="7.5" stroke="#06b6d4" stroke-width="2" transform="rotate(30 24 24)" opacity="0.85"/>
    <ellipse cx="24" cy="24" rx="20" ry="7.5" stroke="#10b981" stroke-width="2" transform="rotate(-30 24 24)" opacity="0.85"/>
    <ellipse cx="24" cy="24" rx="20" ry="7.5" stroke="#6366f1" stroke-width="2" transform="rotate(90 24 24)" opacity="0.85"/>
    <circle cx="24" cy="24" r="5" fill="url(#core-grad)"/>
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#06b6d4"/>
        <stop offset="0.5" stop-color="#10b981"/>
        <stop offset="1" stop-color="#6366f1"/>
      </linearGradient>
      <radialGradient id="core-grad" cx="24" cy="24" r="5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#38bdf8"/>
        <stop offset="1" stop-color="#4f46e5"/>
      </radialGradient>
    </defs>
  </svg>`,

  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>`,

  chemistry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 2v7.31L4.5 19.5A2 2 0 0 0 6.23 22h11.54a2 2 0 0 0 1.73-2.5L14 9.31V2"/>
    <line x1="8.5" y1="2" x2="15.5" y2="2"/>
    <path d="M14 9.3a6.5 6.5 0 0 0-4 0"/>
    <circle cx="9" cy="17" r="1" fill="currentColor"/>
    <circle cx="13" cy="15" r="1" fill="currentColor"/>
    <circle cx="14" cy="18" r="1.5" fill="currentColor"/>
  </svg>`,

  biology: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 15c6.667-6 13.333 0 20-6"/>
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
    <path d="m17 6-2.5-2.5"/>
    <path d="m14 8-1-1"/>
    <path d="m7 18 2.5 2.5"/>
    <path d="m3.5 14.5 2 2"/>
    <path d="m20 9.5-2-2"/>
    <path d="m10 16 1 1"/>
  </svg>`,

  physics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"/>
  </svg>`,

  microscope: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-mic-arm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="30%" stop-color="#0284c7"/>
        <stop offset="70%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="ico-mic-tube" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="ico-mic-knob" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <linearGradient id="ico-mic-beam" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
        <stop offset="60%" stop-color="#00f0ff" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <!-- Sub-Stage Illuminator Light Beam -->
    <polygon points="17,39 21,29 15,29" fill="url(#ico-mic-beam)"/>
    <!-- Heavy Solid Base -->
    <path d="M10 44 L38 44 C39.5 44 40 43 39 42 L35 39 C34.5 38.5 33.5 38.5 32.5 38.5 H13.5 C12.5 38.5 11.5 38.5 11 39 L7 42 C6 43 6.5 44 8 44 Z" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
    <rect x="14" y="39" width="8" height="3" rx="1" fill="#38bdf8" fill-opacity="0.3"/>
    <circle cx="18" cy="40.5" r="2" fill="#00f0ff"/>
    <!-- Curved Heavy Metal Spine Arm -->
    <path d="M33 39 C37 36 38 27 37 21 C36 15 31 11 25 11 H23" fill="none" stroke="url(#ico-mic-arm)" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Dual Focus Knobs -->
    <circle cx="34" cy="27" r="4" fill="url(#ico-mic-knob)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="34" cy="27" r="2.2" fill="#1e293b"/>
    <circle cx="34" cy="27" r="1" fill="#fbbf24"/>
    <!-- Mechanical Specimen Stage -->
    <rect x="11" y="28" width="16" height="3" rx="1.5" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
    <!-- Specimen Slide & Biological Sample -->
    <rect x="13" y="27" width="12" height="1.5" rx="0.5" fill="#bae6fd" fill-opacity="0.9"/>
    <circle cx="18" cy="27.7" r="1.2" fill="#ec4899"/>
    <circle cx="18" cy="27.7" r="2" stroke="#f43f5e" stroke-width="0.6" stroke-dasharray="1 1"/>
    <!-- Revolving Turret (Nosepiece) -->
    <path d="M14 18 H22 L20 21 H16 Z" fill="#475569" stroke="#64748b" stroke-width="0.8"/>
    <!-- High-Power Objective Lens (40x Active Cyan) -->
    <rect x="16.5" y="21" width="3" height="5" rx="0.8" fill="#1e293b" stroke="#38bdf8" stroke-width="0.8"/>
    <rect x="16.5" y="24" width="3" height="1" fill="#00f0ff"/>
    <!-- Secondary Angled Objective Lens (10x Yellow) -->
    <path d="M19.5 20.5 L23 23 L22 24.5 L18.5 22 Z" fill="#334155" stroke="#fbbf24" stroke-width="0.8"/>
    <!-- Main Optical Barrel Tube -->
    <path d="M16 8 L22 17" stroke="url(#ico-mic-tube)" stroke-width="5" stroke-linecap="round"/>
    <path d="M16 8 L22 17" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Binocular Eyepiece Head & Ocular Lenses -->
    <rect x="12" y="6" width="6" height="3" rx="1" transform="rotate(-34 15 7.5)" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
    <rect x="10" y="3" width="4.5" height="3.5" rx="1" transform="rotate(-34 12 4.5)" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
    <ellipse cx="10.8" cy="3.5" rx="2" ry="0.9" transform="rotate(-34 10.8 3.5)" fill="#00f0ff"/>
  </svg>`,

  periodicTable: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-pt-tile-c" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="ico-pt-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    <!-- Periodic Grid Background Matrix (Color-Coded Chemical Groups) -->
    <!-- Row 1: H & He -->
    <rect x="4" y="6" width="4.5" height="4" rx="1" fill="#f43f5e"/>
    <rect x="39.5" y="6" width="4.5" height="4" rx="1" fill="#a855f7"/>
    <!-- Row 2 -->
    <rect x="4" y="11.5" width="4.5" height="4" rx="1" fill="#fb7185"/>
    <rect x="9.5" y="11.5" width="4.5" height="4" rx="1" fill="#f97316"/>
    <rect x="28.5" y="11.5" width="4.5" height="4" rx="1" fill="#34d399"/>
    <rect x="34" y="11.5" width="4.5" height="4" rx="1" fill="#22d3ee"/>
    <rect x="39.5" y="11.5" width="4.5" height="4" rx="1" fill="#a855f7"/>
    <!-- Row 3 -->
    <rect x="4" y="17" width="4.5" height="4" rx="1" fill="#fb7185"/>
    <rect x="9.5" y="17" width="4.5" height="4" rx="1" fill="#f97316"/>
    <rect x="28.5" y="17" width="4.5" height="4" rx="1" fill="#34d399"/>
    <rect x="34" y="17" width="4.5" height="4" rx="1" fill="#22d3ee"/>
    <rect x="39.5" y="17" width="4.5" height="4" rx="1" fill="#a855f7"/>
    <!-- Row 4 (Transition Metals Cyan Span) -->
    <rect x="4" y="22.5" width="4" height="4" rx="1" fill="#fb7185"/>
    <rect x="8.5" y="22.5" width="4" height="4" rx="1" fill="#f97316"/>
    <rect x="13" y="22.5" width="4" height="4" rx="1" fill="#0284c7"/>
    <rect x="17.5" y="22.5" width="4" height="4" rx="1" fill="#0284c7"/>
    <rect x="22" y="22.5" width="4" height="4" rx="1" fill="#0284c7"/>
    <rect x="26.5" y="22.5" width="4" height="4" rx="1" fill="#0284c7"/>
    <rect x="31" y="22.5" width="4" height="4" rx="1" fill="#0284c7"/>
    <rect x="35.5" y="22.5" width="4" height="4" rx="1" fill="#22d3ee"/>
    <rect x="40" y="22.5" width="4" height="4" rx="1" fill="#a855f7"/>
    <!-- Bottom Actinides / Lanthanides strip -->
    <rect x="13" y="28" width="22" height="3" rx="1" fill="#eab308" fill-opacity="0.8"/>
    <!-- Elevated 3D Atomic Element Card (Carbon - 6 C) -->
    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
      <rect x="11" y="14" width="22" height="25" rx="3.5" fill="url(#ico-pt-tile-c)" stroke="url(#ico-pt-glow)" stroke-width="1.8"/>
      <rect x="12" y="15" width="20" height="23" rx="2.5" fill="none" stroke="#38bdf8" stroke-width="0.6" stroke-opacity="0.5"/>
      <text x="14" y="20.5" fill="#38bdf8" font-size="5" font-family="system-ui, sans-serif" font-weight="900">6</text>
      <text x="26.5" y="20.5" fill="#94a3b8" font-size="3.5" font-family="system-ui, sans-serif" font-weight="700">12.0</text>
      <text x="17" y="31" fill="#ffffff" font-size="12" font-family="system-ui, sans-serif" font-weight="900">C</text>
      <text x="14.5" y="36.5" fill="#7dd3fc" font-size="3.2" font-family="system-ui, sans-serif" font-weight="700" letter-spacing="0.5">CARBON</text>
      <ellipse cx="22" cy="26" rx="9" ry="3.5" transform="rotate(-25 22 26)" fill="none" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="2 2" stroke-opacity="0.8"/>
      <circle cx="29.5" cy="22.5" r="1.2" fill="#00f0ff"/>
    </g>
  </svg>`,

  projectile: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-proj-cannon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="40%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="ico-proj-arc" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
      <radialGradient id="ico-proj-ball" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#38bdf8"/>
        <stop offset="70%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0c4a6e"/>
      </radialGradient>
      <radialGradient id="ico-proj-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ico-proj-ground" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
        <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <!-- Ground Datum -->
    <path d="M4 42h40" stroke="url(#ico-proj-ground)" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 45h6M21 45h6M35 45h6" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Parabolic Trajectory Arc -->
    <path d="M15 31 Q27 4 41 40" fill="none" stroke="url(#ico-proj-arc)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3.5 2.5"/>
    <!-- Trajectory Apex Indicator -->
    <circle cx="27" cy="17.5" r="2" fill="#fbbf24"/>
    <path d="M27 12v3M27 20v3" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Target Impact Marker -->
    <ellipse cx="41" cy="41" rx="4" ry="1.5" fill="#f43f5e" fill-opacity="0.4"/>
    <circle cx="41" cy="41" r="1.5" fill="#f43f5e"/>
    <!-- Launch Cannon Mount -->
    <path d="M6 42 L14 42 L13 36 L7 36 Z" fill="#334155" stroke="#64748b" stroke-width="1.2"/>
    <circle cx="10" cy="36" r="4.5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="10" cy="36" r="2" fill="#38bdf8"/>
    <!-- Cannon Barrel (angled at ~45 deg) -->
    <path d="M9 38 L18 29 L21.5 32.5 L12.5 41.5 Z" fill="url(#ico-proj-cannon)" stroke="#38bdf8" stroke-width="1.2"/>
    <ellipse cx="19.7" cy="30.7" rx="2.5" ry="1.3" transform="rotate(-45 19.7 30.7)" fill="#38bdf8"/>
    <!-- In-Flight Glowing Projectile with Velocity Vector -->
    <circle cx="29" cy="18" r="7" fill="url(#ico-proj-glow)"/>
    <circle cx="29" cy="18" r="4" fill="url(#ico-proj-ball)"/>
    <circle cx="27.8" cy="16.8" r="1.2" fill="#ffffff" fill-opacity="0.8"/>
    <!-- Velocity Arrow Vector (Tangent) -->
    <path d="M31.5 19.5 L37 23" stroke="#00f0ff" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M36 21 L37.5 23.5 L34.5 23.5" fill="#00f0ff"/>
    <!-- Speed Wake Streaks -->
    <path d="M23 14 L20 12M24 16 L19.5 15" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.6"/>
  </svg>`,

  circuit: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-circ-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#064e3b"/>
        <stop offset="100%" stop-color="#022c22"/>
      </linearGradient>
      <linearGradient id="ico-circ-trace" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
      <radialGradient id="ico-circ-bulb-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ico-circ-batt-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <!-- PCB Substrate Plate -->
    <rect x="4" y="4" width="40" height="40" rx="6" fill="url(#ico-circ-pcb)" stroke="#10b981" stroke-width="1.2"/>
    <path d="M4 14h40M4 34h40M14 4v40M34 4v40" stroke="#047857" stroke-width="0.5" stroke-opacity="0.4"/>
    <!-- Conductive Copper / Gold Traces -->
    <path d="M12 28 V12 H21 M27 12 H36 V21 M36 29 V36 H29 M19 36 H12 V28" fill="none" stroke="url(#ico-circ-trace)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Solder Joint Pads -->
    <circle cx="12" cy="12" r="2.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="36" cy="12" r="2.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="36" cy="36" r="2.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="12" cy="36" r="2.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
    <!-- Top Component: Color-Banded Precision Resistor -->
    <rect x="21" y="9.5" width="8" height="5" rx="1.5" fill="#fde68a" stroke="#d97706" stroke-width="0.8"/>
    <rect x="22.5" y="9.5" width="1" height="5" fill="#b45309"/>
    <rect x="24.5" y="9.5" width="1" height="5" fill="#0f172a"/>
    <rect x="26.5" y="9.5" width="1" height="5" fill="#ef4444"/>
    <!-- Left Component: DC Battery Cell with Potential Symbols -->
    <rect x="9.5" y="19" width="5" height="10" rx="1" fill="url(#ico-circ-batt-body)" stroke="#94a3b8" stroke-width="0.8"/>
    <rect x="11" y="17.5" width="2" height="1.5" fill="#f87171"/>
    <text x="5.5" y="21" fill="#f87171" font-size="5" font-family="sans-serif" font-weight="900">+</text>
    <text x="6" y="29.5" fill="#38bdf8" font-size="6" font-family="sans-serif" font-weight="900">−</text>
    <!-- Right Component: Glowing Incandescent Light Bulb -->
    <circle cx="36" cy="25" r="7" fill="url(#ico-circ-bulb-glow)"/>
    <circle cx="36" cy="25" r="4" fill="#ffffff" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.2"/>
    <path d="M34 26 L35.5 23.5 L36.5 25 L37.5 23.5 L38 26" fill="none" stroke="#ea580c" stroke-width="1" stroke-linecap="round"/>
    <!-- Bottom Component: Knife Switch -->
    <circle cx="21" cy="36" r="1.5" fill="#f59e0b"/>
    <circle cx="27" cy="36" r="1.5" fill="#f59e0b"/>
    <path d="M21 36 L27.5 31.5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="27.5" cy="31.5" r="1" fill="#ffffff"/>
  </svg>`,

  arduino: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-ard-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00979d"/>
        <stop offset="50%" stop-color="#008184"/>
        <stop offset="100%" stop-color="#005d5f"/>
      </linearGradient>
      <linearGradient id="ico-ard-metal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
    </defs>
    <!-- Arduino PCB Board -->
    <rect x="4" y="6" width="40" height="36" rx="4" fill="url(#ico-ard-pcb)" stroke="#38bdf8" stroke-width="1.2"/>
    <!-- Gold mounting holes -->
    <circle cx="8" cy="10" r="1.8" fill="#f59e0b"/>
    <circle cx="8" cy="38" r="1.8" fill="#f59e0b"/>
    <circle cx="40" cy="10" r="1.8" fill="#f59e0b"/>
    <circle cx="40" cy="34" r="1.8" fill="#f59e0b"/>
    <!-- USB Type-B Port -->
    <rect x="5" y="14" width="8" height="10" rx="1.5" fill="url(#ico-ard-metal)" stroke="#475569" stroke-width="0.8"/>
    <!-- DC Power Jack -->
    <rect x="5" y="27" width="9" height="11" rx="1.5" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
    <!-- ATmega328P DIP IC -->
    <rect x="18" y="24" width="20" height="8" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <path d="M20 23v-1M23 23v-1M26 23v-1M29 23v-1M32 23v-1M35 23v-1" stroke="#cbd5e1" stroke-width="0.8"/>
    <path d="M20 33v1M23 33v1M26 33v1M29 33v1M32 33v1M35 33v1" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Arduino Infinity Symbol (O O with - and +) -->
    <ellipse cx="23" cy="14" rx="3.5" ry="2.2" stroke="#ffffff" stroke-width="1"/>
    <ellipse cx="30" cy="14" rx="3.5" ry="2.2" stroke="#ffffff" stroke-width="1"/>
    <path d="M21.5 14h3" stroke="#ffffff" stroke-width="0.8"/>
    <path d="M28.5 14h3M30 12.5v3" stroke="#ffffff" stroke-width="0.8"/>
    <!-- Status LEDs: ON (Green), L (Yellow) -->
    <circle cx="16" cy="14" r="1.2" fill="#10b981"/>
    <circle cx="36" cy="14" r="1.2" fill="#f59e0b"/>
    <!-- Header pin strips (Digital top, Analog bottom) -->
    <rect x="16" y="8" width="23" height="3" fill="#0f172a"/>
    <rect x="18" y="37" width="21" height="3" fill="#0f172a"/>
  </svg>`,

  titration: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-titr-glass" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
        <stop offset="25%" stop-color="#bae6fd" stop-opacity="0.25"/>
        <stop offset="75%" stop-color="#38bdf8" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="ico-titr-burette-fluid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="ico-titr-stopcock" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <linearGradient id="ico-titr-solution" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="45%" stop-color="#ec4899"/>
        <stop offset="85%" stop-color="#d946ef"/>
        <stop offset="100%" stop-color="#9333ea"/>
      </linearGradient>
      <radialGradient id="ico-titr-drop" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#f472b6"/>
        <stop offset="80%" stop-color="#db2777"/>
        <stop offset="100%" stop-color="#9d174d"/>
      </radialGradient>
      <linearGradient id="ico-titr-stand" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    <!-- Retort Stand Rod & Base Clamp -->
    <path d="M12 4v40" stroke="url(#ico-titr-stand)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M8 44h10" stroke="url(#ico-titr-stand)" stroke-width="3" stroke-linecap="round"/>
    <path d="M12 12h9M12 21h9" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Precision Burette Tube -->
    <rect x="21" y="4" width="6" height="17" rx="1.5" fill="url(#ico-titr-glass)" stroke="#38bdf8" stroke-width="1.2"/>
    <!-- Liquid in Burette -->
    <rect x="22" y="8" width="4" height="13" fill="url(#ico-titr-burette-fluid)" fill-opacity="0.85"/>
    <ellipse cx="24" cy="8" rx="2" ry="0.6" fill="#7dd3fc"/>
    <!-- Burette Volume Graduations -->
    <path d="M25.5 7h1.5M24.5 9h2.5M25.5 11h1.5M24.5 13h2.5M25.5 15h1.5M24.5 17h2.5M25.5 19h1.5" stroke="#ffffff" stroke-width="0.8"/>
    <!-- Stopcock Valve -->
    <rect x="22" y="21" width="4" height="3" fill="#64748b"/>
    <circle cx="24" cy="22.5" r="2.2" fill="url(#ico-titr-stopcock)" stroke="#78350f" stroke-width="0.6"/>
    <path d="M20 22.5h8" stroke="url(#ico-titr-stopcock)" stroke-width="2" stroke-linecap="round"/>
    <!-- Burette Dispensing Nozzle Tip -->
    <path d="M23 24 L23.5 27 L24.5 27 L25 24 Z" fill="url(#ico-titr-glass)" stroke="#38bdf8" stroke-width="0.8"/>
    <!-- Suspended Falling Titrant Droplet -->
    <path d="M24 29 C24 29 22.5 31.5 22.5 32.5 C22.5 33.3 23.2 34 24 34 C24.8 34 25.5 33.3 25.5 32.5 C25.5 31.5 24 29 24 29 Z" fill="url(#ico-titr-drop)"/>
    <!-- Erlenmeyer Flask Body -->
    <path d="M21 34h6 L29 38 L37 43.5 C37.8 44.2 37.3 45 36.2 45 H11.8 C10.7 45 10.2 44.2 11 43.5 L19 38 L21 34 Z" fill="url(#ico-titr-glass)" stroke="#93c5fd" stroke-width="1.3"/>
    <!-- Titration Solution in Flask (Pink Phenolphthalein Endpoint) -->
    <path d="M14.5 40 Q24 38.5 33.5 40 L36 44.2 H12 Z" fill="url(#ico-titr-solution)"/>
    <ellipse cx="24" cy="39.8" rx="9" ry="1.2" fill="#fbcfe8" fill-opacity="0.8"/>
    <circle cx="21" cy="42" r="1" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="26" cy="41" r="0.8" fill="#ffffff" fill-opacity="0.9"/>
    <circle cx="29" cy="42.5" r="0.7" fill="#ffffff" fill-opacity="0.7"/>
    <path d="M13 43.5 L19.5 39" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.8"/>
  </svg>`,

  optics: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-opt-lens" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
        <stop offset="25%" stop-color="#7dd3fc" stop-opacity="0.45"/>
        <stop offset="75%" stop-color="#0284c7" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="ico-opt-ray-par" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="ico-opt-ray-cen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
      <linearGradient id="ico-opt-ray-foc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="50%" stop-color="#ec4899"/>
        <stop offset="100%" stop-color="#d946ef"/>
      </linearGradient>
      <radialGradient id="ico-opt-focus-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#00f0ff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Horizontal Principal Optical Axis with Focal Ticks -->
    <path d="M3 24 H45" stroke="#475569" stroke-width="1.4" stroke-dasharray="3 2"/>
    <path d="M14 22.5 v3 M34 22.5 v3" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="12.5" y="29" fill="#94a3b8" font-size="4" font-family="system-ui, sans-serif" font-weight="700">F</text>
    <text x="32.5" y="29" fill="#94a3b8" font-size="4" font-family="system-ui, sans-serif" font-weight="700">F'</text>
    <!-- Ray 1: Incident Parallel Ray (Cyan) -> Refracts through Focal Point F' -->
    <path d="M8 13 H24 L40 33" stroke="url(#ico-opt-ray-par)" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16 13 L14 11.5 M16 13 L14 14.5" stroke="#00f0ff" stroke-width="1.4"/>
    <!-- Ray 2: Chief Ray (Gold) passing undeflected through Optical Center O -->
    <path d="M8 13 L40 33" stroke="url(#ico-opt-ray-cen)" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Ray 3: Front Focal Ray (Magenta) through F -> emerges parallel -->
    <path d="M8 13 L24 33 H40" stroke="url(#ico-opt-ray-foc)" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Symmetrical Biconvex Glass Lens Body -->
    <path d="M24 5 C29 14 29 34 24 43 C19 34 19 14 24 5 Z" fill="url(#ico-opt-lens)" stroke="#38bdf8" stroke-width="1.5"/>
    <ellipse cx="24" cy="24" rx="1.5" ry="17" fill="#ffffff" fill-opacity="0.2"/>
    <path d="M22 10 C24 16 24 32 22 38" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-opacity="0.75"/>
    <!-- Upright Real Object Arrow (Left, h_o) -->
    <path d="M8 24 V13" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M5.5 15.5 L8 12 L10.5 15.5 Z" fill="#fbbf24"/>
    <!-- Inverted Real Image Arrow (Right, h_i) where rays converge -->
    <path d="M40 24 V33" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M37.5 30.5 L40 34 L42.5 30.5 Z" fill="#f43f5e"/>
    <!-- Focal Point Convergence Plasma Glow -->
    <circle cx="40" cy="33" r="3.5" fill="url(#ico-opt-focus-glow)"/>
    <circle cx="24" cy="24" r="1.5" fill="#ffffff"/>
  </svg>`,

  gasLaws: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-gas-chamber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="15%" stop-color="#38bdf8" stop-opacity="0.15"/>
        <stop offset="85%" stop-color="#0284c7" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="ico-gas-piston-rod" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <radialGradient id="ico-gas-gauge" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </radialGradient>
      <radialGradient id="ico-gas-hot" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#f87171"/>
        <stop offset="80%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </radialGradient>
      <radialGradient id="ico-gas-cold" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#38bdf8"/>
        <stop offset="80%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0c4a6e"/>
      </radialGradient>
    </defs>
    <!-- Pressure Chamber Cylinder -->
    <path d="M10 12 V40 C10 42.5 12 44.5 14.5 44.5 H31.5 C34 44.5 36 42.5 36 40 V12" fill="url(#ico-gas-chamber)" stroke="#38bdf8" stroke-width="1.8"/>
    <!-- Cylinder Base Plate -->
    <path d="M8 44.5 H38" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Volume Graduations along Left Wall -->
    <path d="M10 24h3M10 30h4M10 36h3M10 40h4" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Movable Piston Head Plate with O-Ring Gasket -->
    <rect x="11.5" y="19" width="23" height="4.5" rx="1.5" fill="url(#ico-gas-piston-rod)" stroke="#334155" stroke-width="1"/>
    <rect x="11.5" y="20.5" width="23" height="1.5" fill="#f43f5e"/>
    <!-- Piston Push Rod & Force Indicator Arrow -->
    <rect x="21.5" y="6" width="3" height="13" fill="url(#ico-gas-piston-rod)" stroke="#475569" stroke-width="0.8"/>
    <path d="M23 4 L23 11 M21 9 L23 11 L25 9" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Manometer Pressure Gauge on Right Manifold -->
    <path d="M36 17 H39 V13" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="39" cy="10" r="5.5" fill="url(#ico-gas-gauge)" stroke="#334155" stroke-width="1.2"/>
    <path d="M36.5 8h1M38 6.5v1M41 7.5l-0.8 0.8M41.5 10h-1" stroke="#334155" stroke-width="0.8"/>
    <path d="M39 10 L41.5 8" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="39" cy="10" r="1" fill="#1e293b"/>
    <!-- Kinetic Gas Molecule Particles in Thermal Motion -->
    <path d="M15 31 L18 28" stroke="#fca5a5" stroke-width="1" stroke-dasharray="1 1"/>
    <circle cx="18" cy="28" r="2.2" fill="url(#ico-gas-hot)"/>
    <path d="M30 35 L26 31" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="1 1"/>
    <circle cx="26" cy="31" r="2" fill="url(#ico-gas-cold)"/>
    <circle cx="32" cy="39" r="2.2" fill="url(#ico-gas-hot)"/>
    <path d="M34 38 Q35 39 34 40" stroke="#fca5a5" stroke-width="1"/>
    <circle cx="16" cy="38" r="1.8" fill="url(#ico-gas-cold)"/>
    <path d="M23 37 L21 34" stroke="#fbbf24" stroke-width="1"/>
    <circle cx="21" cy="34" r="2.4" fill="#fbbf24"/>
  </svg>`,

  dna: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-dna-strand-a" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="ico-dna-strand-b" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="50%" stop-color="#d946ef"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
      <radialGradient id="ico-dna-node-a" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#00f0ff"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </radialGradient>
      <radialGradient id="ico-dna-node-b" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#fb7185"/>
        <stop offset="100%" stop-color="#e11d48"/>
      </radialGradient>
      <radialGradient id="ico-dna-prot" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="40%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </radialGradient>
    </defs>
    <!-- Background Complementary Hydrogen Bond Rungs -->
    <path d="M15 10 H33" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <path d="M19 16 H29" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
    <path d="M21 24 H27" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
    <path d="M19 32 H29" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 38 H33" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
    <!-- Hydrogen Bond Center Cleavage Nodes (A-T, G-C) -->
    <circle cx="24" cy="10" r="1.2" fill="#ffffff"/>
    <circle cx="24" cy="16" r="1.2" fill="#ffffff"/>
    <circle cx="24" cy="24" r="1.2" fill="#ffffff"/>
    <circle cx="24" cy="32" r="1.2" fill="#ffffff"/>
    <circle cx="24" cy="38" r="1.2" fill="#ffffff"/>
    <!-- Double Helix Strand 1 (Sinusoidal Spline Front) -->
    <path d="M14 6 C14 16 34 16 34 24 C34 32 14 32 14 42" fill="none" stroke="url(#ico-dna-strand-a)" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Double Helix Strand 2 (Sinusoidal Spline Phase Inverted) -->
    <path d="M34 6 C34 16 14 16 14 24 C14 32 34 32 34 42" fill="none" stroke="url(#ico-dna-strand-b)" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Major & Minor Groove Globular Backbone Phosphates -->
    <circle cx="14" cy="6" r="2.8" fill="url(#ico-dna-node-a)"/>
    <circle cx="34" cy="6" r="2.8" fill="url(#ico-dna-node-b)"/>
    <circle cx="24" cy="15" r="2.2" fill="url(#ico-dna-node-a)"/>
    <circle cx="34" cy="24" r="2.8" fill="url(#ico-dna-node-a)"/>
    <circle cx="14" cy="24" r="2.8" fill="url(#ico-dna-node-b)"/>
    <circle cx="24" cy="33" r="2.2" fill="url(#ico-dna-node-b)"/>
    <circle cx="14" cy="42" r="2.8" fill="url(#ico-dna-node-a)"/>
    <circle cx="34" cy="42" r="2.8" fill="url(#ico-dna-node-b)"/>
    <!-- Protein Synthesis: Emerging Ribosomal Peptide Chain -->
    <g transform="translate(6, 0)">
      <path d="M32 20 Q38 18 40 12" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="1.5 1.5"/>
      <circle cx="36" cy="18" r="2" fill="url(#ico-dna-prot)"/>
      <circle cx="40" cy="13" r="2.4" fill="#34d399"/>
      <circle cx="42" cy="7" r="2" fill="#ec4899"/>
    </g>
  </svg>`,

  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>`,

  smartboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>`,

  pen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>`,

  eraser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
    <path d="M22 21H7"/>
    <path d="m5 11 9 9"/>
  </svg>`,

  print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect width="12" height="8" x="6" y="14"/>
  </svg>`,

  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>`,

  play: `<svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`,

  pause: `<svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>`,

  reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>`,

  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>`,

  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`,

  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>`,

  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>`,

  punnett: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-pun-frame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="ico-pun-gridline" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
      <!-- 3D Golden-Yellow Smooth Round Pea (Dominant R phenotype) -->
      <radialGradient id="ico-pun-round-pea" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#fef08a"/>
        <stop offset="65%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#a16207"/>
      </radialGradient>
      <!-- 3D Emerald-Green Textured Wrinkled Pea (Recessive r phenotype) -->
      <radialGradient id="ico-pun-wrinkled-pea" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="40%" stop-color="#10b981"/>
        <stop offset="85%" stop-color="#047857"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </radialGradient>
    </defs>
    <!-- 2x2 Mendelian Genetics Matrix Frame -->
    <rect x="13" y="13" width="31" height="31" rx="4" fill="url(#ico-pun-frame)" stroke="#334155" stroke-width="1.5"/>
    <!-- Matrix Dividers -->
    <path d="M28.5 13 V44" stroke="url(#ico-pun-gridline)" stroke-width="2"/>
    <path d="M13 28.5 H44" stroke="url(#ico-pun-gridline)" stroke-width="2"/>
    <!-- Parental Allele Badges -->
    <circle cx="21" cy="7.5" r="4.5" fill="#0284c7"/>
    <text x="18.5" y="10" fill="#ffffff" font-size="7" font-family="system-ui, sans-serif" font-weight="900">R</text>
    <circle cx="36" cy="7.5" r="4.5" fill="#7c3aed"/>
    <text x="34.2" y="10" fill="#ffffff" font-size="7" font-family="system-ui, sans-serif" font-weight="900">r</text>
    <circle cx="7.5" cy="21" r="4.5" fill="#0284c7"/>
    <text x="5" y="23.5" fill="#ffffff" font-size="7" font-family="system-ui, sans-serif" font-weight="900">R</text>
    <circle cx="7.5" cy="36" r="4.5" fill="#7c3aed"/>
    <text x="5.7" y="38.5" fill="#ffffff" font-size="7" font-family="system-ui, sans-serif" font-weight="900">r</text>
    <!-- Quadrant 1 (Top-Left RR: Round Yellow Pea) -->
    <circle cx="21" cy="21" r="5.2" fill="url(#ico-pun-round-pea)"/>
    <circle cx="19.5" cy="19.2" r="1.4" fill="#ffffff" fill-opacity="0.8"/>
    <!-- Quadrant 2 (Top-Right Rr: Round Yellow Pea) -->
    <circle cx="36.5" cy="21" r="5.2" fill="url(#ico-pun-round-pea)"/>
    <circle cx="35" cy="19.2" r="1.4" fill="#ffffff" fill-opacity="0.8"/>
    <!-- Quadrant 3 (Bottom-Left Rr: Round Yellow Pea) -->
    <circle cx="21" cy="36.5" r="5.2" fill="url(#ico-pun-round-pea)"/>
    <circle cx="19.5" cy="34.7" r="1.4" fill="#ffffff" fill-opacity="0.8"/>
    <!-- Quadrant 4 (Bottom-Right rr: Wrinkled Green Pea with Dimpled Lobes) -->
    <path d="M36.5 31.5 C38.5 31.5 40 33 40.5 34.5 C41.5 36 41 38 39.5 39.5 C38 41 36 41.5 34 40.5 C32.5 39.5 32 37.5 33 35.5 C34 33.5 35 31.5 36.5 31.5 Z" fill="url(#ico-pun-wrinkled-pea)"/>
    <path d="M35 34.5 Q36.5 36 38.5 35" stroke="#047857" stroke-width="0.8" fill="none"/>
    <path d="M36 37 Q37.5 38.5 39 37.5" stroke="#047857" stroke-width="0.8" fill="none"/>
    <circle cx="35" cy="33.5" r="0.9" fill="#a7f3d0" fill-opacity="0.9"/>
  </svg>`,

  vsepr: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ico-vsepr-central" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="45%" stop-color="#0284c7"/>
        <stop offset="90%" stop-color="#0f172a"/>
      </radialGradient>
      <radialGradient id="ico-vsepr-ligand1" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#34d399"/>
        <stop offset="50%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </radialGradient>
      <radialGradient id="ico-vsepr-ligand2" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#4c1d95"/>
      </radialGradient>
      <radialGradient id="ico-vsepr-lonepair" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
        <stop offset="60%" stop-color="#eab308" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ca8a04" stop-opacity="0.05"/>
      </radialGradient>
      <linearGradient id="ico-vsepr-bond" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    </defs>
    <!-- Background Lone Pair Electron Density Cloud / Lobes (Top-Left) -->
    <path d="M24 24 C20 18 14 10 17 6 C20 2 27 8 24 24 Z" fill="url(#ico-vsepr-lonepair)" stroke="#eab308" stroke-width="0.8" stroke-dasharray="2 1.5"/>
    <circle cx="19" cy="9" r="1.1" fill="#fde047"/>
    <circle cx="22" cy="7.5" r="1.1" fill="#fde047"/>
    
    <!-- Dipole Moment Vector Arrow (Net Dipole with Crossed Tail) -->
    <path d="M24 24 L36 12" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M33 11 L37 11 L37 15" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="22" y1="24" x2="25" y2="27" stroke="#f59e0b" stroke-width="1.6"/>
    
    <!-- Covalent Bonds radiating in 3D tetrahedral angles -->
    <line x1="24" y1="24" x2="38" y2="28" stroke="url(#ico-vsepr-bond)" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 24 L10 37 L14 41 Z" fill="#64748b"/>
    <path d="M24 24 L27 42" stroke="#64748b" stroke-width="2.5" stroke-dasharray="2.5 2"/>
    <line x1="24" y1="24" x2="9" y2="20" stroke="url(#ico-vsepr-bond)" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Bond Angle Arc (109.5°) -->
    <path d="M19 23 A8 8 0 0 1 29 25" stroke="#38bdf8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <text x="21" y="31" fill="#38bdf8" font-size="4" font-family="system-ui, sans-serif" font-weight="800">109.5°</text>

    <!-- Atoms: Peripheral Ligands -->
    <circle cx="8" cy="20" r="4.2" fill="url(#ico-vsepr-ligand1)"/>
    <circle cx="6.8" cy="18.5" r="1.1" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="39" cy="29" r="4.8" fill="url(#ico-vsepr-ligand1)"/>
    <circle cx="37.5" cy="27.5" r="1.2" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="27" cy="42" r="3.8" fill="url(#ico-vsepr-ligand2)" opacity="0.85"/>
    <circle cx="26" cy="41" r="0.9" fill="#ffffff" fill-opacity="0.6"/>
    <circle cx="12" cy="39" r="5.6" fill="url(#ico-vsepr-ligand1)"/>
    <circle cx="10.5" cy="37" r="1.6" fill="#ffffff" fill-opacity="0.85"/>

    <!-- Central Atom (Hub) -->
    <circle cx="24" cy="24" r="7.2" fill="url(#ico-vsepr-central)"/>
    <circle cx="21.5" cy="21.5" r="2.2" fill="#ffffff" fill-opacity="0.85"/>
    <text x="22" y="26.5" fill="#ffffff" font-size="6.5" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle">A</text>
  </svg>`,

  waveInterference: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-wave-barrier" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <radialGradient id="ico-wave-src" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Plane incident wavefronts from left -->
    <line x1="4" y1="8" x2="4" y2="40" stroke="#0ea5e9" stroke-width="1.4" opacity="0.6"/>
    <line x1="9" y1="8" x2="9" y2="40" stroke="#38bdf8" stroke-width="1.6" opacity="0.8"/>
    <line x1="14" y1="8" x2="14" y2="40" stroke="#00f0ff" stroke-width="1.8"/>

    <!-- Double-Slit Barrier Wall -->
    <rect x="17" y="4" width="3" height="11" rx="1" fill="url(#ico-wave-barrier)" stroke="#64748b" stroke-width="0.8"/>
    <rect x="17" y="21" width="3" height="6" rx="1" fill="url(#ico-wave-barrier)" stroke="#64748b" stroke-width="0.8"/>
    <rect x="17" y="33" width="3" height="11" rx="1" fill="url(#ico-wave-barrier)" stroke="#64748b" stroke-width="0.8"/>

    <!-- Slit 1 & Slit 2 Glow Sources -->
    <circle cx="18.5" cy="18" r="2.5" fill="url(#ico-wave-src)"/>
    <circle cx="18.5" cy="30" r="2.5" fill="url(#ico-wave-src)"/>

    <!-- Coherent Circular Wavefronts S1 -->
    <path d="M18.5 11 A7 7 0 0 1 25.5 18 A7 7 0 0 1 18.5 25" stroke="#38bdf8" stroke-width="1.1" fill="none" opacity="0.7"/>
    <path d="M18.5 6 A12 12 0 0 1 30.5 18 A12 12 0 0 1 18.5 30" stroke="#00f0ff" stroke-width="1.2" fill="none" opacity="0.8"/>
    <path d="M18.5 1 A17 17 0 0 1 35.5 18" stroke="#38bdf8" stroke-width="1.1" fill="none" opacity="0.6"/>

    <!-- Coherent Circular Wavefronts S2 -->
    <path d="M18.5 23 A7 7 0 0 1 25.5 30 A7 7 0 0 1 18.5 37" stroke="#38bdf8" stroke-width="1.1" fill="none" opacity="0.7"/>
    <path d="M18.5 18 A12 12 0 0 1 30.5 30 A12 12 0 0 1 18.5 42" stroke="#00f0ff" stroke-width="1.2" fill="none" opacity="0.8"/>
    <path d="M18.5 13 A17 17 0 0 1 35.5 30" stroke="#38bdf8" stroke-width="1.1" fill="none" opacity="0.6"/>

    <!-- Central Antinodal Constructive Line (Bright axis) -->
    <line x1="20" y1="24" x2="42" y2="24" stroke="#fde047" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.85"/>

    <!-- Detector Screen on Right -->
    <line x1="43" y1="4" x2="43" y2="44" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Interference Fringe Intensity Curve I(y) on detector -->
    <path d="M43 6 Q41 9 43 12 Q40 14 43 16 Q37 20 43 24 Q37 28 43 32 Q40 34 43 36 Q41 39 43 42" stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="43" cy="24" r="2.2" fill="#00f0ff"/>
    <circle cx="43" cy="14" r="1.4" fill="#38bdf8"/>
    <circle cx="43" cy="34" r="1.4" fill="#38bdf8"/>
  </svg>`,

  photosynthesis: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-photo-chloroplast" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#15803d"/>
        <stop offset="40%" stop-color="#047857"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>
      <linearGradient id="ico-photo-thylakoid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
      <linearGradient id="ico-photo-sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
      <radialGradient id="ico-photo-o2-bubble" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#7dd3fc"/>
        <stop offset="80%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </radialGradient>
    </defs>
    <!-- Sunlight Photon Rays (Top-Left) -->
    <path d="M4 6 L14 16" stroke="url(#ico-photo-sunbeam)" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M12 16 L14 16 L14 14" stroke="#facc15" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M10 4 L19 13" stroke="url(#ico-photo-sunbeam)" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="5" cy="5" r="2.5" fill="#fde047"/>

    <!-- Chloroplast Double-Membrane Organelle Envelope (Oval) -->
    <ellipse cx="26" cy="27" rx="19" ry="14" fill="url(#ico-photo-chloroplast)" stroke="#22c55e" stroke-width="1.8"/>
    <ellipse cx="26" cy="27" rx="16.5" ry="11.8" fill="none" stroke="#4ade80" stroke-width="0.9" opacity="0.6" stroke-dasharray="3 2"/>

    <!-- Grana 1 (Left Stack of Thylakoids) -->
    <ellipse cx="17" cy="24" rx="5" ry="1.6" fill="url(#ico-photo-thylakoid)"/>
    <ellipse cx="17" cy="27" rx="5" ry="1.6" fill="url(#ico-photo-thylakoid)"/>
    <ellipse cx="17" cy="30" rx="5" ry="1.6" fill="url(#ico-photo-thylakoid)"/>
    <!-- Interconnecting Stroma Lamella -->
    <path d="M17 27 Q24 28 31 26" stroke="#86efac" stroke-width="1.2" fill="none"/>

    <!-- Grana 2 (Right Stack of Thylakoids) -->
    <ellipse cx="31" cy="23" rx="5.5" ry="1.7" fill="url(#ico-photo-thylakoid)"/>
    <ellipse cx="31" cy="26" rx="5.5" ry="1.7" fill="url(#ico-photo-thylakoid)"/>
    <ellipse cx="31" cy="29" rx="5.5" ry="1.7" fill="url(#ico-photo-thylakoid)"/>
    <ellipse cx="31" cy="32" rx="5.5" ry="1.7" fill="url(#ico-photo-thylakoid)"/>

    <!-- Rising O2 Gas Bubbles with Specular Highlight (Right) -->
    <circle cx="40" cy="11" r="3.2" fill="url(#ico-photo-o2-bubble)"/>
    <circle cx="39" cy="9.8" r="0.9" fill="#ffffff" fill-opacity="0.9"/>
    <circle cx="36" cy="5" r="2.2" fill="url(#ico-photo-o2-bubble)"/>
    <circle cx="35.3" cy="4.2" r="0.6" fill="#ffffff" fill-opacity="0.9"/>
    
    <!-- Chemical Formula Badge: O2 + C6 -->
    <rect x="2" y="36" width="18" height="9" rx="3" fill="#0f172a" fill-opacity="0.85" stroke="#38bdf8" stroke-width="0.8"/>
    <text x="4" y="42.5" fill="#38bdf8" font-size="5.2" font-family="system-ui, sans-serif" font-weight="900">O₂+C₆</text>
  </svg>`,

  calorimetry: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-cal-vessel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="50%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="ico-cal-chamber" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.5"/>
      </linearGradient>
      <linearGradient id="ico-cal-therm" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
    </defs>
    <!-- Insulated Outer Shell / Dewar -->
    <rect x="10" y="14" width="28" height="30" rx="4" fill="url(#ico-cal-vessel)" stroke="#64748b" stroke-width="1.5"/>
    <path d="M7 14 C7 12 11 11 24 11 C37 11 41 12 41 14 L39 17 H9 Z" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
    <!-- Inner Reaction Chamber -->
    <rect x="15" y="20" width="18" height="20" rx="2" fill="url(#ico-cal-chamber)" stroke="#06b6d4" stroke-width="1.2"/>
    <!-- Thermometer Probe -->
    <rect x="19" y="3" width="3" height="30" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
    <rect x="19.5" y="16" width="2" height="16" rx="1" fill="url(#ico-cal-therm)"/>
    <circle cx="20.5" cy="33" r="3" fill="#dc2626"/>
    <!-- Motorized Stirrer Rod -->
    <path d="M28 4 V32 L25 35 M28 32 L31 35" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Heat Exchange Waves (Q = mcΔT) -->
    <path d="M3 24 Q6 21 3 18" stroke="#f43f5e" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <path d="M45 24 Q42 21 45 18" stroke="#f43f5e" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <rect x="2" y="38" width="14" height="8" rx="2" fill="#0f172a" stroke="#f43f5e" stroke-width="0.8"/>
    <text x="4" y="44" fill="#f43f5e" font-size="5" font-family="system-ui, sans-serif" font-weight="900">ΔH</text>
  </svg>`,

  equilibrium: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-eq-tube1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="ico-eq-tube2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#c2410c" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <!-- Left Cuvette (Reactant N2O4 - Clear/Cyan) -->
    <rect x="7" y="10" width="12" height="28" rx="2" fill="url(#ico-eq-tube1)" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="9" y1="18" x2="17" y2="18" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
    <!-- Right Cuvette (Product NO2 - Amber Brown) -->
    <rect x="29" y="10" width="12" height="28" rx="2" fill="url(#ico-eq-tube2)" stroke="#f97316" stroke-width="1.5"/>
    <line x1="31" y1="18" x2="39" y2="18" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
    <!-- Dynamic Le Chatelier Equilibrium Double Arrows -->
    <!-- Forward Arrow (Right) -->
    <path d="M20 18 H27 M25 15 L28 18 L25 21" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Reverse Arrow (Left) -->
    <path d="M28 26 H21 M23 23 L20 26 L23 29" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Center Equilibrium Balance Fulcrum -->
    <polygon points="24,34 21,41 27,41" fill="#64748b"/>
    <line x1="16" y1="34" x2="32" y2="34" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
    <!-- Kc Badge -->
    <rect x="18" y="2" width="12" height="7" rx="2" fill="#0f172a" stroke="#22c55e" stroke-width="0.8"/>
    <text x="20.5" y="7.5" fill="#22c55e" font-size="5" font-family="system-ui, sans-serif" font-weight="900">Kc</text>
  </svg>`,

  electrochem: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-ec-zn" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="ico-ec-cu" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <!-- Left Anode Beaker (ZnSO4) -->
    <rect x="5" y="18" width="15" height="24" rx="2" fill="#0284c7" fill-opacity="0.35" stroke="#38bdf8" stroke-width="1.2"/>
    <!-- Right Cathode Beaker (CuSO4) -->
    <rect x="28" y="18" width="15" height="24" rx="2" fill="#2563eb" fill-opacity="0.55" stroke="#60a5fa" stroke-width="1.2"/>
    <!-- Zinc Anode Strip -->
    <rect x="9" y="12" width="4" height="24" rx="1" fill="url(#ico-ec-zn)" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Copper Cathode Strip -->
    <rect x="35" y="12" width="4" height="24" rx="1" fill="url(#ico-ec-cu)" stroke="#fdba74" stroke-width="0.8"/>
    <!-- Inverted U-tube Salt Bridge -->
    <path d="M16 26 V15 C16 13 18 12 21 12 H27 C30 12 32 13 32 15 V26" fill="none" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
    <path d="M16 26 V15 C16 13 18 12 21 12 H27 C30 12 32 13 32 15 V26" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="1.5 1.5"/>
    <!-- Voltmeter Connecting Wire with Digital Meter -->
    <path d="M11 12 V5 H20 M28 5 H37 V12" stroke="#e2e8f0" stroke-width="1.2"/>
    <circle cx="24" cy="5" r="5" fill="#0f172a" stroke="#10b981" stroke-width="1.2"/>
    <text x="21" y="7" fill="#10b981" font-size="4" font-family="system-ui, sans-serif" font-weight="900">1.1V</text>
  </svg>`,

  harmonic: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-shm-spring" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="ico-shm-mass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <!-- Rigid Ceiling / Support -->
    <line x1="6" y1="6" x2="24" y2="6" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="8" y1="6" x2="5" y2="3" stroke="#64748b" stroke-width="1"/>
    <line x1="13" y1="6" x2="10" y2="3" stroke="#64748b" stroke-width="1"/>
    <line x1="18" y1="6" x2="15" y2="3" stroke="#64748b" stroke-width="1"/>
    <line x1="23" y1="6" x2="20" y2="3" stroke="#64748b" stroke-width="1"/>
    <!-- Coiled Hooke's Spring -->
    <path d="M15 6 V9 L11 12 L19 15 L11 18 L19 21 L11 24 L19 27 L15 30 V32" fill="none" stroke="url(#ico-shm-spring)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Suspended Brass Mass -->
    <rect x="10" y="32" width="10" height="9" rx="2" fill="url(#ico-shm-mass)" stroke="#fde68a" stroke-width="1"/>
    <!-- Hook -->
    <circle cx="15" cy="32" r="1.5" stroke="#fde68a" stroke-width="1" fill="none"/>
    <!-- Sinusoidal Oscillation Trace x(t) = A cos(ωt) -->
    <path d="M23 20 Q28 8 33 20 T43 20" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
    <!-- Equilibrium Dotted Line -->
    <line x1="22" y1="20" x2="45" y2="20" stroke="#64748b" stroke-width="1" stroke-dasharray="2 2"/>
    <!-- Restoring Force Vector F = -kx -->
    <path d="M5 36 V28 M3 30 L5 28 L7 30" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="3" y="44" fill="#f43f5e" font-size="4.5" font-family="system-ui, sans-serif" font-weight="900">F=-kx</text>
  </svg>`,

  photoelectric: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-pe-photon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
      <linearGradient id="ico-pe-metal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    <!-- Phototube Vacuum Glass Envelope -->
    <ellipse cx="24" cy="24" rx="20" ry="16" fill="#0f172a" fill-opacity="0.4" stroke="#38bdf8" stroke-width="1.2"/>
    <!-- Emitter Metal Cathode Plate (Work Function Φ) -->
    <path d="M12 14 V34" stroke="url(#ico-pe-metal)" stroke-width="3" stroke-linecap="round"/>
    <!-- Collector Anode Ring / Plate -->
    <path d="M36 17 V31" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Incoming UV Photon Wave Packets (hf) -->
    <path d="M3 10 Q6 6 9 10 T15 10" fill="none" stroke="#ec4899" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M5 19 Q8 15 11 19 T17 19" fill="none" stroke="#a855f7" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Ejected Photoelectrons (e-) with kinetic energy trajectories -->
    <circle cx="21" cy="18" r="2" fill="#00f0ff"/>
    <line x1="16" y1="18" x2="19" y2="18" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="1 1"/>
    <path d="M21 18 L32 16" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="25" cy="26" r="2" fill="#00f0ff"/>
    <path d="M25 26 L34 28" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Formula Badge -->
    <rect x="2" y="38" width="16" height="8" rx="2" fill="#0f172a" stroke="#a855f7" stroke-width="0.8"/>
    <text x="4" y="44" fill="#a855f7" font-size="4.5" font-family="system-ui, sans-serif" font-weight="900">E=hf</text>
  </svg>`,

  magnetism: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-mag-coil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <!-- Helmholtz Coil Ring Pair (Perspective) -->
    <ellipse cx="24" cy="24" rx="20" ry="18" fill="none" stroke="url(#ico-mag-coil)" stroke-width="3" opacity="0.85"/>
    <ellipse cx="24" cy="24" rx="16" ry="14" fill="none" stroke="url(#ico-mag-coil)" stroke-width="1.5" opacity="0.5"/>
    <!-- Uniform Magnetic Field Vectors B (Inwards × symbols) -->
    <g stroke="#38bdf8" stroke-width="1.2" opacity="0.7">
      <path d="M12 12 L16 16 M16 12 L12 16"/>
      <path d="M32 12 L36 16 M36 12 L32 16"/>
      <path d="M12 32 L16 36 M16 32 L12 36"/>
      <path d="M32 32 L36 36 M36 32 L32 36"/>
    </g>
    <!-- Circular Electron Trajectory in B-field (r = mv/qB) -->
    <circle cx="24" cy="24" r="10" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="3 2"/>
    <!-- Electron Particle with Tangent Velocity Vector -->
    <circle cx="24" cy="14" r="2.5" fill="#22c55e"/>
    <path d="M24 14 H31 M29 12 L31 14 L29 16" stroke="#facc15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Centripetal Lorentz Force Vector -->
    <path d="M24 14 V19 M22 17 L24 19 L26 17" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- e/m Ratio Badge -->
    <rect x="2" y="38" width="14" height="8" rx="2" fill="#0f172a" stroke="#22c55e" stroke-width="0.8"/>
    <text x="4" y="44" fill="#22c55e" font-size="4.5" font-family="system-ui, sans-serif" font-weight="900">e/m</text>
  </svg>`,

  enzymes: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-enz-protein" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="50%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
      <linearGradient id="ico-enz-sub" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    </defs>
    <!-- Large Enzyme Globular Protein with Active Site Cleft -->
    <path d="M8 26 C8 15 15 10 26 10 C32 10 38 13 41 18 C44 23 43 32 38 37 C33 42 22 42 14 38 C10 35 8 31 8 26 Z" fill="url(#ico-enz-protein)" stroke="#818cf8" stroke-width="1.5"/>
    <!-- Active Site Cleft Indentation -->
    <path d="M20 10 C20 16 23 19 28 19 C33 19 36 16 36 10" fill="#0f172a" stroke="#818cf8" stroke-width="1.5"/>
    <!-- Substrate Key (Fitting perfectly into cleft) -->
    <path d="M23 4 C23 7 25 11 28 11 C31 11 33 7 33 4 Z" fill="url(#ico-enz-sub)" stroke="#fef08a" stroke-width="1.2"/>
    <!-- Transition State Energy Arrow -->
    <path d="M28 2 V6 M26 4 L28 6 L30 4" stroke="#facc15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Michaelis-Menten Rate Curve Mini-Plot -->
    <rect x="3" y="32" width="16" height="13" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8"/>
    <path d="M5 43 H17 M5 43 V34" stroke="#64748b" stroke-width="0.8"/>
    <path d="M5 43 Q8 37 16 35" fill="none" stroke="#22c55e" stroke-width="1.2"/>
    <text x="6" y="35" fill="#38bdf8" font-size="3" font-family="system-ui, sans-serif" font-weight="900">Vmax</text>
  </svg>`,

  respiration: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ico-resp-mito" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="50%" stop-color="#ea580c"/>
        <stop offset="100%" stop-color="#9a3412"/>
      </linearGradient>
      <linearGradient id="ico-resp-fluid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Mitochondrion Organelle (Cellular Powerhouse) -->
    <ellipse cx="18" cy="22" rx="14" ry="9" transform="rotate(-15 18 22)" fill="url(#ico-resp-mito)" stroke="#fdba74" stroke-width="1.5"/>
    <!-- Inner Cristae Folding Membrane -->
    <path d="M8 24 Q12 18 16 23 Q20 18 24 23 Q27 18 29 20" fill="none" stroke="#fed7aa" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Respirometer Glass U-Tube Manometer with Displaced Liquid Column -->
    <path d="M34 8 V32 C34 37 44 37 44 32 V12" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Manometer Indicating Fluid Droplet Shift -->
    <path d="M34 26 V32 C34 36 44 36 44 32 V20" fill="none" stroke="url(#ico-resp-fluid)" stroke-width="1.8" stroke-linecap="round"/>
    <!-- ATP Energy Sparks -->
    <polygon points="12,10 14,5 16,8 19,4 18,9 21,9 17,14 17,11" fill="#facc15"/>
    <text x="21" y="9" fill="#fde047" font-size="4" font-family="system-ui, sans-serif" font-weight="900">ATP</text>
    <!-- O2 Consumption Indicator -->
    <rect x="2" y="38" width="18" height="8" rx="2" fill="#0f172a" stroke="#f97316" stroke-width="0.8"/>
    <text x="4" y="44" fill="#f97316" font-size="4.2" font-family="system-ui, sans-serif" font-weight="900">-O₂/+CO₂</text>
  </svg>`,

  cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="14" height="16" x="6" y="5" rx="2"/>
    <path d="M4 19h14"/>
    <path d="M2 15h14"/>
  </svg>`,

  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>`,

  presenter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 3h20"/>
    <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
    <path d="m7 21 5-5 5 5"/>
  </svg>`,

  googleClassroom: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <rect x="2" y="3" width="20" height="15" rx="3" fill="#0F9D58" stroke="#0B8043" stroke-width="1.5"/>
    <rect x="4" y="5" width="16" height="11" rx="1.5" fill="#188038"/>
    <circle cx="12" cy="9" r="2.2" fill="#E8F0FE"/>
    <path d="M7.8 14.5c0-1.8 1.9-2.8 4.2-2.8s4.2 1 4.2 2.8" fill="#E8F0FE"/>
    <circle cx="7" cy="9.5" r="1.5" fill="#CEEAD6"/>
    <path d="M4 14.2c0-1.3 1.3-2 3-2" stroke="#CEEAD6" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="17" cy="9.5" r="1.5" fill="#CEEAD6"/>
    <path d="M20 14.2c0-1.3-1.3-2-3-2" stroke="#CEEAD6" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M11 18.5h2l.5 2.5h-3z" fill="#E37400"/>
  </svg>`,

  classera: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#6C2BD9"/>
    <path d="M6 16.5l6-9 6 9" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="7.5" r="2" fill="#FFFFFF"/>
    <path d="M8.5 13h7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  calculator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14"/>
    <path d="M16 10h.01"/>
    <path d="M12 10h.01"/>
    <path d="M8 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M8 14h.01"/>
    <path d="M12 18h.01"/>
    <path d="M8 18h.01"/>
  </svg>`,

  beerLambert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="7" y="3" width="10" height="18" rx="2" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.2)"/>
    <line x1="2" y1="12" x2="7" y2="12" stroke="#f43f5e" stroke-width="2.5"/>
    <line x1="17" y1="12" x2="22" y2="12" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="2 2"/>
    <circle cx="12" cy="12" r="1.5" fill="#06b6d4"/>
  </svg>`,

  nuclearDecay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="2.5" fill="#facc15" stroke="#eab308"/>
    <path d="M12 9.5V2" stroke="#facc15"/>
    <path d="M9.8 13.3L3.3 17" stroke="#facc15"/>
    <path d="M14.2 13.3L20.7 17" stroke="#facc15"/>
    <path d="M8.5 4.5a8 8 0 0 1 7 0" stroke="#facc15"/>
    <path d="M2.5 15a8 8 0 0 1 3.5-6" stroke="#facc15"/>
    <path d="M18 9a8 8 0 0 1 3.5 6" stroke="#facc15"/>
  </svg>`,

  colligative: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" stroke="#38bdf8"/>
    <path d="M12 12v6" stroke="#ef4444" stroke-width="2"/>
    <circle cx="12" cy="18" r="2" fill="#ef4444"/>
    <path d="M18 5l2 2m0-2l-2 2" stroke="#c084fc"/>
    <path d="M6 7l2 2m0-2l-2 2" stroke="#c084fc"/>
  </svg>`,

  organicReactions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12,3 19.8,7.5 19.8,16.5 12,21 4.2,16.5 4.2,7.5" stroke="#a855f7" fill="rgba(168, 85, 247, 0.15)"/>
    <circle cx="12" cy="12" r="4.5" stroke="#c084fc" stroke-dasharray="3 3"/>
    <line x1="12" y1="3" x2="12" y2="7.5" stroke="#a855f7"/>
  </svg>`,

  gelElectrophoresis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#10b981" fill="rgba(16, 185, 129, 0.12)"/>
    <rect x="7" y="5" width="2" height="2" fill="#34d399"/>
    <rect x="11" y="5" width="2" height="2" fill="#34d399"/>
    <rect x="15" y="5" width="2" height="2" fill="#34d399"/>
    <line x1="7" y1="9" x2="9" y2="9" stroke="#34d399" stroke-width="2"/>
    <line x1="7" y1="13" x2="9" y2="13" stroke="#34d399" stroke-width="2"/>
    <line x1="7" y1="17" x2="9" y2="17" stroke="#34d399" stroke-width="2"/>
    <line x1="11" y1="11" x2="13" y2="11" stroke="#34d399" stroke-width="2"/>
    <line x1="15" y1="14" x2="17" y2="14" stroke="#34d399" stroke-width="2"/>
  </svg>`,

  populationEcology: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 18l5-6 4 3 7-8" stroke="#10b981" stroke-width="2.2"/>
    <path d="M4 14l5 4 4-7 7 4" stroke="#f59e0b" stroke-width="2.2"/>
    <circle cx="20" cy="7" r="2" fill="#10b981"/>
    <circle cx="20" cy="15" r="2" fill="#f59e0b"/>
  </svg>`,

  actionPotential: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 14h5l2-9 4 15 3-9 2 4h4" stroke="#c084fc" stroke-width="2.2"/>
    <circle cx="11" cy="5" r="1.5" fill="#f43f5e"/>
    <circle cx="16" cy="19" r="1.5" fill="#38bdf8"/>
  </svg>`,

  rotationalDynamics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 19h18L3 9z" stroke="#64748b" fill="rgba(100, 116, 139, 0.2)"/>
    <circle cx="12" cy="11" r="4.5" stroke="#f59e0b" stroke-width="2" fill="rgba(245, 158, 11, 0.25)"/>
    <path d="M12 9a2 2 0 1 1-1.5 3.3" stroke="#fbbf24"/>
  </svg>`,

  thermalConduction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="9" width="14" height="6" rx="1" stroke="#fb923c" fill="rgba(249, 115, 22, 0.2)"/>
    <circle cx="3" cy="12" r="2" fill="#ef4444"/>
    <circle cx="21" cy="12" r="2" fill="#38bdf8"/>
    <path d="M8 12h8" stroke="#ffffff" stroke-dasharray="2 2"/>
    <path d="M14 10l2 2-2 2" stroke="#ffffff"/>
  </svg>`,

  fluidsBuoyancy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="5" width="8" height="8" rx="1" stroke="#38bdf8" fill="rgba(56, 189, 248, 0.25)"/>
    <path d="M2 17c3-1.5 6 1.5 10 0s7 1.5 10 0" stroke="#06b6d4" stroke-width="2"/>
    <path d="M2 20c3-1.5 6 1.5 10 0s7 1.5 10 0" stroke="#0284c7" stroke-width="2"/>
    <line x1="12" y1="10" x2="12" y2="3" stroke="#10b981" stroke-width="2"/>
    <polyline points="10,5 12,3 14,5" stroke="#10b981" stroke-width="2"/>
  </svg>`,

  reactionKinetics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 2v7.31L4.5 19.5A2 2 0 0 0 6.23 22h11.54a2 2 0 0 0 1.73-2.5L14 9.31V2" stroke="#f59e0b"/>
    <line x1="8.5" y1="2" x2="15.5" y2="2" stroke="#f59e0b"/>
    <path d="M13 14l-2 4h3l-2 4" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="8" cy="18" r="1.5" fill="#f59e0b"/>
    <circle cx="16" cy="17" r="1.5" fill="#10b981"/>
  </svg>`,

  collisions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="10" width="7" height="6" rx="1" stroke="#38bdf8" fill="rgba(56, 189, 248, 0.2)"/>
    <rect x="15" y="10" width="7" height="6" rx="1" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.2)"/>
    <line x1="1" y1="19" x2="23" y2="19" stroke="#64748b" stroke-width="2"/>
    <path d="M5 6l3 2-3 2" stroke="#38bdf8"/>
    <path d="M19 6l-3 2 3 2" stroke="#f43f5e"/>
    <line x1="12" y1="8" x2="12" y2="15" stroke="#facc15" stroke-dasharray="2 2"/>
  </svg>`,

  induction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="8" height="14" rx="2" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.2)"/>
    <text x="5" y="10" font-size="5" fill="#f43f5e" font-weight="bold">N</text>
    <text x="5" y="16" font-size="5" fill="#38bdf8" font-weight="bold">S</text>
    <path d="M14 6c3 0 5 1.5 5 3.5s-2 3.5-5 3.5 5 1.5 5 3.5-2 3.5-5 3.5" stroke="#fbbf24" stroke-width="2"/>
    <circle cx="21" cy="12" r="2" stroke="#22c55e" fill="rgba(34, 197, 94, 0.3)"/>
    <line x1="21" y1="12" x2="22" y2="10.5" stroke="#22c55e" stroke-width="1.5"/>
  </svg>`,

  osmosis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 3v12a7 7 0 0 0 14 0V3" stroke="#38bdf8" stroke-width="2"/>
    <line x1="12" y1="6" x2="12" y2="20" stroke="#94a3b8" stroke-dasharray="2 2"/>
    <circle cx="8" cy="12" r="1.5" fill="#38bdf8"/>
    <circle cx="7" cy="15" r="1" fill="#38bdf8"/>
    <circle cx="16" cy="10" r="2" fill="#a855f7"/>
    <circle cx="15" cy="14" r="2" fill="#a855f7"/>
    <circle cx="17" cy="16" r="1.2" fill="#38bdf8"/>
  </svg>`,

  mitosis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="2"/>
    <path d="M9 7l3 5-3 5" stroke="#f43f5e" stroke-width="2"/>
    <path d="M15 7l-3 5 3 5" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="6" cy="12" r="1" fill="#f59e0b"/>
    <circle cx="18" cy="12" r="1" fill="#f59e0b"/>
    <line x1="6" y1="12" x2="9" y2="12" stroke="#f59e0b" stroke-dasharray="1 1"/>
    <line x1="15" y1="12" x2="18" y2="12" stroke="#f59e0b" stroke-dasharray="1 1"/>
  </svg>`,

  flameTest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2c.5 3 3.5 5.5 3.5 9 0 3-2 5.5-4.5 6.5-1.5.6-2.5 1.5-2.5 3 0 .3 0 .7.1 1-3.6-1.5-5.6-5.5-4.6-9.5C5 7.5 8 4 12 2z" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.25)"/>
    <path d="M12 12c1.5 1.5 2 3 1.5 4.5-.5 1-1.5 1.5-2.5 1.5-1.5 0-2.5-1-2.5-2.5 0-1.5 1-2.5 2-3.5" stroke="#ef4444" fill="rgba(239, 68, 68, 0.35)"/>
    <line x1="18" y1="19" x2="22" y2="19" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="16" cy="19" r="1.5" stroke="#38bdf8" fill="#38bdf8"/>
  </svg>`,

  precipitation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2h8v4H8z" stroke="#94a3b8"/>
    <path d="M9 6v12a3 3 0 0 0 6 0V6" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="12" cy="12" r="1" fill="#facc15"/>
    <circle cx="11" cy="14" r="1.2" fill="#facc15"/>
    <circle cx="13" cy="15" r="1" fill="#facc15"/>
    <path d="M10 17h4v1.5a2 2 0 0 1-4 0z" fill="#f59e0b"/>
  </svg>`,

  activitySeries: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="2" stroke="#475569" fill="rgba(56, 189, 248, 0.15)"/>
    <rect x="7" y="5" width="4" height="11" rx="1" stroke="#f59e0b" fill="#f59e0b"/>
    <path d="M14 6l3 3-3 3" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="15" cy="16" r="1" fill="#ffffff"/>
    <circle cx="17" cy="14" r="1" fill="#ffffff"/>
  </svg>`,

  antibiotic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="2" fill="rgba(16, 185, 129, 0.1)"/>
    <circle cx="12" cy="12" r="5" stroke="#38bdf8" stroke-dasharray="2 2"/>
    <circle cx="12" cy="12" r="2" fill="#ffffff" stroke="#94a3b8"/>
    <path d="M7 6l1 1M17 6l-1 1M7 18l1-1M17 18l-1-1" stroke="#10b981" stroke-width="1.5"/>
  </svg>`,

  elisa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="7" cy="8" r="1.5" fill="#facc15"/>
    <circle cx="12" cy="8" r="1.5" fill="#facc15"/>
    <circle cx="17" cy="8" r="1.5" fill="#38bdf8"/>
    <circle cx="7" cy="12" r="1.5" fill="#facc15"/>
    <circle cx="12" cy="12" r="1.5" fill="#38bdf8"/>
    <circle cx="17" cy="12" r="1.5" fill="#38bdf8"/>
    <circle cx="7" cy="16" r="1.5" fill="#38bdf8"/>
    <circle cx="12" cy="16" r="1.5" fill="#38bdf8"/>
    <circle cx="17" cy="16" r="1.5" fill="#38bdf8"/>
  </svg>`,

  transpiration: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 21a9 9 0 0 0 9-9c0-4-4-8-9-10-5 2-9 6-9 10a9 9 0 0 0 9 9z" stroke="#10b981" stroke-width="2" fill="rgba(16, 185, 129, 0.15)"/>
    <path d="M12 3v18" stroke="#10b981" stroke-width="1.5"/>
    <path d="M12 8l5 3M12 13l5 3M12 10l-5 3M12 15l-5 3" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="18" cy="6" r="1" fill="#38bdf8"/>
    <circle cx="19.5" cy="9" r="1" fill="#38bdf8"/>
  </svg>`,

  orbital: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(-25 12 12)" stroke="#818cf8" stroke-width="2"/>
    <circle cx="11" cy="12" r="3" fill="#38bdf8" stroke="#0284c7"/>
    <circle cx="18" cy="8" r="1.5" fill="#fbbf24"/>
    <line x1="18" y1="8" x2="20" y2="7" stroke="#fbbf24" stroke-width="1.5"/>
  </svg>`,

  soundResonance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 4v16M19 4v16" stroke="#94a3b8" stroke-width="2"/>
    <path d="M5 16h14v4H5z" fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8"/>
    <path d="M7 6c3 3 7 3 10 0M7 11c3 3 7 3 10 0M7 16c3 3 7 3 10 0" stroke="#818cf8" stroke-width="1.5"/>
  </svg>`,

  electrostatics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="7" cy="12" r="4" stroke="#ef4444" stroke-width="2" fill="rgba(239, 68, 68, 0.2)"/>
    <line x1="5.5" y1="12" x2="8.5" y2="12" stroke="#ef4444" stroke-width="2"/>
    <line x1="7" y1="10.5" x2="7" y2="13.5" stroke="#ef4444" stroke-width="2"/>
    <circle cx="17" cy="12" r="4" stroke="#3b82f6" stroke-width="2" fill="rgba(59, 130, 246, 0.2)"/>
    <line x1="15.5" y1="12" x2="18.5" y2="12" stroke="#3b82f6" stroke-width="2"/>
    <path d="M11 9c1 1.5 1 4.5 0 6M13 9c-1 1.5-1 4.5 0 6" stroke="#fbbf24" stroke-width="1.5"/>
  </svg>`
};


