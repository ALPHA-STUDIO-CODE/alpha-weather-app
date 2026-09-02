import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from './useWeather.js';
import { WeatherApiError } from '../apiClient.js';

vi.mock('../apiClient.js', async () => {
  const actual = await vi.importActual('../apiClient.js');
  return {
    ...actual,
    fetchCurrentWeather: vi.fn(),
  };
});

import { fetchCurrentWeather } from '../apiClient.js';

describe('useWeather', () => {
  beforeEach(() => {
    fetchCurrentWeather.mockReset();
  });

  it('starts with no data, not loading, no error', () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('search() transitions loading -> data on success', async () => {
    const fixture = { name: 'Abuja', main: { temp: 30 } };
    let resolveFetch;
    fetchCurrentWeather.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('Abuja');
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch(fixture);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(fixture);
    expect(result.current.error).toBeNull();
  });

  it('search() transitions loading -> error on a thrown WeatherApiError, surfaced unchanged', async () => {
    const apiError = new WeatherApiError('City not found', 'not_found');
    let rejectFetch;
    fetchCurrentWeather.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        }),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('Xyzzzzz');
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      rejectFetch(apiError);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(apiError);
    expect(result.current.error.type).toBe('not_found');
  });

  it('does not clear existing data when a later search fails (v1 parity: display left untouched on error)', async () => {
    const fixture = { name: 'Abuja', main: { temp: 30 } };
    fetchCurrentWeather.mockResolvedValueOnce(fixture);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Abuja');
    });
    expect(result.current.data).toEqual(fixture);

    const apiError = new WeatherApiError('Something went wrong', 'generic');
    fetchCurrentWeather.mockRejectedValueOnce(apiError);

    await act(async () => {
      await result.current.search('Xyzzzzz');
    });

    expect(result.current.data).toEqual(fixture);
    expect(result.current.error).toBe(apiError);
  });
});
