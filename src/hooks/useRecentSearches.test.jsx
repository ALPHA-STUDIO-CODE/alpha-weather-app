import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecentSearches } from "./useRecentSearches.js";

function city(name, country = "XX") {
  return { name, country, lat: 0, lon: 0 };
}

describe("useRecentSearches", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recents).toEqual([]);
  });

  it("recording 6 distinct cities keeps only the last 5, most-recent-first", () => {
    const { result } = renderHook(() => useRecentSearches());
    const names = ["A", "B", "C", "D", "E", "F"];

    for (const name of names) {
      act(() => {
        result.current.record(city(name));
      });
    }

    expect(result.current.recents).toHaveLength(5);
    expect(result.current.recents.map((entry) => entry.name)).toEqual(["F", "E", "D", "C", "B"]);
    expect(result.current.recents.some((entry) => entry.name === "A")).toBe(false);
  });

  it("re-recording an existing city moves it to front without duplicating (dedup)", () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.record(city("London", "GB"));
    });
    act(() => {
      result.current.record(city("Abuja", "NG"));
    });
    act(() => {
      // Same city again, different casing — addSearch's dedup is
      // case-insensitive on name+country (Step 4).
      result.current.record(city("london", "gb"));
    });

    expect(result.current.recents).toHaveLength(2);
    expect(result.current.recents[0]).toMatchObject({
      name: "london",
      country: "gb",
    });
  });

  it("reads a pre-existing recent-searches list from storage on mount", () => {
    localStorage.setItem("awr_recent_searches", JSON.stringify([city("Lagos", "NG")]));
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recents).toEqual([city("Lagos", "NG")]);
  });

  it("writes to storage on record, and a remount picks up the persisted list", () => {
    const first = renderHook(() => useRecentSearches());
    act(() => {
      first.result.current.record(city("Abuja", "NG"));
    });
    expect(JSON.parse(localStorage.getItem("awr_recent_searches"))).toEqual([city("Abuja", "NG")]);

    // Simulate a fresh page load: a brand-new hook instance, no state
    // carried over except what's in storage.
    const second = renderHook(() => useRecentSearches());
    expect(second.result.current.recents).toEqual([city("Abuja", "NG")]);
  });
});
