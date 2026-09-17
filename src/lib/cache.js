import { getItem, setItem } from "./storage.js";

const CACHE_PREFIX = "awr_cache_";

/**
 * Builds the localStorage key for a cached response. `location` is
 * either a city-name string or a {lat, lon} object — the same
 * polymorphic shape apiClient/useWeather already accept (see
 * useWeather.js's doc comment). Keyed consistently with how
 * favorites.js/recentSearches.js key an entry (spec §4.6.1's
 * explicit consistency requirement): case-insensitive on city name,
 * so "Abuja"/"abuja" share a cache entry the same way they already
 * dedup as one favorite/recent. `type` ("current"/"forecast") is
 * folded into the key too, since a city's current-weather and
 * forecast responses are cached independently but would otherwise
 * collide on the same location.
 */
export function cacheKeyFor(location, type) {
  const locationPart =
    typeof location === "object" && location !== null
      ? `${location.lat}|${location.lon}`
      : String(location).toLowerCase();
  return `${CACHE_PREFIX}${type}|${locationPart}`;
}

/**
 * Returns the cached payload stored under `key` if it exists and is
 * younger than `maxAgeMs`, else null (covers both "absent" and
 * "stale" — callers don't need to distinguish the two, they just
 * fetch normally on either). Reuses storage.js's getItem rather than
 * touching localStorage directly, so a blocked/unavailable
 * localStorage degrades to "always a miss" instead of throwing —
 * the same graceful-fallback pattern as every other v2 persistence
 * feature (favorites, recents, theme/unit).
 */
export function getCached(key, maxAgeMs) {
  const entry = getItem(key, null);
  if (!entry || typeof entry.timestamp !== "number") {
    return null;
  }
  if (Date.now() - entry.timestamp > maxAgeMs) {
    return null;
  }
  return entry.payload;
}

/**
 * Stores `payload` under `key` alongside the current timestamp, so a
 * later getCached() can judge freshness. Reuses storage.js's
 * setItem, so a blocked/unavailable localStorage silently no-ops
 * rather than throwing.
 */
export function setCached(key, payload) {
  setItem(key, { timestamp: Date.now(), payload });
}
