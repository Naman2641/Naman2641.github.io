import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personal, links } from "../data";
import { useReducedMotion } from "../hooks";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger);

function MagneticPill({ children, href, className, ariaLabel, isMailto }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.15;
    const dy = (e.clientY - cy) * 0.15;
    gsap.to(ref.current, {
      x: dx,
      y: dy,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  const Tag = href ? "a" : "button";
  const props = href
    ? {
        href: isMailto ? `mailto:${href}` : href,
        target: isMailto ? undefined : "_blank",
        rel: isMailto ? undefined : "noopener noreferrer",
      }
    : {};

  return (
    <Tag
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default function Contact() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const wordmarkRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.from(headingRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // Bottom wordmark reveal
      ScrollTrigger.create({
        trigger: wordmarkRef.current,
        start: "top bottom",
        onEnter: () => {
          gsap.fromTo(
            wordmarkRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
          );
        },
        onLeaveBack: () => {
          gsap.to(wordmarkRef.current, { opacity: 0, duration: 0.3 });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Magnetic letter effect for heading
  const headingText = "LET'S TALK";

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contact section section--dark"
      aria-label="Contact"
    >
      <div className="grain-overlay grain-overlay--animated" aria-hidden="true" />

      <div className="contact__inner container">
        <h2 ref={headingRef} className="headline bloom-text contact__heading">
          {headingText.split("").map((char, i) => (
            <span key={i} className="contact__letter" style={{ display: char === " " ? "inline" : "inline-block" }}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>

        <div className="contact__pills">
          <MagneticPill
            href={links.github}
            className="pill pill--ghost contact__pill"
            ariaLabel="GitHub profile"
          >
            GitHub
          </MagneticPill>
          <MagneticPill
            href={links.linkedin}
            className="pill pill--ghost contact__pill"
            ariaLabel="LinkedIn profile"
          >
            LinkedIn
          </MagneticPill>
          <MagneticPill
            href={links.email}
            className="pill pill--filled contact__pill"
            ariaLabel="Send email"
            isMailto
          >
            Email
          </MagneticPill>
        </div>

        <footer className="contact__footer">
          <p className="label contact__copyright">{personal.copyright}</p>

          <div ref={wordmarkRef} className="contact__wordmark headline bloom-text">
            {personal.wordmark}
          </div>
        </footer>
      </div>
    </section>
  );
}
