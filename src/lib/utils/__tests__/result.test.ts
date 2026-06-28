import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, mapResult, ok, unwrap } from '../result';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  toErrorResponse,
} from '../errors';

describe('result', () => {
  it('constructs and narrows ok/err', () => {
    const good = ok(42);
    const bad = err(new ValidationError('nope'));
    expect(isOk(good)).toBe(true);
    expect(isErr(bad)).toBe(true);
    if (isOk(good)) expect(good.value).toBe(42);
  });

  it('maps only the ok branch', () => {
    expect(mapResult(ok(2), (n) => n * 3)).toEqual(ok(6));
    const e = err(new NotFoundError('x'));
    expect(mapResult(e, (n: number) => n)).toBe(e);
  });

  it('unwrap throws the underlying error', () => {
    expect(unwrap(ok('hi'))).toBe('hi');
    expect(() => unwrap(err(new ConflictError('dup')))).toThrow('dup');
  });
});

describe('toErrorResponse', () => {
  it('maps AppError to its status + code', () => {
    expect(toErrorResponse(new ValidationError('bad', { field: 'x' }))).toEqual({
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', message: 'bad', details: { field: 'x' } } },
    });
    expect(toErrorResponse(new NotFoundError('missing')).status).toBe(404);
  });

  it('never leaks internals for unknown errors', () => {
    const res = toErrorResponse(new Error('db password is hunter2'));
    expect(res.status).toBe(500);
    expect(res.body.error.message).not.toContain('hunter2');
    expect(res.body.error.code).toBe('INTERNAL');
  });
});
