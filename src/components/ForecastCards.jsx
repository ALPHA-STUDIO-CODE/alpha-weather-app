import styles from './ForecastCards.module.css';
import { formatTemp } from '../lib/units.js';

/**
 * formatDayLabel is kept local to this component rather than in
 * src/lib, mirroring v1's own deliberate script.js-local placement
 * (see HANDOFF.md's date/time scope-split note) — it's UI-formatting
 * tied to this specific card, not general-purpose date logic like
 * formatLocalTime.
 */
function formatDayLabel(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(dateStr));
}

/**
 * Renders up to 5 daily summaries (useWeather's `forecast` state,
 * already derived from groupByDay/dailySummary) as forecast cards:
 * day label, icon, high/low temp, condition.
 *
 * `unit` defaults to 'C' for now, same convention as
 * CurrentWeatherCard — Step 12's useUnit will pass the real toggle
 * state down without needing to touch this signature.
 *
 * Renders nothing until a successful search has produced a forecast
 * (mirrors v1's `forecastSection.hidden` starting true).
 */
function ForecastCards({ forecast, unit = 'C' }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className={styles.cards} aria-label="5-day forecast">
      {forecast.map((day) => (
        <article className={styles.card} key={day.date}>
          <p className={styles.day}>{formatDayLabel(day.date)}</p>
          <img
            className={styles.icon}
            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
            alt={day.condition}
          />
          <p className={styles.temps}>
            {formatTemp(day.max, unit)} / {formatTemp(day.min, unit)}
          </p>
          <p className={styles.condition}>{day.condition}</p>
        </article>
      ))}
    </div>
  );
}

export default ForecastCards;
