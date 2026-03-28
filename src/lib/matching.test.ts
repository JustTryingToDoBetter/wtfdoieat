import { describe, expect, it } from 'vitest';
import { getMatches } from './matching';

describe('getMatches', () => {
  it('returns up to three matches for valid mood/budget', () => {
    const results = getMatches('hangry', 'mid', null);

    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('attaches distance metadata when user location is provided', () => {
    const results = getMatches('comfort', 'budget', { lat: -33.9249, lng: 18.4241 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => typeof r._dist === 'number')).toBe(true);
  });

  it('falls back to general pool for unknown inputs', () => {
    const results = getMatches('unknown' as never, 'unknown' as never, null, []);

    expect(results.length).toBeGreaterThan(0);
  });
});
