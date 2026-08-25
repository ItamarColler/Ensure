import { count } from 'drizzle-orm';

import { db } from '../db/pool';
import { healthEvents } from '../db/schema';

async function countHealthEvents() {
  return db.select({ total: count() }).from(healthEvents);
}

type HealthEventCount = Awaited<ReturnType<typeof countHealthEvents>>;

export async function recordHealthCheck(): Promise<number> {
  await db.insert(healthEvents).values({ ok: true });

  const rows: HealthEventCount = await countHealthEvents();

  return rows[0]?.total ?? 0;
}
