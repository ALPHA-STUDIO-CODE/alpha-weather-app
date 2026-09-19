import { test } from "node:test";
import assert from "node:assert/strict";
import { get, set, cacheKeyFor, _resetForTests } from "./responseCache.js";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

test("cacheKeyFor gives the same key for the same city+type query", () => {
  assert.equal(
    cacheKeyFor({ type: "current", city: "Abuja" }),
    cacheKeyFor({ type: "current", city: "Abuja" }),
  );
});

test("cacheKeyFor gives distinct keys for different cities", () => {
  assert.notEqual(
    cacheKeyFor({ type: "current", city: "Abuja" }),
    cacheKeyFor({ type: "current", city: "London" }),
  );
});

test("cacheKeyFor gives distinct keys for current vs forecast on the same city", () => {
  assert.notEqual(
    cacheKeyFor({ type: "current", city: "Abuja" }),
    cacheKeyFor({ type: "forecast", city: "Abuja" }),
  );
});

test("cacheKeyFor keys a lat/lon query by coordinates, distinct from an equivalent city query", () => {
  const coordsKey = cacheKeyFor({ type: "current", lat: 9.06, lon: 7.49 });
  assert.equal(coordsKey, cacheKeyFor({ type: "current", lat: 9.06, lon: 7.49 }));
  assert.notEqual(coordsKey, cacheKeyFor({ type: "current", city: "Abuja" }));
});

test("cacheKeyFor keys a geocode query by its q param, distinct from a weather query for the same name", () => {
  assert.notEqual(
    cacheKeyFor({ type: "geocode", q: "Abuja" }),
    cacheKeyFor({ type: "current", city: "Abuja" }),
  );
});

test("get returns null for an absent key", () => {
  _resetForTests();
  assert.equal(get("nope", THIRTY_MINUTES_MS), null);
});

test("set then get round-trips a fresh entry", () => {
  _resetForTests();
  const value = { status: 200, body: { name: "Abuja" } };
  set("k", value);
  assert.deepEqual(get("k", THIRTY_MINUTES_MS), value);
});

test("get returns null for an entry older than maxAgeMs", () => {
  _resetForTests();
  const realNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    set("k", { status: 200, body: {} });
    Date.now = () => 1_000_000 + THIRTY_MINUTES_MS + 60_000; // 31 minutes later
    assert.equal(get("k", THIRTY_MINUTES_MS), null);
  } finally {
    Date.now = realNow;
  }
});

test("get still returns the value for an entry just under maxAgeMs", () => {
  _resetForTests();
  const realNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    const value = { status: 200, body: { name: "Abuja" } };
    set("k", value);
    Date.now = () => 1_000_000 + THIRTY_MINUTES_MS - 60_000; // 29 minutes later
    assert.deepEqual(get("k", THIRTY_MINUTES_MS), value);
  } finally {
    Date.now = realNow;
  }
});
