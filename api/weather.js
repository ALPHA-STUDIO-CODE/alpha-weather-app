import { handleWeatherRequestCached } from "./_lib/cachedWeatherHandler.js";
export default async function handler(req, res) {
  const result = await handleWeatherRequestCached(req.query, fetch);
  res.status(result.status).json(result.body);
}
