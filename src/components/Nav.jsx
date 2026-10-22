import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { personal, links } from "../data";
import "./Nav.css";

export default function Nav() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 2.6, ease: "power3.out" }
    );
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`} ref={navRef}>
      <div className="nav__inner">
        <button className="nav__logo" onClick={() => scrollTo("hero")}>
          {personal.wordmark}
        </button>

        <div className="nav__links">
          <button onClick={() => scrollTo("about")}>About</button>
          <button onClick={() => scrollTo("services")}>Services</button>
          <button onClick={() => scrollTo("projects")}>Work</button>
          <button onClick={() => scrollTo("skills")}>Skills</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
        </div>

        <a
          href={personal.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nav__resume"
        >
          Resume ↓
        </a>
      </div>
    </nav>
  );
}
