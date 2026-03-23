const HISTORY_KEY = 'wtf-history';
const LOCATION_PREF_KEY = 'wtf-location-pref';
const MAX_HISTORY = 30;

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
