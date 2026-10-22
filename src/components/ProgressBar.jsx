import { useEffect, useRef } from "react";

export default function ProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        zIndex: 9999,
        width: "0%",
        background: "var(--accent)",
        transition: "width 0.1s linear",
        boxShadow: "0 0 8px var(--accent)",
      }}
      ref={barRef}
    />
  );
}
