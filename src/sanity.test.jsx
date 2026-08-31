// TEMPORARY — proves the Vitest + React Testing Library harness is
// wired correctly (jsdom environment, jest-dom matchers, .test.jsx
// glob picked up, real render + assertion). Superseded in Step 5 by
// App.jsx's own first real component test. Delete this file then.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function SanityCheck() {
  return <div>harness ok</div>;
}

describe('Vitest + RTL harness (temporary)', () => {
  it('renders into jsdom and jest-dom matchers work', () => {
    render(<SanityCheck />);
    expect(screen.getByText('harness ok')).toBeInTheDocument();
  });
});
