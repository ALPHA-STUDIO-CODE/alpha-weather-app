import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnit } from './useUnit.js';

describe('useUnit', () => {
  it('starts at C', () => {
    const { result } = renderHook(() => useUnit());
    expect(result.current.unit).toBe('C');
  });

  it('toggleUnit flips C -> F -> C', () => {
    const { result } = renderHook(() => useUnit());

    act(() => {
      result.current.toggleUnit();
    });
    expect(result.current.unit).toBe('F');

    act(() => {
      result.current.toggleUnit();
    });
    expect(result.current.unit).toBe('C');
  });

  it('reads a pre-existing awr_unit value from storage on mount', () => {
    localStorage.setItem('awr_unit', 'F');
    const { result } = renderHook(() => useUnit());
    expect(result.current.unit).toBe('F');
  });

  it('writes to storage on toggle, and a remount picks up the persisted value', () => {
    const first = renderHook(() => useUnit());
    act(() => {
      first.result.current.toggleUnit();
    });
    expect(localStorage.getItem('awr_unit')).toBe('F');

    // Simulate a fresh page load: a brand-new hook instance, no state
    // carried over except what's in storage.
    const second = renderHook(() => useUnit());
    expect(second.result.current.unit).toBe('F');
  });
});
