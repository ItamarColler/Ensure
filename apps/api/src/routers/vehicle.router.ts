import { vehicleLookupRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import { vehicleController } from '../controllers/vehicle.controller';
import { rateLimit } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate-body';

const lookupRateLimit = { limit: 20, windowMs: 60_000 };

const vehicleRouter = Router();

vehicleRouter.post(
  '/lookup',
  rateLimit(lookupRateLimit),
  validateBody(vehicleLookupRequestSchema),
  vehicleController.lookup,
);

export default vehicleRouter;
