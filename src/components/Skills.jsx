import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skills, projects } from "../data";
import { useReducedMotion } from "../hooks";
import "./Skills.css";

gsap.registerPlugin(ScrollTrigger);

function SkillRow({ skill, index }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const rowRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const panelId = `skill-panel-${index}`;
  const triggerId = `skill-trigger-${index}`;

  useEffect(() => {
    if (!contentRef.current) return;
    if (reducedMotion.current) {
      contentRef.current.style.height = expanded ? "auto" : "0px";
      return;
    }

    if (expanded) {
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });
    }
  }, [expanded]);

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      gsap.from(rowRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Find linked projects
  const linkedProjects = skill.usedIn
    .map((name) => projects.find((p) => p.name === name))
    .filter(Boolean);

  return (
    <div ref={rowRef} className="skills__row">
      <button
        id={triggerId}
        className="skills__row-trigger"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="headline skills__row-category">{skill.category.toUpperCase()}</span>
        <span className="label skills__row-items">{skill.items.join(" · ")}</span>
        <span className="skills__row-arrow" aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      <div
        id={panelId}
        ref={contentRef}
        className="skills__row-panel"
        role="region"
        aria-labelledby={triggerId}
        style={{ height: 0, opacity: 0, overflow: "hidden" }}
      >
        <div className="skills__row-panel-inner">
          <p className="skills__row-desc">{skill.description}</p>
          {linkedProjects.length > 0 && (
            <p className="label skills__row-used">
              Used in:{" "}
              {linkedProjects.map((p, i) => (
                <span key={p.id}>
                  {p.name}
                  {i < linkedProjects.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="skills-section section section--light"
      aria-label="Skills"
    >
      <div className="container skills__inner">
        <h2 ref={headingRef} className="headline skills__heading">
          TOOLS & FOCUS
        </h2>

        <div className="skills__list">
          {skills.map((skill, i) => (
            <SkillRow key={i} skill={skill} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
