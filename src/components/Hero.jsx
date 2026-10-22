import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personal } from "../data";
import "./Hero.css";

export default function Hero() {
  const sectionRef = useRef(null);
  const headlineRef = useRef([]);
  const taglineRef = useRef(null);
  const scrollRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.6 });

    // Line wipe
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: "power2.out" }
    );

    // Headline reveal
    tl.fromTo(
      headlineRef.current,
      { y: 120, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.4"
    );

    // Tagline
    tl.fromTo(
      taglineRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    // Scroll indicator
    tl.fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      "-=0.2"
    );

    // Parallax on scroll
    gsap.to(sectionRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      y: -80,
      opacity: 0.3,
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__content">
        <div className="hero__line" ref={lineRef} />
        <div className="hero__headline-wrap">
          <h1 className="hero__headline">
            <span
              className="hero__headline-line"
              ref={(el) => (headlineRef.current[0] = el)}
            >
              EXPLORE MY
            </span>
            <span
              className="hero__headline-line"
              ref={(el) => (headlineRef.current[1] = el)}
            >
              PORTFOLIO
            </span>
          </h1>
        </div>
        <p className="hero__tagline" ref={taglineRef}>
          {personal.tagline}
        </p>
      </div>

      <div className="hero__scroll" ref={scrollRef}>
        <div className="hero__scroll-line" />
        <span className="hero__scroll-text">scroll</span>
      </div>

      {/* Ambient glow */}
      <div className="hero__glow hero__glow--1" />
      <div className="hero__glow hero__glow--2" />
    </section>
  );
}
