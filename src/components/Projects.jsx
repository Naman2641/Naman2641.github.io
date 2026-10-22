import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data";
import "./Projects.css";

export default function Projects() {
  const sectionRef = useRef(null);
  const headerRef = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section header
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

      // Project cards with stagger
      cardRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
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
    <section className="projects section" id="projects" ref={sectionRef}>
      <div className="projects__inner section__inner">
        <span
          className="section__label"
          ref={(el) => (headerRef.current[0] = el)}
        >
          featured work
        </span>
        <h2
          className="section__title"
          ref={(el) => (headerRef.current[1] = el)}
        >
          PROJECTS
        </h2>

        <div className="projects__grid">
          {projects.map((project, i) => (
            <article
              key={project.id}
              className="project-card"
              ref={(el) => (cardRefs.current[i] = el)}
            >
              {/* Card number */}
              <span className="project-card__number">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Card content */}
              <div className="project-card__body">
                <h3 className="project-card__name">{project.name}</h3>
                <p className="project-card__oneliner">{project.oneLiner}</p>
                <p className="project-card__desc">{project.description}</p>

                {/* Tech stack */}
                <div className="project-card__tech">
                  {project.tech.map((t) => (
                    <span key={t} className="project-card__tag">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="project-card__links">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-card__link"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-card__link"
                    >
                      Live →
                    </a>
                  )}
                </div>
              </div>

              {/* Hover glow */}
              <div className="project-card__glow" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
