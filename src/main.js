import { FS, Source, Detector } from "./ecg.js";
import { landmarks, analyse, classify, Stabiliser, POSE_LIST, NAMES, BEND_LIMIT } from "./hand.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = getComputedStyle(document.documentElement);
const C = {
  ink: css.getPropertyValue("--ink").trim() || "#161a21",
  mute: css.getPropertyValue("--mute").trim() || "#566170",
  signal: css.getPropertyValue("--signal").trim() || "#d9372a",
  line: "rgba(22,26,33,0.17)",
  fog: css.getPropertyValue("--fog").trim() || "#e3e6e8",
};

/* ---------- plumbing ---------- */
function fit(canvas) {
  const r = canvas.getBoundingClientRect();
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return [r.width, r.height, ctx];
}

// one rAF loop, each job only runs while its element is on screen
const jobs = [];
let last = performance.now();
function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  if (!document.hidden) for (const j of jobs) if (j.on) j.fn(dt, now);
  requestAnimationFrame(frame);
}
function job(el, fn, opts = {}) {
  const j = { on: false, fn };
  jobs.push(j);
  new IntersectionObserver(([e]) => { j.on = e.isIntersecting; if (j.on && opts.onEnter) opts.onEnter(); }, { rootMargin: "80px" }).observe(el);
  return j;
}
requestAnimationFrame(frame);

/* ---------- clock ---------- */
const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
function tick() {
  const t = "Bengaluru " + fmt.format(new Date());
  $("#clock").textContent = t;
  $("#clock2").textContent = t;
}
tick();
setInterval(tick, 20000);

/* ---------- load sequence ---------- */
const go = () => document.documentElement.classList.add("go");
if (reduced) go();
else {
  const t = setTimeout(go, 900);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { clearTimeout(t); requestAnimationFrame(go); });
}

/* ---------- ECG scope ---------- */
class Scope {
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
  get total() { return this.src.n; }
  step() {
    const v = this.src.next();
    this.buf[(this.src.n - 1) % this.len] = v;
    const f = this.det.push(v);
    if (f !== null) { this.beats.push(f); this.count++; }
  }
  advance(dt) {
    this.acc += Math.min(dt, 0.1) * FS;
    while (this.acc >= 1) { this.step(); this.acc -= 1; }
    while (this.beats.length && this.beats[0] < this.total - this.len) this.beats.shift();
  }
  at(i) { return this.buf[((i % this.len) + this.len) % this.len]; }
}

function drawScope(ctx, W, H, sc, o) {
  const win = Math.round(o.secs * FS);
  const start = sc.total - win;
  const base = H * o.base, amp = H * o.amp;
  const X = (i) => ((i - start) / win) * W;
  if (o.grid) {
    const t0 = start / FS;
    for (let k = Math.ceil(t0 * 5); k <= Math.floor((sc.total / FS) * 5); k++) {
      const x = ((k / 5 - t0) / o.secs) * W;
      ctx.strokeStyle = k % 5 === 0 ? "rgba(22,26,33,0.16)" : "rgba(22,26,33,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); ctx.stroke();
    }
    for (let k = 1; k < 6; k++) {
      const y = (H / 6) * k;
      ctx.strokeStyle = "rgba(22,26,33,0.07)";
      ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); ctx.stroke();
    }
  }
  // trace
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
  // detected beats
  ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
  for (const b of sc.beats) {
    if (b < start) continue;
    const x = X(b), y = base - sc.at(b) * amp;
    ctx.fillStyle = C.signal;
    ctx.beginPath(); ctx.arc(x, y - 9, 3.2, 0, 6.3); ctx.fill();
    if (o.labels) {
      ctx.strokeStyle = "rgba(217,55,42,0.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, H); ctx.stroke();
      ctx.fillStyle = C.signal; ctx.fillText("R", x + 6, y - 6);
    }
  }
  // head
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(W - 1, base - sc.at(sc.total - 1) * amp, 2.6, 0, 6.3); ctx.fill();
}

/* hero */
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
    if (t > 0.5) { t = 0; const b = sc.det.bpm(); if (b && out) out.textContent = b; }
  };
  if (reduced) { draw(0); addEventListener("resize", () => draw(0)); }
  else job(cv, draw);
  const b = sc.det.bpm(); if (b && out) out.textContent = b;
}

