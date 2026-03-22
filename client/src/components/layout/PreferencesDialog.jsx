import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import { THEME_COLORS } from '@/constants';
import { setMode, setPrimaryColorId } from '@/features/ui/uiSlice';

export default function PreferencesDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { primaryColorId, mode } = useSelector((s) => s.ui);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Preferences</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Accent color
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
          {THEME_COLORS.map((c) => (
            <Box
              key={c.id}
              onClick={() => dispatch(setPrimaryColorId(c.id))}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: c.main,
                cursor: 'pointer',
                outline: primaryColorId === c.id ? '3px solid' : 'none',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              }}
              title={c.label}
            />
          ))}
        </Stack>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Display mode
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={mode ?? 'light'}
          onChange={(_, v) => v && dispatch(setMode(v))}
          fullWidth
          size="small"
        >
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
          <ToggleButton value="auto">Auto</ToggleButton>
        </ToggleButtonGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
