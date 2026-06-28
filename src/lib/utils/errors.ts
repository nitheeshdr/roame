/**
 * Typed application error hierarchy. Each error carries a stable `code`, an
 * HTTP `status`, and optional `details`. The API layer maps these to JSON
 * error responses via `toErrorResponse`.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly status: number;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly status = 422;
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED' as const;
  readonly status = 401;
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN' as const;
  readonly status = 403;
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND' as const;
  readonly status = 404;
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT' as const;
  readonly status = 409;
}

export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMITED' as const;
  readonly status = 429;
}

export class InternalError extends AppError {
  readonly code = 'INTERNAL' as const;
  readonly status = 500;
}

export interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

/** Convert any thrown/returned value into a stable error response shape. */
export function toErrorResponse(error: unknown): { status: number; body: ErrorResponseBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message, details: error.details } },
    };
  }
  // Unknown/unexpected — never leak internals to the client.
  return {
    status: 500,
    body: { error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } },
  };
}
