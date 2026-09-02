import SearchForm from './components/SearchForm.jsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.jsx';
import { useWeather } from './hooks/useWeather.js';

function App() {
  const { data, loading, error, search } = useWeather();

  return (
    <div id="app">
      <header className="site-header">
        <h1 className="site-header__title">Alpha Weather Report</h1>
      </header>
      <main className="main">
        <section className="search-section" aria-label="City search">
          <SearchForm onSearch={search} />
        </section>
        <CurrentWeatherCard data={data} loading={loading} error={error} />
      </main>
    </div>
  );
}

export default App;
