// src/layouts/full/vertical/sidebar/Profile.tsx
import React, { memo, useCallback } from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import img1 from 'src/assets/images/profile/user-1.jpg';
import { IconPower } from '@tabler/icons-react';
import { AppState } from 'src/store/Store';
import { Link } from 'react-router-dom';
import { clearToken } from '../../../../../store/apps/auth/AuthSlice';

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';

  const handleLogout = useCallback(() => {
    dispatch(clearToken());
  }, [dispatch]);

  if (hideMenu) return null;

  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: 'secondary.light' }}
    >
      <Avatar alt="Mathew" src={img1} />

      <Box>
        <Typography variant="h6">Mathew</Typography>
        <Typography variant="caption">Designer</Typography>
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <Tooltip title="Logout" placement="top">
          <IconButton
            color="primary"
            component={Link}
            to="/auth/login"
            aria-label="logout"
            size="small"
            onClick={handleLogout}
          >
            <IconPower size="20" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export const Profile = memo(ProfileComponent);
