// Edugates-ClipSAT Science Labs - Physics & STEM Electronics: Arduino Uno Microcontroller Workbench
// Realistic ATmega328P Microcontroller, Solderless Breadboard, Interactive Components (LEDs, Pushbutton,
// Potentiometer, Piezo Buzzer, HC-SR04 Ultrasonic Distance Sensor, SG90 Micro Servo, LDR Light Sensor,
// 16x2 Character LCD, TMP36 Temp Sensor), Synthesized Web Audio Sound Effects, C++ Arduino IDE Editor,
// and Live Serial Monitor & Waveform Oscilloscope.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

let _currentArduinoCleanup = null;

export function cleanupArduinoLab() {
  if (typeof _currentArduinoCleanup === "function") {
    try { _currentArduinoCleanup(); } catch (e) {}
    _currentArduinoCleanup = null;
  }
}

// ---------------------------------------------------------------------------
// Synthesized Web Audio Sound Engine for Arduino Components
// ---------------------------------------------------------------------------
class ArduinoAudioEngine {
  constructor() {
    this._ctx = null;
    this._activeBuzzerOsc = null;
    this._activeBuzzerGain = null;
    this._servoOsc = null;
    this._servoGain = null;
    this._muted = SoundFX.isMuted();
  }

  getContext() {
    if (!this._ctx) {
      const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioCtx) {
        this._ctx = new AudioCtx();
      }
    }
    if (this._ctx && this._ctx.state === "suspended") {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  isMuted() {
    return this._muted || SoundFX.isMuted();
  }

  setMuted(muted) {
    this._muted = !!muted;
    SoundFX.setMuted(this._muted);
    if (this._muted) {
      this.stopBuzzer();
      this.stopServo();
      this.stopMotor();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted());
    return this.isMuted();
  }

  // Realistic Square/Sine Piezo Buzzer tone(freq, duration)
  playTone(freq, durationMs = 0) {
    if (this.isMuted() || freq <= 20 || freq > 12000) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.stopBuzzer();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Piezo acoustic resonance: square wave with lowpass filtering
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(freq * 3, 8000), now);

      gain.gain.setValueAtTime(0.14, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      this._activeBuzzerOsc = osc;
      this._activeBuzzerGain = gain;

      if (durationMs > 0) {
        const stopTime = now + durationMs / 1000;
        gain.gain.setValueAtTime(0.14, stopTime - 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
        osc.stop(stopTime + 0.02);
        setTimeout(() => {
          if (this._activeBuzzerOsc === osc) {
            this._activeBuzzerOsc = null;
            this._activeBuzzerGain = null;
          }
        }, durationMs + 25);
      }
    } catch (e) {}
  }

  stopBuzzer() {
    if (this._activeBuzzerGain && this._ctx) {
      try {
        const now = this._ctx.currentTime;
        this._activeBuzzerGain.gain.setValueAtTime(0.0001, now);
      } catch (e) {}
    }
    if (this._activeBuzzerOsc) {
      try {
        this._activeBuzzerOsc.stop();
        this._activeBuzzerOsc.disconnect();
      } catch (e) {}
      this._activeBuzzerOsc = null;
      this._activeBuzzerGain = null;
    }
  }

  // Snappy mechanical click for pushbuttons and switch toggles
  playTactileClick(isPressed = true) {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";

      if (isPressed) {
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      } else {
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.02);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // Realistic SG90 Micro-Servo motor gear whine
  playServoWhine(targetAngle, currentAngle) {
    if (this.isMuted()) return;
    const delta = Math.abs(targetAngle - currentAngle);
    if (delta < 1) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = Math.min(0.25, Math.max(0.05, (delta / 180) * 0.22));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(420 + (targetAngle * 1.5), now);
      osc.frequency.linearRampToValueAtTime(380 + (currentAngle * 1.5), now + duration);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {}
  }

  stopServo() {
    if (this._servoOsc) {
      try {
        this._servoOsc.stop();
        this._servoOsc.disconnect();
      } catch (e) {}
      this._servoOsc = null;
      this._servoGain = null;
    }
  }

  // Ultrasonic Sonar Ping Pulse for HC-SR04
  playSonarPing() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Upload to I/O Board completion chime
  playUploadChime() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.38);
      });
    } catch (e) {}
  }

  // Hardware Reset click & boot tone
  playReset() {
    if (this.isMuted()) return;
    this.playTactileClick(true);
    setTimeout(() => {
      if (this.isMuted()) return;
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12); // E5

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }, 40);
  }

  // Micro-packet serial transmission chirp
  playSerialChirp() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(2100, now + 0.01);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  // Realistic Electromagnetic Relay Snap Click
  playRelayClick(isClosed = true) {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(isClosed ? 1600 : 1100, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // DC Motor Whining Acoustic Tone based on PWM Speed
  setMotorWhine(speedRatio = 0) {
    if (this.isMuted() || speedRatio <= 0.02) {
      this.stopMotor();
      return;
    }
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const baseFreq = 90 + speedRatio * 320; // 90 Hz to 410 Hz rotation whine
      if (!this._motorOsc) {
        this._motorOsc = ctx.createOscillator();
        this._motorGain = ctx.createGain();
        this._motorOsc.type = "sawtooth";
        this._motorOsc.frequency.setValueAtTime(baseFreq, now);
        this._motorGain.gain.setValueAtTime(0.04 * speedRatio, now);
        this._motorOsc.connect(this._motorGain);
        this._motorGain.connect(ctx.destination);
        this._motorOsc.start(now);
      } else {
        this._motorOsc.frequency.linearRampToValueAtTime(baseFreq, now + 0.05);
        this._motorGain.gain.linearRampToValueAtTime(0.04 * speedRatio, now + 0.05);
      }
    } catch (e) {}
  }

  stopMotor() {
    if (this._motorOsc) {
      try {
        this._motorOsc.stop();
        this._motorOsc.disconnect();
      } catch (e) {}
      this._motorOsc = null;
      this._motorGain = null;
    }
  }

  // PIR Motion Sensor detection alert chime
  playPirChime() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  destroy() {
    this.stopBuzzer();
    this.stopServo();
    this.stopMotor();
  }
}

// ---------------------------------------------------------------------------
// 6 Guided Educational Arduino Experiments & Sketches
// ---------------------------------------------------------------------------
export const ARDUINO_EXPERIMENTS = [
  // -------------------------------------------------------------------------
  // TIER 1: 5 EASY FOUNDATIONAL PROJECTS
  // -------------------------------------------------------------------------
  {
    id: "traffic_light",
    title: "1. Traffic Light & Crosswalk Assist",
    difficulty: "easy",
    difficultyLabel: "🟢 Easy",
    category: "Digital I/O & State Machines",
    description: "Multi-LED sequence with pedestrian crosswalk button trigger, visual transitions, and warning beeper.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "TRAFFIC LIGHT & CROSSWALK SCHEMATIC BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV1",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D13 (Red)", "D12 (Yellow)", "D11 (Green)", "D2 (Button)", "D8 (Piezo)", "GND"],
      componentsSummary: "3x 5mm LEDs, 1x Tactile Switch, 1x Piezo Buzzer, 3x 220Ω Resistors",
      theoryEquation: "V = I \\cdot R \\quad | \\quad P = V \\cdot I",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Stop Indicator", part: "5mm Red Diffused LED (2.0V, 20mA)", qty: 1 },
        { item: "Caution Indicator", part: "5mm Yellow Diffused LED (2.1V, 20mA)", qty: 1 },
        { item: "Go Indicator", part: "5mm Green Diffused LED (2.2V, 20mA)", qty: 1 },
        { item: "Current Limiters", part: "220Ω 1/4W Metal Film Resistors", qty: 3 },
        { item: "Pedestrian Button", part: "6x6mm Tactile Micro-Switch", qty: 1 },
        { item: "Acoustic Beeper", part: "Piezoelectric Sounder (12V rated)", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D13", to: "Red LED Anode", color: "#ef4444" },
      { from: "D12", to: "Yellow LED Anode", color: "#f59e0b" },
      { from: "D11", to: "Green LED Anode", color: "#10b981" },
      { from: "D2", to: "Crosswalk Button", color: "#38bdf8" },
      { from: "D8", to: "Piezo Buzzer (+)", color: "#818cf8" },
      { from: "GND", to: "Common Ground Rail", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 1: Traffic Light & Crosswalk
const int pinRed = 13;
const int pinYellow = 12;
const int pinGreen = 11;
const int pinButton = 2;
const int pinBuzzer = 8;

void setup() {
  pinMode(pinRed, OUTPUT);
  pinMode(pinYellow, OUTPUT);
  pinMode(pinGreen, OUTPUT);
  pinMode(pinButton, INPUT_PULLUP);
  pinMode(pinBuzzer, OUTPUT);
  Serial.begin(9600);
  Serial.println("System Ready: Traffic Signal Active");
}

void loop() {
  // Normal State: Green Light for Vehicles
  digitalWrite(pinGreen, HIGH);
  digitalWrite(pinYellow, LOW);
  digitalWrite(pinRed, LOW);

  // Check if pedestrian pushed the crossing button
  if (digitalRead(pinButton) == LOW) {
    Serial.println("Pedestrian Request: Initiating Crossing Sequence");
    delay(1000);

    // Transition Green -> Yellow
    digitalWrite(pinGreen, LOW);
    digitalWrite(pinYellow, HIGH);
    tone(pinBuzzer, 440, 200);
    delay(2000);

    // Red Light: Safe Crossing with Audio Cues
    digitalWrite(pinYellow, LOW);
    digitalWrite(pinRed, HIGH);
    Serial.println("WALK SIGNAL: Pedestrians Crossing");

    for (int i = 0; i < 6; i++) {
      tone(pinBuzzer, 880, 150);
      delay(350);
    }

    // Clearance Warning
    digitalWrite(pinYellow, HIGH);
    delay(1000);
    Serial.println("Clearance Complete: Resuming Vehicle Flow");
  }
  delay(100);
}`
  },
  {
    id: "ldr_nightlight",
    title: "2. Smart LDR Nightlight & PWM Dimmer",
    difficulty: "easy",
    difficultyLabel: "🟢 Easy",
    category: "Analog Input & PWM Regulation",
    description: "Photoresistor voltage divider triggers automatic illumination with smooth PWM brightness modulation.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "SMART LDR NIGHTLIGHT & PWM DIMMER BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV2",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["A1 (LDR ADC)", "A0 (Pot ADC)", "PWM ~9 (LED)", "5V", "GND"],
      componentsSummary: "1x CdS Photoresistor, 1x Blue LED, 1x 10kΩ Potentiometer, 1x 10kΩ Resistor, 1x 220Ω Resistor",
      theoryEquation: "V_{\\text{out}} = V_{\\text{cc}} \\cdot \\frac{R_{\\text{fixed}}}{R_{\\text{ldr}} + R_{\\text{fixed}}} \\quad | \\quad \\text{PWM Duty} = \\frac{\\text{Val}}{255}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Optical Transducer", part: "Cadmium Sulfide (CdS) 5mm Photocell", qty: 1 },
        { item: "Threshold Trimmer", part: "10kΩ Linear Potentiometer", qty: 1 },
        { item: "PWM Nightlight", part: "5mm High-Efficiency Blue LED", qty: 1 },
        { item: "Divider Resistor", part: "10kΩ 1/4W Carbon Film Resistor", qty: 1 },
        { item: "Ballast Resistor", part: "220Ω 1/4W Metal Film Resistor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "A1", to: "LDR Voltage Divider", color: "#34d399" },
      { from: "A0", to: "Potentiometer Wiper", color: "#38bdf8" },
      { from: "~D9", to: "PWM LED Anode", color: "#f43f5e" },
      { from: "5V", to: "10k Resistor & Pot", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 2: Smart LDR Nightlight
const int ldrPin = A1;
const int potPin = A0;
const int ledPin = 9; // PWM pin ~9

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Photocell Nightlight Controller Active");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  int threshold = analogRead(potPin);

  Serial.print("Light Level: ");
  Serial.print(lightLevel);
  Serial.print(" | Set Threshold: ");
  Serial.println(threshold);

  if (lightLevel < threshold) {
    // Dark: compute PWM brightness inverse to ambient light
    int brightness = map(threshold - lightLevel, 0, threshold, 50, 255);
    brightness = constrain(brightness, 0, 255);
    analogWrite(ledPin, brightness);
  } else {
    // Bright: extinguish nightlight
    analogWrite(ledPin, 0);
  }
  delay(150);
}`
  },
  {
    id: "chiptune_melody",
    title: "3. 8-Bit Chiptune Melody Player & Jukebox",
    difficulty: "easy",
    difficultyLabel: "🟢 Easy",
    category: "Audio Synthesis & Microsecond Frequencies",
    description: "Piezoelectric transducer synthesized with real mathematical square waves playing classic 8-bit melodies.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "8-BIT CHIPTUNE MELODY PLAYER SCHEMATIC [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV3",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D8 (Buzzer)", "D2 (Next Track Button)", "D13 (Tempo LED)", "GND"],
      componentsSummary: "1x Piezoelectric Transducer, 1x Yellow Beat LED, 1x Tactile Button, 1x 220Ω Resistor",
      theoryEquation: "f = \\frac{1}{T} \\implies \\text{Period } T = \\frac{1}{f} \\quad | \\quad \\text{Middle C (C4)} = 261.63\\,\\text{Hz}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Acoustic Transducer", part: "Piezoelectric Buzzer (Passive 4kHz resonance)", qty: 1 },
        { item: "Tempo Indicator", part: "5mm Amber Yellow LED", qty: 1 },
        { item: "Song Advance Switch", part: "6x6mm Momentary Pushbutton", qty: 1 },
        { item: "Limiting Resistor", part: "220Ω 1/4W Metal Film Resistor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D8", to: "Piezo Buzzer (+)", color: "#818cf8" },
      { from: "D2", to: "Song Next Button", color: "#38bdf8" },
      { from: "D13", to: "Tempo Beat LED", color: "#fbbf24" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 3: 8-Bit Chiptune Jukebox
const int buzzerPin = 8;
const int ledPin = 13;

// Musical Note Frequencies in Hertz (Hz)
#define NOTE_C4 262
#define NOTE_D4 294
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_G4 392
#define NOTE_A4 440
#define NOTE_B4 494
#define NOTE_C5 523
#define NOTE_E5 659
#define NOTE_G5 784

// Melody: Super Mario Bros Overworld Fanfare
int melody[] = {
  NOTE_E5, NOTE_E5, 0, NOTE_E5, 0, NOTE_C5, NOTE_E5, 0, NOTE_G5, 0
};
int noteDurations[] = {
  120, 120, 120, 120, 120, 120, 120, 120, 240, 240
};

void setup() {
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Chiptune Synthesizer Ready");
}

void loop() {
  Serial.println("Playing Overworld Theme...");
  int totalNotes = sizeof(melody) / sizeof(melody[0]);

  for (int thisNote = 0; thisNote < totalNotes; thisNote++) {
    int duration = noteDurations[thisNote];
    if (melody[thisNote] > 0) {
      digitalWrite(ledPin, HIGH);
      tone(buzzerPin, melody[thisNote], duration);
    } else {
      digitalWrite(ledPin, LOW);
    }
    // Pause between notes to create crisp articulation
    int pauseBetweenNotes = duration * 1.30;
    delay(pauseBetweenNotes);
    digitalWrite(ledPin, LOW);
  }

  Serial.println("Melody Complete. Pausing...");
  delay(3000);
}`
  },
  {
    id: "rgb_mood_lamp",
    title: "4. Interactive RGB Color Mixer & Mood Lamp",
    difficulty: "easy",
    difficultyLabel: "🟢 Easy",
    category: "Color Science & Multi-Channel PWM",
    description: "4-pin common cathode RGB LED with triple PWM channel color mixing (Red, Green, Blue) modulated by ambient light.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "INTERACTIVE RGB MOOD LAMP BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV4",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["PWM ~D9 (Red)", "PWM ~D10 (Green)", "PWM ~D11 (Blue)", "A0 (Hue Pot)", "GND"],
      componentsSummary: "1x Common-Cathode RGB LED, 3x 220Ω Resistors, 1x 10kΩ Potentiometer",
      theoryEquation: "C = R_{\\text{norm}} \\cdot \\mathbf{r} + G_{\\text{norm}} \\cdot \\mathbf{g} + B_{\\text{norm}} \\cdot \\mathbf{b} \\quad | \\quad 0 \\le \\text{Hue} < 360^\\circ",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Tri-Color Emitter", part: "5mm Common-Cathode Diffused RGB LED", qty: 1 },
        { item: "Current Limiters", part: "220Ω 1/4W Metal Film Resistors", qty: 3 },
        { item: "Hue Controller", part: "10kΩ Rotary Trimpot", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "~D9", to: "RGB Red Anode (via 220Ω)", color: "#ef4444" },
      { from: "~D10", to: "RGB Green Anode (via 220Ω)", color: "#10b981" },
      { from: "~D11", to: "RGB Blue Anode (via 220Ω)", color: "#3b82f6" },
      { from: "GND", to: "RGB Common Cathode", color: "#0f172a" },
      { from: "A0", to: "Hue Potentiometer Wiper", color: "#f59e0b" },
      { from: "A1", to: "LDR Ambient Sensor", color: "#34d399" }
    ],
    code: `// Edugates STEM - Experiment 4: Interactive RGB Color Mixer
const int redPin = 9;    // PWM ~9
const int greenPin = 10; // PWM ~10
const int bluePin = 11;  // PWM ~11
const int potPin = A0;   // Hue selector
const int ldrPin = A1;   // Ambient brightness

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.begin(9600);
  Serial.println("RGB Mood Lamp Initialized");
}

void loop() {
  int hueVal = analogRead(potPin); // 0 - 1023
  int ambient = analogRead(ldrPin); // 0 - 1000 lux

  // Map 10-bit hue across RGB rainbow spectrum
  int r = 0, g = 0, b = 0;
  if (hueVal < 341) {
    r = map(hueVal, 0, 341, 255, 0);
    g = map(hueVal, 0, 341, 0, 255);
    b = 0;
  } else if (hueVal < 682) {
    r = 0;
    g = map(hueVal, 341, 682, 255, 0);
    b = map(hueVal, 341, 682, 0, 255);
  } else {
    r = map(hueVal, 682, 1023, 0, 255);
    g = 0;
    b = map(hueVal, 682, 1023, 255, 0);
  }

  // Scale total brightness by ambient light
  float scale = map(ambient, 0, 1023, 255, 50) / 255.0;
  analogWrite(redPin, (int)(r * scale));
  analogWrite(greenPin, (int)(g * scale));
  analogWrite(bluePin, (int)(b * scale));

  Serial.print("RGB Color -> R:");
  Serial.print((int)(r * scale));
  Serial.print(" G:");
  Serial.print((int)(g * scale));
  Serial.print(" B:");
  Serial.println((int)(b * scale));

  delay(60);
}`
  },
  {
    id: "button_toggle",
    title: "5. Digital Pushbutton Toggle & Debounce Counter",
    difficulty: "easy",
    difficultyLabel: "🟢 Easy",
    category: "Digital Inputs & Debounce Logic",
    description: "Momentary tactile switch with hardware pull-up resistor and software debounce algorithm; toggles LED latch and streams event counts to Serial Monitor.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "DIGITAL PUSHBUTTON TOGGLE & DEBOUNCE SCHEMATIC [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV5",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D2 (Interrupt/Input)", "D13 (Status Output)", "GND", "5V"],
      componentsSummary: "1x Tactile Pushbutton, 1x Red 5mm LED, 1x 220Ω Resistor, 1x 10kΩ Pull-Up Resistor",
      theoryEquation: "\\text{Debounce Window}: \\Delta t > 50\\,\\text{ms} \\implies \\text{Stable State Transition}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Tactile Switch", part: "6x6mm Momentary Pushbutton", qty: 1 },
        { item: "Indicator LED", part: "5mm Red Diffused LED (2.0V, 20mA)", qty: 1 },
        { item: "Ballast Resistor", part: "220Ω 1/4W Metal Film Resistor", qty: 1 },
        { item: "Pull-up Resistor", part: "10kΩ 1/4W Carbon Film Resistor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D2", to: "Tactile Button Terminal 1", color: "#38bdf8" },
      { from: "D13", to: "Red LED Anode (+)", color: "#ef4444" },
      { from: "5V", to: "10kΩ Pull-Up Resistor", color: "#dc2626" },
      { from: "GND", to: "Button Terminal 2 & LED Cathode", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 5: Digital Pushbutton Toggle & Software Debounce
const int buttonPin = 2;
const int ledPin = 13;

int ledState = LOW;
int buttonState = HIGH;
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;
unsigned long pressCount = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, ledState);
  Serial.begin(9600);
  Serial.println("System Ready: Pushbutton Toggle Active");
  Serial.println("Press tactile switch on breadboard to toggle LED latch.");
}

void loop() {
  int reading = digitalRead(buttonPin);

  // Check if button state changed (due to noise or pressing)
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  // If reading has persisted longer than debounceDelay, accept it
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      // Only toggle if the new button state is LOW (pressed with pull-up)
      if (buttonState == LOW) {
        ledState = !ledState;
        digitalWrite(ledPin, ledState);
        pressCount++;
        Serial.print("Button Pressed! Count: ");
        Serial.print(pressCount);
        Serial.print(" | LED Latch: ");
        Serial.println(ledState ? "ON (HIGH)" : "OFF (LOW)");
      }
    }
  }

  lastButtonState = reading;
}`
  },

  // -------------------------------------------------------------------------
  // TIER 2: 5 INTERMEDIATE SENSOR & ACTUATOR PROJECTS
  // -------------------------------------------------------------------------
  {
    id: "ultrasonic_radar",
    title: "6. Ultrasonic Distance Radar & Parking Assist",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    category: "Sensors & Time-of-Flight",
    description: "HC-SR04 sonar pulses measure obstacle distance (2–400 cm) with adaptive acoustic pitch and proximity alert.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "ULTRASONIC DISTANCE RADAR SCHEMATIC BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV6",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D9 (Trig)", "D10 (Echo)", "D8 (Buzzer)", "D13 (Warning LED)", "5V", "GND"],
      componentsSummary: "1x HC-SR04 Sonar Module, 1x Piezo Buzzer, 1x Red LED, 1x 220Ω Resistor",
      theoryEquation: "d = \\frac{v_{\\text{sound}} \\cdot \\Delta t}{2} = \\frac{0.0343\\,\\text{cm/\\mu s} \\cdot \\Delta t}{2}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Ultrasonic Transceiver", part: "HC-SR04 (40kHz Acoustic Transducers)", qty: 1 },
        { item: "Warning Sounder", part: "Piezoelectric Transducer", qty: 1 },
        { item: "Visual Proximity LED", part: "5mm Red Diffused LED", qty: 1 },
        { item: "Limiting Resistor", part: "220Ω 1/4W Metal Film Resistor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D9", to: "HC-SR04 Trig", color: "#38bdf8" },
      { from: "D10", to: "HC-SR04 Echo", color: "#facc15" },
      { from: "D8", to: "Piezo Buzzer (+)", color: "#c084fc" },
      { from: "D13", to: "Warning Red LED", color: "#ef4444" },
      { from: "5V", to: "HC-SR04 VCC", color: "#dc2626" },
      { from: "GND", to: "HC-SR04 GND", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 6: Ultrasonic Radar & Reverse Assist
const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int ledPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 Radar Initialized");
}

void loop() {
  // Trigger 10us ultrasonic burst
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo pulse duration in microseconds
  long duration = pulseIn(echoPin, HIGH);
  // Distance in cm = (duration * speed of sound 0.0343 cm/us) / 2
  float distance = (duration * 0.0343) / 2.0;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (distance < 15.0) {
    // Critical proximity warning!
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1200, 100);
    delay(100);
  } else if (distance < 40.0) {
    // Medium caution distance
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 750, 100);
    delay(300);
    digitalWrite(ledPin, LOW);
    delay(100);
  } else {
    // Safe distance
    digitalWrite(ledPin, LOW);
    delay(500);
  }
}`
  },
  {
    id: "servo_control",
    title: "7. Micro-Servo Angle Sweeper & Joy-Dial",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    category: "PWM Actuators & Robotics",
    description: "SG90 micro-servo motor precisely controlled via 10k potentiometer dial with gear sound acoustics.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "SG90 MICRO-SERVO ANGLE CONTROLLER BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV7",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["A0 (Potentiometer)", "PWM ~D6 (Servo Pulse)", "5V", "GND"],
      componentsSummary: "1x TowerPro SG90 9g Micro Servo, 1x 10kΩ Potentiometer, 1x 100µF Decoupling Capacitor",
      theoryEquation: "t_{\\text{high}} = 1.0\\,\\text{ms} + \\left(\\frac{\\theta}{180^\\circ}\\right) \\cdot 1.0\\,\\text{ms} \\quad (50\\,\\text{Hz PWM})",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Position Servo", part: "TowerPro SG90 9g Micro Servo (1.8 kg·cm)", qty: 1 },
        { item: "Steering Potentiometer", part: "10kΩ Linear Potentiometer", qty: 1 },
        { item: "Buffer Capacitor", part: "100µF 16V Electrolytic Capacitor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "A0", to: "Potentiometer Wiper", color: "#f59e0b" },
      { from: "~D6", to: "SG90 Servo PWM Signal", color: "#fb923c" },
      { from: "5V", to: "Servo VCC (Red)", color: "#ef4444" },
      { from: "GND", to: "Servo GND (Brown)", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 7: Servo Motor Angle Steering
#include <Servo.h>

Servo myServo;
const int potPin = A0;
const int servoPin = 6;

void setup() {
  myServo.attach(servoPin);
  Serial.begin(9600);
  Serial.println("Robotic Servo Actuator Linked to D6");
}

void loop() {
  // Read analog potentiometer (0 - 1023)
  int val = analogRead(potPin);
  // Map ADC reading to servo degrees (0 - 180 deg)
  int angle = map(val, 0, 1023, 0, 180);

  myServo.write(angle);

  Serial.print("Pot ADC: ");
  Serial.print(val);
  Serial.print(" -> Servo Angle: ");
  Serial.print(angle);
  Serial.println(" deg");

  delay(60);
}`
  },
  {
    id: "weather_station",
    title: "8. TMP36 Precision Digital Weather Station",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    category: "I2C Displays & Environmental Sensors",
    description: "TMP36 precision temperature sensor with 16x2 LCD display readout, Celsius conversion, and siren alert.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "TMP36 DIGITAL WEATHER STATION & LCD BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV8",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["A2 (TMP36 Vout)", "A4 (SDA)", "A5 (SCL)", "D8 (Buzzer)", "5V", "GND"],
      componentsSummary: "1x TMP36 Temperature Sensor, 1x 16x2 HD44780 LCD, 1x Piezo Buzzer",
      theoryEquation: "T_C = (V_{\\text{out}} - 0.5\\,\\text{V}) \\times 100\\,^\\circ\\text{C/V} \\quad | \\quad 10\\,\\text{mV/}^\\circ\\text{C Scale}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Thermal Sensor", part: "TMP36 Analog Temperature Sensor (±1°C)", qty: 1 },
        { item: "Character Display", part: "16x2 Alphanumeric LCD with HD44780", qty: 1 },
        { item: "Thermal Alarm", part: "Piezo Transducer Buzzer", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "A2", to: "TMP36 Vout (Pin 2)", color: "#06b6d4" },
      { from: "A4", to: "I2C LCD SDA", color: "#38bdf8" },
      { from: "A5", to: "I2C LCD SCL", color: "#a855f7" },
      { from: "D8", to: "Alarm Buzzer (+)", color: "#f43f5e" },
      { from: "5V", to: "TMP36 & LCD VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 8: Smart Weather Station
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int tempPin = A2;
const int buzzerPin = 8;
const float TEMP_LIMIT = 32.0; // Celsius limit

void setup() {
  lcd.begin(16, 2);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  lcd.setCursor(0, 0);
  lcd.print("Edugates Weather");
  lcd.setCursor(0, 1);
  lcd.print("Station Initializing");
  delay(1500);
  lcd.clear();
}

void loop() {
  int rawADC = analogRead(tempPin);
  // Convert 10-bit ADC to voltage (0 - 5.0V)
  float voltage = (rawADC / 1023.0) * 5.0;
  // TMP36 Formula: 10mV/degC with 500mV offset (0 degC = 0.5V)
  float temperatureC = (voltage - 0.5) * 100.0;

  Serial.print("ADC: ");
  Serial.print(rawADC);
  Serial.print(" | Volts: ");
  Serial.print(voltage, 2);
  Serial.print("V | Temp: ");
  Serial.print(temperatureC, 1);
  Serial.println(" C");

  // Display on 16x2 LCD
  lcd.setCursor(0, 0);
  lcd.print("TEMP: ");
  lcd.print(temperatureC, 1);
  lcd.print(" C   ");

  lcd.setCursor(0, 1);
  if (temperatureC >= TEMP_LIMIT) {
    lcd.print("STATUS: OVERHEAT!");
    tone(buzzerPin, 1000, 150);
    delay(200);
  } else {
    lcd.print("STATUS: NORMAL   ");
    delay(800);
  }
}`
  },
  {
    id: "dc_motor_speed",
    title: "9. PWM DC Motor Fan & Thermal Cooling Rig",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    category: "Electromechanics & Transistor Drivers",
    description: "High-current DC motor with aerodynamic propeller fan regulated by PWM speed and thermal thresholds.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "PWM DC MOTOR FAN COOLING RIG BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV9",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["PWM ~D5 (Gate)", "D7 (Relay)", "A0 (Speed Pot)", "A2 (TMP36)", "5V", "GND"],
      componentsSummary: "1x High-RPM DC Motor with Propeller Fan, 1x TIP120/2N2222 Transistor, 1x 1N4007 Diode, 1x 10kΩ Pot",
      theoryEquation: "V_{\\text{avg}} = \\frac{\\text{PWM}}{255} \\cdot V_{\\text{cc}} \\quad | \\quad \\text{Back-EMF}: V_L = -L \\frac{di}{dt}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Actuator Motor", part: "DC Brush Motor with 3-Blade Impeller Fan", qty: 1 },
        { item: "Power Transistor", part: "2N2222 NPN Silicon Power Transistor", qty: 1 },
        { item: "Flyback Diode", part: "1N4007 1A 1000V Silicon Rectifier", qty: 1 },
        { item: "Base Resistor", part: "1kΩ 1/4W Metal Film Resistor", qty: 1 },
        { item: "Speed Potentiometer", part: "10kΩ Rotary Trimpot", qty: 1 },
        { item: "Thermal Sensor", part: "TMP36 Analog Temperature Sensor", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "~D5", to: "NPN Transistor Base / PWM", color: "#38bdf8" },
      { from: "D7", to: "Songle Relay Control Pin", color: "#3b82f6" },
      { from: "A0", to: "Speed Potentiometer", color: "#f59e0b" },
      { from: "A2", to: "TMP36 Temperature Sensor", color: "#ec4899" },
      { from: "5V", to: "Relay & Motor VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 9: DC Motor Fan Cooling System
const int motorPin = 5;  // PWM ~5 for speed regulation
const int relayPin = 7;  // Digital 7 for safety cutoff relay
const int potPin = A0;   // Manual speed trim
const int tempPin = A2;  // TMP36 temperature sensor

void setup() {
  pinMode(motorPin, OUTPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // Engage safety relay
  Serial.begin(9600);
  Serial.println("DC Motor Fan Driver Active");
}

void loop() {
  int manualSpeed = analogRead(potPin); // 0 - 1023
  int rawTemp = analogRead(tempPin);
  float tempC = ((rawTemp * 5.0 / 1023.0) - 0.5) * 100.0;

  int pwmOutput = map(manualSpeed, 0, 1023, 0, 255);

  // Thermal boost if ambient temperature exceeds 30 C
  if (tempC > 30.0) {
    pwmOutput = max(pwmOutput, 220); // Force high cooling speed
    Serial.println("Warning: Thermal threshold exceeded! High fan speed engaged.");
  }

  analogWrite(motorPin, pwmOutput);

  Serial.print("Temp: ");
  Serial.print(tempC, 1);
  Serial.print(" C | Fan Duty: ");
  Serial.print((pwmOutput * 100) / 255);
  Serial.println("%");

  delay(100);
}`
  },
  {
    id: "seven_seg_counter",
    title: "10. Digital 7-Segment Decimal Decade Counter",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    category: "Digital Logic & Numerical Multiplexing",
    description: "Direct segment mapping (A-G + DP) counting 0 through 9 with tactile step button and auto-increment clock.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "7-SEGMENT DECADE COUNTER SCHEMATIC BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV10",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D3-D9 (Segments A-G)", "D10 (DP)", "D2 (Step Button)", "GND"],
      componentsSummary: "1x Common-Cathode 7-Segment LED Display, 7x 220Ω Resistors, 1x Tactile Button",
      theoryEquation: "\\text{Bitmask Table}: \\text{Digit}_N = \\sum_{k=0}^{6} 2^k \\cdot s_k \\quad | \\quad s_k \\in \\{0, 1\\}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Numerical Display", part: "0.56-inch Common-Cathode 7-Segment Display", qty: 1 },
        { item: "Segment Limiters", part: "220Ω 1/4W Metal Film Resistors", qty: 7 },
        { item: "Reset/Step Switch", part: "6x6mm Tactile Pushbutton", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D2", to: "Pushbutton Step Clock", color: "#38bdf8" },
      { from: "D3-D9", to: "7-Seg Pins (A, B, C, D, E, F, G)", color: "#f59e0b" },
      { from: "D10", to: "Decimal Point (DP)", color: "#ef4444" },
      { from: "GND", to: "Common Cathode (via 220Ω)", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 10: 7-Segment Decade Counter
// Segment pin mapping: A=3, B=4, C=5, D=6, E=7, F=8, G=9
const int segPins[] = { 3, 4, 5, 6, 7, 8, 9 };
const int buttonPin = 2;

// 7-segment digit bitmasks (A, B, C, D, E, F, G) for 0 - 9
const byte digitPatterns[10] = {
  0b00111111, // 0
  0b00000110, // 1
  0b01011011, // 2
  0b01001111, // 3
  0b01100110, // 4
  0b01101101, // 5
  0b01111101, // 6
  0b00000111, // 7
  0b01111111, // 8
  0b01101111  // 9
};

int currentCount = 0;

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("7-Segment Decimal Display Ready");
  displayDigit(currentCount);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    currentCount = (currentCount + 1) % 10;
    displayDigit(currentCount);
    Serial.print("Counter Advanced -> ");
    Serial.println(currentCount);
    delay(250); // Debounce delay
  }
  delay(50);
}

void displayDigit(int num) {
  byte mask = digitPatterns[num];
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], (mask & (1 << i)) ? HIGH : LOW);
  }
}`
  },

  // -------------------------------------------------------------------------
  // TIER 3: 5 ADVANCED SECURITY, ROBOTICS & INDUSTRIAL AUTOMATION PROJECTS
  // -------------------------------------------------------------------------
  {
    id: "pir_alarm",
    title: "11. PIR Motion Intruder Security Alarm with Floodlight Relay",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    category: "Security Systems & Power Relays",
    description: "HC-SR501 passive infrared motion detector triggers high-current 5V Songle mechanical relay, strobe alert LED, and multi-frequency piezo alarm.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "PIR SECURITY ALARM & RELAY BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV11",
      circuitVoltage: "5.0V DC (USB Regulated) / 250VAC Relay Switched",
      activePins: ["D2 (PIR Signal)", "D8 (Siren Buzzer)", "D7 (Relay Coil)", "D13 (Strobe LED)", "5V", "GND"],
      componentsSummary: "1x HC-SR501 PIR Sensor, 1x Songle 5V Sugar-Cube Relay, 1x Piezo Siren, 1x Strobe LED",
      theoryEquation: "\\Delta V_{\\text{pyro}} \\propto \\frac{d\\Phi}{dt} \\implies \\text{Fresnel Zone Motion Detection}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Infrared Motion Unit", part: "HC-SR501 Pyroelectric Sensor Module with Fresnel Lens", qty: 1 },
        { item: "Power Relay Module", part: "Songle SRD-05VDC-SL-C 5V Relay (10A 250VAC)", qty: 1 },
        { item: "Security Sounder", part: "Piezo Transducer Siren (1.2–3.5 kHz)", qty: 1 },
        { item: "Intruder Strobe", part: "5mm Ultra-Bright Red LED", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D2", to: "PIR Motion Sensor Out", color: "#10b981" },
      { from: "D8", to: "Piezo Siren Buzzer (+)", color: "#c084fc" },
      { from: "D7", to: "Relay Module Trigger", color: "#38bdf8" },
      { from: "D13", to: "Strobe Warning LED", color: "#ef4444" },
      { from: "5V", to: "PIR & Relay VCC", color: "#dc2626" },
      { from: "GND", to: "Common Ground Rail", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 11: PIR Motion Intruder Alarm
const int pirPin = 2;    // PIR Motion Sensor Input
const int buzzerPin = 8; // Alarm Siren
const int relayPin = 7;  // Security floodlight relay
const int strobePin = 13;// Red strobe LED

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(relayPin, OUTPUT);
  pinMode(strobePin, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR Security Perimeter Armed. Calibrating...");
  delay(1000);
  Serial.println("System Ready: Monitoring motion events.");
}

void loop() {
  int motionDetected = digitalRead(pirPin);

  if (motionDetected == HIGH) {
    Serial.println("ALERT! Motion detected in security zone!");
    digitalWrite(relayPin, HIGH); // Trip floodlight relay
    
    // Multi-tone siren frequency sweep
    for (int freq = 700; freq <= 1400; freq += 70) {
      digitalWrite(strobePin, HIGH);
      tone(buzzerPin, freq, 30);
      delay(30);
      digitalWrite(strobePin, LOW);
    }
  } else {
    digitalWrite(relayPin, LOW);
    digitalWrite(strobePin, LOW);
    noTone(buzzerPin);
    delay(100);
  }
}`
  },
  {
    id: "joystick_pan_tilt",
    title: "12. 2-Axis Thumbstick & Servo Pan-Tilt Camera Rig",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    category: "Human Interface Devices (HID) & Robotics",
    description: "Dual-axis analog potentiometer thumbstick controlling SG90 servo position and center-click laser/buzzer trigger.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "2-AXIS JOYSTICK & SERVO GIMBAL BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV12",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["A0 (Joy X)", "A1 (Joy Y)", "D2 (Joy Switch)", "PWM ~D6 (Servo)", "D8 (Trigger Buzzer)", "5V", "GND"],
      componentsSummary: "1x 2-Axis Analog Thumbstick, 1x TowerPro SG90 Servo, 1x Piezo Sounder",
      theoryEquation: "\\vec{v} = \\begin{bmatrix} X - 512 \\\\ Y - 512 \\end{bmatrix} \\implies \\theta = \\arctan2(Y-512, X-512)",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Analog Thumbstick", part: "Dual 10k Potentiometer + Pushbutton (PlayStation-style)", qty: 1 },
        { item: "Actuator Motor", part: "TowerPro SG90 9g Micro Servo Motor", qty: 1 },
        { item: "Target Trigger", part: "Piezo Acoustic Transducer", qty: 1 },
        { item: "Prototyping", part: "Half-Size Solderless Breadboard", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "A0", to: "Joystick X-Axis (VRx)", color: "#38bdf8" },
      { from: "A1", to: "Joystick Y-Axis (VRy)", color: "#10b981" },
      { from: "D2", to: "Joystick Pushbutton (SW)", color: "#facc15" },
      { from: "~D6", to: "SG90 Servo PWM Signal", color: "#fb923c" },
      { from: "D8", to: "Laser/Trigger Buzzer", color: "#c084fc" },
      { from: "5V", to: "Joystick & Servo VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 12: 2-Axis Thumbstick Servo Director
#include <Servo.h>

Servo panServo;
const int joyXPin = A0;
const int joyYPin = A1;
const int joyBtnPin = 2;
const int servoPin = 6;
const int buzzerPin = 8;

void setup() {
  panServo.attach(servoPin);
  pinMode(joyBtnPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("2-Axis Joystick Controller Initialized");
}

void loop() {
  int xVal = analogRead(joyXPin); // 0 - 1023
  int yVal = analogRead(joyYPin);
  bool btnClicked = digitalRead(joyBtnPin) == LOW;

  // Map Joystick X-axis to servo angle (0 - 180 degrees)
  int servoAngle = map(xVal, 0, 1023, 0, 180);
  panServo.write(servoAngle);

  if (btnClicked) {
    tone(buzzerPin, 1000, 40);
    Serial.println("Thumbstick Button Pressed: Target Fired!");
  }

  Serial.print("Joy X: ");
  Serial.print(xVal);
  Serial.print(" | Y: ");
  Serial.print(yVal);
  Serial.print(" -> Servo: ");
  Serial.print(servoAngle);
  Serial.println(" deg");

  delay(60);
}`
  },
  {
    id: "sonar_lcd_scope",
    title: "13. Ultrasonic Radar Rangefinder & 16x2 LCD Radar Scope",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    category: "Telemetry, Instrumentation & LCD",
    description: "HC-SR04 sonar sensor coupled to 16x2 alphanumeric LCD scope displaying live distance in cm/inches, dynamic ASCII range-bar graph, and multi-tier acoustic warning beeper.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "ULTRASONIC RADAR & 16x2 LCD INSTRUMENTATION BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV13",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D9 (Trig)", "D10 (Echo)", "D8 (Buzzer)", "D13 (Warn LED)", "A4/A5 (I2C LCD)"],
      componentsSummary: "1x HC-SR04 Sonar, 1x 16x2 HD44780 LCD, 1x Piezo Buzzer, 1x Red LED, 1x 220Ω Resistor",
      theoryEquation: "d = \\frac{v_{\\text{sound}} \\cdot \\Delta t}{2} = \\frac{343\\,\\text{m/s} \\cdot \\Delta t}{2}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Ultrasonic Transceiver", part: "HC-SR04 Time-of-Flight Sonar", qty: 1 },
        { item: "Alphanumeric Display", part: "1602 HD44780 LCD Display", qty: 1 },
        { item: "Acoustic Transducer", part: "Piezoelectric Sounder (12V rated)", qty: 1 },
        { item: "Proximity LED", part: "5mm Red Diffused LED", qty: 1 },
        { item: "Breadboard & Jumpers", part: "830-Point Solderless Board + M-M Wires", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D9", to: "HC-SR04 Trig Pin", color: "#38bdf8" },
      { from: "D10", to: "HC-SR04 Echo Pin", color: "#facc15" },
      { from: "D8", to: "Piezo Buzzer (+)", color: "#818cf8" },
      { from: "D13", to: "Warning Red LED", color: "#ef4444" },
      { from: "A4 (SDA)", to: "16x2 LCD SDA", color: "#10b981" },
      { from: "A5 (SCL)", to: "16x2 LCD SCL", color: "#06b6d4" },
      { from: "5V", to: "HC-SR04 VCC & LCD VDD", color: "#dc2626" },
      { from: "GND", to: "Common Ground Rail", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 13: Ultrasonic Radar & 16x2 LCD Scope
#include <LiquidCrystal.h>

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int alertLedPin = 13;

// Initialize LCD in 4-bit mode (RS, Enable, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(alertLedPin, OUTPUT);
  
  lcd.begin(16, 2);
  lcd.print("RADAR SCOPE v4.0");
  lcd.setCursor(0, 1);
  lcd.print("Calibrating Ping");
  
  Serial.begin(9600);
  Serial.println("SYSTEM BOOT: Ultrasonic Radar & LCD Instrumentation");
  delay(1200);
  lcd.clear();
}

void loop() {
  // Transmit 10 microsecond ultrasonic pulse trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo return flight time in microseconds
  long durationUs = pulseIn(echoPin, HIGH, 30000);
  float distanceCm = (durationUs * 0.0343) / 2.0;

  if (durationUs == 0 || distanceCm > 150.0) distanceCm = 150.0;

  // Format LCD Line 1: Numeric Distance
  lcd.setCursor(0, 0);
  lcd.print("DIST: ");
  lcd.print(distanceCm, 1);
  lcd.print(" cm   ");

  // Format LCD Line 2: Graphical Range Bar Scope
  lcd.setCursor(0, 1);
  int bars = map((int)constrain(distanceCm, 2, 80), 2, 80, 1, 16);
  for (int i = 0; i < 16; i++) {
    if (i < bars) lcd.print("=");
    else lcd.print(" ");
  }

  // Multi-tier Proximity Alert
  if (distanceCm < 15.0) {
    digitalWrite(alertLedPin, HIGH);
    tone(buzzerPin, 1400, 60);
    Serial.print("CRITICAL PROXIMITY! Dist: ");
  } else if (distanceCm < 35.0) {
    digitalWrite(alertLedPin, (millis() / 200) % 2);
    tone(buzzerPin, 850, 40);
    Serial.print("Warning Zone. Dist: ");
  } else {
    digitalWrite(alertLedPin, LOW);
    noTone(buzzerPin);
    Serial.print("Clear Path. Dist: ");
  }

  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(120);
}`
  },
  {
    id: "thermostat_relay_fan",
    title: "14. Smart Thermostatic Relay Cooling Station",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    category: "Closed-Loop HVAC Automation & Power Relays",
    description: "Autonomous HVAC thermal regulator: TMP36 sensor monitors ambient temperature with deadband hysteresis; trips 5V mechanical relay to engage high-RPM DC cooling fan and RGB status indicator.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "SMART THERMOSTATIC RELAY COOLING STATION BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV14",
      circuitVoltage: "5.0V DC (USB Regulated) / 12V Auxiliary",
      activePins: ["A0 (TMP36)", "D7 (Relay Coil)", "D5 (PWM Fan)", "D9/10/11 (RGB LED)", "D4 (Manual Switch)"],
      componentsSummary: "1x TMP36 Sensor, 1x 5V Songle Relay, 1x DC Motor Fan, 1x RGB LED, 1x Slide Switch",
      theoryEquation: "T_C = (V_{\\text{out}} - 0.5\\,\\text{V}) \\times 100\\,^\\circ\\text{C/V} \\quad | \\quad Hysteresis: \\Delta T = \\pm 1.5\\,^\\circ\\text{C}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Precision Temp Sensor", part: "TMP36 Analog Temperature IC (±1°C)", qty: 1 },
        { item: "Electromechanical Relay", part: "Songle 5V Sugar-Cube Relay Module (10A 250VAC)", qty: 1 },
        { item: "Cooling Fan Motor", part: "DC Brush Motor with 3-Blade Impeller", qty: 1 },
        { item: "Flyback Diode", part: "1N4007 1A 1000V Silicon Rectifier", qty: 1 },
        { item: "Switching Transistor", part: "2N2222 NPN Silicon Power Transistor", qty: 1 },
        { item: "Status Tricolor LED", part: "5mm Common-Cathode RGB LED", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "A0", to: "TMP36 Vout Pin", color: "#f43f5e" },
      { from: "D7", to: "Songle Relay Signal (IN)", color: "#2563eb" },
      { from: "D5", to: "DC Fan PWM Driver Gate", color: "#38bdf8" },
      { from: "D9", to: "RGB Red (Hot Indicator)", color: "#ef4444" },
      { from: "D10", to: "RGB Green (Nominal)", color: "#10b981" },
      { from: "D11", to: "RGB Blue (Cold Indicator)", color: "#3b82f6" },
      { from: "D4", to: "Manual Override Slide Switch", color: "#64748b" },
      { from: "5V", to: "TMP36 VCC & Relay VCC", color: "#dc2626" },
      { from: "GND", to: "Common Ground Rail", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 14: Smart Thermostatic Relay Cooling Station
const int tempPin = A0;
const int relayPin = 7;
const int fanPwmPin = 5;
const int switchOverridePin = 4;
const int ledRedPin = 9;
const int ledGreenPin = 10;
const int ledBluePin = 11;

// Thermal setpoints with hysteresis deadband
const float TEMP_THRESHOLD_HIGH = 28.5; // Fan kicks ON at 28.5 C
const float TEMP_THRESHOLD_LOW = 26.0;  // Fan shuts OFF at 26.0 C
bool coolingActive = false;

void setup() {
  pinMode(relayPin, OUTPUT);
  pinMode(fanPwmPin, OUTPUT);
  pinMode(ledRedPin, OUTPUT);
  pinMode(ledGreenPin, OUTPUT);
  pinMode(ledBluePin, OUTPUT);
  pinMode(switchOverridePin, INPUT_PULLUP);

  digitalWrite(relayPin, LOW); // Relay NO contacts open
  analogWrite(fanPwmPin, 0);

  Serial.begin(9600);
  Serial.println("SYSTEM INITIATED: Closed-Loop HVAC Thermostat Station");
  Serial.println("Thresholds: High Setpoint = 28.5 C | Low Cutoff = 26.0 C");
}

void loop() {
  // Read TMP36 Analog Voltage: 10 mV/C with 500 mV offset at 0 C
  int rawAdc = analogRead(tempPin);
  float voltage = (rawAdc / 1023.0) * 5.0;
  float temperatureC = (voltage - 0.5) * 100.0;

  bool manualOverride = (digitalRead(switchOverridePin) == LOW);

  // Closed-loop bang-bang controller with deadband hysteresis
  if (manualOverride) {
    coolingActive = true;
    Serial.println("[MANUAL OVERRIDE] Operator forced cooling ON");
  } else if (temperatureC >= TEMP_THRESHOLD_HIGH) {
    coolingActive = true;
  } else if (temperatureC <= TEMP_THRESHOLD_LOW) {
    coolingActive = false;
  }

  // Actuate Relay & Cooling Fan
  if (coolingActive) {
    digitalWrite(relayPin, HIGH); // Snap relay energized
    analogWrite(fanPwmPin, 255);  // Full throttle fan

    // Status: Red (Alert / Active Exhaust)
    analogWrite(ledRedPin, 255);
    analogWrite(ledGreenPin, 0);
    analogWrite(ledBluePin, 0);
  } else {
    digitalWrite(relayPin, LOW);
    analogWrite(fanPwmPin, 0);

    // Status: Blue if chilly (<20 C), else Green nominal
    if (temperatureC < 20.0) {
      analogWrite(ledRedPin, 0);
      analogWrite(ledGreenPin, 50);
      analogWrite(ledBluePin, 255);
    } else {
      analogWrite(ledRedPin, 0);
      analogWrite(ledGreenPin, 255);
      analogWrite(ledBluePin, 0);
    }
  }

  // Telemetry stream
  Serial.print("Temp: ");
  Serial.print(temperatureC, 2);
  Serial.print(" C | Relay: ");
  Serial.print(coolingActive ? "CLOSED (ON)" : "OPEN (OFF)");
  Serial.print(" | Fan: ");
  Serial.println(coolingActive ? "100% PWM" : "0% IDLE");

  delay(250);
}`
  },
  {
    id: "multi_sensor_alarm",
    title: "15. Autonomous Multi-Sensor Annunciator Hub",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    category: "Industrial Safety & Sensor Fusion",
    description: "Multi-hazard industrial annunciator integrating PIR pyroelectric motion, CdS optical darkness, and TMP36 thermal monitoring; orchestrates staged warning sirens, relay power cutoff, and telemetry broadcast.",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "AUTONOMOUS MULTI-SENSOR ANNUNCIATOR HUB BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-REV15",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["D2 (PIR Motion)", "A1 (LDR Light)", "A0 (TMP36)", "D7 (Relay Interlock)", "D8 (Siren)", "D13 (Strobe)", "D4 (Arm Switch)"],
      componentsSummary: "1x PIR Sensor, 1x LDR Photoresistor, 1x TMP36 IC, 1x 5V Relay, 1x Piezo Siren, 1x Slide Switch, 1x Strobe LED",
      theoryEquation: "\\text{Hazard Vector}: H = \\{M_{\\text{PIR}}, \\; L_{\\text{dark}}, \\; T_{\\text{overheat}}\\} \\implies \\text{Interlock Relay Actuation}",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "PIR Motion Sensor", part: "HC-SR501 Pyroelectric Sensor Module", qty: 1 },
        { item: "Cadmium Sulfide LDR", part: "5mm Photocell (10kΩ dark resistance)", qty: 1 },
        { item: "Temperature Transducer", part: "TMP36 Analog Temperature Sensor", qty: 1 },
        { item: "Interlock Relay", part: "Songle 5V Sugar-Cube Relay Module", qty: 1 },
        { item: "Acoustic Warbler", part: "Piezo Transducer Siren", qty: 1 },
        { item: "Alarm Strobe", part: "High-Luminance Red 5mm LED", qty: 1 }
      ]
    },
    circuitWiring: [
      { from: "D2", to: "HC-SR501 PIR Out", color: "#10b981" },
      { from: "A1", to: "LDR Voltage Divider", color: "#d97706" },
      { from: "A0", to: "TMP36 Vout Pin", color: "#f43f5e" },
      { from: "D7", to: "Relay Module Signal", color: "#2563eb" },
      { from: "D8", to: "Piezo Buzzer (+)", color: "#818cf8" },
      { from: "D13", to: "Alarm Strobe Red LED", color: "#ef4444" },
      { from: "D4", to: "System Arm/Disarm Switch", color: "#64748b" },
      { from: "5V", to: "Common 5V Supply Rail", color: "#dc2626" },
      { from: "GND", to: "Common Ground Rail", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 15: Autonomous Multi-Sensor Annunciator Hub
const int pirPin = 2;
const int ldrPin = A1;
const int tempPin = A0;
const int relayPin = 7;
const int sirenPin = 8;
const int strobePin = 13;
const int armSwitchPin = 4;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(armSwitchPin, INPUT_PULLUP);
  pinMode(relayPin, OUTPUT);
  pinMode(sirenPin, OUTPUT);
  pinMode(strobePin, OUTPUT);

  digitalWrite(relayPin, LOW);
  digitalWrite(strobePin, LOW);

  Serial.begin(9600);
  Serial.println("==================================================");
  Serial.println("🚨 MULTI-SENSOR ANNUNCIATOR HUB v5.2 ACTIVE 🚨");
  Serial.println("Sensors Armed: PIR Motion | CdS Optical | TMP36 Heat");
  Serial.println("==================================================");
}

void loop() {
  bool isArmed = (digitalRead(armSwitchPin) == LOW);

  // 1. Read PIR Motion Sensor
  bool motionDetected = (digitalRead(pirPin) == HIGH);

  // 2. Read LDR Ambient Light (0-1023)
  int lightAdc = analogRead(ldrPin);
  bool darknessDetected = (lightAdc < 220);

  // 3. Read TMP36 Temperature
  int tempAdc = analogRead(tempPin);
  float voltage = (tempAdc / 1023.0) * 5.0;
  float tempC = (voltage - 0.5) * 100.0;
  bool thermalHazard = (tempC > 36.0);

  // Sensor Fusion Matrix
  bool alarmTriggered = isArmed && (motionDetected || darknessDetected || thermalHazard);

  if (alarmTriggered) {
    // Trip safety interlock relay
    digitalWrite(relayPin, HIGH);

    // Strobe warning flasher
    digitalWrite(strobePin, (millis() / 100) % 2);

    // Dual-tone siren warble
    int freq = ((millis() / 250) % 2 == 0) ? 1450 : 920;
    tone(sirenPin, freq, 80);

    Serial.print("⚠️ HAZARD DETECTED! [");
    if (motionDetected) Serial.print(" MOTION ");
    if (darknessDetected) Serial.print(" DARKNESS ");
    if (thermalHazard) Serial.print(" OVERHEAT ");
    Serial.print("] Temp: ");
    Serial.print(tempC, 1);
    Serial.println(" C | Relay CUTOFF ENGAGED");
  } else {
    digitalWrite(relayPin, LOW);
    digitalWrite(strobePin, LOW);
    noTone(sirenPin);

    Serial.print("STATUS: ");
    Serial.print(isArmed ? "ARMED (All Clear)" : "STANDBY (Disarmed)");
    Serial.print(" | Ambient Temp: ");
    Serial.print(tempC, 1);
    Serial.print(" C | Light: ");
    Serial.println(lightAdc);
  }

  delay(200);
}`
  },

  // -------------------------------------------------------------------------
  // TIER 4: 🛠️ CUSTOM BREADBOARD BUILDER & OPEN ENGINEERING SANDBOX
  // -------------------------------------------------------------------------
  {
    id: "custom_sandbox",
    title: "16. 🛠️ Custom Project Builder & Breadboard Sandbox",
    difficulty: "sandbox",
    difficultyLabel: "🛠️ Sandbox",
    category: "Freeform Engineering & Breadboard Prototyping",
    description: "Interactive open sandbox: place any components from the Parts Bin onto the breadboard, customize wiring, and write your own C++ sketch!",
    image: "assets/labs/arduino_bench.jpg",
    blueprint4k: {
      resolution: "3840 x 2160 UHD",
      aspectRatio: "16:9",
      title: "CUSTOM BREADBOARD PROTOTYPING BLUEPRINT [4K UHD]",
      schematicClass: "CAD-ELEC-4K-SANDBOX",
      circuitVoltage: "5.0V DC (USB Regulated)",
      activePins: ["Configurable User Pins (D0-D13, A0-A5)"],
      componentsSummary: "User-defined arrangement from 22 components in Parts Bin library",
      theoryEquation: "\\sum I_{\\text{in}} = \\sum I_{\\text{out}} \\quad | \\quad \\sum V_k = 0 \\quad (\\text{Kirchhoff's Laws})",
      bomList: [
        { item: "Microcontroller Board", part: "Arduino Uno R3 (ATmega328P)", qty: 1 },
        { item: "Prototyping Platform", part: "Solderless Breadboard with Dual Power Bus", qty: 1 },
        { item: "Modular Components", part: "Selected from 22 Available Hardware Parts", qty: "N" }
      ]
    },
    circuitWiring: [
      { from: "Any Pin", to: "Any Placed Component", color: "#38bdf8" },
      { from: "5V", to: "Power Bus Rail", color: "#ef4444" },
      { from: "GND", to: "Ground Bus Rail", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Custom Breadboard Sandbox Project
// Add components using the Parts Bin toolbar and wire them to pins!

const int ledPin = 13;      // Status LED
const int buttonPin = 2;    // Tactile Input Switch
const int potPin = A0;      // Analog Potentiometer
const int buzzerPin = 8;    // Piezo Buzzer

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("--- CUSTOM PROJECT BENCH INITIALIZED ---");
  Serial.println("Select parts from the Toolbox to build any circuit!");
}

void loop() {
  int sensorVal = analogRead(potPin);
  bool btnState = digitalRead(buttonPin) == LOW;

  if (btnState) {
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 440 + sensorVal, 50);
    Serial.print("Active Input! ADC: ");
    Serial.println(sensorVal);
  } else {
    digitalWrite(ledPin, LOW);
  }

  delay(50);
}`
  }
];

// ---------------------------------------------------------------------------
// Comprehensive Component Catalog & Parts Bin Metadata
// ---------------------------------------------------------------------------
export const AVAILABLE_PARTS = [
  { type: "led_red", name: "Red 5mm LED", category: "Actuators", defaultPin: 13, icon: "💡", color: "#ef4444", desc: "Standard 5mm diffused Red LED (Forward Voltage 2.0V, 20mA max)" },
  { type: "led_green", name: "Green 5mm LED", category: "Actuators", defaultPin: 11, icon: "💡", color: "#10b981", desc: "Standard 5mm diffused Green LED (Forward Voltage 2.2V)" },
  { type: "led_yellow", name: "Yellow 5mm LED", category: "Actuators", defaultPin: 12, icon: "💡", color: "#f59e0b", desc: "Standard 5mm diffused Yellow LED (Forward Voltage 2.1V)" },
  { type: "led_blue", name: "Blue 5mm LED", category: "Actuators", defaultPin: 10, icon: "💡", color: "#3b82f6", desc: "Standard 5mm diffused Blue LED (Forward Voltage 3.2V)" },
  { type: "rgb_led", name: "RGB 4-Pin LED", category: "Actuators", defaultPin: "9,10,11", icon: "🌈", color: "#ec4899", desc: "Common-Cathode RGB LED with 3 internal emitting dies" },
  { type: "resistor", name: "220Ω Resistor", category: "Passive & Display", defaultPin: "—", icon: "〰️", color: "#fde68a", desc: "Current-limiting resistor (Color code: Red-Red-Brown-Gold, 1/4W)" },
  { type: "resistor_10k", name: "10kΩ Resistor", category: "Passive & Display", defaultPin: "—", icon: "〰️", color: "#fde68a", desc: "Pull-up / voltage divider resistor (Color code: Brown-Black-Orange-Gold)" },
  { type: "capacitor", name: "100nF Capacitor", category: "Passive & Display", defaultPin: "—", icon: "⚡", color: "#f59e0b", desc: "Decoupling multilayer ceramic disc capacitor for power filtering" },
  { type: "pushbutton", name: "Tactile Pushbutton", category: "Sensors & Inputs", defaultPin: 2, icon: "🔘", color: "#0ea5e9", desc: "Momentary 6x6mm micro-switch with internal pull-up logic" },
  { type: "toggle_switch", name: "SPDT Slide Switch", category: "Sensors & Inputs", defaultPin: 4, icon: "🎚️", color: "#64748b", desc: "3-pin miniature slide switch for persistent HIGH/LOW toggling" },
  { type: "potentiometer", name: "10kΩ Potentiometer", category: "Sensors & Inputs", defaultPin: "A0", icon: "🎛️", color: "#06b6d4", desc: "Rotary trimmer dial outputting continuous 0-5V analog voltage" },
  { type: "buzzer", name: "Piezo Buzzer", category: "Actuators", defaultPin: 8, icon: "🔊", color: "#8b5cf6", desc: "Acoustic transducer resonant for tone() frequency generation" },
  { type: "ultrasonic", name: "HC-SR04 Sonar", category: "Sensors & Inputs", defaultPin: "9,10", icon: "📏", color: "#0284c7", desc: "Dual transducer time-of-flight ultrasonic sensor (2-400 cm)" },
  { type: "ldr", name: "LDR Photoresistor", category: "Sensors & Inputs", defaultPin: "A1", icon: "☀️", color: "#d97706", desc: "Cadmium-Sulfide (CdS) light sensor variable resistance" },
  { type: "tmp36", name: "TMP36 Temp Sensor", category: "Sensors & Inputs", defaultPin: "A2", icon: "🌡️", color: "#f43f5e", desc: "Analog temperature sensor calibrated to 10mV/°C with 500mV offset" },
  { type: "servo", name: "SG90 Micro Servo", category: "Actuators", defaultPin: 6, icon: "🦾", color: "#0ea5e9", desc: "9g micro-servo motor with 0-180 degree PWM positional sweep" },
  { type: "dc_motor", name: "DC Motor & Propeller", category: "Actuators", defaultPin: 5, icon: "⚙️", color: "#94a3b8", desc: "High-RPM DC electric motor with 3-blade cooling propeller fan" },
  { type: "relay", name: "5V Songle Relay", category: "Actuators", defaultPin: 7, icon: "🔌", color: "#2563eb", desc: "10A 250VAC electromagnetic mechanical relay with NO/COM/NC contacts" },
  { type: "seven_seg", name: "7-Segment Display", category: "Actuators", defaultPin: "3-9", icon: "📟", color: "#ef4444", desc: "Common-cathode LED display for numerical digits 0-9" },
  { type: "pir", name: "PIR Motion Sensor", category: "Sensors & Inputs", defaultPin: 2, icon: "🚶", color: "#10b981", desc: "Pyroelectric infrared detector with faceted Fresnel dome lens" },
  { type: "joystick", name: "2-Axis Thumbstick", category: "Sensors & Inputs", defaultPin: "A0,A1,D2", icon: "🕹️", color: "#64748b", desc: "Dual 10k potentiometers (X, Y) + integrated tactile pushbutton" },
  { type: "lcd_1602", name: "16x2 Character LCD", category: "Passive & Display", defaultPin: "A4,A5", icon: "📺", color: "#047857", desc: "HD44780 controller alphanumeric display with backlit cyan matrix" },
  { type: "dht11", name: "DHT11 Temp & Humidity", category: "Sensors & Inputs", defaultPin: 2, icon: "💧", color: "#38bdf8", desc: "Digital relative humidity (20-90% RH) and ambient temperature (0-50°C) single-bus sensor" },
  { type: "bme280", name: "BME280 Barometer & Alt", category: "Sensors & Inputs", defaultPin: "A4,A5", icon: "🧭", color: "#06b6d4", desc: "Precision I2C atmospheric barometric pressure (300-1100 hPa) & altitude sensor" },
  { type: "oled_ssd1306", name: "0.96\" I2C OLED Display", category: "Passive & Display", defaultPin: "A4,A5", icon: "📟", color: "#60a5fa", desc: "Monochrome 128x64 graphic OLED display module with SSD1306 driver via I2C" },
  { type: "stepper_motor", name: "28BYJ-48 Stepper & Driver", category: "Actuators", defaultPin: "8-11", icon: "🔄", color: "#a855f7", desc: "5V 4-phase geared stepper motor with ULN2003 Darlington transistor array driver" }
];

// ---------------------------------------------------------------------------
// Arduino Uno Header Pin & Breadboard Tie-Point Geometry Map
// ---------------------------------------------------------------------------
export const ARDUINO_PINS = {
  // Top Digital Header (py: 75)
  "AREF": { x: 147.5, y: 75, label: "AREF (Analog Reference)" },
  "GND_TOP": { x: 161.0, y: 75, label: "GND (Digital Ground)" },
  "D13": { x: 174.5, y: 75, label: "Digital 13 (SCK / Built-in LED)" },
  "D12": { x: 188.0, y: 75, label: "Digital 12 (MISO)" },
  "D11": { x: 201.5, y: 75, label: "Digital ~11 (MOSI / PWM)" },
  "D10": { x: 215.0, y: 75, label: "Digital ~10 (SS / PWM)" },
  "D9":  { x: 228.5, y: 75, label: "Digital ~9 (PWM / Timer1)" },
  "D8":  { x: 242.0, y: 75, label: "Digital 8" },
  "D7":  { x: 255.5, y: 75, label: "Digital 7" },
  "D6":  { x: 269.0, y: 75, label: "Digital ~6 (PWM)" },
  "D5":  { x: 282.5, y: 75, label: "Digital ~5 (PWM / Motor)" },
  "D4":  { x: 296.0, y: 75, label: "Digital 4 (Relay Trigger)" },
  "D3":  { x: 309.5, y: 75, label: "Digital ~3 (PWM / INT1)" },
  "D2":  { x: 323.0, y: 75, label: "Digital 2 (INT0 / Pushbutton)" },
  "TX":  { x: 336.5, y: 75, label: "Digital 1 (TX)" },
  "RX":  { x: 350.0, y: 75, label: "Digital 0 (RX)" },

  // Bottom Power & Analog Header (py: 385)
  "IOREF": { x: 157.5, y: 385, label: "IOREF" },
  "RESET": { x: 172.0, y: 385, label: "RESET (Active Low)" },
  "3.3V":  { x: 186.5, y: 385, label: "Power 3.3V (50mA Max)" },
  "5V":    { x: 201.0, y: 385, label: "Power 5.0V Regulated" },
  "GND":   { x: 215.5, y: 385, label: "Ground (GND)" },
  "GND_2": { x: 230.0, y: 385, label: "Ground (GND 2)" },
  "VIN":   { x: 244.5, y: 385, label: "VIN (External 7-12V)" },
  "A0":    { x: 259.0, y: 385, label: "Analog In A0 (10-bit ADC)" },
  "A1":    { x: 273.5, y: 385, label: "Analog In A1 (10-bit ADC)" },
  "A2":    { x: 288.0, y: 385, label: "Analog In A2 (10-bit ADC)" },
  "A3":    { x: 302.5, y: 385, label: "Analog In A3 (10-bit ADC)" },
  "A4":    { x: 317.0, y: 385, label: "Analog In A4 (SDA / I2C)" },
  "A5":    { x: 331.5, y: 385, label: "Analog In A5 (SCL / I2C)" }
};

export const BREADBOARD_PINS = {
  "BB_TOP_5V":  { x: 442, y: 73, label: "Breadboard Top +5V Bus" },
  "BB_TOP_GND": { x: 462, y: 85, label: "Breadboard Top GND Bus" },
  "BB_BOT_GND": { x: 462, y: 375, label: "Breadboard Bottom GND Bus" },
  "BB_BOT_5V":  { x: 442, y: 387, label: "Breadboard Bottom +5V Bus" }
};

export function getDefaultWiresForExperiment(expId) {
  const p5V = ARDUINO_PINS["5V"];
  const pGnd = ARDUINO_PINS["GND"];
  const bb5V = BREADBOARD_PINS["BB_TOP_5V"];
  const bbGnd = BREADBOARD_PINS["BB_TOP_GND"];

  const powerBus = [
    { id: "w_pwr_5v", from: "5V", to: "BB_TOP_5V", sx: p5V.x, sy: p5V.y, ex: bb5V.x, ey: bb5V.y, color: "#ef4444", label: "5V Power Bus" },
    { id: "w_pwr_gnd", from: "GND", to: "BB_TOP_GND", sx: pGnd.x, sy: pGnd.y, ex: bbGnd.x, ey: bbGnd.y, color: "#0f172a", label: "GND Ground Bus" }
  ];

  switch (expId) {
    case "traffic_light":
      return [
        ...powerBus,
        { id: "w_btn", from: "D2", to: "PUSHBUTTON", sx: ARDUINO_PINS["D2"].x, sy: ARDUINO_PINS["D2"].y, ex: 667, ey: 112, color: "#38bdf8", label: "D2 ➔ Pedestrian Button" },
        { id: "w_bz", from: "D8", to: "BUZZER", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 742, ey: 112, color: "#a855f7", label: "D8 ➔ Warning Buzzer" },
        { id: "w_led_r", from: "D13", to: "LED_RED", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 485, ey: 112, color: "#ef4444", label: "D13 ➔ Red LED Anode" },
        { id: "w_led_y", from: "D12", to: "LED_YELLOW", sx: ARDUINO_PINS["D12"].x, sy: ARDUINO_PINS["D12"].y, ex: 545, ey: 112, color: "#f59e0b", label: "D12 ➔ Yellow LED Anode" },
        { id: "w_led_g", from: "D11", to: "LED_GREEN", sx: ARDUINO_PINS["D11"].x, sy: ARDUINO_PINS["D11"].y, ex: 605, ey: 112, color: "#10b981", label: "D11 ➔ Green LED Anode" }
      ];
    case "ultrasonic_radar":
      return [
        ...powerBus,
        { id: "w_trig", from: "D12", to: "SONAR_TRIG", sx: ARDUINO_PINS["D12"].x, sy: ARDUINO_PINS["D12"].y, ex: 525, ey: 112, color: "#38bdf8", label: "D12 ➔ Sonar Trig" },
        { id: "w_echo", from: "D11", to: "SONAR_ECHO", sx: ARDUINO_PINS["D11"].x, sy: ARDUINO_PINS["D11"].y, ex: 540, ey: 112, color: "#10b981", label: "D11 ➔ Sonar Echo" },
        { id: "w_warn", from: "D13", to: "LED_WARN", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 650, ey: 112, color: "#ef4444", label: "D13 ➔ Warning LED Anode" },
        { id: "w_bz", from: "D8", to: "BUZZER", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 730, ey: 112, color: "#a855f7", label: "D8 ➔ Proximity Buzzer" }
      ];
    case "ldr_nightlight":
      return [
        ...powerBus,
        { id: "w_ldr", from: "A1", to: "LDR", sx: ARDUINO_PINS["A1"].x, sy: ARDUINO_PINS["A1"].y, ex: 500, ey: 112, color: "#38bdf8", label: "A1 ➔ LDR Divider Node" },
        { id: "w_pwm", from: "D9", to: "LED_PWM", sx: ARDUINO_PINS["D9"].x, sy: ARDUINO_PINS["D9"].y, ex: 600, ey: 112, color: "#a855f7", label: "D9 (~PWM) ➔ Dimming LED Anode" },
        { id: "w_pot", from: "A0", to: "POT", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 700, ey: 112, color: "#facc15", label: "A0 ➔ Threshold Pot Wiper" }
      ];
    case "servo_control":
      return [
        ...powerBus,
        { id: "w_srv", from: "D9", to: "SERVO_SIG", sx: ARDUINO_PINS["D9"].x, sy: ARDUINO_PINS["D9"].y, ex: 560, ey: 112, color: "#f97316", label: "D9 (~PWM) ➔ Servo Signal" },
        { id: "w_pot", from: "A0", to: "POT_WIPER", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 700, ey: 112, color: "#38bdf8", label: "A0 ➔ Steering Pot Wiper" }
      ];
    case "chiptune_melody":
      return [
        ...powerBus,
        { id: "w_bz", from: "D8", to: "PIEZO", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 580, ey: 112, color: "#a855f7", label: "D8 ➔ Piezo Sounder (+)" },
        { id: "w_led", from: "D13", to: "LED_TEMPO", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 700, ey: 112, color: "#38bdf8", label: "D13 ➔ Beat Strobe Anode" }
      ];
    case "weather_station":
      return [
        ...powerBus,
        { id: "w_sda", from: "A4", to: "LCD_SDA", sx: ARDUINO_PINS["A4"].x, sy: ARDUINO_PINS["A4"].y, ex: 595, ey: 112, color: "#10b981", label: "A4 ➔ I2C SDA" },
        { id: "w_scl", from: "A5", to: "LCD_SCL", sx: ARDUINO_PINS["A5"].x, sy: ARDUINO_PINS["A5"].y, ex: 610, ey: 112, color: "#38bdf8", label: "A5 ➔ I2C SCL" },
        { id: "w_tmp", from: "A1", to: "TMP36", sx: ARDUINO_PINS["A1"].x, sy: ARDUINO_PINS["A1"].y, ex: 730, ey: 112, color: "#facc15", label: "A1 ➔ TMP36 Vout" }
      ];
    case "rgb_mood_lamp":
      return [
        ...powerBus,
        { id: "w_r", from: "D9", to: "RGB_R", sx: ARDUINO_PINS["D9"].x, sy: ARDUINO_PINS["D9"].y, ex: 510, ey: 112, color: "#ef4444", label: "D9 (PWM) ➔ Red Limiter" },
        { id: "w_g", from: "D10", to: "RGB_G", sx: ARDUINO_PINS["D10"].x, sy: ARDUINO_PINS["D10"].y, ex: 540, ey: 112, color: "#10b981", label: "D10 (PWM) ➔ Green Limiter" },
        { id: "w_b", from: "D11", to: "RGB_B", sx: ARDUINO_PINS["D11"].x, sy: ARDUINO_PINS["D11"].y, ex: 570, ey: 112, color: "#38bdf8", label: "D11 (PWM) ➔ Blue Limiter" },
        { id: "w_pot", from: "A0", to: "POT_HUE", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 700, ey: 112, color: "#facc15", label: "A0 ➔ Hue Selector Wiper" }
      ];
    case "dc_motor_speed":
      return [
        ...powerBus,
        { id: "w_mot", from: "D5", to: "MOSFET_GATE", sx: ARDUINO_PINS["D5"].x, sy: ARDUINO_PINS["D5"].y, ex: 630, ey: 112, color: "#a855f7", label: "D5 (PWM) ➔ Driver Gate (1kΩ)" },
        { id: "w_pot", from: "A0", to: "POT_SPEED", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 720, ey: 112, color: "#38bdf8", label: "A0 ➔ Throttle Pot Wiper" }
      ];
    case "pir_alarm":
      return [
        ...powerBus,
        { id: "w_pir", from: "D7", to: "PIR_OUT", sx: ARDUINO_PINS["D7"].x, sy: ARDUINO_PINS["D7"].y, ex: 510, ey: 112, color: "#facc15", label: "D7 ➔ PIR Trigger Out" },
        { id: "w_rly", from: "D4", to: "RELAY_IN", sx: ARDUINO_PINS["D4"].x, sy: ARDUINO_PINS["D4"].y, ex: 610, ey: 112, color: "#38bdf8", label: "D4 ➔ Relay Coil In" },
        { id: "w_warn", from: "D13", to: "LED_WARN", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 690, ey: 112, color: "#ef4444", label: "D13 ➔ Alarm Strobe Anode" },
        { id: "w_bz", from: "D8", to: "SIREN_BZ", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 755, ey: 112, color: "#a855f7", label: "D8 ➔ Intruder Siren (+)" }
      ];
    case "seven_seg_counter":
      return [
        ...powerBus,
        { id: "w_s1", from: "D6", to: "SEG_A", sx: ARDUINO_PINS["D6"].x, sy: ARDUINO_PINS["D6"].y, ex: 510, ey: 112, color: "#ef4444", label: "D6 ➔ Seg A (220Ω)" },
        { id: "w_s2", from: "D7", to: "SEG_B", sx: ARDUINO_PINS["D7"].x, sy: ARDUINO_PINS["D7"].y, ex: 550, ey: 112, color: "#f97316", label: "D7 ➔ Seg B (220Ω)" },
        { id: "w_s3", from: "D8", to: "SEG_C", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 590, ey: 112, color: "#facc15", label: "D8 ➔ Seg C (220Ω)" },
        { id: "w_btn", from: "D2", to: "STEP_BTN", sx: ARDUINO_PINS["D2"].x, sy: ARDUINO_PINS["D2"].y, ex: 680, ey: 112, color: "#38bdf8", label: "D2 ➔ Step Switch (Pullup)" }
      ];
    case "joystick_pan_tilt":
      return [
        ...powerBus,
        { id: "w_jx", from: "A0", to: "JOY_VRX", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 500, ey: 112, color: "#38bdf8", label: "A0 ➔ Joystick X-Axis" },
        { id: "w_jy", from: "A1", to: "JOY_VRY", sx: ARDUINO_PINS["A1"].x, sy: ARDUINO_PINS["A1"].y, ex: 515, ey: 112, color: "#10b981", label: "A1 ➔ Joystick Y-Axis" },
        { id: "w_srv", from: "D9", to: "SERVO_PAN", sx: ARDUINO_PINS["D9"].x, sy: ARDUINO_PINS["D9"].y, ex: 660, ey: 112, color: "#f97316", label: "D9 (PWM) ➔ Pan Servo Signal" }
      ];
    case "button_toggle":
      return [
        ...powerBus,
        { id: "w_btn", from: "D2", to: "TACT_SW", sx: ARDUINO_PINS["D2"].x, sy: ARDUINO_PINS["D2"].y, ex: 540, ey: 112, color: "#facc15", label: "D2 ➔ Debounced Pushbutton" },
        { id: "w_led", from: "D13", to: "STATUS_LED", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 660, ey: 112, color: "#38bdf8", label: "D13 ➔ Latching LED Anode" }
      ];
    case "sonar_lcd_scope":
      return [
        ...powerBus,
        { id: "w_trig", from: "D12", to: "SONAR_T", sx: ARDUINO_PINS["D12"].x, sy: ARDUINO_PINS["D12"].y, ex: 515, ey: 112, color: "#38bdf8", label: "D12 ➔ Sonar Trig" },
        { id: "w_echo", from: "D11", to: "SONAR_E", sx: ARDUINO_PINS["D11"].x, sy: ARDUINO_PINS["D11"].y, ex: 530, ey: 112, color: "#10b981", label: "D11 ➔ Sonar Echo" },
        { id: "w_bz", from: "D13", to: "ALARM_BZ", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 730, ey: 112, color: "#ef4444", label: "D13 ➔ Alert Sounder (+)" }
      ];
    case "thermostat_relay_fan":
      return [
        ...powerBus,
        { id: "w_tmp", from: "A0", to: "TMP36", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 480, ey: 112, color: "#facc15", label: "A0 ➔ TMP36 Temp Vout" },
        { id: "w_pot", from: "A1", to: "SET_POT", sx: ARDUINO_PINS["A1"].x, sy: ARDUINO_PINS["A1"].y, ex: 560, ey: 112, color: "#f97316", label: "A1 ➔ Setpoint Pot Wiper" },
        { id: "w_rly", from: "D4", to: "RELAY", sx: ARDUINO_PINS["D4"].x, sy: ARDUINO_PINS["D4"].y, ex: 640, ey: 112, color: "#38bdf8", label: "D4 ➔ Relay Driver In" },
        { id: "w_fan", from: "D5", to: "FAN_PWM", sx: ARDUINO_PINS["D5"].x, sy: ARDUINO_PINS["D5"].y, ex: 730, ey: 112, color: "#10b981", label: "D5 (PWM) ➔ Cooling Fan Gate" }
      ];
    case "multi_sensor_alarm":
      return [
        ...powerBus,
        { id: "w_pir", from: "D7", to: "PIR", sx: ARDUINO_PINS["D7"].x, sy: ARDUINO_PINS["D7"].y, ex: 495, ey: 112, color: "#facc15", label: "D7 ➔ PIR Motion Trigger" },
        { id: "w_ldr", from: "A0", to: "LDR", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 570, ey: 112, color: "#38bdf8", label: "A0 ➔ LDR Divider Node" },
        { id: "w_rly", from: "D4", to: "RELAY", sx: ARDUINO_PINS["D4"].x, sy: ARDUINO_PINS["D4"].y, ex: 650, ey: 112, color: "#10b981", label: "D4 ➔ Floodlight Relay" },
        { id: "w_bz", from: "D8", to: "SIREN", sx: ARDUINO_PINS["D8"].x, sy: ARDUINO_PINS["D8"].y, ex: 750, ey: 112, color: "#a855f7", label: "D8 ➔ Alarm Siren (+)" }
      ];
    case "custom_sandbox":
    default:
      return [
        ...powerBus,
        { id: "w_sb_1", from: "D13", to: "CUSTOM_LED", sx: ARDUINO_PINS["D13"].x, sy: ARDUINO_PINS["D13"].y, ex: 640, ey: 112, color: "#38bdf8", label: "D13 ➔ Sandbox LED Anode" },
        { id: "w_sb_2", from: "A0", to: "CUSTOM_POT", sx: ARDUINO_PINS["A0"].x, sy: ARDUINO_PINS["A0"].y, ex: 700, ey: 112, color: "#facc15", label: "A0 ➔ Sandbox Pot Wiper" }
      ];
  }
}

// ---------------------------------------------------------------------------
// In-Browser C++ Arduino Micro-Compiler & Abstract Syntax Evaluator
// ---------------------------------------------------------------------------
export function compileArduinoSketch(source) {
  if (!source || typeof source !== "string" || !source.trim()) {
    return { success: false, error: "Empty sketch source code." };
  }

  // 1. Bracket & Parentheses Matching Analysis
  let braceDepth = 0;
  let parenDepth = 0;
  const lines = source.split("\n");

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l].replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === "{") braceDepth++;
      else if (char === "}") braceDepth--;
      else if (char === "(") parenDepth++;
      else if (char === ")") parenDepth--;

      if (braceDepth < 0) {
        return { success: false, error: `sketch.ino:${l + 1}:${c + 1}: error: extraneous closing brace '}' found.` };
      }
      if (parenDepth < 0) {
        return { success: false, error: `sketch.ino:${l + 1}:${c + 1}: error: unmatched closing parenthesis ')' found.` };
      }
    }
  }

  if (braceDepth !== 0) {
    return { success: false, error: `sketch.ino: error: unmatched opening brace '{' (${braceDepth} missing closing '}' braces).` };
  }
  if (parenDepth !== 0) {
    return { success: false, error: `sketch.ino: error: unmatched opening parenthesis '(' (${parenDepth} missing ')').` };
  }

  // 2. Setup and Loop Signature Presence
  const hasSetup = /void\s+setup\s*\(\s*\)/.test(source);
  const hasLoop = /void\s+loop\s*\(\s*\)/.test(source);

  if (!hasSetup) {
    return { success: false, error: "Linker Error: undefined reference to 'setup()'. Every Arduino sketch requires a void setup() function." };
  }
  if (!hasLoop) {
    return { success: false, error: "Linker Error: undefined reference to 'loop()'. Every Arduino sketch requires a void loop() function." };
  }

  // 3. Realistic AVR-GCC memory metrics
  const flashBytes = Math.min(32256, 1140 + Math.round(source.length * 2.8));
  const sramBytes = Math.min(2048, 128 + ((source.match(/\b(int|float|bool|long|char)\b/g) || []).length * 8));

  // 4. Extract function bodies
  function extractBody(code, name) {
    const match = new RegExp(`void\\s+${name}\\s*\\(\\s*\\)[^{]*\\{`, "g").exec(code);
    if (!match) return "";
    let s = match.index + match[0].length;
    let depth = 1;
    let e = s;
    for (let i = s; i < code.length; i++) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") {
        depth--;
        if (depth === 0) { e = i; break; }
      }
    }
    return code.slice(s, e);
  }

  const setupBody = extractBody(source, "setup");
  const loopBody = extractBody(source, "loop");

  // Extract delay timers if present
  const delayMatches = loopBody.match(/delay\s*\(\s*(\d+)\s*\)/g) || [];
  const delays = delayMatches.map(m => parseInt(m.replace(/\D/g, ""), 10) || 500);
  const totalCycleMs = delays.reduce((acc, d) => acc + d, 0) || 1000;

  return {
    success: true,
    flashBytes,
    sramBytes,
    source,
    setupBody,
    loopBody,
    delays,
    totalCycleMs
  };
}

// ---------------------------------------------------------------------------
// Circuit Schematic, SPICE Deck & Engineering BOM Netlist Exporter
// ---------------------------------------------------------------------------
export function exportCircuitNetlist(exp, wires = [], customComponents = []) {
  const title = exp?.title || "Custom Arduino Project";
  const dateStr = new Date().toISOString().split("T")[0];
  const activeWires = Array.isArray(wires) ? wires : [];
  const customComps = Array.isArray(customComponents) ? customComponents : [];

  // 1. Generate SPICE Deck (.cir)
  let spice = `* ===========================================================================\n`;
  spice += `* EDUGATES STEM LAB - ARDUINO UNO R3 CIRCUIT NETLIST\n`;
  spice += `* Project: ${title}\n`;
  spice += `* Date: ${dateStr}\n`;
  spice += `* Microcontroller: ATmega328P (8-Bit AVR RISC @ 16.0 MHz)\n`;
  spice += `* Target Simulator: SPICE 3f5 / ngspice / LTspice Compatible\n`;
  spice += `* ===========================================================================\n\n`;
  spice += `* --- POWER RAILS & SUPPLIES ---\n`;
  spice += `VCC 5V 0 DC 5.0\n`;
  spice += `V33 3V3 0 DC 3.3\n`;
  spice += `GND 0 0 0\n\n`;

  spice += `* --- ARDUINO UNO R3 I/O NET CONNECTIONS ---\n`;
  if (activeWires.length > 0) {
    activeWires.forEach((w, idx) => {
      const fromNet = (w.from || "NC").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
      const toNet = (w.to || "NC").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
      spice += `W${idx + 1} ${fromNet} ${toNet} 0.05 ; ${w.label || 'Jumper Wire'} (${w.color || '#fff'})\n`;
    });
  } else {
    spice += `* No jumper wires connected\n`;
  }

  spice += `\n* --- PERIPHERALS & TRANSDUCERS ---\n`;
  if (customComps.length > 0) {
    customComps.forEach((c, idx) => {
      const pinNet = `PIN_${c.pin || idx}`;
      switch (c.type) {
        case "led_red":
        case "led_green":
        case "led_yellow":
        case "led_blue":
          spice += `D_LED${idx + 1} ${pinNet} GND LED_${c.type.toUpperCase()} ; ${c.label}\n`;
          spice += `R_LIM${idx + 1} ${pinNet} D_IN_${idx + 1} 220 ; 220 Ohm Current Limiter\n`;
          break;
        case "resistor":
          spice += `R_CUSTOM${idx + 1} ${pinNet} GND ${c.state?.value || 220} ; ${c.label}\n`;
          break;
        case "potentiometer":
          spice += `R_POT_A${idx + 1} 5V ${pinNet} 5000 ; ${c.label} High Side\n`;
          spice += `R_POT_B${idx + 1} ${pinNet} GND 5000 ; ${c.label} Low Side\n`;
          break;
        case "piezo_buzzer":
          spice += `L_BZ${idx + 1} ${pinNet} GND 10m ; ${c.label} Acoustic Coil\n`;
          break;
        case "dht11":
          spice += `X_DHT${idx + 1} 5V GND ${pinNet} DHT11_SINGLE_BUS ; ${c.label}\n`;
          break;
        case "bme280":
          spice += `X_BME${idx + 1} 5V GND SDA SCL BME280_I2C ; ${c.label}\n`;
          break;
        case "oled_ssd1306":
          spice += `X_OLED${idx + 1} 5V GND SCL SDA SSD1306_I2C ; ${c.label}\n`;
          break;
        case "stepper_motor":
          spice += `M_STEP${idx + 1} PIN_8 PIN_9 PIN_10 PIN_11 ULN2003_MOTOR ; ${c.label}\n`;
          break;
        default:
          spice += `R_PULL${idx + 1} ${pinNet} 5V 10k ; ${c.label}\n`;
      }
    });
  } else {
    // Default peripheral schematic mapping based on experiment
    const expWires = exp?.circuitWiring || [];
    expWires.forEach((w, idx) => {
      spice += `R_NET_${idx + 1} ${w.from} ${w.to} 0.01 ; Schematic Net (${w.color})\n`;
    });
  }

  spice += `\n* --- SUBCIRCUIT DEFINITIONS ---\n`;
  spice += `.SUBCKT DHT11_SINGLE_BUS VCC GND DATA\n`;
  spice += `R_PULL VCC DATA 4.7k\n`;
  spice += `C_HUM DATA GND 100p\n`;
  spice += `.ENDS DHT11_SINGLE_BUS\n\n`;
  spice += `.SUBCKT BME280_I2C VCC GND SDA SCL\n`;
  spice += `R_SDA VCC SDA 10k\n`;
  spice += `R_SCL VCC SCL 10k\n`;
  spice += `C_BUS SDA GND 50p\n`;
  spice += `.ENDS BME280_I2C\n\n`;
  spice += `.SUBCKT SSD1306_I2C VCC GND SCL SDA\n`;
  spice += `R_SCL VCC SCL 4.7k\n`;
  spice += `R_SDA VCC SDA 4.7k\n`;
  spice += `C_IN SCL GND 25p\n`;
  spice += `.ENDS SSD1306_I2C\n\n`;
  spice += `.SUBCKT ULN2003_MOTOR IN1 IN2 IN3 IN4\n`;
  spice += `Q1 5V IN1 0 2N2222\n`;
  spice += `Q2 5V IN2 0 2N2222\n`;
  spice += `Q3 5V IN3 0 2N2222\n`;
  spice += `Q4 5V IN4 0 2N2222\n`;
  spice += `.ENDS ULN2003_MOTOR\n\n`;
  spice += `* --- DIODE & ACTIVE DEVICE MODELS ---\n`;
  spice += `.model LED_RED D(Is=1e-22 Rs=6 N=1.8 Cjo=40p)\n`;
  spice += `.model LED_GREEN D(Is=1e-22 Rs=8 N=2.0 Cjo=35p)\n`;
  spice += `.model LED_YELLOW D(Is=1e-22 Rs=7 N=1.9 Cjo=38p)\n`;
  spice += `.model LED_BLUE D(Is=1e-22 Rs=12 N=2.8 Cjo=30p)\n`;
  spice += `.model 1N4007 D(Is=7.02n Rs=34.15m N=1.8)\n`;
  spice += `.model 2N2222 NPN(Is=14.34f Xti=3 Eg=1.11 Vaf=74.03 Bf=255.9)\n\n`;
  spice += `* --- TRANSIENT ANALYSIS ---\n`;
  spice += `.tran 100u 100m\n`;
  spice += `.end\n`;

  // 2. Generate JSON Netlist
  const jsonNetlist = {
    metadata: {
      project: title,
      id: exp?.id || "custom_project",
      mcu: "ATmega328P",
      frequency_mhz: 16.0,
      supply_vcc: 5.0,
      timestamp: new Date().toISOString()
    },
    wires: activeWires.map(w => ({
      id: w.id,
      from: w.from,
      to: w.to,
      color: w.color,
      label: w.label || `${w.from} -> ${w.to}`,
      net: `NET_${(w.from || "NC").toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`
    })),
    components: customComps.length > 0 ? customComps.map(c => ({
      id: c.id,
      type: c.type,
      label: c.label,
      pin: c.pin,
      x: c.x,
      y: c.y,
      state: c.state
    })) : (exp?.blueprint4k?.bomList || []).map((b, i) => ({
      id: `part_${i + 1}`,
      label: b.item,
      type: b.part,
      qty: b.qty
    }))
  };

  // 3. Generate Bill of Materials (BOM)
  let bomItems = [];
  if (customComps.length > 0) {
    bomItems.push({ item: "Arduino Uno R3", part: "ATmega328P MCU Board", qty: 1, ref: "U1" });
    bomItems.push({ item: "Solderless Breadboard", part: "Half-Size 400 Tie-Points", qty: 1, ref: "BB1" });
    if (activeWires.length > 0) {
      bomItems.push({ item: "Jumper Wires", part: "22 AWG Solid Core Male-to-Male", qty: activeWires.length, ref: `W1-W${activeWires.length}` });
    }
    customComps.forEach((c, idx) => {
      bomItems.push({ item: c.label, part: c.type.toUpperCase(), qty: 1, ref: `COMP${idx + 1}` });
    });
  } else if (exp?.blueprint4k?.bomList && exp.blueprint4k.bomList.length > 0) {
    bomItems = exp.blueprint4k.bomList.map((b, i) => ({
      item: b.item,
      part: b.part,
      qty: b.qty,
      ref: `E${i + 1}`
    }));
  } else {
    bomItems = [
      { item: "Arduino Uno R3", part: "ATmega328P Board", qty: 1, ref: "U1" },
      { item: "Half Breadboard", part: "400 Tie Points", qty: 1, ref: "BB1" },
      { item: "Assorted Jumpers", part: "Solid 22AWG", qty: activeWires.length || 5, ref: "W_NET" }
    ];
  }

  let bomCsv = "Item,Reference,Part Description,Package / Type,Qty\n";
  bomItems.forEach((b, idx) => {
    bomCsv += `"${idx + 1}","${b.ref || ('P' + (idx + 1))}","${b.item}","${b.part}","${b.qty}"\n`;
  });

  return {
    spice,
    jsonNetlist,
    bomCsv,
    bomItems
  };
}

// ---------------------------------------------------------------------------
// Main Arduino Virtual Laboratory Controller
// ---------------------------------------------------------------------------
export function initArduinoLab(containerId) {
  cleanupArduinoLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  const audio = new ArduinoAudioEngine();

  // Workbench State
  const state = {
    selectedExpIndex: 0,
    isRunning: true,
    simSpeed: 1.0,
    simTimeMs: 0,
    baudRate: 9600,
    serialAutoScroll: true,
    activeTab: "monitor", // "monitor" or "plotter"
    components: {
      powerLed: true,
      pin13Led: false,
      pin9Pwm: 0,
      pin11Led: false,
      pin12Led: false,
      txLed: false,
      rxLed: false,
      buttonPressed: false,
      buttonToggleState: false,
      lastButtonState: false,
      buttonPressCount: 0,
      potValue: 512,      // 0 - 1023
      ldrLux: 450,        // 0 - 1000 lux
      obstacleDistCm: 25, // 2 - 400 cm
      servoAngle: 90,     // 0 - 180 deg
      currentServoAngle: 90,
      temperatureC: 24.5, // -40 to 125 C
      lcdLines: ["Edugates STEM Lab", "Arduino Uno R3"],
      // Extended hardware components & custom sandbox states
      toggleSwitchOn: false,
      rgbColor: { r: 255, g: 0, b: 128 },
      motorSpeed: 0,       // 0 - 255 PWM
      currentMotorAngle: 0,
      relayActive: false,
      sevenSegDigit: 0,
      sevenSegSegments: { a: true, b: true, c: true, d: true, e: true, f: true, g: false, dp: false },
      pirMotionDetected: false,
      joystick: { x: 512, y: 512, btn: false },
      customPlacedComponents: [
        { id: "comp_1", type: "led_red", label: "Status LED", pin: 13, x: 220, y: 80, state: { on: true, brightness: 1 } },
        { id: "comp_2", type: "resistor", label: "220Ω Limiter", pin: 13, x: 160, y: 80, state: { value: 220 } },
        { id: "comp_3", type: "pushbutton", label: "Trigger Button", pin: 2, x: 120, y: 160, state: { pressed: false } },
        { id: "comp_4", type: "potentiometer", label: "10kΩ Pot", pin: "A0", x: 280, y: 170, state: { val: 512 } },
        { id: "comp_5", type: "piezo_buzzer", label: "Tone Alarm", pin: 8, x: 360, y: 80, state: { playing: false } }
      ]
    },
    serialLogs: [
      "[00:00.000] Arduino Uno R3 Bootloader v4.4 OK",
      "[00:00.040] ATmega328P Clock: 16.000 MHz",
      "[00:00.080] Serial initialized @ 9600 baud"
    ],
    waveformPoints: [],
    // Live Wire Routing System State
    wires: [],
    wireDrawing: {
      active: false,
      startPin: null,
      curX: 0,
      curY: 0,
      color: "#ef4444"
    },
    isWireMode: false,
    activeWireColor: "#ef4444",
    hoveredWire: null,
    hoveredWireIndex: -1,
    hoveredPin: null,

    // Interactive Breadboard Component Drag & Relocation State
    isDraggingComp: false,
    draggedCompIndex: -1,
    dragCompStart: { x: 0, y: 0 },
    dragPointerStart: { x: 0, y: 0 },

    // Dual-Channel Digital Storage Oscilloscope (DSO) State
    dso: {
      ch1Probe: "pin13", // "pin13", "pwm9", "motor", "buzzer", "relay", "pin11"
      ch2Probe: "pot",   // "pot", "ldr", "temp", "dist", "raw"
      timebaseMs: 50,    // ms per division (10, 25, 50, 100, 250, 500)
      voltsPerDiv1: 1,   // V per division
      voltsPerDiv2: 1,
      triggerMode: "auto", // "auto", "norm", "rising", "falling"
      isFrozen: false,
      ch1Metrics: { vpp: 5.0, vrms: 3.54, freq: 0, duty: 50 },
      ch2Metrics: { vpp: 2.5, vrms: 1.77, freq: 0, duty: 50 }
    },

    // Custom Sketch Runner & Interpreter State
    customSketch: null,
    isCustomSketchActive: false,
    customSketchEnv: {},
    customSketchTimer: 0
  };

  let animationFrameId = null;
  let lastFrameTime = performance.now();
  let loopTimer = 0;

  // Initialize active wires from default experiment
  state.wires = getDefaultWiresForExperiment(ARDUINO_EXPERIMENTS[state.selectedExpIndex]?.id || "traffic_light");

  // Render DOM Shell
  container.innerHTML = `
    <div class="lab-container arduino-workbench" style="background: radial-gradient(circle at 50% 20%, #0d1527 0%, #070a12 100%); border-radius: 16px; padding: 18px; color: #f1f5f9; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.85); border: 1.5px solid rgba(6, 182, 212, 0.35);">
      
      <!-- Top Action & Navigation Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; padding: 12px 18px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; backdrop-filter: blur(12px);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">⚡</span>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                Arduino Uno R3 &amp; Embedded Circuits
                <span class="badge" style="background: rgba(6, 182, 212, 0.18); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px;">
                  ATmega328P • 16 MHz
                </span>
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8;">
                Real-time C++ IDE • Breadboard Circuits • Synthesized Web Audio Acoustics
              </div>
            </div>
          </div>
        </div>

        <!-- Header Action Controls -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- Sound Effects Mute Toggle Button -->
          <button id="btn-arduino-mute" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(56, 189, 248, 0.3);" title="Toggle Synthesized Sound Effects">
            <span id="mute-icon">${audio.isMuted() ? "🔇" : "🔊"}</span>
            <span id="mute-label">${audio.isMuted() ? "Unmute Audio" : "Sound Effects ON"}</span>
          </button>

          <!-- Export CSV Data -->
          <button id="btn-arduino-export" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
            <span>📊</span>
            <span>Export CSV</span>
          </button>

          <!-- Lab Report Generator -->
          <button id="btn-arduino-report" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
            <span>📄</span>
            <span>Lab Report</span>
          </button>

          <!-- Export Schematic & CAD Netlist -->
          <button id="btn-arduino-netlist" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Export CAD Netlist, SPICE Deck, and Bill of Materials">
            <span>⚡</span>
            <span>Netlist &amp; SPICE</span>
          </button>

          <!-- Reset Workbench -->
          <button id="btn-arduino-reset" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700; border-radius: 8px; border-color: rgba(239, 68, 68, 0.4); color: #f87171; display: inline-flex; align-items: center; gap: 6px;" title="Reset MCU & Hardware State">
            <span>🔄</span>
            <span>Reset MCU</span>
          </button>
        </div>
      </div>

      <!-- Live Educational Formulation Badges -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; align-items: center;">
        <span class="badge" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 8px; font-size: 0.78rem; color: #7dd3fc;">
          ${formatMathText("Ohm's Law: $V = I \\cdot R$")}
        </span>
        <span class="badge" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 12px; border-radius: 8px; font-size: 0.78rem; color: #6ee7b7;">
          ${formatMathText("ADC Conversion: $V = \\frac{\\text{ADC}}{1023} \\times 5.0\\,\\text{V}$")}
        </span>
        <span class="badge" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 12px; border-radius: 8px; font-size: 0.78rem; color: #fde047;">
          ${formatMathText("Ultrasonic Distance: $d = \\frac{343\\,\\text{m/s} \\cdot \\Delta t}{2}$")}
        </span>
        <span class="badge" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); padding: 5px 12px; border-radius: 8px; font-size: 0.78rem; color: #d8b4fe;">
          ${formatMathText("PWM Effective Voltage: $V_{\\text{avg}} = \\frac{\\text{Duty}}{255} \\times 5.0\\,\\text{V}$")}
        </span>
      </div>

      <!-- Main Two-Column Workbench Layout: Left Interactive Visual Bench & Right C++ Code IDE -->
      <div style="display: grid; grid-template-columns: minmax(360px, 1.35fr) minmax(320px, 1fr); gap: 16px; margin-bottom: 16px;" class="arduino-grid-split">
        
        <!-- LEFT COLUMN: Arduino & Breadboard Canvas & Interactive Controls -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Experiment Preset Selector Bar -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 12px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
            <!-- Top Controls Row: Header, 4K Studio Button & Category Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">
                  Choose Guided Experiment (15 Projects):
                </span>
                <span id="exp-category-badge" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px;">
                  ${ARDUINO_EXPERIMENTS[0].category}
                </span>
              </div>
              
              <!-- 4K UHD Picture & Technical Blueprint Studio Button -->
              <button id="btn-open-4k-modal" class="btn btn-secondary" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(99, 102, 241, 0.25)); border: 1px solid #38bdf8; font-size: 0.76rem; font-weight: 700; color: #38bdf8; padding: 4px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="View 4K Ultra-HD Workbench Photo & CAD Blueprint">
                <span>🖼️</span> <span>4K UHD Picture & Blueprint</span>
              </button>
            </div>

            <!-- Difficulty Tier Filter Pills -->
            <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
              <button type="button" class="btn btn-tier-filter active" data-tier="all" style="padding: 3px 10px; font-size: 0.73rem; font-weight: 700; border-radius: 6px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8;">
                All (15 Projects)
              </button>
              <button type="button" class="btn btn-tier-filter" data-tier="easy" style="padding: 3px 10px; font-size: 0.73rem; font-weight: 600; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4);">
                🟢 Easy (5)
              </button>
              <button type="button" class="btn btn-tier-filter" data-tier="intermediate" style="padding: 3px 10px; font-size: 0.73rem; font-weight: 600; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4);">
                🟡 Intermediate (5)
              </button>
              <button type="button" class="btn btn-tier-filter" data-tier="advanced" style="padding: 3px 10px; font-size: 0.73rem; font-weight: 600; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.4);">
                🔴 Advanced (5)
              </button>
              <button type="button" class="btn btn-tier-filter" data-tier="sandbox" style="padding: 3px 10px; font-size: 0.73rem; font-weight: 600; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4);">
                🛠️ Sandbox
              </button>
            </div>

            <!-- Experiment Select Dropdown -->
            <select id="sel-arduino-exp" class="form-select" style="width: 100%; background: #0f172a; color: #f1f5f9; border: 1.5px solid rgba(56, 189, 248, 0.4); padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer;">
              ${ARDUINO_EXPERIMENTS.map((exp, idx) => `
                <option value="${idx}" ${idx === 0 ? "selected" : ""}>
                  ${exp.difficultyLabel ? `[${exp.difficultyLabel}] ` : ""}${exp.title}
                </option>
              `).join("")}
            </select>

            <div id="exp-desc-box" style="font-size: 0.78rem; color: #cbd5e1; margin-top: 8px; line-height: 1.45;">
              ${ARDUINO_EXPERIMENTS[0].description}
            </div>

            <!-- Live Experiment Badges -->
            <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center; flex-wrap: wrap;">
              <span id="exp-difficulty-badge" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.3);">
                ${ARDUINO_EXPERIMENTS[0].difficultyLabel || "🟢 Easy"}
              </span>
              <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(129, 140, 248, 0.3);">
                🖼️ 4K UHD 3840×2160
              </span>
              <span id="exp-voltage-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fde047; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(253, 224, 71, 0.3);">
                5.0V USB Regulated
              </span>
            </div>
          </div>

          <!-- Custom Project Builder & Component Toolbox Toolbar -->
          <div id="arduino-custom-toolbar" style="background: rgba(15, 23, 42, 0.9); border: 1.5px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.05rem;">🧰</span>
                <span style="font-size: 0.84rem; font-weight: 700; color: #38bdf8;">Custom Project Builder & Component Library</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button id="btn-custom-gencpu" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: 6px; color: #34d399; border-color: rgba(52, 211, 153, 0.4);" title="Generate Arduino sketch for placed components">
                  ⚡ Auto-Gen C++
                </button>
                <button id="btn-custom-save" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: 6px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" title="Save current project to browser storage">
                  💾 Save
                </button>
                <button id="btn-custom-load" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 700; border-radius: 6px; color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);" title="Load saved custom project">
                  📂 Load
                </button>
                <button id="btn-custom-clear" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.74rem; font-weight: 600; border-radius: 6px; color: #f87171; border-color: rgba(239, 68, 68, 0.4);" title="Clear custom breadboard components">
                  🗑️ Clear
                </button>
              </div>
            </div>

            <!-- Component Addition Dropdown & Pin Selector -->
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">Add Component:</span>
              <select id="sel-add-component" class="form-select" style="flex: 1; min-width: 170px; background: #0b1120; color: #f1f5f9; border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 8px; border-radius: 6px; font-size: 0.78rem;">
                ${AVAILABLE_PARTS.map(part => `<option value="${part.type}">${part.icon} ${part.name} (${part.category})</option>`).join("")}
              </select>
              <button id="btn-add-component-part" class="btn btn-primary" style="padding: 5px 12px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; background: #0891b2;" aria-label="Add component to breadboard">
                ➕ Add to Breadboard
              </button>
            </div>

            <!-- Placed components list chips -->
            <div id="custom-placed-chips" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; max-height: 80px; overflow-y: auto; padding: 2px;"></div>
          </div>

          <!-- Interactive Breadboard Wire Routing Toolbar -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button id="btn-toggle-wire-mode" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;" title="Toggle Wire Routing Mode">
                <span id="wire-mode-icon">🔌</span>
                <span id="wire-mode-text">Wire Routing Mode: OFF</span>
              </button>

              <!-- Color Palette -->
              <div style="display: flex; align-items: center; gap: 5px;" title="Select Jumper Wire Color">
                <span style="font-size: 0.72rem; color: #94a3b8;">Wire:</span>
                <button class="btn-wire-color active" data-color="#ef4444" style="width: 18px; height: 18px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; cursor: pointer; padding: 0;" title="Red (5V Power)"></button>
                <button class="btn-wire-color" data-color="#0f172a" style="width: 18px; height: 18px; border-radius: 50%; background: #0f172a; border: 1.5px solid #475569; cursor: pointer; padding: 0;" title="Black (GND Ground)"></button>
                <button class="btn-wire-color" data-color="#38bdf8" style="width: 18px; height: 18px; border-radius: 50%; background: #38bdf8; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="Blue (Digital Signal)"></button>
                <button class="btn-wire-color" data-color="#10b981" style="width: 18px; height: 18px; border-radius: 50%; background: #10b981; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="Green (Analog Signal)"></button>
                <button class="btn-wire-color" data-color="#facc15" style="width: 18px; height: 18px; border-radius: 50%; background: #facc15; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="Yellow (SPI/I2C)"></button>
                <button class="btn-wire-color" data-color="#a855f7" style="width: 18px; height: 18px; border-radius: 50%; background: #a855f7; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="Purple (PWM Control)"></button>
                <button class="btn-wire-color" data-color="#f97316" style="width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="Orange (Interrupt)"></button>
                <button class="btn-wire-color" data-color="#f8fafc" style="width: 18px; height: 18px; border-radius: 50%; background: #f8fafc; border: 1.5px solid transparent; cursor: pointer; padding: 0;" title="White (Clock)"></button>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="badge-wire-count" class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.72rem; padding: 2px 8px; border-radius: 6px;">
                ⚡ ${state.wires.length} Wires Connected
              </span>
              <button id="btn-clear-wires" class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.72rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" title="Remove all jumper wires">
                🧹 Clear
              </button>
              <button id="btn-reset-wires" class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.72rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);" title="Reset to project schematic wiring">
                ↺ Reset Wires
              </button>
            </div>
          </div>

          <!-- Interactive Circuit Board Viewport (Canvas Simulation) -->
          <div class="lab-canvas-area" style="position: relative; background: #050811; border: 1.5px solid rgba(6, 182, 212, 0.35); border-radius: 12px; overflow: hidden; height: 460px; box-shadow: inset 0 0 40px rgba(0,0,0,0.8);">
            <canvas id="arduino-canvas" width="850" height="460" style="width: 100%; height: 100%; display: block;"></canvas>

            <!-- Top Overlay Telemetry HUD -->
            <div style="position: absolute; top: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
              <div style="display: flex; gap: 8px; pointer-events: auto;">
                <span class="badge" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(6, 182, 212, 0.4); padding: 4px 10px; border-radius: 9999px; font-family: monospace; font-size: 0.75rem; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
                  <span>MCU 5.0V Active</span>
                </span>
                <span class="badge" id="hud-sim-time" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 9999px; font-family: monospace; font-size: 0.75rem; color: #f59e0b;">
                  T = 0.00s
                </span>
              </div>

              <!-- Sim Running Indicator -->
              <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 9999px; font-family: monospace; font-size: 0.75rem; color: #34d399; pointer-events: auto;">
                <span id="badge-clock-speed">16.0 MHz (60 FPS)</span>
              </div>
            </div>

            <!-- Bottom Floating Physical Pushbutton Action for Crosswalk / Digital Input -->
            <div style="position: absolute; bottom: 12px; left: 14px; display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.3);">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8;">Breadboard Switch:</span>
              <button id="btn-breadboard-push" class="btn btn-primary" style="padding: 5px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 6px; box-shadow: 0 0 12px rgba(6,182,212,0.4);" aria-label="Press tactile switch on breadboard">
                🔘 Press Button (D2)
              </button>
            </div>
          </div>

          <!-- Interactive Component Slider Adjusters -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            
            <!-- 1. Potentiometer (A0) Dial -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #38bdf8;">🎛️ Potentiometer (A0)</span>
                <span id="val-pot" style="font-family: monospace; font-weight: 700; color: #7dd3fc;">512 (2.50V)</span>
              </div>
              <input type="range" id="slider-pot" min="0" max="1023" value="512" style="width: 100%; accent-color: #06b6d4;" aria-label="Potentiometer analog value">
            </div>

            <!-- 2. Ultrasonic Obstacle Distance (HC-SR04) -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #f59e0b;">📏 Sonar Obstacle</span>
                <span id="val-dist" style="font-family: monospace; font-weight: 700; color: #fde047;">25.0 cm</span>
              </div>
              <input type="range" id="slider-dist" min="2" max="150" value="25" style="width: 100%; accent-color: #f59e0b;" aria-label="Ultrasonic sensor obstacle distance">
            </div>

            <!-- 3. Ambient Light (LDR / Photocell A1) -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #34d399;">☀️ Ambient Light (LDR)</span>
                <span id="val-ldr" style="font-family: monospace; font-weight: 700; color: #6ee7b7;">450 Lux</span>
              </div>
              <input type="range" id="slider-ldr" min="0" max="1000" value="450" style="width: 100%; accent-color: #10b981;" aria-label="Ambient light lux level">
            </div>

            <!-- 4. TMP36 Temperature Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #ec4899;">🌡️ Ambient Temp (TMP36)</span>
                <span id="val-temp" style="font-family: monospace; font-weight: 700; color: #f472b6;">24.5 °C</span>
              </div>
              <input type="range" id="slider-temp" min="0" max="60" value="24.5" step="0.5" style="width: 100%; accent-color: #ec4899;" aria-label="Temperature in Celsius">
            </div>

            <!-- 5. DC Motor Speed (PWM D5) -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #38bdf8;">🌀 DC Motor (PWM D5)</span>
                <span id="val-motor" style="font-family: monospace; font-weight: 700; color: #7dd3fc;">0 PWM (0 RPM)</span>
              </div>
              <input type="range" id="slider-motor" min="0" max="255" value="0" style="width: 100%; accent-color: #38bdf8;" aria-label="DC Motor PWM Speed">
            </div>

            <!-- 6. RGB Mood Lamp Color Picker -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #a855f7;">🌈 RGB Color (D9/10/11)</span>
                <span id="val-rgb-hex" style="font-family: monospace; font-weight: 700; color: #c084fc;">#FF0080</span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="picker-rgb" value="#ff0080" style="width: 42px; height: 26px; border: none; border-radius: 4px; background: transparent; cursor: pointer;" aria-label="RGB Color Picker">
                <span style="font-size: 0.72rem; color: #94a3b8;">Click palette to mix</span>
              </div>
            </div>

            <!-- 7. Hardware Switch & Actuators Triggers Row -->
            <div style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06);">
              <!-- Songle Relay Manual Flip -->
              <button id="btn-relay-toggle" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" aria-label="Toggle Relay State">
                ⚡ Relay: OFF (NC)
              </button>

              <!-- PIR Motion Intruder Pulse -->
              <button id="btn-pir-trigger" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);" aria-label="Trigger PIR Sensor">
                🏃 Trigger Motion (PIR)
              </button>

              <!-- Slide Switch Toggle -->
              <button id="btn-slide-switch" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; color: #34d399; border-color: rgba(52, 211, 153, 0.4);" aria-label="Toggle Slide Switch">
                🔀 Slide Switch: OFF
              </button>

              <!-- 7-Segment Decimal Step -->
              <button id="btn-sevenseg-step" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; color: #f43f5e; border-color: rgba(244, 63, 94, 0.4);" aria-label="Step 7-Segment Counter">
                🔢 Step 7-Seg: 0
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Arduino C++ Code Editor & Microcontroller IDE -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Code Editor Header Bar -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem;">💻</span>
                <span style="font-size: 0.88rem; font-weight: 700; color: #f1f5f9;">sketch.ino (Arduino C++)</span>
              </div>

              <!-- IDE Action Buttons -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <!-- Verify / Compile -->
                <button id="btn-ide-verify" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; border-color: rgba(56, 189, 248, 0.3); color: #38bdf8;" title="Verify / Compile Syntax">
                  <span>✓</span>
                  <span>Verify</span>
                </button>

                <!-- Upload to I/O Board -->
                <button id="btn-ide-upload" class="btn btn-primary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; background: #0284c7;" title="Upload sketch to Virtual Arduino Uno">
                  <span>➡️</span>
                  <span>Upload</span>
                </button>

                <!-- Pause / Play -->
                <button id="btn-sim-playpause" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.78rem; font-weight: 700; border-radius: 6px;" title="Pause or Resume Clock">
                  <span id="playpause-icon">⏸️</span>
                </button>

                <!-- Reload Code Preset -->
                <button id="btn-code-reload" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.78rem; font-weight: 600; border-radius: 6px;" title="Reload Default Experiment Sketch">
                  <span>↺</span>
                </button>
              </div>
            </div>

            <!-- Monospaced Code Textarea -->
            <div style="position: relative;">
              <textarea id="arduino-code-editor" spellcheck="false" style="width: 100%; height: 350px; background: #070a13; color: #a5f3fc; font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.82rem; line-height: 1.45; padding: 12px; border: 1.5px solid rgba(6, 182, 212, 0.3); border-radius: 8px; resize: vertical; outline: none; box-shadow: inset 0 2px 10px rgba(0,0,0,0.6);" aria-label="Arduino C++ Code Editor">${ARDUINO_EXPERIMENTS[0].code}</textarea>
            </div>

            <!-- Compiler Status Log Box -->
            <div id="compiler-log" style="font-family: monospace; font-size: 0.74rem; background: #030712; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); color: #34d399; display: flex; justify-content: space-between; align-items: center;">
              <span>Compiler: Ready • Program storage: 1,428 bytes (4%) • Dynamic RAM: 214 bytes (10%)</span>
              <span style="color: #64748b;">AVR-GCC 7.3.0</span>
            </div>
          </div>

          <!-- Bottom Telemetry Card: Live Microcontroller Telemetry -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div style="padding: 6px; background: rgba(0,0,0,0.25); border-radius: 8px;">
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Current Draw</div>
              <div id="mcu-current-draw" style="font-family: monospace; font-weight: 700; color: #38bdf8; font-size: 0.95rem;">42.5 mA</div>
            </div>
            <div style="padding: 6px; background: rgba(0,0,0,0.25); border-radius: 8px;">
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Power Dissipation</div>
              <div id="mcu-power-draw" style="font-family: monospace; font-weight: 700; color: #10b981; font-size: 0.95rem;">212.5 mW</div>
            </div>
            <div style="padding: 6px; background: rgba(0,0,0,0.25); border-radius: 8px;">
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Simulation Speed</div>
              <div style="display: flex; justify-content: center; gap: 4px; margin-top: 2px;">
                <button class="btn btn-secondary btn-speed-sel active" data-speed="1.0" style="padding: 2px 6px; font-size: 0.68rem; border-radius: 4px;">1x</button>
                <button class="btn btn-secondary btn-speed-sel" data-speed="0.5" style="padding: 2px 6px; font-size: 0.68rem; border-radius: 4px;">0.5x</button>
                <button class="btn btn-secondary btn-speed-sel" data-speed="2.0" style="padding: 2px 6px; font-size: 0.68rem; border-radius: 4px;">2x</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM FULL-WIDTH PANEL: Serial Monitor Console & Dual-Channel Oscilloscope Plotter -->
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        
        <!-- Tab Switcher Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; background: #070d1a;">
          <div style="display: flex; gap: 8px;">
            <button id="tab-serial-mon" class="btn btn-secondary active" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 6px;">
              📟 Serial Monitor
            </button>
            <button id="tab-serial-plot" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 6px;">
              📈 Serial Waveform Plotter
            </button>
          </div>

          <!-- Serial Controls -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #94a3b8; cursor: pointer;">
              <input type="checkbox" id="chk-serial-autoscroll" checked style="accent-color: #06b6d4;">
              <span>Autoscroll</span>
            </label>
            <button id="btn-clear-serial" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.74rem; border-radius: 6px;">
              Clear Output
            </button>
            <select id="sel-baud-rate" style="background: #0f172a; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">
              <option value="9600" selected>9600 baud</option>
              <option value="19200">19200 baud</option>
              <option value="57600">57600 baud</option>
              <option value="115200">115200 baud</option>
            </select>
          </div>
        </div>

        <!-- 1. Serial Monitor Terminal View -->
        <div id="view-serial-monitor" style="padding: 12px;">
          <div id="serial-terminal-logs" style="height: 140px; overflow-y: auto; background: #03060f; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; line-height: 1.5; color: #38bdf8;" role="log" aria-live="polite">
            ${state.serialLogs.map(l => `<div>${l}</div>`).join("")}
          </div>
          <!-- Serial Send Command Input -->
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <input type="text" id="input-serial-cmd" placeholder="Send serial command to Arduino (e.g. 'PING', 'RESET', 'TEST')..." style="flex: 1; background: #0a0f1d; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px 12px; color: #f1f5f9; font-family: monospace; font-size: 0.8rem; outline: none;">
            <button id="btn-send-serial" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.8rem; font-weight: 700; border-radius: 6px;">
              Send
            </button>
          </div>
        </div>

        <!-- 2. Dual-Channel Waveform Plotter & Digital Storage Oscilloscope (DSO) View (Initially Hidden) -->
        <div id="view-serial-plotter" style="display: none; padding: 12px; flex-direction: column; gap: 10px;">
          <!-- DSO Oscilloscope Controls Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: rgba(11, 19, 38, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 8px 12px;">
            <!-- Channel Probes -->
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 6px #38bdf8;"></span>
                <span style="font-size: 0.76rem; font-weight: 700; color: #38bdf8;">CH1:</span>
                <select id="sel-dso-ch1" style="background: #03060f; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 5px; padding: 3px 8px; font-size: 0.74rem;">
                  <option value="pin13" selected>D13 (Status LED / Clock)</option>
                  <option value="pwm9">D9 (~PWM Pin 9)</option>
                  <option value="motor">D5 (~PWM Motor Fan)</option>
                  <option value="buzzer">D8 (Piezo Tone Audio)</option>
                  <option value="relay">D4 (Relay Armature)</option>
                  <option value="pin11">D11 (~PWM MOSI)</option>
                  <option value="dht11">DHT11 (Single-Bus Digital)</option>
                  <option value="bme280">BME280 (I2C Clock SCL)</option>
                  <option value="stepper">Stepper (Phase A Coil)</option>
                </select>
              </div>

              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #facc15; box-shadow: 0 0 6px #facc15;"></span>
                <span style="font-size: 0.76rem; font-weight: 700; color: #facc15;">CH2:</span>
                <select id="sel-dso-ch2" style="background: #03060f; color: #facc15; border: 1px solid rgba(250, 204, 21, 0.4); border-radius: 5px; padding: 3px 8px; font-size: 0.74rem;">
                  <option value="pot" selected>A0 (Analog Potentiometer)</option>
                  <option value="ldr">A1 (LDR Optical Lux)</option>
                  <option value="temp">A2 (TMP36 Thermal Voltage)</option>
                  <option value="dist">Echo (Sonar Distance cm)</option>
                  <option value="dht11">DHT11 (Single-Bus Digital)</option>
                  <option value="bme280">BME280 (I2C Clock SCL)</option>
                  <option value="stepper">Stepper (Phase A Coil)</option>
                </select>
              </div>
            </div>

            <!-- Timebase, Volts, Trigger & Freeze -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 4px; font-size: 0.74rem; color: #94a3b8;">
                <span>Time/Div:</span>
                <select id="sel-dso-timebase" style="background: #03060f; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 5px; padding: 3px 6px; font-size: 0.72rem;">
                  <option value="10">10 ms/div</option>
                  <option value="25">25 ms/div</option>
                  <option value="50" selected>50 ms/div</option>
                  <option value="100">100 ms/div</option>
                  <option value="250">250 ms/div</option>
                </select>
              </div>

              <div style="display: flex; align-items: center; gap: 4px; font-size: 0.74rem; color: #94a3b8;">
                <span>V/Div:</span>
                <select id="sel-dso-volts" style="background: #03060f; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 5px; padding: 3px 6px; font-size: 0.72rem;">
                  <option value="1" selected>1.0 V/div</option>
                  <option value="2">2.0 V/div</option>
                  <option value="5">5.0 V/div</option>
                </select>
              </div>

              <div style="display: flex; align-items: center; gap: 4px; font-size: 0.74rem; color: #94a3b8;">
                <span>Trig:</span>
                <select id="sel-dso-trigger" style="background: #03060f; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 5px; padding: 3px 6px; font-size: 0.72rem;">
                  <option value="auto" selected>AUTO</option>
                  <option value="norm">NORM</option>
                  <option value="rising">RISING ⎍</option>
                  <option value="falling">FALLING ⎎</option>
                </select>
              </div>

              <button id="btn-dso-freeze" class="btn btn-secondary" style="padding: 3px 10px; font-size: 0.74rem; font-weight: 700; border-radius: 6px; border-color: rgba(245, 158, 11, 0.4); color: #facc15;" title="Freeze or Resume Scope Capture">
                ⏸ Freeze Frame
              </button>
            </div>
          </div>

          <!-- Oscilloscope Reticle Screen -->
          <div style="position: relative; height: 200px; background: #02040a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 25px rgba(0,0,0,0.85);">
            <canvas id="plotter-canvas" width="900" height="200" style="width: 100%; height: 100%; display: block;"></canvas>
            
            <!-- Scope HUD Overlay -->
            <div style="position: absolute; bottom: 6px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: monospace; font-size: 0.74rem;">
              <span id="dso-metrics-ch1" style="color: #38bdf8; background: rgba(3, 7, 18, 0.85); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25);">
                CH1: Vpp = 5.00V | Vrms = 3.54V | Freq = 500 Hz | Duty = 50%
              </span>
              <span id="dso-metrics-ch2" style="color: #facc15; background: rgba(3, 7, 18, 0.85); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(250, 204, 21, 0.25);">
                CH2: Vpp = 2.50V | Vrms = 1.77V | Mean = 2.50V
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4K Ultra-HD Project Blueprint & Photo Studio Modal -->
      <div id="modal-arduino-4k" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(14px); overflow-y: auto; padding: 20px;" role="dialog" aria-modal="true" aria-labelledby="modal-4k-title">
        <div style="max-width: 1100px; margin: 20px auto; background: #070c18; border: 1.5px solid rgba(6, 182, 212, 0.4); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85); overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- Modal Header -->
          <div style="padding: 16px 20px; background: linear-gradient(90deg, #0b1329, #0f172a); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.4rem;">🖼️</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 id="modal-4k-title" style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #f8fafc;">
                    ${ARDUINO_EXPERIMENTS[0].title}
                  </h3>
                  <span id="modal-4k-tier-badge" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.72rem; padding: 2px 8px; border-radius: 6px;">
                    ${ARDUINO_EXPERIMENTS[0].difficultyLabel}
                  </span>
                </div>
                <div style="font-size: 0.76rem; color: #94a3b8; margin-top: 2px;">
                  Ultra-HD 4K Hardware Visual Bench & Technical Blueprint Studio
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-family: monospace; font-size: 0.75rem; padding: 4px 10px; border-radius: 6px;">
                4K UHD · 3840 × 2160
              </span>
              <button id="btn-close-4k-modal" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 8px;" aria-label="Close modal">
                ✖ Close
              </button>
            </div>
          </div>

          <!-- View Mode Toggles Bar -->
          <div style="padding: 10px 20px; background: rgba(15, 23, 42, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 8px;">
              <button id="btn-tab-4k-photo" class="btn btn-secondary active" style="padding: 5px 14px; font-size: 0.76rem; font-weight: 700; border-radius: 6px;">
                📷 Photorealistic Workbench (4K)
              </button>
              <button id="btn-tab-4k-blueprint" class="btn btn-secondary" style="padding: 5px 14px; font-size: 0.76rem; font-weight: 700; border-radius: 6px;">
                📐 CAD Schematic Blueprint
              </button>
            </div>
            
            <!-- Download 4K Action -->
            <button id="btn-download-4k-png" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.78rem; font-weight: 800; border-radius: 8px; background: linear-gradient(135deg, #0891b2, #6366f1); display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
              📥 Download 4K UHD Picture (3840x2160 PNG)
            </button>
          </div>

          <!-- Modal Body with Split View -->
          <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
            <!-- Main 4K Image / Blueprint Canvas Viewport -->
            <div style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; border: 1.5px solid rgba(56, 189, 248, 0.3); background: #030712; min-height: 380px; box-shadow: inset 0 0 40px rgba(0,0,0,0.85);">
              
              <!-- 1. Photorealistic Workbench Image View -->
              <div id="view-4k-photo" style="display: block; width: 100%; height: 100%;">
                <img id="img-4k-bench" src="${ARDUINO_EXPERIMENTS[0].image}" alt="Arduino 4K Workbench Photo" style="width: 100%; max-height: 480px; object-fit: cover; display: block;">
                <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div style="font-size: 0.76rem; color: #e2e8f0;">
                    <span style="color: #38bdf8; font-weight: 700;">Photorealistic Hardware Digital Twin:</span> Genuine workbench setup with breadboard apparatus, precision jumper leads, and ATmega328P microcontroller.
                  </div>
                  <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
                    True 3840×2160 Output
                  </span>
                </div>
              </div>

              <!-- 2. Interactive CAD Blueprint View -->
              <div id="view-4k-blueprint" style="display: none; width: 100%; padding: 20px; background: #07152d; background-image: radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px); background-size: 20px 20px;">
                <div id="blueprint-content-box" style="font-family: monospace; color: #bae6fd; line-height: 1.5; font-size: 0.82rem;">
                  <!-- Dynamic Blueprint rendered here -->
                </div>
              </div>
            </div>

            <!-- Technical Specifications & Bill of Materials Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
              <!-- Left: Circuit Specs & Wiring Table -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span>⚡</span> Circuit Specifications & Connections
                </div>
                <div id="modal-4k-specs" style="font-size: 0.76rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
                  <!-- Dynamic Specs -->
                </div>
              </div>

              <!-- Right: Bill of Materials (BOM) Table -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.82rem; font-weight: 700; color: #34d399; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span>📋</span> Bill of Materials (BOM)
                </div>
                <div id="modal-4k-bom" style="font-size: 0.75rem; color: #cbd5e1; max-height: 180px; overflow-y: auto;">
                  <!-- Dynamic BOM Table -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Schematic, SPICE & CAD Netlist Exporter Modal -->
      <div id="modal-arduino-netlist" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(14px); overflow-y: auto; padding: 20px;" role="dialog" aria-modal="true" aria-labelledby="modal-netlist-title">
        <div style="max-width: 960px; margin: 24px auto; background: #070c18; border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85); overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- Modal Header -->
          <div style="padding: 16px 20px; background: linear-gradient(90deg, #0b1329, #0f172a); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.4rem;">⚡</span>
              <div>
                <h3 id="modal-netlist-title" style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #f8fafc;">
                  Circuit Schematic &amp; CAD Netlist Exporter
                </h3>
                <div style="font-size: 0.76rem; color: #94a3b8; margin-top: 2px;">
                  SPICE 3f5 Deck (.cir) · Programmatic JSON Netlist · Engineering Bill of Materials (BOM)
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="btn-copy-netlist" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 8px; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
                📋 Copy
              </button>
              <button id="btn-download-netlist" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.78rem; font-weight: 700; border-radius: 8px; background: #0284c7;">
                💾 Download
              </button>
              <button id="btn-close-netlist-modal" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 8px;" aria-label="Close modal">
                ✖ Close
              </button>
            </div>
          </div>

          <!-- Format Switcher Tabs -->
          <div style="padding: 10px 20px; background: rgba(15, 23, 42, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; gap: 8px;">
            <button id="btn-netlist-tab-spice" class="btn btn-secondary active" style="padding: 5px 14px; font-size: 0.76rem; font-weight: 700; border-radius: 6px;">
              🔌 SPICE Deck (.cir)
            </button>
            <button id="btn-netlist-tab-json" class="btn btn-secondary" style="padding: 5px 14px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent;">
              📄 JSON Netlist
            </button>
            <button id="btn-netlist-tab-bom" class="btn btn-secondary" style="padding: 5px 14px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent;">
              📊 BOM Table (CSV)
            </button>
          </div>

          <!-- Content Box -->
          <div style="padding: 20px; max-height: 480px; overflow-y: auto;">
            <pre id="netlist-content-box" style="margin: 0; background: #030712; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; color: #a5f3fc; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.78rem; line-height: 1.6; white-space: pre-wrap; user-select: text;"></pre>
          </div>
        </div>
      </div>

      <!-- Interactive Competency Checkpoint Questions Container -->
      <div id="arduino-checkpoint-mount" style="margin-top: 18px;"></div>
    </div>
  `;

  // -------------------------------------------------------------------------
  // Mount Educational Checkpoint for Competency Assessment
  // -------------------------------------------------------------------------
  mountLabCheckpoint("arduino-checkpoint-mount", {
    labId: "arduino",
    title: "Arduino & Embedded Circuits Assessment",
    questions: [
      {
        question: "An Arduino Uno utilizes a 10-bit Analog-to-Digital Converter (ADC) referenced to 5.0 V. What is the approximate voltage step represented by 1 unit of ADC reading?",
        options: [
          "0.98 mV per unit",
          "4.89 mV per unit (5.0V / 1023)",
          "19.5 mV per unit",
          "48.8 mV per unit"
        ],
        correctIndex: 1,
        correct: 1,
        explanation: "A 10-bit ADC provides 2¹⁰ = 1024 distinct quantization steps (0 to 1023). Therefore, resolution = 5.0 V / 1023 ≈ 4.887 mV per unit."
      },
      {
        question: "When triggering the HC-SR04 ultrasonic sensor, the echo pulse duration is measured as 1,750 µs. Given the speed of sound is 343 m/s (0.0343 cm/µs), what is the calculated distance to the target?",
        options: [
          "60.0 cm",
          "30.0 cm (Round-trip time divided by 2)",
          "15.0 cm",
          "120.0 cm"
        ],
        correctIndex: 1,
        correct: 1,
        explanation: "Distance = (Speed × Time) / 2 = (0.0343 cm/µs × 1750 µs) / 2 = 59.99 cm / 2 ≈ 30.0 cm."
      },
      {
        question: "To connect a standard Red LED (forward voltage 2.0 V, target current 20 mA = 0.020 A) safely to an Arduino 5.0 V digital output pin, what is the ideal minimum current-limiting resistor required?",
        options: [
          "22 Ω",
          "150 Ω (or standard 220 Ω)",
          "1,000 Ω (1 kΩ)",
          "10,000 Ω (10 kΩ)"
        ],
        correctIndex: 1,
        correct: 1,
        explanation: "Using Ohm's Law: R = (V_supply - V_forward) / I = (5.0V - 2.0V) / 0.020A = 3.0V / 0.020A = 150 Ω. Standard 220 Ω resistors are widely used to maintain safe 14 mA current."
      }
    ]
  });

  // -------------------------------------------------------------------------
  // DOM Element References
  // -------------------------------------------------------------------------
  const canvas = document.getElementById("arduino-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const plotterCanvas = document.getElementById("plotter-canvas");
  const plotterCtx = plotterCanvas ? plotterCanvas.getContext("2d") : null;

  const btnMute = document.getElementById("btn-arduino-mute");
  const muteIcon = document.getElementById("mute-icon");
  const muteLabel = document.getElementById("mute-label");

  const btnExport = document.getElementById("btn-arduino-export");
  const btnReport = document.getElementById("btn-arduino-report");
  const btnReset = document.getElementById("btn-arduino-reset");

  const selExp = document.getElementById("sel-arduino-exp");
  const expCategoryBadge = document.getElementById("exp-category-badge");
  const expDescBox = document.getElementById("exp-desc-box");

  const codeEditor = document.getElementById("arduino-code-editor");
  const btnVerify = document.getElementById("btn-ide-verify");
  const btnUpload = document.getElementById("btn-ide-upload");
  const btnPlayPause = document.getElementById("btn-sim-playpause");
  const playPauseIcon = document.getElementById("playpause-icon");
  const btnCodeReload = document.getElementById("btn-code-reload");
  const compilerLog = document.getElementById("compiler-log");

  const btnPushBreadboard = document.getElementById("btn-breadboard-push");
  const sliderPot = document.getElementById("slider-pot");
  const sliderDist = document.getElementById("slider-dist");
  const sliderLdr = document.getElementById("slider-ldr");
  const sliderTemp = document.getElementById("slider-temp");

  const valPot = document.getElementById("val-pot");
  const valDist = document.getElementById("val-dist");
  const valLdr = document.getElementById("val-ldr");
  const valTemp = document.getElementById("val-temp");

  // Extended Hardware Adjusters & Toolbox References
  const customChipsContainer = document.getElementById("custom-placed-chips");
  const selAddComponent = document.getElementById("sel-add-component");
  const btnAddComponent = document.getElementById("btn-add-component-part");
  const btnCustomGen = document.getElementById("btn-custom-gencpu");
  const btnCustomSave = document.getElementById("btn-custom-save");
  const btnCustomLoad = document.getElementById("btn-custom-load");
  const btnCustomClear = document.getElementById("btn-custom-clear");

  const sliderMotor = document.getElementById("slider-motor");
  const valMotor = document.getElementById("val-motor");
  const pickerRgb = document.getElementById("picker-rgb");
  const valRgbHex = document.getElementById("val-rgb-hex");
  const btnRelayToggle = document.getElementById("btn-relay-toggle");
  const btnPirTrigger = document.getElementById("btn-pir-trigger");
  const btnSlideSwitch = document.getElementById("btn-slide-switch");
  const btnSevensegStep = document.getElementById("btn-sevenseg-step");

  const tabSerialMon = document.getElementById("tab-serial-mon");
  const tabSerialPlot = document.getElementById("tab-serial-plot");
  const viewSerialMon = document.getElementById("view-serial-monitor");
  const viewSerialPlot = document.getElementById("view-serial-plotter");

  const serialTerminal = document.getElementById("serial-terminal-logs");
  const chkAutoscroll = document.getElementById("chk-serial-autoscroll");
  const btnClearSerial = document.getElementById("btn-clear-serial");
  const selBaudRate = document.getElementById("sel-baud-rate");
  const inputSerialCmd = document.getElementById("input-serial-cmd");
  const btnSendSerial = document.getElementById("btn-send-serial");

  const hudSimTime = document.getElementById("hud-sim-time");
  const mcuCurrentDraw = document.getElementById("mcu-current-draw");
  const mcuPowerDraw = document.getElementById("mcu-power-draw");

  // 4K Studio Modal & Tier Filter Elements
  const btnOpen4kModal = document.getElementById("btn-open-4k-modal");
  const modal4k = document.getElementById("modal-arduino-4k");
  const btnClose4kModal = document.getElementById("btn-close-4k-modal");
  const btnTab4kPhoto = document.getElementById("btn-tab-4k-photo");
  const btnTab4kBlueprint = document.getElementById("btn-tab-4k-blueprint");
  const btnDownload4kPng = document.getElementById("btn-download-4k-png");
  const view4kPhoto = document.getElementById("view-4k-photo");
  const view4kBlueprint = document.getElementById("view-4k-blueprint");
  const img4kBench = document.getElementById("img-4k-bench");
  const modal4kTitle = document.getElementById("modal-4k-title");
  const modal4kTierBadge = document.getElementById("modal-4k-tier-badge");
  const modal4kSpecs = document.getElementById("modal-4k-specs");
  const modal4kBom = document.getElementById("modal-4k-bom");
  const blueprintContentBox = document.getElementById("blueprint-content-box");
  const expDifficultyBadge = document.getElementById("exp-difficulty-badge");

  // Circuit Schematic & CAD Netlist Modal Elements
  const btnArduinoNetlist = document.getElementById("btn-arduino-netlist");
  const modalNetlist = document.getElementById("modal-arduino-netlist");
  const btnCloseNetlistModal = document.getElementById("btn-close-netlist-modal");
  const btnCopyNetlist = document.getElementById("btn-copy-netlist");
  const btnDownloadNetlist = document.getElementById("btn-download-netlist");
  const btnNetlistTabSpice = document.getElementById("btn-netlist-tab-spice");
  const btnNetlistTabJson = document.getElementById("btn-netlist-tab-json");
  const btnNetlistTabBom = document.getElementById("btn-netlist-tab-bom");
  const netlistContentBox = document.getElementById("netlist-content-box");
  let currentNetlistTab = "spice";
  let cachedNetlistData = null;

  // Wire Routing Toolbar Elements
  const btnToggleWireMode = document.getElementById("btn-toggle-wire-mode");
  const wireModeIcon = document.getElementById("wire-mode-icon");
  const wireModeText = document.getElementById("wire-mode-text");
  const badgeWireCount = document.getElementById("badge-wire-count");
  const btnClearWires = document.getElementById("btn-clear-wires");
  const btnResetWires = document.getElementById("btn-reset-wires");
  const wireColorBtns = document.querySelectorAll(".btn-wire-color");

  function updateWireCountBadge() {
    if (badgeWireCount) {
      badgeWireCount.textContent = `⚡ ${state.wires.length} Wires Connected`;
    }
  }

  btnToggleWireMode?.addEventListener("click", () => {
    state.isWireMode = !state.isWireMode;
    if (wireModeIcon) wireModeIcon.textContent = state.isWireMode ? "✂️" : "🔌";
    if (wireModeText) wireModeText.textContent = state.isWireMode ? "Wire Mode: ON (Click to Route)" : "Wire Routing Mode: OFF";
    if (btnToggleWireMode) {
      btnToggleWireMode.style.borderColor = state.isWireMode ? "#22d3ee" : "rgba(6, 182, 212, 0.4)";
      btnToggleWireMode.style.background = state.isWireMode ? "rgba(6, 182, 212, 0.2)" : "";
      btnToggleWireMode.style.color = state.isWireMode ? "#22d3ee" : "#38bdf8";
    }
    if (canvas) canvas.style.cursor = state.isWireMode ? "crosshair" : "default";
    audio.playTactileClick(state.isWireMode);
    addSerialLog(state.isWireMode ? "Wire Routing Mode active: Click header pin or tie point to route" : "Wire Routing Mode deactivated");
  });

  wireColorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      wireColorBtns.forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "transparent";
      });
      btn.classList.add("active");
      btn.style.borderColor = "#ffffff";
      state.activeWireColor = btn.dataset.color || "#ef4444";
      audio.playTactileClick(false);
    });
  });

  btnClearWires?.addEventListener("click", () => {
    state.wires = [];
    updateWireCountBadge();
    audio.playTactileClick(false);
    addSerialLog("All breadboard jumper wires removed");
  });

  btnResetWires?.addEventListener("click", () => {
    const curExp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    state.wires = getDefaultWiresForExperiment(curExp?.id || "traffic_light");
    updateWireCountBadge();
    audio.playTactileClick(true);
    addSerialLog(`Restored schematic jumper wires for ${curExp?.title}`);
  });

  // Dual-Channel DSO Controls Elements
  const selDsoCh1 = document.getElementById("sel-dso-ch1");
  const selDsoCh2 = document.getElementById("sel-dso-ch2");
  const selDsoTimebase = document.getElementById("sel-dso-timebase");
  const selDsoVolts = document.getElementById("sel-dso-volts");
  const selDsoTrigger = document.getElementById("sel-dso-trigger");
  const btnDsoFreeze = document.getElementById("btn-dso-freeze");

  selDsoCh1?.addEventListener("change", (e) => {
    state.dso.ch1Probe = e.target.value;
    audio.playTactileClick(false);
    addSerialLog(`DSO CH1 probe assigned ➔ ${e.target.value}`);
  });

  selDsoCh2?.addEventListener("change", (e) => {
    state.dso.ch2Probe = e.target.value;
    audio.playTactileClick(false);
    addSerialLog(`DSO CH2 probe assigned ➔ ${e.target.value}`);
  });

  selDsoTimebase?.addEventListener("change", (e) => {
    state.dso.timebaseMs = parseInt(e.target.value, 10) || 50;
    audio.playTactileClick(false);
  });

  selDsoVolts?.addEventListener("change", (e) => {
    const v = parseFloat(e.target.value) || 1.0;
    state.dso.voltsPerDiv1 = v;
    state.dso.voltsPerDiv2 = v;
    audio.playTactileClick(false);
  });

  selDsoTrigger?.addEventListener("change", (e) => {
    state.dso.triggerMode = e.target.value;
    audio.playTactileClick(false);
  });

  btnDsoFreeze?.addEventListener("click", () => {
    state.dso.isFrozen = !state.dso.isFrozen;
    btnDsoFreeze.textContent = state.dso.isFrozen ? "▶ Resume Capture" : "⏸ Freeze Frame";
    btnDsoFreeze.style.color = state.dso.isFrozen ? "#34d399" : "#facc15";
    audio.playTactileClick(state.dso.isFrozen);
    addSerialLog(state.dso.isFrozen ? "DSO Waveform capture frozen" : "DSO Real-time capture resumed");
  });

  // Speed selection pills
  document.querySelectorAll(".btn-speed-sel").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-speed-sel").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.simSpeed = parseFloat(btn.dataset.speed) || 1.0;
      audio.playTactileClick(false);
    });
  });

  // -------------------------------------------------------------------------
  // Serial Logging Helper
  // -------------------------------------------------------------------------
  let serialChirpThrottle = 0;
  function addSerialLog(message) {
    const elapsedSec = (state.simTimeMs / 1000).toFixed(3);
    const logLine = `[${elapsedSec}s] ${message}`;
    state.serialLogs.push(logLine);
    if (state.serialLogs.length > 80) state.serialLogs.shift();

    // Pulse TX/RX LEDs
    state.components.txLed = true;
    setTimeout(() => { state.components.txLed = false; }, 40);

    // Audio chirp (throttled)
    const now = performance.now();
    if (now - serialChirpThrottle > 180) {
      serialChirpThrottle = now;
      audio.playSerialChirp();
    }

    if (serialTerminal) {
      const lineDiv = document.createElement("div");
      lineDiv.textContent = logLine;
      serialTerminal.appendChild(lineDiv);
      if (state.serialAutoScroll) {
        serialTerminal.scrollTop = serialTerminal.scrollHeight;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4K Studio Modal Helper & Populator
  // -------------------------------------------------------------------------
  function populate4kModalData(exp) {
    if (!exp) return;
    if (modal4kTitle) modal4kTitle.textContent = exp.title;
    if (modal4kTierBadge) {
      modal4kTierBadge.textContent = exp.difficultyLabel || "🟢 Easy";
      if (exp.difficulty === "easy") {
        modal4kTierBadge.style.color = "#34d399";
        modal4kTierBadge.style.background = "rgba(16, 185, 129, 0.15)";
      } else if (exp.difficulty === "intermediate") {
        modal4kTierBadge.style.color = "#fbbf24";
        modal4kTierBadge.style.background = "rgba(245, 158, 11, 0.15)";
      } else if (exp.difficulty === "advanced") {
        modal4kTierBadge.style.color = "#f87171";
        modal4kTierBadge.style.background = "rgba(239, 68, 68, 0.15)";
      } else {
        modal4kTierBadge.style.color = "#c084fc";
        modal4kTierBadge.style.background = "rgba(192, 132, 252, 0.15)";
      }
    }
    if (img4kBench && exp.image) {
      img4kBench.src = exp.image;
    }

    const bp = exp.blueprint4k || {};

    // Populate Specs
    if (modal4kSpecs) {
      modal4kSpecs.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
          <span style="color: #94a3b8;">Blueprint Code:</span>
          <span style="font-family: monospace; font-weight: 700; color: #38bdf8;">${bp.schematicClass || "UHD-CAD-4K"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
          <span style="color: #94a3b8;">UHD Resolution:</span>
          <span style="font-family: monospace; font-weight: 700; color: #34d399;">${bp.resolution || "3840 x 2160 UHD"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
          <span style="color: #94a3b8;">Operating Voltage:</span>
          <span style="font-family: monospace; font-weight: 700; color: #fde047;">${bp.circuitVoltage || "5.0V DC (USB)"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
          <span style="color: #94a3b8;">Active Pinout:</span>
          <span style="font-family: monospace; font-size: 0.72rem; color: #cbd5e1;">${(bp.activePins || []).join(", ")}</span>
        </div>
        <div style="margin-top: 4px;">
          <div style="color: #94a3b8; margin-bottom: 2px;">Governing Theory & Equation:</div>
          <div style="font-family: monospace; font-size: 0.72rem; background: rgba(0,0,0,0.4); padding: 5px 8px; border-radius: 6px; color: #7dd3fc; border: 1px solid rgba(56,189,248,0.2);">
            ${bp.theoryEquation || "V = I × R"}
          </div>
        </div>
      `;
    }

    // Populate BOM
    if (modal4kBom) {
      const bom = bp.bomList || [];
      if (bom.length === 0) {
        modal4kBom.innerHTML = `<div style="color: #94a3b8;">Standard Arduino Uno component assembly.</div>`;
      } else {
        modal4kBom.innerHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; text-align: left;">
                <th style="padding: 4px 6px;">Item</th>
                <th style="padding: 4px 6px;">Part Specification</th>
                <th style="padding: 4px 6px; text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${bom.map(b => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <td style="padding: 4px 6px; font-weight: 600; color: #f1f5f9;">${b.item}</td>
                  <td style="padding: 4px 6px; color: #94a3b8; font-family: monospace;">${b.part}</td>
                  <td style="padding: 4px 6px; text-align: center; color: #38bdf8; font-weight: 700;">${b.qty}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }
    }

    // Populate CAD Blueprint text / vector details
    if (blueprintContentBox) {
      blueprintContentBox.innerHTML = `
        <div style="border: 1px dashed rgba(56, 189, 248, 0.4); padding: 16px; border-radius: 8px; background: rgba(3, 7, 18, 0.6);">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 8px; margin-bottom: 12px;">
            <span style="font-weight: 800; color: #38bdf8;">CAD SCHEMATIC NETLIST · ${bp.title || exp.title.toUpperCase()}</span>
            <span style="color: #34d399;">SCALE: 1:1 · ULTRA-HD 4K</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <div style="color: #67e8f9; font-weight: 700; margin-bottom: 4px;">WIRE CONNECTIONS (NETS):</div>
              <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 0.74rem;">
                ${exp.circuitWiring.map(w => `<li><span style="color: ${w.color}; font-weight: 700;">■</span> ${w.from} &rarr; ${w.to}</li>`).join("")}
              </ul>
            </div>
            <div>
              <div style="color: #67e8f9; font-weight: 700; margin-bottom: 4px;">SYSTEM ARCHITECTURE:</div>
              <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.6;">
                <div>• CPU: ATmega328P 8-Bit RISC @ 16 MHz</div>
                <div>• Flash Memory: 32 KB (0.5 KB Bootloader)</div>
                <div>• Operating Voltage: 5.0 V DC (USB/External)</div>
                <div>• Logic Resolution: 1024 ADC Steps (4.89 mV)</div>
                <div>• Clock Source: External 16.000 MHz Resonator</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // -------------------------------------------------------------------------
  // 4K Ultra-HD Offscreen Blueprint Image Generation (3840x2160 PNG)
  // -------------------------------------------------------------------------
  function export4kUhdPicture(exp) {
    if (!exp) return;
    const canvas4k = document.createElement("canvas");
    canvas4k.width = 3840;
    canvas4k.height = 2160;
    const c = canvas4k.getContext("2d");
    if (!c) return;

    // 1. Antistatic Workbench Mat Background Gradient
    const bgGrad = c.createLinearGradient(0, 0, 3840, 2160);
    bgGrad.addColorStop(0, "#050914");
    bgGrad.addColorStop(0.5, "#080f21");
    bgGrad.addColorStop(1, "#03060c");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, 3840, 2160);

    // Grid lines every 60px
    c.strokeStyle = "rgba(56, 189, 248, 0.04)";
    c.lineWidth = 1.5;
    for (let x = 0; x < 3840; x += 60) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 2160);
      c.stroke();
    }
    for (let y = 0; y < 2160; y += 60) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(3840, y);
      c.stroke();
    }

    // 2. Blueprint Header Banner
    c.fillStyle = "#0c172e";
    c.fillRect(60, 50, 3720, 180);
    c.strokeStyle = "rgba(56, 189, 248, 0.4)";
    c.lineWidth = 3;
    c.strokeRect(60, 50, 3720, 180);

    // Title & Metadata
    c.fillStyle = "#38bdf8";
    c.font = "bold 44px 'Segoe UI', system-ui, -apple-system, sans-serif";
    c.fillText("EDUGATES STEM ADVANCED EMBEDDED SYSTEMS WORKBENCH", 100, 115);

    c.fillStyle = "#f8fafc";
    c.font = "bold 34px 'Segoe UI', system-ui, -apple-system, sans-serif";
    c.fillText(`PROJECT BLUEPRINT: ${exp.title.toUpperCase()} [${exp.difficultyLabel.toUpperCase()}]`, 100, 175);

    // Right header badges
    c.fillStyle = "#34d399";
    c.font = "bold 32px 'JetBrains Mono', monospace";
    c.fillText("4K ULTRA-HD (3840 × 2160)", 3000, 115);

    c.fillStyle = "#94a3b8";
    c.font = "24px 'JetBrains Mono', monospace";
    c.fillText("ATmega328P · 16MHz · 5.0V DC", 3000, 165);

    // 3. Render Large Arduino Uno R3 on Left (Scale: ~3.8x)
    c.save();
    c.translate(140, 320);
    c.scale(3.8, 3.8);
    drawArduinoBoard(c, 0, 0, 340, 350);
    c.restore();

    // 4. Render Large Breadboard on Right-Center (Scale: ~3.8x)
    c.save();
    c.translate(1520, 320);
    c.scale(3.8, 3.8);
    drawBreadboard(c, 0, 0, 390, 350);
    c.restore();

    // 5. Render Right Engineering Specifications Panel
    const rx = 3080;
    const ry = 300;
    const rw = 700;
    const rh = 1760;

    c.fillStyle = "rgba(10, 18, 38, 0.95)";
    c.fillRect(rx, ry, rw, rh);
    c.strokeStyle = "rgba(56, 189, 248, 0.4)";
    c.lineWidth = 3;
    c.strokeRect(rx, ry, rw, rh);

    // Right Panel Header
    c.fillStyle = "#0284c7";
    c.fillRect(rx, ry, rw, 70);
    c.fillStyle = "#f8fafc";
    c.font = "bold 28px 'Segoe UI', sans-serif";
    c.fillText("CIRCUIT SCHEMATIC & BOM", rx + 30, ry + 46);

    let ty = ry + 120;
    const bp = exp.blueprint4k || {};

    // Key Specs
    c.fillStyle = "#38bdf8";
    c.font = "bold 24px 'Segoe UI', sans-serif";
    c.fillText("1. TECHNICAL SPECIFICATIONS", rx + 30, ty);
    ty += 40;

    const specs = [
      ["Blueprint Code", bp.schematicClass || "UHD-CAD-4K"],
      ["Operating Voltage", bp.circuitVoltage || "5.0V DC (USB Regulated)"],
      ["Microcontroller", "ATmega328P 8-Bit RISC @ 16 MHz"],
      ["ADC Precision", "10-Bit Quantization (4.89 mV/LSB)"],
      ["PWM Channels", "8-Bit Fast PWM (~3, ~5, ~6, ~9, ~10, ~11)"],
      ["Active Pinout", (bp.activePins || []).slice(0, 3).join(", ")]
    ];

    c.font = "20px 'JetBrains Mono', monospace";
    specs.forEach(([k, v]) => {
      c.fillStyle = "#94a3b8";
      c.fillText(k + ":", rx + 30, ty);
      c.fillStyle = "#f1f5f9";
      c.fillText(v, rx + 260, ty);
      ty += 34;
    });

    ty += 20;
    // 2. Governing Equations
    c.fillStyle = "#f59e0b";
    c.font = "bold 24px 'Segoe UI', sans-serif";
    c.fillText("2. GOVERNING STEM FORMULAS", rx + 30, ty);
    ty += 40;

    c.fillStyle = "rgba(15, 23, 42, 0.8)";
    c.fillRect(rx + 30, ty - 26, rw - 60, 70);
    c.strokeStyle = "rgba(245, 158, 11, 0.3)";
    c.strokeRect(rx + 30, ty - 26, rw - 60, 70);

    c.fillStyle = "#fde047";
    c.font = "bold 20px 'JetBrains Mono', monospace";
    c.fillText(bp.theoryEquation || "V = I * R | P = V * I", rx + 45, ty + 16);
    ty += 80;

    // 3. Bill of Materials
    c.fillStyle = "#10b981";
    c.font = "bold 24px 'Segoe UI', sans-serif";
    c.fillText("3. BILL OF MATERIALS (BOM)", rx + 30, ty);
    ty += 40;

    const bom = bp.bomList || [];
    c.fillStyle = "#64748b";
    c.font = "bold 18px 'Segoe UI', sans-serif";
    c.fillText("ITEM", rx + 30, ty);
    c.fillText("PART SPECIFICATION", rx + 240, ty);
    c.fillText("QTY", rx + rw - 70, ty);
    ty += 28;

    c.strokeStyle = "rgba(255,255,255,0.1)";
    c.beginPath();
    c.moveTo(rx + 30, ty - 12);
    c.lineTo(rx + rw - 30, ty - 12);
    c.stroke();

    c.font = "19px 'Segoe UI', sans-serif";
    bom.forEach(b => {
      c.fillStyle = "#f8fafc";
      c.fillText(b.item, rx + 30, ty);
      c.fillStyle = "#94a3b8";
      c.font = "18px 'JetBrains Mono', monospace";
      c.fillText(b.part.length > 28 ? b.part.slice(0, 26) + "..." : b.part, rx + 240, ty);
      c.fillStyle = "#38bdf8";
      c.fillText(String(b.qty), rx + rw - 60, ty);
      c.font = "19px 'Segoe UI', sans-serif";
      ty += 34;
    });

    // 4. Lab Approval Stamp at bottom
    c.fillStyle = "rgba(16, 185, 129, 0.15)";
    c.fillRect(rx + 30, ry + rh - 160, rw - 60, 120);
    c.strokeStyle = "rgba(16, 185, 129, 0.4)";
    c.lineWidth = 2;
    c.strokeRect(rx + 30, ry + rh - 160, rw - 60, 120);

    c.fillStyle = "#34d399";
    c.font = "bold 24px 'Segoe UI', sans-serif";
    c.fillText("EDUGATES VIRTUAL STEM LAB · VERIFIED", rx + 50, ry + rh - 105);
    c.fillStyle = "#94a3b8";
    c.font = "18px 'JetBrains Mono', monospace";
    c.fillText(`STAMP: ${new Date().toISOString().slice(0, 10)} · UHD-4K-CALIBRATED`, rx + 50, ry + rh - 65);

    // Convert Canvas to Blob and Trigger Download
    if (typeof canvas4k.toBlob === "function") {
      canvas4k.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edugates_${exp.id}_4k_uhd_blueprint.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
        addSerialLog(`Exported 4K UHD Project Picture: ${exp.title} (3840×2160 PNG)`);
        audio.playUploadChime();
      }, "image/png");
    } else {
      addSerialLog(`Exported 4K UHD Project Picture: ${exp.title} (3840×2160 PNG)`);
    }
  }

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  // 1. Audio Mute Toggle
  btnMute?.addEventListener("click", () => {
    const muted = audio.toggleMute();
    muteIcon.textContent = muted ? "🔇" : "🔊";
    muteLabel.textContent = muted ? "Unmute Audio" : "Sound Effects ON";
  });

  // 1b. 4K Studio Modal Handlers
  btnOpen4kModal?.addEventListener("click", () => {
    const exp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    if (!exp) return;
    populate4kModalData(exp);
    if (modal4k) modal4k.style.display = "block";
    audio.playTactileClick(false);
  });

  btnClose4kModal?.addEventListener("click", () => {
    if (modal4k) modal4k.style.display = "none";
    audio.playTactileClick(false);
  });

  modal4k?.addEventListener("click", (e) => {
    if (e.target === modal4k) {
      modal4k.style.display = "none";
      audio.playTactileClick(false);
    }
  });

  btnTab4kPhoto?.addEventListener("click", () => {
    btnTab4kPhoto.classList.add("active");
    btnTab4kBlueprint?.classList.remove("active");
    if (view4kPhoto) view4kPhoto.style.display = "block";
    if (view4kBlueprint) view4kBlueprint.style.display = "none";
    audio.playTactileClick(false);
  });

  btnTab4kBlueprint?.addEventListener("click", () => {
    btnTab4kBlueprint.classList.add("active");
    btnTab4kPhoto?.classList.remove("active");
    if (view4kPhoto) view4kPhoto.style.display = "none";
    if (view4kBlueprint) view4kBlueprint.style.display = "block";
    audio.playTactileClick(false);
  });

  btnDownload4kPng?.addEventListener("click", () => {
    const exp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    if (exp) export4kUhdPicture(exp);
  });

  // 1b-2. Circuit Schematic & CAD Netlist Modal Handlers
  function updateNetlistModalView() {
    const exp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    if (!exp) return;
    cachedNetlistData = exportCircuitNetlist(exp, state.wires, state.components.customPlacedComponents || []);

    const tabs = [
      { id: "spice", btn: btnNetlistTabSpice },
      { id: "json", btn: btnNetlistTabJson },
      { id: "bom", btn: btnNetlistTabBom }
    ];

    tabs.forEach(t => {
      if (t.btn) {
        if (currentNetlistTab === t.id) {
          t.btn.classList.add("active");
          t.btn.style.background = "#0284c7";
          t.btn.style.fontWeight = "700";
        } else {
          t.btn.classList.remove("active");
          t.btn.style.background = "transparent";
          t.btn.style.fontWeight = "600";
        }
      }
    });

    if (!netlistContentBox) return;
    if (currentNetlistTab === "spice") {
      netlistContentBox.textContent = cachedNetlistData.spice;
    } else if (currentNetlistTab === "json") {
      netlistContentBox.textContent = JSON.stringify(cachedNetlistData.jsonNetlist, null, 2);
    } else if (currentNetlistTab === "bom") {
      netlistContentBox.textContent = cachedNetlistData.bomCsv;
    }
  }

  btnArduinoNetlist?.addEventListener("click", () => {
    updateNetlistModalView();
    if (modalNetlist) modalNetlist.style.display = "block";
    audio.playTactileClick(false);
  });

  btnCloseNetlistModal?.addEventListener("click", () => {
    if (modalNetlist) modalNetlist.style.display = "none";
    audio.playTactileClick(false);
  });

  modalNetlist?.addEventListener("click", (e) => {
    if (e.target === modalNetlist) {
      modalNetlist.style.display = "none";
      audio.playTactileClick(false);
    }
  });

  btnNetlistTabSpice?.addEventListener("click", () => {
    currentNetlistTab = "spice";
    updateNetlistModalView();
    audio.playTactileClick(false);
  });

  btnNetlistTabJson?.addEventListener("click", () => {
    currentNetlistTab = "json";
    updateNetlistModalView();
    audio.playTactileClick(false);
  });

  btnNetlistTabBom?.addEventListener("click", () => {
    currentNetlistTab = "bom";
    updateNetlistModalView();
    audio.playTactileClick(false);
  });

  btnCopyNetlist?.addEventListener("click", () => {
    if (!netlistContentBox) return;
    const text = netlistContentBox.textContent || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const origText = btnCopyNetlist.textContent;
        btnCopyNetlist.textContent = "✅ Copied!";
        setTimeout(() => { btnCopyNetlist.textContent = origText; }, 1800);
      }).catch(() => {
        addSerialLog("Failed to copy netlist to clipboard");
      });
    }
    audio.playTactileClick(true);
    addSerialLog(`Copied ${currentNetlistTab.toUpperCase()} netlist deck to clipboard`);
  });

  btnDownloadNetlist?.addEventListener("click", () => {
    if (!cachedNetlistData) updateNetlistModalView();
    if (!cachedNetlistData) return;
    const exp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    const baseName = (exp?.id || "arduino_circuit") + "_netlist";
    let filename = "";
    let mimeType = "text/plain";
    let content = "";

    if (currentNetlistTab === "spice") {
      filename = `${baseName}.cir`;
      content = cachedNetlistData.spice;
    } else if (currentNetlistTab === "json") {
      filename = `${baseName}.json`;
      mimeType = "application/json";
      content = JSON.stringify(cachedNetlistData.jsonNetlist, null, 2);
    } else {
      filename = `${baseName}_bom.csv`;
      mimeType = "text/csv";
      content = cachedNetlistData.bomCsv;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    if (document.body) {
      document.body.appendChild(a);
      if (typeof a.click === "function") a.click();
      if (typeof document.body.removeChild === "function") {
        document.body.removeChild(a);
      }
    }
    if (typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    audio.playTactileClick(true);
    addSerialLog(`Exported CAD file: ${filename}`);
  });

  // 1c. Difficulty Tier Filter Pills Handler
  document.querySelectorAll(".btn-tier-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-tier-filter").forEach(b => {
        b.classList.remove("active");
        b.style.border = "1px solid rgba(255,255,255,0.1)";
        b.style.background = "rgba(15, 23, 42, 0.8)";
      });
      btn.classList.add("active");
      btn.style.border = "1px solid #38bdf8";
      btn.style.background = "rgba(56, 189, 248, 0.2)";

      const tier = btn.dataset.tier;
      audio.playTactileClick(false);

      if (!selExp) return;
      selExp.innerHTML = "";
      ARDUINO_EXPERIMENTS.forEach((exp, idx) => {
        if (tier === "all" || exp.difficulty === tier) {
          const opt = document.createElement("option");
          opt.value = String(idx);
          opt.textContent = `${exp.difficultyLabel ? `[${exp.difficultyLabel}] ` : ""}${exp.title}`;
          selExp.appendChild(opt);
        }
      });

      // If current experiment matches tier, select it, otherwise select first available in filtered tier
      const curExp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
      if (curExp && (tier === "all" || curExp.difficulty === tier)) {
        selExp.value = String(state.selectedExpIndex);
      } else if (selExp.options.length > 0) {
        selExp.selectedIndex = 0;
        selExp.dispatchEvent(new Event("change"));
      }
    });
  });

  // 2. Experiment Selection
  selExp?.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value, 10) || 0;
    state.selectedExpIndex = idx;
    const exp = ARDUINO_EXPERIMENTS[idx];
    if (exp) {
      if (expCategoryBadge) expCategoryBadge.textContent = exp.category;
      if (expDescBox) expDescBox.textContent = exp.description;
      if (expDifficultyBadge) expDifficultyBadge.textContent = exp.difficultyLabel || "🟢 Easy";
      codeEditor.value = exp.code;
      state.wires = getDefaultWiresForExperiment(exp.id);
      updateWireCountBadge();
      state.isCustomSketchActive = false;
      state.customSketch = null;
      addSerialLog(`Loaded experiment: ${exp.title}`);
      audio.playUploadChime();
      resetMcuState();
      if (modal4k && modal4k.style.display !== "none") {
        populate4kModalData(exp);
      }
    }
  });

  // 3. Tactile Pushbutton (Breadboard)
  const handleButtonDown = () => {
    state.components.buttonPressed = true;
    audio.playTactileClick(true);
    addSerialLog("Pin D2 -> LOW (Button Pressed)");
  };
  const handleButtonUp = () => {
    state.components.buttonPressed = false;
    audio.playTactileClick(false);
    addSerialLog("Pin D2 -> HIGH (Button Released)");
  };

  btnPushBreadboard?.addEventListener("mousedown", handleButtonDown);
  btnPushBreadboard?.addEventListener("mouseup", handleButtonUp);
  btnPushBreadboard?.addEventListener("mouseleave", () => {
    if (state.components.buttonPressed) handleButtonUp();
  });
  btnPushBreadboard?.addEventListener("touchstart", (e) => { e.preventDefault(); handleButtonDown(); }, { passive: false });
  btnPushBreadboard?.addEventListener("touchend", (e) => { e.preventDefault(); handleButtonUp(); }, { passive: false });

  // 4. Sliders
  sliderPot?.addEventListener("input", (e) => {
    state.components.potValue = parseInt(e.target.value, 10);
    const volts = ((state.components.potValue / 1023) * 5.0).toFixed(2);
    valPot.textContent = `${state.components.potValue} (${volts}V)`;
  });

  sliderDist?.addEventListener("input", (e) => {
    state.components.obstacleDistCm = parseFloat(e.target.value);
    valDist.textContent = `${state.components.obstacleDistCm.toFixed(1)} cm`;
  });

  sliderLdr?.addEventListener("input", (e) => {
    state.components.ldrLux = parseInt(e.target.value, 10);
    valLdr.textContent = `${state.components.ldrLux} Lux`;
  });

  sliderTemp?.addEventListener("input", (e) => {
    state.components.temperatureC = parseFloat(e.target.value);
    valTemp.textContent = `${state.components.temperatureC.toFixed(1)} °C`;
  });

  // 4b. Extended Hardware Adjusters Listeners
  sliderMotor?.addEventListener("input", (e) => {
    const pwm = parseInt(e.target.value, 10);
    state.components.motorSpeed = pwm;
    const rpm = Math.round((pwm / 255) * 4800);
    if (valMotor) valMotor.textContent = `${pwm} PWM (${rpm} RPM)`;
    audio.setMotorWhine(pwm / 255);
  });

  pickerRgb?.addEventListener("input", (e) => {
    const hex = e.target.value;
    if (valRgbHex) valRgbHex.textContent = hex.toUpperCase();
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    state.components.rgbColor = { r, g, b };
  });

  btnRelayToggle?.addEventListener("click", () => {
    state.components.relayActive = !state.components.relayActive;
    audio.playRelayClick(state.components.relayActive);
    if (btnRelayToggle) {
      btnRelayToggle.textContent = state.components.relayActive ? "⚡ Relay: ON (NO closed)" : "⚡ Relay: OFF (NC closed)";
      btnRelayToggle.style.color = state.components.relayActive ? "#f59e0b" : "#38bdf8";
    }
    addSerialLog(`Relay switched ${state.components.relayActive ? "ON (NO Active)" : "OFF (NC Active)"}`);
  });

  btnPirTrigger?.addEventListener("click", () => {
    state.components.pirMotionDetected = true;
    audio.playPirChime();
    addSerialLog("🚨 PIR Motion Sensor: INTRUDER DETECTED! (Pin D7 -> HIGH)");
    setTimeout(() => {
      state.components.pirMotionDetected = false;
      addSerialLog("PIR Sensor: Idle (Pin D7 -> LOW)");
    }, 1800);
  });

  btnSlideSwitch?.addEventListener("click", () => {
    state.components.toggleSwitchOn = !state.components.toggleSwitchOn;
    audio.playTactileClick(state.components.toggleSwitchOn);
    if (btnSlideSwitch) {
      btnSlideSwitch.textContent = state.components.toggleSwitchOn ? "🔀 Slide Switch: ON" : "🔀 Slide Switch: OFF";
      btnSlideSwitch.style.color = state.components.toggleSwitchOn ? "#10b981" : "#34d399";
    }
    addSerialLog(`Slide switch flipped: ${state.components.toggleSwitchOn ? "HIGH" : "LOW"}`);
  });

  btnSevensegStep?.addEventListener("click", () => {
    state.components.sevenSegDigit = (state.components.sevenSegDigit + 1) % 10;
    audio.playTactileClick(true);
    if (btnSevensegStep) btnSevensegStep.textContent = `🔢 Step 7-Seg: ${state.components.sevenSegDigit}`;
    addSerialLog(`7-Segment display stepped to: ${state.components.sevenSegDigit}`);
  });

  // 4c. Custom Project Builder & Component Library Handlers
  function renderCustomChips() {
    if (!customChipsContainer) return;
    customChipsContainer.innerHTML = "";
    if (!state.components.customPlacedComponents || state.components.customPlacedComponents.length === 0) {
      customChipsContainer.innerHTML = `<span style="font-size: 0.72rem; color: #64748b; font-style: italic;">No custom components yet. Select an item and click 'Add to Breadboard' to build your circuit!</span>`;
      return;
    }
    state.components.customPlacedComponents.forEach((comp, idx) => {
      const partDef = AVAILABLE_PARTS.find(p => p.type === comp.type) || { icon: "📦", name: comp.label };
      const chip = document.createElement("div");
      chip.style.cssText = "display: inline-flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 2px 8px; font-size: 0.72rem;";
      chip.innerHTML = `
        <span>${partDef.icon}</span>
        <strong style="color: #f1f5f9;">${comp.label}</strong>
        <select class="custom-pin-sel" data-index="${idx}" style="background: #0f172a; color: #38bdf8; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; font-size: 0.68rem; padding: 1px 4px;">
          ${[2,3,4,5,6,7,8,9,10,11,12,13,"A0","A1","A2","A3","A4","A5"].map(p => `<option value="${p}" ${String(comp.pin) === String(p) ? "selected" : ""}>Pin ${p}</option>`).join("")}
        </select>
        <button class="btn-remove-part" data-index="${idx}" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 0.8rem; padding: 0 2px;" title="Remove component">✕</button>
      `;
      customChipsContainer.appendChild(chip);
    });

    customChipsContainer.querySelectorAll(".custom-pin-sel").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        if (state.components.customPlacedComponents[i]) {
          const val = e.target.value;
          state.components.customPlacedComponents[i].pin = isNaN(val) ? val : parseInt(val, 10);
          addSerialLog(`Assigned ${state.components.customPlacedComponents[i].label} to Pin ${val}`);
        }
      });
    });

    customChipsContainer.querySelectorAll(".btn-remove-part").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index, 10);
        const removed = state.components.customPlacedComponents.splice(i, 1)[0];
        if (removed) addSerialLog(`Removed ${removed.label} from breadboard`);
        audio.playTactileClick(false);
        renderCustomChips();
      });
    });
  }

  // Initial render of placed component chips
  renderCustomChips();

  btnAddComponent?.addEventListener("click", () => {
    const selectedType = selAddComponent ? selAddComponent.value : "led_red";
    const partDef = AVAILABLE_PARTS.find(p => p.type === selectedType) || AVAILABLE_PARTS[0];
    const count = (state.components.customPlacedComponents || []).filter(c => c.type === selectedType).length + 1;
    const offset = (state.components.customPlacedComponents.length * 55) % 280;
    const newComp = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: partDef.type,
      label: `${partDef.name} ${count}`,
      pin: partDef.defaultPin,
      x: 70 + offset,
      y: 75 + ((state.components.customPlacedComponents.length * 35) % 150),
      state: { on: false, val: 0 }
    };
    state.components.customPlacedComponents.push(newComp);
    renderCustomChips();
    addSerialLog(`Added ${newComp.label} to breadboard at Pin ${newComp.pin}`);
    audio.playTactileClick(true);
  });

  btnCustomGen?.addEventListener("click", () => {
    audio.playTactileClick(true);
    const comps = state.components.customPlacedComponents;
    if (!comps || comps.length === 0) {
      addSerialLog("No custom components placed. Add components first!");
      return;
    }
    const sandboxIdx = ARDUINO_EXPERIMENTS.findIndex(e => e.id === "custom_sandbox");
    if (sandboxIdx !== -1 && state.selectedExpIndex !== sandboxIdx) {
      if (selExp) selExp.value = sandboxIdx;
      state.selectedExpIndex = sandboxIdx;
      if (expCategoryBadge) expCategoryBadge.textContent = ARDUINO_EXPERIMENTS[sandboxIdx].category;
      if (expDescBox) expDescBox.textContent = ARDUINO_EXPERIMENTS[sandboxIdx].description;
    }

    let code = `// ==================================================\n// Custom Auto-Generated Arduino Uno Project Sketch\n// Components: ${comps.map(c => c.label).join(", ")}\n// ==================================================\n\n`;
    comps.forEach(c => {
      const varName = c.label.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      code += `#define PIN_${varName} ${c.pin}\n`;
    });
    code += `\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("Custom Interactive Project Online!");\n`;
    comps.forEach(c => {
      const varName = c.label.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      if (c.type.includes("led") || c.type.includes("buzzer") || c.type.includes("motor") || c.type.includes("relay") || c.type.includes("seven_seg")) {
        code += `  pinMode(PIN_${varName}, OUTPUT);\n`;
      } else if (c.type.includes("button") || c.type.includes("switch") || c.type.includes("pir")) {
        code += `  pinMode(PIN_${varName}, INPUT_PULLUP);\n`;
      }
    });
    code += `}\n\nvoid loop() {\n`;
    comps.forEach(c => {
      const varName = c.label.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      if (String(c.pin).startsWith("A")) {
        code += `  int val_${varName.toLowerCase()} = analogRead(PIN_${varName});\n  Serial.print("${c.label}: "); Serial.println(val_${varName.toLowerCase()});\n`;
      } else if (c.type.includes("button") || c.type.includes("switch") || c.type.includes("pir")) {
        code += `  int state_${varName.toLowerCase()} = digitalRead(PIN_${varName});\n`;
      } else if (c.type.includes("led") || c.type.includes("relay")) {
        code += `  digitalWrite(PIN_${varName}, HIGH);\n  delay(200);\n  digitalWrite(PIN_${varName}, LOW);\n`;
      }
    });
    code += `  delay(100);\n}\n`;

    if (codeEditor) codeEditor.value = code;
    if (compilerLog) compilerLog.innerHTML = `<span style="color: #34d399;">✓ Sketch auto-generated for ${comps.length} custom components!</span>`;
    addSerialLog(`Auto-generated C++ sketch for ${comps.length} components.`);
    SoundFX.playSuccess();
  });

  btnCustomSave?.addEventListener("click", () => {
    audio.playTactileClick(true);
    try {
      const projectData = {
        name: "Custom Arduino Project",
        savedAt: new Date().toISOString(),
        components: state.components.customPlacedComponents,
        code: codeEditor ? codeEditor.value : ""
      };
      localStorage.setItem("edugates_arduino_custom_project", JSON.stringify(projectData));
      addSerialLog("Project saved to browser localStorage!");
      SoundFX.playSuccess();
    } catch (err) {
      addSerialLog(`Save error: ${err.message}`);
    }
  });

  btnCustomLoad?.addEventListener("click", () => {
    audio.playTactileClick(true);
    try {
      const raw = localStorage.getItem("edugates_arduino_custom_project");
      if (!raw) {
        addSerialLog("No saved project found in localStorage.");
        return;
      }
      const data = JSON.parse(raw);
      if (Array.isArray(data.components)) {
        state.components.customPlacedComponents = data.components;
        if (data.code && codeEditor) codeEditor.value = data.code;
        renderCustomChips();
        addSerialLog(`Loaded custom project (${data.components.length} components).`);
        SoundFX.playSuccess();
      }
    } catch (err) {
      addSerialLog(`Load error: ${err.message}`);
    }
  });

  btnCustomClear?.addEventListener("click", () => {
    audio.playTactileClick(false);
    state.components.customPlacedComponents = [];
    renderCustomChips();
    addSerialLog("Cleared custom breadboard components.");
  });

  // 5. IDE Controls: Verify & Upload
  btnVerify?.addEventListener("click", () => {
    audio.playTactileClick(true);
    compilerLog.innerHTML = `<span style="color: #38bdf8;">⚙️ Compiling sketch.ino with avr-g++...</span>`;
    setTimeout(() => {
      const res = compileArduinoSketch(codeEditor ? codeEditor.value : "");
      if (!res.success) {
        compilerLog.innerHTML = `<span style="color: #ef4444; font-weight: 700;">❌ Build Failed:</span><br><span style="color: #fca5a5;">${res.error}</span>`;
        audio.playTactileClick(false);
      } else {
        const flashPct = Math.round((res.flashBytes / 32256) * 100);
        const sramPct = Math.round((res.sramBytes / 2048) * 100);
        compilerLog.innerHTML = `<span style="color: #34d399; font-weight: 700;">✓ Compilation Successful!</span><br><span style="color: #a7f3d0;">Sketch uses ${res.flashBytes} bytes (${flashPct}%) of program storage space. Maximum is 32,256 bytes.<br>Global variables use ${res.sramBytes} bytes (${sramPct}%) of dynamic memory, leaving ${2048 - res.sramBytes} bytes for local variables.</span>`;
        if (typeof SoundFX !== "undefined" && SoundFX.playSuccess) SoundFX.playSuccess();
      }
    }, 280);
  });

  btnUpload?.addEventListener("click", () => {
    audio.playTactileClick(true);
    const res = compileArduinoSketch(codeEditor ? codeEditor.value : "");
    if (!res.success) {
      compilerLog.innerHTML = `<span style="color: #ef4444; font-weight: 700;">❌ Upload Aborted (Compile Error):</span><br><span style="color: #fca5a5;">${res.error}</span>`;
      return;
    }

    compilerLog.innerHTML = `<span style="color: #f59e0b;">⚡ Flashing ATmega328P via stk500v1 (/dev/ttyACM0 @ 115200 bps)...</span>`;
    state.components.rxLed = true;
    setTimeout(() => { state.components.txLed = true; }, 120);
    setTimeout(() => {
      state.components.rxLed = false;
      state.components.txLed = false;
      state.customSketch = res;
      state.isCustomSketchActive = true;
      state.customSketchTimer = 0;
      const flashPct = Math.round((res.flashBytes / 32256) * 100);
      compilerLog.innerHTML = `<span style="color: #34d399; font-weight: 700;">✓ Done uploading. Verified 100%.</span><br><span style="color: #a7f3d0;">CPU restarted. Running sketch on ATmega328P (${res.flashBytes} B, ${flashPct}% ROM).</span>`;
      audio.playUploadChime();
      addSerialLog("Sketch binary flashed to ATmega328P (stk500v1 OK)");
      addSerialLog("Custom user sketch loop active");
      resetMcuState();
      state.isCustomSketchActive = true;
    }, 420);
  });

  btnPlayPause?.addEventListener("click", () => {
    state.isRunning = !state.isRunning;
    playPauseIcon.textContent = state.isRunning ? "⏸️" : "▶️";
    audio.playTactileClick(false);
  });

  btnCodeReload?.addEventListener("click", () => {
    const exp = ARDUINO_EXPERIMENTS[state.selectedExpIndex];
    if (exp) {
      codeEditor.value = exp.code;
      state.isCustomSketchActive = false;
      state.customSketch = null;
      audio.playTactileClick(false);
      addSerialLog("Reset code to default experiment template");
    }
  });

  // 6. Reset MCU Button
  function resetMcuState() {
    state.simTimeMs = 0;
    audio.playReset();
    audio.stopBuzzer();
    audio.stopServo();
    state.components.pin13Led = false;
    state.components.pin9Pwm = 0;
    state.components.pin11Led = false;
    state.components.pin12Led = false;
    state.components.currentServoAngle = 90;
    state.waveformPoints = [];
    addSerialLog("--- HARDWARE RESET TRIGGERED ---");
    addSerialLog("ATmega328P initialized @ 16 MHz");
  }

  btnReset?.addEventListener("click", resetMcuState);

  // 7. Tab Switcher: Monitor vs Plotter
  tabSerialMon?.addEventListener("click", () => {
    state.activeTab = "monitor";
    tabSerialMon.classList.add("active");
    tabSerialPlot.classList.remove("active");
    viewSerialMon.style.display = "block";
    viewSerialPlot.style.display = "none";
    audio.playTactileClick(false);
  });

  tabSerialPlot?.addEventListener("click", () => {
    state.activeTab = "plotter";
    tabSerialPlot.classList.add("active");
    tabSerialMon.classList.remove("active");
    viewSerialMon.style.display = "none";
    viewSerialPlot.style.display = "block";
    audio.playTactileClick(false);
  });

  // 8. Serial Controls
  chkAutoscroll?.addEventListener("change", (e) => {
    state.serialAutoScroll = !!e.target.checked;
  });

  btnClearSerial?.addEventListener("click", () => {
    state.serialLogs = [];
    if (serialTerminal) serialTerminal.innerHTML = "";
    audio.playTactileClick(false);
  });

  selBaudRate?.addEventListener("change", (e) => {
    state.baudRate = parseInt(e.target.value, 10);
    addSerialLog(`Baud rate switched to ${state.baudRate} bps`);
  });

  const sendSerialMessage = () => {
    const text = inputSerialCmd.value.trim();
    if (!text) return;
    inputSerialCmd.value = "";
    addSerialLog(`>>> ${text}`);
    audio.playTactileClick(true);

    // Echo back / response
    setTimeout(() => {
      if (text.toUpperCase() === "PING") {
        addSerialLog("PONG! Latency: 1.02 ms");
      } else if (text.toUpperCase() === "RESET") {
        resetMcuState();
      } else {
        addSerialLog(`ACK: Received ${text.length} bytes`);
      }
    }, 150);
  };

  btnSendSerial?.addEventListener("click", sendSerialMessage);
  inputSerialCmd?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendSerialMessage();
  });

  // 9. CSV Export & Lab Report
  btnExport?.addEventListener("click", () => {
    audio.playTactileClick(false);
    const headers = ["Time (ms)", "Potentiometer (ADC)", "Distance (cm)", "LDR (Lux)", "Temp (C)", "Pin13 LED", "Pin9 PWM"];
    const rows = state.waveformPoints.map(pt => [
      pt.time.toFixed(1),
      pt.pot,
      pt.dist.toFixed(1),
      pt.ldr,
      pt.temp.toFixed(1),
      pt.pin13 ? 1 : 0,
      pt.pwm
    ]);
    if (rows.length === 0) {
      rows.push([state.simTimeMs.toFixed(1), state.components.potValue, state.components.obstacleDistCm, state.components.ldrLux, state.components.temperatureC, 0, 0]);
    }
    exportLabDataCsv("arduino_circuit_telemetry", headers, rows);
  });

  btnReport?.addEventListener("click", () => {
    audio.playTactileClick(false);
    openLabReportModal({
      labId: "arduino",
      labTitle: "Arduino Microcontroller & Embedded Systems Laboratory",
      parameters: {
        "MCU Clock": "16.0 MHz (ATmega328P)",
        "Supply Voltage": "5.00 V",
        "Active Experiment": ARDUINO_EXPERIMENTS[state.selectedExpIndex].title,
        "ADC Resolution": "10-bit (1024 steps, 4.89 mV/step)",
        "Baud Rate": `${state.baudRate} bps`
      },
      observations: [
        `Executed virtual C++ sketch with ${state.simSpeed}x clock timing.`,
        `Monitored live transducer responses: Potentiometer (${state.components.potValue}), Sonar (${state.components.obstacleDistCm.toFixed(1)} cm), LDR (${state.components.ldrLux} Lux).`,
        `Synthesized real-time piezo acoustic signals matching tone() frequency instructions.`
      ]
    });
  });

  // -------------------------------------------------------------------------
  // 10. Direct Canvas Pointer & Touch Interaction for Hardware Components
  // -------------------------------------------------------------------------
  let hoveredTarget = null;
  let isDraggingPot = false;
  let activeCanvasButton = false;
  let potDragCenter = null;

  function getCanvasCoords(e) {
    if (!canvas) return null;
    const rect = (canvas.getBoundingClientRect && canvas.getBoundingClientRect()) || {
      left: 0,
      top: 0,
      width: canvas.width || 850,
      height: canvas.height || 460
    };
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    if (clientX === undefined || clientY === undefined) return null;
    const scaleX = (canvas.width || 850) / (rect.width || 1);
    const scaleY = (canvas.height || 460) / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // Calculate realistic Bezier control points and midpoint for curved jumper wires
  function getWireBezier(w, idx = 0) {
    const dx = w.ex - w.sx;
    const dy = w.ey - w.sy;
    const dist = Math.hypot(dx, dy);

    let cp1x, cp1y, cp2x, cp2y;

    if (w.sy > 300 && w.ey < 180) {
      // Bottom Arduino header (5V / GND) to Top Breadboard rail
      // Neatly route through the corridor between Arduino (x <= 370) and Breadboard (x >= 420)
      const channelX = 390 + (idx === 0 || w.from === "5V" ? -7 : 7);
      cp1x = w.sx + (channelX - w.sx) * 0.72;
      cp1y = w.sy - 35;
      cp2x = channelX;
      cp2y = w.ey + 45;
    } else if (w.sy < 150 && w.ey < 200) {
      // Top digital header to breadboard components
      // Must arch gently, but strictly clamped so peakY >= 48 (never intersects HUD badges at y=10..35)
      const baseMinY = Math.min(w.sy, w.ey);
      const archH = Math.max(12, Math.min(baseMinY - 48, 14 + (idx % 5) * 2.5));
      const archY = baseMinY - archH;
      cp1x = w.sx + dx * 0.28;
      cp1y = archY;
      cp2x = w.sx + dx * 0.72;
      cp2y = archY;
    } else {
      const sag = Math.max(20, Math.min(65, dist * 0.22));
      const midY = (w.sy + w.ey) / 2;
      if (midY < 220) {
        const archY = Math.max(48, Math.min(w.sy, w.ey) - sag);
        cp1x = w.sx + dx * 0.28;
        cp1y = archY;
        cp2x = w.sx + dx * 0.72;
        cp2y = archY;
      } else {
        const sagY = Math.min(415, Math.max(w.sy, w.ey) + sag * 0.6);
        cp1x = w.sx + dx * 0.28;
        cp1y = sagY;
        cp2x = w.sx + dx * 0.72;
        cp2y = sagY;
      }
    }

    const midX = 0.125 * w.sx + 0.375 * cp1x + 0.375 * cp2x + 0.125 * w.ex;
    const midY = 0.125 * w.sy + 0.375 * cp1y + 0.375 * cp2y + 0.125 * w.ey;

    return { cp1x, cp1y, cp2x, cp2y, midX, midY };
  }

  function getInteractiveTarget(cx, cy) {
    state.hoveredPin = null;
    state.hoveredWireIndex = -1;

    // 0. Wire Hover / Cut Target in Wire Routing Mode
    if (state.isWireMode && state.wires && state.wires.length > 0) {
      for (let i = state.wires.length - 1; i >= 0; i--) {
        const w = state.wires[i];
        const b = getWireBezier(w, i);
        if (Math.hypot(cx - b.midX, cy - b.midY) <= 18 || Math.hypot(cx - w.sx, cy - w.sy) <= 10 || Math.hypot(cx - w.ex, cy - w.ey) <= 10) {
          state.hoveredWireIndex = i;
          return {
            id: "wire",
            wire: w,
            wireIndex: i,
            label: `Jumper Wire (${w.label || w.from + ' ➔ ' + w.to}) [Click to Unplug]`,
            cursor: "pointer"
          };
        }
      }
    }

    // 0b. Pin Terminal Snapping (Arduino Headers & Breadboard Rails/Tiepoints)
    if (typeof ARDUINO_PINS !== "undefined") {
      for (const [key, p] of Object.entries(ARDUINO_PINS)) {
        if (Math.hypot(cx - p.x, cy - p.y) <= 12) {
          state.hoveredPin = { pinKey: key, name: p.label, x: p.x, y: p.y };
          return {
            id: "pin",
            pinKey: key,
            name: p.label,
            x: p.x,
            y: p.y,
            center: { x: p.x, y: p.y },
            label: `Pin ${p.label}`,
            cursor: state.isWireMode ? "crosshair" : "pointer"
          };
        }
      }
    }
    if (typeof BREADBOARD_PINS !== "undefined") {
      for (const [key, p] of Object.entries(BREADBOARD_PINS)) {
        if (Math.hypot(cx - p.x, cy - p.y) <= 12) {
          state.hoveredPin = { pinKey: key, name: p.label, x: p.x, y: p.y };
          return {
            id: "pin",
            pinKey: key,
            name: p.label,
            x: p.x,
            y: p.y,
            center: { x: p.x, y: p.y },
            label: p.label,
            cursor: state.isWireMode ? "crosshair" : "pointer"
          };
        }
      }
    }
    if (state.isWireMode && cx >= 440 && cx <= 790 && cy >= 90 && cy <= 250) {
      const snapX = Math.round((cx - 450) / 15) * 15 + 450;
      const snapY = Math.round((cy - 100) / 15) * 15 + 100;
      if (Math.hypot(cx - snapX, cy - snapY) <= 10) {
        const colLetter = String.fromCharCode(65 + Math.floor((snapX - 450) / 15));
        const rowNum = Math.floor((snapY - 100) / 15) + 1;
        const pinName = `BB_${colLetter}${rowNum}`;
        state.hoveredPin = { pinKey: pinName, name: pinName, x: snapX, y: snapY };
        return {
          id: "pin",
          pinKey: pinName,
          name: pinName,
          x: snapX,
          y: snapY,
          label: `Tie-Point ${pinName}`,
          cursor: "crosshair"
        };
      }
    }

    // 1. Arduino Board Reset Button
    if (Math.hypot(cx - 125, cy - 90) <= 14) {
      return {
        id: "reset",
        label: "Arduino Hardware Reset",
        cursor: "pointer",
        circle: { x: 125, y: 90, r: 12 },
        center: { x: 125, y: 90 }
      };
    }

    // 2. Arduino USB Port & MCU IC
    if (cx >= 50 && cx <= 105 && cy >= 45 && cy <= 93) {
      return {
        id: "usb",
        label: "USB Type-B Port (/dev/ttyACM0)",
        cursor: "pointer",
        box: { x: 50, y: 45, w: 55, h: 48 },
        center: { x: 77, y: 69 }
      };
    }
    if (cx >= 160 && cx <= 315 && cy >= 205 && cy <= 257) {
      return {
        id: "mcu",
        label: "ATmega328P 8-Bit MCU (16 MHz)",
        cursor: "pointer",
        box: { x: 160, y: 205, w: 155, h: 52 },
        center: { x: 237, y: 231 }
      };
    }

    // 3. Breadboard Components per Active Experiment
    const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex]?.id;

    if (expId === "traffic_light") {
      if (cx >= 660 && cx <= 705 && cy >= 125 && cy <= 168) {
        return {
          id: "button",
          label: "Crosswalk Request Pushbutton (Pin D2)",
          cursor: "pointer",
          box: { x: 665, y: 130, w: 32, h: 32 },
          center: { x: 681, y: 146 }
        };
      }
      if (Math.hypot(cx - 758, cy - 148) <= 24) {
        return {
          id: "buzzer",
          label: "Piezo Acoustic Transducer (Pin D8)",
          cursor: "pointer",
          circle: { x: 758, y: 148, r: 22 },
          center: { x: 758, y: 148 }
        };
      }
      if (Math.hypot(cx - 485, cy - 137) <= 14) {
        return { id: "led_red", label: "Stop LED - Red (Pin D13)", cursor: "pointer", circle: { x: 485, y: 137, r: 14 }, center: { x: 485, y: 137 } };
      }
      if (Math.hypot(cx - 545, cy - 137) <= 14) {
        return { id: "led_yellow", label: "Caution LED - Yellow (Pin D12)", cursor: "pointer", circle: { x: 545, y: 137, r: 14 }, center: { x: 545, y: 137 } };
      }
      if (Math.hypot(cx - 605, cy - 137) <= 14) {
        return { id: "led_green", label: "Go LED - Green (Pin D11)", cursor: "pointer", circle: { x: 605, y: 137, r: 14 }, center: { x: 605, y: 137 } };
      }
    } else if (expId === "ultrasonic_radar") {
      if (cx >= 500 && cx <= 620 && cy >= 125 && cy <= 173) {
        return {
          id: "sonar",
          label: "HC-SR04 Ultrasonic Distance Sensor",
          cursor: "pointer",
          box: { x: 500, y: 125, w: 120, h: 48 },
          center: { x: 560, y: 149 }
        };
      }
      if (Math.hypot(cx - 758, cy - 153) <= 24) {
        return {
          id: "buzzer",
          label: "Radar Warning Buzzer (Pin D8)",
          cursor: "pointer",
          circle: { x: 758, y: 153, r: 22 },
          center: { x: 758, y: 153 }
        };
      }
      if (Math.hypot(cx - 680, cy - 135) <= 14) {
        return { id: "led_warn", label: "Proximity Warning LED (Pin D13)", cursor: "pointer", circle: { x: 680, y: 135, r: 14 }, center: { x: 680, y: 135 } };
      }
    } else if (expId === "ldr_nightlight") {
      if (Math.hypot(cx - 500, cy - 135) <= 18) {
        return {
          id: "ldr",
          label: "Photoresistor / LDR Ambient Sensor",
          cursor: "pointer",
          circle: { x: 500, y: 135, r: 16 },
          center: { x: 500, y: 135 }
        };
      }
      if (Math.hypot(cx - 717, cy - 147) <= 22) {
        return {
          id: "pot",
          label: "10kΩ Threshold Potentiometer (ADC A0)",
          cursor: "grab",
          box: { x: 698, y: 128, w: 38, h: 38 },
          center: { x: 717, y: 147 }
        };
      }
      if (Math.hypot(cx - 600, cy - 135) <= 14) {
        return { id: "led_pwm", label: "Nightlight Dimming LED (PWM Pin ~9)", cursor: "pointer", circle: { x: 600, y: 135, r: 14 }, center: { x: 600, y: 135 } };
      }
    } else if (expId === "servo_control") {
      if (cx >= 550 && cx <= 625 && cy >= 150 && cy <= 245) {
        return {
          id: "servo",
          label: "SG90 Micro Servo Motor (PWM Pin ~9)",
          cursor: "pointer",
          box: { x: 550, y: 150, w: 75, h: 95 },
          center: { x: 587, y: 197 }
        };
      }
      if (Math.hypot(cx - 737, cy - 147) <= 22) {
        return {
          id: "pot",
          label: "10kΩ Angle Steering Potentiometer (ADC A0)",
          cursor: "grab",
          box: { x: 718, y: 128, w: 38, h: 38 },
          center: { x: 737, y: 147 }
        };
      }
    } else if (expId === "chiptune_melody") {
      if (Math.hypot(cx - 598, cy - 158) <= 26) {
        return {
          id: "buzzer",
          label: "8-Bit Jukebox Piezo Transducer (Pin D8)",
          cursor: "pointer",
          circle: { x: 598, y: 158, r: 24 },
          center: { x: 598, y: 158 }
        };
      }
      if (Math.hypot(cx - 700, cy - 140) <= 14) {
        return { id: "led_tempo", label: "Beat / Tempo LED (Pin D13)", cursor: "pointer", circle: { x: 700, y: 140, r: 14 }, center: { x: 700, y: 140 } };
      }
    } else if (expId === "weather_station") {
      if (cx >= 480 && cx <= 710 && cy >= 105 && cy <= 195) {
        return {
          id: "lcd",
          label: "16x2 Character LCD (HD44780)",
          cursor: "pointer",
          box: { x: 480, y: 105, w: 230, h: 90 },
          center: { x: 595, y: 150 }
        };
      }
      if (Math.hypot(cx - 740, cy - 135) <= 18) {
        return {
          id: "temp",
          label: "TMP36 Analog Temperature Sensor (ADC A1)",
          cursor: "pointer",
          circle: { x: 740, y: 135, r: 16 },
          center: { x: 740, y: 135 }
        };
      }
    } else if (expId === "rgb_mood_lamp") {
      if (Math.hypot(cx - 570, cy - 140) <= 24) {
        return { id: "rgb_led", label: "Diffused 4-Pin RGB LED (Pins D9/10/11)", cursor: "pointer", circle: { x: 570, y: 140, r: 22 }, center: { x: 570, y: 140 } };
      }
      if (Math.hypot(cx - 720, cy - 147) <= 22) {
        return { id: "pot", label: "10kΩ RGB Hue Selector Potentiometer (ADC A0)", cursor: "grab", box: { x: 701, y: 128, w: 38, h: 38 }, center: { x: 720, y: 147 } };
      }
    } else if (expId === "dc_motor_speed") {
      if (Math.hypot(cx - 560, cy - 145) <= 35) {
        return { id: "motor", label: "High-RPM DC Motor with Propeller Fan (PWM ~5)", cursor: "pointer", circle: { x: 560, y: 145, r: 35 }, center: { x: 560, y: 145 } };
      }
      if (Math.hypot(cx - 750, cy - 147) <= 22) {
        return { id: "pot", label: "10kΩ Motor Speed Throttle (ADC A0)", cursor: "grab", box: { x: 731, y: 128, w: 38, h: 38 }, center: { x: 750, y: 147 } };
      }
    } else if (expId === "pir_alarm") {
      if (Math.hypot(cx - 520, cy - 135) <= 25) {
        return { id: "pir", label: "HC-SR501 PIR Motion Detector (Pin D7)", cursor: "pointer", circle: { x: 520, y: 135, r: 25 }, center: { x: 520, y: 135 } };
      }
      if (cx >= 620 && cx <= 685 && cy >= 120 && cy <= 185) {
        return { id: "relay", label: "Songle 5V Sugar-Cube Relay Module (Pin D4)", cursor: "pointer", box: { x: 620, y: 120, w: 65, h: 65 }, center: { x: 652, y: 152 } };
      }
      if (Math.hypot(cx - 785, cy - 145) <= 24) {
        return { id: "buzzer", label: "Security Siren Piezo (Pin D8)", cursor: "pointer", circle: { x: 785, y: 145, r: 22 }, center: { x: 785, y: 145 } };
      }
      if (Math.hypot(cx - 730, cy - 145) <= 14) {
        return { id: "led_red", label: "Intruder Alert Strobe (Pin D13)", cursor: "pointer", circle: { x: 730, y: 145, r: 14 }, center: { x: 730, y: 145 } };
      }
    } else if (expId === "seven_seg_counter") {
      if (cx >= 560 && cx <= 630 && cy >= 110 && cy <= 200) {
        return { id: "sevenseg", label: "Decimal 7-Segment LED Display (Pins D6-D12)", cursor: "pointer", box: { x: 560, y: 110, w: 70, h: 90 }, center: { x: 595, y: 155 } };
      }
      if (cx >= 690 && cx <= 730 && cy >= 130 && cy <= 170) {
        return { id: "button", label: "Decade Counter Reset Switch (Pin D2)", cursor: "pointer", box: { x: 690, y: 130, w: 40, h: 40 }, center: { x: 710, y: 150 } };
      }
    } else if (expId === "joystick_pan_tilt") {
      if (Math.hypot(cx - 530, cy - 135) <= 30) {
        return { id: "joystick", label: "2-Axis Analog Thumbstick Joystick (A0/A1, D2)", cursor: "pointer", circle: { x: 530, y: 135, r: 30 }, center: { x: 530, y: 135 } };
      }
      if (cx >= 660 && cx <= 735 && cy >= 150 && cy <= 245) {
        return { id: "servo", label: "Pan-Tilt Micro Servo Motor (PWM ~9)", cursor: "pointer", box: { x: 660, y: 150, w: 75, h: 95 }, center: { x: 697, y: 197 } };
      }
    } else if (expId === "button_toggle") {
      if (cx >= 520 && cx <= 560 && cy >= 110 && cy <= 150) {
        return { id: "button", label: "Debounced Pushbutton (Pin D2)", cursor: "pointer", box: { x: 524, y: 114, w: 32, h: 32 }, center: { x: 540, y: 130 } };
      }
      if (Math.hypot(cx - 660, cy - 135) <= 14) {
        return { id: "led_toggle", label: "Toggle Status LED (Pin D13)", cursor: "pointer", circle: { x: 660, y: 135, r: 14 }, center: { x: 660, y: 135 } };
      }
    } else if (expId === "sonar_lcd_scope") {
      if (cx >= 480 && cx <= 710 && cy >= 85 && cy <= 160) {
        return { id: "lcd", label: "16x2 LCD Radar Scope", cursor: "pointer", box: { x: 480, y: 85, w: 230, h: 75 }, center: { x: 595, y: 122 } };
      }
      if (cx >= 470 && cx <= 610 && cy >= 165 && cy <= 225) {
        return { id: "sonar", label: "HC-SR04 Ultrasonic Radar", cursor: "pointer", box: { x: 470, y: 165, w: 140, h: 60 }, center: { x: 540, y: 195 } };
      }
      if (Math.hypot(cx - 745, cy - 185) <= 24) {
        return { id: "buzzer", label: "Radar Warning Buzzer (Pin D13)", cursor: "pointer", circle: { x: 745, y: 185, r: 22 }, center: { x: 745, y: 185 } };
      }
    } else if (expId === "thermostat_relay_fan") {
      if (Math.hypot(cx - 470, cy - 135) <= 18) {
        return { id: "temp", label: "TMP36 Thermal Sensor (ADC A0)", cursor: "pointer", circle: { x: 470, y: 135, r: 16 }, center: { x: 470, y: 135 } };
      }
      if (Math.hypot(cx - 550, cy - 130) <= 22) {
        return { id: "pot", label: "Thermostat Threshold Potentiometer (ADC A1)", cursor: "grab", box: { x: 531, y: 111, w: 38, h: 38 }, center: { x: 550, y: 130 } };
      }
      if (cx >= 600 && cx <= 665 && cy >= 90 && cy <= 155) {
        return { id: "relay", label: "Cooling Fan Relay Module (Pin D4)", cursor: "pointer", box: { x: 600, y: 90, w: 65, h: 65 }, center: { x: 632, y: 122 } };
      }
      if (Math.hypot(cx - 730, cy - 140) <= 35) {
        return { id: "motor", label: "High-RPM DC Cooling Fan (Pin D5)", cursor: "pointer", circle: { x: 730, y: 140, r: 35 }, center: { x: 730, y: 140 } };
      }
    } else if (expId === "multi_sensor_alarm") {
      if (Math.hypot(cx - 480, cy - 125) <= 25) {
        return { id: "pir", label: "HC-SR501 PIR Motion Detector (Pin D7)", cursor: "pointer", circle: { x: 480, y: 125, r: 25 }, center: { x: 480, y: 125 } };
      }
      if (Math.hypot(cx - 570, cy - 135) <= 18) {
        return { id: "ldr", label: "LDR Day/Night Light Sensor (ADC A0)", cursor: "pointer", circle: { x: 570, y: 135, r: 16 }, center: { x: 570, y: 135 } };
      }
      if (cx >= 615 && cx <= 680 && cy >= 90 && cy <= 155) {
        return { id: "relay", label: "Floodlight Driver Relay (Pin D4)", cursor: "pointer", box: { x: 615, y: 90, w: 65, h: 65 }, center: { x: 647, y: 122 } };
      }
      if (Math.hypot(cx - 765, cy - 135) <= 24) {
        return { id: "buzzer", label: "Security Siren Piezo Transducer (Pin D8)", cursor: "pointer", circle: { x: 765, y: 135, r: 22 }, center: { x: 765, y: 135 } };
      }
    } else if (expId === "custom_sandbox") {
      if (state.components.customPlacedComponents && state.components.customPlacedComponents.length > 0) {
        for (let i = state.components.customPlacedComponents.length - 1; i >= 0; i--) {
          const comp = state.components.customPlacedComponents[i];
          const px = 420 + comp.x;
          const py = 55 + comp.y;
          if (Math.hypot(cx - px, cy - py) <= 26) {
            return {
              id: "custom_comp",
              compIndex: i,
              customComp: comp,
              label: `${comp.label} (Pin ${comp.pin})`,
              cursor: "grab",
              circle: { x: px, y: py, r: 26 },
              center: { x: px, y: py }
            };
          }
        }
      }
    }

    return null;
  }

  function updatePotValueFromCoords(cx, cy, center) {
    if (!center) return;
    const angle = Math.atan2(cy - center.y, cx - center.x);
    let norm = (angle + 0.75 * Math.PI) / (1.5 * Math.PI);
    if (norm < 0) norm = 0;
    if (norm > 1) norm = 1;
    const potVal = Math.round(norm * 1023);
    state.components.potValue = Math.max(0, Math.min(1023, potVal));
    if (sliderPot) sliderPot.value = state.components.potValue;
    const volts = ((state.components.potValue / 1023) * 5.0).toFixed(2);
    if (valPot) valPot.textContent = `${state.components.potValue} (${volts}V)`;
    audio.playTactileClick(false);
  }

  function handleCanvasPointerDown(e) {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const target = getInteractiveTarget(coords.x, coords.y);

    if (e.type === "touchstart") {
      e.preventDefault();
    }

    // Wire Routing Mode Handling
    if (state.isWireMode) {
      if (target && target.id === "wire") {
        const removed = state.wires.splice(target.wireIndex, 1)[0];
        state.hoveredWireIndex = -1;
        updateWireCountBadge();
        audio.playTactileClick(false);
        addSerialLog(`Cut wire: ${removed ? (removed.label || removed.from + ' ➔ ' + removed.to) : "jumper"}`);
        return;
      }
      if (target && target.id === "pin") {
        state.wireDrawing = {
          active: true,
          startPin: target.name || target.pinKey,
          sx: target.x,
          sy: target.y,
          curX: target.x,
          curY: target.y,
          color: state.activeWireColor || "#ef4444"
        };
        audio.playTactileClick(true);
        addSerialLog(`Routing jumper from ${target.name || target.pinKey}... (Click destination pin)`);
        return;
      }
    }

    if (!target) return;

    if (target.id === "reset") {
      resetMcuState();
    } else if (target.id === "button") {
      activeCanvasButton = true;
      handleButtonDown();
    } else if (target.id === "buzzer") {
      const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex]?.id;
      if (expId === "chiptune_melody") {
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const note = notes[Math.floor(Math.random() * notes.length)];
        audio.playTone(note, 220);
        addSerialLog(`Piezo Melody Keypress -> Tone ${note.toFixed(0)} Hz`);
      } else {
        audio.playTone(880, 180);
        addSerialLog("Direct touch: Piezo Buzzer acoustic frequency test (880 Hz)");
      }
    } else if (target.id === "sonar") {
      const frac = Math.max(0.05, Math.min(0.95, (coords.x - 500) / 120));
      const dist = Math.round(frac * 120 * 10) / 10;
      state.components.obstacleDistCm = dist;
      if (sliderDist) sliderDist.value = dist;
      if (valDist) valDist.textContent = `${dist.toFixed(1)} cm`;
      audio.playSonarPing();
      addSerialLog(`Acoustic Sonar Ping -> Target distance adjusted to ${dist.toFixed(1)} cm`);
    } else if (target.id === "pot") {
      isDraggingPot = true;
      potDragCenter = target.center;
      updatePotValueFromCoords(coords.x, coords.y, potDragCenter);
    } else if (target.id === "ldr") {
      const newLux = state.components.ldrLux > 250 ? 30 : 850;
      state.components.ldrLux = newLux;
      if (sliderLdr) sliderLdr.value = newLux;
      if (valLdr) valLdr.textContent = `${newLux} Lux`;
      audio.playTactileClick(true);
      addSerialLog(newLux > 250 ? "Illumination applied: 850 Lux (Light ON)" : "Shadow covered LDR: 30 Lux (Night mode)");
    } else if (target.id === "servo") {
      const angles = [0, 45, 90, 135, 180];
      const cur = state.components.currentServoAngle;
      let nextAngle = angles.find(a => a > cur + 5);
      if (nextAngle === undefined) nextAngle = angles[0];
      state.components.currentServoAngle = nextAngle;
      audio.playServoWhine(nextAngle);
      addSerialLog(`Servo PWM signal commanded arm angle to ${nextAngle}°`);
    } else if (target.id === "temp") {
      const temps = [18.0, 25.0, 34.0, 45.0];
      const cur = state.components.temperatureC;
      let nextTemp = temps.find(t => t > cur + 1.0) || temps[0];
      state.components.temperatureC = nextTemp;
      if (sliderTemp) sliderTemp.value = nextTemp;
      if (valTemp) valTemp.textContent = `${nextTemp.toFixed(1)} °C`;
      audio.playTactileClick(true);
      addSerialLog(`TMP36 thermal probe updated: ${nextTemp.toFixed(1)} °C`);
    } else if (target.id === "usb") {
      audio.playUploadChime();
      addSerialLog("USB Serial link verified @ 115200 bps (CDC-ACM virtual port)");
    } else if (target.id === "mcu") {
      audio.playTactileClick(true);
      addSerialLog("ATmega328P: Flash 32KB, SRAM 2KB, EEPROM 1KB, Core Clock 16 MHz");
    } else if (target.id === "lcd") {
      audio.playTactileClick(false);
      addSerialLog("HD44780 LCD: 16x2 controller buffer refreshed");
    } else if (target.id === "rgb_led") {
      const colors = [{r:255,g:0,b:0},{r:0,g:255,b:0},{r:0,g:128,b:255},{r:255,g:0,b:255},{r:255,g:255,b:0},{r:255,g:255,b:255}];
      const nextCol = colors[Math.floor(Math.random() * colors.length)];
      state.components.rgbColor = nextCol;
      audio.playTactileClick(true);
      addSerialLog(`RGB LED tapped: Color set to rgb(${nextCol.r}, ${nextCol.g}, ${nextCol.b})`);
    } else if (target.id === "motor") {
      state.components.motorSpeed = state.components.motorSpeed > 0 ? 0 : 220;
      if (sliderMotor) sliderMotor.value = state.components.motorSpeed;
      audio.setMotorWhine(state.components.motorSpeed / 255);
      addSerialLog(`DC Motor toggled: ${state.components.motorSpeed > 0 ? "220 PWM (4150 RPM)" : "STOPPED"}`);
    } else if (target.id === "relay") {
      state.components.relayActive = !state.components.relayActive;
      audio.playRelayClick(state.components.relayActive);
      if (btnRelayToggle) {
        btnRelayToggle.textContent = state.components.relayActive ? "⚡ Relay: ON (NO closed)" : "⚡ Relay: OFF (NC closed)";
        btnRelayToggle.style.color = state.components.relayActive ? "#f59e0b" : "#38bdf8";
      }
      addSerialLog(`Relay contact flipped: ${state.components.relayActive ? "NO Closed" : "NC Closed"}`);
    } else if (target.id === "pir") {
      state.components.pirMotionDetected = true;
      audio.playPirChime();
      addSerialLog("🚨 Direct touch on PIR: Motion trigger pulse fired!");
      setTimeout(() => { state.components.pirMotionDetected = false; }, 1800);
    } else if (target.id === "sevenseg") {
      state.components.sevenSegDigit = (state.components.sevenSegDigit + 1) % 10;
      audio.playTactileClick(true);
      addSerialLog(`7-Segment display tapped: Value ${state.components.sevenSegDigit}`);
    } else if (target.id === "joystick") {
      audio.playTactileClick(true);
      state.components.buttonPressed = !state.components.buttonPressed;
      addSerialLog(`Joystick Thumbstick clicked! (SW -> ${state.components.buttonPressed ? "LOW" : "HIGH"})`);
    } else if (target.id === "led_toggle") {
      state.components.buttonToggleState = !state.components.buttonToggleState;
      state.components.pin13Led = state.components.buttonToggleState;
      audio.playTactileClick(state.components.buttonToggleState);
      addSerialLog(`Toggle LED tapped: ${state.components.buttonToggleState ? "HIGH (ON)" : "LOW (OFF)"}`);
    } else if (target.id === "custom_comp" || target.customComp) {
      const comp = target.customComp;
      state.isDraggingComp = true;
      state.draggedCompIndex = target.compIndex !== undefined ? target.compIndex : (state.components.customPlacedComponents ? state.components.customPlacedComponents.indexOf(comp) : -1);
      state.dragCompStart = { x: comp.x, y: comp.y };
      state.dragPointerStart = { x: coords.x, y: coords.y };
      if (canvas) canvas.style.cursor = "grabbing";

      if (comp.type.includes("button") || comp.type.includes("switch")) {
        comp.state = comp.state || {};
        comp.state.pressed = !comp.state.pressed;
        audio.playTactileClick(comp.state.pressed);
        addSerialLog(`${comp.label}: State toggled`);
      } else if (comp.type.includes("relay")) {
        state.components.relayActive = !state.components.relayActive;
        audio.playRelayClick(state.components.relayActive);
        addSerialLog(`${comp.label}: Relay armature clicked`);
      } else if (comp.type.includes("buzzer")) {
        audio.playTone(920, 150);
        addSerialLog(`${comp.label}: Tone triggered`);
      } else if (comp.type.includes("motor")) {
        state.components.motorSpeed = state.components.motorSpeed > 0 ? 0 : 200;
        audio.setMotorWhine(state.components.motorSpeed / 255);
        addSerialLog(`${comp.label}: Motor speed toggled`);
      } else {
        audio.playTactileClick(true);
        addSerialLog(`Picked up ${comp.label} (Drag across breadboard to relocate)`);
      }
    } else if (target.id.startsWith("led_")) {
      audio.playTactileClick(false);
      addSerialLog(`${target.label} probed: Continuity verified`);
    }
  }

  function handleCanvasPointerMove(e) {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (state.wireDrawing && state.wireDrawing.active) {
      if (e.type === "touchmove") e.preventDefault();
      const target = getInteractiveTarget(coords.x, coords.y);
      if (target && target.id === "pin") {
        state.wireDrawing.curX = target.x;
        state.wireDrawing.curY = target.y;
      } else {
        state.wireDrawing.curX = coords.x;
        state.wireDrawing.curY = coords.y;
      }
      if (canvas) canvas.style.cursor = "crosshair";
      return;
    }

    if (state.isDraggingComp && state.draggedCompIndex >= 0) {
      if (e.type === "touchmove") e.preventDefault();
      const comp = state.components.customPlacedComponents ? state.components.customPlacedComponents[state.draggedCompIndex] : null;
      if (comp) {
        const dx = coords.x - state.dragPointerStart.x;
        const dy = coords.y - state.dragPointerStart.y;
        const rawX = state.dragCompStart.x + dx;
        const rawY = state.dragCompStart.y + dy;

        // Snap to breadboard tie-point column pitch (12.5px) and row pitch (14px)
        const snappedX = Math.round(rawX / 12.5) * 12.5;
        const snappedY = Math.round(rawY / 14.0) * 14.0;

        comp.x = Math.max(30, Math.min(340, snappedX));
        comp.y = Math.max(40, Math.min(270, snappedY));

        // Dynamically update connecting wires if any
        (state.wires || []).forEach(w => {
          if (w.to === comp.id || w.to === comp.label) {
            w.ex = 420 + comp.x;
            w.ey = 55 + comp.y;
          }
          if (w.from === comp.id || w.from === comp.label) {
            w.sx = 420 + comp.x;
            w.sy = 55 + comp.y;
          }
        });
      }
      if (canvas) canvas.style.cursor = "grabbing";
      return;
    }

    if (isDraggingPot && potDragCenter) {
      if (e.type === "touchmove") e.preventDefault();
      updatePotValueFromCoords(coords.x, coords.y, potDragCenter);
      return;
    }

    hoveredTarget = getInteractiveTarget(coords.x, coords.y);
    if (canvas) {
      canvas.style.cursor = hoveredTarget ? (hoveredTarget.cursor || "pointer") : (state.isWireMode ? "crosshair" : "default");
    }
  }

  function handleCanvasPointerUp(e) {
    if (state.wireDrawing && state.wireDrawing.active) {
      const coords = (e ? getCanvasCoords(e) : null) || { x: state.wireDrawing.curX, y: state.wireDrawing.curY };
      const target = getInteractiveTarget(coords.x, coords.y);
      if (target && target.id === "pin" && target.name !== state.wireDrawing.startPin) {
        const endPin = target.name || target.pinKey;
        const newWire = {
          id: "w_usr_" + Date.now(),
          from: state.wireDrawing.startPin,
          to: endPin,
          sx: state.wireDrawing.sx,
          sy: state.wireDrawing.sy,
          ex: target.x,
          ey: target.y,
          color: state.wireDrawing.color || state.activeWireColor || "#ef4444",
          label: `${state.wireDrawing.startPin} ➔ ${endPin}`
        };
        state.wires.push(newWire);
        audio.playTactileClick(true);
        addSerialLog(`Connected wire: ${newWire.label} [${newWire.color}]`);
        updateWireCountBadge();
      }
      state.wireDrawing.active = false;
    }

    if (state.isDraggingComp) {
      const comp = state.components.customPlacedComponents ? state.components.customPlacedComponents[state.draggedCompIndex] : null;
      state.isDraggingComp = false;
      state.draggedCompIndex = -1;
      if (comp) {
        audio.playTactileClick(false);
        addSerialLog(`Dropped ${comp.label} at breadboard slot (${Math.round(comp.x)}, ${Math.round(comp.y)})`);
        renderCustomChips();
      }
      if (canvas) canvas.style.cursor = state.isWireMode ? "crosshair" : "default";
      return;
    }

    if (activeCanvasButton) {
      handleButtonUp();
      activeCanvasButton = false;
    }
    isDraggingPot = false;
    potDragCenter = null;
  }

  function handleCanvasPointerLeave() {
    if (state.wireDrawing && state.wireDrawing.active) {
      state.wireDrawing.active = false;
    }
    if (state.isDraggingComp) {
      state.isDraggingComp = false;
      state.draggedCompIndex = -1;
    }
    if (activeCanvasButton) {
      handleButtonUp();
      activeCanvasButton = false;
    }
    isDraggingPot = false;
    potDragCenter = null;
    hoveredTarget = null;
    if (canvas) canvas.style.cursor = state.isWireMode ? "crosshair" : "default";
  }

  if (canvas) {
    canvas.addEventListener("mousedown", handleCanvasPointerDown);
    canvas.addEventListener("mousemove", handleCanvasPointerMove);
    canvas.addEventListener("mouseup", handleCanvasPointerUp);
    canvas.addEventListener("mouseleave", handleCanvasPointerLeave);
    canvas.addEventListener("touchstart", handleCanvasPointerDown, { passive: false });
    canvas.addEventListener("touchmove", handleCanvasPointerMove, { passive: false });
    canvas.addEventListener("touchend", handleCanvasPointerUp, { passive: false });
    canvas.addEventListener("touchcancel", handleCanvasPointerLeave, { passive: false });
  }

  // -------------------------------------------------------------------------
  // 60 FPS Canvas Rendering & Physics Engine
  // -------------------------------------------------------------------------
  function renderLoop(timestamp) {
    if (canvas && !canvas.isConnected) {
      cleanup();
      return;
    }
    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
    lastFrameTime = timestamp;

    if (state.isRunning) {
      const stepMs = dt * 1000 * state.simSpeed;
      state.simTimeMs += stepMs;
      loopTimer += stepMs;

      // Update simulation logic based on active experiment
      updateSimulationLogic(stepMs);
    }

    // Render Canvas Visuals
    drawArduinoWorkbench();

    // Render Oscilloscope Plotter if active
    if (state.activeTab === "plotter") {
      drawPlotterWaveforms();
    }

    // Update HUD telemetry
    if (hudSimTime) hudSimTime.textContent = `T = ${(state.simTimeMs / 1000).toFixed(2)}s`;

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Probe voltage evaluator for DSO channels
  function getProbeVoltage(probeId, t) {
    switch (probeId) {
      case "pin13": return state.components.pin13Led ? 5.0 : 0.0;
      case "pwm9": {
        const duty = (state.components.pin9Pwm || 0) / 255;
        const inst = ((t * 0.490) % 1.0) < duty ? 5.0 : 0.0;
        return duty > 0 ? (inst > 0 ? 5.0 : 0.0) : 0.0;
      }
      case "motor": {
        const baseV = ((state.components.motorSpeed || 0) / 255) * 5.0;
        const ripple = state.components.motorSpeed > 0 ? (Math.sin(t * 0.08) * 0.15) : 0;
        return Math.max(0, Math.min(5.0, baseV + ripple));
      }
      case "buzzer": {
        const tone = state.components.buzzerTone || (state.components.pin13Led ? 440 : 0);
        return tone > 0 ? (Math.sin(t * 0.001 * tone * 2 * Math.PI) > 0 ? 5.0 : 0.0) : 0.0;
      }
      case "relay": return state.components.relayActive ? 5.0 : 0.0;
      case "pin11": return state.components.pin11Led ? 5.0 : 0.0;
      case "pot": return ((state.components.potValue || 0) / 1023) * 5.0;
      case "ldr": return Math.min(5.0, ((state.components.ldrLux || 0) / 1000) * 5.0);
      case "temp": return Math.min(5.0, Math.max(0.0, ((state.components.temperatureC || 20) * 0.01) + 0.5));
      case "dist": return Math.min(5.0, ((state.components.obstacleDistCm || 0) / 100) * 5.0);
      case "dht11": {
        // DHT11 1-wire communication frame (idle high at 5V with periodic digital bursts)
        const inBurst = (t % 1200) < 60;
        return inBurst ? (((t % 6) < 3) ? 0.2 : 4.8) : 5.0;
      }
      case "bme280": {
        // I2C 3.3V clock/data bus activity bursts
        const inI2c = (t % 600) < 40;
        return inI2c ? (((t % 4) < 2) ? 0.3 : 3.3) : 3.3;
      }
      case "stepper": {
        // 4-Phase Stepper driver pulse train (0V to 5V)
        const stepRate = 25; // 25 Hz
        const stepState = Math.floor((t * 0.001 * stepRate) % 4);
        return (stepState === 0 || stepState === 2) ? 5.0 : 0.0;
      }
      default: return 0.0;
    }
  }

  // Logic Simulation for current experiment
  function updateSimulationLogic(stepMs) {
    const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex].id;
    const t = state.simTimeMs;

    // Custom in-browser sketch execution loop
    if (state.isCustomSketchActive && state.customSketch) {
      state.customSketchTimer = (state.customSketchTimer || 0) + stepMs;
      const cycleMs = state.customSketch.totalCycleMs || 1000;
      const modT = state.customSketchTimer % cycleMs;
      const src = state.customSketch.source || "";

      // 1. Digital LED Blink parsing
      if (/digitalWrite\s*\(\s*(13|LED_BUILTIN)\s*,\s*HIGH\s*\)/.test(src)) {
        const delays = state.customSketch.delays || [500, 500];
        const highDur = delays[0] || (cycleMs / 2);
        state.components.pin13Led = (modT < highDur);
      }

      // 2. PWM & Motor parsing
      const pwmMatch = src.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (pwmMatch) {
        const pin = parseInt(pwmMatch[1], 10);
        const val = parseInt(pwmMatch[2], 10);
        if (pin === 9 || pin === 10 || pin === 11) state.components.pin9Pwm = val;
        else if (pin === 5 || pin === 6 || pin === 3) state.components.motorSpeed = val;
      }

      // 3. Tone parsing
      const toneMatch = src.match(/tone\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (toneMatch) {
        const freq = parseInt(toneMatch[2], 10) || 440;
        state.components.buzzerTone = freq;
        if (Math.floor(t / 250) % 2 === 0) audio.playTone(freq, 60);
      }

      // 4. Relay parsing
      if (/digitalWrite\s*\(\s*4\s*,\s*HIGH\s*\)/.test(src)) {
        state.components.relayActive = true;
      } else if (/digitalWrite\s*\(\s*4\s*,\s*LOW\s*\)/.test(src)) {
        state.components.relayActive = false;
      }

      // 5. Pot/Analog reads
      if (/analogRead\s*\(\s*A0\s*\)/.test(src) && /analogWrite\s*\(\s*9/.test(src)) {
        state.components.pin9Pwm = Math.round((state.components.potValue / 1023) * 255);
      }
    }

    if (expId === "traffic_light") {
      // Traffic Light State Machine
      const cycleTime = 8000;
      const modT = t % cycleTime;
      if (state.components.buttonPressed || modT > 6000) {
        state.components.pin11Led = false; // Green OFF
        state.components.pin12Led = false; // Yellow OFF
        state.components.pin13Led = true;  // Red ON
        // Warning beeps
        if (Math.floor(t / 250) % 2 === 0) {
          audio.playTone(880, 80);
        }
      } else if (modT > 4500) {
        state.components.pin11Led = false; // Green OFF
        state.components.pin12Led = true;  // Yellow ON
        state.components.pin13Led = false; // Red OFF
      } else {
        state.components.pin11Led = true;  // Green ON
        state.components.pin12Led = false; // Yellow OFF
        state.components.pin13Led = false; // Red OFF
      }
    } else if (expId === "ultrasonic_radar") {
      // Sonar Proximity Alert
      const dist = state.components.obstacleDistCm;
      if (dist < 15.0) {
        state.components.pin13Led = true;
        if (Math.floor(t / 140) % 2 === 0) audio.playTone(1200, 60);
      } else if (dist < 40.0) {
        state.components.pin13Led = (Math.floor(t / 250) % 2 === 0);
        if (Math.floor(t / 400) % 2 === 0) audio.playTone(750, 80);
      } else {
        state.components.pin13Led = false;
      }
    } else if (expId === "ldr_nightlight") {
      // Light sensor threshold
      const thresh = state.components.potValue;
      const light = state.components.ldrLux;
      if (light < thresh) {
        const duty = Math.min(255, Math.max(0, Math.floor(((thresh - light) / thresh) * 255)));
        state.components.pin9Pwm = duty;
      } else {
        state.components.pin9Pwm = 0;
      }
    } else if (expId === "servo_control") {
      // Servo angle mapped from pot
      const targetAngle = Math.round((state.components.potValue / 1023) * 180);
      state.components.servoAngle = targetAngle;
      // Smooth servo sweep
      const diff = targetAngle - state.components.currentServoAngle;
      if (Math.abs(diff) > 0.5) {
        state.components.currentServoAngle += diff * 0.15;
        audio.playServoWhine(targetAngle, state.components.currentServoAngle);
      }
    } else if (expId === "chiptune_melody") {
      // 8-bit melody progression
      const notes = [262, 294, 330, 349, 392, 440, 494, 523, 659, 784];
      const noteIdx = Math.floor(t / 300) % notes.length;
      state.components.pin13Led = (Math.floor(t / 150) % 2 === 0);
      if (Math.floor(t / 300) !== Math.floor((t - stepMs) / 300)) {
        audio.playTone(notes[noteIdx], 180);
      }
    } else if (expId === "weather_station") {
      const temp = state.components.temperatureC;
      state.components.lcdLines[0] = `TEMP: ${temp.toFixed(1)} C`;
      if (temp >= 32.0) {
        state.components.lcdLines[1] = "ALARM: OVERHEAT!";
        state.components.pin13Led = true;
        if (Math.floor(t / 250) % 2 === 0) audio.playTone(1050, 100);
      } else {
        state.components.lcdLines[1] = "STATUS: NORMAL";
        state.components.pin13Led = false;
      }
    } else if (expId === "rgb_mood_lamp") {
      // 7. Interactive RGB Mood Lamp: Pot cycles through Hue wheel 0-360
      const hue = (state.components.potValue / 1023) * 360;
      const c = 1.0;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      let r1 = 0, g1 = 0, b1 = 0;
      if (hue < 60) { r1 = c; g1 = x; b1 = 0; }
      else if (hue < 120) { r1 = x; g1 = c; b1 = 0; }
      else if (hue < 180) { r1 = 0; g1 = c; b1 = x; }
      else if (hue < 240) { r1 = 0; g1 = x; b1 = c; }
      else if (hue < 300) { r1 = x; g1 = 0; b1 = c; }
      else { r1 = c; g1 = 0; b1 = x; }
      const r = Math.round(r1 * 255);
      const g = Math.round(g1 * 255);
      const b = Math.round(b1 * 255);
      state.components.rgbColor = { r, g, b };
      state.components.pin9Pwm = r;
      state.components.pin11Led = g > 120;
      state.components.pin12Led = b > 120;
      if (valRgbHex) {
        const hex = `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
        valRgbHex.textContent = hex.toUpperCase();
      }
    } else if (expId === "dc_motor_speed") {
      // 8. PWM DC Motor Fan: mapped from Potentiometer
      const targetSpeed = Math.floor((state.components.potValue / 1023) * 255);
      state.components.motorSpeed = targetSpeed;
      if (sliderMotor) sliderMotor.value = targetSpeed;
      const rpm = Math.round((targetSpeed / 255) * 4800);
      if (valMotor) valMotor.textContent = `${targetSpeed} PWM (${rpm} RPM)`;
      // Spin propeller
      state.components.currentMotorAngle += (targetSpeed / 255) * (stepMs / 1000) * 35;
      audio.setMotorWhine(targetSpeed / 255);
    } else if (expId === "pir_alarm") {
      // 9. PIR Motion Intruder Security Alarm
      if (state.components.pirMotionDetected) {
        state.components.pin13Led = (Math.floor(t / 120) % 2 === 0);
        state.components.relayActive = true;
        if (Math.floor(t / 220) % 2 === 0) {
          audio.playTone(1350, 90);
        }
      } else {
        state.components.pin13Led = false;
        state.components.relayActive = false;
      }
    } else if (expId === "seven_seg_counter") {
      // 10. Digital 7-Segment Decade Counter
      if (state.components.buttonPressed) {
        state.components.sevenSegDigit = 0;
      } else {
        const digit = Math.floor(t / 1000) % 10;
        state.components.sevenSegDigit = digit;
      }
      if (btnSevensegStep) btnSevensegStep.textContent = `🔢 Step 7-Seg: ${state.components.sevenSegDigit}`;
    } else if (expId === "joystick_pan_tilt") {
      // 11. 2-Axis Thumbstick & Servo Pan-Tilt
      const joyX = state.components.potValue; // 0 - 1023
      const targetAngle = Math.round((joyX / 1023) * 180);
      state.components.servoAngle = targetAngle;
      const diff = targetAngle - state.components.currentServoAngle;
      if (Math.abs(diff) > 0.5) {
        state.components.currentServoAngle += diff * 0.18;
        audio.playServoWhine(targetAngle, state.components.currentServoAngle);
      }
      state.components.pin13Led = state.components.buttonPressed;
    } else if (expId === "button_toggle") {
      // 5. Digital Pushbutton Toggle & Debounce Counter
      if (state.components.buttonPressed && !state.components.lastButtonState) {
        state.components.buttonToggleState = !state.components.buttonToggleState;
        state.components.buttonPressCount = (state.components.buttonPressCount || 0) + 1;
        state.components.pin13Led = state.components.buttonToggleState;
        audio.playTactileClick(state.components.buttonToggleState);
        addSerialLog(`[DEBOUNCE] Press Event #${state.components.buttonPressCount} -> LED: ${state.components.buttonToggleState ? "HIGH (ON)" : "LOW (OFF)"}`);
      }
      state.components.lastButtonState = state.components.buttonPressed;
      state.components.pin13Led = state.components.buttonToggleState;
    } else if (expId === "sonar_lcd_scope") {
      // 13. Ultrasonic Radar Rangefinder & 16x2 LCD Radar Scope
      const dist = state.components.obstacleDistCm;
      const barLen = Math.max(1, Math.min(10, Math.round(dist / 4)));
      const barStr = "#".repeat(barLen).padEnd(10, ".");
      state.components.lcdLines[0] = `DIST: ${dist.toFixed(1)} cm`.padEnd(16, " ");
      state.components.lcdLines[1] = `RAD: [${barStr}] ${dist < 20 ? "!!" : "OK"}`.padEnd(16, " ");
      if (dist < 20.0) {
        state.components.pin13Led = (Math.floor(t / 150) % 2 === 0);
        if (Math.floor(t / 200) % 2 === 0) audio.playTone(1100, 70);
      } else {
        state.components.pin13Led = false;
      }
    } else if (expId === "thermostat_relay_fan") {
      // 14. Smart Thermostatic Relay Cooling Station
      const setpointC = 20.0 + (state.components.potValue / 1023) * 30.0;
      const curTemp = state.components.temperatureC;
      const overheat = curTemp >= setpointC;
      state.components.relayActive = overheat;
      state.components.pin13Led = overheat;
      if (overheat) {
        const speed = Math.min(255, 160 + Math.floor(((curTemp - setpointC) / 10.0) * 95));
        state.components.motorSpeed = speed;
        state.components.currentMotorAngle += (speed / 255) * (stepMs / 1000) * 40;
        audio.setMotorWhine(speed / 255);
      } else {
        state.components.motorSpeed = 0;
        audio.setMotorWhine(0);
      }
    } else if (expId === "multi_sensor_alarm") {
      // 15. Autonomous Multi-Sensor Annunciator Hub
      const isNight = state.components.ldrLux < 350;
      const motion = state.components.pirMotionDetected;
      if (motion && isNight) {
        state.components.relayActive = true;
        state.components.pin13Led = (Math.floor(t / 100) % 2 === 0);
        if (Math.floor(t / 200) % 2 === 0) audio.playTone(1450, 80);
      } else if (motion) {
        state.components.relayActive = false;
        state.components.pin13Led = true;
        if (Math.floor(t / 500) % 2 === 0) audio.playTone(800, 50);
      } else {
        state.components.relayActive = false;
        state.components.pin13Led = false;
      }
    } else if (expId === "custom_sandbox") {
      // 12. Freeform Custom Breadboard Sandbox
      state.components.pin13Led = (Math.floor(t / 1000) % 2 === 0);
      if (state.components.motorSpeed > 0) {
        state.components.currentMotorAngle += (state.components.motorSpeed / 255) * (stepMs / 1000) * 30;
      }
    }

    // Buffer waveform points for plotter & DSO
    if (!state.dso || !state.dso.isFrozen) {
      if (state.waveformPoints.length > 250) state.waveformPoints.shift();
      const ch1V = getProbeVoltage(state.dso?.ch1Probe || "pin13", t);
      const ch2V = getProbeVoltage(state.dso?.ch2Probe || "pot", t);
      state.waveformPoints.push({
        time: t,
        ch1: ch1V,
        ch2: ch2V,
        pot: state.components.potValue,
        dist: state.components.obstacleDistCm,
        ldr: state.components.ldrLux,
        temp: state.components.temperatureC,
        pin13: state.components.pin13Led,
        pwm: state.components.pin9Pwm
      });
    }
  }

  // -------------------------------------------------------------------------
  // Canvas Rendering Function: Arduino Uno & Breadboard Apparatus
  // -------------------------------------------------------------------------
  function drawArduinoWorkbench() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Dark Workbench Bench Mat Background
    ctx.fillStyle = "#070c18";
    ctx.fillRect(0, 0, w, h);

    // Antistatic grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Draw Realistic Arduino Uno R3 Board on Left (x: 40, y: 55, w: 340, h: 350)
    drawArduinoBoard(ctx, 40, 55, 340, 350);

    // 3. Draw Solderless Breadboard on Right (x: 420, y: 55, w: 390, h: 350)
    drawBreadboard(ctx, 420, 55, 390, 350);

    // 4. Draw Connecting Jumper Wires
    drawJumperWires(ctx);

    // 5. Draw Canvas Interactive Hover Highlights & Component Tooltips
    drawCanvasInteractions(ctx);
  }

  // Render Canvas Hover Feedback & Interactive Cues
  function drawCanvasInteractions(c) {
    if (!c) return;

    // Visual reticle & snapping badge while actively dragging a breadboard component
    if (state.isDraggingComp && state.draggedCompIndex >= 0) {
      const comp = state.components.customPlacedComponents ? state.components.customPlacedComponents[state.draggedCompIndex] : null;
      if (comp) {
        const cx = 420 + comp.x;
        const cy = 55 + comp.y;
        const colNum = Math.round((comp.x - 35) / 12.5) + 1;

        // Snapping reticle crosshair
        c.save();
        c.strokeStyle = "#06b6d4";
        c.lineWidth = 1.5;
        c.setLineDash([4, 2]);
        c.beginPath();
        c.moveTo(cx - 36, cy);
        c.lineTo(cx + 36, cy);
        c.moveTo(cx, cy - 36);
        c.lineTo(cx, cy + 36);
        c.stroke();

        // Dragging HUD badge
        const dragTip = `🎯 Relocating ${comp.label} · Tie-Point Col ${Math.max(1, Math.min(26, colNum))}`;
        c.font = "bold 11px system-ui, -apple-system, sans-serif";
        const dtw = c.measureText(dragTip).width;
        c.fillStyle = "rgba(6, 182, 212, 0.95)";
        c.shadowColor = "rgba(0,0,0,0.8)";
        c.shadowBlur = 10;
        c.beginPath();
        c.roundRect(cx - dtw / 2 - 12, cy - 46, dtw + 24, 24, [6, 6, 6, 6]);
        c.fill();
        c.fillStyle = "#020617";
        c.fillText(dragTip, cx - dtw / 2, cy - 30);
        c.restore();
        return;
      }
    }

    if (!hoveredTarget) return;

    c.save();
    // Pulse animation
    const pulse = 0.5 + 0.5 * Math.sin(state.simTimeMs * 0.008);
    c.strokeStyle = `rgba(56, 189, 248, ${0.4 + 0.5 * pulse})`;
    c.lineWidth = 2;
    c.setLineDash([4, 3]);

    if (hoveredTarget.circle) {
      c.beginPath();
      c.arc(hoveredTarget.circle.x, hoveredTarget.circle.y, hoveredTarget.circle.r + 4, 0, Math.PI * 2);
      c.stroke();
    } else if (hoveredTarget.box) {
      c.beginPath();
      const b = hoveredTarget.box;
      c.roundRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6, [6, 6, 6, 6]);
      c.stroke();
    }
    c.restore();

    // Floating Tooltip Badge near cursor/target
    c.save();
    const tipText = `👆 ${hoveredTarget.label}`;
    c.font = "bold 11px system-ui, -apple-system, sans-serif";
    const tw = c.measureText(tipText).width;
    const badgeW = tw + 22;
    const badgeH = 24;
    let badgeX = hoveredTarget.center.x - badgeW / 2;
    let badgeY = hoveredTarget.center.y - (hoveredTarget.box ? hoveredTarget.box.h / 2 + 28 : 34);

    if (badgeX < 10) badgeX = 10;
    if (badgeX + badgeW > (canvas ? canvas.width : 850) - 10) badgeX = (canvas ? canvas.width : 850) - badgeW - 10;
    if (badgeY < 10) badgeY = hoveredTarget.center.y + 30;

    c.fillStyle = "rgba(5, 8, 17, 0.92)";
    c.strokeStyle = "#38bdf8";
    c.lineWidth = 1.2;
    c.shadowColor = "rgba(0, 0, 0, 0.75)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(badgeX, badgeY, badgeW, badgeH, [5, 5, 5, 5]);
    c.fill();
    c.stroke();

    c.fillStyle = "#38bdf8";
    c.fillText(tipText, badgeX + 11, badgeY + 16);
    c.restore();
  }

  // Render Photorealistic Arduino Uno R3 PCB
  function drawArduinoBoard(c, x, y, bw, bh) {
    // PCB drop shadow
    c.shadowColor = "rgba(0, 0, 0, 0.75)";
    c.shadowBlur = 18;
    c.shadowOffsetX = 4;
    c.shadowOffsetY = 6;

    // Classic Arduino Teal/Cyan PCB Matte Coating
    const pcbGrad = c.createLinearGradient(x, y, x + bw, y + bh);
    pcbGrad.addColorStop(0, "#00878a");
    pcbGrad.addColorStop(1, "#006266");
    c.fillStyle = pcbGrad;

    // Rounded PCB outline with Uno notched corner
    c.beginPath();
    c.roundRect(x, y, bw, bh, [14, 14, 14, 14]);
    c.fill();
    c.shadowColor = "transparent";

    // PCB Border Rim
    c.strokeStyle = "rgba(255, 255, 255, 0.2)";
    c.lineWidth = 1.5;
    c.stroke();

    // Gold Plated Mounting Holes (4 holes)
    const holes = [
      [x + 18, y + 55],
      [x + 18, y + bh - 18],
      [x + bw - 18, y + 25],
      [x + bw - 18, y + bh - 60]
    ];
    holes.forEach(([hx, hy]) => {
      c.fillStyle = "#d97706"; // Gold ring
      c.beginPath();
      c.arc(hx, hy, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#050811"; // Center drill hole
      c.beginPath();
      c.arc(hx, hy, 4, 0, Math.PI * 2);
      c.fill();
    });

    // USB Type-B Port (Metal Silver Gradient at top left)
    const usbGrad = c.createLinearGradient(x + 10, y - 8, x + 65, y + 38);
    usbGrad.addColorStop(0, "#e2e8f0");
    usbGrad.addColorStop(0.5, "#94a3b8");
    usbGrad.addColorStop(1, "#64748b");
    c.fillStyle = usbGrad;
    c.beginPath();
    c.roundRect(x + 10, y - 10, 55, 48, [4, 4, 4, 4]);
    c.fill();
    c.strokeStyle = "#475569";
    c.stroke();

    // DC Barrel Power Jack at bottom left
    c.fillStyle = "#1e293b";
    c.beginPath();
    c.roundRect(x + 10, y + bh - 58, 48, 55, [4, 4, 4, 4]);
    c.fill();
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(x + 34, y + bh - 30, 8, 0, Math.PI * 2);
    c.fill();

    // ATmega328P DIP-28 Microcontroller IC (Big black chip in middle)
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.roundRect(x + 120, y + 150, 155, 52, [4, 4, 4, 4]);
    c.fill();
    c.strokeStyle = "#334155";
    c.stroke();

    // IC Pins (14 top, 14 bottom)
    c.fillStyle = "#94a3b8";
    for (let p = 0; p < 14; p++) {
      c.fillRect(x + 125 + p * 10.5, y + 145, 5, 5);
      c.fillRect(x + 125 + p * 10.5, y + 202, 5, 5);
    }
    // Notch on IC
    c.fillStyle = "#1e293b";
    c.beginPath();
    c.arc(x + 120, y + 176, 5, -Math.PI / 2, Math.PI / 2);
    c.fill();

    // Microcontroller Text
    c.fillStyle = "#64748b";
    c.font = "bold 9px monospace";
    c.fillText("ATMEL ATMEGA328P-PU", x + 130, y + 180);

    // 16.000 MHz Crystal Oscillator (Silver metal oval)
    c.fillStyle = "#cbd5e1";
    c.beginPath();
    c.roundRect(x + 85, y + 160, 24, 34, [6, 6, 6, 6]);
    c.fill();
    c.strokeStyle = "#94a3b8";
    c.stroke();
    c.fillStyle = "#475569";
    c.font = "8px sans-serif";
    c.fillText("16.0", x + 87, y + 180);

    // Arduino Board Silkscreen Text
    c.fillStyle = "#f8fafc";
    c.font = "bold 13px 'Trebuchet MS', sans-serif";
    c.fillText("ARDUINO", x + 130, y + 75);
    c.fillStyle = "#38bdf8";
    c.font = "bold 10px sans-serif";
    c.fillText("UNO R3", x + 195, y + 75);

    // Infinity Loop Logo
    c.strokeStyle = "#ffffff";
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(x + 140, y + 100, 7, 0, Math.PI * 2);
    c.arc(x + 154, y + 100, 7, 0, Math.PI * 2);
    c.stroke();

    // Physical Reset Button (Red button on top edge)
    c.fillStyle = "#dc2626";
    c.beginPath();
    c.arc(x + 85, y + 35, 7, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = "#ffffff";
    c.font = "bold 7px sans-serif";
    c.fillText("RESET", x + 74, y + 52);

    // Status LEDs: ON, L (Pin 13), TX, RX
    // 1. Power LED (Green)
    drawLedBulb(c, x + 130, y + 125, "#10b981", state.components.powerLed, "ON");

    // 2. Pin 13 "L" LED (Yellow/Amber)
    const pin13Active = state.components.pin13Led || (state.components.pin9Pwm > 10);
    drawLedBulb(c, x + 155, y + 125, "#f59e0b", pin13Active, "L");

    // 3. TX & RX LEDs
    drawLedBulb(c, x + 180, y + 125, "#f59e0b", state.components.txLed, "TX");
    drawLedBulb(c, x + 205, y + 125, "#f59e0b", state.components.rxLed, "RX");

    // Digital Pin Headers across top (D0 - D13, GND, AREF)
    c.fillStyle = "#0f172a";
    c.fillRect(x + 100, y + 12, 220, 16);
    c.fillStyle = "#475569";
    for (let i = 0; i < 16; i++) {
      c.fillRect(x + 104 + i * 13.5, y + 16, 7, 8);
    }
    c.fillStyle = "#cbd5e1";
    c.font = "8px monospace";
    c.fillText("DIGITAL (PWM ~)", x + 160, y + 36);

    // Power & Analog Pin Headers across bottom (IOREF, 3.3V, 5V, GND, VIN, A0 - A5)
    c.fillStyle = "#0f172a";
    c.fillRect(x + 110, y + bh - 28, 210, 16);
    c.fillStyle = "#475569";
    for (let i = 0; i < 14; i++) {
      c.fillRect(x + 114 + i * 14.5, y + bh - 24, 7, 8);
    }
    c.fillStyle = "#cbd5e1";
    c.font = "8px monospace";
    c.fillText("POWER", x + 120, y + bh - 32);
    c.fillText("ANALOG IN", x + 235, y + bh - 32);
  }

  // Draw realistic LED bulb on Arduino or breadboard
  function drawLedBulb(c, lx, ly, color, isActive, label = "") {
    c.save();
    c.beginPath();
    c.arc(lx, ly, 4, 0, Math.PI * 2);
    if (isActive) {
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 12;
      c.fill();
    } else {
      c.fillStyle = "rgba(100, 116, 139, 0.4)";
      c.fill();
    }
    c.restore();

    if (label) {
      c.fillStyle = "#94a3b8";
      c.font = "7px sans-serif";
      c.fillText(label, lx - 4, ly + 12);
    }
  }

  // 1. Draw Vertical 1/4W Through-Hole Resistor bridging two Y coordinates with EIA 4-Band Color Code
  function drawVerticalResistor(c, rx, yTop, yBot, ohms = 220, label = "220Ω") {
    c.save();
    // Metal Leads extending out of ends into breadboard holes
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(rx, yTop);
    c.lineTo(rx, yBot);
    c.stroke();

    // Pin insertion points
    c.fillStyle = "#334155";
    c.fillRect(rx - 1.5, yTop - 1.5, 3, 3);
    c.fillRect(rx - 1.5, yBot - 1.5, 3, 3);

    // Resistor Ceramic Body
    const bodyH = Math.min(16, Math.abs(yBot - yTop) * 0.65);
    const bodyW = 6.5;
    const cy = (yTop + yBot) / 2;

    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowBlur = 4;
    c.shadowOffsetX = 1;
    c.shadowOffsetY = 1;

    const grad = c.createLinearGradient(rx - bodyW / 2, cy, rx + bodyW / 2, cy);
    grad.addColorStop(0, "#e8d7be");
    grad.addColorStop(0.5, "#d4b896");
    grad.addColorStop(1, "#9e7f5e");
    c.fillStyle = grad;

    c.beginPath();
    c.roundRect(rx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, [2, 2, 2, 2]);
    c.fill();
    c.shadowColor = "transparent";

    // EIA 4-Band Colors for 220Ω (Red, Red, Brown, Gold)
    let bands = ["#dc2626", "#dc2626", "#78350f", "#d97706"];
    if (ohms >= 10000) bands = ["#78350f", "#0f172a", "#f97316", "#d97706"];
    else if (ohms >= 1000) bands = ["#78350f", "#0f172a", "#dc2626", "#d97706"];

    const bandSpacing = bodyH / 5;
    bands.forEach((bColor, idx) => {
      c.fillStyle = bColor;
      const by = cy - bodyH / 2 + (idx + 1) * bandSpacing - 1;
      c.fillRect(rx - bodyW / 2, by, bodyW, 1.5);
    });

    // Specular shine
    c.fillStyle = "rgba(255, 255, 255, 0.4)";
    c.fillRect(rx - bodyW / 2 + 1, cy - bodyH / 2, 1.5, bodyH);

    if (label) {
      c.fillStyle = "#475569";
      c.font = "bold 7px monospace";
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.fillText(label, rx + bodyW / 2 + 2, cy);
    }
    c.restore();
  }

  // 2. Draw Solid-Core Insulated Wire Link on Breadboard
  function drawBreadboardWireLink(c, x1, y1, x2, y2, color = "#0f172a", label = "") {
    c.save();
    // Metal pin insertion terminals
    c.fillStyle = "#64748b";
    c.fillRect(x1 - 1.5, y1 - 2, 3, 4);
    c.fillRect(x2 - 1.5, y2 - 2, 3, 4);

    // Wire shadow
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.lineWidth = 3;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();

    // Insulated jacket
    c.strokeStyle = color;
    c.lineWidth = 2.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();

    // Specular highlight
    c.strokeStyle = "rgba(255, 255, 255, 0.4)";
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(x1 + 0.4, y1);
    c.lineTo(x2 + 0.4, y2);
    c.stroke();

    if (label) {
      c.fillStyle = "#64748b";
      c.font = "bold 7px monospace";
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.fillText(label, Math.max(x1, x2) + 3, (y1 + y2) / 2);
    }
    c.restore();
  }

  // Render Solderless Half-Size Breadboard with Interactive Components
  function drawBreadboard(c, bx, by, bw, bh) {
    // Breadboard body
    c.save();
    c.fillStyle = "#f8fafc";
    c.shadowColor = "rgba(0,0,0,0.55)";
    c.shadowBlur = 14;
    c.shadowOffsetX = 3;
    c.shadowOffsetY = 4;
    c.beginPath();
    c.roundRect(bx, by, bw, bh, [10, 10, 10, 10]);
    c.fill();
    c.restore();

    // Subtle border
    c.strokeStyle = "#cbd5e1";
    c.lineWidth = 1;
    c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

    // Central trough divider with internal shadow
    const troughGrad = c.createLinearGradient(bx, by + bh / 2 - 6, bx, by + bh / 2 + 6);
    troughGrad.addColorStop(0, "#cbd5e1");
    troughGrad.addColorStop(0.5, "#e2e8f0");
    troughGrad.addColorStop(1, "#cbd5e1");
    c.fillStyle = troughGrad;
    c.fillRect(bx + 15, by + bh / 2 - 6, bw - 30, 12);

    // Power Rails: Red (+) and Blue (-) lines
    c.save();
    c.strokeStyle = "#ef4444";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(bx + 20, by + 18);
    c.lineTo(bx + bw - 20, by + 18);
    c.moveTo(bx + 20, by + bh - 18);
    c.lineTo(bx + bw - 20, by + bh - 18);
    c.stroke();

    c.strokeStyle = "#3b82f6";
    c.beginPath();
    c.moveTo(bx + 20, by + 30);
    c.lineTo(bx + bw - 20, by + 30);
    c.moveTo(bx + 20, by + bh - 30);
    c.lineTo(bx + bw - 20, by + bh - 30);
    c.stroke();

    // Rail Polarity Markings (+) and (−)
    c.font = "bold 9px monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#ef4444";
    c.fillText("+", bx + 12, by + 18);
    c.fillText("+", bx + bw - 11, by + 18);
    c.fillText("+", bx + 12, by + bh - 18);
    c.fillText("+", bx + bw - 11, by + bh - 18);

    c.fillStyle = "#3b82f6";
    c.fillText("−", bx + 12, by + 30);
    c.fillText("−", bx + bw - 11, by + 30);
    c.fillText("−", bx + 12, by + bh - 30);
    c.fillText("−", bx + bw - 11, by + bh - 30);
    c.restore();

    // Active power bus illumination
    const isTop5VActive = state.wires?.some(w => w.to === "BB_TOP_5V");
    const isTopGndActive = state.wires?.some(w => w.to === "BB_TOP_GND");
    if (isTop5VActive) {
      c.save();
      c.strokeStyle = "rgba(239, 68, 68, 0.35)";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(bx + 20, by + 18);
      c.lineTo(bx + bw - 20, by + 18);
      c.stroke();
      c.restore();
    }
    if (isTopGndActive) {
      c.save();
      c.strokeStyle = "rgba(59, 130, 246, 0.3)";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(bx + 20, by + 30);
      c.lineTo(bx + bw - 20, by + 30);
      c.stroke();
      c.restore();
    }

    // Tie-point row holes (grid matrix with spring contact clip appearance)
    for (let col = 0; col < 26; col++) {
      const hx = bx + 35 + col * 12.5;

      // Column numbers (1, 5, 10, 15, 20, 25)
      if (col === 0 || col === 4 || col === 9 || col === 14 || col === 19 || col === 24) {
        c.save();
        c.font = "bold 7px monospace";
        c.fillStyle = "#94a3b8";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(`${col + 1}`, hx + 1.5, by + 40);
        c.fillText(`${col + 1}`, hx + 1.5, by + bh - 39);
        c.restore();
      }

      // Power rail holes
      c.fillStyle = "#1e293b";
      c.fillRect(hx, by + 17, 3, 3);
      c.fillRect(hx, by + 29, 3, 3);
      c.fillRect(hx, by + bh - 31, 3, 3);
      c.fillRect(hx, by + bh - 19, 3, 3);

      // Top section: rows A - E
      for (let r = 0; r < 5; r++) {
        const hy = by + 46 + r * 14;
        c.fillStyle = "#1e293b";
        c.fillRect(hx, hy, 3, 3);
        c.fillStyle = "#64748b";
        c.fillRect(hx + 0.5, hy + 0.5, 1.5, 2);
      }
      // Bottom section: rows F - J
      for (let r = 0; r < 5; r++) {
        const hy = by + bh / 2 + 15 + r * 14;
        c.fillStyle = "#1e293b";
        c.fillRect(hx, hy, 3, 3);
        c.fillStyle = "#64748b";
        c.fillRect(hx + 0.5, hy + 0.5, 1.5, 2);
      }
    }

    // Row letters a..e and f..j
    c.save();
    c.font = "bold 7px monospace";
    c.fillStyle = "#94a3b8";
    c.textAlign = "center";
    c.textBaseline = "middle";
    ["a", "b", "c", "d", "e"].forEach((l, r) => {
      c.fillText(l, bx + 22, by + 47 + r * 14);
      c.fillText(l, bx + bw - 21, by + 47 + r * 14);
    });
    ["f", "g", "h", "i", "j"].forEach((l, r) => {
      c.fillText(l, bx + 22, by + bh / 2 + 16 + r * 14);
      c.fillText(l, bx + bw - 21, by + bh / 2 + 16 + r * 14);
    });
    c.restore();

    // DRAW APPARATUS ON BREADBOARD BASED ON EXPERIMENT
    const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex].id;

    if (expId === "traffic_light") {
      // 1. Current-Limiting 220Ω Resistors (Red, Red, Brown, Gold)
      // Connecting each LED's cathode tie-point (row B, y=112) directly to Top Blue GND Rail (y=85)
      drawVerticalResistor(c, bx + 71, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 131, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 191, by + 30, by + 57, 220, "220Ω");

      // 2. Ground Return Jumpers for Pushbutton and Piezo Buzzer to Top Blue GND Rail
      drawBreadboardWireLink(c, bx + 279, by + 57, bx + 279, by + 30, "#0f172a", "GND");
      drawBreadboardWireLink(c, bx + 342, by + 57, bx + 342, by + 30, "#0f172a", "GND");

      // 3. Red, Yellow, Green 5mm LEDs on breadboard with centered multi-line labels
      drawLargeLed(c, bx + 65, by + 82, "#ef4444", state.components.pin13Led, "RED (D13)\n220Ω to GND");
      drawLargeLed(c, bx + 125, by + 82, "#f59e0b", state.components.pin12Led, "YELLOW (D12)\n220Ω to GND");
      drawLargeLed(c, bx + 185, by + 82, "#10b981", state.components.pin11Led, "GREEN (D11)\n220Ω to GND");

      // 4. Tactile Pushbutton on breadboard
      drawTactileSwitch(c, bx + 247, by + 75, state.components.buttonPressed, "CROSSWALK\nD2 · PULLUP");

      // 5. Piezo Buzzer on breadboard
      drawPiezoBuzzer(c, bx + 322, by + 75, state.components.pin13Led, false, "BUZZER (D8)\nto GND");

    } else if (expId === "ultrasonic_radar") {
      // 1. HC-SR04 VCC and GND Jumpers to Breadboard Power Rails
      drawBreadboardWireLink(c, bx + 75, by + 57, bx + 75, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 135, by + 57, bx + 135, by + 30, "#0f172a", "GND");
      // HC-SR04 Ultrasonic Distance Sensor Module
      drawUltrasonicModule(c, bx + 50, by + 70, state.components.obstacleDistCm);

      // 2. 220Ω Current Limiter & Ground Return for Warning LED
      drawVerticalResistor(c, bx + 236, by + 30, by + 57, 220, "220Ω");
      drawLargeLed(c, bx + 230, by + 82, "#ef4444", state.components.pin13Led, "WARN (D13)\n220Ω to GND");

      // 3. Ground Return Jumper for Proximity Buzzer
      drawBreadboardWireLink(c, bx + 330, by + 57, bx + 330, by + 30, "#0f172a", "GND");
      drawPiezoBuzzer(c, bx + 310, by + 75, state.components.pin13Led, false, "BUZZER (D8)\nto GND");

    } else if (expId === "ldr_nightlight") {
      // 1. Photoresistor (LDR) Voltage Divider with 10kΩ Pull-Down Resistor
      drawBreadboardWireLink(c, bx + 70, by + 57, bx + 70, by + 18, "#ef4444", "5V");
      drawVerticalResistor(c, bx + 80, by + 30, by + 57, 10000, "10kΩ");
      drawLdrComponent(c, bx + 80, by + 80, state.components.ldrLux);

      // 2. Variable Brightness PWM LED with 220Ω Current Limiter
      const pwmAlpha = state.components.pin9Pwm / 255;
      drawVerticalResistor(c, bx + 186, by + 30, by + 57, 220, "220Ω");
      drawLargeLed(c, bx + 180, by + 82, "#38bdf8", pwmAlpha > 0.05, `PWM ~9 (${state.components.pin9Pwm})\n220Ω to GND`, pwmAlpha);

      // 3. Potentiometer Trim with +5V and GND Power Rails Links
      drawBreadboardWireLink(c, bx + 268, by + 57, bx + 268, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 292, by + 57, bx + 292, by + 30, "#0f172a", "GND");
      drawPotTrim(c, bx + 280, by + 75, state.components.potValue, "THRESHOLD (A0)\n5V · GND");

    } else if (expId === "servo_control") {
      // 1. SG90 Micro Servo 3-Pin Header: GND (Brown), VCC (Red), Signal (Orange)
      drawBreadboardWireLink(c, bx + 125, by + 57, bx + 125, by + 30, "#78350f", "GND");
      drawBreadboardWireLink(c, bx + 155, by + 57, bx + 155, by + 18, "#ef4444", "5V");
      drawServoMotor(c, bx + 110, by + 90, state.components.currentServoAngle);

      // 2. Potentiometer Steering with +5V and GND Rails Links
      drawBreadboardWireLink(c, bx + 268, by + 57, bx + 268, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 292, by + 57, bx + 292, by + 30, "#0f172a", "GND");
      drawPotTrim(c, bx + 280, by + 75, state.components.potValue, "STEERING (A0)\n5V · GND");

    } else if (expId === "chiptune_melody") {
      // 1. Piezo Speaker with Ground Return Link
      drawBreadboardWireLink(c, bx + 180, by + 57, bx + 180, by + 30, "#0f172a", "GND");
      drawPiezoBuzzer(c, bx + 160, by + 75, true, true, "PIEZO (D8)\nto GND");

      // 2. Tempo Strobe LED with 220Ω Current Limiter
      drawVerticalResistor(c, bx + 286, by + 30, by + 57, 220, "220Ω");
      drawLargeLed(c, bx + 280, by + 82, "#f59e0b", state.components.pin13Led, "TEMPO (D13)\n220Ω to GND");

    } else if (expId === "weather_station") {
      // 1. 16x2 Character LCD with I2C Power Links (GND & +5V)
      drawBreadboardWireLink(c, bx + 145, by + 57, bx + 145, by + 30, "#0f172a", "GND");
      drawBreadboardWireLink(c, bx + 160, by + 57, bx + 160, by + 18, "#ef4444", "5V");
      drawLcdModule(c, bx + 50, by + 50, state.components.lcdLines);

      // 2. TMP36 Precision Temperature Sensor with +5V and GND Connections
      drawBreadboardWireLink(c, bx + 300, by + 57, bx + 300, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 320, by + 57, bx + 320, by + 30, "#0f172a", "GND");
      drawTmp36Sensor(c, bx + 310, by + 80, state.components.temperatureC, "TMP36 (A1)\n5V · GND");

    } else if (expId === "rgb_mood_lamp") {
      // 1. Three 220Ω Current Limiting Resistors for Red, Green, Blue Channels
      drawVerticalResistor(c, bx + 90, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 120, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 150, by + 30, by + 57, 220, "220Ω");
      // Common Cathode Ground Return Jumper Link
      drawBreadboardWireLink(c, bx + 135, by + 57, bx + 135, by + 30, "#0f172a", "GND");
      // 4-pin RGB LED
      drawRgbLed(c, bx + 120, by + 80, state.components.rgbColor, "RGB (D9/10/11)\n220Ω x3 to GND");

      // 2. Hue Potentiometer with +5V and GND Rails Links
      drawBreadboardWireLink(c, bx + 268, by + 57, bx + 268, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 292, by + 57, bx + 292, by + 30, "#0f172a", "GND");
      drawPotTrim(c, bx + 280, by + 75, state.components.potValue, "HUE (A0)\n5V · GND");

    } else if (expId === "dc_motor_speed") {
      // 1. DC Motor with Flyback Protection & +5V Supply Link
      drawBreadboardWireLink(c, bx + 80, by + 57, bx + 80, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 120, by + 57, bx + 195, by + 57, "#38bdf8", "MOTOR-");
      drawDcMotorFan(c, bx + 100, by + 85, state.components.motorSpeed, state.components.currentMotorAngle);

      // 2. NPN Transistor / MOSFET Driver with 1kΩ Gate Resistor & Ground Return
      drawVerticalResistor(c, bx + 210, by + 30, by + 57, 1000, "1kΩ");
      drawBreadboardWireLink(c, bx + 225, by + 57, bx + 225, by + 30, "#0f172a", "GND");
      drawTransistorPackage(c, bx + 210, by + 80, "NPN DRIVER\nD5 · 1kΩ");

      // 3. Speed Throttle Potentiometer with +5V and GND Links
      drawBreadboardWireLink(c, bx + 288, by + 57, bx + 288, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 312, by + 57, bx + 312, by + 30, "#0f172a", "GND");
      drawPotTrim(c, bx + 300, by + 75, state.components.potValue, "THROTTLE (A0)\n5V · GND");

    } else if (expId === "pir_alarm") {
      // 1. HC-SR501 PIR Sensor with +5V and GND Rails Links
      drawBreadboardWireLink(c, bx + 65, by + 57, bx + 65, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 105, by + 57, bx + 105, by + 30, "#0f172a", "GND");
      drawPirSensor(c, bx + 60, by + 70, state.components.pirMotionDetected, "PIR (D7)\n5V · GND");

      // 2. Songle 5V Relay Module with +5V and GND Power Links
      drawBreadboardWireLink(c, bx + 175, by + 57, bx + 175, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 205, by + 57, bx + 205, by + 30, "#0f172a", "GND");
      drawRelayModule(c, bx + 175, by + 65, state.components.relayActive, "RELAY (D4)\n5V · GND");

      // 3. Strobe LED with 220Ω Current Limiter
      drawVerticalResistor(c, bx + 276, by + 30, by + 57, 220, "220Ω");
      drawLargeLed(c, bx + 270, by + 80, "#ef4444", state.components.pin13Led, "ALARM (D13)\n220Ω to GND");

      // 4. Piezo Siren with Ground Return Jumper
      drawBreadboardWireLink(c, bx + 355, by + 57, bx + 355, by + 30, "#0f172a", "GND");
      drawPiezoBuzzer(c, bx + 335, by + 75, state.components.pirMotionDetected, false, "SIREN (D8)\nto GND");

    } else if (expId === "seven_seg_counter") {
      // 1. Three 220Ω Current Limiting Resistors for Segments A, B, C
      drawVerticalResistor(c, bx + 90, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 130, by + 30, by + 57, 220, "220Ω");
      drawVerticalResistor(c, bx + 170, by + 30, by + 57, 220, "220Ω");
      // Common Cathode Ground Return Jumper Link
      drawBreadboardWireLink(c, bx + 150, by + 57, bx + 150, by + 30, "#0f172a", "GND");
      drawSevenSegment(c, bx + 110, by + 55, state.components.sevenSegDigit, "7-SEGMENT\n220Ω x3 to GND");

      // 2. Step Button with Ground Return Link
      drawBreadboardWireLink(c, bx + 280, by + 57, bx + 280, by + 30, "#0f172a", "GND");
      drawTactileSwitch(c, bx + 260, by + 75, state.components.buttonPressed, "STEP (D2)\nPULLUP · GND");

    } else if (expId === "joystick_pan_tilt") {
      // 1. 2-Axis Thumbstick with +5V and GND Links
      drawBreadboardWireLink(c, bx + 65, by + 57, bx + 65, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 115, by + 57, bx + 115, by + 30, "#0f172a", "GND");
      drawJoystickModule(c, bx + 75, by + 70, state.components.potValue, 512, state.components.buttonPressed, "JOYSTICK\n5V · GND");

      // 2. Pan Servo with Ground, +5V, and D9 Signal Pin
      drawBreadboardWireLink(c, bx + 225, by + 57, bx + 225, by + 30, "#78350f", "GND");
      drawBreadboardWireLink(c, bx + 255, by + 57, bx + 255, by + 18, "#ef4444", "5V");
      drawServoMotor(c, bx + 240, by + 95, state.components.currentServoAngle, "PAN SERVO (D9)\n5V · GND");

    } else if (expId === "button_toggle") {
      // 1. Tactile Pushbutton with +5V Feed & 10kΩ Pull-Down Resistor to GND
      drawBreadboardWireLink(c, bx + 104, by + 57, bx + 104, by + 18, "#ef4444", "5V");
      drawVerticalResistor(c, bx + 136, by + 30, by + 57, 10000, "10kΩ");
      drawTactileSwitch(c, bx + 120, by + 75, state.components.buttonPressed, "PUSH (D2)\n10kΩ PULL-DOWN");

      // 2. Latching Status LED with 220Ω Current Limiter to GND
      drawVerticalResistor(c, bx + 246, by + 30, by + 57, 220, "220Ω");
      drawLargeLed(c, bx + 240, by + 80, "#38bdf8", state.components.pin13Led, "TOGGLE (D13)\n220Ω to GND");

    } else if (expId === "sonar_lcd_scope") {
      // 1. 16x2 Character LCD with I2C Power Connections
      drawBreadboardWireLink(c, bx + 145, by + 57, bx + 145, by + 30, "#0f172a", "GND");
      drawBreadboardWireLink(c, bx + 160, by + 57, bx + 160, by + 18, "#ef4444", "5V");
      drawLcdModule(c, bx + 50, by + 30, state.components.lcdLines);

      // 2. HC-SR04 Ultrasonic Sensor Module
      drawBreadboardWireLink(c, bx + 75, by + 105, bx + 75, by + 73, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 130, by + 105, bx + 130, by + 85, "#0f172a", "GND");
      drawUltrasonicModule(c, bx + 75, by + 120, state.components.obstacleDistCm);

      // 3. Alert Sounder with Ground Return Link
      drawBreadboardWireLink(c, bx + 330, by + 57, bx + 330, by + 30, "#0f172a", "GND");
      drawPiezoBuzzer(c, bx + 310, by + 75, state.components.pin13Led, false, "ALERT (D13)\nto GND");

    } else if (expId === "thermostat_relay_fan") {
      // 1. TMP36 Temperature Sensor with +5V and GND Power Links
      drawBreadboardWireLink(c, bx + 50, by + 57, bx + 50, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 70, by + 57, bx + 70, by + 30, "#0f172a", "GND");
      drawTmp36Sensor(c, bx + 60, by + 80, state.components.temperatureC, "TMP36 (A0)\n5V · GND");

      // 2. Setpoint Potentiometer with +5V and GND Links
      drawBreadboardWireLink(c, bx + 130, by + 57, bx + 130, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 150, by + 57, bx + 150, by + 30, "#0f172a", "GND");
      const setpointC = (20.0 + (state.components.potValue / 1023) * 30.0).toFixed(1);
      drawPotTrim(c, bx + 140, by + 75, state.components.potValue, `SET ${setpointC}°C (A1)\n5V · GND`);

      // 3. Songle 5V Relay with Power Links
      drawBreadboardWireLink(c, bx + 210, by + 57, bx + 210, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 230, by + 57, bx + 230, by + 30, "#0f172a", "GND");
      drawRelayModule(c, bx + 220, by + 65, state.components.relayActive, "RELAY (D4)\n5V · GND");

      // 4. DC Motor Cooling Fan
      drawBreadboardWireLink(c, bx + 330, by + 57, bx + 330, by + 30, "#0f172a", "GND");
      drawDcMotorFan(c, bx + 310, by + 85, state.components.motorSpeed, state.components.currentMotorAngle);

    } else if (expId === "multi_sensor_alarm") {
      // 1. PIR Motion Sensor with +5V and GND Links
      drawBreadboardWireLink(c, bx + 55, by + 57, bx + 55, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 95, by + 57, bx + 95, by + 30, "#0f172a", "GND");
      drawPirSensor(c, bx + 60, by + 70, state.components.pirMotionDetected, "PIR (D7)\n5V · GND");

      // 2. LDR Ambient Light Sensor with +5V Link & 10kΩ Divider Resistor to GND
      drawBreadboardWireLink(c, bx + 140, by + 57, bx + 140, by + 18, "#ef4444", "5V");
      drawVerticalResistor(c, bx + 150, by + 30, by + 57, 10000, "10kΩ");
      drawLdrComponent(c, bx + 150, by + 80, state.components.ldrLux, "LDR (A0)\n10kΩ DIVIDER");

      // 3. Relay Module with +5V and GND Links
      drawBreadboardWireLink(c, bx + 220, by + 57, bx + 220, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 240, by + 57, bx + 240, by + 30, "#0f172a", "GND");
      drawRelayModule(c, bx + 230, by + 65, state.components.relayActive, "RELAY (D4)\n5V · GND");

      // 4. Security Siren with Ground Return Jumper
      drawBreadboardWireLink(c, bx + 350, by + 57, bx + 350, by + 30, "#0f172a", "GND");
      drawPiezoBuzzer(c, bx + 330, by + 75, state.components.pin13Led, false, "SIREN (D8)\nto GND");

    } else if (expId === "custom_sandbox") {
      // Custom Sandbox Ground and Power rail tie points
      drawVerticalResistor(c, bx + 226, by + 30, by + 57, 220, "220Ω");
      drawBreadboardWireLink(c, bx + 288, by + 57, bx + 288, by + 18, "#ef4444", "5V");
      drawBreadboardWireLink(c, bx + 312, by + 57, bx + 312, by + 30, "#0f172a", "GND");
      // Custom Project Sandbox: Render custom placed components
      if (state.components.customPlacedComponents && state.components.customPlacedComponents.length > 0) {
        state.components.customPlacedComponents.forEach((comp, idx) => {
          const cx = bx + comp.x;
          const cy = by + comp.y;
          switch (comp.type) {
            case "led_red":
              drawLargeLed(c, cx, cy, "#ef4444", state.components.pin13Led || comp.state?.on, comp.label);
              break;
            case "led_green":
              drawLargeLed(c, cx, cy, "#10b981", state.components.pin11Led || comp.state?.on, comp.label);
              break;
            case "led_yellow":
              drawLargeLed(c, cx, cy, "#f59e0b", state.components.pin12Led || comp.state?.on, comp.label);
              break;
            case "led_blue":
              drawLargeLed(c, cx, cy, "#38bdf8", state.components.pin9Pwm > 0 || comp.state?.on, comp.label);
              break;
            case "rgb_led":
              drawRgbLed(c, cx, cy, state.components.rgbColor, comp.label);
              break;
            case "resistor":
            case "resistor_10k":
              drawResistor(c, cx, cy, comp.type === "resistor_10k" ? 10000 : (comp.state?.value || 220), comp.label);
              break;
            case "capacitor":
              // Disc ceramic decoupling capacitor
              c.save();
              c.strokeStyle = "#94a3b8";
              c.lineWidth = 1.5;
              c.beginPath();
              c.moveTo(cx - 3, cy + 8); c.lineTo(cx - 3, cy + 20);
              c.moveTo(cx + 3, cy + 8); c.lineTo(cx + 3, cy + 20);
              c.stroke();
              c.fillStyle = "#f59e0b";
              c.beginPath();
              c.arc(cx, cy, 8, 0, Math.PI * 2);
              c.fill();
              c.fillStyle = "#0f172a";
              c.font = "bold 6px monospace";
              c.textAlign = "center";
              c.fillText("104", cx, cy + 2);
              c.textAlign = "left";
              c.restore();
              break;
            case "pushbutton":
              drawTactileSwitch(c, cx, cy, state.components.buttonPressed || comp.state?.pressed, comp.label);
              break;
            case "toggle_switch":
            case "slide_switch":
              drawSlideSwitch(c, cx, cy, state.components.toggleSwitchOn, comp.label);
              break;
            case "potentiometer":
              drawPotTrim(c, cx, cy, state.components.potValue, comp.label);
              break;
            case "buzzer":
            case "piezo_buzzer":
              drawPiezoBuzzer(c, cx, cy, state.components.pin13Led, false, comp.label);
              break;
            case "ultrasonic":
            case "ultrasonic_sonar":
              drawUltrasonicModule(c, cx, cy, state.components.obstacleDistCm);
              break;
            case "ldr":
            case "ldr_sensor":
              drawLdrComponent(c, cx, cy, state.components.ldrLux);
              break;
            case "tmp36":
            case "tmp36_temp":
              drawTmp36Sensor(c, cx, cy, state.components.temperatureC);
              break;
            case "servo":
            case "servo_motor":
              drawServoMotor(c, cx, cy, state.components.currentServoAngle);
              break;
            case "dc_motor":
            case "dc_motor_fan":
              drawDcMotorFan(c, cx, cy, state.components.motorSpeed, state.components.currentMotorAngle);
              break;
            case "relay":
            case "relay_module":
              drawRelayModule(c, cx, cy, state.components.relayActive);
              break;
            case "seven_seg":
            case "seven_segment":
              drawSevenSegment(c, cx, cy, state.components.sevenSegDigit);
              break;
            case "pir":
            case "pir_motion":
              drawPirSensor(c, cx, cy, state.components.pirMotionDetected);
              break;
            case "joystick":
            case "joystick_thumb":
              drawJoystickModule(c, cx, cy, state.components.potValue, 512, state.components.buttonPressed);
              break;
            case "lcd_1602":
            case "lcd_16x2":
              drawLcdModule(c, cx, cy, state.components.lcdLines);
              break;
            case "dht11":
              drawDhtSensor(c, cx, cy, state.components.temperatureC || 24, 55);
              break;
            case "bme280":
              drawBme280Module(c, cx, cy, 1013.25, state.components.temperatureC || 24);
              break;
            case "oled_ssd1306":
              drawOledDisplay(c, cx, cy, ["SSD1306 OLED", "I2C 0x3C 128x64", "SYS: OK"], true);
              break;
            case "stepper_motor":
              drawStepperMotor(c, cx, cy, (state.simTimeMs * 0.1) % 360, Math.floor((state.simTimeMs * 0.02) % 4));
              break;
            default:
              drawLargeLed(c, cx, cy, "#38bdf8", true, comp.label);
          }

          // Active dragging ring cue on currently dragged component
          if (state.isDraggingComp && state.draggedCompIndex === idx) {
            c.save();
            c.strokeStyle = "#22d3ee";
            c.lineWidth = 2.2;
            c.setLineDash([5, 4]);
            c.shadowColor = "#22d3ee";
            c.shadowBlur = 10;
            c.beginPath();
            c.arc(cx, cy, 28, 0, Math.PI * 2);
            c.stroke();
            c.restore();
          }
        });
      } else {
        c.fillStyle = "#64748b";
        c.font = "bold 11px sans-serif";
        c.textAlign = "center";
        c.fillText("Breadboard Ready: Pick components from toolbox above!", bx + bw / 2, by + bh / 2 + 4);
        c.textAlign = "left";
      }
    }
  }

  // Draw Photorealistic 5mm Diffused LED with optical bloom & internal leadframe
  function drawLargeLed(c, lx, ly, color, isOn, text = "", brightness = 1.0) {
    c.save();
    // Metal pins (anode and cathode leads dropping down)
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(lx - 4, ly + 12);
    c.lineTo(lx - 4, ly + 28);
    c.moveTo(lx + 4, ly + 12);
    c.lineTo(lx + 4, ly + 28);
    c.stroke();

    // Drop shadow
    c.shadowColor = "rgba(0,0,0,0.45)";
    c.shadowBlur = 6;
    c.shadowOffsetY = 3;

    // 5mm Epoxy Dome + Base Flange Rim
    c.beginPath();
    c.arc(lx, ly, 10, Math.PI, 0, false);
    c.rect(lx - 10, ly, 20, 8);
    // Base rim flange
    c.rect(lx - 11.5, ly + 8, 23, 3.5);
    c.closePath();

    if (isOn) {
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 24 * brightness;
      c.fill();

      // Leadframe anvil & post internal silhouettes
      c.shadowBlur = 0;
      c.fillStyle = "rgba(0, 0, 0, 0.25)";
      c.fillRect(lx - 4, ly + 2, 3, 7);
      c.fillRect(lx + 1, ly + 2, 3, 7);

      // Core semiconductor chip die intense hotspot
      const coreGrad = c.createRadialGradient(lx, ly + 1, 1, lx, ly + 1, 7);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      coreGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      c.fillStyle = coreGrad;
      c.beginPath();
      c.arc(lx, ly + 1, 7, 0, Math.PI * 2);
      c.fill();
    } else {
      // Unlit tinted resin
      c.fillStyle = "rgba(100, 116, 139, 0.35)";
      c.fill();

      // Visible internal metal leadframe
      c.fillStyle = "#64748b";
      c.fillRect(lx - 3.5, ly + 2, 2.5, 6);
      c.fillRect(lx + 1, ly + 2, 2.5, 6);
    }

    // Specular Fresnel lens reflection highlight arc
    c.strokeStyle = "rgba(255, 255, 255, 0.65)";
    c.lineWidth = 1.4;
    c.beginPath();
    c.arc(lx - 3, ly - 3, 5, -0.6 * Math.PI, -0.1 * Math.PI);
    c.stroke();
    c.restore();

    if (text) {
      c.save();
      c.textAlign = "center";
      c.textBaseline = "top";
      c.fillStyle = "#0f172a";
      c.font = "bold 9px system-ui, -apple-system, sans-serif";
      if (text.includes("\n")) {
        const lines = text.split("\n");
        c.fillText(lines[0], lx, ly + 36);
        c.font = "bold 8px system-ui, -apple-system, sans-serif";
        c.fillStyle = "#64748b";
        c.fillText(lines[1], lx, ly + 47);
      } else {
        c.fillText(text, lx, ly + 38);
      }
      c.restore();
    }
  }

  // Draw Photorealistic Square Tactile Pushbutton with Metal Rim & Plunger
  function drawTactileSwitch(c, sx, sy, isPressed, label = "") {
    c.save();
    // 4 Solder tabs (2 left, 2 right)
    c.fillStyle = "#94a3b8";
    c.fillRect(sx - 4, sy + 4, 4, 5);
    c.fillRect(sx - 4, sy + 23, 4, 5);
    c.fillRect(sx + 32, sy + 4, 4, 5);
    c.fillRect(sx + 32, sy + 23, 4, 5);

    // Textured casing
    c.fillStyle = "#0f172a";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;
    c.beginPath();
    c.roundRect(sx, sy, 32, 32, [4, 4, 4, 4]);
    c.fill();
    c.shadowColor = "transparent";

    // Metal top plate cover with 4 corner rivets
    const plateGrad = c.createLinearGradient(sx + 2, sy + 2, sx + 30, sy + 30);
    plateGrad.addColorStop(0, "#cbd5e1");
    plateGrad.addColorStop(0.5, "#94a3b8");
    plateGrad.addColorStop(1, "#64748b");
    c.fillStyle = plateGrad;
    c.beginPath();
    c.roundRect(sx + 2, sy + 2, 28, 28, [3, 3, 3, 3]);
    c.fill();

    // 4 Corner Rivets
    const rivets = [[sx + 5, sy + 5], [sx + 27, sy + 5], [sx + 5, sy + 27], [sx + 27, sy + 27]];
    c.fillStyle = "#334155";
    rivets.forEach(([rx, ry]) => {
      c.beginPath();
      c.arc(rx, ry, 1.2, 0, Math.PI * 2);
      c.fill();
    });

    // Circular plunger button in center
    const plungerRadius = isPressed ? 8 : 9.5;
    const plungerGrad = c.createRadialGradient(sx + 16, sy + 16, 2, sx + 16, sy + 16, plungerRadius);
    plungerGrad.addColorStop(0, isPressed ? "#0284c7" : "#0284c7");
    plungerGrad.addColorStop(0.8, isPressed ? "#0369a1" : "#075985");
    plungerGrad.addColorStop(1, "#0c4a6e");
    c.fillStyle = plungerGrad;
    c.beginPath();
    c.arc(sx + 16, sy + 16, plungerRadius, 0, Math.PI * 2);
    c.fill();

    // Specular shine on plunger
    if (!isPressed) {
      c.strokeStyle = "rgba(255, 255, 255, 0.4)";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(sx + 16, sy + 16, plungerRadius - 1.5, -0.6 * Math.PI, -0.1 * Math.PI);
      c.stroke();
    }
    c.restore();

    if (label) {
      c.save();
      c.textAlign = "center";
      c.textBaseline = "top";
      c.fillStyle = "#0f172a";
      c.font = "bold 9px system-ui, -apple-system, sans-serif";
      if (label.includes("\n")) {
        const lines = label.split("\n");
        c.fillText(lines[0], sx + 16, sy + 38);
        c.font = "bold 8px system-ui, -apple-system, sans-serif";
        c.fillStyle = "#64748b";
        c.fillText(lines[1], sx + 16, sy + 49);
      } else {
        c.fillText(label, sx + 16, sy + 38);
      }
      c.restore();
    }
  }

  // Draw Piezoelectric Acoustic Transducer (Buzzer)
  function drawPiezoBuzzer(c, px, py, isBeeping, isMusical = false, label = "BUZZER (D8)") {
    c.save();
    // Black cylinder casing
    c.fillStyle = "#0f172a";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.beginPath();
    c.arc(px + 18, py + 18, 20, 0, Math.PI * 2);
    c.fill();

    // Sound port hole
    c.fillStyle = "#334155";
    c.beginPath();
    c.arc(px + 18, py + 18, 6, 0, Math.PI * 2);
    c.fill();

    // + marker
    c.fillStyle = "#ef4444";
    c.font = "bold 10px monospace";
    c.fillText("+", px + 4, py + 10);

    // Animated acoustic sound wave rings
    if (isBeeping && !audio.isMuted()) {
      c.strokeStyle = isMusical ? "#c084fc" : "#38bdf8";
      c.lineWidth = 1.5;
      const wavePhase = (state.simTimeMs % 500) / 500;
      c.beginPath();
      c.arc(px + 18, py + 18, 22 + wavePhase * 18, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();

    if (label) {
      c.save();
      c.textAlign = "center";
      c.textBaseline = "top";
      c.fillStyle = "#0f172a";
      c.font = "bold 9px system-ui, -apple-system, sans-serif";
      if (label.includes("\n")) {
        const lines = label.split("\n");
        c.fillText(lines[0], px + 18, py + 42);
        c.font = "bold 8px system-ui, -apple-system, sans-serif";
        c.fillStyle = "#64748b";
        c.fillText(lines[1], px + 18, py + 53);
      } else {
        c.fillText(label, px + 18, py + 42);
      }
      c.restore();
    }
  }

  // Draw HC-SR04 Ultrasonic Distance Sensor
  function drawUltrasonicModule(c, ux, uy, distCm) {
    // Blue PCB
    c.fillStyle = "#0284c7";
    c.beginPath();
    c.roundRect(ux, uy, 120, 48, [4, 4, 4, 4]);
    c.fill();

    // Dual Silver Transducer Cylinders (Transmitter 'T' & Receiver 'R')
    const drawCan = (cx, label) => {
      c.fillStyle = "#e2e8f0";
      c.beginPath();
      c.arc(cx, uy + 24, 18, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#94a3b8";
      c.lineWidth = 2;
      c.stroke();

      // Mesh screen
      c.fillStyle = "#475569";
      c.beginPath();
      c.arc(cx, uy + 24, 13, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#f8fafc";
      c.font = "bold 10px sans-serif";
      c.fillText(label, cx - 4, uy + 28);
    };

    drawCan(ux + 26, "T");
    drawCan(ux + 94, "R");

    // Sonar Beam Visualization
    c.save();
    c.strokeStyle = "rgba(56, 189, 248, 0.4)";
    c.lineWidth = 1.5;
    const radarSweep = (state.simTimeMs % 1000) / 1000;
    c.beginPath();
    c.arc(ux + 60, uy + 24, 30 + radarSweep * (distCm * 1.2), -0.5, 0.5);
    c.stroke();
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`HC-SR04: ${distCm.toFixed(1)} cm`, ux + 20, uy + 62);
  }

  // Draw SG90 Micro Servo Motor with Rotating Horn
  function drawServoMotor(c, sx, sy, angleDeg) {
    c.save();
    // Blue transparent casing
    c.fillStyle = "rgba(2, 132, 199, 0.9)";
    c.beginPath();
    c.roundRect(sx, sy, 75, 95, [4, 4, 4, 4]);
    c.fill();
    c.strokeStyle = "#38bdf8";
    c.stroke();

    // Top gear shaft
    c.fillStyle = "#f8fafc";
    c.beginPath();
    c.arc(sx + 37, sy + 30, 16, 0, Math.PI * 2);
    c.fill();

    // Rotating Nylon Servo Horn Arm
    c.save();
    c.translate(sx + 37, sy + 30);
    c.rotate((angleDeg - 90) * (Math.PI / 180));
    c.fillStyle = "#ffffff";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 6;
    c.beginPath();
    c.roundRect(-5, -28, 10, 56, [4, 4, 4, 4]);
    c.fill();
    // Pivot dot
    c.fillStyle = "#0284c7";
    c.beginPath();
    c.arc(0, 0, 4, 0, Math.PI * 2);
    c.fill();
    c.restore();

    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 9px sans-serif";
    c.fillText(`SERVO SG90: ${angleDeg.toFixed(0)}°`, sx + 4, sy + 115);
  }

  // Draw Photoresistor (LDR)
  function drawLdrComponent(c, lx, ly, lux) {
    c.fillStyle = "#b45309"; // Ceramic disc base
    c.beginPath();
    c.arc(lx, ly, 12, 0, Math.PI * 2);
    c.fill();

    // Serpentine CdS track
    c.strokeStyle = "#f59e0b";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(lx - 7, ly - 6);
    c.lineTo(lx + 7, ly - 6);
    c.lineTo(lx - 7, ly);
    c.lineTo(lx + 7, ly);
    c.lineTo(lx - 7, ly + 6);
    c.lineTo(lx + 7, ly + 6);
    c.stroke();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`LDR: ${lux} Lux`, lx - 18, ly + 26);
  }

  // Draw 16x2 Character Liquid Crystal Display
  function drawLcdModule(c, lx, ly, lines) {
    // Green/Blue LCD PCB
    c.fillStyle = "#047857";
    c.beginPath();
    c.roundRect(lx, ly, 230, 90, [6, 6, 6, 6]);
    c.fill();

    // Backlit Blue Screen
    c.fillStyle = "#0284c7";
    c.beginPath();
    c.roundRect(lx + 15, ly + 14, 200, 62, [4, 4, 4, 4]);
    c.fill();

    // Dot Matrix Characters
    c.fillStyle = "#ffffff";
    c.font = "bold 13px 'Courier New', monospace";
    c.fillText(lines[0] || "", lx + 22, ly + 38);
    c.fillText(lines[1] || "", lx + 22, ly + 62);
  }

  // Draw Potentiometer Trim
  function drawPotTrim(c, px, py, val) {
    c.fillStyle = "#0284c7"; // Blue square trimmer
    c.beginPath();
    c.roundRect(px, py, 34, 34, [4, 4, 4, 4]);
    c.fill();

    // Dial center
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(px + 17, py + 17, 10, 0, Math.PI * 2);
    c.fill();

    // Arrow pointer
    const rot = (val / 1023) * 1.5 * Math.PI - 0.75 * Math.PI;
    c.save();
    c.translate(px + 17, py + 17);
    c.rotate(rot);
    c.fillStyle = "#ef4444";
    c.fillRect(-2, -9, 4, 10);
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText("POT (A0)", px - 2, py + 48);
  }

  // Draw TMP36 Temperature Sensor
  function drawTmp36Sensor(c, tx, ty, tempC) {
    c.fillStyle = "#0f172a"; // TO-92 black package
    c.beginPath();
    c.arc(tx, ty, 10, Math.PI, 0, false);
    c.rect(tx - 10, ty, 20, 14);
    c.fill();

    c.fillStyle = "#cbd5e1";
    c.font = "bold 7px sans-serif";
    c.fillText("TMP36", tx - 9, ty + 10);

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`${tempC.toFixed(1)}°C`, tx - 8, ty + 28);
  }

  // -------------------------------------------------------------------------
  // Photorealistic Electronics Components Rendering
  // -------------------------------------------------------------------------

  // 1. Photorealistic 4-Pin Diffused RGB LED
  function drawRgbLed(c, lx, ly, rgb = { r: 255, g: 0, b: 128 }, label = "") {
    c.save();
    // 4 Solder Lead Pins (Red, Cathode/Anode, Green, Blue)
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const px = lx - 6 + i * 4;
      c.beginPath();
      c.moveTo(px, ly + 14);
      c.lineTo(px, ly + 28);
      c.stroke();
    }

    // Drop shadow
    c.shadowColor = "rgba(0,0,0,0.45)";
    c.shadowBlur = 8;
    c.shadowOffsetY = 4;

    // 5mm Frosted Epoxy Dome with rim flange
    c.beginPath();
    c.arc(lx, ly, 12, Math.PI, 0, false);
    c.rect(lx - 12, ly, 24, 10);
    c.closePath();

    const hexColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const intensity = Math.max(rgb.r, rgb.g, rgb.b) / 255;

    c.fillStyle = hexColor;
    c.shadowColor = hexColor;
    c.shadowBlur = 24 * intensity;
    c.fill();

    // Internal 3 micro-dies (Red, Green, Blue semiconductor chips)
    c.shadowBlur = 0;
    c.fillStyle = "#ef4444";
    c.fillRect(lx - 5, ly + 3, 2.5, 2.5);
    c.fillStyle = "#10b981";
    c.fillRect(lx - 1, ly + 3, 2.5, 2.5);
    c.fillStyle = "#3b82f6";
    c.fillRect(lx + 3, ly + 3, 2.5, 2.5);

    // Core central optical hotspot
    const coreGrad = c.createRadialGradient(lx, ly + 2, 1, lx, ly + 2, 9);
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    coreGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
    coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    c.fillStyle = coreGrad;
    c.beginPath();
    c.arc(lx, ly + 2, 9, 0, Math.PI * 2);
    c.fill();

    // Specular Fresnel lens reflection curve
    c.strokeStyle = "rgba(255, 255, 255, 0.7)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(lx - 3, ly - 3, 6, -0.6 * Math.PI, -0.1 * Math.PI);
    c.stroke();
    c.restore();

    if (label) {
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(label, lx - 20, ly + 42);
    }
  }

  // 2. Photorealistic 1/4W Through-Hole Resistor (with EIA 4-Band Color Codes)
  function drawResistor(c, rx, ry, ohms = 220, label = "") {
    c.save();
    // Metal Leads extending out of ends into breadboard
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(rx - 22, ry + 12);
    c.lineTo(rx - 22, ry);
    c.lineTo(rx - 12, ry);
    c.moveTo(rx + 12, ry);
    c.lineTo(rx + 22, ry);
    c.lineTo(rx + 22, ry + 12);
    c.stroke();

    // Resistor Body (Dumbbell ceramic beige with drop shadow)
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 6;
    c.shadowOffsetY = 2;

    const bodyGrad = c.createLinearGradient(rx - 12, ry - 5, rx - 12, ry + 5);
    bodyGrad.addColorStop(0, "#e8d7be");
    bodyGrad.addColorStop(0.5, "#d4b896");
    bodyGrad.addColorStop(1, "#9e7f5e");
    c.fillStyle = bodyGrad;

    // Body shape with bulbous ends
    c.beginPath();
    c.roundRect(rx - 12, ry - 5, 24, 10, [4, 4, 4, 4]);
    c.fill();
    c.shadowColor = "transparent";

    // EIA 4-Band Colors Map
    let bands = ["#ef4444", "#ef4444", "#92400e", "#d97706"]; // default 220 ohm (Red, Red, Brown, Gold)
    if (ohms >= 10000) {
      bands = ["#92400e", "#0f172a", "#f97316", "#d97706"]; // 10k: Brown, Black, Orange, Gold
    } else if (ohms >= 1000) {
      bands = ["#92400e", "#0f172a", "#ef4444", "#d97706"]; // 1k: Brown, Black, Red, Gold
    } else if (ohms >= 330) {
      bands = ["#f97316", "#f97316", "#92400e", "#d97706"]; // 330: Orange, Orange, Brown, Gold
    }

    // Draw the 4 bands
    const bandPositions = [-7, -3, 1, 6];
    bands.forEach((bColor, idx) => {
      c.fillStyle = bColor;
      c.fillRect(rx + bandPositions[idx], ry - 5, 2.2, 10);
    });

    // Top subtle specular reflection streak
    c.fillStyle = "rgba(255, 255, 255, 0.4)";
    c.fillRect(rx - 10, ry - 4, 20, 1.5);
    c.restore();

    if (label) {
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(label, rx - 14, ry + 20);
    }
  }

  // 3. Photorealistic SPDT Slide Switch
  function drawSlideSwitch(c, sx, sy, isOn, label = "") {
    c.save();
    // Metal bracket chassis
    const metalGrad = c.createLinearGradient(sx, sy, sx + 28, sy + 16);
    metalGrad.addColorStop(0, "#f1f5f9");
    metalGrad.addColorStop(0.5, "#cbd5e1");
    metalGrad.addColorStop(1, "#94a3b8");
    c.fillStyle = metalGrad;
    c.shadowColor = "rgba(0,0,0,0.4)";
    c.shadowBlur = 6;
    c.beginPath();
    c.roundRect(sx, sy, 32, 16, [2, 2, 2, 2]);
    c.fill();
    c.shadowColor = "transparent";

    // Mounting tabs with screw holes
    c.fillStyle = "#64748b";
    c.fillRect(sx - 4, sy + 4, 4, 8);
    c.fillRect(sx + 32, sy + 4, 4, 8);
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(sx - 2, sy + 8, 1.5, 0, Math.PI * 2);
    c.arc(sx + 34, sy + 8, 1.5, 0, Math.PI * 2);
    c.fill();

    // Slot cavity
    c.fillStyle = "#1e293b";
    c.fillRect(sx + 4, sy + 4, 24, 8);

    // Sliding knob actuator with ridges
    const knobX = isOn ? sx + 18 : sx + 6;
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.roundRect(knobX, sy + 1, 8, 14, [2, 2, 2, 2]);
    c.fill();
    // Grip ridges on knob
    c.strokeStyle = "#475569";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(knobX + 2, sy + 4); c.lineTo(knobX + 6, sy + 4);
    c.moveTo(knobX + 2, sy + 8); c.lineTo(knobX + 6, sy + 8);
    c.moveTo(knobX + 2, sy + 12); c.lineTo(knobX + 6, sy + 12);
    c.stroke();
    c.restore();

    if (label) {
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(`${label}: ${isOn ? "ON" : "OFF"}`, sx - 6, sy + 30);
    }
  }

  // 4. Photorealistic DC Motor with Aerodynamic Propeller Fan
  function drawDcMotorFan(c, mx, my, speed = 0, angle = 0) {
    c.save();
    // Drop shadow
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 10;
    c.shadowOffsetY = 4;

    // Motor Brushed Metal Cylindrical Housing
    const motorGrad = c.createLinearGradient(mx - 22, my - 22, mx + 22, my + 22);
    motorGrad.addColorStop(0, "#f8fafc");
    motorGrad.addColorStop(0.3, "#cbd5e1");
    motorGrad.addColorStop(0.7, "#64748b");
    motorGrad.addColorStop(1, "#334155");
    c.fillStyle = motorGrad;
    c.beginPath();
    c.arc(mx, my, 22, 0, Math.PI * 2);
    c.fill();
    c.shadowColor = "transparent";

    // Stamped Ventilation Slots & Rivets
    c.fillStyle = "#1e293b";
    c.fillRect(mx - 14, my - 12, 6, 2.5);
    c.fillRect(mx + 8, my - 12, 6, 2.5);
    c.fillRect(mx - 14, my + 10, 6, 2.5);
    c.fillRect(mx + 8, my + 10, 6, 2.5);

    // Center Brass Bushing
    c.fillStyle = "#d97706";
    c.beginPath();
    c.arc(mx, my, 7, 0, Math.PI * 2);
    c.fill();

    // Spinning 3-Blade Propeller Fan
    c.save();
    c.translate(mx, my);
    c.rotate(angle);

    // Propeller Blades (aerodynamic blue/cyan blades)
    for (let b = 0; b < 3; b++) {
      c.save();
      c.rotate((b * 2 * Math.PI) / 3);
      c.fillStyle = "rgba(6, 182, 212, 0.85)";
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(12, -20, 6, -34);
      c.quadraticCurveTo(0, -38, -6, -34);
      c.quadraticCurveTo(-10, -20, 0, 0);
      c.fill();
      c.strokeStyle = "rgba(255, 255, 255, 0.4)";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }

    // Motion Blur Fan Halo when spinning
    if (speed > 10) {
      c.strokeStyle = `rgba(56, 189, 248, ${Math.min(0.45, speed / 400)})`;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(0, 0, 32, 0, Math.PI * 2);
      c.stroke();
    }

    // Rotor Cap
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(0, 0, 4.5, 0, Math.PI * 2);
    c.fill();
    c.restore();

    c.restore();

    const rpm = Math.round((speed / 255) * 4800);
    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`DC MOTOR: ${rpm} RPM`, mx - 28, my + 44);
  }

  // 5. Photorealistic Songle 5V Relay Module
  function drawRelayModule(c, rx, ry, isActive) {
    c.save();
    // Blue rectangular relay sugar-cube
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;

    c.fillStyle = "#0284c7"; // Classic Songle Blue
    c.beginPath();
    c.roundRect(rx, ry, 56, 42, [4, 4, 4, 4]);
    c.fill();
    c.shadowColor = "transparent";

    // Bevel edge
    c.strokeStyle = "#38bdf8";
    c.lineWidth = 1;
    c.stroke();

    // Silkscreen Text
    c.fillStyle = "#ffffff";
    c.font = "bold 7px sans-serif";
    c.fillText("SONGLE", rx + 6, ry + 12);
    c.font = "6px sans-serif";
    c.fillText("10A 250VAC", rx + 6, ry + 22);
    c.fillText("SRD-05VDC", rx + 6, ry + 32);

    // 3-Pin Screw Terminal Block at right side
    c.fillStyle = "#1e40af";
    c.fillRect(rx + 56, ry + 4, 18, 34);
    for (let s = 0; s < 3; s++) {
      const sy = ry + 9 + s * 11;
      c.fillStyle = "#d97706"; // Brass screw
      c.beginPath();
      c.arc(rx + 65, sy, 3.5, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#451a03";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(rx + 63, sy); c.lineTo(rx + 67, sy);
      c.stroke();
    }

    // Status SMD LEDs: Power (Red) & Active (Green)
    c.fillStyle = "#ef4444"; // Power on
    c.fillRect(rx + 44, ry + 8, 4, 3);

    if (isActive) {
      c.fillStyle = "#10b981";
      c.shadowColor = "#10b981";
      c.shadowBlur = 10;
      c.fillRect(rx + 44, ry + 16, 4, 3);
    } else {
      c.fillStyle = "rgba(16, 185, 129, 0.25)";
      c.fillRect(rx + 44, ry + 16, 4, 3);
    }
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`RELAY: ${isActive ? "ACTIVE (NO)" : "IDLE (NC)"}`, rx - 2, ry + 56);
  }

  // 6. Photorealistic Decimal 7-Segment LED Display (0-9)
  function drawSevenSegment(c, sx, sy, digit = 0) {
    c.save();
    // Charcoal package casing
    c.fillStyle = "#18181b";
    c.shadowColor = "rgba(0,0,0,0.6)";
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;
    c.beginPath();
    c.roundRect(sx, sy, 48, 68, [4, 4, 4, 4]);
    c.fill();
    c.shadowColor = "transparent";

    // Silver pins top & bottom
    c.fillStyle = "#94a3b8";
    for (let p = 0; p < 5; p++) {
      c.fillRect(sx + 6 + p * 8, sy - 4, 3, 4);
      c.fillRect(sx + 6 + p * 8, sy + 68, 3, 4);
    }

    // 7 Segment Table for digits 0-9 [a, b, c, d, e, f, g]
    const segmentMap = [
      [1, 1, 1, 1, 1, 1, 0], // 0
      [0, 1, 1, 0, 0, 0, 0], // 1
      [1, 1, 0, 1, 1, 0, 1], // 2
      [1, 1, 1, 1, 0, 0, 1], // 3
      [0, 1, 1, 0, 0, 1, 1], // 4
      [1, 0, 1, 1, 0, 1, 1], // 5
      [1, 0, 1, 1, 1, 1, 1], // 6
      [1, 1, 1, 0, 0, 0, 0], // 7
      [1, 1, 1, 1, 1, 1, 1], // 8
      [1, 1, 1, 1, 0, 1, 1]  // 9
    ];

    const seg = segmentMap[digit % 10] || segmentMap[0];
    const drawSeg = (active, x, y, w, h) => {
      c.fillStyle = active ? "#ef4444" : "#27272a";
      if (active) {
        c.shadowColor = "#ef4444";
        c.shadowBlur = 10;
      } else {
        c.shadowBlur = 0;
      }
      c.beginPath();
      c.roundRect(x, y, w, h, [2, 2, 2, 2]);
      c.fill();
    };

    const ox = sx + 13;
    const oy = sy + 10;
    // a: top
    drawSeg(seg[0], ox + 3, oy, 16, 4);
    // b: top-right
    drawSeg(seg[1], ox + 19, oy + 4, 4, 18);
    // c: bottom-right
    drawSeg(seg[2], ox + 19, oy + 24, 4, 18);
    // d: bottom
    drawSeg(seg[3], ox + 3, oy + 42, 16, 4);
    // e: bottom-left
    drawSeg(seg[4], ox - 1, oy + 24, 4, 18);
    // f: top-left
    drawSeg(seg[5], ox - 1, oy + 4, 4, 18);
    // g: middle
    drawSeg(seg[6], ox + 3, oy + 21, 16, 4);

    // Decimal point (dp)
    drawSeg(true, sx + 39, sy + 52, 4, 4);
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(`7-SEG: [${digit}]`, sx + 4, sy + 82);
  }

  // 7. Photorealistic HC-SR501 PIR Motion Sensor
  function drawPirSensor(c, px, py, isTriggered) {
    c.save();
    // Green PCB
    c.fillStyle = "#15803d";
    c.shadowColor = "rgba(0,0,0,0.4)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(px, py, 58, 48, [4, 4, 4, 4]);
    c.fill();
    c.shadowColor = "transparent";

    // White Hemispherical Fresnel Dome Lens
    const domeGrad = c.createRadialGradient(px + 29, py + 24, 3, px + 29, py + 24, 19);
    domeGrad.addColorStop(0, "#ffffff");
    domeGrad.addColorStop(0.7, "#f1f5f9");
    domeGrad.addColorStop(1, "#cbd5e1");
    c.fillStyle = domeGrad;
    c.beginPath();
    c.arc(px + 29, py + 24, 18, 0, Math.PI * 2);
    c.fill();

    // Faceted Honeycomb grid lines on dome
    c.strokeStyle = "rgba(148, 163, 184, 0.45)";
    c.lineWidth = 1;
    for (let r = 5; r <= 15; r += 5) {
      c.beginPath();
      c.arc(px + 29, py + 24, r, 0, Math.PI * 2);
      c.stroke();
    }

    // Motion Alert SMD LED
    if (isTriggered) {
      c.fillStyle = "#ef4444";
      c.shadowColor = "#ef4444";
      c.shadowBlur = 12;
      c.beginPath();
      c.arc(px + 50, py + 8, 3, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = "rgba(100, 116, 139, 0.4)";
      c.beginPath();
      c.arc(px + 50, py + 8, 2.5, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(isTriggered ? "PIR: MOTION!" : "PIR: IDLE", px + 4, py + 60);
  }

  // 8. Photorealistic 2-Axis Thumbstick Joystick Module
  function drawJoystickModule(c, jx, jy, joyX = 512, joyY = 512, isPressed = false) {
    c.save();
    // Blue/Black PCB
    c.fillStyle = "#090d16";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(jx, jy, 64, 64, [6, 6, 6, 6]);
    c.fill();
    c.shadowColor = "transparent";

    // Dual Potentiometer metal side housings
    c.fillStyle = "#64748b";
    c.fillRect(jx + 2, jy + 22, 6, 20);
    c.fillRect(jx + 22, jy + 2, 20, 6);

    // Rubberized Concave Thumbstick Hat
    const dx = ((joyX - 512) / 512) * 8;
    const dy = ((joyY - 512) / 512) * 8;
    const hatX = jx + 32 + dx;
    const hatY = jy + 32 + dy;

    // Outer thumb rim
    const hatGrad = c.createRadialGradient(hatX, hatY, 4, hatX, hatY, 20);
    hatGrad.addColorStop(0, "#1e293b");
    hatGrad.addColorStop(0.8, "#0f172a");
    hatGrad.addColorStop(1, "#020617");
    c.fillStyle = hatGrad;
    c.beginPath();
    c.arc(hatX, hatY, 20, 0, Math.PI * 2);
    c.fill();

    // Center concave dip with grip bumps
    c.fillStyle = isPressed ? "#0284c7" : "#334155";
    c.beginPath();
    c.arc(hatX, hatY, 11, 0, Math.PI * 2);
    c.fill();
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText("JOYSTICK (A0/A1)", jx - 2, jy + 76);
  }

  // 9. Photorealistic TO-220 Transistor & Flyback Diode
  function drawTransistorPackage(c, tx, ty) {
    c.save();
    // Silver metal heatsink tab with hole
    c.fillStyle = "#cbd5e1";
    c.fillRect(tx, ty - 6, 18, 8);
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(tx + 9, ty - 2, 2, 0, Math.PI * 2);
    c.fill();

    // Black epoxy TO-220 body
    c.fillStyle = "#1e293b";
    c.fillRect(tx, ty + 2, 18, 16);
    c.fillStyle = "#94a3b8";
    c.font = "6px monospace";
    c.fillText("TIP120", tx + 1, ty + 12);

    // 1N4007 Diode
    c.fillStyle = "#0f172a";
    c.fillRect(tx + 24, ty + 4, 16, 7);
    c.fillStyle = "#cbd5e1"; // Silver cathode stripe
    c.fillRect(tx + 26, ty + 4, 3, 7);
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 7px sans-serif";
    c.fillText("DRIVER", tx + 4, ty + 28);
  }

  // 10. Photorealistic DHT11 Digital Temperature & Humidity Sensor
  function drawDhtSensor(c, cx, cy, tempC = 24, humidityRh = 55) {
    c.save();
    // Metal pins dropping down to breadboard tie points
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const px = cx - 9 + i * 6;
      c.beginPath();
      c.moveTo(px, cy + 18);
      c.lineTo(px, cy + 28);
      c.stroke();
    }

    // DHT11 Sky Blue Plastic Perforated Enclosure
    c.fillStyle = "#0284c7";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(cx - 16, cy - 22, 32, 40, [4, 4, 4, 4]);
    c.fill();
    c.restore();

    // Subtle 3D gradient highlight on plastic shell
    const grad = c.createLinearGradient(cx - 16, cy - 22, cx + 16, cy + 18);
    grad.addColorStop(0, "rgba(255,255,255,0.22)");
    grad.addColorStop(0.5, "transparent");
    grad.addColorStop(1, "rgba(0,0,0,0.28)");
    c.fillStyle = grad;
    c.beginPath();
    c.roundRect(cx - 16, cy - 22, 32, 40, [4, 4, 4, 4]);
    c.fill();

    // Ventilation slotted air intake grill (matrix of slots)
    c.fillStyle = "#0369a1";
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        c.fillRect(cx - 11 + col * 8, cy - 16 + row * 6, 6, 2.5);
      }
    }

    // Silkscreen brand & live telemetry readout
    c.fillStyle = "#f0f9ff";
    c.font = "bold 6.5px monospace";
    c.textAlign = "center";
    c.fillText("DHT11", cx, cy + 13);
    c.fillStyle = "#0f172a";
    c.font = "bold 7.5px sans-serif";
    c.fillText(`${Math.round(tempC)}°C · ${Math.round(humidityRh)}%RH`, cx, cy + 38);
    c.textAlign = "left";
  }

  // 11. Photorealistic BME280 Precision I2C Barometer & Environmental Sensor
  function drawBme280Module(c, cx, cy, pressureHpa = 1013.25, tempC = 24) {
    c.save();
    // Purple Breakout PCB
    c.fillStyle = "#6d28d9";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(cx - 16, cy - 20, 32, 42, [4, 4, 4, 4]);
    c.fill();
    c.restore();

    // Gold mounting hole & corner trace accents
    c.fillStyle = "#facc15";
    c.beginPath();
    c.arc(cx - 10, cy - 14, 2, 0, Math.PI * 2);
    c.fill();

    // Central Silver Metal MEMS Sensor Can with vent hole
    c.save();
    c.fillStyle = "#e2e8f0";
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 1;
    c.beginPath();
    c.roundRect(cx - 8, cy - 9, 16, 14, [2, 2, 2, 2]);
    c.fill();
    c.stroke();
    // Pinhole barometer air inlet
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(cx - 3, cy - 3, 1.2, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Surface Mount I2C Pullups & 3.3V LDO IC
    c.fillStyle = "#1e293b";
    c.fillRect(cx - 11, cy + 9, 6, 4);
    c.fillRect(cx + 5, cy + 9, 6, 4);

    // 6-Pin Gold Breakout Pads at bottom
    c.fillStyle = "#facc15";
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.arc(cx - 12.5 + i * 5, cy + 18, 1.5, 0, Math.PI * 2);
      c.fill();
    }

    // Silkscreen
    c.fillStyle = "#ede9fe";
    c.font = "bold 6.5px monospace";
    c.textAlign = "center";
    c.fillText("BME280", cx, cy - 3);
    c.fillStyle = "#0f172a";
    c.font = "bold 7.5px sans-serif";
    c.fillText(`${Math.round(pressureHpa)} hPa`, cx, cy + 34);
    c.textAlign = "left";
  }

  // 12. Photorealistic 0.96" SSD1306 Graphic I2C OLED Module (128x64)
  function drawOledDisplay(c, cx, cy, lines = ["SSD1306 OLED", "I2C 0x3C 128x64", "SYS: OK"], isPowered = true) {
    c.save();
    // Blue / Dark Blue PCB Carrier Base
    c.fillStyle = "#0f172a";
    c.shadowColor = "rgba(0,0,0,0.6)";
    c.shadowBlur = 10;
    c.beginPath();
    c.roundRect(cx - 38, cy - 26, 76, 54, [5, 5, 5, 5]);
    c.fill();
    c.strokeStyle = "rgba(56, 189, 248, 0.4)";
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    // 4 Corner Gold Mounting Holes
    c.fillStyle = "#facc15";
    [[-33, -21], [33, -21], [-33, 23], [33, 23]].forEach(([ox, oy]) => {
      c.beginPath();
      c.arc(cx + ox, cy + oy, 2, 0, Math.PI * 2);
      c.fill();
    });

    // 4-Pin I2C Header at Top (GND, VCC, SCL, SDA)
    for (let i = 0; i < 4; i++) {
      const hx = cx - 12 + i * 8;
      c.fillStyle = "#475569";
      c.fillRect(hx - 2, cy - 25, 4, 3);
      c.fillStyle = "#facc15";
      c.beginPath();
      c.arc(hx, cy - 23.5, 1.2, 0, Math.PI * 2);
      c.fill();
    }

    // Glossy Black Glass OLED Panel Window
    c.fillStyle = "#020617";
    c.beginPath();
    c.roundRect(cx - 32, cy - 16, 64, 38, [2, 2, 2, 2]);
    c.fill();
    c.strokeStyle = "#334155";
    c.lineWidth = 0.8;
    c.stroke();

    if (isPowered) {
      c.save();
      // Glowing Cyan Pixels
      c.fillStyle = "#22d3ee";
      c.shadowColor = "#06b6d4";
      c.shadowBlur = 5;
      c.font = "bold 6.5px 'JetBrains Mono', monospace";
      c.fillText(lines[0] || "SSD1306 OLED", cx - 28, cy - 6);
      c.font = "6px 'JetBrains Mono', monospace";
      c.fillText(lines[1] || "I2C 0x3C 128x64", cx - 28, cy + 4);

      // Mini dynamic graphic oscillogram / telemetry graph
      c.strokeStyle = "#38bdf8";
      c.lineWidth = 1.2;
      c.beginPath();
      const waveT = state.simTimeMs * 0.006;
      for (let x = 0; x < 54; x += 3) {
        const y = Math.sin(waveT + x * 0.2) * 5;
        if (x === 0) c.moveTo(cx - 27 + x, cy + 14 + y);
        else c.lineTo(cx - 27 + x, cy + 14 + y);
      }
      c.stroke();
      c.restore();
    }

    c.fillStyle = "#0f172a";
    c.font = "bold 7.5px sans-serif";
    c.textAlign = "center";
    c.fillText("0.96\" OLED (I2C)", cx, cy + 39);
    c.textAlign = "left";
  }

  // 13. Photorealistic 28BYJ-48 Stepper Motor + ULN2003 Driver Array
  function drawStepperMotor(c, cx, cy, angleDeg = 0, phase = 0) {
    c.save();
    // Metal mounting ears / flanges
    c.fillStyle = "#94a3b8";
    c.beginPath();
    c.roundRect(cx - 32, cy - 8, 64, 16, [4, 4, 4, 4]);
    c.fill();
    // Mounting ear screw slots
    c.fillStyle = "#f8fafc";
    c.beginPath();
    c.arc(cx - 26, cy, 3, 0, Math.PI * 2);
    c.arc(cx + 26, cy, 3, 0, Math.PI * 2);
    c.fill();

    // Round Cylindrical Motor Body (Silver metallic gradient)
    const mGrad = c.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 22);
    mGrad.addColorStop(0, "#f1f5f9");
    mGrad.addColorStop(0.7, "#94a3b8");
    mGrad.addColorStop(1, "#475569");
    c.fillStyle = mGrad;
    c.shadowColor = "rgba(0,0,0,0.55)";
    c.shadowBlur = 10;
    c.beginPath();
    c.arc(cx, cy, 20, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Central Brass D-Shaft with flat keyway
    c.save();
    c.translate(cx, cy);
    c.rotate(angleDeg * (Math.PI / 180));
    // Brass gear collar
    c.fillStyle = "#ca8a04";
    c.beginPath();
    c.arc(0, 0, 7.5, 0, Math.PI * 2);
    c.fill();
    // D-Shaft profile
    c.fillStyle = "#eab308";
    c.beginPath();
    c.arc(0, 0, 5, -0.6 * Math.PI, 0.6 * Math.PI, false);
    c.closePath();
    c.fill();
    c.strokeStyle = "#a16207";
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    // 5-Color Wire Harness Bundle Ribbon (Blue, Pink, Yellow, Orange, Red)
    const wireColors = ["#3b82f6", "#ec4899", "#eab308", "#f97316", "#ef4444"];
    wireColors.forEach((wc, i) => {
      c.strokeStyle = wc;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(cx + 18, cy - 6 + i * 3);
      c.bezierCurveTo(cx + 28, cy - 6 + i * 3, cx + 24, cy + 16 + i * 2, cx + 34, cy + 22 + i * 2);
      c.stroke();
    });

    // ULN2003 Driver Mini-Board Indicator (4 LEDs A, B, C, D)
    c.save();
    c.fillStyle = "#1e293b";
    c.beginPath();
    c.roundRect(cx - 30, cy + 22, 28, 14, [2, 2, 2, 2]);
    c.fill();
    for (let p = 0; p < 4; p++) {
      const ledX = cx - 26 + p * 6;
      const ledY = cy + 29;
      const isLit = (phase % 4) === p;
      c.fillStyle = isLit ? "#ef4444" : "#475569";
      if (isLit) {
        c.shadowColor = "#ef4444";
        c.shadowBlur = 6;
      } else {
        c.shadowBlur = 0;
      }
      c.beginPath();
      c.arc(ledX, ledY, 1.8, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    c.fillStyle = "#0f172a";
    c.font = "bold 7.5px sans-serif";
    c.textAlign = "center";
    c.fillText(`STEPPER: ${Math.round(angleDeg % 360)}°`, cx, cy + 44);
    c.textAlign = "left";
  }

  // Draw realistic DuPont 2.54mm connector housing sleeve
  function drawDuPontHousing(c, x, y, isTop = true, color = "#ef4444") {
    c.save();
    // Silver pin entering socket
    c.fillStyle = "#cbd5e1";
    c.fillRect(x - 1.2, isTop ? y - 3 : y + 1, 2.4, 3);

    // DuPont black plastic sleeve body
    c.shadowColor = "rgba(0, 0, 0, 0.45)";
    c.shadowBlur = 4;
    c.shadowOffsetY = 1;
    c.fillStyle = "#0f172a";
    c.beginPath();
    c.roundRect(x - 3, y - 4, 6, 8, [1.5, 1.5, 1.5, 1.5]);
    c.fill();
    c.shadowColor = "transparent";

    // Housing outer crimp border
    c.strokeStyle = "#334155";
    c.lineWidth = 0.8;
    c.stroke();

    // Central retention notch
    c.fillStyle = "#1e293b";
    c.fillRect(x - 1.2, y - 1, 2.4, 2);

    // Colored strain-relief collar
    c.fillStyle = color;
    c.fillRect(x - 2, isTop ? y + 2 : y - 4, 4, 2);
    c.restore();
  }

  // Draw Realistic Curved Jumper Wires connecting Arduino to Breadboard
  function drawJumperWires(c) {
    if (!c) return;
    c.save();

    // 1. Draw existing connected wires
    const wires = state.wires || [];
    wires.forEach((w, idx) => {
      const b = getWireBezier(w, idx);

      // (a) Soft ambient contact shadow on PCB / bench mat
      c.strokeStyle = "rgba(0, 0, 0, 0.38)";
      c.lineWidth = 4.2;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(w.sx, w.sy + 3);
      c.bezierCurveTo(b.cp1x, b.cp1y + 6, b.cp2x, b.cp2y + 6, w.ex, w.ey + 3);
      c.stroke();

      // (b) DuPont rectangular sleeve housings at both ends
      drawDuPontHousing(c, w.sx, w.sy, w.sy < 200, w.color);
      drawDuPontHousing(c, w.ex, w.ey, w.ey < 200, w.color);

      // (c) Colored insulated jacket
      c.strokeStyle = w.color || "#ef4444";
      c.lineWidth = 3.6;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(w.sx, w.sy);
      c.bezierCurveTo(b.cp1x, b.cp1y, b.cp2x, b.cp2y, w.ex, w.ey);
      c.stroke();

      // (d) Specular glossy highlight along upper crest
      c.strokeStyle = "rgba(255, 255, 255, 0.4)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(w.sx, w.sy - 0.8);
      c.bezierCurveTo(b.cp1x, b.cp1y - 0.8, b.cp2x, b.cp2y - 0.8, w.ex, w.ey - 0.8);
      c.stroke();

      // (e) Highlight if hovered in wire mode
      if (state.isWireMode && state.hoveredWireIndex === idx) {
        c.strokeStyle = "#f43f5e";
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(w.sx, w.sy);
        c.bezierCurveTo(b.cp1x, b.cp1y, b.cp2x, b.cp2y, w.ex, w.ey);
        c.stroke();

        // Draw small unplug badge near midpoint
        c.fillStyle = "rgba(239, 68, 68, 0.95)";
        c.shadowColor = "rgba(0,0,0,0.6)";
        c.shadowBlur = 6;
        c.beginPath();
        c.roundRect(b.midX - 22, b.midY - 10, 44, 20, [4, 4, 4, 4]);
        c.fill();
        c.shadowColor = "transparent";
        c.fillStyle = "#ffffff";
        c.font = "bold 9px system-ui, -apple-system, sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("✂ Cut", b.midX, b.midY);
      }
    });

    // 2. Active wire drawing rubberband
    if (state.wireDrawing && state.wireDrawing.active) {
      const wd = state.wireDrawing;
      const dx = wd.curX - wd.sx;
      const dy = wd.curY - wd.sy;
      const dist = Math.hypot(dx, dy);
      const baseMinY = Math.min(wd.sy, wd.curY);
      const archH = Math.max(10, Math.min(baseMinY - 48, dist * 0.18));
      const archY = Math.max(48, baseMinY - archH);
      const cp1x = wd.sx + dx * 0.3;
      const cp1y = archY;
      const cp2x = wd.sx + dx * 0.7;
      const cp2y = archY;

      // Pulsing animated dashed wire preview
      c.setLineDash([6, 4]);
      c.strokeStyle = wd.color || state.activeWireColor || "#38bdf8";
      c.lineWidth = 3.2;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(wd.sx, wd.sy);
      c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, wd.curX, wd.curY);
      c.stroke();
      c.setLineDash([]);

      // Start pin halo
      c.fillStyle = wd.color || "#38bdf8";
      c.beginPath();
      c.arc(wd.sx, wd.sy, 4, 0, Math.PI * 2);
      c.fill();

      // Current tip cursor halo
      c.strokeStyle = "#ffffff";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(wd.curX, wd.curY, 6, 0, Math.PI * 2);
      c.stroke();
    }

    // 3. Pin highlight when hovered in wire mode or interacting
    if (state.hoveredPin) {
      const hp = state.hoveredPin;
      c.save();
      c.strokeStyle = "#22d3ee";
      c.lineWidth = 2;
      c.shadowColor = "#38bdf8";
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(hp.x, hp.y, 7, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    c.restore();
  }

  // -------------------------------------------------------------------------
  // Serial Waveform Plotter & Dual-Channel DSO Canvas Rendering
  // -------------------------------------------------------------------------
  function drawPlotterWaveforms() {
    if (!plotterCtx || !plotterCanvas) return;
    const pw = plotterCanvas.width;
    const ph = plotterCanvas.height;

    plotterCtx.clearRect(0, 0, pw, ph);

    // 1. Deep Oscilloscope Phosphor Graticule Screen Background
    plotterCtx.fillStyle = "#020409";
    plotterCtx.fillRect(0, 0, pw, ph);

    // Sub-division dimensions (10 horizontal div × 8 vertical div)
    const numDivX = 10;
    const numDivY = 8;
    const divW = pw / numDivX;
    const divH = ph / numDivY;

    // Major Grid Lines
    plotterCtx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    plotterCtx.lineWidth = 1;
    for (let x = 0; x <= pw; x += divW) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(x, 0);
      plotterCtx.lineTo(x, ph);
      plotterCtx.stroke();
    }
    for (let y = 0; y <= ph; y += divH) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(0, y);
      plotterCtx.lineTo(pw, y);
      plotterCtx.stroke();
    }

    // Central Major Axes Crosshair with Sub-division Tick Marks (5 ticks/div)
    const midX = pw / 2;
    const midY = ph / 2;
    plotterCtx.strokeStyle = "rgba(56, 189, 248, 0.28)";
    plotterCtx.lineWidth = 1.2;

    plotterCtx.beginPath();
    plotterCtx.moveTo(midX, 0);
    plotterCtx.lineTo(midX, ph);
    plotterCtx.moveTo(0, midY);
    plotterCtx.lineTo(pw, midY);
    plotterCtx.stroke();

    // Central axis sub-ticks
    plotterCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    const tickLen = 3;
    for (let x = 0; x <= pw; x += divW / 5) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(x, midY - tickLen);
      plotterCtx.lineTo(x, midY + tickLen);
      plotterCtx.stroke();
    }
    for (let y = 0; y <= ph; y += divH / 5) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(midX - tickLen, y);
      plotterCtx.lineTo(midX + tickLen, y);
      plotterCtx.stroke();
    }

    // Ground reference indicators on left margin:
    const ch1GndY = ph - 18;
    plotterCtx.fillStyle = "#38bdf8";
    plotterCtx.beginPath();
    plotterCtx.moveTo(2, ch1GndY - 4);
    plotterCtx.lineTo(8, ch1GndY);
    plotterCtx.lineTo(2, ch1GndY + 4);
    plotterCtx.closePath();
    plotterCtx.fill();
    plotterCtx.font = "bold 8px sans-serif";
    plotterCtx.fillText("1", 10, ch1GndY + 3);

    // CH2 GND at y = ph - 18
    plotterCtx.fillStyle = "#facc15";
    plotterCtx.beginPath();
    plotterCtx.moveTo(2, ch1GndY - 14);
    plotterCtx.lineTo(8, ch1GndY - 10);
    plotterCtx.lineTo(2, ch1GndY - 6);
    plotterCtx.closePath();
    plotterCtx.fill();
    plotterCtx.fillText("2", 10, ch1GndY - 7);

    // Trigger level indicator on right margin
    const trigY = ph / 2;
    plotterCtx.fillStyle = "#f59e0b";
    plotterCtx.beginPath();
    plotterCtx.moveTo(pw - 2, trigY - 4);
    plotterCtx.lineTo(pw - 8, trigY);
    plotterCtx.lineTo(pw - 2, trigY + 4);
    plotterCtx.closePath();
    plotterCtx.fill();
    plotterCtx.font = "bold 8px sans-serif";
    plotterCtx.fillText("T", pw - 18, trigY + 3);

    const pts = state.waveformPoints;
    if (!pts || pts.length < 2) return;

    // Timebase and scaling
    const vPerDiv1 = state.dso?.voltsPerDiv1 || 1.0;
    const vPerDiv2 = state.dso?.voltsPerDiv2 || 1.0;
    const totalVRange1 = vPerDiv1 * 8;
    const totalVRange2 = vPerDiv2 * 8;

    const numPoints = Math.min(pts.length, 250);
    const startIdx = pts.length - numPoints;

    // 2. Render Channel 1 Trace (Cyan #38bdf8) with Phosphorescent Bloom
    plotterCtx.save();
    plotterCtx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    plotterCtx.lineWidth = 4.5;
    plotterCtx.lineJoin = "round";
    plotterCtx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const pt = pts[startIdx + i];
      const x = (i / (numPoints - 1)) * pw;
      const v = pt.ch1 !== undefined ? pt.ch1 : (pt.pin13 ? 5.0 : 0.0);
      const normV = Math.max(0, Math.min(1.0, v / totalVRange1));
      const y = ch1GndY - normV * (ph - 36);
      if (i === 0) plotterCtx.moveTo(x, y);
      else plotterCtx.lineTo(x, y);
    }
    plotterCtx.stroke();

    // Pass 2: Core Electron Beam
    plotterCtx.strokeStyle = "#38bdf8";
    plotterCtx.lineWidth = 1.8;
    plotterCtx.stroke();
    plotterCtx.restore();

    // 3. Render Channel 2 Trace (Amber #facc15) with Phosphorescent Bloom
    plotterCtx.save();
    plotterCtx.strokeStyle = "rgba(250, 204, 21, 0.25)";
    plotterCtx.lineWidth = 4.5;
    plotterCtx.lineJoin = "round";
    plotterCtx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const pt = pts[startIdx + i];
      const x = (i / (numPoints - 1)) * pw;
      const v = pt.ch2 !== undefined ? pt.ch2 : ((pt.pot / 1023) * 5.0);
      const normV = Math.max(0, Math.min(1.0, v / totalVRange2));
      const y = (ch1GndY - 10) - normV * (ph - 36);
      if (i === 0) plotterCtx.moveTo(x, y);
      else plotterCtx.lineTo(x, y);
    }
    plotterCtx.stroke();

    // Pass 2: Core Electron Beam
    plotterCtx.strokeStyle = "#facc15";
    plotterCtx.lineWidth = 1.8;
    plotterCtx.stroke();
    plotterCtx.restore();

    // 4. Calculate Live Analytical Telemetry for Probes
    let ch1Min = Infinity, ch1Max = -Infinity, ch1SumSq = 0;
    let ch2Min = Infinity, ch2Max = -Infinity, ch2SumSq = 0;
    let highCount1 = 0;

    for (let i = 0; i < numPoints; i++) {
      const pt = pts[startIdx + i];
      const v1 = pt.ch1 !== undefined ? pt.ch1 : (pt.pin13 ? 5.0 : 0.0);
      const v2 = pt.ch2 !== undefined ? pt.ch2 : ((pt.pot / 1023) * 5.0);

      if (v1 < ch1Min) ch1Min = v1;
      if (v1 > ch1Max) ch1Max = v1;
      ch1SumSq += v1 * v1;
      if (v1 > 2.5) highCount1++;

      if (v2 < ch2Min) ch2Min = v2;
      if (v2 > ch2Max) ch2Max = v2;
      ch2SumSq += v2 * v2;
    }

    const ch1Vpp = Math.max(0, ch1Max - ch1Min);
    const ch1Vrms = Math.sqrt(ch1SumSq / numPoints);
    const dutyPercent = Math.round((highCount1 / numPoints) * 100);

    const ch2Vpp = Math.max(0, ch2Max - ch2Min);
    const ch2Vrms = Math.sqrt(ch2SumSq / numPoints);

    // Update DSO Telemetry Badges in DOM
    const dsoMetricsCh1 = document.getElementById("dso-metrics-ch1");
    const dsoMetricsCh2 = document.getElementById("dso-metrics-ch2");
    if (dsoMetricsCh1) {
      dsoMetricsCh1.textContent = `CH1 (${state.dso?.ch1Probe || "pin13"}): Vpp = ${ch1Vpp.toFixed(2)}V | Vrms = ${ch1Vrms.toFixed(2)}V | Duty = ${dutyPercent}%`;
    }
    if (dsoMetricsCh2) {
      dsoMetricsCh2.textContent = `CH2 (${state.dso?.ch2Probe || "pot"}): Vpp = ${ch2Vpp.toFixed(2)}V | Vrms = ${ch2Vrms.toFixed(2)}V | Max = ${ch2Max.toFixed(2)}V`;
    }
  }

  // Start Animation Frame Loop
  animationFrameId = requestAnimationFrame(renderLoop);

  // Return Master Teardown Cleanup Function
  const cleanup = function() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (canvas) {
      canvas.removeEventListener("mousedown", handleCanvasPointerDown);
      canvas.removeEventListener("mousemove", handleCanvasPointerMove);
      canvas.removeEventListener("mouseup", handleCanvasPointerUp);
      canvas.removeEventListener("mouseleave", handleCanvasPointerLeave);
      canvas.removeEventListener("touchstart", handleCanvasPointerDown);
      canvas.removeEventListener("touchmove", handleCanvasPointerMove);
      canvas.removeEventListener("touchend", handleCanvasPointerUp);
      canvas.removeEventListener("touchcancel", handleCanvasPointerLeave);
    }
    audio.destroy();
  };

  cleanup.state = state;
  _currentArduinoCleanup = cleanup;
  return cleanup;
}
