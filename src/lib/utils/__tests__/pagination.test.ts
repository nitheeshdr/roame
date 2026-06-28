import { describe, expect, it } from 'vitest';
import {
  MAX_PAGE_SIZE,
  buildPageResult,
  normalizePageParams,
  toPrismaSkipTake,
} from '../pagination';

describe('pagination', () => {
  it('clamps page and pageSize to safe ranges', () => {
    expect(normalizePageParams({ page: 0, pageSize: 9999 })).toEqual({
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    expect(normalizePageParams({ page: '3', pageSize: '25' })).toEqual({ page: 3, pageSize: 25 });
    expect(normalizePageParams({})).toEqual({ page: 1, pageSize: 20 });
  });

  it('computes skip/take', () => {
    expect(toPrismaSkipTake({ page: 3, pageSize: 20 })).toEqual({ skip: 40, take: 20 });
  });

  it('builds page metadata', () => {
    const result = buildPageResult([1, 2, 3], 45, { page: 2, pageSize: 20 });
    expect(result).toMatchObject({
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });
});
