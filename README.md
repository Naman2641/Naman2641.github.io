# Naman Kumar — Portfolio

A cinematic, WebGL-powered personal portfolio built with **Vite + React 18**, **Three.js** (via `@react-three/fiber`), **GSAP + ScrollTrigger**, and **Lenis** smooth scroll. Black-and-white design system, zero external images, fully procedural.

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## How to Personalise

### 1. Edit content → `src/data.js`

All text, links, project descriptions, and skills are in one file. Change anything and rebuild.

### 2. Swap the hero 3D bust for your photo

1. Place your cut-out photo (transparent PNG) in `public/hero-photo.png`.
2. Open `src/data.js` and change:

```js
export const heroConfig = {
  usePhoto: true,               // ← flip to true
  photoUrl: "/hero-photo.png",  // ← your photo path
  headline: ["EXPLORE MY", "PORTFOLIO"],
};
```

The photo will render with a grayscale filter and a parallax tilt effect.

### 3. Add project links & screenshots

In `src/data.js`, find each project object and fill in:

```js
{
  github: "https://github.com/Naman2641/signspeak",   // your repo URL
  live: "https://signspeak.demo.com",                  // optional live demo
  image: "/projects/signspeak.png",                    // screenshot in public/projects/
}
```

Place screenshot images in `public/projects/`.

### 4. Replace the OG image

Replace `public/og.png` with a 1200 × 630 px image for social sharing previews. Update the URL in `src/data.js` → `meta.url` to your actual domain.

### 5. Custom domain

Update `meta.url` in `src/data.js` and the OG/Twitter meta tags in `index.html`.

---

## Deploy

### Vercel (via GitHub)

1. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo.
3. Framework preset: **Vite**. Click **Deploy**.

### Vercel (via CLI)

```bash
npm i -g vercel
vercel          # follow prompts, pick Vite preset
vercel --prod   # deploy to production
```

### Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → select your GitHub repo.
2. Build command: `npm run build`, publish directory: `dist`.
3. Click **Deploy site**.

### Custom Domain (both platforms)

1. In your platform dashboard, go to **Settings → Domains → Add domain**.
2. Enter your domain (e.g., `namankumar.dev`).
3. Point your DNS records:
   - **Vercel**: Add an `A` record to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`.
   - **Netlify**: Add a `CNAME` to `YOUR_SITE.netlify.app` or use Netlify DNS.
4. Wait for DNS propagation (up to 48h, usually minutes).

---

## Tech Stack

| Layer      | Tech                                       |
|------------|-------------------------------------------|
| Framework  | Vite + React 18                            |
| 3D         | three, @react-three/fiber, @react-three/drei |
| Animation  | GSAP + ScrollTrigger                       |
| Scroll     | Lenis                                      |
| Fonts      | @fontsource/archivo, @fontsource/space-mono |
| Styling    | Plain CSS with CSS variables               |

---

## Project Structure

```
src/
  main.jsx              Entry point
  App.jsx               Root component (Lenis, ScrollTrigger, sections)
  data.js               All content — edit this file
  styles/global.css     Design system tokens & utilities
  components/           Loader, Nav, Hero, About, Journey, Projects, Orbit, Skills, Contact, Cursor, ProgressBar
  three/shaders.js      GLSL shaders (swirl background, card grain)
  hooks/index.js        useReducedMotion, useIsLowPower, useWebGLAvailable, useInView
public/
  favicon.svg           N. mark favicon
  og.png                OG image placeholder
  robots.txt
vercel.json             SPA fallback
netlify.toml            Netlify build config
```

---

## Accessibility

- Semantic landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- Single `<h1>` per page
- Skip-to-content link
- Keyboard-operable carousel and accordion
- `aria-expanded`, `aria-controls`, `aria-label` on interactive elements
- `prefers-reduced-motion` respected (disables parallax, glitch, auto motion)
- WCAG AA contrast for body text
- WebGL fallback: static styled cards and CSS gradient hero

---

## License

MIT © Naman Kumar
