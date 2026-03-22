import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { updateStoredUser } from '@/features/auth/authSlice';
import { patchMyProfile } from '@/services/accountApi';

const schema = yup.object({
  firstName: yup.string().trim().min(1).max(80).required(),
  lastName: yup.string().trim().min(1).max(80).required(),
  email: yup.string().email().required(),
});

export default function ProfileDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((s) => s.auth.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
      });
    }
  }, [open, user, reset]);

  const onSave = async (values) => {
    try {
      const updated = await patchMyProfile(values);
      dispatch(
        updateStoredUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          id: updated._id || updated.id,
        })
      );
      enqueueSnackbar('Profile updated', { variant: 'success' });
      onClose();
    } catch (e) {
      enqueueSnackbar(e.message || 'Could not update profile', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSave)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit profile</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Changes apply to your account in this workspace. If you change email, use the new address next time you
              sign in (tenant code stays the same).
            </Typography>
            <TextField
              label="First name"
              fullWidth
              {...register('firstName')}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last name"
              fullWidth
              {...register('lastName')}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              autoComplete="email"
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
