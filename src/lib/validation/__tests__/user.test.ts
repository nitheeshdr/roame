import { describe, expect, it } from 'vitest';
import { updateProfileSchema, userListQuerySchema } from '../user';

describe('user schemas', () => {
  it('coerces and defaults list query params', () => {
    const parsed = userListQuerySchema.parse({ page: '2', search: ' alice ' });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.includeDeleted).toBe(false);
  });

  it('rejects an unknown role filter', () => {
    expect(userListQuerySchema.safeParse({ role: 'WIZARD' }).success).toBe(false);
  });

  it('validates username format on profile update', () => {
    expect(updateProfileSchema.safeParse({ username: 'good_name1' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ username: 'Bad Name' }).success).toBe(false);
  });
});
