import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about, personal, timeline, links } from "../data";
import "./About.css";

export default function About() {
  const sectionRef = useRef(null);
  const textRefs = useRef([]);
  const timelineRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      textRefs.current.forEach((el, i) => {
        if (!el) return;
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

      timelineRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.12,
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

  const bioLines = about.bio.split("\n\n");

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="about__inner section__inner">
        {/* Header */}
        <div className="about__header">
          <div className="about__header-text">
            <span
              className="section__label"
              ref={(el) => (textRefs.current[0] = el)}
            >
              who am i
            </span>
            <h2
              className="section__title"
              ref={(el) => (textRefs.current[1] = el)}
            >
              ABOUT <span className="outline">ME</span>
            </h2>
          </div>
        </div>

        {/* Two column content */}
        <div className="about__content">
          <div className="about__bio-col">
            {bioLines.map((para, i) => (
              <p
                key={i}
                className="about__bio"
                ref={(el) => (textRefs.current[i + 2] = el)}
              >
                {para}
              </p>
            ))}

            {/* CTA links */}
            <div
              className="about__links"
              ref={(el) => (textRefs.current[bioLines.length + 2] = el)}
            >
              <a
                href={personal.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about__link-btn"
              >
                Resume ↓
              </a>
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="about__link-btn about__link-btn--ghost"
              >
                GitHub →
              </a>
            </div>
          </div>

          <div className="about__stats-col">
            {/* Quick stats */}
            <div className="about__stat-card">
              <span className="about__stat-number">8.75</span>
              <span className="about__stat-label">CGPA</span>
            </div>
            <div className="about__stat-card">
              <span className="about__stat-number">5+</span>
              <span className="about__stat-label">Projects Built</span>
            </div>
            <div className="about__stat-card">
              <span className="about__stat-number">2/3</span>
              <span className="about__stat-label">Hackathons Won</span>
            </div>
            <div className="about__stat-card">
              <span className="about__stat-number">3rd</span>
              <span className="about__stat-label">Semester</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="about__timeline">
          <h3 className="about__timeline-heading"
            ref={(el) => (textRefs.current[bioLines.length + 3] = el)}
          >
            My Journey
          </h3>
          <div className="about__timeline-grid">
            {timeline.map((item, i) => (
              <div
                key={i}
                className="about__tl-card"
                ref={(el) => (timelineRefs.current[i] = el)}
              >
                <span className="about__tl-year">{item.year}</span>
                <h4 className="about__tl-title">{item.title}</h4>
                <p className="about__tl-subtitle">{item.subtitle}</p>
                <p className="about__tl-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
