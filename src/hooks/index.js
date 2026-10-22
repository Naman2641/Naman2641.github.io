import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook: returns true when the user prefers reduced motion.
 */
export function useReducedMotion() {
  const query =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  const ref = useRef(query?.matches ?? false);

  useEffect(() => {
    if (!query) return;
    const handler = (e) => {
      ref.current = e.matches;
    };
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, [query]);

  return ref;
}

/**
 * Returns true if the device is likely low-powered or a small touchscreen.
 */
export function useIsLowPower() {
  const ref = useRef(false);
  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isSmall = window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency || 4;
    ref.current = isMobile || isSmall || cores <= 4;
  }, []);
  return ref;
}

/**
 * Checks WebGL availability.
 */
export function useWebGLAvailable() {
  const ref = useRef(true);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl =
        c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
      ref.current = !!gl;
    } catch {
      ref.current = false;
    }
  }, []);
  return ref;
}

/**
 * Intersection observer hook: calls `onEnter` / `onLeave` with the entry.
 */
export function useInView(ref, options = {}) {
  const { threshold = 0.1, rootMargin = "0px", once = false } = options;
  const isInView = useRef(false);

  const setInView = useCallback((val) => {
    isInView.current = val;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const entering = entry.isIntersecting;
        setInView(entering);
        if (entering && options.onEnter) options.onEnter(entry);
        if (!entering && options.onLeave) options.onLeave(entry);
        if (entering && once) observer.disconnect();
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once, options.onEnter, options.onLeave, setInView, once]);

  return isInView;
}
