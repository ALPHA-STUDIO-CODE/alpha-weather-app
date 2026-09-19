// In-memory, module-level cache for the serverless handler (Step 31,
// spec §4.6.2). No external store (no Vercel KV/Redis) — a plain Map
// living in module scope for the lifetime of one warm function
// instance, per the spec's explicit "no new backend infrastructure"
// decision. Best-effort by nature: a cold start or a request landing
// on a different concurrent instance gets a fresh, empty Map and
// therefore a miss — expected, not a bug (see cachedWeatherHandler.js
// and HANDOFF-v2-part2.md's Step 31 note).
const store = new Map();

/**
 * Builds a cache key from the *outbound* request parameters (city/
 * coords + type), not the raw query object — so equivalent requests
 * key identically regardless of incidental param ordering. Mirrors
 * the client-side cache.js's cacheKeyFor in spirit (consistent keying
 * across the two cache layers per spec §4.6), though the two are
 * intentionally separate implementations: this one keys off the
 * server's `query` shape (`city`/`lat`+`lon`/`q`), the client one off
 * the `location` shape `apiClient`/`useWeather` pass around.
 */
export function cacheKeyFor(query) {
  const { type } = query;
  if (type === "geocode") {
    return `geocode|${query.q ?? ""}`;
  }
  if (query.lat != null && query.lon != null) {
    return `${type}|${query.lat},${query.lon}`;
  }
  return `${type}|${query.city ?? ""}`;
}

/**
 * Returns the cached value for `key` if present and younger than
 * `maxAgeMs`, else null (absent and stale both just mean "miss" to
 * callers — same shape as the client-side cache.js).
 */
export function get(key, maxAgeMs) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.timestamp > maxAgeMs) {
    return null;
  }
  return entry.value;
}

/**
 * Stores `value` under `key` with the current timestamp.
 */
export function set(key, value) {
  store.set(key, { timestamp: Date.now(), value });
}

/**
 * Test-only escape hatch. `store` is a module-level singleton, so a
 * test file exercising several independent scenarios needs a way to
 * reset between them — this is that way, rather than reaching into
 * an unexported variable or restarting the module.
 */
export function _resetForTests() {
  store.clear();
}
