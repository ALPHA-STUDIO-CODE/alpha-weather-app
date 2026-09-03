import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForecastCards from './ForecastCards.jsx';

// 2024-01-01 is a Monday — five consecutive dates give a
// deterministic, human-checkable Mon..Fri label sequence.
const FIVE_DAY_FIXTURE = [
  { date: '2024-01-01', min: 10, max: 20, icon: 'a0', condition: 'clear sky' },
  { date: '2024-01-02', min: 8, max: 18, icon: 'a1', condition: 'few clouds' },
  { date: '2024-01-03', min: 12, max: 22, icon: 'a2', condition: 'light rain' },
  { date: '2024-01-04', min: 5, max: 15, icon: 'a3', condition: 'overcast clouds' },
  { date: '2024-01-05', min: 14, max: 24, icon: 'a4', condition: 'partly cloudy' },
];

describe('ForecastCards', () => {
  it('renders nothing when there is no forecast yet', () => {
    const { container } = render(<ForecastCards forecast={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an empty forecast array', () => {
    const { container } = render(<ForecastCards forecast={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders exactly 5 cards from 5 fixture summaries, each with correct fields', () => {
    render(<ForecastCards forecast={FIVE_DAY_FIXTURE} />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();

    expect(screen.getByText('20°C / 10°C')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByText('light rain')).toBeInTheDocument();

    expect(
      screen.getByRole('img', { name: 'clear sky' }),
    ).toHaveAttribute('src', 'https://openweathermap.org/img/wn/a0@2x.png');
  });

  it('renders high before low, and formats in Fahrenheit when unit="F"', () => {
    render(<ForecastCards forecast={FIVE_DAY_FIXTURE} unit="F" />);
    // 20°C -> 68°F, 10°C -> 50°F
    expect(screen.getByText('68°F / 50°F')).toBeInTheDocument();
  });
});
