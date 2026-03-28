# CLAUDE.md — WTF Do I Eat

## Project Overview

**WTF Do I Eat** is a mobile-first web app that solves food indecision for Gen Z / Millennial users in Cape Town. Users answer 2 quick questions (mood + budget) and get 3 real restaurant recommendations with shareable result cards and a fun "eating personality" quiz result.

**Target audience:** Gen Z and Millennials in Cape Town, South Africa
**Monetization:** Ad-supported (free tier) + future freemium (paid removes ads, unlocks premium features)
**Launch strategy:** TikTok/Reels viral push — the shareable result cards are designed to be screenshot-friendly
**Tone:** Fun, upbeat, meme energy but clean and accessible UI — NOT chaotic, NOT cluttered

---

## Tech Stack

- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS (or CSS-in-JS — keep it consistent, pick one)
- **Fonts:** DM Sans (body) + Sora (display/headings) via Google Fonts
- **Routing:** React Router v6
- **State:** React hooks (useState, useEffect, useCallback) — no Redux needed yet
- **Storage:** localStorage for history/preferences (up to 30 entries)
- **Location:** Browser Geolocation API for "near me" sorting
- **Ads:** Google AdSense / AdMob (banner placements, NOT interstitials for MVP)
- **Hosting:** Vercel or Netlify (static deploy)
- **Analytics:** Plausible or PostHog (privacy-friendly, good for SA audience)
- **Domain:** Grab `wtfdoieat.app` or `wtfdoieat.co.za`

---

## Project Structure

```
wtf-do-i-eat/
├── public/
│   ├── favicon.ico
│   ├── og-image.png          # Social share image (1200x630)
│   ├── manifest.json          # PWA manifest
│   └── _redirects             # Netlify SPA redirect
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Router setup
│   ├── index.css              # Global styles + Tailwind
│   ├── components/
│   │   ├── Landing.jsx        # Landing/hero page
│   │   ├── Flow.jsx           # Mood + Budget selection flow
│   │   ├── Results.jsx        # 3 restaurant results
│   │   ├── Detail.jsx         # Single restaurant detail + share card
│   │   ├── History.jsx        # Past picks overlay
│   │   ├── AdBanner.jsx       # Ad placement component
│   │   ├── LocationPrompt.jsx # Geolocation opt-in
│   │   └── ShareCard.jsx      # Shareable result card (for screenshots)
│   ├── data/
│   │   └── restaurants.js     # Full restaurant database (50+ spots)
│   ├── lib/
│   │   ├── matching.js        # Recommendation engine (mood + budget + distance)
│   │   ├── personality.js     # Eating personality quiz engine
│   │   ├── distance.js        # Haversine distance calculation
│   │   └── storage.js         # localStorage helpers
│   └── hooks/
│       ├── useGeolocation.js   # Geolocation hook
│       └── useHistory.js       # History persistence hook
├── package.json
├── vite.config.js
├── tailwind.config.js
├── CLAUDE.md                   # This file
└── README.md
```

---

## Restaurant Database

The database contains 50+ REAL Cape Town restaurants with Google Places data. Each entry has:

```js
{
  name: "The Golden Dish",
  area: "Gatesville",
  vibe: "The OG gatsby spot — Cape Town legend",  // one-liner personality
  rating: 4.2,                                      // Google rating
  knownFor: "Full house steak masala gatsby, salomies",
  price: "local",                                    // local | budget | mid | splurge | baller
  moods: ["hangry", "comfort", "lazy"],              // which moods this matches
  lat: -33.9686,
  lng: 18.5335,
  placeId: "ChIJU3jYdaxEzB0R6nmVm2gfcPA",          // Google Places ID for Maps deep link
}
```

### Price tiers (in ZAR per person)

- **local** — Under R60. Gatsby joints, corner takeaways, koeksisters, fish & chips
- **budget** — R60–R100. Bunny chow, food halls, hidden gem cafes
- **mid** — R100–R250. Proper sit-down restaurants, brunch spots, ramen bars
- **splurge** — R250–R500. Upscale dining, cocktail bars, date night spots
- **baller** — R500+. Tasting menus, fine dining, chef's table experiences

### Restaurant categories currently covered

