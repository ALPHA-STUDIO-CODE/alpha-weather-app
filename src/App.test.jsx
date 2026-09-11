import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

// First App-level test in the project — Step 12 explicitly asks for
// a cross-component check ("toggling flips rendered temp strings on
// both cards") that neither CurrentWeatherCard.test.jsx nor
// ForecastCards.test.jsx can cover alone, since each only tests a
// single component in isolation with a fixed `unit` prop.
vi.mock("./apiClient.js", async () => {
  const actual = await vi.importActual("./apiClient.js");
  return {
    ...actual,
    fetchCurrentWeather: vi.fn(),
    fetchForecast: vi.fn(),
  };
});

import { fetchCurrentWeather, fetchForecast } from "./apiClient.js";

function entry(dt, temp, icon, description) {
  return { dt, main: { temp }, weather: [{ icon, description }] };
}

const CURRENT_FIXTURE = {
  name: "Abuja",
  sys: { country: "NG" },
  main: { temp: 30, humidity: 40 },
  weather: [{ description: "clear sky", icon: "01d" }],
  wind: { speed: 3.2 },
  dt: 1704110400,
  timezone: 3600,
};

// A single calendar day's worth of 3-hour entries, min 20 / max 30 —
// picked so both C and F values (30°C/86°F, 20°C/68°F) are exact
// integers with no rounding ambiguity in the assertions below.
const ONE_DAY_FORECAST_FIXTURE = {
  city: { timezone: 3600 },
  list: [
    entry(1704067200, 20, "a0", "clear sky"),
    entry(1704078000, 22, "a1", "clear sky"),
    entry(1704088800, 25, "a2", "clear sky"),
    entry(1704099600, 28, "a3", "clear sky"),
    entry(1704110400, 30, "a4", "clear sky"),
    entry(1704121200, 27, "a5", "clear sky"),
    entry(1704132000, 24, "a6", "clear sky"),
    entry(1704142800, 21, "a7", "clear sky"),
  ],
};

describe("App — unit toggle integration (Step 12)", () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
    fetchForecast.mockReset();
    fetchCurrentWeather.mockResolvedValue(CURRENT_FIXTURE);
    fetchForecast.mockResolvedValue(ONE_DAY_FORECAST_FIXTURE);
  });

  it("flips rendered temp strings on both CurrentWeatherCard and ForecastCards, keeps wind in m/s, and does not re-fetch", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 17's smart initial load fires the first search
    // automatically on mount (defaults to Abuja) — this test is
    // about the unit toggle, not the search flow, so there's no
    // need to drive the form as well.
    await waitFor(() => expect(screen.getByText("30°C")).toBeInTheDocument());
    expect(screen.getByText("30°C / 20°C")).toBeInTheDocument();
    expect(screen.getByText("3.2 m/s")).toBeInTheDocument();

    const fetchCallsBeforeToggle =
      fetchCurrentWeather.mock.calls.length + fetchForecast.mock.calls.length;

    await user.click(screen.getByRole("button", { name: "Switch to Fahrenheit" }));

    expect(screen.getByText("86°F")).toBeInTheDocument();
    expect(screen.getByText("86°F / 68°F")).toBeInTheDocument();
    // Wind speed is not unit-aware — stays m/s regardless of toggle.
    expect(screen.getByText("3.2 m/s")).toBeInTheDocument();

    expect(fetchCurrentWeather.mock.calls.length + fetchForecast.mock.calls.length).toBe(
      fetchCallsBeforeToggle,
    );
  });
});

const ABUJA_FIXTURE = CURRENT_FIXTURE;

const LONDON_FIXTURE = {
  name: "London",
  sys: { country: "GB" },
  main: { temp: 15, humidity: 60 },
  weather: [{ description: "light rain", icon: "10d" }],
  wind: { speed: 4.1 },
  dt: 1704110400,
  timezone: 0,
};

const FIXTURES_BY_CITY = { Abuja: ABUJA_FIXTURE, London: LONDON_FIXTURE };

describe("App — recent searches integration (Step 16)", () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
    fetchForecast.mockReset();
    // Resolve per-argument so a chip click can be distinguished from
    // the original search that created it.
    fetchCurrentWeather.mockImplementation((location) =>
      Promise.resolve(FIXTURES_BY_CITY[location] ?? ABUJA_FIXTURE),
    );
    fetchForecast.mockResolvedValue(ONE_DAY_FORECAST_FIXTURE);
  });

  it("records a chip after a successful search (including the Step 17 initial auto-load), keeps prior chips, and clicking a chip re-searches that city", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 17's smart initial load fires handleSearch('Abuja')
    // automatically on mount through this exact same shared entry
    // point — wait for it to settle and produce the first chip
    // before doing anything else, rather than searching it again by
    // hand.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Abuja, NG" })).toBeInTheDocument(),
    );

    const input = screen.getByRole("textbox");
    const searchButton = screen.getByRole("button", { name: /^search$/i });

    await user.type(input, "London");
    await user.click(searchButton);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "London, GB" })).toBeInTheDocument(),
    );
    // Prior chip is still there — recording adds, doesn't replace.
    expect(screen.getByRole("button", { name: "Abuja, NG" })).toBeInTheDocument();

    fetchCurrentWeather.mockClear();
    await user.click(screen.getByRole("button", { name: "Abuja, NG" }));

    await waitFor(() => expect(fetchCurrentWeather).toHaveBeenCalledWith("Abuja"));
    // Clicking the chip re-searched and the display updated back to
    // that city's weather.
    await waitFor(() => expect(screen.getByText("30°C")).toBeInTheDocument());
  });
});

describe("App — smart initial load (Step 17)", () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
    fetchForecast.mockReset();
    fetchForecast.mockResolvedValue(ONE_DAY_FORECAST_FIXTURE);
  });

  it("defaults to Abuja on mount when awr_last_city is absent", async () => {
    fetchCurrentWeather.mockResolvedValue(ABUJA_FIXTURE);
    render(<App />);

    await waitFor(() => expect(fetchCurrentWeather).toHaveBeenCalledWith("Abuja"));
  });

  it("reads a pre-existing awr_last_city and searches that city on mount instead of the default", async () => {
    // setItem stores plain strings as-is (no JSON encoding) — see
    // storage.js — so the raw value here matches what a real toggle/
    // search flow would have written.
    localStorage.setItem("awr_last_city", "London");
    fetchCurrentWeather.mockImplementation((location) =>
      Promise.resolve(FIXTURES_BY_CITY[location] ?? ABUJA_FIXTURE),
    );
    render(<App />);

    await waitFor(() => expect(fetchCurrentWeather).toHaveBeenCalledWith("London"));
    expect(fetchCurrentWeather).not.toHaveBeenCalledWith("Abuja");
  });

  it("persists awr_last_city after every successful search, through the same handleSearch used everywhere else", async () => {
    const user = userEvent.setup();
    fetchCurrentWeather.mockImplementation((location) =>
      Promise.resolve(FIXTURES_BY_CITY[location] ?? ABUJA_FIXTURE),
    );
    render(<App />);

    // Let the initial (default Abuja) load settle and persist first.
    await waitFor(() => expect(localStorage.getItem("awr_last_city")).toBe("Abuja"));

    await user.type(screen.getByRole("textbox"), "London");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    await waitFor(() => expect(localStorage.getItem("awr_last_city")).toBe("London"));
  });
});
