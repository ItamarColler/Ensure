export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL';

export type ApiError =
  | { code: 'VALIDATION_ERROR'; message: string; details?: unknown }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'UPSTREAM_ERROR'; message: string }
  | { code: 'INTERNAL'; message: string };

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
