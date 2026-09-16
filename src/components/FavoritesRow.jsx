import styles from "./FavoritesRow.module.css";

/**
 * Small solid star glyph prefixing each entry — reinforces "this is
 * a favorites list" visually, distinct from RecentSearchChips having
 * no icon at all. Same hand-built-SVG convention as SunriseSunset
 * (Step 23) and CurrentWeatherCard's star toggle (this step).
 */
function StarGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.9l6-.9 2.6-5.4Z" />
    </svg>
  );
}

/**
 * Renders one button per favorited city, labeled "City, Country"
 * with a leading star glyph. Deliberately styled distinct from
 * RecentSearchChips (accent-outlined, control-radius, star icon)
 * rather than reusing that component's neutral pill look — these are
 * two different concepts (deliberate favorites vs. automatic recent-
 * search history) and shouldn't be visually interchangeable.
 *
 * Clicking an entry calls onSelect(entry.name) — a city-name string,
 * matching RecentSearchChips' own convention (not the entry's
 * {lat, lon}) — App.jsx wires onSelect to the same shared
 * search()/handleSearch used everywhere else.
 *
 * Renders nothing when there are no favorites.
 */
function FavoritesRow({ favorites, onSelect }) {
  if (!favorites || favorites.length === 0) return null;

  return (
    <div className={styles.row} aria-label="Favorite cities">
      {favorites.map((entry) => (
        <button
          key={`${entry.name}|${entry.country}`.toLowerCase()}
          type="button"
          className={styles.item}
          onClick={() => onSelect(entry.name)}
        >
          <StarGlyph className={styles.icon} />
          {entry.name}, {entry.country}
        </button>
      ))}
    </div>
  );
}

export default FavoritesRow;
