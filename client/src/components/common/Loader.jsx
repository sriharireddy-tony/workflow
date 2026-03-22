import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function Loader({ fullPage }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '50vh' : 120,
        width: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
