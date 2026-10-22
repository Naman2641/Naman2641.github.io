import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { timeline, personal } from "../data";
import { useReducedMotion } from "../hooks";
import "./Journey.css";

gsap.registerPlugin(ScrollTrigger);

export default function Journey() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const ghostRef = useRef(null);
  const rowsRef = useRef([]);
  const lineRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion.current) return;

    const ctx = gsap.context(() => {
      // Heading glitch reveal — RGB split effect
      const headingEls = headingRef.current?.querySelectorAll(".journey__heading-layer");
      if (headingEls) {
        gsap.set(headingEls, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        // First: show with offset (glitch)
        tl.to(headingEls, {
          opacity: 1,
          duration: 0.1,
        });
        tl.to(headingEls[0], { x: -8, y: -4, duration: 0.15, ease: "power2.out" }, "<");
        tl.to(headingEls[1], { x: 0, y: 0, duration: 0.15 }, "<");
        tl.to(headingEls[2], { x: 8, y: 4, duration: 0.15, ease: "power2.out" }, "<");

        // Then settle
        tl.to(headingEls[0], { x: 0, y: 0, duration: 0.4, ease: "power3.out" }, "+=0.05");
        tl.to(headingEls[2], { x: 0, y: 0, duration: 0.4, ease: "power3.out" }, "<");
      }

      // Ghost text parallax
      if (ghostRef.current) {
        gsap.to(ghostRef.current, {
          y: -100,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Timeline line draw
      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleY: 0,
          transformOrigin: "top",
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Rows slide in
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        gsap.from(row, {
          x: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="journey section section--dark"
      aria-label="Journey"
    >
      <div className="grain-overlay grain-overlay--animated" aria-hidden="true" />

      {/* Ghost text */}
      <div ref={ghostRef} className="journey__ghost headline" aria-hidden="true">
        {personal.name.toUpperCase()} 2029
      </div>

      <div className="journey__inner container">
        {/* Heading with RGB-split layers */}
        <div ref={headingRef} className="journey__heading-wrapper">
          <span className="headline bloom-text journey__heading-layer journey__heading--r" aria-hidden="true">
            WHERE I'VE BEEN
          </span>
          <h2 className="headline bloom-text journey__heading-layer journey__heading--main">
            WHERE I'VE BEEN
          </h2>
          <span className="headline bloom-text journey__heading-layer journey__heading--b" aria-hidden="true">
            WHERE I'VE BEEN
          </span>
        </div>

        {/* Timeline */}
        <div className="journey__timeline">
          <div ref={lineRef} className="journey__line" aria-hidden="true" />

          {timeline.map((item, i) => (
            <div
              key={i}
              ref={(el) => (rowsRef.current[i] = el)}
              className="journey__row"
            >
              <span className="label label-bold journey__year">{item.year}</span>
              <div className="journey__dot" aria-hidden="true" />
              <div className="journey__row-content">
                <h3 className="journey__row-title">{item.title}</h3>
                <p className="journey__row-subtitle label">{item.subtitle}</p>
                <p className="journey__row-detail">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
