import styles from './ErrorMessage.module.css';
import { getErrorMessage } from '../lib/errors.js';

/**
 * Renders useWeather's `error` state as inline copy via the ported
 * getErrorMessage(type) map (Step 4 — nothing new to write there).
 * role="alert" is ported straight from v1's markup.
 *
 * Renders nothing when there's no error. Deliberately doesn't touch
 * `data`/`forecast` — per useWeather's §5.4 rule, those stay rendered
 * alongside this message on failure; that's enforced in the hook,
 * not here, so this component only ever needs to care about `error`.
 */
function ErrorMessage({ error }) {
  if (!error) return null;

  return (
    <p className={styles.message} role="alert">
      {getErrorMessage(error.type)}
    </p>
  );
}

export default ErrorMessage;
