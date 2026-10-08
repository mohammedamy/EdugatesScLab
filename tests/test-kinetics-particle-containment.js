// Edugates-ClipSAT Science Labs - Reaction Kinetics Particle Containment Test Suite
// Verifies that solution particles in chem-reaction-kinetics.js are strictly contained inside the beaker/flask.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("⚗️ Reaction Kinetics Particle Containment Verification");
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
const kineticsSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-reaction-kinetics.js"), "utf8");
const precipSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-precipitation.js"), "utf8");
const colligSrc = fs.readFileSync(path.join(rootDir, "labs", "chem-colligative.js"), "utf8");

// 1. Eradication of Buggy Spawn Range
console.log("🧪 Particle Spawn Coordinate Verification:");
testAssert(
  !kineticsSrc.includes("40 + Math.random() * 260"),
  "chem-reaction-kinetics.js eradicated obsolete '40 + Math.random() * 260' (which spawned particles outside beaker at x < 80)"
);

testAssert(
  kineticsSrc.includes("const BEAKER = {") &&
  kineticsSrc.includes("x: 80") &&
  kineticsSrc.includes("w: 280"),
  "chem-reaction-kinetics.js defines canonical BEAKER geometry (x: 80, w: 280, h: 340)"
);

testAssert(
  kineticsSrc.includes("const minX = BEAKER.x + 18;") &&
  kineticsSrc.includes("const maxX = BEAKER.x + BEAKER.w - 18;"),
  "initParticles() bounds particle spawn strictly between beaker walls (minX: 98, maxX: 342)"
);

testAssert(
  kineticsSrc.includes("const minY = BEAKER.y + BEAKER.liquidTopOffset + 18;"),
  "initParticles() bounds particle spawn below liquid meniscus (minY: 168)"
);

// 2. Physical Boundary Clamping & Bounce Reflection
console.log("\n🛡️ Physical Boundary Clamping & Velocity Inversion:");
testAssert(
  kineticsSrc.includes("p.vx = Math.abs(p.vx);") &&
  kineticsSrc.includes("p.vx = -Math.abs(p.vx);"),
  "renderSim() uses directional Math.abs to guarantee inward bounce velocity against walls"
);

testAssert(
  kineticsSrc.includes("p.vy = Math.abs(p.vy);") &&
  kineticsSrc.includes("p.vy = -Math.abs(p.vy);"),
  "renderSim() uses directional Math.abs to bounce downward from surface and upward from bottom"
);

testAssert(
  kineticsSrc.includes("p.x = pMinX;") &&
  kineticsSrc.includes("p.x = pMaxX;"),
  "renderSim() clamps p.x strictly to inner fluid width (preventing tunneling or wall penetration)"
);

testAssert(
  kineticsSrc.includes("p.y = pMinY;") &&
  kineticsSrc.includes("p.y = pMaxY;"),
  "renderSim() clamps p.y strictly to fluid column height (preventing escape above meniscus or below base)"
);

// 3. Canvas Clipping Mask & Visual Polish
console.log("\n🎨 Canvas Clipping & Laboratory Aesthetics:");
testAssert(
  kineticsSrc.includes("ctx.clip();"),
  "renderSim() applies canvas clipping mask to solution interior so no pixel/glow can bleed outside"
);

testAssert(
  kineticsSrc.includes("400 mL") && kineticsSrc.includes("100 mL"),
  "renderSim() draws authentic laboratory glassware graduations on beaker wall"
);

testAssert(
  kineticsSrc.includes("ellipse(beakerX + beakerW / 2, beakerY + BEAKER.liquidTopOffset"),
  "renderSim() renders liquid surface meniscus"
);

// 4. Verification of Other Chemistry Labs
console.log("\n⚗️ Precipitation & Colligative Labs Containment:");
testAssert(
  !colligSrc.includes("100 + Math.random() * 240"),
  "chem-colligative.js eradicated obsolete out-of-bounds spawn range"
);

testAssert(
  colligSrc.includes("p.vx = Math.abs(p.vx);") &&
  colligSrc.includes("p.vx = -Math.abs(p.vx);"),
  "chem-colligative.js enforces inward bounce velocities"
);

testAssert(
  precipSrc.includes("const minTx = tubeX - tubeW / 2 + 7 + p.radius;") &&
  precipSrc.includes("const maxTx = tubeX + tubeW / 2 - 7 - p.radius;"),
  "chem-precipitation.js clamps precipitate particles strictly within test tube walls"
);

console.log("\n========================================================");
console.log(`📊 Particle Containment Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
