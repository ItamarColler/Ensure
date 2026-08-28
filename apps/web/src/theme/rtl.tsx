import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import type { SxProps, Theme } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import type { ReactNode } from 'react';
import { prefixer } from 'stylis';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const dialogRadius = 22;

const theme = createTheme({
  direction: 'rtl',
  spacing: 4,
  shape: { borderRadius: 9 },
  typography: {
    fontFamily: ['Heebo', 'system-ui', 'sans-serif'].join(', '),
  },
  palette: {
    primary: { main: '#0B6B4F', dark: '#085440', light: '#E6F2ED' },
    background: { default: '#F6F9F8', paper: '#FFFFFF' },
    divider: '#E0E8E4',
    text: { primary: '#11211C', secondary: '#5D6E68' },
    error: { main: '#B3261E' },
    grey: { 100: '#EEF4F1', 300: '#B6C7C0' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#D9E3DE',
          backgroundImage:
            'radial-gradient(120% 90% at 50% 0%, #E9F0ED 0%, #CBD8D2 100%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { position: 'static', elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E0E8E4',
          borderStartStartRadius: dialogRadius,
          borderStartEndRadius: dialogRadius,
        },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 11 } },
    },
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
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minBlockSize: 44,
          paddingBlock: 4,
          fontWeight: 700,
          textTransform: 'none',
        },
        contained: { minBlockSize: 44 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: 14, fontWeight: 700, marginBlockStart: 4 },
      },
    },
  },
});

export const dialogSurface: SxProps<Theme> = {
  inlineSize: '100%',
  maxInlineSize: 764,
  blockSize: { xs: '100dvh', sm: 'min(780px, calc(100dvh - 64px))' },
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible',
  backgroundColor: 'background.default',
  borderRadius: { xs: 0, sm: `${String(dialogRadius)}px` },
  boxShadow: {
    xs: 'none',
    sm: '0 1px 2px rgba(17,33,28,.07), 0 4px 12px rgba(17,33,28,.07), 0 24px 60px rgba(17,33,28,.20)',
  },
};

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
