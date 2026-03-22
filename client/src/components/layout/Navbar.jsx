import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import LockIcon from '@mui/icons-material/Lock';
import { toggleSidebar } from '@/features/ui/uiSlice';
import { logout } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants';
import PreferencesDialog from './PreferencesDialog';
import ProfileDialog from './ProfileDialog';
import ChangePasswordDialog from './ChangePasswordDialog';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const tenant = useSelector((s) => s.auth.tenant);
  const [anchor, setAnchor] = useState(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const initials =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
    setAnchor(null);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(14px)',
          background:
            (t) =>
              t.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(17, 28, 47, 0.96) 0%, rgba(13, 22, 41, 0.92) 100%)'
                : 'linear-gradient(180deg, #eef3fb 0%, #e4ebf6 100%)',
          boxShadow: (t) =>
            t.palette.mode === 'dark' ? 'none' : 'inset 0 -1px 0 rgba(148, 163, 184, 0.2)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" onClick={() => dispatch(toggleSidebar())} color="inherit">
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              FlowBoard
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={[tenant?.name, tenant?.code].filter(Boolean).join(' — ')}
            >
              {[tenant?.name, tenant?.code].filter((x) => x && String(x).trim()).join(' · ') || 'Workspace'}
            </Typography>
          </Box>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>{initials}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography fontWeight={700}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Typography variant="caption" display="block" color="primary.main" fontWeight={600}>
            {user?.role?.replace('_', ' ')}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setProfileOpen(true);
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPrefsOpen(true);
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <TuneIcon fontSize="small" />
          </ListItemIcon>
          Preferences
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPasswordOpen(true);
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          Change password
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <PreferencesDialog open={prefsOpen} onClose={() => setPrefsOpen(false)} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
