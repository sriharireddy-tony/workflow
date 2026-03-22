import Box from '@mui/material/Box';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
      <AppRoutes />
    </Box>
  );
}
