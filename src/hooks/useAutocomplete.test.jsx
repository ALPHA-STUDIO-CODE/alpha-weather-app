import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutocomplete } from "./useAutocomplete.js";

vi.mock("../apiClient.js", async () => {
  const actual = await vi.importActual("../apiClient.js");
  return { ...actual, geocode: vi.fn() };
});

import { geocode } from "../apiClient.js";

describe("useAutocomplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    geocode.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no suggestions", () => {
    const { result } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });
    expect(result.current).toEqual([]);
  });

  it("does not call geocode for fewer than 2 characters", async () => {
    geocode.mockResolvedValue([]);
    const { rerender } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });

    rerender({ query: "a" });
    await vi.advanceTimersByTimeAsync(1000);

    expect(geocode).not.toHaveBeenCalled();
  });

  it("rapid typing (multiple query changes within the debounce window) collapses into a single geocode call with the last query", async () => {
    geocode.mockResolvedValue([]);
    const { rerender } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });

    rerender({ query: "Lo" });
    rerender({ query: "Lon" });
    rerender({ query: "Lond" });
    expect(geocode).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(geocode).toHaveBeenCalledTimes(1);
    expect(geocode).toHaveBeenCalledWith("Lond");
  });

  it("stores up to 5 suggestions, slicing off any extra", async () => {
    const sixResults = Array.from({ length: 6 }, (_, i) => ({
      name: `City${i}`,
      country: "XX",
      lat: i,
      lon: i,
    }));
    geocode.mockResolvedValue(sixResults);
    const { rerender, result } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });

    rerender({ query: "City" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current).toHaveLength(5);
  });

  it("clears suggestions when geocode throws", async () => {
    geocode.mockRejectedValue(new Error("boom"));
    const { rerender, result } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });

    rerender({ query: "Lo" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current).toEqual([]);
  });

  it("dropping back below the minimum clears suggestions immediately, without waiting for the debounce", async () => {
    geocode.mockResolvedValue([{ name: "London", country: "GB", lat: 51.51, lon: -0.13 }]);
    const { rerender, result } = renderHook(({ query }) => useAutocomplete(query), {
      initialProps: { query: "" },
    });

    rerender({ query: "Lo" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current).toHaveLength(1);

    // v1 parity: a query under MIN_CHARS never reaches the debounced
    // function at all — it's an early return, not a debounced-then-
    // empty result — so this clears synchronously, no timer needed.
    rerender({ query: "L" });
    expect(result.current).toEqual([]);
  });
});
