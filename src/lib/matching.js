import { restaurants } from '../data/restaurants';
import { haversine } from './distance';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getMatches(mood, budget, userLocation) {
  // 1. Filter by mood
  let pool = restaurants.filter((r) => r.moods.includes(mood));

  // 2. Filter by budget (include adjacent tiers for variety)
  const tiers = ['local', 'budget', 'mid', 'splurge', 'baller'];
  const idx = tiers.indexOf(budget);
  const validTiers = tiers.slice(Math.max(0, idx - 1), idx + 2);
  let filtered = pool.filter((r) => validTiers.includes(r.price));

  // 3. Fallback if pool too small
  if (filtered.length < 3) filtered = pool;
  if (filtered.length < 3) filtered = restaurants.filter((r) => validTiers.includes(r.price));
  if (filtered.length < 3) filtered = [...restaurants];

  // 4. Sort by distance if location available
  if (userLocation) {
    filtered.forEach((r) => {
      r._dist = haversine(userLocation.lat, userLocation.lng, r.lat, r.lng);
    });
    filtered.sort((a, b) => a._dist - b._dist);
  } else {
    shuffle(filtered);
  }

  // 5. Take top 8 closest, shuffle, return 3
  const candidates = filtered.slice(0, 8);
  shuffle(candidates);
  return candidates.slice(0, 3);
}
