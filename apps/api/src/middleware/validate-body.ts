import type { Result } from '@ensure/shared';
import type { Request, RequestHandler } from 'express';
import type { z } from 'zod';

import { sendResult } from '../http/send-result';

export function validateBody<T extends z.ZodType>(
  schema: T,
): RequestHandler<Request['params'], unknown, z.output<T>> {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const result: Result<never> = {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'request body failed validation',
        },
      };

      sendResult(res, result);
      return;
    }

    req.body = parsed.data;
    next();
  };
}
