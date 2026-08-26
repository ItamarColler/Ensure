import { vehicleLookupRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import type { VehicleController } from '../controllers/vehicle.controller';
import { rateLimit } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate-body';

const lookupRateLimit = { limit: 20, windowMs: 60_000 };

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();

  router.post(
    '/lookup',
    rateLimit(lookupRateLimit),
    validateBody(vehicleLookupRequestSchema),
    controller.lookup,
  );

  return router;
}