/* vitalsense */
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
    if (r) rr.textContent = "RR " + Math.round(r * 1000) + " ms";
    if (b && h !== null) state.textContent = b >= 95 && h < 30 ? "elevated" : b >= 78 ? "rising" : "calm";
  };
  const draw = (dt) => {
    sc.advance(dt);
    const [W, H, ctx] = fit(cv);
    ctx.clearRect(0, 0, W, H);
    drawScope(ctx, W, H, sc, { secs: 6, base: 0.66, amp: 0.46, grid: true, labels: true, lw: 1.6 });
    tt += dt;
    if (tt > 0.25) { tt = 0; readout(); }
  };
  slider.addEventListener("input", () => {
    const v = slider.value / 100;
    if (reduced) { sc = new Scope(5, v, 8); for (let k = 0; k < FS * 14; k++) sc.step(); draw(0); readout(); }
    else sc.src.stress = v;
  });
  if (reduced) { draw(0); readout(); addEventListener("resize", () => draw(0)); }
  else job(cv, draw, { onEnter: readout });
  readout();
}

/* ---------- signspeak ---------- */
{
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
    b.addEventListener("click", () => { target[i] = target[i] > 0.5 ? 0 : 1; wait = 7; delays(false); });
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

  function delays(stagger) { for (let i = 0; i < 5; i++) start[i] = clock + (stagger ? i * 0.09 : 0); }
  function nextPose() {
    poseIdx = (poseIdx + 1) % POSE_LIST.length;
    POSE_LIST[poseIdx][1].forEach((v, i) => (target[i] = v));
    delays(true);
  }
  const renderHist = () => { histEl.innerHTML = hist.slice(-5).map((l) => `<span>${l}</span>`).join(""); };

  function logic() {
    // jitter on top of the smooth value, like a real tracker
    const noisy = val.map((v) => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.07)));
    analysis = analyse(landmarks(noisy));
    const raw = classify(analysis.extended);
    const { count, fired } = stab.push(raw);
    rawEl.textContent = raw;
    holdEl.textContent = count + " / " + N;
    $$("i", framesEl).forEach((el, k) => el.classList.toggle("on", k < count));
    if (fired) { hist.push(fired); renderHist(); }
    btns.forEach((b, i) => {
      b.querySelector("em").textContent = analysis.measure[i].toFixed(2);
      b.setAttribute("aria-pressed", target[i] > 0.5 ? "true" : "false");
    });
  }

  function draw() {
    const [W, H, ctx] = fit(cv);
    ctx.clearRect(0, 0, W, H);
    const s = (H * 0.8) / 2.3;
    const P = (p) => [W / 2 + (p[0] + 0.25) * s, H * 0.9 - p[1] * s];
    const pts = landmarks(val);
    // palm
    const palm = [[-0.3, 0], [-0.42, 0.45], [-0.3, 1.05], [-0.05, 1.12], [0.2, 1.06], [0.42, 0.93], [0.4, 0.45], [0.28, 0]];
    ctx.beginPath();
    palm.forEach((p, i) => { const q = P(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    ctx.closePath();
    ctx.fillStyle = "rgba(22,26,33,0.045)"; ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    // bones
    const chains = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const c of chains) {
      ctx.beginPath();
      c.forEach((k, i) => { const q = P(pts[k]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(...P(pts[0])); ctx.lineTo(...P(pts[9])); ctx.moveTo(...P(pts[0])); ctx.lineTo(...P(pts[13])); ctx.stroke();
    // joints, tips coloured by state
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    pts.forEach((p, k) => {
      const [x, y] = P(p);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      const tip = k > 0 && k % 4 === 0;
      const f = k === 0 ? -1 : Math.floor((k - 1) / 4);
      const r = (tip ? 4.6 : 3) + p[2] * 3.2;
      ctx.beginPath(); ctx.arc(x, y, Math.max(2, r), 0, 6.3);
      ctx.fillStyle = tip ? (analysis.extended[f] ? C.signal : C.mute) : C.ink;
      ctx.fill();
    });
    // detection box
    const pad = 14;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
    ctx.setLineDash([]);
    ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = C.ink; ctx.fillText("hand", minX - pad + 6, minY - pad - 6);
    // bend limit note
    ctx.fillStyle = C.mute;
    ctx.fillText("curled above " + BEND_LIMIT + " rad of bend", 14, 22);
  }

  const run = (dt) => {
    clock += dt;
    if (!reduced && wait <= 0) { since += dt; if (since > 2.4) { since = 0; nextPose(); } }
    wait -= dt;
    for (let i = 0; i < 5; i++) if (clock >= start[i]) val[i] += (target[i] - val[i]) * (1 - Math.exp(-dt * 11));
    acc += dt;
    while (acc > 1 / 30) { acc -= 1 / 30; logic(); }
    draw();
  };
  POSE_LIST[0][1].forEach((v, i) => { target[i] = v; val[i] = v; });
  logic(); draw(); renderHist();
  job(cv, run);
  addEventListener("resize", draw);
}

/* ---------- thoughtfirewall ---------- */
{
  const g = $("#agents");
  const ns = "http://www.w3.org/2000/svg";
  for (let k = 0; k < 6; k++) {
    const cx = 231 + 64 * k;
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", cx); c.setAttribute("cy", 150); c.setAttribute("r", 16);
    c.setAttribute("class", "agent");
    c.style.animationDelay = (0.65 + 0.517 * k).toFixed(2) + "s";
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", cx - 3); t.setAttribute("y", 190); t.textContent = k + 1;
    g.append(c, t);
  }
  if (reduced) $("#fw-pulse")?.parentNode.remove();
}

/* ---------- seams ---------- */
{
  const panel = $("#seams-panel");
  const lcd = $("#s-lcd"), bar = $("#s-bar"), lvl = $("#s-lvl"), arm = $("#s-arm"), servo = $("#s-servo"), tog = $("#s-toggle");
  const leds = $$("#s-leds i");
  const TIMEOUT = 8;
  let moving = false, t = 0, dist = 142, started = !reduced, lastDraw = 0, flip = 0, lastFlip = 0;
  const names = ["calm", "watching", "warning", "critical", "ALARM"];
  const stage = (s) => (s >= TIMEOUT ? 4 : s >= 7 ? 3 : s >= 4.5 ? 2 : s >= 2 ? 1 : 0);
  function render() {
    const L = stage(t);
    leds.forEach((l, i) => l.classList.toggle("on", i < Math.min(L, 3)));
    lvl.textContent = L === 4 ? "alarm" : "level " + L;
    bar.style.width = Math.min(100, (t / TIMEOUT) * 100) + "%";
    lcd.textContent = "DIST " + String(Math.round(dist)).padStart(4, " ") + " cm\nSTATUS " + names[L];
    servo.classList.toggle("alarm", L === 4);
    tog.textContent = moving ? "Moving" : "Still";
    tog.setAttribute("aria-pressed", moving ? "true" : "false");
  }
  tog.addEventListener("click", () => { moving = !moving; started = true; if (moving) t = 0; render(); });
  job(panel, (dt, now) => {
    if (!started) return;
    if (moving) { t = 0; dist = Math.max(40, Math.min(240, dist + (Math.random() - 0.5) * 26)); }
    else t = Math.min(t + dt, TIMEOUT);
    const L = stage(t);
    if (L === 4) {
      if (now - lastFlip > 650) { lastFlip = now; flip ^= 1; }
      arm.style.transform = `rotate(${flip ? 65 : -65}deg)`;
    } else arm.style.transform = "rotate(-65deg)";
    if (now - lastDraw > 120) { lastDraw = now; render(); }
  });
  render();
}

/* ---------- smart mess ---------- */
{
  const state = { eating: 41, skipping: 9, pending: 14 };
  const out = $("#m-json"), toast = $("#m-toast");
  let mine = null;
  const draw = () => {
    out.innerHTML = `{\n  <span class="k">"eating"</span>: <span class="n">${state.eating}</span>,\n  <span class="k">"skipping"</span>: <span class="n">${state.skipping}</span>,\n  <span class="k">"pending"</span>: <span class="n">${state.pending}</span>\n}`;
  };
  const btns = $$("#mess-panel .choice button");
  btns.forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.v === "eat" ? "eating" : "skipping";
    if (mine === v) return;
    if (mine) state[mine]--; else state.pending--;
    state[v]++;
    mine = v;
    btns.forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    toast.textContent = "Saved. You're down as " + (v === "eating" ? "eating" : "skipping") + ".";
    draw();
  }));
  draw();
}

/* ---------- copy email ---------- */
{
  const b = $("#copy");
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("nkg2641@gmail.com"); b.textContent = "Copied."; }
    catch { b.textContent = "nkg2641@gmail.com"; }
    setTimeout(() => (b.textContent = "Copy address"), 1800);
  });
}

console.log("%cNaman Kumar", "font:600 20px system-ui", "\nYou opened the console. Fair. The source is unminified on purpose: src/ecg.js is the detector, src/hand.js is the hand.\nnkg2641@gmail.com");
