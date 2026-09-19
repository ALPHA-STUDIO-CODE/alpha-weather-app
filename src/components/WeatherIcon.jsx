import styles from "./WeatherIcon.module.css";
import { meteoconFor } from "../lib/weatherIcons.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

/**
 * Renders the Meteocons SVG for a given OpenWeather icon code (Step
 * 33, spec §4.4), replacing the plain OpenWeather PNG `<img>` used by
 * CurrentWeatherCard/ForecastCards since the vertical slice (Phase
 * C) — the one piece of intentionally-temporary code flagged back
 * then, retired here on schedule.
 *
 * **Asset layout this component assumes — not yet vendored into this
 * repo.** This sandbox has no network access to pull the real
 * Meteocons package/CDN files, so the actual SVGs still need to be
 * downloaded (bas.dev/work/meteocons, or the `@bybas/weather-icons`
 * npm package) into:
 *   public/icons/meteocons/animated/{name}.svg  — full animated icon
 *   public/icons/meteocons/static/{name}.svg    — first-frame/still
 * `{name}` is whatever weatherIcons.js's meteoconFor() (Step 32)
 * returns — e.g. "clear-day", "not-available". Until both folders
 * exist with matching filenames, every icon in the app will 404.
 *
 * `prefers-reduced-motion` is handled here in JS via
 * usePrefersReducedMotion, not left to a CSS media query, because
 * the thing that has to change is which *file* loads — a static
 * variant, not just a paused animation — and only JS can swap an
 * <img>'s `src`.
 *
 * Reuses v1's dark-mode icon-contrast filter (drop-shadow +
 * contrast/brightness, documented in HANDOFF.md's Known Quirks)
 * inside this component's own CSS Module, carried over per spec
 * §4.4 rather than reinvented. Worth noting: this is that filter's
 * *first* appearance anywhere in v2 — confirmed before writing this
 * component that Phases C–I never actually ported it despite
 * claiming v1 responsive/contrast parity; it was sitting on
 * OpenWeather's PNGs in v1 but never carried over to v2's `<img>`
 * tags, and would have kept being missed for as long as those PNGs
 * stuck around. Fixed here instead of flagged-and-deferred again,
 * since this is precisely the component that owns icon rendering.
 *
 * `className` lets each caller compose in its own sizing (56px for
 * CurrentWeatherCard, 44px for ForecastCards) without this component
 * needing to know either number — same pattern already used for the
 * two cards' existing `.icon` CSS Module classes.
 */
function WeatherIcon({ code, alt = "", className = "" }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const name = meteoconFor(code);
  const variant = prefersReducedMotion ? "static" : "animated";
  const src = `/icons/meteocons/${variant}/${name}.svg`;

  return <img className={`${styles.icon} ${className}`.trim()} src={src} alt={alt} />;
}

export default WeatherIcon;
