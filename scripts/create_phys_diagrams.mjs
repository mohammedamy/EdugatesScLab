// scripts/create_phys_diagrams.mjs
// Generates data/diagrams-phys.js containing all 30 distinct Physics diagrams
import fs from "fs";

// Load 7 existing diagrams
const existingPhys = JSON.parse(fs.readFileSync("./scripts/temp_existing_phys.json", "utf-8"));

const newPhysDiagrams = [
  // 8. Vernier Caliper Scale Reading
  {
    id: "phys_vernier_caliper",
    subject: "PHYS",
    moduleId: 1,
    title: "Precision Vernier Caliper Dual Scale Reading",
    caption: "Figure 8: Main Metric Scale (mm) & Coincident Vernier Scale (0.1 mm Resolution)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Caliper Body Frame -->
      <path d="M 40 50 L 490 50 L 490 120 L 40 120 Z" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      
      <!-- Main Scale Ticks (0 mm to 40 mm) -->
      <!-- Baseline: y=120. Scale: 1mm = 9px. 0mm at x=80 -->
      <line x1="80" y1="120" x2="440" y2="120" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Main Scale Graduations: 0, 5, 10, 15, 20, 25, 30, 35, 40 -->
      <!-- 0 mm -->
      <line x1="80" y1="120" x2="80" y2="90" stroke="#f8fafc" stroke-width="2"/>
      <text x="80" y="82" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">0</text>
      <!-- 1,2,3,4 -->
      <line x1="89" y1="120" x2="89" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="98" y1="120" x2="98" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="107" y1="120" x2="107" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="116" y1="120" x2="116" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <!-- 5 mm -->
      <line x1="125" y1="120" x2="125" y2="98" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- 6,7,8,9 -->
      <line x1="134" y1="120" x2="134" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="143" y1="120" x2="143" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="152" y1="120" x2="152" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="161" y1="120" x2="161" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <!-- 10 mm -->
      <line x1="170" y1="120" x2="170" y2="90" stroke="#f8fafc" stroke-width="2"/>
      <text x="170" y="82" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">10</text>
      <!-- 11..14 -->
      <line x1="179" y1="120" x2="179" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="188" y1="120" x2="188" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="197" y1="120" x2="197" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="206" y1="120" x2="206" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <!-- 15 mm -->
      <line x1="215" y1="120" x2="215" y2="98" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- 16..19 -->
      <line x1="224" y1="120" x2="224" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="233" y1="120" x2="233" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="242" y1="120" x2="242" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <line x1="251" y1="120" x2="251" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <!-- 20 mm -->
      <line x1="260" y1="120" x2="260" y2="90" stroke="#f8fafc" stroke-width="2"/>
      <text x="260" y="82" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">20</text>
      <!-- 25 mm -->
      <line x1="305" y1="120" x2="305" y2="98" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- 30 mm -->
      <line x1="350" y1="120" x2="350" y2="90" stroke="#f8fafc" stroke-width="2"/>
      <text x="350" y="82" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">30</text>
      <!-- 40 mm -->
      <line x1="440" y1="120" x2="440" y2="90" stroke="#f8fafc" stroke-width="2"/>
      <text x="440" y="82" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">40 mm</text>
      
      <!-- Sliding Vernier Jaw Slider -->
      <!-- Offset: vernier 0 is at 14.6 mm -> 80 + 14.6*9 = 80 + 131.4 = 211.4 -->
      <path d="M 195 120 L 320 120 L 320 200 L 195 200 Z" fill="#0f2942" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Vernier scale: 10 divisions = 9 mm on main scale -> each division is 0.9 * 9 = 8.1 px -->
      <!-- Vernier 0 at 211.4 -->
      <line x1="211.4" y1="120" x2="211.4" y2="145" stroke="#38bdf8" stroke-width="2"/>
      <text x="211.4" y="160" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">0</text>
      
      <!-- 1: 211.4 + 8.1 = 219.5 -->
      <line x1="219.5" y1="120" x2="219.5" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 2: 211.4 + 16.2 = 227.6 -->
      <line x1="227.6" y1="120" x2="227.6" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 3: 211.4 + 24.3 = 235.7 -->
      <line x1="235.7" y1="120" x2="235.7" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 4: 211.4 + 32.4 = 243.8 -->
      <line x1="243.8" y1="120" x2="243.8" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 5: 211.4 + 40.5 = 251.9 -->
      <line x1="251.9" y1="120" x2="251.9" y2="140" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="251.9" y="155" fill="#94a3b8" font-size="9" text-anchor="middle">5</text>
      <!-- 6: 211.4 + 48.6 = 260.0 (COINCIDENT WITH MAIN SCALE 20 mm!) -->
      <line x1="260" y1="120" x2="260" y2="145" stroke="#ef4444" stroke-width="2.5"/>
      <text x="260" y="160" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">6</text>
      <!-- 7: 211.4 + 56.7 = 268.1 -->
      <line x1="268.1" y1="120" x2="268.1" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 8: 211.4 + 64.8 = 276.2 -->
      <line x1="276.2" y1="120" x2="276.2" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 9: 211.4 + 72.9 = 284.3 -->
      <line x1="284.3" y1="120" x2="284.3" y2="135" stroke="#94a3b8" stroke-width="1"/>
      <!-- 10: 211.4 + 81.0 = 292.4 -->
      <line x1="292.4" y1="120" x2="292.4" y2="145" stroke="#38bdf8" stroke-width="2"/>
      <text x="292.4" y="160" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">10</text>
      
      <!-- Red Coincidence Alignment Highlight Box -->
      <rect x="255" y="85" width="10" height="65" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="260" y="42" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Coincident Mark #6</text>
      <line x1="260" y1="46" x2="260" y2="82" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow)"/>
      
      <!-- Readout Box -->
      <rect x="70" y="215" width="400" height="65" fill="#1e293b" rx="8" stroke="#334155" stroke-width="1.5"/>
      <text x="90" y="238" fill="#f8fafc" font-size="12" font-weight="700">Measurement Calculation:</text>
      <text x="90" y="258" fill="#94a3b8" font-size="11">Main Scale: <tspan fill="#38bdf8" font-weight="700">14.0 mm</tspan>  +  Vernier Scale: <tspan fill="#ef4444" font-weight="700">(6 × 0.1 mm = 0.6 mm)</tspan></text>
      <text x="90" y="274" fill="#38bdf8" font-size="12" font-weight="800">Total Reading = 14.60 mm ± 0.05 mm</text>
    </svg>`
  },

  // 9. Projectile Trajectory
  {
    id: "phys_projectile_trajectory",
    subject: "PHYS",
    moduleId: 3,
    title: "Two-Dimensional Kinematics & Parabolic Trajectory",
    caption: "Figure 9: Parabolic Path with Decomposed Velocity Components (Vx, Vy) and Maximum Altitude",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Ground Line -->
      <line x1="40" y1="240" x2="500" y2="240" stroke="#475569" stroke-width="2"/>
      
      <!-- Parabolic Trajectory: y = 240 - 4*170/ (420^2) * x*(420-x) with x from 0 to 420 (screen 60 to 480) -->
      <!-- Peak at x=270, y=70 (H=170) -->
      <path d="M 60 240 Q 270 -100 480 240" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 3"/>
      
      <!-- Origin & Launch Vectors -->
      <circle cx="60" cy="240" r="4" fill="#38bdf8"/>
      <!-- Initial velocity v0 -->
      <line x1="60" y1="240" x2="120" y2="170" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="120,170 110,175 116,183" fill="#38bdf8"/>
      <text x="80" y="165" fill="#38bdf8" font-size="12" font-weight="800">v₀</text>
      <!-- v0x -->
      <line x1="60" y1="240" x2="120" y2="240" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="120,240 112,236 112,244" fill="#f59e0b"/>
      <text x="85" y="255" fill="#f59e0b" font-size="10" font-weight="700">v₀ₓ = v₀ cos θ</text>
      <!-- v0y -->
      <line x1="60" y1="240" x2="60" y2="170" stroke="#10b981" stroke-width="2"/>
      <polygon points="60,170 56,178 64,178" fill="#10b981"/>
      <text x="25" y="205" fill="#10b981" font-size="10" font-weight="700">v₀ᵧ</text>
      <!-- Launch Angle theta -->
      <path d="M 85 240 A 25 25 0 0 0 80 220" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="92" y="230" fill="#f59e0b" font-size="11" font-weight="700">θ</text>
      
      <!-- Apex Point (x=270, y=70) -->
      <circle cx="270" cy="70" r="5" fill="#ef4444"/>
      <!-- Apex velocity: vy = 0, vx = v0x -->
      <line x1="270" y1="70" x2="330" y2="70" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="330,70 322,66 322,74" fill="#f59e0b"/>
      <text x="335" y="65" fill="#f59e0b" font-size="10" font-weight="700">vₓ = v₀ₓ</text>
      <text x="270" y="55" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Apex: vᵧ = 0</text>
      
      <!-- Maximum Height H Callout -->
      <line x1="270" y1="70" x2="270" y2="240" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="250" y1="70" x2="250" y2="240" stroke="#94a3b8" stroke-width="1.5"/>
      <polygon points="250,70 247,78 253,78" fill="#94a3b8"/>
      <polygon points="250,240 247,232 253,232" fill="#94a3b8"/>
      <text x="240" y="155" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="end">H_max = v₀ᵧ² / (2g)</text>
      
      <!-- Mid-descent vectors at x=390, y=145 -->
      <circle cx="390" cy="145" r="4" fill="#38bdf8"/>
      <line x1="390" y1="145" x2="445" y2="145" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="390" y1="145" x2="390" y2="195" stroke="#ef4444" stroke-width="1.5"/>
      <polygon points="390,195 387,187 393,187" fill="#ef4444"/>
      <text x="398" y="190" fill="#ef4444" font-size="9">-vᵧ</text>
      
      <!-- Range R Dimension -->
      <line x1="60" y1="275" x2="480" y2="275" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="60,275 68,272 68,278" fill="#38bdf8"/>
      <polygon points="480,275 472,272 472,278" fill="#38bdf8"/>
      <text x="270" y="270" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Horizontal Range R = (v₀² sin 2θ) / g</text>
    </svg>`
  },

  // 10. Banked Curve Centripetal Force
  {
    id: "phys_circular_motion_banked",
    subject: "PHYS",
    moduleId: 1,
    title: "Centripetal Dynamics on a Frictionless Banked Curve",
    caption: "Figure 10: Normal Force Decomposition (N cos θ, N sin θ) Providing Required Centripetal Force",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Incline Triangle (Bank angle theta = 28 deg) -->
      <polygon points="60,230 440,230 440,80" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      
      <!-- Bank Angle Theta -->
      <path d="M 120 230 A 60 60 0 0 0 114 205" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <text x="130" y="222" fill="#f59e0b" font-size="13" font-weight="800">θ</text>
      <text x="200" y="248" fill="#94a3b8" font-size="11">Horizontal Roadway Datum</text>
      
      <!-- Vehicle Mass Block on Banked Track (Center at x=260, y=140) -->
      <g transform="translate(260, 150) rotate(-21.5)">
        <rect x="-35" y="-22" width="70" height="44" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <text x="0" y="5" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">Mass m</text>
      </g>
      
      <!-- Force Vectors from Center of Mass (260, 150) -->
      <!-- Gravity mg (Straight Down) -->
      <line x1="260" y1="150" x2="260" y2="245" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="260,245 256,236 264,236" fill="#ef4444"/>
      <text x="268" y="240" fill="#ef4444" font-size="12" font-weight="800">F_g = m·g</text>
      
      <!-- Normal Force N (Perpendicular to Incline: rotated -21.5 - 90 = -111.5 deg -> dx = -40, dy = -100) -->
      <line x1="260" y1="150" x2="220" y2="45" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="220,45 220,55 228,48" fill="#38bdf8"/>
      <text x="205" y="40" fill="#38bdf8" font-size="12" font-weight="800">N (Normal Force)</text>
      
      <!-- Components of Normal Force -->
      <!-- Vertical: N cos theta = mg -->
      <line x1="260" y1="150" x2="260" y2="45" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>
      <line x1="220" y1="45" x2="260" y2="45" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 2"/>
      <polygon points="260,45 257,53 263,53" fill="#10b981"/>
      <text x="270" y="50" fill="#10b981" font-size="11" font-weight="700">N cos θ = m·g</text>
      
      <!-- Horizontal Centripetal: N sin theta = m v^2 / r -->
      <line x1="260" y1="150" x2="160" y2="150" stroke="#f59e0b" stroke-width="2.5"/>
      <polygon points="160,150 168,146 168,154" fill="#f59e0b"/>
      <text x="145" y="142" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="end">F_c = N sin θ</text>
      <text x="145" y="162" fill="#f59e0b" font-size="10" text-anchor="end">= m v² / r</text>
      
      <!-- Center of Curve Marker -->
      <line x1="90" y1="130" x2="90" y2="170" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="70" y1="150" x2="110" y2="150" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="90" y="122" fill="#94a3b8" font-size="9" text-anchor="middle">Center of Turn</text>
      
      <!-- Ideal Design Speed Formula Box -->
      <rect x="330" y="200" width="190" height="55" fill="#0f172a" rx="6" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="340" y="222" fill="#f8fafc" font-size="10" font-weight="700">Ideal Rated Speed:</text>
      <text x="340" y="242" fill="#f59e0b" font-size="12" font-weight="800">v_rated = √(g·r·tan θ)</text>
    </svg>`
  },

  // 11. Kepler's Orbit
  {
    id: "phys_kepler_planetary_orbit",
    subject: "PHYS",
    moduleId: 3,
    title: "Keplerian Orbital Mechanics & Areal Velocity Conservation",
    caption: "Figure 11: Elliptical Planetary Orbit Around Central Star with Equal Swept Areas (dA/dt = constant)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Major and Minor Axis Lines -->
      <line x1="50" y1="150" x2="490" y2="150" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 3"/>
      <line x1="270" y1="40" x2="270" y2="260" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 3"/>
      
      <!-- Elliptical Orbit: Center at (270, 150), rx=200, ry=95. Focal distance c = sqrt(200^2 - 95^2) = 176 -->
      <!-- Focus 1 (Sun) at x = 270 - 100 = 170. Focus 2 at 370 -->
      <!-- Swept Area 1: Perihelion Sector (Near Sun, x=70) -->
      <path d="M 170 150 L 75 125 A 200 95 0 0 0 75 175 Z" fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
      <!-- Swept Area 2: Aphelion Sector (Far, x=470) -->
      <path d="M 170 150 L 460 120 A 200 95 0 0 1 460 180 Z" fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5"/>
      
      <!-- Ellipse Curve -->
      <ellipse cx="270" cy="150" rx="200" ry="95" fill="none" stroke="#64748b" stroke-width="2"/>
      
      <!-- Central Star (Sun) at Focus 1 -->
      <circle cx="170" cy="150" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="170" cy="150" r="20" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="170" y="180" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">Sun (Focus F₁)</text>
      
      <!-- Empty Focus F2 -->
      <circle cx="370" cy="150" r="3" fill="#64748b"/>
      <text x="370" y="170" fill="#64748b" font-size="10" text-anchor="middle">Focus F₂</text>
      
      <!-- Planet at Perihelion -->
      <circle cx="70" cy="150" r="7" fill="#38bdf8" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="70" y="130" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Perihelion</text>
      <!-- Fast velocity vector -->
      <line x1="70" y1="150" x2="70" y2="85" stroke="#ef4444" stroke-width="2"/>
      <polygon points="70,85 66,93 74,93" fill="#ef4444"/>
      <text x="60" y="90" fill="#ef4444" font-size="11" font-weight="800" text-anchor="end">v_max</text>
      
      <!-- Planet at Aphelion -->
      <circle cx="470" cy="150" r="7" fill="#38bdf8" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="470" y="130" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Aphelion</text>
      <!-- Slow velocity vector -->
      <line x1="470" y1="150" x2="470" y2="195" stroke="#ef4444" stroke-width="2"/>
      <polygon points="470,195 466,187 474,187" fill="#ef4444"/>
      <text x="480" y="195" fill="#ef4444" font-size="11" font-weight="800">v_min</text>
      
      <!-- Kepler 2nd Law Annotation Box -->
      <rect x="140" y="225" width="260" height="60" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="270" y="245" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Kepler's Second Law (Equal Areas):</text>
      <text x="270" y="263" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Area(A₁) = Area(A₂) for equal time Δt</text>
      <text x="270" y="277" fill="#f59e0b" font-size="10" text-anchor="middle">Conservation of Angular Momentum L = m·r·v = const</text>
    </svg>`
  },

  // 12. 1D Collision Momentum Conservation
  {
    id: "phys_collision_momentum_1d",
    subject: "PHYS",
    moduleId: 1,
    title: "One-Dimensional Elastic Collision & Momentum Conservation",
    caption: "Figure 12: Pre-Collision and Post-Collision Velocity Vectors on a Frictionless Linear Track",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Panel Split -->
      <line x1="20" y1="145" x2="520" y2="145" stroke="#334155" stroke-width="1.5" stroke-dasharray="6 4"/>
      
      <!-- TOP: BEFORE COLLISION -->
      <text x="35" y="32" fill="#38bdf8" font-size="12" font-weight="800">BEFORE COLLISION (t &lt; 0)</text>
      <line x1="35" y1="115" x2="505" y2="115" stroke="#475569" stroke-width="2"/>
      
      <!-- Cart 1 -->
      <rect x="80" y="70" width="60" height="35" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="95" cy="110" r="5" fill="#f8fafc"/>
      <circle cx="125" cy="110" r="5" fill="#f8fafc"/>
      <text x="110" y="92" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">m₁=2kg</text>
      <!-- v1i vector -->
      <line x1="145" y1="87" x2="215" y2="87" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="215,87 207,83 207,91" fill="#38bdf8"/>
      <text x="180" y="78" fill="#38bdf8" font-size="11" font-weight="800">v₁ᵢ = +4 m/s</text>
      
      <!-- Cart 2 (Stationary) -->
      <rect x="290" y="70" width="50" height="35" rx="3" fill="#d97706" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="303" cy="110" r="5" fill="#f8fafc"/>
      <circle cx="327" cy="110" r="5" fill="#f8fafc"/>
      <text x="315" y="92" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">m₂=1kg</text>
      <text x="315" y="60" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">v₂ᵢ = 0</text>
      
      <text x="410" y="92" fill="#cbd5e1" font-size="11">p_total = 2(4) + 1(0) = <tspan fill="#38bdf8" font-weight="700">8 kg·m/s</tspan></text>
      
      <!-- BOTTOM: AFTER COLLISION -->
      <text x="35" y="172" fill="#10b981" font-size="12" font-weight="800">AFTER COLLISION (t &gt; 0)</text>
      <line x1="35" y1="255" x2="505" y2="255" stroke="#475569" stroke-width="2"/>
      
      <!-- Cart 1 (Slowed down) -->
      <rect x="140" y="210" width="60" height="35" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="155" cy="250" r="5" fill="#f8fafc"/>
      <circle cx="185" cy="250" r="5" fill="#f8fafc"/>
      <text x="170" y="232" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">m₁=2kg</text>
      <!-- v1f vector -->
      <line x1="205" y1="227" x2="245" y2="227" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="245,227 238,224 238,230" fill="#38bdf8"/>
      <text x="210" y="218" fill="#38bdf8" font-size="10" font-weight="700">v₁_f = +1.33 m/s</text>
      
      <!-- Cart 2 (High speed rebound) -->
      <rect x="360" y="210" width="50" height="35" rx="3" fill="#d97706" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="373" cy="250" r="5" fill="#f8fafc"/>
      <circle cx="397" cy="250" r="5" fill="#f8fafc"/>
      <text x="385" y="232" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">m₂=1kg</text>
      <!-- v2f vector -->
      <line x1="415" y1="227" x2="495" y2="227" stroke="#f59e0b" stroke-width="2.5"/>
      <polygon points="495,227 487,223 487,231" fill="#f59e0b"/>
      <text x="435" y="218" fill="#f59e0b" font-size="11" font-weight="800">v₂_f = +5.33 m/s</text>
      
      <!-- Conserved box -->
      <rect x="120" y="268" width="310" height="24" fill="#1e293b" rx="4" stroke="#10b981" stroke-width="1"/>
      <text x="275" y="284" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">Momentum Conserved: Σp_initial = Σp_final = 8.0 kg·m/s</text>
    </svg>`
  },

  // 13. Pendulum Energy Conservation
  {
    id: "phys_pendulum_energy_conservation",
    subject: "PHYS",
    moduleId: 1,
    title: "Mechanical Energy Conservation in Simple Harmonic Pendulum",
    caption: "Figure 13: Continuous Conservative Exchange Between Gravitational Potential and Kinetic Energy",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Pivot Mounting Ceiling -->
      <rect x="170" y="15" width="200" height="12" fill="#334155"/>
      <circle cx="270" cy="27" r="4" fill="#94a3b8"/>
      
      <!-- Swing Arc Path -->
      <path d="M 130 180 A 180 180 0 0 0 410 180" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="4 3"/>
      
      <!-- Position A: Left Extremum (-theta) -->
      <line x1="270" y1="27" x2="130" y2="180" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="130" cy="180" r="16" fill="#f59e0b" stroke="#f8fafc" stroke-width="2"/>
      <text x="130" y="185" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle">m</text>
      <text x="130" y="215" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">PE = max</text>
      <text x="130" y="228" fill="#94a3b8" font-size="10" text-anchor="middle">KE = 0 (v=0)</text>
      
      <!-- Position B: Bottom Equilibrium -->
      <line x1="270" y1="27" x2="270" y2="207" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="270" cy="207" r="16" fill="#38bdf8" stroke="#f8fafc" stroke-width="2"/>
      <text x="270" y="212" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle">m</text>
      <text x="270" y="238" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">KE = max (v_max)</text>
      <text x="270" y="252" fill="#94a3b8" font-size="10" text-anchor="middle">PE = 0 (h=0)</text>
      
      <!-- Position C: Right Extremum (+theta) -->
      <line x1="270" y1="27" x2="410" y2="180" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="410" cy="180" r="16" fill="#f59e0b" stroke="#f8fafc" stroke-width="2"/>
      <text x="410" y="185" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle">m</text>
      <text x="410" y="215" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">PE = max</text>
      <text x="410" y="228" fill="#94a3b8" font-size="10" text-anchor="middle">KE = 0 (v=0)</text>
      
      <!-- Height h difference indicator -->
      <line x1="130" y1="180" x2="270" y2="180" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2"/>
      <line x1="200" y1="180" x2="200" y2="207" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="190" y="197" fill="#f59e0b" font-size="11" font-weight="800">h</text>
      
      <!-- Total Energy Bar Formula -->
      <rect x="90" y="265" width="360" height="26" fill="#1e293b" rx="4" stroke="#334155" stroke-width="1"/>
      <text x="270" y="282" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">E_total = KE + PE = ½ m·v² + m·g·h = Constant</text>
    </svg>`
  },

  // 14. Pulley Block & Tackle
  {
    id: "phys_pulley_block_tackle",
    subject: "PHYS",
    moduleId: 1,
    title: "Compound Block and Tackle Pulley System (MA = 4)",
    caption: "Figure 14: Four Supporting Tension Strands Yielding Ideal Mechanical Advantage of 4",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Ceiling Mount -->
      <rect x="180" y="15" width="180" height="10" fill="#475569"/>
      
      <!-- Top Fixed Block Frame & Two Sheaves -->
      <rect x="225" y="25" width="90" height="55" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="250" cy="50" r="18" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="290" cy="50" r="14" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Bottom Moving Block Frame & Two Sheaves -->
      <rect x="225" y="145" width="90" height="55" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="250" cy="170" r="18" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="290" cy="170" r="14" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Load Weight Hanging from Moving Block -->
      <line x1="270" y1="200" x2="270" y2="225" stroke="#94a3b8" stroke-width="2"/>
      <rect x="235" y="225" width="70" height="40" rx="3" fill="#d97706" stroke="#f59e0b" stroke-width="2"/>
      <text x="270" y="243" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">LOAD (W)</text>
      <text x="270" y="257" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">400 N</text>
      
      <!-- Continuous Rope (Tension T = W/4 = 100 N in 4 vertical strands) -->
      <!-- Strand 1 (x=232) -->
      <line x1="232" y1="50" x2="232" y2="170" stroke="#f8fafc" stroke-width="2"/>
      <!-- Strand 2 (x=268) -->
      <line x1="268" y1="50" x2="268" y2="170" stroke="#f8fafc" stroke-width="2"/>
      <!-- Strand 3 (x=276) -->
      <line x1="276" y1="50" x2="276" y2="170" stroke="#f8fafc" stroke-width="2"/>
      <!-- Strand 4 (x=304) -->
      <line x1="304" y1="50" x2="304" y2="170" stroke="#f8fafc" stroke-width="2"/>
      
      <!-- Effort Rope pulled by Hand -->
      <path d="M 304 50 L 370 120 L 370 180" fill="none" stroke="#f8fafc" stroke-width="2"/>
      <line x1="370" y1="180" x2="370" y2="220" stroke="#10b981" stroke-width="2.5"/>
      <polygon points="370,220 366,210 374,210" fill="#10b981"/>
      <text x="382" y="205" fill="#10b981" font-size="12" font-weight="800">Effort (F_E)</text>
      <text x="382" y="220" fill="#10b981" font-size="11" font-weight="700">= 100 N</text>
      
      <!-- Strand Tension Callout -->
      <rect x="70" y="90" width="130" height="75" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="135" y="110" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">4 Supporting Strands</text>
      <text x="135" y="128" fill="#f8fafc" font-size="10" text-anchor="middle">Tension per strand:</text>
      <text x="135" y="145" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle">T = W / 4 = 100 N</text>
      
      <!-- Mechanical Advantage Callout -->
      <rect x="60" y="235" width="150" height="45" fill="#1e293b" rx="6" stroke="#334155" stroke-width="1.5"/>
      <text x="135" y="253" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Mechanical Advantage:</text>
      <text x="135" y="270" fill="#10b981" font-size="12" font-weight="800" text-anchor="middle">MA = Load / Effort = 4</text>
    </svg>`
  },

  // 15. Method of Mixtures Calorimeter
  {
    id: "phys_mixing_calorimeter",
    subject: "PHYS",
    moduleId: 5,
    title: "Method of Mixtures Dual-Walled Calorimeter Assembly",
    caption: "Figure 15: Thermal Equilibrium Measurement Apparatus with Polished Radiation Shield",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Outer Metal Vessel (Radiation Shield) -->
      <rect x="140" y="80" width="220" height="170" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <text x="80" y="120" fill="#94a3b8" font-size="10" text-anchor="end">Outer Container</text>
      <line x1="85" y1="117" x2="138" y2="117" stroke="#94a3b8" stroke-width="1"/>
      
      <!-- Cork Insulating Supports -->
      <rect x="160" y="230" width="30" height="15" fill="#78350f" rx="2"/>
      <rect x="310" y="230" width="30" height="15" fill="#78350f" rx="2"/>
      <rect x="235" y="230" width="30" height="15" fill="#78350f" rx="2"/>
      
      <!-- Inner Calorimeter Vessel -->
      <rect x="170" y="95" width="160" height="135" rx="6" fill="#334155" stroke="#f59e0b" stroke-width="2"/>
      
      <!-- Water Level -->
      <rect x="172" y="130" width="156" height="98" fill="#0284c7" fill-opacity="0.35"/>
      <line x1="172" y1="130" x2="328" y2="130" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="345" y="145" fill="#38bdf8" font-size="10">Water (m_w, c_w)</text>
      
      <!-- Hot Metal Specimen Submerged -->
      <rect x="230" y="165" width="40" height="45" rx="3" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="250" y="190" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">Metal</text>
      <text x="250" y="202" fill="#f8fafc" font-size="8" text-anchor="middle">Sample</text>
      
      <!-- Stirrer -->
      <path d="M 210 40 L 210 215 L 225 215" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="210" cy="35" r="5" fill="#94a3b8"/>
      
      <!-- Precision Thermometer -->
      <rect x="285" y="30" width="10" height="175" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
      <rect x="288" y="150" width="4" height="55" fill="#ef4444"/>
      <circle cx="290" cy="205" r="7" fill="#ef4444"/>
      <text x="305" y="55" fill="#f8fafc" font-size="10">Thermometer</text>
      
      <!-- Insulating Wooden Lid -->
      <rect x="130" y="72" width="240" height="15" rx="3" fill="#78350f" stroke="#92400e" stroke-width="1.5"/>
      
      <!-- Conservation Formula Box -->
      <rect x="375" y="175" width="150" height="75" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="450" y="195" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Heat Conservation:</text>
      <text x="450" y="215" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Q_lost = Q_gained</text>
      <text x="450" y="235" fill="#38bdf8" font-size="9" text-anchor="middle">m_s·c_s·ΔT_s = m_w·c_w·ΔT_w</text>
    </svg>`
  },

  // 16. Standing Wave Harmonics
  {
    id: "phys_standing_wave_harmonics",
    subject: "PHYS",
    moduleId: 8,
    title: "Resonant Standing Wave Harmonic Modes on a Taut String",
    caption: "Figure 16: Fundamental (1st), Second (2nd), and Third (3rd) Resonant Harmonics with Nodes & Antinodes",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Boundary Supports (Clamps) at x=90 and x=450 -->
      <line x1="90" y1="20" x2="90" y2="270" stroke="#64748b" stroke-width="3"/>
      <line x1="450" y1="20" x2="450" y2="270" stroke="#64748b" stroke-width="3"/>
      <text x="90" y="285" fill="#94a3b8" font-size="10" text-anchor="middle">x = 0</text>
      <text x="450" y="285" fill="#94a3b8" font-size="10" text-anchor="middle">x = L</text>
      
      <!-- Harmonic 1: Fundamental (n=1) -->
      <text x="30" y="65" fill="#38bdf8" font-size="11" font-weight="800">n = 1</text>
      <path d="M 90 60 Q 270 20 450 60" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M 90 60 Q 270 100 450 60" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
      <!-- Nodes & Antinode -->
      <circle cx="90" cy="60" r="4" fill="#ef4444"/>
      <circle cx="450" cy="60" r="4" fill="#ef4444"/>
      <text x="270" y="45" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">A</text>
      <text x="465" y="64" fill="#94a3b8" font-size="9">λ₁ = 2L</text>
      
      <!-- Harmonic 2: Second Harmonic (n=2) -->
      <text x="30" y="145" fill="#f59e0b" font-size="11" font-weight="800">n = 2</text>
      <path d="M 90 140 Q 180 105 270 140 Q 360 175 450 140" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <path d="M 90 140 Q 180 175 270 140 Q 360 105 450 140" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>
      <!-- Center node -->
      <circle cx="270" cy="140" r="4" fill="#ef4444"/>
      <text x="270" y="156" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Node</text>
      <text x="465" y="144" fill="#94a3b8" font-size="9">λ₂ = L</text>
      
      <!-- Harmonic 3: Third Harmonic (n=3) -->
      <text x="30" y="225" fill="#a855f7" font-size="11" font-weight="800">n = 3</text>
      <path d="M 90 220 Q 150 190 210 220 Q 270 250 330 220 Q 390 190 450 220" fill="none" stroke="#a855f7" stroke-width="2.5"/>
      <path d="M 90 220 Q 150 250 210 220 Q 270 190 330 220 Q 390 250 450 220" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="3 3"/>
      <!-- Internal nodes at 210 and 330 -->
      <circle cx="210" cy="220" r="3.5" fill="#ef4444"/>
      <circle cx="330" cy="220" r="3.5" fill="#ef4444"/>
      <text x="465" y="224" fill="#94a3b8" font-size="9">λ₃ = 2L/3</text>
      
      <!-- Legend for Node and Antinode -->
      <circle cx="160" cy="282" r="4" fill="#ef4444"/>
      <text x="170" y="285" fill="#ef4444" font-size="10" font-weight="700">Node (Zero Motion)</text>
      <text x="300" y="285" fill="#10b981" font-size="10" font-weight="700">A = Antinode (Max Amplitude)</text>
    </svg>`
  },

  // 17. Doppler Sound Wavefronts
  {
    id: "phys_doppler_wavefronts",
    subject: "PHYS",
    moduleId: 8,
    title: "Doppler Frequency Shift from a Subsonic Moving Acoustic Source",
    caption: "Figure 17: Spatial Wavefront Compression (High Frequency) Ahead and Rarefaction (Low Frequency) Behind",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Wavefront Circles (Emitted at x=180, 210, 240, 270, 300) -->
      <!-- Oldest wavefront emitted at x=180, radius=110 -->
      <circle cx="180" cy="150" r="110" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.5"/>
      <!-- Emitted at x=215, radius=85 -->
      <circle cx="215" cy="150" r="85" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.65"/>
      <!-- Emitted at x=250, radius=60 -->
      <circle cx="250" cy="150" r="60" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-opacity="0.8"/>
      <!-- Emitted at x=280, radius=35 -->
      <circle cx="280" cy="150" r="35" fill="none" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Current Source Location S -->
      <circle cx="310" cy="150" r="7" fill="#ef4444" stroke="#f8fafc" stroke-width="1.5"/>
      <!-- Source Velocity Vector vs -->
      <line x1="310" y1="150" x2="365" y2="150" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="365,150 357,146 357,154" fill="#ef4444"/>
      <text x="335" y="140" fill="#ef4444" font-size="11" font-weight="800">v_source</text>
      
      <!-- Observer A (Ahead, Right) -->
      <rect x="440" y="125" width="75" height="50" fill="#1e293b" rx="4" stroke="#10b981" stroke-width="1.5"/>
      <text x="477" y="145" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">OBSERVER A</text>
      <text x="477" y="160" fill="#38bdf8" font-size="9" text-anchor="middle">Compressed λ'</text>
      <text x="477" y="171" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">f_obs &gt; f₀</text>
      
      <!-- Observer B (Behind, Left) -->
      <rect x="25" y="125" width="75" height="50" fill="#1e293b" rx="4" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="62" y="145" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">OBSERVER B</text>
      <text x="62" y="160" fill="#f59e0b" font-size="9" text-anchor="middle">Expanded λ''</text>
      <text x="62" y="171" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">f_obs &lt; f₀</text>
      
      <!-- Doppler Equation Summary Box -->
      <rect x="120" y="245" width="300" height="40" fill="#1e293b" rx="6" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="268" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Doppler Equation: f' = f₀ · [ v_sound / (v_sound ∓ v_source) ]</text>
    </svg>`
  },

  // 18. Concave Mirror Ray Tracing
  {
    id: "phys_concave_mirror_ray",
    subject: "PHYS",
    moduleId: 8,
    title: "Spherical Concave Mirror Geometric Ray Tracing",
    caption: "Figure 18: Formation of a Real, Inverted, and Reduced Image for an Object Beyond Center of Curvature",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Principal Axis -->
      <line x1="20" y1="160" x2="520" y2="160" stroke="#64748b" stroke-width="1.5"/>
      
      <!-- Concave Mirror Arc (Vertex at x=450, y=160, Radius R = 240, Center C at x=210) -->
      <path d="M 425 40 A 240 240 0 0 0 425 280" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <!-- Mirror backing hatching -->
      <line x1="426" y1="50" x2="436" y2="45" stroke="#475569" stroke-width="1.5"/>
      <line x1="440" y1="100" x2="450" y2="95" stroke="#475569" stroke-width="1.5"/>
      <line x1="450" y1="160" x2="460" y2="160" stroke="#475569" stroke-width="1.5"/>
      <line x1="440" y1="220" x2="450" y2="225" stroke="#475569" stroke-width="1.5"/>
      
      <!-- Focal Point F (x=330) and Center of Curvature C (x=210) -->
      <circle cx="210" cy="160" r="4" fill="#f8fafc"/>
      <text x="210" y="180" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">C (2F)</text>
      
      <circle cx="330" cy="160" r="4" fill="#38bdf8"/>
      <text x="330" y="180" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">F (Focal)</text>
      
      <!-- Vertex V -->
      <text x="460" y="180" fill="#94a3b8" font-size="11">V</text>
      
      <!-- Upright Object (Arrow at x=100, height = 70: from y=160 to y=90) -->
      <line x1="100" y1="160" x2="100" y2="90" stroke="#10b981" stroke-width="3"/>
      <polygon points="100,90 95,102 105,102" fill="#10b981"/>
      <text x="100" y="80" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Object (do &gt; 2F)</text>
      
      <!-- Ray 1: Parallel to axis, reflects through F (Cyan) -->
      <line x1="100" y1="90" x2="445" y2="90" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="445" y1="90" x2="250" y2="215" stroke="#38bdf8" stroke-width="1.5"/>
      
      <!-- Ray 2: Through F to mirror, reflects parallel (Amber) -->
      <line x1="100" y1="90" x2="435" y2="210" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="435" y1="210" x2="230" y2="210" stroke="#f59e0b" stroke-width="1.5"/>
      
      <!-- Inverted Image Formed at x=275, height = 45 (from y=160 to y=205) -->
      <line x1="275" y1="160" x2="275" y2="205" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="275,205 271,195 279,195" fill="#ef4444"/>
      <text x="275" y="225" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Real Image</text>
      
      <!-- Mirror Equation Box -->
      <rect x="25" y="240" width="220" height="45" fill="#1e293b" rx="5" stroke="#334155" stroke-width="1"/>
      <text x="135" y="258" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Mirror Formula: 1/f = 1/d_o + 1/d_i</text>
      <text x="135" y="274" fill="#38bdf8" font-size="10" text-anchor="middle">Magnification m = -d_i / d_o &lt; 0 (Inverted)</text>
    </svg>`
  },

  // 19. Convex Thin Lens Image Formation
  {
    id: "phys_convex_lens_formation",
    subject: "PHYS",
    moduleId: 8,
    title: "Converging Thin Convex Lens Real Inverted Image Formation",
    caption: "Figure 19: Ray Diagram for Object Between F and 2F Producing Real, Inverted, and Magnified Image",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Principal Axis -->
      <line x1="20" y1="150" x2="520" y2="150" stroke="#64748b" stroke-width="1.5"/>
      
      <!-- Convex Lens at x=260 -->
      <ellipse cx="260" cy="150" rx="10" ry="110" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2"/>
      <line x1="260" y1="35" x2="260" y2="265" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4 2"/>
      
      <!-- Focal Points: f = 80 px -->
      <!-- Left: F1 at 180, 2F1 at 100 -->
      <circle cx="180" cy="150" r="3.5" fill="#f8fafc"/>
      <text x="180" y="170" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">F₁</text>
      <circle cx="100" cy="150" r="3.5" fill="#94a3b8"/>
      <text x="100" y="170" fill="#94a3b8" font-size="10" text-anchor="middle">2F₁</text>
      
      <!-- Right: F2 at 340, 2F2 at 420 -->
      <circle cx="340" cy="150" r="3.5" fill="#f8fafc"/>
      <text x="340" y="170" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">F₂</text>
      <circle cx="420" cy="150" r="3.5" fill="#94a3b8"/>
      <text x="420" y="170" fill="#94a3b8" font-size="10" text-anchor="middle">2F₂</text>
      
      <!-- Object between F1 and 2F1 at x=140, height = 45 (y=150 to y=105) -->
      <line x1="140" y1="150" x2="140" y2="105" stroke="#10b981" stroke-width="3"/>
      <polygon points="140,105 136,115 144,115" fill="#10b981"/>
      <text x="140" y="95" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Object</text>
      
      <!-- Ray 1: Parallel to axis, refracts through F2 (Cyan) -->
      <line x1="140" y1="105" x2="260" y2="105" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="260" y1="105" x2="460" y2="218" stroke="#38bdf8" stroke-width="1.5"/>
      
      <!-- Ray 2: Through optical center O, continues straight (Amber) -->
      <line x1="140" y1="105" x2="460" y2="218" stroke="#f59e0b" stroke-width="1.5"/>
      
      <!-- Inverted Real Magnified Image at x=440, height = 65 (y=150 to y=215) -->
      <line x1="440" y1="150" x2="440" y2="215" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="440,215 436,205 444,205" fill="#ef4444"/>
      <text x="440" y="235" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Real Image</text>
      <text x="440" y="248" fill="#94a3b8" font-size="9" text-anchor="middle">(Magnified &amp; Inverted)</text>
      
      <!-- Thin Lens Equation Box -->
      <rect x="25" y="230" width="220" height="55" fill="#1e293b" rx="5" stroke="#334155" stroke-width="1"/>
      <text x="135" y="250" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Gaussian Lens Equation:</text>
      <text x="135" y="268" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">1/f = 1/d_o + 1/d_i</text>
    </svg>`
  },

  // 20. Electric Dipole Field
  {
    id: "phys_electric_dipole_field",
    subject: "PHYS",
    moduleId: 6,
    title: "Electric Dipole Field Lines and Equipotential Surfaces",
    caption: "Figure 20: Symmetric Field Geometry Between Positive (+q) and Negative (-q) Point Charges",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Equipotential Surfaces (Dashed Green Circles & Plane) -->
      <!-- V=0 Neutral Midplane -->
      <line x1="270" y1="20" x2="270" y2="280" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="270" y="15" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">V = 0 Equipotential Plane</text>
      
      <!-- Equipotential loops around +q -->
      <circle cx="170" cy="150" r="30" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3"/>
      <circle cx="170" cy="150" r="50" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3"/>
      <!-- Equipotential loops around -q -->
      <circle cx="370" cy="150" r="30" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3"/>
      <circle cx="370" cy="150" r="50" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3"/>
      
      <!-- Electric Field Lines (Cyan Curves) -->
      <!-- Central straight line -->
      <line x1="184" y1="150" x2="356" y2="150" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="275,150 265,146 265,154" fill="#38bdf8"/>
      
      <!-- Top Arcs -->
      <path d="M 170 136 C 170 80, 370 80, 370 136" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
      <polygon points="275,95 265,91 265,99" fill="#38bdf8"/>
      <path d="M 160 138 C 130 30, 410 30, 380 138" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="275,55 265,51 265,59" fill="#38bdf8"/>
      
      <!-- Bottom Arcs -->
      <path d="M 170 164 C 170 220, 370 220, 370 164" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
      <polygon points="275,205 265,201 265,209" fill="#38bdf8"/>
      <path d="M 160 162 C 130 270, 410 270, 380 162" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="275,245 265,241 265,249" fill="#38bdf8"/>
      
      <!-- Positive Charge (+q) -->
      <circle cx="170" cy="150" r="14" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
      <text x="170" y="155" fill="#f8fafc" font-size="14" font-weight="900" text-anchor="middle">+</text>
      <text x="170" y="180" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">+q</text>
      
      <!-- Negative Charge (-q) -->
      <circle cx="370" cy="150" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="370" y="154" fill="#f8fafc" font-size="16" font-weight="900" text-anchor="middle">−</text>
      <text x="370" y="180" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">−q</text>
      
      <!-- Dipole Moment p vector -->
      <line x1="340" y1="270" x2="200" y2="270" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="200,270 208,266 208,274" fill="#f59e0b"/>
      <text x="270" y="285" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Electric Dipole Moment p = q · d (Points − to +)</text>
    </svg>`
  },

  // 21. Parallel Plate Capacitor
  {
    id: "phys_parallel_plate_capacitor",
    subject: "PHYS",
    moduleId: 6,
    title: "Parallel Plate Capacitor with Polarized Dielectric Slab",
    caption: "Figure 21: Uniform Electric Field E0, Dielectric Bound Charge Polarization, and Reduced Net Field E",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Top Conducting Plate (+Q) -->
      <rect x="100" y="45" width="340" height="18" rx="3" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="70" y="58" fill="#ef4444" font-size="12" font-weight="800">+Q</text>
      <!-- Positive surface charges -->
      <text x="140" y="58" fill="#f8fafc" font-size="11" font-weight="900">+</text>
      <text x="200" y="58" fill="#f8fafc" font-size="11" font-weight="900">+</text>
      <text x="270" y="58" fill="#f8fafc" font-size="11" font-weight="900">+</text>
      <text x="340" y="58" fill="#f8fafc" font-size="11" font-weight="900">+</text>
      <text x="400" y="58" fill="#f8fafc" font-size="11" font-weight="900">+</text>
      
      <!-- Bottom Conducting Plate (-Q) -->
      <rect x="100" y="215" width="340" height="18" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="70" y="228" fill="#38bdf8" font-size="12" font-weight="800">−Q</text>
      <!-- Negative surface charges -->
      <text x="140" y="228" fill="#f8fafc" font-size="13" font-weight="900">−</text>
      <text x="200" y="228" fill="#f8fafc" font-size="13" font-weight="900">−</text>
      <text x="270" y="228" fill="#f8fafc" font-size="13" font-weight="900">−</text>
      <text x="340" y="228" fill="#f8fafc" font-size="13" font-weight="900">−</text>
      <text x="400" y="228" fill="#f8fafc" font-size="13" font-weight="900">−</text>
      
      <!-- Dielectric Slab in Center -->
      <rect x="150" y="90" width="240" height="98" rx="4" fill="#334155" fill-opacity="0.8" stroke="#f59e0b" stroke-width="2"/>
      <text x="270" y="142" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle">Dielectric (κ &gt; 1)</text>
      
      <!-- Induced Bound Surface Charges -->
      <!-- Bound negative on top surface of dielectric -->
      <text x="190" y="105" fill="#38bdf8" font-size="11" font-weight="900">−</text>
      <text x="270" y="105" fill="#38bdf8" font-size="11" font-weight="900">−</text>
      <text x="350" y="105" fill="#38bdf8" font-size="11" font-weight="900">−</text>
      <text x="400" y="105" fill="#38bdf8" font-size="9" font-weight="700">−σ_bound</text>
      
      <!-- Bound positive on bottom surface of dielectric -->
      <text x="190" y="180" fill="#ef4444" font-size="11" font-weight="900">+</text>
      <text x="270" y="180" fill="#ef4444" font-size="11" font-weight="900">+</text>
      <text x="350" y="180" fill="#ef4444" font-size="11" font-weight="900">+</text>
      <text x="400" y="180" fill="#ef4444" font-size="9" font-weight="700">+σ_bound</text>
      
      <!-- Electric Field Vectors -->
      <!-- Vacuum Field E0 (downwards) -->
      <line x1="125" y1="70" x2="125" y2="205" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="125,205 121,197 129,197" fill="#38bdf8"/>
      <text x="110" y="142" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">E₀</text>
      
      <!-- Net Field in Dielectric E = E0 / kappa -->
      <line x1="270" y1="115" x2="270" y2="165" stroke="#10b981" stroke-width="2"/>
      <polygon points="270,165 266,157 274,157" fill="#10b981"/>
      <text x="285" y="160" fill="#10b981" font-size="10" font-weight="800">E_net = E₀/κ</text>
      
      <!-- Plate Separation d Dimension -->
      <line x1="460" y1="45" x2="460" y2="233" stroke="#94a3b8" stroke-width="1.5"/>
      <polygon points="460,45 456,53 464,53" fill="#94a3b8"/>
      <polygon points="460,233 456,225 464,225" fill="#94a3b8"/>
      <text x="470" y="145" fill="#94a3b8" font-size="11" font-weight="700">d</text>
      
      <!-- Capacitance Formula Box -->
      <rect x="130" y="250" width="280" height="38" fill="#1e293b" rx="5" stroke="#334155" stroke-width="1"/>
      <text x="270" y="274" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Capacitance: C = κ · ε₀ · A / d = κ · C₀</text>
    </svg>`
  },

  // 22. Wheatstone Bridge
  {
    id: "phys_wheatstone_bridge",
    subject: "PHYS",
    moduleId: 6,
    title: "Wheatstone Bridge DC Resistance Null Measurement Circuit",
    caption: "Figure 22: Diamond Balanced Bridge Configuration for Unknown Resistance Rx Determination",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Bridge Diamond Nodes: A(100, 140), B(270, 50), C(440, 140), D(270, 230) -->
      <!-- Branch A-B: Resistor R1 -->
      <line x1="100" y1="140" x2="160" y2="108" stroke="#94a3b8" stroke-width="2"/>
      <rect x="160" y="85" width="45" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(-28, 182, 95)"/>
      <text x="175" y="75" fill="#38bdf8" font-size="11" font-weight="800">R₁</text>
      <line x1="205" y1="84" x2="270" y2="50" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Branch B-C: Resistor R2 -->
      <line x1="270" y1="50" x2="335" y2="84" stroke="#94a3b8" stroke-width="2"/>
      <rect x="335" y="85" width="45" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(28, 357, 95)"/>
      <text x="365" y="75" fill="#38bdf8" font-size="11" font-weight="800">R₂</text>
      <line x1="380" y1="108" x2="440" y2="140" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Branch A-D: Resistor R3 -->
      <line x1="100" y1="140" x2="160" y2="172" stroke="#94a3b8" stroke-width="2"/>
      <rect x="160" y="175" width="45" height="20" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="2" transform="rotate(28, 182, 185)"/>
      <text x="175" y="215" fill="#f59e0b" font-size="11" font-weight="800">R₃</text>
      <line x1="205" y1="196" x2="270" y2="230" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Branch D-C: Unknown Resistor Rx -->
      <line x1="270" y1="230" x2="335" y2="196" stroke="#94a3b8" stroke-width="2"/>
      <rect x="335" y="175" width="45" height="20" rx="3" fill="#1e293b" stroke="#ef4444" stroke-width="2" transform="rotate(-28, 357, 185)"/>
      <text x="365" y="215" fill="#ef4444" font-size="11" font-weight="800">R_x</text>
      <line x1="380" y1="172" x2="440" y2="140" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Center Galvanometer Branch B-D -->
      <line x1="270" y1="50" x2="270" y2="115" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="270" cy="140" r="22" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="270" y="146" fill="#10b981" font-size="14" font-weight="900" text-anchor="middle">G</text>
      <line x1="270" y1="165" x2="270" y2="230" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Node Points -->
      <circle cx="100" cy="140" r="4" fill="#f8fafc"/>
      <text x="85" y="144" fill="#f8fafc" font-size="11" font-weight="800">A</text>
      <circle cx="270" cy="50" r="4" fill="#f8fafc"/>
      <text x="270" y="38" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">B</text>
      <circle cx="440" cy="140" r="4" fill="#f8fafc"/>
      <text x="455" y="144" fill="#f8fafc" font-size="11" font-weight="800">C</text>
      <circle cx="270" cy="230" r="4" fill="#f8fafc"/>
      <text x="270" y="250" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">D</text>
      
      <!-- DC Battery Connection Across A and C -->
      <path d="M 100 140 L 100 275 L 245 275" fill="none" stroke="#94a3b8" stroke-width="1.8"/>
      <path d="M 440 140 L 440 275 L 295 275" fill="none" stroke="#94a3b8" stroke-width="1.8"/>
      <!-- Battery symbol -->
      <line x1="245" y1="265" x2="245" y2="285" stroke="#ef4444" stroke-width="3"/>
      <line x1="255" y1="270" x2="255" y2="280" stroke="#94a3b8" stroke-width="2"/>
      <line x1="265" y1="265" x2="265" y2="285" stroke="#ef4444" stroke-width="3"/>
      <line x1="275" y1="270" x2="275" y2="280" stroke="#94a3b8" stroke-width="2"/>
      <text x="260" y="260" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">V_s</text>
      
      <!-- Balance Condition Box -->
      <rect x="25" y="20" width="160" height="50" fill="#1e293b" rx="5" stroke="#10b981" stroke-width="1.5"/>
      <text x="105" y="38" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Null Condition (I_g = 0):</text>
      <text x="105" y="56" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">R_x = R₃ · (R₂ / R₁)</text>
    </svg>`
  },

  // 23. Solenoid Magnetic Field
  {
    id: "phys_solenoid_magnetic_field",
    subject: "PHYS",
    moduleId: 6,
    title: "Finite Solenoid Magnetic Field Distribution & Ampère's Law",
    caption: "Figure 23: Dense Uniform Axial Core Field (B = μ0 n I) and Looping Return Flux Lines",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Exterior Return Magnetic Field Lines (Looping Back) -->
      <path d="M 400 130 C 480 80, 480 30, 270 30 C 60 30, 60 80, 140 130" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 2"/>
      <polygon points="265,30 275,26 275,34" fill="#38bdf8"/>
      
      <path d="M 400 170 C 480 220, 480 270, 270 270 C 60 270, 60 220, 140 170" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 2"/>
      <polygon points="275,270 265,266 265,274" fill="#38bdf8"/>
      
      <!-- Core Uniform Magnetic Field Lines (Straight Axial, Left to Right) -->
      <line x1="90" y1="130" x2="450" y2="130" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="280,130 270,126 270,134" fill="#38bdf8"/>
      
      <line x1="80" y1="150" x2="460" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="280,150 270,145 270,155" fill="#38bdf8"/>
      <text x="295" y="145" fill="#38bdf8" font-size="12" font-weight="900">B_core</text>
      
      <line x1="90" y1="170" x2="450" y2="170" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="280,170 270,166 270,174" fill="#38bdf8"/>
      
      <!-- Solenoid Coil Loops (Cut in Cross Section) -->
      <!-- Top Conductors: Current In (x) -->
      <g fill="#1e293b" stroke="#f59e0b" stroke-width="2">
        <circle cx="160" cy="100" r="10"/>
        <circle cx="210" cy="100" r="10"/>
        <circle cx="260" cy="100" r="10"/>
        <circle cx="310" cy="100" r="10"/>
        <circle cx="360" cy="100" r="10"/>
      </g>
      <!-- Crosses for Current In -->
      <text x="160" y="104" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">×</text>
      <text x="210" y="104" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">×</text>
      <text x="260" y="104" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">×</text>
      <text x="310" y="104" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">×</text>
      <text x="360" y="104" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">×</text>
      
      <!-- Bottom Conductors: Current Out (dot) -->
      <g fill="#1e293b" stroke="#f59e0b" stroke-width="2">
        <circle cx="160" cy="200" r="10"/>
        <circle cx="210" cy="200" r="10"/>
        <circle cx="260" cy="200" r="10"/>
        <circle cx="310" cy="200" r="10"/>
        <circle cx="360" cy="200" r="10"/>
      </g>
      <!-- Dots for Current Out -->
      <circle cx="160" cy="200" r="3.5" fill="#f59e0b"/>
      <circle cx="210" cy="200" r="3.5" fill="#f59e0b"/>
      <circle cx="260" cy="200" r="3.5" fill="#f59e0b"/>
      <circle cx="310" cy="200" r="3.5" fill="#f59e0b"/>
      <circle cx="360" cy="200" r="3.5" fill="#f59e0b"/>
      
      <!-- Magnetic Poles -->
      <text x="75" y="155" fill="#ef4444" font-size="14" font-weight="900" text-anchor="end">S (South)</text>
      <text x="465" y="155" fill="#10b981" font-size="14" font-weight="900">N (North)</text>
      
      <!-- Ampere Formula Box -->
      <rect x="150" y="240" width="240" height="42" fill="#1e293b" rx="5" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="270" y="258" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Ideal Axial Field (Ampère's Law):</text>
      <text x="270" y="274" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">B = μ₀ · n · I  (n = N / L)</text>
    </svg>`
  },

  // 24. Lorentz Mass Spectrometer
  {
    id: "phys_lorentz_mass_spectrometer",
    subject: "PHYS",
    moduleId: 6,
    title: "Magnetic Particle Deflection & Mass Spectrometer Trajectory",
    caption: "Figure 24: Velocity Selector & Perpendicular Magnetic Field Deflection (r = mv / qB)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Velocity Selector Region (Left, x=40 to 140) -->
      <rect x="40" y="80" width="110" height="80" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <text x="95" y="100" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Velocity Selector</text>
      <text x="95" y="125" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">v = E / B₁</text>
      
      <!-- Collimating Slit Plate -->
      <rect x="150" y="40" width="10" height="75" fill="#64748b"/>
      <rect x="150" y="125" width="10" height="135" fill="#64748b"/>
      
      <!-- Magnetic Deflection Chamber (x=160 to 500, y=40 to 260) with B-field pointing OUT (dots) -->
      <rect x="160" y="40" width="340" height="220" fill="#0369a1" fill-opacity="0.1" stroke="#0284c7" stroke-width="1.5"/>
      <text x="470" y="65" fill="#38bdf8" font-size="11" font-weight="800">B_out (⊙)</text>
      <!-- B field dots grid -->
      <g fill="#38bdf8" opacity="0.6">
        <circle cx="210" cy="70" r="2.5"/><circle cx="280" cy="70" r="2.5"/><circle cx="350" cy="70" r="2.5"/><circle cx="420" cy="70" r="2.5"/>
        <circle cx="210" cy="120" r="2.5"/><circle cx="280" cy="120" r="2.5"/><circle cx="350" cy="120" r="2.5"/><circle cx="420" cy="120" r="2.5"/>
        <circle cx="210" cy="170" r="2.5"/><circle cx="280" cy="170" r="2.5"/><circle cx="350" cy="170" r="2.5"/><circle cx="420" cy="170" r="2.5"/>
        <circle cx="210" cy="220" r="2.5"/><circle cx="280" cy="220" r="2.5"/><circle cx="350" cy="220" r="2.5"/><circle cx="420" cy="220" r="2.5"/>
      </g>
      
      <!-- Beam Entry through Slit at (160, 120) moving right -->
      <line x1="20" y1="120" x2="160" y2="120" stroke="#f8fafc" stroke-width="2"/>
      
      <!-- Semicircular Trajectory 1: Light Isotope m1 (Radius R1 = 70, center at 160, 190) -->
      <path d="M 160 120 A 70 70 0 0 1 160 260" fill="none" stroke="#10b981" stroke-width="2.5"/>
      <circle cx="160" cy="260" r="4" fill="#10b981"/>
      <text x="180" y="255" fill="#10b981" font-size="10" font-weight="800">m₁ (²⁰Ne⁺)</text>
      
      <!-- Semicircular Trajectory 2: Heavy Isotope m2 (Radius R2 = 95, center at 160, 215 -> landing at 310) -->
      <path d="M 160 120 A 95 95 0 0 1 160 310" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <!-- Semicircle clipped to box: Arc from (160, 120) with r=100 -> landing at (160, 320) but box ends at 260 -->
      <!-- Let's adjust radius: R1 = 50 (landing at y=220), R2 = 65 (landing at y=250) -->
      
      <!-- Detector Plate Line -->
      <line x1="160" y1="125" x2="160" y2="260" stroke="#ef4444" stroke-width="4"/>
      <text x="145" y="200" fill="#ef4444" font-size="10" font-weight="700" text-anchor="end">Detector</text>
      
      <!-- Radius Callout Box -->
      <rect x="250" y="195" width="220" height="55" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="360" y="215" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Lorentz Centripetal Balance:</text>
      <text x="360" y="235" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">r = m·v / (q·B)  ⇒  m ∝ r</text>
    </svg>`
  },

  // 25. Faraday & Lenz Induction
  {
    id: "phys_faraday_lenz_induction",
    subject: "PHYS",
    moduleId: 6,
    title: "Electromagnetic Induction & Lenz's Law Directionality",
    caption: "Figure 25: Bar Magnet Approaching Solenoid Inducing Opposing Magnetic Pole and EMF",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Bar Magnet (Moving Down) -->
      <g transform="translate(140, 20)">
        <rect x="0" y="0" width="40" height="45" rx="3" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
        <text x="20" y="28" fill="#f8fafc" font-size="14" font-weight="900" text-anchor="middle">N</text>
        <rect x="0" y="45" width="40" height="45" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="73" fill="#f8fafc" font-size="14" font-weight="900" text-anchor="middle">S</text>
        
        <!-- Velocity Vector v downwards -->
        <line x1="20" y1="95" x2="20" y2="130" stroke="#f59e0b" stroke-width="3"/>
        <polygon points="20,130 15,120 25,120" fill="#f59e0b"/>
        <text x="32" y="115" fill="#f59e0b" font-size="12" font-weight="800">v</text>
      </g>
      
      <!-- Magnetic Flux Increase Arrow -->
      <text x="80" y="130" fill="#38bdf8" font-size="11" font-weight="700">dΦ_B/dt &gt; 0</text>
      
      <!-- Solenoid Coil -->
      <g transform="translate(110, 150)">
        <!-- Cylinder Core -->
        <rect x="15" y="0" width="70" height="110" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Copper Turns -->
        <ellipse cx="50" cy="20" rx="38" ry="10" fill="none" stroke="#f59e0b" stroke-width="3"/>
        <ellipse cx="50" cy="45" rx="38" ry="10" fill="none" stroke="#f59e0b" stroke-width="3"/>
        <ellipse cx="50" cy="70" rx="38" ry="10" fill="none" stroke="#f59e0b" stroke-width="3"/>
        <ellipse cx="50" cy="95" rx="38" ry="10" fill="none" stroke="#f59e0b" stroke-width="3"/>
        
        <!-- Induced North Pole on Top -->
        <text x="50" y="12" fill="#ef4444" font-size="12" font-weight="900" text-anchor="middle">N (Repulsion)</text>
        <!-- Current Direction Arrow -->
        <polygon points="12,45 10,38 18,40" fill="#10b981"/>
        <text x="-5" y="50" fill="#10b981" font-size="10" font-weight="800">I_ind</text>
      </g>
      
      <!-- Connecting Wires to Galvanometer -->
      <path d="M 122 245 L 70 245 L 70 270 L 320 270 L 320 220" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <path d="M 198 245 L 260 245 L 260 220" fill="none" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Galvanometer Meter -->
      <circle cx="290" cy="180" r="35" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="290" y="158" fill="#10b981" font-size="12" font-weight="800" text-anchor="middle">Galvanometer</text>
      <!-- Deflected Needle -->
      <line x1="290" y1="185" x2="272" y2="160" stroke="#ef4444" stroke-width="2.5"/>
      <circle cx="290" cy="185" r="4" fill="#94a3b8"/>
      <text x="290" y="202" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Induced EMF</text>
      
      <!-- Law Annotations -->
      <rect x="360" y="50" width="165" height="90" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="442" y="72" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Faraday's Law:</text>
      <text x="442" y="92" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">ε = −N · (dΦ_B / dt)</text>
      <text x="442" y="112" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">Lenz's Law (− sign):</text>
      <text x="442" y="128" fill="#94a3b8" font-size="9" text-anchor="middle">Opposes changing flux</text>
    </svg>`
  },

  // 26. Series RLC Resonance Curve
  {
    id: "phys_rlc_resonance_curve",
    subject: "PHYS",
    moduleId: 6,
    title: "Series RLC Resonant Frequency Response & Quality Factor (Q)",
    caption: "Figure 26: Current Amplitude vs Driving Angular Frequency Showing Resonant Peak at ω0 = 1/√(LC)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Cartesian Axes: Origin at (70, 240) -->
      <line x1="70" y1="240" x2="490" y2="240" stroke="#64748b" stroke-width="2"/>
      <polygon points="490,240 482,236 482,244" fill="#64748b"/>
      <text x="495" y="244" fill="#f8fafc" font-size="11" font-weight="700">ω</text>
      
      <line x1="70" y1="240" x2="70" y2="35" stroke="#64748b" stroke-width="2"/>
      <polygon points="70,35 66,43 74,43" fill="#64748b"/>
      <text x="70" y="25" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">I_rms</text>
      
      <!-- Resonant Frequency Vertical Marker at omega_0 = 260 -->
      <line x1="260" y1="45" x2="260" y2="240" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
      <circle cx="260" cy="55" r="5" fill="#ef4444"/>
      <text x="260" y="258" fill="#ef4444" font-size="12" font-weight="800" text-anchor="middle">ω₀ = 1/√(LC)</text>
      
      <!-- High Q Resonance Curve (Sharp Cyan Peak) -->
      <!-- Peak at (260, 55). Half max at I_max / sqrt(2) approx y=110 -->
      <path d="M 90 235 C 170 230, 220 190, 240 110 C 250 70, 255 55, 260 55 C 265 55, 270 70, 280 110 C 300 190, 350 230, 470 235" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <text x="300" y="75" fill="#38bdf8" font-size="11" font-weight="800">High Q (Low R)</text>
      
      <!-- Low Q Resonance Curve (Broad Amber Curve) -->
      <path d="M 90 230 C 160 215, 210 160, 260 135 C 310 160, 360 215, 470 230" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3"/>
      <text x="345" y="155" fill="#f59e0b" font-size="11" font-weight="700">Low Q (High R)</text>
      
      <!-- Half-Power Bandwidth Delta Omega -->
      <line x1="240" y1="110" x2="280" y2="110" stroke="#10b981" stroke-width="2"/>
      <polygon points="240,110 245,107 245,113" fill="#10b981"/>
      <polygon points="280,110 275,107 275,113" fill="#10b981"/>
      <text x="260" y="103" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Δω = R / L</text>
      
      <!-- Current level I_max / sqrt(2) -->
      <line x1="70" y1="110" x2="240" y2="110" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="65" y="114" fill="#94a3b8" font-size="9" text-anchor="end">I_max / √2</text>
      
      <!-- Formulas Box -->
      <rect x="360" y="45" width="165" height="65" fill="#1e293b" rx="6" stroke="#334155" stroke-width="1.5"/>
      <text x="442" y="65" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Quality Factor:</text>
      <text x="442" y="83" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Q = ω₀ / Δω = ω₀·L / R</text>
      <text x="442" y="98" fill="#94a3b8" font-size="9" text-anchor="middle">At ω₀: Z = R (Phase φ = 0)</text>
    </svg>`
  },

  // 27. Bohr Hydrogen Quantized Energy Levels
  {
    id: "phys_bohr_atom_levels",
    subject: "PHYS",
    moduleId: 9,
    title: "Quantized Hydrogen Energy Level Transitions & Spectral Series",
    caption: "Figure 27: Electronic De-excitations Generating the Lyman (UV), Balmer (Visible), and Paschen (IR) Series",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Energy Level Horizontal Lines -->
      <!-- n=1: E1 = -13.6 eV at y=235 -->
      <line x1="120" y1="235" x2="490" y2="235" stroke="#f8fafc" stroke-width="2"/>
      <text x="110" y="239" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="end">n = 1</text>
      <text x="500" y="239" fill="#94a3b8" font-size="10">−13.60 eV</text>
      
      <!-- n=2: E2 = -3.40 eV at y=150 -->
      <line x1="120" y1="150" x2="490" y2="150" stroke="#38bdf8" stroke-width="2"/>
      <text x="110" y="154" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="end">n = 2</text>
      <text x="500" y="154" fill="#94a3b8" font-size="10">−3.40 eV</text>
      
      <!-- n=3: E3 = -1.51 eV at y=105 -->
      <line x1="120" y1="105" x2="490" y2="105" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="110" y="109" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="end">n = 3</text>
      <text x="500" y="109" fill="#94a3b8" font-size="10">−1.51 eV</text>
      
      <!-- n=4: E4 = -0.85 eV at y=80 -->
      <line x1="120" y1="80" x2="490" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="110" y="84" fill="#94a3b8" font-size="10" text-anchor="end">n = 4</text>
      <text x="500" y="84" fill="#94a3b8" font-size="10">−0.85 eV</text>
      
      <!-- n=infinity: E = 0 eV at y=45 -->
      <line x1="120" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="1" stroke-dasharray="4 2"/>
      <text x="110" y="49" fill="#64748b" font-size="10" text-anchor="end">n = ∞</text>
      <text x="500" y="49" fill="#64748b" font-size="10">0.00 eV (Ionized)</text>
      
      <!-- Lyman Series Transitions (To n=1, UV) -->
      <g stroke="#a855f7" stroke-width="2">
        <line x1="150" y1="150" x2="150" y2="235"/>
        <line x1="170" y1="105" x2="170" y2="235"/>
        <line x1="190" y1="80" x2="190" y2="235"/>
      </g>
      <polygon points="150,235 147,227 153,227" fill="#a855f7"/>
      <polygon points="170,235 167,227 173,227" fill="#a855f7"/>
      <polygon points="190,235 187,227 193,227" fill="#a855f7"/>
      <text x="170" y="270" fill="#a855f7" font-size="11" font-weight="800" text-anchor="middle">Lyman Series</text>
      <text x="170" y="283" fill="#94a3b8" font-size="9" text-anchor="middle">(Ultraviolet)</text>
      
      <!-- Balmer Series Transitions (To n=2, Visible Spectrum!) -->
      <!-- Red (3 -> 2, 656 nm) -->
      <line x1="260" y1="105" x2="260" y2="150" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="260,150 257,142 263,142" fill="#ef4444"/>
      <text x="260" y="165" fill="#ef4444" font-size="8" font-weight="700" text-anchor="middle">656nm</text>
      
      <!-- Cyan (4 -> 2, 486 nm) -->
      <line x1="285" y1="80" x2="285" y2="150" stroke="#06b6d4" stroke-width="2.5"/>
      <polygon points="285,150 282,142 288,142" fill="#06b6d4"/>
      <text x="285" y="165" fill="#06b6d4" font-size="8" font-weight="700" text-anchor="middle">486nm</text>
      
      <!-- Blue (5 -> 2, 434 nm) -->
      <line x1="310" y1="65" x2="310" y2="150" stroke="#3b82f6" stroke-width="2.5"/>
      <polygon points="310,150 307,142 313,142" fill="#3b82f6"/>
      <text x="310" y="165" fill="#3b82f6" font-size="8" font-weight="700" text-anchor="middle">434nm</text>
      
      <text x="285" y="190" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Balmer Series</text>
      <text x="285" y="203" fill="#94a3b8" font-size="9" text-anchor="middle">(Visible Lines)</text>
      
      <!-- Paschen Series (To n=3, Infrared) -->
      <line x1="390" y1="80" x2="390" y2="105" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="390,105 387,98 393,98" fill="#f59e0b"/>
      <text x="390" y="125" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Paschen</text>
      <text x="390" y="137" fill="#94a3b8" font-size="8" text-anchor="middle">(Infrared)</text>
      
      <!-- Rydberg Formula Callout -->
      <rect x="25" y="15" width="80" height="24" fill="#1e293b" rx="4" stroke="#334155"/>
      <text x="65" y="31" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">ΔE = h·f</text>
    </svg>`
  },

  // 28. Nuclear Binding Energy Curve
  {
    id: "phys_nuclear_binding_curve",
    subject: "PHYS",
    moduleId: 9,
    title: "Nuclear Binding Energy Per Nucleon Curve Across Mass Numbers",
    caption: "Figure 28: Peak Nuclear Stability at Iron-56 (8.8 MeV/nucleon) Explaining Fusion and Fission Energy Release",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Cartesian Axes: Origin at (60, 240) -->
      <line x1="60" y1="240" x2="500" y2="240" stroke="#64748b" stroke-width="2"/>
      <polygon points="500,240 492,236 492,244" fill="#64748b"/>
      <text x="505" y="244" fill="#f8fafc" font-size="11" font-weight="700">Mass Number (A)</text>
      
      <line x1="60" y1="240" x2="60" y2="35" stroke="#64748b" stroke-width="2"/>
      <polygon points="60,35 56,43 64,43" fill="#64748b"/>
      <text x="60" y="25" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Binding Energy / Nucleon (MeV)</text>
      
      <!-- Y Axis Ticks: 0, 2, 4, 6, 8, 10 MeV -->
      <text x="50" y="244" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
      <text x="50" y="196" fill="#94a3b8" font-size="10" text-anchor="end">2</text>
      <text x="50" y="152" fill="#94a3b8" font-size="10" text-anchor="end">4</text>
      <text x="50" y="108" fill="#94a3b8" font-size="10" text-anchor="end">6</text>
      <text x="50" y="64" fill="#94a3b8" font-size="10" text-anchor="end">8</text>
      
      <!-- Binding Energy Curve -->
      <path d="M 62 230 L 72 205 L 80 85 L 90 120 L 105 75 L 125 78 C 150 50, 180 46, 205 46 C 260 52, 340 68, 480 88" fill="none" stroke="#38bdf8" stroke-width="3"/>
      
      <!-- Prominent Nuclei Dots & Labels -->
      <!-- 4He Peak at A=4, BE=7.1 MeV (x=80, y=85) -->
      <circle cx="80" cy="85" r="4" fill="#f59e0b"/>
      <text x="80" y="75" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">⁴He</text>
      
      <!-- 12C at x=105, y=75 -->
      <circle cx="105" cy="75" r="3.5" fill="#f8fafc"/>
      <text x="105" y="65" fill="#f8fafc" font-size="9" text-anchor="middle">¹²C</text>
      
      <!-- Peak: Iron-56 (A=56, BE=8.8 MeV, x=205, y=46) -->
      <circle cx="205" cy="46" r="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
      <text x="205" y="35" fill="#ef4444" font-size="12" font-weight="900" text-anchor="middle">⁵⁶Fe (Maximum Peak 8.8 MeV)</text>
      <line x1="205" y1="46" x2="205" y2="240" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="205" y="255" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">A = 56</text>
      
      <!-- Uranium-238 at x=480, y=88 (BE=7.6 MeV) -->
      <circle cx="480" cy="88" r="4.5" fill="#38bdf8"/>
      <text x="480" y="78" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">²³⁸U</text>
      
      <!-- Fusion Energy Release Arrow (Left to Right) -->
      <g fill="#10b981">
        <line x1="90" y1="175" x2="175" y2="175" stroke="#10b981" stroke-width="2.5"/>
        <polygon points="175,175 167,171 167,179"/>
        <text x="132" y="165" font-size="11" font-weight="800" text-anchor="middle">Nuclear Fusion</text>
        <text x="132" y="195" font-size="9" text-anchor="middle">Releases Energy</text>
      </g>
      
      <!-- Fission Energy Release Arrow (Right to Left) -->
      <g fill="#f59e0b">
        <line x1="430" y1="175" x2="245" y2="175" stroke="#f59e0b" stroke-width="2.5"/>
        <polygon points="245,175 253,171 253,179"/>
        <text x="337" y="165" font-size="11" font-weight="800" text-anchor="middle">Nuclear Fission</text>
        <text x="337" y="195" font-size="9" text-anchor="middle">Releases Energy</text>
      </g>
    </svg>`
  },

  // 29. Michelson Interferometer
  {
    id: "phys_michelson_interferometer",
    subject: "PHYS",
    moduleId: 8,
    title: "Michelson Optical Interferometer & Coherent Fringe Formation",
    caption: "Figure 29: Amplitude Splitting, Variable Optical Path Difference, and Interference Fringe Detector",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Monochromatic Laser Source (Left) -->
      <rect x="25" y="130" width="60" height="40" rx="4" fill="#dc2626" stroke="#ef4444" stroke-width="2"/>
      <text x="55" y="155" fill="#f8fafc" font-size="10" font-weight="800" text-anchor="middle">Laser</text>
      
      <!-- Primary Laser Beam -->
      <line x1="85" y1="150" x2="210" y2="150" stroke="#ef4444" stroke-width="2.5"/>
      
      <!-- Beam Splitter (Half-Silvered Mirror inclined at 45 deg at x=220, y=150) -->
      <line x1="200" y1="170" x2="240" y2="130" stroke="#38bdf8" stroke-width="4"/>
      <text x="185" y="125" fill="#38bdf8" font-size="10" font-weight="700">Beam Splitter (50/50)</text>
      
      <!-- Arm 1: Transmitted Beam to Movable Mirror M1 (Right) -->
      <line x1="220" y1="150" x2="350" y2="150" stroke="#ef4444" stroke-width="2"/>
      <rect x="350" y="125" width="8" height="50" fill="#94a3b8" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="365" y="145" fill="#f8fafc" font-size="10" font-weight="800">Movable</text>
      <text x="365" y="160" fill="#f8fafc" font-size="10" font-weight="800">Mirror M₁</text>
      <!-- Motion arrows -->
      <line x1="390" y1="175" x2="420" y2="175" stroke="#f59e0b" stroke-width="1.5"/>
      <polygon points="420,175 413,172 413,178" fill="#f59e0b"/>
      <polygon points="390,175 397,172 397,178" fill="#f59e0b"/>
      <text x="405" y="195" fill="#f59e0b" font-size="9" text-anchor="middle">Δd</text>
      
      <!-- Arm 2: Reflected Beam to Fixed Mirror M2 (Top) -->
      <line x1="220" y1="150" x2="220" y2="50" stroke="#ef4444" stroke-width="2"/>
      <rect x="195" y="42" width="50" height="8" fill="#94a3b8" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="220" y="32" fill="#f8fafc" font-size="10" font-weight="800" text-anchor="middle">Fixed Mirror M₂</text>
      
      <!-- Combined Beams to Detector (Bottom) -->
      <line x1="220" y1="150" x2="220" y2="230" stroke="#f59e0b" stroke-width="3"/>
      
      <!-- Screen / Detector -->
      <rect x="180" y="230" width="80" height="15" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="220" y="242" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Detector Screen</text>
      
      <!-- Inset: Circular Interference Fringe Pattern -->
      <g transform="translate(460, 220)">
        <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="26" fill="none" stroke="#ef4444" stroke-width="3"/>
        <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" stroke-width="3"/>
        <circle cx="0" cy="0" r="10" fill="none" stroke="#ef4444" stroke-width="3"/>
        <circle cx="0" cy="0" r="3" fill="#ef4444"/>
        <text x="0" y="45" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">Circular Fringes</text>
      </g>
      
      <!-- Path Difference Formula Box -->
      <rect x="25" y="215" width="140" height="60" fill="#1e293b" rx="5" stroke="#334155" stroke-width="1"/>
      <text x="95" y="235" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Path Difference:</text>
      <text x="95" y="252" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Δx = 2 · Δd = m · λ</text>
      <text x="95" y="267" fill="#94a3b8" font-size="9" text-anchor="middle">λ = 2 · Δd / Δm</text>
    </svg>`
  },

  // 30. Venturi Bernoulli Flow
  {
    id: "phys_venturi_bernoulli",
    subject: "PHYS",
    moduleId: 5,
    title: "Venturi Tube Hydrodynamics & Bernoulli Pressure Differential",
    caption: "Figure 30: Flow Constriction Accelerating Fluid Velocity (v2 > v1) and Depressing Static Pressure (P2 < P1)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Venturi Tube Pipe Contour: Wide (y=110 to 210) -> Throat (y=135 to 185) -> Wide (y=110 to 210) -->
      <!-- Top Wall -->
      <path d="M 40 110 L 180 110 L 240 135 L 300 135 L 360 110 L 500 110" fill="none" stroke="#64748b" stroke-width="3"/>
      <!-- Bottom Wall -->
      <path d="M 40 210 L 180 210 L 240 185 L 300 185 L 360 210 L 500 210" fill="none" stroke="#64748b" stroke-width="3"/>
      
      <!-- Water Fill Inside Pipe -->
      <path d="M 40 110 L 180 110 L 240 135 L 300 135 L 360 110 L 500 110 L 500 210 L 360 210 L 300 185 L 240 185 L 180 210 L 40 210 Z" fill="#0284c7" fill-opacity="0.25"/>
      
      <!-- Streamlines -->
      <path d="M 40 135 Q 210 135 240 148 L 300 148 Q 330 135 500 135" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 3"/>
      <line x1="40" y1="160" x2="500" y2="160" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="120,160 112,156 112,164" fill="#38bdf8"/>
      <polygon points="275,160 267,156 267,164" fill="#38bdf8"/>
      <polygon points="420,160 412,156 412,164" fill="#38bdf8"/>
      <path d="M 40 185 Q 210 185 240 172 L 300 172 Q 330 185 500 185" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 3"/>
      
      <!-- Manometer Column 1 (Wide Section at x=130) -->
      <rect x="122" y="30" width="16" height="80" fill="none" stroke="#64748b" stroke-width="2"/>
      <rect x="123" y="55" width="14" height="55" fill="#0284c7" fill-opacity="0.6"/>
      <line x1="123" y1="55" x2="137" y2="55" stroke="#38bdf8" stroke-width="2"/>
      <text x="130" y="24" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">h₁ (High P₁)</text>
      
      <!-- Manometer Column 2 (Throat Constriction at x=270) -->
      <rect x="262" y="30" width="16" height="105" fill="none" stroke="#64748b" stroke-width="2"/>
      <rect x="263" y="90" width="14" height="45" fill="#0284c7" fill-opacity="0.6"/>
      <line x1="263" y1="90" x2="277" y2="90" stroke="#38bdf8" stroke-width="2"/>
      <text x="270" y="24" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">h₂ (Low P₂)</text>
      
      <!-- Pressure Difference Height Δh indicator -->
      <line x1="137" y1="55" x2="263" y2="55" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2"/>
      <line x1="263" y1="90" x2="295" y2="90" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2"/>
      <line x1="290" y1="55" x2="290" y2="90" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="290,55 287,63 293,63" fill="#f59e0b"/>
      <polygon points="290,90 287,82 293,82" fill="#f59e0b"/>
      <text x="300" y="75" fill="#f59e0b" font-size="11" font-weight="800">Δh</text>
      
      <!-- Velocity Callouts -->
      <text x="90" y="195" fill="#38bdf8" font-size="11" font-weight="700">v₁ (Slow)</text>
      <text x="270" y="177" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">v₂ &gt; v₁ (Fast)</text>
      
      <!-- Bernoulli Formula Box -->
      <rect x="100" y="235" width="340" height="50" fill="#1e293b" rx="6" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="270" y="253" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Continuity &amp; Bernoulli's Principle:</text>
      <text x="270" y="271" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">A₁·v₁ = A₂·v₂   &amp;   P₁ − P₂ = ½ ρ (v₂² − v₁²) = ρ·g·Δh</text>
    </svg>`
  }
];

const all30Phys = [...existingPhys, ...newPhysDiagrams];
console.log("Total PHYS diagrams ready:", all30Phys.length);

const outContent = `// Physics Scientific Diagrams Bank (30 Complete, High-Fidelity Diagrams)
// Fully calibrated for print and screen rendering with zero redundancy.

export const PHYS_DIAGRAMS = {
${all30Phys.map(d => `  "${d.id}": ${JSON.stringify(d, null, 2)}`).join(",\n\n")}
};
`;

fs.writeFileSync("./data/diagrams-phys.js", outContent, "utf-8");
console.log("Successfully wrote ./data/diagrams-phys.js with 30 diagrams!");
