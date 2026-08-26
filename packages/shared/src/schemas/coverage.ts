import { z } from 'zod';

export const coverageTierSchema = z.enum([
  'compulsory',
  'thirdParty',
  'comprehensive',
]);

export const addOnSchema = z.enum(['towing', 'glass', 'replacementCar']);

export type CoverageTier = z.infer<typeof coverageTierSchema>;

export type AddOn = z.infer<typeof addOnSchema>;

export const tierAddOnMap: Record<CoverageTier, readonly AddOn[]> = {
  compulsory: ['towing'],
  thirdParty: ['towing'],
  comprehensive: ['towing', 'glass', 'replacementCar'],
};

export const coverageSelectionSchema = z
  .object({ tier: coverageTierSchema, addOns: z.array(addOnSchema) })
  .refine(
    (value) =>
      value.addOns.every((addOn) => tierAddOnMap[value.tier].includes(addOn)),
    { message: 'ADD_ON_INVALID_FOR_TIER', path: ['addOns'] },
  );

export type CoverageSelection = z.infer<typeof coverageSelectionSchema>;
