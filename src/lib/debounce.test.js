import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./debounce.js";
test("rapid calls collapse into a single invocation after the delay", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  let callCount = 0;
  const debounced = debounce(() => {
    callCount++;
  }, 300);
  debounced();
  debounced();
  debounced();
  assert.equal(callCount, 0);
  mock.timers.tick(300);
  assert.equal(callCount, 1);
  mock.timers.reset();
});
test("delay resets on each new call — only fires 300ms after the LAST call", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  let callCount = 0;
  const debounced = debounce(() => {
    callCount++;
  }, 300);
  debounced();
  mock.timers.tick(200);
  debounced();
  mock.timers.tick(200);
  assert.equal(callCount, 0);
  mock.timers.tick(100);
  assert.equal(callCount, 1);
  mock.timers.reset();
});
test("the most recent call's arguments are the ones passed through", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const received = [];
  const debounced = debounce((value) => {
    received.push(value);
  }, 300);
  debounced("first");
  debounced("second");
  debounced("third");
  mock.timers.tick(300);
  assert.deepEqual(received, ["third"]);
  mock.timers.reset();
});
test("separate quiet periods each produce their own invocation", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  let callCount = 0;
  const debounced = debounce(() => {
    callCount++;
  }, 300);
  debounced();
  mock.timers.tick(300);
  assert.equal(callCount, 1);
  debounced();
  mock.timers.tick(300);
  assert.equal(callCount, 2);
  mock.timers.reset();
});
