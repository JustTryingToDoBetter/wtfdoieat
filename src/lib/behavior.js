const BEHAVIOR_KEY = 'wtf-behavior-profile';
const MAX_PLACE_KEYS = 80;

const emptyProfile = {
  events: {
    tap: 0,
    share: 0,
    favourite: 0,
    reroll: 0,
  },
  mood: {},
  budget: {},
  price: {},
  area: {},
  place: {},
  updatedAt: 0,
};

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function cloneEmpty() {
  return JSON.parse(JSON.stringify(emptyProfile));
}

function normalizeString(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function makePlaceKey(restaurant) {
  if (!restaurant) return '';
  const placeId = normalizeString(restaurant.placeId);
  if (placeId) return placeId;
  return `${normalizeString(restaurant.name)}|${normalizeString(restaurant.area)}`;
}

function increment(map, key, amount = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + amount;
}

function trimPlaceMap(placeMap) {
  const entries = Object.entries(placeMap);
  if (entries.length <= MAX_PLACE_KEYS) return placeMap;
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries.slice(0, MAX_PLACE_KEYS));
}

export function getBehaviorProfile() {
  try {
    const raw = localStorage.getItem(BEHAVIOR_KEY);
    if (!raw) return cloneEmpty();

    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return cloneEmpty();

    return {
      ...cloneEmpty(),
      ...parsed,
      events: { ...cloneEmpty().events, ...(parsed.events || {}) },
      mood: { ...(parsed.mood || {}) },
      budget: { ...(parsed.budget || {}) },
      price: { ...(parsed.price || {}) },
      area: { ...(parsed.area || {}) },
      place: { ...(parsed.place || {}) },
    };
  } catch {
    return cloneEmpty();
  }
}

export function saveBehaviorProfile(profile) {
  try {
    localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(profile));
  } catch {
    // ignore localStorage quota/availability failures
  }
}

/**
 * Record user behavior signals used to rerank future recommendations.
 */
export function recordBehavior(action, payload = {}) {
  const profile = getBehaviorProfile();

  if (profile.events[action] != null) {
    profile.events[action] += 1;
  }

  const moodKey = normalizeString(payload.mood);
  const budgetKey = normalizeString(payload.budget);
  increment(profile.mood, moodKey);
  increment(profile.budget, budgetKey);

  const restaurant = payload.restaurant;
  if (restaurant && typeof restaurant === 'object') {
    increment(profile.price, normalizeString(restaurant.price));
    increment(profile.area, normalizeString(restaurant.area));
    increment(profile.place, makePlaceKey(restaurant), action === 'tap' ? 2 : 1);

    if (Array.isArray(restaurant.moods)) {
      restaurant.moods.forEach((m) => increment(profile.mood, normalizeString(m), 0.5));
    }
  }

  profile.place = trimPlaceMap(profile.place);
  profile.updatedAt = Date.now();
  saveBehaviorProfile(profile);
  return profile;
}

/**
 * Score a restaurant for personalization while preserving exploration.
 */
export function getBehaviorScore(restaurant, selectedMood, selectedBudget, profile) {
  if (!restaurant || !profile) return 0;

  const score =
    (profile.price?.[normalizeString(restaurant.price)] || 0) * 1.8 +
    (profile.area?.[normalizeString(restaurant.area)] || 0) * 1.2 +
    (profile.place?.[makePlaceKey(restaurant)] || 0) * 2.2 +
    (profile.mood?.[normalizeString(selectedMood)] || 0) * 0.6 +
    (profile.budget?.[normalizeString(selectedBudget)] || 0) * 0.5;

  // Compress long-tail counts so old habits don't fully dominate.
  return Math.log1p(Math.max(0, score));
}
