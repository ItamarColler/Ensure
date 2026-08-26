import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { WizardStepper } from './WizardStepper';

export function App() {
  const { t } = useTranslation();

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
