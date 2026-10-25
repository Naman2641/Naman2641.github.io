// Loading screen. Counts real progress (fonts, page, 3D model) and always lets go
// after a few seconds, even if a CDN is blocked.
(() => {
  const L = document.getElementById("loader"), h = document.documentElement;
  if (!L || !h.classList.contains("ld")) return;
  const n = document.getElementById("ld-n"), m = document.getElementById("ld-msg");
  let p = 0.08, shown = 0, over = false;
  const min = Date.now() + 2000, fail = Date.now() + 9000;
  const bump = (v, msg) => { p = Math.max(p, v); if (msg) m.textContent = msg; };
  addEventListener("fx:progress", (e) => bump(e.detail, "loading 3D model"));
  addEventListener("fx:ready", () => bump(1, "ready"));
  addEventListener("load", () => bump(0.35, "loading 3D model"));
  document.fonts && document.fonts.ready.then(() => bump(0.2));
  import("./fx.js").catch(() => bump(1, "ready"));

  function finish() {
    if (over) return; over = true;
    m.textContent = "entering";
    L.classList.add("lit");
    setTimeout(() => {
      L.classList.add("out");
      h.classList.remove("go", "ld");
      setTimeout(() => { h.classList.add("go"); dispatchEvent(new Event("fx:reveal")); }, 300);
      setTimeout(() => L.remove(), 2300);
      import("./music.js").catch(() => {});
    }, 650);
  }
  (function t() {
    shown += (p - shown) * 0.07;
    if (p >= 1 && shown > 0.995) shown = 1;
    const v = Math.round(shown * 100);
    n.textContent = String(v).padStart(3, "0");
    L.style.setProperty("--p", v + "%");
    if ((shown >= 1 && Date.now() > min) || Date.now() > fail) return finish();
    requestAnimationFrame(t);
  })();
})();
