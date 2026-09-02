import { test } from "node:test";
import assert from "node:assert/strict";
import { getItem, setItem } from "./storage.js";
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
function installThrowingStorage() {
  globalThis.localStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
}
test("setItem then getItem round-trips a string value", () => {
  installMockStorage();
  setItem("awr_theme", "dark");
  assert.equal(getItem("awr_theme", "light"), "dark");
});
test("setItem then getItem round-trips a JSON-serializable object", () => {
  installMockStorage();
  setItem("awr_recent_searches", [{ city: "Abuja" }]);
  assert.deepEqual(getItem("awr_recent_searches", []), [{ city: "Abuja" }]);
});
test("getItem returns fallback when key is absent", () => {
  installMockStorage();
  assert.equal(getItem("awr_unit", "C"), "C");
});
test("getItem returns fallback (not a throw) when localStorage.getItem throws", () => {
  installThrowingStorage();
  assert.doesNotThrow(() => {
    const result = getItem("awr_theme", "light");
    assert.equal(result, "light");
  });
});
test("setItem does not throw when localStorage.setItem throws", () => {
  installThrowingStorage();
  assert.doesNotThrow(() => {
    setItem("awr_theme", "dark");
  });
});
test("getItem returns fallback when localStorage itself is undefined", () => {
  globalThis.localStorage = undefined;
  assert.doesNotThrow(() => {
    const result = getItem("awr_theme", "light");
    assert.equal(result, "light");
  });
});
