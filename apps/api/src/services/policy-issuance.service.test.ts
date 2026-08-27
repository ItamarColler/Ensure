import assert from 'node:assert/strict';
import test from 'node:test';

import type { PolicyIssuedResponse } from '@ensure/shared';

process.env['DATABASE_URL'] ??= 'postgres://ensure:ensure@postgres:5432/ensure';

const { replayOrRethrow } = await import('./policy-issuance.service');

const applicationId = '11111111-2222-3333-4444-555555555555';

const issuedPolicy: PolicyIssuedResponse = {
  policyNumber: 'POL-100001',
  premiumAmount: 5239,
  status: 'pending_review',
  vehicle: {
    license_plate: '12345678',
    manufacturer: '\u{5D8}\u{5D5}\u{5D9}\u{5D5}\u{5D8}\u{5D4}',
    model: '\u{5E7}\u{5D5}\u{5E8}\u{5D5}\u{5DC}\u{5D4}',
    year: 2019,
    color: '\u{5DC}\u{5D1}\u{5DF}',
  },
  coverage: { tier: 'comprehensive', addOns: ['towing', 'glass'] },
  driversCount: 2,
  familyStatus: 'married',
};

const issuedStore = new Map<string, PolicyIssuedResponse>([
  [applicationId, issuedPolicy],
]);

const emptyStore = new Map<string, PolicyIssuedResponse>();

function lookupIssued(id: string): Promise<PolicyIssuedResponse | undefined> {
  return Promise.resolve(issuedStore.get(id));
}

function lookupMissing(id: string): Promise<PolicyIssuedResponse | undefined> {
  return Promise.resolve(emptyStore.get(id));
}

function errorWithCode(code: string): Error {
  const error = new Error('duplicate key value violates unique constraint');
  Reflect.set(error, 'code', code);
  return error;
}

await test('a unique violation with an existing policy replays as a success envelope', async () => {
  const result = await replayOrRethrow(
    errorWithCode('23505'),
    applicationId,
    lookupIssued,
  );

  assert.deepEqual(result, { ok: true, data: issuedPolicy });
});

await test('a unique violation with no policy row rethrows as a genuine fault', async () => {
  const thrown = errorWithCode('23505');

  await assert.rejects(
    replayOrRethrow(thrown, applicationId, lookupMissing),
    thrown,
  );
});

await test('an error that is not a unique violation is rethrown unchanged', async () => {
  const thrown = errorWithCode('42P01');

  await assert.rejects(
    replayOrRethrow(thrown, applicationId, lookupIssued),
    thrown,
  );
});

await test('a unique violation wrapped by the driver is unwrapped through cause', async () => {
  const wrapped = new Error('Failed query', { cause: errorWithCode('23505') });

  const result = await replayOrRethrow(wrapped, applicationId, lookupIssued);

  assert.deepEqual(result, { ok: true, data: issuedPolicy });
});
