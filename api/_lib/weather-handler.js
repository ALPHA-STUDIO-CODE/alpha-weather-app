import { buildUpstreamRequest } from "./weather-request.js";

export async function handleWeatherRequest(
  query,
  fetchImpl,
  apiKey = process.env.OPENWEATHER_API_KEY,
) {
  const built = buildUpstreamRequest(query);
  if (built.error) {
    return { status: built.error.status, body: { error: built.error.message } };
  }

  const url = new URL(built.url);
  for (const [key, value] of Object.entries(built.params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  try {
    const response = await fetchImpl(url.toString());
    const data = await response.json();

    if (response.status === 404) {
      return { status: 404, body: { error: "city not found" } };
    }
    if (!response.ok) {
      return {
        status: 502,
        body: { error: "upstream weather service failed" },
      };
    }
    return { status: 200, body: data };
  } catch {
    console.error(err);
    return { status: 502, body: { error: "upstream weather service failed" } };
  }
}
