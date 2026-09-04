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
});
