import { test } from "node:test";
import assert from "node:assert/strict";
import { handleWeatherRequestCached } from "./cachedWeatherHandler.js";
import { _resetForTests } from "./responseCache.js";

function mockFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

test("a fresh cache hit skips the injected fetchImpl entirely", async () => {
  _resetForTests();
  const query = { type: "current", city: "Abuja" };
  const fakeWeather = { name: "Abuja", main: { temp: 30 } };
  await handleWeatherRequestCached(query, mockFetch(200, fakeWeather));

  let fetchWasCalled = false;
  const trackedFetch = async () => {
    fetchWasCalled = true;
    return { ok: true, status: 200, json: async () => fakeWeather };
  };
  const result = await handleWeatherRequestCached(query, trackedFetch);

  assert.equal(fetchWasCalled, false);
  assert.deepEqual(result.body, fakeWeather);
  assert.equal(result.status, 200);
});

test("a miss calls fetchImpl and stores the result for the next request", async () => {
  _resetForTests();
  const query = { type: "current", city: "London" };
  const fakeWeather = { name: "London", main: { temp: 15 } };

  let fetchCallCount = 0;
  const countingFetch = async () => {
    fetchCallCount += 1;
    return { ok: true, status: 200, json: async () => fakeWeather };
  };

  const first = await handleWeatherRequestCached(query, countingFetch);
  const second = await handleWeatherRequestCached(query, countingFetch);

  assert.equal(fetchCallCount, 1);
  assert.deepEqual(first.body, fakeWeather);
  assert.deepEqual(second.body, fakeWeather);
});

test("a stale entry (mocked Date.now) is treated as a miss and refreshes the cache", async () => {
  _resetForTests();
  const query = { type: "current", city: "Abuja" };
  const staleWeather = { name: "Abuja", main: { temp: 20 } };
  const freshWeather = { name: "Abuja", main: { temp: 32 } };
  const realNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    await handleWeatherRequestCached(query, mockFetch(200, staleWeather));

    Date.now = () => 1_000_000 + 31 * 60 * 1000; // 31 minutes later — stale
    const result = await handleWeatherRequestCached(query, mockFetch(200, freshWeather));

    assert.deepEqual(result.body, freshWeather);
  } finally {
    Date.now = realNow;
  }
});

test("a non-200 response is never cached, so the next request retries the network", async () => {
  _resetForTests();
  const query = { type: "current", city: "Xyzzzzz" };
  await handleWeatherRequestCached(
    query,
    mockFetch(404, { cod: "404", message: "city not found" }),
  );

  let fetchWasCalledAgain = false;
  const trackedFetch = async () => {
    fetchWasCalledAgain = true;
    return { ok: true, status: 200, json: async () => ({ name: "Xyzzzzz" }) };
  };
  await handleWeatherRequestCached(query, trackedFetch);

  assert.equal(fetchWasCalledAgain, true);
});

test("different query params (different cities) produce independent cache entries", async () => {
  _resetForTests();
  const abujaFixture = { name: "Abuja", main: { temp: 30 } };
  const londonFixture = { name: "London", main: { temp: 15 } };
  await handleWeatherRequestCached(
    { type: "current", city: "Abuja" },
    mockFetch(200, abujaFixture),
  );

  let londonFetchCalled = false;
  const londonFetch = async () => {
    londonFetchCalled = true;
    return { ok: true, status: 200, json: async () => londonFixture };
  };
  const result = await handleWeatherRequestCached({ type: "current", city: "London" }, londonFetch);

  assert.equal(londonFetchCalled, true);
  assert.deepEqual(result.body, londonFixture);
});

test("current and forecast for the same city are cached independently", async () => {
  _resetForTests();
  const currentFixture = { name: "Abuja", main: { temp: 30 } };
  const forecastFixture = { city: { timezone: 3600 }, list: [] };
  await handleWeatherRequestCached(
    { type: "current", city: "Abuja" },
    mockFetch(200, currentFixture),
  );

  let forecastFetchCalled = false;
  const forecastFetch = async () => {
    forecastFetchCalled = true;
    return { ok: true, status: 200, json: async () => forecastFixture };
  };
  const result = await handleWeatherRequestCached(
    { type: "forecast", city: "Abuja" },
    forecastFetch,
  );

  assert.equal(forecastFetchCalled, true);
  assert.deepEqual(result.body, forecastFixture);
});

test("geocode requests are never cached — always pass through to fetchImpl", async () => {
  _resetForTests();
  const matches = [{ name: "London", country: "GB", lat: 51.5, lon: -0.12 }];

  let fetchCallCount = 0;
  const countingFetch = async () => {
    fetchCallCount += 1;
    return { ok: true, status: 200, json: async () => matches };
  };

  await handleWeatherRequestCached({ type: "geocode", q: "London" }, countingFetch);
  await handleWeatherRequestCached({ type: "geocode", q: "London" }, countingFetch);

  assert.equal(fetchCallCount, 2);
});
