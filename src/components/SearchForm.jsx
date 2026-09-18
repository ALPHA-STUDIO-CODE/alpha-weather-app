import { useEffect, useRef, useState } from "react";
import styles from "./SearchForm.module.css";
import Autocomplete from "./Autocomplete.jsx";
import { useAutocomplete } from "../hooks/useAutocomplete.js";

/**
 * Search form for looking up a city's weather, plus its geocode
 * autocomplete dropdown (Step 19). Ports v1's script.js keyboard/
 * mouse/outside-click behavior for the searchInput + autocompleteList
 * pair directly:
 *
 * - Ports v1's blank-submission rule: the input is trimmed, and a
 *   blank/whitespace-only submission is silently ignored rather than
 *   calling onSearch.
 * - `dismissed` mirrors v1's currentSuggestions being cleared by
 *   hideSuggestions() on Escape/outside-click — it resets to false on
 *   every keystroke (a fresh useAutocomplete(city) call), same as v1
 *   naturally re-showing suggestions the next time the debounced
 *   fetch resolves after a fresh keystroke.
 * - highlightedIndex resets to -1 whenever the suggestion list itself
 *   changes, matching v1's renderSuggestions resetting it at the top
 *   of every call.
 * - Enter only preventDefaults when a suggestion is highlighted
 *   (matching v1's `if (highlightedIndex >= 0)` guard) — with nothing
 *   highlighted, Enter falls through to the form's native submit,
 *   which is exactly the typed-search behavior we still want.
 *
 * `onLocationClick` (Step 28, spec §4.1) is optional so existing
 * callers/tests that only care about typed search don't need to
 * change: when provided, an always-visible location button renders
 * next to the search button. It's a plain type="button" so it can
 * never trigger the form's submit handler, and it takes no arguments
 * — App.jsx owns what "use my location" actually does (via
 * useGeolocation's requestLocation()) and any resulting error
 * message; this component only needs to render the button and relay
 * the click.
 */
function SearchForm({ onSearch, onLocationClick }) {
  const [city, setCity] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestions = useAutocomplete(city);
  const fieldRef = useRef(null);

  // Resets highlightedIndex whenever the suggestion list itself
  // changes — matching v1's renderSuggestions resetting it at the
  // top of every call. Adjusted during render (React's documented
  // pattern for "reset state when a prop changes") rather than via a
  // useEffect, since a synchronous setState inside an effect just
  // triggers an extra render for no benefit here.
  const [prevSuggestions, setPrevSuggestions] = useState(suggestions);
  if (suggestions !== prevSuggestions) {
    setPrevSuggestions(suggestions);
    setHighlightedIndex(-1);
  }

  // Ports v1's `document.addEventListener("click", ...)` outside-click
  // handler: dismiss the dropdown when a click lands outside the
  // field wrapper, without touching the typed query.
  useEffect(() => {
    function handleDocumentClick(event) {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setDismissed(true);
      }
    }
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const isDropdownOpen = !dismissed && suggestions.length > 0;

  function handleChange(event) {
    setCity(event.target.value);
    setDismissed(false);
  }

  function selectSuggestion(suggestion) {
    setCity(`${suggestion.name}, ${suggestion.country}`);
    setDismissed(true);
    onSearch({ lat: suggestion.lat, lon: suggestion.lon });
  }

  function handleKeyDown(event) {
    if (!isDropdownOpen) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((index) => (index + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          event.preventDefault();
          selectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setDismissed(true);
        break;
      default:
        break;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form className={`search-form ${styles.form}`} autoComplete="off" onSubmit={handleSubmit}>
      <div className={`search-form__field ${styles.field}`} ref={fieldRef}>
        <label htmlFor="search-input" className="visually-hidden">
          Search for a city
        </label>
        <input
          id="search-input"
          type="text"
          name="city"
          placeholder="Search for a city…"
          className={`search-form__input ${styles.input}`}
          value={city}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-activedescendant={
            isDropdownOpen && highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
        />
        {isDropdownOpen && (
          <Autocomplete
            suggestions={suggestions}
            highlightedIndex={highlightedIndex}
            onHover={setHighlightedIndex}
            onSelect={selectSuggestion}
          />
        )}
      </div>
      <button type="submit" className={`search-form__button ${styles.button}`}>
        Search
      </button>
      {onLocationClick && (
        <button
          type="button"
          className={`search-form__location ${styles.locationButton}`}
          aria-label="Use my location"
          onClick={onLocationClick}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
        </button>
      )}
    </form>
  );
}

export default SearchForm;
