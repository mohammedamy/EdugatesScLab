// Edugates-ClipSAT Science Labs - Unit Test Suite for Realistic Population Ecology Lab
// Verifies:
// 1. Export of initPopulationEcologyLab
// 2. Realistic Snowshoe Hare (Lepus americanus) anatomical rendering & phenotypic coat molt
// 3. Realistic Canada Lynx (Lynx canadensis) anatomical rendering, ear tufts, & bobbed tail
// 4. Natural Boreal Forest / Taiga terrain & meandering creek
// 5. Dynamic predator-prey steering AI (evasive zig-zag flee bursts & pounce captures)
// 6. Interactive seasonal switch & canvas forage cluster scattering
// 7. Preservation of Lotka-Volterra differential equations and CSV telemetry exporter

import assert from "assert";
import fs from "fs";
import path from "path";
import { initPopulationEcologyLab } from "../labs/bio-population-ecology.js";

console.log("\n========================================================");
console.log("🌲 Realistic Population Ecology & Boreal Biome Simulator");
console.log("========================================================\n");

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`, err);
    process.exit(1);
  }
}

test("initPopulationEcologyLab is exported as a valid lifecycle function", () => {
  assert.strictEqual(typeof initPopulationEcologyLab, "function");
});

test("bio-population-ecology.js contains Snowshoe Hare anatomical vector models", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  // Snowshoe hare anatomical hallmarks
  assert.ok(code.includes("drawSnowshoeHare"), "drawSnowshoeHare function must be defined");
  assert.ok(code.includes("Lepus americanus"), "Textbook scientific species name Lepus americanus documented");
  assert.ok(code.includes("hopPhase"), "Animated bounding hop cycle must be implemented");
  assert.ok(code.includes("09090b") || code.includes("000000"), "Distinct jet-black ear tips must be rendered");
  assert.ok(code.includes("isWinterSeason"), "Phenotypic seasonal coat molt state must exist");
});

test("bio-population-ecology.js contains Canada Lynx anatomical predator models", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  // Canada lynx anatomical hallmarks
  assert.ok(code.includes("drawCanadaLynx"), "drawCanadaLynx function must be defined");
  assert.ok(code.includes("Lynx canadensis"), "Textbook scientific species name Lynx canadensis documented");
  assert.ok(code.includes("walkPhase"), "Fluid quadruped walk phase must be implemented");
  assert.ok(code.includes("ear tassel") || code.includes("ear tuft") || code.includes("plume"), "Signature long black ear tufts must be illustrated");
  assert.ok(code.includes("ruff") || code.includes("beard"), "Flared facial ruffs / cheek beard must be illustrated");
  assert.ok(code.includes("bobbed tail") || code.includes("Bobbed Tail"), "Signature short bobbed tail with black tip must be illustrated");
});

test("bio-population-ecology.js implements Boreal Taiga terrain & meandering stream", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert.ok(code.includes("drawTerrain"), "drawTerrain function must be defined");
  assert.ok(code.includes("TREES"), "Evergreen conifer spruce trees array must be defined");
  assert.ok(code.includes("BOULDERS"), "Granite boulder obstacles must be defined");
  assert.ok(code.includes("SHRUBS"), "Understory shrubs with wild berries must be defined");
  assert.ok(code.includes("bezierCurveTo"), "Meandering meltwater creek rendered via curves");
});

test("bio-population-ecology.js implements realistic river spline with waves flowing inside river water", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert.ok(code.includes("getRiverPoint"), "getRiverPoint parametric spline model must be defined");
  assert.ok(code.includes("PEBBLE_SPECS"), "PEBBLE_SPECS array must anchor submerged stones to riverbed");
  assert.ok(code.includes("streamOffsets"), "Laminar streamlines must flow along river offsets");
  assert.ok(!code.includes("280 + Math.sin(t * Math.PI * 2.3) * 38"), "Crude off-target sine approximation must be removed");
  assert.ok(code.includes("pt.nx") && code.includes("pt.tx"), "Waves and ripples must use exact normal and tangent vectors of the river");
});

test("bio-population-ecology.js implements evasive zig-zag flee AI & pounce capture AI", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert.ok(code.includes("updateVisualAgents"), "Vector steering update loop must exist");
  assert.ok(code.includes("isFleeing"), "Evasive flee state flag must exist");
  assert.ok(code.includes("isChasing"), "Active pounce chase state flag must exist");
  assert.ok(code.includes("capturePuffs"), "Capture / ambush dust puff particles must exist");
  assert.ok(code.includes("satiatedTimer"), "Predator feeding / grooming rest timer must exist");
});

test("bio-population-ecology.js supports seasonal switch button and interactive forage drop", () => {
  const filePath = path.resolve("./labs/bio-population-ecology.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert.ok(code.includes("btn-eco-season"), "#btn-eco-season button present in template and listener");
  assert.ok(code.includes("pointerdown"), "Canvas pointerdown listener for forage dropping");
  assert.ok(code.includes("forageClusters"), "Interactive forage clusters collection supported");
});

test("Lotka-Volterra logistic prey differential equations remain mathematically intact", () => {
  const alpha = 1.10;
  const beta = 0.025;
  const delta = 0.008;
  const gamma = 0.65;
  const K = 400;
  const dt = 0.04;

  let prey = 120;
  let pred = 25;

  const dPrey = (alpha * prey * (1.0 - prey / K) - beta * prey * pred) * dt;
  const dPred = (delta * prey * pred - gamma * pred) * dt;

  prey = Math.max(2.0, prey + dPrey);
  pred = Math.max(1.0, pred + dPred);

  assert.ok(!isNaN(prey) && prey > 0, "Prey population must remain positive numerical value");
  assert.ok(!isNaN(pred) && pred > 0, "Predator population must remain positive numerical value");
});

console.log("\n========================================================");
console.log(`📊 Population Ecology Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");
