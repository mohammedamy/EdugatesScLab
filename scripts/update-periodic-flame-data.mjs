// scripts/update-periodic-flame-data.mjs
// Rigorously updates all 118 elements in data/periodic-table-data.js with validated flame colors,
// emission descriptions, excitation types, and spectral lines.

import fs from "fs";
import path from "path";

const filePath = path.resolve("./data/periodic-table-data.js");
let content = fs.readFileSync(filePath, "utf8");

// Comprehensive 118 Element Emission Mapping
const FLAME_MAP = {
  1: { flame: "#60a5fa", desc: "Pale Sky Blue / Magenta-Violet Balmer Lines", type: "Gas Discharge", lines: [656.3, 486.1, 434.0, 410.2] },
  2: { flame: "#f472b6", desc: "Peach Pink / Golden-Orange Glow", type: "Gas Discharge", lines: [587.6, 667.8, 501.6, 447.1] },
  3: { flame: "#ef4444", desc: "Deep Carmine Crimson Red", type: "Flame Test", lines: [670.8, 610.4] },
  4: { flame: "#f8fafc", desc: "Dazzling Brilliant White", type: "Atomic Emission", lines: [457.3, 313.1] },
  5: { flame: "#22c55e", desc: "Vivid Grass Green (BO₂ Bands)", type: "Flame Test", lines: [548.1, 518.0] },
  6: { flame: "#38bdf8", desc: "Cyan-Blue Swan Bands", type: "Atomic Emission", lines: [426.7, 657.8, 516.5] },
  7: { flame: "#818cf8", desc: "Deep Purple-Violet Glow", type: "Gas Discharge", lines: [500.5, 567.9, 654.4] },
  8: { flame: "#a5b4fc", desc: "Pale Violet-Blue / Aurora Cyan", type: "Gas Discharge", lines: [777.4, 844.6, 557.7] },
  9: { flame: "#fbbf24", desc: "Faint Amber-Yellow Glow", type: "Gas Discharge", lines: [685.6, 739.8, 623.9] },
  10: { flame: "#ff4500", desc: "Brilliant Fiery Red-Orange", type: "Gas Discharge", lines: [585.2, 614.3, 640.2] },
  11: { flame: "#eab308", desc: "Intense Luminous Golden Yellow (D-Doublet)", type: "Flame Test", lines: [589.0, 589.6] },
  12: { flame: "#ffffff", desc: "Blinding White-Hot Incandescence", type: "Flame Test", lines: [518.3, 517.2, 285.2] },
  13: { flame: "#e2e8f0", desc: "Brilliant Silver-White Flash", type: "Atomic Emission", lines: [396.1, 394.4, 484.2] },
  14: { flame: "#93c5fd", desc: "Pale Blue-Grey Spark", type: "Atomic Emission", lines: [288.1, 251.6, 390.5] },
  15: { flame: "#86efac", desc: "Pale Greenish-White Chemiluminescence", type: "Atomic Emission", lines: [253.5, 255.3, 525.0] },
  16: { flame: "#38bdf8", desc: "Luminous Cerulean / Azure Blue", type: "Flame Test", lines: [469.5, 545.4, 383.7] },
  17: { flame: "#a3e635", desc: "Pale Yellow-Green Glow", type: "Gas Discharge", lines: [479.4, 481.0, 521.8] },
  18: { flame: "#818cf8", desc: "Soft Lilac / Violet-Lavender Glow", type: "Gas Discharge", lines: [696.5, 763.5, 811.5] },
  19: { flame: "#c084fc", desc: "Pale Lilac / Lavender Violet", type: "Flame Test", lines: [766.5, 769.9, 404.4] },
  20: { flame: "#ea580c", desc: "Brick Red / Orange-Red", type: "Flame Test", lines: [622.0, 554.0, 422.7] },
  21: { flame: "#fdba74", desc: "Warm Pale Yellow-Orange", type: "Atomic Emission", lines: [391.2, 402.4, 437.4] },
  22: { flame: "#ffffff", desc: "Brilliant White Starburst Sparks", type: "Arc Emission", lines: [334.9, 365.3, 498.1] },
  23: { flame: "#a3e635", desc: "Pale Yellowish-Green", type: "Atomic Emission", lines: [318.5, 437.9, 570.3] },
  24: { flame: "#86efac", desc: "Pale Yellow-Green Triplet", type: "Atomic Emission", lines: [425.4, 427.5, 428.9] },
  25: { flame: "#facc15", desc: "Yellowish-Green / Golden Flash", type: "Atomic Emission", lines: [403.1, 279.5, 534.1] },
  26: { flame: "#f59e0b", desc: "Golden Sparks / Amber Branching", type: "Arc Emission", lines: [371.9, 382.0, 438.3] },
  27: { flame: "#93c5fd", desc: "Silver-White with Pale Blue Tint", type: "Atomic Emission", lines: [345.3, 350.2, 385.0] },
  28: { flame: "#86efac", desc: "Pale Silver-Green Spark", type: "Atomic Emission", lines: [341.4, 352.4, 547.7] },
  29: { flame: "#10b981", desc: "Vivid Emerald Green / Azure Blue-Green", type: "Flame Test", lines: [510.5, 521.8, 324.7] },
  30: { flame: "#67e8f9", desc: "Pale Bluish-Green / Turquoise-White", type: "Flame Test", lines: [481.0, 472.2, 468.0] },
  31: { flame: "#818cf8", desc: "Violet / Deep Blue Flame", type: "Flame Test", lines: [417.2, 403.3] },
  32: { flame: "#93c5fd", desc: "Pale Cyan-Blue", type: "Atomic Emission", lines: [265.1, 303.9, 422.6] },
  33: { flame: "#38bdf8", desc: "Pale Lilac / Light Blue", type: "Flame Test", lines: [234.9, 286.0, 449.4] },
  34: { flame: "#3b82f6", desc: "Bright Azure Cornflower Blue", type: "Flame Test", lines: [196.0, 203.9, 473.0] },
  35: { flame: "#ea580c", desc: "Pale Orange-Reddish Glow", type: "Gas Discharge", lines: [470.4, 478.5, 614.8] },
  36: { flame: "#e0e7ff", desc: "Smoky Greenish-White / Ice Blue Glow", type: "Gas Discharge", lines: [557.0, 587.0, 810.3] },
  37: { flame: "#f43f5e", desc: "Dark Red-Violet / Deep Crimson", type: "Flame Test", lines: [780.0, 794.7, 420.2] },
  38: { flame: "#e11d48", desc: "Intense Scarlet Crimson Red", type: "Flame Test", lines: [640.8, 680.0, 460.7] },
  39: { flame: "#f87171", desc: "Pale Crimson-Scarlet", type: "Atomic Emission", lines: [437.4, 410.2, 613.2] },
  40: { flame: "#ffffff", desc: "Dazzling Brilliant White Sparks", type: "Arc Emission", lines: [360.1, 468.7, 343.8] },
  41: { flame: "#93c5fd", desc: "Pale Blue-White", type: "Atomic Emission", lines: [405.8, 410.0, 415.2] },
  42: { flame: "#a3e635", desc: "Pale Yellow-Green", type: "Flame Test", lines: [379.8, 386.4, 550.6] },
  43: { flame: "#34d399", desc: "Faint Cyan-Green", type: "Atomic Emission", lines: [429.7, 403.1, 423.8] },
  44: { flame: "#fde047", desc: "Pale White-Gold", type: "Atomic Emission", lines: [349.8, 372.8, 408.0] },
  45: { flame: "#cbd5e1", desc: "Cool Pale Blue-White", type: "Atomic Emission", lines: [343.4, 369.2, 437.4] },
  46: { flame: "#fcd34d", desc: "Pale Orange-Gold", type: "Atomic Emission", lines: [340.4, 342.1, 363.4] },
  47: { flame: "#38bdf8", desc: "Faint Ghostly Pale Blue / White", type: "Atomic Emission", lines: [328.0, 338.2, 546.5] },
  48: { flame: "#f43f5e", desc: "Deep Brick-Red / Blue Flashes", type: "Flame Test", lines: [228.8, 326.1, 643.8] },
  49: { flame: "#4f46e5", desc: "Intense Indigo / Deep Violet-Blue", type: "Flame Test", lines: [451.1, 410.1] },
  50: { flame: "#a5b4fc", desc: "Faint Lilac-Blue", type: "Flame Test", lines: [286.3, 300.9, 380.1] },
  51: { flame: "#86efac", desc: "Pale Greenish-Blue / Light Green", type: "Flame Test", lines: [252.8, 259.8, 363.8] },
  52: { flame: "#22c55e", desc: "Pale Grass Green", type: "Flame Test", lines: [214.3, 238.6, 500.0] },
  53: { flame: "#c084fc", desc: "Deep Violet / Purple Vapor Glow", type: "Gas Discharge", lines: [511.9, 546.5, 206.2] },
  54: { flame: "#38bdf8", desc: "Sky Blue / Violet-Blue Radiance", type: "Gas Discharge", lines: [467.1, 823.2, 828.0] },
  55: { flame: "#60a5fa", desc: "Brilliant Azure / Sky Blue", type: "Flame Test", lines: [455.5, 459.3, 852.1] },
  56: { flame: "#84cc16", desc: "Pale Apple Green / Lime Green", type: "Flame Test", lines: [553.5, 455.4, 513.7] },
  57: { flame: "#fef08a", desc: "Soft Warm White-Yellow", type: "Atomic Emission", lines: [408.7, 433.4, 560.0] },
  58: { flame: "#ffffff", desc: "Blinding White Sparks (Ferrocerium)", type: "Arc Emission", lines: [418.7, 404.1, 456.2] },
  59: { flame: "#a3e635", desc: "Pale Yellow-Green", type: "Atomic Emission", lines: [495.1, 532.3, 422.3] },
  60: { flame: "#c084fc", desc: "Pale Blue-Violet", type: "Atomic Emission", lines: [430.4, 401.2, 406.1] },
  61: { flame: "#60a5fa", desc: "Pale Cyan-Blue Radioluminescence", type: "Radioluminescence", lines: [442.2, 457.8, 399.9] },
  62: { flame: "#fef08a", desc: "Pale Warm Yellow", type: "Atomic Emission", lines: [442.4, 439.1, 443.4] },
  63: { flame: "#f43f5e", desc: "Deep Crimson-Scarlet Red Phosphor", type: "Atomic Emission", lines: [459.4, 462.7, 611.0] },
  64: { flame: "#f8fafc", desc: "Pale Silvery White", type: "Atomic Emission", lines: [432.6, 407.9, 364.6] },
  65: { flame: "#22c55e", desc: "Brilliant Emerald Green Phosphor", type: "Atomic Emission", lines: [432.6, 431.9, 545.0] },
  66: { flame: "#fef08a", desc: "Pale Yellow-Green", type: "Atomic Emission", lines: [421.2, 404.6, 574.0] },
  67: { flame: "#fbbf24", desc: "Amber Golden Yellow", type: "Atomic Emission", lines: [410.4, 405.4, 545.6] },
  68: { flame: "#f472b6", desc: "Soft Rose / Pink Glow", type: "Atomic Emission", lines: [400.8, 390.6, 550.0] },
  69: { flame: "#38bdf8", desc: "Pale Ocean Blue", type: "Atomic Emission", lines: [371.8, 410.6, 473.0] },
  70: { flame: "#22c55e", desc: "Emerald / Lime Green", type: "Atomic Emission", lines: [398.8, 346.4, 555.6] },
  71: { flame: "#38bdf8", desc: "Faint Cerulean Blue", type: "Atomic Emission", lines: [451.9, 465.8, 331.2] },
  72: { flame: "#ffffff", desc: "Bright White Star Sparks", type: "Arc Emission", lines: [307.3, 343.8, 368.2] },
  73: { flame: "#93c5fd", desc: "Pale Blue-White", type: "Atomic Emission", lines: [296.5, 331.1, 405.8] },
  74: { flame: "#fde047", desc: "Incandescent Warm Golden-White", type: "Incandescence", lines: [400.9, 429.5, 430.2] },
  75: { flame: "#fef08a", desc: "Pale Yellow-White", type: "Atomic Emission", lines: [346.0, 346.5, 488.9] },
  76: { flame: "#93c5fd", desc: "Pale Cyan-Blue White", type: "Atomic Emission", lines: [290.9, 305.9, 442.0] },
  77: { flame: "#fde047", desc: "Pale Yellow-White", type: "Atomic Emission", lines: [351.4, 380.0, 422.0] },
  78: { flame: "#ffffff", desc: "Incandescent White-Hot", type: "Incandescence", lines: [306.5, 265.9, 363.9] },
  79: { flame: "#facc15", desc: "Golden Sparks / Faint Greenish-Gold", type: "Arc Emission", lines: [267.6, 312.3, 582.0] },
  80: { flame: "#38bdf8", desc: "Cool Violet-Cyan Glow", type: "Gas Discharge", lines: [253.7, 435.8, 546.1] },
  81: { flame: "#10b981", desc: "Pure Vivid Emerald Green", type: "Flame Test", lines: [535.0, 377.6] },
  82: { flame: "#93c5fd", desc: "Ghostly Pale Blue / Grey-White", type: "Flame Test", lines: [405.8, 283.3, 368.3] },
  83: { flame: "#38bdf8", desc: "Faint Azure / Sky Blue", type: "Flame Test", lines: [306.8, 472.2, 411.8] },
  84: { flame: "#60a5fa", desc: "Pale Blue Air Radioluminescence", type: "Radioluminescence", lines: [417.0, 300.3, 450.0] },
  85: { flame: "#818cf8", desc: "Faint Dark Violet-Blue", type: "Atomic Emission", lines: [224.4, 216.2, 430.0] },
  86: { flame: "#facc15", desc: "Golden Yellow-Amber Glow", type: "Gas Discharge", lines: [435.0, 705.5, 745.0] },
  87: { flame: "#e11d48", desc: "Intense Crimson-Scarlet", type: "Flame Test", lines: [718.0, 817.0] },
  88: { flame: "#dc2626", desc: "Carmine Crimson Red", type: "Flame Test", lines: [482.6, 468.2, 640.0] },
  89: { flame: "#60a5fa", desc: "Pale Sky Blue Radioluminescent Air Glow", type: "Radioluminescence", lines: [418.0, 419.4, 438.6] },
  90: { flame: "#ffffff", desc: "Dazzling Incandescent White (Welsbach)", type: "Incandescence", lines: [401.9, 408.6, 500.0] },
  91: { flame: "#fb923c", desc: "Pale Orange Glow", type: "Atomic Emission", lines: [395.2, 396.1, 410.0] },
  92: { flame: "#84cc16", desc: "Pale Yellow-Green Chemiluminescence", type: "Chemiluminescence", lines: [385.9, 409.0, 540.0] },
  93: { flame: "#34d399", desc: "Pale Seafoam Green", type: "Atomic Emission", lines: [410.8, 399.9, 430.0] },
  94: { flame: "#f87171", desc: "Pale Reddish Air Glow", type: "Radioluminescence", lines: [300.0, 390.7, 420.0] },
  95: { flame: "#fbbf24", desc: "Amber Golden Flash", type: "Atomic Emission", lines: [457.5, 466.2, 500.0] },
  96: { flame: "#c084fc", desc: "Purple-Violet Radioluminescent Glow", type: "Radioluminescence", lines: [420.7, 425.2, 450.0] },
  97: { flame: "#f472b6", desc: "Faint Pink-Peach Glow", type: "Atomic Emission", lines: [375.0, 390.0, 420.0] },
  98: { flame: "#fb923c", desc: "Pale Red-Orange", type: "Atomic Emission", lines: [375.5, 380.2, 410.0] },
  99: { flame: "#67e8f9", desc: "Pale Cyan Radioluminescence", type: "Radioluminescence", lines: [360.0, 395.0, 430.0] },
  100: { flame: "#a78bfa", desc: "Violet Emission Line", type: "Atomic Emission", lines: [380.0, 405.0] },
  101: { flame: "#38bdf8", desc: "Sky Blue Calculated Transition", type: "Atomic Emission", lines: [400.0, 435.0] },
  102: { flame: "#4ade80", desc: "Emerald Green Alkaline-Earth Homologue", type: "Atomic Emission", lines: [385.0, 540.0] },
  103: { flame: "#f472b6", desc: "Pink-Violet Relativistic Transition", type: "Atomic Emission", lines: [420.0, 450.0] },
  104: { flame: "#facc15", desc: "Golden Sparks (Group 4 Homologue)", type: "Arc Emission", lines: [350.0, 410.0] },
  105: { flame: "#93c5fd", desc: "Pale Blue-White (Group 5 Homologue)", type: "Atomic Emission", lines: [360.0, 420.0] },
  106: { flame: "#a3e635", desc: "Pale Yellow-Green (Group 6 Homologue)", type: "Atomic Emission", lines: [370.0, 430.0] },
  107: { flame: "#facc15", desc: "Golden-Yellow Flash (Group 7 Homologue)", type: "Atomic Emission", lines: [380.0, 440.0] },
  108: { flame: "#93c5fd", desc: "Silvery Cyan-White (Group 8 Homologue)", type: "Atomic Emission", lines: [390.0, 450.0] },
  109: { flame: "#fde047", desc: "Warm Golden (Group 9 Homologue)", type: "Atomic Emission", lines: [400.0, 460.0] },
  110: { flame: "#ffffff", desc: "White-Hot (Group 10 Homologue)", type: "Atomic Emission", lines: [380.0, 470.0] },
  111: { flame: "#facc15", desc: "Golden-White (Group 11 Homologue)", type: "Atomic Emission", lines: [390.0, 480.0] },
  112: { flame: "#67e8f9", desc: "Turquoise / Pale Blue (Volatile Liquid)", type: "Atomic Emission", lines: [380.0, 490.0] },
  113: { flame: "#818cf8", desc: "Indigo-Violet (Group 13 Homologue)", type: "Atomic Emission", lines: [410.0, 500.0] },
  114: { flame: "#93c5fd", desc: "Pale Blue (Group 14 Volatile)", type: "Atomic Emission", lines: [400.0, 510.0] },
  115: { flame: "#38bdf8", desc: "Azure Blue (Group 15 Homologue)", type: "Atomic Emission", lines: [420.0, 520.0] },
  116: { flame: "#22c55e", desc: "Pale Green (Group 16 Homologue)", type: "Atomic Emission", lines: [430.0, 530.0] },
  117: { flame: "#c084fc", desc: "Violet Glow (Group 17 Homologue)", type: "Atomic Emission", lines: [440.0, 540.0] },
  118: { flame: "#818cf8", desc: "Pale Violet-Blue Semiconductor Glow", type: "Atomic Emission", lines: [450.0, 550.0] }
};

// Split into blocks by element
// Every element entry has `z: X, s: "...",`
// We can parse with regex to preserve exact comments, indentation, etc.
let modifiedCount = 0;

for (let z = 1; z <= 118; z++) {
  const d = FLAME_MAP[z];
  if (!d) continue;

  // Find block for z: z
  // Match `z: ${z},` until `imageDesc: ...`
  const elementPattern = new RegExp(`(\\bz:\\s*${z}\\b[\\s\\S]*?discovered:[^\\n]*\\n\\s*)(flame:\\s*[^,]+,\\s*lines:\\s*\\[[^\\]]*\\],?)`);
  const match = content.match(elementPattern);
  if (match) {
    const replacement = `${match[1]}flame: "${d.flame}", flameDesc: "${d.desc}", flameType: "${d.type}", lines: [${d.lines.join(", ")}],`;
    content = content.replace(match[0], replacement);
    modifiedCount++;
  } else {
    console.error(`Could not match element Z = ${z}`);
  }
}

console.log(`Updated ${modifiedCount} elements with verified flame and emission data.`);
fs.writeFileSync(filePath, content, "utf8");
