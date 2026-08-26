import type { ApiErrorCode, Result } from '@ensure/shared';
import type { Response } from 'express';

const errorStatuses: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
  VEHICLE_NOT_FOUND: 404,
  UPSTREAM_TIMEOUT: 504,
  RATE_LIMITED: 429,
};

export function sendResult<T>(res: Response, result: Result<T>): void {
  if (result.ok) {
    res.status(200).json(result);
    return;
  }

  res.status(errorStatuses[result.error.code]).json(result);
}
