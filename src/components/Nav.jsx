import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { personal, links, nav } from "../data";
import "./Nav.css";

export default function Nav() {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo(
        menuRef.current,
        { clipPath: "circle(0% at calc(100% - 40px) 40px)" },
        {
          clipPath: "circle(150% at calc(100% - 40px) 40px)",
          duration: 0.7,
          ease: "power3.inOut",
        }
      );
      document.body.style.overflow = "hidden";
    } else if (menuRef.current) {
      gsap.to(menuRef.current, {
        clipPath: "circle(0% at calc(100% - 40px) 40px)",
        duration: 0.5,
        ease: "power3.inOut",
      });
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id.toLowerCase());
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header ref={navRef} className="nav" role="banner">
        <div className="nav__inner container">
          <a href="#home" className="nav__logo headline" onClick={() => scrollTo("home")}>
            {personal.wordmark}
          </a>

          <nav className="nav__links" role="navigation" aria-label="Main navigation">
            {nav.map((item) => (
              <button
                key={item}
                className="nav__link label"
                onClick={() => scrollTo(item)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="nav__social">
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="nav__icon"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="nav__icon"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href={`mailto:${links.email}`}
              aria-label="Email"
              className="nav__icon"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>

          <button
            className="nav__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`nav__burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`nav__burger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        ref={menuRef}
        className={`mobile-menu ${menuOpen ? "active" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <nav className="mobile-menu__nav">
          {nav.map((item, i) => (
            <button
              key={item}
              className="mobile-menu__link headline"
              onClick={() => scrollTo(item)}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="mobile-menu__social">
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="pill pill--filled">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="pill pill--filled">
            LinkedIn
          </a>
          <a href={`mailto:${links.email}`} className="pill pill--filled">
            Email
          </a>
        </div>
      </div>
    </>
  );
}
