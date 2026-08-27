import type {
  IssuePolicyRequest,
  PolicyIssuedResponse,
  Result,
} from '@ensure/shared';
import { estimatePremium, familyStatusSchema } from '@ensure/shared';

import { db } from '../db/pool';
import {
  findApplicationById,
  findPersistedDraft,
  markApplicationPendingReview,
} from '../repositories/application.repo';
import {
  findPolicyApplicantByApplicationId,
  insertPolicyApplicant,
} from '../repositories/policy-applicant.repo';
import {
  findPolicyByApplicationId,
  insertPolicy,
} from '../repositories/policy.repo';

const uniqueViolationCode = '23505';

const applicationNotFound: Result<never> = {
  ok: false,
  error: { code: 'NOT_FOUND', message: 'application not found' },
};

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;

  while (current instanceof Error) {
    if (Reflect.get(current, 'code') === uniqueViolationCode) {
      return true;
    }

    current = current.cause;
  }

  return false;
}

export async function findIssuedPolicy(
  applicationId: string,
): Promise<PolicyIssuedResponse | undefined> {
  const policy = await findPolicyByApplicationId(applicationId);

  if (!policy) {
    return undefined;
  }

  const applicant = await findPolicyApplicantByApplicationId(applicationId);

  if (!applicant) {
    throw new Error('policy exists without an applicant row');
  }

  const draft = await findPersistedDraft(applicationId);

  return {
    policyNumber: policy.policyNumber,
    premiumAmount: policy.premiumAmount,
    status: policy.status,
    vehicle: draft.vehicle,
    coverage: draft.coverage,
    driversCount: applicant.driversCount,
    familyStatus: familyStatusSchema.parse(applicant.familyStatus),
  };
}

export async function replayOrRethrow(
  error: unknown,
  applicationId: string,
  lookup: (applicationId: string) => Promise<PolicyIssuedResponse | undefined>,
): Promise<Result<PolicyIssuedResponse>> {
  if (!isUniqueViolation(error)) {
    throw error;
  }

  const existing = await lookup(applicationId);

  if (!existing) {
    throw error;
  }

  return { ok: true, data: existing };
}

export class PolicyIssuanceService {
  async issue(
    userId: string,
    payload: IssuePolicyRequest,
  ): Promise<Result<PolicyIssuedResponse>> {
    const application = await findApplicationById(payload.applicationId);

    if (application?.userId !== userId) {
      return applicationNotFound;
    }

    const draft = await findPersistedDraft(payload.applicationId);

    try {
      return await db.transaction(
        async (tx): Promise<Result<PolicyIssuedResponse>> => {
          const applicant = await insertPolicyApplicant(tx, payload);

          const premiumAmount = estimatePremium(
            draft.vehicle,
            draft.coverage,
            new Date().getFullYear(),
            payload.driversCount,
            payload.familyStatus,
          );

          const policy = await insertPolicy(
            tx,
            payload.applicationId,
            premiumAmount,
          );

          await markApplicationPendingReview(tx, payload.applicationId);

          return {
            ok: true,
            data: {
              policyNumber: policy.policyNumber,
              premiumAmount: policy.premiumAmount,
              status: policy.status,
              vehicle: draft.vehicle,
              coverage: draft.coverage,
              driversCount: applicant.driversCount,
              familyStatus: payload.familyStatus,
            },
          };
        },
      );
    } catch (error) {
      return replayOrRethrow(error, payload.applicationId, findIssuedPolicy);
    }
  }
}

export const policyIssuanceService = new PolicyIssuanceService();
