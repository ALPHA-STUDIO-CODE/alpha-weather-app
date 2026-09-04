import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage.jsx';
import CurrentWeatherCard from './CurrentWeatherCard.jsx';
import { WeatherApiError } from '../apiClient.js';

const LONDON_FIXTURE = {
  name: 'London',
  sys: { country: 'GB' },
  main: { temp: 15.3, humidity: 62 },
  weather: [{ description: 'light rain', icon: '10d' }],
  wind: { speed: 4.1 },
  dt: 1704110400,
  timezone: 0,
};

describe('ErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the not-found copy for a "not_found" typed error', () => {
    render(<ErrorMessage error={new WeatherApiError('nope', 'not_found')} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('City not found. Try another search.');
  });

  it('falls back to generic copy for an unrecognized error type', () => {
    render(
      <ErrorMessage error={new WeatherApiError('boom', 'network_timeout')} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
  });

  it('falls back to generic copy when the error has no type at all', () => {
    render(<ErrorMessage error={new Error('plain failure')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
  });

  it('renders alongside existing weather data — the display is never blanked on failure', () => {
    render(
      <>
        <CurrentWeatherCard data={LONDON_FIXTURE} />
        <ErrorMessage error={new WeatherApiError('nope', 'not_found')} />
      </>,
    );
    expect(screen.getByText('London, GB')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'City not found. Try another search.',
    );
  });
});
