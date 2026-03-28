/**
 * Google Places API (New) integration.
 *
 * This client never calls Google directly. It calls our internal
 * serverless proxy at /api/places/nearby so API keys stay server-side.
 *
 * Enable with VITE_ENABLE_GOOGLE_PROXY=true.
 */

const ENABLE_PROXY = import.meta.env.VITE_ENABLE_GOOGLE_PROXY === 'true';
const PROXY_ENDPOINT = '/api/places/nearby';

/** True when a Google Places API key has been configured. */
export function isPlacesEnabled() {
  return ENABLE_PROXY;
}

/**
 * Map Google Places price level to our internal price tier.
 * @param {string} level - Google PRICE_LEVEL_* enum value
 */
function normalizePriceLevel(level) {
  const map = {
    PRICE_LEVEL_FREE: 'local',
    PRICE_LEVEL_INEXPENSIVE: 'local',
    PRICE_LEVEL_MODERATE: 'budget',
    PRICE_LEVEL_EXPENSIVE: 'mid',
    PRICE_LEVEL_VERY_EXPENSIVE: 'splurge',
  };
  return map[level] ?? 'budget';
}

/**
 * Pull the neighbourhood/suburb from a formatted address.
 * e.g. "45 Long St, Cape Town City Centre, Cape Town, 8001" → "Cape Town City Centre"
 */
function extractArea(formattedAddress) {
  if (!formattedAddress) return 'Cape Town';
  const parts = formattedAddress.split(',').map((s) => s.trim());
  // Second part is usually neighbourhood; first is street
  return parts[1] ?? parts[0] ?? 'Cape Town';
}

/**
 * Infer mood tags from the restaurant's primary type.
 * @param {string} primaryType - e.g. "fast_food_restaurant"
 */
function inferMoods(primaryType = '') {
  if (primaryType.includes('fast_food')) return ['hangry', 'lazy'];
  if (primaryType.includes('cafe')) return ['lazy', 'treat', 'comfort'];
  if (primaryType.includes('seafood')) return ['treat', 'foodie', 'adventurous'];
  if (primaryType.includes('sushi')) return ['treat', 'foodie', 'social'];
  if (primaryType.includes('african')) return ['adventurous', 'comfort', 'social'];
  if (primaryType.includes('hamburger')) return ['hangry', 'treat'];
  return ['hangry', 'comfort', 'social'];
}

/**
 * Transform a raw Google Places API place object into our restaurant schema.
 */
function normalizePlace(place) {
  const openNow = place.currentOpeningHours?.openNow;
  const openStatus = openNow === true ? 'open' : openNow === false ? 'closed' : 'unknown';

  const hoursText =
    openStatus === 'open' ? 'Open now' : openStatus === 'closed' ? 'Closed now' : null;

  return {
    name: place.displayName?.text ?? 'Unknown',
    area: extractArea(place.formattedAddress),
    vibe: place.primaryTypeDisplayName?.text ?? 'Local restaurant near you',
    rating: place.rating ?? 0,
    knownFor: place.primaryTypeDisplayName?.text ?? 'Local spot',
    price: normalizePriceLevel(place.priceLevel),
    moods: inferMoods(place.primaryType),
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    placeId: place.id ?? '',
    _fromApi: true, // flag so UI can show "Live" badge if desired
    _provider: 'google_places',
    _openStatus: openStatus,
    _hoursText: hoursText,
  };
}

/**
 * Search for restaurants near a user's location using the Places API (New).
 * Returns an empty array when:
 *  - No API key is configured
 *  - The API request fails for any reason
 *
 * @param {{ lat: number, lng: number }} location
 * @param {{ radiusMeters?: number, maxResults?: number }} options
 * @returns {Promise<import('../data/restaurants').Restaurant[]>}
 */
export async function searchNearby(location, { radiusMeters = 5000, maxResults = 20 } = {}) {
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
        radiusMeters,
        maxResults,
      }),
      signal: AbortSignal.timeout(8000), // 8s — same timeout as geolocation
    });

    if (!res.ok) {
      if (import.meta.env.DEV) {
        const err = await res.json().catch(() => ({}));
        console.warn('[placesApi] searchNearby failed', {
          status: res.status,
          statusText: res.statusText,
          endpoint: PROXY_ENDPOINT,
          details: err,
          hint: 'Check server env GOOGLE_PLACES_API_KEY and serverless logs.',
        });
      }
      return [];
    }

    const data = await res.json();
    return (data.places ?? [])
      .filter((p) => p.businessStatus !== 'CLOSED_PERMANENTLY')
      .map(normalizePlace);
  } catch {
    // Network error, timeout, or AbortError — degrade gracefully
    return [];
  }
}
