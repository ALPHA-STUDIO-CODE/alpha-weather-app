import styles from "./CurrentWeatherCard.module.css";
import { formatLocalTime } from "../lib/time.js";
import { formatTemp } from "../lib/units.js";
import SunriseSunset from "./SunriseSunset.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import WeatherIcon from "./WeatherIcon.jsx";

const FAVORITES_FULL_MESSAGE = "Favorites full (10/10). Remove one to add another.";

/**
 * Same hand-built-SVG approach as SunriseSunset's icons (Step 23) —
 * an original geometric shape, `currentColor`-based, rather than an
 * icon-library dependency for one icon. `filled` switches between an
 * outline-only star (unfavorited) and a solid one (favorited).
 */
function StarIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.9l6-.9 2.6-5.4Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

/**
 * Renders current-conditions fields from a raw OpenWeather "current
 * weather" response (the backend passes that shape through
 * unmodified, see api/_lib/weather-handler.js).
 *
 * `unit` defaults to 'C' for now — Step 12 (useUnit) will start
 * passing the real toggle state down; this prop already exists so
 * that step doesn't need to touch this component's signature.
 *
 * Renders nothing until a successful search has produced `data`
 * (mirrors v1's `currentWeatherSection.hidden` starting true). Wind
 * speed is displayed in m/s regardless of `unit`, per v1 §4.5 — only
 * temperature is unit-aware.
 *
 * `isFavorited`/`onToggleFavorite`/`atCap` (Step 26) are all
 * optional — App.jsx wires them from useFavorites, but the component
 * degrades gracefully (star omitted) if they're not supplied, same
 * defensive spirit as `unit` defaulting to 'C'.
 */
function CurrentWeatherCard({ data, unit = "C", isFavorited, onToggleFavorite, atCap = false }) {
  if (!data) return null;

  const country = data.sys?.country ? `, ${data.sys.country}` : "";
  const localTime = formatLocalTime(data.dt, data.timezone ?? 0);
  const icon = data.weather?.[0]?.icon;
  const condition = data.weather?.[0]?.description ?? "";

  return (
    <section className={styles.card} aria-label="Current weather">
      <div className={styles.top}>
        <div>
          <h2 className={styles.city}>
            {data.name}
            {country}
            {onToggleFavorite && (
              <button
                type="button"
                className={styles.star}
                onClick={onToggleFavorite}
                aria-pressed={Boolean(isFavorited)}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <StarIcon filled={Boolean(isFavorited)} />
              </button>
            )}
          </h2>
          <p className={styles.time}>{localTime}</p>
        </div>
        {icon && <WeatherIcon code={icon} alt={condition} className={styles.icon} />}
      </div>
      {atCap && <ErrorMessage message={FAVORITES_FULL_MESSAGE} />}
      <p className={styles.temp}>{formatTemp(data.main.temp, unit)}</p>
      <p className={styles.condition}>{condition}</p>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Humidity</dt>
          <dd>{data.main.humidity}%</dd>
        </div>
        <div className={styles.stat}>
          <dt>Wind</dt>
          <dd>{data.wind.speed} m/s</dd>
        </div>
      </dl>
      <SunriseSunset data={data} />
    </section>
  );
}

export default CurrentWeatherCard;
