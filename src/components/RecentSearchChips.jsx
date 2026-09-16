import styles from "./RecentSearchChips.module.css";

/**
 * Renders one chip per recent-search entry ("City, Country"),
 * ported from v1's renderRecentChips. Renders nothing when the list
 * is empty, matching v1's `recentChipsContainer.hidden = true`.
 *
 * Clicking a chip calls onSelect(entry.name) — a city-name string,
 * same as v1's chip click handler (`runSearch(entry.name)`), not the
 * entry's {lat, lon}. App.jsx wires onSelect to the same search()
 * used by SearchForm's submit (Step 6), per this step's requirement.
 *
 * Known, deliberate gap vs. v1: v1's chip click also wrote the
 * clicked city's name into the search input
 * (`searchInput.value = entry.name`). Reproducing that here would
 * mean lifting SearchForm's input state up into App.jsx, which this
 * step doesn't ask for — SearchForm's own internal state (Step 5)
 * stays untouched by a chip click for now.
 */
function RecentSearchChips({ recents, onSelect }) {
  if (!recents || recents.length === 0) return null;

  return (
    <div className={styles.chips}>
      {recents.map((entry) => (
        <button
          key={`${entry.name}|${entry.country}`.toLowerCase()}
          type="button"
          className={styles.chip}
          onClick={() => onSelect(entry.name)}
        >
          {entry.name}, {entry.country}
        </button>
      ))}
    </div>
  );
}

export default RecentSearchChips;
