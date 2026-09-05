import { useCallback, useEffect, useState } from 'react';

/**
 * Holds theme state ('light' | 'dark') and toggleTheme() to flip it.
 *
 * Applies `dark-mode` to the real `document.body` via a useEffect
 * side effect, rather than a className on this app's own root — the
 * dark-theme CSS variables ported in Step 5 target `body.dark-mode`
 * directly (see src/index.css), matching v1's own
 * `document.body.classList.toggle` approach rather than introducing
 * a parallel selector scheme just because this is now React.
 *
 * Deliberately holds no persistence yet — same as useUnit (Step 12);
 * both land together in Step 14 via ported storage.js.
 *
 * Per spec §4.5, this toggle currently controls the *entire* theme.
 * Its scope narrows to "card/text contrast only" once Phase P
 * (animated backgrounds) lands — built for full parity now, and
 * revisited (not rewritten) then. Flagged here so that narrowing
 * isn't a surprise later.
 */
export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
