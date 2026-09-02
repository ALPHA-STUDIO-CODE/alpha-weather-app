import { test } from "node:test";
import assert from "node:assert/strict";
import { celsiusToFahrenheit, formatTemp } from "./units.js";
test("0°C converts to 32°F", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
});
test("100°C converts to 212°F", () => {
  assert.equal(celsiusToFahrenheit(100), 212);
});
test("negative celsius converts correctly", () => {
  assert.equal(celsiusToFahrenheit(-40), -40);
});
test("celsiusToFahrenheit rounds down when appropriate", () => {
  assert.equal(celsiusToFahrenheit(20.1), 68);
});
test("celsiusToFahrenheit rounds up when appropriate", () => {
  assert.equal(celsiusToFahrenheit(20.9), 70);
});
test("formatTemp with unit C adds °C suffix and rounds", () => {
  assert.equal(formatTemp(21.6, "C"), "22°C");
});
test("formatTemp with unit F converts from celsius input and adds °F suffix", () => {
  assert.equal(formatTemp(0, "F"), "32°F");
});
test("formatTemp rounds negative values correctly (JS rounds -x.5 toward -2, not -3)", () => {
  assert.equal(formatTemp(-2.6, "C"), "-3°C");
});
