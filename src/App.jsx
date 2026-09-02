import SearchForm from './components/SearchForm.jsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.jsx';

function App() {
  // Step 6 replaces this with useWeather's search(location).
  function handleSearch(city) {
    console.log('search:', city);
  }

  return (
    <div id="app">
      <header className="site-header">
        <h1 className="site-header__title">Alpha Weather Report</h1>
      </header>
      <main className="main">
        <section className="search-section" aria-label="City search">
          <SearchForm onSearch={handleSearch} />
        </section>
        <CurrentWeatherCard />
      </main>
    </div>
  );
}

export default App;
