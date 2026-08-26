export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL'
  | 'VEHICLE_NOT_FOUND'
  | 'UPSTREAM_TIMEOUT'
  | 'RATE_LIMITED';

export type ApiError =
  | { code: 'VALIDATION_ERROR'; message: string; details?: unknown }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'UPSTREAM_ERROR'; message: string }
  | { code: 'INTERNAL'; message: string }
  | { code: 'VEHICLE_NOT_FOUND'; message: string }
  | { code: 'UPSTREAM_TIMEOUT'; message: string }
  | { code: 'RATE_LIMITED'; message: string };

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
