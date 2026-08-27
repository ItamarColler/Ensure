import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';

import { ApiErrorException } from './api-client';
import { apiErrorMessageKeys } from './components/ApiErrorAlert';
import { ErrorSurface } from './components/ErrorSurface';
import { useDraftStore } from './store';
import { wizardResetPath } from './wizard';

export function AppError() {
  const { t } = useTranslation('errors');
  const routeError: unknown = useRouteError();

  const descriptionKeys =
    routeError instanceof ApiErrorException
      ? apiErrorMessageKeys(routeError.apiError.code)
      : ['appError.body'];

  return (
    <Box sx={{ minBlockSize: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ paddingBlock: 4 }}>
        <ErrorSurface
          component="main"
          title={t('appError.title')}
          description={t(descriptionKeys)}
          action={
            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={() => {
                useDraftStore.persist.clearStorage();
                globalThis.location.assign(wizardResetPath);
              }}
            >
              {t('appError.reset')}
            </Button>
          }
        />
      </Container>
    </Box>
  );
}
