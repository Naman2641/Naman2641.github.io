// Background track + mute button. Drop the audio file at assets/loser.mp3.
// The beat is detected live from the audio itself (low-frequency energy against a
// rolling average), so the robot and the button pulse on the real kick drum of
// whatever file is there, not on a guessed tempo.
const SRC = "assets/loser.mp3";
const audio = new Audio(SRC);
audio.loop = true; audio.preload = "auto";

const btn = document.createElement("button");
btn.id = "mute"; btn.type = "button"; btn.setAttribute("aria-label", "Mute music");
btn.innerHTML = '<i></i><i></i><i></i><i></i>';
document.body.append(btn);

let ctx, gain, an, data, started = false, muted = false;
const music = (window.__music = { on: false });

function setMuted(m) {
  muted = m; btn.classList.toggle("off", m);
  btn.setAttribute("aria-label", m ? "Unmute music" : "Mute music");
  if (gain) gain.gain.value = m ? 0 : 1;
  try { localStorage.setItem("muted", m ? "1" : "0"); } catch {}
}
try { muted = localStorage.getItem("muted") === "1"; } catch {}
btn.classList.toggle("off", muted);
btn.addEventListener("click", (e) => { e.stopPropagation(); start(); setMuted(!muted); });

function loop() {
  requestAnimationFrame(loop);
  if (!an || !music.on) return;
  an.getByteFrequencyData(data);
  let e = 0; for (let i = 1; i < 8; i++) e += data[i]; e /= 7;   // roughly 40 to 350 Hz
  hist.push(e); if (hist.length > 43) hist.shift();
  const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
  const now = performance.now();
  if (e > avg * 1.15 && e > 55 && now - lastBeat > 280 && e > prev) {
    lastBeat = now;
    dispatchEvent(new CustomEvent("beat", { detail: Math.min(1, (e - avg) / 90) }));
    btn.classList.remove("beat"); void btn.offsetWidth; btn.classList.add("beat");
  }
  prev = e;
}
const hist = []; let lastBeat = 0, prev = 0;

// Browsers refuse sound until the visitor interacts. Muted playback is allowed, so the
// track starts silently at once, then the first click, tap or key press switches the sound on.
async function start() {
  if (started) return; started = true;
  try {
    audio.currentTime = 0;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(audio);
    gain = ctx.createGain(); gain.gain.value = muted ? 0 : 1;
    an = ctx.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.5;
    data = new Uint8Array(an.frequencyBinCount);
    src.connect(an); an.connect(gain); gain.connect(ctx.destination);
    audio.muted = false;
    await ctx.resume(); await audio.play();
    music.on = true; btn.classList.add("live");
  } catch { started = false; try { ctx && ctx.close(); } catch {} ctx = null; }
}

audio.addEventListener("error", () => { btn.title = "Add assets/loser.mp3"; btn.style.opacity = ".5"; });
audio.addEventListener("canplay", () => btn.classList.add("ready"), { once: true });
// browsers only allow sound after a click, tap or key press, so start on the first one
["pointerdown", "pointerup", "mousedown", "click", "keydown", "touchend"].forEach((t) => addEventListener(t, start, { passive: true }));
audio.muted = true; audio.play().catch(() => {});
loop();
