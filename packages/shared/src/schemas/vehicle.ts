import { z } from 'zod';

export const plateSchema = z
  .string()
  .transform((value) => value.replaceAll(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\d{7,8}$/, 'PLATE_FORMAT_INVALID'));

export const vehicleLookupRequestSchema = z.object({
  plate: plateSchema,
});

export const vehicleInfoSchema = z.object({
  license_plate: z.string(),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().positive(),
  color: z.string().min(1),
});

export type VehicleLookupRequest = z.infer<typeof vehicleLookupRequestSchema>;

export type VehicleInfo = z.infer<typeof vehicleInfoSchema>;
