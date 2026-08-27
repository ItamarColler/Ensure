import type { IssuePolicyRequest } from '@ensure/shared';
import { eq } from 'drizzle-orm';

import type { DbExecutor } from '../db/pool';
import { db } from '../db/pool';
import type { PolicyApplicantRow } from '../db/rows';
import { policyApplicants } from '../db/schema';

export async function insertPolicyApplicant(
  tx: DbExecutor,
  payload: IssuePolicyRequest,
): Promise<PolicyApplicantRow> {
  const inserted: PolicyApplicantRow[] = await tx
    .insert(policyApplicants)
    .values({
      applicationId: payload.applicationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      address: payload.address,
      nationalId: payload.nationalId,
      phone: payload.phone,
      driversCount: payload.driversCount,
      familyStatus: payload.familyStatus,
    })
    .returning();

  const applicant = inserted[0];

  if (!applicant) {
    throw new Error('policy applicant insert returned no row');
  }

  return applicant;
}

export async function findPolicyApplicantByApplicationId(
  applicationId: string,
): Promise<PolicyApplicantRow | undefined> {
  const rows: PolicyApplicantRow[] = await db
    .select()
    .from(policyApplicants)
    .where(eq(policyApplicants.applicationId, applicationId))
    .limit(1);

  return rows[0];
}
