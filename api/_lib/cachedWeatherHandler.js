import { handleWeatherRequest } from "./weather-handler.js";
import { get, set, cacheKeyFor } from "./responseCache.js";

// Spec §4.6.2 — same 30-minute freshness window as the client-side
// cache (src/lib/cache.js).
const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

/**
 * Wraps handleWeatherRequest with the server-side in-memory cache
 * (Step 31). Deliberately a *separate* function rather than a change
 * to handleWeatherRequest itself, for one specific reason: Step 3's
 * weather-handler.test.js drives handleWeatherRequest directly, and
 * several of its existing tests reuse the exact same
 * `{ type: "current", city: "Abuja" }` query across different mocked
 * upstream responses (a 200, a 500, a thrown network error) to
 * exercise each branch in turn. If caching lived inside
 * handleWeatherRequest itself, the module-level cache would still be
 * holding the first test's successful response by the time a later
 * test in the same file ran — so that later test would get a stale
 * cache hit instead of exercising its own mocked failure, silently
 * breaking assertions it never touched. That would violate the
 * plan's own explicit verification requirement for this step: the
 * existing weather-handler.test.js suite must keep passing
 * *unmodified*. Wrapping instead keeps handleWeatherRequest and its
 * tests completely untouched, while this wrapper — not
 * handleWeatherRequest directly — is the one and only thing
 * `api/weather.js` actually calls at runtime.
 *
 * Geocode requests are deliberately passed straight through, never
 * cached: spec §4.6 scopes caching to current-weather and forecast
 * responses only, and geocode backs live autocomplete, where every
 * keystroke is already a distinct, fast-changing query — caching it
 * would add a whole extra dimension of staleness handling for a
 * feature that gains nothing from it.
 */
export async function handleWeatherRequestCached(query, fetchImpl, apiKey) {
  if (query.type === "geocode") {
    return handleWeatherRequest(query, fetchImpl, apiKey);
  }

  const key = cacheKeyFor(query);
  const cached = get(key, CACHE_MAX_AGE_MS);
  if (cached) {
    return cached;
  }

  const result = await handleWeatherRequest(query, fetchImpl, apiKey);
  // Only a clean upstream success is worth remembering — caching a
  // 404/502 would mean a transient upstream hiccup (or a genuinely
  // mistyped city) gets "stuck" returning that same error for the
  // full freshness window instead of being retried on the next
  // request.
  if (result.status === 200) {
    set(key, result);
  }
  return result;
}
