const ENABLE_PROXY = import.meta.env.VITE_ENABLE_SERP_PROXY === 'true';
const PROXY_ENDPOINT = '/api/serp/nearby';

function normalizePrice(price) {
  if (!price) return 'budget';
  const marker = typeof price === 'string' ? price.trim() : '';
  if (marker === '$') return 'local';
  if (marker === '$$') return 'budget';
  if (marker === '$$$') return 'mid';
  if (marker === '$$$$') return 'splurge';
  return 'budget';
}

function inferMoods(type = '') {
  const value = String(type).toLowerCase();
  if (value.includes('fast') || value.includes('burger') || value.includes('pizza')) {
    return ['hangry', 'lazy', 'social'];
  }
  if (value.includes('coffee') || value.includes('cafe')) {
    return ['lazy', 'comfort', 'treat'];
  }
  if (value.includes('seafood') || value.includes('sushi')) {
    return ['foodie', 'treat', 'adventurous'];
  }
  return ['hangry', 'comfort', 'social'];
}

function normalizeArea(address = '') {
  const parts = String(address)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0] || 'Cape Town';
}

function parseOpenStatus(hours = '') {
  const value = String(hours || '').toLowerCase();
  if (!value) return { status: 'unknown', text: null };
  if (value.includes('closed')) return { status: 'closed', text: 'Closed now' };
  if (value.includes('open')) return { status: 'open', text: 'Open now' };
  return { status: 'unknown', text: null };
}

function normalizeEntry(item) {
  const lat = item?.gps_coordinates?.latitude;
  const lng = item?.gps_coordinates?.longitude;
  const { status, text } = parseOpenStatus(item?.hours);

  return {
    name: item?.title || 'Unknown',
    area: normalizeArea(item?.address),
    vibe: item?.description || item?.type || 'Local spot near you',
    rating: Number(item?.rating) || 0,
    knownFor: item?.type || 'Local food',
    price: normalizePrice(item?.price),
    moods: inferMoods(item?.type),
    lat: Number(lat) || 0,
    lng: Number(lng) || 0,
    placeId: item?.place_id ? String(item.place_id) : '',
    _fromApi: true,
    _provider: 'serpapi',
    _openStatus: status,
    _hoursText: text,
  };
}

export function isSerpApiEnabled() {
  return ENABLE_PROXY;
}

/**
 * Query SerpAPI Google Maps search by map center and restaurant query.
 * Returns [] when disabled or request fails.
 */
export async function searchNearbyWithSerpApi(
  location,
  { maxResults = 20, query = 'restaurants' } = {}
) {
  if (!ENABLE_PROXY || !location) return [];

  try {
    const res = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        maxResults,
        query,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (import.meta.env.DEV) {
        const err = await res.json().catch(() => ({}));
        console.warn('[serpApi] search failed:', err);
      }
      return [];
    }

    const data = await res.json();
    const results = Array.isArray(data.local_results)
      ? data.local_results
      : Array.isArray(data.places)
        ? data.places
        : [];

    return results
      .slice(0, maxResults)
      .map(normalizeEntry)
      .filter((p) => p.lat && p.lng);
  } catch {
    return [];
  }
}
