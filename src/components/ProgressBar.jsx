import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="progress-bar"
      style={{ transform: "scaleX(0)" }}
      role="progressbar"
      aria-label="Scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
