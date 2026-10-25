(() => {
  // src/ecg.js
  var FS = 250;
  function gauss(rng) {
    let u = 0, v = 0;
    while (!u) u = rng();
    while (!v) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  var WAVES = [
    [0.12, -0.2, 0.025],
    [-0.14, -0.04, 0.011],
    [1, 0, 0.012],
    [-0.26, 0.04, 0.012],
    [0.3, 0.26, 0.055]
  ];
  var Source = class {
    constructor(seed = 7) {
      let s = seed >>> 0;
      this.rng = () => (s = s * 1664525 + 1013904223 >>> 0) / 4294967296;
      this.n = 0;
      this.stress = 0;
      this.beats = [];
      this.lastR = 0.6;
      this.beats.push(this.lastR);
      this.drift = this.rng() * 6;
    }
    rr() {
      const hr = 62 + this.stress * 48;
      const mean = 60 / hr;
      const sd = 0.045 - this.stress * 0.033;
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
      v += 0.09 * Math.sin(2 * Math.PI * 0.27 * t + this.drift);
      v += 0.018 * Math.sin(2 * Math.PI * 50 * t);
      v += 0.025 * gauss(this.rng);
      this.n++;
      return v;
    }
  };
  var Detector = class {
    constructor() {
      this.n = 0;
      this.x = new Float32Array(8);
      this.W = Math.round(0.15 * FS);
      this.sq = new Float32Array(this.W);
      this.sum = 0;
      this.m = [0, 0, 0];
      this.raw = new Float32Array(FS * 2);
      this.peakAvg = 0;
      this.noiseAvg = 0;
      this.lastPeak = -1e9;
      this.learn = FS * 2;
      this.learnMax = 0;
      this.rrs = [];
      this.lastR = null;
    }
    // returns the sample index of a detected R peak, or null
    push(v) {
      const i = this.n;
      const x = this.x;
      for (let k = 7; k > 0; k--) x[k] = x[k - 1];
      x[0] = v;
      this.raw[i % this.raw.length] = v;
      const d = (2 * x[0] + x[1] - x[3] - 2 * x[4]) / 8;
      const s = d * d;
      const slot = i % this.W;
      this.sum += s - this.sq[slot];
      this.sq[slot] = s;
      const mwi = this.sum / this.W;
      this.n++;
      const [a, b] = this.m;
      this.m = [b, mwi, 0];
      let found = null;
      if (i < this.learn) {
        this.learnMax = Math.max(this.learnMax, mwi);
        if (i === this.learn - 1) this.peakAvg = this.learnMax * 0.6;
        return null;
      }
      const thr = this.noiseAvg + 0.5 * (this.peakAvg - this.noiseAvg);
      if (b > a && b >= mwi) {
        if (b > thr && i - 1 - this.lastPeak > 0.22 * FS) {
          let best = -1e9, bi = i;
          const span = Math.round(0.14 * FS);
          for (let k = 0; k < span; k++) {
            const idx = i - 1 - k;
            const val = this.raw[(idx % this.raw.length + this.raw.length) % this.raw.length];
            if (val > best) {
              best = val;
              bi = idx;
            }
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
        acc += d * d;
        k++;
      }
      if (k < 4) return null;
      return Math.round(Math.sqrt(acc / k) * 1e3);
    }
  };

  // src/hand.js
  var NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
  var PALM = 1.12;
  var F = [
    null,
    // thumb handled separately
    { mcp: [-0.3, 1.05], dir: -0.1, L: [0.45, 0.28, 0.22] },
    { mcp: [-0.05, 1.12], dir: 0, L: [0.5, 0.32, 0.24] },
    { mcp: [0.2, 1.06], dir: 0.1, L: [0.46, 0.3, 0.22] },
    { mcp: [0.42, 0.93], dir: 0.24, L: [0.36, 0.22, 0.18] }
  ];
  var BEND = [1.45, 1.7, 1.1];
  var lerp = (a, b, t) => a + (b - a) * t;
  function chain(base, dir, L, bends) {
    const pts = [[base[0], base[1], 0]];
    let th = 0, u = 0, z = 0;
    const sx = Math.sin(dir), sy = Math.cos(dir);
    for (let i = 0; i < 3; i++) {
      th += bends[i];
      u += L[i] * Math.cos(th);
      z += L[i] * Math.sin(th);
      pts.push([base[0] + sx * u, base[1] + sy * u, z]);
    }
    return pts;
  }
  function landmarks(ext) {
    const out = [[0, 0, 0]];
    const e0 = ext[0];
    const tdir = lerp(0.95, -0.85, e0);
    const tb = [0.5, 0.7, 0.6].map((b) => (1 - e0) * b);
    out.push(...chain([-0.32, 0.22], tdir, [0.38, 0.3, 0.26], tb));
    for (let f = 1; f < 5; f++) {
      const d = F[f];
      const b = BEND.map((m) => (1 - ext[f]) * m);
      out.push(...chain(d.mcp, d.dir, d.L, b));
    }
    return out;
  }
  var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  var len = (v) => Math.hypot(v[0], v[1], v[2]);
  function ang(a, b) {
    const c = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (len(a) * len(b));
    return Math.acos(Math.max(-1, Math.min(1, c)));
  }
  var BEND_LIMIT = 1.15;
  var THUMB_LIMIT = 1;
  function analyse(p) {
    const measure = [], extended = [];
    const td = len(sub(p[4], p[17])) / PALM;
    measure.push(td);
    extended.push(td > THUMB_LIMIT);
    for (let f = 0; f < 4; f++) {
      const o = 5 + f * 4;
      const v1 = sub(p[o + 1], p[o]);
      const v2 = sub(p[o + 2], p[o + 1]);
      const v3 = sub(p[o + 3], p[o + 2]);
      const bend = ang(v1, v2) + ang(v2, v3);
      measure.push(bend);
      extended.push(bend < BEND_LIMIT);
    }
    return { measure, extended };
  }
  var POSES = {
    "00000": "A",
    "01000": "1",
    "01100": "2",
    "11100": "3",
    "01111": "4",
    "11111": "5",
    "11000": "L",
    "10001": "Y",
    "00001": "I",
    "01110": "W",
    "00100": "\ud83d\udd95"
  };
  var classify = (extended) => POSES[extended.map((e) => e ? 1 : 0).join("")] || "\xB7";
  var POSE_LIST = [
    ["\ud83d\udd95", [0, 0, 1, 0, 0]],
    ["5", [1, 1, 1, 1, 1]],
    ["1", [0, 1, 0, 0, 0]],
    ["2", [0, 1, 1, 0, 0]],
    ["L", [1, 1, 0, 0, 0]],
    ["Y", [1, 0, 0, 0, 1]],
    ["4", [0, 1, 1, 1, 1]],
    ["A", [0, 0, 0, 0, 0]],
    ["3", [1, 1, 1, 0, 0]]
  ];
  var Stabiliser = class {
    constructor(n = 10) {
      this.n = n;
      this.cur = null;
      this.count = 0;
      this.committed = null;
    }
    push(label) {
      if (label === this.cur) this.count++;
      else {
        this.cur = label;
        this.count = 1;
      }
      let fired = null;
      if (this.count >= this.n && label !== "\xB7" && label !== this.committed) {
        this.committed = label;
        fired = label;
      }
      return { count: Math.min(this.count, this.n), fired };
    }
  };

  // src/main.js
  var $ = (s, r = document) => r.querySelector(s);
  var $$ = (s, r = document) => [...r.querySelectorAll(s)];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = getComputedStyle(document.documentElement);
  var C = {
    ink: css.getPropertyValue("--ink").trim() || "#161a21",
    mute: css.getPropertyValue("--mute").trim() || "#566170",
    signal: css.getPropertyValue("--signal").trim() || "#d9372a",
    line: "rgba(22,26,33,0.17)",
    fog: css.getPropertyValue("--fog").trim() || "#e3e6e8"
  };
  function fit(canvas) {
    const r = canvas.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(d, 0, 0, d, 0, 0);
    return [r.width, r.height, ctx];
  }
  var jobs = [];
  var last = performance.now();
  function frame(now) {
    const dt = (now - last) / 1e3;
    last = now;
    if (!document.hidden) {
      for (const j of jobs) if (j.on) j.fn(dt, now);
    }
    requestAnimationFrame(frame);
  }
  function job(el, fn, opts = {}) {
    const j = { on: false, fn };
    jobs.push(j);
    new IntersectionObserver(([e]) => {
      j.on = e.isIntersecting;
      if (j.on && opts.onEnter) opts.onEnter();
    }, { rootMargin: "80px" }).observe(el);
    return j;
  }
  requestAnimationFrame(frame);
  var fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  function tick() {
    const t = "Bengaluru " + fmt.format(/* @__PURE__ */ new Date());
    $("#clock").textContent = t;
    $("#clock2").textContent = t;
  }
  tick();
  setInterval(tick, 2e4);
  var go = () => document.documentElement.classList.add("go");
  if (reduced) go();
  else {
    const t = setTimeout(go, 900);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      clearTimeout(t);
      requestAnimationFrame(go);
    });
  }
  var Scope = class {
    constructor(seed, stress, seconds) {
      this.src = new Source(seed);
      this.src.stress = stress;
      this.det = new Detector();
      this.len = FS * seconds;
      this.buf = new Float32Array(this.len);
      this.beats = [];
      this.count = 0;
      this.acc = 0;
      for (let k = 0; k < FS * 8; k++) this.step();
    }
    get total() {
      return this.src.n;
    }
    step() {
      const v = this.src.next();
      this.buf[(this.src.n - 1) % this.len] = v;
      const f = this.det.push(v);
      if (f !== null) {
        this.beats.push(f);
        this.count++;
      }
    }
    advance(dt) {
      this.acc += Math.min(dt, 0.1) * FS;
      while (this.acc >= 1) {
        this.step();
        this.acc -= 1;
      }
      while (this.beats.length && this.beats[0] < this.total - this.len) this.beats.shift();
    }
    at(i) {
      return this.buf[(i % this.len + this.len) % this.len];
    }
  };
  function drawScope(ctx, W, H, sc, o) {
    const win = Math.round(o.secs * FS);
    const start = sc.total - win;
    const base = H * o.base, amp = H * o.amp;
    const X = (i) => (i - start) / win * W;
    if (o.grid) {
      const t0 = start / FS;
      for (let k = Math.ceil(t0 * 5); k <= Math.floor(sc.total / FS * 5); k++) {
        const x = (k / 5 - t0) / o.secs * W;
        ctx.strokeStyle = k % 5 === 0 ? "rgba(22,26,33,0.16)" : "rgba(22,26,33,0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, H);
        ctx.stroke();
      }
      for (let k = 1; k < 6; k++) {
        const y = H / 6 * k;
        ctx.strokeStyle = "rgba(22,26,33,0.07)";
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(W, Math.round(y) + 0.5);
        ctx.stroke();
      }
    }
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "rgba(22,26,33,0)");
    g.addColorStop(0.35, "rgba(22,26,33,0.85)");
    g.addColorStop(1, C.ink);
    ctx.strokeStyle = o.fade ? g : C.ink;
    ctx.lineWidth = o.lw || 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    const step = Math.max(1, Math.floor(win / (W * 1.2)));
    for (let i = start; i <= sc.total - 1; i += step) {
      const x = X(i), y = base - sc.at(i) * amp;
      i === start ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
    for (const b of sc.beats) {
      if (b < start) continue;
      const x = X(b), y = base - sc.at(b) * amp;
      ctx.fillStyle = C.signal;
      ctx.beginPath();
      ctx.arc(x, y - 9, 3.2, 0, 6.3);
      ctx.fill();
      if (o.labels) {
        ctx.strokeStyle = "rgba(217,55,42,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, H);
        ctx.stroke();
        ctx.fillStyle = C.signal;
        ctx.fillText("R", x + 6, y - 6);
      }
    }
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.arc(W - 1, base - sc.at(sc.total - 1) * amp, 2.6, 0, 6.3);
    ctx.fill();
  }
  {
    const cv = $("#hero-trace");
    const sc = new Scope(21, 0.04, 8);
    const out = $("#hero-bpm");
    let t = 0;
    const draw = (dt) => {
      sc.advance(dt);
      const [W, H, ctx] = fit(cv);
      ctx.clearRect(0, 0, W, H);
      drawScope(ctx, W, H, sc, { secs: Math.max(5, W / 130), base: 0.58, amp: 0.4, fade: true, lw: 1.5 });
      t += dt;
      if (t > 0.5) {
        t = 0;
        const b2 = sc.det.bpm();
        if (b2 && out) out.textContent = b2;
      }
    };
    if (reduced) {
      draw(0);
      addEventListener("resize", () => draw(0));
    } else job(cv, draw);
    const b = sc.det.bpm();
    if (b && out) out.textContent = b;
  }
  {
    const cv = $("#ecg");
    let sc = new Scope(5, 0, 8);
    const slider = $("#stress");
    const bpm = $("#e-bpm"), hrv = $("#e-hrv"), n = $("#e-n"), rr = $("#e-rr"), state = $("#e-state");
    let tt = 0;
    const readout = () => {
      const b = sc.det.bpm(), h = sc.det.rmssd();
      if (b) bpm.textContent = b + " bpm";
      if (h !== null) hrv.textContent = h + " ms";
      n.textContent = sc.count;
      const r = sc.det.rrs[sc.det.rrs.length - 1];
      if (r) rr.textContent = "RR " + Math.round(r * 1e3) + " ms";
      if (b && h !== null) state.textContent = b >= 95 && h < 30 ? "elevated" : b >= 78 ? "rising" : "calm";
    };
    const draw = (dt) => {
      sc.advance(dt);
      const [W, H, ctx] = fit(cv);
      ctx.clearRect(0, 0, W, H);
      drawScope(ctx, W, H, sc, { secs: 6, base: 0.66, amp: 0.46, grid: true, labels: true, lw: 1.6 });
      tt += dt;
      if (tt > 0.25) {
        tt = 0;
        readout();
      }
    };
    slider.addEventListener("input", () => {
      const v = slider.value / 100;
      if (reduced) {
        sc = new Scope(5, v, 8);
        for (let k = 0; k < FS * 14; k++) sc.step();
        draw(0);
        readout();
      } else sc.src.stress = v;
    });
    if (reduced) {
      draw(0);
      readout();
      addEventListener("resize", () => draw(0));
    } else job(cv, draw, { onEnter: readout });
    readout();
  }
  {
    let delays = function(stagger) {
      for (let i = 0; i < 5; i++) start[i] = clock + (stagger ? i * 0.09 : 0);
    }, nextPose = function() {
      poseIdx = (poseIdx + 1) % POSE_LIST.length;
      POSE_LIST[poseIdx][1].forEach((v, i) => target[i] = v);
      delays(true);
    }, logic = function() {
      const noisy = val.map((v) => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.07)));
      analysis = analyse(landmarks(noisy));
      const raw = classify(analysis.extended);
      const { count, fired } = stab.push(raw);
      rawEl.textContent = raw;
      holdEl.textContent = count + " / " + N;
      $$("i", framesEl).forEach((el, k) => el.classList.toggle("on", k < count));
      if (fired) {
        hist.push(fired);
        renderHist();
      }
      btns.forEach((b, i) => {
        b.querySelector("em").textContent = analysis.measure[i].toFixed(2);
        b.setAttribute("aria-pressed", target[i] > 0.5 ? "true" : "false");
      });
    }, draw = function() {
      const [W, H, ctx] = fit(cv);
      ctx.clearRect(0, 0, W, H);
      const s = H * 0.8 / 2.3;
      const P = (p) => [W / 2 + (p[0] + 0.25) * s, H * 0.9 - p[1] * s];
      const pts = landmarks(val);
      const palm = [[-0.3, 0], [-0.42, 0.45], [-0.3, 1.05], [-0.05, 1.12], [0.2, 1.06], [0.42, 0.93], [0.4, 0.45], [0.28, 0]];
      ctx.beginPath();
      palm.forEach((p, i) => {
        const q = P(p);
        i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(22,26,33,0.045)";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      const chains = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const c of chains) {
        ctx.beginPath();
        c.forEach((k, i) => {
          const q = P(pts[k]);
          i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
        });
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(...P(pts[0]));
      ctx.lineTo(...P(pts[9]));
      ctx.moveTo(...P(pts[0]));
      ctx.lineTo(...P(pts[13]));
      ctx.stroke();
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      pts.forEach((p, k) => {
        const [x, y] = P(p);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        const tip = k > 0 && k % 4 === 0;
        const f = k === 0 ? -1 : Math.floor((k - 1) / 4);
        const r = (tip ? 4.6 : 3) + p[2] * 3.2;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, r), 0, 6.3);
        ctx.fillStyle = tip ? analysis.extended[f] ? C.signal : C.mute : C.ink;
        ctx.fill();
      });
      const pad = 14;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
      ctx.setLineDash([]);
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
      ctx.fillStyle = C.ink;
      ctx.fillText("hand", minX - pad + 6, minY - pad - 6);
      ctx.fillStyle = C.mute;
      ctx.fillText("curled above " + BEND_LIMIT + " rad of bend", 14, 22);
    };
    const cv = $("#hand");
    const fingerBox = $("#fingers");
    const framesEl = $("#h-frames");
    const N = 10;
    for (let k = 0; k < N; k++) framesEl.append(document.createElement("i"));
    const btns = NAMES.map((name, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", "true");
      b.innerHTML = `<i class="dot"></i><span>${name}</span><em>0.00</em>`;
      b.addEventListener("click", () => {
        target[i] = target[i] > 0.5 ? 0 : 1;
        wait = 7;
        delays(false);
      });
      fingerBox.append(b);
      return b;
    });
    const target = [1, 1, 1, 1, 1];
    const val = [1, 1, 1, 1, 1];
    const start = [0, 0, 0, 0, 0];
    let clock = 0, wait = 0, poseIdx = 0, since = 0, acc = 0;
    const stab = new Stabiliser(N);
    const hist = [];
    const rawEl = $("#h-raw"), holdEl = $("#h-hold"), histEl = $("#h-hist");
    let analysis = analyse(landmarks(val));
    const renderHist = () => {
      histEl.innerHTML = hist.slice(-5).map((l) => `<span>${l}</span>`).join("");
    };
    const run = (dt) => {
      clock += dt;
      if (!reduced && wait <= 0) {
        since += dt;
        if (since > 2.4) {
          since = 0;
          nextPose();
        }
      }
      wait -= dt;
      for (let i = 0; i < 5; i++) if (clock >= start[i]) val[i] += (target[i] - val[i]) * (1 - Math.exp(-dt * 11));
      acc += dt;
      while (acc > 1 / 30) {
        acc -= 1 / 30;
        logic();
      }
      draw();
    };
    POSE_LIST[0][1].forEach((v, i) => {
      target[i] = v;
      val[i] = v;
    });
    logic();
    draw();
    renderHist();
    job(cv, run);
    addEventListener("resize", draw);
  }
  {
    const g = $("#agents");
    const ns = "http://www.w3.org/2000/svg";
    for (let k = 0; k < 6; k++) {
      const cx = 231 + 64 * k;
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", cx);
      c.setAttribute("cy", 150);
      c.setAttribute("r", 16);
      c.setAttribute("class", "agent");
      c.style.animationDelay = (0.65 + 0.517 * k).toFixed(2) + "s";
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", cx - 3);
      t.setAttribute("y", 190);
      t.textContent = k + 1;
      g.append(c, t);
    }
    if (reduced) $("#fw-pulse")?.parentNode.remove();
  }
  {
    let render = function() {
      const L = stage(t);
      leds.forEach((l, i) => l.classList.toggle("on", i < Math.min(L, 3)));
      lvl.textContent = L === 4 ? "alarm" : "level " + L;
      bar.style.width = Math.min(100, t / TIMEOUT * 100) + "%";
      lcd.textContent = "DIST " + String(Math.round(dist)).padStart(4, " ") + " cm\nSTATUS " + names[L];
      servo.classList.toggle("alarm", L === 4);
      tog.textContent = moving ? "Moving" : "Still";
      tog.setAttribute("aria-pressed", moving ? "true" : "false");
    };
    const panel = $("#seams-panel");
    const lcd = $("#s-lcd"), bar = $("#s-bar"), lvl = $("#s-lvl"), arm = $("#s-arm"), servo = $("#s-servo"), tog = $("#s-toggle");
    const leds = $$("#s-leds i");
    const TIMEOUT = 8;
    let moving = false, t = 0, dist = 142, started = !reduced, lastDraw = 0, flip = 0, lastFlip = 0;
    const names = ["calm", "watching", "warning", "critical", "ALARM"];
    const stage = (s) => s >= TIMEOUT ? 4 : s >= 7 ? 3 : s >= 4.5 ? 2 : s >= 2 ? 1 : 0;
    tog.addEventListener("click", () => {
      moving = !moving;
      started = true;
      if (moving) t = 0;
      render();
    });
    job(panel, (dt, now) => {
      if (!started) return;
      if (moving) {
        t = 0;
        dist = Math.max(40, Math.min(240, dist + (Math.random() - 0.5) * 26));
      } else t = Math.min(t + dt, TIMEOUT);
      const L = stage(t);
      if (L === 4) {
        if (now - lastFlip > 650) {
          lastFlip = now;
          flip ^= 1;
        }
        arm.style.transform = `rotate(${flip ? 65 : -65}deg)`;
      } else arm.style.transform = "rotate(-65deg)";
      if (now - lastDraw > 120) {
        lastDraw = now;
        render();
      }
    });
    render();
  }
  {
    const state = { eating: 41, skipping: 9, pending: 14 };
    const out = $("#m-json"), toast = $("#m-toast");
    let mine = null;
    const draw = () => {
      out.innerHTML = `{
  <span class="k">"eating"</span>: <span class="n">${state.eating}</span>,
  <span class="k">"skipping"</span>: <span class="n">${state.skipping}</span>,
  <span class="k">"pending"</span>: <span class="n">${state.pending}</span>
}`;
    };
    const btns = $$("#mess-panel .choice button");
    btns.forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.v === "eat" ? "eating" : "skipping";
      if (mine === v) return;
      if (mine) state[mine]--;
      else state.pending--;
      state[v]++;
      mine = v;
      btns.forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      toast.textContent = "Saved. You're down as " + (v === "eating" ? "eating" : "skipping") + ".";
      draw();
    }));
    draw();
  }
  {
    const b = $("#copy");
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("nkg2641@gmail.com");
        b.textContent = "Copied.";
      } catch {
        b.textContent = "nkg2641@gmail.com";
      }
      setTimeout(() => b.textContent = "Copy address", 1800);
    });
  }
  console.log("%cNaman Kumar", "font:600 20px system-ui", "\nYou opened the console. Fair. The source is unminified on purpose: src/ecg.js is the detector, src/hand.js is the hand.\nnkg2641@gmail.com");
})();
