import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '@/constants';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function RoleRoute({ roles, children }) {
  const role = useSelector((s) => s.auth.user?.role);
  if (!roles.includes(role)) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Access denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don&apos;t have permission to view this page.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <a href={ROUTES.DASHBOARD}>Back to dashboard</a>
        </Typography>
      </Box>
    );
  }
  return children;
}
