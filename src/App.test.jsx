import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

// First App-level test in the project — Step 12 explicitly asks for
// a cross-component check ("toggling flips rendered temp strings on
// both cards") that neither CurrentWeatherCard.test.jsx nor
// ForecastCards.test.jsx can cover alone, since each only tests a
// single component in isolation with a fixed `unit` prop.
vi.mock('./apiClient.js', async () => {
  const actual = await vi.importActual('./apiClient.js');
  return {
    ...actual,
    fetchCurrentWeather: vi.fn(),
    fetchForecast: vi.fn(),
  };
});

import { fetchCurrentWeather, fetchForecast } from './apiClient.js';

function entry(dt, temp, icon, description) {
  return { dt, main: { temp }, weather: [{ icon, description }] };
}

const CURRENT_FIXTURE = {
  name: 'Abuja',
  sys: { country: 'NG' },
  main: { temp: 30, humidity: 40 },
  weather: [{ description: 'clear sky', icon: '01d' }],
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
    entry(1704067200, 20, 'a0', 'clear sky'),
    entry(1704078000, 22, 'a1', 'clear sky'),
    entry(1704088800, 25, 'a2', 'clear sky'),
    entry(1704099600, 28, 'a3', 'clear sky'),
    entry(1704110400, 30, 'a4', 'clear sky'),
    entry(1704121200, 27, 'a5', 'clear sky'),
    entry(1704132000, 24, 'a6', 'clear sky'),
    entry(1704142800, 21, 'a7', 'clear sky'),
  ],
};

describe('App — unit toggle integration (Step 12)', () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
    fetchForecast.mockReset();
    fetchCurrentWeather.mockResolvedValue(CURRENT_FIXTURE);
    fetchForecast.mockResolvedValue(ONE_DAY_FORECAST_FIXTURE);
  });

  it('flips rendered temp strings on both CurrentWeatherCard and ForecastCards, keeps wind in m/s, and does not re-fetch', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox'), 'Abuja');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => expect(screen.getByText('30°C')).toBeInTheDocument());
    expect(screen.getByText('30°C / 20°C')).toBeInTheDocument();
    expect(screen.getByText('3.2 m/s')).toBeInTheDocument();

    const fetchCallsBeforeToggle =
      fetchCurrentWeather.mock.calls.length + fetchForecast.mock.calls.length;

    await user.click(
      screen.getByRole('button', { name: 'Switch to Fahrenheit' }),
    );

    expect(screen.getByText('86°F')).toBeInTheDocument();
    expect(screen.getByText('86°F / 68°F')).toBeInTheDocument();
    // Wind speed is not unit-aware — stays m/s regardless of toggle.
    expect(screen.getByText('3.2 m/s')).toBeInTheDocument();

    expect(
      fetchCurrentWeather.mock.calls.length + fetchForecast.mock.calls.length,
    ).toBe(fetchCallsBeforeToggle);
  });
});
