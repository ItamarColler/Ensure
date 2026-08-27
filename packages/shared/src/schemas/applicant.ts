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

export const applicantDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'firstNameRequired'),
  lastName: z.string().trim().min(1, 'lastNameRequired'),
  address: z.string().trim().min(1, 'addressRequired'),
  nationalId: nationalIdSchema,
  phone: israeliMobileSchema,
  driversCount: z
    .number({ error: 'driversCountRequired' })
    .int()
    .min(1, 'driversCountRequired')
    .max(20, 'driversCountRequired'),
  familyStatus: familyStatusSchema,
});

export type FamilyStatus = z.infer<typeof familyStatusSchema>;

export type ApplicantDetails = z.infer<typeof applicantDetailsSchema>;
