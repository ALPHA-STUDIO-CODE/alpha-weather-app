import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle.jsx';

describe('ThemeToggle', () => {
  it('shows the moon, aria-pressed=false, and a "switch to dark mode" label when theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const button = screen.getByRole('button', {
      name: 'Switch to dark mode',
    });
    expect(button).toHaveTextContent('☾');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the sun, aria-pressed=true, and a "switch to light mode" label when theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    const button = screen.getByRole('button', {
      name: 'Switch to light mode',
    });
    expect(button).toHaveTextContent('☀');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
