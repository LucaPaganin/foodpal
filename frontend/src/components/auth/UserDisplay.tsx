import React, { useState, MouseEvent } from 'react';
import { useAppSelector } from '../../store';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import oidcAuthService from '../../services/oidcAuthService';
import { useTranslation } from 'react-i18next';

const UserDisplay = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleCloseMenu();
    await oidcAuthService.logout();
    navigate('/login');
  };
  
  const handleProfile = () => {
    handleCloseMenu();
    navigate('/profile');
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Get the first letter of the name for the avatar
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };
  
  const displayName = user.fullName || user.username;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Typography variant="body1" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
        {displayName}
      </Typography>
      <Tooltip title="Account settings">
        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 35, height: 35 }}>
            {getInitials()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleProfile}>
          <Typography textAlign="center">{t('Profile')}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Typography textAlign="center">{t('Logout')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserDisplay;
