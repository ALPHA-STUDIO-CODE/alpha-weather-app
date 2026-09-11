import styles from "./Autocomplete.module.css";

/**
 * Presentational dropdown for geocode suggestions — ported from v1's
 * renderSuggestions (script.js). Purely rendering + mouse
 * interaction; keyboard navigation and open/dismissed state live in
 * SearchForm (which owns the input those keydown events fire on).
 *
 * Renders nothing when there are no suggestions, matching v1's
 * `autocompleteList.hidden = true` for an empty list.
 */
function Autocomplete({ suggestions, highlightedIndex, onHover, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className={styles.list} role="listbox">
      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion.name}|${suggestion.country}|${suggestion.lat}|${suggestion.lon}`}
          id={`suggestion-${index}`}
          role="option"
          aria-selected={index === highlightedIndex}
          className={
            index === highlightedIndex ? `${styles.item} ${styles.highlighted}` : styles.item
          }
          onMouseEnter={() => onHover(index)}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.name}, {suggestion.country}
        </li>
      ))}
    </ul>
  );
}

export default Autocomplete;
