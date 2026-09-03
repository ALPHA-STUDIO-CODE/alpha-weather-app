import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner.jsx';

describe('LoadingSpinner', () => {
  it('renders nothing when loading is false', () => {
    const { container } = render(<LoadingSpinner loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when loading is not provided', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a status-role spinner when loading is true', () => {
    render(<LoadingSpinner loading={true} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading weather…')).toBeInTheDocument();
  });
});
