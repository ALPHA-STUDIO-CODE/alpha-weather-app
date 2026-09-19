import styles from "./WeatherIcon.module.css";
import { meteoconFor } from "../lib/weatherIcons.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

// Meteocons' real CDN, confirmed against its published docs
// (meteocons.com/docs/cdn): `https://cdn.meteocons.com/{version}/
// {format}/{style}/{icon}.svg`. No package to install and no files
// to vendor — the CDN is designed to be hot-linked directly, and
// serves permissive CORS headers for exactly that.

const CDN_VERSION = "3.0.0-next.10";
// "fill" is Meteocons' richly-colored, general-purpose style — the
// one demonstrated throughout their own docs and a natural fit for a
// weather app's current-conditions/forecast cards. The other three
// styles (flat/line/monochrome) exist if this ever needs revisiting.
const ICON_STYLE = "fill";

function iconUrl(name, { reducedMotion }) {
  const format = reducedMotion ? "svg-static" : "svg";
  return `https://cdn.meteocons.com/${CDN_VERSION}/${format}/${ICON_STYLE}/${name}.svg`;
}

function WeatherIcon({ code, alt = "", className = "" }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const name = meteoconFor(code);
  const src = iconUrl(name, { reducedMotion: prefersReducedMotion });

  return <img className={`${styles.icon} ${className}`.trim()} src={src} alt={alt} />;
}

export default WeatherIcon;
