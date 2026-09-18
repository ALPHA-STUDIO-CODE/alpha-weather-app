import { useCallback, useState } from "react";
import { fetchCurrentWeather, fetchForecast } from "../apiClient.js";
import { groupByDay, dailySummary } from "../lib/forecast.js";
import { getCached, setCached, cacheKeyFor } from "../lib/cache.js";

const MAX_FORECAST_DAYS = 5;
// Spec §4.6.1's 30-minute freshness window — shared by both the
// current-weather and forecast entries this hook caches.
const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

/**
 * Wraps a fetch function with the client-side cache (Step 30, spec
 * §4.6.1): a fresh cache hit is returned as-is with no call to
 * `fetchFn` at all — not even a network request that resolves
 * quickly — since the whole point is skipping the round trip
 * (and, by extension, ever needing to show a spinner for it). A
 * miss or stale entry falls through to `fetchFn` and caches
 * whatever it resolves with; a rejection is left to propagate
 * unchanged (and deliberately never cached) so useWeather's existing
 * error handling doesn't need to change at all.
 */
function cachedFetch(fetchFn, location, type) {
  const key = cacheKeyFor(location, type);
  const cached = getCached(key, CACHE_MAX_AGE_MS);
  if (cached) {
    return cached;
  }
  return Promise.resolve(fetchFn(location)).then((result) => {
    setCached(key, result);
    return result;
  });
}

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
 *
 * search() resolves with the raw current-weather object on success,
 * or undefined on failure — added in Step 16 so App.jsx can build a
 * recent-search entry (name/sys.country/coord.lat/lon) right after a
 * successful search, without reading potentially-stale `data` from
 * this hook's own closure on the same tick the promise resolves.
 *
 * Step 30 adds client-side caching (spec §4.6.1) at this exact seam
 * — cachedFetch() wraps fetchCurrentWeather/fetchForecast, so no new
 * fetch call sites exist anywhere else in the app. `setLoading(true)`
 * is skipped entirely when *both* pieces are already a fresh cache
 * hit, per the plan's "no request at all on a fresh hit" wording —
 * a search that resolves purely from cache never flashes a spinner.
 * If only one of the two is stale/absent, loading still shows, since
 * a real network round trip is happening either way.
 */
export function useWeather() {
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (location) => {
    const currentKey = cacheKeyFor(location, "current");
    const forecastKey = cacheKeyFor(location, "forecast");
    const bothFresh =
      getCached(currentKey, CACHE_MAX_AGE_MS) !== null &&
      getCached(forecastKey, CACHE_MAX_AGE_MS) !== null;

    if (!bothFresh) {
      setLoading(true);
    }
    try {
      const [current, forecastResponse] = await Promise.all([
        cachedFetch(fetchCurrentWeather, location, "current"),
        cachedFetch(fetchForecast, location, "forecast"),
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
      return current;
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
