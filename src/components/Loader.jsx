import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Loader.css";

export default function Loader({ onComplete }) {
  const containerRef = useRef(null);
  const lettersRef = useRef([]);
  const subtitleRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
          onComplete,
        });
      },
    });

    // Line wipe in
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: "power2.out" }
    );

    // Letters stagger in
    tl.fromTo(
      lettersRef.current,
      { y: 80, opacity: 0, rotateX: 90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );

    // Subtitle fade
    tl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );

    // Hold for a beat
    tl.to({}, { duration: 0.6 });

    return () => tl.kill();
  }, [onComplete]);

  const wordmark = "NAMAN.";

  return (
    <div className="loader" ref={containerRef}>
      <div className="loader__content">
        <div className="loader__line" ref={lineRef} />
        <h1 className="loader__wordmark">
          {wordmark.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => (lettersRef.current[i] = el)}
              className="loader__letter"
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="loader__subtitle" ref={subtitleRef}>
          portfolio · 2026
        </p>
      </div>
    </div>
  );
}
