import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitToggle from './UnitToggle.jsx';

describe('UnitToggle', () => {
  it('shows °C, aria-pressed=false, and a "switch to Fahrenheit" label when unit is C', () => {
    render(<UnitToggle unit="C" onToggle={() => {}} />);
    const button = screen.getByRole('button', {
      name: 'Switch to Fahrenheit',
    });
    expect(button).toHaveTextContent('°C');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows °F, aria-pressed=true, and a "switch to Celsius" label when unit is F', () => {
    render(<UnitToggle unit="F" onToggle={() => {}} />);
    const button = screen.getByRole('button', {
      name: 'Switch to Celsius',
    });
    expect(button).toHaveTextContent('°F');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<UnitToggle unit="C" onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
