import { test } from "node:test";
import assert from "node:assert/strict";
import { backgroundVariantFor } from "./backgroundCondition.js";

// Same real-shaped sunrise/sunset pair used in sunTimes.test.js, for
// consistency across the two files: sunrise 06:30 UTC, sunset 16:45
// UTC, 2024-01-01.
const SUNRISE_UTC = 1704090600;
const SUNSET_UTC = 1704127500;

test("a time before sunrise is a night variant", () => {
  const beforeSunrise = SUNRISE_UTC - 3600; // 5:30 AM UTC
  assert.equal(backgroundVariantFor("01d", beforeSunrise, SUNRISE_UTC, SUNSET_UTC), "clear-night");
});

test("a time between sunrise and sunset is a day variant", () => {
  const midday = SUNRISE_UTC + (SUNSET_UTC - SUNRISE_UTC) / 2;
  assert.equal(backgroundVariantFor("01d", midday, SUNRISE_UTC, SUNSET_UTC), "clear-day");
});

test("a time after sunset is a night variant", () => {
  const afterSunset = SUNSET_UTC + 3600; // 5:45 PM UTC
  assert.equal(backgroundVariantFor("01n", afterSunset, SUNRISE_UTC, SUNSET_UTC), "clear-night");
});

test("exactly sunrise counts as day (inclusive lower bound)", () => {
  assert.equal(backgroundVariantFor("01d", SUNRISE_UTC, SUNRISE_UTC, SUNSET_UTC), "clear-day");
});

test("exactly sunset counts as night (exclusive upper bound)", () => {
  assert.equal(backgroundVariantFor("01d", SUNSET_UTC, SUNRISE_UTC, SUNSET_UTC), "clear-night");
});

test("day/night is derived from the given time, not from the icon code's own d/n suffix", () => {
  const afterSunset = SUNSET_UTC + 3600;
  // Icon code says "d" (day), but the actual time given is after
  // sunset — the variant must still say night, proving day/night
  // comes from the sunrise/sunset comparison, not the icon's suffix.
  assert.equal(backgroundVariantFor("01d", afterSunset, SUNRISE_UTC, SUNSET_UTC), "clear-night");
});

test("each condition family maps to a distinct key", () => {
  const midday = SUNRISE_UTC + 3600;
  const codes = ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"];
  const variants = codes.map((code) => backgroundVariantFor(code, midday, SUNRISE_UTC, SUNSET_UTC));
  assert.equal(new Set(variants).size, codes.length, "expected all 9 families to be distinct");
});

test("day and night variants of the same family are distinct", () => {
  const day = backgroundVariantFor("10d", SUNRISE_UTC + 3600, SUNRISE_UTC, SUNSET_UTC);
  const night = backgroundVariantFor("10d", SUNSET_UTC + 3600, SUNRISE_UTC, SUNSET_UTC);
  assert.notEqual(day, night);
});

test("an unrecognized icon code falls back to a neutral family instead of crashing", () => {
  const midday = SUNRISE_UTC + 3600;
  assert.equal(backgroundVariantFor("99x", midday, SUNRISE_UTC, SUNSET_UTC), "cloudy-day");
});

test("a missing icon code falls back to a neutral family instead of crashing", () => {
  const midday = SUNRISE_UTC + 3600;
  assert.equal(backgroundVariantFor(undefined, midday, SUNRISE_UTC, SUNSET_UTC), "cloudy-day");
});
