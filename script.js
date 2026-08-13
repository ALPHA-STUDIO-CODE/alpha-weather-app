// Alpha Weather Report — script.js

import { fetchCurrentWeather, fetchForecast } from "./src/apiClient.js";
import { formatTemp } from "./src/lib/units.js";
import { formatLocalTime } from "./src/lib/time.js";
import { groupByDay, dailySummary } from "./src/lib/forecast.js";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const currentWeatherSection = document.getElementById("current-weather");
const weatherCity = document.getElementById("weather-city");
const weatherTime = document.getElementById("weather-time");
const weatherIcon = document.getElementById("weather-icon");
const weatherTemp = document.getElementById("weather-temp");
const weatherCondition = document.getElementById("weather-condition");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherWind = document.getElementById("weather-wind");

const forecastSection = document.getElementById("forecast");
const forecastCards = document.getElementById("forecast-cards");

// Date formatting (e.g. "Tue, Aug 4") lives here rather than in
// lib/time.js, since lib/time.js only owns the time-of-day portion —
// this uses the same "shift by UTC offset, read back in UTC" trick so
// it's independent of the device's own timezone, same as the lib does.
function formatLocalDate(unixTimestamp, utcOffsetSeconds) {
  const localMs = (unixTimestamp + utcOffsetSeconds) * 1000;
  const date = new Date(localMs);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Day-of-week label for a forecast card (e.g. "Mon") from dailySummary's
// plain YYYY-MM-DD date string. Parsing a date-only string gives UTC
// midnight, so reading the weekday back out with timeZone: "UTC" avoids
// any off-by-one from the device's own timezone.
function formatDayLabel(dateStr) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(dateStr));
}

function renderCurrentWeather(data) {
  const country = data.sys?.country ? `, ${data.sys.country}` : "";
  weatherCity.textContent = `${data.name}${country}`;

  const localDate = formatLocalDate(data.dt, data.timezone);
  const localTime = formatLocalTime(data.dt, data.timezone);
  weatherTime.textContent = `${localDate} · ${localTime}`;

  const icon = data.weather?.[0]?.icon;
  weatherIcon.src = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : "";
  weatherIcon.alt = data.weather?.[0]?.description ?? "";

  // Hardcoded to Celsius for now — the °C/°F toggle is wired in Step 17.
  weatherTemp.textContent = formatTemp(data.main.temp, "C");
  weatherCondition.textContent = data.weather?.[0]?.description ?? "";
  weatherHumidity.textContent = `${data.main.humidity}%`;
  weatherWind.textContent = `${data.wind.speed} m/s`;

  currentWeatherSection.hidden = false;
}

function renderForecast(data) {
  const utcOffsetSeconds = data.city?.timezone ?? 0;
  const groups = groupByDay(data.list, utcOffsetSeconds);
  const summaries = Object.keys(groups)
    .sort()
    .slice(0, 5)
    .map((date) => dailySummary(groups[date], utcOffsetSeconds));

  forecastCards.innerHTML = "";

  for (const day of summaries) {
    const card = document.createElement("article");
    card.className = "forecast-card";

    const dayLabel = document.createElement("p");
    dayLabel.className = "forecast-card__day";
    dayLabel.textContent = formatDayLabel(day.date);

    const icon = document.createElement("img");
    icon.className = "forecast-card__icon";
    icon.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
    icon.alt = day.condition;

    const temps = document.createElement("p");
    temps.className = "forecast-card__temps";
    // Hardcoded to Celsius for now — the °C/°F toggle is wired in Step 17.
    temps.textContent = `${formatTemp(day.max, "C")} / ${formatTemp(day.min, "C")}`;

    const condition = document.createElement("p");
    condition.className = "forecast-card__condition";
    condition.textContent = day.condition;

    card.append(dayLabel, icon, temps, condition);
    forecastCards.appendChild(card);
  }

  forecastSection.hidden = false;
}

async function handleSearch(city) {
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(city),
    fetchForecast(city),
  ]);
  renderCurrentWeather(current);
  renderForecast(forecast);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = searchInput.value.trim();

  // Empty submit does nothing — no request fired, no error shown (§5.1).
  if (!city) return;

  handleSearch(city).catch((err) => {
    // Inline error handling lands in Step 16 — for now, don't let a
    // failed search produce an uncaught rejection in the console.
    console.error("Search failed:", err);
  });
});
