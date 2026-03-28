const SERP_ENDPOINT = 'https://serpapi.com/search.json';

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'SerpAPI key is not configured on the server' });
  }

  const { lat, lng, maxResults = 24, query = 'restaurants' } = req.body || {};

  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return badRequest(res, 'lat and lng are required numeric values');
  }

  const safeMaxResults = Math.max(1, Math.min(Number(maxResults), 24));
  const ll = `@${Number(lat)},${Number(lng)},14z`;

  const params = new URLSearchParams({
    engine: 'google_maps',
    type: 'search',
    q: String(query),
    ll,
    api_key: apiKey,
  });

  try {
    const upstream = await fetch(`${SERP_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream SerpAPI request failed',
        details: payload,
      });
    }

    const localResults = Array.isArray(payload.local_results)
      ? payload.local_results.slice(0, safeMaxResults)
      : Array.isArray(payload.places)
        ? payload.places.slice(0, safeMaxResults)
        : [];

    return res.status(200).json({
      ...payload,
      local_results: localResults,
    });
  } catch {
    return res.status(502).json({ error: 'Unable to reach SerpAPI upstream service' });
  }
}
