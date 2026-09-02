import { test } from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "./errors.js";
test("'not_found' maps to the city-not-found message", () => {
  assert.equal(
    getErrorMessage("not_found"),
    "City not found. Try another search.",
  );
});
test("'generic' maps to the generic failure message", () => {
  assert.equal(
    getErrorMessage("generic"),
    "Something went wrong. Please try again.",
  );
});
test("an unrecognized type falls back to the generic message", () => {
  assert.equal(
    getErrorMessage("something_unexpected"),
    "Something went wrong. Please try again.",
  );
});
test("undefined type falls back to the generic message", () => {
  assert.equal(getErrorMessage(undefined), "Something went wrong. Please try again.");
});
