import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { useDraftStore } from './store';

export function AppError() {
  const { t } = useTranslation('errors');

  return (
    <Box sx={{ minBlockSize: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" component="main" sx={{ paddingBlock: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h6" component="h1">
            {t('appError.title')}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {t('appError.body')}
          </Typography>

          <Button
            type="button"
            variant="contained"
            fullWidth
            onClick={() => {
              useDraftStore.persist.clearStorage();
              globalThis.location.assign('/vehicle');
            }}
          >
            {t('appError.reset')}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
