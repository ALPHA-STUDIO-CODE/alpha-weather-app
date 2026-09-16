import styles from "./SunriseSunset.module.css";
import { formatSunrise, formatSunset } from "../lib/sunTimes.js";

/**
 * Small original geometric icons (horizon line + sun arc + a
 * directional arrow) rather than an icon-library dependency pulled
 * in for just two icons, or emoji glyphs (inconsistent rendering
 * across platforms/fonts). `currentColor` means each inherits
 * whatever text color its CSS Module rule sets — no separate
 * light/dark-mode icon color logic needed, it rides on the same
 * theme variables everything else already uses.
 */
function SunriseIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <line x1="2" y1="19" x2="22" y2="19" />
      <path d="M7 19a5 5 0 0 1 10 0" />
      <polyline points="9 8 12 5 15 8" />
      <line x1="12" y1="5" x2="12" y2="11" />
    </svg>
  );
}

function SunsetIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <line x1="2" y1="19" x2="22" y2="19" />
      <path d="M7 19a5 5 0 0 1 10 0" />
      <polyline points="9 11 12 14 15 11" />
      <line x1="12" y1="8" x2="12" y2="14" />
    </svg>
  );
}

/**
 * First entirely new v2 feature (spec §4.2). No new API call — reads
 * sys.sunrise/sys.sunset straight off the same current-weather
 * response `CurrentWeatherCard` already has, the same way it reads
 * data.dt for the current local time. Both times are formatted via
 * Step 22's formatSunrise/formatSunset, which delegate to the same
 * formatLocalTime already driving "current local time" — so sunrise/
 * sunset and the local-time display can never drift out of sync for
 * the same city (spec §4.2's explicit requirement).
 *
 * Takes the whole current-weather `data` object, matching
 * CurrentWeatherCard's own convention of reading directly off the
 * response rather than requiring the caller to pre-extract fields.
 * Renders nothing if sunrise/sunset data isn't present — defensive,
 * even though OpenWeather's Current Weather Data always includes
 * `sys.sunrise`/`sys.sunset` in practice.
 */
function SunriseSunset({ data }) {
  if (!data?.sys?.sunrise || !data?.sys?.sunset) return null;

  const utcOffsetSeconds = data.timezone ?? 0;
  const sunrise = formatSunrise(data.sys.sunrise, utcOffsetSeconds);
  const sunset = formatSunset(data.sys.sunset, utcOffsetSeconds);

  return (
    <div className={styles.container} aria-label="Sunrise and sunset">
      <div className={styles.row}>
        <SunriseIcon className={styles.icon} />
        <span className={styles.label}>Sunrise</span>
        <span className={styles.value}>{sunrise}</span>
      </div>
      <div className={styles.row}>
        <SunsetIcon className={styles.icon} />
        <span className={styles.label}>Sunset</span>
        <span className={styles.value}>{sunset}</span>
      </div>
    </div>
  );
}

export default SunriseSunset;
