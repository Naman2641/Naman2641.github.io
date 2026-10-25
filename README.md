# Naman Kumar

Plain HTML, CSS and JS. No framework, no build step needed to deploy.

    index.html   the page
    css/         styles
    src/         readable source: ecg.js (QRS detector), hand.js (hand model), main.js
    app.js       src/ bundled into one file (what the page loads)
    assets/      photo, resume, favicon, og image

Preview: `python3 -m http.server` in this folder, open localhost:8000.
Or just double-click index.html.

After editing anything in src/, rebuild app.js:

    npx esbuild src/main.js --bundle --format=iife --outfile=app.js

Deploy: push to the `main` branch of Naman2641.github.io, Settings > Pages > Deploy from branch > main / (root).

## 3D and motion

    src/loader.js  loading screen (counts real progress, never blocks more than 9 s)
    src/fx.js      three.js scene, Lenis smooth scroll, GSAP ScrollTrigger animations

Loaded as plain ES modules from CDNs (three.js 0.160, GSAP 3.12.5, Lenis 1.1.13), so no rebuild is needed for these.
The 3D robot is the CC0 RobotExpressive model from the three.js examples.

The robot lives at the bottom of the screen. It wanders, waves, dances, climbs onto the back-to-top button, falls over if you scroll too hard and gets back up. Click it and it offers a tel: link to call.

Hero: the sky hero (giant name behind, cut-out photo in front, sun and clouds) is adapted from the sky portfolio. Photo: assets/naman-cut.webp.
Loader: two doors with your name swing open and the hero pushes in behind them.
