// Background track + mute button. Drop the audio file at assets/loser.mp3.
// Beat timing loaded from assets/beats.json (precomputed via librosa.beat.beat_track).
const SRC = "assets/loser.mp3";
const audio = new Audio();
audio.src = SRC;
audio.loop = true;
audio.preload = "auto";
audio.playsInline = true;
audio.setAttribute("playsinline", "");
audio.setAttribute("webkit-playsinline", "");

const btn = document.createElement("button");
btn.id = "mute";
btn.type = "button";
btn.setAttribute("aria-label", "Mute music");
btn.innerHTML = '<i></i><i></i><i></i><i></i>';
document.body.append(btn);

let ctx = null, gain = null, an = null, data = null;
let started = false, starting = false;
let muted = false;
const music = (window.__music = { on: false });

try {
  muted = localStorage.getItem("muted") === "1";
} catch {}

btn.classList.toggle("off", muted);
btn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
audio.muted = muted;

function setMuted(m) {
  muted = m;
  audio.muted = m;
  if (gain) gain.gain.value = m ? 0 : 1;
  btn.classList.toggle("off", m);
  btn.setAttribute("aria-label", m ? "Unmute music" : "Mute music");
  try {
    localStorage.setItem("muted", m ? "1" : "0");
  } catch {}
}

// Stop propagation so clicks or taps on #mute NEVER trigger the robot or other listeners
["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click"].forEach((ev) => {
  btn.addEventListener(ev, (e) => e.stopPropagation());
});
btn.addEventListener("click", (e) => {
  e.stopPropagation();
  setMuted(!muted);
});

// Touch and iOS detection
const isTouchOrIOS =
  matchMedia("(pointer: coarse)").matches ||
  /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Beat sync from assets/beats.json
let beats = [];
fetch("assets/beats.json")
  .then((r) => r.json())
  .then((d) => {
    if (Array.isArray(d)) beats = d;
  })
  .catch(() => {});

let nextBeatIdx = 0;
let prevTime = 0;

function dispatchBeat(detail = 0.8) {
  dispatchEvent(new CustomEvent("beat", { detail }));
  btn.classList.remove("beat");
  void btn.offsetWidth;
  btn.classList.add("beat");
}

function loop() {
  requestAnimationFrame(loop);
  if (!music.on || audio.paused) return;

  const ct = audio.currentTime;
  if (ct < prevTime - 0.5) {
    nextBeatIdx = 0;
  }
  prevTime = ct;

  if (beats.length > 0) {
    while (nextBeatIdx < beats.length && beats[nextBeatIdx] <= ct) {
      if (ct - beats[nextBeatIdx] < 0.25) {
        dispatchBeat(0.8);
      }
      nextBeatIdx++;
    }
  } else if (an && data) {
    an.getByteFrequencyData(data);
    let e = 0;
    for (let i = 1; i < 8; i++) e += data[i];
    e /= 7;
    hist.push(e);
    if (hist.length > 43) hist.shift();
    const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
    const now = performance.now();
    if (e > avg * 1.15 && e > 55 && now - lastBeat > 280 && e > prev) {
      lastBeat = now;
      dispatchBeat(Math.min(1, (e - avg) / 90));
    }
    prev = e;
  }
}
const hist = [];
let lastBeat = 0, prev = 0;
loop();

function start() {
  if (started || starting) return;
  starting = true;
  audio.muted = muted;

  // Crucial: Call audio.play() immediately and synchronously before any await
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        started = true;
        starting = false;
        music.on = true;
        btn.classList.add("live");
        removeListeners();

        // On touch/iOS devices, do NOT route through createMediaElementSource so it ignores silent switch
        if (!isTouchOrIOS && !ctx) {
          try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            const src = ctx.createMediaElementSource(audio);
            gain = ctx.createGain();
            gain.gain.value = muted ? 0 : 1;
            an = ctx.createAnalyser();
            an.fftSize = 1024;
            an.smoothingTimeConstant = 0.5;
            data = new Uint8Array(an.frequencyBinCount);
            src.connect(an);
            an.connect(gain);
            gain.connect(ctx.destination);
            if (ctx.state === "suspended") ctx.resume().catch(() => {});
          } catch {
            // Fall back to direct audio
          }
        }
      })
      .catch(() => {
        starting = false;
        // Keep waiting for the next tap if play() failed
      });
  }
}

const startEvents = ["pointerup", "touchend", "click"];
function onInteraction(e) {
  start();
}
function attachListeners() {
  startEvents.forEach((t) => addEventListener(t, onInteraction, { passive: true }));
}
function removeListeners() {
  startEvents.forEach((t) => removeEventListener(t, onInteraction));
}
attachListeners();

// Pause on document.hidden, resume on return
let wasPlayingBeforeHidden = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (started && !audio.paused) {
      wasPlayingBeforeHidden = true;
      audio.pause();
    }
  } else {
    if (wasPlayingBeforeHidden) {
      wasPlayingBeforeHidden = false;
      audio.play().catch(() => {});
    }
  }
});

audio.addEventListener("error", () => {
  btn.title = "Add assets/loser.mp3";
  btn.style.opacity = ".5";
});
audio.addEventListener("canplay", () => btn.classList.add("ready"), { once: true });
