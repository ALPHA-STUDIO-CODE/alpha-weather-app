import { test } from "node:test";
import assert from "node:assert/strict";
import { handleWeatherRequest } from "./weather-handler.js";

function mockFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

test("upstream success passes through JSON", async () => {
  const fakeWeather = { name: "Abuja", main: { temp: 30 } };
  const result = await handleWeatherRequest(
    { type: "current", city: "Abuja" },
    mockFetch(200, fakeWeather),
  );
  assert.deepEqual(result.body, fakeWeather);
  assert.equal(result.status, 200);
});

test("upstream 404 returns clean not-found shape", async () => {
  const result = await handleWeatherRequest(
    { type: "current", city: "Xyzzzzz" },
    mockFetch(404, { cod: "404", message: "city not found" }),
  );
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { error: "city not found" });
});

test("upstream 500 returns clean generic error shape", async () => {
  const result = await handleWeatherRequest(
    { type: "current", city: "Abuja" },
    mockFetch(500, {}),
  );
  assert.equal(result.status, 502);
  assert.deepEqual(result.body, { error: "upstream weather service failed" });
});

test("fetch throwing (network failure/timeout) returns clean generic error shape", async () => {
  const throwingFetch = async () => {
    throw new Error("network timeout");
  };
  const result = await handleWeatherRequest(
    { type: "current", city: "Abuja" },
    throwingFetch,
  );
  assert.equal(result.status, 502);
  assert.deepEqual(result.body, { error: "upstream weather service failed" });
});

test("validation error short-circuits before fetch is called", async () => {
  let fetchWasCalled = false;
  const trackedFetch = async () => {
    fetchWasCalled = true;
  };
  const result = await handleWeatherRequest({ type: "bogus" }, trackedFetch);
  assert.equal(result.status, 400);
  assert.equal(fetchWasCalled, false);
});

test("geocode success passes through array of matches", async () => {
  const fakeMatches = [
    { name: "London", country: "GB", lat: 51.5, lon: -0.12 },
    { name: "London", country: "CA", lat: 42.98, lon: -81.25 },
  ];
  const result = await handleWeatherRequest(
    { type: "geocode", q: "London" },
    mockFetch(200, fakeMatches),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, fakeMatches);
});

test("geocode with no matches returns 200 with empty array, not an error", async () => {
  const result = await handleWeatherRequest(
    { type: "geocode", q: "Zzzzznotarealplace" },
    mockFetch(200, []),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

test("geocode does not send a units param", async () => {
  let capturedUrl;
  const capturingFetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => [] };
  };
  await handleWeatherRequest({ type: "geocode", q: "Paris" }, capturingFetch);
  assert.equal(new URL(capturedUrl).searchParams.has("units"), false);
});
