import styles from "./WeatherBackground.module.css";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

const RAIN_FAMILIES = new Set(["drizzle", "rain", "thunderstorm"]);
const CLOUD_FAMILIES = new Set(["partly-cloudy", "cloudy", "overcast", "fog"]);

function familyOf(variant) {
  return variant.endsWith("-day") ? variant.slice(0, -4) : variant.slice(0, -6);
}

function WeatherBackground({ variant }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const family = familyOf(variant);
  const showRain = !prefersReducedMotion && RAIN_FAMILIES.has(family);
  const showClouds = !prefersReducedMotion && CLOUD_FAMILIES.has(family);

  return (
    <div
      className={styles.background}
      data-variant={variant}
      data-motion={prefersReducedMotion ? "static" : "animated"}
      aria-hidden="true"
    >
      {showRain && <div className={styles.rainLines} />}
      {showClouds && <div className={styles.cloudDrift} />}
    </div>
  );
}

export default WeatherBackground;
