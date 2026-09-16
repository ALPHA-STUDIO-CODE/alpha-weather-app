import { test } from "node:test";
import assert from "node:assert/strict";
import { addSearch } from "./recentSearches.js";
test("adds a new city to the front of an empty list", () => {
  const abuja = { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 };
  const result = addSearch([], abuja);
  assert.deepEqual(result, [abuja]);
});
test("adds a new city to the front of a non-empty list", () => {
  const abuja = { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 };
  const lagos = { name: "Lagos", country: "NG", lat: 6.45, lon: 3.4 };
  const result = addSearch([abuja], lagos);
  assert.deepEqual(result, [lagos, abuja]);
});
test("re-adding an existing city moves it to front without duplicating", () => {
  const abuja = { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 };
  const lagos = { name: "Lagos", country: "NG", lat: 6.45, lon: 3.4 };
  const london = { name: "London", country: "GB", lat: 51.51, lon: -0.13 };
  const list = [london, lagos, abuja];
  const result = addSearch(list, abuja);
  assert.equal(result.length, 3);
  assert.deepEqual(result, [abuja, london, lagos]);
});
test("dedup is case-insensitive on name and country", () => {
  const abuja = { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 };
  const abujaLower = { name: "abuja", country: "ng", lat: 9.06, lon: 7.49 };
  const result = addSearch([abuja], abujaLower);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], abujaLower);
});
test("caps the list at max, evicting the oldest entry", () => {
  const cities = ["A", "B", "C", "D", "E"].map((name) => ({
    name,
    country: "XX",
  }));
  let list = [];
  for (const city of cities) {
    list = addSearch(list, city, 5);
  }
  assert.equal(list.length, 5);
  const newest = { name: "F", country: "XX" };
  list = addSearch(list, newest, 5);
  assert.equal(list.length, 5);
  assert.deepEqual(list[0], newest);
  assert.ok(!list.some((entry) => entry.name === "A"));
});
