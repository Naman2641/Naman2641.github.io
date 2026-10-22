import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about, personal, timeline } from "../data";
import "./About.css";

export default function About() {
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const textRefs = useRef([]);
  const timelineRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Photo slide up with grayscale-to-color
      gsap.fromTo(
        photoRef.current,
        { y: 100, opacity: 0, filter: "grayscale(100%) brightness(0.6)" },
        {
          y: 0,
          opacity: 1,
          filter: "grayscale(30%) brightness(0.85)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Text blocks stagger
      textRefs.current.forEach((el, i) => {
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

      // Timeline items
      timelineRefs.current.forEach((el, i) => {
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

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="about__inner section__inner">
        <div className="about__grid">
          {/* Photo column */}
          <div className="about__photo-col">
            <div className="about__photo-wrap" ref={photoRef}>
              <img
                src="/naman.jpg"
                alt={personal.name}
                className="about__photo"
                loading="lazy"
              />
              <div className="about__photo-border" />
            </div>
          </div>

          {/* Text column */}
          <div className="about__text-col">
            <span
              className="section__label"
              ref={(el) => (textRefs.current[0] = el)}
            >
              about me
            </span>
            <h2
              className="section__title"
              ref={(el) => (textRefs.current[1] = el)}
            >
              {about.heading}
              <br />
              <span className="about__outline">ME</span>
            </h2>
            <p
              className="about__bio"
              ref={(el) => (textRefs.current[2] = el)}
            >
              {about.bio}
            </p>

            {/* Quick stats */}
            <div
              className="about__stats"
              ref={(el) => (textRefs.current[3] = el)}
            >
              <div className="about__stat">
                <span className="about__stat-number">8.75</span>
                <span className="about__stat-label">CGPA</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">5+</span>
                <span className="about__stat-label">Projects</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">2</span>
                <span className="about__stat-label">Wins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline below */}
        <div className="about__timeline">
          <div className="about__timeline-line" />
          {timeline.map((item, i) => (
            <div
              key={i}
              className="about__timeline-item"
              ref={(el) => (timelineRefs.current[i] = el)}
            >
              <span className="about__timeline-year">{item.year}</span>
              <div className="about__timeline-content">
                <h3 className="about__timeline-title">{item.title}</h3>
                <p className="about__timeline-subtitle">{item.subtitle}</p>
                <p className="about__timeline-detail">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
