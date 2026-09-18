import { test } from "node:test";
import assert from "node:assert/strict";
import { getCached, setCached, cacheKeyFor } from "./cache.js";

function installMockStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
  return store;
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

test("cacheKeyFor is case-insensitive on a city-name location, matching favorites/recents", () => {
  assert.equal(cacheKeyFor("Abuja", "current"), cacheKeyFor("abuja", "current"));
});

test("cacheKeyFor gives current and forecast distinct keys for the same location", () => {
  assert.notEqual(cacheKeyFor("Abuja", "current"), cacheKeyFor("Abuja", "forecast"));
});

test("cacheKeyFor gives a {lat, lon} location its own distinct, stable key", () => {
  const key = cacheKeyFor({ lat: 9.06, lon: 7.49 }, "current");
  assert.equal(key, cacheKeyFor({ lat: 9.06, lon: 7.49 }, "current"));
  assert.notEqual(key, cacheKeyFor("Abuja", "current"));
});

test("getCached returns null when the key is absent", () => {
  installMockStorage();
  assert.equal(getCached(cacheKeyFor("Abuja", "current"), THIRTY_MINUTES_MS), null);
});

test("setCached then getCached round-trips a fresh entry through storage.js", () => {
  installMockStorage();
  const key = cacheKeyFor("Abuja", "current");
  const payload = { name: "Abuja", main: { temp: 30 } };
  setCached(key, payload);
  assert.deepEqual(getCached(key, THIRTY_MINUTES_MS), payload);
});

test("getCached returns null for an entry older than maxAgeMs", () => {
  installMockStorage();
  const key = cacheKeyFor("Abuja", "current");
  const realNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    setCached(key, { name: "Abuja" });
    Date.now = () => 1_000_000 + THIRTY_MINUTES_MS + 60_000; // 31 minutes later
    assert.equal(getCached(key, THIRTY_MINUTES_MS), null);
  } finally {
    Date.now = realNow;
  }
});

test("getCached still returns the payload for an entry just under maxAgeMs", () => {
  installMockStorage();
  const key = cacheKeyFor("Abuja", "current");
  const realNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    setCached(key, { name: "Abuja" });
    Date.now = () => 1_000_000 + THIRTY_MINUTES_MS - 60_000; // 29 minutes later
    assert.deepEqual(getCached(key, THIRTY_MINUTES_MS), { name: "Abuja" });
  } finally {
    Date.now = realNow;
  }
});
