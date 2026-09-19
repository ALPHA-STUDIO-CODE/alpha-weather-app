import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the OS-level `prefers-reduced-motion` setting live (Step
 * 33, spec §4.4's accessibility requirement). Every other
 * reduced-motion accommodation in this app so far (LoadingSpinner's
 * spin animation, the body background-color transition — both in
 * index.css/LoadingSpinner.module.css) is a pure CSS `@media` query
 * and needs nothing from React. WeatherIcon (Step 33) is the first
 * case that can't work that way: which *file* gets requested
 * (animated vs. static Meteocons SVG) has to be decided in JS, since
 * a CSS media query can't swap an <img>'s `src`.
 *
 * Live-updating (via the MediaQueryList "change" event, not just a
 * one-time read on mount) so a user who toggles the OS setting while
 * the app is already open sees icons switch immediately, without
 * needing a page reload.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    const handleChange = (event) => setPrefersReduced(event.matches);
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
