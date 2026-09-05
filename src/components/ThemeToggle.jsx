import styles from './ToggleButton.module.css';

/**
 * Pill button toggling light/dark mode. Icon, aria-pressed, and
 * aria-label logic are ported directly from v1's updateThemeToggleUI
 * (script.js) — the moon (☾) means "click to go dark", the sun (☀)
 * means "click to go light", i.e. the icon always shows the action,
 * not the current state.
 */
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.pill}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  );
}

export default ThemeToggle;
