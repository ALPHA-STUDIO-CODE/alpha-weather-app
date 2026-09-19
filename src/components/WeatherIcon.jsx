import styles from "./WeatherIcon.module.css";
import { meteoconFor } from "../lib/weatherIcons.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

// `latest` always resolves to the newest full release rather than a
// pinned version — the CDN docs recommend pinning in production so a
// future release can't change icons out from under this app
// unannounced. Left as `latest` for now (revisit once this project
// reaches its production-hardening phases, e.g. Phase V) rather than
// pinning to whatever pre-release happens to be current today.
const CDN_VERSION = "latest";
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
