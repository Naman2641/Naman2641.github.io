import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personal, heroConfig } from "../data";
import "./Hero.css";

export default function Hero() {
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const headlineRef = useRef([]);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.8 });

    // Photo reveal — slides up from below
    tl.fromTo(
      photoRef.current,
      { y: 120, opacity: 0, scale: 1.1 },
      { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "power3.out" }
    );

    // Headline lines stagger
    tl.fromTo(
      headlineRef.current,
      { y: 100, opacity: 0, rotateX: 15 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      },
      "-=0.9"
    );

    // Tagline
    tl.fromTo(
      taglineRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
      "-=0.5"
    );

    // CTA buttons
    tl.fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    // Badge
    tl.fromTo(
      badgeRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.3"
    );

    // Scroll indicator
    tl.fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      "-=0.2"
    );

    // Parallax hero on scroll
    gsap.to(photoRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      y: 60,
      scale: 1.05,
    });

    gsap.to(".hero__text-col", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      y: -40,
      opacity: 0.2,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__inner">
        {/* Left: Photo */}
        <div className="hero__photo-col" ref={photoRef}>
          <div className="hero__photo-wrap">
            <img
              src={heroConfig.photoUrl}
              alt={personal.name}
              className="hero__photo"
            />
            <div className="hero__photo-overlay" />
          </div>
          {/* Floating badge */}
          <div className="hero__badge" ref={badgeRef}>
            <span className="hero__badge-dot" />
            <span>Available for work</span>
          </div>
        </div>

        {/* Right: Text */}
        <div className="hero__text-col">
          <div className="hero__headline-wrap">
            <h1 className="hero__headline">
              <span
                className="hero__line hero__line--filled"
                ref={(el) => (headlineRef.current[0] = el)}
              >
                {heroConfig.headline[0]}
              </span>
              <span
                className="hero__line hero__line--outline"
                ref={(el) => (headlineRef.current[1] = el)}
              >
                {heroConfig.headline[1]}
              </span>
            </h1>
          </div>

          <p className="hero__tagline" ref={taglineRef}>
            {personal.tagline} — B.E. Computer Science, DSCE Bengaluru
          </p>

          <div className="hero__cta" ref={ctaRef}>
            <a href="#projects" className="hero__btn hero__btn--primary">
              View Projects
            </a>
            <a
              href={personal.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero__btn hero__btn--secondary"
            >
              Download CV ↓
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" ref={scrollRef}>
        <div className="hero__scroll-line" />
        <span className="hero__scroll-text">scroll down</span>
      </div>
    </section>
  );
}
