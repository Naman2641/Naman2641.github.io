import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loader from "./components/Loader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Journey from "./components/Journey";
import Projects from "./components/Projects";
import Orbit from "./components/Orbit";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import ProgressBar from "./components/ProgressBar";
import { useReducedMotion } from "./hooks";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const lenisRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // Initialise Lenis smooth scroll
  useEffect(() => {
    if (reducedMotion.current) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Lock scroll during loader
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = "hidden";
      if (lenisRef.current) lenisRef.current.stop();
    } else {
      document.body.style.overflow = "";
      if (lenisRef.current) lenisRef.current.start();
    }
  }, [loaded]);

  return (
    <>
      {/* Accessibility: skip to content */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Loader */}
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* Custom cursor */}
      <Cursor />

      {/* Scroll progress */}
      <ProgressBar />

      {/* Navigation */}
      <Nav />

      {/* Main content */}
      <main id="main-content">
        <Hero />
        <About />
        <Journey />
        <Projects />
        <Orbit />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
