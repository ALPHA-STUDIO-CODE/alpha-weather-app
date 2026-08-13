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
