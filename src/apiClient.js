export class WeatherApiError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "WeatherApiError";
    this.type = type;
  }
}

async function fetchWeatherEndpoint(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    const type = response.status === 404 ? "not_found" : "generic";
    throw new WeatherApiError(data?.error ?? "Failed to fetch weather", type);
  }
  return data;
}

function buildLocationQuery(location) {
  if (typeof location === "object" && location !== null) {
    return `lat=${encodeURIComponent(location.lat)}&lon=${encodeURIComponent(location.lon)}`;
  }
  return `city=${encodeURIComponent(location)}`;
}

export async function fetchCurrentWeather(location) {
  const url = `/api/weather?type=current&${buildLocationQuery(location)}`;
  return fetchWeatherEndpoint(url);
}

export async function fetchForecast(location) {
  const url = `/api/weather?type=forecast&${buildLocationQuery(location)}`;
  return fetchWeatherEndpoint(url);
}

export async function geocode(query) {
  const url = `/api/weather?type=geocode&q=${encodeURIComponent(query)}`;
  return fetchWeatherEndpoint(url);
}
