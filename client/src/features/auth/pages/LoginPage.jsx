import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { login } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants';

const schema = yup.object({
  tenantCode: yup.string().required('Tenant code is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { status, token } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { tenantCode: '', email: '', password: '' } });

  useEffect(() => {
    if (token) {
      const to = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(to, { replace: true });
    }
  }, [token, navigate, location.state]);

  const onSubmit = async (values) => {
    const res = await dispatch(login(values));
    if (login.rejected.match(res)) {
      enqueueSnackbar(res.payload || 'Login failed', { variant: 'error' });
    } else {
      enqueueSnackbar('Welcome back', { variant: 'success' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ p: 4, maxWidth: 420, width: 1, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.04em' }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use your tenant code and account credentials.
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Tenant code"
              {...register('tenantCode')}
              error={Boolean(errors.tenantCode)}
              helperText={errors.tenantCode?.message}
              autoComplete="organization"
            />
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          New organization?{' '}
          <Link to={ROUTES.REGISTER}>Create workspace hello</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
