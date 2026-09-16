// Same dedup-key convention as recentSearches.js (Step 4) — case-
// insensitive on name+country — for consistency, since both modules
// work with the same {name, country, lat, lon} entry shape. Spec
// §4.3 doesn't call this out explicitly, but there's no reason
// favorites should treat "Abuja"/"abuja" as different cities when
// recent searches already don't.
function favoriteKey(entry) {
  return `${entry.name}|${entry.country}`.toLowerCase();
}

export function isFavorite(list, entry) {
  const key = favoriteKey(entry);
  return list.some((existing) => favoriteKey(existing) === key);
}

/**
 * Adds entry to the front of list (newest-favorited-first, spec
 * §4.3). Two cases where nothing happens — the exact same list
 * reference is returned unchanged, not a modified copy:
 *
 * - entry is already favorited: a no-op, not a "move to front."
 *   Unlike recentSearches' addSearch (passive, automatic tracking),
 *   favorites are deliberate choices — re-clicking an already-filled
 *   star isn't a new action to react to.
 * - list is already at `max`: blocked, no auto-eviction. Spec §4.3
 *   is explicit that silently deleting a favorite to make room for
 *   a new one is unacceptable data loss, unlike recent searches
 *   (addSearch) which evicts the oldest entry without complaint.
 *
 * Callers (Step 25's useFavorites) can tell whether the add
 * succeeded by comparing the returned list's identity/length against
 * what was passed in, and surface a "Favorites full" message when it
 * didn't change because of the cap.
 */
export function addFavorite(list, entry, max = 10) {
  if (isFavorite(list, entry)) {
    return list;
  }
  if (list.length >= max) {
    return list;
  }
  return [entry, ...list];
}

export function removeFavorite(list, entry) {
  const key = favoriteKey(entry);
  return list.filter((existing) => favoriteKey(existing) !== key);
}
