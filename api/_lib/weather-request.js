const BASE_URL = "https://api.openweathermap.org";
const VALID_TYPES = ["current", "forecast", "geocode"];
export function buildUpstreamRequest(query) {
  const { type } = query;
  if (!type || !VALID_TYPES.includes(type)) {
    return {
      error: {
        status: 400,
        message: "type must be one of: current, forecast, geocode",
      },
    };
  }
  if (type === "geocode") {
    if (!query.q) {
      return { error: { status: 400, message: "q is required for geocode" } };
    }
    return {
      url: `${BASE_URL}/geo/1.0/direct`,
      params: { q: query.q, limit: 5 },
    };
  }
  const path = type === "current" ? "/data/2.5/weather" : "/data/2.5/forecast";
  if (query.lat && query.lon) {
    return {
      url: `${BASE_URL}${path}`,
      params: { lat: query.lat, lon: query.lon },
    };
  }
  if (query.city) {
    return { url: `${BASE_URL}${path}`, params: { q: query.city } };
  }
  return { error: { status: 400, message: "city or lat/lon is required" } };
}
