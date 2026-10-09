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

  destroy() {
    this.stopBuzzer();
    this.stopServo();
  }
}

// ---------------------------------------------------------------------------
// 6 Guided Educational Arduino Experiments & Sketches
// ---------------------------------------------------------------------------
export const ARDUINO_EXPERIMENTS = [
  {
    id: "traffic_light",
    title: "1. Traffic Light & Crosswalk Assist",
    category: "Digital I/O & State Machines",
    description: "Multi-LED sequence with pedestrian crosswalk button trigger, visual transitions, and warning beeper.",
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
    id: "ultrasonic_radar",
    title: "2. Ultrasonic Distance Radar & Parking Assist",
    category: "Sensors & Time-of-Flight",
    description: "HC-SR04 sonar pulses measure obstacle distance (2–400 cm) with adaptive acoustic pitch and proximity alert.",
    circuitWiring: [
      { from: "D9", to: "HC-SR04 Trig", color: "#38bdf8" },
      { from: "D10", to: "HC-SR04 Echo", color: "#facc15" },
      { from: "D8", to: "Piezo Buzzer (+)", color: "#c084fc" },
      { from: "D13", to: "Warning Red LED", color: "#ef4444" },
      { from: "5V", to: "HC-SR04 VCC", color: "#dc2626" },
      { from: "GND", to: "HC-SR04 GND", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 2: Ultrasonic Radar & Reverse Assist
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
    id: "ldr_nightlight",
    title: "3. Smart LDR Nightlight & PWM Dimmer",
    category: "Analog Input & PWM Regulation",
    description: "Photoresistor voltage divider triggers automatic illumination with smooth PWM brightness modulation.",
    circuitWiring: [
      { from: "A1", to: "LDR Voltage Divider", color: "#34d399" },
      { from: "A0", to: "Potentiometer Wiper", color: "#38bdf8" },
      { from: "~D9", to: "PWM LED Anode", color: "#f43f5e" },
      { from: "5V", to: "10k Resistor & Pot", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 3: Smart LDR Nightlight
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
    id: "servo_control",
    title: "4. Micro-Servo Angle Sweeper & Joy-Dial",
    category: "PWM Actuators & Robotics",
    description: "SG90 micro-servo motor precisely controlled via 10k potentiometer dial with gear sound acoustics.",
    circuitWiring: [
      { from: "A0", to: "Potentiometer Wiper", color: "#f59e0b" },
      { from: "~D6", to: "SG90 Servo PWM Signal", color: "#fb923c" },
      { from: "5V", to: "Servo VCC (Red)", color: "#ef4444" },
      { from: "GND", to: "Servo GND (Brown)", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 4: Servo Motor Angle Steering
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
    id: "chiptune_melody",
    title: "5. 8-Bit Chiptune Musical Jukebox",
    category: "Audio Synthesis & Microsecond Frequencies",
    description: "Piezoelectric transducer synthesized with real mathematical square waves playing classic 8-bit melodies.",
    circuitWiring: [
      { from: "D8", to: "Piezo Buzzer (+)", color: "#818cf8" },
      { from: "D2", to: "Song Next Button", color: "#38bdf8" },
      { from: "D13", to: "Tempo Beat LED", color: "#fbbf24" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 5: 8-Bit Chiptune Jukebox
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
    id: "weather_station",
    title: "6. Smart LCD Weather Station & Overheat Alarm",
    category: "I2C Displays & Environmental Sensors",
    description: "TMP36 precision temperature sensor with 16x2 LCD display readout, Celsius conversion, and siren alert.",
    circuitWiring: [
      { from: "A2", to: "TMP36 Vout (Pin 2)", color: "#06b6d4" },
      { from: "A4", to: "I2C LCD SDA", color: "#38bdf8" },
      { from: "A5", to: "I2C LCD SCL", color: "#a855f7" },
      { from: "D8", to: "Alarm Buzzer (+)", color: "#f43f5e" },
      { from: "5V", to: "TMP36 & LCD VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#1e293b" }
    ],
    code: `// Edugates STEM - Experiment 6: Smart Weather Station
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
  }
];

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
      potValue: 512,      // 0 - 1023
      ldrLux: 450,        // 0 - 1000 lux
      obstacleDistCm: 25, // 2 - 400 cm
      servoAngle: 90,     // 0 - 180 deg
      currentServoAngle: 90,
      temperatureC: 24.5, // -40 to 125 C
      lcdLines: ["Edugates STEM Lab", "Arduino Uno R3"]
    },
    serialLogs: [
      "[00:00.000] Arduino Uno R3 Bootloader v4.4 OK",
      "[00:00.040] ATmega328P Clock: 16.000 MHz",
      "[00:00.080] Serial initialized @ 9600 baud"
    ],
    waveformPoints: []
  };

  let animationFrameId = null;
  let lastFrameTime = performance.now();
  let loopTimer = 0;
  let serialChirpThrottle = 0;

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
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">
                Choose Laboratory Experiment:
              </span>
              <span id="exp-category-badge" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px;">
                ${ARDUINO_EXPERIMENTS[0].category}
              </span>
            </div>
            <select id="sel-arduino-exp" class="form-select" style="width: 100%; background: #0f172a; color: #f1f5f9; border: 1px solid rgba(56, 189, 248, 0.35); padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer;">
              ${ARDUINO_EXPERIMENTS.map((exp, idx) => `
                <option value="${idx}" ${idx === 0 ? "selected" : ""}>${exp.title}</option>
              `).join("")}
            </select>
            <div id="exp-desc-box" style="font-size: 0.78rem; color: #cbd5e1; margin-top: 8px; line-height: 1.4;">
              ${ARDUINO_EXPERIMENTS[0].description}
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
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            
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
                <span style="font-weight: 700; color: #f59e0b;">📏 Sonar Obstacle (HC-SR04)</span>
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

        <!-- 2. Dual-Channel Waveform Plotter View (Initially Hidden) -->
        <div id="view-serial-plotter" style="display: none; padding: 12px;">
          <div style="position: relative; height: 160px; background: #03060f; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden;">
            <canvas id="plotter-canvas" width="900" height="160" style="width: 100%; height: 100%; display: block;"></canvas>
            <div style="position: absolute; top: 8px; right: 12px; display: flex; gap: 12px; font-family: monospace; font-size: 0.72rem;">
              <span style="color: #38bdf8;">■ Ch 1: Signal Telemetry</span>
              <span style="color: #f59e0b;">■ Ch 2: Sensor / PWM</span>
            </div>
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
  // Event Bindings
  // -------------------------------------------------------------------------
  // 1. Audio Mute Toggle
  btnMute?.addEventListener("click", () => {
    const muted = audio.toggleMute();
    muteIcon.textContent = muted ? "🔇" : "🔊";
    muteLabel.textContent = muted ? "Unmute Audio" : "Sound Effects ON";
  });

  // 2. Experiment Selection
  selExp?.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value, 10) || 0;
    state.selectedExpIndex = idx;
    const exp = ARDUINO_EXPERIMENTS[idx];
    if (exp) {
      expCategoryBadge.textContent = exp.category;
      expDescBox.textContent = exp.description;
      codeEditor.value = exp.code;
      addSerialLog(`Loaded experiment: ${exp.title}`);
      audio.playUploadChime();
      resetMcuState();
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

  // 5. IDE Controls: Verify & Upload
  btnVerify?.addEventListener("click", () => {
    audio.playTactileClick(true);
    compilerLog.innerHTML = `<span style="color: #38bdf8;">⚙️ Compiling sketch.ino...</span>`;
    setTimeout(() => {
      compilerLog.innerHTML = `<span style="color: #34d399;">✓ Compilation successful! ROM: 1,428 B (4%) • RAM: 214 B (10%)</span>`;
      SoundFX.playSuccess();
    }, 350);
  });

  btnUpload?.addEventListener("click", () => {
    audio.playTactileClick(true);
    compilerLog.innerHTML = `<span style="color: #f59e0b;">⚡ Uploading to Arduino Uno via /dev/ttyACM0...</span>`;
    state.components.rxLed = true;
    setTimeout(() => { state.components.txLed = true; }, 120);
    setTimeout(() => {
      state.components.rxLed = false;
      state.components.txLed = false;
      compilerLog.innerHTML = `<span style="color: #34d399;">✓ Upload Done! Running sketch on ATmega328P.</span>`;
      audio.playUploadChime();
      addSerialLog("Sketch uploaded successfully. Program execution restarted.");
      resetMcuState();
    }, 450);
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

  // Logic Simulation for current experiment
  function updateSimulationLogic(stepMs) {
    const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex].id;
    const t = state.simTimeMs;

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
    }

    // Buffer waveform points for plotter
    if (state.waveformPoints.length > 250) state.waveformPoints.shift();
    state.waveformPoints.push({
      time: t,
      pot: state.components.potValue,
      dist: state.components.obstacleDistCm,
      ldr: state.components.ldrLux,
      temp: state.components.temperatureC,
      pin13: state.components.pin13Led,
      pwm: state.components.pin9Pwm
    });
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

  // Render Solderless Half-Size Breadboard with Interactive Components
  function drawBreadboard(c, bx, by, bw, bh) {
    // Breadboard body
    c.save();
    c.fillStyle = "#f8fafc";
    c.shadowColor = "rgba(0,0,0,0.6)";
    c.shadowBlur = 14;
    c.beginPath();
    c.roundRect(bx, by, bw, bh, [10, 10, 10, 10]);
    c.fill();
    c.restore();

    // Central trough divider
    c.fillStyle = "#e2e8f0";
    c.fillRect(bx + 15, by + bh / 2 - 6, bw - 30, 12);

    // Power Rails: Red (+) and Blue (-) lines
    c.strokeStyle = "#ef4444";
    c.lineWidth = 1.5;
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

    // Tie-point row holes (grid matrix)
    c.fillStyle = "#94a3b8";
    for (let col = 0; col < 26; col++) {
      const hx = bx + 35 + col * 12.5;
      // Top section: rows A - E
      for (let r = 0; r < 5; r++) {
        c.fillRect(hx, by + 45 + r * 14, 3, 3);
      }
      // Bottom section: rows F - J
      for (let r = 0; r < 5; r++) {
        c.fillRect(hx, by + bh / 2 + 15 + r * 14, 3, 3);
      }
    }

    // DRAW APPARATUS ON BREADBOARD BASED ON EXPERIMENT
    const expId = ARDUINO_EXPERIMENTS[state.selectedExpIndex].id;

    if (expId === "traffic_light") {
      // 1. Red, Yellow, Green 5mm LEDs on breadboard
      drawLargeLed(c, bx + 70, by + 80, "#ef4444", state.components.pin13Led, "RED (D13)");
      drawLargeLed(c, bx + 120, by + 80, "#f59e0b", state.components.pin12Led, "YELLOW (D12)");
      drawLargeLed(c, bx + 170, by + 80, "#10b981", state.components.pin11Led, "GREEN (D11)");

      // 2. Tactile Pushbutton on breadboard
      drawTactileSwitch(c, bx + 240, by + 75, state.components.buttonPressed, "CROSSWALK");

      // 3. Piezo Buzzer on breadboard
      drawPiezoBuzzer(c, bx + 310, by + 75, state.components.pin13Led);

    } else if (expId === "ultrasonic_radar") {
      // HC-SR04 Ultrasonic Distance Sensor Module
      drawUltrasonicModule(c, bx + 80, by + 70, state.components.obstacleDistCm);

      // Warning LED & Buzzer
      drawLargeLed(c, bx + 260, by + 80, "#ef4444", state.components.pin13Led, "WARN (D13)");
      drawPiezoBuzzer(c, bx + 320, by + 80, state.components.pin13Led);

    } else if (expId === "ldr_nightlight") {
      // Photoresistor (LDR)
      drawLdrComponent(c, bx + 80, by + 80, state.components.ldrLux);

      // Variable Brightness PWM LED
      const pwmAlpha = state.components.pin9Pwm / 255;
      drawLargeLed(c, bx + 180, by + 80, "#38bdf8", pwmAlpha > 0.05, `PWM ~9 (${state.components.pin9Pwm})`, pwmAlpha);

      // Potentiometer Trim on breadboard
      drawPotTrim(c, bx + 280, by + 75, state.components.potValue);

    } else if (expId === "servo_control") {
      // SG90 Micro Servo Motor
      drawServoMotor(c, bx + 130, by + 95, state.components.currentServoAngle);
      // Potentiometer
      drawPotTrim(c, bx + 300, by + 75, state.components.potValue);

    } else if (expId === "chiptune_melody") {
      // Big Piezo Speaker with musical notes
      drawPiezoBuzzer(c, bx + 160, by + 85, true, true);
      drawLargeLed(c, bx + 280, by + 85, "#f59e0b", state.components.pin13Led, "TEMPO");

    } else if (expId === "weather_station") {
      // 16x2 Character LCD on breadboard
      drawLcdModule(c, bx + 60, by + 50, state.components.lcdLines);
      // TMP36 Temp Sensor IC
      drawTmp36Sensor(c, bx + 320, by + 80, state.components.temperatureC);
    }
  }

  // Draw 5mm Diffused LED with optical bloom
  function drawLargeLed(c, lx, ly, color, isOn, text = "", brightness = 1.0) {
    c.save();
    // Metal pins
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(lx - 4, ly + 14);
    c.lineTo(lx - 4, ly + 28);
    c.moveTo(lx + 4, ly + 14);
    c.lineTo(lx + 4, ly + 28);
    c.stroke();

    // 5mm Epoxy Dome
    c.beginPath();
    c.arc(lx, ly, 10, Math.PI, 0, false);
    c.rect(lx - 10, ly, 20, 8);
    c.closePath();

    if (isOn) {
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 22 * brightness;
      c.fill();
      // Internal die hot spot
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(lx, ly + 2, 4, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = "rgba(148, 163, 184, 0.4)";
      c.fill();
    }
    c.restore();

    if (text) {
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(text, lx - 20, ly + 40);
    }
  }

  // Draw Square Tactile Pushbutton
  function drawTactileSwitch(c, sx, sy, isPressed, label = "") {
    c.fillStyle = "#1e293b";
    c.beginPath();
    c.roundRect(sx, sy, 32, 32, [4, 4, 4, 4]);
    c.fill();

    // Button center actuator
    c.fillStyle = isPressed ? "#0284c7" : "#0ea5e9";
    c.beginPath();
    c.arc(sx + 16, sy + 16, isPressed ? 8 : 10, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(label, sx - 4, sy + 46);
  }

  // Draw Piezoelectric Acoustic Transducer (Buzzer)
  function drawPiezoBuzzer(c, px, py, isBeeping, isMusical = false) {
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

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText("BUZZER (D8)", px - 6, py + 50);
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

  // Draw Realistic Curved Jumper Wires connecting Arduino to Breadboard
  function drawJumperWires(c) {
    c.save();
    c.lineWidth = 3.5;
    c.lineCap = "round";

    const wires = [
      // 5V Power (Red)
      { sx: 185, sy: 380, ex: 450, ey: 85, color: "#ef4444" },
      // Ground (Black)
      { sx: 215, sy: 380, ex: 460, ey: 100, color: "#0f172a" },
      // Signal wire (D13 Red LED)
      { sx: 310, sy: 70, ex: 490, ey: 120, color: "#38bdf8" },
      // Signal wire (D8 Buzzer)
      { sx: 245, sy: 70, ex: 730, ey: 120, color: "#a855f7" }
    ];

    wires.forEach(w => {
      c.strokeStyle = w.color;
      c.beginPath();
      c.moveTo(w.sx, w.sy);
      const cx1 = w.sx + (w.ex - w.sx) * 0.5;
      const cy1 = Math.min(w.sy, w.ey) - 40;
      c.quadraticCurveTo(cx1, cy1, w.ex, w.ey);
      c.stroke();
    });
    c.restore();
  }

  // -------------------------------------------------------------------------
  // Serial Waveform Plotter Canvas Rendering
  // -------------------------------------------------------------------------
  function drawPlotterWaveforms() {
    if (!plotterCtx || !plotterCanvas) return;
    const pw = plotterCanvas.width;
    const ph = plotterCanvas.height;

    plotterCtx.clearRect(0, 0, pw, ph);

    // Plotter dark background & grid
    plotterCtx.fillStyle = "#03060f";
    plotterCtx.fillRect(0, 0, pw, ph);

    plotterCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    plotterCtx.lineWidth = 1;
    for (let x = 0; x < pw; x += 50) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(x, 0);
      plotterCtx.lineTo(x, ph);
      plotterCtx.stroke();
    }
    for (let y = 0; y < ph; y += 30) {
      plotterCtx.beginPath();
      plotterCtx.moveTo(0, y);
      plotterCtx.lineTo(pw, y);
      plotterCtx.stroke();
    }

    // Draw Channel 1 (Cyan): Pot / Signal Telemetry
    if (state.waveformPoints.length > 1) {
      plotterCtx.strokeStyle = "#38bdf8";
      plotterCtx.lineWidth = 2;
      plotterCtx.beginPath();
      state.waveformPoints.forEach((pt, i) => {
        const x = (i / 250) * pw;
        const normVal = pt.pot / 1023; // 0 to 1
        const y = ph - (normVal * (ph - 20) + 10);
        if (i === 0) plotterCtx.moveTo(x, y);
        else plotterCtx.lineTo(x, y);
      });
      plotterCtx.stroke();

      // Draw Channel 2 (Amber): Pin 13 / Sonar Distance
      plotterCtx.strokeStyle = "#f59e0b";
      plotterCtx.lineWidth = 1.5;
      plotterCtx.beginPath();
      state.waveformPoints.forEach((pt, i) => {
        const x = (i / 250) * pw;
        const normVal = Math.min(1.0, pt.dist / 150);
        const y = ph - (normVal * (ph - 20) + 10);
        if (i === 0) plotterCtx.moveTo(x, y);
        else plotterCtx.lineTo(x, y);
      });
      plotterCtx.stroke();
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
    audio.destroy();
  };

  _currentArduinoCleanup = cleanup;
  return cleanup;
}
