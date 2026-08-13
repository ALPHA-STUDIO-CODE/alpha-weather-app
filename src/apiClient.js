export class WeatherApiError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "WeatherApiError";
    this.type = type;
  }
}

export async function fetchCurrentWeather(city) {
  const url = `/api/weather?type=current&city=${encodeURIComponent(city)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const type = response.status === 404 ? "not_found" : "generic";
    throw new WeatherApiError(data?.error ?? "Failed to fetch weather", type);
  }

  return data;
}
