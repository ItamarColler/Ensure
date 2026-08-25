import { healthDataSchema, type HealthData } from '@ensure/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type HealthState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'healthy'; data: HealthData }
  | { status: 'unavailable' };

function readEnvelopeData(payload: unknown): unknown {
  if (payload instanceof Object) {
    const data: unknown = Reflect.get(payload, 'data');
    return data;
  }

  return undefined;
}

export function App() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<HealthState>({ status: 'idle' });

  const checkHealth = async (): Promise<void> => {
    setHealth({ status: 'checking' });

    try {
      const response = await fetch('/api/health');
      const payload: unknown = await response.json();
      const parsed = healthDataSchema.safeParse(readEnvelopeData(payload));

      setHealth(
        parsed.success
          ? { status: 'healthy', data: parsed.data }
          : { status: 'unavailable' },
      );
    } catch {
      setHealth({ status: 'unavailable' });
    }
  };

  return (
    <main>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>

      <section>
        <h2>{t('systemStatus.label')}</h2>

        <button
          type="button"
          disabled={health.status === 'checking'}
          onClick={() => {
            void checkHealth();
          }}
        >
          {t(
            health.status === 'checking'
              ? 'systemStatus.checking'
              : 'systemStatus.checkButton',
          )}
        </button>

        {health.status === 'healthy' && (
          <dl>
            <dt>{t('systemStatus.label')}</dt>
            <dd>{t('systemStatus.healthy')}</dd>

            <dt>{t('systemStatus.healthEvents')}</dt>
            <dd>
              <bdi dir="ltr">{health.data.db.healthEvents}</bdi>
            </dd>

            <dt>{t('systemStatus.insurerWebhook')}</dt>
            <dd>
              {t(
                health.data.insurerWebhook === 'ok'
                  ? 'systemStatus.insurerOk'
                  : 'systemStatus.insurerUnreachable',
              )}
            </dd>
          </dl>
        )}

        {health.status === 'unavailable' && (
          <p>{t('systemStatus.unavailable')}</p>
        )}
      </section>
    </main>
  );
}
