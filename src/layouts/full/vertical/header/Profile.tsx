// src/components/Profile/Profile.tsx

import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { IconMail, IconPower } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { clearToken } from 'src/store/apps/auth/AuthSlice'; // Adjust the import path as necessary

import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import unlimitedImg from 'src/assets/images/backgrounds/unlimited-bg.png';

import * as dropdownData from './data'; // Ensure this path is correct

const ProfileComponent: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(clearToken());
    navigate('/auth/login');
  }, [dispatch, navigate]);

  return (
    <Box>
      <Tooltip title="User Profile" placement="top">
        <IconButton
          size="large"
          aria-label="user profile"
          color="inherit"
          aria-controls="profile-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          sx={{
            ...(anchorEl && {
              color: 'primary.main',
            }),
          }}
        >
          <Avatar
            src={ProfileImg}
            alt="User Profile"
            sx={{
              width: 35,
              height: 35,
            }}
          />
        </IconButton>
      </Tooltip>

      {/* ------------------------------------------- */}
      {/* Profile Dropdown Menu */}
      {/* ------------------------------------------- */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
          },
        }}
      >
        <Typography variant="h5" gutterBottom>
          User Profile
        </Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar src={ProfileImg} alt="User Avatar" sx={{ width: 95, height: 95 }} />
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              Mathew Anderson
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Designer
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              info@modernize.com
            </Typography>
          </Box>
        </Stack>
        <Divider />

        {/* Profile Links
        {dropdownData.profile.map((profileItem) => (
          <Box key={profileItem.title} sx={{ py: 2 }}>
            <Link to={profileItem.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  width="45px"
                  height="45px"
                  bgcolor="primary.light"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={1}
                >
                  <Avatar
                    src={profileItem.icon}
                    alt={profileItem.title}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 0,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="textPrimary"
                    noWrap
                    sx={{
                      width: '240px',
                    }}
                  >
                    {profileItem.title}
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="subtitle2"
                    sx={{
                      width: '240px',
                    }}
                    noWrap
                  >
                    {profileItem.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Link>
          </Box>
        ))} */}

        {/* Upgrade Section */}
  <Box>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleLogout}
            startIcon={<IconPower size={20} />}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default React.memo(ProfileComponent);
