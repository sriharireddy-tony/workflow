import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import { THEME_COLORS } from '@/constants';

export default function AppThemeProvider({ children }) {
  const { primaryColorId, mode } = useSelector((s) => s.ui);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode;
  const primary = THEME_COLORS.find((c) => c.id === primaryColorId)?.main || THEME_COLORS[0].main;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
          primary: { main: primary },
          background:
            resolvedMode === 'dark'
              ? { default: '#0b1220', paper: '#111827' }
              : { default: '#f4f6fb', paper: '#ffffff' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"DM Sans", system-ui, sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
        },
      }),
    [resolvedMode, primary]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
