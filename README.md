# WTF Do I Eat

Mobile-first Cape Town restaurant picker built with React + Vite + Tailwind.

## Features

- 2-step flow: mood + budget
- 3 real Cape Town recommendations with reroll
- Shareable detail card and native share / clipboard fallback
- Optional geolocation sorting with distance display
- Local history (last 30 picks)
- PWA support with service worker + install prompt after second visit
- Router-based screens for landing, flow, results, detail, and history

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- localStorage for persistence

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000/

## Build

```bash
npm run build
npm run preview
```

## Live Nearby Providers

The app can fetch live nearby restaurants from either provider:

- Google Places API (New)
- SerpAPI Google Local / Maps results

Set one or both keys in `.env.local`:

```bash
VITE_GOOGLE_PLACES_API_KEY=your_google_places_key
VITE_SERPAPI_KEY=your_serpapi_key
```

Provider order in app:

1. Google Places first (if configured)
2. SerpAPI fallback (if configured)

## Analytics setup

1. Copy `.env.example` to `.env.local`.
2. Configure one or both providers:

```bash
# Plausible
VITE_PLAUSIBLE_DOMAIN=wtfdoieat.app

# PostHog
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

3. Start dev server and verify events in console (dev fallback) or provider dashboards.

Tracked events include:

- `cta_find_spot_click`
- `location_request`
- `mood_selected`
- `budget_selected`
- `flow_submit`
- `result_selected`
- `reroll_click`
- `share_click`
- `maps_open_click`

## Project structure

```text
public/
  manifest.json
  sw.js
  favicon.svg
  icon-192.svg
  icon-512.svg
  og-image.svg
  _redirects
src/
  App.jsx
  main.jsx
  index.css
  components/
  data/
  hooks/
  lib/
```

## PWA notes

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js`
- Install prompt logic: `src/hooks/useInstallPrompt.js`

## Deploy

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect is included in `public/_redirects`

### Vercel

```bash
vercel --prod
```

## Production checklist (v1)

- [ ] Set `VITE_PLAUSIBLE_DOMAIN` or PostHog keys in host environment variables
- [ ] Confirm service worker registers only in production
- [ ] Verify mobile flow from landing to share in under 10 seconds
- [ ] Verify location denied path still returns useful results
- [ ] Check ad placeholders appear on landing/results/detail only
- [ ] Run `npm run build` with no errors before deploy
- [ ] Validate SPA routes after deploy (`/`, `/flow`, `/results`, `/detail`, `/history`)

## CLAUDE.md alignment

Implemented from MVP Phase 1:

- Vite + React setup
- Tailwind setup
- Router wiring
- Componentized app structure
- Recommendation engine + personality mapping
- Geolocation + local storage history
- Ad placeholder placements
- Meta tags + social OG entry
- PWA manifest + service worker + install prompt flow
