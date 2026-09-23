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
import WeatherBackground from "./components/WeatherBackground.jsx";
import { useWeather } from "./hooks/useWeather.js";
import { useUnit } from "./hooks/useUnit.js";
import { useTheme } from "./hooks/useTheme.js";
import { useRecentSearches } from "./hooks/useRecentSearches.js";
import { useFavorites } from "./hooks/useFavorites.js";
import { useGeolocation } from "./hooks/useGeolocation.js";
import { getItem, setItem } from "./lib/storage.js";
import { backgroundVariantFor } from "./lib/backgroundCondition.js";

const LAST_CITY_KEY = "awr_last_city";
const DEFAULT_CITY = "Abuja";

function App() {
  const { data, forecast, loading, error, search } = useWeather();
  const { unit, toggleUnit } = useUnit();
  const { theme, toggleTheme } = useTheme();
  const { recents, record } = useRecentSearches();
  const { favorites, toggleFavorite, isFavorited, atCap, clearAtCap } = useFavorites();
  const [locationError, setLocationError] = useState(null);

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

  useEffect(() => {
    const initialCity = getItem(LAST_CITY_KEY, null) ?? DEFAULT_CITY;
    handleSearch(initialCity);
  }, [handleSearch]);

  const { requestLocation } = useGeolocation(handleSearch);

  const handleLocationClick = useCallback(() => {
    setLocationError(null);
    requestLocation().catch(() => {
      setLocationError(
        `Couldn't get your location. Showing ${data?.name ?? DEFAULT_CITY} instead.`,
      );
    });
  }, [requestLocation, data]);

  const currentEntry = data
    ? {
        name: data.name,
        country: data.sys?.country ?? "",
        lat: data.coord?.lat,
        lon: data.coord?.lon,
      }
    : null;

  const backgroundVariant =
    data?.weather?.[0]?.icon && data?.sys?.sunrise && data?.sys?.sunset
      ? backgroundVariantFor(data.weather[0].icon, data.dt, data.sys.sunrise, data.sys.sunset)
      : null;

  return (
    <>
      {backgroundVariant && <WeatherBackground variant={backgroundVariant} />}
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
    </>
  );
}

export default App;
