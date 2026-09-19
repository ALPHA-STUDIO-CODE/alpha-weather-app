/**
 * Maps an OpenWeather icon code (e.g. "01d", "10n") to a Meteocons
 * SVG asset name (Step 32, spec §4.4). Mirrors the OpenWeather-code
 * → PNG-URL pattern it replaces
 * (`https://openweathermap.org/img/wn/${icon}@2x.png`, used by
 * CurrentWeatherCard/ForecastCards since the vertical slice) — same
 * shape, a lookup instead of a hot-linked PNG.
 *
 * OpenWeather's codes are a 2-digit condition group (01–13, plus 50
 * for atmosphere) with a d/n suffix for day/night. Meteocons
 * distinguishes day/night only where the artwork actually differs
 * (a sun or moon visible in the scene) and shares one icon where it
 * doesn't — falling rain/snow, or an overcast sky, looks the same
 * regardless of the sun/moon behind it.
 *
 * NOTE: the asset names below follow Meteocons' documented public
 * naming convention (bas.dev/work/meteocons). This sandbox has no
 * network access to fetch the actual package/CDN manifest, so treat
 * these as the *intended* names to vendor when Step 33 pulls the
 * real SVGs in — worth a quick cross-check against the actual
 * asset set at that point rather than assumed correct sight unseen.
 */
const ICON_MAP = {
  "01d": "clear-day",
  "01n": "clear-night",
  "02d": "partly-cloudy-day",
  "02n": "partly-cloudy-night",
  "03d": "cloudy",
  "03n": "cloudy",
  "04d": "overcast-day",
  "04n": "overcast-night",
  "09d": "drizzle",
  "09n": "drizzle",
  "10d": "partly-cloudy-day-rain",
  "10n": "partly-cloudy-night-rain",
  "11d": "thunderstorms-day",
  "11n": "thunderstorms-night",
  "13d": "snow",
  "13n": "snow",
  "50d": "fog-day",
  "50n": "fog-night",
};

// Meteocons ships a "not available" icon for exactly this purpose —
// reused here rather than inventing a bespoke fallback asset.
const FALLBACK_ICON = "not-available";

/**
 * Returns the Meteocons asset name for an OpenWeather icon code.
 * Never throws: a missing, malformed, or unrecognized code (including
 * null/undefined, since `data.weather?.[0]?.icon` can be absent on a
 * partial/unexpected upstream response) falls back to a sane default
 * icon instead of crashing the card that renders it.
 */
export function meteoconFor(openWeatherIconCode) {
  return ICON_MAP[openWeatherIconCode] ?? FALLBACK_ICON;
}
