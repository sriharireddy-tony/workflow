import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { postChangePassword } from '@/services/accountApi';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'At least 8 characters').max(128).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

export default function ChangePasswordDialog({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleClose = () => {
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  const onSave = async ({ currentPassword, newPassword }) => {
    try {
      await postChangePassword({ currentPassword, newPassword });
      enqueueSnackbar('Password updated successfully', { variant: 'success' });
      handleClose();
    } catch (e) {
      enqueueSnackbar(e.message || 'Could not change password', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSave)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Change password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Your session stays active. Use the new password the next time you sign in.
            </Typography>
            <TextField
              label="Current password"
              type="password"
              fullWidth
              autoComplete="current-password"
              {...register('currentPassword')}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              autoComplete="new-password"
              {...register('newPassword')}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
            />
            <TextField
              label="Confirm new password"
              type="password"
              fullWidth
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Update password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
