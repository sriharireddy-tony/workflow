import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { loadDashboardStats } from '@/features/dashboard/dashboardSlice';
import Loader from '@/components/common/Loader';
import ClientProjectEmployeeTree from '@/features/dashboard/components/ClientProjectEmployeeTree';

export default function DashboardPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    clientsTotal,
    projectsTotal,
    usersTotal,
    tasksByStatus,
    loading,
    error,
    hierarchyTree,
  } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(loadDashboardStats());
  }, [dispatch]);

  const chartData = Object.entries(tasksByStatus).map(([name, count]) => ({ name, count }));

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" className="page-title" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {clientsTotal} clients
          </Box>
          {' · '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {projectsTotal} projects
          </Box>
          {' · '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {usersTotal} people
          </Box>
          <span> — hierarchy below lists names; chart uses up to 500 tasks.</span>
        </Typography>
      </Box>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} letterSpacing={1.5} gutterBottom>
          CLIENT → PROJECT → TEAM
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Each client links down to its projects; each project links down to people on the team.
        </Typography>
        <ClientProjectEmployeeTree tree={hierarchyTree} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Tasks by status
        </Typography>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No tasks yet.
          </Typography>
        ) : (
          <Box sx={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
