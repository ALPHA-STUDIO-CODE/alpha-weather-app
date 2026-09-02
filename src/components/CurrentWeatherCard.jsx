import styles from './CurrentWeatherCard.module.css';
import { formatLocalTime } from '../lib/time.js';
import { formatTemp } from '../lib/units.js';

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
 */
function CurrentWeatherCard({ data, unit = 'C' }) {
  if (!data) return null;

  const country = data.sys?.country ? `, ${data.sys.country}` : '';
  const localTime = formatLocalTime(data.dt, data.timezone ?? 0);
  const icon = data.weather?.[0]?.icon;
  const condition = data.weather?.[0]?.description ?? '';

  return (
    <section className={styles.card} aria-label="Current weather">
      <div className={styles.top}>
        <div>
          <h2 className={styles.city}>
            {data.name}
            {country}
          </h2>
          <p className={styles.time}>{localTime}</p>
        </div>
        {icon && (
          <img
            className={styles.icon}
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={condition}
          />
        )}
      </div>
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
    </section>
  );
}

export default CurrentWeatherCard;
