import { test } from "node:test";
import assert from "node:assert/strict";
import { meteoconUrl } from "./meteoconsCdn.js";

test("builds the animated (svg) URL by default", () => {
  assert.equal(
    meteoconUrl("clear-day"),
    "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-day.svg",
  );
});

test("builds the static (svg-static) URL when reducedMotion is true", () => {
  assert.equal(
    meteoconUrl("clear-day", { reducedMotion: true }),
    "https://cdn.meteocons.com/3.0.0-next.10/svg-static/fill/clear-day.svg",
  );
});

test("reducedMotion: false behaves the same as the default (animated)", () => {
  assert.equal(meteoconUrl("rain", { reducedMotion: false }), meteoconUrl("rain"));
});

test("different slugs produce different URLs, same version/style/format", () => {
  assert.notEqual(meteoconUrl("sunrise"), meteoconUrl("sunset"));
});
