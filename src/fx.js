// Live 3D + scroll motion. Real libraries (three.js, GSAP, Lenis) and a real
// glTF model from the three.js examples (RobotExpressive, by Tomás Laulhé, CC0).
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const emit = (n, d) => dispatchEvent(new CustomEvent(n, { detail: d }));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const { gsap, ScrollTrigger, Lenis } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- smooth scroll + scroll animations ---------- */
let lenis = null;
if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    addEventListener("fx:reveal", () => lenis.start());
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      const el = a && a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -64, duration: 1.4 }); }
    });
  }
  if (!reduced) {
    // sky hero: you step in, the name behind fades, the photo comes closer
    addEventListener("fx:reveal", () => {
      gsap.from(".ch", { yPercent: 115, duration: 1.7, stagger: 0.08, ease: "power4.out" });
      gsap.from(".me", { y: 90, opacity: 0, filter: "blur(18px)", duration: 2.2, ease: "power3.out" });
      gsap.from(".sun", { opacity: 0, scale: 0.5, duration: 3, ease: "power2.out" });
      gsap.from(".hero .cap", { opacity: 0, y: 14, duration: 1.2, delay: 1.2, stagger: 0.15 });
    });
    const sc = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".name", { scale: 1.2, opacity: 0, ease: "none", scrollTrigger: sc });
    gsap.to(".meW", { scale: 1.08, yPercent: 6, ease: "none", scrollTrigger: sc });
    gsap.to(".trace", { yPercent: 60, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", (e) => {
      const px = e.clientX / innerWidth - 0.5, py = e.clientY / innerHeight - 0.5;
      gsap.to(".name", { x: px * -26, y: py * -16, duration: 1.8 });
      gsap.to(".meW", { x: px * 14, y: py * 8, duration: 1.6 });
      gsap.to(".sun", { x: px * 60, y: py * 40, duration: 2.4 });
      gsap.to(".c1", { x: px * 90, duration: 2.6 });
      gsap.to(".c2", { x: px * -70, duration: 2.6 });
    });

    // text blocks rise in as they arrive
    const rise = ".sec-head h2,.sec-head p,.proj h3,.proj .kind,.proj .copy>p,.io div,.about .lede,.about dl div,.contact .say,.mail,.contact .row,footer";
    gsap.set(rise, { opacity: 0, y: 56 });
    ScrollTrigger.batch(rise, { start: "top 90%", once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.07, overwrite: true }) });

    // panels swing up out of the page in 3D
    $$(".panel").forEach((p) => gsap.fromTo(p, { rotateX: 22, y: 90, opacity: 0.2, transformPerspective: 1100, transformOrigin: "50% 100%" },
      { rotateX: 0, y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 95%", end: "top 40%", scrub: 0.6 } }));

    // project titles slide sideways against the scroll
    $$(".proj h3").forEach((h, i) => gsap.to(h, { xPercent: i % 2 ? 4 : -4, ease: "none",
      scrollTrigger: { trigger: h, start: "top bottom", end: "bottom top", scrub: true } }));

    gsap.to(".prog b", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 } });
  }
  addEventListener("fx:reveal", () => ScrollTrigger.refresh());
}

/* ---------- small details ---------- */
{
  const sp = $("#sp"), ring = $("#up .ring"), C = 2 * Math.PI * 20;
  if (ring) ring.style.strokeDasharray = C;
  const upd = () => {
    const y = lenis ? lenis.scroll : scrollY, m = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, y / m));
    if (sp) sp.textContent = String(Math.round(p * 100)).padStart(2, "0");
    if (ring) ring.style.strokeDashoffset = C * (1 - p);
  };
  addEventListener("scroll", upd, { passive: true }); lenis && lenis.on("scroll", upd); upd();
  $("#up").addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" })));
  const t0 = document.title;
  document.addEventListener("visibilitychange", () => { document.title = document.hidden ? "Still here? \u00b7 Naman Kumar" : t0; });
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    const c = $(".cur"); document.documentElement.classList.add("hc");
    addEventListener("pointermove", (e) => {
      c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      c.classList.toggle("big", !!e.target.closest("a,button,input,#bot-hit"));
    });
  }
  // heart-rate gauge follows the live detector readout
  const nd = $("#g-needle"), zone = $("#g-zone"), bt = $("#g-beat"), out = $("#e-bpm"), en = $("#e-n");
  if (nd && out) {
    let v = 62;
    setInterval(() => {
      const b = parseInt(out.textContent) || 62; v += (b - v) * 0.35;
      nd.style.left = Math.min(100, Math.max(0, ((v - 50) / 120) * 100)) + "%";
      zone.textContent = v < 72 ? "resting" : v < 92 ? "active" : v < 112 ? "elevated" : "racing";
    }, 80);
    new MutationObserver(() => { bt.classList.remove("on"); void bt.offsetWidth; bt.classList.add("on"); }).observe(en, { childList: true, characterData: true, subtree: true });
  }
}

/* ---------- the robot: lives at the bottom of the screen ---------- */
const cv = $("#gl");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); }
catch { renderer = null; }

