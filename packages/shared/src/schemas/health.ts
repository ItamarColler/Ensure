import { z } from 'zod';

export const healthDataSchema = z.object({
  db: z.object({
    healthEvents: z.number().int().nonnegative(),
  }),
  insurerWebhook: z.enum(['ok', 'unreachable']),
  timestamp: z.iso.datetime(),
});

export type HealthData = z.infer<typeof healthDataSchema>;
