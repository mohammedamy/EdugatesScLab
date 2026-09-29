// Provide mock browser environment for Node.js test execution
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
  };
}
if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}
if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      style: {},
      classList: { add: () => {}, remove: () => {} }
    }),
    body: { appendChild: () => {} }
  };
}

// Unit test suite for Science Calculator evaluation engine
import { evaluateScienceExpression, SCIENCE_CONSTANTS } from "../components/science-calculator.js";

console.log("\n========================================================");
console.log("🧮 Science Calculator Mathematical Engine Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// 1. Basic Arithmetic
const r1 = evaluateScienceExpression("2 + 3 * 4");
assert(r1.success && r1.result === 14, `Order of operations: 2 + 3 * 4 = 14 (Got: ${r1.result})`);

const r2 = evaluateScienceExpression("(10 - 2) / 4");
assert(r2.success && r2.result === 2, `Parentheses: (10 - 2) / 4 = 2 (Got: ${r2.result})`);

// 2. Unary minus & negation
const r3 = evaluateScienceExpression("-5 + 12");
assert(r3.success && r3.result === 7, `Unary minus: -5 + 12 = 7 (Got: ${r3.result})`);

const r4 = evaluateScienceExpression("4 * -2");
assert(r4.success && r4.result === -8, `Multiplication with negative: 4 * -2 = -8 (Got: ${r4.result})`);

// 3. Powers and Roots
const r5 = evaluateScienceExpression("2 ^ 10");
assert(r5.success && r5.result === 1024, `Power: 2 ^ 10 = 1024 (Got: ${r5.result})`);

const r6 = evaluateScienceExpression("sqrt(144)");
assert(r6.success && r6.result === 12, `Square root: sqrt(144) = 12 (Got: ${r6.result})`);

const r7 = evaluateScienceExpression("cbrt(27)");
assert(r7.success && r7.result === 3, `Cube root: cbrt(27) = 3 (Got: ${r7.result})`);

// 4. Factorial
const r8 = evaluateScienceExpression("5!");
assert(r8.success && r8.result === 120, `Factorial: 5! = 120 (Got: ${r8.result})`);

// 5. Trigonometry in Degrees
const r9 = evaluateScienceExpression("sin(30)", "DEG");
assert(r9.success && Math.abs(r9.result - 0.5) < 1e-6, `sin(30°) = 0.5 (Got: ${r9.result})`);

const r10 = evaluateScienceExpression("cos(60)", "DEG");
assert(r10.success && Math.abs(r10.result - 0.5) < 1e-6, `cos(60°) = 0.5 (Got: ${r10.result})`);

const r11 = evaluateScienceExpression("tan(45)", "DEG");
assert(r11.success && Math.abs(r11.result - 1) < 1e-6, `tan(45°) = 1 (Got: ${r11.result})`);

const r12 = evaluateScienceExpression("asin(0.5)", "DEG");
assert(r12.success && Math.abs(r12.result - 30) < 1e-6, `asin(0.5) = 30° (Got: ${r12.result})`);

// 6. Trigonometry in Radians
const r13 = evaluateScienceExpression("sin(pi / 2)", "RAD");
assert(r13.success && Math.abs(r13.result - 1) < 1e-6, `sin(π/2 rad) = 1 (Got: ${r13.result})`);

// 7. Logarithms
const r14 = evaluateScienceExpression("log(1000)");
assert(r14.success && Math.abs(r14.result - 3) < 1e-6, `log10(1000) = 3 (Got: ${r14.result})`);

const r15 = evaluateScienceExpression("ln(e)");
assert(r15.success && Math.abs(r15.result - 1) < 1e-6, `ln(e) = 1 (Got: ${r15.result})`);

// 8. Scientific Notation (EE)
const r16 = evaluateScienceExpression("6.022e23 * 2");
assert(r16.success && Math.abs(r16.result - 1.2044e24) / 1.2044e24 < 1e-6, `Scientific notation: 6.022e23 * 2 (Got: ${r16.text})`);

const r17 = evaluateScienceExpression("1.6e-19 * 1e19");
assert(r17.success && Math.abs(r17.result - 1.6) < 1e-6, `Scientific negative exponent: 1.6e-19 * 1e19 = 1.6 (Got: ${r17.result})`);

// 9. Science Constants
const r18 = evaluateScienceExpression("c");
assert(r18.success && r18.result === 299792458, `Constant c = 299,792,458 m/s (Got: ${r18.result})`);

const r19 = evaluateScienceExpression("h * c / (500e-9)");
assert(r19.success && r19.result > 0, `Photon energy equation: E = hc/λ (Got: ${r19.text})`);

// 10. Error Handling
const r20 = evaluateScienceExpression("10 / 0");
assert(!r20.success, `Division by zero handled cleanly (Got error: ${r20.error})`);

const r21 = evaluateScienceExpression("sqrt(-4)");
assert(!r21.success, `Negative square root handled cleanly (Got error: ${r21.error})`);

console.log("\n========================================================");
console.log(`📊 Calculator Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
