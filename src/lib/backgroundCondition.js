/**
 * Condition families for WeatherBackground (Step 34, spec §4.5).
 * Mirrors weatherIcons.js's OpenWeather condition groups, but
 * deliberately collapses away the day/night distinction OpenWeather
 * bakes into the icon code's d/n suffix — day/night for the
 * background is computed independently below, from the displayed
 * city's own sunrise/sunset (already fetched, Step 22), not trusted
 * from the icon code. That gives the whole app one single source of
 * truth for "is it day or night in this city right now," rather than
 * each icon separately asserting its own answer that could in theory
 * drift from what the background shows.
 */
const CONDITION_FAMILY = {
  "01": "clear",
  "02": "partly-cloudy",
  "03": "cloudy",
  "04": "overcast",
  "09": "drizzle",
  10: "rain",
  11: "thunderstorm",
  13: "snow",
  50: "fog",
};

// Neutral fallback for an unrecognized/missing icon code — "cloudy"
// is the least visually alarming guess (no implied precipitation or
// clear-sky brightness) and reuses an existing family rather than
// inventing a bespoke "unknown" gradient WeatherBackground would also
// need to define.
const DEFAULT_FAMILY = "cloudy";

function familyFor(iconCode) {
  const group = typeof iconCode === "string" ? iconCode.slice(0, 2) : "";
  return CONDITION_FAMILY[group] ?? DEFAULT_FAMILY;
}

function isDaytime(nowSeconds, sunriseSeconds, sunsetSeconds) {
  return nowSeconds >= sunriseSeconds && nowSeconds < sunsetSeconds;
}

export function backgroundVariantFor(iconCode, nowSeconds, sunriseSeconds, sunsetSeconds) {
  const family = familyFor(iconCode);
  const timeOfDay = isDaytime(nowSeconds, sunriseSeconds, sunsetSeconds) ? "day" : "night";
  return `${family}-${timeOfDay}`;
}
