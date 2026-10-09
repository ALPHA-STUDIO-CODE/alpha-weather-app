# Alpha Weather Report (v2)

A weather lookup app: search any city for current conditions and a
5-day forecast, with dark mode, °C/°F toggle, recent searches,
autocomplete, geolocation, true favorites, sunrise/sunset, animated
Meteocons icons, weather-based animated backgrounds, and client +
server response caching.

**Live:** https://alphaweatherreport.vercel.app/

v2 is a full React + Vite rewrite of v1's vanilla-JS frontend, with
six brand-new features on top of full v1 parity. See `HANDOFF.md` for
the complete build history and architecture notes.

## Features

- City search with autocomplete (OpenWeather Geocoding API)
- Current weather: temperature, humidity, wind, condition, local time
  (computed from the city's own UTC offset, not your device clock)
- 5-day forecast, aggregated from OpenWeather's 3-hour forecast data
- °C/°F toggle (client-side conversion, no re-fetch)
- Dark mode
- Last 5 recent searches, persisted and deduplicated
- **Geolocation-based current-location weather**, with a manual
  location button and graceful fallback to your last city (or Abuja)
  on denial/timeout/unsupported browsers
- **Sunrise/sunset display**, computed from the same current-weather
  response — no extra API call
- **True favorites** (up to 10, separate from recent searches)
- **Animated weather icons** ([Meteocons](https://meteocons.com/)),
  respecting `prefers-reduced-motion`
- **Weather-based animated backgrounds** — gradient + gentle
  rain-line/cloud-drift animation, shifting with the displayed city's
  condition and day/night state
- **Client + server response caching** (30-minute freshness window),
  so a repeat search for the same city is instant
- Fully responsive across mobile/tablet/desktop, verified on real
  Safari in addition to Chromium-based browsers
- API key never exposed client-side — all requests go through a
  serverless proxy

## Tech Stack

- React 19 + Vite
- Vercel Serverless Functions for the API proxy, with an in-memory
  response cache layer in front of it
- OpenWeather API (Current Weather, 5 Day / 3 Hour Forecast,
  Geocoding)
- [Meteocons](https://meteocons.com/) (hot-linked from their CDN, not
  vendored) for animated weather icons
- `node --test` for the backend and pure-logic-library test suite;
  Vitest + React Testing Library for component/hook tests

## Getting Started

### Prerequisites

- Node.js — version pinned in [`.nvmrc`](./.nvmrc) (22.x). If you're
  on Windows, avoid Node 24.x for local dev: it has a known `libuv`
  bug that crashes `fetch()` calls with
  `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`.
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) if
  you want to run the serverless function locally (see below)
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

Unchanged from v1. For local development, create a `.env.local` file
in the project root (already gitignored):

```
OPENWEATHER_API_KEY=your_key_here
```

For production/preview deployments, set the same variable in the
Vercel dashboard under **Project Settings → Environment Variables**
(Production and Preview environments).

> **Known local-dev quirk, carried over from v1:** `vercel dev`'s
> automatic `.env.local` loading has been unreliable in this
> project's setup. As a workaround, `dotenv` is explicitly imported
> at the top of `api/_lib/weather-handler.js`
> (`config({ path: '.env.local' })`), so `.env.local` loads correctly
> regardless of `vercel dev`'s own behavior. This only affects local
> dev — production environment variables via the Vercel dashboard are
> unaffected.

## Local Development

Two different local dev commands now, depending on what you need:

```bash
npm run dev
```

Runs the Vite dev server for the frontend only — fast HMR, but any
call to `/api/weather` will 404 since there's no serverless function
running alongside it. Fine for pure UI/styling work.

```bash
vercel dev
```

Runs the full stack locally: the Vite frontend _and_ the
`/api/weather` serverless function together, so search, autocomplete,
geolocation, favorites, caching — everything — works end-to-end
against the real OpenWeather API. Use this whenever you're touching
anything that talks to the backend.

## Running Tests

```bash
npm test
```

Now runs **two** suites in sequence (v1 only had the first):

- `npm run test:unit` (`node --test`) — the backend (`api/_lib/`) and
  every pure-logic module in `src/lib/`.
- `npm run test:components` (`vitest run`) — every React component and
  hook, using Testing Library + jsdom.

Run them individually with either script name above during focused
work.

## Deployment

Connected to Vercel with auto-deploy on push to `main`. Vite builds
the frontend (`npm run build`) and Vercel serves `api/weather.js` as
a serverless function automatically — no manual build step for the
API side.

## Project Structure

```
api/
  _lib/
    weather-handler.js       # fetches from OpenWeather, injects the API key server-side
    weather-request.js       # builds/validates the outbound request shape
    responseCache.js         # in-memory cache (get/set/cacheKeyFor) — pure utility, no OpenWeather calls
    cachedWeatherHandler.js  # wraps weather-handler.js with responseCache.js — this, not weather-handler.js
                             #   directly, is what weather.js actually calls
  weather.js                  # serverless function entry point
src/
  main.jsx, App.jsx            # app entry + root component
  apiClient.js                 # client-side fetch wrappers (calls /api/weather only)
  index.css                    # global styles, CSS custom properties, theme variables
  components/                  # one component + co-located *.module.css + *.test.jsx per file
  hooks/                       # useWeather, useUnit, useTheme, useRecentSearches, useFavorites,
                               #   useGeolocation, usePrefersReducedMotion
  lib/
    units.js, time.js, forecast.js, storage.js, debounce.js,
    errors.js, recentSearches.js         # ported from v1, unchanged
    sunTimes.js, favorites.js, cache.js,
    weatherIcons.js, meteoconsCdn.js,
    backgroundCondition.js               # new in v2
```

## Known Limitations

Deferred to a future version (unchanged in intent from v1's original
list, minus everything v2 actually built):

- Interactive weather map
- Air Quality Index (AQI)
- Rain probability / hourly forecast
- Voice search
- UV Index / visibility

And further out, per v1's original "bigger swings" framing: user
login/accounts, a real backend/database beyond the current
serverless-proxy pattern, PWA/offline support, charts, and push
notifications.

Safari-specific manual testing, deferred during v1's development, has
since been completed for v2 — see `HANDOFF.md` for results.
