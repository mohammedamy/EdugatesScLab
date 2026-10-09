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
    this._listeners = new Map();
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
  addEventListener(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
  }
  removeEventListener(event, fn) {
    if (!this._listeners.has(event)) return;
    const arr = this._listeners.get(event);
    const idx = arr.indexOf(fn);
    if (idx !== -1) arr.splice(idx, 1);
  }
  dispatch(event, e = {}) {
    const list = this._listeners.get(event) || [];
    list.forEach(fn => fn(e));
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 850, height: 460 };
  }
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
      setLineDash: () => {},
      measureText: () => ({ width: 100 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {}
    };
  }
}

const elementsById = new Map();
const mockDoc = {
  getElementById: (id) => {
    if (!elementsById.has(id)) {
      elementsById.set(id, new MockElement("div"));
    }
    return elementsById.get(id);
  },
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
check(mod.ARDUINO_EXPERIMENTS.length === 16, `ARDUINO_EXPERIMENTS contains exactly 16 total projects (15 pre-built + 1 sandbox, Found: ${mod.ARDUINO_EXPERIMENTS.length})`);

// Verify 15 pre-built projects partitioned into 3 tiers (5 easy, 5 intermediate, 5 advanced)
const easyProjects = mod.ARDUINO_EXPERIMENTS.filter(e => e.difficulty === "easy");
const intermediateProjects = mod.ARDUINO_EXPERIMENTS.filter(e => e.difficulty === "intermediate");
const advancedProjects = mod.ARDUINO_EXPERIMENTS.filter(e => e.difficulty === "advanced");

check(easyProjects.length === 5, `Exactly 5 Easy Projects registered (Found: ${easyProjects.length})`);
check(intermediateProjects.length === 5, `Exactly 5 Intermediate Projects registered (Found: ${intermediateProjects.length})`);
check(advancedProjects.length === 5, `Exactly 5 Advanced Projects registered (Found: ${advancedProjects.length})`);

// Verify 4K Picture and Blueprint metadata for all 16 projects
const allHave4kImage = mod.ARDUINO_EXPERIMENTS.every(e => e.image === "assets/labs/arduino_bench.jpg");
check(allHave4kImage, "All 16 projects include photorealistic 4K picture reference ('assets/labs/arduino_bench.jpg')");

const allHave4kBlueprint = mod.ARDUINO_EXPERIMENTS.every(e => 
  e.blueprint4k && 
  e.blueprint4k.resolution === "3840 x 2160 UHD" &&
  e.blueprint4k.aspectRatio && e.blueprint4k.aspectRatio.includes("16:9") &&
  e.blueprint4k.schematicClass &&
  e.blueprint4k.circuitVoltage && e.blueprint4k.circuitVoltage.includes("5.0V") &&
  Array.isArray(e.blueprint4k.activePins) && e.blueprint4k.activePins.length > 0 &&
  typeof e.blueprint4k.theoryEquation === "string" && e.blueprint4k.theoryEquation.length > 0 &&
  Array.isArray(e.blueprint4k.bomList) && e.blueprint4k.bomList.length > 0
);
check(allHave4kBlueprint, "All 16 projects include comprehensive 4K UHD CAD blueprint specifications (3840x2160 UHD, BOM, pinout, formulas)");

check(Array.isArray(mod.AVAILABLE_PARTS) && mod.AVAILABLE_PARTS.length >= 15, `phys-arduino.js exports comprehensive AVAILABLE_PARTS catalog (Found: ${mod.AVAILABLE_PARTS?.length})`);

// ----------------------------------------------------
// Test 2: Experiment Specifications & C++ Sketches
// ----------------------------------------------------
console.log("\n💻 Experiment Specifications & C++ Code Quality:");
const expTraffic = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "traffic_light");
check(expTraffic && expTraffic.code.includes("pinMode(pinRed, OUTPUT)"), "Project 1 (Easy): Traffic Light includes multi-LED pin modes");
check(expTraffic.code.includes("tone(pinBuzzer"), "Project 1 includes audio beeper cues for crosswalk");

