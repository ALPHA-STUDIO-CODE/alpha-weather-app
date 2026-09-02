// Replaces src/sanity.test.jsx (Step 2's temporary harness-proving
// test) as the project's first real component test.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm.jsx';

describe('SearchForm', () => {
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
});
