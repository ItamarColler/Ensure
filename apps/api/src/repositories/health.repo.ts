import { count } from 'drizzle-orm';

import { nullsToUndefined } from '../db/nulls-to-undefined';
import { db } from '../db/pool';
import type { HealthEventRow } from '../db/rows';
import { healthEvents } from '../db/schema';

export interface HealthCheck {
  healthEvents: number;
  note?: string;
}

async function countHealthEvents() {
  return db.select({ total: count() }).from(healthEvents);
}

type HealthEventCount = Awaited<ReturnType<typeof countHealthEvents>>;

export async function recordHealthCheck(): Promise<HealthCheck> {
  const inserted: HealthEventRow[] = await db
    .insert(healthEvents)
    .values({ ok: true })
    .returning();

  const rows: HealthEventCount = await countHealthEvents();
  const total = rows[0]?.total ?? 0;

  const recorded = inserted[0];

  if (!recorded) {
    return { healthEvents: total };
  }

  const { note } = nullsToUndefined(recorded);

  return {
    healthEvents: total,
    ...(note !== undefined && { note }),
  };
}
