import type { Result } from '@ensure/shared';
import type { RequestHandler } from 'express';

import { sendResult } from '../http/send-result';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

const unknownClientKey = 'unknown';

function resolveKey(ip: string | undefined): string {
  if (!ip) {
    return unknownClientKey;
  }

  return ip;
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const { limit, windowMs } = options;
  const readClock = options.now ?? Date.now;
  const hits = new Map<string, number[]>();

  return (req, res, next) => {
    const currentTime = readClock();

    for (const [key, timestamps] of hits) {
      const fresh = timestamps.filter(
        (timestamp) => currentTime - timestamp < windowMs,
      );

      if (fresh.length > 0) {
        hits.set(key, fresh);
      } else {
        hits.delete(key);
      }
    }

    const clientKey = resolveKey(req.ip);
    const recent = hits.get(clientKey) ?? [];

    if (recent.length >= limit) {
      const result: Result<never> = {
        ok: false,
        error: { code: 'RATE_LIMITED', message: 'too many requests' },
      };

      sendResult(res, result);
      return;
    }

    hits.set(clientKey, [...recent, currentTime]);
    next();
  };
}
