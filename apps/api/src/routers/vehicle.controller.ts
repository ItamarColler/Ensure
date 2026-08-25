import type { VehicleLookupRequest } from '@ensure/shared';
import { vehicleLookupRequestSchema } from '@ensure/shared';
import type { Request, Response } from 'express';
import { Router } from 'express';

import { sendResult } from '../http/send-result';
import { validateBody } from '../middleware/validate-body';
import type { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  private lookup = async (req: Request, res: Response): Promise<void> => {
    const { plate } = req.body as VehicleLookupRequest;

    const result = await this.vehicleService.lookup(plate);

    sendResult(res, result);
  };

  readonly router = Router();

  constructor(private readonly vehicleService: VehicleService) {
    this.router.post(
      '/lookup',
      validateBody(vehicleLookupRequestSchema),
      this.lookup,
    );
  }
}
