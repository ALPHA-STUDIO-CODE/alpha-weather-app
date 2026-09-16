import { useCallback, useEffect, useState } from "react";
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
import { useGeolocation } from "./hooks/useGeolocation.js";
import { getItem, setItem } from "./lib/storage.js";

const LAST_CITY_KEY = "awr_last_city";
const DEFAULT_CITY = "Abuja";

function App() {
  const { data, forecast, loading, error, search } = useWeather();
  const { unit, toggleUnit } = useUnit();
  const { theme, toggleTheme } = useTheme();
  const { recents, record } = useRecentSearches();
  const { favorites, toggleFavorite, isFavorited, atCap, clearAtCap } = useFavorites();
  const [locationError, setLocationError] = useState(null);

  // Ports v1's runSearch: after a successful search, build a recent-
  // search entry from the resolved current-weather response (same
  // fields v1 pulled — name, sys.country, coord.lat/lon), record it,
  // and remember the city as `awr_last_city` for next visit's smart
  // initial load (Step 17). A failed search (search() resolves
  // undefined) does neither, same as v1's `if (lastCurrentData)`
  // guard — both writes live in the same success block in v1, so
  // they stay together here too.
  //
  // Also clears any stale `atCap` favorites warning here: search bar
  // submit, a favorites-row click, and a recent chip click all funnel
  // through this same function, so fixing it once here dismisses the
  // "Favorites full" message on a new search regardless of which of
  // the three triggered it — matching what a user actually expects
  // ("I searched somewhere else, why is that old warning still up?").
  //
  // Step 28 adds two more callers (useGeolocation's mount-time
  // auto-search when permission was already granted, and the manual
  // location button below) — both funnel through this same
  // handleSearch rather than calling the raw `search` from
  // useWeather directly, so a successful geolocation-triggered search
  // records a recent entry and updates `awr_last_city` exactly like
  // every other search, and also clears any stale "couldn't get your
  // location" message.
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
        clearAtCap();
        setLocationError(null);
      }
    },
    [search, record, clearAtCap],
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

  // Geolocation (Step 28, spec §4.1). useGeolocation is wired to
  // handleSearch above, not the raw `search` from useWeather — see
  // that function's comment for why. No coordination code is needed
  // against the Step 17 effect above, and Step 17's code is
  // untouched: that effect calls handleSearch(initialCity)
  // synchronously on mount, while useGeolocation's permission check
  // is async (permissions.query() then getCurrentPosition()), so it
  // only ever resolves *after* Step 17's initial search has already
  // started. When permission was already granted, the geolocation
  // search finishes second and its successful result simply becomes
  // the latest setData() call — overwriting the initial load with
  // current-location weather, silently, per spec. When permission
  // isn't granted, useGeolocation's mount effect never calls
  // handleSearch at all, so Step 17's result is the only one and
  // stands unchanged.
  const { requestLocation } = useGeolocation(handleSearch);

  // Manual path for the always-visible location button (Step 28). A
  // rejected requestLocation() (denied/timeout/unsupported browser)
  // never touches `data`/`forecast` — nothing was fetched — so the
  // currently-displayed weather is left exactly as-is; this only
  // surfaces the inline fallback message, per spec §4.1's exact copy
  // pattern and the "never blank the display on error" rule already
  // proven in Phase E.
  const handleLocationClick = useCallback(() => {
    setLocationError(null);
    requestLocation().catch(() => {
      setLocationError(
        `Couldn't get your location. Showing ${data?.name ?? DEFAULT_CITY} instead.`,
      );
    });
  }, [requestLocation, data]);

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
          <SearchForm onSearch={handleSearch} onLocationClick={handleLocationClick} />
          <FavoritesRow favorites={favorites} onSelect={handleSearch} />
          <RecentSearchChips recents={recents} onSelect={handleSearch} />
          <ErrorMessage error={error} />
          <ErrorMessage message={locationError} />
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
