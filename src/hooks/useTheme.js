import { useCallback, useEffect, useState } from 'react';
import { getItem, setItem } from '../lib/storage.js';

const THEME_KEY = 'awr_theme';

/**
 * Holds theme state ('light' | 'dark') and a toggleTheme() to flip
 * it. Applies the theme to document.body as a side effect — ported
 * from v1's updateThemeToggleUI (document.body.classList.toggle(
 * 'dark-mode', isDark)) — since the CSS variable overrides this
 * drives live under a `body.dark-mode` selector, ported into
 * index.css back in Step 5.
 *
 * The effect runs on mount as well as on toggle, matching v1's own
 * behavior: script.js calls updateThemeToggleUI() once at initial
 * load (applying whatever theme was already current) in addition to
 * on every click, rather than only reacting to the click itself.
 *
 * Persists via ported storage.js (Step 14): a lazy useState
 * initializer reads `awr_theme` before first paint, and every toggle
 * writes the new value back — matching v1's themeToggle click
 * handler, which called setItem(THEME_KEY, currentTheme) in the same
 * function as the state flip.
 *
 * Per spec §4.5, this toggle currently controls the *entire* theme.
 * Its scope narrows to "card/text contrast only" once Phase P
 * (animated backgrounds) lands — built for full parity now, and
 * revisited (not rewritten) then. Flagged here so that narrowing
 * isn't a surprise later.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => getItem(THEME_KEY, 'light'));

  useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
