import assert from 'node:assert/strict';
import test from 'node:test';

import { nullsToUndefined } from './nulls-to-undefined';
import type { HealthEventRow } from './rows';

await test('a SQL NULL property comes out as undefined', () => {
  const row: { note: string | null } = { note: null };

  const mapped = nullsToUndefined(row);

  assert.equal(mapped.note, undefined);
  assert.equal(Object.hasOwn(mapped, 'note'), true);
});

await test('an empty string passes through unchanged', () => {
  const row: { note: string | null } = { note: '' };

  const mapped = nullsToUndefined(row);

  assert.equal(mapped.note, '');
});

await test('0 and false pass through unchanged', () => {
  const row: { total: number | null; ok: boolean | null } = {
    total: 0,
    ok: false,
  };

  const mapped = nullsToUndefined(row);

  assert.equal(mapped.total, 0);
  assert.equal(mapped.ok, false);
});

await test('a pg numeric string is preserved byte for byte', () => {
  const row: { premium: string | null } = { premium: '123.45' };

  const mapped = nullsToUndefined(row);

  assert.equal(mapped.premium, '123.45');
  assert.equal(typeof mapped.premium, 'string');
});

await test('never-nullable properties keep their exact type and value', () => {
  const checkedAt = new Date('2026-08-25T10:00:00.000Z');
  const row: HealthEventRow = { id: 7, checkedAt, ok: true, note: null };

  const mapped = nullsToUndefined(row);
  const widened: { id: number; checkedAt: Date; ok: boolean } = mapped;

  assert.equal(widened.id, 7);
  assert.equal(widened.checkedAt, checkedAt);
  assert.equal(widened.ok, true);
  assert.equal(mapped.note, undefined);
});
