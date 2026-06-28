import { prisma } from './db';
import { toPointWKT, type LatLng } from './utils';

/**
 * Helpers for the PostGIS `geography` columns Prisma manages as Unsupported.
 * Locations are written/read via raw SQL (see docs/DATABASE.md).
 */

/** Set a geography(Point) column for a row. Table/column are trusted constants. */
export async function setGeographyPoint(
  table: string,
  column: string,
  id: string,
  point: LatLng,
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE "${table}" SET "${column}" = ST_GeographyFromText($1) WHERE id = $2`,
    toPointWKT(point),
    id,
  );
}

export interface NearbyRow {
  id: string;
  distance_m: number;
}

/**
 * Return ids within `radiusMeters` of `center`, nearest first, with an optional
 * extra WHERE clause (already-safe SQL fragment using no user input).
 */
export async function nearbyIds(params: {
  table: string;
  column: string;
  center: LatLng;
  radiusMeters: number;
  take: number;
  skip: number;
  extraWhere?: string;
}): Promise<NearbyRow[]> {
  const { table, column, center, radiusMeters, take, skip, extraWhere } = params;
  const where = `"${column}" IS NOT NULL
      AND ST_DWithin("${column}", ST_GeographyFromText($1), $2)
      ${extraWhere ? `AND ${extraWhere}` : ''}`;
  return prisma.$queryRawUnsafe<NearbyRow[]>(
    `SELECT id, ST_Distance("${column}", ST_GeographyFromText($1)) AS distance_m
       FROM "${table}"
      WHERE ${where}
      ORDER BY distance_m ASC
      LIMIT $3 OFFSET $4`,
    toPointWKT(center),
    radiusMeters,
    take,
    skip,
  );
}
