import styles from "./WeatherIcon.module.css";
import { meteoconFor } from "../lib/weatherIcons.js";
import { meteoconUrl } from "../lib/meteoconsCdn.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

function WeatherIcon({ code, alt = "", className = "" }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const name = meteoconFor(code);
  const src = meteoconUrl(name, { reducedMotion: prefersReducedMotion });

  return <img className={`${styles.icon} ${className}`.trim()} src={src} alt={alt} />;
}

export default WeatherIcon;
