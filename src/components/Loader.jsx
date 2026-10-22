import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { personal } from "../data";
import "./Loader.css";

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const wordmarkRef = useRef(null);
  const caretRef = useRef(null);
  const progressRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");
  const letters = personal.wordmark.split("");

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Reveal animation
        const revealTl = gsap.timeline({
          onComplete: () => {
            if (onComplete) onComplete();
          },
        });

        revealTl
          .to(wordmarkRef.current, {
            scale: 8,
            opacity: 0,
            filter: "blur(20px)",
            duration: 0.8,
            ease: "power2.in",
          })
          .to(
            loaderRef.current,
            {
              clipPath: "circle(150% at 50% 50%)",
              duration: 1,
              ease: "power3.inOut",
            },
            "-=0.4"
          )
          .set(loaderRef.current, { display: "none" });
      },
    });

    // Letter-by-letter reveal
    letters.forEach((_, i) => {
      tl.call(
        () => {
          setDisplayedText(personal.wordmark.substring(0, i + 1));
        },
        null,
        i * 0.1
      );
    });

    // Progress bar
    tl.to(
      progressRef.current,
      {
        scaleX: 1,
        duration: letters.length * 0.1 + 0.5,
        ease: "power1.inOut",
      },
      0
    );

    // Pause after reveal
    tl.to({}, { duration: 0.6 });

    return () => tl.kill();
  }, []);

  return (
    <div
      ref={loaderRef}
      className="loader"
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="loader__content">
        <h1 ref={wordmarkRef} className="loader__wordmark headline bloom-text">
          {displayedText}
          <span ref={caretRef} className="loader__caret" aria-hidden="true">
            |
          </span>
        </h1>
        <div className="loader__progress-track">
          <div
            ref={progressRef}
            className="loader__progress-bar"
          />
        </div>
      </div>
    </div>
  );
}
