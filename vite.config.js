import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives component tests a DOM to render into — the exact
    // capability v1's node --test runner never had for script.js.
    environment: 'jsdom',
    // Convention: component/hook tests are always *.test.jsx, ported
    // backend/lib tests are always *.test.js (run by node --test).
    // Restricting the glob here keeps the two runners from ever
    // trying to execute each other's test files.
    include: ['src/**/*.test.jsx'],
    // Explicit imports only (no injected global test/expect/describe),
    // matching the explicit-import style node --test already uses.
    globals: false,
    setupFiles: ['./src/vitest.setup.js'],
  },
})
