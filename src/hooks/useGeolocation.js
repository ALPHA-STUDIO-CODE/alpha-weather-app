import { useCallback, useEffect } from "react";

export function useGeolocation(search) {
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions) return undefined;

    let cancelled = false;
    try {
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
    } catch {
      // Defensive only — kept as cheap insurance, but the comment
      // that used to justify this (a "documented WebKit quirk" where
      // Safari synchronously throws instead of rejecting) didn't hold
      // up when actually checked: MDN/W3C both document an
      // unsupported permission name as a *promise rejection*
      // ("TypeError" via .catch(), same as every other browser),
      // never a synchronous throw — and the existing .catch() above
      // already handles that. Older Safari (pre-16, 2022) has no
      // navigator.permissions at all, which the top-level guard two
      // lines up already handles without ever reaching query().
      // Safari has had standard Permissions API support since
      // Safari 16 (now Baseline "Widely Available" per
      // web-platform-dx), so a real Step 38 BrowserStack run is
      // testing against a browser with normal, documented behavior
      // here — not the quirky one this try/catch was written for.
      // Left in rather than removed, since an unexpected synchronous
      // throw from *any* browser is still worth not crashing on, but
      // don't take this as confirmation of a real, targeted Safari
      // bug — it isn't one, as far as available documentation shows.
    }

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
