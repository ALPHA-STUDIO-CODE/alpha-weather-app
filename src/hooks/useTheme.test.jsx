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
});
