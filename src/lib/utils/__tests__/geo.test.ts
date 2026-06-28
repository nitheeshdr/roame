import { describe, expect, it } from 'vitest';
import { haversineMeters, isValidLatLng, nearbyPredicate, toPointWKT } from '../geo';

const bengaluru = { lat: 12.9716, lng: 77.5946 };
const mysuru = { lat: 12.2958, lng: 76.6394 };

describe('geo', () => {
  it('validates lat/lng bounds', () => {
    expect(isValidLatLng(bengaluru)).toBe(true);
    expect(isValidLatLng({ lat: 200, lng: 0 })).toBe(false);
    expect(isValidLatLng({ lat: NaN, lng: 0 })).toBe(false);
  });

  it('emits PostGIS WKT in lng/lat order', () => {
    expect(toPointWKT(bengaluru)).toBe('SRID=4326;POINT(77.5946 12.9716)');
  });

  it('computes a realistic haversine distance', () => {
    const meters = haversineMeters(bengaluru, mysuru);
    // ~127 km between the two cities.
    expect(meters).toBeGreaterThan(120_000);
    expect(meters).toBeLessThan(135_000);
  });

  it('builds a parameterized ST_DWithin predicate', () => {
    const { sql, params } = nearbyPredicate('a.location', bengaluru, 5000);
    expect(sql).toContain('ST_DWithin(a.location');
    expect(params).toEqual(['SRID=4326;POINT(77.5946 12.9716)', 5000]);
  });
});
