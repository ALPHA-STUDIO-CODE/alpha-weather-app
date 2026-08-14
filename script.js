// Alpha Weather Report — script.js

import {
  fetchCurrentWeather,
  fetchForecast,
  geocode,
  WeatherApiError,
} from "./src/apiClient.js";
import { formatTemp } from "./src/lib/units.js";
import { formatLocalTime } from "./src/lib/time.js";
import { groupByDay, dailySummary } from "./src/lib/forecast.js";
import { getErrorMessage } from "./src/lib/errors.js";
import { addSearch } from "./src/lib/recentSearches.js";
import { getItem, setItem } from "./src/lib/storage.js";
import { debounce } from "./src/lib/debounce.js";

const UNIT_KEY = "awr_unit";
const THEME_KEY = "awr_theme";
const RECENT_KEY = "awr_recent_searches";
const LAST_CITY_KEY = "awr_last_city";
const DEFAULT_CITY = "Abuja";
const AUTOCOMPLETE_MIN_CHARS = 2;
const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MAX_SUGGESTIONS = 5;

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
const autocompleteList = document.getElementById("autocomplete-list");

// Raw (Celsius) data from the last successful search, kept around so the
// unit toggle can re-render instantly without re-fetching.
let lastCurrentData = null;
let lastForecastData = null;

let currentUnit = getItem(UNIT_KEY, "C");
let currentTheme = getItem(THEME_KEY, "light");
let recentSearches = getItem(RECENT_KEY, []);

// Current geocode suggestions backing the dropdown, and which one (if
// any) is keyboard-highlighted.
let currentSuggestions = [];
let highlightedIndex = -1;

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

function hideSuggestions() {
  currentSuggestions = [];
  highlightedIndex = -1;
  autocompleteList.innerHTML = "";
  autocompleteList.hidden = true;
  searchInput.removeAttribute("aria-activedescendant");
}

function updateHighlight() {
  const items = autocompleteList.querySelectorAll(".autocomplete-list__item");
  items.forEach((item, index) => {
    const isHighlighted = index === highlightedIndex;
    item.classList.toggle("is-highlighted", isHighlighted);
    item.setAttribute("aria-selected", String(isHighlighted));
  });

  if (highlightedIndex >= 0) {
    searchInput.setAttribute(
      "aria-activedescendant",
      `suggestion-${highlightedIndex}`,
    );
  } else {
    searchInput.removeAttribute("aria-activedescendant");
  }
}

function selectSuggestion(suggestion) {
  searchInput.value = `${suggestion.name}, ${suggestion.country}`;
  hideSuggestions();
  // Fetch by lat/lon rather than re-resolving the name — reuses the
  // exact same search/render pipeline as everywhere else (Step 12/14),
  // just extended to accept lat/lon (§4.1 + Step 25 definition of done).
  runSearch({ lat: suggestion.lat, lon: suggestion.lon });
}

function renderSuggestions(suggestions) {
  autocompleteList.innerHTML = "";
  highlightedIndex = -1;

  if (suggestions.length === 0) {
    autocompleteList.hidden = true;
    return;
  }

  suggestions.forEach((suggestion, index) => {
    const item = document.createElement("li");
    item.id = `suggestion-${index}`;
    item.className = "autocomplete-list__item";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    item.textContent = `${suggestion.name}, ${suggestion.country}`;

    item.addEventListener("mouseenter", () => {
      highlightedIndex = index;
      updateHighlight();
    });
    item.addEventListener("click", () => selectSuggestion(suggestion));

    autocompleteList.appendChild(item);
  });

  autocompleteList.hidden = false;
}

async function fetchSuggestions(query) {
  try {
    const results = await geocode(query);
    currentSuggestions = results.slice(0, AUTOCOMPLETE_MAX_SUGGESTIONS);
    renderSuggestions(currentSuggestions);
  } catch {
    // Autocomplete is a convenience layer, not a critical path — a
    // failed suggestion lookup just means no dropdown, silently.
    hideSuggestions();
  }
}

const debouncedFetchSuggestions = debounce(
  fetchSuggestions,
  AUTOCOMPLETE_DEBOUNCE_MS,
);

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  if (query.length < AUTOCOMPLETE_MIN_CHARS) {
    hideSuggestions();
    return;
  }

  debouncedFetchSuggestions(query);
});

searchInput.addEventListener("keydown", (event) => {
  const isDropdownOpen =
    !autocompleteList.hidden && currentSuggestions.length > 0;

  if (!isDropdownOpen) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % currentSuggestions.length;
      updateHighlight();
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex =
        (highlightedIndex - 1 + currentSuggestions.length) %
        currentSuggestions.length;
      updateHighlight();
      break;
    case "Enter":
      // Only intercept Enter when a suggestion is actually highlighted —
      // otherwise let the form's own submit handler run as normal.
      if (highlightedIndex >= 0) {
        event.preventDefault();
        selectSuggestion(currentSuggestions[highlightedIndex]);
      }
      break;
    case "Escape":
      // Closes the dropdown only — never fires a search.
      hideSuggestions();
      break;
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-form__field")) {
    hideSuggestions();
  }
});

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

async function handleSearch(location) {
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(location),
    fetchForecast(location),
  ]);
  renderCurrentWeather(current);
  renderForecast(forecast);
}

async function runSearch(location) {
  hideSuggestions();
  spinner.hidden = false;

  try {
    await handleSearch(location);

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

      // Remember this as the city to auto-load next visit (Step 22).
      setItem(LAST_CITY_KEY, lastCurrentData.name);
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

// Smart initial load (Step 22): restore the last-searched city, or
// fall back to Abuja if this is a first visit / storage was blocked.
// Triggered before the toggle/chip init below — runSearch's first
// await yields control immediately, so the request is already in
// flight while the rest of page init runs synchronously.
const initialCity = getItem(LAST_CITY_KEY, null) ?? DEFAULT_CITY;
searchInput.value = initialCity;
runSearch(initialCity);

// Apply the persisted (or default) preferences to both toggle controls
// and render any persisted recent-search chips.
updateUnitToggleUI();
updateThemeToggleUI();
renderRecentChips();
