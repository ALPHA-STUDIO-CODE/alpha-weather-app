// Replaces src/sanity.test.jsx (Step 2's temporary harness-proving
// test) as the project's first real component test.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm.jsx';

vi.mock('../apiClient.js', async () => {
  const actual = await vi.importActual('../apiClient.js');
  return { ...actual, geocode: vi.fn() };
});

import { geocode } from '../apiClient.js';

const LONDON = { name: 'London', country: 'GB', lat: 51.51, lon: -0.13 };
const PARIS = { name: 'Paris', country: 'FR', lat: 48.85, lon: 2.35 };

describe('SearchForm', () => {
  beforeEach(() => {
    geocode.mockReset();
    geocode.mockResolvedValue([]);
  });

  it('renders a search input and submit button', () => {
    render(<SearchForm onSearch={() => {}} />);
    expect(
      screen.getByRole('textbox', { name: /search for a city/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /search/i }),
    ).toBeInTheDocument();
  });

  it('calls onSearch with the trimmed city on submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    await user.type(screen.getByRole('textbox'), '  Abuja  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('Abuja');
  });

  it('ignores a blank submission (v1 parity: trim + no-op on empty)', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  describe('autocomplete (Step 19)', () => {
    // Real timers throughout — combining userEvent's own internal
    // timing with vi.useFakeTimers() proved fragile (type()/keyboard()
    // calls would hang even with delay:null). Waiting out the real
    // 300ms debounce is simple, reliable, and the cost (a few hundred
    // ms per test) is negligible for a component suite this size.
    async function waitForDebounce() {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    it('renders suggestions labeled "City, Country" after typing 2+ characters', async () => {
      geocode.mockResolvedValue([LONDON, PARIS]);
      const user = userEvent.setup();
      render(<SearchForm onSearch={() => {}} />);

      await user.type(screen.getByRole('textbox'), 'Lo');
      await waitForDebounce();

      expect(
        screen.getByRole('option', { name: 'London, GB' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Paris, FR' }),
      ).toBeInTheDocument();
    });

    it('clicking a suggestion fills the input and calls onSearch with {lat, lon}', async () => {
      geocode.mockResolvedValue([LONDON]);
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<SearchForm onSearch={onSearch} />);

      await user.type(screen.getByRole('textbox'), 'Lo');
      await waitForDebounce();
      await user.click(screen.getByRole('option', { name: 'London, GB' }));

      expect(screen.getByRole('textbox')).toHaveValue('London, GB');
      expect(onSearch).toHaveBeenCalledWith({ lat: 51.51, lon: -0.13 });
    });

    it('keyboard flow: ArrowDown highlights a suggestion, Enter selects it with the correct coordinates', async () => {
      geocode.mockResolvedValue([LONDON, PARIS]);
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<SearchForm onSearch={onSearch} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Lo');
      await waitForDebounce();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSearch).toHaveBeenCalledWith({ lat: 51.51, lon: -0.13 });
      expect(input).toHaveValue('London, GB');
    });

    it('Enter with nothing highlighted falls through to a normal typed submit, not a suggestion', async () => {
      geocode.mockResolvedValue([LONDON]);
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<SearchForm onSearch={onSearch} />);

      await user.type(screen.getByRole('textbox'), 'Lo');
      await waitForDebounce();

      await user.keyboard('{Enter}');

      expect(onSearch).toHaveBeenCalledWith('Lo');
    });

    it('Escape dismisses the dropdown without calling onSearch', async () => {
      geocode.mockResolvedValue([LONDON]);
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<SearchForm onSearch={onSearch} />);

      await user.type(screen.getByRole('textbox'), 'Lo');
      await waitForDebounce();
      expect(
        screen.getByRole('option', { name: 'London, GB' }),
      ).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('an outside click dismisses the dropdown without calling onSearch', async () => {
      geocode.mockResolvedValue([LONDON]);
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(
        <div>
          <SearchForm onSearch={onSearch} />
          <button type="button">outside</button>
        </div>,
      );

      await user.type(screen.getByRole('textbox'), 'Lo');
      await waitForDebounce();
      expect(
        screen.getByRole('option', { name: 'London, GB' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'outside' }));

      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      expect(onSearch).not.toHaveBeenCalled();
    });
  });
});
