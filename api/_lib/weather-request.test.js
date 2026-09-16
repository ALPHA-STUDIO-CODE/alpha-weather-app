import { test } from "node:test";
import assert from "node:assert/strict";
import { buildUpstreamRequest } from "./weather-request.js";
test("missing type returns 400 error", () => {
  const result = buildUpstreamRequest({});
  assert.equal(result.error.status, 400);
});
test("invalid type returns 400 error", () => {
  const result = buildUpstreamRequest({ type: "bogus" });
  assert.equal(result.error.status, 400);
});
test("current with city returns correct URL shape", () => {
  const result = buildUpstreamRequest({ type: "current", city: "Abuja" });
  assert.equal(result.url, "https://api.openweathermap.org/data/2.5/weather");
  assert.equal(result.params.q, "Abuja");
});
test("forecast with lat/lon returns correct URL shape", () => {
  const result = buildUpstreamRequest({
    type: "forecast",
    lat: "9.05",
    lon: "7.49",
  });
  assert.equal(result.url, "https://api.openweathermap.org/data/2.5/forecast");
  assert.equal(result.params.lat, "9.05");
  assert.equal(result.params.lon, "7.49");
});
test("geocode with q returns correct URL shape", () => {
  const result = buildUpstreamRequest({ type: "geocode", q: "Lon" });
  assert.equal(result.url, "https://api.openweathermap.org/geo/1.0/direct");
  assert.equal(result.params.q, "Lon");
});
test("current with no city or lat/lon returns 400 error", () => {
  const result = buildUpstreamRequest({ type: "current" });
  assert.equal(result.error.status, 400);
});
