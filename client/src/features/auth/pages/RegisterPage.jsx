import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { register as registerUser } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants';

const schema = yup.object({
  tenantName: yup.string().min(2).required('Organization name is required'),
  tenantCode: yup.string().min(2).required('Tenant code is required'),
  email: yup.string().email().required(),
  password: yup.string().min(8).required('Min 8 characters'),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
});

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { status, token } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tenantName: '',
      tenantCode: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  useEffect(() => {
    if (token) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [token, navigate]);

  const onSubmit = async (values) => {
    const payload = { ...values, tenantCode: values.tenantCode.toUpperCase() };
    const res = await dispatch(registerUser(payload));
    if (registerUser.rejected.match(res)) {
      enqueueSnackbar(res.payload || 'Registration failed', { variant: 'error' });
    } else {
      enqueueSnackbar('Workspace created — you are signed in', { variant: 'success' });
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
      <Paper elevation={0} sx={{ p: 4, maxWidth: 480, width: 1, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.04em' }}>
          Create workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Registers a new tenant and your SUPER_ADMIN account.
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Organization name" {...register('tenantName')} error={Boolean(errors.tenantName)} helperText={errors.tenantName?.message} />
            <TextField
              label="Tenant code (unique)"
              {...register('tenantCode')}
              error={Boolean(errors.tenantCode)}
              helperText={errors.tenantCode?.message}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="First name" {...register('firstName')} error={Boolean(errors.firstName)} helperText={errors.firstName?.message} />
              <TextField fullWidth label="Last name" {...register('lastName')} error={Boolean(errors.lastName)} helperText={errors.lastName?.message} />
            </Stack>
            <TextField label="Email" type="email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
            <TextField
              label="Password"
              type="password"
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating…' : 'Create workspace'}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
