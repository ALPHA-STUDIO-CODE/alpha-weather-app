import styles from "./ErrorMessage.module.css";
import { getErrorMessage } from "../lib/errors.js";

/**
 * Renders useWeather's `error` state as inline copy via the ported
 * getErrorMessage(type) map (Step 4 — nothing new to write there).
 * role="alert" is ported straight from v1's markup.
 *
 * Renders nothing when there's no error. Deliberately doesn't touch
 * `data`/`forecast` — per useWeather's §5.4 rule, those stay rendered
 * alongside this message on failure; that's enforced in the hook,
 * not here, so this component only ever needs to care about `error`.
 *
 * `message` is a Step 26 addition: an optional direct string that
 * bypasses the `error.type` → copy lookup entirely, for callers with
 * their own fixed message that isn't a weather-fetch error at all
 * (the favorites-at-cap warning). Takes priority over `error` when
 * both are supplied, though callers should only ever pass one.
 */
function ErrorMessage({ error, message }) {
  const text = message ?? (error ? getErrorMessage(error.type) : null);
  if (!text) return null;

  return (
    <p className={styles.message} role="alert">
      {text}
    </p>
  );
}

export default ErrorMessage;