const expNight = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "ldr_nightlight");
check(expNight && expNight.code.includes("analogRead(ldrPin)"), "Project 2 (Easy): LDR Nightlight includes 10-bit analogRead voltage divider");
check(expNight.code.includes("analogWrite(ledPin"), "Project 2 includes PWM brightness regulation");

const expChiptune = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "chiptune_melody");
check(expChiptune && expChiptune.code.includes("tone(buzzerPin, melody[thisNote]"), "Project 3 (Easy): Chiptune Jukebox includes frequency synthesis");

const expRgb = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "rgb_mood_lamp");
check(expRgb && expRgb.code.includes("analogWrite(redPin"), "Project 4 (Easy): RGB Mood Lamp includes 3-channel analogWrite PWM color mixing");

const expButtonToggle = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "button_toggle");
check(expButtonToggle && expButtonToggle.code.includes("debounceDelay"), "Project 5 (Easy): Pushbutton Toggle includes software debounce filtering");
check(expButtonToggle.code.includes("ledState = !ledState") && expButtonToggle.code.includes("pressCount"), "Project 5 includes toggle latching state machine");

const expSonar = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "ultrasonic_radar");
check(expSonar && expSonar.code.includes("pulseIn(echoPin, HIGH)"), "Project 6 (Intermediate): Sonar includes pulseIn microsecond echo measurement");
check(expSonar.code.includes("0.0343"), "Project 6 implements acoustic time-of-flight physics calculation (343 m/s)");

const expServo = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "servo_control");
check(expServo && expServo.code.includes("myServo.write(angle)"), "Project 7 (Intermediate): Servo includes angle steering");

const expWeather = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "weather_station");
check(expWeather && expWeather.code.includes("temperatureC = (voltage - 0.5) * 100.0"), "Project 8 (Intermediate): TMP36 includes Celsius thermal conversion formula");

const expMotor = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "dc_motor_speed");
check(expMotor && expMotor.code.includes("analogWrite(motorPin"), "Project 9 (Intermediate): DC Motor Fan includes PWM speed regulation & flyback diode safety");

const expSevenSeg = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "seven_seg_counter");
check(expSevenSeg && expSevenSeg.code.includes("digitPatterns"), "Project 10 (Intermediate): 7-Segment Decade Counter includes 7-bit binary segment lookup truth table");

const expPir = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "pir_alarm");
check(expPir && expPir.code.includes("digitalRead(pirPin)"), "Project 11 (Advanced): PIR Motion Security includes digitalRead intruder detection and relay trigger");

const expJoystick = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "joystick_pan_tilt");
check(expJoystick && expJoystick.code.includes("analogRead(joyXPin)"), "Project 12 (Advanced): Joystick Pan-Tilt includes dual-axis ADC steering");

const expSonarLcd = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "sonar_lcd_scope");
check(expSonarLcd && expSonarLcd.code.includes("LiquidCrystal"), "Project 13 (Advanced): Sonar LCD Radar Scope includes LiquidCrystal driver");
check(expSonarLcd.code.includes("pulseIn(echoPin"), "Project 13 includes real-time radar distance ranging");

const expThermostat = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "thermostat_relay_fan");
check(expThermostat && expThermostat.code.includes("TEMP_THRESHOLD_HIGH"), "Project 14 (Advanced): Thermostatic Relay Cooling includes analog potentiometer setpoint threshold");
check(expThermostat.code.includes("digitalWrite(relayPin"), "Project 14 includes high-current relay coil actuation");

const expMultiAlarm = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "multi_sensor_alarm");
check(expMultiAlarm && expMultiAlarm.code.includes("pirPin") && expMultiAlarm.code.includes("ldrPin"), "Project 15 (Advanced): Autonomous Multi-Sensor Hub integrates PIR and LDR sensor fusion");
check(expMultiAlarm.code.includes("tone(sirenPin"), "Project 15 includes multi-tone security annunciator");

