// Alpha Weather Report — script.js

import {
  fetchCurrentWeather,
  fetchForecast,
  WeatherApiError,
} from "./src/apiClient.js";
import { formatTemp } from "./src/lib/units.js";
import { formatLocalTime } from "./src/lib/time.js";
import { groupByDay, dailySummary } from "./src/lib/forecast.js";
import { getErrorMessage } from "./src/lib/errors.js";
import { addSearch } from "./src/lib/recentSearches.js";
import { getItem, setItem } from "./src/lib/storage.js";

const UNIT_KEY = "awr_unit";
const THEME_KEY = "awr_theme";
const RECENT_KEY = "awr_recent_searches";

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

const spinner = document.getElementById("spinner");
const inlineError = document.getElementById("inline-error");
const unitToggle = document.getElementById("unit-toggle");
const themeToggle = document.getElementById("theme-toggle");
const recentChipsContainer = document.getElementById("recent-chips");

// Raw (Celsius) data from the last successful search, kept around so the
// unit toggle can re-render instantly without re-fetching.
let lastCurrentData = null;
let lastForecastData = null;

let currentUnit = getItem(UNIT_KEY, "C");
let currentTheme = getItem(THEME_KEY, "light");
let recentSearches = getItem(RECENT_KEY, []);

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

function updateUnitToggleUI() {
  const isFahrenheit = currentUnit === "F";
  unitToggle.querySelector("span").textContent = isFahrenheit ? "°F" : "°C";
  unitToggle.setAttribute("aria-pressed", String(isFahrenheit));
  unitToggle.setAttribute(
    "aria-label",
    isFahrenheit ? "Switch to Celsius" : "Switch to Fahrenheit",
  );
}

function updateThemeToggleUI() {
  const isDark = currentTheme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.querySelector("span").textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
}

function renderCurrentWeather(data) {
  lastCurrentData = data;

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

  weatherTemp.textContent = formatTemp(data.main.temp, currentUnit);
  weatherCondition.textContent = data.weather?.[0]?.description ?? "";
  weatherHumidity.textContent = `${data.main.humidity}%`;
  // Wind speed stays in m/s regardless of the °C/°F toggle (§4.5).
  weatherWind.textContent = `${data.wind.speed} m/s`;

  currentWeatherSection.hidden = false;
}

function renderForecast(data) {
  lastForecastData = data;

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
    temps.textContent = `${formatTemp(day.max, currentUnit)} / ${formatTemp(day.min, currentUnit)}`;

    const condition = document.createElement("p");
    condition.className = "forecast-card__condition";
    condition.textContent = day.condition;

    card.append(dayLabel, icon, temps, condition);
    forecastCards.appendChild(card);
  }

  forecastSection.hidden = false;
}

function renderRecentChips() {
  recentChipsContainer.innerHTML = "";

  if (recentSearches.length === 0) {
    recentChipsContainer.hidden = true;
    return;
  }

  for (const entry of recentSearches) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = `${entry.name}, ${entry.country}`;
    // Reuses the exact same search path as manual search — no duplicate
    // search logic (Step 21).
    chip.addEventListener("click", () => {
      searchInput.value = entry.name;
      runSearch(entry.name);
    });
    recentChipsContainer.appendChild(chip);
  }

  recentChipsContainer.hidden = false;
}

async function handleSearch(city) {
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(city),
    fetchForecast(city),
  ]);
  renderCurrentWeather(current);
  renderForecast(forecast);
}

async function runSearch(city) {
  spinner.hidden = false;

  try {
    await handleSearch(city);

    // A successful search clears any error left over from a previous
    // failed one.
    inlineError.hidden = true;

    // renderCurrentWeather (called inside handleSearch) just updated
    // lastCurrentData, so it reflects this search's result.
    if (lastCurrentData) {
      const entry = {
        name: lastCurrentData.name,
        country: lastCurrentData.sys?.country ?? "",
        lat: lastCurrentData.coord?.lat,
        lon: lastCurrentData.coord?.lon,
      };
      recentSearches = addSearch(recentSearches, entry);
      setItem(RECENT_KEY, recentSearches);
      renderRecentChips();
    }
  } catch (err) {
    // Show the mapped message inline; the existing weather display is
    // deliberately left untouched (§5.4) — nothing here clears it.
    const type = err instanceof WeatherApiError ? err.type : "generic";
    inlineError.textContent = getErrorMessage(type);
    inlineError.hidden = false;
  } finally {
    spinner.hidden = true;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = searchInput.value.trim();

  // Empty submit does nothing — no request fired, no error shown (§5.1).
  if (!city) return;

  runSearch(city);
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  setItem(UNIT_KEY, currentUnit);
  updateUnitToggleUI();

  // Re-render from the last fetched data — no re-fetch needed (§4.5).
  if (lastCurrentData) renderCurrentWeather(lastCurrentData);
  if (lastForecastData) renderForecast(lastForecastData);
});

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  setItem(THEME_KEY, currentTheme);
  updateThemeToggleUI();
});

// Apply the persisted (or default) preferences to both toggle controls
// and render any persisted recent-search chips, on load, ahead of any
// search.
updateUnitToggleUI();
updateThemeToggleUI();
renderRecentChips();
