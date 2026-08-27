import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { useAuthStore, restoreSession } from './auth-store';
import { LogoutButton } from './components/LogoutButton';
import { WizardStepper } from './WizardStepper';

export function App() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <Box sx={{ minBlockSize: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="h1">
            {t('app.title')}
          </Typography>

          {user && <LogoutButton />}
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" component="main" sx={{ paddingBlock: 4 }}>
        <Stack spacing={4}>
          <Typography variant="body1" color="text.secondary">
            {t('app.subtitle')}
          </Typography>

          <WizardStepper />

          <Outlet />
        </Stack>
      </Container>
    </Box>
  );
}
