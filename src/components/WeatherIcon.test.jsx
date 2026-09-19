import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WeatherIcon from "./WeatherIcon.jsx";

function mockPrefersReducedMotion(matches) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockReturnValue(mql),
    configurable: true,
  });
}

describe("WeatherIcon", () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      value: originalMatchMedia,
      configurable: true,
    });
  });

  it("renders the mapped animated SVG for a known code when motion is not reduced", () => {
    mockPrefersReducedMotion(false);
    render(<WeatherIcon code="01d" alt="clear sky" />);

    const img = screen.getByRole("img", { name: "clear sky" });
    expect(img).toHaveAttribute("src", "/icons/meteocons/animated/clear-day.svg");
  });

  it("renders the correct mapped SVG for a different known code", () => {
    mockPrefersReducedMotion(false);
    render(<WeatherIcon code="10n" alt="rain" />);

    const img = screen.getByRole("img", { name: "rain" });
    expect(img).toHaveAttribute("src", "/icons/meteocons/animated/partly-cloudy-night-rain.svg");
  });

  it("falls back to the not-available icon for an unrecognized code, without crashing", () => {
    mockPrefersReducedMotion(false);
    render(<WeatherIcon code="99x" alt="unknown" />);

    const img = screen.getByRole("img", { name: "unknown" });
    expect(img).toHaveAttribute("src", "/icons/meteocons/animated/not-available.svg");
  });

  it("renders the static variant when the OS prefers reduced motion", () => {
    mockPrefersReducedMotion(true);
    render(<WeatherIcon code="01d" alt="clear sky" />);

    const img = screen.getByRole("img", { name: "clear sky" });
    expect(img).toHaveAttribute("src", "/icons/meteocons/static/clear-day.svg");
  });

  it("composes the caller's sizing className alongside its own module class", () => {
    mockPrefersReducedMotion(false);
    render(<WeatherIcon code="01d" alt="clear sky" className="caller-size-class" />);

    const img = screen.getByRole("img", { name: "clear sky" });
    expect(img.className).toContain("caller-size-class");
  });
});
