import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import type { ReactNode } from 'react';
import { prefixer } from 'stylis';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: ['Heebo', 'system-ui', 'sans-serif'].join(', '),
  },
});

interface RtlRootProps {
  children?: ReactNode;
}

export function RtlRoot({ children }: RtlRootProps) {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div dir="rtl">{children}</div>
      </ThemeProvider>
    </CacheProvider>
  );
}
