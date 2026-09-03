import { useCallback, useState } from 'react';
import { fetchCurrentWeather, fetchForecast } from '../apiClient.js';
import { groupByDay, dailySummary } from '../lib/forecast.js';

const MAX_FORECAST_DAYS = 5;

/**
 * Owns current-weather + forecast fetch state and exposes
 * search(location) to trigger a lookup. `location` is either a
 * city-name string or a {lat, lon} object (apiClient supports both;
 * the {lat, lon} form isn't used until geolocation lands in Phase L,
 * but the hook doesn't need to care).
 *
 * Ports v1's handleSearch (script.js): current weather and forecast
 * are fetched together via Promise.all, exactly as v1 did — a
 * forecast-only failure fails the whole search, same as a
 * current-weather-only failure would. That's a deliberate v1 choice,
 * not an oversight; splitting them into independent error states
 * would be a behavior change, not a port.
 *
 * Ports v1's runSearch error-handling rule (script.js, §5.4) for both
 * pieces of data: a failed search never clears the existing display.
 * `data`/`forecast` are only ever replaced by a *successful* fetch;
 * `error` is cleared on success and set on failure, independent of
 * either.
 */
export function useWeather() {
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (location) => {
    setLoading(true);
    try {
      const [current, forecastResponse] = await Promise.all([
        fetchCurrentWeather(location),
        fetchForecast(location),
      ]);
      const utcOffsetSeconds = forecastResponse.city?.timezone ?? 0;
      const groups = groupByDay(forecastResponse.list, utcOffsetSeconds);
      const summaries = Object.keys(groups)
        .sort()
        .slice(0, MAX_FORECAST_DAYS)
        .map((date) => dailySummary(groups[date], utcOffsetSeconds));

      setData(current);
      setForecast(summaries);
      setError(null);
    } catch (err) {
      // Deliberately not touching `data`/`forecast` here — see the
      // §5.4 note above. The typed WeatherApiError (or whatever was
      // thrown) is surfaced unchanged so callers can branch on
      // `error.type`.
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, forecast, loading, error, search };
}