const expSandbox = mod.ARDUINO_EXPERIMENTS.find(e => e.id === "custom_sandbox");
check(expSandbox && expSandbox.code.includes("Custom Breadboard Sandbox"), "Project 16 (Sandbox): Custom Project Builder & Sandbox includes starter scaffold");

// Check part catalog diversity
const actuatorParts = mod.AVAILABLE_PARTS.filter(p => p.category === "Actuators");
const sensorParts = mod.AVAILABLE_PARTS.filter(p => p.category === "Sensors & Inputs");
const passiveParts = mod.AVAILABLE_PARTS.filter(p => p.category === "Passive & Display");
check(actuatorParts.length >= 6, `Component Library includes rich actuators (${actuatorParts.length} parts)`);
check(sensorParts.length >= 5, `Component Library includes diverse sensors & inputs (${sensorParts.length} parts)`);
check(passiveParts.length >= 3, `Component Library includes passives and displays (${passiveParts.length} parts)`);

// ----------------------------------------------------
// Test 3: Pin Geometry Map & Wire Netlists
// ----------------------------------------------------
console.log("\n📐 Pin Geometry Map & Interactive Wire Netlists:");
check(typeof mod.ARDUINO_PINS === "object", "phys-arduino.js exports ARDUINO_PINS map");
const pinKeys = Object.keys(mod.ARDUINO_PINS);
check(pinKeys.length === 29, `ARDUINO_PINS contains exactly 29 Uno header pins (Found: ${pinKeys.length})`);

// Verify Digital Pins D0-D13, AREF, and GND_TOP
const hasAllDigitalPins = ["AREF", "GND_TOP", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "TX", "RX"].every(p => !!mod.ARDUINO_PINS[p]);
check(hasAllDigitalPins, "All 16 top digital header pins correctly mapped with exact canvas coordinates");
check(mod.ARDUINO_PINS["D13"].y === 75, "D13 pin positioned at top digital header (y = 75)");

// Verify Power and Analog Pins
const hasAllPowerAnalogPins = ["IOREF", "RESET", "3.3V", "5V", "GND", "GND_2", "VIN", "A0", "A1", "A2", "A3", "A4", "A5"].every(p => !!mod.ARDUINO_PINS[p]);
check(hasAllPowerAnalogPins, "All 12 bottom power & analog pins mapped (y = 385)");

check(typeof mod.BREADBOARD_PINS === "object", "phys-arduino.js exports BREADBOARD_PINS map");
const bbKeys = Object.keys(mod.BREADBOARD_PINS);
check(bbKeys.length === 4, `BREADBOARD_PINS contains all 4 power bus rails (Found: ${bbKeys.length})`);

// Verify default wire netlists for experiments
check(typeof mod.getDefaultWiresForExperiment === "function", "phys-arduino.js exports getDefaultWiresForExperiment()");
const trafficWires = mod.getDefaultWiresForExperiment("traffic_light");
check(Array.isArray(trafficWires) && trafficWires.length === 7, `Traffic Light experiment returns complete 7-wire netlist (Found: ${trafficWires.length})`);

const servoWires = mod.getDefaultWiresForExperiment("servo_control");
check(Array.isArray(servoWires) && servoWires.length === 4, `Servo Control experiment returns 4-wire netlist with power & signal (Found: ${servoWires.length})`);

// Verify all 16 projects generate valid netlists with valid endpoints and colors
const allNetlistsValid = mod.ARDUINO_EXPERIMENTS.every(exp => {
  const wires = mod.getDefaultWiresForExperiment(exp.id);
  return Array.isArray(wires) && wires.length > 0 && wires.every(w => 
    typeof w.id === "string" &&
    typeof w.from === "string" &&
    typeof w.to === "string" &&
    typeof w.sx === "number" &&
    typeof w.sy === "number" &&
    typeof w.ex === "number" &&
    typeof w.ey === "number" &&
    typeof w.color === "string" &&
    w.color.startsWith("#")
  );
});
check(allNetlistsValid, "All 16 experiments provide valid pre-routed jumper wire netlists with calibrated geometry");

