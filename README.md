# Alpha Weather Report

A clean, minimal weather lookup app: search any city for current
conditions and a 5-day forecast, with dark mode, °C/°F toggle, recent
searches, and autocomplete.

**Live:** https://alphaweatherreport.vercel.app/

## Features

- City search with autocomplete (OpenWeather Geocoding API)
- Current weather: temperature, humidity, wind, condition, local
  time (computed from the city's own UTC offset, not your device
  clock)
- 5-day forecast, aggregated from OpenWeather's 3-hour forecast data
- °C/°F toggle (client-side conversion, no re-fetch)
- Dark mode
- Last 5 recent searches, persisted and deduplicated
- Fully responsive: single column on mobile, forecast cards adapt at
  tablet/desktop widths
- API key never exposed client-side — all requests go through a
  serverless proxy

## Tech Stack

- Vanilla JS (ES modules), no framework
- Vercel Serverless Functions for the API proxy
- OpenWeather API (Current Weather, 5 Day / 3 Hour Forecast,
  Geocoding)
- `node --test` for the backend and pure-logic-library test suite

## Getting Started

### Prerequisites

- Node.js — version pinned in [`.nvmrc`](./.nvmrc) (22.x). If you're
  on Windows, avoid Node 24.x for local dev: it has a known `libuv`
  bug that crashes `fetch()` calls with
  `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`.
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) for
  local dev, since the app runs as Vercel Serverless Functions
- An [OpenWeather API key](https://openweathermap.org/api) (free
  tier is sufficient)

### Setup

```bash
git clone <this-repo-url>
cd alpha-weather-report
npm install
```

## Environment Variables

| Variable              | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `OPENWEATHER_API_KEY` | Your OpenWeather API key. Required server-side; never sent to the client. |

For local development, create a `.env.local` file in the project
root (already gitignored):

```
OPENWEATHER_API_KEY=your_key_here
```

For production/preview deployments, set the same variable in the
Vercel dashboard under **Project Settings → Environment Variables**
(Production and Preview environments).

> **Known local-dev quirk:** `vercel dev`'s automatic `.env.local`
> loading has been unreliable in this project's setup. As a
> workaround, `dotenv` is explicitly imported at the top of
> `api/_lib/weather-handler.js` (`config({ path: '.env.local' })`),
> so `.env.local` loads correctly regardless of `vercel dev`'s own
> behavior. This only affects local dev — production environment
> variables via the Vercel dashboard are unaffected.

## Local Development

```bash
vercel dev
```

This serves both the static frontend and the `/api/weather`
serverless function locally, so autocomplete, current weather, and
forecast all work end-to-end against the real OpenWeather API.

## Running Tests

```bash
npm test
```

Runs the full backend + pure-logic-library suite (`node --test`) —
covers the serverless proxy's request building and response
handling, and every module in `src/lib/` (units, time, forecast
aggregation, storage, debounce, error mapping, recent searches) plus
`src/apiClient.js`.

Note: `script.js` itself has no automated tests — it's DOM-driven UI
wiring with no DOM available in this test runner, and is verified
manually instead.

## Deployment

Connected to Vercel with auto-deploy on push to `main`. No build
step is required — Vercel serves `index.html`/`style.css`/`script.js`
as static assets and `api/weather.js` as a serverless function
automatically.

## Project Structure

```
api/
  _lib/
    weather-handler.js     # fetches from OpenWeather, injects the API key server-side
    weather-request.js     # builds/validates the outbound request shape
  weather.js                # serverless function entry point
src/
  apiClient.js               # client-side fetch wrappers (calls /api/weather only)
  lib/
    units.js, time.js, forecast.js, storage.js,
    debounce.js, errors.js, recentSearches.js
index.html
style.css
script.js
```

## Known Limitations

The following are intentionally deferred to a future version

- Geolocation-based "current location" weather
- Sunrise/sunset display
- True favorites (beyond auto recent-searches)
- Air Quality Index, UV Index, hourly/rain-probability forecast
- Data caching

Safari-specific manual testing was deferred during development (no
native Safari available on the development machine); if you hit a
Safari-specific issue, please file it.
