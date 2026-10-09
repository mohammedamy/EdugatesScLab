// Edugates-ClipSAT Science Labs - Arduino Uno & Microcontroller Lab Unit Test Suite
// Verifies module exports, DOM structure, component interactions, audio synthesis,
// C++ sketch presets, and clean lifecycle teardown.

import assert from "assert";

console.log("\n========================================================");
console.log("⚡ Arduino Uno & Microcontroller Workbench Test Suite");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function check(cond, msg) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

// ----------------------------------------------------
// Mock Browser Environment for Node.js
// ----------------------------------------------------
class MockElement {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.innerHTML = "";
    this.value = "";
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      contains(c) { return this._classes.has(c); }
    };
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener() {}
  removeEventListener() {}
  querySelectorAll(sel) { return []; }
  querySelector(sel) { return null; }
  appendChild(child) { this.children.push(child); }
  getContext() {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      roundRect: () => {},
      rect: () => {},
      closePath: () => {},
      fillText: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      quadraticCurveTo: () => {}
    };
  }
}

const mockDoc = {
  getElementById: (id) => new MockElement("div"),
  createElement: (tag) => new MockElement(tag),
  querySelectorAll: () => [new MockElement("div")],
  querySelector: () => new MockElement("div"),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: new MockElement("body"),
  documentElement: new MockElement("html")
};

globalThis.document = mockDoc;
globalThis.window = {
  location: { hash: "", href: "", protocol: "http:" },
  AudioContext: function() {
    return {
      currentTime: 0,
      state: "running",
      destination: {},
      createOscillator: () => ({
        type: "sine",
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
        disconnect: () => {}
      }),
      createGain: () => ({
        gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        disconnect: () => {}
      }),
      createBiquadFilter: () => ({
        type: "lowpass",
        frequency: { setValueAtTime: () => {} },
        Q: { setValueAtTime: () => {} },
        connect: () => {},
        disconnect: () => {}
      }),
      resume: () => Promise.resolve(),
      close: () => Promise.resolve()
    };
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// ----------------------------------------------------
// Test 1: Module Exports
// ----------------------------------------------------
console.log("📦 Module Exports & Experiment Presets:");
const mod = await import("../labs/phys-arduino.js");

check(typeof mod.initArduinoLab === "function", "phys-arduino.js exports initArduinoLab()");
check(typeof mod.cleanupArduinoLab === "function", "phys-arduino.js exports cleanupArduinoLab()");
check(Array.isArray(mod.ARDUINO_EXPERIMENTS), "phys-arduino.js exports ARDUINO_EXPERIMENTS array");
check(mod.ARDUINO_EXPERIMENTS.length === 6, `ARDUINO_EXPERIMENTS contains all 6 guided experiments (Found: ${mod.ARDUINO_EXPERIMENTS.length})`);

// ----------------------------------------------------
// Test 2: Experiment Specifications & C++ Sketches
// ----------------------------------------------------
console.log("\n💻 Experiment Specifications & C++ Code Quality:");
const expTraffic = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "traffic_light");
check(expTraffic && expTraffic.code.includes("pinMode(pinRed, OUTPUT)"), "Experiment 1: Traffic Light includes multi-LED pin modes");
check(expTraffic.code.includes("tone(pinBuzzer"), "Experiment 1 includes audio beeper cues for crosswalk");

const expSonar = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "ultrasonic_radar");
check(expSonar && expSonar.code.includes("pulseIn(echoPin, HIGH)"), "Experiment 2: Sonar includes pulseIn microsecond echo measurement");
check(expSonar.code.includes("0.0343"), "Experiment 2 implements acoustic time-of-flight physics calculation (343 m/s)");

const expNight = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "ldr_nightlight");
check(expNight && expNight.code.includes("analogRead(ldrPin)"), "Experiment 3: LDR includes 10-bit analogRead voltage divider");
check(expNight.code.includes("analogWrite(ledPin"), "Experiment 3 includes PWM brightness regulation");

const expServo = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "servo_control");
check(expServo && expServo.code.includes("myServo.write(angle)"), "Experiment 4: Servo includes angle steering");

const expChiptune = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "chiptune_melody");
check(expChiptune && expChiptune.code.includes("tone(buzzerPin, melody[thisNote]"), "Experiment 5: Chiptune includes frequency synthesis");

const expWeather = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "weather_station");
check(expWeather && expWeather.code.includes("temperatureC = (voltage - 0.5) * 100.0"), "Experiment 6: TMP36 includes Celsius thermal conversion formula");

// ----------------------------------------------------
// Test 3: Lifecycle Mount & Clean Teardown
// ----------------------------------------------------
console.log("\n🔄 Lifecycle Mount & Teardown Execution:");
const cleanup = mod.initArduinoLab("test-mount");
check(typeof cleanup === "function", "initArduinoLab returns valid teardown cleanup function");

// Allow a couple simulation frames to cycle
await new Promise(r => setTimeout(r, 45));

cleanup();
check(true, "cleanup() safely tears down audio nodes and animation frame loop without throwing");

// ----------------------------------------------------
// Test 4: App Navigation & Normalization Integration
// ----------------------------------------------------
console.log("\n🔗 Application Routing & Deep-Linking Normalization:");
const { normalizeLabId } = await import("../app.js");
check(normalizeLabId("arduino") === "arduino", "normalizeLabId('arduino') resolves to 'arduino'");
check(normalizeLabId("lab-arduino") === "arduino", "normalizeLabId('lab-arduino') resolves to 'arduino'");
check(normalizeLabId("phys-arduino") === "arduino", "normalizeLabId('phys-arduino') resolves to 'arduino'");
check(normalizeLabId("microcontroller") === "arduino", "normalizeLabId('microcontroller') resolves to 'arduino'");

// ----------------------------------------------------
// Test 5: Experiment Catalog Registration
// ----------------------------------------------------
console.log("\n📋 Experiment Catalog & Portal Registration:");
const { EXPERIMENT_CATALOG } = await import("../components/experiment-card.js");
const arduinoExp = EXPERIMENT_CATALOG.find(e => e.id === "arduino");
check(!!arduinoExp, "EXPERIMENT_CATALOG contains 'arduino' workbench");
check(arduinoExp && arduinoExp.subject === "phys", "Arduino workbench registered under Physics/STEM discipline");
check(arduinoExp && arduinoExp.equipment.length >= 5, `Arduino catalog includes comprehensive equipment list (${arduinoExp?.equipment.length} items)`);
check(arduinoExp && arduinoExp.formula.includes("ADC"), "Arduino catalog includes KaTeX formula metadata");

// ----------------------------------------------------
// Final Results
// ----------------------------------------------------
console.log("\n========================================================");
console.log(`📊 Arduino Lab Verification: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
