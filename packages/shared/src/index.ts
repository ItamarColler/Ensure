export type { ApiError, ApiErrorCode, Result } from './result';
export {
  addOnSchema,
  coverageSelectionSchema,
  coverageTierSchema,
  tierAddOnMap,
} from './schemas/coverage';
export type {
  AddOn,
  CoverageSelection,
  CoverageTier,
} from './schemas/coverage';
export { healthDataSchema } from './schemas/health';
export type { HealthData } from './schemas/health';
export {
  plateSchema,
  vehicleInfoSchema,
  vehicleLookupRequestSchema,
} from './schemas/vehicle';
export type { VehicleInfo, VehicleLookupRequest } from './schemas/vehicle';
