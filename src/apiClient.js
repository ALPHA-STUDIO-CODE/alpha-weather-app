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

export async function fetchCurrentWeather(city) {
  const url = `/api/weather?type=current&city=${encodeURIComponent(city)}`;
  return fetchWeatherEndpoint(url);
}

export async function fetchForecast(city) {
  const url = `/api/weather?type=forecast&city=${encodeURIComponent(city)}`;
  return fetchWeatherEndpoint(url);
}
