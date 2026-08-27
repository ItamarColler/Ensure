import type { Result } from '@ensure/shared';
import type { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { readTokenCookie } from '../http/auth-cookies';
import { sendResult } from '../http/send-result';

export type AuthedHandler = (
  userId: string,
  req: Request,
  res: Response,
) => Promise<void>;

const notAuthenticated: Result<never> = {
  ok: false,
  error: { code: 'UNAUTHORIZED', message: 'not authenticated' },
};

function readUserId(token: string): string | undefined {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded !== 'object' || typeof decoded.sub !== 'string') {
      return undefined;
    }

    return decoded.sub;
  } catch {
    return undefined;
  }
}

export function requireAuth(handler: AuthedHandler): RequestHandler {
  return (req, res) => {
    const token = readTokenCookie(req);

    if (!token) {
      sendResult(res, notAuthenticated);
      return;
    }

    const userId = readUserId(token);

    if (!userId) {
      sendResult(res, notAuthenticated);
      return;
    }

    return handler(userId, req, res);
  };
}
