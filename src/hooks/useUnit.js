import { useCallback, useState } from 'react';

/**
 * Holds unit state only ('C' | 'F') and a toggleUnit() to flip it.
 *
 * No re-fetch on toggle — formatTemp (ported in Step 4, already
 * unit-aware) converts client-side from the same raw Celsius data
 * already in hand, matching v1's rule (script.js's unitToggle click
 * handler never re-fetches, just re-renders from lastCurrentData/
 * lastForecastData).
 *
 * Deliberately holds no persistence yet. v1's click handler wrote to
 * localStorage in the same function as the toggle; this phased build
 * splits that into Step 14 (ported storage.js wiring for unit +
 * theme together) rather than reproducing v1's single combined step.
 */
export function useUnit() {
  const [unit, setUnit] = useState('C');

  const toggleUnit = useCallback(() => {
    setUnit((current) => (current === 'C' ? 'F' : 'C'));
  }, []);

  return { unit, toggleUnit };
}
