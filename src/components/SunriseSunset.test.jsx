import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SunriseSunset from './SunriseSunset.jsx';

// Same fixture values proven in sunTimes.test.js: sunrise 06:30 UTC,
// sunset 16:45 UTC, at zero offset those are 6:30 AM / 4:45 PM.
const LONDON_FIXTURE = {
  sys: { sunrise: 1704090600, sunset: 1704127500 },
  timezone: 0,
};

describe('SunriseSunset', () => {
  it('renders nothing when there is no data yet', () => {
    const { container } = render(<SunriseSunset data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when sys.sunrise/sys.sunset are missing', () => {
    const { container } = render(<SunriseSunset data={{ timezone: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders two correctly formatted rows from a fixture response', () => {
    render(<SunriseSunset data={LONDON_FIXTURE} />);

    expect(screen.getByText('Sunrise')).toBeInTheDocument();
    expect(screen.getByText('6:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Sunset')).toBeInTheDocument();
    expect(screen.getByText('4:45 PM')).toBeInTheDocument();
  });

  it('uses the city\'s own UTC offset, not zero/device time', () => {
    const abujaFixture = {
      sys: { sunrise: 1704090600, sunset: 1704127500 },
      timezone: 3600,
    };
    render(<SunriseSunset data={abujaFixture} />);

    expect(screen.getByText('7:30 AM')).toBeInTheDocument();
    expect(screen.getByText('5:45 PM')).toBeInTheDocument();
  });
});
