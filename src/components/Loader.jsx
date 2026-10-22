import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Loader.css";

export default function Loader({ onComplete }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const cursorRef = useRef(null);
  const subtitleRef = useRef(null);
  const progressRef = useRef(null);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const word = "NAMAN.";
    let idx = 0;
    let typed = "";

    // Phase 1: Type the word letter by letter
    const typeTimer = setInterval(() => {
      if (idx < word.length) {
        typed += word[idx];
        setDisplayText(typed);
        idx++;
      } else {
        clearInterval(typeTimer);
        // Phase 2: After typing, animate progress bar + transition out
        setTimeout(() => {
          // Fill progress bar
          gsap.to(progressRef.current, {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              // Slide the whole loader up
              gsap.to(containerRef.current, {
                yPercent: -100,
                duration: 0.9,
                ease: "power4.inOut",
                onComplete,
              });
            },
          });

          // Fade subtitle in
          gsap.to(subtitleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }, 400);
      }
    }, 130);

    return () => clearInterval(typeTimer);
  }, [onComplete]);

  return (
    <div className="loader" ref={containerRef}>
      <div className="loader__content">
        {/* Typed wordmark */}
        <h1 className="loader__wordmark" ref={textRef}>
          <span className="loader__typed">{displayText}</span>
          <span className="loader__cursor" ref={cursorRef}>|</span>
        </h1>

        {/* Subtitle */}
        <p className="loader__subtitle" ref={subtitleRef}>
          portfolio · 2026
        </p>

        {/* Progress bar */}
        <div className="loader__progress-track">
          <div className="loader__progress-bar" ref={progressRef} />
        </div>
      </div>

      {/* Corner decoration */}
      <div className="loader__corner loader__corner--tl" />
      <div className="loader__corner loader__corner--br" />
    </div>
  );
}
