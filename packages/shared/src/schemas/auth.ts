import { z } from 'zod';

import { coverageSelectionSchema } from './coverage';
import { policyIssuedResponseSchema } from './policy';
import { vehicleInfoSchema } from './vehicle';

export const authCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8),
});

export const registerFormSchema = authCredentialsSchema.extend({
  termsAccepted: z.boolean().refine((value) => value),
  marketingOptIn: z.boolean(),
});

export const loginFormSchema = authCredentialsSchema;

export const registerRequestSchema = authCredentialsSchema.extend({
  termsAccepted: z.literal(true),
  marketingOptIn: z.boolean().optional(),
  vehicle: vehicleInfoSchema,
  coverage: coverageSelectionSchema,
});

export const loginRequestSchema = authCredentialsSchema.extend({
  vehicle: vehicleInfoSchema,
  coverage: coverageSelectionSchema,
});

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.email(),
});

export const authResponseSchema = z.object({
  user: sessionUserSchema,
  applicationId: z.string(),
  vehicle: vehicleInfoSchema,
  coverage: coverageSelectionSchema,
});

export const sessionApplicationSchema = z.object({
  id: z.string(),
  stage: z.number().int(),
});

export const sessionResponseSchema = z.object({
  user: sessionUserSchema,
  application: sessionApplicationSchema,
  policy: policyIssuedResponseSchema.optional(),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export type SessionUser = z.infer<typeof sessionUserSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;

export type SessionApplication = z.infer<typeof sessionApplicationSchema>;

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
