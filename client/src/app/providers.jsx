import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '@/app/store';
import AppThemeProvider from '@/app/AppThemeProvider';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <BrowserRouter>
            <Box sx={{ minHeight: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {children}
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </AppThemeProvider>
    </Provider>
  );
}
