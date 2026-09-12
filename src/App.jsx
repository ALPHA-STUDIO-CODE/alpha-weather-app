import { useCallback, useEffect } from "react";
import SearchForm from "./components/SearchForm.jsx";
import CurrentWeatherCard from "./components/CurrentWeatherCard.jsx";
import ForecastCards from "./components/ForecastCards.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import UnitToggle from "./components/UnitToggle.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import RecentSearchChips from "./components/RecentSearchChips.jsx";
import FavoritesRow from "./components/FavoritesRow.jsx";
import { useWeather } from "./hooks/useWeather.js";
import { useUnit } from "./hooks/useUnit.js";
import { useTheme } from "./hooks/useTheme.js";
import { useRecentSearches } from "./hooks/useRecentSearches.js";
import { useFavorites } from "./hooks/useFavorites.js";
import { getItem, setItem } from "./lib/storage.js";

const LAST_CITY_KEY = "awr_last_city";
const DEFAULT_CITY = "Abuja";

function App() {
  const { data, forecast, loading, error, search } = useWeather();
  const { unit, toggleUnit } = useUnit();
  const { theme, toggleTheme } = useTheme();
  const { recents, record } = useRecentSearches();
  const { favorites, toggleFavorite, isFavorited, atCap } = useFavorites();

  // Ports v1's runSearch: after a successful search, build a recent-
  // search entry from the resolved current-weather response (same
  // fields v1 pulled — name, sys.country, coord.lat/lon), record it,
  // and remember the city as `awr_last_city` for next visit's smart
  // initial load (Step 17). A failed search (search() resolves
  // undefined) does neither, same as v1's `if (lastCurrentData)`
  // guard — both writes live in the same success block in v1, so
  // they stay together here too.
  const handleSearch = useCallback(
    async (location) => {
      const current = await search(location);
      if (current) {
        record({
          name: current.name,
          country: current.sys?.country ?? "",
          lat: current.coord?.lat,
          lon: current.coord?.lon,
        });
        setItem(LAST_CITY_KEY, current.name);
      }
    },
    [search, record],
  );

  // Smart initial load (Step 17): on mount, read `awr_last_city`
  // (defaulting to v1's DEFAULT_CITY, "Abuja", if absent) and run it
  // through the *same* handleSearch used by SearchForm's submit and
  // a chip's click — not a separate bespoke path. This is the
  // "3 callers, 1 entry point" proof the plan's definition of done
  // calls for.
  useEffect(() => {
    const initialCity = getItem(LAST_CITY_KEY, null) ?? DEFAULT_CITY;
    handleSearch(initialCity);
  }, [handleSearch]);

  // The favorites entry shape for whatever city is currently
  // displayed — same {name, country, lat, lon} fields pulled the
  // same way handleSearch already builds a recent-search entry.
  // null while there's no data yet, so the star toggle has nothing
  // to act on until a search has actually resolved.
  const currentEntry = data
    ? {
        name: data.name,
        country: data.sys?.country ?? "",
        lat: data.coord?.lat,
        lon: data.coord?.lon,
      }
    : null;

  return (
    <div id="app">
      <header className="site-header">
        <h1 className="site-header__title">Alpha Weather Report</h1>
        <div className="site-header__controls">
          <UnitToggle unit={unit} onToggle={toggleUnit} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>
      <main className="main">
        <section className="search-section" aria-label="City search">
          <SearchForm onSearch={handleSearch} />
          <FavoritesRow favorites={favorites} onSelect={handleSearch} />
          <RecentSearchChips recents={recents} onSelect={handleSearch} />
          <ErrorMessage error={error} />
        </section>
        <LoadingSpinner loading={loading} />
        <CurrentWeatherCard
          data={data}
          loading={loading}
          error={error}
          unit={unit}
          isFavorited={currentEntry ? isFavorited(currentEntry) : false}
          onToggleFavorite={currentEntry ? () => toggleFavorite(currentEntry) : undefined}
          atCap={atCap}
        />
        <ForecastCards forecast={forecast} unit={unit} />
      </main>
    </div>
  );
}

export default App;
