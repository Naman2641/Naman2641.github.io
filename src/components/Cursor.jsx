import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import "./Cursor.css";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");

  useEffect(() => {
    // Detect touch device
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);
    if (hasTouch) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });
      gsap.to(ring, { x: mouseX, y: mouseY, duration: 0.25, ease: "power2.out" });
    };

    // Grow on interactive elements
    const onEnter = (e) => {
      const el = e.target.closest("a, button, [role='button'], [role='tab']");
      if (el) {
        gsap.to(ring, { scale: 2, opacity: 0.4, duration: 0.3 });
      }
      // Check for drag hint
      const carousel = e.target.closest(".projects__canvas-wrapper");
      if (carousel) {
        setCursorLabel("Drag");
        gsap.to(ring, { scale: 2.5, opacity: 0.5, duration: 0.3 });
      }
    };

    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3 });
      setCursorLabel("");
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor__dot" />
      <div ref={ringRef} className="cursor__ring">
        {cursorLabel && <span className="cursor__label label">{cursorLabel}</span>}
      </div>
    </div>
  );
}
