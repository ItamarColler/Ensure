import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { AuthPanel } from './AuthPanel';
import { useAuthStore } from '../../auth-store';
import { Quote } from '../quote/Quote';

export function Register() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <Stack spacing={4}>
      <Quote />

      {user ? (
        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">
              {t('auth:registeredSuccessTitle')}
            </Typography>

            <Typography variant="body1">
              {t('auth:registeredSuccessBody')}
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <AuthPanel />
      )}
    </Stack>
  );
}
