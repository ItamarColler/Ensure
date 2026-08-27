import { Box, CircularProgress } from '@mui/material';

export function RouteFallback() {
  return (
    <Box
      sx={{
        minBlockSize: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
