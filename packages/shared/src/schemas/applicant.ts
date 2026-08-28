import { z } from 'zod';

export const nationalIdSchema = z
  .string()
  .transform((value) => value.replaceAll(/\D/g, ''))
  .pipe(z.string().regex(/^\d{9}$/, 'nationalIdLength'));

export const israeliMobileSchema = z
  .string()
  .transform((value) => value.replaceAll(/\D/g, ''))
  .pipe(z.string().regex(/^\d{9,10}$/, 'phoneInvalid'));

export const familyStatusSchema = z.enum(
  ['single', 'married', 'divorced', 'widowed'],
  { error: 'familyStatusRequired' },
);

export const applicantIdentitySchema = z.object({
  firstName: z.string().trim().min(1, 'firstNameRequired'),
  lastName: z.string().trim().min(1, 'lastNameRequired'),
  nationalId: nationalIdSchema,
});

export const applicantContactSchema = z.object({
  phone: israeliMobileSchema,
  address: z.string().trim().min(1, 'addressRequired'),
});

export const applicantRiskSchema = z.object({
  driversCount: z
    .number({ error: 'driversCountRequired' })
    .int()
    .min(1, 'driversCountRequired')
    .max(20, 'driversCountRequired'),
  familyStatus: familyStatusSchema,
});

export const applicantDetailsSchema = applicantIdentitySchema
  .extend(applicantContactSchema.shape)
  .extend(applicantRiskSchema.shape);

export const applicantStepAcceptedSchema = z.object({
  valid: z.literal(true),
});

export type FamilyStatus = z.infer<typeof familyStatusSchema>;

export type ApplicantIdentity = z.infer<typeof applicantIdentitySchema>;

export type ApplicantContact = z.infer<typeof applicantContactSchema>;

export type ApplicantRisk = z.infer<typeof applicantRiskSchema>;

export type ApplicantDetails = z.infer<typeof applicantDetailsSchema>;

export type ApplicantStepAccepted = z.infer<typeof applicantStepAcceptedSchema>;
