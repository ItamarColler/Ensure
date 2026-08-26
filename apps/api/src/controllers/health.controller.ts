import type { HealthData, Result } from '@ensure/shared';
import type { Request, Response } from 'express';

import type { InsurerClient } from '../clients/insurer.client';
import { sendResult } from '../http/send-result';
import { recordHealthCheck } from '../repositories/health.repo';

export class HealthController {
  readonly check = async (_req: Request, res: Response): Promise<void> => {
    const [healthCheck, insurerWebhook] = await Promise.all([
      recordHealthCheck(),
      this.insurerClient.probe(),
    ]);

    const result: Result<HealthData> = {
      ok: true,
      data: {
        db: { healthEvents: healthCheck.healthEvents },
        insurerWebhook,
        timestamp: new Date().toISOString(),
      },
    };

    sendResult(res, result);
  };

  constructor(private readonly insurerClient: InsurerClient) {}
}
