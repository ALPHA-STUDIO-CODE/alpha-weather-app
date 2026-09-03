import { useState } from "react";
import styles from "./SearchForm.module.css";

/**
 * Search form for looking up a city's weather.
 *
 * Ports v1's blank-submission rule (see script.js's `searchForm`
 * submit listener): the input is trimmed, and a blank/whitespace-only
 * submission is silently ignored rather than calling onSearch.
 */
function SearchForm({ onSearch }) {
  const [city, setCity] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form className="search-form" autoComplete="off" onSubmit={handleSubmit}>
      <div className="search-form__field">
        <label htmlFor="search-input" className="visually-hidden">
          Search for a city
        </label>
        <input
          id="search-input"
          type="text"
          name="city"
          placeholder="Search for a city…"
          className="search-form__input"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </div>
      <button type="submit" className={`search-form__button ${styles.button}`}>
        Search
      </button>
    </form>
  );
}

export default SearchForm;
