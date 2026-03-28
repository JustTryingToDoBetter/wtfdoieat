import { restaurants } from '../data/restaurants';
import { PRICE_TIERS } from '../constants/options';
import { haversine } from './distance';
import { getBehaviorProfile, getBehaviorScore } from './behavior';
import { getHistory, getUserPrefs } from './storage';
import type { BudgetValue, MoodValue, Restaurant, UserLocation } from '../types/domain';

function norm(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function matchesDietary(restaurant: Restaurant, dietary: string): boolean {
  if (!dietary || dietary === 'any') return true;

  const haystack = `${restaurant.name} ${restaurant.vibe} ${restaurant.knownFor}`.toLowerCase();
  if (dietary === 'vegan') {
    return /vegan|plant|tofu|salad|veggie/.test(haystack);
  }
  if (dietary === 'vegetarian') {
    return /vegetarian|veggie|veg |salad|paneer|mushroom/.test(haystack);
  }
  if (dietary === 'halaal') {
    return /halaal|halal/.test(haystack);
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function weightedPick<T>(source: T[], count: number, weightOf: (item: T) => number): T[] {
  const pool = [...source];
  const picked: T[] = [];

  while (pool.length && picked.length < count) {
    const weights = pool.map((item) => Math.max(0.05, Number(weightOf(item)) || 0.05));
    const total = weights.reduce((sum, n) => sum + n, 0);

    let roll = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      roll -= weights[idx];
      if (roll <= 0) break;
    }

    const selected = pool.splice(Math.min(idx, pool.length - 1), 1)[0];
    picked.push(selected);
  }

  return picked;
}

export function getMatches(
  mood: MoodValue,
  budget: BudgetValue,
  userLocation: UserLocation | null,
  extraRestaurants: Restaurant[] = []
): Restaurant[] {
  const allRestaurants: Restaurant[] = extraRestaurants.length
    ? [...(restaurants as Restaurant[]), ...extraRestaurants]
    : (restaurants as Restaurant[]);
  const behaviorProfile = getBehaviorProfile();
  const prefs = getUserPrefs();
  const recentHistory = getHistory()
    .slice(0, 10)
    .map((h: { name?: string; area?: string }) => `${norm(h.name || '')}|${norm(h.area || '')}`);

  let pool = allRestaurants.filter((r) => r.moods.includes(mood));

  const idx = PRICE_TIERS.indexOf(budget);
  const validTiers = PRICE_TIERS.slice(Math.max(0, idx - 1), idx + 2);
  let filtered = pool.filter((r) => validTiers.includes(r.price));

  if (filtered.length < 3) filtered = pool;
  if (filtered.length < 3) filtered = allRestaurants.filter((r) => validTiers.includes(r.price));
  if (filtered.length < 3) filtered = [...allRestaurants];

  if (userLocation) {
    filtered.forEach((r) => {
      r._dist = haversine(userLocation.lat, userLocation.lng, r.lat, r.lng);
    });
    filtered.sort((a, b) => (a._dist ?? 0) - (b._dist ?? 0));
  } else {
    shuffle(filtered);
  }

  if (prefs.onlyOpenNow) {
    const openNowPool = filtered.filter((r) => r._openStatus !== 'closed');
    if (openNowPool.length >= 3) {
      filtered = openNowPool;
    }
  }

  filtered = filtered.filter((r) => matchesDietary(r, prefs.dietary));
  if (filtered.length < 3) {
    filtered = allRestaurants.filter((r) => r.moods.includes(mood));
  }

  if (userLocation && Number(prefs.maxDistanceKm) > 0) {
    const maxMeters = Number(prefs.maxDistanceKm) * 1000;
    const inRange = filtered.filter((r) => (r._dist ?? maxMeters) <= maxMeters);
    if (inRange.length >= 3) {
      filtered = inRange;
    }
  }

  const candidateWindow = userLocation ? filtered.slice(0, 14) : filtered.slice(0, 20);
  const picks = weightedPick(candidateWindow, 3, (restaurant) => {
    const behavior = getBehaviorScore(restaurant, mood, budget, behaviorProfile);
    const key = `${norm(restaurant.name)}|${norm(restaurant.area)}`;
    const isRecent = recentHistory.includes(key);
    const recencyPenalty = isRecent ? 0.6 : 1;
    const explore = Math.random() * 0.85;
    return (1 + behavior * 0.8 + explore) * recencyPenalty;
  });

  return picks.length ? picks : filtered.slice(0, 3);
}
