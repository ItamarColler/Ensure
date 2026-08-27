import { z } from 'zod';

import { applicantDetailsSchema, familyStatusSchema } from './applicant';
import { coverageSelectionSchema } from './coverage';
import { vehicleInfoSchema } from './vehicle';

export const issuePolicyRequestSchema = applicantDetailsSchema.extend({
  applicationId: z.string(),
});

export const policyIssuedResponseSchema = z.object({
  policyNumber: z.string(),
  premiumAmount: z.number(),
  status: z.string(),
  vehicle: vehicleInfoSchema,
  coverage: coverageSelectionSchema,
  driversCount: z.number().int(),
  familyStatus: familyStatusSchema,
});

export type IssuePolicyRequest = z.infer<typeof issuePolicyRequestSchema>;

export type PolicyIssuedResponse = z.infer<typeof policyIssuedResponseSchema>;
