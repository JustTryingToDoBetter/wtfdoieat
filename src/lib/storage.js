const HISTORY_KEY = 'wtf-history';
const LOCATION_PREF_KEY = 'wtf-location-pref';
const PREMIUM_KEY = 'wtf-premium-enabled';
const PREFS_KEY = 'wtf-user-prefs';
const LAST_SELECTION_KEY = 'wtf-last-selection';
const DAILY_LOOP_KEY = 'wtf-daily-loop';
const MAX_HISTORY = 30;

const DEFAULT_PREFS = {
  onlyOpenNow: false,
  maxDistanceKm: 12,
  dietary: 'any',
};

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // localStorage full or unavailable
  }
}

export function addToHistory(entry) {
  const history = getHistory();
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return updated;
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function getLocationPref() {
  try {
    return localStorage.getItem(LOCATION_PREF_KEY);
  } catch {
    return null;
  }
}

export function setLocationPref(value) {
  try {
    localStorage.setItem(LOCATION_PREF_KEY, value);
  } catch {
    // ignore
  }
}

export function getUserPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...(parsed || {}),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveUserPrefs(nextPrefs) {
  try {
    const merged = { ...DEFAULT_PREFS, ...(nextPrefs || {}) };
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function getLastSelection() {
  try {
    const raw = localStorage.getItem(LAST_SELECTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastSelection(selection) {
  try {
    localStorage.setItem(
      LAST_SELECTION_KEY,
      JSON.stringify({
        mood: selection?.mood || null,
        budget: selection?.budget || null,
        at: Date.now(),
      })
    );
  } catch {
    // ignore
  }
}

export function markDailyVisit() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const raw = localStorage.getItem(DAILY_LOOP_KEY);
    const prev = raw
      ? JSON.parse(raw)
      : {
          lastVisitDay: null,
          streak: 0,
          totalDays: 0,
        };

    if (prev.lastVisitDay === today) {
      return prev;
    }

    const isConsecutive = prev.lastVisitDay === yesterdayDate;
    const next = {
      lastVisitDay: today,
      streak: isConsecutive ? Math.max(1, Number(prev.streak || 0) + 1) : 1,
      totalDays: Math.max(0, Number(prev.totalDays || 0)) + 1,
    };

    localStorage.setItem(DAILY_LOOP_KEY, JSON.stringify(next));
    return next;
  } catch {
    return {
      lastVisitDay: null,
      streak: 0,
      totalDays: 0,
    };
  }
}

export function getPremiumEnabled() {
  try {
    return localStorage.getItem(PREMIUM_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPremiumEnabled(value) {
  try {
    localStorage.setItem(PREMIUM_KEY, value ? 'true' : 'false');
  } catch {
    // ignore
  }
}

// ─── Favourites ────────────────────────────────────────────────────────────────

const FAVOURITES_KEY = 'wtf-favourites';
const MAX_FAVOURITES = 50;

export function getRestaurantId(restaurant) {
  if (!restaurant) return '';
  const placeId = typeof restaurant.placeId === 'string' ? restaurant.placeId.trim() : '';
  if (placeId) return placeId;

  const name = (restaurant.name || '').trim().toLowerCase();
  const area = (restaurant.area || '').trim().toLowerCase();
  return `${name}|${area}`;
}

export function getFavourites() {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adds the restaurant if not already saved; removes it if it is.
 * Returns the updated favourites array.
 */
export function toggleFavourite(restaurant) {
  const current = getFavourites();
  const id = getRestaurantId(restaurant);
  const existingIndex = current.findIndex((f) => (f.favId || f.placeId) === id);

  const updated =
    existingIndex >= 0
      ? current.filter((_, i) => i !== existingIndex)
      : [{ ...restaurant, favId: id, savedAt: Date.now() }, ...current].slice(0, MAX_FAVOURITES);

  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — state still updates in memory via hook
  }

  return updated;
}

export function isFavourited(placeId) {
  return getFavourites().some((f) => (f.favId || f.placeId) === placeId);
}
