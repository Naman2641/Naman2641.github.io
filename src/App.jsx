import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loader from "./components/Loader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import ProgressBar from "./components/ProgressBar";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const lenisRef = useRef(null);

  // Lenis smooth scroll
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
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
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <Cursor />
      <ProgressBar />
      <Nav />

      <main id="main-content">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
