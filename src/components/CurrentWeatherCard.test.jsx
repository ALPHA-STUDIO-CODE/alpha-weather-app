import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CurrentWeatherCard from './CurrentWeatherCard.jsx';

// Noon UTC, zero offset — reused from src/lib/time.test.js's fixture
// convention so the expected "12:00 PM" is easy to cross-check.
const NOON_UTC = 1704110400;

const LONDON_FIXTURE = {
  name: 'London',
  sys: { country: 'GB' },
  main: { temp: 15.3, humidity: 62 },
  weather: [{ description: 'light rain', icon: '10d' }],
  wind: { speed: 4.1 },
  dt: NOON_UTC,
  timezone: 0,
};

describe('CurrentWeatherCard', () => {
  it('renders nothing when there is no data yet', () => {
    const { container } = render(<CurrentWeatherCard data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders city/country, local time, temp, humidity, wind, and condition from a fixture response', () => {
    render(<CurrentWeatherCard data={LONDON_FIXTURE} />);

    expect(screen.getByText('London, GB')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('15°C')).toBeInTheDocument();
    expect(screen.getByText('light rain')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('4.1 m/s')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'light rain' })).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/10d@2x.png',
    );
  });

  it('formats temp in Fahrenheit when unit="F" while wind stays in m/s', () => {
    render(<CurrentWeatherCard data={LONDON_FIXTURE} unit="F" />);

    expect(screen.getByText('60°F')).toBeInTheDocument();
    expect(screen.getByText('4.1 m/s')).toBeInTheDocument();
  });

  it('omits the country suffix when sys.country is missing', () => {
    const fixtureWithoutCountry = {
      ...LONDON_FIXTURE,
      sys: {},
    };
    render(<CurrentWeatherCard data={fixtureWithoutCountry} />);
    expect(screen.getByText('London')).toBeInTheDocument();
  });
});
