// Edugates-ClipSAT Science Labs - Master 36 Virtual Laboratories Lifecycle & Teardown Test Suite
// Verifies all 36 STEM workbenches can mount into the DOM, initialize 2D/Canvas contexts,
// run simulation frames without exception, and cleanly execute their teardown functions.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🔬 Master 36 Virtual Laboratories Lifecycle Test Suite");
console.log("========================================================\n");

class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = "";
    this.width = 100;
    this.height = 100;
    this.complete = true;
    setTimeout(() => { if (this.onload) this.onload(); }, 1);
  }
}

class MockElement {
  constructor(tag) {
    this.tagName = (tag || "div").toUpperCase();
    this.children = [];
    this.attrs = {};
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.contains(c)) this.remove(c); else this.add(c);
        } else if (force) {
          this.add(c);
        } else {
          this.remove(c);
        }
      }
    };
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.dataset = {};
    this.innerHTML = "";
    this.textContent = "";
    this.value = "0";
    this.width = 800;
    this.height = 600;
    this.clientWidth = 800;
    this.clientHeight = 600;
    this.offsetWidth = 800;
    this.offsetHeight = 600;
    this.isConnected = true;
  }
  getAttribute(name) { return this.attrs[name] || null; }
  setAttribute(name, val) { this.attrs[name] = String(val); }
  removeAttribute(name) { delete this.attrs[name]; }
  hasAttribute(name) { return name in this.attrs; }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }
  addEventListener() {}
  removeEventListener() {}
  querySelector(sel) { return new MockElement("div"); }
  querySelectorAll(sel) { return [new MockElement("div")]; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 }; }
  getContext(type) {
    if (type === "2d") {
      const gradient = { addColorStop: () => {} };
      return new Proxy({}, {
        get: (target, prop) => {
          if (prop === "createLinearGradient" || prop === "createRadialGradient") {
            return () => gradient;
          }
          if (prop === "createImageData") {
            return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
          }
          if (prop === "measureText") {
            return (text) => ({ width: (text || "").length * 8 });
          }
          if (typeof prop === "string" && !target[prop]) {
            target[prop] = (...args) => {};
          }
          return target[prop];
        }
      });
    }
    return null;
  }
  focus() {}
  blur() {}
  click() {}
}

const window = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1.0,
  getLabDPR: () => 1.0,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  location: { hash: "", href: "http://localhost/" },
  AudioContext: function() {
    return {
      state: "running",
      currentTime: 0,
      destination: {},
      createOscillator: () => ({
        type: "sine",
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {}
      }),
      createGain: () => ({
        gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {}
      }),
      resume: () => Promise.resolve(),
      close: () => Promise.resolve()
    };
  },
  Image: MockImage
};
window.webkitAudioContext = window.AudioContext;

const docElem = new MockElement("html");
docElem.setAttribute("data-mode", "desktop");
const docBody = new MockElement("body");

const document = {
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => new MockElement("div"),
  querySelector: (sel) => new MockElement("div"),
  querySelectorAll: (sel) => [new MockElement("div")],
  addEventListener: () => {},
  removeEventListener: () => {},
  body: docBody,
  documentElement: docElem
};

globalThis.window = window;
globalThis.document = document;
globalThis.Image = MockImage;
try {
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent: "Mozilla/5.0 Chrome/120.0 SmartBoard", maxTouchPoints: 10, onLine: true },
    configurable: true,
    writable: true
  });
} catch (e) {}
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};
globalThis.requestAnimationFrame = window.requestAnimationFrame;
globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
globalThis.AudioContext = window.AudioContext;
globalThis.webkitAudioContext = window.webkitAudioContext;

async function runLifecycleTests() {
  const labsDir = "./labs";
  const files = fs.readdirSync(labsDir).filter(f => f.endsWith(".js") && f !== "lab-telemetry-exporter.js");
  
  let passed = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const mod = await import(`../labs/${file}`);
      const initFnName = Object.keys(mod).find(k => k.startsWith("init"));
      if (!initFnName) {
        throw new Error(`Missing init function in ${file}`);
      }

      const cleanup = await mod[initFnName]("test-mount-point");
      
      // Simulate frame cycles
      await new Promise(r => setTimeout(r, 30));

      if (typeof cleanup === "function") {
        cleanup();
        console.log(`  ✅ PASS: ${file} -> ${initFnName}() + cleanup()`);
        passed++;
      } else {
        throw new Error(`${file} init function did not return a valid cleanup teardown function`);
      }
    } catch (err) {
      console.error(`  ❌ FAIL: ${file}:`, err.message);
      failed++;
    }
  }

  console.log("\n========================================================");
  console.log(`📊 Virtual Labs Lifecycle: ${passed} Passed, ${failed} Failed (Total: ${files.length})`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runLifecycleTests();
