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

// Meteocons ships a "not-available" icon for exactly this purpose
// (confirmed in their own docs' dynamic-icon-loading example: a
// condition lookup that falls back to `?? 'not-available'`) — reused
// here rather than inventing a bespoke fallback asset.
const FALLBACK_ICON = "not-available";

export function meteoconFor(openWeatherIconCode) {
  return ICON_MAP[openWeatherIconCode] ?? FALLBACK_ICON;
}
