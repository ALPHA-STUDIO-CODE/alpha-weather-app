import { test } from "node:test";
import assert from "node:assert/strict";
import { addFavorite, removeFavorite, isFavorite } from "./favorites.js";

const ABUJA = { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 };
const LAGOS = { name: "Lagos", country: "NG", lat: 6.45, lon: 3.4 };
const LONDON = { name: "London", country: "GB", lat: 51.51, lon: -0.13 };

test("addFavorite adds a new city to the front of an empty list", () => {
  const result = addFavorite([], ABUJA);
  assert.deepEqual(result, [ABUJA]);
});

test("addFavorite adds a new city to the front of a non-empty list (newest-favorited-first)", () => {
  const result = addFavorite([ABUJA], LAGOS);
  assert.deepEqual(result, [LAGOS, ABUJA]);
});

test("addFavorite is a no-op when the city is already favorited — not even a move to front", () => {
  const list = [LONDON, ABUJA];
  const result = addFavorite(list, ABUJA);
  assert.equal(result, list); // same reference, not just deepEqual
  assert.deepEqual(result, [LONDON, ABUJA]); // ABUJA stayed put
});

test("addFavorite's duplicate check is case-insensitive on name+country, matching recentSearches", () => {
  const list = [ABUJA];
  const result = addFavorite(list, { name: "abuja", country: "ng" });
  assert.equal(result, list);
});

test("addFavorite blocks at the cap — correct return shape, no eviction of the oldest entry", () => {
  const cities = Array.from({ length: 10 }, (_, i) => ({
    name: `City${i}`,
    country: "XX",
  }));
  let list = [];
  for (const city of cities) {
    list = addFavorite(list, city, 10);
  }
  assert.equal(list.length, 10);

  const eleventh = { name: "Overflow", country: "XX" };
  const result = addFavorite(list, eleventh, 10);

  assert.equal(result, list); // unchanged reference — blocked, not truncated
  assert.equal(result.length, 10);
  assert.ok(!result.some((entry) => entry.name === "Overflow"));
  // Critically: the oldest entry (City0) is still present — no
  // auto-eviction, unlike recentSearches at its own cap.
  assert.ok(result.some((entry) => entry.name === "City0"));
});

test("removeFavorite removes a city regardless of its position in the list", () => {
  const list = [LONDON, LAGOS, ABUJA];
  const result = removeFavorite(list, LAGOS);
  assert.deepEqual(result, [LONDON, ABUJA]);
});

test("removeFavorite is a no-op when the city isn't in the list", () => {
  const list = [LONDON, ABUJA];
  const result = removeFavorite(list, LAGOS);
  assert.deepEqual(result, list);
});

test("isFavorite returns true when the city is in the list", () => {
  assert.equal(isFavorite([LONDON, ABUJA], ABUJA), true);
});

test("isFavorite returns false when the city is not in the list", () => {
  assert.equal(isFavorite([LONDON], ABUJA), false);
});

test("isFavorite lookup is case-insensitive on name+country", () => {
  assert.equal(isFavorite([ABUJA], { name: "ABUJA", country: "ng" }), true);
});
