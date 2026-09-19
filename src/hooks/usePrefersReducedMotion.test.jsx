import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

function mockMatchMedia(initialMatches) {
  let matches = initialMatches;
  let changeHandler = null;
  const mql = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((event, handler) => {
      if (event === "change") changeHandler = handler;
    }),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockReturnValue(mql),
    configurable: true,
  });
  return {
    simulateChange: (newMatches) => {
      matches = newMatches;
      changeHandler?.({ matches: newMatches });
    },
  };
}

describe("usePrefersReducedMotion", () => {
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

  it("returns false when the OS has no reduced-motion preference", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when the OS prefers reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates live when the OS setting changes while mounted", () => {
    const { simulateChange } = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      simulateChange(true);
    });

    expect(result.current).toBe(true);
  });
});
