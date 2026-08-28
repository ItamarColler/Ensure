import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { useAuthStore, restoreSession } from './auth-store';
import { LogoutButton } from './components/LogoutButton';
import { dialogSurface } from './theme/rtl';
import { WizardStepper } from './WizardStepper';

export function App() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <Box
      sx={{
        minBlockSize: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-center',
        paddingBlock: { xs: 0, sm: 8 },
        paddingInline: { xs: 0, sm: 4 },
      }}
    >
      <Paper elevation={0} sx={dialogSurface}>
        <AppBar>
          <Toolbar
            variant="dense"
            disableGutters
            sx={{
              gap: 2,
              alignItems: 'baseline',
              paddingInline: 3.5,
              paddingBlock: 2.25,
            }}
          >
            <Typography
              variant="subtitle1"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              {t('app.title')}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {t('app.subtitle')}
            </Typography>

            {user && <LogoutButton />}
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: '0 0 auto',
            paddingInline: 2.75,
            paddingBlockStart: 2.25,
          }}
        >
          <WizardStepper />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minBlockSize: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            paddingInline: 2.75,
            paddingBlockStart: 2.25,
            paddingBlockEnd: 3.5,
          }}
        >
          <Stack spacing={2.25} sx={{ inlineSize: '100%', marginBlock: 'auto' }}>
            <Outlet />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
