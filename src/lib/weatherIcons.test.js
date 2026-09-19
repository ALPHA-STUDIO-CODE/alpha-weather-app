import { test } from "node:test";
import assert from "node:assert/strict";
import { meteoconFor } from "./weatherIcons.js";

test("maps a known day code to its Meteocons name", () => {
  assert.equal(meteoconFor("01d"), "clear-day");
});

test("maps a known night code to its distinct night Meteocons name", () => {
  assert.equal(meteoconFor("01n"), "clear-night");
  assert.notEqual(meteoconFor("01n"), meteoconFor("01d"));
});

test("maps every documented OpenWeather condition code to a mapping (no accidental gaps)", () => {
  const codes = [
    "01d",
    "01n",
    "02d",
    "02n",
    "03d",
    "03n",
    "04d",
    "04n",
    "09d",
    "09n",
    "10d",
    "10n",
    "11d",
    "11n",
    "13d",
    "13n",
    "50d",
    "50n",
  ];
  for (const code of codes) {
    const result = meteoconFor(code);
    assert.notEqual(result, "not-available", `expected a real mapping for ${code}`);
  }
});

test("conditions without a meaningful day/night distinction (e.g. cloudy) share one icon", () => {
  assert.equal(meteoconFor("03d"), meteoconFor("03n"));
});

test("an unrecognized code falls back to the default icon instead of crashing", () => {
  assert.equal(meteoconFor("99x"), "not-available");
});

test("a missing icon code (null/undefined) falls back to the default icon instead of crashing", () => {
  assert.equal(meteoconFor(undefined), "not-available");
  assert.equal(meteoconFor(null), "not-available");
});

test("an empty string falls back to the default icon", () => {
  assert.equal(meteoconFor(""), "not-available");
});
