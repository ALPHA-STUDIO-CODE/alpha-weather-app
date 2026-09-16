import { handleWeatherRequest } from "./_lib/weather-handler.js";
export default async function handler(req, res) {
  const result = await handleWeatherRequest(req.query, fetch);
  res.status(result.status).json(result.body);
}
