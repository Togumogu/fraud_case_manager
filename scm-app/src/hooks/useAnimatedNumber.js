import { useState, useEffect, useRef } from "react";

/**
 * useAnimatedNumber — counts from 0 to `target` with ease-out animation.
 * @param {number} target   — the final value to animate to
 * @param {number} duration — animation duration in ms (default 900)
 * @returns {number} current display value (integer)
 */
export default function useAnimatedNumber(target, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);
  const fromRef   = useRef(0);

  useEffect(() => {
    if (target === null || target === undefined || typeof target !== "number") return;

    const from = fromRef.current;
    const to   = target;
    if (from === to) return;

    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(from + (to - from) * eased);
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return current;
}
