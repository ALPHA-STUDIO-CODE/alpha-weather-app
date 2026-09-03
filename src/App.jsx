import SearchForm from './components/SearchForm.jsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.jsx';
import ForecastCards from './components/ForecastCards.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useWeather } from './hooks/useWeather.js';

function App() {
  const { data, forecast, loading, error, search } = useWeather();

  return (
    <div id="app">
      <header className="site-header">
        <h1 className="site-header__title">Alpha Weather Report</h1>
      </header>
      <main className="main">
        <section className="search-section" aria-label="City search">
          <SearchForm onSearch={search} />
        </section>
        <LoadingSpinner loading={loading} />
        <CurrentWeatherCard data={data} loading={loading} error={error} />
        <ForecastCards forecast={forecast} />
      </main>
    </div>
  );
}

export default App;
