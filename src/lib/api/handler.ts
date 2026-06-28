import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ValidationError, toErrorResponse, type Result } from '@/lib/utils';

/**
 * Thin, consistent boundary for Route Handlers:
 *   • runs the handler
 *   • turns AppError / unknown throws into stable JSON error bodies
 *   • never leaks internals on 500s
 */
export async function apiHandler<T>(
  fn: () => Promise<T>,
  init?: { status?: number },
): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data, { status: init?.status ?? 200 });
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('[api] unhandled error:', error);
    }
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

/** Unwrap a service Result, throwing the AppError so apiHandler maps it. */
export function unwrapResult<T>(result: Result<T, AppError>): T {
  if (result.ok) return result.value;
  throw result.error;
}

/** Validate a JSON request body against a Zod schema or throw ValidationError. */
export async function parseJson<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
  return parseWith(schema, raw);
}

/** Validate URL search params against a Zod schema or throw ValidationError. */
export function parseQuery<S extends z.ZodTypeAny>(request: Request, schema: S): z.infer<S> {
  const url = new URL(request.url);
  const obj = Object.fromEntries(url.searchParams.entries());
  return parseWith(schema, obj);
}

function parseWith<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError('Validation failed.', result.error.flatten());
  }
  return result.data;
}
