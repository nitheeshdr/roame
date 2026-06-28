/**
 * Geo helpers for PostGIS-backed location queries.
 *
 * Prisma cannot natively model `geography(Point, 4326)` columns, so location
 * columns are declared `Unsupported("geography(Point, 4326)")` in the schema
 * and read/written via raw SQL. These builders centralize the WKT / ST_*
 * expressions so feature code never hand-writes spatial SQL.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export const EARTH_RADIUS_METERS = 6_371_000;

export function isValidLatLng(point: LatLng): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

/**
 * WKT representation for a point. PostGIS expects lon/lat order.
 * Use as: ST_GeographyFromText('SRID=4326;POINT(lng lat)')
 */
export function toPointWKT({ lat, lng }: LatLng): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

/**
 * Haversine distance in meters between two points. Useful for in-memory
 * sorting/tests; PostGIS ST_Distance is the source of truth in the DB.
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Build a parameterized `ST_DWithin` predicate for a "nearby" query.
 * Returns the SQL fragment and the ordered params to interpolate safely.
 *
 *   const { sql, params } = nearbyPredicate('a.location', center, 5000);
 *   prisma.$queryRawUnsafe(`SELECT ... WHERE ${sql}`, ...params)
 */
export function nearbyPredicate(
  column: string,
  center: LatLng,
  radiusMeters: number,
): { sql: string; params: [string, number] } {
  return {
    sql: `ST_DWithin(${column}, ST_GeographyFromText($1), $2)`,
    params: [toPointWKT(center), radiusMeters],
  };
}
