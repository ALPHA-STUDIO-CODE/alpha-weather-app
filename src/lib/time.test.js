import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLocalTime } from "./time.js";
const MIDNIGHT_UTC = 1704067200;
const NOON_UTC = 1704110400;
test("midnight UTC with zero offset formats as 12:00 AM", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 0), "12:00 AM");
});
test("noon UTC with zero offset formats as 12:00 PM", () => {
  assert.equal(formatLocalTime(NOON_UTC, 0), "12:00 PM");
});
test("positive offset pushes into the next hour correctly", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 3600), "1:00 AM");
});
test("negative offset crosses back into the previous day, still formats time-of-day correctly", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, -3600), "11:00 PM");
});
test("half-hour offset (e.g. India, UTC+5:30) formats minutes correctly", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 19800), "5:30 AM");
});
test("minutes are zero-padded", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 3900), "1:05 AM");
});
test("offset large enough to cross midnight forward stays in 12-hour format", () => {
  assert.equal(formatLocalTime(NOON_UTC, 46800), "1:00 AM");
});
