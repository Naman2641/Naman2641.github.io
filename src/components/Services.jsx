import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "../data";
import "./Services.css";

export default function Services() {
  const sectionRef = useRef(null);
  const headerRef = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      headerRef.current.forEach((el, i) => {
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

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="services section" id="services" ref={sectionRef}>
      <div className="services__inner section__inner">
        <span
          className="section__label"
          ref={(el) => (headerRef.current[0] = el)}
        >
          what i do
        </span>
        <h2
          className="section__title"
          ref={(el) => (headerRef.current[1] = el)}
        >
          THE SERVICES
          <br />
          <span className="outline">I PROVIDE</span>
        </h2>

        <div className="services__grid">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="service-card"
              ref={(el) => (cardRefs.current[i] = el)}
            >
              <span className="service-card__icon">{service.icon}</span>
              <div className="service-card__number">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.description}</p>
              <div className="service-card__line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
