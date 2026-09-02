import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// With `globals: false` in vite.config.js, RTL's automatic afterEach
// cleanup never gets registered (it hooks into a global afterEach
// that doesn't exist here) — so DOM from one test leaks into the
// next within the same file. Register it explicitly instead.
afterEach(() => {
  cleanup();
});
