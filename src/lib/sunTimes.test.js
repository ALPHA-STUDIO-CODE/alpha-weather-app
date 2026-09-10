import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSunrise, formatSunset } from "./sunTimes.js";
import { formatLocalTime } from "./time.js";

// Real-shaped values: a plausible sys.sunrise/sys.sunset pair for a
// single day (2024-01-01), UTC, roughly matching what OpenWeather's
// Current Weather Data actually returns for a mid-latitude city in
// winter — sunrise mid-morning UTC, sunset mid-afternoon UTC.
const SUNRISE_UTC = 1704090600; // 2024-01-01T06:30:00Z
const SUNSET_UTC = 1704127500; // 2024-01-01T16:45:00Z

test("formatSunrise delegates to formatLocalTime (same result for the same inputs)", () => {
  assert.equal(
    formatSunrise(SUNRISE_UTC, 0),
    formatLocalTime(SUNRISE_UTC, 0),
  );
});

test("formatSunset delegates to formatLocalTime (same result for the same inputs)", () => {
  assert.equal(formatSunset(SUNSET_UTC, 0), formatLocalTime(SUNSET_UTC, 0));
});

test("formatSunrise formats a real-shaped sys.sunrise value in 12-hour time, zero offset", () => {
  assert.equal(formatSunrise(SUNRISE_UTC, 0), "6:30 AM");
});

test("formatSunset formats a real-shaped sys.sunset value in 12-hour time, zero offset", () => {
  assert.equal(formatSunset(SUNSET_UTC, 0), "4:45 PM");
});

test("formatSunrise respects the city's own UTC offset, not zero/device time", () => {
  // +1 hour offset — same underlying timestamp, different local time.
  assert.equal(formatSunrise(SUNRISE_UTC, 3600), "7:30 AM");
});

test("formatSunset respects the city's own UTC offset, not zero/device time", () => {
  // -5 hours (e.g. US Eastern-ish offset, no DST considered here).
  assert.equal(formatSunset(SUNSET_UTC, -18000), "11:45 AM");
});
