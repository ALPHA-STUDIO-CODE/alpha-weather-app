import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites.js';

function city(name, country = 'XX') {
  return { name, country };
}

describe('useFavorites', () => {
  it('starts empty, nothing favorited, not at cap', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorited(city('Abuja', 'NG'))).toBe(false);
    expect(result.current.atCap).toBe(false);
  });

  it('toggling an unfavorited city adds it newest-first', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(city('Abuja', 'NG'));
    });
    act(() => {
      result.current.toggleFavorite(city('London', 'GB'));
    });

    expect(result.current.favorites).toEqual([
      city('London', 'GB'),
      city('Abuja', 'NG'),
    ]);
    expect(result.current.isFavorited(city('Abuja', 'NG'))).toBe(true);
    expect(result.current.isFavorited(city('London', 'GB'))).toBe(true);
  });

  it('toggling an already-favorited city removes it', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(city('Abuja', 'NG'));
    });
    expect(result.current.isFavorited(city('Abuja', 'NG'))).toBe(true);

    act(() => {
      result.current.toggleFavorite(city('Abuja', 'NG'));
    });

    expect(result.current.isFavorited(city('Abuja', 'NG'))).toBe(false);
    expect(result.current.favorites).toEqual([]);
  });

  it('toggling an 11th distinct city at cap is a no-op and surfaces atCap', () => {
    const { result } = renderHook(() => useFavorites());

    for (let i = 0; i < 10; i += 1) {
      act(() => {
        result.current.toggleFavorite(city(`City${i}`));
      });
    }
    expect(result.current.favorites).toHaveLength(10);
    expect(result.current.atCap).toBe(false);

    act(() => {
      result.current.toggleFavorite(city('Overflow'));
    });

    expect(result.current.favorites).toHaveLength(10);
    expect(
      result.current.favorites.some((entry) => entry.name === 'Overflow'),
    ).toBe(false);
    expect(result.current.atCap).toBe(true);
  });

  it('atCap clears once the user unfavorites something to make room', () => {
    const { result } = renderHook(() => useFavorites());

    for (let i = 0; i < 10; i += 1) {
      act(() => {
        result.current.toggleFavorite(city(`City${i}`));
      });
    }
    act(() => {
      result.current.toggleFavorite(city('Overflow'));
    });
    expect(result.current.atCap).toBe(true);

    act(() => {
      result.current.toggleFavorite(city('City0'));
    });

    expect(result.current.atCap).toBe(false);
    expect(result.current.favorites).toHaveLength(9);
  });

  it('reads a pre-existing favorites list from storage on mount', () => {
    localStorage.setItem(
      'awr_favorites',
      JSON.stringify([city('Lagos', 'NG')]),
    );
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([city('Lagos', 'NG')]);
    expect(result.current.isFavorited(city('Lagos', 'NG'))).toBe(true);
  });

  it('writes to storage on toggle, and a remount picks up the persisted list', () => {
    const first = renderHook(() => useFavorites());
    act(() => {
      first.result.current.toggleFavorite(city('Abuja', 'NG'));
    });
    expect(JSON.parse(localStorage.getItem('awr_favorites'))).toEqual([
      city('Abuja', 'NG'),
    ]);

    // Simulate a fresh page load: a brand-new hook instance, no state
    // carried over except what's in storage.
    const second = renderHook(() => useFavorites());
    expect(second.result.current.favorites).toEqual([city('Abuja', 'NG')]);
  });
});
