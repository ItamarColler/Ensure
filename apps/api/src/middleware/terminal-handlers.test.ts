import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { Router } from 'express';

import { createApp } from '../app';

import { errorHandler } from './terminal-handlers';

const leakedDetail = 'secret db detail';

function createBoomRouter(): Router {
  const router = Router();

  router.post('/', async () => {
    await Promise.resolve();
    throw new Error(leakedDetail);
  });

  return router;
}

const app = createApp([{ path: '/boom', router: createBoomRouter() }]);
const server = app.listen(0);

await once(server, 'listening');

const address = server.address();
const port = typeof address === 'object' ? (address?.port ?? 0) : 0;

const origin = `http://127.0.0.1:${String(port)}`;

server.unref();

interface Probe {
  status: number;
  contentType: string;
  text: string;
}

async function post(path: string, init?: RequestInit): Promise<Probe> {
  const response = await fetch(`${origin}${path}`, { method: 'POST', ...init });
  const text = await response.text();

  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    text,
  };
}

function assertNoInternalsLeaked(text: string): void {
  assert.ok(!text.includes('/Users'), 'response leaked a filesystem path');
  assert.ok(!text.includes('node_modules'), 'response leaked a module path');
  assert.ok(!text.includes('<pre>'), 'response leaked an html error page');
}

function assertEnvelope(probe: Probe, code: string, message: string): void {
  assert.ok(
    probe.contentType.startsWith('application/json'),
    `expected application/json, got ${probe.contentType}`,
  );
  assert.deepEqual(JSON.parse(probe.text), {
    ok: false,
    error: { code, message },
  });
}

await test('the error handler keeps the four-argument express arity', () => {
  assert.equal(errorHandler.length, 4);
});

await test('a rejecting handler returns a 500 internal envelope', async () => {
  const probe = await post('/api/boom', {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ any: 'body' }),
  });

  assert.equal(probe.status, 500);
  assertEnvelope(probe, 'INTERNAL', 'internal error');
  assert.ok(!probe.text.includes(leakedDetail), 'response leaked the error');
  assertNoInternalsLeaked(probe.text);
});

await test('a malformed json body returns a 400 validation envelope', async () => {
  const probe = await post('/api/boom', {
    headers: { 'content-type': 'application/json' },
    body: '{bad',
  });

  assert.equal(probe.status, 400);
  assertEnvelope(probe, 'VALIDATION_ERROR', 'request body was rejected');
  assertNoInternalsLeaked(probe.text);
});

await test('an oversized body returns a 400 validation envelope', async () => {
  const probe = await post('/api/boom', {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pad: 'x'.repeat(200_000) }),
  });

  assert.equal(probe.status, 400);
  assertEnvelope(probe, 'VALIDATION_ERROR', 'request body was rejected');
});

await test('an unknown route under /api returns a 404 envelope', async () => {
  const probe = await post('/api/nope');

  assert.equal(probe.status, 404);
  assertEnvelope(probe, 'NOT_FOUND', 'route not found');
  assertNoInternalsLeaked(probe.text);
});

await test('an unknown route outside /api returns a 404 envelope', async () => {
  const probe = await post('/nope');

  assert.equal(probe.status, 404);
  assertEnvelope(probe, 'NOT_FOUND', 'route not found');
  assertNoInternalsLeaked(probe.text);
});

server.close();
