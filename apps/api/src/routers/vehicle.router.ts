import { vehicleLookupRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import type { VehicleController } from '../controllers/vehicle.controller';
import { validateBody } from '../middleware/validate-body';

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();

  router.post(
    '/lookup',
    validateBody(vehicleLookupRequestSchema),
    controller.lookup,
  );

  return router;
}
