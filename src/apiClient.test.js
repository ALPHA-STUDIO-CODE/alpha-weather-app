import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchCurrentWeather,
  fetchForecast,
  geocode,
  WeatherApiError,
} from "./apiClient.js";

function mockFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

test("fetchCurrentWeather returns parsed JSON on success", async () => {
  globalThis.fetch = mockFetch(200, { name: "Abuja", main: { temp: 30 } });
  const result = await fetchCurrentWeather("Abuja");
  assert.equal(result.name, "Abuja");
  assert.equal(result.main.temp, 30);
});

test("fetchCurrentWeather throws a typed 'not_found' error on 404", async () => {
  globalThis.fetch = mockFetch(404, { error: "city not found" });
  await assert.rejects(
    () => fetchCurrentWeather("Xyzzzzz"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "not_found");
      return true;
    },
  );
});

test("fetchCurrentWeather throws a typed 'generic' error on other non-OK statuses", async () => {
  globalThis.fetch = mockFetch(502, {
    error: "upstream weather service failed",
  });
  await assert.rejects(
    () => fetchCurrentWeather("Abuja"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "generic");
      return true;
    },
  );
});

test("fetchCurrentWeather URL-encodes the city name", async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({}) };
  };
  await fetchCurrentWeather("New York");
  assert.ok(capturedUrl.includes("city=New%20York"));
  assert.ok(capturedUrl.startsWith("/api/weather?type=current"));
});

test("fetchCurrentWeather accepts a {lat, lon} location instead of a city name", async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({}) };
  };
  await fetchCurrentWeather({ lat: 51.51, lon: -0.13 });
  assert.ok(capturedUrl.includes("lat=51.51"));
  assert.ok(capturedUrl.includes("lon=-0.13"));
  assert.ok(!capturedUrl.includes("city="));
});

test("fetchForecast accepts a {lat, lon} location instead of a city name", async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({}) };
  };
  await fetchForecast({ lat: 9.06, lon: 7.49 });
  assert.ok(capturedUrl.startsWith("/api/weather?type=forecast"));
  assert.ok(capturedUrl.includes("lat=9.06"));
  assert.ok(capturedUrl.includes("lon=7.49"));
});

test("fetchForecast returns parsed JSON on success", async () => {
  globalThis.fetch = mockFetch(200, { list: [{ dt: 1, main: { temp: 20 } }] });
  const result = await fetchForecast("Abuja");
  assert.equal(result.list.length, 1);
});

test("fetchForecast throws a typed 'not_found' error on 404", async () => {
  globalThis.fetch = mockFetch(404, { error: "city not found" });
  await assert.rejects(
    () => fetchForecast("Xyzzzzz"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "not_found");
      return true;
    },
  );
});

test("fetchForecast throws a typed 'generic' error on other non-OK statuses", async () => {
  globalThis.fetch = mockFetch(502, {
    error: "upstream weather service failed",
  });
  await assert.rejects(
    () => fetchForecast("Abuja"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "generic");
      return true;
    },
  );
});

test("fetchForecast hits the forecast endpoint, not current", async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({}) };
  };
  await fetchForecast("Abuja");
  assert.ok(capturedUrl.startsWith("/api/weather?type=forecast"));
});

test("geocode returns parsed JSON on success", async () => {
  globalThis.fetch = mockFetch(200, [
    { name: "London", country: "GB", lat: 51.51, lon: -0.13 },
  ]);
  const result = await geocode("Lon");
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "London");
});

test("geocode throws a typed 'not_found' error on 404", async () => {
  globalThis.fetch = mockFetch(404, { error: "no matches" });
  await assert.rejects(
    () => geocode("Xyzzzzz"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "not_found");
      return true;
    },
  );
});

test("geocode throws a typed 'generic' error on other non-OK statuses", async () => {
  globalThis.fetch = mockFetch(502, { error: "upstream geocode failed" });
  await assert.rejects(
    () => geocode("Lon"),
    (err) => {
      assert.ok(err instanceof WeatherApiError);
      assert.equal(err.type, "generic");
      return true;
    },
  );
});

test("geocode hits the geocode endpoint with a 'q' param", async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => [] };
  };
  await geocode("New York");
  assert.ok(capturedUrl.startsWith("/api/weather?type=geocode"));
  assert.ok(capturedUrl.includes("q=New%20York"));
});