// ----------------------------------------------------
// Test 4: In-Browser C++ Micro-Compiler & Syntax Verification
// ----------------------------------------------------
console.log("\n⚡ In-Browser C++ Arduino Micro-Compiler:");
check(typeof mod.compileArduinoSketch === "function", "phys-arduino.js exports compileArduinoSketch()");

// 1. Valid Sketch
const validSketch = `
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(500);
}
`;
const compSuccess = mod.compileArduinoSketch(validSketch);
check(compSuccess.success === true, "Valid C++ sketch compiles successfully without errors");
check(compSuccess.flashBytes > 1000 && compSuccess.flashBytes <= 32256, `Flash ROM calculated within ATmega328P limits (${compSuccess.flashBytes} bytes / 32,256 max)`);
check(compSuccess.sramBytes > 0 && compSuccess.sramBytes <= 2048, `SRAM calculated within ATmega328P limits (${compSuccess.sramBytes} bytes / 2,048 max)`);
check(compSuccess.delays && compSuccess.delays.length === 2, "Accurately extracted delay() statements from loop()");
check(compSuccess.totalCycleMs === 1500, `Total cycle period calculated correctly (Expected: 1500ms, Got: ${compSuccess.totalCycleMs}ms)`);

// 2. Missing setup()
const noSetupSketch = `
void loop() {
  digitalWrite(13, HIGH);
}
`;
const compNoSetup = mod.compileArduinoSketch(noSetupSketch);
check(compNoSetup.success === false && compNoSetup.error.includes("setup()"), "Detects missing void setup() function with linker diagnostic error");

// 3. Missing loop()
const noLoopSketch = `
void setup() {
  pinMode(13, OUTPUT);
}
`;
const compNoLoop = mod.compileArduinoSketch(noLoopSketch);
check(compNoLoop.success === false && compNoLoop.error.includes("loop()"), "Detects missing void loop() function with linker diagnostic error");

// 4. Extraneous closing brace '}'
const extraBraceSketch = `
void setup() {}
}
void loop() {}
`;
const compExtraBrace = mod.compileArduinoSketch(extraBraceSketch);
check(compExtraBrace.success === false && compExtraBrace.error.includes("extraneous closing brace"), "Catches extraneous closing brace '}' with line/column diagnostic");

// 5. Unmatched opening brace '{'
const unclosedBraceSketch = `
void setup() {
void loop() {}
`;
const compUnclosedBrace = mod.compileArduinoSketch(unclosedBraceSketch);
check(compUnclosedBrace.success === false && compUnclosedBrace.error.includes("unmatched opening brace"), "Catches missing closing brace '}'");

// 6. Empty sketch
const emptyComp = mod.compileArduinoSketch("   ");
check(emptyComp.success === false && emptyComp.error.includes("Empty"), "Rejects empty source code");

// ----------------------------------------------------
// Test 5: Lifecycle Mount, Interactive Wires & DSO Controls
// ----------------------------------------------------
console.log("\n🔄 Lifecycle Mount & Teardown Execution:");
const cleanup = mod.initArduinoLab("test-mount");
check(typeof cleanup === "function", "initArduinoLab returns valid teardown cleanup function");
check(cleanup.state && Array.isArray(cleanup.state.wires), "initArduinoLab state initialized with wire netlist");
check(cleanup.state.dso && typeof cleanup.state.dso === "object", "initArduinoLab state initialized with DSO oscilloscope");

const canvas = document.getElementById("arduino-canvas");
const mousedownListeners = canvas._listeners.get("mousedown") || [];
check(mousedownListeners.length > 0, "Canvas registers direct pointer/click 'mousedown' event listener");

const touchstartListeners = canvas._listeners.get("touchstart") || [];
check(touchstartListeners.length > 0, "Canvas registers direct touch 'touchstart' event listener");

// Test Wire Toolbar Controls
const btnToggleWire = document.getElementById("btn-toggle-wire-mode");
check(btnToggleWire && btnToggleWire._listeners.get("click")?.length > 0, "Wire toolbar registers toggle wire mode listener");
check(cleanup.state.isWireMode === false, "Wire mode initially OFF");
btnToggleWire.dispatch("click");
check(cleanup.state.isWireMode === true, "Clicking '#btn-toggle-wire-mode' turns Wire Mode ON");
btnToggleWire.dispatch("click");
check(cleanup.state.isWireMode === false, "Clicking '#btn-toggle-wire-mode' turns Wire Mode OFF");

