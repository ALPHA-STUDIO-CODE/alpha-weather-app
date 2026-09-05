import SearchForm from './components/SearchForm.jsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.jsx';
import ForecastCards from './components/ForecastCards.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import UnitToggle from './components/UnitToggle.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useWeather } from './hooks/useWeather.js';
import { useUnit } from './hooks/useUnit.js';
import { useTheme } from './hooks/useTheme.js';

function App() {
  const { data, forecast, loading, error, search } = useWeather();
  const { unit, toggleUnit } = useUnit();
  const { theme, toggleTheme } = useTheme();

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
          <SearchForm onSearch={search} />
          <ErrorMessage error={error} />
        </section>
        <LoadingSpinner loading={loading} />
        <CurrentWeatherCard
          data={data}
          loading={loading}
          error={error}
          unit={unit}
        />
        <ForecastCards forecast={forecast} unit={unit} />
      </main>
    </div>
  );
}

export default App;
