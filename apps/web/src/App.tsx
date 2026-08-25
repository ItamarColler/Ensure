import { healthDataSchema, type HealthData } from '@ensure/shared';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { NumericInline } from './components/NumericInline';

const samplePlate = '12-345-67';

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

interface StatusRowProps {
  label: string;
  children?: ReactNode;
}

function StatusRow({ label, children }: StatusRowProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography component="span" sx={{ fontWeight: 500 }}>
        {children}
      </Typography>
    </Stack>
  );
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
    <Box sx={{ minBlockSize: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="h1">
            {t('app.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" component="main" sx={{ paddingBlock: 4 }}>
        <Stack spacing={3}>
          <Typography variant="body1" color="text.secondary">
            {t('app.subtitle')}
          </Typography>

          <Paper variant="outlined" sx={{ padding: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                {t('plateSample.heading')}
              </Typography>

              <Typography variant="body1">
                <Trans
                  i18nKey="plateSample.sentence"
                  values={{ plate: samplePlate }}
                  components={{ ltr: <NumericInline /> }}
                />
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t('plateSample.note')}
              </Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ padding: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                {t('systemStatus.label')}
              </Typography>

              <Button
                variant="contained"
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
              </Button>

              {health.status === 'healthy' && (
                <Stack spacing={1} divider={<Divider flexItem />}>
                  <StatusRow label={t('systemStatus.label')}>
                    {t('systemStatus.healthy')}
                  </StatusRow>

                  <StatusRow label={t('systemStatus.healthEvents')}>
                    <NumericInline>{health.data.db.healthEvents}</NumericInline>
                  </StatusRow>

                  <StatusRow label={t('systemStatus.insurerWebhook')}>
                    {t(
                      health.data.insurerWebhook === 'ok'
                        ? 'systemStatus.insurerOk'
                        : 'systemStatus.insurerUnreachable',
                    )}
                  </StatusRow>
                </Stack>
              )}

              {health.status === 'unavailable' && (
                <Alert severity="error">{t('systemStatus.unavailable')}</Alert>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
