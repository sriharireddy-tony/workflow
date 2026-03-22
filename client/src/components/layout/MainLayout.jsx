import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <Box className="app-shell" sx={{ bgcolor: 'background.default', flex: 1, minHeight: 0 }}>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        <Sidebar />
        <Box
          component="main"
          className="app-main"
          sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
