import type { VehicleLookupRequest } from '@ensure/shared';
import type { Request, Response } from 'express';

import { sendResult } from '../http/send-result';
import type { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  readonly lookup = async (req: Request, res: Response): Promise<void> => {
    const { plate } = req.body as VehicleLookupRequest;

    const result = await this.vehicleService.lookup(plate);

    sendResult(res, result);
  };

  constructor(private readonly vehicleService: VehicleService) {}
}
