import { useCallback, useState } from 'react';
import { fetchCurrentWeather } from '../apiClient.js';

/**
 * Owns current-weather fetch state and exposes search(location) to
 * trigger a lookup. `location` is either a city-name string or a
 * {lat, lon} object (apiClient/fetchCurrentWeather supports both;
 * the {lat, lon} form isn't used until geolocation lands in Phase L,
 * but the hook doesn't need to care).
 *
 * Ports v1's runSearch error-handling rule (script.js, §5.4): a
 * failed search never clears the existing weather display. `data`
 * is only ever replaced by a *successful* fetch; `error` is cleared
 * on success and set on failure, independent of `data`.
 */
export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (location) => {
    setLoading(true);
    try {
      const result = await fetchCurrentWeather(location);
      setData(result);
      setError(null);
    } catch (err) {
      // Deliberately not touching `data` here — see the §5.4 note
      // above. The typed WeatherApiError (or whatever was thrown) is
      // surfaced unchanged so callers can branch on `error.type`.
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}
