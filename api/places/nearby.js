const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.priceLevel',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.currentOpeningHours.openNow',
  'places.currentOpeningHours.weekdayDescriptions',
].join(',');

const INCLUDED_TYPES = [
  'restaurant',
  'fast_food_restaurant',
  'cafe',
  'meal_takeaway',
  'african_restaurant',
  'seafood_restaurant',
  'sushi_restaurant',
  'hamburger_restaurant',
  'pizza_restaurant',
];

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Google Places key is not configured on the server' });
  }

  const { lat, lng, radiusMeters = 6500, maxResults = 24 } = req.body || {};

  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return badRequest(res, 'lat and lng are required numeric values');
  }

  const safeRadius = Math.max(500, Math.min(Number(radiusMeters), 50000));
  const safeMaxResults = Math.max(1, Math.min(Number(maxResults), 24));

  const body = {
    includedTypes: INCLUDED_TYPES,
    maxResultCount: safeMaxResults,
    locationRestriction: {
      circle: {
        center: { latitude: Number(lat), longitude: Number(lng) },
        radius: safeRadius,
      },
    },
    rankPreference: 'DISTANCE',
  };

  try {
    const upstream = await fetch(PLACES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream Google Places request failed',
        details: payload?.error || payload,
      });
    }

    return res.status(200).json(payload);
  } catch {
    return res.status(502).json({ error: 'Unable to reach Google Places upstream service' });
  }
}
