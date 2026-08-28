import Box from '@mui/material/Box';

import { AuthPanel } from './AuthPanel';

export function Register() {
  return (
    <Box sx={{ paddingInline: { xs: 0, sm: '5%' } }}>
      <AuthPanel />
    </Box>
  );
}