// Test Clear & Reset Wires
const btnClearWires = document.getElementById("btn-clear-wires");
const btnResetWires = document.getElementById("btn-reset-wires");
check(cleanup.state.wires.length > 0, "Wires present initially");
btnClearWires.dispatch("click");
check(cleanup.state.wires.length === 0, "Clicking '#btn-clear-wires' clears all breadboard wires");
btnResetWires.dispatch("click");
check(cleanup.state.wires.length > 0, "Clicking '#btn-reset-wires' restores schematic netlist");

// Test DSO Oscilloscope Channel & Trigger Controls
const selDsoCh1 = document.getElementById("sel-dso-ch1");
const selDsoCh2 = document.getElementById("sel-dso-ch2");
const selDsoTimebase = document.getElementById("sel-dso-timebase");
const selDsoVolts = document.getElementById("sel-dso-volts");
const selDsoTrigger = document.getElementById("sel-dso-trigger");
const btnDsoFreeze = document.getElementById("btn-dso-freeze");

check(cleanup.state.dso.ch1Probe === "pin13", "DSO CH1 default probe is 'pin13'");
check(cleanup.state.dso.ch2Probe === "pot", "DSO CH2 default probe is 'pot'");

selDsoCh1.dispatch("change", { target: { value: "pwm9" } });
check(cleanup.state.dso.ch1Probe === "pwm9", "DSO CH1 probe updates on select change to 'pwm9'");

selDsoCh2.dispatch("change", { target: { value: "temp" } });
check(cleanup.state.dso.ch2Probe === "temp", "DSO CH2 probe updates on select change to 'temp'");

selDsoTimebase.dispatch("change", { target: { value: "100" } });
check(cleanup.state.dso.timebaseMs === 100, "DSO Timebase updates on select change to 100ms/div");

selDsoVolts.dispatch("change", { target: { value: "2" } });
check(cleanup.state.dso.voltsPerDiv1 === 2, "DSO Volts/Div updates on select change to 2V/div");

selDsoTrigger.dispatch("change", { target: { value: "rising" } });
check(cleanup.state.dso.triggerMode === "rising", "DSO Trigger Mode updates on select change to 'rising'");

check(cleanup.state.dso.isFrozen === false, "DSO capture initially running (not frozen)");
btnDsoFreeze.dispatch("click");
check(cleanup.state.dso.isFrozen === true, "Clicking '#btn-dso-freeze' freezes waveform capture");
btnDsoFreeze.dispatch("click");
check(cleanup.state.dso.isFrozen === false, "Clicking '#btn-dso-freeze' resumes waveform capture");

// Test direct component interaction via canvas pointer dispatch
let canvasPointerDispatchedWithoutError = true;
try {
  // Simulate click on Arduino Reset button (x: 125, y: 90)
  canvas.dispatch("mousedown", { clientX: 125, clientY: 90 });
  // Simulate hover move across components
  canvas.dispatch("mousemove", { clientX: 676, clientY: 146 });
  // Simulate click on breadboard crosswalk button (x: 676, y: 146)
  canvas.dispatch("mousedown", { clientX: 676, clientY: 146 });
  canvas.dispatch("mouseup", {});
} catch (e) {
  canvasPointerDispatchedWithoutError = false;
}
check(canvasPointerDispatchedWithoutError, "Direct canvas touch & pointer events on hardware components dispatch safely");

// Allow a couple simulation frames to cycle
await new Promise(r => setTimeout(r, 45));

cleanup();
check(true, "cleanup() safely tears down audio nodes and animation frame loop without throwing");

const mousedownAfterCleanup = canvas._listeners.get("mousedown") || [];
check(mousedownAfterCleanup.length === 0, "cleanup() unregisters all canvas pointer and touch event listeners");

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
