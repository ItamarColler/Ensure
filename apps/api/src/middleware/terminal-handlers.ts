import type { Result } from '@ensure/shared';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { sendResult } from '../http/send-result';

const redactedParams = '[redacted]';

function hasBoundParameters(error: unknown): boolean {
  return error instanceof Error && 'params' in error;
}

function redactBoundParameters(error: unknown): unknown {
  if (!hasBoundParameters(error)) {
    return error;
  }

  const { name, message } = error as Error;

  return {
    name,
    message: message.split('\nparams:', 1)[0],
    params: redactedParams,
    cause: redactBoundParameters((error as Error).cause),
  };
}

function isClientBodyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  );
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  const result: Result<never> = {
    ok: false,
    error: { code: 'NOT_FOUND', message: 'route not found' },
  };

  sendResult(res, result);
};

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (isClientBodyError(error)) {
    const rejected: Result<never> = {
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'request body was rejected' },
    };

    sendResult(res, rejected);
    return;
  }

  console.error(redactBoundParameters(error));

  const internal: Result<never> = {
    ok: false,
    error: { code: 'INTERNAL', message: 'internal error' },
  };

  sendResult(res, internal);
}
