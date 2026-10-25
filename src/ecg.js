// Synthetic ECG source + a streaming QRS detector (Pan–Tompkins style).
// The signal is generated; the detector is real and runs sample by sample.

export const FS = 250; // samples per second

function gauss(rng) {
  let u = 0, v = 0;
  while (!u) u = rng();
  while (!v) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// P, Q, R, S, T as gaussians: [amplitude, offset from R in s, width in s]
const WAVES = [
  [0.12, -0.2, 0.025],
  [-0.14, -0.04, 0.011],
  [1.0, 0, 0.012],
  [-0.26, 0.04, 0.012],
  [0.3, 0.26, 0.055],
];

export class Source {
  constructor(seed = 7) {
    let s = seed >>> 0;
    this.rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    this.n = 0;
    this.stress = 0; // 0 calm … 1 wound up
    this.beats = []; // upcoming R times (seconds)
    this.lastR = 0.6;
    this.beats.push(this.lastR);
    this.drift = this.rng() * 6;
  }
  rr() {
    const hr = 62 + this.stress * 48;
    const mean = 60 / hr;
    const sd = 0.045 - this.stress * 0.033; // HRV shrinks under stress
    return Math.max(0.35, mean + gauss(this.rng) * sd);
  }
  next() {
    const t = this.n / FS;
    while (this.beats[this.beats.length - 1] < t + 1) {
      this.lastR += this.rr();
      this.beats.push(this.lastR);
    }
    while (this.beats.length > 3 && this.beats[1] < t - 1) this.beats.shift();
    let v = 0;
    for (const r of this.beats) {
      const dt = t - r;
      if (dt < -0.5 || dt > 0.6) continue;
      for (const [a, o, w] of WAVES) {
        const x = (dt - o) / w;
        v += a * Math.exp(-0.5 * x * x);
      }
    }
    v += 0.09 * Math.sin(2 * Math.PI * 0.27 * t + this.drift); // breathing / baseline wander
    v += 0.018 * Math.sin(2 * Math.PI * 50 * t); // mains hum
    v += 0.025 * gauss(this.rng); // sensor noise
    this.n++;
    return v;
  }
}

export class Detector {
  constructor() {
    this.n = 0;
    this.x = new Float32Array(8);
    this.W = Math.round(0.15 * FS); // 150 ms integration window
    this.sq = new Float32Array(this.W);
    this.sum = 0;
    this.m = [0, 0, 0]; // last three integrated values
    this.raw = new Float32Array(FS * 2); // 2 s of raw for locating R
    this.peakAvg = 0;
    this.noiseAvg = 0;
    this.lastPeak = -1e9;
    this.learn = FS * 2;
    this.learnMax = 0;
    this.rrs = []; // seconds
    this.lastR = null;
  }
  // returns the sample index of a detected R peak, or null
  push(v) {
    const i = this.n;
    const x = this.x;
    for (let k = 7; k > 0; k--) x[k] = x[k - 1];
    x[0] = v;
    this.raw[i % this.raw.length] = v;
    // five-point derivative, squared, moving-window integrated
    const d = (2 * x[0] + x[1] - x[3] - 2 * x[4]) / 8;
    const s = d * d;
    const slot = i % this.W;
    this.sum += s - this.sq[slot];
    this.sq[slot] = s;
    const mwi = this.sum / this.W;
    this.n++;
    const [a, b] = this.m; // a = n-2, b = n-1
    this.m = [b, mwi, 0];
    let found = null;
    if (i < this.learn) {
      this.learnMax = Math.max(this.learnMax, mwi);
      if (i === this.learn - 1) this.peakAvg = this.learnMax * 0.6;
      return null;
    }
    const thr = this.noiseAvg + 0.5 * (this.peakAvg - this.noiseAvg);
    // local max at n-1
    if (b > a && b >= mwi) {
      if (b > thr && i - 1 - this.lastPeak > 0.22 * FS) {
        // locate R as the raw maximum around the integrator peak
        let best = -1e9, bi = i;
        const span = Math.round(0.14 * FS);
        for (let k = 0; k < span; k++) {
          const idx = i - 1 - k;
          const val = this.raw[((idx % this.raw.length) + this.raw.length) % this.raw.length];
          if (val > best) { best = val; bi = idx; }
        }
        this.lastPeak = i - 1;
        this.peakAvg = 0.875 * this.peakAvg + 0.125 * b;
        if (this.lastR !== null) {
          const rr = (bi - this.lastR) / FS;
          if (rr > 0.3 && rr < 2) {
            this.rrs.push(rr);
            if (this.rrs.length > 24) this.rrs.shift();
          }
        }
        this.lastR = bi;
        found = bi;
      } else if (b <= thr) {
        this.noiseAvg = 0.875 * this.noiseAvg + 0.125 * b;
      }
    }
    return found;
  }
  bpm() {
    const r = this.rrs.slice(-4);
    if (r.length < 3) return null;
    const med = [...r].sort((p, q) => p - q)[Math.floor(r.length / 2)];
    return Math.round(60 / med);
  }
  // RMSSD over the last 12 intervals, ignoring jumps over 250 ms the way real
  // HRV tools do (ectopic beats, missed detections, or the heart rate changing gear)
  rmssd() {
    const r = this.rrs.slice(-13);
    let acc = 0, k = 0;
    for (let i = 1; i < r.length; i++) {
      const d = r[i] - r[i - 1];
      if (Math.abs(d) > 0.25) continue;
      acc += d * d; k++;
    }
    if (k < 4) return null;
    return Math.round(Math.sqrt(acc / k) * 1000);
  }
}
