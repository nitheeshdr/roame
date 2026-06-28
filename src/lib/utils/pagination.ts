/**
 * Cursor + offset pagination helpers shared by API list endpoints.
 */

export interface PageParams {
  page: number; // 1-based
  pageSize: number;
}

export interface PageResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Clamp/normalize raw query params into safe page params. */
export function normalizePageParams(input: {
  page?: number | string | null;
  pageSize?: number | string | null;
}): PageParams {
  const page = Math.max(1, Number(input.page) || 1);
  const rawSize = Number(input.pageSize) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  return { page, pageSize };
}

/** Convert page params to Prisma `skip`/`take`. */
export function toPrismaSkipTake({ page, pageSize }: PageParams): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPageResult<T>(
  data: T[],
  total: number,
  { page, pageSize }: PageParams,
): PageResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data,
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