if (!renderer) emit("fx:ready");
else {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  let W = innerWidth, VH = innerHeight, H = 300;
  const cam = new THREE.OrthographicCamera(0, W, VH, 0, -3000, 3000); // 1 unit = 1 css px
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(300, 600, 900); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd9372a, 1.6); rim.position.set(-600, 200, -400); scene.add(rim);
  const size = () => {
    W = innerWidth; VH = innerHeight; H = Math.min(VH * (W < 900 ? 1.0 : 1.4), W * 1.3);
    renderer.setSize(W, VH, false); cam.right = W; cam.top = VH; cam.updateProjectionMatrix();
  };
  size(); addEventListener("resize", size);

  const sc = document.createElement("canvas"); sc.width = sc.height = 64;
  const g2 = sc.getContext("2d"), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(22,26,33,.4)"); gr.addColorStop(1, "rgba(22,26,33,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.position.z = -200; scene.add(shadow);

  const holder = new THREE.Group(); scene.add(holder);
  let mixer = null, cur = null; const acts = {};
  const act = (n, o = {}) => {
    const a = acts[n]; if (!a || (cur === a && !o.force)) return;
    const loop = o.loop !== false;
    a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !loop;
    a.timeScale = o.rev ? -1 : 1; if (o.rev) a.time = a.getClip().duration;
    a.fadeIn(o.fade ?? 0.3).play(); if (cur && cur !== a) cur.fadeOut(o.fade ?? 0.3); cur = a;
  };

  const GROUND = 10, rnd = (a, b) => a + Math.random() * (b - a);
  const EMOTES = [["Wave", 2.4], ["ThumbsUp", 2.0], ["Yes", 1.9], ["No", 1.9]];
  const minRobX = () => H * 0.25;
  const maxRobX = () => Math.max(minRobX(), W - 160 - H * 0.22);
  const B = { mode: "idle", t: 0, dur: 0, wait: 4.0, x: Math.min(innerWidth * 0.55, innerWidth - 250), y0: GROUND, tx: 0, face: 0 };
  const go = (m, d = 0) => { B.mode = m; B.t = 0; B.dur = d; };
  const say = $("#bot-say"), hit = $("#bot-hit");
  const busy = () => false;

  new GLTFLoader().load(MODEL, (gl) => {
    const m = gl.scene, box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    m.scale.setScalar(1 / sz.y); m.position.set(-c.x / sz.y, -box.min.y / sz.y, -c.z / sz.y);
    holder.add(m); mixer = new THREE.AnimationMixer(m);
    gl.animations.forEach((a) => (acts[a.name] = mixer.clipAction(a)));
    act("Wave"); go("emote", 2.6);
    emit("fx:ready");
  }, (x) => { if (x.lengthComputable) emit("fx:progress", 0.35 + 0.65 * (x.loaded / x.total)); }, () => emit("fx:ready"));

  let sayTimer = null;
  hit.addEventListener("click", () => {
    if (busy()) return;
    act("Wave", { force: true }); go("emote", 2.2);
    say.classList.add("on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => say.classList.remove("on"), 4000);
    setTimeout(() => { location.href = "tel:+916378477319"; }, 350);
  });

  const choose = () => {
    const r = Math.random(), mx = maxRobX(), mn = minRobX();
    if (r < 0.35 && mx > mn + 40) {
      let x, n = 0;
      do { x = rnd(mn, mx); } while (Math.abs(x - B.x) < (mx - mn) * 0.25 && ++n < 20);
      B.tx = x; go("walk");
      B.wait = rnd(4.0, 8.0);
    } else if (r < 0.65) {
      const [n, d] = EMOTES[Math.floor(Math.random() * EMOTES.length)];
      act(n, { force: true }); go("emote", d);
      B.wait = rnd(5.0, 9.0);
    } else {
      act(window.__music && window.__music.on ? "Dance" : "Idle");
      B.wait = rnd(4.0, 7.0);
    }
  };

  addEventListener("beat", () => {});
  let mx = 0, last = performance.now();
  addEventListener("pointermove", (e) => { mx = (e.clientX / innerWidth) * 2 - 1; });

  const frame = () => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (document.hidden || !mixer) return;
    B.t += dt;

    let face = mx * 0.04;
    switch (B.mode) {
      case "idle": act(window.__music && window.__music.on ? "Dance" : "Idle"); if (!reduced && B.t > B.wait) choose(); break;
      case "emote": if (B.t > B.dur) { act(window.__music && window.__music.on ? "Dance" : "Idle"); go("idle"); } break;
      case "walk": {
        const d = B.tx - B.x, dir = Math.sign(d) || 1;
        act("Walking"); face = dir * (Math.PI / 2);
        B.x += dir * Math.min(Math.abs(d), H * 0.45 * dt);
        if (Math.abs(d) <= 2) { act(window.__music && window.__music.on ? "Dance" : "Idle"); go("idle"); }
        break;
      }
    }

    B.x = Math.min(maxRobX(), Math.max(minRobX(), B.x));
    if (!isFinite(B.x)) { B.x = W / 2; go("idle"); }
    holder.visible = true;
    const y = GROUND;
    holder.position.set(B.x, y, 0); holder.scale.setScalar(H);
    holder.rotation.y += (face - holder.rotation.y) * (1 - Math.exp(-dt * 8));
    shadow.position.x = B.x; shadow.position.y = GROUND + 4;
    shadow.scale.set(H * 0.62, H * 0.1, 1);
    const hitW = H * 0.28, hitH = H * 0.65;
    hit.style.width = hitW + "px"; hit.style.height = hitH + "px";
    hit.style.transform = `translate(${B.x - hitW / 2}px,${-y}px)`;
    hit.style.pointerEvents = "auto";
    const bx = Math.min(maxRobX(), Math.max(minRobX(), B.x));
    say.style.transform = `translate(${bx}px,${-Math.min(y + H * 0.75, VH - 90)}px) translateX(-50%)`;
    mixer.update(dt);
    renderer.render(scene, cam);
  };
  if (gsap) gsap.ticker.add(frame);
  else (function loop() { frame(); requestAnimationFrame(loop); })();
}
