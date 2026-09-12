import { useCallback, useState } from "react";
import { getItem, setItem } from "../lib/storage.js";
import { addFavorite, removeFavorite, isFavorite } from "../lib/favorites.js";

const FAVORITES_KEY = "awr_favorites";
const MAX_FAVORITES = 10;

/**
 * Holds the favorites list — same lazy-init-from-storage pattern as
 * Step 14's useUnit/useTheme and Step 15's useRecentSearches — and
 * exposes toggleFavorite(entry) + isFavorited(entry).
 *
 * toggleFavorite is a single entry point covering both directions:
 * favoriting an unfavorited city, and unfavoriting an already-
 * favorited one (Step 26's star click does the same thing regardless
 * of current state, so the hook shouldn't force the caller to check
 * isFavorited first just to know which function to call).
 *
 * `atCap` surfaces the one case toggleFavorite can't silently
 * succeed at: attempting to favorite an 11th distinct city while
 * already at the 10-item cap. Per favorites.js's own contract
 * (Step 24), that's a no-op that returns the list unchanged — this
 * hook additionally sets `atCap` so Step 26 can show the "Favorites
 * full (10/10)" message via the existing ErrorMessage component.
 * `atCap` clears on the next toggle that isn't itself blocked by the
 * cap (unfavoriting always clears it, since that's precisely how a
 * user would make room).
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => getItem(FAVORITES_KEY, []));
  const [atCap, setAtCap] = useState(false);

  const isFavorited = useCallback((entry) => isFavorite(favorites, entry), [favorites]);

  const toggleFavorite = useCallback((entry) => {
    setFavorites((current) => {
      if (isFavorite(current, entry)) {
        setAtCap(false);
        const next = removeFavorite(current, entry);
        setItem(FAVORITES_KEY, next);
        return next;
      }
      if (current.length >= MAX_FAVORITES) {
        setAtCap(true);
        return current;
      }
      setAtCap(false);
      const next = addFavorite(current, entry, MAX_FAVORITES);
      setItem(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite, isFavorited, atCap };
}
