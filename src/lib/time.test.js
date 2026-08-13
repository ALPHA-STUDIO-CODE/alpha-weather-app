import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLocalTime } from "./time.js";

// 1704067200 = 2024-01-01T00:00:00Z (midnight UTC)
const MIDNIGHT_UTC = 1704067200;
// 1704110400 = 2024-01-01T12:00:00Z (noon UTC)
const NOON_UTC = 1704110400;

test("midnight UTC with zero offset formats as 12:00 AM", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 0), "12:00 AM");
});

test("noon UTC with zero offset formats as 12:00 PM", () => {
  assert.equal(formatLocalTime(NOON_UTC, 0), "12:00 PM");
});

test("positive offset pushes into the next hour correctly", () => {
  // midnight UTC + 1hr offset = 1:00 AM local
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 3600), "1:00 AM");
});

test("negative offset crosses back into the previous day, still formats time-of-day correctly", () => {
  // midnight UTC - 1hr offset = 11:00 PM (previous day) local
  assert.equal(formatLocalTime(MIDNIGHT_UTC, -3600), "11:00 PM");
});

test("half-hour offset (e.g. India, UTC+5:30) formats minutes correctly", () => {
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 19800), "5:30 AM");
});

test("minutes are zero-padded", () => {
  // midnight UTC + 65 minutes offset = 1:05 AM
  assert.equal(formatLocalTime(MIDNIGHT_UTC, 3900), "1:05 AM");
});

test("offset large enough to cross midnight forward stays in 12-hour format", () => {
  // noon UTC + 13hr offset = 1:00 AM (next day) local
  assert.equal(formatLocalTime(NOON_UTC, 46800), "1:00 AM");
});
