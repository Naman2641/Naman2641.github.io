import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { links, personal } from "../data";
import "./Contact.css";

export default function Contact() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const linksRef = useRef([]);
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      linksRef.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.2 + i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay: 0.6,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="contact section" id="contact" ref={sectionRef}>
      <div className="contact__inner section__inner">
        <span className="section__label">get in touch</span>

        <h2 className="contact__headline" ref={headlineRef}>
          LET'S
          <br />
          <span className="contact__outline">TALK</span>
        </h2>

        <div className="contact__links">
          <a
            href={`mailto:${links.email}`}
            className="contact__link"
            ref={(el) => (linksRef.current[0] = el)}
          >
            <span className="contact__link-label">Email</span>
            <span className="contact__link-value">{links.email}</span>
            <span className="contact__link-arrow">→</span>
          </a>

          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__link"
            ref={(el) => (linksRef.current[1] = el)}
          >
            <span className="contact__link-label">GitHub</span>
            <span className="contact__link-value">Naman2641</span>
            <span className="contact__link-arrow">→</span>
          </a>

          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__link"
            ref={(el) => (linksRef.current[2] = el)}
          >
            <span className="contact__link-label">LinkedIn</span>
            <span className="contact__link-value">namankumar2641</span>
            <span className="contact__link-arrow">→</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="contact__footer" ref={footerRef}>
        <div className="contact__footer-inner section__inner">
          <span className="contact__copyright">{personal.copyright}</span>
          <span className="contact__built">
            Built with obsession & too many tiny details
          </span>
        </div>
      </footer>

      {/* Ambient glow */}
      <div className="contact__glow" />
    </section>
  );
}
