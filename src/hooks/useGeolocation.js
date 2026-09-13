import { useCallback, useEffect } from "react";

/**
 * Wires the browser's Geolocation + Permissions APIs into the same
 * shared search() every other entry point uses (spec §4.1's "no
 * parallel code path" requirement) — feeding {lat, lon} straight
 * into fetchCurrentWeather/fetchForecast, exactly like a clicked
 * autocomplete suggestion already does.
 *
 * On mount: checks navigator.permissions.query({name: 'geolocation'}).
 * Only a *previously granted* permission triggers an automatic,
 * silent getCurrentPosition() → search() call. 'prompt' or 'denied'
 * do nothing here — Phase G's existing load order (Step 17's smart
 * initial load: awr_last_city, else Abuja) is left completely
 * untouched by this hook, not modified or bypassed. Coordinating the
 * two so only one of them actually runs on a given page load is Step
 * 28's job in App.jsx, not this hook's — this hook doesn't know Step
 * 17's effect exists at all.
 *
 * A browser that doesn't support geolocation, or whose Permissions
 * API query() rejects (e.g. no support for querying 'geolocation'
 * specifically), is treated the same as prompt/denied: do nothing
 * automatically, fall through silently.
 *
 * requestLocation() is the always-available manual path (Step 28's
 * location button): it ignores prior permission state entirely and
 * calls getCurrentPosition() unconditionally, which is exactly what
 * shows the browser's native permission prompt if the user hasn't
 * decided yet. Returns a Promise so callers can react to failure
 * (denied/timeout/unsupported) without this hook owning any UI or
 * error-message concerns itself — that's Step 28's ErrorMessage
 * wiring, layered on top of this hook, not inside it.
 */
export function useGeolocation(search) {
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions) return undefined;

    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled || status.state !== "granted") return;
        navigator.geolocation.getCurrentPosition((position) => {
          if (cancelled) return;
          search({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        });
      })
      .catch(() => {
        // Unsupported/rejected permission query — same as prompt/
        // denied, do nothing automatically.
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          search({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          resolve();
        },
        (error) => {
          reject(error);
        },
      );
    });
  }, [search]);

  return { requestLocation };
}
