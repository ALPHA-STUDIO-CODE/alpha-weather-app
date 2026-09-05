import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme.js';

// document.body isn't part of RTL's per-test render container, so it
// survives across tests in this file unless reset explicitly.
afterEach(() => {
  document.body.classList.remove('dark-mode');
});

describe('useTheme', () => {
  it('starts at light, with no dark-mode class on body', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  it('toggleTheme flips light -> dark -> light, syncing body.dark-mode', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  it('reads a pre-existing awr_theme value from storage on mount', () => {
    localStorage.setItem('awr_theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  it('writes to storage on toggle, and a remount picks up the persisted value', () => {
    const first = renderHook(() => useTheme());
    act(() => {
      first.result.current.toggleTheme();
    });
    expect(localStorage.getItem('awr_theme')).toBe('dark');

    // Simulate a fresh page load: a brand-new hook instance, no state
    // carried over except what's in storage.
    const second = renderHook(() => useTheme());
    expect(second.result.current.theme).toBe('dark');
  });
});
