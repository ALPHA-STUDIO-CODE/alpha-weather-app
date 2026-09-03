import styles from './LoadingSpinner.module.css';

/**
 * Visible only while a search is in flight. Driven by useWeather's
 * combined current+forecast `loading` state (Steps 6/8 — a single
 * flag covers both, since they're fetched together via Promise.all).
 *
 * role="status" + aria-live="polite" and the visually-hidden text are
 * ported straight from v1's spinner markup — screen readers announce
 * "Loading weather…" without a layout-affecting visible label.
 */
function LoadingSpinner({ loading }) {
  if (!loading) return null;

  return (
    <div className={styles.spinner} role="status" aria-live="polite">
      <span className="visually-hidden">Loading weather…</span>
    </div>
  );
}

export default LoadingSpinner;
