import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { ROUTES, ROLES } from '@/constants';
import { hydrateAuth, fetchSession } from '@/features/auth/authSlice';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import MainLayout from '@/components/layout/MainLayout';
import Loader from '@/components/common/Loader';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage'));
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage'));
const FeaturesPage = lazy(() => import('@/features/features/pages/FeaturesPage'));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage'));

function SuspenseWrap({ children }) {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {children}
      </Box>
    </Suspense>
  );
}

export default function AppRoutes() {
  const dispatch = useDispatch();
  const hydrated = useSelector((s) => s.auth.hydrated);
  const token = useSelector((s) => s.auth.token);
  const tenant = useSelector((s) => s.auth.tenant);
  const sessionHydrateAttempted = useRef(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!token) sessionHydrateAttempted.current = false;
  }, [token]);

  useEffect(() => {
    if (!hydrated || !token || sessionHydrateAttempted.current) return;
    const hasTenantLabel = Boolean(tenant?.name?.trim?.() || tenant?.code?.trim?.());
    if (hasTenantLabel) return;
    sessionHydrateAttempted.current = true;
    dispatch(fetchSession());
  }, [dispatch, hydrated, token, tenant]);

  return (
    <SuspenseWrap>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="users"
            element={
              <RoleRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="clients"
            element={
              <RoleRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                <ClientsPage />
              </RoleRoute>
            }
          />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="my-projects" element={<ProjectsPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route
            path="tasks"
            element={
              <RoleRoute roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                <TasksPage />
              </RoleRoute>
            }
          />
          <Route path="my-tasks" element={<TasksPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </SuspenseWrap>
  );
}
