import { Router } from 'express';

import { InsurerClient } from './clients/insurer.client';
import { HealthController } from './routers/health.controller';
import { VehicleController } from './routers/vehicle.controller';
import { VehicleService } from './services/vehicle.service';

const insurerWebhookUrl = process.env['INSURER_WEBHOOK_URL'];

if (!insurerWebhookUrl) {
  throw new Error('INSURER_WEBHOOK_URL is not set');
}

const insurerClient = new InsurerClient(insurerWebhookUrl);
const vehicleService = new VehicleService(insurerClient);
const vehicleController = new VehicleController(vehicleService);
const healthController = new HealthController(insurerClient);

function createApi(): Router {
  const router = Router();

  router.use('/vehicle', vehicleController.router);
  router.use('/health', healthController.router);

  return router;
}

export const api = createApi();
