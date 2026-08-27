import { eq } from 'drizzle-orm';

import type { DbExecutor } from '../db/pool';
import { db } from '../db/pool';
import type { PolicyRow } from '../db/rows';
import { policies } from '../db/schema';

export async function insertPolicy(
  tx: DbExecutor,
  applicationId: string,
  premiumAmount: number,
): Promise<PolicyRow> {
  const inserted: PolicyRow[] = await tx
    .insert(policies)
    .values({ applicationId, premiumAmount })
    .returning();

  const policy = inserted[0];

  if (!policy) {
    throw new Error('policy insert returned no row');
  }

  return policy;
}

export async function findPolicyByApplicationId(
  applicationId: string,
): Promise<PolicyRow | undefined> {
  const rows: PolicyRow[] = await db
    .select()
    .from(policies)
    .where(eq(policies.applicationId, applicationId))
    .limit(1);

  return rows[0];
}
