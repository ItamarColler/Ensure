import type { HealthData, Result } from '@ensure/shared';
import express from 'express';

import { api } from './api';
import { sendResult } from './http/send-result';
import { recordHealthCheck } from './repositories/health.repo';

const port = 4000;
const insurerWebhookUrl = process.env['INSURER_WEBHOOK_URL'];
const insurerProbeTimeoutMs = 3000;

async function probeInsurerWebhook(): Promise<HealthData['insurerWebhook']> {
  if (!insurerWebhookUrl) {
    return 'unreachable';
  }

  try {
    const response = await fetch(`${insurerWebhookUrl}/health`, {
      signal: AbortSignal.timeout(insurerProbeTimeoutMs),
    });

    return response.ok ? 'ok' : 'unreachable';
  } catch {
    return 'unreachable';
  }
}

const app = express();

app.use(express.json());
app.use('/api', api);

app.get('/api/health', async (_req, res) => {
  const [healthCheck, insurerWebhook] = await Promise.all([
    recordHealthCheck(),
    probeInsurerWebhook(),
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
});

app.listen(port, () => {
  console.log('api listening on port', port);
});
