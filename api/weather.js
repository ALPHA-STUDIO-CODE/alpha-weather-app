import { buildUpstreamRequest } from "./_lib/weather-request.js";

export default function handler(req, res) {
  const result = buildUpstreamRequest(req.query);

  if (result.error) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }

  res.status(501).json({ error: "not implemented yet" });
}
