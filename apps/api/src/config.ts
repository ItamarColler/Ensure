function requiredString(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
}

export const config = {
  get insurerWebhookUrl(): string {
    return requiredString('INSURER_WEBHOOK_URL');
  },
  get insurerLookupTimeoutMs(): number {
    return optionalNumber('INSURER_LOOKUP_TIMEOUT_MS', 10_000);
  },
  get insurerProbeTimeoutMs(): number {
    return optionalNumber('INSURER_PROBE_TIMEOUT_MS', 3000);
  },
  get databaseUrl(): string {
    return requiredString('DATABASE_URL');
  },
};

export function validateConfig(): void {
  void config.insurerWebhookUrl;
  void config.databaseUrl;
}
