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
  },
  {
    id: "rgb_mood_lamp",
    title: "7. Interactive RGB Color Mixer & Mood Lamp",
    category: "Color Science & Multi-Channel PWM",
    description: "4-pin common cathode RGB LED with triple PWM channel color mixing (Red, Green, Blue) modulated by ambient light.",
    circuitWiring: [
      { from: "~D9", to: "RGB Red Anode (via 220Ω)", color: "#ef4444" },
      { from: "~D10", to: "RGB Green Anode (via 220Ω)", color: "#10b981" },
      { from: "~D11", to: "RGB Blue Anode (via 220Ω)", color: "#3b82f6" },
      { from: "GND", to: "RGB Common Cathode", color: "#0f172a" },
      { from: "A0", to: "Hue Potentiometer Wiper", color: "#f59e0b" },
      { from: "A1", to: "LDR Ambient Sensor", color: "#34d399" }
    ],
    code: `// Edugates STEM - Experiment 7: Interactive RGB Color Mixer
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
    id: "dc_motor_speed",
    title: "8. PWM DC Motor Fan & Thermal Cooling Rig",
    category: "Electromechanics & Transistor Drivers",
    description: "High-current DC motor with aerodynamic propeller fan regulated by PWM speed and thermal thresholds.",
    circuitWiring: [
      { from: "~D5", to: "NPN Transistor Base / PWM", color: "#38bdf8" },
      { from: "D7", to: "Songle Relay Control Pin", color: "#3b82f6" },
      { from: "A0", to: "Speed Potentiometer", color: "#f59e0b" },
      { from: "A2", to: "TMP36 Temperature Sensor", color: "#ec4899" },
      { from: "5V", to: "Relay & Motor VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 8: DC Motor Fan Cooling System
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
    id: "pir_alarm",
    title: "9. PIR Motion Intruder Security Alarm",
    category: "Security Systems & Digital Sensors",
    description: "Pyroelectric infrared (PIR) motion sensor detecting thermal movement with piezoelectric siren and relay switching.",
    circuitWiring: [
      { from: "D2", to: "PIR Motion Sensor Out", color: "#10b981" },
      { from: "D8", to: "Piezo Siren Buzzer (+)", color: "#c084fc" },
      { from: "D7", to: "Relay Module Trigger", color: "#38bdf8" },
      { from: "D13", to: "Strobe Warning LED", color: "#ef4444" },
      { from: "5V", to: "PIR & Relay VCC", color: "#dc2626" },
      { from: "GND", to: "Common Ground Rail", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 9: PIR Motion Intruder Alarm
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
    id: "seven_seg_counter",
    title: "10. Digital 7-Segment Decimal Decade Counter",
    category: "Digital Logic & Numerical Multiplexing",
    description: "Direct segment mapping (A-G + DP) counting 0 through 9 with tactile step button and auto-increment clock.",
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
  {
    id: "joystick_pan_tilt",
    title: "11. 2-Axis Thumbstick & Servo Pan-Tilt Rig",
    category: "Human Interface Devices (HID) & Robotics",
    description: "Dual-axis analog potentiometer thumbstick controlling SG90 servo position and center-click laser/buzzer trigger.",
    circuitWiring: [
      { from: "A0", to: "Joystick X-Axis (VRx)", color: "#38bdf8" },
      { from: "A1", to: "Joystick Y-Axis (VRy)", color: "#10b981" },
      { from: "D2", to: "Joystick Pushbutton (SW)", color: "#facc15" },
      { from: "~D6", to: "SG90 Servo PWM Signal", color: "#fb923c" },
      { from: "D8", to: "Laser/Trigger Buzzer", color: "#c084fc" },
      { from: "5V", to: "Joystick & Servo VCC", color: "#ef4444" },
      { from: "GND", to: "Common Ground", color: "#0f172a" }
    ],
    code: `// Edugates STEM - Experiment 11: 2-Axis Thumbstick Servo Director
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
    id: "custom_sandbox",
    title: "12. 🛠️ Custom Project Builder & Breadboard Sandbox",
    category: "Freeform Engineering & Breadboard Prototyping",
    description: "Interactive open sandbox: place any components from the Parts Bin onto the breadboard, customize wiring, and write your own C++ sketch!",
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
  { type: "lcd_1602", name: "16x2 Character LCD", category: "Passive & Display", defaultPin: "A4,A5", icon: "📺", color: "#047857", desc: "HD44780 controller alphanumeric display with backlit cyan matrix" }
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

  function getInteractiveTarget(cx, cy) {
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
      if (cx >= 656 && cx <= 696 && cy >= 126 && cy <= 166) {
        return {
          id: "button",
          label: "Crosswalk Request Pushbutton (Pin D2)",
          cursor: "pointer",
          box: { x: 660, y: 130, w: 32, h: 32 },
          center: { x: 676, y: 146 }
        };
      }
      if (Math.hypot(cx - 748, cy - 148) <= 24) {
        return {
          id: "buzzer",
          label: "Piezo Acoustic Transducer (Pin D8)",
          cursor: "pointer",
          circle: { x: 748, y: 148, r: 22 },
          center: { x: 748, y: 148 }
        };
      }
      if (Math.hypot(cx - 490, cy - 135) <= 14) {
        return { id: "led_red", label: "Stop LED - Red (Pin D13)", cursor: "pointer", circle: { x: 490, y: 135, r: 14 }, center: { x: 490, y: 135 } };
      }
      if (Math.hypot(cx - 540, cy - 135) <= 14) {
        return { id: "led_yellow", label: "Caution LED - Yellow (Pin D12)", cursor: "pointer", circle: { x: 540, y: 135, r: 14 }, center: { x: 540, y: 135 } };
      }
      if (Math.hypot(cx - 590, cy - 135) <= 14) {
        return { id: "led_green", label: "Go LED - Green (Pin D11)", cursor: "pointer", circle: { x: 590, y: 135, r: 14 }, center: { x: 590, y: 135 } };
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
    } else if (expId === "custom_sandbox") {
      if (state.components.customPlacedComponents && state.components.customPlacedComponents.length > 0) {
        for (let i = state.components.customPlacedComponents.length - 1; i >= 0; i--) {
          const comp = state.components.customPlacedComponents[i];
          const px = 450 + comp.x;
          const py = 60 + comp.y;
          if (Math.hypot(cx - px, cy - py) <= 25) {
            return {
              id: comp.id,
              customComp: comp,
              label: `${comp.label} (Pin ${comp.pin})`,
              cursor: "pointer",
              circle: { x: px, y: py, r: 24 },
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
    if (!target) return;

    if (e.type === "touchstart") {
      e.preventDefault();
    }

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
    } else if (target.customComp) {
      const comp = target.customComp;
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
        audio.playTactileClick(false);
        addSerialLog(`${comp.label}: Pin ${comp.pin} tested`);
      }
    } else if (target.id.startsWith("led_")) {
      audio.playTactileClick(false);
      addSerialLog(`${target.label} probed: Continuity verified`);
    }
  }

  function handleCanvasPointerMove(e) {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (isDraggingPot && potDragCenter) {
      if (e.type === "touchmove") e.preventDefault();
      updatePotValueFromCoords(coords.x, coords.y, potDragCenter);
      return;
    }

    hoveredTarget = getInteractiveTarget(coords.x, coords.y);
    if (canvas) {
      canvas.style.cursor = hoveredTarget ? (hoveredTarget.cursor || "pointer") : "default";
    }
  }

  function handleCanvasPointerUp() {
    if (activeCanvasButton) {
      handleButtonUp();
      activeCanvasButton = false;
    }
    isDraggingPot = false;
    potDragCenter = null;
  }

  function handleCanvasPointerLeave() {
    if (activeCanvasButton) {
      handleButtonUp();
      activeCanvasButton = false;
    }
    isDraggingPot = false;
    potDragCenter = null;
    hoveredTarget = null;
    if (canvas) canvas.style.cursor = "default";
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
    } else if (expId === "custom_sandbox") {
      // 12. Freeform Custom Breadboard Sandbox
      state.components.pin13Led = (Math.floor(t / 1000) % 2 === 0);
      if (state.components.motorSpeed > 0) {
        state.components.currentMotorAngle += (state.components.motorSpeed / 255) * (stepMs / 1000) * 30;
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

    // 5. Draw Canvas Interactive Hover Highlights & Component Tooltips
    drawCanvasInteractions(ctx);
  }

  // Render Canvas Hover Feedback & Interactive Cues
  function drawCanvasInteractions(c) {
    if (!c) return;

    // Persistent interactive hint pill on workbench mat
    c.save();
    c.fillStyle = "rgba(15, 23, 42, 0.75)";
    c.strokeStyle = "rgba(56, 189, 248, 0.25)";
    c.lineWidth = 1;
    c.beginPath();
    c.roundRect(14, 12, 280, 22, [4, 4, 4, 4]);
    c.fill();
    c.stroke();

    c.fillStyle = "#94a3b8";
    c.font = "10px system-ui, -apple-system, sans-serif";
    c.fillText("⚡ Interactive Workbench: Click & touch hardware components directly", 22, 27);
    c.restore();

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

    } else if (expId === "rgb_mood_lamp") {
      // 4-pin RGB LED
      drawRgbLed(c, bx + 120, by + 80, state.components.rgbColor, "RGB (D9/10/11)");
      // 220Ω Limiting Resistors
      drawResistor(c, bx + 40, by + 120, 220, "220Ω");
      drawResistor(c, bx + 70, by + 120, 220, "220Ω");
      drawResistor(c, bx + 100, by + 120, 220, "220Ω");
      // Potentiometer
      drawPotTrim(c, bx + 270, by + 75, state.components.potValue, "HUE (A0)");

    } else if (expId === "dc_motor_speed") {
      // DC Motor with Propeller Fan
      drawDcMotorFan(c, bx + 110, by + 85, state.components.motorSpeed, state.components.currentMotorAngle);
      // Flyback Diode & Transistor Driver
      drawTransistorPackage(c, bx + 220, by + 80);
      // Speed Potentiometer
      drawPotTrim(c, bx + 300, by + 75, state.components.potValue, "THROTTLE");

    } else if (expId === "pir_alarm") {
      // HC-SR501 PIR Sensor
      drawPirSensor(c, bx + 70, by + 70, state.components.pirMotionDetected);
      // Songle 5V Relay
      drawRelayModule(c, bx + 180, by + 65, state.components.relayActive);
      // Strobe LED & Piezo Siren
      drawLargeLed(c, bx + 280, by + 80, "#ef4444", state.components.pin13Led, "ALARM (D13)");
      drawPiezoBuzzer(c, bx + 335, by + 80, state.components.pirMotionDetected);

    } else if (expId === "seven_seg_counter") {
      // 7-Segment Decimal Display
      drawSevenSegment(c, bx + 120, by + 55, state.components.sevenSegDigit);
      // Reset Button
      drawTactileSwitch(c, bx + 250, by + 75, state.components.buttonPressed, "RESET (D2)");
      drawResistor(c, bx + 45, by + 80, 220, "220Ω Array");

    } else if (expId === "joystick_pan_tilt") {
      // 2-Axis Thumbstick Joystick
      drawJoystickModule(c, bx + 80, by + 70, state.components.potValue, 512, state.components.buttonPressed);
      // Pan Servo
      drawServoMotor(c, bx + 240, by + 95, state.components.currentServoAngle);

    } else if (expId === "custom_sandbox") {
      // Custom Project Sandbox: Render custom placed components
      if (state.components.customPlacedComponents && state.components.customPlacedComponents.length > 0) {
        state.components.customPlacedComponents.forEach(comp => {
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
              drawResistor(c, cx, cy, comp.state?.value || 220, comp.label);
              break;
            case "pushbutton":
              drawTactileSwitch(c, cx, cy, state.components.buttonPressed || comp.state?.pressed, comp.label);
              break;
            case "slide_switch":
              drawSlideSwitch(c, cx, cy, state.components.toggleSwitchOn, comp.label);
              break;
            case "potentiometer":
              drawPotTrim(c, cx, cy, state.components.potValue, comp.label);
              break;
            case "piezo_buzzer":
              drawPiezoBuzzer(c, cx, cy, state.components.pin13Led, false, comp.label);
              break;
            case "ultrasonic_sonar":
              drawUltrasonicModule(c, cx, cy, state.components.obstacleDistCm);
              break;
            case "ldr_sensor":
              drawLdrComponent(c, cx, cy, state.components.ldrLux);
              break;
            case "tmp36_temp":
              drawTmp36Sensor(c, cx, cy, state.components.temperatureC);
              break;
            case "servo_motor":
              drawServoMotor(c, cx, cy, state.components.currentServoAngle);
              break;
            case "dc_motor_fan":
              drawDcMotorFan(c, cx, cy, state.components.motorSpeed, state.components.currentMotorAngle);
              break;
            case "relay_module":
              drawRelayModule(c, cx, cy, state.components.relayActive);
              break;
            case "seven_segment":
              drawSevenSegment(c, cx, cy, state.components.sevenSegDigit);
              break;
            case "pir_motion":
              drawPirSensor(c, cx, cy, state.components.pirMotionDetected);
              break;
            case "joystick_thumb":
              drawJoystickModule(c, cx, cy, state.components.potValue, 512, state.components.buttonPressed);
              break;
            case "lcd_16x2":
              drawLcdModule(c, cx, cy, state.components.lcdLines);
              break;
            default:
              drawLargeLed(c, cx, cy, "#38bdf8", true, comp.label);
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
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(text, lx - 20, ly + 42);
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
      c.fillStyle = "#0f172a";
      c.font = "bold 8px sans-serif";
      c.fillText(label, sx - 4, sy + 46);
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

    c.fillStyle = "#0f172a";
    c.font = "bold 8px sans-serif";
    c.fillText(label, px - 6, py + 50);
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

  _currentArduinoCleanup = cleanup;
  return cleanup;
}
