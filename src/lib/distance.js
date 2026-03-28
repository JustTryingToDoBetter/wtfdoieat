/**
 * Haversine distance between two lat/lng points in km.
 */
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/**
 * Rough in-city ETA in minutes based on distance.
 * This is intentionally simple and stable for quick decision hints.
 */
export function estimateTravelMinutes(km) {
  if (typeof km !== 'number' || Number.isNaN(km) || km < 0) return null;

  // Approx city average including traffic lights and turns.
  const averageKmh = 26;
  const minutes = (km / averageKmh) * 60;

  // Keep hint realistic for nearby places.
  return Math.max(3, Math.round(minutes));
}

export function formatEta(minutes) {
  if (minutes == null) return null;
  return `~${minutes} min away`;
}
