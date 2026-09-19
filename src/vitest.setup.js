import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement window.matchMedia at all (calling it
// throws "not a function") — needed starting Step 33's WeatherIcon,
// via usePrefersReducedMotion. Stub a default "no preference"
// implementation globally, once, so every existing test that renders
// an icon (CurrentWeatherCard, ForecastCards, and by extension most
// of App.test.jsx) doesn't need to know matchMedia exists at all.
// Tests that specifically care about the reduced-motion behavior
// itself (usePrefersReducedMotion.test.jsx, WeatherIcon.test.jsx)
// override this per-test via Object.defineProperty and restore the
// original afterward — the same pattern already used for
// navigator.geolocation/permissions in useGeolocation.test.jsx.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

// With `globals: false` in vite.config.js, RTL's automatic afterEach
// cleanup never gets registered (it hooks into a global afterEach
// that doesn't exist here) — so DOM from one test leaks into the
// next within the same file. Register it explicitly instead.
afterEach(() => {
  cleanup();
  // jsdom's localStorage persists across tests within the same file
  // (and across files in the same worker) unless cleared explicitly.
  // Needed starting Step 14 (useUnit/useTheme persistence) and every
  // storage-backed hook after it (e.g. Step 15's useRecentSearches).
  localStorage.clear();
});
