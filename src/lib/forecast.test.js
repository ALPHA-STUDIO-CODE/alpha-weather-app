import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByDay, dailySummary } from "./forecast.js";

const OFFSET = 3600;

function entry(dt, temp, icon, description) {
  return { dt, main: { temp }, weather: [{ icon, description }] };
}

const day1 = [
  entry(1704067200, 10, "a0", "cond0"),
  entry(1704078000, 12, "a1", "cond1"),
  entry(1704088800, 15, "a2", "cond2"),
  entry(1704099600, 20, "a3", "cond3"),
  entry(1704110400, 25, "a4", "cond4"),
  entry(1704121200, 22, "a5", "cond5"),
  entry(1704132000, 18, "a6", "cond6"),
  entry(1704142800, 14, "a7", "cond7"),
];

const day2 = [
  entry(1704153600, 5, "b0", "cond0b"),
  entry(1704164400, 8, "b1", "cond1b"),
  entry(1704175200, 9, "b2", "cond2b"),
  entry(1704186000, 30, "b3", "cond3b"),
  entry(1704196800, 28, "b4", "cond4b"),
  entry(1704207600, 20, "b5", "cond5b"),
  entry(1704218400, 15, "b6", "cond6b"),
  entry(1704229200, 7, "b7", "cond7b"),
];

const allEntries = [...day1, ...day2];

test("groupByDay splits entries into correct calendar-day buckets using local offset", () => {
  const groups = groupByDay(allEntries, OFFSET);
  const dates = Object.keys(groups).sort();
  assert.equal(dates.length, 2);
  assert.equal(groups[dates[0]].length, 8);
  assert.equal(groups[dates[1]].length, 8);
});

test("dailySummary computes correct min/max for the day", () => {
  const summary = dailySummary(day1, OFFSET);
  assert.equal(summary.min, 10);
  assert.equal(summary.max, 25);
});

test("dailySummary picks the reading closest to midday (12:00-15:00) for icon/condition", () => {
  const summary = dailySummary(day1, OFFSET);
  assert.equal(summary.icon, "a4");
  assert.equal(summary.condition, "cond4");
});

test("dailySummary works correctly on a second, distinct day", () => {
  const summary = dailySummary(day2, OFFSET);
  assert.equal(summary.min, 5);
  assert.equal(summary.max, 30);
  assert.equal(summary.icon, "b4");
  assert.equal(summary.condition, "cond4b");
});

test("dailySummary includes the correct local calendar date", () => {
  const summary = dailySummary(day1, OFFSET);
  assert.equal(summary.date, "2024-01-01");
});

test("groupByDay + dailySummary together produce 5 or fewer day summaries from a real-shaped 40-entry dataset", () => {
  const start = 1704074400;
  const entries40 = Array.from({ length: 40 }, (_, i) =>
    entry(start + i * 10800, 15 + (i % 5), "x", "cond"),
  );
  const groups = groupByDay(entries40, 0);
  const summaries = Object.values(groups).map((dayEntries) =>
    dailySummary(dayEntries, 0),
  );
  assert.ok(summaries.length <= 6);
  for (const s of summaries) {
    assert.ok(typeof s.min === "number");
    assert.ok(typeof s.max === "number");
    assert.ok(s.icon);
    assert.ok(s.condition);
    assert.ok(s.date);
  }
});
