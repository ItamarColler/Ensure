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
  palette: {
    grey: { 100: '#EEF4F1' },
  },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minBlockSize: 40,
          boxSizing: 'border-box',
          '&:has(.MuiSelect-select)': { minBlockSize: 44 },
        },
        input: { fontSize: 16, lineHeight: 1.4 },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { minBlockSize: 44, fontSize: 16 } },
    },
    MuiButton: {
      styleOverrides: {
        root: { minBlockSize: 44 },
        contained: { minBlockSize: 48 },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 16 } },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: 14, fontWeight: 700, marginBlockStart: 4 },
      },
    },
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
