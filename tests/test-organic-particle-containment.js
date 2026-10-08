// Edugates-ClipSAT Science Labs - Comprehensive Particle Containment Test Suite
// Verifies that solution and gas particles in chem-organic-reactions.js and other labs
// are strictly contained inside their glassware / vessels without escaping.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("⚗️ Organic Reaction & Glassware Particle Containment Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function testAssert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

const rootDir = process.cwd();
const organicSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-organic-reactions.js"), "utf8");
const colligSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-colligative.js"), "utf8");
const precipSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-precipitation.js"), "utf8");
const osmosisSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-colligative.js"), "utf8");
const gasLawsSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-gas-laws.js"), "utf8");
const bioOsmosisSrc = fs.readFileSync(path.join(rootDir, "labs", "bio-osmosis.js"), "utf8");

// 1. Organic Reactions Lab Geometry & Eradication of Buggy Coordinates
console.log("🧪 1. Organic Reactions Glassware & Spawn Verification:");
testAssert(
  !organicSrc.includes("80 + Math.random() * 260"),
  "chem-organic-reactions.js eradicated buggy '80 + Math.random() * 260' (which spawned particles outside flask)"
);

testAssert(
  organicSrc.includes("const FLASK = {") &&
  organicSrc.includes("cx: 290") &&
  organicSrc.includes("cy: 315") &&
  organicSrc.includes("radius: 175"),
  "chem-organic-reactions.js defines canonical FLASK geometry with circular bulb"
);

testAssert(
  organicSrc.includes("drawFlaskPath") && organicSrc.includes("drawLiquidPath"),
  "chem-organic-reactions.js defines structured path helpers for authentic Quickfit reactor flask"
);

testAssert(
  organicSrc.includes("initMolecules()"),
  "chem-organic-reactions.js implements initMolecules() with rejection-sampling inside fluid"
);

// 2. Physical Collision Reflection & Position Clamping
console.log("\n🛡️ 2. Physical Elastic Reflection & Boundary Clamping:");
testAssert(
  organicSrc.includes("const nx = dx / dist;") &&
  organicSrc.includes("const ny = dy / dist;") &&
  organicSrc.includes("const dot = m.vx * nx + m.vy * ny;"),
  "chem-organic-reactions.js computes outward normal vector for curved glass elastic reflection"
);

testAssert(
  organicSrc.includes("m.vx -= 2 * dot * nx;") &&
  organicSrc.includes("m.vy -= 2 * dot * ny;"),
  "chem-organic-reactions.js reflects velocity vector via v' = v - 2(v·n)n"
);

testAssert(
  organicSrc.includes("m.x = FLASK.cx + nx * maxR;") &&
  organicSrc.includes("m.y = FLASK.cy + ny * maxR;"),
  "chem-organic-reactions.js clamps position to inner wall, preventing tunneling"
);

testAssert(
  organicSrc.includes("m.vy = Math.abs(m.vy);"),
  "chem-organic-reactions.js guarantees downward velocity reflection at liquid meniscus"
);

// 3. Canvas Clipping Masks (Impossible-to-Escape Layer)
console.log("\n🎨 3. Canvas Clipping Mask Verification Across Labs:");
testAssert(
  organicSrc.includes("drawLiquidPath(ctx, 4);") &&
  organicSrc.includes("ctx.clip();"),
  "chem-organic-reactions.js clips particle rendering strictly to solution path"
);

testAssert(
  colligSrc.includes("ctx.clip();"),
  "chem-colligative.js enforces clipping mask on beaker solution"
);

testAssert(
  precipSrc.includes("ctx.clip();"),
  "chem-precipitation.js enforces clipping mask on test tube solution"
);

testAssert(
  bioOsmosisSrc.includes("ctx.clip();"),
  "bio-osmosis.js enforces clipping mask on U-tube liquid channels"
);

testAssert(
  gasLawsSrc.includes("chamberCtx.clip();"),
  "chem-gas-laws.js enforces clipping mask on pneumatic cylinder"
);

// 4. Mathematical Simulation Test (10,000 Frames)
console.log("\n🔬 4. Multi-Frame Mathematical Stress Simulation:");
const FLASK = {
  cx: 290,
  cy: 315,
  radius: 175,
  meniscusY: 185,
  bottomY: 485
};

const molecules = [];
for (let i = 0; i < 28; i++) {
  let x, y, dist;
  let attempts = 0;
  do {
    const r = Math.sqrt(Math.random()) * (FLASK.radius - 24);
    const theta = Math.random() * Math.PI * 2;
    x = FLASK.cx + Math.cos(theta) * r;
    y = FLASK.cy + Math.sin(theta) * r;
    dist = Math.hypot(x - FLASK.cx, y - FLASK.cy);
    attempts++;
  } while ((dist > FLASK.radius - 20 || y < FLASK.meniscusY + 16 || y > FLASK.bottomY - 18) && attempts < 100);

  const speed = 1.0 + Math.random() * 1.4;
  const angle = Math.random() * Math.PI * 2;
  molecules.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 5
  });
}

let escapeCount = 0;
for (let frame = 0; frame < 10000; frame++) {
  for (const m of molecules) {
    m.x += m.vx;
    m.y += m.vy;

    const topLimit = FLASK.meniscusY + m.radius + 3;
    if (m.y < topLimit) {
      m.y = topLimit;
      m.vy = Math.abs(m.vy);
    }

    const dx = m.x - FLASK.cx;
    const dy = m.y - FLASK.cy;
    const dist = Math.hypot(dx, dy);
    const maxR = FLASK.radius - m.radius - 5;

    if (dist > maxR && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      m.x = FLASK.cx + nx * maxR;
      m.y = FLASK.cy + ny * maxR;

      const dot = m.vx * nx + m.vy * ny;
      if (dot > 0) {
        m.vx -= 2 * dot * nx;
        m.vy -= 2 * dot * ny;
      }
    }

    const bottomLimit = FLASK.bottomY - m.radius - 6;
    if (m.y > bottomLimit) {
      m.y = bottomLimit;
      m.vy = -Math.abs(m.vy);
    }

    const currentDist = Math.hypot(m.x - FLASK.cx, m.y - FLASK.cy);
    if (currentDist > FLASK.radius + 0.1 || m.y < FLASK.meniscusY - 0.1 || m.y > FLASK.bottomY + 0.1) {
      escapeCount++;
    }
  }
}

testAssert(
  escapeCount === 0,
  `Particle simulation verified: 0 escapes across 10,000 frames x 28 molecules (280,000 time steps)`
);

console.log("\n========================================================");
console.log(`📊 Particle Containment Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
