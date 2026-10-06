// Edugates-ClipSAT Science Labs - Diagram Print & Copier Optimization Engine
// Transforms dark obsidian/slate vector diagrams into pristine, publication-grade,
// black-and-white / high-contrast line-art figures optimized for laser printers,
// photocopiers (Xerox), and printable test papers.

/**
 * Transforms an SVG string into a high-contrast, pure-white-background,
 * publication-grade textbook diagram optimized for paper printing and toner copiers.
 *
 * @param {string} svgStr - Raw SVG markup
 * @returns {string} Clean, publication-grade SVG markup for printing & copiers
 */
export function polishDiagramForPrint(svgStr) {
  if (!svgStr || typeof svgStr !== "string" || !svgStr.includes("<svg")) {
    return svgStr || "";
  }

  let s = svgStr;

  // 1. Root <svg> element style adjustments
  // Ensure the SVG itself has a white background and sharp black text baseline
  s = s.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let newAttrs = attrs;
    const styleMatch = newAttrs.match(/style=(["'])([\s\S]*?)\1/i);
    if (styleMatch) {
      const quote = styleMatch[1];
      const cleanSt = styleMatch[2].replace(/background(-color)?\s*:[^;]+;?/gi, "").trim();
      const replacement = `style=${quote}background: #ffffff; color: #000000; border-radius: 6px; ${cleanSt}${quote}`;
      newAttrs = newAttrs.replace(styleMatch[0], replacement);
    } else {
      newAttrs += ` style="background: #ffffff; color: #000000; border-radius: 6px;"`;
    }
    return `<svg${newAttrs}>`;
  });

  // 2. Outer canvas background rectangle
  // Replaces the prominent dark canvas rect: <rect width="540" ... fill="#0f172a" ...>
  s = s.replace(
    /(<rect\b[^>]*?\bwidth=["'](540|100%|520)["'][^>]*?)(fill=["']#(0f172a|1e293b|090d16|020617|000000)["'])([^>]*?>)/gi,
    (match, prefix, w, fillAttr, hex, suffix) => {
      // Clean up stroke on outer border to crisp black/dark gray
      let updated = prefix + `fill="#ffffff"` + suffix;
      updated = updated.replace(/stroke=["']#[a-f0-9]+["']/gi, 'stroke="#000000"');
      if (!/stroke=/i.test(updated)) {
        updated = updated.replace(/\/>$/, ' stroke="#000000" stroke-width="1.5"/>');
      }
      return updated;
    }
  );

  // Catch any other full-size background rect at the very beginning of the SVG
  s = s.replace(
    /(<svg[^>]*>[\s\n]*)(<rect\b[^>]*?\bfill=["']#(0f172a|1e293b|090d16|020617|0b1120)["'][^>]*?>)/gi,
    (match, svgTag, rectTag) => {
      let cleanRect = rectTag
        .replace(/fill=["']#[a-f0-9]+["']/gi, 'fill="#ffffff"')
        .replace(/stroke=["']#[a-f0-9]+["']/gi, 'stroke="#000000"');
      if (!/stroke=/i.test(cleanRect)) {
        cleanRect = cleanRect.replace(/\/>$/, ' stroke="#000000" stroke-width="1.5"/>');
      }
      return svgTag + cleanRect;
    }
  );

  // 3. Inner dark containers, panels, boxes, and instrument frames
  // Dark fills (#0f172a, #1e293b, #090d16, #020617, #334155, rgba(15, 23, 42, ...)) -> #f8fafc or #ffffff
  s = s.replace(
    /\bfill=["'](#0f172a|#1e293b|#090d16|#020617|#0b1120|#030712|#000000|rgba\(\s*15\s*,\s*23\s*,\s*42\s*,\s*[\d\.]+\))["']/gi,
    'fill="#f8fafc"'
  );

  // 4. Subtle framing strokes on panels & boxes
  // stroke="#334155", stroke="#475569", stroke="#1e293b" -> stroke="#000000" or stroke="#475569"
  s = s.replace(/\bstroke=["']#(334155|475569|1e293b|0f172a)["']/gi, 'stroke="#000000"');

  // 5. Gridlines: dark gridlines (#1e293b, #334155) -> crisp light gray (#cbd5e1)
  // Look for dashed gridlines or coordinate grid
  s = s.replace(
    /(<line\b[^>]*?\bstroke=["'])#(1e293b|334155|475569)(["'][^>]*?\bstroke-dasharray)/gi,
    '$1#cbd5e1$3'
  );

  // 6. Coordinate Axes & Arrowheads
  // Axes: stroke="#94a3b8" on lines/paths -> stroke="#000000"
  // Arrowheads: fill="#94a3b8" on polygons/markers -> fill="#000000"
  s = s.replace(
    /(<line\b[^>]*?\bstroke=["'])#94a3b8(["'])/gi,
    '$1#000000$2'
  );
  s = s.replace(
    /(<polygon\b[^>]*?\bfill=["'])#(94a3b8|cbd5e1|64748b)(["'])/gi,
    '$1#000000$3'
  );

  // 7. Wires, Circuit Connectors, Rays, Vectors, and Indicators
  // Convert colored strokes on paths, lines, and rects to solid jet black for printing
  s = s.replace(
    /(<(?:path|line|rect|polygon)\b[^>]*?\bstroke=["'])#(?:facc15|f59e0b|fbbf24|38bdf8|2dd4bf|06b6d4|0284c7|10b981|34d399|60a5fa|818cf8|a5b4fc|ef4444|ec4899|f43f5e|cbd5e1)(["'])/gi,
    '$1#000000$2'
  );
  s = s.replace(
    /(<polygon\b[^>]*?\bfill=["'])#(?:facc15|f59e0b|fbbf24|38bdf8|06b6d4|10b981|ef4444|94a3b8)(["'])/gi,
    '$1#000000$2'
  );

  // 8. Apparatus Glassware & Liquids
  // Glass vessels, beakers, burettes: stroke="#94a3b8" -> stroke="#000000" (width 2)
  // Solution / liquid fills: translucent blues/greens/reds -> light clean toner shading (#f1f5f9 or #e2e8f0)
  s = s.replace(
    /\bfill=["'](rgba\(\s*(?:56|59|16|236|245|239|250)\s*,\s*[\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+\)|#0284c7|#0369a1|#0284c755|#38bdf833|#0d9488|#6366f1)["']/gi,
    'fill="#f1f5f9"'
  );

  // 9. Spheres, Atoms, Particles, and Electrodes:
  // Convert colored atom spheres to crisp white or light gray with solid black borders
  s = s.replace(
    /(<circle\b[^>]*?\br=["'](?:1[2-9]|2[0-9]|3[0-9])["'][^>]*?)\bfill=["'][^"']*["']/gi,
    '$1fill="#ffffff"'
  );
  s = s.replace(
    /(<circle\b[^>]*?\br=["'](?:1[2-9]|2[0-9]|3[0-9])["'][^>]*?)\bstroke=["'][^"']*["']/gi,
    '$1stroke="#000000"'
  );

  // Remove glossy glare reflection circles that become muddy spots on copiers
  s = s.replace(
    /<circle\b[^>]*?\bfill=["']#(?:bae6fd|ccfbf1|fed7aa|fef08a|ffffff)["'][^>]*?\bopacity=["']0\.[0-9]+["'][^>]*?>/gi,
    ''
  );

  // 10. All Text Elements: Convert to Pure Solid Black (#000000) with High Contrast Font-Weight
  // In printing & copiers, light-colored or white text is completely illegible or washed out.
  s = s.replace(/<text\b([^>]*)>(.*?)<\/text>/gis, (match, attrs, content) => {
    let cleanAttrs = attrs;
    // Replace fill color with #000000
    if (/\bfill=["'][^"']*["']/i.test(cleanAttrs)) {
      cleanAttrs = cleanAttrs.replace(/\bfill=["'][^"']*["']/gi, 'fill="#000000"');
    } else {
      cleanAttrs += ' fill="#000000"';
    }

    // Ensure font-weight is at least 700 for razor-sharp photocopier reproduction
    if (/\bfont-weight=["'][^"']*["']/i.test(cleanAttrs)) {
      cleanAttrs = cleanAttrs.replace(/\bfont-weight=["'][^"']*["']/gi, 'font-weight="700"');
    } else {
      cleanAttrs += ' font-weight="700"';
    }

    return `<text${cleanAttrs}>${content}</text>`;
  });

  // 11. Digital monitor/meter displays:
  // e.g. voltmeter circle, thermometer bulb, digital LED text
  // Ensure digital meter circles/rectangles have white face and solid black border
  s = s.replace(
    /(<circle\b[^>]*?\br=["'](?:20|22|24|25|28|30|32)["'][^>]*?)\bfill=["'][^"']*["']/gi,
    '$1fill="#ffffff"'
  );
  s = s.replace(
    /(<circle\b[^>]*?\br=["'](?:20|22|24|25|28|30|32)["'][^>]*?)\bstroke=["'][^"']*["']/gi,
    '$1stroke="#000000"'
  );

  // 12. Curves and plot data paths:
  // Primary data curves (#38bdf8, #10b981, #ef4444, #ec4899)
  // Ensure curves have strong stroke-width (>= 2.5px) and dark toner contrast
  s = s.replace(
    /(<path\b[^>]*?\bfill=["']none["'][^>]*?\bstroke=["'])#(?:38bdf8|10b981|0284c7|06b6d4|ef4444|ec4899|f43f5e|f59e0b)(["'])/gi,
    '$1#000000$2'
  );

  // 13. Point Callout / Data Nodes
  // Nodes on curves: circle cx="..." cy="..." r="4.5" fill="..."
  s = s.replace(
    /(<circle\b[^>]*?\br=["'](?:4|4\.5|5|5\.5|6)["'][^>]*?)\bfill=["']#(?:38bdf8|34d399|f59e0b|ef4444|10b981|000000)["']/gi,
    '$1fill="#000000" stroke="#000000"'
  );

  // 13. Inject embedded CSS print override stylesheet inside the SVG
  // This guarantees that any SVG rendering engine (browser print, PDF generator, Word/DOCX)
  // strictly enforces publication textbook styles even if any inline style remains.
  const printStyleBlock = `
  <style>
    /* Textbook Publication Mode: High-Contrast Black & White Line-Art */
    svg { background-color: #ffffff !important; }
    text { fill: #000000 !important; font-weight: 700 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; }
    rect:first-child { fill: #ffffff !important; stroke: #000000 !important; }
  </style>`;

  if (!s.includes("<style>")) {
    s = s.replace(/<svg\b([^>]*)>/i, `<svg$1>${printStyleBlock}`);
  }

  return s;
}
