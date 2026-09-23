import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeolocation } from "./useGeolocation.js";

const COORDS = { latitude: 51.51, longitude: -0.13 };

function mockPermissionState(state) {
  Object.defineProperty(navigator, "permissions", {
    value: { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true,
  });
}

function mockGeolocationSuccess() {
  Object.defineProperty(navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn((success) => {
        success({ coords: COORDS });
      }),
    },
    configurable: true,
  });
}

function mockGeolocationFailure(error) {
  Object.defineProperty(navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn((_success, onError) => {
        onError(error);
      }),
    },
    configurable: true,
  });
}

describe("useGeolocation", () => {
  let originalGeolocation;
  let originalPermissions;

  beforeEach(() => {
    originalGeolocation = navigator.geolocation;
    originalPermissions = navigator.permissions;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
    Object.defineProperty(navigator, "permissions", {
      value: originalPermissions,
      configurable: true,
    });
  });

  it("auto-calls search with coordinates when permission is already granted", async () => {
    mockPermissionState("granted");
    mockGeolocationSuccess();
    const search = vi.fn();

    await act(async () => {
      renderHook(() => useGeolocation(search));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(search).toHaveBeenCalledWith({ lat: 51.51, lon: -0.13 });
  });

  it('does not auto-call search when permission is "prompt"', async () => {
    mockPermissionState("prompt");
    mockGeolocationSuccess();
    const search = vi.fn();

    await act(async () => {
      renderHook(() => useGeolocation(search));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(search).not.toHaveBeenCalled();
  });

  it('does not auto-call search when permission is "denied"', async () => {
    mockPermissionState("denied");
    mockGeolocationSuccess();
    const search = vi.fn();

    await act(async () => {
      renderHook(() => useGeolocation(search));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(search).not.toHaveBeenCalled();
  });

  it("requestLocation() always attempts, regardless of permission state", async () => {
    mockPermissionState("denied");
    mockGeolocationSuccess();
    const search = vi.fn();
    const { result } = renderHook(() => useGeolocation(search));

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(search).toHaveBeenCalledWith({ lat: 51.51, lon: -0.13 });
  });

  it("requestLocation() rejects and does not call search when getCurrentPosition fails", async () => {
    mockPermissionState("denied");
    mockGeolocationFailure({ code: 1, message: "User denied Geolocation" });
    const search = vi.fn();
    const { result } = renderHook(() => useGeolocation(search));

    await expect(result.current.requestLocation()).rejects.toBeTruthy();
    expect(search).not.toHaveBeenCalled();
  });

  it("requestLocation() rejects when geolocation is unsupported", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });
    const search = vi.fn();
    const { result } = renderHook(() => useGeolocation(search));

    await expect(result.current.requestLocation()).rejects.toBeTruthy();
    expect(search).not.toHaveBeenCalled();
  });

  it("does not crash if permissions.query() ever throws synchronously (defensive; not a confirmed Safari-specific bug — see the code comment)", async () => {
    mockGeolocationSuccess();
    Object.defineProperty(navigator, "permissions", {
      value: {
        query: vi.fn(() => {
          throw new TypeError("Failed to execute 'query' on 'Permissions'");
        }),
      },
      configurable: true,
    });
    const search = vi.fn();

    expect(() => {
      renderHook(() => useGeolocation(search));
    }).not.toThrow();
    expect(search).not.toHaveBeenCalled();
  });
});