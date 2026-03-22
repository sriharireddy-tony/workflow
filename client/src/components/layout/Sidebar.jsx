import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getNavItems } from '@/utils/menu';
import { setSidebarOpen } from '@/features/ui/uiSlice';

const drawerWidth = 260;

export default function Sidebar() {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth.user?.role);
  const open = useSelector((s) => s.ui.sidebarOpen);
  const items = getNavItems(role);

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'transparent' : 'rgba(248, 250, 252, 0.65)'),
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(241, 245, 249, 0.95)',
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1}>
          MENU
        </Typography>
        <IconButton size="small" onClick={() => dispatch(setSidebarOpen(false))}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
      <List sx={{ px: 1, flex: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)',
                },
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? drawerWidth : 0 },
        flexShrink: 0,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
      }}
    >
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => dispatch(setSidebarOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background:
              (t) =>
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #121c30 0%, #0d1628 100%)'
                  : 'linear-gradient(180deg, #f8f9fb 0%, #eceef2 100%)',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          flex: '1 1 auto',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            maxHeight: 'none',
            borderRight: 1,
            borderColor: 'divider',
            background:
              (t) =>
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #121c30 0%, #0d1628 100%)'
                  : 'linear-gradient(180deg, #f8f9fb 0%, #eceef2 100%)',
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? 'none' : '2px 0 12px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
