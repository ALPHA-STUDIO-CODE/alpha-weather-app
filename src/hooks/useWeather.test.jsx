import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from './useWeather.js';
import { WeatherApiError } from '../apiClient.js';

vi.mock('../apiClient.js', async () => {
  const actual = await vi.importActual('../apiClient.js');
  return {
    ...actual,
    fetchCurrentWeather: vi.fn(),
    fetchForecast: vi.fn(),
  };
});

import { fetchCurrentWeather, fetchForecast } from '../apiClient.js';

// Same fixture-building convention as src/lib/forecast.test.js, reused
// here since this suite is checking the *wiring* between useWeather
// and groupByDay/dailySummary, not re-testing forecast.js's own logic.
function entry(dt, temp, icon, description) {
  return { dt, main: { temp }, weather: [{ icon, description }] };
}

const CURRENT_FIXTURE = { name: 'Abuja', main: { temp: 30 } };

const day1 = [
  entry(1704067200, 10, 'a0', 'cond0'),
  entry(1704078000, 12, 'a1', 'cond1'),
  entry(1704088800, 15, 'a2', 'cond2'),
  entry(1704099600, 20, 'a3', 'cond3'),
  entry(1704110400, 25, 'a4', 'cond4'),
  entry(1704121200, 22, 'a5', 'cond5'),
  entry(1704132000, 18, 'a6', 'cond6'),
  entry(1704142800, 14, 'a7', 'cond7'),
];
const day2 = [
  entry(1704153600, 5, 'b0', 'cond0b'),
  entry(1704164400, 8, 'b1', 'cond1b'),
  entry(1704175200, 9, 'b2', 'cond2b'),
  entry(1704186000, 30, 'b3', 'cond3b'),
  entry(1704196800, 28, 'b4', 'cond4b'),
  entry(1704207600, 20, 'b5', 'cond5b'),
  entry(1704218400, 15, 'b6', 'cond6b'),
  entry(1704229200, 7, 'b7', 'cond7b'),
];
const TWO_DAY_FORECAST_FIXTURE = {
  city: { timezone: 3600 },
  list: [...day1, ...day2],
};

describe('useWeather', () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
    fetchForecast.mockReset();
  });

  it('starts with no data, no forecast, not loading, no error', () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.data).toBeNull();
    expect(result.current.forecast).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('search() transitions loading -> data + forecast on success', async () => {
    let resolveCurrent;
    let resolveForecast;
    fetchCurrentWeather.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCurrent = resolve;
        }),
    );
    fetchForecast.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveForecast = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('Abuja');
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveCurrent(CURRENT_FIXTURE);
      resolveForecast(TWO_DAY_FORECAST_FIXTURE);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(CURRENT_FIXTURE);
    expect(result.current.forecast).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('derives one daily summary per distinct day, with correct min/max/icon/condition (integration check on the wiring)', async () => {
    fetchCurrentWeather.mockResolvedValue(CURRENT_FIXTURE);
    fetchForecast.mockResolvedValue(TWO_DAY_FORECAST_FIXTURE);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Abuja');
    });

    expect(result.current.forecast).toHaveLength(2);
    expect(result.current.forecast[0]).toMatchObject({
      min: 10,
      max: 25,
      icon: 'a4',
      condition: 'cond4',
    });
    expect(result.current.forecast[1]).toMatchObject({
      min: 5,
      max: 30,
      icon: 'b4',
      condition: 'cond4b',
    });
  });

  it('caps the forecast at 5 days when the response spans more (boundary parity with v1)', async () => {
    const start = 1704074400;
    // 56 three-hour entries = 7 days worth, well past the 5-day cap.
    const entries = Array.from({ length: 56 }, (_, i) =>
      entry(start + i * 10800, 15 + (i % 5), 'x', 'cond'),
    );
    fetchCurrentWeather.mockResolvedValue(CURRENT_FIXTURE);
    fetchForecast.mockResolvedValue({
      city: { timezone: 0 },
      list: entries,
    });
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Abuja');
    });

    expect(result.current.forecast.length).toBeLessThanOrEqual(5);
  });

  it('search() transitions loading -> error on a thrown WeatherApiError, surfaced unchanged', async () => {
    const apiError = new WeatherApiError('City not found', 'not_found');
    fetchCurrentWeather.mockRejectedValue(apiError);
    fetchForecast.mockResolvedValue(TWO_DAY_FORECAST_FIXTURE);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Xyzzzzz');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(apiError);
    expect(result.current.error.type).toBe('not_found');
  });

  it('does not clear existing data/forecast when a later search fails (v1 parity: display left untouched on error)', async () => {
    fetchCurrentWeather.mockResolvedValueOnce(CURRENT_FIXTURE);
    fetchForecast.mockResolvedValueOnce(TWO_DAY_FORECAST_FIXTURE);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Abuja');
    });
    expect(result.current.data).toEqual(CURRENT_FIXTURE);
    expect(result.current.forecast).toHaveLength(2);

    const apiError = new WeatherApiError('Something went wrong', 'generic');
    fetchCurrentWeather.mockRejectedValueOnce(apiError);
    fetchForecast.mockResolvedValueOnce(TWO_DAY_FORECAST_FIXTURE);

    await act(async () => {
      await result.current.search('Xyzzzzz');
    });

    expect(result.current.data).toEqual(CURRENT_FIXTURE);
    expect(result.current.forecast).toHaveLength(2);
    expect(result.current.error).toBe(apiError);
  });
});
