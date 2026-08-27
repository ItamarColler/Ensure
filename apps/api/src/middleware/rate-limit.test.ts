import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { Router } from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { createApp } from '../app';
import { sendResult } from '../http/send-result';

import { rateLimit } from './rate-limit';

interface CapturedResponse {
  status?: number;
  payload?: unknown;
}

interface ResponseFake {
  status: (code: number) => ResponseFake;
  json: (payload: unknown) => ResponseFake;
}

interface Invocation {
  captured: CapturedResponse;
  nextCalls: number;
}

const clientA = '203.0.113.1';
const clientB = '203.0.113.2';
const clientC = '203.0.113.3';
const forgedClient = '198.51.100.9';

function createResponseFake(captured: CapturedResponse): ResponseFake {
  const fake: ResponseFake = {
    status: (code) => {
      captured.status = code;
      return fake;
    },
    json: (payload) => {
      captured.payload = payload;
      return fake;
    },
  };

  return fake;
}

function invoke(middleware: RequestHandler, ip: string): Invocation {
  const request = { ip } as unknown as Request;
  const captured: CapturedResponse = {};
  let nextCalls = 0;

  const next: NextFunction = () => {
    nextCalls += 1;
  };

  middleware(
    request,
    createResponseFake(captured) as unknown as Response,
    next,
  );

  return { captured, nextCalls };
}

await test('the twenty-first request in a window is rejected with a 429 envelope', () => {
  const middleware = rateLimit({ limit: 20, windowMs: 60_000, now: () => 0 });

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const allowed = invoke(middleware, clientA);

    assert.equal(
      allowed.nextCalls,
      1,
      `request ${String(attempt)} was blocked`,
    );
    assert.equal(allowed.captured.status, undefined);
  }

  const rejected = invoke(middleware, clientA);

  assert.equal(rejected.nextCalls, 0);
  assert.equal(rejected.captured.status, 429);
  assert.deepEqual(rejected.captured.payload, {
    ok: false,
    error: { code: 'RATE_LIMITED', message: 'too many requests' },
  });
});

await test('an exhausted budget for one ip leaves another ip its own full budget', () => {
  const middleware = rateLimit({ limit: 20, windowMs: 60_000, now: () => 0 });

  for (let attempt = 1; attempt <= 25; attempt += 1) {
    invoke(middleware, clientA);
  }

  assert.equal(invoke(middleware, clientA).captured.status, 429);

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const allowed = invoke(middleware, clientB);

    assert.equal(
      allowed.nextCalls,
      1,
      `request ${String(attempt)} was blocked`,
    );
  }

  assert.equal(invoke(middleware, clientB).captured.status, 429);
});

await test('the window slides — expiry frees the budget, a partial advance does not', () => {
  let clock = 0;
  const middleware = rateLimit({
    limit: 2,
    windowMs: 60_000,
    now: () => clock,
  });

  assert.equal(invoke(middleware, clientA).nextCalls, 1);
  clock = 10_000;
  assert.equal(invoke(middleware, clientA).nextCalls, 1);
  assert.equal(invoke(middleware, clientA).captured.status, 429);

  clock = 59_999;
  assert.equal(invoke(middleware, clientA).captured.status, 429);

  clock = 60_000;
  const afterFirstExpired = invoke(middleware, clientA);

  assert.equal(afterFirstExpired.nextCalls, 1);
  assert.equal(invoke(middleware, clientA).captured.status, 429);

  clock = 70_000;
  assert.equal(invoke(middleware, clientA).nextCalls, 1);
});

function createProbeRouter(): Router {
  const router = Router();

  router.post('/', rateLimit({ limit: 2, windowMs: 60_000 }), (_req, res) => {
    sendResult(res, { ok: true, data: 'probe' });
  });

  return router;
}

const app = createApp([{ path: '/probe', router: createProbeRouter() }]);
const server = app.listen(0);

await once(server, 'listening');

const address = server.address();
const port = typeof address === 'object' ? (address?.port ?? 0) : 0;
const origin = `http://127.0.0.1:${String(port)}`;

server.unref();

async function probe(forwardedFor: string): Promise<number> {
  const response = await fetch(`${origin}/api/probe`, {
    method: 'POST',
    headers: { 'x-forwarded-for': forwardedFor },
  });

  await response.text();

  return response.status;
}

await test('the limiter keys on the forwarded client ip, not on the proxy', async () => {
  assert.equal(await probe(clientA), 200);
  assert.equal(await probe(clientA), 200);
  assert.equal(await probe(clientA), 429);
  assert.equal(await probe(clientB), 200);
});

await test('a client cannot escape its budget by forging a forwarded-for prefix', async () => {
  assert.equal(await probe(clientC), 200);
  assert.equal(await probe(clientC), 200);
  assert.equal(await probe(`${forgedClient}, ${clientC}`), 429);
});

server.close();
