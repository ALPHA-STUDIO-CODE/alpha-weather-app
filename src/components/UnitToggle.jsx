import styles from './UnitToggle.module.css';

/**
 * Pill button toggling between °C and °F. The visible label,
 * aria-pressed, and aria-label logic are ported directly from v1's
 * updateUnitToggleUI (script.js) — the displayed span always shows
 * the *current* unit, aria-pressed reflects whether Fahrenheit is
 * active, and aria-label describes the action the click performs.
 */
function UnitToggle({ unit, onToggle }) {
  const isFahrenheit = unit === 'F';

  return (
    <button
      type="button"
      className={styles.pill}
      aria-pressed={isFahrenheit}
      aria-label={isFahrenheit ? 'Switch to Celsius' : 'Switch to Fahrenheit'}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isFahrenheit ? '°F' : '°C'}</span>
    </button>
  );
}

export default UnitToggle;
