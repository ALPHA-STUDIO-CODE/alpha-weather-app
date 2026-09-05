import { useCallback, useState } from 'react';
import { getItem, setItem } from '../lib/storage.js';

const UNIT_KEY = 'awr_unit';

/**
 * Holds unit state ('C' | 'F') and a toggleUnit() to flip it.
 *
 * No re-fetch on toggle — formatTemp (ported in Step 4, already
 * unit-aware) converts client-side from the same raw Celsius data
 * already in hand, matching v1's rule (script.js's unitToggle click
 * handler never re-fetches, just re-renders from lastCurrentData/
 * lastForecastData).
 *
 * Persists via ported storage.js (Step 14): a lazy useState
 * initializer reads `awr_unit` before first paint (so there's no
 * flash of the wrong unit), and every toggle writes the new value
 * back — matching v1's unitToggle click handler, which called
 * setItem(UNIT_KEY, currentUnit) in the same function as the state
 * flip. getItem's built-in fallback (see storage.js/Step 4) means a
 * blocked or empty localStorage silently defaults to 'C', same as a
 * fresh v1 install.
 */
export function useUnit() {
  const [unit, setUnit] = useState(() => getItem(UNIT_KEY, 'C'));

  const toggleUnit = useCallback(() => {
    setUnit((current) => {
      const next = current === 'C' ? 'F' : 'C';
      setItem(UNIT_KEY, next);
      return next;
    });
  }, []);

  return { unit, toggleUnit };
}
