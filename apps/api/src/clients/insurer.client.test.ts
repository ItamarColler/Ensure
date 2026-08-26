import assert from 'node:assert/strict';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import test from 'node:test';

import type { ApiErrorCode, Result, VehicleInfo } from '@ensure/shared';

import { InsurerClient } from './insurer.client';

type StubHandler = (request: IncomingMessage, response: ServerResponse) => void;

interface Stub {
  client: InsurerClient;
  attempts: () => number;
  close: () => Promise<void>;
}

const hebrewVehicle: VehicleInfo = {
  license_plate: '12345678',
  manufacturer: '\u{5D8}\u{5D5}\u{5D9}\u{5D5}\u{5D8}\u{5D4}',
  model: '\u{5E7}\u{5D5}\u{5E8}\u{5D5}\u{5DC}\u{5D4}',
  year: 2020,
  color: '\u{5DC}\u{5D1}\u{5DF}',
};

async function startStub(
  handler: StubHandler,
  lookupTimeoutMs = 2000,
): Promise<Stub> {
  let attempts = 0;

  const server = createServer((request, response) => {
    attempts += 1;
    handler(request, response);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = address instanceof Object ? address.port : undefined;

  if (port === undefined) {
    throw new Error('stub upstream did not bind a TCP port');
  }

  process.env['INSURER_WEBHOOK_URL'] = `http://127.0.0.1:${String(port)}`;
  process.env['INSURER_LOOKUP_TIMEOUT_MS'] = String(lookupTimeoutMs);

  return {
    client: new InsurerClient(),
    attempts: () => attempts,
    close: async () => {
      delete process.env['INSURER_WEBHOOK_URL'];
      delete process.env['INSURER_LOOKUP_TIMEOUT_MS'];

      server.closeAllConnections();

      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

function respondWith(status: number, body: string): StubHandler {
  return (_request, response) => {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(body);
  };
}

const neverAnswers: StubHandler = (request) => {
  request.resume();
};

function errorCode(result: Result<VehicleInfo>): ApiErrorCode | undefined {
  return result.ok ? undefined : result.error.code;
}

function vehicleOf(result: Result<VehicleInfo>): VehicleInfo | undefined {
  return result.ok ? result.data : undefined;
}

async function lookupAgainst(
  handler: StubHandler,
  lookupTimeoutMs?: number,
): Promise<{ result: Result<VehicleInfo>; attempts: number }> {
  const stub = await startStub(handler, lookupTimeoutMs);

  try {
    const result = await stub.client.lookupVehicle('12345678');

    return { result, attempts: stub.attempts() };
  } finally {
    await stub.close();
  }
}

await test('an upstream 404 maps to VEHICLE_NOT_FOUND', async () => {
  const { result } = await lookupAgainst(respondWith(404, '{"detail":"nope"}'));

  assert.equal(errorCode(result), 'VEHICLE_NOT_FOUND');
});

await test('an upstream 400 maps to VALIDATION_ERROR', async () => {
  const { result } = await lookupAgainst(respondWith(400, '{"detail":"bad"}'));

  assert.equal(errorCode(result), 'VALIDATION_ERROR');
});

await test('an upstream 422 maps to VALIDATION_ERROR', async () => {
  const { result } = await lookupAgainst(respondWith(422, '{"detail":"bad"}'));

  assert.equal(errorCode(result), 'VALIDATION_ERROR');
});

await test('an upstream 500 maps to UPSTREAM_ERROR', async () => {
  const { result } = await lookupAgainst(respondWith(500, '{"detail":"boom"}'));

  assert.equal(errorCode(result), 'UPSTREAM_ERROR');
});

await test('a 200 carrying a non-JSON body maps to UPSTREAM_ERROR', async () => {
  const { result } = await lookupAgainst(respondWith(200, 'not json at all'));

  assert.equal(errorCode(result), 'UPSTREAM_ERROR');
});

await test('a 200 whose data fails the schema maps to UPSTREAM_ERROR', async () => {
  const { result } = await lookupAgainst(
    respondWith(200, '{"success":true,"data":{"manufacturer":""}}'),
  );

  assert.equal(errorCode(result), 'UPSTREAM_ERROR');
});

await test('a valid 200 returns the hebrew payload byte for byte', async () => {
  const { result } = await lookupAgainst(
    respondWith(200, JSON.stringify({ success: true, data: hebrewVehicle })),
  );

  assert.equal(result.ok, true);
  assert.deepEqual(vehicleOf(result), hebrewVehicle);
});

await test('an upstream that never answers times out after exactly two attempts', async () => {
  const { result, attempts } = await lookupAgainst(neverAnswers, 100);

  assert.equal(errorCode(result), 'UPSTREAM_TIMEOUT');
  assert.equal(attempts, 2);
});
