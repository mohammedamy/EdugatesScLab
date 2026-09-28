# Edugates-ClipSAT Science Labs (EdugtesScLab)

An interactive, world-class virtual science laboratory and STEM educational platform covering **Inspire Chemistry**, **Inspire Biology**, and **Inspire Physics** curricula for Smartboards, PCs, Tablets, and Mobile devices.

---

## 🌟 Key Features

- **74 Comprehensive Modules & 370+ Lessons**: Complete interactive curricula spanning Chemistry, Biology, and Physics with high-contrast diagrams, phenomena, and lesson objectives.
- **Smartboard Classroom Toolbar**:
  - Interactive floating pen, pointer, eraser, and clear canvas.
  - **Dynamic Stroke Resizer**: Smooth 1–40px slider with instant presets (2px, 5px, 10px, 20px, 32px) and real-time dot preview.
  - **Bright Fluorescent Highlighter**: Neon ambient glow with translucent wash (`0.38` alpha) preserving underlying formulas and diagrams.
  - **7 Vibrant Scientific Colors**: High-contrast spectrum palette with concentric active ring indicator.
  - Fullscreen presentation mode.
- **Interactive Simulations & Virtual Labs**:
  - 60 FPS real-time physics and chemistry simulations (Projectile motion, titration, circuits, optics, etc.).
  - KaTeX mathematical formula rendering with high-contrast day and night theme support.
  - Guided scientific inquiry investigation workbench.
- **Smart Adaptive Themes**: Seamless Dark Mode and WCAG AAA High-Contrast Day Theme.
- **Interactive Flashcards & Quiz Generator**: Automated exam and flashcard review tailored to curriculum standards.

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve via a static local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` in your browser.

---

## 📁 Repository Structure

```
├── assets/          # Chapter imagery, lab icons, and brand graphics
├── components/      # Modular UI components (Smartboard toolbar, Flashcards, Module Viewer, Interactives)
├── data/            # Curriculum lesson definitions, NGSS standards, and formula dossiers
├── labs/            # Virtual lab simulation engines
├── utils/           # Math formatting, KaTeX helpers, and device detection
├── app.js           # Main application shell and routing logic
├── index.css        # Comprehensive design system & WCAG high-contrast theme rules
└── index.html       # Web application entry point
```

---

## 📜 License

Edugates-ClipSAT Science Labs. All rights reserved.
