import { useCallback, useState } from "react";
import { getItem, setItem } from "../lib/storage.js";
import { addSearch } from "../lib/recentSearches.js";

const RECENT_KEY = "awr_recent_searches";

/**
 * Holds the recent-searches list — most-recent-first, capped at 5,
 * deduped case-insensitively on name+country, all via the already-
 * ported addSearch (Step 4) — and exposes record(entry) to add one.
 *
 * Lazy useState initializer reads `awr_recent_searches` from storage
 * before first paint, same pattern as Step 14's useUnit/useTheme.
 *
 * Deliberately scoped to *only* awr_recent_searches. v1's runSearch
 * wrote both RECENT_KEY and LAST_CITY_KEY in the same block
 * (script.js), but this phased build splits "smart initial load"
 * into Step 17, which will own `awr_last_city` on its own — not
 * reproducing v1's single combined write here.
 *
 * `entry` shape is { name, country, lat, lon } — the same fields
 * v1's runSearch pulled from a successful current-weather response
 * (data.name, data.sys?.country, data.coord?.lat/lon). Step 16 wires
 * record(entry) into the real search path; this hook doesn't care
 * where the entry comes from.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState(() => getItem(RECENT_KEY, []));

  const record = useCallback((entry) => {
    setRecents((current) => {
      const next = addSearch(current, entry);
      setItem(RECENT_KEY, next);
      return next;
    });
  }, []);

  return { recents, record };
}
