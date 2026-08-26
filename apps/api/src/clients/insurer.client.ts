import type { HealthData, Result, VehicleInfo } from '@ensure/shared';
import { vehicleInfoSchema } from '@ensure/shared';

import { config } from '../config';

type FetchOutcome =
  | { status: 'responded'; response: Response }
  | { status: 'timedOut' }
  | { status: 'unreachable' };

const upstreamErrorResult: Result<never> = {
  ok: false,
  error: {
    code: 'UPSTREAM_ERROR',
    message: 'insurer webhook returned an unusable response',
  },
};

const unreachableResult: Result<never> = {
  ok: false,
  error: { code: 'UPSTREAM_ERROR', message: 'insurer webhook unreachable' },
};

const timeoutResult: Result<never> = {
  ok: false,
  error: { code: 'UPSTREAM_TIMEOUT', message: 'insurer webhook timed out' },
};

function isTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

export class InsurerClient {
  private async postVehicleInfo(plate: string): Promise<FetchOutcome> {
    try {
      const response = await fetch(`${config.insurerWebhookUrl}/vehicle-info`, {
        method: 'POST',
        signal: AbortSignal.timeout(config.insurerLookupTimeoutMs),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ license_plate: plate }),
      });

      return { status: 'responded', response };
    } catch (error) {
      return isTimeout(error)
        ? { status: 'timedOut' }
        : { status: 'unreachable' };
    }
  }

  private async mapResponse(response: Response): Promise<Result<VehicleInfo>> {
    if (response.status === 404) {
      return {
        ok: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'vehicle not found' },
      };
    }

    if (response.status === 400 || response.status === 422) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'insurer webhook rejected the plate',
        },
      };
    }

    if (!response.ok) {
      return upstreamErrorResult;
    }

    const vehicle = await readVehicleInfo(response);

    if (!vehicle) {
      return upstreamErrorResult;
    }

    return { ok: true, data: vehicle };
  }

  async lookupVehicle(plate: string): Promise<Result<VehicleInfo>> {
    const first = await this.postVehicleInfo(plate);

    if (first.status === 'responded') {
      return this.mapResponse(first.response);
    }

    if (first.status === 'unreachable') {
      return unreachableResult;
    }

    const second = await this.postVehicleInfo(plate);

    if (second.status === 'responded') {
      return this.mapResponse(second.response);
    }

    if (second.status === 'unreachable') {
      return unreachableResult;
    }

    return timeoutResult;
  }

  async probe(): Promise<HealthData['insurerWebhook']> {
    try {
      const response = await fetch(`${config.insurerWebhookUrl}/health`, {
        signal: AbortSignal.timeout(config.insurerProbeTimeoutMs),
      });

      return response.ok ? 'ok' : 'unreachable';
    } catch {
      return 'unreachable';
    }
  }
}

async function readVehicleInfo(
  response: Response,
): Promise<VehicleInfo | undefined> {
  try {
    const payload: unknown = await response.json();
    const data: unknown =
      payload instanceof Object ? Reflect.get(payload, 'data') : undefined;
    const parsed = vehicleInfoSchema.safeParse(data);

    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
