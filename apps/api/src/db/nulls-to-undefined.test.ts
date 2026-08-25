import assert from 'node:assert/strict';
import test from 'node:test';

import { nullsToUndefined } from './nulls-to-undefined';

await test('a SQL NULL property comes out as undefined', () => {
  const mapped = nullsToUndefined({ note: null });

  assert.equal(mapped.note, undefined);
  assert.equal(Object.hasOwn(mapped, 'note'), true);
});

await test('an empty string passes through unchanged', () => {
  const mapped = nullsToUndefined({ note: '' as string | null });

  assert.equal(mapped.note, '');
});

await test('0 and false pass through unchanged', () => {
  const mapped = nullsToUndefined({
    total: 0 as number | null,
    ok: false as boolean | null,
  });

  assert.equal(mapped.total, 0);
  assert.equal(mapped.ok, false);
});

await test('a pg numeric string is preserved byte for byte', () => {
  const mapped = nullsToUndefined({ premium: '123.45' as string | null });

  assert.equal(mapped.premium, '123.45');
  assert.equal(typeof mapped.premium, 'string');
});

await test('never-nullable properties keep their exact type and value', () => {
  const checkedAt = new Date('2026-08-25T10:00:00.000Z');
  const mapped = nullsToUndefined({ id: 7, ok: true, checkedAt, note: null });

  const widened: { id: number; ok: boolean; checkedAt: Date } = mapped;

  assert.equal(widened.id, 7);
  assert.equal(widened.ok, true);
  assert.equal(widened.checkedAt, checkedAt);
  assert.equal(mapped.note, undefined);
});
