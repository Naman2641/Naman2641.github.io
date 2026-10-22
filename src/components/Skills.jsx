import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skills } from "../data";
import "./Skills.css";

const allTechItems = [
  "Python",
  "C",
  "MediaPipe",
  "React",
  "Node.js",
  "FastAPI",
  "WebSocket",
  "Arduino",
  "Git",
  "GSAP",
  "Machine Learning",
  "Data Science",
];

export default function Skills() {
  const sectionRef = useRef(null);
  const headerRef = useRef([]);
  const marqueeRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      headerRef.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Marquee scroll-driven speed
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          x: "-50%",
          ease: "none",
          duration: 20,
          repeat: -1,
        });
      }

      // Skill category cards
      cardRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="skills section" id="skills" ref={sectionRef}>
      <div className="skills__inner section__inner">
        <span
          className="section__label"
          ref={(el) => (headerRef.current[0] = el)}
        >
          creative technologist
        </span>
        <h2
          className="section__title"
          ref={(el) => (headerRef.current[1] = el)}
        >
          SKILLS &<br />
          <span className="skills__outline">TOOLS</span>
        </h2>
      </div>

      {/* Infinite marquee */}
      <div className="skills__marquee-wrap">
        <div className="skills__marquee" ref={marqueeRef}>
          {[...allTechItems, ...allTechItems].map((item, i) => (
            <span key={i} className="skills__marquee-item">
              {item}
              <span className="skills__marquee-dot">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="skills__cards section__inner">
        {skills.map((cat, i) => (
          <div
            key={cat.category}
            className="skill-cat"
            ref={(el) => (cardRefs.current[i] = el)}
          >
            <div className="skill-cat__header">
              <h3 className="skill-cat__title">{cat.category}</h3>
              <span className="skill-cat__count">
                {cat.items.length} {cat.items.length === 1 ? "tool" : "tools"}
              </span>
            </div>
            <p className="skill-cat__desc">{cat.description}</p>
            <div className="skill-cat__items">
              {cat.items.map((item) => (
                <span key={item} className="skill-cat__item">
                  {item}
                </span>
              ))}
            </div>
            <div className="skill-cat__used">
              <span className="skill-cat__used-label">Used in:</span>
              {cat.usedIn.map((proj) => (
                <span key={proj} className="skill-cat__used-proj">
                  {proj}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
