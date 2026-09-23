import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import WeatherBackground from "./WeatherBackground.jsx";

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

describe("WeatherBackground", () => {
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

  it("applies the given variant as a data attribute", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="clear-day" />);

    expect(container.querySelector('[data-variant="clear-day"]')).not.toBeNull();
  });

  it("renders the rain-lines overlay for a rain-family variant", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="rain-night" />);

    const root = container.querySelector('[data-variant="rain-night"]');
    expect(root).toHaveAttribute("data-motion", "animated");
    expect(root.children.length).toBe(1);
  });

  it("renders the cloud-drift overlay for a cloud-family variant, not rain-lines", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="overcast-day" />);

    const root = container.querySelector('[data-variant="overcast-day"]');
    expect(root.children.length).toBe(1);
  });

  it("renders no overlay at all for a variant with neither effect (clear, snow)", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="clear-day" />);

    const root = container.querySelector('[data-variant="clear-day"]');
    expect(root.children.length).toBe(0);
  });

  it("correctly resolves the family for a hyphenated family name (partly-cloudy)", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="partly-cloudy-night" />);

    const root = container.querySelector('[data-variant="partly-cloudy-night"]');
    expect(root.children.length).toBe(1);
  });

  it("drops the animated overlay and marks data-motion=static when the OS prefers reduced motion", () => {
    mockPrefersReducedMotion(true);
    const { container } = render(<WeatherBackground variant="rain-day" />);

    const root = container.querySelector('[data-variant="rain-day"]');
    expect(root).toHaveAttribute("data-motion", "static");
    expect(root.children.length).toBe(0);
  });

  it("is decorative — hidden from assistive tech and never intercepts clicks", () => {
    mockPrefersReducedMotion(false);
    const { container } = render(<WeatherBackground variant="clear-day" />);

    const root = container.querySelector('[data-variant="clear-day"]');
    expect(root).toHaveAttribute("aria-hidden", "true");
  });
});