- Gatsby & takeaway joints (Golden Dish, Super Fisheries, Cosy Corner, Aneesa's)
- Cape Malay (Faeeza's Home Kitchen, Bo-Kaap Kombuis, Biesmiellah)
- Fish & chips (Kalky's, Lusitania, Mariner's Wharf)
- Burgers (Zuney Wagyu, Prima, Le Pickle, Dog's Bollocks, Hudsons)
- Ramen & Asian (Three Wise Monkeys, Bodega Ramen, Ramenhead, Yatai, Aiko Sushi)
- Brunch (JARRYDS, Our Local, Mulberry & Prince, Florentin, Mulino)
- Vegan/Healthy (Conscious Kitchen, Wild Eatery, Romeo & Vero, Sunshine Sprouting)
- African (AfroDeli, Mama Africa, Jordan Ways of Cooking)
- Fine dining (Belly of the Beast, Reverie Social Table, Nikkei)
- Seafood (Willoughby & Co, SeaBreeze, Kalky's)
- General (Tiger's Milk, VIXI, Kloof Street House, Villa 47, Utopia)

### Areas to expand to (future)

- Stellenbosch / Winelands
- Camps Bay / Clifton
- Woodstock / Salt River
- Constantia
- Century City / Canal Walk area
- Somerset West

---

## Mood Options (8 moods)

| Emoji | Label     | Value       | Color   |
| ----- | --------- | ----------- | ------- |
| 😤    | Hangry    | hangry      | #FF4D4D |
| 😴    | Lazy      | lazy        | #A78BFA |
| 🥳    | Treat Me  | treat       | #F59E0B |
| 🥗    | Healthy   | healthy     | #34D399 |
| 🧸    | Comfort   | comfort     | #FB923C |
| 🧑‍🍳    | Foodie    | foodie      | #EC4899 |
| 🌍    | Adventure | adventurous | #06B6D4 |
| 🎉    | Social    | social      | #8B5CF6 |

---

## Eating Personalities (20+)

Each mood+budget combo maps to a unique "eating personality" with a name, emoji, and roast-style description. Examples:

- **hangry + local** → "The Gatsby Goblin 👺" — "You inhale a full house steak masala before anyone's even ordered."
- **treat + baller** → "The Main Character 👑" — "Sunset at Utopia, tasting at Belly of the Beast. Your life is a movie."
- **comfort + local** → "The Cape Flats Kid 🫶" — "Koeksisters, gatsbys, and cream soda. That's not dinner, that's therapy."

These are designed to be shareable on social media. Keep the roast energy but make them positive/aspirational.

---

## Core User Flow

```
Landing Page (hero + location opt-in + CTA)
  ↓
Step 1: Pick your mood (8 options, 2-column grid)
  ↓
Step 2: Pick your budget (5 options, vertical list)
  ↓
Results: 3 restaurant cards sorted by distance (if location enabled)
  ↓ tap a card
Detail: Full restaurant card + personality + share + Google Maps link
  ↓
Share → copies text or triggers native share API
Reroll → shuffles and gives 3 new picks
Start Over → back to landing
```

**Important UX rules:**

- The entire flow should take under 10 seconds from tap to result
- All screens must be smooth 60fps transitions (use CSS animations, NOT JS-heavy)
- Tap targets must be minimum 44x44px (iOS/Android accessibility)
- Support safe-area-inset for notched phones (iPhone, etc.)
- Dark theme ONLY for v1 (matches the vibe, saves battery on OLED)
- Max-width 480px centered — should feel like a native app

---

## Ad Placement Strategy

Three banner zones (non-intrusive):

1. **Landing page** — bottom of hero section, below CTA. Highest impressions.
2. **Results page** — between restaurant cards and action buttons. Engaged users.
3. **Detail page** — below Google Maps link, larger format. High-intent users.

**Rules:**

- NEVER put an ad between the user's action and the result (no interstitials in MVP)
- Ads should feel native to the dark UI — blend with the design
- Use `<AdBanner />` component with `size="banner"` or `size="large"` prop
- Leave placeholder styling for now, wire up Google AdSense later
- Consider a local SA ad network as alternative (e.g., digital media companies in SA)

**Future monetization:**

- Remove ads for R19.99/month
- Premium features: save dietary preferences, cuisine filters, "surprise me" mode, weekly eating personality report

---

## Recommendation Engine Logic

```js
function getMatches(mood, budget, userLocation) {
  // 1. Filter restaurants by mood match
  let pool = restaurants.filter((r) => r.moods.includes(mood));

  // 2. Filter by budget (include adjacent tiers for variety)
  const tiers = ['local', 'budget', 'mid', 'splurge', 'baller'];
  const idx = tiers.indexOf(budget);
  const validTiers = tiers.slice(Math.max(0, idx - 1), idx + 2);
  pool = pool.filter((r) => validTiers.includes(r.price));

  // 3. Fallback if pool too small
  if (pool.length < 3) pool = restaurants.filter((r) => r.moods.includes(mood));
  if (pool.length < 3) pool = restaurants;

  // 4. Sort by distance if location available
  if (userLocation) {
    pool.forEach((r) => (r._dist = haversine(userLocation, { lat: r.lat, lng: r.lng })));
    pool.sort((a, b) => a._dist - b._dist);
  }

  // 5. Take top 8 closest, shuffle, return 3
  const candidates = pool.slice(0, 8);
  shuffle(candidates);
  return candidates.slice(0, 3);
}
```

This ensures results are varied on reroll but biased toward nearby spots.

---

## Geolocation

- Prompt on landing page with a friendly button: "📍 Enable location for nearby picks"
- Use `navigator.geolocation.getCurrentPosition()` with 8s timeout
- Three states: `idle` → `loading` → `granted` | `denied`
- If denied, app works fine — just uses random shuffle instead of distance sort
- Show distance on result cards when location is available (e.g., "800m", "3.2km")
- NEVER block the app on location — it's an enhancement, not a requirement

---

## Share Functionality

When user taps "Share" on a result:

```
🍽️ WTF Do I Eat says: Zuney Wagyu Burgers (Kloof St)
"Tiny spot, insane wagyu smash burgers"

My eating personality: 🦈 The Apex Predator
When hunger hits, smash burgers don't stand a chance.

wtfdoieat.app
```

- Use `navigator.share()` on mobile (native share sheet)
- Fall back to `navigator.clipboard.writeText()` on desktop
- Show a brief toast: "Copied!" with green background

The result card itself should be designed to look good as a screenshot — this is the primary viral mechanic.

---

## Persistent Storage

- Use `localStorage` for:
  - `wtf-history`: Array of last 30 picks (name, area, mood, budget, personality, date, timestamp)
  - `wtf-location-pref`: Whether user has opted in to location ("granted" | "denied" | null)
- No auth needed for v1
- Future: add accounts for cross-device sync

---

## Design System

### Colors

```css
--bg: #0b0b0f;
--surface: #13131a;
--surface2: #1a1a22;
--border: #1e1e28;
--text: #fffffe;
--text-muted: #72768a;
--accent: #ff6b35; /* Primary orange */
--accent2: #7f5af0; /* Purple accent */
--green: #2cb67d; /* Success / distance / "known for" */
--pink: #e53170; /* Error / foodie mood */
```

### Typography

- **Display:** Sora 600/700/800
- **Body:** DM Sans 400/500/600/700
- Never use Inter, Roboto, or Arial

### Spacing & Radius

- Border radius: 12px (small), 16px (cards), 20px (main cards), 50px (buttons)
- Padding: 16–24px on cards, 20px screen padding
- Gap: 8–12px between items

### Animations

- `fadeUp`: 0.45s ease — for screen transitions
- `popIn`: 0.4s ease — for result cards
- `float`: 3s ease-in-out infinite — for hero emoji
- `glow`: 2s ease-in-out infinite — for primary CTA
- Use `animation-delay` for staggered reveals on results

---

## PWA Setup

Make this installable as a PWA:

- `manifest.json` with app name, icons, theme color (#0B0B0F), background color
- Service worker for offline support (cache restaurant data)
- Add to Home Screen prompt after 2nd visit
- Splash screen with the 🍽️ emoji and "WTF Do I Eat" text

---

## SEO & Social

- **Title:** "WTF Do I Eat — Cape Town Restaurant Picker"
- **Description:** "Can't decide where to eat? Pick your mood, get 3 real Cape Town spots in 10 seconds. From gatsbys to fine dining."
- **OG Image:** 1200x630 with the branding, dark bg, food emojis, "WTF Do I Eat" text
- **Twitter Card:** summary_large_image

---

## Development Priorities

### Phase 1 — MVP Launch (current)

- [x] Restaurant database (50+ spots)
- [x] Mood + Budget flow
- [x] Recommendation engine
- [x] Personality quiz
- [x] Shareable result cards
- [x] Geolocation sorting
- [x] Persistent history
- [x] Ad placements (placeholder)
- [ ] Set up Vite + React project properly
- [ ] Break into component files per structure above
- [ ] Add Tailwind CSS
- [ ] Wire up React Router
- [ ] Add proper meta tags + OG image
- [ ] Set up PWA manifest + service worker
- [ ] Deploy to Vercel/Netlify
- [ ] Buy domain

### Phase 2 — Post-Launch

- [ ] Wire up Google AdSense
- [ ] Add Plausible/PostHog analytics
- [ ] Track: mood selections, budget selections, clicks, shares, rerolls
- [ ] A/B test CTA copy
- [ ] Add more restaurants (target 100+)
- [ ] Add Woodstock, Camps Bay, Stellenbosch areas
- [ ] Add "time of day" filter (breakfast/lunch/dinner/late-night)
- [ ] Opening hours awareness (don't recommend closed spots)

### Phase 3 — Growth

- [ ] Freemium tier (R19.99/mo removes ads + premium features)
- [ ] Dietary filters (halaal, vegan, gluten-free)
- [ ] "Surprise Me" mode (skip all questions, random pick)
- [ ] Weekly "eating personality" email digest
- [ ] User accounts + favourites
- [ ] Restaurant partnership / affiliate links
- [ ] Expand to Joburg, Durban, Pretoria

---

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Deploy (Vercel)
vercel --prod

# Deploy (Netlify)
netlify deploy --prod
```

---

## Key Principles

1. **Speed over features** — The app should feel instant. No loading spinners except for geolocation.
2. **Mobile-first always** — Design for 375px width first, scale up. Test on real phones.
3. **Shareable by default** — Every result should look good as a screenshot on TikTok/Instagram.
4. **Real data only** — Every restaurant is a real place with a real Google Places ID and real rating.
5. **Cape Town authentic** — Use local terminology (gatsby, bunny chow, koeksisters, braai). This isn't a generic food app.
6. **Ads that don't suck** — Blend with the UI, never interrupt the flow, never between action and result.
7. **Dark mode only** — Matches the vibe, saves battery, looks premium.
