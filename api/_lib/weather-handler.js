import { config } from "dotenv";
config({ path: ".env.local" });

import { buildUpstreamRequest } from "./weather-request.js";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

setDefaultAutoSelectFamilyAttemptTimeout(300);

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
      console.error(
        "OpenWeather returned non-OK status:",
        response.status,
        data,
      );
      return {
        status: 502,
        body: { error: "upstream weather service failed" },
      };
    }
    return { status: 200, body: data };
  } catch (err) {
    console.log(JSON.stringify(apiKey), "length:", apiKey?.length);
    console.error("Fetch to OpenWeather threw:", err);
    return { status: 502, body: { error: "upstream weather service failed" } };
  }
}
