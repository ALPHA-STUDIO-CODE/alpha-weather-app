import styles from "./SunriseSunset.module.css";
import { formatSunrise, formatSunset } from "../lib/sunTimes.js";
import { meteoconUrl } from "../lib/meteoconsCdn.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

function SunAndHorizonIcon({ slug, className }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const src = meteoconUrl(slug, { reducedMotion: prefersReducedMotion });
  return <img className={className} src={src} alt="" />;
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
        <SunAndHorizonIcon slug="sunrise" className={styles.icon} />
        <span className={styles.label}>Sunrise</span>
        <span className={styles.value}>{sunrise}</span>
      </div>
      <div className={styles.row}>
        <SunAndHorizonIcon slug="sunset" className={styles.icon} />
        <span className={styles.label}>Sunset</span>
        <span className={styles.value}>{sunset}</span>
      </div>
    </div>
  );
}

export default SunriseSunset;
